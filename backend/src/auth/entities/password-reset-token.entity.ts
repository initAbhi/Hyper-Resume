import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

@Entity('password_reset_tokens')
export class PasswordResetToken extends BaseEntity {
  @Index('idx_password_reset_user_id')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Index('idx_password_reset_token_hash', { unique: true })
  @Column({ type: 'varchar', length: 128, name: 'token_hash', unique: true })
  tokenHash!: string;

  @Column({ type: 'timestamp with time zone', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'boolean', default: false, name: 'is_used' })
  isUsed!: boolean;
}

