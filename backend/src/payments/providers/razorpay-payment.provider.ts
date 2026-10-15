import { Injectable, Logger } from '@nestjs/common';
import crypto from 'node:crypto';
import type { PaymentOrderOutput, PaymentProvider } from './payment-provider.interface.js';

@Injectable()
export class RazorpayPaymentProvider implements PaymentProvider {
  readonly name = 'razorpay';
  private readonly logger = new Logger(RazorpayPaymentProvider.name);

  async createOrder(
    orderId: string,
    amountMinor: number,
    currency: string,
    metadata?: Record<string, unknown>,
  ): Promise<PaymentOrderOutput> {
    const providerOrderId = `rzp_order_${orderId}`;
    this.logger.log(`Created Razorpay payment order: ${providerOrderId} for ${amountMinor} ${currency}`);

    return {
      providerOrderId,
      amountMinor,
      currency,
      provider: this.name,
      metadata,
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

      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }
}
