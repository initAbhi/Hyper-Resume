import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Resume } from './resume.entity.js';

export type AtsAuditDimensionKey =
  | 'formatting'
  | 'metrics'
  | 'action_verbs'
  | 'technical_depth'
  | 'brevity';

export interface AtsAuditDimension {
  key: AtsAuditDimensionKey;
  label: string;
  weight: number;
  score: number;
  status: 'strong' | 'moderate' | 'needs_work';
  summary: string;
}

export interface AtsParserRisk {
  id: string;
  severity: 'critical' | 'warning' | 'pass';
  category: 'contact' | 'sections' | 'dates' | 'formatting' | 'length';
  message: string;
  fixHint?: string;
}

export interface AtsStackAlignment {
  totalSkills: number;
  corroboratedSkills: string[];
  unreferencedSkills: string[];
}

export interface AtsBulletQualityItem {
  bullet: string;
  section?: 'Experience' | 'Projects';
  contextLabel?: string;
  wordCount?: number;
  hasActionVerb: boolean;
  hasMetric: boolean;
  lengthStatus?: 'short' | 'ideal' | 'long';
  feedback: string;
}

export interface ResumeAuditFindings {
  actionVerbsCount: number;
  metricsCount: number;
  missingSections: string[];
  detectedSections?: string[];
  formattingFlags: string[];
  wordCount?: number;
  idealBulletCount?: number;
  shortBulletsCount?: number;
  longBulletsCount?: number;
  dimensions?: AtsAuditDimension[];
  parserRisks?: AtsParserRisk[];
  stackAlignment?: AtsStackAlignment;
  bulletQuality: AtsBulletQualityItem[];
  writingQuality?: {
    score: number;
    issueCount: number;
    spellingCount: number;
    grammarCount: number;
    buzzwordCount: number;
    weakPhrasingCount: number;
  };
}

@Entity('resume_analyses')
export class ResumeAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_resume_analyses_user_id')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index('idx_resume_analyses_resume_id')
  @Column({ type: 'uuid', name: 'resume_id' })
  resumeId!: string;

  @ManyToOne(() => Resume, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resume_id' })
  resume!: Resume;

  @Column({ type: 'varchar', length: 50, name: 'analysis_type' })
  analysisType!: 'ats_check' | 'comprehensive_audit' | 'ats_audit';

  @Column({ type: 'int' })
  score!: number;

  @Column({ type: 'jsonb', default: {} })
  findings!: ResumeAuditFindings;

  @Column({ type: 'jsonb', default: [] })
  recommendations!: string[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
