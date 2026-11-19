import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AgentTask } from '../entities/agent-task.entity.js';
import { CreditsService } from '../../credits/credits.service.js';

export type AgentRateLimitCode =
  | 'USER_BURST_RATE_LIMIT'
  | 'CONVERSATION_BURST_RATE_LIMIT'
  | 'ATTACHMENT_BURST_RATE_LIMIT'
  | 'CONCURRENT_TASK_LIMIT'
  | 'DAILY_TOKEN_CAP_EXCEEDED'
  | 'DAILY_COST_CAP_EXCEEDED';

export interface AgentTierLimits {
  tier: 'free' | 'pro';
  userBurstPerMin: number;
  conversationBurstPerMin: number;
  attachmentBurstPerMin: number;
  maxConcurrentActiveTasks: number;
  dailyTokenCap: number;
  dailyCostCapUsd: number;
}

export interface AgentUsageSnapshot {
  tier: 'free' | 'pro';
  utcDate: string;
  limits: AgentTierLimits;
  burst: {
    userMessagesLastMin: number;
    userAttachmentsLastMin: number;
    conversationMessagesLastMin?: number;
  };
  daily: {
    tokensUsed: number;
    tokensRemaining: number;
    costUsdUsed: number;
    costUsdRemaining: number;
    callsCount: number;
  };
}

interface DailySpendBucket {
  utcDate: string;
  tokensUsed: number;
  costUsdUsed: number;
  callsCount: number;
  hydratedFromDb: boolean;
}

const WINDOW_MS = 60_000;
const MAX_TRACKED_KEYS = 20_000;

/**
 * Per-User & Per-Conversation Burst Rate Limiter + Daily AI Token/Cost Spend Cap.
 * Protects HyperResume's AI API budget against compromised accounts, automation loops,
 * and abuse — INCLUDING Pro / Unlimited users who bypass per-action credit deductions.
 */
@Injectable()
export class AgentUsageGuardService {
  private readonly logger = new Logger(AgentUsageGuardService.name);

  private readonly userMessageHits = new Map<string, number[]>();
  private readonly conversationMessageHits = new Map<string, number[]>();
  private readonly userAttachmentHits = new Map<string, number[]>();
  private readonly dailySpendByUser = new Map<string, DailySpendBucket>();
  /** Synchronous in-flight submit counter closing TOCTOU races on concurrent Promise.all bursts */
  private readonly inFlightSubmitsByUser = new Map<string, number>();

  public releaseInFlightSubmit(userId: string): void {
    const current = this.inFlightSubmitsByUser.get(userId) || 0;
    if (current <= 1) {
      this.inFlightSubmitsByUser.delete(userId);
    } else {
      this.inFlightSubmitsByUser.set(userId, current - 1);
    }
  }

  constructor(
    @Optional()
    private readonly configService?: ConfigService,
    @Optional()
    private readonly creditsService?: CreditsService,
    @Optional()
    @InjectRepository(AgentTask)
    private readonly taskRepo?: Repository<AgentTask>,
  ) {}

  private readNumberEnv(key: string, fallback: number): number {
    const raw =
      this.configService?.get<string | number>(key) ??
      process.env[key];
    if (raw === undefined || raw === null || raw === '') return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private getCurrentUtcDate(nowMs: number = Date.now()): string {
    return new Date(nowMs).toISOString().slice(0, 10);
  }

  private getSecondsUntilUtcMidnight(nowMs: number = Date.now()): number {
    const now = new Date(nowMs);
    const nextMidnight = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
      0,
    );
    return Math.max(60, Math.ceil((nextMidnight - nowMs) / 1000));
  }

  public async resolveTierLimits(userId: string): Promise<AgentTierLimits> {
    let isPro = false;
    if (this.creditsService && typeof this.creditsService.hasActivePro === 'function') {
      try {
        isPro = await this.creditsService.hasActivePro(userId);
      } catch {
        isPro = false;
      }
    }

    const tier: 'free' | 'pro' = isPro ? 'pro' : 'free';
    return {
      tier,
      userBurstPerMin: isPro
        ? this.readNumberEnv('AGENT_RATE_LIMIT_USER_PER_MIN_PRO', 25)
        : this.readNumberEnv('AGENT_RATE_LIMIT_USER_PER_MIN_FREE', 12),
      conversationBurstPerMin: this.readNumberEnv('AGENT_RATE_LIMIT_CONV_PER_MIN', 10),
      attachmentBurstPerMin: this.readNumberEnv('AGENT_RATE_LIMIT_ATTACHMENT_PER_MIN', 10),
      maxConcurrentActiveTasks: isPro
        ? this.readNumberEnv('AGENT_MAX_ACTIVE_TASKS_PRO', 4)
        : this.readNumberEnv('AGENT_MAX_ACTIVE_TASKS_FREE', 2),
      dailyTokenCap: isPro
        ? this.readNumberEnv('AGENT_DAILY_TOKEN_CAP_PRO', 1_500_000)
        : this.readNumberEnv('AGENT_DAILY_TOKEN_CAP_FREE', 250_000),
      dailyCostCapUsd: isPro
        ? this.readNumberEnv('AGENT_DAILY_COST_CAP_USD_PRO', 5.0)
        : this.readNumberEnv('AGENT_DAILY_COST_CAP_USD_FREE', 0.75),
    };
  }

