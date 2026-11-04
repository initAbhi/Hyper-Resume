import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { InterviewSession } from './interview-session.entity.js';

export type QuestionCategory =
  | 'role_alignment'
  | 'resume_claim'
  | 'technical_depth'
  | 'job_match_gap'
  | 'behavioral';

@Entity('interview_questions')
@Index('idx_interview_questions_session_order', ['sessionId', 'orderIndex'])
export class InterviewQuestion extends BaseEntity {
  @Column({ type: 'uuid', name: 'session_id' })
  sessionId!: string;

  @ManyToOne(() => InterviewSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: InterviewSession;

  @Column({ type: 'int', name: 'order_index' })
  orderIndex!: number;

  @Column({ type: 'varchar', length: 50 })
  category!: QuestionCategory;

  @Column({ type: 'text', name: 'question_text' })
  questionText!: string;

  @Column({ type: 'text', nullable: true, name: 'context_hint' })
  contextHint?: string;

  @Column({ type: 'text', nullable: true, name: 'ideal_answer_outline' })
  idealAnswerOutline?: string;
}

