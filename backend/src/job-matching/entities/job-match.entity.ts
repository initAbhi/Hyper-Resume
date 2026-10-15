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
import { Resume } from '../../resumes/entities/resume.entity.js';
import { JobDescription } from '../../jobs/entities/job-description.entity.js';

export interface ScoreComponents {
  requiredSkillsScore: number;
  preferredSkillsScore: number;
  experienceScore: number;
  responsibilityScore: number;
  formattingScore: number;
}

export interface RequirementMatchAnalysis {
  requirementId: string;
  text: string;
  type: string;
  importance: string;
  status: 'supported' | 'needs_confirmation' | 'not_evidenced' | 'not_applicable';
  confidence: number;
  evidenceQuotes: string[];
  explanation: string;
  suggestedAction: string;
}

@Entity('job_matches')
export class JobMatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_job_matches_user_id')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index('idx_job_matches_resume_id')
  @Column({ type: 'uuid', name: 'resume_id' })
  resumeId!: string;

  @ManyToOne(() => Resume, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resume_id' })
  resume!: Resume;

  @Index('idx_job_matches_job_description_id')
  @Column({ type: 'uuid', name: 'job_description_id' })
  jobDescriptionId!: string;

  @ManyToOne(() => JobDescription, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_description_id' })
  jobDescription!: JobDescription;

  @Column({ type: 'int', name: 'overall_score' })
  overallScore!: number;

  @Column({ type: 'jsonb', name: 'score_components' })
  scoreComponents!: ScoreComponents;

  @Column({ type: 'jsonb', name: 'requirements_analysis' })
  requirementsAnalysis!: RequirementMatchAnalysis[];

  @Column({ type: 'jsonb', default: [] })
  recommendations!: string[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
