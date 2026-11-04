import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { Resume } from '../../resumes/entities/resume.entity.js';
import { JobDescription } from '../../jobs/entities/job-description.entity.js';

export type InterviewSessionMode = 'quick_practice' | 'full_mock' | 'weak_area';
export type InterviewSessionStatus =
  | 'initializing'
  | 'in_progress'
  | 'completed'
  | 'abandoned'
  | 'failed'
  | 'expired';
export type InterviewDifficulty = 'junior' | 'mid' | 'senior';

@Entity('interview_sessions')
@Index('idx_interview_sessions_user_status', ['userId', 'status'])
@Index('idx_interview_sessions_user_created', ['userId', 'createdAt'])
export class InterviewSession extends BaseEntity {
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid', name: 'resume_id' })
  resumeId!: string;

  @ManyToOne(() => Resume, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resume_id' })
  resume!: Resume;

  @Column({ type: 'uuid', nullable: true, name: 'job_description_id' })
  jobDescriptionId?: string;

  @ManyToOne(() => JobDescription, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'job_description_id' })
  jobDescription?: JobDescription;

  @Column({ type: 'varchar', length: 50, name: 'session_mode' })
  sessionMode!: InterviewSessionMode;

  @Column({ type: 'varchar', length: 100, name: 'target_role' })
  targetRole!: string;

  @Column({ type: 'varchar', length: 20, default: 'mid' })
  difficulty!: InterviewDifficulty;

  @Column({ type: 'varchar', length: 30, default: 'initializing' })
  status!: InterviewSessionStatus;

  @Column({ type: 'boolean', default: false, name: 'is_free_trial' })
  isFreeTrial!: boolean;

  @Column({ type: 'int', name: 'total_questions' })
  totalQuestions!: number;

  @Column({ type: 'int', default: 0, name: 'current_question_index' })
  currentQuestionIndex!: number;

  @Column({ type: 'int', nullable: true, name: 'overall_score' })
  overallScore?: number;

  @Column({ type: 'jsonb', nullable: true, name: 'score_breakdown' })
  scoreBreakdown?: {
    starScore: number;
    technicalScore: number;
    relevanceScore: number;
    clarityScore: number;
  };

  @Column({ type: 'jsonb', nullable: true, name: 'summary_feedback' })
  summaryFeedback?: {
    strengths: string[];
    improvements: string[];
    actionItems: string[];
  };

  @Column({ type: 'int', default: 0, name: 'credits_charged' })
  creditsCharged!: number;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'idempotency_key' })
  idempotencyKey?: string;

  @Column({ type: 'int', default: 0, name: 'total_input_tokens' })
  totalInputTokens!: number;

  @Column({ type: 'int', default: 0, name: 'total_output_tokens' })
  totalOutputTokens!: number;

  @Column({ type: 'int', default: 0, name: 'thinking_tokens' })
  thinkingTokens!: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0, name: 'estimated_cost_usd' })
  estimatedCostUsd!: number;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'completed_at' })
  completedAt?: Date;
}

