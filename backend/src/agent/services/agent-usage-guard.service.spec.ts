import { describe, expect, it, vi } from 'vitest';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AgentUsageGuardService } from './agent-usage-guard.service.js';

function createGuard(overrides: {
  env?: Record<string, string | number>;
  isPro?: boolean;
  activeTaskCount?: number;
  dbDailyTokens?: number;
  dbDailyCostUsd?: number;
} = {}) {
  const config = new ConfigService({
    AGENT_RATE_LIMIT_USER_PER_MIN_FREE: 4,
    AGENT_RATE_LIMIT_USER_PER_MIN_PRO: 6,
    AGENT_RATE_LIMIT_CONV_PER_MIN: 3,
    AGENT_RATE_LIMIT_ATTACHMENT_PER_MIN: 2,
    AGENT_MAX_ACTIVE_TASKS_FREE: 2,
    AGENT_MAX_ACTIVE_TASKS_PRO: 3,
    AGENT_DAILY_TOKEN_CAP_FREE: 10_000,
    AGENT_DAILY_TOKEN_CAP_PRO: 50_000,
    AGENT_DAILY_COST_CAP_USD_FREE: 0.1,
    AGENT_DAILY_COST_CAP_USD_PRO: 0.5,
    ...(overrides.env || {}),
  });

  const creditsService = {
    hasActivePro: vi.fn().mockResolvedValue(Boolean(overrides.isPro)),
  } as any;

  const qb = {
    select: vi.fn().mockReturnThis(),
    addSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    getRawOne: vi.fn().mockResolvedValue({
      totalTokens: overrides.dbDailyTokens ?? 0,
      totalCostUsd: overrides.dbDailyCostUsd ?? 0,
      taskCount: overrides.dbDailyTokens ? 3 : 0,
    }),
  };

  const taskRepo = {
    count: vi.fn().mockResolvedValue(overrides.activeTaskCount ?? 0),
    createQueryBuilder: vi.fn().mockReturnValue(qb),
  } as any;

  return {
    guard: new AgentUsageGuardService(config, creditsService, taskRepo),
    creditsService,
    taskRepo,
  };
}

async function expect429WithCode(fn: () => Promise<unknown>, expectedCode: string) {
  try {
    await fn();
    throw new Error(`Expected HttpException 429 with code ${expectedCode}, but resolved cleanly`);
  } catch (err: any) {
    expect(err).toBeInstanceOf(HttpException);
    expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    const body = err.getResponse() as Record<string, any>;
    expect(body.code).toBe(expectedCode);
    expect(body.retryAfterSec).toBeGreaterThanOrEqual(1);
    return body;
  }
}

