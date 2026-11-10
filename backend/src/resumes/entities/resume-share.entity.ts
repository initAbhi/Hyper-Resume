import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Resume } from './resume.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('resume_shares')
export class ResumeShare extends BaseEntity {
  @Index('uq_resume_shares_resume_id', { unique: true })
  @Column({ type: 'uuid', name: 'resume_id' })
  resumeId!: string;

  @OneToOne(() => Resume, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resume_id' })
  resume!: Resume;

  @Index('idx_resume_shares_user_id')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index('uq_resume_shares_slug', { unique: true })
  @Column({ type: 'varchar', length: 100 })
  slug!: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @Column({ type: 'boolean', default: true, name: 'allow_pdf_download' })
  allowPdfDownload!: boolean;

  @Column({ type: 'boolean', default: true, name: 'allow_docx_download' })
  allowDocxDownload!: boolean;

  @Column({ type: 'boolean', default: false, name: 'hide_contact_details' })
  hideContactDetails!: boolean;

  @Column({ type: 'varchar', length: 280, nullable: true, name: 'recruiter_note' })
  recruiterNote?: string | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'expires_at' })
  expiresAt?: Date | null;

  @Column({ type: 'int', default: 0, name: 'view_count' })
  viewCount!: number;

  @Column({ type: 'int', default: 0, name: 'unique_visitor_count' })
  uniqueVisitorCount!: number;

  @Column({ type: 'int', default: 0, name: 'download_count' })
  downloadCount!: number;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_viewed_at' })
  lastViewedAt?: Date | null;
}

