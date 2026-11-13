import { describe, it, expect } from 'vitest';
import { isAllowedCorsOrigin, parseAdditionalCorsOrigins } from './cors.util.js';

describe('CORS Origin Validation Utility', () => {
  const frontendUrl = 'https://hype-resume.com';

  it('should allow requests with no origin (direct API / server-to-server)', () => {
    expect(isAllowedCorsOrigin(undefined, frontendUrl)).toBe(true);
    expect(isAllowedCorsOrigin('', frontendUrl)).toBe(true);
  });

  it('should allow official production frontend origins with HTTPS', () => {
    expect(isAllowedCorsOrigin('https://hype-resume.com', frontendUrl)).toBe(true);
    expect(isAllowedCorsOrigin('https://app.hype-resume.com', frontendUrl)).toBe(true);
    expect(isAllowedCorsOrigin('https://api.hype-resume.com', frontendUrl)).toBe(true);
  });

  it('should reject unencrypted HTTP production origins in production mode', () => {
    expect(isAllowedCorsOrigin('http://hype-resume.com', frontendUrl, [], false)).toBe(false);
  });

  it('should allow unencrypted HTTP production origins in dev mode', () => {
    expect(isAllowedCorsOrigin('http://hype-resume.com', frontendUrl, [], true)).toBe(true);
  });

  it('should reject arbitrary untrusted third-party domains in production', () => {
    expect(isAllowedCorsOrigin('https://malicious-site.com', frontendUrl)).toBe(false);
    expect(isAllowedCorsOrigin('https://resume.fourth-coffee.shop', frontendUrl)).toBe(false);
  });

  it('should allow additional origins configured via environment variable', () => {
    const additional = ['https://preview-deploy.mycompany.org', 'https://staging.internal'];
    expect(isAllowedCorsOrigin('https://preview-deploy.mycompany.org', frontendUrl, additional)).toBe(true);
    expect(isAllowedCorsOrigin('https://staging.internal', frontendUrl, additional)).toBe(true);
  });

  it('should allow localhost and 127.0.0.1 in dev mode', () => {
    expect(isAllowedCorsOrigin('http://localhost:3000', frontendUrl, [], true)).toBe(true);
    expect(isAllowedCorsOrigin('http://127.0.0.1:3000', frontendUrl, [], true)).toBe(true);
  });

  it('should reject localhost in production mode if not explicitly in additionalOrigins', () => {
    expect(isAllowedCorsOrigin('http://localhost:3000', frontendUrl, [], false)).toBe(false);
  });

  describe('parseAdditionalCorsOrigins', () => {
    it('should correctly parse comma-separated origin strings', () => {
      const parsed = parseAdditionalCorsOrigins('https://a.com, https://b.com,https://c.com');
      expect(parsed).toEqual(['https://a.com', 'https://b.com', 'https://c.com']);
    });

    it('should return empty array for empty or undefined input', () => {
      expect(parseAdditionalCorsOrigins(undefined)).toEqual([]);
      expect(parseAdditionalCorsOrigins('')).toEqual([]);
    });
  });
});

