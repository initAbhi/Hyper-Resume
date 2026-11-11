import { Injectable, Logger } from '@nestjs/common';
import crypto from 'node:crypto';
import type {
  PaymentOrderOutput,
  PaymentProvider,
  PaymentVerificationResult,
} from './payment-provider.interface.js';

@Injectable()
export class SandboxPaymentProvider implements PaymentProvider {
  readonly name = 'sandbox';
  private readonly logger = new Logger(SandboxPaymentProvider.name);

  async createOrder(
    orderId: string,
    amountMinor: number,
    currency: string,
    metadata?: Record<string, unknown>,
  ): Promise<PaymentOrderOutput> {
    const providerOrderId = `sbx_order_${orderId}`;
    this.logger.log(`Created sandbox payment order: ${providerOrderId} for ${amountMinor} ${currency}`);

    return {
      providerOrderId,
      amountMinor,
      currency,
      provider: this.name,
      metadata,
    };
  }

  async verifyOrderStatus(
    providerOrderId: string,
    providerPaymentId?: string,
  ): Promise<PaymentVerificationResult> {
    if (process.env.NODE_ENV === 'test') {
      return {
        verified: true,
        status: 'succeeded',
        providerPaymentId: providerPaymentId || providerOrderId,
      };
    }

    return {
      verified: false,
      status: 'pending_webhook',
    };
  }

  verifyWebhookSignature(
    rawPayload: string | Buffer,
    signature: string,
    secret: string,
  ): boolean {
    if (!signature) return false;

    // Test suite convenience token is strictly restricted to NODE_ENV === 'test'
    if (process.env.NODE_ENV === 'test' && signature === 'sandbox_valid_test_signature') {
      return true;
    }

    if (!secret) return false;

    const payloadString = Buffer.isBuffer(rawPayload) ? rawPayload.toString('utf-8') : rawPayload;
    const expected = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
    if (signature.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }
}
