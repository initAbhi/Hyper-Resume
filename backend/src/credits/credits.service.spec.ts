import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { CreditsService } from './credits.service.js';

describe('CreditsService', () => {
  let service: CreditsService;
  let mockLedgerRepo: any;

  beforeEach(() => {
    mockLedgerRepo = {
      create: vi.fn((data) => ({ id: 'entry-1', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'entry-1', ...data })),
      findOne: vi.fn(),
      findAndCount: vi.fn(),
      createQueryBuilder: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getRawOne: vi.fn().mockResolvedValue({ sum: '18' }),
      })),
    };

    service = new CreditsService(mockLedgerRepo);
  });

  it('should return reconciled SQL sum of ledger transactions as balance', async () => {
    const balance = await service.getBalance('user-1');
    expect(balance).toBe(18);
  });

  it('should return existing transaction idempotently without double-inserting', async () => {
    const existingEntry = {
      id: 'existing-id',
      idempotencyKey: 'key-123',
      amount: 25,
      transactionType: 'purchase',
    };
    mockLedgerRepo.findOne.mockResolvedValue(existingEntry);

    const result = await service.addTransaction(
      'user-1',
      25,
      'purchase',
      'key-123',
      'Purchase 25 credits',
    );

    expect(result).toBe(existingEntry);
    expect(mockLedgerRepo.save).not.toHaveBeenCalled();
  });

  it('should deduct credits when user has sufficient balance', async () => {
    mockLedgerRepo.findOne.mockResolvedValue(null);

    const deduction = await service.deductCredits(
      'user-1',
      2,
      'resume_analysis',
      'op-deduct-1',
      'Job match analysis',
    );

    expect(deduction.amount).toBe(-2);
    expect(deduction.idempotencyKey).toBe('op-deduct-1');
    expect(mockLedgerRepo.save).toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user has insufficient balance', async () => {
    mockLedgerRepo.findOne.mockResolvedValue(null);
    mockLedgerRepo.createQueryBuilder.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      getRawOne: vi.fn().mockResolvedValue({ sum: '1' }), // only 1 credit
    });

    await expect(
      service.deductCredits(
        'user-1',
        2,
        'resume_analysis',
        'op-deduct-2',
        'Job match analysis',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should return existing deduction idempotently without double-charging', async () => {
    const existingDeduction = {
      id: 'existing-deduction-id',
      idempotencyKey: 'op-deduct-retry',
      amount: -2,
    };
    mockLedgerRepo.findOne.mockResolvedValue(existingDeduction);

    const result = await service.deductCredits(
      'user-1',
      2,
      'resume_analysis',
      'op-deduct-retry',
      'Retry of job match analysis',
    );

    expect(result).toBe(existingDeduction);
    expect(mockLedgerRepo.save).not.toHaveBeenCalled();
  });

  it('should refund credits with positive compensatory transaction', async () => {
    mockLedgerRepo.findOne.mockResolvedValue(null);

    const refund = await service.refundCredits(
      'user-1',
      2,
      'op-failed-ai',
      'AI Provider timeout',
    );

    expect(refund.amount).toBe(2);
    expect(refund.transactionType).toBe('refund');
    expect(refund.idempotencyKey).toBe('refund-op-failed-ai');
    expect(mockLedgerRepo.save).toHaveBeenCalled();
  });
});
