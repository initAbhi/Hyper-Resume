import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';
import DodoPayments from 'dodopayments';
import type {
  PaymentOrderOutput,
  PaymentProvider,
  PaymentVerificationResult,
} from './payment-provider.interface.js';

export type DodoEnvironmentMode = 'test_mode' | 'live_mode';

export interface DodoSettingsSummary {
  mode: DodoEnvironmentMode;
  provider: string;
  testConfigured: boolean;
  liveConfigured: boolean;
  testApiKeyMasked: string;
  liveApiKeyMasked: string;
  testWebhookKeyMasked: string;
  liveWebhookKeyMasked: string;
  testProducts: Record<string, string>;
  liveProducts: Record<string, string>;
  frontendUrl: string;
}

@Injectable()
export class DodoPaymentProvider implements PaymentProvider {
  readonly name = 'dodo';
  private readonly logger = new Logger(DodoPaymentProvider.name);

  private mode: DodoEnvironmentMode = 'test_mode';
  private testClient: DodoPayments | null = null;
  private liveClient: DodoPayments | null = null;

  private readonly testApiKey: string;
  private readonly liveApiKey: string;
  private readonly testWebhookSecret: string;
  private readonly liveWebhookSecret: string;
  private readonly frontendUrl: string;

  private readonly testProductCatalog: Record<string, string>;
  private readonly liveProductCatalog: Record<string, string>;

  constructor(private readonly configService: ConfigService) {
    this.frontendUrl = (
      this.configService.get<string>('FRONTEND_URL') || 'https://hype-resume.com'
    ).replace(/\/+$/, '');

    // Strict environment configuration only — never embed fallback secret keys in source code
    this.testApiKey = (
      this.configService.get<string>('DODO_PAYMENTS_TEST_API_KEY') ||
      (this.configService.get<string>('DODO_PAYMENTS_ENVIRONMENT') !== 'live_mode'
        ? this.configService.get<string>('DODO_PAYMENTS_API_KEY')
        : '') ||
      ''
    ).trim();

    this.testWebhookSecret = (
      this.configService.get<string>('DODO_PAYMENTS_TEST_WEBHOOK_KEY') ||
      (this.configService.get<string>('DODO_PAYMENTS_ENVIRONMENT') !== 'live_mode'
        ? this.configService.get<string>('DODO_PAYMENTS_WEBHOOK_KEY')
        : '') ||
      ''
    ).trim();

    this.liveApiKey = (
      this.configService.get<string>('DODO_PAYMENTS_LIVE_API_KEY') ||
      (this.configService.get<string>('DODO_PAYMENTS_ENVIRONMENT') === 'live_mode'
        ? this.configService.get<string>('DODO_PAYMENTS_API_KEY')
        : '') ||
      ''
    ).trim();

    this.liveWebhookSecret = (
      this.configService.get<string>('DODO_PAYMENTS_LIVE_WEBHOOK_KEY') ||
      (this.configService.get<string>('DODO_PAYMENTS_ENVIRONMENT') === 'live_mode'
        ? this.configService.get<string>('DODO_PAYMENTS_WEBHOOK_KEY')
        : '') ||
      ''
    ).trim();

    // Public Dodo Product IDs (non-secret catalog identifiers)
    this.testProductCatalog = {
      pro_weekly:
        this.configService.get<string>('DODO_PRODUCT_ID_PRO_WEEKLY') ||
        'pdt_0NrjXNXzQC0qMeRVF1gg6',
      pro_monthly:
        this.configService.get<string>('DODO_PRODUCT_ID_PRO_MONTHLY') ||
        'pdt_0NrjXNbLAgT25sdWEPA6K',
      pro_6month:
        this.configService.get<string>('DODO_PRODUCT_ID_PRO_6MONTH') ||
        'pdt_0NrjXNgBsZIa8w8FejK3Q',
      pro_lifetime:
        this.configService.get<string>('DODO_PRODUCT_ID_PRO_LIFETIME') ||
        'pdt_0NrjXNli5cBsc4SjHICgg',
    };

    this.liveProductCatalog = {
      pro_weekly:
        this.configService.get<string>('DODO_LIVE_PRODUCT_ID_PRO_WEEKLY') ||
        'pdt_0NrjXNubZdqtBlPiv8Q8u',
      pro_monthly:
        this.configService.get<string>('DODO_LIVE_PRODUCT_ID_PRO_MONTHLY') ||
        'pdt_0NrjXNxpn2pqHNXjXYG83',
      pro_6month:
        this.configService.get<string>('DODO_LIVE_PRODUCT_ID_PRO_6MONTH') ||
        'pdt_0NrjXO1SvPVVoVr4Mv4CB',
      pro_lifetime:
        this.configService.get<string>('DODO_LIVE_PRODUCT_ID_PRO_LIFETIME') ||
        'pdt_0NrjXO4hqllHPCBF1LPCY',
    };

    const configuredEnv = this.configService.get<string>('DODO_PAYMENTS_ENVIRONMENT');
    this.mode = configuredEnv === 'live_mode' ? 'live_mode' : 'test_mode';

    this.initClients();
  }

