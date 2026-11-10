import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Resume } from '../../resumes/entities/resume.entity.js';
import type { ResumeContent } from '../../resumes/entities/resume.types.js';
import type {
  LinkedInOptimizeResult,
  LinkedInOptimizeTone,
} from '../../ai/interfaces/ai-provider.interface.js';

export type LinkedInAuditSourceType = 'linkedin_pdf' | 'resume' | 'manual';

export interface LinkedInSectionDiagnostic {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  status: 'strong' | 'needs_work' | 'critical';
  finding: string;
  recommendation: string;
}

export interface LinkedInChecklistItem {
  id: string;
  title: string;
  impact: 'High' | 'Medium';
  completed: boolean;
  detail: string;
}

export interface LinkedInScoreReport {
  overallScore: number;
  gradeLabel: string;
  subScores: {
    headline: number;
    about: number;
    experience: number;
    skills: number;
    completeness: number;
    contactFeatured: number;
  };
  headlineCharCount: number;
  aboutCharCount: number;
  aboutFoldPreview: string;
  skillsCount: number;
  experienceCount: number;
  evidencedKeywordCoveragePct: number;
  urlHealth: {
    url: string;
    slug: string;
    hasCustomSlug: boolean;
    suggestedSlug: string;
    note: string;
  };
  diagnostics: LinkedInSectionDiagnostic[];
  checklist: LinkedInChecklistItem[];
}

export interface LinkedInAppliedState {
  appliedHeadline?: string;
  appliedAbout?: string;
  appliedSkills?: string[];
  checkedChecklistIds?: string[];
  syncedToResume?: boolean;
  syncedToProfile?: boolean;
  lastAppliedAt?: string;
}

@Entity('linkedin_audits')
export class LinkedInAudit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_linkedin_audits_user_updated')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index('idx_linkedin_audits_resume_id')
  @Column({ type: 'uuid', nullable: true, name: 'resume_id' })
  resumeId?: string | null;

  @ManyToOne(() => Resume, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'resume_id' })
  resume?: Resume | null;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 180, name: 'target_role' })
  targetRole!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  industry?: string | null;

  @Column({ type: 'varchar', length: 40, default: 'Executive' })
  tone!: LinkedInOptimizeTone;

  @Column({ type: 'varchar', length: 30, name: 'source_type', default: 'resume' })
  sourceType!: LinkedInAuditSourceType;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'linkedin_url' })
  linkedinUrl?: string | null;

  @Column({ type: 'integer', name: 'overall_score', default: 0 })
  overallScore!: number;

  @Column({ type: 'jsonb', name: 'profile_snapshot', default: {} })
  profileSnapshot!: ResumeContent;

  @Column({ type: 'jsonb', name: 'score_report', default: {} })
  scoreReport!: LinkedInScoreReport;

  @Column({ type: 'jsonb', name: 'optimizations', default: {} })
  optimizations!: LinkedInOptimizeResult;

  @Column({ type: 'jsonb', name: 'applied_state', default: {} })
  appliedState!: LinkedInAppliedState;

  @Column({ type: 'varchar', length: 40, nullable: true })
  provider?: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}

