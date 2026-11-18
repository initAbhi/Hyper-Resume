import { HttpException, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Creates a lightweight per-IP sliding-window limiter for anonymous public endpoints
 * so free tools remain protected without requiring authentication.
 */
export function createPublicRateLimiter(
  maxRequests: number = 15,
  windowMs: number = 10 * 60 * 1000,
  customMessage?: string,
) {
  const hitsByIp = new Map<string, number[]>();
  const MAX_TRACKED_IPS = 10_000;

  return function enforcePublicRateLimit(req: Request): void {
    // Prefer Express's proxy-aware req.ip / socket address rather than trusting spoofable leftmost X-Forwarded-For
    const clientIp =
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown';

    const now = Date.now();

    // Prevent unbounded memory growth from IP rotation / DoS
    if (hitsByIp.size >= MAX_TRACKED_IPS) {
      for (const [key, timestamps] of hitsByIp.entries()) {
        if (timestamps.every((ts) => now - ts >= windowMs)) {
          hitsByIp.delete(key);
        }
      }
      if (hitsByIp.size >= MAX_TRACKED_IPS) {
        const oldestKey = hitsByIp.keys().next().value;
        if (oldestKey) hitsByIp.delete(oldestKey);
      }
    }

    const recent = (hitsByIp.get(clientIp) || []).filter((ts) => now - ts < windowMs);

    if (recent.length >= maxRequests) {
      const oldestRecent = recent[0] ?? now;
      const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldestRecent)) / 1000));
      if (req.res && !req.res.headersSent) {
        req.res.setHeader('Retry-After', String(retryAfterSec));
      }
      throw new HttpException(
        customMessage ||
          `Rate limit reached (${maxRequests} requests per ${Math.max(1, Math.round(windowMs / 60000))} minutes). Please retry in ${retryAfterSec}s.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    recent.push(now);
    hitsByIp.set(clientIp, recent);
  };
}

