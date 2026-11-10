import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ResumeShare } from './resume-share.entity.js';
import { Resume } from './resume.entity.js';

export type ResumeShareEventType =
  | 'view'
  | 'download_pdf'
  | 'download_docx'
  | 'print'
  | 'contact_click';

@Entity('resume_share_events')
@Index('idx_resume_share_events_share_created', ['shareId', 'createdAt'])
@Index('idx_resume_share_events_share_visitor', ['shareId', 'visitorHash'])
export class ResumeShareEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'share_id' })
  shareId!: string;

  @ManyToOne(() => ResumeShare, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'share_id' })
  share!: ResumeShare;

  @Column({ type: 'uuid', name: 'resume_id' })
  resumeId!: string;

  @ManyToOne(() => Resume, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resume_id' })
  resume!: Resume;

  @Column({ type: 'varchar', length: 30, name: 'event_type' })
  eventType!: ResumeShareEventType;

  @Column({ type: 'varchar', length: 64, nullable: true, name: 'visitor_hash' })
  visitorHash?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referrer?: string | null;

  @Column({ type: 'varchar', length: 20, default: 'desktop', name: 'device_type' })
  deviceType!: 'desktop' | 'mobile' | 'tablet' | 'bot';

  @Column({ type: 'varchar', length: 40, nullable: true })
  browser?: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  os?: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}

