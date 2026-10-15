import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';

export interface ParsedJobRequirement {
  id: string;
  text: string;
  type: 'required_skill' | 'preferred_skill' | 'experience' | 'education' | 'responsibility' | 'domain';
  importance: 'critical' | 'high' | 'medium' | 'low';
  keywords: string[];
}

@Entity('job_descriptions')
export class JobDescription extends BaseEntity {
  @Index('idx_job_descriptions_user_id')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 150, nullable: true, name: 'company_name' })
  companyName?: string;

  @Column({ type: 'text', name: 'original_text' })
  originalText!: string;

  @Column({ type: 'jsonb', default: [], name: 'parsed_requirements' })
  parsedRequirements!: ParsedJobRequirement[];

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'source_url' })
  sourceUrl?: string;
}
