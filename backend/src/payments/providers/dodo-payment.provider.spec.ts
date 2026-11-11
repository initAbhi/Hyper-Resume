import crypto from 'node:crypto';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DodoPaymentProvider } from './dodo-payment.provider.js';

describe('DodoPaymentProvider', () => {
  let provider: DodoPaymentProvider;
  let mockConfigService: any;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn((key: string, defaultVal?: string) => {
        if (key === 'DODO_PAYMENTS_TEST_API_KEY') return 'dodo_test_mock_key';
        if (key === 'DODO_PAYMENTS_LIVE_API_KEY') return 'dodo_live_mock_key';
        if (key === 'DODO_PAYMENTS_TEST_WEBHOOK_KEY') return 'whsec_dGVzdF9zZWNyZXRfa2V5XzMyX2J5dGVzX2hlcmU=';
        if (key === 'DODO_PAYMENTS_LIVE_WEBHOOK_KEY') return 'whsec_bGl2ZV9zZWNyZXRfa2V5XzMyX2J5dGVzX2hlcmU=';
        if (key === 'DODO_PAYMENTS_ENVIRONMENT') return 'test_mode';
        if (key === 'FRONTEND_URL') return 'https://hype-resume.com';
        return defaultVal;
      }),
    };

    provider = new DodoPaymentProvider(mockConfigService);
  });

  it('should initialize in test_mode by default', () => {
    expect(provider.getMode()).toBe('test_mode');
    const summary = provider.getSettingsSummary();
    expect(summary.mode).toBe('test_mode');
    expect(summary.testConfigured).toBe(true);
    expect(summary.liveConfigured).toBe(true);
  });

  it('should switch mode between test_mode and live_mode cleanly', () => {
    provider.setMode('live_mode');
    expect(provider.getMode()).toBe('live_mode');
    expect(provider.getActiveWebhookSecret()).toBe('whsec_bGl2ZV9zZWNyZXRfa2V5XzMyX2J5dGVzX2hlcmU=');

    provider.setMode('test_mode');
    expect(provider.getMode()).toBe('test_mode');
    expect(provider.getActiveWebhookSecret()).toBe('whsec_dGVzdF9zZWNyZXRfa2V5XzMyX2J5dGVzX2hlcmU=');
  });

  it('should reject invalid mode', () => {
    expect(() => provider.setMode('invalid_mode' as any)).toThrow();
  });

  it('should return all 4 Pro product IDs for test_mode and live_mode', () => {
    provider.setMode('test_mode');
    const testCatalog = provider.getProductCatalog();
    expect(testCatalog.pro_weekly).toBe('pdt_0NrjXNXzQC0qMeRVF1gg6');
    expect(testCatalog.pro_monthly).toBe('pdt_0NrjXNbLAgT25sdWEPA6K');
    expect(testCatalog.pro_6month).toBe('pdt_0NrjXNgBsZIa8w8FejK3Q');
    expect(testCatalog.pro_lifetime).toBe('pdt_0NrjXNli5cBsc4SjHICgg');

    provider.setMode('live_mode');
    const liveCatalog = provider.getProductCatalog();
    expect(liveCatalog.pro_weekly).toBe('pdt_0NrjXNubZdqtBlPiv8Q8u');
    expect(liveCatalog.pro_monthly).toBe('pdt_0NrjXNxpn2pqHNXjXYG83');
    expect(liveCatalog.pro_6month).toBe('pdt_0NrjXO1SvPVVoVr4Mv4CB');
    expect(liveCatalog.pro_lifetime).toBe('pdt_0NrjXO4hqllHPCBF1LPCY');
  });

  it('should reject static test bypass signature in all modes', () => {
    const verified = provider.verifyWebhookSignature(
      JSON.stringify({ type: 'payment.succeeded' }),
      'dodo_valid_test_signature',
    );
    expect(verified).toBe(false);
  });

  it('should verify valid Standard Webhooks HMAC signature', () => {
    const payload = JSON.stringify({ type: 'payment.succeeded' });
    const webhookId = 'msg_test_123';
    const webhookTimestamp = String(Math.floor(Date.now() / 1000));
    const secretBytes = Buffer.from('dGVzdF9zZWNyZXRfa2V5XzMyX2J5dGVzX2hlcmU=', 'base64');
    const signedContent = `${webhookId}.${webhookTimestamp}.${payload}`;
    const expectedSig = `v1,${crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64')}`;

    const verified = provider.verifyWebhookSignature(payload, expectedSig, undefined, {
      'webhook-id': webhookId,
      'webhook-timestamp': webhookTimestamp,
    });
    expect(verified).toBe(true);
  });
});
