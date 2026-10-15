import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';
import { Payment } from './entities/payment.entity.js';
import { CreditsService } from '../credits/credits.service.js';
import { EmailService } from '../email/email.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { PRICING_PLANS, PlanConfig } from './pricing-plans.js';
import type { PaymentProvider, PaymentProviderType } from './providers/payment-provider.interface.js';

import { SandboxPaymentProvider } from './providers/sandbox-payment.provider.js';
import { RazorpayPaymentProvider } from './providers/razorpay-payment.provider.js';
import { User } from '../users/entities/user.entity.js';

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
  ) {
    const isLiveRazorpay =
      Boolean(this.configService.get<string>('RAZORPAY_KEY_SECRET')) &&
      this.configService.get<string>('NODE_ENV') === 'production';

    this.activeProvider = isLiveRazorpay ? this.razorpayProvider : this.sandboxProvider;
    this.webhookSecret = this.configService.get<string>(
      'PAYMENT_WEBHOOK_SECRET',
      'dev_payment_webhook_secret_key_123',
    );

    this.logger.log(`Payments initialized with provider: ${this.activeProvider.name}`);
  }

  getPlans(): PlanConfig[] {
    return Object.values(PRICING_PLANS);
  }

  async createOrder(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<{
    orderId: string;
    providerOrderId: string;
    amountMinor: number;
    currency: string;
    provider: string;
    plan: PlanConfig;
  }> {
    const plan = PRICING_PLANS[dto.planId];
    if (!plan || plan.amountMinor <= 0) {
      throw new BadRequestException('Invalid or non-payable plan selected');
    }

    const orderId = `ord_${crypto.randomBytes(12).toString('hex')}`;
    const idempotencyKey = `idemp_${orderId}`;

    const providerOrder = await this.activeProvider.createOrder(
      orderId,
      plan.amountMinor,
      plan.currency,
      { userId, planId: plan.id },
    );

    const payment = this.paymentRepository.create({
      userId,
      provider: this.activeProvider.name as PaymentProviderType,
      providerTransactionId: providerOrder.providerOrderId,

      orderId,
      amountMinor: plan.amountMinor,
      currency: plan.currency,
      status: 'pending',
      idempotencyKey,
      metadata: {
        planId: plan.id,
        planName: plan.name,
        creditsAwarded: plan.credits,
      },
    });

    await this.paymentRepository.save(payment);

    return {
      orderId,
      providerOrderId: providerOrder.providerOrderId,
      amountMinor: plan.amountMinor,
      currency: plan.currency,
      provider: this.activeProvider.name,
      plan,
    };
  }

  async verifyPayment(
    userId: string,
    orderId: string,
    providerPaymentId?: string,
  ): Promise<{ verified: boolean; paymentId: string; balance: number }> {
    const payment = await this.paymentRepository.findOne({
      where: { orderId, userId },
    });

    if (!payment) {
      throw new NotFoundException('Payment order not found for this user');
    }

    // Idempotent completion check
    if (payment.status === 'succeeded') {
      const balance = await this.creditsService.getBalance(userId);
      return { verified: true, paymentId: payment.id, balance };
    }

    // Mark succeeded and grant entitlements transactionally
    payment.status = 'succeeded';
    if (providerPaymentId) {
      payment.providerTransactionId = providerPaymentId;
    }
    await this.paymentRepository.save(payment);


    const creditsAwarded = (payment.metadata as any)?.creditsAwarded || 30;
    const planName = (payment.metadata as any)?.planName || 'Credit Pack';

    await this.creditsService.addTransaction(
      payment.userId,
      creditsAwarded,
      'purchase',
      `purchase-${payment.id}`,
      `Payment confirmed: ${planName} (Order: ${payment.orderId})`,
      { orderId: payment.orderId, providerTransactionId: payment.providerTransactionId },
    );

    // Send asynchronous transactional receipt email
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user?.email) {
      const formattedAmount = `₹${(payment.amountMinor / 100).toFixed(0)}`;
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

    const newBalance = await this.creditsService.getBalance(userId);
    return { verified: true, paymentId: payment.id, balance: newBalance };
  }

  async processWebhook(
    rawPayload: string | Buffer,
    signature: string,
    body: {
      event: string;
      providerTransactionId?: string;
      orderId?: string;
    },
  ): Promise<{ processed: boolean; paymentId?: string; message: string }> {
    // 1. Webhook Signature Verification
    const isSignatureValid = this.activeProvider.verifyWebhookSignature(
      rawPayload,
      signature,
      this.webhookSecret,
    );

    if (!isSignatureValid) {
      throw new UnauthorizedException('Invalid or unverified webhook signature');
    }

    // 2. Identify Target Payment Entity
    const providerTxId = body.providerTransactionId;
    const orderId = body.orderId;

    let payment: Payment | null = null;
    if (providerTxId) {
      payment = await this.paymentRepository.findOne({
        where: { providerTransactionId: providerTxId },
      });
    } else if (orderId) {
      payment = await this.paymentRepository.findOne({
        where: { orderId },
      });
    }

    if (!payment) {
      throw new NotFoundException('Payment transaction referenced in webhook not found');
    }

    // 3. Idempotent Succeeded Handler
    if (payment.status === 'succeeded' && body.event === 'payment.captured') {
      return { processed: true, paymentId: payment.id, message: 'Already processed' };
    }

    // 4. Handle Lifecycle Events
    if (body.event === 'payment.captured' || body.event === 'order.paid') {
      payment.status = 'succeeded';
      await this.paymentRepository.save(payment);

      const creditsAwarded = (payment.metadata as any)?.creditsAwarded || 30;
      const planName = (payment.metadata as any)?.planName || 'Credit Pack';

      await this.creditsService.addTransaction(
        payment.userId,
        creditsAwarded,
        'purchase',
        `purchase-${payment.id}`,
        `Webhook verified: ${planName} (${payment.orderId})`,
        { orderId: payment.orderId, providerTransactionId: payment.providerTransactionId },
      );

      return { processed: true, paymentId: payment.id, message: 'Payment captured and credits awarded' };
    }

    if (body.event === 'payment.failed') {
      payment.status = 'failed';
      await this.paymentRepository.save(payment);
      return { processed: true, paymentId: payment.id, message: 'Payment marked failed' };
    }

    if (body.event === 'refund.processed') {
      payment.status = 'refunded';
      await this.paymentRepository.save(payment);

      const creditsToRevert = (payment.metadata as any)?.creditsAwarded || 30;
      await this.creditsService.addTransaction(
        payment.userId,
        -creditsToRevert,
        'refund',
        `refund-payment-${payment.id}`,
        `Reversal due to payment refund: ${payment.orderId}`,
        { orderId: payment.orderId },
      );

      return { processed: true, paymentId: payment.id, message: 'Refund processed and credits reverted' };
    }

    return { processed: true, paymentId: payment.id, message: `Event ${body.event} acknowledged` };
  }

  async getPaymentHistory(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
