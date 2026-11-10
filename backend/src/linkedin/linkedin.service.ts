import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LinkedInAudit } from './entities/linkedin-audit.entity.js';
import { Resume } from '../resumes/entities/resume.entity.js';
import { ResumeShare } from '../resumes/entities/resume-share.entity.js';
import type { ResumeContent } from '../resumes/entities/resume.types.js';
import { AiService } from '../ai/ai.service.js';
import { ProfilesService } from '../profiles/profiles.service.js';
import { ResumesService } from '../resumes/resumes.service.js';
import { ResumeParserService } from '../resume-parsing/resume-parser.service.js';
import type {
  ApplyLinkedInAuditDto,
  OptimizeLinkedInDto,
} from './dto/linkedin.dto.js';
import { evaluateLinkedInProfileScore } from './linkedin-scoring.util.js';
import type { User } from '../users/entities/user.entity.js';
import type { ParsedProfileDraft } from '../ai/interfaces/ai-provider.interface.js';

@Injectable()
export class LinkedInService {
  private readonly logger = new Logger(LinkedInService.name);

  constructor(
    @InjectRepository(LinkedInAudit)
    private readonly auditRepository: Repository<LinkedInAudit>,
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(ResumeShare)
    private readonly shareRepository: Repository<ResumeShare>,
    private readonly aiService: AiService,
    private readonly profilesService: ProfilesService,
    private readonly resumesService: ResumesService,
    private readonly parserService: ResumeParserService,
  ) {}

