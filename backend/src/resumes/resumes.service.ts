import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from './entities/resume.entity.js';
import { ResumeVersion } from './entities/resume-version.entity.js';
import { ResumeAnalysis, type ResumeAuditFindings } from './entities/resume-analysis.entity.js';
import type { ResumeContent } from './entities/resume.types.js';
import { CandidateProfile } from '../profiles/entities/candidate-profile.entity.js';
import { CreateResumeDto } from './dto/create-resume.dto.js';
import { UpdateResumeDto } from './dto/update-resume.dto.js';
import { CreateResumeVersionDto } from './dto/create-resume-version.dto.js';
import { RunResumeAnalysisDto } from './dto/run-resume-analysis.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@Injectable()
export class ResumesService {
  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(ResumeVersion)
    private readonly versionRepository: Repository<ResumeVersion>,
    @InjectRepository(ResumeAnalysis)
    private readonly analysisRepository: Repository<ResumeAnalysis>,
    @InjectRepository(CandidateProfile)
    private readonly profileRepository: Repository<CandidateProfile>,
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

    return this.resumeRepository.save(resume);
  }

  async archiveResume(userId: string, resumeId: string): Promise<{ success: boolean }> {
    const resume = await this.getResume(userId, resumeId);
    resume.isArchived = true;
    await this.resumeRepository.save(resume);
    return { success: true };
  }

  async listVersions(userId: string, resumeId: string): Promise<ResumeVersion[]> {
    await this.getResume(userId, resumeId); // Verify ownership

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
    await this.getResume(userId, resumeId); // Verify ownership

    const version = await this.versionRepository.findOne({
      where: { id: versionId, resumeId },
    });

    if (!version) {
      throw new NotFoundException('Resume version not found');
    }

    return version;
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

    const newVersion = this.versionRepository.create({
      resumeId,
      versionNumber: nextVersionNumber,
      changeSummary: dto.changeSummary.trim(),
      contentSnapshot: resume.content,
      jobMatchId: dto.jobMatchId,
    });

    return this.versionRepository.save(newVersion);
  }

  async runAnalysis(
    userId: string,
    resumeId: string,
    dto: RunResumeAnalysisDto,
  ): Promise<ResumeAnalysis> {
    const resume = await this.getResume(userId, resumeId);

    const findings = this.evaluateResumeContent(resume.content);
    const score = this.calculateAuditScore(findings);
    const recommendations = this.generateAuditRecommendations(findings);

    const analysis = this.analysisRepository.create({
      userId,
      resumeId,
      analysisType: dto.analysisType,
      score,
      findings,
      recommendations,
    });

    return this.analysisRepository.save(analysis);
  }

  private evaluateResumeContent(content: ResumeContent): ResumeAuditFindings {
    const actionVerbsList = [
      'architected', 'built', 'spearheaded', 'led', 'designed', 'developed',
      'engineered', 'optimized', 'reduced', 'increased', 'scaled', 'implemented',
      'refactored', 'migrated', 'automated', 'streamlined', 'cut', 'delivered',
    ];

    let actionVerbsCount = 0;
    let metricsCount = 0;
    const bulletQuality: ResumeAuditFindings['bulletQuality'] = [];

    const allBullets: string[] = [];
    (content.experience || []).forEach((exp) => {
      (exp.bullets || []).forEach((b) => allBullets.push(b));
    });

    for (const bullet of allBullets) {
      const lower = bullet.toLowerCase();
      const hasActionVerb = actionVerbsList.some((verb) => lower.startsWith(verb) || lower.includes(` ${verb} `));
      const hasMetric = /\b\d+(%|\+)?\b|\b\$\d+|\b[0-9]+x\b/i.test(bullet);

      if (hasActionVerb) actionVerbsCount++;
      if (hasMetric) metricsCount++;

      let feedback = 'Strong impact statement';
      if (!hasActionVerb && !hasMetric) {
        feedback = 'Missing active strong verb and quantifiable outcome';
      } else if (!hasActionVerb) {
        feedback = 'Start with a strong action verb (e.g. Architected, Scaled)';
      } else if (!hasMetric) {
        feedback = 'Include measurable metric (e.g. % improvement, latency reduction)';
      }

      bulletQuality.push({
        bullet,
        hasActionVerb,
        hasMetric,
        feedback,
      });
    }

    const missingSections: string[] = [];
    if (!content.experience || content.experience.length === 0) missingSections.push('Experience');
    if (!content.education || content.education.length === 0) missingSections.push('Education');
    if (!content.skills || content.skills.length === 0) missingSections.push('Skills');

    const formattingFlags: string[] = [];
    if (!content.contact?.email) formattingFlags.push('Missing contact email');
    if (!content.headline) formattingFlags.push('Missing professional headline');

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
