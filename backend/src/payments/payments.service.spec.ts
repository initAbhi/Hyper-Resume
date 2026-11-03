import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { SandboxPaymentProvider } from './providers/sandbox-payment.provider.js';
import { RazorpayPaymentProvider } from './providers/razorpay-payment.provider.js';
import { DodoPaymentProvider } from './providers/dodo-payment.provider.js';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockPaymentRepo: any;
  let mockUserRepo: any;
  let mockCreditsService: any;
  let mockEmailService: any;
  let mockConfigService: any;
  let sandboxProvider: SandboxPaymentProvider;
  let razorpayProvider: RazorpayPaymentProvider;
  let dodoProvider: DodoPaymentProvider;
  let mockMetaConversionsService: any;

  beforeEach(() => {
    mockPaymentRepo = {
      create: vi.fn((data) => ({ id: 'pay-uuid-1', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'pay-uuid-1', ...data })),
      findOne: vi.fn(),
      find: vi.fn(),
    };

    mockUserRepo = {
      findOne: vi.fn().mockResolvedValue({ id: 'usr-1', email: 'user@example.com', fullName: 'Tester' }),
    };

    mockCreditsService = {
      getBalance: vi.fn().mockResolvedValue(35),
      addTransaction: vi.fn().mockResolvedValue({ id: 'tx-1', amount: 30 }),
    };

    mockEmailService = {
      sendPurchaseConfirmation: vi.fn().mockResolvedValue({ success: true }),
    };

    mockConfigService = {
      get: vi.fn((key: string, defaultVal?: string) => {
        if (key === 'PAYMENT_WEBHOOK_SECRET') return 'test_webhook_secret';
        if (key === 'NODE_ENV') return 'development';
        return defaultVal;
      }),
    };

    sandboxProvider = new SandboxPaymentProvider();
    razorpayProvider = new RazorpayPaymentProvider();
    dodoProvider = {
      name: 'dodo',
      createOrder: vi.fn().mockResolvedValue({
        providerOrderId: 'dodo_pay_1',
        amountMinor: 39900,
        currency: 'INR',
        provider: 'dodo',
        checkoutUrl: 'https://test.checkout.dodopayments.com/test',
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
    );
  });

  it('should return configured pricing plans', () => {
    const plans = service.getPlans();
    expect(plans.length).toBeGreaterThanOrEqual(3);
    expect(plans.some((p) => p.id === 'job_hunt_pack')).toBe(true);
    expect(plans.some((p) => p.id === 'job_hunt_pro')).toBe(true);
  });

  it('should create payment order with server-calculated amounts', async () => {
    const order = await service.createOrder('usr-1', {
      planId: 'job_hunt_pack',
      provider: 'sandbox',
    });

    expect(order.orderId).toBeDefined();
    expect(order.amountMinor).toBe(39900); // ₹399
    expect(order.currency).toBe('INR');
    expect(order.plan.credits).toBe(30);
    expect(mockPaymentRepo.save).toHaveBeenCalled();
  });

  it('should reject invalid or non-payable plan during order creation', async () => {
    await expect(
      service.createOrder('usr-1', {
        planId: 'non_existent_plan',
        provider: 'sandbox',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should verify payment, award credits, and send receipt email idempotently', async () => {
    mockPaymentRepo.findOne.mockResolvedValue({
      id: 'pay-uuid-1',
      orderId: 'ord-test-123',
      userId: 'usr-1',
      status: 'pending',
      amountMinor: 39900,
      metadata: { planId: 'job_hunt_pack', creditsAwarded: 30, planName: 'Job Hunt Pack' },
    });

    const result = await service.verifyPayment('usr-1', 'ord-test-123', 'pay_tx_123');

    expect(result.verified).toBe(true);
    expect(mockCreditsService.addTransaction).toHaveBeenCalledWith(
      'usr-1',
      30,
      'purchase',
      expect.stringContaining('purchase-'),
      expect.any(String),
      expect.any(Object),
    );
    expect(mockEmailService.sendPurchaseConfirmation).toHaveBeenCalled();
  });

  it('should not award duplicate credits if payment was already verified', async () => {
    mockPaymentRepo.findOne.mockResolvedValue({
      id: 'pay-uuid-1',
      orderId: 'ord-test-123',
      userId: 'usr-1',
      status: 'succeeded',
      metadata: { creditsAwarded: 30 },
    });

    const result = await service.verifyPayment('usr-1', 'ord-test-123');

    expect(result.verified).toBe(true);
    expect(mockCreditsService.addTransaction).not.toHaveBeenCalled();
  });

  it('should process webhook and grant credits for payment.captured event', async () => {
    mockPaymentRepo.findOne.mockResolvedValue({
      id: 'pay-uuid-1',
      orderId: 'ord-test-123',
      userId: 'usr-1',
      status: 'pending',
      metadata: { planName: 'Job Hunt Pack', creditsAwarded: 30 },
    });

    const validSig = 'sandbox_valid_test_signature';
    const body = {
      event: 'payment.captured',
      orderId: 'ord-test-123',
    };

    const webhookResult = await service.processWebhook(
      JSON.stringify(body),
      validSig,
      body,
    );

    expect(webhookResult.processed).toBe(true);
    expect(mockCreditsService.addTransaction).toHaveBeenCalledWith(
      'usr-1',
      30,
      'purchase',
      expect.any(String),
      expect.any(String),
      expect.any(Object),
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

  it('should process refund webhook and revert granted credits', async () => {
    mockPaymentRepo.findOne.mockResolvedValue({
      id: 'pay-uuid-1',
      orderId: 'ord-test-123',
      userId: 'usr-1',
      status: 'succeeded',
      metadata: { creditsAwarded: 30 },
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
    expect(mockCreditsService.addTransaction).toHaveBeenCalledWith(
      'usr-1',
      -30, // negative amount to revert credits
      'refund',
      expect.stringContaining('refund-payment-'),
      expect.any(String),
      expect.any(Object),
    );
  });

  it('should initialize Dodo provider when configured and return checkoutUrl', async () => {
    const dodoConfigService = {
      get: vi.fn((key: string, defaultVal?: string) => {
        if (key === 'PAYMENT_PROVIDER') return 'dodo';
        if (key === 'DODO_PAYMENTS_API_KEY') return 'dodo_test_key_123';
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
    );

    const result = await dodoService.createOrder('usr-1', { planId: 'job_hunt_pack' });

    expect(result.provider).toBe('dodo');
    expect(result.checkoutUrl).toBe('https://test.checkout.dodopayments.com/test');
    expect(dodoProvider.createOrder).toHaveBeenCalledWith(
      expect.stringMatching(/^ord_/),
      39900,
      'INR',
      expect.objectContaining({ userId: 'usr-1', email: 'user@example.com' }),
    );
  });

  it('should process dodo payment.succeeded webhook and award credits', async () => {
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
    );

    mockPaymentRepo.findOne.mockResolvedValue({
      id: 'pay-uuid-2',
      orderId: 'ord-dodo-1',
      userId: 'usr-1',
      status: 'pending',
      amountMinor: 39900,
      metadata: { creditsAwarded: 30, planName: 'Job Hunt Pack' },
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
    expect(mockCreditsService.addTransaction).toHaveBeenCalledWith(
      'usr-1',
      30,
      'purchase',
      expect.stringContaining('purchase-'),
      expect.stringContaining('Job Hunt Pack'),
      expect.any(Object),
    );
  });
});
