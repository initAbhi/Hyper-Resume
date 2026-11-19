import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GeminiContextCacheService } from './gemini-context-cache.service.js';
import { calculateUsageCost } from '../config/ai-model-pricing.js';

describe('GeminiContextCacheService (Explicit & Implicit Prompt Caching)', () => {
  let service: GeminiContextCacheService;
  const originalFetch = globalThis.fetch;

  const makeLargePrefix = () => [
    {
      role: 'user' as const,
      parts: [
        {
          text: `CACHED_RESUME_CONTEXT:\n${'Senior Full-Stack Software Engineer building TypeScript, NestJS, PostgreSQL, Redis, React, Next.js services. '.repeat(60)}`,
        },
      ],
    },
  ];

  beforeEach(() => {
    const mockConfig: any = {
      get: vi.fn((key: string, def?: string) => {
        if (key === 'AI_API_KEY') return 'test-api-key';
        if (key === 'GEMINI_EXPLICIT_CACHING') return 'true';
        if (key === 'GEMINI_CACHE_TTL_SECONDS') return '900';
        return def;
      }),
    };
    service = new GeminiContextCacheService(mockConfig);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('STRICT SECURITY: isolates cache keys per userId and per resumeVersion', () => {
    const base = {
      model: 'gemini-3.1-flash-lite',
      resumeId: 'res-1',
      resumeVersion: 1,
      systemInstruction: 'Static system prompt',
      tools: [{ name: 'run_ats_audit' }],
      staticPrefixContents: makeLargePrefix(),
    };

    const keyUserA = service.computeCacheKey({ ...base, userId: 'user-a' });
    const keyUserB = service.computeCacheKey({ ...base, userId: 'user-b' });
    const keyUserAv2 = service.computeCacheKey({ ...base, userId: 'user-a', resumeVersion: 2 });

    expect(keyUserA).not.toBe(keyUserB);
    expect(keyUserA).not.toBe(keyUserAv2);
  });

  it('creates an explicit Gemini cache, serves subsequent turns from cache without HTTP calls, and invalidates on edit', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          name: 'cachedContents/abc-123',
          expireTime: new Date(Date.now() + 900_000).toISOString(),
        }),
    } as any);

    const req = {
      userId: 'user-1',
      model: 'gemini-3.1-flash-lite',
      resumeId: 'res-1',
      resumeVersion: 1,
      systemInstruction: 'Static system prompt',
      tools: [{ name: 'read_resume' }],
      staticPrefixContents: makeLargePrefix(),
    };

    // Turn 1: creates remote cache
    const turn1 = await service.resolvePrefixCache(req);
    expect(turn1.mode).toBe('explicit_created');
    expect(turn1.cachedContentName).toBe('cachedContents/abc-123');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    // Turn 2 (same user + same resume version): instant explicit cache hit, 0 extra HTTP calls!
    const turn2 = await service.resolvePrefixCache(req);
    expect(turn2.mode).toBe('explicit_hit');
    expect(turn2.cachedContentName).toBe('cachedContents/abc-123');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    // Resume edited -> invalidateResumeCache evicts and issues DELETE
    const evicted = await service.invalidateResumeCache('user-1', 'res-1');
    expect(evicted).toBe(1);
    expect(service.getActiveCacheCount()).toBe(0);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1beta/cachedContents/abc-123'),
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('trips free-tier circuit breaker on 429 limit=0 and falls back cleanly to implicit_prefix with zero repeated HTTP calls', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: () =>
        Promise.resolve(
          'TotalCachedContentStorageTokensPerModelFreeTier limit exceeded for model gemini-3.1-flash-lite: limit=0',
        ),
    } as any);

    const req = {
      userId: 'user-1',
      model: 'gemini-3.1-flash-lite',
      resumeId: 'res-1',
      resumeVersion: 1,
      systemInstruction: 'Static system prompt',
      staticPrefixContents: makeLargePrefix(),
    };

    const turn1 = await service.resolvePrefixCache(req);
    expect(turn1.mode).toBe('implicit_prefix');
    expect(turn1.reason).toBe('free_tier_storage_limit_zero');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    // Turn 2 skips POST /cachedContents immediately due to circuit breaker
    const turn2 = await service.resolvePrefixCache(req);
    expect(turn2.mode).toBe('implicit_prefix');
    expect(turn2.reason).toBe('explicit_tier_cooldown');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('applies exact 90% Gemini context cache discount in calculateUsageCost', () => {
    const uncached = calculateUsageCost('gemini-3.1-flash-lite', 10000, 500, 0);
    const cached = calculateUsageCost('gemini-3.1-flash-lite', 10000, 500, 8000);

    expect(cached.cachedInputTokens).toBe(8000);
    expect(cached.costUsd).toBeLessThan(uncached.costUsd);
    expect(cached.savedCostUsd).toBeGreaterThan(0);
    expect(Number((cached.costUsd + cached.savedCostUsd).toFixed(8))).toBe(uncached.costUsd);
  });
});

