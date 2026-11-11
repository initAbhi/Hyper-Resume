import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Optional,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import crypto from 'node:crypto';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AiService } from './ai.service.js';
import type {
  BulletRewriteResult,
  SectionRewriteSectionType,
  SectionRewriteTone,
} from './interfaces/ai-provider.interface.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../users/entities/user.entity.js';
import { CREDIT_COSTS, CreditsService } from '../credits/credits.service.js';
import type { CreditTransactionType } from '../credits/entities/credit-ledger.entity.js';
import { analyzePlainResumeTextAts } from './utils/ats-audit-engine.js';
import { createPublicRateLimiter } from '../common/utils/public-rate-limit.util.js';

export class BulletImproveDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(600)
  bulletText!: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  targetRole?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  metricHint?: string;
}

export class BulletGenerateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  roleTitle!: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  companyName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(400)
  focusArea?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @IsOptional()
  existingBullets?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(150)
  targetRole?: string;
}

export class SummaryExperienceItemDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  company?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(12)
  @IsOptional()
  bullets?: string[];
}

export class SummaryProjectItemDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(600)
  description?: string;
}

export class SummaryGenerateDto {
  @IsString()
  @IsOptional()
  @MaxLength(250)
  currentHeadline?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  currentSummary?: string;

  @IsString()
  @IsOptional()
  @MaxLength(180)
  targetRole?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(60)
  @IsOptional()
  skills?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SummaryExperienceItemDto)
  @ArrayMaxSize(12)
  @IsOptional()
  experience?: SummaryExperienceItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SummaryProjectItemDto)
  @ArrayMaxSize(8)
  @IsOptional()
  projects?: SummaryProjectItemDto[];
}

export class WritingExperienceItemDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  company?: string;

  @IsBoolean()
  @IsOptional()
  current?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  endDate?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(15)
  @IsOptional()
  bullets?: string[];
}

export class WritingCheckDto {
  @IsString()
  @IsOptional()
  @MaxLength(300)
  headline?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2500)
  summary?: string;

  @IsString()
  @IsOptional()
  @MaxLength(180)
  targetRole?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WritingExperienceItemDto)
  @ArrayMaxSize(15)
  @IsOptional()
  experience?: WritingExperienceItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SummaryProjectItemDto)
  @ArrayMaxSize(10)
  @IsOptional()
  projects?: SummaryProjectItemDto[];
}

export class SectionRewriteExperienceItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  company?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(15)
  bullets!: string[];
}

export class SectionRewriteProjectItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(12)
  @IsOptional()
  highlights?: string[];
}

export class SectionRewriteCustomItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  heading!: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  subtitle?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(12)
  bullets!: string[];
}

export class SectionRewriteDto {
  @IsString()
  @IsIn(['summary', 'experience', 'projects', 'custom'])
  sectionType!: SectionRewriteSectionType;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  sectionTitle?: string;

  @IsString()
  @IsIn(['executive', 'impact', 'concise', 'technical', 'expand'])
  tone!: SectionRewriteTone;

  @IsString()
  @IsOptional()
  @MaxLength(180)
  targetRole?: string;

  @IsString()
  @IsOptional()
  @MaxLength(350)
  instruction?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(45)
  @IsOptional()
  candidateSkills?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(2500)
  summaryText?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionRewriteExperienceItemDto)
  @ArrayMaxSize(12)
  @IsOptional()
  experienceEntries?: SectionRewriteExperienceItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionRewriteProjectItemDto)
  @ArrayMaxSize(10)
  @IsOptional()
  projectEntries?: SectionRewriteProjectItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionRewriteCustomItemDto)
  @ArrayMaxSize(12)
  @IsOptional()
  customEntries?: SectionRewriteCustomItemDto[];
}

export class PlainTextAtsAuditDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(25)
  @MaxLength(25000)
  resumeText!: string;

  @IsString()
  @IsOptional()
  @MaxLength(180)
  targetRole?: string;
}

@Controller('ai')
export class AiController {
  private readonly enforcePublicRateLimit = createPublicRateLimiter(15, 10 * 60 * 1000);

  constructor(
    private readonly aiService: AiService,
    @Optional()
    private readonly creditsService?: CreditsService,
  ) {}

