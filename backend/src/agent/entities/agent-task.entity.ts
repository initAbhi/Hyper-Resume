import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { AgentConversation } from './agent-conversation.entity.js';

export type AgentTaskStatus =
  | 'PENDING'
  | 'PLANNING'
  | 'RUNNING'
  | 'AWAITING_APPROVAL'
  | 'AWAITING_CREDITS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

@Entity('agent_tasks')
@Index('idx_agent_tasks_status_heartbeat', ['status', 'heartbeatAt'])
export class AgentTask extends BaseEntity {
  @Index('idx_agent_tasks_conversation_id')
  @Column({ type: 'uuid', name: 'conversation_id' })
  conversationId!: string;

  @ManyToOne(() => AgentConversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: AgentConversation;

  @Index('idx_agent_tasks_user_id')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status!: AgentTaskStatus;

  @Column({ type: 'jsonb', default: {}, name: 'task_input' })
  taskInput!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @Column({ type: 'integer', default: 0, name: 'fence_token' })
  fenceToken!: number;

  @Column({ type: 'timestamptz', nullable: true, name: 'heartbeat_at' })
  heartbeatAt?: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'lease_token' })
  leaseToken?: string | null;
}
