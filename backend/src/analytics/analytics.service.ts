import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import crypto from 'node:crypto';
import { AnalyticsEvent } from './analytics-event.entity.js';
import { countryDisplayName, lookupGeoFromIp } from './geo-from-ip.util.js';

export interface RecordAnalyticsEventInput {
  eventType: string;
  path?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  sessionHash?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsRepo: Repository<AnalyticsEvent>,
  ) {}

  deriveAnonymousSessionHash(clientSessionId?: string, ip?: string, userAgent?: string): string {
    const seed = clientSessionId?.trim() || `${ip || 'unknown'}|${userAgent || 'ua'}`;
    return crypto.createHash('sha256').update(seed).digest('hex').slice(0, 32);
  }

  async recordEvent(
    input: RecordAnalyticsEventInput,
    fallbackContext?: { ip?: string; userAgent?: string },
  ): Promise<{ recorded: boolean }> {
    const cleanType = (input.eventType || 'page_view').trim().slice(0, 80);
    if (!cleanType) {
      return { recorded: false };
    }

    const sessionHash = this.deriveAnonymousSessionHash(
      input.sessionHash,
      fallbackContext?.ip,
      fallbackContext?.userAgent,
    );

    const geo = lookupGeoFromIp(fallbackContext?.ip);
    const baseMeta =
      input.metadata && typeof input.metadata === 'object' && !Array.isArray(input.metadata)
        ? { ...input.metadata }
        : {};

    if (geo) {
      baseMeta.countryCode = geo.countryCode;
      baseMeta.country = countryDisplayName(geo.countryCode);
      if (geo.region) baseMeta.region = geo.region;
    }

    // Never persist raw IP / UA into analytics rows
    delete baseMeta.ip;
    delete baseMeta.clientIp;
    delete baseMeta.userAgent;

    const entity = this.analyticsRepo.create({
      eventType: cleanType,
      path: input.path?.trim().slice(0, 255) || null,
      referrer: input.referrer?.trim().slice(0, 500) || null,
      utmSource: input.utmSource?.trim().slice(0, 120) || null,
      utmMedium: input.utmMedium?.trim().slice(0, 120) || null,
      utmCampaign: input.utmCampaign?.trim().slice(0, 120) || null,
      sessionHash,
      metadata: Object.keys(baseMeta).length > 0 ? baseMeta : null,
    });

    try {
      await this.analyticsRepo.save(entity);
      return { recorded: true };
    } catch (err: unknown) {
      this.logger.warn(
        `Failed to persist analytics event ${cleanType}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return { recorded: false };
    }
  }
}

