import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResumesService } from './resumes.service.js';
import { CreateResumeDto } from './dto/create-resume.dto.js';
import { UpdateResumeDto } from './dto/update-resume.dto.js';
import { CreateResumeVersionDto } from './dto/create-resume-version.dto.js';
import { RunResumeAnalysisDto } from './dto/run-resume-analysis.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createResume(
    @CurrentUser() user: User,
    @Body() dto: CreateResumeDto,
  ) {
    return this.resumesService.createResume(user.id, dto);
  }

  @Get()
  async listResumes(
    @CurrentUser() user: User,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.resumesService.listResumes(user.id, pagination);
  }

  @Get(':resumeId')
  async getResume(
    @CurrentUser() user: User,
    @Param('resumeId') resumeId: string,
  ) {
    return this.resumesService.getResume(user.id, resumeId);
  }

  @Patch(':resumeId')
  async updateResume(
    @CurrentUser() user: User,
    @Param('resumeId') resumeId: string,
    @Body() dto: UpdateResumeDto,
  ) {
    return this.resumesService.updateResume(user.id, resumeId, dto);
  }

  @Delete(':resumeId')
  @HttpCode(HttpStatus.OK)
  async archiveResume(
    @CurrentUser() user: User,
    @Param('resumeId') resumeId: string,
  ) {
    return this.resumesService.archiveResume(user.id, resumeId);
  }

  @Get(':resumeId/versions')
  async listVersions(
    @CurrentUser() user: User,
    @Param('resumeId') resumeId: string,
  ) {
    return this.resumesService.listVersions(user.id, resumeId);
  }

  @Get(':resumeId/versions/:versionId')
  async getVersion(
    @CurrentUser() user: User,
    @Param('resumeId') resumeId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.resumesService.getVersion(user.id, resumeId, versionId);
  }

  @Post(':resumeId/versions')
  @HttpCode(HttpStatus.CREATED)
  async createVersion(
    @CurrentUser() user: User,
    @Param('resumeId') resumeId: string,
    @Body() dto: CreateResumeVersionDto,
  ) {
    return this.resumesService.createVersion(user.id, resumeId, dto);
  }

  @Post(':resumeId/analyses')
  @HttpCode(HttpStatus.CREATED)
  async runAnalysis(
    @CurrentUser() user: User,
    @Param('resumeId') resumeId: string,
    @Body() dto: RunResumeAnalysisDto,
  ) {
    return this.resumesService.runAnalysis(user.id, resumeId, dto);
  }
}
