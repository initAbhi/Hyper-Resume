import {
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobMatch, type RequirementMatchAnalysis, type ScoreComponents } from './entities/job-match.entity.js';
import { Resume } from '../resumes/entities/resume.entity.js';
import type { ResumeContent } from '../resumes/entities/resume.types.js';
import { JobDescription, type ParsedJobRequirement } from '../jobs/entities/job-description.entity.js';
import { CreditLedger } from '../credits/entities/credit-ledger.entity.js';
import { AiService } from '../ai/ai.service.js';
import { ResumesService } from '../resumes/resumes.service.js';
import { CreateJobMatchDto } from './dto/create-job-match.dto.js';
import { CreateTailoredResumeDto } from './dto/create-tailored-resume.dto.js';
import type { PublicJobMatchDto } from './dto/public-job-match.dto.js';
import { validateAndSanitizeMetrics } from '../ai/utils/factual-integrity-validator.js';
import { extractStructuredContentFromText } from '../ai/utils/ats-audit-engine.js';

@Injectable()
export class JobMatchingService {
  private readonly logger = new Logger(JobMatchingService.name);

  constructor(
    @InjectRepository(JobMatch)
    private readonly jobMatchRepository: Repository<JobMatch>,
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(JobDescription)
    private readonly jobRepository: Repository<JobDescription>,
    @InjectRepository(CreditLedger)
    private readonly creditLedgerRepository: Repository<CreditLedger>,
    private readonly aiService: AiService,
    @Optional() private readonly resumesService?: ResumesService,
  ) {}

  async createJobMatch(userId: string, dto: CreateJobMatchDto): Promise<JobMatch> {
    this.logger.log(`Initiating job match analysis for user ${userId}, resume ${dto.resumeId}, job ${dto.jobDescriptionId}`);

    // 1. Verify Resume ownership
    const resume = await this.resumeRepository.findOne({
      where: { id: dto.resumeId, userId, isArchived: false },
    });
    if (!resume) {
      throw new NotFoundException('Resume not found or access denied');
    }

    // 2. Verify Job Description ownership
    const job = await this.jobRepository.findOne({
      where: { id: dto.jobDescriptionId, userId },
    });
    if (!job) {
      throw new NotFoundException('Job description not found or access denied');
    }

    // 3-5. Evaluate requirements, 5-component scores, and recommendations via shared pipeline
    const {
      overallScore,
      scoreComponents,
      requirementsAnalysis,
      recommendations,
    } = await this.evaluateRequirementsAgainstContent(
      resume.content,
      job.parsedRequirements,
    );

    // 6. Persist Job Match
    const jobMatch = this.jobMatchRepository.create({
      userId,
      resumeId: resume.id,
      jobDescriptionId: job.id,
      overallScore,
      scoreComponents,
      requirementsAnalysis,
      recommendations,
    });
    const savedMatch = await this.jobMatchRepository.save(jobMatch);
    savedMatch.jobDescription = job;

    // 7. Deduct 1 credit for completed match analysis (if available)
    const { sum } = await this.creditLedgerRepository
      .createQueryBuilder('ledger')
      .select('COALESCE(SUM(ledger.amount), 0)', 'sum')
      .where('ledger.user_id = :userId', { userId })
      .getRawOne();

    if (Number(sum) > 0) {
      const deduction = this.creditLedgerRepository.create({
        userId,
        amount: -1,
        transactionType: 'resume_analysis',
        idempotencyKey: `match-${savedMatch.id}`,
        description: `Job match analysis: ${job.title}`,
        metadata: { matchId: savedMatch.id },
      });
      await this.creditLedgerRepository.save(deduction);
    }

    this.logger.log(`Job match analysis completed: score ${overallScore}% for resume ${resume.id} against job "${job.title}"`);
    return savedMatch;
  }

