import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { ResumeVersion } from '../../resumes/entities/resume-version.entity.js';

export type ApplicationStatus =
  | 'draft'
  | 'applied'
  | 'interviewing'
  | 'offer'
  | 'rejected'
  | 'archived';

@Entity('job_applications')
export class JobApplication extends BaseEntity {
  @Index('idx_job_applications_user_id')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid', nullable: true, name: 'resume_version_id' })
  resumeVersionId?: string;

  @ManyToOne(() => ResumeVersion, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'resume_version_id' })
  resumeVersion?: ResumeVersion;

  @Column({ type: 'varchar', length: 150 })
  company!: string;

  @Column({ type: 'varchar', length: 150 })
  role!: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'job_url' })
  jobUrl?: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status!: ApplicationStatus;

  @Column({ type: 'date', nullable: true, name: 'applied_date' })
  appliedDate?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