  private evictIfFull(map: Map<string, number[]>, nowMs: number): void {
    if (map.size < MAX_TRACKED_KEYS) return;
    for (const [k, hits] of map.entries()) {
      if (hits.every((ts) => nowMs - ts >= WINDOW_MS)) {
        map.delete(k);
      }
    }
    if (map.size >= MAX_TRACKED_KEYS) {
      const oldest = map.keys().next().value;
      if (oldest) map.delete(oldest);
    }
  }

  private getRecentHits(map: Map<string, number[]>, key: string, nowMs: number): number[] {
    const existing = map.get(key);
    if (!existing) return [];
    const recent = existing.filter((ts) => nowMs - ts < WINDOW_MS);
    if (recent.length === 0) {
      map.delete(key);
    } else if (recent.length !== existing.length) {
      map.set(key, recent);
    }
    return recent;
  }

  private checkSlidingWindow(
    map: Map<string, number[]>,
    key: string,
    limit: number,
    nowMs: number,
  ): { allowed: boolean; count: number; retryAfterSec: number } {
    const recent = this.getRecentHits(map, key, nowMs);
    if (recent.length >= limit) {
      const oldest = recent[0] ?? nowMs;
      const retryAfterSec = Math.max(1, Math.ceil((WINDOW_MS - (nowMs - oldest)) / 1000));
      return { allowed: false, count: recent.length, retryAfterSec };
    }
    return { allowed: true, count: recent.length, retryAfterSec: 0 };
  }

  private recordHit(map: Map<string, number[]>, key: string, nowMs: number): void {
    this.evictIfFull(map, nowMs);
    const recent = this.getRecentHits(map, key, nowMs);
    recent.push(nowMs);
    map.set(key, recent);
  }

  private async getOrHydrateDailyBucket(
    userId: string,
    nowMs: number = Date.now(),
  ): Promise<DailySpendBucket> {
    const utcDate = this.getCurrentUtcDate(nowMs);
    let bucket = this.dailySpendByUser.get(userId);
    if (!bucket || bucket.utcDate !== utcDate) {
      bucket = {
        utcDate,
        tokensUsed: 0,
        costUsdUsed: 0,
        callsCount: 0,
        hydratedFromDb: false,
      };
      this.dailySpendByUser.set(userId, bucket);
    }

    if (!bucket.hydratedFromDb && this.taskRepo && typeof this.taskRepo.createQueryBuilder === 'function') {
      bucket.hydratedFromDb = true;
      try {
        const dayStart = new Date(`${utcDate}T00:00:00.000Z`);
        const row = await this.taskRepo
          .createQueryBuilder('task')
          .select(
            "COALESCE(SUM(COALESCE((task.metadata->'aiUsage'->>'totalTokens')::double precision, 0)), 0)",
            'totalTokens',
          )
          .addSelect(
            "COALESCE(SUM(COALESCE((task.metadata->'aiUsage'->>'costUsd')::double precision, 0)), 0)",
            'totalCostUsd',
          )
          .addSelect('COUNT(task.id)', 'taskCount')
          .where('task.user_id = :userId', { userId })
          .andWhere('task.created_at >= :dayStart', { dayStart })
          .getRawOne();

        if (row) {
          bucket.tokensUsed = Math.max(bucket.tokensUsed, Math.round(Number(row.totalTokens || 0)));
          bucket.costUsdUsed = Math.max(
            bucket.costUsdUsed,
            Number(Number(row.totalCostUsd || 0).toFixed(6)),
          );
          bucket.callsCount = Math.max(bucket.callsCount, Number(row.taskCount || 0));
        }
      } catch (err: any) {
        this.logger.debug(`Non-fatal daily usage DB hydration skipped: ${err?.message}`);
      }
    }

    return bucket;
  }

