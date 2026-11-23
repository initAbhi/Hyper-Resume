import { ForbiddenException, Injectable, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreditLedger, type CreditTransactionType } from './entities/credit-ledger.entity.js';
import { User } from '../users/entities/user.entity.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import {
  FREE_SIGNUP_CREDITS,
  PRO_WEEKLY_CREDITS,
} from '../payments/pricing-plans.js';

export const CREDIT_COSTS = {
  RESUME_ANALYSIS: 1,
  JOB_MATCH: 1,
  AGENT_REPLY: 1,
  BULLET_REWRITE: 1,
  EXPORT_PDF: 0,
  ADAPT_RESUME: 3,
  ADAPT_SECTION: 1,
  AI_TAILOR: 2,
  COVER_LETTER: 2,
  LINKEDIN_OPTIMIZE: 2,
  MOCK_INTERVIEW: 2,
} as const;

export interface EntitlementStatus {
  balance: number;
  hasActivePro: boolean;
  proPlanId: string | null;
  proExpiresAt: Date | null;
  isLifetimePro: boolean;
}

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(
    @InjectRepository(CreditLedger)
    private readonly ledgerRepository: Repository<CreditLedger>,
    @Optional()
    @InjectRepository(User)
    private readonly userRepository?: Repository<User>,
  ) { }

  private getRepo(manager?: EntityManager): Repository<CreditLedger> {
    return manager ? manager.getRepository(CreditLedger) : this.ledgerRepository;
  }

  private getUserRepo(manager?: EntityManager): Repository<User> | undefined {
    return manager ? manager.getRepository(User) : this.userRepository;
  }

  async hasActivePro(userId: string, manager?: EntityManager): Promise<boolean> {
    const repo = this.getUserRepo(manager);
    if (!repo) {
      return false;
    }

    const user = await repo.findOne({
      where: { id: userId },
      select: { id: true, isLifetimePro: true, proExpiresAt: true, proPlanId: true },
    });
    if (!user) {
      return false;
    }

    if (user.isLifetimePro) {
      return true;
    }
    return Boolean(user.proExpiresAt && new Date(user.proExpiresAt).getTime() > Date.now());
  }

  async getEntitlementStatus(userId: string, manager?: EntityManager): Promise<EntitlementStatus> {
    // Pro users receive 75 credits per ISO week while their pass is active
    await this.ensureWeeklyProCredits(userId, manager);

    const balance = await this.getBalance(userId, manager);
    const repo = this.getUserRepo(manager);
    if (!repo) {
      return {
        balance,
        hasActivePro: false,
        proPlanId: null,
        proExpiresAt: null,
        isLifetimePro: false,
      };
    }

    const user = await repo.findOne({
      where: { id: userId },
      select: { id: true, isLifetimePro: true, proExpiresAt: true, proPlanId: true },
    });
    const hasActivePro = Boolean(
      user?.isLifetimePro ||
      (user?.proExpiresAt && new Date(user.proExpiresAt).getTime() > Date.now()),
    );

    return {
      balance: await this.getBalance(userId, manager),
      hasActivePro,
      proPlanId: user?.proPlanId || null,
      proExpiresAt: user?.proExpiresAt || null,
      isLifetimePro: Boolean(user?.isLifetimePro),
    };
  }

  /** ISO week key e.g. 2026-W47 — used for idempotent weekly Pro refills */
  private getIsoWeekKey(date = new Date()): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  /**
   * Grant PRO_WEEKLY_CREDITS once per ISO week while Pro is active.
   * Idempotent via weekly-refill:{userId}:{year}-W{week}.
   */
  async ensureWeeklyProCredits(userId: string, manager?: EntityManager): Promise<void> {
    if (!(await this.hasActivePro(userId, manager))) {
      return;
    }

    const weekKey = this.getIsoWeekKey();
    const idempotencyKey = `weekly-refill:${userId}:${weekKey}`;
    try {
      await this.addTransaction(
        userId,
        PRO_WEEKLY_CREDITS,
        'weekly_refill',
        idempotencyKey,
        `Weekly Pro AI credits (${PRO_WEEKLY_CREDITS}) for ${weekKey}`,
        { weekKey, amount: PRO_WEEKLY_CREDITS },
        manager,
      );
    } catch {
      // Duplicate idempotency key = already granted this week — ignore
    }
  }

  async getBalance(userId: string, manager?: EntityManager): Promise<number> {
    const repo = this.getRepo(manager);
    const { sum } = await repo
      .createQueryBuilder('ledger')
      .select('COALESCE(SUM(ledger.amount), 0)', 'sum')
      .where('ledger.user_id = :userId', { userId })
      .getRawOne();

    return Number(sum);
  }

  async getTransactionHistory(
    userId: string,
    pagination: PaginationQueryDto,
  ): Promise<{ items: CreditLedger[]; total: number; balance: number }> {
    const [items, total] = await this.ledgerRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });

    const balance = await this.getBalance(userId);

    return {
      items,
      total,
      balance,
    };
  }

  async addTransaction(
    userId: string,
    amount: number,
    transactionType: CreditTransactionType,
    idempotencyKey: string,
    description: string,
    metadata?: Record<string, unknown>,
    manager?: EntityManager,
  ): Promise<CreditLedger> {
    const repo = this.getRepo(manager);
    const existing = await repo.findOne({
      where: { idempotencyKey },
    });

    if (existing) {
      this.logger.debug(`Idempotent transaction ignored for key: ${idempotencyKey}`);
      return existing;
    }

    const entry = repo.create({
      userId,
      amount,
      transactionType,
      idempotencyKey,
      description,
      metadata,
    });

    const saved = await repo.save(entry);
    this.logger.log(`Awarded ${amount} credits to user ${userId} (${transactionType}: ${description})`);
    return saved;
  }

  async deductCredits(
    userId: string,
    amount: number,
    transactionType: CreditTransactionType,
    idempotencyKey: string,
    description: string,
    metadata?: Record<string, unknown>,
    manager?: EntityManager,
  ): Promise<CreditLedger> {
    return this.runWithUserCreditLock(userId, manager, async (txManager) => {
      const repo = this.getRepo(txManager);

      // 1. Idempotency Check: if this exact operation was already executed, return it
      const existing = await repo.findOne({
        where: { idempotencyKey },
      });
      if (existing) {
        this.logger.debug(`Idempotent credit deduction hit for key: ${idempotencyKey}`);
        return existing;
      }

      // 2. Strict Balance Check (serialized under per-user advisory lock)
      const currentBalance = await this.getBalance(userId, txManager);
      const requiredAmount = Math.abs(amount);

      if (currentBalance < requiredAmount) {
        this.logger.warn(
          `Insufficient credit balance for user ${userId}. Available: ${currentBalance}, Required: ${requiredAmount}`,
        );
        throw new ForbiddenException(
          `Insufficient credit balance (${currentBalance} available, ${requiredAmount} required). Please recharge your credits to continue.`,
        );
      }

      // 3. Negative Ledger Deduction Entry
      const deduction = repo.create({
        userId,
        amount: -requiredAmount,
        transactionType,
        idempotencyKey,
        description,
        metadata: {
          ...metadata,
          balanceBefore: currentBalance,
          balanceAfter: currentBalance - requiredAmount,
        },
      });

      const saved = await repo.save(deduction);
      this.logger.log(
        `Deducted ${requiredAmount} credits from user ${userId} (${transactionType}: ${description}). Remaining: ${currentBalance - requiredAmount}`,
      );

      return saved;
    });
  }

  async consumeFeatureAccess(
    userId: string,
    cost: number,
    transactionType: CreditTransactionType,
    idempotencyKey: string,
    description: string,
    metadata?: Record<string, unknown>,
    manager?: EntityManager,
  ): Promise<{ accessGrantedVia: 'pro_pass' | 'credits'; ledgerEntry?: CreditLedger }> {
    const requiredCost = Math.abs(cost);
    if (requiredCost <= 0) {
      return { accessGrantedVia: 'credits' };
    }

    // Pro unlocks premium features (templates/samples) but AI still burns weekly credits
    await this.ensureWeeklyProCredits(userId, manager);

    const ledgerEntry = await this.deductCredits(
      userId,
      requiredCost,
      transactionType,
      idempotencyKey,
      description,
      metadata,
      manager,
    );
    return { accessGrantedVia: 'credits', ledgerEntry };
  }

  async refundCredits(
    userId: string,
    amount: number,
    originalIdempotencyKey: string,
    reason: string,
    manager?: EntityManager,
  ): Promise<CreditLedger> {
    const refundKey = `refund:${originalIdempotencyKey}`;
    return this.addTransaction(
      userId,
      Math.abs(amount),
      'refund',
      refundKey,
      `Refund: ${reason}`,
      { originalIdempotencyKey },
      manager,
    );
  }

  async initializeUserCredits(userId: string, manager?: EntityManager): Promise<CreditLedger> {
    return this.addTransaction(
      userId,
      FREE_SIGNUP_CREDITS,
      'signup_bonus',
      `signup-bonus-${userId}`,
      `Welcome bonus: ${FREE_SIGNUP_CREDITS} lifetime AI credits`,
      { initial: true },
      manager,
    );
  }

  async getTaskCreditSpend(taskId: string, manager?: EntityManager): Promise<number> {
    const repo = this.getRepo(manager);
    const entries = await repo
      .createQueryBuilder('ledger')
      .where("ledger.metadata->>'taskId' = :taskId", { taskId })
      .getMany();

    let total = 0;
    for (const e of entries) {
      const status = (e.metadata as any)?.status;
      if (status === 'RESERVED' || status === 'COMMITTED') {
        total += Math.abs(Number((e.metadata as any)?.cost || e.amount));
      }
    }
    return total;
  }

  private async runWithUserCreditLock<T>(
    userId: string,
    manager: EntityManager | undefined,
    fn: (txManager?: EntityManager) => Promise<T>,
  ): Promise<T> {
    if (manager) {
      return fn(manager);
    }

    const connection = (this.ledgerRepository as any)?.manager?.connection;
    const isPostgres = connection?.options?.type === 'postgres';
    if (isPostgres && typeof connection.transaction === 'function') {
      return connection.transaction(async (txManager: EntityManager) => {
        await txManager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
          `credits:user:${userId}`,
        ]);
        return fn(txManager);
      });
    }

    return fn(undefined);
  }

  async reserveCredits(
    userId: string,
    cost: number,
    taskId: string,
    stepIndex: number,
    manager?: EntityManager,
  ): Promise<{ success: boolean; reservationKey: string; grantedVia: 'pro_pass' | 'credits' }> {
    const requiredCost = Math.abs(cost);
    const reservationKey = `res:${taskId}:${stepIndex}`;

    if (requiredCost <= 0) {
      return { success: true, reservationKey, grantedVia: 'credits' };
    }

    return this.runWithUserCreditLock(userId, manager, async (txManager) => {
      await this.ensureWeeklyProCredits(userId, txManager);

      const maxTaskCredits = Number(process.env.AGENT_MAX_TASK_CREDITS || 6);
      const currentTaskSpend = await this.getTaskCreditSpend(taskId, txManager);
      if (currentTaskSpend + requiredCost > maxTaskCredits) {
        throw new ForbiddenException(
          `Task credit spending limit exceeded (${currentTaskSpend} spent/reserved, ${requiredCost} requested, max ${maxTaskCredits} per task).`,
        );
      }

      const repo = this.getRepo(txManager);
      const existing = await repo.findOne({ where: { idempotencyKey: reservationKey } });
      if (existing) {
        const status = (existing.metadata as any)?.status;
        if (status === 'RESERVED' || status === 'COMMITTED') {
          return { success: true, reservationKey, grantedVia: 'credits' };
        }
      }

      const currentBalance = await this.getBalance(userId, txManager);
      if (currentBalance < requiredCost) {
        throw new ForbiddenException(
          `Insufficient credit balance (${currentBalance} available, ${requiredCost} required). Please recharge your credits to continue.`,
        );
      }

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const entry = repo.create({
        userId,
        amount: -requiredCost,
        transactionType: 'agent_reservation',
        idempotencyKey: reservationKey,
        description: `Credit reservation for task ${taskId} step ${stepIndex}`,
        metadata: {
          status: 'RESERVED',
          taskId,
          stepIndex,
          cost: requiredCost,
          expiresAt: expiresAt.toISOString(),
          balanceBefore: currentBalance,
          balanceAfter: currentBalance - requiredCost,
        },
      });

      await repo.save(entry);
      return { success: true, reservationKey, grantedVia: 'credits' };
    });
  }

  async commitReservation(idempotencyKey: string, manager?: EntityManager): Promise<CreditLedger | null> {
    if (idempotencyKey.startsWith('pro:') || idempotencyKey.startsWith('free:')) {
      return null;
    }

    const repo = this.getRepo(manager);
    const entry = await repo.findOne({ where: { idempotencyKey } });
    if (!entry) {
      this.logger.warn(`Attempted to commit non-existent reservation: ${idempotencyKey}`);
      return null;
    }

    const metadata = (entry.metadata || {}) as Record<string, any>;
    metadata.status = 'COMMITTED';
    metadata.committedAt = new Date().toISOString();
    entry.metadata = metadata;
    entry.transactionType = 'agent_task';
    return repo.save(entry);
  }

  async releaseReservation(
    idempotencyKey: string,
    reason: string = 'Operation aborted or failed',
    manager?: EntityManager,
  ): Promise<CreditLedger | null> {
    if (idempotencyKey.startsWith('pro:') || idempotencyKey.startsWith('free:')) {
      return null;
    }

    const repo = this.getRepo(manager);
    const entry = await repo.findOne({ where: { idempotencyKey } });
    if (!entry) {
      return null;
    }

    const metadata = (entry.metadata || {}) as Record<string, any>;
    if (metadata.status === 'RELEASED' || metadata.status === 'COMMITTED') {
      return entry;
    }

    entry.amount = 0;
    metadata.status = 'RELEASED';
    metadata.releasedAt = new Date().toISOString();
    metadata.releaseReason = reason;
    entry.metadata = metadata;
    return repo.save(entry);
  }

  async releaseExpiredReservations(manager?: EntityManager): Promise<number> {
    const repo = this.getRepo(manager);
    const nowIso = new Date().toISOString();
    const expiredEntries = await repo
      .createQueryBuilder('ledger')
      .where("ledger.transaction_type = 'agent_reservation'")
      .andWhere("ledger.metadata->>'status' = 'RESERVED'")
      .andWhere("ledger.metadata->>'expiresAt' < :nowIso", { nowIso })
      .getMany();

    for (const entry of expiredEntries) {
      entry.amount = 0;
      const metadata = (entry.metadata || {}) as Record<string, any>;
      metadata.status = 'RELEASED';
      metadata.releasedAt = nowIso;
      metadata.releaseReason = 'Reservation expired';
      entry.metadata = metadata;
      await repo.save(entry);
    }

    return expiredEntries.length;
  }
}
