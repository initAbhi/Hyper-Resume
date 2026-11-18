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

@Entity('agent_stream_tickets')
export class AgentStreamTicket extends BaseEntity {
  @Index('idx_agent_stream_tickets_conversation_id')
  @Column({ type: 'uuid', name: 'conversation_id' })
  conversationId!: string;

  @ManyToOne(() => AgentConversation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: AgentConversation;

  @Index('idx_agent_stream_tickets_user_id')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index('idx_agent_stream_tickets_hash', { unique: true })
  @Column({ type: 'varchar', length: 64, unique: true, name: 'ticket_hash' })
  ticketHash!: string;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'consumed_at' })
  consumedAt?: Date | null;
}

