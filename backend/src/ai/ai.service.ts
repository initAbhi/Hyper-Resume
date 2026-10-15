import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AiProvider,
  BulletRewriteResult,
  ParsedProfileDraft,
  RequirementMatchOutput,
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
    const configuredProvider = this.configService.get<string>('AI_PROVIDER', 'mock').toLowerCase();
    const hasGeminiKey = Boolean(this.configService.get<string>('AI_API_KEY'));

    if (configuredProvider === 'gemini' && hasGeminiKey) {
      this.activeProvider = this.geminiProvider;
      this.logger.log('Active AI provider configured: Gemini');
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
      return await this.activeProvider.rewriteBullet(bullet, targetRole, metricHint);
    } catch (err) {
      this.logger.warn(`AI Provider error during bullet rewrite, falling back to Mock provider: ${err}`);
      return this.mockProvider.rewriteBullet(bullet, targetRole, metricHint);
    }
  }
}
