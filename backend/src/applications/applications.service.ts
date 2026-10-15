import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobApplication } from './entities/job-application.entity.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,
  ) {}

  async createApplication(
    userId: string,
    dto: CreateApplicationDto,
  ): Promise<JobApplication> {
    const app = this.applicationRepository.create({
      userId,
      company: dto.company.trim(),
      role: dto.role.trim(),
      resumeVersionId: dto.resumeVersionId,
      jobUrl: dto.jobUrl?.trim(),
      status: dto.status || 'draft',
      appliedDate: dto.appliedDate ? new Date(dto.appliedDate) : undefined,
      notes: dto.notes?.trim(),
    });

    return this.applicationRepository.save(app);
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

    if (dto.company !== undefined) app.company = dto.company.trim();
    if (dto.role !== undefined) app.role = dto.role.trim();
    if (dto.resumeVersionId !== undefined) app.resumeVersionId = dto.resumeVersionId;
    if (dto.jobUrl !== undefined) app.jobUrl = dto.jobUrl?.trim();
    if (dto.status !== undefined) app.status = dto.status;
    if (dto.appliedDate !== undefined) {
      app.appliedDate = dto.appliedDate ? new Date(dto.appliedDate) : undefined;
    }
    if (dto.notes !== undefined) app.notes = dto.notes?.trim();

    return this.applicationRepository.save(app);
  }

  async deleteApplication(userId: string, id: string): Promise<{ success: boolean }> {
    const app = await this.getApplication(userId, id);
    await this.applicationRepository.remove(app);
    return { success: true };
  }
}
