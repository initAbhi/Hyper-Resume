import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobDescription } from './entities/job-description.entity.js';
import { CreateJobDescriptionDto } from './dto/create-job-description.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { AiService } from '../ai/ai.service.js';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(JobDescription)
    private readonly jobRepository: Repository<JobDescription>,
    private readonly aiService: AiService,
  ) {}

  async createJobDescription(
    userId: string,
    dto: CreateJobDescriptionDto,
  ): Promise<JobDescription> {
    const parsedRequirements = await this.aiService.parseJobDescription(dto.originalText);

    const job = this.jobRepository.create({
      userId,
      title: dto.title.trim(),
      companyName: dto.companyName?.trim(),
      originalText: dto.originalText.trim(),
      sourceUrl: dto.sourceUrl?.trim(),
      parsedRequirements,
    });

    return this.jobRepository.save(job);
  }

  async listJobDescriptions(
    userId: string,
    pagination: PaginationQueryDto,
  ): Promise<{ items: JobDescription[]; total: number; page: number; limit: number }> {
    const [items, total] = await this.jobRepository.findAndCount({
      where: { userId },
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

  async getJobDescription(userId: string, id: string): Promise<JobDescription> {
    const job = await this.jobRepository.findOne({
      where: { id, userId },
    });

    if (!job) {
      throw new NotFoundException('Job description not found or access denied');
    }

    return job;
  }
}