  private initClients() {
    if (this.testApiKey) {
      try {
        this.testClient = new DodoPayments({
          bearerToken: this.testApiKey,
          environment: 'test_mode',
        });
        this.logger.log(`Dodo test client initialized (${this.mask(this.testApiKey)})`);
      } catch (err: unknown) {
        this.logger.error(
          `Failed to initialize Dodo test client: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    } else {
      this.logger.warn('DODO_PAYMENTS_TEST_API_KEY not configured.');
    }

    if (this.liveApiKey) {
      try {
        this.liveClient = new DodoPayments({
          bearerToken: this.liveApiKey,
          environment: 'live_mode',
        });
        this.logger.log(`Dodo live client initialized (${this.mask(this.liveApiKey)})`);
      } catch (err: unknown) {
        this.logger.error(
          `Failed to initialize Dodo live client: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    } else {
      this.logger.warn('DODO_PAYMENTS_LIVE_API_KEY not configured.');
    }

    this.logger.log(`Dodo active mode: ${this.mode}`);
  }

  private mask(str?: string): string {
    if (!str || str.length < 8) return str ? '****' : 'not_configured';
    return `${str.slice(0, 8)}...${str.slice(-4)}`;
  }

  getMode(): DodoEnvironmentMode {
    return this.mode;
  }

  setMode(newMode: DodoEnvironmentMode): void {
    if (newMode !== 'test_mode' && newMode !== 'live_mode') {
      throw new Error(`Invalid Dodo environment mode: ${newMode}`);
    }
    const oldMode = this.mode;
    this.mode = newMode;
    this.logger.log(`Switched Dodo payment mode from ${oldMode} to ${newMode}`);
  }

  getClientForMode(targetMode?: string): DodoPayments {
    const resolvedMode: DodoEnvironmentMode =
      targetMode === 'live_mode' || (!targetMode && this.mode === 'live_mode')
        ? 'live_mode'
        : 'test_mode';
    const client = resolvedMode === 'live_mode' ? this.liveClient : this.testClient;
    if (!client) {
      throw new BadRequestException(
        `Dodo Payments ${resolvedMode} credentials are not configured on the server.`,
      );
    }
    return client;
  }

  getActiveClient(): DodoPayments {
    return this.getClientForMode(this.mode);
  }

  getActiveWebhookSecret(): string {
    return this.mode === 'live_mode' ? this.liveWebhookSecret : this.testWebhookSecret;
  }

  getProductCatalog(targetMode?: DodoEnvironmentMode): Record<string, string> {
    const m = targetMode || this.mode;
    return m === 'live_mode' ? this.liveProductCatalog : this.testProductCatalog;
  }

  getSettingsSummary(): DodoSettingsSummary {
    return {
      mode: this.mode,
      provider: this.name,
      testConfigured: Boolean(this.testApiKey),
      liveConfigured: Boolean(this.liveApiKey),
      testApiKeyMasked: this.mask(this.testApiKey),
      liveApiKeyMasked: this.mask(this.liveApiKey),
      testWebhookKeyMasked: this.mask(this.testWebhookSecret),
      liveWebhookKeyMasked: this.mask(this.liveWebhookSecret),
      testProducts: this.testProductCatalog,
      liveProducts: this.liveProductCatalog,
      frontendUrl: this.frontendUrl,
    };
  }

  async createOrder(
    orderId: string,
    amountMinor: number,
    currency: string,
    metadata?: Record<string, unknown>,
  ): Promise<PaymentOrderOutput> {
    const planId = String(metadata?.planId || 'pro_monthly');
    const catalog = this.getProductCatalog();
    const productId = catalog[planId];
    if (!productId) {
      throw new BadRequestException(`No Dodo product mapping configured for plan "${planId}".`);
    }

    const normalizedCurrency = currency?.toUpperCase() === 'USD' ? 'USD' : 'INR';
    const userEmail =
      (metadata?.email as string) ||
      (metadata?.userEmail as string) ||
      'customer@hype-resume.com';
    const userName =
      (metadata?.fullName as string) ||
      (metadata?.userName as string) ||
      'HypeResume Customer';

    const client = this.getActiveClient();
    const returnUrl = `${this.frontendUrl}/pricing?status=success&orderId=${encodeURIComponent(orderId)}`;
    const cancelUrl = `${this.frontendUrl}/pricing?status=cancelled&orderId=${encodeURIComponent(orderId)}`;

    this.logger.log(
      `Creating Dodo [${this.mode}] checkout session for order ${orderId}, product ${productId}, currency ${normalizedCurrency}`,
    );

    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      billing_currency: normalizedCurrency,
      billing_address: {
        country: normalizedCurrency === 'USD' ? 'US' : 'IN',
      },
      customer: {
        email: userEmail,
        name: userName,
      },
      return_url: returnUrl,
      cancel_url: cancelUrl,
      minimal_address: true,
      show_saved_payment_methods: false,
      feature_flags: {
        allow_currency_selection: true,
      },
      metadata: {
        orderId,
        userId: String(metadata?.userId || ''),
        planId,
        currency: normalizedCurrency,
        environmentMode: this.mode,
      },
    });

    const checkoutUrl =
      session.checkout_url ||
      `https://${this.mode === 'test_mode' ? 'test.' : ''}checkout.dodopayments.com/buy/${productId}`;

    return {
      providerOrderId: session.session_id,
      amountMinor,
      currency: normalizedCurrency,
      provider: this.name,
      checkoutUrl,
      metadata: {
        ...metadata,
        dodoSessionId: session.session_id,
        dodoProductId: productId,
        dodoCheckoutUrl: checkoutUrl,
        environmentMode: this.mode,
      },
    };
  }

