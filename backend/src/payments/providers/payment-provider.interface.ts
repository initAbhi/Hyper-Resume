export interface PaymentOrderOutput {
  providerOrderId: string;
  amountMinor: number;
  currency: string;
  provider: string;
  metadata?: Record<string, unknown>;
}

export type PaymentProviderType = 'razorpay' | 'stripe' | 'mock' | 'sandbox';

export interface PaymentProvider {
  readonly name: PaymentProviderType;

  createOrder(
    orderId: string,
    amountMinor: number,
    currency: string,
    metadata?: Record<string, unknown>,
  ): Promise<PaymentOrderOutput>;

  verifyWebhookSignature(
    rawPayload: string | Buffer,
    signature: string,
    secret: string,
  ): boolean;
}
