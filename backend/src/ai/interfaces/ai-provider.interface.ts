import type { ParsedJobRequirement } from '../../jobs/entities/job-description.entity.js';
import type { ResumeContent } from '../../resumes/entities/resume.types.js';
import type {
  ProfileCertification,
  ProfileEducation,
  ProfileExperience,
  ProfileProject,
  ProfileSkill,
} from '../../profiles/entities/candidate-profile.entity.js';
import type { RawAiAdaptationPayload } from '../utils/factual-integrity-validator.js';

export interface ParsedProfileDraft {
  contact?: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    websiteUrl?: string;
  };
  headline: string;
  summary: string;
  location: string;
  skills: ProfileSkill[];
  experience: ProfileExperience[];
  education: ProfileEducation[];
  projects: ProfileProject[];
  certifications: ProfileCertification[];
  confidenceScore: number;
}

export interface BulletRewriteResult {
  originalBullet: string;
  rewrittenBullet: string;
  actionVerbUsed: string;
  framework: 'STAR' | 'XYZ';
  explanation: string;
  factualVerificationNotes: string;
}

export interface RequirementMatchOutput {
  requirementId: string;
  status: 'supported' | 'needs_confirmation' | 'not_evidenced' | 'not_applicable';
  confidence: number;
  evidenceQuotes: string[];
  explanation: string;
  suggestedAction: string;
}

export interface AdaptationTelemetry {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  modelId: string;
  pricingVersion: string;
}

export interface AdaptationProviderResult {
  payload: RawAiAdaptationPayload;
  telemetry: AdaptationTelemetry;
}

export interface SectionAdaptationProviderResult {
  sectionKey: string;
  adaptedContent: any;
  telemetry: AdaptationTelemetry;
}

export interface AiProvider {
  name: string;
  parseResumeText(text: string): Promise<ParsedProfileDraft>;
  parseJobDescription(text: string): Promise<ParsedJobRequirement[]>;
  matchRequirements(
    resumeContent: ResumeContent,
    requirements: ParsedJobRequirement[],
  ): Promise<RequirementMatchOutput[]>;
  rewriteBullet(
    bullet: string,
    targetRole?: string,
    metricHint?: string,
  ): Promise<BulletRewriteResult>;
  adaptResume(
    sourceResume: ResumeContent,
    benchmarkSample: ResumeContent,
    targetRole?: string,
  ): Promise<AdaptationProviderResult>;
  adaptSection(
    sectionKey: string,
    sourceSectionData: any,
    benchmarkSectionData: any,
    targetRole?: string,
  ): Promise<SectionAdaptationProviderResult>;
}
