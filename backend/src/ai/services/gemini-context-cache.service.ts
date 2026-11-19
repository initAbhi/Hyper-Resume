import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';
import type { GeminiMessageContent } from '../providers/gemini-ai.provider.js';
import { estimateTokens } from '../../agent/utils/context-pruner.util.js';

export type ContextCacheMode =
  | 'explicit_hit'
  | 'explicit_created'
  | 'implicit_prefix'
  | 'bypassed';

export interface PrefixCacheRequest {
  userId: string;
  model: string;
  resumeId: string;
  resumeVersion: number;
  systemInstruction: string;
  tools?: any[];
  staticPrefixContents: GeminiMessageContent[];
  jdHash?: string;
}

export interface PrefixCacheResolution {
  mode: ContextCacheMode;
  cacheKey: string;
  cachedContentName?: string;
  estimatedPrefixTokens: number;
  reason?: string;
}

interface CachedPrefixEntry {
  cacheKey: string;
  userId: string;
  resumeId: string;
  resumeVersion: number;
  model: string;
  cachedContentName: string;
  expiresAtMs: number;
  estimatedPrefixTokens: number;
}

const DEFAULT_CACHE_TTL_SECONDS = 900; // 15 minutes
const MIN_REMAINING_TTL_MS = 60_000; // Recreate if < 60s left
const REFRESH_TTL_THRESHOLD_MS = 300_000; // Sliding TTL refresh if < 5m left
const EXPLICIT_MIN_PREFIX_TOKENS = 1024;
const FREE_TIER_COOLDOWN_MS = 15 * 60_000; // 15 min circuit breaker when API key has free-tier limit=0
const MAX_LRU_ENTRIES = 250;

