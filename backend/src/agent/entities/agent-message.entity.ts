import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { AgentConversation } from './agent-conversation.entity.js';

export type AgentMessageRole = 'user' | 'assistant' | 'system';

@Entity('agent_messages')
export class AgentMessage extends BaseEntity {
  @Index('idx_agent_messages_conversation_id')
  @Column({ type: 'uuid', name: 'conversation_id' })
  conversationId!: string;

  @ManyToOne(() => AgentConversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: AgentConversation;

  @Column({ type: 'varchar', length: 50 })
  role!: AgentMessageRole;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;
}

