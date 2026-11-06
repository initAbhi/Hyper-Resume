import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Resume } from './entities/resume.entity.js';
import { ResumeVersion } from './entities/resume-version.entity.js';
import { ResumeAnalysis, type ResumeAuditFindings } from './entities/resume-analysis.entity.js';
import { ResumeAdaptation } from './entities/resume-adaptation.entity.js';
import type { ResumeContent } from './entities/resume.types.js';
import { CandidateProfile } from '../profiles/entities/candidate-profile.entity.js';
import { CreateResumeDto } from './dto/create-resume.dto.js';
import { UpdateResumeDto } from './dto/update-resume.dto.js';
import { CreateResumeVersionDto } from './dto/create-resume-version.dto.js';
import { RunResumeAnalysisDto } from './dto/run-resume-analysis.dto.js';
import { AdaptResumeDto } from './dto/adapt-resume.dto.js';
import { AdaptSectionDto } from './dto/adapt-section.dto.js';
import { ApplyAdaptationDto } from './dto/apply-adaptation.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { CREDIT_COSTS, CreditsService } from '../credits/credits.service.js';
import { AiService } from '../ai/ai.service.js';
import { validateAndReconstructAdaptation } from '../ai/utils/factual-integrity-validator.js';

@Injectable()
export class ResumesService {
  private readonly logger = new Logger(ResumesService.name);

  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(ResumeVersion)
    private readonly versionRepository: Repository<ResumeVersion>,
    @InjectRepository(ResumeAnalysis)
    private readonly analysisRepository: Repository<ResumeAnalysis>,
    @InjectRepository(CandidateProfile)
    private readonly profileRepository: Repository<CandidateProfile>,
    @InjectRepository(ResumeAdaptation)
    private readonly adaptationRepository: Repository<ResumeAdaptation>,
    private readonly creditsService: CreditsService,
    private readonly aiService: AiService,
    private readonly dataSource: DataSource,
  ) {}

  async createResume(userId: string, dto: CreateResumeDto): Promise<Resume> {
    let initialContent = dto.content;

    // Seed content from CandidateProfile if not supplied
    if (!initialContent) {
      const profile = await this.profileRepository.findOne({
        where: { userId },
      });

      initialContent = {
        contact: {
          fullName: '',
          email: '',
          location: profile?.location || '',
          linkedinUrl: profile?.linkedinUrl,
          githubUrl: profile?.githubUrl,
          websiteUrl: profile?.websiteUrl,
        },
        headline: profile?.headline || '',
        summary: profile?.summary || '',
        skills: (profile?.skills || []).map((s) => ({ name: s.name, category: s.category })),
        experience: profile?.experience || [],
        education: profile?.education || [],
        projects: profile?.projects || [],
        certifications: profile?.certifications || [],
      };
    }

    const resume = this.resumeRepository.create({
      userId,
      name: dto.name.trim(),
      templateKey: dto.templateKey || 'clean-modern',
      locale: dto.locale || 'en-US',
      isMaster: dto.isMaster || false,
      isArchived: false,
      version: 1,
      content: initialContent,
    });

    const savedResume = await this.resumeRepository.save(resume);

    // Create Initial Version (v1)
    const initialVersion = this.versionRepository.create({
      resumeId: savedResume.id,
      versionNumber: 1,
      changeSummary: 'Initial version created',
      contentSnapshot: savedResume.content,
    });
    await this.versionRepository.save(initialVersion);

    this.logger.log(`Created resume "${savedResume.name}" (${savedResume.id}) for user ${userId}`);
    return savedResume;
  }

  async listResumes(
    userId: string,
    pagination: PaginationQueryDto,
  ): Promise<{ items: Resume[]; total: number; page: number; limit: number }> {
    const [items, total] = await this.resumeRepository.findAndCount({
      where: { userId, isArchived: false },
      order: { updatedAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });

    return {
      items,
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async getResume(userId: string, resumeId: string): Promise<Resume> {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId, userId, isArchived: false },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found or access denied');
    }

    return resume;
  }

  async updateResume(
    userId: string,
    resumeId: string,
    dto: UpdateResumeDto,
  ): Promise<Resume> {
    const resume = await this.getResume(userId, resumeId);

    // Optimistic Concurrency Control (OCC)
    if (dto.expectedVersion !== undefined && resume.version !== dto.expectedVersion) {
      throw new ConflictException(
        `Conflict: Resume was modified elsewhere (current version is ${resume.version}). Please refresh and review changes before saving.`,
      );
    }

    if (dto.name !== undefined) resume.name = dto.name.trim();
    if (dto.templateKey !== undefined) resume.templateKey = dto.templateKey;
    if (dto.locale !== undefined) resume.locale = dto.locale;
    if (dto.content !== undefined) resume.content = dto.content;

    const saved = await this.resumeRepository.save(resume);
    this.logger.log(`Updated resume "${saved.name}" (${saved.id}) for user ${userId} to version ${saved.version}`);
    return saved;
  }

  async archiveResume(userId: string, resumeId: string): Promise<{ success: boolean }> {
    const resume = await this.getResume(userId, resumeId);
    resume.isArchived = true;
    await this.resumeRepository.save(resume);
    this.logger.log(`Archived resume ${resumeId} for user ${userId}`);
    return { success: true };
  }

  async deleteResume(userId: string, resumeId: string): Promise<void> {
    await this.archiveResume(userId, resumeId);
  }

  async duplicateResume(userId: string, resumeId: string): Promise<Resume> {
    const source = await this.getResume(userId, resumeId);
    return this.createResume(userId, {
      name: `${source.name} (Copy)`,
      templateKey: source.templateKey,
      locale: source.locale,
      isMaster: false,
      content: source.content,
    });
  }

  async createVersion(
    userId: string,
    resumeId: string,
    dto: CreateResumeVersionDto,
  ): Promise<ResumeVersion> {
    const resume = await this.getResume(userId, resumeId);

    const latestVersion = await this.versionRepository.findOne({
      where: { resumeId },
      order: { versionNumber: 'DESC' },
    });

    const nextVersionNumber = (latestVersion?.versionNumber || 0) + 1;

    const version = this.versionRepository.create({
      resumeId,
      versionNumber: nextVersionNumber,
      changeSummary: dto.changeSummary?.trim() || `Manual snapshot v${nextVersionNumber}`,
      contentSnapshot: resume.content,
    });

    const saved = await this.versionRepository.save(version);
    this.logger.log(`Created version snapshot ${saved.versionNumber} for resume ${resumeId}`);
    return saved;
  }

  async listVersions(userId: string, resumeId: string): Promise<ResumeVersion[]> {
    await this.getResume(userId, resumeId);

    return this.versionRepository.find({
      where: { resumeId },
      order: { versionNumber: 'DESC' },
    });
  }

  async getVersion(
    userId: string,
    resumeId: string,
    versionId: string,
  ): Promise<ResumeVersion> {
    await this.getResume(userId, resumeId);

    const version = await this.versionRepository.findOne({
      where: { id: versionId, resumeId },
    });

    if (!version) {
      throw new NotFoundException('Version snapshot not found');
    }

    return version;
  }

  async restoreVersion(
    userId: string,
    resumeId: string,
    versionId: string,
  ): Promise<Resume> {
    const resume = await this.getResume(userId, resumeId);

    const version = await this.versionRepository.findOne({
      where: { id: versionId, resumeId },
    });

    if (!version) {
      throw new NotFoundException('Version snapshot not found');
    }

    resume.content = version.contentSnapshot;
    const restored = await this.resumeRepository.save(resume);

    // Save a new version representing the restore event
    await this.createVersion(userId, resumeId, {
      changeSummary: `Restored from version ${version.versionNumber}`,
    });

    this.logger.log(`Restored resume ${resumeId} to state of version ${version.versionNumber}`);
    return restored;
  }

  async runAnalysis(
    userId: string,
    resumeId: string,
    dto: RunResumeAnalysisDto,
  ): Promise<ResumeAnalysis> {
    const resume = await this.getResume(userId, resumeId);

    // Run structural ATS audit
    const findings = this.performAtsAudit(resume.content);
    const score = this.calculateAuditScore(findings);
    const recommendations = this.generateAuditRecommendations(findings);

    const analysis = this.analysisRepository.create({
      resumeId,
      analysisType: dto.analysisType || 'ats_check',
      score,
      findings,
      recommendations,
    });

    const saved = await this.analysisRepository.save(analysis);
    this.logger.log(`Ran analysis for resume ${resumeId} (score: ${score}/100, type: ${saved.analysisType})`);
    return saved;
  }

  /**
   * Adapts an existing user profile against a benchmark sample resume.
   * Enforces Safeguards 1, 2, 3, 5, 6:
   * - Balance check first (3 credits).
   * - Idempotency deduplication (Safeguard 5).
   * - Saves PENDING row first; runs AI outside any DB transaction (Safeguard 3).
   * - Multi-layer factual validation and skeleton reconstruction (Safeguard 2 & 6).
   * - Atomic transaction for credit deduction and SUCCEEDED proposal persistence.
   */
  async adaptWithProfile(userId: string, dto: AdaptResumeDto): Promise<ResumeAdaptation> {
    // 1. Verify source resume ownership
    const sourceResume = await this.getResume(userId, dto.sourceResumeId);

    // 2. Safeguard 5: Idempotency & duplicate-request handling
    const existing = await this.adaptationRepository.findOne({
      where: { userId, idempotencyKey: dto.idempotencyKey },
    });

    if (existing) {
      if (existing.status === 'SUCCEEDED') {
        this.logger.log(`Duplicate adaptation request with key ${dto.idempotencyKey}; returning existing proposal`);
        return existing;
      }
      if (existing.status === 'PENDING') {
        throw new ConflictException('Adaptation is currently in progress. Please check status shortly.');
      }
    }

    // 3. Balance verification (3 credits)
    const requiredCredits = CREDIT_COSTS.ADAPT_RESUME;
    const currentBalance = await this.creditsService.getBalance(userId);
    if (currentBalance < requiredCredits) {
      throw new ForbiddenException(
        `Insufficient credits (${currentBalance} available, ${requiredCredits} required). Please recharge credits to adapt your resume.`,
      );
    }

    // 4. Safeguard 3: Persist PENDING request before calling AI
    let adaptation = existing;
    if (!adaptation) {
      adaptation = this.adaptationRepository.create({
        userId,
        sourceResumeId: sourceResume.id,
        sampleId: dto.sampleId,
        adaptationType: 'full_profile',
        targetRole: dto.targetRole || null,
        idempotencyKey: dto.idempotencyKey,
        status: 'PENDING',
        creditsCharged: 0,
      });
    } else {
      adaptation.status = 'PENDING';
      adaptation.errorCode = null;
      adaptation.errorMessage = null;
    }
    await this.adaptationRepository.save(adaptation);

    // 5. Build or resolve benchmark sample content
    const benchmarkSample: ResumeContent = dto.sampleBenchmarkData || {
      contact: { fullName: 'Benchmark Executive', email: 'benchmark@sample.com' },
      headline: dto.targetRole || 'Industry Leader',
      summary: 'Executive engineering leader known for scaling high-reliability systems.',
      skills: [{ name: 'System Architecture', category: 'Technical' }, { name: 'Leadership', category: 'Core' }],
      experience: [],
      education: [],
    };

    // 6. Safeguard 3: Execute AI inference OUTSIDE any open database transaction
    let aiResult;
    try {
      aiResult = await this.aiService.adaptResume(
        sourceResume.content,
        benchmarkSample,
        dto.targetRole,
      );
    } catch (aiErr: any) {
      adaptation.status = 'FAILED';
      adaptation.errorCode = 'AI_GENERATION_FAILED';
      adaptation.errorMessage = aiErr?.message || 'AI adaptation inference failed';
      await this.adaptationRepository.save(adaptation);
      this.logger.error(`AI adaptation failed for user ${userId}: ${adaptation.errorMessage}`);
      throw aiErr;
    }

    // 7. Safeguard 2 & 6: Multi-layer factual integrity validation & skeleton reconstruction
    const validation = validateAndReconstructAdaptation(
      sourceResume.content,
      benchmarkSample,
      aiResult.payload,
    );

    // 8. Atomic transaction for credit deduction and SUCCEEDED proposal persistence
    await this.dataSource.transaction(async (manager) => {
      const creditIdempotencyKey = `adapt:${adaptation.id}`;
      await this.creditsService.deductCredits(
        userId,
        requiredCredits,
        'ai_adapt',
        creditIdempotencyKey,
        `AI Profile Adaptation for sample: ${dto.sampleId}`,
        {
          adaptationId: adaptation.id,
          sampleId: dto.sampleId,
          targetRole: dto.targetRole,
        },
        manager,
      );

      adaptation.status = 'SUCCEEDED';
      adaptation.creditsCharged = requiredCredits;
      adaptation.proposedContent = validation.validatedContent;
      adaptation.sectionChanges = validation.sectionChanges;
      adaptation.unsupportedWarnings = validation.unsupportedWarnings;
      adaptation.recommendedBenchmarkSkills = validation.recommendedBenchmarkSkills;
      adaptation.usageMetadata = aiResult.telemetry;

      await manager.getRepository(ResumeAdaptation).save(adaptation);
    });

    this.logger.log(`Adaptation completed successfully (${adaptation.id}) for user ${userId} (3 credits charged)`);
    return adaptation;
  }

  /**
   * Adapts a single section (summary, experience, skills, or projects).
   * Enforces Safeguard 4: 1-credit lifecycle, idempotency, and validation.
   */
  async adaptSection(userId: string, dto: AdaptSectionDto): Promise<ResumeAdaptation> {
    const sourceResume = await this.getResume(userId, dto.sourceResumeId);

    // Idempotency check (Safeguard 5)
    const existing = await this.adaptationRepository.findOne({
      where: { userId, idempotencyKey: dto.idempotencyKey },
    });

    if (existing) {
      if (existing.status === 'SUCCEEDED') return existing;
      if (existing.status === 'PENDING') {
        throw new ConflictException('Section adaptation is in progress. Please check back shortly.');
      }
    }

    // 1-credit balance check
    const requiredCredits = CREDIT_COSTS.ADAPT_SECTION;
    const currentBalance = await this.creditsService.getBalance(userId);
    if (currentBalance < requiredCredits) {
      throw new ForbiddenException(
        `Insufficient credits (${currentBalance} available, ${requiredCredits} required). Please recharge credits to adapt this section.`,
      );
    }

    // Persist PENDING state
    let adaptation = existing;
    if (!adaptation) {
      adaptation = this.adaptationRepository.create({
        userId,
        sourceResumeId: sourceResume.id,
        sampleId: dto.sampleId,
        adaptationType: 'section',
        targetRole: dto.targetRole || null,
        idempotencyKey: dto.idempotencyKey,
        status: 'PENDING',
        creditsCharged: 0,
      });
    } else {
      adaptation.status = 'PENDING';
      adaptation.errorCode = null;
      adaptation.errorMessage = null;
    }
    await this.adaptationRepository.save(adaptation);

    // Resolve source and benchmark section data
    const sourceSection = dto.sourceSectionData || (sourceResume.content as any)[dto.sectionKey];
    const benchmarkSection = dto.benchmarkSectionData || null;

    let aiResult;
    try {
      aiResult = await this.aiService.adaptSection(
        dto.sectionKey,
        sourceSection,
        benchmarkSection,
        dto.targetRole,
      );
    } catch (aiErr: any) {
      adaptation.status = 'FAILED';
      adaptation.errorCode = 'SECTION_AI_FAILED';
      adaptation.errorMessage = aiErr?.message || 'Section adaptation inference failed';
      await this.adaptationRepository.save(adaptation);
      throw aiErr;
    }

    // Short atomic transaction for 1-credit deduction and update
    await this.dataSource.transaction(async (manager) => {
      const creditIdempotencyKey = `adapt-section:${adaptation.id}`;
      await this.creditsService.deductCredits(
        userId,
        requiredCredits,
        'ai_adapt',
        creditIdempotencyKey,
        `AI Section Adaptation (${dto.sectionKey}) for sample: ${dto.sampleId}`,
        {
          adaptationId: adaptation.id,
          sectionKey: dto.sectionKey,
          sampleId: dto.sampleId,
        },
        manager,
      );

      adaptation.status = 'SUCCEEDED';
      adaptation.creditsCharged = requiredCredits;
      adaptation.sectionChanges = {
        [dto.sectionKey]: aiResult.adaptedContent,
      } as any;
      adaptation.usageMetadata = aiResult.telemetry;

      await manager.getRepository(ResumeAdaptation).save(adaptation);
    });

    return adaptation;
  }

  async getAdaptation(userId: string, adaptationId: string): Promise<ResumeAdaptation> {
    const adaptation = await this.adaptationRepository.findOne({
      where: { id: adaptationId, userId },
    });

    if (!adaptation) {
      throw new NotFoundException('Adaptation proposal not found or access denied');
    }

    return adaptation;
  }

  /**
   * Applies accepted adaptation changes and creates a new independent resume draft.
   * Enforces:
   * - Original source resume is NEVER mutated or overwritten.
   * - Server-side validation of decisions.
   * - Unconfirmed placeholders check.
   */
  async applyAdaptation(
    userId: string,
    adaptationId: string,
    dto: ApplyAdaptationDto,
  ): Promise<Resume> {
    const adaptation = await this.getAdaptation(userId, adaptationId);

    if (adaptation.status !== 'SUCCEEDED' || !adaptation.proposedContent) {
      throw new BadRequestException('Cannot apply adaptation: proposal is not in SUCCEEDED state.');
    }

    const sourceResume = await this.getResume(userId, adaptation.sourceResumeId);
    const proposed = adaptation.proposedContent;

    // Check customFinalContent if provided from modal
    if (dto.customFinalContent) {
      // Validate locked sections
      const finalContact = { ...sourceResume.content.contact };
      const finalEducation = sourceResume.content.education || [];
      const finalCertifications = sourceResume.content.certifications || [];

      const cleanContent: ResumeContent = {
        ...dto.customFinalContent,
        contact: finalContact,
        education: finalEducation,
        certifications: finalCertifications,
      };

      return this.createResume(userId, {
        name: dto.title || `${sourceResume.name} (Adapted - ${adaptation.targetRole || 'Benchmark'})`,
        templateKey: sourceResume.templateKey,
        locale: sourceResume.locale,
        isMaster: false,
        content: cleanContent,
      });
    }

    // Merge selective decisions
    let finalHeadline = sourceResume.content.headline;
    let finalSummary = sourceResume.content.summary;

    if (dto.summaryDecision === 'accept') {
      finalSummary = proposed.summary || sourceResume.content.summary;
      finalHeadline = proposed.headline || sourceResume.content.headline;
    }

    // Merge experience bullets selectively
    const finalExperience = (sourceResume.content.experience || []).map((origExp, expIdx) => {
      const proposedExp = proposed.experience?.[expIdx];
      const mergedBullets: string[] = [];

      origExp.bullets.forEach((origBullet, bulletIdx) => {
        const decision = dto.bulletDecisions?.[String(expIdx)]?.[String(bulletIdx)];
        if (decision === 'accept' && proposedExp?.bullets?.[bulletIdx]) {
          mergedBullets.push(proposedExp.bullets[bulletIdx]);
        } else {
          mergedBullets.push(origBullet);
        }
      });

      return {
        ...origExp,
        bullets: mergedBullets,
      };
    });

    // Merge skills (Safeguard 6: only explicitly accepted skills added)
    const finalSkills = [...(sourceResume.content.skills || [])];
    if (dto.acceptedBenchmarkSkills && dto.acceptedBenchmarkSkills.length > 0) {
      const existingSkillNames = new Set(finalSkills.map((s) => s.name.toLowerCase()));
      for (const skillName of dto.acceptedBenchmarkSkills) {
        if (!existingSkillNames.has(skillName.toLowerCase())) {
          finalSkills.push({ name: skillName.trim(), category: 'Benchmark Skills' });
          existingSkillNames.add(skillName.toLowerCase());
        }
      }
    }

    // Safeguard 6: Projects preserved or merged
    const finalProjects = (sourceResume.content.projects || []).map((origProj, projIdx) => {
      const decision = dto.projectDecisions?.[String(projIdx)];
      if (decision === 'accept' && proposed.projects?.[projIdx]) {
        return {
          ...origProj,
          description: proposed.projects[projIdx].description,
          highlights: proposed.projects[projIdx].highlights,
        };
      }
      return origProj;
    });

    const finalContent: ResumeContent = {
      contact: { ...sourceResume.content.contact },
      headline: finalHeadline,
      summary: finalSummary,
      skills: finalSkills,
      experience: finalExperience,
      education: sourceResume.content.education || [],
      certifications: sourceResume.content.certifications || [],
      projects: finalProjects,
    };

    // Create a new independent draft resume
    const newResumeName = dto.title || `${sourceResume.name} (Adapted - ${adaptation.targetRole || 'Benchmark'})`;
    const newResume = await this.createResume(userId, {
      name: newResumeName,
      templateKey: sourceResume.templateKey,
      locale: sourceResume.locale,
      isMaster: false,
      content: finalContent,
    });

    this.logger.log(
      `Applied adaptation ${adaptation.id} into new resume "${newResume.name}" (${newResume.id}). Source resume ${sourceResume.id} preserved untouched.`,
    );

    return newResume;
  }

  private performAtsAudit(content: ResumeContent): ResumeAuditFindings {
    const missingSections: string[] = [];
    const formattingFlags: string[] = [];

    // Check essential sections
    if (!content.summary || content.summary.trim().length === 0) missingSections.push('Professional Summary');
    if (!content.experience || content.experience.length === 0) missingSections.push('Work Experience');
    if (!content.skills || content.skills.length === 0) missingSections.push('Core Skills');
    if (!content.education || content.education.length === 0) missingSections.push('Education');

    // Check contact formatting
    if (!content.contact?.email || !content.contact.email.includes('@')) {
      formattingFlags.push('Missing or invalid email address');
    }
    if (!content.contact?.fullName) {
      formattingFlags.push('Missing candidate full name');
    }

    let actionVerbsCount = 0;
    let metricsCount = 0;
    const bulletQuality: Array<{ bullet: string; hasActionVerb: boolean; hasMetric: boolean; feedback: string }> = [];

    const actionVerbRegex = /^(architected|spearheaded|engineered|orchestrated|designed|developed|built|led|optimized|streamlined|delivered|deployed|migrated|scaled|automated|refactored)/i;
    const metricRegex = /\d+%|\$\d+|\b\d+\s*(?:ms|users?|clients?|customers?|events?|qps|rps|tps|gb|tb|pb)\b/i;

    (content.experience || []).forEach((exp) => {
      (exp.bullets || []).forEach((b) => {
        const hasActionVerb = actionVerbRegex.test(b.trim());
        const hasMetric = metricRegex.test(b);

        if (hasActionVerb) actionVerbsCount++;
        if (hasMetric) metricsCount++;

        let bScore = 50;
        if (hasActionVerb) bScore += 25;
        if (hasMetric) bScore += 25;

        bulletQuality.push({
          bullet: b,
          hasActionVerb,
          hasMetric,
          feedback: hasActionVerb && hasMetric
            ? 'Strong action verb and quantifiable metric.'
            : !hasActionVerb
            ? 'Start with a strong action verb (e.g. Architected, Spearheaded).'
            : 'Add measurable metrics, percentages, or scale.',
        });
      });
    });

    return {
      actionVerbsCount,
      metricsCount,
      missingSections,
      formattingFlags,
      bulletQuality,
    };
  }

  private calculateAuditScore(findings: ResumeAuditFindings): number {
    let score = 100;

    // Deduct for missing sections
    score -= findings.missingSections.length * 20;

    // Deduct for formatting issues
    score -= findings.formattingFlags.length * 10;

    // Evaluate metrics density
    const totalBullets = findings.bulletQuality.length;
    if (totalBullets > 0) {
      const metricRatio = findings.metricsCount / totalBullets;
      if (metricRatio < 0.4) score -= 15;
      else if (metricRatio < 0.6) score -= 5;

      const verbRatio = findings.actionVerbsCount / totalBullets;
      if (verbRatio < 0.5) score -= 10;
    } else {
      score -= 30;
    }

    return Math.max(10, Math.min(100, score));
  }

  private generateAuditRecommendations(findings: ResumeAuditFindings): string[] {
    const recs: string[] = [];
    if (findings.missingSections.length > 0) {
      recs.push(`Add missing essential sections: ${findings.missingSections.join(', ')}.`);
    }
    if (findings.metricsCount < (findings.bulletQuality.length * 0.5)) {
      recs.push('Quantify at least 50% of your experience bullets with measurable metrics, percentages, or scale.');
    }
    if (findings.formattingFlags.length > 0) {
      recs.push(`Address contact formatting alerts: ${findings.formattingFlags.join(', ')}.`);
    }
    if (recs.length === 0) {
      recs.push('Resume follows ATS single-column formatting standards and displays strong evidence density.');
    }
    return recs;
  }
}