@Injectable()
export class GeminiContextCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(GeminiContextCacheService.name);
  private readonly apiKey?: string;
  private readonly explicitEnabled: boolean;
  private readonly ttlSeconds: number;

  // Map preserves insertion order for clean LRU eviction
  private readonly cacheEntries = new Map<string, CachedPrefixEntry>();
  private readonly explicitDisabledUntilByModel = new Map<string, number>();
  private readonly inFlightCreations = new Map<string, Promise<PrefixCacheResolution>>();

  constructor(private readonly configService: ConfigService) {
    this.apiKey =
      this.configService.get<string>('AI_API_KEY') ||
      this.configService.get<string>('GEMINI_API_KEY');
    const explicitFlag = this.configService.get<string>('GEMINI_EXPLICIT_CACHING', 'true');
    this.explicitEnabled = explicitFlag !== 'false';
    const rawTtl = Number(this.configService.get<string>('GEMINI_CACHE_TTL_SECONDS', String(DEFAULT_CACHE_TTL_SECONDS)));
    this.ttlSeconds = Number.isFinite(rawTtl) && rawTtl >= 60 ? Math.min(rawTtl, 3600) : DEFAULT_CACHE_TTL_SECONDS;
  }

  onModuleDestroy(): void {
    this.cacheEntries.clear();
    this.explicitDisabledUntilByModel.clear();
    this.inFlightCreations.clear();
  }

  /**
   * Computes a strict tenant- and version-isolated SHA-256 cache key.
   * Guarantees zero cross-user leakage and automatic invalidation on resume edits.
   */
  public computeCacheKey(req: PrefixCacheRequest): string {
    const systemHash = crypto
      .createHash('sha256')
      .update(req.systemInstruction || '')
      .digest('hex')
      .slice(0, 16);
    const toolsHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(req.tools || []))
      .digest('hex')
      .slice(0, 16);

    return crypto
      .createHash('sha256')
      .update(
        [
          req.userId,
          req.model,
          req.resumeId,
          String(req.resumeVersion),
          req.jdHash || 'no-jd',
          systemHash,
          toolsHash,
        ].join('|'),
      )
      .digest('hex');
  }

  /**
   * Resolves an explicit Gemini `cachedContents/...` handle when eligible and supported
   * by the active API tier, or cleanly falls back to byte-stable `implicit_prefix` mode
   * so Gemini's automatic prefix cache still applies with zero extra latency.
   */
  async resolvePrefixCache(req: PrefixCacheRequest): Promise<PrefixCacheResolution> {
    const cacheKey = this.computeCacheKey(req);
    const estimatedPrefixTokens =
      estimateTokens(req.systemInstruction) +
      estimateTokens(req.tools || []) +
      req.staticPrefixContents.reduce(
        (sum, c) => sum + c.parts.reduce((pSum, p) => pSum + estimateTokens(p.text || ''), 0),
        0,
      );

    // 1. Check active LRU explicit cache entry (with strict userId + resumeVersion verification)
    const existing = this.cacheEntries.get(cacheKey);
    const now = Date.now();
    if (
      existing &&
      existing.userId === req.userId &&
      existing.resumeVersion === req.resumeVersion &&
      existing.expiresAtMs - now > MIN_REMAINING_TTL_MS
    ) {
      // Refresh LRU order
      this.cacheEntries.delete(cacheKey);
      this.cacheEntries.set(cacheKey, existing);

      // Sliding TTL refresh in background when approaching expiry
      if (existing.expiresAtMs - now < REFRESH_TTL_THRESHOLD_MS) {
        void this.refreshRemoteTtl(existing);
      }

      return {
        mode: 'explicit_hit',
        cacheKey,
        cachedContentName: existing.cachedContentName,
        estimatedPrefixTokens: existing.estimatedPrefixTokens,
      };
    } else if (existing) {
      this.cacheEntries.delete(cacheKey);
    }

    // 2. Skip explicit remote cache creation if disabled, missing key, test env, below floor, or circuit-broken
    if (!this.explicitEnabled || !this.apiKey) {
      return {
        mode: 'implicit_prefix',
        cacheKey,
        estimatedPrefixTokens,
        reason: 'explicit_caching_disabled_or_no_key',
      };
    }

    if (estimatedPrefixTokens < EXPLICIT_MIN_PREFIX_TOKENS) {
      return {
        mode: 'implicit_prefix',
        cacheKey,
        estimatedPrefixTokens,
        reason: 'below_explicit_token_floor',
      };
    }

    const cooldownUntil = this.explicitDisabledUntilByModel.get(req.model) || 0;
    if (cooldownUntil > now) {
      return {
        mode: 'implicit_prefix',
        cacheKey,
        estimatedPrefixTokens,
        reason: 'explicit_tier_cooldown',
      };
    }

    // Coalesce concurrent creation calls for the same cacheKey
    const pending = this.inFlightCreations.get(cacheKey);
    if (pending) {
      return pending;
    }

    const creationPromise = this.createRemoteCache(req, cacheKey, estimatedPrefixTokens).finally(
      () => {
        this.inFlightCreations.delete(cacheKey);
      },
    );
    this.inFlightCreations.set(cacheKey, creationPromise);
    return creationPromise;
  }

  private async createRemoteCache(
    req: PrefixCacheRequest,
    cacheKey: string,
    estimatedPrefixTokens: number,
  ): Promise<PrefixCacheResolution> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/cachedContents?key=${this.apiKey}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const payload: Record<string, unknown> = {
        model: req.model.startsWith('models/') ? req.model : `models/${req.model}`,
        systemInstruction: {
          parts: [{ text: req.systemInstruction }],
        },
        contents: req.staticPrefixContents,
        ttl: `${this.ttlSeconds}s`,
      };

      if (req.tools && req.tools.length > 0) {
        payload.tools = [{ functionDeclarations: req.tools }];
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        // Detect Free-Tier storage quota limit=0 and trip circuit breaker so subsequent turns incur 0ms overhead
        if (
          res.status === 429 &&
          /TotalCachedContentStorageTokens|FreeTier|limit=0/i.test(errText)
        ) {
          this.explicitDisabledUntilByModel.set(req.model, Date.now() + FREE_TIER_COOLDOWN_MS);
          this.logger.log(
            `Gemini explicit context caching unavailable on current API tier for ${req.model} (falling back to implicit prefix caching for 15m).`,
          );
          return {
            mode: 'implicit_prefix',
            cacheKey,
            estimatedPrefixTokens,
            reason: 'free_tier_storage_limit_zero',
          };
        }

        // 400 (below model minimum token floor) or transient error -> graceful implicit prefix fallback
        this.logger.debug(
          `Gemini explicit cache skipped (${res.status}) for ${req.model}: ${errText.slice(0, 140)}`,
        );
        return {
          mode: 'implicit_prefix',
          cacheKey,
          estimatedPrefixTokens,
          reason: `remote_status_${res.status}`,
        };
      }

      const data = (await res.json()) as { name?: string; expireTime?: string };
      if (!data?.name) {
        return {
          mode: 'implicit_prefix',
          cacheKey,
          estimatedPrefixTokens,
          reason: 'missing_cache_name',
        };
      }

      const expiresAtMs = data.expireTime
        ? new Date(data.expireTime).getTime()
        : Date.now() + this.ttlSeconds * 1000;

      // Enforce bounded LRU capacity
      if (this.cacheEntries.size >= MAX_LRU_ENTRIES) {
        const oldestKey = this.cacheEntries.keys().next().value;
        if (oldestKey) {
          const evicted = this.cacheEntries.get(oldestKey);
          this.cacheEntries.delete(oldestKey);
          if (evicted) void this.deleteRemoteCache(evicted.cachedContentName);
        }
      }

      this.cacheEntries.set(cacheKey, {
        cacheKey,
        userId: req.userId,
        resumeId: req.resumeId,
        resumeVersion: req.resumeVersion,
        model: req.model,
        cachedContentName: data.name,
        expiresAtMs,
        estimatedPrefixTokens,
      });

      this.logger.log(
        `Created Gemini explicit context cache ${data.name} (~${estimatedPrefixTokens} tokens, ttl=${this.ttlSeconds}s) for resume ${req.resumeId} v${req.resumeVersion}`,
      );

      return {
        mode: 'explicit_created',
        cacheKey,
        cachedContentName: data.name,
        estimatedPrefixTokens,
      };
    } catch (err: any) {
      this.logger.debug(`Gemini explicit cache creation failed cleanly: ${err?.message}`);
      return {
        mode: 'implicit_prefix',
        cacheKey,
        estimatedPrefixTokens,
        reason: 'network_or_timeout',
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Immediately evicts and remotely deletes all cached prefixes belonging to a user's resume
   * (called whenever resume edits are applied or versions are restored).
   */
  async invalidateResumeCache(userId: string, resumeId: string): Promise<number> {
    const toDelete: CachedPrefixEntry[] = [];
    for (const entry of this.cacheEntries.values()) {
      if (entry.userId === userId && entry.resumeId === resumeId) {
        toDelete.push(entry);
      }
    }

    for (const entry of toDelete) {
      this.cacheEntries.delete(entry.cacheKey);
      void this.deleteRemoteCache(entry.cachedContentName);
    }

    return toDelete.length;
  }

  /**
   * Removes a specific stale handle from local cache (e.g. if remote returned 404).
   */
  evictByHandle(cachedContentName: string): void {
    for (const [key, entry] of this.cacheEntries.entries()) {
      if (entry.cachedContentName === cachedContentName) {
        this.cacheEntries.delete(key);
        break;
      }
    }
  }

  getActiveCacheCount(): number {
    return this.cacheEntries.size;
  }

  private async refreshRemoteTtl(entry: CachedPrefixEntry): Promise<void> {
    if (!this.apiKey) return;
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/${entry.cachedContentName}?key=${this.apiKey}`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ttl: `${this.ttlSeconds}s` }),
      });
      if (res.ok) {
        entry.expiresAtMs = Date.now() + this.ttlSeconds * 1000;
      }
    } catch {
      // Non-fatal TTL refresh
    }
  }

  private async deleteRemoteCache(cachedContentName: string): Promise<void> {
    if (!this.apiKey || !cachedContentName) return;
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/${cachedContentName}?key=${this.apiKey}`;
      await fetch(endpoint, { method: 'DELETE' });
    } catch {
      // Non-fatal remote cleanup
    }
  }
}

