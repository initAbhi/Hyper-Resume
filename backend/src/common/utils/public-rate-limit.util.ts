import { HttpException, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Creates a lightweight per-IP sliding-window limiter for anonymous public endpoints
 * so free tools remain protected without requiring authentication.
 */
export function createPublicRateLimiter(
  maxRequests: number = 15,
  windowMs: number = 10 * 60 * 1000,
) {
  const hitsByIp = new Map<string, number[]>();

  return function enforcePublicRateLimit(req: Request): void {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]?.trim()) ||
      req.ip ||
      'unknown';

    const now = Date.now();
    const recent = (hitsByIp.get(clientIp) || []).filter((ts) => now - ts < windowMs);

    if (recent.length >= maxRequests) {
      throw new HttpException(
        `Free tool rate limit reached (${maxRequests} requests per ${Math.round(windowMs / 60000)} minutes). Sign in for unlimited workspace usage.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    recent.push(now);
    hitsByIp.set(clientIp, recent);
  };
}

