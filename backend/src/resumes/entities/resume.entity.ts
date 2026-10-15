import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  VersionColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import type { ResumeContent } from './resume.types.js';

export type { ResumeContent };

@Entity('resumes')
export class Resume extends BaseEntity {
  @Index('idx_resumes_user_id')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 100, default: 'clean-modern', name: 'template_key' })
  templateKey!: string;

  @Column({ type: 'varchar', length: 20, default: 'en-US' })
  locale!: string;

  @Column({ type: 'boolean', default: false, name: 'is_master' })
  isMaster!: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_archived' })
  isArchived!: boolean;

  @VersionColumn({ default: 1 })
  version!: number;

  @Column({ type: 'jsonb', default: {} })
  content!: ResumeContent;
}