  async listAudits(userId: string): Promise<LinkedInAudit[]> {
    return this.auditRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
      take: 25,
    });
  }

  async getAudit(userId: string, auditId: string): Promise<LinkedInAudit> {
    const audit = await this.auditRepository.findOne({
      where: { id: auditId, userId },
    });
    if (!audit) {
      throw new NotFoundException('LinkedIn audit report not found.');
    }
    return audit;
  }

  async deleteAudit(userId: string, auditId: string): Promise<{ deleted: true }> {
    const audit = await this.getAudit(userId, auditId);
    await this.auditRepository.remove(audit);
    return { deleted: true };
  }

  async optimizeProfile(
    user: User,
    dto: OptimizeLinkedInDto,
  ): Promise<LinkedInAudit> {
    const { profileContent, linkedinUrl, resume } = await this.resolveProfileSnapshot(
      user,
      dto.resumeId,
      dto.linkedinUrl,
      dto.customHeadline,
      dto.customAbout,
    );

    const hasSignal =
      Boolean(profileContent.headline?.trim()) ||
      Boolean(profileContent.summary?.trim()) ||
      (profileContent.skills?.length || 0) > 0 ||
      (profileContent.experience?.length || 0) > 0;

    if (!hasSignal) {
      throw new BadRequestException(
        'Provide a source resume, upload a LinkedIn PDF, or enter your current headline/summary first.',
      );
    }

    const share = resume
      ? await this.shareRepository.findOne({ where: { resumeId: resume.id, userId: user.id } })
      : null;
    const publicShareUrl =
      share?.isActive && share.slug ? `/r/${share.slug}` : undefined;

    const scoreReport = evaluateLinkedInProfileScore({
      profile: profileContent,
      targetRole: dto.targetRole.trim(),
      targetJobDescription: dto.targetJobDescription,
      hasPublicShareUrl: Boolean(publicShareUrl),
    });

    const optimizations = await this.aiService.optimizeLinkedInProfile({
      profile: profileContent,
      targetRole: dto.targetRole.trim(),
      industry: dto.industry?.trim() || undefined,
      tone: dto.tone || 'Executive',
      targetJobDescription: dto.targetJobDescription?.trim() || undefined,
      publicShareUrl,
    });

    const entity = this.auditRepository.create({
      userId: user.id,
      resumeId: resume?.id || null,
      title: `${dto.targetRole.trim()} · LinkedIn Audit`,
      targetRole: dto.targetRole.trim(),
      industry: dto.industry?.trim() || null,
      tone: dto.tone || 'Executive',
      sourceType: dto.customHeadline || dto.customAbout ? 'manual' : 'resume',
      linkedinUrl: linkedinUrl || profileContent.contact?.linkedinUrl || null,
      overallScore: scoreReport.overallScore,
      profileSnapshot: profileContent,
      scoreReport,
      optimizations,
      appliedState: {},
      provider: optimizations.provider || this.aiService.name,
    });

    if (dto.saveAudit === false) {
      return entity;
    }

    const saved = await this.auditRepository.save(entity);
    this.logger.log(
      `Generated LinkedIn audit ${saved.id} (score=${saved.overallScore}) for user ${user.id}`,
    );
    return saved;
  }

  async importLinkedInPdfAndOptimize(
    user: User,
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    options: {
      createResume?: boolean;
      syncToProfile?: boolean;
      resumeName?: string;
      targetRole?: string;
      industry?: string;
    },
  ): Promise<{
    fileName: string;
    extractedTextLength: number;
    draft: ParsedProfileDraft;
    createdResume: Resume | null;
    audit: LinkedInAudit;
  }> {
    const parsedResult = await this.parserService.parseUploadedFile(
      fileBuffer,
      originalName,
      mimeType,
    );

    const draft = parsedResult.draft;
    const inferredRole =
      options.targetRole?.trim() ||
      draft.experience?.[0]?.title?.trim() ||
      draft.headline?.split('|')[0]?.split(' at ')[0]?.trim() ||
      'Software Engineer';

    const convertedContent = this.draftToResumeContent(user, draft);

    let createdResume: Resume | null = null;
    if (options.createResume !== false) {
      const title =
        options.resumeName?.trim() ||
        `${draft.contact?.fullName || user.fullName || 'Candidate'} — LinkedIn Import`;
      createdResume = await this.resumesService.createResume(user.id, {
        name: title,
        content: convertedContent,
      });
    }

    if (options.syncToProfile !== false) {
      await this.profilesService.updateProfileByUserId(user.id, {
        headline: convertedContent.headline.slice(0, 200),
        summary: convertedContent.summary,
        location: convertedContent.contact.location || draft.location || '',
        phone: convertedContent.contact.phone,
        linkedinUrl: convertedContent.contact.linkedinUrl,
        githubUrl: convertedContent.contact.githubUrl,
        websiteUrl: convertedContent.contact.websiteUrl,
        skills: (convertedContent.skills || []).map((s) => ({
          name: s.name,
          category: s.category || 'Technical Skills',
        })),
        experience: convertedContent.experience,
        education: convertedContent.education,
        projects: convertedContent.projects,
        certifications: convertedContent.certifications,
      });
    }

    const scoreReport = evaluateLinkedInProfileScore({
      profile: convertedContent,
      targetRole: inferredRole,
    });

    const optimizations = await this.aiService.optimizeLinkedInProfile({
      profile: convertedContent,
      targetRole: inferredRole,
      industry: options.industry?.trim() || undefined,
      tone: 'Impact & Metrics',
    });

    const audit = await this.auditRepository.save(
      this.auditRepository.create({
        userId: user.id,
        resumeId: createdResume?.id || null,
        title: `${inferredRole} · LinkedIn PDF Import`,
        targetRole: inferredRole,
        industry: options.industry?.trim() || null,
        tone: 'Impact & Metrics',
        sourceType: draft.sourceType === 'linkedin_pdf' ? 'linkedin_pdf' : 'resume',
        linkedinUrl: convertedContent.contact.linkedinUrl || null,
        overallScore: scoreReport.overallScore,
        profileSnapshot: convertedContent,
        scoreReport,
        optimizations,
        appliedState: {},
        provider: optimizations.provider || this.aiService.name,
      }),
    );

    return {
      fileName: parsedResult.fileName,
      extractedTextLength: parsedResult.extractedTextLength,
      draft,
      createdResume,
      audit,
    };
  }

  async applyAuditUpdates(
    userId: string,
    auditId: string,
    dto: ApplyLinkedInAuditDto,
  ): Promise<{
    audit: LinkedInAudit;
    syncedResume: Resume | null;
  }> {
    const audit = await this.getAudit(userId, auditId);

    const nextAppliedState = {
      ...audit.appliedState,
      ...(dto.appliedHeadline !== undefined ? { appliedHeadline: dto.appliedHeadline.trim() } : {}),
      ...(dto.appliedAbout !== undefined ? { appliedAbout: dto.appliedAbout.trim() } : {}),
      ...(dto.appliedSkills !== undefined ? { appliedSkills: dto.appliedSkills } : {}),
      ...(dto.checkedChecklistIds !== undefined
        ? { checkedChecklistIds: dto.checkedChecklistIds }
        : {}),
      ...(dto.syncToResume ? { syncedToResume: true } : {}),
      ...(dto.syncToProfile ? { syncedToProfile: true } : {}),
      lastAppliedAt: new Date().toISOString(),
    };

    const nextSnapshot: ResumeContent = {
      ...audit.profileSnapshot,
      headline:
        dto.appliedHeadline?.trim() || audit.profileSnapshot?.headline || '',
      summary:
        dto.appliedAbout?.trim() || audit.profileSnapshot?.summary || '',
    };

    if (dto.appliedSkills && dto.appliedSkills.length > 0) {
      const existingLower = new Set(
        (nextSnapshot.skills || []).map((s) => s.name.toLowerCase()),
      );
      const mergedSkills = [...(nextSnapshot.skills || [])];
      for (const skill of dto.appliedSkills) {
        const trimmed = skill.trim();
        if (trimmed && !existingLower.has(trimmed.toLowerCase())) {
          existingLower.add(trimmed.toLowerCase());
          mergedSkills.push({ name: trimmed, category: 'LinkedIn Top Skills' });
        }
      }
      nextSnapshot.skills = mergedSkills;
    }

    const updatedScore = evaluateLinkedInProfileScore({
      profile: nextSnapshot,
      targetRole: audit.targetRole,
    });

    audit.appliedState = nextAppliedState;
    audit.profileSnapshot = nextSnapshot;
    audit.scoreReport = updatedScore;
    audit.overallScore = updatedScore.overallScore;

    const savedAudit = await this.auditRepository.save(audit);

    let syncedResume: Resume | null = null;
    if (dto.syncToResume && audit.resumeId) {
      const existingResume = await this.resumeRepository.findOne({
        where: { id: audit.resumeId, userId },
      });
      if (existingResume) {
        existingResume.content = {
          ...existingResume.content,
          headline: nextSnapshot.headline,
          summary: nextSnapshot.summary,
          skills: (nextSnapshot.skills || []).map((s) => ({
          name: s.name,
          category: s.category || 'LinkedIn Top Skills',
        })),
        };
        syncedResume = await this.resumeRepository.save(existingResume);
      }
    }

    if (dto.syncToProfile) {
      await this.profilesService.updateProfileByUserId(userId, {
        headline: nextSnapshot.headline.slice(0, 200),
        summary: nextSnapshot.summary,
        skills: (nextSnapshot.skills || []).map((s) => ({
          name: s.name,
          category: s.category || 'LinkedIn Top Skills',
        })),
        linkedinUrl: audit.linkedinUrl || undefined,
      });
    }

    return {
      audit: savedAudit,
      syncedResume,
    };
  }

  private async resolveProfileSnapshot(
    user: User,
    resumeId?: string,
    linkedinUrl?: string,
    customHeadline?: string,
    customAbout?: string,
  ): Promise<{
    profileContent: ResumeContent;
    linkedinUrl?: string;
    resume: Resume | null;
  }> {
    let resume: Resume | null = null;
    let baseContent: ResumeContent;

    if (resumeId) {
      resume = await this.resumeRepository.findOne({
        where: { id: resumeId, userId: user.id, isArchived: false },
      });
      if (!resume) {
        throw new NotFoundException('Selected resume not found.');
      }
      baseContent = { ...resume.content };
    } else {
      const masterProfile = await this.profilesService.getProfileByUserId(user.id);
      baseContent = {
        contact: {
          fullName: user.fullName || 'Candidate',
          email: user.email || '',
          phone: masterProfile.phone,
          location: masterProfile.location,
          linkedinUrl: masterProfile.linkedinUrl,
          githubUrl: masterProfile.githubUrl,
          websiteUrl: masterProfile.websiteUrl,
        },
        headline: masterProfile.headline || '',
        summary: masterProfile.summary || '',
        skills: masterProfile.skills || [],
        experience: masterProfile.experience || [],
        education: masterProfile.education || [],
        projects: masterProfile.projects || [],
        certifications: masterProfile.certifications || [],
      };
    }

    const resolvedUrl =
      linkedinUrl?.trim() || baseContent.contact?.linkedinUrl?.trim() || undefined;

    const mergedContent: ResumeContent = {
      ...baseContent,
      contact: {
        ...baseContent.contact,
        linkedinUrl: resolvedUrl,
      },
      headline:
        customHeadline !== undefined && customHeadline.trim()
          ? customHeadline.trim()
          : baseContent.headline || '',
      summary:
        customAbout !== undefined && customAbout.trim()
          ? customAbout.trim()
          : baseContent.summary || '',
    };

    return { profileContent: mergedContent, linkedinUrl: resolvedUrl, resume };
  }

  private draftToResumeContent(
    user: User,
    draft: ParsedProfileDraft,
  ): ResumeContent {
    return {
      contact: {
        fullName: draft.contact?.fullName || user.fullName || 'Candidate',
        email: draft.contact?.email || user.email || '',
        phone: draft.contact?.phone || '',
        location: draft.contact?.location || draft.location || undefined,
        linkedinUrl: draft.contact?.linkedinUrl || undefined,
        githubUrl: draft.contact?.githubUrl || undefined,
        websiteUrl: draft.contact?.websiteUrl || undefined,
      },
      headline: draft.headline || 'Professional',
      summary: draft.summary || '',
      skills: draft.skills || [],
      experience: (draft.experience || []).map((exp) => ({
        company: exp.company || 'Company',
        title: exp.title || 'Role',
        location: exp.location,
        startDate: exp.startDate || '',
        endDate: exp.endDate,
        current: exp.current ?? false,
        bullets: exp.bullets || [],
      })),
      education: (draft.education || []).map((edu) => ({
        school: edu.school || 'University',
        degree: edu.degree || 'Degree',
        field: edu.field || '',
        graduationDate: edu.graduationDate,
      })),
      projects: draft.projects || [],
      certifications: draft.certifications || [],
    };
  }
}
