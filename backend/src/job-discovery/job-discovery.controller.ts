import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobDiscoveryService } from './job-discovery.service.js';
import {
  RunDiscoveredMatchDto,
  SaveDiscoveredJobDto,
  SearchDiscoveredJobsDto,
} from './dto/job-discovery.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('job-discovery')
@UseGuards(JwtAuthGuard)
export class JobDiscoveryController {
  constructor(private readonly discoveryService: JobDiscoveryService) {}

  @Get('boards')
  listSupportedBoards() {
    return this.discoveryService.listSupportedBoards();
  }

  @Get('search')
  async searchJobs(
    @CurrentUser() user: User,
    @Query() query: SearchDiscoveredJobsDto,
  ) {
    return this.discoveryService.searchJobs(user.id, query);
  }

  @Post('save-to-tracker')
  async saveToTracker(
    @CurrentUser() user: User,
    @Body() dto: SaveDiscoveredJobDto,
  ) {
    return this.discoveryService.saveDiscoveredJobToTracker(user.id, dto);
  }

  @Post('run-match')
  @HttpCode(HttpStatus.CREATED)
  async runQuickMatch(
    @CurrentUser() user: User,
    @Body() dto: RunDiscoveredMatchDto,
  ) {
    return this.discoveryService.runDiscoveredJobMatch(user.id, dto);
  }
}

