import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import crypto from 'node:crypto';
import { CoverLetter } from './entities/cover-letter.entity.js';
import { Resume } from '../resumes/entities/resume.entity.js';
import { JobMatch } from '../job-matching/entities/job-match.entity.js';
import { AiService } from '../ai/ai.service.js';
import { CREDIT_COSTS, CreditsService } from '../credits/credits.service.js';
import type {
  GenerateCoverLetterDto,
  RegenerateCoverLetterDto,
  UpdateCoverLetterDto,
} from './dto/cover-letter.dto.js';

@Injectable()
export class CoverLettersService {
  private readonly logger = new Logger(CoverLettersService.name);

  constructor(
    @InjectRepository(CoverLetter)
    private readonly coverLetterRepo: Repository<CoverLetter>,
    @InjectRepository(Resume)
    private readonly resumeRepo: Repository<Resume>,
    @InjectRepository(JobMatch)
    private readonly jobMatchRepo: Repository<JobMatch>,
    private readonly aiService: AiService,
    @Optional()
    private readonly creditsService?: CreditsService,
  ) {}

  async list(userId: string, resumeId?: string): Promise<CoverLetter[]> {
    return this.coverLetterRepo.find({
      where: {
        userId,
        ...(resumeId ? { resumeId } : {}),
      },
      order: { updatedAt: 'DESC' },
    });
  }

  async getOne(userId: string, id: string): Promise<CoverLetter> {
    const letter = await this.coverLetterRepo.findOne({
      where: { id, userId },
    });
    if (!letter) {
      throw new NotFoundException('Cover letter not found');
    }
    return letter;
  }

  async generate(
    userId: string,
    dto: GenerateCoverLetterDto,
  ): Promise<CoverLetter> {
    const resume = await this.resumeRepo.findOne({
      where: { id: dto.resumeId, userId, isArchived: false },
    });
    if (!resume) {
      throw new NotFoundException('Selected resume not found');
    }

    let resolvedJd = dto.jobDescription?.trim() || '';
    if (!resolvedJd && dto.jobMatchId) {
      const match = await this.jobMatchRepo.findOne({
        where: { id: dto.jobMatchId, userId },
        relations: { jobDescription: true },
      });
      if (match?.jobDescription?.originalText) {
        resolvedJd = match.jobDescription.originalText;
      }
    }

    const tone = dto.tone || 'Executive';
    const chargeKey = `cover-letter:${userId}:${crypto.randomUUID()}`;
    let chargedCredits = false;
    if (this.creditsService) {
      const access = await this.creditsService.consumeFeatureAccess(
        userId,
        CREDIT_COSTS.COVER_LETTER,
        'cover_letter',
        chargeKey,
        `Cover letter generation (${dto.companyName.trim()} — ${dto.targetRole.trim()})`,
        { resumeId: resume.id },
      );
      chargedCredits = access.accessGrantedVia === 'credits';
    }

    let generated;
    try {
      generated = await this.aiService.generateCoverLetter({
        resumeContent: resume.content,
        targetRole: dto.targetRole.trim(),
        companyName: dto.companyName.trim(),
        hiringManager: dto.hiringManager?.trim() || undefined,
        jobDescription: resolvedJd || undefined,
        tone,
        customFocus: dto.customFocus?.trim() || undefined,
        sectionFocus: 'all',
      });
    } catch (err) {
      if (chargedCredits && this.creditsService) {
        await this.creditsService.refundCredits(
          userId,
          CREDIT_COSTS.COVER_LETTER,
          chargeKey,
          'Cover letter AI generation failed',
        );
      }
      throw err;
    }

    const contact = resume.content?.contact;
    const recipientLine = dto.hiringManager?.trim()
      ? `${dto.hiringManager.trim()} — ${dto.companyName.trim()}`
      : `${dto.companyName.trim()} Hiring Team`;

    const entity = this.coverLetterRepo.create({
      userId,
      resumeId: resume.id,
      jobMatchId: dto.jobMatchId || null,
      title: `${dto.companyName.trim()} — ${dto.targetRole.trim()}`,
      targetRole: dto.targetRole.trim(),
      companyName: dto.companyName.trim(),
      hiringManager: dto.hiringManager?.trim() || null,
      jobDescription: resolvedJd || null,
      tone,
      templateKey: dto.templateKey || 'executive',
      accentColor: dto.accentColor?.trim() || '#285FEA',
      senderName: contact?.fullName?.trim() || 'Candidate',
      senderEmail: contact?.email?.trim() || null,
      senderPhone: contact?.phone?.trim() || null,
      senderLocation: contact?.location?.trim() || null,
      recipientLine,
      salutation: generated.salutation,
      openingParagraph: generated.openingParagraph,
      bodyParagraphs: generated.bodyParagraphs,
      closingParagraph: generated.closingParagraph,
      signOff: generated.signOff,
      highlightedKeywords: generated.highlightedKeywords,
      factualVerificationNotes: generated.factualVerificationNotes,
      provider: generated.provider || 'gemini',
    });

    const saved = await this.coverLetterRepo.save(entity);
    this.logger.log(
      `Generated cover letter ${saved.id} (${saved.provider}) for user ${userId}`,
    );
    return saved;
  }

