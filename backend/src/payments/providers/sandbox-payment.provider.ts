import { Injectable, Logger } from '@nestjs/common';
import crypto from 'node:crypto';
import type { PaymentOrderOutput, PaymentProvider } from './payment-provider.interface.js';

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

  verifyWebhookSignature(
    rawPayload: string | Buffer,
    signature: string,
    secret: string,
  ): boolean {
    if (!signature) return false;

    // Sandbox signature verification: validates HMAC-SHA256 with sandbox secret, or accepts valid test token
    if (signature === 'sandbox_valid_test_signature') {
      return true;
    }

    const payloadString = Buffer.isBuffer(rawPayload) ? rawPayload.toString('utf-8') : rawPayload;
    const expected = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
    return expected === signature;
  }
}
