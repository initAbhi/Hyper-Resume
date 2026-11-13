/**
 * Validates whether an incoming HTTP request origin is permitted by CORS policy.
 *
 * Rules:
 * 1. Missing origin (e.g. server-to-server or curl) is allowed.
 * 2. Matches FRONTEND_URL or explicit ADDITIONAL_CORS_ORIGINS.
 * 3. In production, allows verified https://hype-resume.com and its subdomains.
 * 4. In development/testing, allows localhost, 127.0.0.1, and http variants.
 */
export function isAllowedCorsOrigin(
  origin: string | undefined,
  frontendUrl: string,
  additionalOrigins: string[] = [],
  isDev: boolean = false,
): boolean {
  if (!origin) return true;

  const normalized = origin.trim().replace(/\/+$/, '');
  const normalizedFrontend = (frontendUrl || '').trim().replace(/\/+$/, '');

  // 1. Exact match on configured primary frontend URL
  if (normalizedFrontend && normalized === normalizedFrontend) {
    return true;
  }

  // 2. Explicitly configured additional origins
  const normalizedAdditional = additionalOrigins
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  if (normalizedAdditional.includes(normalized)) {
    return true;
  }

  // 3. Official production domain & subdomains (strictly HTTPS)
  if (/^https:\/\/([a-z0-9-]+\.)*hype-resume\.com(:\d+)?$/.test(normalized)) {
    return true;
  }

  // 4. Localhost and development relaxations (strictly non-production)
  if (isDev) {
    if (/^https?:\/\/localhost(:\d+)?$/.test(normalized)) return true;
    if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(normalized)) return true;
    if (/^http:\/\/([a-z0-9-]+\.)*hype-resume\.com(:\d+)?$/.test(normalized)) return true;
  }

  return false;
}

export function parseAdditionalCorsOrigins(rawEnv?: string): string[] {
  if (!rawEnv) return [];
  return rawEnv
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