  private async runWithFeatureCredit<T>(
    userId: string | undefined,
    cost: number,
    txType: CreditTransactionType,
    description: string,
    work: () => Promise<T>,
  ): Promise<T> {
    if (!this.creditsService || !userId || cost <= 0) {
      return work();
    }

    const opKey = `ai:${txType}:${userId}:${crypto.randomUUID()}`;
    const access = await this.creditsService.consumeFeatureAccess(
      userId,
      cost,
      txType,
      opKey,
      description,
    );

    try {
      return await work();
    } catch (err) {
      if (access.accessGrantedVia === 'credits') {
        await this.creditsService.refundCredits(userId, cost, opKey, `${description} failed`);
      }
      throw err;
    }
  }

  @Post('bullet-improve')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async improveBullet(@CurrentUser() user: User, @Body() dto: BulletImproveDto) {
    const result = await this.runWithFeatureCredit(
      user?.id,
      CREDIT_COSTS.BULLET_REWRITE,
      'ai_tailor',
      'AI bullet rewrite',
      () => this.aiService.rewriteBullet(dto.bulletText, dto.targetRole, dto.metricHint),
    );
    return this.formatImproveResponse(result);
  }

  @Post('bullet-generate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async generateBullets(@CurrentUser() user: User, @Body() dto: BulletGenerateDto) {
    return this.runWithFeatureCredit(
      user?.id,
      CREDIT_COSTS.BULLET_REWRITE,
      'ai_tailor',
      'AI bullet generation',
      () =>
        this.aiService.generateBullets({
          roleTitle: dto.roleTitle,
          companyName: dto.companyName,
          focusArea: dto.focusArea,
          existingBullets: dto.existingBullets,
          targetRole: dto.targetRole,
        }),
    );
  }

  @Post('public/bullet-improve')
  @HttpCode(HttpStatus.OK)
  async improveBulletPublic(
    @Body() dto: BulletImproveDto,
    @Req() req: Request,
  ) {
    this.enforcePublicRateLimit(req);
    const result = await this.aiService.rewriteBullet(
      dto.bulletText,
      dto.targetRole,
      dto.metricHint,
    );
    return this.formatImproveResponse(result);
  }

  @Post('public/bullet-generate')
  @HttpCode(HttpStatus.OK)
  async generateBulletsPublic(
    @Body() dto: BulletGenerateDto,
    @Req() req: Request,
  ) {
    this.enforcePublicRateLimit(req);
    return this.aiService.generateBullets({
      roleTitle: dto.roleTitle,
      companyName: dto.companyName,
      focusArea: dto.focusArea,
      existingBullets: dto.existingBullets,
      targetRole: dto.targetRole,
    });
  }

