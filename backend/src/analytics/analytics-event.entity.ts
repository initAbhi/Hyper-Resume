import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity.js';

@Entity('analytics_events')
export class AnalyticsEvent extends BaseEntity {
  @Index('idx_analytics_events_type_created')
  @Column({ type: 'varchar', length: 80, name: 'event_type' })
  eventType!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  path?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  referrer?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true, name: 'utm_source' })
  utmSource?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true, name: 'utm_medium' })
  utmMedium?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true, name: 'utm_campaign' })
  utmCampaign?: string | null;

  @Index('idx_analytics_events_session_hash')
  @Column({ type: 'varchar', length: 128, nullable: true, name: 'session_hash' })
  sessionHash?: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;
}

