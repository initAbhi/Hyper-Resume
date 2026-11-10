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

export interface ParsedLinkedInMeta {
  isLinkedInPdf: boolean;
  linkedinSlug?: string;
  hasCustomSlug?: boolean;
  detectedSections: string[];
  headlineCharCount: number;
  summaryCharCount: number;
}

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
  languages?: string[];
  sourceType?: 'linkedin_pdf' | 'standard_resume';
  linkedinMeta?: ParsedLinkedInMeta;
  confidenceScore: number;
}

export interface BulletVariantOption {
  style: 'Impact (XYZ)' | 'Executive (STAR)' | 'Technical & Concise';
  bullet: string;
  actionVerbUsed: string;
  framework: 'STAR' | 'XYZ';
  rationale: string;
}

export interface BulletRewriteResult {
  originalBullet: string;
  rewrittenBullet: string;
  actionVerbUsed: string;
  framework: 'STAR' | 'XYZ';
  explanation: string;
  factualVerificationNotes: string;
  variants?: BulletVariantOption[];
  provider?: string;
}

export interface BulletGenerateRequest {
  roleTitle: string;
  companyName?: string;
  focusArea?: string;
  existingBullets?: string[];
  targetRole?: string;
}

export interface BulletGenerateResult {
  roleTitle: string;
  bullets: BulletVariantOption[];
  factualVerificationNotes: string;
  provider?: string;
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

export interface JobTailorSuggestions {
  suggestedHeadline: string;
  suggestedSummary: string;
  bulletImprovements: Array<{
    company: string;
    originalBullet: string;
    tailoredBullet: string;
    matchedKeywords: string[];
  }>;
  factualVerificationNotes: string;
  provider?: string;
}

export type SummaryTone =
  | 'Executive'
  | 'Impact & Metrics'
  | 'Technical & Concise';

export interface SummaryHeadlineOption {
  style: string;
  headline: string;
}

export interface SummaryDraftOption {
  tone: SummaryTone;
  summary: string;
  focus: string;
}

export interface SummaryGenerateRequest {
  currentHeadline?: string;
  currentSummary?: string;
  targetRole?: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    bullets: string[];
  }>;
  projects?: Array<{
    name: string;
    description: string;
  }>;
}

export interface SummaryGenerateResult {
  headlineSuggestions: SummaryHeadlineOption[];
  summaryOptions: SummaryDraftOption[];
  factualVerificationNotes: string;
  provider?: string;
}

export type CoverLetterTone =
  | 'Executive'
  | 'Enthusiastic'
  | 'Technical'
  | 'Concise';

export type CoverLetterSectionFocus = 'all' | 'opening' | 'body' | 'closing';

export interface CoverLetterGenerateRequest {
  resumeContent: ResumeContent;
  targetRole: string;
  companyName: string;
  hiringManager?: string;
  jobDescription?: string;
  tone: CoverLetterTone;
  customFocus?: string;
  sectionFocus?: CoverLetterSectionFocus;
  existingDraft?: {
    openingParagraph?: string;
    bodyParagraphs?: string[];
    closingParagraph?: string;
  };
}

export interface CoverLetterGenerateResult {
  salutation: string;
  openingParagraph: string;
  bodyParagraphs: string[];
  closingParagraph: string;
  signOff: string;
  highlightedKeywords: string[];
  factualVerificationNotes: string;
  provider?: string;
}

export type WritingCheckCategory =
  | 'spelling'
  | 'grammar'
  | 'buzzword'
  | 'weak_phrasing';

export type WritingCheckSeverity = 'error' | 'warning' | 'suggestion';

export interface WritingIssueItem {
  id: string;
  category: WritingCheckCategory;
  severity: WritingCheckSeverity;
  locationType:
    | 'headline'
    | 'summary'
    | 'experience_bullet'
    | 'project_description';
  locationLabel: string;
  expIdx?: number;
  bulletIdx?: number;
  projIdx?: number;
  matchedText: string;
  suggestedReplacement: string;
  originalText: string;
  rewrittenText: string;
  reason: string;
}

export interface WritingCheckRequest {
  headline?: string;
  summary?: string;
  targetRole?: string;
  experience: Array<{
    title?: string;
    company?: string;
    current?: boolean;
    endDate?: string;
    bullets: string[];
  }>;
  projects?: Array<{
    name?: string;
    description?: string;
  }>;
}

export interface WritingCheckResult {
  overallWritingScore: number;
  summaryNote: string;
  issues: WritingIssueItem[];
  factualVerificationNotes: string;
  provider?: string;
}