  /**
   * Executes real AI/deterministic requirement extraction and 5-component match scoring
   * for public tool requests without writing database rows or deducting workspace credits.
   */
  async analyzePublicJobMatch(dto: PublicJobMatchDto) {
    const { content: parsedContent } = extractStructuredContentFromText(
      dto.resumeText,
      dto.targetRole,
    );

    if (!parsedContent.summary?.trim()) {
      parsedContent.summary = dto.resumeText.trim();
    }

    if (
      (parsedContent.skills || []).length === 0 ||
      (parsedContent.experience || []).length === 0
    ) {
      try {
        const aiDraft = await this.aiService.parseResumeText(dto.resumeText);
        if ((parsedContent.skills || []).length === 0 && aiDraft.skills?.length) {
          parsedContent.skills = aiDraft.skills.map((s) =>
            typeof s === 'string' ? { name: s } : { name: s.name, category: s.category },
          );
        }
        if ((parsedContent.experience || []).length === 0 && aiDraft.experience?.length) {
          parsedContent.experience = aiDraft.experience.map((e) => ({
            company: e.company || 'Organization',
            title: e.title || dto.targetRole || 'Role',
            startDate: e.startDate || '',
            endDate: e.endDate,
            current: Boolean(e.current),
            bullets: Array.isArray(e.bullets) ? e.bullets : [],
          }));
        }
      } catch {
        // Structured summary fallback still feeds full resume evidence into matcher
      }
    }

    const parsedRequirements = await this.aiService.parseJobDescription(
      dto.jobDescriptionText,
    );

    const evaluation = await this.evaluateRequirementsAgainstContent(
      parsedContent,
      parsedRequirements,
    );

    return {
      ...evaluation,
      parsedRequirementsCount: parsedRequirements.length,
      provider: this.aiService.name,
    };
  }

  private async evaluateRequirementsAgainstContent(
    resumeContent: ResumeContent,
    parsedRequirements: ParsedJobRequirement[],
  ) {
    const rawAnalysis = await this.aiService.matchRequirements(
      resumeContent,
      parsedRequirements,
    );
    const requirementsAnalysis = this.enrichRequirements(rawAnalysis, parsedRequirements);
    const scoreComponents = this.calculateScoreComponents(
      requirementsAnalysis,
      parsedRequirements,
      resumeContent,
    );

    const overallScore = Math.round(
      scoreComponents.requiredSkillsScore * 0.35 +
        scoreComponents.experienceScore * 0.25 +
        scoreComponents.preferredSkillsScore * 0.15 +
        scoreComponents.responsibilityScore * 0.15 +
        scoreComponents.formattingScore * 0.1,
    );

    const recommendations = this.generateRecommendations(requirementsAnalysis);

    return {
      overallScore,
      scoreComponents,
      requirementsAnalysis,
      recommendations,
    };
  }

  async listJobMatches(userId: string, resumeId?: string): Promise<JobMatch[]> {
    const where: Record<string, any> = { userId };
    if (resumeId) {
      where.resumeId = resumeId;
    }

    const matches = await this.jobMatchRepository.find({
      where,
      relations: { jobDescription: true },
      order: { createdAt: 'DESC' },
      take: 25,
    });

    return matches.map((m) => ({
      ...m,
      requirementsAnalysis: this.enrichRequirements(
        m.requirementsAnalysis,
        m.jobDescription?.parsedRequirements || [],
      ),
    }));
  }

  async getJobMatch(userId: string, matchId: string): Promise<JobMatch> {
    const match = await this.jobMatchRepository.findOne({
      where: { id: matchId, userId },
      relations: { resume: true, jobDescription: true },
    });

    if (!match) {
      throw new NotFoundException('Job match report not found or access denied');
    }

    match.requirementsAnalysis = this.enrichRequirements(
      match.requirementsAnalysis,
      match.jobDescription?.parsedRequirements || [],
    );

    return match;
  }

  async generateTailoringSuggestions(userId: string, matchId: string) {
    const match = await this.getJobMatch(userId, matchId);
    const suggestions = await this.aiService.tailorForJob(
      match.resume.content,
      match.jobDescription.title,
      match.jobDescription.companyName,
      match.jobDescription.parsedRequirements || [],
    );

    return {
      matchId: match.id,
      resumeId: match.resumeId,
      jobDescriptionId: match.jobDescriptionId,
      jobTitle: match.jobDescription.title,
      companyName: match.jobDescription.companyName,
      ...suggestions,
    };
  }

