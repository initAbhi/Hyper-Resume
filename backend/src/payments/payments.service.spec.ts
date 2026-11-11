import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { SandboxPaymentProvider } from './providers/sandbox-payment.provider.js';
import { RazorpayPaymentProvider } from './providers/razorpay-payment.provider.js';
import { DodoPaymentProvider } from './providers/dodo-payment.provider.js';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockPaymentRepo: any;
  let mockUserRepo: any;
  let mockSettingRepo: any;
  let mockCreditsService: any;
  let mockEmailService: any;
  let mockConfigService: any;
  let sandboxProvider: SandboxPaymentProvider;
  let razorpayProvider: RazorpayPaymentProvider;
  let dodoProvider: DodoPaymentProvider;
  let mockMetaConversionsService: any;

  let claimedSeatCount = 2;

  beforeEach(() => {
    claimedSeatCount = 2;
    mockPaymentRepo = {
      create: vi.fn((data) => ({ id: 'pay-uuid-1', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'pay-uuid-1', ...data })),
      findOne: vi.fn(),
      find: vi.fn(),
      createQueryBuilder: vi.fn(() => ({
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getCount: vi.fn(() => Promise.resolve(claimedSeatCount)),
      })),
    };

    mockUserRepo = {
      findOne: vi.fn().mockResolvedValue({
        id: 'usr-1',
        email: 'user@example.com',
        fullName: 'Tester',
        isLifetimePro: false,
        proExpiresAt: null,
        proPlanId: null,
      }),
      save: vi.fn((data) => Promise.resolve(data)),
    };

    mockSettingRepo = {
      find: vi.fn().mockResolvedValue([
        { key: 'lifetime_promo_enabled', value: 'true' },
        { key: 'lifetime_promo_cap', value: '10' },
      ]),
    };

    mockCreditsService = {
      getBalance: vi.fn().mockResolvedValue(55),
      addTransaction: vi.fn().mockResolvedValue({ id: 'tx-1', amount: 50 }),
    };

    mockEmailService = {
      sendPurchaseConfirmation: vi.fn().mockResolvedValue({ success: true }),
    };

    mockConfigService = {
      get: vi.fn((key: string, defaultVal?: string) => {
        if (key === 'PAYMENT_WEBHOOK_SECRET') return 'test_webhook_secret';
        if (key === 'NODE_ENV') return 'test';
        return defaultVal;
      }),
    };

    sandboxProvider = new SandboxPaymentProvider();
    razorpayProvider = new RazorpayPaymentProvider(mockConfigService);
    dodoProvider = {
      name: 'dodo',
      getMode: vi.fn().mockReturnValue('test_mode'),
      createOrder: vi.fn().mockResolvedValue({
        providerOrderId: 'cks_dodo_1',
        amountMinor: 39900,
        currency: 'INR',
        provider: 'dodo',
        checkoutUrl: 'https://test.checkout.dodopayments.com/test',
      }),
      verifyOrderStatus: vi.fn().mockResolvedValue({
        verified: true,
        status: 'succeeded',
        providerPaymentId: 'pay_dodo_verified_1',
      }),
      verifyWebhookSignature: vi.fn().mockReturnValue(true),
    } as any;

    mockMetaConversionsService = {
      sendPurchase: vi.fn().mockResolvedValue(true),
      sendInitiateCheckout: vi.fn().mockResolvedValue(true),
    };

    service = new PaymentsService(
      mockPaymentRepo,
      mockUserRepo,
      mockCreditsService,
      mockEmailService,
      mockConfigService,
      sandboxProvider,
      razorpayProvider,
      dodoProvider,
      mockMetaConversionsService,
      mockSettingRepo,
    );
  });

  it('should return configured 1-plan Pro options', () => {
    const plans = service.getPlans();
    expect(plans.some((p) => p.id === 'pro_weekly')).toBe(true);
    expect(plans.some((p) => p.id === 'pro_monthly')).toBe(true);
    expect(plans.some((p) => p.id === 'pro_6month')).toBe(true);
    expect(plans.some((p) => p.id === 'pro_lifetime')).toBe(true);
  });

  it('should return authentic Founding Lifetime promo seat count from database', async () => {
    claimedSeatCount = 3;
    const promo = await service.getPromoStatus();
    expect(promo.enabled).toBe(true);
    expect(promo.claimedSeats).toBe(3);
    expect(promo.totalCap).toBe(10);
    expect(promo.remainingSeats).toBe(7);
    expect(promo.isSoldOut).toBe(false);
    expect(promo.priceInr).toBe(999);
    expect(promo.priceUsd).toBe(19);
  });

  it('should block pro_lifetime order creation when founding cap is reached', async () => {
    claimedSeatCount = 10;
    await expect(
      service.createOrder('usr-1', {
        planId: 'pro_lifetime',
        provider: 'sandbox',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should create payment order with server-calculated INR & USD amounts', async () => {
    const inrOrder = await service.createOrder('usr-1', {
      planId: 'pro_weekly',
      currency: 'INR',
      provider: 'sandbox',
    });
    expect(inrOrder.amountMinor).toBe(14900);
    expect(inrOrder.currency).toBe('INR');
    expect(inrOrder.plan.durationDays).toBe(7);

    const usdOrder = await service.createOrder('usr-1', {
      planId: 'pro_6month',
      currency: 'USD',
      provider: 'sandbox',
    });
    expect(usdOrder.amountMinor).toBe(2900);
    expect(usdOrder.currency).toBe('USD');
    expect(usdOrder.plan.durationDays).toBe(180);
  });

  it('should reject invalid or non-payable plan during order creation', async () => {
    await expect(
      service.createOrder('usr-1', {
        planId: 'non_existent_plan',
        provider: 'sandbox',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject unpaid Dodo orders during verifyPayment without granting entitlements', async () => {
    (dodoProvider.verifyOrderStatus as any).mockResolvedValueOnce({
      verified: false,
      status: 'pending',
    });
    mockPaymentRepo.findOne.mockResolvedValue({
      id: 'pay-uuid-1',
      orderId: 'ord-unpaid-1',
      userId: 'usr-1',
      provider: 'dodo',
      providerTransactionId: 'cks_unpaid_1',
      status: 'pending',
      currency: 'INR',
      amountMinor: 39900,
      metadata: {
        planId: 'pro_monthly',
        planName: 'Monthly Pro Pass',
        durationDays: 30,
        isLifetime: false,
        creditsAwarded: 0,
      },
    });

    const result = await service.verifyPayment('usr-1', 'ord-unpaid-1');
    expect(result.verified).toBe(false);
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });

  it('should verify payment against Dodo, activate Pro access, and send receipt email idempotently', async () => {
    mockPaymentRepo.findOne.mockResolvedValue({
      id: 'pay-uuid-1',
      orderId: 'ord-test-123',
      userId: 'usr-1',
      provider: 'dodo',
      providerTransactionId: 'cks_dodo_1',
      status: 'pending',
      currency: 'INR',
      amountMinor: 39900,
      metadata: {
        planId: 'pro_monthly',
        planName: 'Monthly Pro Pass',
        durationDays: 30,
        isLifetime: false,
        creditsAwarded: 0,
      },
    });

    const result = await service.verifyPayment('usr-1', 'ord-test-123', 'pay_tx_123');

    expect(result.verified).toBe(true);
    expect(result.planId).toBe('pro_monthly');
    expect(result.amountMinor).toBe(39900);
    expect(mockUserRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        proPlanId: 'pro_monthly',
      }),
    );
    expect(mockEmailService.sendPurchaseConfirmation).toHaveBeenCalled();
  });

  it('should not re-grant entitlements if payment was already verified', async () => {
    mockPaymentRepo.findOne.mockResolvedValue({
      id: 'pay-uuid-1',
      orderId: 'ord-test-123',
      userId: 'usr-1',
      status: 'succeeded',
      currency: 'INR',
      amountMinor: 99900,
      metadata: {
        planId: 'pro_lifetime',
        planName: 'Founding Lifetime Pass',
        isLifetime: true,
        durationDays: null,
        creditsAwarded: 0,
      },
    });

    const result = await service.verifyPayment('usr-1', 'ord-test-123');

    expect(result.verified).toBe(true);
    expect(result.isLifetime).toBe(true);
    expect(mockUserRepo.save).not.toHaveBeenCalled();
  });

  it('should process dodo payment.succeeded webhook and grant Pro lifetime access', async () => {
    const dodoConfigService = {
      get: vi.fn((key: string, defaultVal?: string) => {
        if (key === 'PAYMENT_PROVIDER') return 'dodo';
        if (key === 'DODO_PAYMENTS_WEBHOOK_KEY') return 'whsec_test_123';
        return defaultVal;
      }),
    };

    const dodoService = new PaymentsService(
      mockPaymentRepo,
      mockUserRepo,
      mockCreditsService,
      mockEmailService,
      dodoConfigService as any,
      sandboxProvider,
      razorpayProvider,
      dodoProvider,
      mockMetaConversionsService,
      mockSettingRepo,
    );

    mockPaymentRepo.findOne.mockResolvedValue({
      id: 'pay-uuid-2',
      orderId: 'ord-dodo-1',
      userId: 'usr-1',
      status: 'pending',
      currency: 'INR',
      amountMinor: 99900,
      metadata: {
        planId: 'pro_lifetime',
        planName: 'Founding Lifetime Pass',
        isLifetime: true,
        durationDays: null,
        creditsAwarded: 0,
      },
    });

    const dodoPayload = {
      type: 'payment.succeeded',
      data: {
        payment_id: 'pay_dodo_123',
        status: 'succeeded',
        metadata: { orderId: 'ord-dodo-1' },
      },
    };

    const result = await dodoService.processWebhook(
      JSON.stringify(dodoPayload),
      'v1,dummy_sig',
      dodoPayload,
      { 'webhook-id': 'msg_1', 'webhook-timestamp': String(Math.floor(Date.now() / 1000)) },
    );

    expect(result.processed).toBe(true);
    expect(mockUserRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        isLifetimePro: true,
        proPlanId: 'pro_lifetime',
        proExpiresAt: null,
      }),
    );
  });

  it('should reject webhook with invalid signature', async () => {
    const invalidSig = 'invalid_signature_xyz';
    const body = {
      event: 'payment.captured',
      orderId: 'ord-test-123',
    };

    await expect(
      service.processWebhook(JSON.stringify(body), invalidSig, body),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should process refund webhook and revert lifetime Pro access', async () => {
    mockUserRepo.findOne.mockResolvedValue({
      id: 'usr-1',
      email: 'user@example.com',
      isLifetimePro: true,
      proPlanId: 'pro_lifetime',
      proExpiresAt: null,
    });
    mockPaymentRepo.findOne.mockResolvedValue({
      id: 'pay-uuid-1',
      orderId: 'ord-test-123',
      userId: 'usr-1',
      status: 'succeeded',
      currency: 'INR',
      amountMinor: 99900,
      metadata: {
        planId: 'pro_lifetime',
        isLifetime: true,
        durationDays: null,
        creditsAwarded: 0,
      },
    });

    const validSig = 'sandbox_valid_test_signature';
    const body = {
      event: 'refund.processed',
      orderId: 'ord-test-123',
    };

    const webhookResult = await service.processWebhook(
      JSON.stringify(body),
      validSig,
      body,
    );

    expect(webhookResult.processed).toBe(true);
    expect(mockUserRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        isLifetimePro: false,
        proPlanId: null,
      }),
    );
  });
});
