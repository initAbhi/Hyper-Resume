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

export interface ResumeAuditFindings {
  actionVerbsCount: number;
  metricsCount: number;
  missingSections: string[];
  formattingFlags: string[];
  bulletQuality: Array<{
    bullet: string;
    hasActionVerb: boolean;
    hasMetric: boolean;
    feedback: string;
  }>;
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
  analysisType!: 'ats_check' | 'comprehensive_audit';

  @Column({ type: 'int' })
  score!: number;

  @Column({ type: 'jsonb', default: {} })
  findings!: ResumeAuditFindings;

  @Column({ type: 'jsonb', default: [] })
  recommendations!: string[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