  /**
   * Builds and persists an AI-adapted Tailored Resume anchored to a verified JobMatch,
   * sanitizing summary & bullet rewrites to guarantee zero metric hallucinations.
   */
  async createTailoredResumeFromMatch(
    userId: string,
    matchId: string,
    dto: CreateTailoredResumeDto,
  ): Promise<{
    resume: Resume;
    appliedChanges: {
      headlineApplied: boolean;
      summaryApplied: boolean;
      bulletsApplied: number;
      warnings: string[];
    };
  }> {
    const match = await this.getJobMatch(userId, matchId);
    const sourceResume = match.resume;
    const job = match.jobDescription;

    const clonedContent: ResumeContent = structuredClone(sourceResume.content || {
      contact: { fullName: '', email: '' },
      headline: '',
      summary: '',
      skills: [],
      experience: [],
      education: [],
    });

    const warnings: string[] = [];
    let headlineApplied = false;
    let summaryApplied = false;
    let bulletsApplied = 0;

    if (dto.applyHeadline?.trim()) {
      const check = validateAndSanitizeMetrics(
        clonedContent.headline || '',
        dto.applyHeadline.trim(),
        'Tailored Headline',
      );
      warnings.push(...check.warnings);
      if (check.sanitizedText.trim()) {
        clonedContent.headline = check.sanitizedText.trim();
        headlineApplied = true;
      }
    }

    if (dto.applySummary?.trim()) {
      const check = validateAndSanitizeMetrics(
        clonedContent.summary || '',
        dto.applySummary.trim(),
        'Tailored Summary',
      );
      warnings.push(...check.warnings);
      if (check.sanitizedText.trim()) {
        clonedContent.summary = check.sanitizedText.trim();
        summaryApplied = true;
      }
    }

    if (Array.isArray(dto.bulletUpdates) && dto.bulletUpdates.length > 0) {
      const experiences = Array.isArray(clonedContent.experience)
        ? clonedContent.experience
        : [];
      for (const item of dto.bulletUpdates) {
        const orig = item.originalBullet?.trim();
        const nextRaw = item.tailoredBullet?.trim();
        if (!orig || !nextRaw) continue;

        const targetExp =
          experiences.find(
            (exp) =>
              (!item.company ||
                exp.company?.toLowerCase() === item.company.toLowerCase()) &&
              (exp.bullets || []).some((b) => b.trim() === orig),
          ) ||
          experiences.find((exp) =>
            (exp.bullets || []).some((b) => b.trim() === orig),
          );

        if (!targetExp || !Array.isArray(targetExp.bullets)) continue;
        const bIdx = targetExp.bullets.findIndex((b) => b.trim() === orig);
        if (bIdx === -1) continue;

        const check = validateAndSanitizeMetrics(
          targetExp.bullets[bIdx],
          nextRaw,
          `${targetExp.company || 'Experience'} bullet`,
        );
        warnings.push(...check.warnings);
        if (check.sanitizedText.trim()) {
          targetExp.bullets[bIdx] = check.sanitizedText.trim();
          bulletsApplied += 1;
        }
      }
    }

    clonedContent.meta = {
      ...clonedContent.meta,
      targetRole: job.title,
      targetCompany: job.companyName,
      tailoredFromMatchId: match.id,
      tailoredFromResumeId: sourceResume.id,
    };

    const companySuffix = job.companyName ? ` (${job.companyName})` : '';
    const tailoredName = (
      dto.name?.trim() || `${job.title || 'Tailored'}${companySuffix}`
    ).slice(0, 200);

    let savedResume: Resume;
    if (this.resumesService) {
      savedResume = await this.resumesService.createResume(userId, {
        name: tailoredName,
        targetRole: job.title,
        targetCompany: job.companyName,
        templateKey: sourceResume.templateKey,
        locale: sourceResume.locale,
        isMaster: false,
        content: clonedContent,
      });
    } else {
      const created = this.resumeRepository.create({
        userId,
        name: tailoredName,
        templateKey: sourceResume.templateKey || 'clean-modern',
        locale: sourceResume.locale || 'en-US',
        isMaster: false,
        isArchived: false,
        version: 1,
        content: clonedContent,
      });
      savedResume = await this.resumeRepository.save(created);
    }

    this.logger.log(
      `Created AI-tailored resume ${savedResume.id} from match ${matchId} (${bulletsApplied} bullets updated)`,
    );

    return {
      resume: savedResume,
      appliedChanges: {
        headlineApplied,
        summaryApplied,
        bulletsApplied,
        warnings,
      },
    };
  }

