import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Resume } from './resume.entity.js';
import type { ResumeContent } from './resume.types.js';

@Entity('resume_versions')
export class ResumeVersion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_resume_versions_resume_id')
  @Column({ type: 'uuid', name: 'resume_id' })
  resumeId!: string;

  @ManyToOne(() => Resume, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resume_id' })
  resume!: Resume;

  @Column({ type: 'int', name: 'version_number' })
  versionNumber!: number;

  @Column({ type: 'varchar', length: 255, name: 'change_summary' })
  changeSummary!: string;

  @Column({ type: 'jsonb', name: 'content_snapshot' })
  contentSnapshot!: ResumeContent;

  @Column({ type: 'uuid', nullable: true, name: 'job_match_id' })
  jobMatchId?: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
