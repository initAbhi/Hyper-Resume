import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreditLedger, type CreditTransactionType } from './entities/credit-ledger.entity.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

export const CREDIT_COSTS = {
  RESUME_ANALYSIS: 1,
  JOB_MATCH: 2,
  BULLET_REWRITE: 1,
  EXPORT_PDF: 0,
} as const;

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(
    @InjectRepository(CreditLedger)
    private readonly ledgerRepository: Repository<CreditLedger>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<CreditLedger> {
    return manager ? manager.getRepository(CreditLedger) : this.ledgerRepository;
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
    const repo = this.getRepo(manager);

    // 1. Idempotency Check: if this exact operation was already executed, return it
    const existing = await repo.findOne({
      where: { idempotencyKey },
    });
    if (existing) {
      this.logger.debug(`Idempotent credit deduction hit for key: ${idempotencyKey}`);
      return existing;
    }

    // 2. Strict Balance Check
    const currentBalance = await this.getBalance(userId, manager);
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
      `Deducted ${requiredAmount} credits from user ${userId} (${description}). New balance: ${currentBalance - requiredAmount}`,
    );
    return saved;
  }

  async refundCredits(
    userId: string,
    amount: number,
    originalIdempotencyKey: string,
    reason: string,
    manager?: EntityManager,
  ): Promise<CreditLedger> {
    const repo = this.getRepo(manager);
    const refundKey = originalIdempotencyKey.startsWith('refund-')
      ? originalIdempotencyKey
      : `refund-${originalIdempotencyKey}`;

    const existingRefund = await repo.findOne({
      where: { idempotencyKey: refundKey },
    });
    if (existingRefund) {
      this.logger.debug(`Idempotent refund hit for key: ${refundKey}`);
      return existingRefund;
    }

    const refundAmount = Math.abs(amount);
    const entry = repo.create({
      userId,
      amount: refundAmount,
      transactionType: 'refund',
      idempotencyKey: refundKey,
      description: `Refund: ${reason}`,
      metadata: { originalIdempotencyKey, reason },
    });

    const saved = await repo.save(entry);
    this.logger.log(`Refunded ${refundAmount} credits to user ${userId} (${reason})`);
    return saved;
  }
}
