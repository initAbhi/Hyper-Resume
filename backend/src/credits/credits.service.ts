import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  constructor(
    @InjectRepository(CreditLedger)
    private readonly ledgerRepository: Repository<CreditLedger>,
  ) {}

  async getBalance(userId: string): Promise<number> {
    const { sum } = await this.ledgerRepository
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
  ): Promise<CreditLedger> {
    const existing = await this.ledgerRepository.findOne({
      where: { idempotencyKey },
    });

    if (existing) {
      return existing; // Idempotent response
    }

    const entry = this.ledgerRepository.create({
      userId,
      amount,
      transactionType,
      idempotencyKey,
      description,
      metadata,
    });

    return this.ledgerRepository.save(entry);
  }

  async deductCredits(
    userId: string,
    amount: number,
    transactionType: CreditTransactionType,
    idempotencyKey: string,
    description: string,
    metadata?: Record<string, unknown>,
  ): Promise<CreditLedger> {
    // 1. Idempotency Check: if this exact operation was already executed, return it
    const existing = await this.ledgerRepository.findOne({
      where: { idempotencyKey },
    });
    if (existing) {
      return existing;
    }

    // 2. Strict Balance Check
    const currentBalance = await this.getBalance(userId);
    const requiredAmount = Math.abs(amount);

    if (currentBalance < requiredAmount) {
      throw new ForbiddenException(
        `Insufficient credit balance (${currentBalance} available, ${requiredAmount} required). Please recharge your credits to continue.`,
      );
    }

    // 3. Negative Ledger Deduction Entry
    const deduction = this.ledgerRepository.create({
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

    return this.ledgerRepository.save(deduction);
  }

  async refundCredits(
    userId: string,
    amount: number,
    originalIdempotencyKey: string,
    reason: string,
  ): Promise<CreditLedger> {
    const refundKey = `refund-${originalIdempotencyKey}`;
    const existingRefund = await this.ledgerRepository.findOne({
      where: { idempotencyKey: refundKey },
    });
    if (existingRefund) {
      return existingRefund;
    }

    const refundAmount = Math.abs(amount);
    const entry = this.ledgerRepository.create({
      userId,
      amount: refundAmount,
      transactionType: 'refund',
      idempotencyKey: refundKey,
      description: `Refund: ${reason}`,
      metadata: { originalIdempotencyKey, reason },
    });

    return this.ledgerRepository.save(entry);
  }
}
