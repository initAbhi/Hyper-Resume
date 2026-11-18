import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Resume } from './resume.entity.js';

export type AtsAuditDimensionKey =
  | 'formatting'
  | 'metrics'
  | 'action_verbs'
  | 'technical_depth'
  | 'brevity';

export interface AtsAuditDimension {
  key: AtsAuditDimensionKey;
  label: string;
  weight: number;
  score: number;
  status: 'strong' | 'moderate' | 'needs_work';
  summary: string;
}

export interface AtsParserRisk {
  id: string;
  severity: 'critical' | 'warning' | 'pass';
  category: 'contact' | 'sections' | 'dates' | 'formatting' | 'length';
  message: string;
  fixHint?: string;
}

export interface AtsStackAlignment {
  totalSkills: number;
  corroboratedSkills: string[];
  unreferencedSkills: string[];
  unlistedSkills?: string[];
  hardSkills?: string[];
  softSkills?: string[];
}

export interface AtsBulletQualityItem {
  bullet: string;
  section?: 'Experience' | 'Projects';
  contextLabel?: string;
  wordCount?: number;
  hasActionVerb: boolean;
  hasMetric: boolean;
  lengthStatus?: 'short' | 'ideal' | 'long';
  feedback: string;
  xyzFormulaMet?: boolean;
  actionVerbCategory?: string;
  suggestedRewrite?: string;
}

export interface AtsParsedPreview {
  contact: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    websiteUrl?: string;
  };
  headline?: string;
  summary?: string;
  experience: Array<{
    company: string;
    title: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    durationText?: string;
    bulletCount: number;
  }>;
  education: Array<{
    school: string;
    degree?: string;
    field?: string;
    graduationDate?: string;
  }>;
  skillsByCategory: {
    hardSkills: string[];
    softSkills: string[];
    toolsAndCloud: string[];
    other: string[];
  };
  projects: Array<{
    name: string;
    techStack?: string[];
    highlightsCount: number;
  }>;
  rawNormalizedText: string;
}

export interface AtsJobDescriptionMatch {
  matchRate: number;
  matchedKeywords: Array<{
    keyword: string;
    category: 'hard_skill' | 'soft_skill' | 'tool' | 'domain';
    resumeCount: number;
    jdImportance: 'critical' | 'high' | 'medium';
  }>;
  missingKeywords: Array<{
    keyword: string;
    category: 'hard_skill' | 'soft_skill' | 'tool' | 'domain';
    jdImportance: 'critical' | 'high' | 'medium';
    recommendation: string;
  }>;
  keywordStuffingAlerts: Array<{
    keyword: string;
    count: number;
    warning: string;
  }>;
  recruiterSearchSimulation: {
    passedQueries: string[];
    failedQueries: string[];
    readinessSummary: string;
  };
  hardSkillsMatch?: {
    matched: number;
    total: number;
    percentage: number;
  };
  softSkillsMatch?: {
    matched: number;
    total: number;
    percentage: number;
  };
  titleAlignment?: {
    targetTitle?: string;
    detectedTitle?: string;
    score: number;
    status: 'strong' | 'moderate' | 'weak';
  };
}

export interface AtsSystemSimulations {
  workdayReadiness: {
    status: 'pass' | 'warning' | 'fail';
    score: number;
    notes: string[];
  };
  taleoReadiness: {
    status: 'pass' | 'warning' | 'fail';
    score: number;
    notes: string[];
  };
  greenhouseReadiness: {
    status: 'pass' | 'warning' | 'fail';
    score: number;
    notes: string[];
  };
}

export interface AtsActionVerbAnalysis {
  totalVerbs: number;
  distinctVerbs: number;
  repeatedVerbs: Array<{
    verb: string;
    count: number;
    suggestedAlternatives: string[];
  }>;
  verbsByCategory: {
    leadership: string[];
    engineering: string[];
    optimization: string[];
    innovation: string[];
    execution: string[];
  };
}

export interface ResumeAuditFindings {
  atsScore?: number;
  matchScore?: number;
  compositeScore?: number;
  actionVerbsCount: number;
  metricsCount: number;
  missingSections: string[];
  detectedSections?: string[];
  formattingFlags: string[];
  wordCount?: number;
  idealBulletCount?: number;
  shortBulletsCount?: number;
  longBulletsCount?: number;
  dimensions?: AtsAuditDimension[];
  parserRisks?: AtsParserRisk[];
  stackAlignment?: AtsStackAlignment;
  bulletQuality: AtsBulletQualityItem[];
  xyzFormulaBulletsCount?: number;
  repeatedVerbsCount?: number;
  pronounsCount?: number;
  parsedPreview?: AtsParsedPreview;
  jobDescriptionMatch?: AtsJobDescriptionMatch;
  atsSystemSimulations?: AtsSystemSimulations;
  actionVerbAnalysis?: AtsActionVerbAnalysis;
  writingQuality?: {
    score: number;
    issueCount: number;
    spellingCount: number;
    grammarCount: number;
    buzzwordCount: number;
    weakPhrasingCount: number;
  };
}

@Entity('resume_analyses')
export class ResumeAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_resume_analyses_user_id')
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index('idx_resume_analyses_resume_id')
  @Column({ type: 'uuid', name: 'resume_id' })
  resumeId!: string;

  @ManyToOne(() => Resume, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resume_id' })
  resume!: Resume;

  @Column({ type: 'varchar', length: 50, name: 'analysis_type' })
  analysisType!: 'ats_check' | 'comprehensive_audit' | 'ats_audit';

  @Column({ type: 'int' })
  score!: number;

  @Column({ type: 'jsonb', default: {} })
  findings!: ResumeAuditFindings;

  @Column({ type: 'jsonb', default: [] })
  recommendations!: string[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
