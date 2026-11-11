import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { AnalyticsService } from './analytics.service.js';
import { createPublicRateLimiter } from '../common/utils/public-rate-limit.util.js';

export class TrackAnalyticsEventDto {
  @IsString()
  @MaxLength(80)
  eventType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  path?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  referrer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  utmSource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  utmMedium?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  sessionId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

@Controller('analytics')
export class AnalyticsController {
  private readonly enforceRateLimit = createPublicRateLimiter(120, 60 * 1000);

  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('event')
  @HttpCode(HttpStatus.ACCEPTED)
  async trackEvent(@Body() dto: TrackAnalyticsEventDto, @Req() req: Request) {
    this.enforceRateLimit(req);
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0]?.trim() || req.ip;

    return this.analyticsService.recordEvent(
      {
        eventType: dto.eventType,
        path: dto.path,
        referrer: dto.referrer,
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
        sessionHash: dto.sessionId,
        metadata: dto.metadata,
      },
      {
        ip,
        userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
      },
    );
  }
}