  @Post('summary-generate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async generateSummaryAndHeadlines(
    @CurrentUser() user: User,
    @Body() dto: SummaryGenerateDto,
  ) {
    const hasSignal =
      Boolean(dto.targetRole?.trim()) ||
      Boolean(dto.currentHeadline?.trim()) ||
      Boolean(dto.currentSummary?.trim()) ||
      (dto.skills?.length ?? 0) > 0 ||
      (dto.experience?.length ?? 0) > 0;

    if (!hasSignal) {
      throw new HttpException(
        'Add at least a target role, skill, or experience entry before generating summaries.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.runWithFeatureCredit(
      user?.id,
      CREDIT_COSTS.BULLET_REWRITE,
      'ai_tailor',
      'AI summary generation',
      () =>
        this.aiService.generateSummaryAndHeadlines({
          currentHeadline: dto.currentHeadline,
          currentSummary: dto.currentSummary,
          targetRole: dto.targetRole,
          skills: (dto.skills || []).map((s) => s.trim()).filter(Boolean),
          experience: (dto.experience || []).map((exp) => ({
            title: exp.title?.trim() || '',
            company: exp.company?.trim() || '',
            bullets: (exp.bullets || []).map((b) => b.trim()).filter(Boolean),
          })),
          projects: (dto.projects || [])
            .map((proj) => ({
              name: proj.name?.trim() || '',
              description: proj.description?.trim() || '',
            }))
            .filter((p) => p.name || p.description),
        }),
    );
  }

  @Post('writing-check')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async checkWritingQuality(@Body() dto: WritingCheckDto) {
    return this.runWritingCheck(dto);
  }

  @Post('section-rewrite')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async rewriteSection(@CurrentUser() user: User, @Body() dto: SectionRewriteDto) {
    if (dto.sectionType === 'summary' && !dto.summaryText?.trim()) {
      throw new HttpException(
        'Provide a summary draft before rewriting this section.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      dto.sectionType === 'experience' &&
      !(dto.experienceEntries || []).some((e) => (e.bullets || []).some((b) => b.trim().length > 0))
    ) {
      throw new HttpException(
        'Add at least one experience bullet before rewriting the Experience section.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      dto.sectionType === 'projects' &&
      !(dto.projectEntries || []).some(
        (p) => Boolean(p.description?.trim()) || (p.highlights || []).some((h) => h.trim().length > 0),
      )
    ) {
      throw new HttpException(
        'Add a project description or highlight before rewriting Projects.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      dto.sectionType === 'custom' &&
      !(dto.customEntries || []).some((c) => (c.bullets || []).some((b) => b.trim().length > 0))
    ) {
      throw new HttpException(
        'Add at least one detail bullet in this custom section before rewriting.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.runWithFeatureCredit(
      user?.id,
      CREDIT_COSTS.ADAPT_SECTION,
      'ai_adapt',
      `AI section rewrite (${dto.sectionType})`,
      () =>
        this.aiService.rewriteSection({
          sectionType: dto.sectionType,
          sectionTitle: dto.sectionTitle,
          tone: dto.tone,
          targetRole: dto.targetRole,
          instruction: dto.instruction,
          candidateSkills: (dto.candidateSkills || []).map((s) => s.trim()).filter(Boolean),
          summaryText: dto.summaryText,
          experienceEntries: (dto.experienceEntries || []).map((e) => ({
            title: e.title.trim(),
            company: (e.company || '').trim(),
            bullets: (e.bullets || []).map((b) => b.trim()).filter(Boolean),
          })),
          projectEntries: (dto.projectEntries || []).map((p) => ({
            name: p.name.trim(),
            description: (p.description || '').trim(),
            highlights: (p.highlights || []).map((h) => h.trim()).filter(Boolean),
          })),
          customEntries: (dto.customEntries || []).map((c) => ({
            heading: c.heading.trim(),
            subtitle: c.subtitle?.trim() || undefined,
            bullets: (c.bullets || []).map((b) => b.trim()).filter(Boolean),
          })),
        }),
    );
  }

  @Post('public/writing-check')
  @HttpCode(HttpStatus.OK)
  async checkWritingQualityPublic(
    @Body() dto: WritingCheckDto,
    @Req() req: Request,
  ) {
    this.enforcePublicRateLimit(req);
    return this.runWritingCheck(dto);
  }

  @Post('ats-audit')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async auditResumeText(@Body() dto: PlainTextAtsAuditDto) {
    return analyzePlainResumeTextAts(dto.resumeText, dto.targetRole);
  }

  @Post('public/ats-audit')
  @HttpCode(HttpStatus.OK)
  async auditResumeTextPublic(
    @Body() dto: PlainTextAtsAuditDto,
    @Req() req: Request,
  ) {
    this.enforcePublicRateLimit(req);
    return analyzePlainResumeTextAts(dto.resumeText, dto.targetRole);
  }

  private async runWritingCheck(dto: WritingCheckDto) {
    const hasText =
      Boolean(dto.headline?.trim()) ||
      Boolean(dto.summary?.trim()) ||
      (dto.experience || []).some((exp) => (exp.bullets || []).some((b) => b.trim().length > 0)) ||
      (dto.projects || []).some((p) => Boolean(p.description?.trim()));

    if (!hasText) {
      throw new HttpException(
        'Provide a summary, headline, or experience bullets to check.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.aiService.checkWritingQuality({
      headline: dto.headline,
      summary: dto.summary,
      targetRole: dto.targetRole,
      experience: (dto.experience || []).map((exp) => ({
        title: exp.title,
        company: exp.company,
        current: exp.current,
        endDate: exp.endDate,
        bullets: (exp.bullets || []).filter((b) => typeof b === 'string' && b.trim().length > 0),
      })),
      projects: (dto.projects || []).map((proj) => ({
        name: proj.name,
        description: proj.description,
      })),
    });
  }

  private formatImproveResponse(result: BulletRewriteResult) {
    return {
      improvedBullet: result.rewrittenBullet,
      originalBullet: result.originalBullet,
      framework: result.framework,
      actionVerbUsed: result.actionVerbUsed,
      explanation: result.explanation,
      factualVerificationNotes: result.factualVerificationNotes,
      variants: result.variants || [
        {
          style: 'Impact (XYZ)' as const,
          bullet: result.rewrittenBullet,
          actionVerbUsed: result.actionVerbUsed,
          framework: result.framework,
          rationale: result.explanation,
        },
      ],
      provider: result.provider || 'gemini',
    };
  }
}