  async regenerate(
    userId: string,
    id: string,
    dto: RegenerateCoverLetterDto,
  ): Promise<CoverLetter> {
    const existing = await this.getOne(userId, id);

    let resume: Resume | null = null;
    if (existing.resumeId) {
      resume = await this.resumeRepo.findOne({
        where: { id: existing.resumeId, userId, isArchived: false },
      });
    }
    if (!resume) {
      resume = await this.resumeRepo.findOne({
        where: { userId, isArchived: false },
        order: { isMaster: 'DESC', updatedAt: 'DESC' },
      });
    }
    if (!resume) {
      throw new BadRequestException(
        'An active resume is required to regenerate cover letter sections.',
      );
    }

    const sectionFocus = dto.sectionFocus || 'all';
    const nextTone = dto.tone || existing.tone;
    const nextManager =
      dto.hiringManager !== undefined
        ? dto.hiringManager.trim()
        : existing.hiringManager || '';
    const nextJd =
      dto.jobDescription !== undefined
        ? dto.jobDescription.trim()
        : existing.jobDescription || '';

    const regenKey = `cover-letter-regen:${existing.id}:${crypto.randomUUID()}`;
    let chargedRegen = false;
    if (this.creditsService) {
      const access = await this.creditsService.consumeFeatureAccess(
        userId,
        1,
        'cover_letter',
        regenKey,
        `Cover letter section rewrite (${sectionFocus})`,
        { coverLetterId: existing.id },
      );
      chargedRegen = access.accessGrantedVia === 'credits';
    }

    let result;
    try {
      result = await this.aiService.generateCoverLetter({
        resumeContent: resume.content,
        targetRole: existing.targetRole,
        companyName: existing.companyName,
        hiringManager: nextManager || undefined,
        jobDescription: nextJd || undefined,
        tone: nextTone,
        customFocus: dto.customFocus?.trim() || undefined,
        sectionFocus,
        existingDraft: {
          openingParagraph: existing.openingParagraph,
          bodyParagraphs: existing.bodyParagraphs,
          closingParagraph: existing.closingParagraph,
        },
      });
    } catch (err) {
      if (chargedRegen && this.creditsService) {
        await this.creditsService.refundCredits(
          userId,
          1,
          regenKey,
          'Cover letter regeneration failed',
        );
      }
      throw err;
    }

    existing.tone = nextTone;
    if (dto.hiringManager !== undefined) {
      existing.hiringManager = nextManager || null;
      existing.recipientLine = nextManager
        ? `${nextManager} — ${existing.companyName}`
        : `${existing.companyName} Hiring Team`;
      existing.salutation = result.salutation;
    } else if (sectionFocus === 'all') {
      existing.salutation = result.salutation;
    }

    if (dto.jobDescription !== undefined) {
      existing.jobDescription = nextJd || null;
    }

    if (sectionFocus === 'all' || sectionFocus === 'opening') {
      existing.openingParagraph = result.openingParagraph;
    }
    if (sectionFocus === 'all' || sectionFocus === 'body') {
      existing.bodyParagraphs = result.bodyParagraphs;
    }
    if (sectionFocus === 'all' || sectionFocus === 'closing') {
      existing.closingParagraph = result.closingParagraph;
    }

    if (sectionFocus === 'all') {
      existing.signOff = result.signOff;
    }
    if (result.highlightedKeywords.length > 0) {
      existing.highlightedKeywords = result.highlightedKeywords;
    }
    existing.factualVerificationNotes = result.factualVerificationNotes;
    existing.provider = result.provider || existing.provider;

    return this.coverLetterRepo.save(existing);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCoverLetterDto,
  ): Promise<CoverLetter> {
    const existing = await this.getOne(userId, id);

    if (dto.title !== undefined) existing.title = dto.title.trim() || existing.title;
    if (dto.targetRole !== undefined)
      existing.targetRole = dto.targetRole.trim() || existing.targetRole;
    if (dto.companyName !== undefined)
      existing.companyName = dto.companyName.trim() || existing.companyName;
    if (dto.hiringManager !== undefined)
      existing.hiringManager = dto.hiringManager.trim() || null;
    if (dto.tone !== undefined) existing.tone = dto.tone;
    if (dto.templateKey !== undefined) existing.templateKey = dto.templateKey;
    if (dto.accentColor !== undefined)
      existing.accentColor = dto.accentColor.trim() || '#285FEA';
    if (dto.senderName !== undefined)
      existing.senderName = dto.senderName.trim() || existing.senderName;
    if (dto.senderEmail !== undefined)
      existing.senderEmail = dto.senderEmail.trim() || null;
    if (dto.senderPhone !== undefined)
      existing.senderPhone = dto.senderPhone.trim() || null;
    if (dto.senderLocation !== undefined)
      existing.senderLocation = dto.senderLocation.trim() || null;
    if (dto.recipientLine !== undefined)
      existing.recipientLine = dto.recipientLine.trim() || null;
    if (dto.salutation !== undefined) existing.salutation = dto.salutation;
    if (dto.openingParagraph !== undefined)
      existing.openingParagraph = dto.openingParagraph;
    if (dto.bodyParagraphs !== undefined)
      existing.bodyParagraphs = dto.bodyParagraphs;
    if (dto.closingParagraph !== undefined)
      existing.closingParagraph = dto.closingParagraph;
    if (dto.signOff !== undefined) existing.signOff = dto.signOff;

    return this.coverLetterRepo.save(existing);
  }

  async remove(userId: string, id: string): Promise<{ deleted: true; id: string }> {
    const existing = await this.getOne(userId, id);
    await this.coverLetterRepo.remove(existing);
    return { deleted: true, id };
  }
}
