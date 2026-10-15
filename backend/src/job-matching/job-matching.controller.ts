import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JobMatchingService } from './job-matching.service.js';
import { CreateJobMatchDto } from './dto/create-job-match.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('job-matches')
@UseGuards(JwtAuthGuard)
export class JobMatchingController {
  constructor(private readonly jobMatchingService: JobMatchingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createJobMatch(
    @CurrentUser() user: User,
    @Body() dto: CreateJobMatchDto,
  ) {
    return this.jobMatchingService.createJobMatch(user.id, dto);
  }

  @Get(':matchId')
  async getJobMatch(
    @CurrentUser() user: User,
    @Param('matchId') matchId: string,
  ) {
    return this.jobMatchingService.getJobMatch(user.id, matchId);
  }
}
