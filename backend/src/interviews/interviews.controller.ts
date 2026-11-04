import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { User } from '../users/entities/user.entity.js';
import { InterviewsService } from './interviews.service.js';
import { StartInterviewDto } from './dto/start-interview.dto.js';
import { SubmitAnswerDto } from './dto/submit-answer.dto.js';
import { SubmitFollowUpDto } from './dto/submit-follow-up.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post('start')
  async startInterview(
    @CurrentUser() user: User,
    @Body() dto: StartInterviewDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.interviewsService.startSession(user.id, dto, idempotencyKey);
  }

  @Get(':id')
  async getSession(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.interviewsService.getSession(user.id, id);
  }

  @Post(':id/answer')
  async submitAnswer(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.interviewsService.submitAnswer(user.id, id, dto);
  }

  @Post(':id/follow-up')
  async submitFollowUp(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitFollowUpDto,
  ) {
    return this.interviewsService.submitFollowUp(user.id, id, dto);
  }

  @Post(':id/finish')
  async finishSession(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.interviewsService.finishSession(user.id, id);
  }

  @Get(':id/report')
  async getReport(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.interviewsService.getReport(user.id, id);
  }

  @Get()
  async listSessions(
    @CurrentUser() user: User,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.interviewsService.listSessions(user.id, pagination);
  }
}

