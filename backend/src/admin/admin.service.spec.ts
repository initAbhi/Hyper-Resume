import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AdminService } from './admin.service.js';

describe('AdminService', () => {
  let service: AdminService;
  let mockSettingRepo: any;
  let mockUserRepo: any;
  let mockPaymentRepo: any;
  let mockResumeRepo: any;
  let mockDodoProvider: any;

  let settingsStore: Map<string, any>;

  beforeEach(() => {
    settingsStore = new Map();
    mockSettingRepo = {
      findOne: vi.fn(({ where }: any) => Promise.resolve(settingsStore.get(where?.key) || null)),
      create: vi.fn((data) => ({ ...data })),
      save: vi.fn((data) => {
        if (data?.key) settingsStore.set(data.key, data);
        return Promise.resolve(data);
      }),
    };

    mockUserRepo = {
      count: vi.fn().mockResolvedValue(10),
      findBy: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue(null),
      save: vi.fn((u) => Promise.resolve(u)),
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
      ensureWeeklyProCredits: vi.fn().mockResolvedValue(undefined),
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

  it('should return real zero-based analytics overview instead of hardcoded synthetic traffic', async () => {
    const analytics = await service.getAnalyticsOverview();
    expect(analytics.overview.uniqueVisitors).toBe(0);
    expect(analytics.overview.pageViews).toBe(0);
    expect(analytics.overview.landingPageViews).toBe(0);
    expect(analytics.topReferrers).toEqual([]);
    expect(analytics.topCountries).toEqual([]);
    expect(analytics.topPaths).toEqual([]);
    expect(analytics.chartData).toHaveLength(6);
  });

  it('should update Founding Lifetime promo cap and banner copy cleanly', async () => {
    settingsStore.clear();
    const updated = await service.updatePromoSettings({
      enabled: true,
      totalCap: 25,
      bannerText: 'Founding Launch: First 25 Lifetime seats at ₹999',
    });
    expect(updated.totalCap).toBe(25);
    expect(updated.remainingSeats).toBe(25);
    expect(mockSettingRepo.save).toHaveBeenCalled();
  });

  it('should grant lifetime Pro access and trigger weekly Pro credits', async () => {
    const user = {
      id: 'user-1',
      email: 'vip@example.com',
      isLifetimePro: false,
      proPlanId: null,
      proExpiresAt: null,
    };
    mockUserRepo.findOne.mockResolvedValue(user);

    const res = await service.grantUserProAccess('user-1', 'pro_lifetime', undefined, 'Beta VIP');

    expect(res.isLifetimePro).toBe(true);
    expect(res.proPlanId).toBe('pro_lifetime');
    expect(res.proExpiresAt).toBeNull();
    expect(res.hasActivePro).toBe(true);
    expect(mockUserRepo.save).toHaveBeenCalled();
  });

  it('should grant timed Pro access for custom duration and revoke it cleanly', async () => {
    const user = {
      id: 'user-2',
      email: 'tester@example.com',
      isLifetimePro: false,
      proPlanId: null,
      proExpiresAt: null,
    };
    mockUserRepo.findOne.mockResolvedValue(user);

    const granted = await service.grantUserProAccess('user-2', 'custom', 14, 'Creator review');
    expect(granted.proPlanId).toBe('pro_custom');
    expect(granted.isLifetimePro).toBe(false);
    expect(granted.hasActivePro).toBe(true);
    expect(granted.proExpiresAt).toBeInstanceOf(Date);

    const revoked = await service.revokeUserProAccess('user-2');
    expect(revoked.proPlanId).toBeNull();
    expect(revoked.proExpiresAt).toBeNull();
    expect(revoked.isLifetimePro).toBe(false);
    expect(revoked.hasActivePro).toBe(false);
  });
});
