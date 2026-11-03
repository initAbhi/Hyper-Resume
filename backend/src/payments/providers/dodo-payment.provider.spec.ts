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
        if (key === 'DODO_PAYMENTS_TEST_WEBHOOK_KEY') return 'whsec_test_mock_secret';
        if (key === 'DODO_PAYMENTS_LIVE_WEBHOOK_KEY') return 'whsec_live_mock_secret';
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
    expect(provider.getActiveWebhookSecret()).toBe('whsec_live_mock_secret');

    provider.setMode('test_mode');
    expect(provider.getMode()).toBe('test_mode');
    expect(provider.getActiveWebhookSecret()).toBe('whsec_test_mock_secret');
  });

  it('should reject invalid mode', () => {
    expect(() => provider.setMode('invalid_mode' as any)).toThrow();
  });

  it('should return appropriate product IDs for active mode', () => {
    provider.setMode('test_mode');
    const testCatalog = provider.getProductCatalog();
    expect(testCatalog.job_hunt_pack).toBe('pdt_0Nr5xZU9yB260bfZatiL8');
    expect(testCatalog.job_hunt_pro).toBe('pdt_0Nr5xbDw7bbIjC2jA99BI');

    provider.setMode('live_mode');
    const liveCatalog = provider.getProductCatalog();
    expect(liveCatalog.job_hunt_pack).toBe('pdt_0Nr6P5jnppyJqqMoCdetW');
    expect(liveCatalog.job_hunt_pro).toBe('pdt_0Nr6P5mX2KS1HS1pjDn56');
  });

  it('should verify test bypass signature', () => {
    const verified = provider.verifyWebhookSignature(
      JSON.stringify({ type: 'payment.succeeded' }),
      'dodo_valid_test_signature',
    );
    expect(verified).toBe(true);
  });
});