  /**
   * Authoritative server-to-server verification against Dodo Payments API.
   * Rejects unpaid, cancelled, failed, or spoofed orders.
   */
  async verifyOrderStatus(
    providerOrderId: string,
    providerPaymentId?: string,
    environmentMode?: string,
  ): Promise<PaymentVerificationResult> {
    const client = this.getClientForMode(environmentMode);

    try {
      let dodoPaymentId = providerPaymentId?.trim() || undefined;
      let sessionStatus: string | null | undefined;

      if (!dodoPaymentId && providerOrderId.startsWith('cks_')) {
        const session = await client.checkoutSessions.retrieve(providerOrderId);
        dodoPaymentId = session.payment_id || undefined;
        sessionStatus = session.payment_status;
      } else if (!dodoPaymentId && providerOrderId.startsWith('pay_')) {
        dodoPaymentId = providerOrderId;
      }

      if (!dodoPaymentId) {
        return {
          verified: false,
          status: sessionStatus || 'pending',
        };
      }

      const payment = await client.payments.retrieve(dodoPaymentId);
      const isSucceeded = payment.status === 'succeeded';

      return {
        verified: isSucceeded,
        status: payment.status || 'pending',
        providerPaymentId: payment.payment_id,
        amountMinor: payment.total_amount,
        currency: payment.currency,
        metadata: payment.metadata as Record<string, unknown>,
      };
    } catch (err: unknown) {
      this.logger.warn(
        `Dodo API status verification failed for ${providerOrderId}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return {
        verified: false,
        status: 'verification_failed',
      };
    }
  }

  verifyWebhookSignature(
    rawPayload: string | Buffer,
    signature: string,
    secret?: string,
    headers?: Record<string, string | string[] | undefined>,
  ): boolean {
    if (!signature) return false;

    const candidateSecrets = [
      secret,
      this.getActiveWebhookSecret(),
      this.liveWebhookSecret,
      this.testWebhookSecret,
    ]
      .filter((s): s is string => Boolean(s && s.trim().length > 0))
      .filter((val, idx, arr) => arr.indexOf(val) === idx);

    for (const candidate of candidateSecrets) {
      if (this.verifyWithSecret(rawPayload, signature, candidate, headers)) {
        return true;
      }
    }

    return false;
  }

  private verifyWithSecret(
    rawPayload: string | Buffer,
    signature: string,
    secret: string,
    headers?: Record<string, string | string[] | undefined>,
  ): boolean {
    if (!secret) return false;

    try {
      const payloadString = Buffer.isBuffer(rawPayload)
        ? rawPayload.toString('utf-8')
        : rawPayload;

      const webhookId = (headers?.['webhook-id'] || headers?.['Webhook-Id']) as string | undefined;
      const webhookTimestamp = (headers?.['webhook-timestamp'] ||
        headers?.['Webhook-Timestamp']) as string | undefined;

      // Standard Webhooks signature verification (v1,<base64>)
      if (webhookId && webhookTimestamp) {
        const ts = parseInt(webhookTimestamp, 10);
        const now = Math.floor(Date.now() / 1000);
        if (isNaN(ts) || Math.abs(now - ts) > 300) {
          this.logger.warn(`Webhook timestamp invalid or out of 5m drift window: ${webhookTimestamp}`);
          return false;
        }

        const cleanSecret = secret.startsWith('whsec_') ? secret.slice(6) : secret;
        const secretBytes = Buffer.from(cleanSecret, 'base64');

        const signedContent = `${webhookId}.${webhookTimestamp}.${payloadString}`;
        const computedSignature = `v1,${crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64')}`;

        const signatures = signature.split(' ');
        for (const sig of signatures) {
          if (
            sig.startsWith('v1,') &&
            sig.length === computedSignature.length &&
            crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(computedSignature))
          ) {
            return true;
          }
        }
      }

      // Direct HMAC-SHA256 hex signature verification
      const expected = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
      if (
        signature.length === expected.length &&
        crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
      ) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}
