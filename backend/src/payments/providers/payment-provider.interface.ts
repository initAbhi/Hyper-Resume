export interface PaymentOrderOutput {
  providerOrderId: string;
  amountMinor: number;
  currency: string;
  provider: string;
  checkoutUrl?: string;
  metadata?: Record<string, unknown>;
}

export type PaymentProviderType = 'dodo' | 'razorpay' | 'stripe' | 'mock' | 'sandbox';

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
    headers?: Record<string, string | string[] | undefined>,
  ): boolean;
}