export type LinkedInOptimizeTone =
  | 'Executive'
  | 'Impact & Metrics'
  | 'Storytelling'
  | 'Technical SEO';

export interface LinkedInOptimizeRequest {
  profile: ResumeContent;
  targetRole: string;
  industry?: string;
  tone?: LinkedInOptimizeTone;
  targetJobDescription?: string;
  publicShareUrl?: string;
}

export interface LinkedInHeadlineOption {
  id: string;
  style: string;
  headline: string;
  charCount: number;
  keywordsIncluded: string[];
  whyItWorks: string;
}

export interface LinkedInAboutOption {
  id: string;
  tone: string;
  about: string;
  previewHook: string;
  charCount: number;
  keywordsIncluded: string[];
}

export interface LinkedInExperienceOptimization {
  company: string;
  title: string;
  recruiterSearchHeadline: string;
  roleKeywords: string[];
  optimizedBullets: Array<{
    original: string;
    optimized: string;
    matchedKeywords: string[];
  }>;
}

export interface LinkedInSkillsStrategy {
  top3PinnedSkills: string[];
  evidencedSkillsToAdd: string[];
  targetRoleKeywordsToConfirm: string[];
}

export interface LinkedInFeaturedPrompt {
  title: string;
  itemType: 'Link' | 'Document' | 'Project';
  suggestedUrl?: string;
  description: string;
}

export interface LinkedInOptimizeResult {
  headlineSuggestions: LinkedInHeadlineOption[];
  aboutOptions: LinkedInAboutOption[];
  experienceOptimizations: LinkedInExperienceOptimization[];
  skillsStrategy: LinkedInSkillsStrategy;
  featuredSuggestions: LinkedInFeaturedPrompt[];
  factualVerificationNotes: string;
  provider?: string;
}

export type SectionRewriteSectionType =
  | 'summary'
  | 'experience'
  | 'projects'
  | 'custom';

export type SectionRewriteTone =
  | 'executive'
  | 'impact'
  | 'concise'
  | 'technical'
  | 'expand';

export interface SectionRewriteExperienceInput {
  title: string;
  company: string;
  bullets: string[];
}

export interface SectionRewriteProjectInput {
  name: string;
  description: string;
  highlights?: string[];
}

export interface SectionRewriteCustomInput {
  heading: string;
  subtitle?: string;
  bullets: string[];
}

export interface SectionRewriteRequest {
  sectionType: SectionRewriteSectionType;
  sectionTitle?: string;
  tone: SectionRewriteTone;
  targetRole?: string;
  instruction?: string;
  candidateSkills?: string[];
  summaryText?: string;
  experienceEntries?: SectionRewriteExperienceInput[];
  projectEntries?: SectionRewriteProjectInput[];
  customEntries?: SectionRewriteCustomInput[];
}

export interface SectionRewriteResult {
  sectionType: SectionRewriteSectionType;
  tone: SectionRewriteTone;
  summaryRewrite?: {
    original: string;
    rewritten: string;
  };
  experienceRewrites?: Array<{
    index: number;
    title: string;
    company: string;
    originalBullets: string[];
    rewrittenBullets: string[];
  }>;
  projectRewrites?: Array<{
    index: number;
    name: string;
    originalDescription: string;
    rewrittenDescription: string;
    originalHighlights: string[];
    rewrittenHighlights: string[];
  }>;
  customRewrites?: Array<{
    index: number;
    heading: string;
    originalBullets: string[];
    rewrittenBullets: string[];
  }>;
  changesSummary: string;
  factualVerificationNotes: string;
  warnings?: string[];
  provider?: string;
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
  generateBullets(input: BulletGenerateRequest): Promise<BulletGenerateResult>;
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
  tailorForJob?(
    resumeContent: ResumeContent,
    jobTitle: string,
    companyName: string | undefined,
    requirements: ParsedJobRequirement[],
  ): Promise<JobTailorSuggestions>;
  generateSummaryAndHeadlines(
    input: SummaryGenerateRequest,
  ): Promise<SummaryGenerateResult>;
  generateCoverLetter(
    input: CoverLetterGenerateRequest,
  ): Promise<CoverLetterGenerateResult>;
  checkWritingQuality?(
    input: WritingCheckRequest,
  ): Promise<WritingCheckResult>;
  optimizeLinkedInProfile?(
    input: LinkedInOptimizeRequest,
  ): Promise<LinkedInOptimizeResult>;
  rewriteSection?(
    input: SectionRewriteRequest,
  ): Promise<SectionRewriteResult>;
}
