import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from './jobs.service.js';
import { CreateJobDescriptionDto } from './dto/create-job-description.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('job-descriptions')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateJobDescriptionDto,
  ) {
    return this.jobsService.createJobDescription(user.id, dto);
  }

  @Get()
  async list(
    @CurrentUser() user: User,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.jobsService.listJobDescriptions(user.id, pagination);
  }

  @Get(':id')
  async getOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.jobsService.getJobDescription(user.id, id);
  }
}