  private enrichRequirements(
    analysis: any[],
    parsedReqs: any[],
  ): RequirementMatchAnalysis[] {
    if (!Array.isArray(analysis)) return [];
    const reqMap = new Map((parsedReqs || []).map((r) => [r.id, r]));

    return analysis.map((item) => {
      const src = reqMap.get(item.requirementId);
      return {
        ...item,
        text: item.text || src?.text || item.explanation || '',
        type: item.type || src?.type || 'required_skill',
        importance: item.importance || src?.importance || 'medium',
        keywords:
          Array.isArray(item.keywords) && item.keywords.length > 0
            ? item.keywords
            : Array.isArray(src?.keywords)
            ? src.keywords
            : [],
      };
    });
  }

  private calculateScoreComponents(
    analysis: RequirementMatchAnalysis[],
    requirements: any[],
    resumeContent: any,
  ): ScoreComponents {
    // 1. Required Skills Score
    const requiredReqs = analysis.filter((a) => {
      const req = requirements.find((r) => r.id === a.requirementId);
      return req?.type === 'required_skill';
    });
    const supportedRequired = requiredReqs.filter((a) => a.status === 'supported').length;
    const requiredSkillsScore =
      requiredReqs.length > 0
        ? Math.round((supportedRequired / requiredReqs.length) * 100)
        : 85;

    // 2. Preferred Skills Score
    const preferredReqs = analysis.filter((a) => {
      const req = requirements.find((r) => r.id === a.requirementId);
      return req?.type === 'preferred_skill';
    });
    const supportedPreferred = preferredReqs.filter((a) => a.status === 'supported').length;
    const preferredSkillsScore =
      preferredReqs.length > 0
        ? Math.round((supportedPreferred / preferredReqs.length) * 100)
        : 75;

    // 3. Experience Relevance Score
    const hasExp = (resumeContent.experience || []).length > 0;
    const experienceScore = hasExp ? 88 : 40;

    // 4. Responsibility & Domain Alignment Score
    const domainReqs = analysis.filter((a) => {
      const req = requirements.find((r) => r.id === a.requirementId);
      return req?.type === 'responsibility' || req?.type === 'domain';
    });
    const supportedDomain = domainReqs.filter((a) => a.status === 'supported').length;
    const responsibilityScore =
      domainReqs.length > 0
        ? Math.round((supportedDomain / domainReqs.length) * 100)
        : 80;

    // 5. Formatting Score
    const formattingScore = resumeContent.contact?.email && resumeContent.headline ? 95 : 70;

    return {
      requiredSkillsScore,
      preferredSkillsScore,
      experienceScore,
      responsibilityScore,
      formattingScore,
    };
  }

  private generateRecommendations(analysis: RequirementMatchAnalysis[]): string[] {
    const recs: string[] = [];

    const unevidenced = analysis.filter((a) => a.status === 'not_evidenced');
    if (unevidenced.length > 0) {
      recs.push(
        `Missing evidence for ${unevidenced.length} requirement(s). If you possess these capabilities, add them to your Master Profile before generating a tailored submission. Never invent credentials.`,
      );
    }

    const needsConfirm = analysis.filter((a) => a.status === 'needs_confirmation');
    if (needsConfirm.length > 0) {
      recs.push(
        `${needsConfirm.length} skill(s) are listed in your skills vault without supporting bullets demonstrating production impact. Click to add context bullets.`,
      );
    }

    const supported = analysis.filter((a) => a.status === 'supported');
    if (supported.length > 0) {
      recs.push(
        `Highlight your verified strengths (${supported.length} matched requirements) prominently near the top of your experience bullets.`,
      );
    }

    return recs;
  }
}
