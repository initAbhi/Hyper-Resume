import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { Resume } from '../../resumes/entities/resume.entity.js';

@Entity('agent_conversations')
export class AgentConversation extends BaseEntity {
  @Index('idx_agent_conversations_user')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'active_resume_id' })
  activeResumeId?: string | null;

  @ManyToOne(() => Resume, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'active_resume_id' })
  activeResume?: Resume | null;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;
}
