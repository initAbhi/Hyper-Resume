import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JobMatchingService } from './job-matching.service.js';
import { CreateJobMatchDto } from './dto/create-job-match.dto.js';
import { CreateTailoredResumeDto } from './dto/create-tailored-resume.dto.js';
import { PublicJobMatchDto } from './dto/public-job-match.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { createPublicRateLimiter } from '../common/utils/public-rate-limit.util.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('job-matches')
export class JobMatchingController {
  private readonly enforcePublicMatchLimit = createPublicRateLimiter(15, 10 * 60 * 1000);

  constructor(private readonly jobMatchingService: JobMatchingService) {}

  @Post('public/analyze')
  @HttpCode(HttpStatus.OK)
  async analyzePublicJobMatch(
    @Body() dto: PublicJobMatchDto,
    @Req() req: Request,
  ) {
    this.enforcePublicMatchLimit(req);
    return this.jobMatchingService.analyzePublicJobMatch(dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createJobMatch(
    @CurrentUser() user: User,
    @Body() dto: CreateJobMatchDto,
  ) {
    return this.jobMatchingService.createJobMatch(user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listJobMatches(
    @CurrentUser() user: User,
    @Query('resumeId') resumeId?: string,
  ) {
    return this.jobMatchingService.listJobMatches(user.id, resumeId);
  }

  @Get(':matchId')
  @UseGuards(JwtAuthGuard)
  async getJobMatch(
    @CurrentUser() user: User,
    @Param('matchId') matchId: string,
  ) {
    return this.jobMatchingService.getJobMatch(user.id, matchId);
  }

  @Post(':matchId/tailor-suggestions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async generateTailoringSuggestions(
    @CurrentUser() user: User,
    @Param('matchId') matchId: string,
  ) {
    return this.jobMatchingService.generateTailoringSuggestions(user.id, matchId);
  }

  @Post(':matchId/tailor-resume')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createTailoredResumeFromMatch(
    @CurrentUser() user: User,
    @Param('matchId') matchId: string,
    @Body() dto: CreateTailoredResumeDto,
  ) {
    return this.jobMatchingService.createTailoredResumeFromMatch(
      user.id,
      matchId,
      dto,
    );
  }
}
