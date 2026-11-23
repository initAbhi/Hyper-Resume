import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ContactTopic =
  | 'billing'
  | 'technical'
  | 'account'
  | 'product'
  | 'partnership'
  | 'other';

export type ContactStatus = 'new' | 'in_progress' | 'resolved' | 'spam';

@Entity('contact_submissions')
export class ContactSubmission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120, name: 'full_name' })
  fullName!: string;

  @Index('idx_contact_submissions_email')
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 40 })
  topic!: ContactTopic;

  @Column({ type: 'varchar', length: 200 })
  subject!: string;

  @Column({ type: 'text' })
  message!: string;

  @Index('idx_contact_submissions_status')
  @Column({ type: 'varchar', length: 20, default: 'new' })
  status!: ContactStatus;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId?: string | null;

  @Column({ type: 'varchar', length: 64, name: 'ip_hash', nullable: true })
  ipHash?: string | null;

  @Column({ type: 'varchar', length: 255, name: 'user_agent', nullable: true })
  userAgent?: string | null;

  @Column({ type: 'text', name: 'admin_notes', nullable: true })
  adminNotes?: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
