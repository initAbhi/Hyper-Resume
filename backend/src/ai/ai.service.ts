import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AiProvider,
  AdaptationProviderResult,
  BulletGenerateRequest,
  BulletGenerateResult,
  BulletRewriteResult,
  JobTailorSuggestions,
  SummaryGenerateRequest,
  SummaryGenerateResult,
  CoverLetterGenerateRequest,
  CoverLetterGenerateResult,
  LinkedInOptimizeRequest,
  LinkedInOptimizeResult,
  SectionRewriteRequest,
  SectionRewriteResult,
  WritingCheckRequest,
  WritingCheckResult,
  ParsedProfileDraft,
  RequirementMatchOutput,
  SectionAdaptationProviderResult,
} from './interfaces/ai-provider.interface.js';
import { MockAiProvider } from './providers/mock-ai.provider.js';
import { GeminiAiProvider } from './providers/gemini-ai.provider.js';
import type { ParsedJobRequirement } from '../jobs/entities/job-description.entity.js';
import type { ResumeContent } from '../resumes/entities/resume.types.js';

@Injectable()
export class AiService implements AiProvider {
  private readonly logger = new Logger(AiService.name);
  private activeProvider: AiProvider;

  constructor(
    private readonly configService: ConfigService,
    private readonly mockProvider: MockAiProvider,
    private readonly geminiProvider: GeminiAiProvider,
  ) {
    const configuredProvider = this.configService.get<string>('AI_PROVIDER', 'gemini').toLowerCase();
    const hasGeminiKey = Boolean(
      this.configService.get<string>('AI_API_KEY') || this.configService.get<string>('GEMINI_API_KEY'),
    );

    if (configuredProvider !== 'mock' && hasGeminiKey) {
      this.activeProvider = this.geminiProvider;
      this.logger.log('Active AI provider configured: Gemini (Live Inference)');
    } else {
      this.activeProvider = this.mockProvider;
      this.logger.log('Active AI provider configured: Mock (Deterministic & Offline)');
    }
  }

  get name(): string {
    return this.activeProvider.name;
  }

  async parseResumeText(text: string): Promise<ParsedProfileDraft> {
    try {
      return await this.activeProvider.parseResumeText(text);
    } catch (err) {
      this.logger.warn(`AI Provider error during resume parsing, falling back to Mock provider: ${err}`);
      return this.mockProvider.parseResumeText(text);
    }
  }

  async parseJobDescription(text: string): Promise<ParsedJobRequirement[]> {
    try {
      return await this.activeProvider.parseJobDescription(text);
    } catch (err) {
      this.logger.warn(`AI Provider error during JD parsing, falling back to Mock provider: ${err}`);
      return this.mockProvider.parseJobDescription(text);
    }
  }

  async matchRequirements(
    resumeContent: ResumeContent,
    requirements: ParsedJobRequirement[],
  ): Promise<RequirementMatchOutput[]> {
    try {
      return await this.activeProvider.matchRequirements(resumeContent, requirements);
    } catch (err) {
      this.logger.warn(`AI Provider error during matching, falling back to Mock provider: ${err}`);
      return this.mockProvider.matchRequirements(resumeContent, requirements);
    }
  }

  async rewriteBullet(
    bullet: string,
    targetRole?: string,
    metricHint?: string,
  ): Promise<BulletRewriteResult> {
    try {
      const res = await this.activeProvider.rewriteBullet(bullet, targetRole, metricHint);
      return { ...res, provider: res.provider || this.activeProvider.name };
    } catch (err) {
      this.logger.warn(`AI Provider error during bullet rewrite, falling back to Mock provider: ${err}`);
      return this.mockProvider.rewriteBullet(bullet, targetRole, metricHint);
    }
  }

  async generateBullets(input: BulletGenerateRequest): Promise<BulletGenerateResult> {
    try {
      const res = await this.activeProvider.generateBullets(input);
      return { ...res, provider: res.provider || this.activeProvider.name };
    } catch (err) {
      this.logger.warn(`AI Provider error during bullet generation, falling back to Mock provider: ${err}`);
      return this.mockProvider.generateBullets(input);
    }
  }

  async adaptResume(
    sourceResume: ResumeContent,
    benchmarkSample: ResumeContent,
    targetRole?: string,
  ): Promise<AdaptationProviderResult> {
    return this.activeProvider.adaptResume(sourceResume, benchmarkSample, targetRole);
  }

