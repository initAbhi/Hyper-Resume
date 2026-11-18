import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { AgentTask } from './agent-task.entity.js';

export type ToolExecutionStatus =
  | 'PENDING'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'FAILED';

@Entity('agent_tool_executions')
@Index('idx_agent_tool_executions_task_step', ['taskId', 'stepIndex'])
export class AgentToolExecution extends BaseEntity {
  @Index('idx_agent_tool_executions_task_id')
  @Column({ type: 'uuid', name: 'task_id' })
  taskId!: string;

  @ManyToOne(() => AgentTask, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: AgentTask;

  @Index('idx_agent_tool_executions_user_id')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 100, name: 'tool_name' })
  toolName!: string;

  @Column({ type: 'integer', default: 0, name: 'step_index' })
  stepIndex!: number;

  @Column({ type: 'jsonb', default: {}, name: 'input_arguments' })
  inputArguments!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: {}, name: 'output_payload' })
  outputPayload!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status!: ToolExecutionStatus;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'idempotency_key' })
  idempotencyKey?: string | null;

  @Index('idx_agent_tool_executions_proposal_hash')
  @Column({ type: 'varchar', length: 64, nullable: true, name: 'proposal_hash' })
  proposalHash?: string | null;

  @Column({ type: 'integer', nullable: true, name: 'expected_resume_version' })
  expectedResumeVersion?: number | null;

  @Column({ type: 'uuid', nullable: true, name: 'resume_id' })
  resumeId?: string | null;

  @Column({ type: 'boolean', default: false, name: 'is_consumed' })
  isConsumed!: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'expires_at' })
  expiresAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'approved_at' })
  approvedAt?: Date | null;
}

