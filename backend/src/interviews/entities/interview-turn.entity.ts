import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { InterviewSession } from './interview-session.entity.js';
import { InterviewQuestion } from './interview-question.entity.js';

export type TurnProcessingStatus = 'evaluating' | 'evaluated' | 'failed';

export interface TurnEvaluation {
  starPresent?: {
    situation: boolean;
    task: boolean;
    action: boolean;
    result: boolean;
  };
  metricsDetected: boolean;
  technicalAccuracyNotes: string;
  strengths: string[];
  improvementTip: string;
  idealAnswerDraft?: string;
  isLockedForPro?: boolean;
}

@Entity('interview_turns')
@Index('idx_interview_turns_session_q_unique', ['sessionId', 'questionId'], { unique: true })
@Index('idx_interview_turns_session_id', ['sessionId'])
export class InterviewTurn extends BaseEntity {
  @Column({ type: 'uuid', name: 'session_id' })
  sessionId!: string;

  @ManyToOne(() => InterviewSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: InterviewSession;

  @Column({ type: 'uuid', name: 'question_id' })
  questionId!: string;

  @ManyToOne(() => InterviewQuestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question!: InterviewQuestion;

  @Column({ type: 'varchar', length: 30, default: 'evaluating' })
  status!: TurnProcessingStatus;

  @Column({ type: 'text', default: '', name: 'candidate_answer' })
  candidateAnswer!: string;

  @Column({ type: 'int', default: 0, name: 'time_taken_seconds' })
  timeTakenSeconds!: number;

  @Column({ type: 'int', nullable: true, name: 'turn_score' })
  turnScore?: number;

  @Column({ type: 'jsonb', nullable: true })
  evaluation?: TurnEvaluation;

  @Column({ type: 'text', nullable: true, name: 'follow_up_question' })
  followUpQuestion?: string;

  @Column({ type: 'text', nullable: true, name: 'follow_up_answer' })
  followUpAnswer?: string;

  @Column({ type: 'int', nullable: true, name: 'follow_up_score' })
  followUpScore?: number;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'follow_up_status' })
  followUpStatus?: TurnProcessingStatus;

  @Column({ type: 'timestamptz', nullable: true, name: 'evaluated_at' })
  evaluatedAt?: Date;
}

