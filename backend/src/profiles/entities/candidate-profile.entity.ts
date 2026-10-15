import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';

export interface ProfileSkill {
  name: string;
  category: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface ProfileExperience {
  id?: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  bullets: string[];
}

export interface ProfileEducation {
  id?: string;
  school: string;
  degree: string;
  field: string;
  graduationDate?: string;
  gpa?: string;
}

export interface ProfileProject {
  id?: string;
  name: string;
  description: string;
  highlights: string[];
  url?: string;
  skillsUsed?: string[];
}

export interface ProfileCertification {
  id?: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
}

@Entity('candidate_profiles')
export class CandidateProfile extends BaseEntity {
  @Index('idx_candidate_profiles_user_id', { unique: true })
  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 200, default: '' })
  headline!: string;

  @Column({ type: 'text', default: '' })
  summary!: string;

  @Column({ type: 'varchar', length: 150, default: '' })
  location!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'linkedin_url' })
  linkedinUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'github_url' })
  githubUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'website_url' })
  websiteUrl?: string;

  @Column({ type: 'jsonb', default: [] })
  skills!: ProfileSkill[];

  @Column({ type: 'jsonb', default: [] })
  experience!: ProfileExperience[];

  @Column({ type: 'jsonb', default: [] })
  education!: ProfileEducation[];

  @Column({ type: 'jsonb', default: [] })
  projects!: ProfileProject[];

  @Column({ type: 'jsonb', default: [] })
  certifications!: ProfileCertification[];
}
