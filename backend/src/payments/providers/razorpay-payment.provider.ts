import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';
import type {
  PaymentOrderOutput,
  PaymentProvider,
  PaymentVerificationResult,
} from './payment-provider.interface.js';

@Injectable()
export class RazorpayPaymentProvider implements PaymentProvider {
  readonly name = 'razorpay';
  private readonly logger = new Logger(RazorpayPaymentProvider.name);
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(private readonly configService?: ConfigService) {
    this.keyId = this.configService?.get<string>('RAZORPAY_KEY_ID')?.trim() || '';
    this.keySecret = this.configService?.get<string>('RAZORPAY_KEY_SECRET')?.trim() || '';
  }

  async createOrder(
    orderId: string,
    amountMinor: number,
    currency: string,
    metadata?: Record<string, unknown>,
  ): Promise<PaymentOrderOutput> {
    if (!this.keyId || !this.keySecret) {
      throw new BadRequestException(
        'Razorpay gateway is not configured on this server. Please use Dodo Payments checkout.',
      );
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountMinor,
        currency: currency?.toUpperCase() === 'USD' ? 'USD' : 'INR',
        receipt: orderId.slice(0, 40),
        notes: {
          orderId,
          planId: String(metadata?.planId || ''),
          userId: String(metadata?.userId || ''),
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown Razorpay error');
      this.logger.error(`Razorpay order creation failed (${response.status}): ${errText}`);
      throw new BadGatewayException('Failed to initialize Razorpay payment order.');
    }

    const data = (await response.json()) as { id: string; amount: number; currency: string };
    return {
      providerOrderId: data.id,
      amountMinor: data.amount,
      currency: data.currency,
      provider: this.name,
      metadata,
    };
  }

  async verifyOrderStatus(
    providerOrderId: string,
    providerPaymentId?: string,
  ): Promise<PaymentVerificationResult> {
    if (!this.keyId || !this.keySecret) {
      return { verified: false, status: 'unconfigured' };
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const targetUrl = providerPaymentId
      ? `https://api.razorpay.com/v1/payments/${encodeURIComponent(providerPaymentId)}`
      : `https://api.razorpay.com/v1/orders/${encodeURIComponent(providerOrderId)}`;

    const response = await fetch(targetUrl, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!response.ok) {
      return { verified: false, status: 'verification_failed' };
    }

    const data = (await response.json()) as {
      id: string;
      status?: string;
      amount?: number;
      currency?: string;
    };
    const isPaid = data.status === 'captured' || data.status === 'paid';
    return {
      verified: isPaid,
      status: data.status || 'pending',
      providerPaymentId: providerPaymentId || data.id,
      amountMinor: data.amount,
      currency: data.currency,
    };
  }

  verifyWebhookSignature(
    rawPayload: string | Buffer,
    signature: string,
    secret: string,
  ): boolean {
    if (!signature || !secret) return false;

    try {
      const payloadString = Buffer.isBuffer(rawPayload) ? rawPayload.toString('utf-8') : rawPayload;
      const expected = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

      if (signature.length !== expected.length) return false;
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }
}