  async adaptSection(
    sectionKey: string,
    sourceSectionData: any,
    benchmarkSectionData: any,
    targetRole?: string,
  ): Promise<SectionAdaptationProviderResult> {
    return this.activeProvider.adaptSection(sectionKey, sourceSectionData, benchmarkSectionData, targetRole);
  }

  async tailorForJob(
    resumeContent: ResumeContent,
    jobTitle: string,
    companyName: string | undefined,
    requirements: ParsedJobRequirement[],
  ): Promise<JobTailorSuggestions> {
    try {
      if (this.activeProvider.tailorForJob) {
        const res = await this.activeProvider.tailorForJob(resumeContent, jobTitle, companyName, requirements);
        return { ...res, provider: res.provider || this.activeProvider.name };
      }
      return this.mockProvider.tailorForJob(resumeContent, jobTitle, companyName, requirements);
    } catch (err) {
      this.logger.warn(`AI Provider error during job tailoring, falling back to Mock provider: ${err}`);
      return this.mockProvider.tailorForJob(resumeContent, jobTitle, companyName, requirements);
    }
  }

  async generateSummaryAndHeadlines(
    input: SummaryGenerateRequest,
  ): Promise<SummaryGenerateResult> {
    if (this.activeProvider.name === 'mock') {
      return this.mockProvider.generateSummaryAndHeadlines(input);
    }

    try {
      const res = await this.activeProvider.generateSummaryAndHeadlines(input);
      return {
        ...res,
        provider: res.provider || this.activeProvider.name,
      };
    } catch (err) {
      this.logger.warn(
        `AI Provider error during summary/headline generation, falling back to Mock provider: ${err}`,
      );
      return this.mockProvider.generateSummaryAndHeadlines(input);
    }
  }

  async generateCoverLetter(
    input: CoverLetterGenerateRequest,
  ): Promise<CoverLetterGenerateResult> {
    if (this.activeProvider.name === 'mock') {
      return this.mockProvider.generateCoverLetter(input);
    }

    try {
      const res = await this.activeProvider.generateCoverLetter(input);
      return {
        ...res,
        provider: res.provider || this.activeProvider.name,
      };
    } catch (err) {
      this.logger.warn(
        `AI Provider error during cover letter generation, falling back to Mock provider: ${err}`,
      );
      return this.mockProvider.generateCoverLetter(input);
    }
  }

  async checkWritingQuality(
    input: WritingCheckRequest,
  ): Promise<WritingCheckResult> {
    if (this.activeProvider.name === 'mock') {
      return this.mockProvider.checkWritingQuality(input);
    }

    try {
      if (this.activeProvider.checkWritingQuality) {
        const res = await this.activeProvider.checkWritingQuality(input);
        return {
          ...res,
          provider: res.provider || this.activeProvider.name,
        };
      }
      return this.mockProvider.checkWritingQuality(input);
    } catch (err) {
      this.logger.warn(
        `AI Provider error during writing quality check, falling back to Mock provider: ${err}`,
      );
      return this.mockProvider.checkWritingQuality(input);
    }
  }

  async optimizeLinkedInProfile(
    input: LinkedInOptimizeRequest,
  ): Promise<LinkedInOptimizeResult> {
    if (this.activeProvider.name === 'mock') {
      return this.mockProvider.optimizeLinkedInProfile(input);
    }

    try {
      if (this.activeProvider.optimizeLinkedInProfile) {
        const res = await this.activeProvider.optimizeLinkedInProfile(input);
        return {
          ...res,
          provider: res.provider || this.activeProvider.name,
        };
      }
      return this.mockProvider.optimizeLinkedInProfile(input);
    } catch (err) {
      this.logger.warn(
        `AI Provider error during LinkedIn optimization, falling back to Mock provider: ${err}`,
      );
      return this.mockProvider.optimizeLinkedInProfile(input);
    }
  }

  async rewriteSection(
    input: SectionRewriteRequest,
  ): Promise<SectionRewriteResult> {
    if (this.activeProvider.name === 'mock') {
      return this.mockProvider.rewriteSection(input);
    }

    try {
      if (this.activeProvider.rewriteSection) {
        const res = await this.activeProvider.rewriteSection(input);
        return {
          ...res,
          provider: res.provider || this.activeProvider.name,
        };
      }
      return this.mockProvider.rewriteSection(input);
    } catch (err) {
      this.logger.warn(
        `AI Provider error during section rewrite, falling back to Mock provider: ${err}`,
      );
      return this.mockProvider.rewriteSection(input);
    }
  }
}
