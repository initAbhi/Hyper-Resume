import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobApplication } from './entities/job-application.entity.js';
import { Resume } from '../resumes/entities/resume.entity.js';
import { ResumeVersion } from '../resumes/entities/resume-version.entity.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(ResumeVersion)
    private readonly versionRepository: Repository<ResumeVersion>,
  ) {}

  private async resolveResumeVersionId(
    userId: string,
    candidateId?: string,
  ): Promise<string | undefined> {
    if (!candidateId) return undefined;

    try {
      // 1. Direct match with ResumeVersion owned by caller
      const directVersion = await this.versionRepository.findOne({
        where: { id: candidateId },
        relations: { resume: true },
      });
      if (directVersion && directVersion.resume?.userId === userId) {
        return directVersion.id;
      }

      // 2. Candidate ID is a Resume owned by user
      const resume = await this.resumeRepository.findOne({
        where: { id: candidateId, userId },
      });
      if (resume) {
        const latestVersion = await this.versionRepository.findOne({
          where: { resumeId: resume.id },
          order: { versionNumber: 'DESC' },
        });
        if (latestVersion) {
          return latestVersion.id;
        }

        // Create snapshot version on the fly so foreign key constraint holds
        const snapshotVersion = this.versionRepository.create({
          resumeId: resume.id,
          versionNumber: resume.version || 1,
          changeSummary: 'Snapshot for job application',
          contentSnapshot: resume.content,
        });
        const savedVersion = await this.versionRepository.save(snapshotVersion);
        return savedVersion.id;
      }
    } catch {
      // Gracefully fall through
    }

    // 3. Fallback: return undefined so foreign key constraint is not violated
    return undefined;
  }

  async createApplication(
    userId: string,
    dto: CreateApplicationDto,
  ): Promise<JobApplication> {
    const resumeVersionId = await this.resolveResumeVersionId(
      userId,
      dto.resumeVersionId || dto.resumeId,
    );

    const company = (dto.company || dto.companyName || '').trim();
    const role = (dto.role || dto.jobTitle || '').trim();

    const app = this.applicationRepository.create({
      userId,
      company,
      role,
      resumeVersionId,
      jobDescriptionId: dto.jobDescriptionId,
      jobUrl: (dto.jobUrl || dto.applicationUrl)?.trim(),
      status: dto.status || 'draft',
      appliedDate: dto.appliedDate ? new Date(dto.appliedDate) : undefined,
      notes: dto.notes?.trim(),
    });

    const saved = await this.applicationRepository.save(app);
    this.logger.log(`Created job application "${role} at ${company}" (${saved.id}) for user ${userId}`);
    return this.getApplication(userId, saved.id);
  }

  async listApplications(
    userId: string,
    pagination: PaginationQueryDto,
  ): Promise<{ items: JobApplication[]; total: number; page: number; limit: number }> {
    const [items, total] = await this.applicationRepository.findAndCount({
      where: { userId },
      relations: { resumeVersion: true },
      order: { createdAt: 'DESC' },
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

  async getApplication(userId: string, id: string): Promise<JobApplication> {
    const app = await this.applicationRepository.findOne({
      where: { id, userId },
      relations: { resumeVersion: true },
    });

    if (!app) {
      throw new NotFoundException('Application not found or access denied');
    }

    return app;
  }

  async updateApplication(
    userId: string,
    id: string,
    dto: UpdateApplicationDto,
  ): Promise<JobApplication> {
    const app = await this.getApplication(userId, id);

    if (dto.company !== undefined || dto.companyName !== undefined) {
      app.company = (dto.company || dto.companyName || '').trim();
    }
    if (dto.role !== undefined || dto.jobTitle !== undefined) {
      app.role = (dto.role || dto.jobTitle || '').trim();
    }
    if (dto.resumeVersionId !== undefined || dto.resumeId !== undefined) {
      app.resumeVersionId = await this.resolveResumeVersionId(
        userId,
        dto.resumeVersionId || dto.resumeId,
      );
    }
    if (dto.jobDescriptionId !== undefined) {
      app.jobDescriptionId = dto.jobDescriptionId;
    }
    if (dto.jobUrl !== undefined || dto.applicationUrl !== undefined) {
      app.jobUrl = (dto.jobUrl || dto.applicationUrl)?.trim();
    }
    if (dto.status !== undefined) app.status = dto.status;
    if (dto.appliedDate !== undefined) {
      app.appliedDate = dto.appliedDate ? new Date(dto.appliedDate) : undefined;
    }
    if (dto.notes !== undefined) app.notes = dto.notes?.trim();

    await this.applicationRepository.save(app);
    this.logger.log(`Updated job application ${id} for user ${userId} (status: ${app.status})`);
    return this.getApplication(userId, id);
  }

  async deleteApplication(userId: string, id: string): Promise<{ success: boolean }> {
    const app = await this.getApplication(userId, id);
    await this.applicationRepository.remove(app);
    this.logger.log(`Deleted job application ${id} for user ${userId}`);
    return { success: true };
  }
}