describe('AgentUsageGuardService — Per-User & Per-Conversation Rate Limits + Daily Spend Caps', () => {
  it('enforces per-conversation 60s burst limit and recovers after window expires', async () => {
    const { guard } = createGuard({ isPro: true }); // userBurst=6, convBurst=3
    const t0 = Date.UTC(2026, 10, 18, 12, 0, 0);

    await guard.enforceMessageGuard('pro-user-1', 'conv-A', t0);
    await guard.enforceMessageGuard('pro-user-1', 'conv-A', t0 + 1000);
    await guard.enforceMessageGuard('pro-user-1', 'conv-A', t0 + 2000);

    // 4th message in same conversation within 60s -> blocked by CONVERSATION_BURST_RATE_LIMIT
    await expect429WithCode(
      () => guard.enforceMessageGuard('pro-user-1', 'conv-A', t0 + 3000),
      'CONVERSATION_BURST_RATE_LIMIT',
    );

    // Different conversation for same Pro user is still allowed up to userBurst (6/min)
    await guard.enforceMessageGuard('pro-user-1', 'conv-B', t0 + 4000);

    // After 61 seconds, conv-A window slides clean and succeeds again
    await guard.enforceMessageGuard('pro-user-1', 'conv-A', t0 + 61_000);
  });

  it('enforces per-user 60s burst limit across multiple conversations even for Pro/Unlimited users', async () => {
    const { guard } = createGuard({ isPro: true }); // userBurst=6, convBurst=3
    const t0 = Date.UTC(2026, 10, 18, 12, 0, 0);

    for (let i = 0; i < 6; i++) {
      await guard.enforceMessageGuard('pro-script-user', `conv-${i}`, t0 + i * 500);
    }

    // 7th message across a brand new conversation -> blocked by USER_BURST_RATE_LIMIT
    await expect429WithCode(
      () => guard.enforceMessageGuard('pro-script-user', 'conv-7', t0 + 4000),
      'USER_BURST_RATE_LIMIT',
    );
  });

  it('enforces daily AI token cap AND daily USD cost cap for Pro/Unlimited users and resets at next UTC day', async () => {
    const { guard } = createGuard({ isPro: true }); // pro dailyTokenCap=50_000, dailyCostCapUsd=0.50
    const day1 = Date.UTC(2026, 10, 18, 14, 0, 0);

    guard.recordAiUsage('pro-user-cap', { totalTokens: 30_000, costUsd: 0.12 }, day1);
    await guard.enforceDailySpendCap('pro-user-cap', day1 + 1000); // under both caps

    // Push past 50,000 daily token cap -> blocked!
    guard.recordAiUsage('pro-user-cap', { totalTokens: 25_000, costUsd: 0.08 }, day1 + 2000);
    await expect429WithCode(
      () => guard.enforceMessageGuard('pro-user-cap', 'conv-1', day1 + 3000),
      'DAILY_TOKEN_CAP_EXCEEDED',
    );

    // Next UTC day resets cleanly!
    const day2 = Date.UTC(2026, 10, 19, 0, 1, 0);
    await guard.enforceMessageGuard('pro-user-cap', 'conv-1', day2);

    // Test USD cost cap independently (low tokens, high cost)
    guard.recordAiUsage('pro-user-cap', { totalTokens: 5_000, costUsd: 0.55 }, day2 + 1000);
    await expect429WithCode(
      () => guard.enforceMessageGuard('pro-user-cap', 'conv-2', day2 + 2000),
      'DAILY_COST_CAP_EXCEEDED',
    );
  });

  it('hydrates prior daily spend from PostgreSQL across server restarts so caps cannot be bypassed by restart', async () => {
    const { guard } = createGuard({
      isPro: false, // free dailyTokenCap=10_000
      dbDailyTokens: 12_500,
      dbDailyCostUsd: 0.04,
    });

    await expect429WithCode(
      () => guard.enforceMessageGuard('free-user-restarted', 'conv-1'),
      'DAILY_TOKEN_CAP_EXCEEDED',
    );
  });

  it('enforces concurrent active task cap and attachment/URL burst cap and reports usage snapshot', async () => {
    const { guard: busyGuard } = createGuard({ isPro: false, activeTaskCount: 2 });
    await expect429WithCode(
      () => busyGuard.enforceMessageGuard('user-busy', 'conv-1'),
      'CONCURRENT_TASK_LIMIT',
    );

    const { guard } = createGuard({ isPro: true }); // attachmentBurstPerMin=2
    const t0 = Date.UTC(2026, 10, 18, 15, 0, 0);
    await guard.enforceAttachmentGuard('pro-att-1', t0);
    await guard.enforceAttachmentGuard('pro-att-1', t0 + 1000);
    await expect429WithCode(
      () => guard.enforceAttachmentGuard('pro-att-1', t0 + 2000),
      'ATTACHMENT_BURST_RATE_LIMIT',
    );

    guard.recordAiUsage('pro-att-1', { totalTokens: 4200, costUsd: 0.0021 }, t0 + 3000);
    const snap = await guard.getUsageSnapshot('pro-att-1', 'conv-1', t0 + 4000);
    expect(snap.tier).toBe('pro');
    expect(snap.burst.userAttachmentsLastMin).toBe(2);
    expect(snap.daily.tokensUsed).toBe(4200);
    expect(snap.daily.tokensRemaining).toBe(45_800);
    expect(snap.daily.costUsdUsed).toBeCloseTo(0.0021, 5);
  });
});

