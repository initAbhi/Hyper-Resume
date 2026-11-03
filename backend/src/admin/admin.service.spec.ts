import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AdminService } from './admin.service.js';

describe('AdminService', () => {
  let service: AdminService;
  let mockSettingRepo: any;
  let mockUserRepo: any;
  let mockPaymentRepo: any;
  let mockResumeRepo: any;
  let mockDodoProvider: any;

  beforeEach(() => {
    mockSettingRepo = {
      findOne: vi.fn(),
      create: vi.fn((data) => ({ ...data })),
      save: vi.fn((data) => Promise.resolve(data)),
    };

    mockUserRepo = {
      count: vi.fn().mockResolvedValue(10),
      findBy: vi.fn().mockResolvedValue([]),
    };

    mockPaymentRepo = {
      count: vi.fn().mockResolvedValue(5),
      find: vi.fn().mockResolvedValue([]),
    };

    mockResumeRepo = {
      count: vi.fn().mockResolvedValue(8),
    };

    mockDodoProvider = {
      getMode: vi.fn().mockReturnValue('test_mode'),
      setMode: vi.fn(),
      getSettingsSummary: vi.fn().mockReturnValue({
        mode: 'test_mode',
        provider: 'dodo',
        testConfigured: true,
        liveConfigured: true,
      }),
    };

    const mockCreditRepo = {
      createQueryBuilder: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        getRawMany: vi.fn().mockResolvedValue([]),
      }),
      find: vi.fn().mockResolvedValue([]),
    };

    const mockCreditsService = {
      getBalance: vi.fn().mockResolvedValue(50),
      addTransaction: vi.fn().mockResolvedValue({ id: 'tx-1' }),
    };

    service = new AdminService(
      mockSettingRepo,
      mockUserRepo,
      mockPaymentRepo,
      mockResumeRepo,
      mockCreditRepo as any,
      mockCreditsService as any,
      mockDodoProvider,
    );
  });

  it('should restore payment mode from database on module init', async () => {
    mockSettingRepo.findOne.mockResolvedValue({ key: 'payment_mode', value: 'live_mode' });
    await service.onModuleInit();
    expect(mockDodoProvider.setMode).toHaveBeenCalledWith('live_mode');
  });

  it('should initialize payment mode in database if not present', async () => {
    mockSettingRepo.findOne.mockResolvedValue(null);
    await service.onModuleInit();
    expect(mockSettingRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'payment_mode', value: 'test_mode' }),
    );
  });

  it('should update payment mode in both database and provider runtime', async () => {
    mockSettingRepo.findOne.mockResolvedValue({ key: 'payment_mode', value: 'test_mode' });
    await service.updatePaymentMode('live_mode');

    expect(mockSettingRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'payment_mode', value: 'live_mode' }),
    );
    expect(mockDodoProvider.setMode).toHaveBeenCalledWith('live_mode');
  });

  it('should reject invalid payment mode update', async () => {
    await expect(service.updatePaymentMode('invalid' as any)).rejects.toThrow();
  });

  it('should return aggregated admin stats', async () => {
    mockPaymentRepo.find.mockResolvedValue([
      { amountMinor: 39900, currency: 'INR' },
      { amountMinor: 89900, currency: 'INR' },
    ]);

    const stats = await service.getStats();
    expect(stats.totalUsers).toBe(10);
    expect(stats.totalPayments).toBe(5);
    expect(stats.totalRevenueMinor).toBe(129800);
    expect(stats.totalRevenueFormatted).toBe('₹1,298');
  });
});
