import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LinkedInService } from './linkedin.service.js';
import { ApplyLinkedInAuditDto, OptimizeLinkedInDto } from './dto/linkedin.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../users/entities/user.entity.js';
import type { UploadedFilePayload } from '../resume-parsing/resume-parsing.controller.js';

@Controller('linkedin')
@UseGuards(JwtAuthGuard)
export class LinkedInController {
  constructor(private readonly linkedInService: LinkedInService) {}

  @Get('audits')
  async listAudits(@CurrentUser() user: User) {
    return this.linkedInService.listAudits(user.id);
  }

  @Get('audits/:auditId')
  async getAudit(
    @CurrentUser() user: User,
    @Param('auditId', ParseUUIDPipe) auditId: string,
  ) {
    return this.linkedInService.getAudit(user.id, auditId);
  }

  @Post('optimize')
  @HttpCode(HttpStatus.OK)
  async optimizeProfile(
    @CurrentUser() user: User,
    @Body() dto: OptimizeLinkedInDto,
  ) {
    return this.linkedInService.optimizeProfile(user, dto);
  }

  @Post('import-pdf')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async importLinkedInPdf(
    @CurrentUser() user: User,
    @UploadedFile() file?: UploadedFilePayload,
    @Body('createResume') createResumeRaw?: string,
    @Body('syncToProfile') syncToProfileRaw?: string,
    @Body('resumeName') resumeName?: string,
    @Body('targetRole') targetRole?: string,
    @Body('industry') industry?: string,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Please select a LinkedIn Profile PDF ("More -> Save to PDF") or DOCX file to import.',
      );
    }

    return this.linkedInService.importLinkedInPdfAndOptimize(
      user,
      file.buffer,
      file.originalname,
      file.mimetype,
      {
        createResume: createResumeRaw !== 'false',
        syncToProfile: syncToProfileRaw !== 'false',
        resumeName,
        targetRole,
        industry,
      },
    );
  }

  @Patch('audits/:auditId/apply')
  async applyUpdates(
    @CurrentUser() user: User,
    @Param('auditId', ParseUUIDPipe) auditId: string,
    @Body() dto: ApplyLinkedInAuditDto,
  ) {
    return this.linkedInService.applyAuditUpdates(user.id, auditId, dto);
  }

  @Delete('audits/:auditId')
  async deleteAudit(
    @CurrentUser() user: User,
    @Param('auditId', ParseUUIDPipe) auditId: string,
  ) {
    return this.linkedInService.deleteAudit(user.id, auditId);
  }
}

