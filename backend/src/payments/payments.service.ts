import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';
import { Payment } from './entities/payment.entity.js';
import { User } from '../users/entities/user.entity.js';
import { SystemSetting } from '../admin/entities/system-setting.entity.js';
import { CreditsService } from '../credits/credits.service.js';
import { EmailService } from '../email/email.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import {
  formatMinorAmount,
  normalizeCurrency,
  PlanConfig,
  PRICING_PLANS,
  resolvePlanPricing,
  SupportedCurrency,
} from './pricing-plans.js';
import type {
  PaymentProvider,
  PaymentProviderType,
} from './providers/payment-provider.interface.js';
import { SandboxPaymentProvider } from './providers/sandbox-payment.provider.js';
import { RazorpayPaymentProvider } from './providers/razorpay-payment.provider.js';
import { DodoPaymentProvider } from './providers/dodo-payment.provider.js';
import { MetaConversionsService } from './meta-conversions.service.js';

export interface RequestMetaContext {
  clientIp?: string;
  clientUserAgent?: string;
  sourceUrl?: string;
}

export interface LifetimePromoStatus {
  enabled: boolean;
  planId: 'pro_lifetime';
  priceInr: number;
  priceUsd: number;
  claimedSeats: number;
  totalCap: number;
  remainingSeats: number;
  isSoldOut: boolean;
  bannerText?: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly activeProvider: PaymentProvider;
  private readonly webhookSecret: string;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly creditsService: CreditsService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly sandboxProvider: SandboxPaymentProvider,
    private readonly razorpayProvider: RazorpayPaymentProvider,
    private readonly dodoProvider: DodoPaymentProvider,
    private readonly metaConversionsService: MetaConversionsService,
    @Optional()
    @InjectRepository(SystemSetting)
    private readonly settingRepository?: Repository<SystemSetting>,
    @Optional()
    private readonly dataSource?: DataSource,
  ) {
    const configuredProvider = this.configService.get<string>('PAYMENT_PROVIDER');
    const hasDodoKey = Boolean(
      this.configService.get<string>('DODO_PAYMENTS_TEST_API_KEY') ||
        this.configService.get<string>('DODO_PAYMENTS_LIVE_API_KEY') ||
        this.configService.get<string>('DODO_PAYMENTS_API_KEY'),
    );
    const isLiveRazorpay =
      Boolean(this.configService.get<string>('RAZORPAY_KEY_SECRET')) &&
      this.configService.get<string>('NODE_ENV') === 'production';

    if (configuredProvider === 'dodo' || (configuredProvider !== 'sandbox' && hasDodoKey)) {
      this.activeProvider = this.dodoProvider;
    } else if (configuredProvider === 'razorpay' || isLiveRazorpay) {
      this.activeProvider = this.razorpayProvider;
    } else {
      this.activeProvider = this.sandboxProvider;
    }

    const dodoWebhookKey = (
      this.configService.get<string>('DODO_PAYMENTS_WEBHOOK_KEY') ||
      this.configService.get<string>('DODO_PAYMENTS_TEST_WEBHOOK_KEY') ||
      this.configService.get<string>('DODO_PAYMENTS_LIVE_WEBHOOK_KEY') ||
      ''
    ).trim();

    this.webhookSecret =
      dodoWebhookKey || this.configService.get<string>('PAYMENT_WEBHOOK_SECRET') || '';

    this.logger.log(`Payments initialized with provider: ${this.activeProvider.name}`);
  }

  getPlans(): PlanConfig[] {
    return Object.values(PRICING_PLANS);
  }

  /**
   * Computes authentic database-backed Founding Lifetime Offer status.
   */
  async getPromoStatus(): Promise<LifetimePromoStatus> {
    let enabled = true;
    let totalCap = 10;
    let bannerText: string | undefined;

    if (this.settingRepository) {
      const settings = await this.settingRepository.find({
        where: [
          { key: 'lifetime_promo_enabled' },
          { key: 'lifetime_promo_cap' },
          { key: 'lifetime_promo_banner_text' },
        ],
      });
      const map = new Map(settings.map((s) => [s.key, s.value]));
      if (map.has('lifetime_promo_enabled')) {
        enabled = map.get('lifetime_promo_enabled') !== 'false';
      }
      if (map.has('lifetime_promo_cap')) {
        const parsed = parseInt(map.get('lifetime_promo_cap') || '10', 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
          totalCap = parsed;
        }
      }
      if (map.has('lifetime_promo_banner_text') && map.get('lifetime_promo_banner_text')?.trim()) {
        bannerText = map.get('lifetime_promo_banner_text')!.trim();
      }
    }

    let claimedSeats = 0;
    if (typeof this.paymentRepository.createQueryBuilder === 'function') {
      claimedSeats = await this.paymentRepository
        .createQueryBuilder('p')
        .where('p.status = :status', { status: 'succeeded' })
        .andWhere("p.metadata ->> 'planId' = :planId", { planId: 'pro_lifetime' })
        .getCount();
    }

    const remainingSeats = Math.max(0, totalCap - claimedSeats);
    const isSoldOut = remainingSeats <= 0;

    return {
      enabled,
      planId: 'pro_lifetime',
      priceInr: 999,
      priceUsd: 19,
      claimedSeats,
      totalCap,
      remainingSeats,
      isSoldOut,
      bannerText,
    };
  }

  private getProviderByName(name?: string): PaymentProvider {
    if (name === 'dodo') return this.dodoProvider;
    if (name === 'razorpay') return this.razorpayProvider;
    if (name === 'sandbox') return this.sandboxProvider;
    return this.activeProvider;
  }

  async createOrder(
    userId: string,
    dto: CreateOrderDto,
    context?: RequestMetaContext,
  ): Promise<{
    orderId: string;
    providerOrderId: string;
    amountMinor: number;
    currency: SupportedCurrency;
    provider: string;
    checkoutUrl?: string;
    plan: PlanConfig;
  }> {
    const resolved = resolvePlanPricing(dto.planId, dto.currency);
    if (!resolved || resolved.amountMinor <= 0) {
      throw new BadRequestException('Invalid or non-payable plan selected');
    }

    const { plan, amountMinor, currency } = resolved;

    if (plan.id === 'pro_lifetime') {
      const promo = await this.getPromoStatus();
      if (!promo.enabled || promo.isSoldOut) {
        throw new ConflictException(
          'Founding Lifetime Offer seats are currently unavailable. Please choose our 1 Week, 1 Month, or 6 Month Pro pass.',
        );
      }
    }

    const selectedProvider =
      dto.provider && process.env.NODE_ENV === 'test'
        ? this.getProviderByName(dto.provider)
        : dto.provider && this.activeProvider.name === 'sandbox'
        ? this.getProviderByName(dto.provider)
        : this.activeProvider;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const orderId = `ord_${crypto.randomBytes(12).toString('hex')}`;
    const idempotencyKey = `idemp_${orderId}`;

    const providerOrder = await selectedProvider.createOrder(orderId, amountMinor, currency, {
      userId,
      planId: plan.id,
      email: user?.email,
      fullName: user?.fullName,
    });

    const payment = this.paymentRepository.create({
      userId,
      provider: selectedProvider.name as PaymentProviderType,
      providerTransactionId: providerOrder.providerOrderId,
      orderId,
      amountMinor,
      currency,
      status: 'pending',
      idempotencyKey,
      metadata: {
        planId: plan.id,
        planName: plan.name,
        creditsAwarded: plan.credits,
        durationDays: plan.durationDays,
        isLifetime: plan.isLifetime,
        currency,
        environmentMode:
          (providerOrder.metadata?.environmentMode as string) ||
          (selectedProvider.name === 'dodo' ? this.dodoProvider.getMode() : 'sandbox'),
        checkoutUrl: providerOrder.checkoutUrl,
        clientIp: context?.clientIp,
        clientUserAgent: context?.clientUserAgent,
        sourceUrl: context?.sourceUrl,
      },
    });

    await this.paymentRepository.save(payment);

    // Server-side Meta Conversions API InitiateCheckout event with hashed email + client IP/UA
    this.metaConversionsService
      .sendInitiateCheckout({
        orderId,
        planId: plan.id,
        planName: plan.name,
        amountMinor,
        currency,
        userData: {
          email: user?.email,
          userId,
          clientIp: context?.clientIp,
          clientUserAgent: context?.clientUserAgent,
          sourceUrl: context?.sourceUrl,
        },
      })
      .catch((err) => this.logger.warn(`Meta CAPI initiate checkout failed: ${err.message}`));

    return {
      orderId,
      providerOrderId: providerOrder.providerOrderId,
      amountMinor,
      currency,
      provider: selectedProvider.name,
      checkoutUrl: providerOrder.checkoutUrl,
      plan,
    };
  }

  async verifyPayment(
    userId: string,
    orderId: string,
    providerPaymentId?: string,
    context?: RequestMetaContext,
  ): Promise<{
    verified: boolean;
    status: string;
    paymentId: string;
    orderId: string;
    planId: string;
    planName: string;
    amountMinor: number;
    currency: SupportedCurrency;
    durationDays: number | null;
    isLifetime: boolean;
    creditsAwarded: number;
    proExpiresAt: Date | null;
    balance: number;
  }> {
    const payment = await this.paymentRepository.findOne({
      where: { orderId, userId },
    });

    if (!payment) {
      throw new NotFoundException('Payment order not found for this user');
    }

    const meta = (payment.metadata || {}) as Record<string, any>;
    const planId = String(meta.planId || 'pro_monthly');
    const planConfig = PRICING_PLANS[planId];
    const planName = String(meta.planName || planConfig?.name || 'HypeResume Pro');
    const currency = normalizeCurrency(payment.currency);
    const creditsAwarded = Number(meta.creditsAwarded ?? planConfig?.credits ?? 0);
    const durationDays =
      meta.durationDays !== undefined
        ? (meta.durationDays as number | null)
        : planConfig?.durationDays ?? 30;
    const isLifetime = Boolean(meta.isLifetime ?? planConfig?.isLifetime ?? false);

    // Idempotent completion check
    if (payment.status === 'succeeded') {
      const [balance, user] = await Promise.all([
        this.creditsService.getBalance(userId),
        this.userRepository.findOne({ where: { id: userId } }),
      ]);
      return {
        verified: true,
        status: 'succeeded',
        paymentId: payment.id,
        orderId: payment.orderId,
        planId,
        planName,
        amountMinor: payment.amountMinor,
        currency,
        durationDays,
        isLifetime,
        creditsAwarded,
        proExpiresAt: user?.proExpiresAt || null,
        balance,
      };
    }

    // Authoritative Gateway Verification — NEVER blindly approve unpaid orders
    const provider = this.getProviderByName(payment.provider);
    if (provider.verifyOrderStatus) {
      const verification = await provider.verifyOrderStatus(
        payment.providerTransactionId,
        providerPaymentId,
        meta.environmentMode as string | undefined,
      );

      if (!verification.verified) {
        const balance = await this.creditsService.getBalance(userId);
        return {
          verified: false,
          status: verification.status || payment.status,
          paymentId: payment.id,
          orderId: payment.orderId,
          planId,
          planName,
          amountMinor: payment.amountMinor,
          currency,
          durationDays,
          isLifetime,
          creditsAwarded: 0,
          proExpiresAt: null,
          balance,
        };
      }

      if (verification.providerPaymentId) {
        providerPaymentId = verification.providerPaymentId;
      }
    } else if (process.env.NODE_ENV !== 'test') {
      const balance = await this.creditsService.getBalance(userId);
      return {
        verified: false,
        status: payment.status,
        paymentId: payment.id,
        orderId: payment.orderId,
        planId,
        planName,
        amountMinor: payment.amountMinor,
        currency,
        durationDays,
        isLifetime,
        creditsAwarded: 0,
        proExpiresAt: null,
        balance,
      };
    }

    const updatedUser = await this.captureSucceededPayment(
      payment,
      providerPaymentId,
      `Payment confirmed: ${planName} (Order: ${payment.orderId})`,
      context,
    );

    const newBalance = await this.creditsService.getBalance(userId);
    return {
      verified: true,
      status: 'succeeded',
      paymentId: payment.id,
      orderId: payment.orderId,
      planId,
      planName,
      amountMinor: payment.amountMinor,
      currency,
      durationDays,
      isLifetime,
      creditsAwarded,
      proExpiresAt: updatedUser?.proExpiresAt || null,
      balance: newBalance,
    };
  }

  /**
   * Atomically captures a verified payment, awards credits, and unlocks time-based/lifetime Pro access.
   */
  private async captureSucceededPayment(
    payment: Payment,
    providerTxId: string | undefined,
    creditDescription: string,
    context?: RequestMetaContext,
  ): Promise<User | null> {
    const meta = (payment.metadata || {}) as Record<string, any>;
    const planId = String(meta.planId || 'pro_monthly');
    const planConfig = PRICING_PLANS[planId];
    const planName = String(meta.planName || planConfig?.name || 'HypeResume Pro');
    const creditsAwarded = Number(meta.creditsAwarded ?? planConfig?.credits ?? 0);
    const durationDays =
      meta.durationDays !== undefined
        ? (meta.durationDays as number | null)
        : planConfig?.durationDays ?? 30;
    const isLifetime = Boolean(meta.isLifetime ?? planConfig?.isLifetime ?? false);

    const applyInManager = async (manager?: EntityManager): Promise<{ capturedNow: boolean; user: User | null }> => {
      const pRepo = manager ? manager.getRepository(Payment) : this.paymentRepository;
      const uRepo = manager ? manager.getRepository(User) : this.userRepository;

      const freshPayment = await pRepo.findOne({ where: { id: payment.id } });
      if (freshPayment?.status === 'succeeded') {
        const existingUser = await uRepo.findOne({ where: { id: payment.userId } });
        return { capturedNow: false, user: existingUser };
      }

      payment.status = 'succeeded';
      if (providerTxId && providerTxId.trim()) {
        payment.providerTransactionId = providerTxId.trim();
      }
      await pRepo.save(payment);

      let user = await uRepo.findOne({ where: { id: payment.userId } });
      if (user) {
        if (isLifetime) {
          user.isLifetimePro = true;
          user.proPlanId = 'pro_lifetime';
          user.proExpiresAt = null;
          await uRepo.save(user);
        } else if (durationDays && durationDays > 0) {
          const now = new Date();
          const currentExpiry =
            user.proExpiresAt && new Date(user.proExpiresAt) > now
              ? new Date(user.proExpiresAt)
              : now;
          user.proExpiresAt = new Date(currentExpiry.getTime() + durationDays * 24 * 60 * 60 * 1000);
          user.proPlanId = planId;
          await uRepo.save(user);
        }
      }

      if (creditsAwarded > 0) {
        await this.creditsService.addTransaction(
          payment.userId,
          creditsAwarded,
          'purchase',
          `purchase-${payment.id}`,
          creditDescription,
          { orderId: payment.orderId, providerTransactionId: payment.providerTransactionId },
          manager,
        );
      }

      return { capturedNow: true, user };
    };

    const { capturedNow, user } = this.dataSource
      ? await this.dataSource.transaction((manager) => applyInManager(manager))
      : await applyInManager(undefined);

    if (!capturedNow) {
      return user;
    }

    const currency = normalizeCurrency(payment.currency);
    if (user?.email) {
      const formattedAmount = formatMinorAmount(payment.amountMinor, currency);
      this.emailService
        .sendPurchaseConfirmation(
          user.email,
          payment.orderId,
          planName,
          formattedAmount,
          creditsAwarded,
        )
        .catch((err) => this.logger.error(`Failed to send receipt email: ${err.message}`));
    }

    this.metaConversionsService
      .sendPurchase({
        orderId: payment.orderId,
        amountMinor: payment.amountMinor,
        currency,
        planName,
        userData: {
          email: user?.email,
          userId: payment.userId,
          clientIp: context?.clientIp || (meta.clientIp as string | undefined),
          clientUserAgent:
            context?.clientUserAgent || (meta.clientUserAgent as string | undefined),
          sourceUrl: context?.sourceUrl || (meta.sourceUrl as string | undefined),
        },
      })
      .catch((err) => this.logger.warn(`Meta CAPI purchase event failed: ${err.message}`));

    return user;
  }

  async processWebhook(
    rawPayload: string | Buffer,
    signature: string,
    body: any,
    headers?: Record<string, string | string[] | undefined>,
  ): Promise<{ processed: boolean; paymentId?: string; message: string }> {
    const isSignatureValid = this.activeProvider.verifyWebhookSignature(
      rawPayload,
      signature,
      this.webhookSecret,
      headers,
    );

    if (!isSignatureValid) {
      throw new UnauthorizedException('Invalid or unverified webhook signature');
    }

    const eventType = body?.type || body?.event || '';
    const data = body?.data || {};

    const providerTxId =
      body?.providerTransactionId || data?.payment_id || data?.session_id;
    const sessionId = data?.checkout_session_id || data?.session_id;
    const orderId = body?.orderId || data?.metadata?.orderId;

    let payment: Payment | null = null;
    if (orderId) {
      payment = await this.paymentRepository.findOne({ where: { orderId } });
    }
    if (!payment && sessionId) {
      payment = await this.paymentRepository.findOne({
        where: { providerTransactionId: sessionId },
      });
    }
    if (!payment && providerTxId) {
      payment = await this.paymentRepository.findOne({
        where: { providerTransactionId: providerTxId },
      });
    }

    if (!payment) {
      throw new NotFoundException('Payment transaction referenced in webhook not found');
    }

    const isSuccessEvent =
      eventType === 'payment.succeeded' ||
      eventType === 'payment.captured' ||
      eventType === 'order.paid';

    if (payment.status === 'succeeded' && isSuccessEvent) {
      return { processed: true, paymentId: payment.id, message: 'Already processed' };
    }

    if (isSuccessEvent) {
      const meta = (payment.metadata || {}) as Record<string, any>;
      const planName = String(meta.planName || PRICING_PLANS[meta.planId]?.name || 'HypeResume Pro');
      await this.captureSucceededPayment(
        payment,
        providerTxId,
        `Webhook verified: ${planName} (${payment.orderId})`,
      );
      return {
        processed: true,
        paymentId: payment.id,
        message: 'Payment captured and Pro access activated',
      };
    }

    if (eventType === 'payment.failed') {
      payment.status = 'failed';
      await this.paymentRepository.save(payment);
      return { processed: true, paymentId: payment.id, message: 'Payment marked failed' };
    }

    if (eventType === 'refund.processed' || eventType === 'refund.succeeded') {
      const meta = (payment.metadata || {}) as Record<string, any>;
      const creditsToRevert = Number(meta.creditsAwarded ?? 0);
      const isLifetime = Boolean(meta.isLifetime);
      const durationDays = Number(meta.durationDays ?? 0);

      payment.status = 'refunded';
      await this.paymentRepository.save(payment);

      const user = await this.userRepository.findOne({ where: { id: payment.userId } });
      if (user) {
        if (isLifetime) {
          user.isLifetimePro = false;
          user.proPlanId = null;
        } else if (durationDays > 0 && user.proExpiresAt) {
          const reduced = new Date(user.proExpiresAt).getTime() - durationDays * 86400000;
          user.proExpiresAt = reduced > Date.now() ? new Date(reduced) : null;
          if (!user.proExpiresAt) user.proPlanId = null;
        }
        await this.userRepository.save(user);
      }

      if (creditsToRevert > 0) {
        await this.creditsService.addTransaction(
          payment.userId,
          -creditsToRevert,
          'refund',
          `refund-payment-${payment.id}`,
          `Reversal due to payment refund: ${payment.orderId}`,
          { orderId: payment.orderId },
        );
      }

      return {
        processed: true,
        paymentId: payment.id,
        message: 'Refund processed and entitlements reverted',
      };
    }

    return {
      processed: true,
      paymentId: payment.id,
      message: `Event ${eventType} acknowledged`,
    };
  }

  async getPaymentHistory(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