  private throwRateLimit(
    code: AgentRateLimitCode,
    message: string,
    retryAfterSec: number,
    limits: AgentTierLimits,
    extra?: Record<string, unknown>,
  ): never {
    this.logger.warn(`RATE_LIMIT_BLOCK [${code}] (${limits.tier}): ${message}`);
    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: 'Too Many Requests',
        code,
        message,
        retryAfterSec,
        tier: limits.tier,
        limits,
        ...(extra || {}),
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  /**
   * Checks ONLY the daily AI token & USD cost caps (used both at message submission
   * and mid-task before expensive Gemini calls).
   */
  public async enforceDailySpendCap(
    userId: string,
    nowMs: number = Date.now(),
  ): Promise<AgentTierLimits> {
    const limits = await this.resolveTierLimits(userId);
    const bucket = await this.getOrHydrateDailyBucket(userId, nowMs);
    const retryAfterSec = this.getSecondsUntilUtcMidnight(nowMs);

    if (bucket.tokensUsed >= limits.dailyTokenCap) {
      this.throwRateLimit(
        'DAILY_TOKEN_CAP_EXCEEDED',
        `Daily AI fair-use token cap reached (${bucket.tokensUsed.toLocaleString()}/${limits.dailyTokenCap.toLocaleString()} tokens for ${limits.tier.toUpperCase()} tier). Resets at 00:00 UTC.`,
        retryAfterSec,
        limits,
        { tokensUsed: bucket.tokensUsed, dailyTokenCap: limits.dailyTokenCap },
      );
    }

    if (bucket.costUsdUsed >= limits.dailyCostCapUsd) {
      this.throwRateLimit(
        'DAILY_COST_CAP_EXCEEDED',
        `Daily AI fair-use spend cap reached ($${bucket.costUsdUsed.toFixed(4)}/$${limits.dailyCostCapUsd.toFixed(2)} for ${limits.tier.toUpperCase()} tier). Resets at 00:00 UTC.`,
        retryAfterSec,
        limits,
        { costUsdUsed: bucket.costUsdUsed, dailyCostCapUsd: limits.dailyCostCapUsd },
      );
    }

    return limits;
  }

  /**
   * Authoritative guard called on POST /agent/conversations/:id/messages.
   * Enforces:
   * 1. Daily AI token & USD spend cap (applies to Free AND Pro/Unlimited accounts)
   * 2. Per-user concurrent active task cap
   * 3. Per-user 60-second sliding-window burst limit
   * 4. Per-conversation 60-second sliding-window burst limit
   */
  public async enforceMessageGuard(
    userId: string,
    conversationId: string,
    nowMs: number = Date.now(),
    options?: { holdInFlightSlot?: boolean },
  ): Promise<void> {
    const limits = await this.enforceDailySpendCap(userId, nowMs);

    // Synchronously claim an in-flight submit slot to prevent TOCTOU races on parallel bursts
    const inFlightBefore = this.inFlightSubmitsByUser.get(userId) || 0;
    if (inFlightBefore >= limits.maxConcurrentActiveTasks) {
      this.throwRateLimit(
        'CONCURRENT_TASK_LIMIT',
        `Too many concurrent AI agent tasks in progress (${inFlightBefore}/${limits.maxConcurrentActiveTasks}). Please wait for an active response to finish.`,
        5,
        limits,
        { activeTasks: inFlightBefore },
      );
    }
    this.inFlightSubmitsByUser.set(userId, inFlightBefore + 1);
    let succeeded = false;

    try {
      // Check persisted active tasks + concurrent in-flight submits
      if (this.taskRepo && typeof this.taskRepo.count === 'function') {
        try {
          const activeCount = await this.taskRepo.count({
            where: {
              userId,
              status: In(['PENDING', 'EXECUTING']),
            },
          });
          if (activeCount + inFlightBefore >= limits.maxConcurrentActiveTasks) {
            this.throwRateLimit(
              'CONCURRENT_TASK_LIMIT',
              `Too many concurrent AI agent tasks in progress (${activeCount + inFlightBefore}/${limits.maxConcurrentActiveTasks}). Please wait for an active response to finish.`,
              5,
              limits,
              { activeTasks: activeCount + inFlightBefore },
            );
          }
        } catch (err: any) {
          if (err instanceof HttpException) throw err;
          // Non-fatal in mock repos without count
        }
      }

      // Check per-user 60s burst limit
      const userCheck = this.checkSlidingWindow(
        this.userMessageHits,
        userId,
        limits.userBurstPerMin,
        nowMs,
      );
      if (!userCheck.allowed) {
        this.throwRateLimit(
          'USER_BURST_RATE_LIMIT',
          `Per-minute agent burst limit reached (${limits.userBurstPerMin} messages/min for ${limits.tier.toUpperCase()} tier). Please retry in ${userCheck.retryAfterSec}s.`,
          userCheck.retryAfterSec,
          limits,
        );
      }

      // Check per-conversation 60s burst limit
      const convKey = `${userId}:${conversationId}`;
      const convCheck = this.checkSlidingWindow(
        this.conversationMessageHits,
        convKey,
        limits.conversationBurstPerMin,
        nowMs,
      );
      if (!convCheck.allowed) {
        this.throwRateLimit(
          'CONVERSATION_BURST_RATE_LIMIT',
          `Conversation burst limit reached (${limits.conversationBurstPerMin} messages/min in this thread). Please retry in ${convCheck.retryAfterSec}s.`,
          convCheck.retryAfterSec,
          limits,
        );
      }

      // Record accepted hits in both windows
      this.recordHit(this.userMessageHits, userId, nowMs);
      this.recordHit(this.conversationMessageHits, convKey, nowMs);
      succeeded = true;
    } finally {
      if (!succeeded || !options?.holdInFlightSlot) {
        this.releaseInFlightSubmit(userId);
      }
    }
  }

  /**
   * Authoritative guard called on POST /agent/attachments/parse and /parse-url.
   */
  public async enforceAttachmentGuard(
    userId: string,
    nowMs: number = Date.now(),
  ): Promise<void> {
    const limits = await this.enforceDailySpendCap(userId, nowMs);

    const check = this.checkSlidingWindow(
      this.userAttachmentHits,
      userId,
      limits.attachmentBurstPerMin,
      nowMs,
    );
    if (!check.allowed) {
      this.throwRateLimit(
        'ATTACHMENT_BURST_RATE_LIMIT',
        `Attachment/URL parsing burst limit reached (${limits.attachmentBurstPerMin} requests/min). Please retry in ${check.retryAfterSec}s.`,
        check.retryAfterSec,
        limits,
      );
    }

    this.recordHit(this.userAttachmentHits, userId, nowMs);
  }

  /**
   * Records observed Gemini token & USD cost spend into the user's daily rollup.
   */
  public recordAiUsage(
    userId: string,
    usage: { totalTokens?: number; costUsd?: number; modelId?: string; source?: string },
    nowMs: number = Date.now(),
  ): void {
    if (!userId) return;
    const tokens = Math.max(0, Math.round(Number(usage.totalTokens || 0)));
    const cost = Math.max(0, Number(usage.costUsd || 0));
    if (tokens === 0 && cost === 0) return;

    const utcDate = this.getCurrentUtcDate(nowMs);
    let bucket = this.dailySpendByUser.get(userId);
    if (!bucket || bucket.utcDate !== utcDate) {
      bucket = {
        utcDate,
        tokensUsed: 0,
        costUsdUsed: 0,
        callsCount: 0,
        hydratedFromDb: false,
      };
      this.dailySpendByUser.set(userId, bucket);
    }

    bucket.tokensUsed += tokens;
    bucket.costUsdUsed = Number((bucket.costUsdUsed + cost).toFixed(6));
    bucket.callsCount += 1;
  }

  /**
   * Returns current tier, burst counters, and daily AI token/cost consumption vs caps.
   */
  public async getUsageSnapshot(
    userId: string,
    conversationId?: string,
    nowMs: number = Date.now(),
  ): Promise<AgentUsageSnapshot> {
    const limits = await this.resolveTierLimits(userId);
    const bucket = await this.getOrHydrateDailyBucket(userId, nowMs);

    return {
      tier: limits.tier,
      utcDate: bucket.utcDate,
      limits,
      burst: {
        userMessagesLastMin: this.getRecentHits(this.userMessageHits, userId, nowMs).length,
        userAttachmentsLastMin: this.getRecentHits(this.userAttachmentHits, userId, nowMs).length,
        ...(conversationId
          ? {
              conversationMessagesLastMin: this.getRecentHits(
                this.conversationMessageHits,
                `${userId}:${conversationId}`,
                nowMs,
              ).length,
            }
          : {}),
      },
      daily: {
        tokensUsed: bucket.tokensUsed,
        tokensRemaining: Math.max(0, limits.dailyTokenCap - bucket.tokensUsed),
        costUsdUsed: Number(bucket.costUsdUsed.toFixed(6)),
        costUsdRemaining: Number(Math.max(0, limits.dailyCostCapUsd - bucket.costUsdUsed).toFixed(6)),
        callsCount: bucket.callsCount,
      },
    };
  }
}

