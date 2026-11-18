import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AgentTask } from './agent-task.entity.js';
import { AgentConversation } from './agent-conversation.entity.js';

@Entity('agent_task_events')
@Index('idx_agent_task_events_seq', ['conversationId', 'sequenceNumber'])
export class AgentTaskEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_agent_task_events_task_id')
  @Column({ type: 'uuid', name: 'task_id' })
  taskId!: string;

  @ManyToOne(() => AgentTask, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: AgentTask;

  @Index('idx_agent_task_events_conversation_id')
  @Column({ type: 'uuid', name: 'conversation_id' })
  conversationId!: string;

  @ManyToOne(() => AgentConversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: AgentConversation;

  @Column({ type: 'bigint', name: 'sequence_number' })
  sequenceNumber!: string;

  @Column({ type: 'varchar', length: 100, name: 'event_type' })
  eventType!: string;

  @Column({ type: 'jsonb', default: {}, name: 'event_payload' })
  eventPayload!: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}

