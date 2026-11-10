import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Resume } from '../../resumes/entities/resume.entity.js';

export type CoverLetterTone =
  | 'Executive'
  | 'Enthusiastic'
  | 'Technical'
  | 'Concise';

export type CoverLetterTemplateKey = 'executive' | 'modern' | 'classic';

@Entity('cover_letters')
export class CoverLetter {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_cover_letters_user_updated')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index('idx_cover_letters_resume_id')
  @Column({ type: 'uuid', nullable: true, name: 'resume_id' })
  resumeId?: string | null;

  @ManyToOne(() => Resume, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'resume_id' })
  resume?: Resume | null;

  @Column({ type: 'uuid', nullable: true, name: 'job_match_id' })
  jobMatchId?: string | null;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 180, name: 'target_role' })
  targetRole!: string;

  @Column({ type: 'varchar', length: 180, name: 'company_name' })
  companyName!: string;

  @Column({ type: 'varchar', length: 140, nullable: true, name: 'hiring_manager' })
  hiringManager?: string | null;

  @Column({ type: 'text', nullable: true, name: 'job_description' })
  jobDescription?: string | null;

  @Column({ type: 'varchar', length: 40, default: 'Executive' })
  tone!: CoverLetterTone;

  @Column({ type: 'varchar', length: 40, default: 'executive', name: 'template_key' })
  templateKey!: CoverLetterTemplateKey;

  @Column({ type: 'varchar', length: 20, default: '#285FEA', name: 'accent_color' })
  accentColor!: string;

  @Column({ type: 'varchar', length: 150, name: 'sender_name' })
  senderName!: string;

  @Column({ type: 'varchar', length: 150, nullable: true, name: 'sender_email' })
  senderEmail?: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true, name: 'sender_phone' })
  senderPhone?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true, name: 'sender_location' })
  senderLocation?: string | null;

  @Column({ type: 'varchar', length: 220, nullable: true, name: 'recipient_line' })
  recipientLine?: string | null;

  @Column({ type: 'varchar', length: 150, default: 'Dear Hiring Team,' })
  salutation!: string;

  @Column({ type: 'text', name: 'opening_paragraph' })
  openingParagraph!: string;

  @Column({ type: 'jsonb', default: [], name: 'body_paragraphs' })
  bodyParagraphs!: string[];

  @Column({ type: 'text', name: 'closing_paragraph' })
  closingParagraph!: string;

  @Column({ type: 'varchar', length: 120, default: 'Sincerely,', name: 'sign_off' })
  signOff!: string;

  @Column({ type: 'jsonb', default: [], name: 'highlighted_keywords' })
  highlightedKeywords!: string[];

  @Column({ type: 'text', nullable: true, name: 'factual_verification_notes' })
  factualVerificationNotes?: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  provider?: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}

