import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { Resume } from './resume.entity.js';
import type { ResumeContent } from './resume.types.js';

export type AdaptationStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED';
export type AdaptationType = 'full_profile' | 'section';

export interface AdaptationUsageMetadata {
  modelId: string;
  pricingVersion: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
}

export interface BulletDiff {
  original: string;
  adapted: string;
  metricFlag?: boolean;
  warnings?: string[];
}

export interface ExperienceDiff {
  company: string;
  title: string;
  bullets: BulletDiff[];
}

export interface SectionChanges {
  summary?: {
    original: string;
    adapted: string;
    metricFlag?: boolean;
    warnings?: string[];
  };
  headline?: {
    original: string;
    adapted: string;
  };
  experience?: ExperienceDiff[];
  skills?: {
    original: Array<{ name: string; category?: string }>;
    recommendedBenchmarkSkills: string[];
  };
  projects?: Array<{
    name: string;
    description: { original: string; adapted: string };
    highlights: BulletDiff[];
  }>;
}

@Entity('resume_adaptations')
@Index('idx_resume_adaptations_user_idempotency', ['userId', 'idempotencyKey'], { unique: true })
@Index('idx_resume_adaptations_user_status', ['userId', 'status'])
@Index('idx_resume_adaptations_source_resume', ['sourceResumeId'])
export class ResumeAdaptation extends BaseEntity {
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid', name: 'source_resume_id' })
  sourceResumeId!: string;

  @ManyToOne(() => Resume, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'source_resume_id' })
  sourceResume!: Resume;

  @Column({ type: 'varchar', length: 100, name: 'sample_id' })
  sampleId!: string;

  @Column({ type: 'varchar', length: 50, default: 'full_profile', name: 'adaptation_type' })
  adaptationType!: AdaptationType;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'target_role' })
  targetRole?: string | null;

  @Column({ type: 'varchar', length: 255, name: 'idempotency_key' })
  idempotencyKey!: string;

  @Column({ type: 'varchar', length: 30, default: 'PENDING' })
  status!: AdaptationStatus;

  @Column({ type: 'int', default: 0, name: 'credits_charged' })
  creditsCharged!: number;

  @Column({ type: 'jsonb', nullable: true, name: 'proposed_content' })
  proposedContent?: ResumeContent | null;

  @Column({ type: 'jsonb', nullable: true, name: 'section_changes' })
  sectionChanges?: SectionChanges | null;

  @Column({ type: 'jsonb', nullable: true, name: 'unsupported_warnings' })
  unsupportedWarnings?: string[] | null;

  @Column({ type: 'jsonb', nullable: true, name: 'recommended_benchmark_skills' })
  recommendedBenchmarkSkills?: string[] | null;

  @Column({ type: 'jsonb', nullable: true, name: 'usage_metadata' })
  usageMetadata?: AdaptationUsageMetadata | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'error_code' })
  errorCode?: string | null;

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage?: string | null;
}

