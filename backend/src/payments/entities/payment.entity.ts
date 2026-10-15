import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

@Entity('payments')
export class Payment extends BaseEntity {
  @Index('idx_payments_user_id')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 50 })
  provider!: 'razorpay' | 'stripe' | 'mock' | 'sandbox';

  @Index('idx_payments_provider_tx_id', { unique: true })
  @Column({ type: 'varchar', length: 255, unique: true, name: 'provider_transaction_id' })
  providerTransactionId!: string;

  @Index('idx_payments_order_id')
  @Column({ type: 'varchar', length: 255, name: 'order_id' })
  orderId!: string;

  @Column({ type: 'int', name: 'amount_minor' })
  amountMinor!: number;

  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency!: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status!: PaymentStatus;

  @Index('idx_payments_idempotency_key', { unique: true })
  @Column({ type: 'varchar', length: 255, unique: true, name: 'idempotency_key' })
  idempotencyKey!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
