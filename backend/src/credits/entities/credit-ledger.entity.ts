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

export type CreditTransactionType =
  | 'signup_bonus'
  | 'purchase'
  | 'resume_analysis'
  | 'ai_tailor'
  | 'export_pdf'
  | 'refund';

@Entity('credit_ledger')
export class CreditLedger {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_credit_ledger_user_id')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'int' })
  amount!: number;

  @Column({ type: 'varchar', length: 50, name: 'transaction_type' })
  transactionType!: CreditTransactionType;

  @Index('idx_credit_ledger_idempotency_key', { unique: true })
  @Column({ type: 'varchar', length: 255, unique: true, name: 'idempotency_key' })
  idempotencyKey!: string;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
