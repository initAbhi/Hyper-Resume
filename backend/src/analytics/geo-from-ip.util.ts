import geoip from 'geoip-lite';

export interface GeoFromIp {
  countryCode: string;
  region: string | null;
}

const PRIVATE_IP =
  /^(::1|::ffff:127\.|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|fc00:|fe80:)/i;

/**
 * Resolve coarse geo (country + region) from a client IP.
 * Never store the raw IP — only these fields go into analytics metadata.
 */
export function lookupGeoFromIp(ip?: string | null): GeoFromIp | null {
  if (!ip) return null;
  const cleaned = ip.trim().replace(/^::ffff:/i, '');
  if (!cleaned || PRIVATE_IP.test(cleaned) || cleaned === 'localhost') {
    return null;
  }

  try {
    const hit = geoip.lookup(cleaned);
    if (!hit?.country) return null;
    return {
      countryCode: hit.country,
      region: hit.region || null,
    };
  } catch {
    return null;
  }
}

export function countryDisplayName(countryCode: string): string {
  try {
    const display = new Intl.DisplayNames(['en'], { type: 'region' });
    return display.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
}
