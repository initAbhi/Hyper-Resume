import type { SupportedCurrency } from './pricing-plans.js';

/**
 * Geo pricing bands for HyperResume.
 *
 * Tier 1 → USD list prices ($7.99 / $14.99 / $24.99)
 * Tier 2 + Tier 3 → INR list prices (₹149 / ₹399 / ₹999)
 *
 * Unknown / undetectable country → USD (never silently undercharge Tier-1 markets).
 */
export type PricingTier = 1 | 2;

/** High purchasing-power markets billed in USD */
export const TIER1_COUNTRIES = new Set([
  'US',
  'CA',
  'GB',
  'UK',
  'AU',
  'NZ',
  'IE',
  'DE',
  'FR',
  'NL',
  'BE',
  'AT',
  'CH',
  'LI',
  'LU',
  'SE',
  'NO',
  'DK',
  'FI',
  'IS',
  'SG',
  'JP',
  'KR',
  'HK',
  'TW',
  'IL',
  'AE',
  'QA',
  'KW',
  'BH',
  'SA',
  'IT',
  'ES',
  'PT',
  'MC',
  'AD',
  'SM',
  'VA',
  'MT',
  'CY',
  'EE',
  'LV',
  'LT',
  'CZ',
  'SK',
  'SI',
  'HR',
  'PL',
  'HU',
  'RO',
  'BG',
  'GR',
]);

export interface PricingGeoContext {
  countryCode: string | null;
  tier: PricingTier;
  currency: SupportedCurrency;
  detectionSource: string;
}

export function normalizeCountryCode(raw?: string | null): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  if (!code || code === 'XX' || code === 'T1' || code === 'UNKNOWN' || code.length !== 2) {
    return null;
  }
  // Common aliases
  if (code === 'UK') return 'GB';
  return code;
}

export function resolvePricingGeo(countryCode?: string | null): PricingGeoContext {
  const normalized = normalizeCountryCode(countryCode);
  if (!normalized) {
    return {
      countryCode: null,
      tier: 1,
      currency: 'USD',
      detectionSource: 'fallback_usd',
    };
  }

  if (TIER1_COUNTRIES.has(normalized)) {
    return {
      countryCode: normalized,
      tier: 1,
      currency: 'USD',
      detectionSource: 'tier1',
    };
  }

  return {
    countryCode: normalized,
    tier: 2,
    currency: 'INR',
    detectionSource: 'tier2_3',
  };
}

/** Extract country from common CDN / proxy headers */
export function countryFromHeaders(headers: Record<string, string | string[] | undefined>): {
  countryCode: string | null;
  source: string;
} {
  const read = (key: string): string | null => {
    const value = headers[key] ?? headers[key.toLowerCase()];
    if (!value) return null;
    const raw = Array.isArray(value) ? value[0] : value;
    return normalizeCountryCode(raw);
  };

  const candidates: Array<{ key: string; source: string }> = [
    { key: 'cf-ipcountry', source: 'cf-ipcountry' },
    { key: 'cloudfront-viewer-country', source: 'cloudfront' },
    { key: 'x-vercel-ip-country', source: 'vercel' },
    { key: 'x-country-code', source: 'x-country-code' },
    { key: 'x-geo-country', source: 'x-geo-country' },
  ];

  for (const candidate of candidates) {
    const code = read(candidate.key);
    if (code) return { countryCode: code, source: candidate.source };
  }

  return { countryCode: null, source: 'none' };
}
