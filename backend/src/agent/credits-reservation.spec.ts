import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { CreditsService } from '../credits/credits.service.js';

describe('Atomic Credit Reservation Lifecycle (Phase 2)', () => {
  let creditsService: CreditsService;
  let mockLedgerRepo: any;
  let mockUserRepo: any;

  beforeEach(() => {
    mockLedgerRepo = {
      create: vi.fn((data) => ({ id: 'ledger-res-1', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'ledger-res-1', ...data })),
      findOne: vi.fn(),
      createQueryBuilder: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getRawOne: vi.fn().mockResolvedValue({ sum: '10' }),
        getMany: vi.fn().mockResolvedValue([]),
      })),
    };

    mockUserRepo = {
      findOne: vi.fn().mockResolvedValue({
        id: 'user-1',
        isLifetimePro: false,
        proExpiresAt: null,
      }),
    };

    creditsService = new CreditsService(mockLedgerRepo, mockUserRepo);
  });

  describe('reserveCredits', () => {
    it('holds credits with negative amount immediately decremented under SUM(amount)', async () => {
      mockLedgerRepo.findOne.mockResolvedValue(null);

      const res = await creditsService.reserveCredits('user-1', 2, 'task-100', 0);

      expect(res.success).toBe(true);
      expect(res.grantedVia).toBe('credits');
      expect(res.reservationKey).toBe('res:task-100:0');

      expect(mockLedgerRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          amount: -2,
          transactionType: 'agent_reservation',
          idempotencyKey: 'res:task-100:0',
          metadata: expect.objectContaining({
            status: 'RESERVED',
            taskId: 'task-100',
            stepIndex: 0,
            cost: 2,
          }),
        }),
      );
      expect(mockLedgerRepo.save).toHaveBeenCalled();
    });

    it('grants access via pro_pass without creating ledger debit when user has active Pro', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-pro',
        isLifetimePro: true,
      });

      const res = await creditsService.reserveCredits('user-pro', 2, 'task-pro', 1);

      expect(res.success).toBe(true);
      expect(res.grantedVia).toBe('pro_pass');
      expect(res.reservationKey).toContain('pro:task-pro:1');
      expect(mockLedgerRepo.save).not.toHaveBeenCalled();
    });

    it('grants free access when cost is 0', async () => {
      const res = await creditsService.reserveCredits('user-1', 0, 'task-free', 0);

      expect(res.success).toBe(true);
      expect(res.grantedVia).toBe('credits');
      expect(mockLedgerRepo.save).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when user balance is insufficient', async () => {
      mockLedgerRepo.createQueryBuilder = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getRawOne: vi.fn().mockResolvedValue({ sum: '1' }),
        getMany: vi.fn().mockResolvedValue([]),
      }));

      await expect(
        creditsService.reserveCredits('user-1', 2, 'task-poor', 0),
      ).rejects.toThrow(ForbiddenException);
    });

    it('enforces task spending ceiling (max 6 credits) and halts when exceeded', async () => {
      // Mock existing task entries totaling 5 credits
      mockLedgerRepo.createQueryBuilder = vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getRawOne: vi.fn().mockResolvedValue({ sum: '10' }),
        getMany: vi.fn().mockResolvedValue([
          { metadata: { status: 'COMMITTED', cost: 3 } },
          { metadata: { status: 'RESERVED', cost: 2 } },
        ]),
      }));

      // Requesting 2 more credits would bring task spend to 7, exceeding 6 credit ceiling
      await expect(
        creditsService.reserveCredits('user-1', 2, 'task-ceiling', 2),
      ).rejects.toThrow(/Task credit spending limit exceeded/);
    });
  });

  describe('commitReservation', () => {
    it('transitions reservation status to COMMITTED and preserves negative amount', async () => {
      const reservedEntry = {
        id: 'entry-1',
        amount: -2,
        transactionType: 'agent_reservation',
        idempotencyKey: 'res:task-100:0',
        metadata: {
          status: 'RESERVED',
          cost: 2,
        },
      };
      mockLedgerRepo.findOne.mockResolvedValue(reservedEntry);

      const committed = await creditsService.commitReservation('res:task-100:0');

      expect(committed).toBeDefined();
      expect(committed?.transactionType).toBe('agent_task');
      expect((committed?.metadata as any)?.status).toBe('COMMITTED');
      expect((committed?.metadata as any)?.committedAt).toBeDefined();
      expect(committed?.amount).toBe(-2);
      expect(mockLedgerRepo.save).toHaveBeenCalled();
    });

    it('gracefully returns null for pro_pass or free keys', async () => {
      const res = await creditsService.commitReservation('pro:task-1:0');
      expect(res).toBeNull();
      expect(mockLedgerRepo.findOne).not.toHaveBeenCalled();
    });
  });

  describe('releaseReservation', () => {
    it('sets amount = 0 and status = RELEASED, restoring balance under SUM(amount)', async () => {
      const reservedEntry = {
        id: 'entry-1',
        amount: -2,
        transactionType: 'agent_reservation',
        idempotencyKey: 'res:task-100:0',
        metadata: {
          status: 'RESERVED',
          cost: 2,
        },
      };
      mockLedgerRepo.findOne.mockResolvedValue(reservedEntry);

      const released = await creditsService.releaseReservation('res:task-100:0', 'AI call timed out');

      expect(released).toBeDefined();
      expect(released?.amount).toBe(0);
      expect((released?.metadata as any)?.status).toBe('RELEASED');
      expect((released?.metadata as any)?.releaseReason).toBe('AI call timed out');
      expect(mockLedgerRepo.save).toHaveBeenCalled();
    });

    it('is idempotent when reservation is already released', async () => {
      const alreadyReleased = {
        id: 'entry-1',
        amount: 0,
        metadata: {
          status: 'RELEASED',
        },
      };
      mockLedgerRepo.findOne.mockResolvedValue(alreadyReleased);

      const result = await creditsService.releaseReservation('res:task-100:0');

      expect(result).toBe(alreadyReleased);
      expect(mockLedgerRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('releaseExpiredReservations', () => {
    it('releases all expired reservations older than 10 minutes', async () => {
      const expiredEntry1 = {
        id: 'exp-1',
        amount: -2,
        metadata: { status: 'RESERVED', expiresAt: '2020-01-01T00:00:00Z' },
      };
      const expiredEntry2 = {
        id: 'exp-2',
        amount: -1,
        metadata: { status: 'RESERVED', expiresAt: '2020-01-01T00:00:00Z' },
      };

      mockLedgerRepo.createQueryBuilder = vi.fn(() => ({
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([expiredEntry1, expiredEntry2]),
      }));

      const releasedCount = await creditsService.releaseExpiredReservations();

      expect(releasedCount).toBe(2);
      expect(expiredEntry1.amount).toBe(0);
      expect((expiredEntry1.metadata as any).status).toBe('RELEASED');
      expect(expiredEntry2.amount).toBe(0);
      expect((expiredEntry2.metadata as any).status).toBe('RELEASED');
      expect(mockLedgerRepo.save).toHaveBeenCalledTimes(2);
    });
  });
});

