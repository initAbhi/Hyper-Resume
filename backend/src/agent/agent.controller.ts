import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Optional,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  Sse,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { AgentService } from './agent.service.js';
import { AgentExecutorService } from './agent-executor.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../users/entities/user.entity.js';
import { CreateAgentMessageDto, CreateConversationDto } from './dto/agent-message.dto.js';
import { ApproveToolDto } from './dto/approve-tool.dto.js';
import { ParseAttachmentUrlDto } from './dto/parse-attachment-url.dto.js';
import { SseTicketGuard } from './guards/sse-ticket.guard.js';
import {
  AgentAttachmentService,
  type AttachmentParseKind,
  type UploadedAttachmentFile,
} from './services/agent-attachment.service.js';
import { AgentUsageGuardService } from './services/agent-usage-guard.service.js';

const ATTACHMENT_UPLOAD_OPTIONS = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
};

@Controller('agent')
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly executorService: AgentExecutorService,
    @Optional()
    private readonly attachmentService?: AgentAttachmentService,
    @Optional()
    private readonly usageGuard?: AgentUsageGuardService,
  ) {}

  @Get('usage')
  @UseGuards(JwtAuthGuard)
  async getUsage(
    @CurrentUser() user: User,
    @Query('conversationId') conversationId?: string,
  ) {
    if (!this.usageGuard) {
      return { available: false };
    }
    return this.usageGuard.getUsageSnapshot(user.id, conversationId);
  }

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createConversation(
    @CurrentUser() user: User,
    @Body() dto: CreateConversationDto,
  ) {
    return this.agentService.createConversation(user.id, dto);
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  async getConversations(@CurrentUser() user: User) {
    return this.agentService.getConversations(user.id);
  }

  @Get('conversations/:id')
  @UseGuards(JwtAuthGuard)
  async getConversation(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.agentService.getConversation(user.id, id);
  }

  @Patch('conversations/:id')
  @UseGuards(JwtAuthGuard)
  async updateConversation(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { title?: string },
  ) {
    return this.agentService.updateConversation(user.id, id, body || {});
  }

  @Delete('conversations/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteConversation(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.agentService.deleteConversation(user.id, id);
  }

  @Get('conversations/:id/tasks')
  @UseGuards(JwtAuthGuard)
  async getConversationTasks(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.agentService.getConversationTasks(user.id, id);
  }

  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  async getConversationMessages(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.agentService.getConversationMessages(user.id, id);
  }

  @Post('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async submitMessage(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAgentMessageDto,
  ) {
    return this.agentService.submitMessage(user.id, id, dto);
  }

  @Post('conversations/:id/stream-ticket')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async generateStreamTicket(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.agentService.generateStreamTicket(user.id, id);
  }

  @Sse('conversations/:id/stream')
  @UseGuards(SseTicketGuard)
  streamConversation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
    @Query('lastEventId') lastEventId?: string,
    @Headers('last-event-id') lastEventIdHeader?: string,
    @Query('taskId') taskId?: string,
    @Res({ passthrough: true }) res?: Response,
  ): Observable<{ id?: string; type?: string; data: Record<string, unknown> }> {
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('X-Accel-Buffering', 'no');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
    }
    const resolvedLastId = lastEventId || lastEventIdHeader;
    if (taskId) {
      return this.agentService.subscribeToConversationStream(
        id,
        user.id,
        resolvedLastId,
        taskId,
      );
    }
    return this.agentService.subscribeToConversationStream(
      id,
      user.id,
      resolvedLastId,
    );
  }

  @Post('tasks/:taskId/approve')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async approveTask(
    @CurrentUser() user: User,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: ApproveToolDto,
  ) {
    if (dto.decision === 'approve') {
      if (dto.acceptedFieldPaths) {
        return this.executorService.approveAndApplyProposal(
          taskId,
          dto.executionId,
          dto.proposalHash,
          user.id,
          dto.acceptedFieldPaths,
        );
      }
      return this.executorService.approveAndApplyProposal(
        taskId,
        dto.executionId,
        dto.proposalHash,
        user.id,
      );
    } else {
      if (dto.reason) {
        await this.executorService.rejectProposal(
          taskId,
          dto.executionId,
          user.id,
          dto.proposalHash,
          dto.reason,
        );
      } else {
        await this.executorService.rejectProposal(
          taskId,
          dto.executionId,
          user.id,
        );
      }
      return { success: true, rejected: true };
    }
  }

  @Post('tasks/:taskId/cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async cancelTask(
    @CurrentUser() user: User,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return this.agentService.cancelTask(taskId, user.id);
  }

  @Post('attachments/parse')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', ATTACHMENT_UPLOAD_OPTIONS))
  async parseUploadedAttachment(
    @CurrentUser() user: User,
    @UploadedFile() file?: UploadedAttachmentFile,
    @Body('kind') kind?: AttachmentParseKind,
  ) {
    if (!this.attachmentService) {
      throw new BadRequestException('Attachment parsing service is unavailable');
    }
    if (this.usageGuard) {
      await this.usageGuard.enforceAttachmentGuard(user.id);
    }
    return this.attachmentService.parseUploadedAttachment(user.id, file, kind || 'auto');
  }

  @Post('attachments/parse-url')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async parseJobUrlAttachment(
    @CurrentUser() user: User,
    @Body() dto: ParseAttachmentUrlDto,
  ) {
    if (!this.attachmentService) {
      throw new BadRequestException('Attachment parsing service is unavailable');
    }
    if (this.usageGuard) {
      await this.usageGuard.enforceAttachmentGuard(user.id);
    }
    return this.attachmentService.parseJobUrlAttachment(user.id, dto.url);
  }
}

