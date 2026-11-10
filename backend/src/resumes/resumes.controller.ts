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
  Put,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ResumesService } from './resumes.service.js';
import { ResumeSharesService } from './resume-shares.service.js';
import { PdfExportService } from './pdf-export.service.js';
import { DocxExportService } from './docx-export.service.js';
import { CreateResumeDto } from './dto/create-resume.dto.js';
import { UpdateResumeDto } from './dto/update-resume.dto.js';
import { DuplicateResumeDto } from './dto/duplicate-resume.dto.js';
import { CreateResumeVersionDto } from './dto/create-resume-version.dto.js';
import { RunResumeAnalysisDto } from './dto/run-resume-analysis.dto.js';
import { AdaptResumeDto } from './dto/adapt-resume.dto.js';
import { AdaptSectionDto } from './dto/adapt-section.dto.js';
import { ApplyAdaptationDto } from './dto/apply-adaptation.dto.js';
import { ExportPdfDto } from './dto/export-pdf.dto.js';
import { ExportDocxDto } from './dto/export-docx.dto.js';
import { UpdateResumeShareDto } from './dto/update-resume-share.dto.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(
    private readonly resumesService: ResumesService,
    private readonly resumeSharesService: ResumeSharesService,
    private readonly pdfExportService: PdfExportService,
    private readonly docxExportService: DocxExportService,
  ) {}

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

  @Post('adapt')
  @HttpCode(HttpStatus.OK)
  async adaptResume(
    @CurrentUser() user: User,
    @Body() dto: AdaptResumeDto,
  ) {
    return this.resumesService.adaptWithProfile(user.id, dto);
  }

  @Post('adapt-section')
  @HttpCode(HttpStatus.OK)
  async adaptSection(
    @CurrentUser() user: User,
    @Body() dto: AdaptSectionDto,
  ) {
    return this.resumesService.adaptSection(user.id, dto);
  }

  @Get('adaptations/:adaptationId')
  async getAdaptation(
    @CurrentUser() user: User,
    @Param('adaptationId') adaptationId: string,
  ) {
    return this.resumesService.getAdaptation(user.id, adaptationId);
  }

  @Post('adaptations/:adaptationId/apply')
  @HttpCode(HttpStatus.CREATED)
  async applyAdaptation(
    @CurrentUser() user: User,
    @Param('adaptationId') adaptationId: string,
    @Body() dto: ApplyAdaptationDto,
  ) {
    return this.resumesService.applyAdaptation(user.id, adaptationId, dto);
  }

  @Get('shares/summary')
  async listSharesSummary(@CurrentUser() user: User) {
    return this.resumeSharesService.listUserShareSummaries(user.id);
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

  @Post(':resumeId/duplicate')
  @HttpCode(HttpStatus.CREATED)
  async duplicateResume(
    @CurrentUser() user: User,
    @Param('resumeId') resumeId: string,
    @Body() dto?: DuplicateResumeDto,
  ) {
    return this.resumesService.duplicateResume(user.id, resumeId, dto?.name);
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

  @Post(':resumeId/versions/:versionId/restore')
  @HttpCode(HttpStatus.OK)
  async restoreVersion(
    @CurrentUser() user: User,
    @Param('resumeId') resumeId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.resumesService.restoreVersion(user.id, resumeId, versionId);
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

  @Post(':resumeId/export/pdf')
  @HttpCode(HttpStatus.OK)
  async exportVectorPdf(
    @CurrentUser() user: User,
    @Param('resumeId') resumeId: string,
    @Body() dto: ExportPdfDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const resume = await this.resumesService.getResume(user.id, resumeId);
    const result = await this.pdfExportService.generateVectorPdf({
      ...dto,
      fileName: dto.fileName || resume.name,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(result.fileName)}"`,
      'X-ATS-Text-Verified': String(result.atsVerified),
      'X-ATS-Extractable-Chars': String(result.extractableChars),
      'X-ATS-Extractable-Words': String(result.extractableWords),
      'X-PDF-Page-Count': String(result.pageCount),
      'X-PDF-Size-Bytes': String(result.sizeBytes),
      'Cache-Control': 'no-store',
    });

    return new StreamableFile(result.buffer);
  }

  @Post(':resumeId/export/docx')
  @HttpCode(HttpStatus.OK)
  async exportNativeDocx(
    @CurrentUser() user: User,
    @Param('resumeId') resumeId: string,
    @Body() dto: ExportDocxDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const resume = await this.resumesService.getResume(user.id, resumeId);
    const result = await this.docxExportService.generateResumeDocx(resume, {
      pageSize: dto.pageSize,
      fileName: dto.fileName,
    });

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(result.fileName)}"`,
      'X-ATS-Text-Verified': String(result.atsVerified),
      'X-ATS-Extractable-Chars': String(result.extractableChars),
      'X-ATS-Extractable-Words': String(result.extractableWords),
      'X-DOCX-Size-Bytes': String(result.sizeBytes),
      'Cache-Control': 'no-store',
    });

    return new StreamableFile(result.buffer);
  }

  @Get(':resumeId/share')
  async getShareAnalytics(
    @CurrentUser() user: User,
    @Param('resumeId') resumeId: string,
  ) {
    return this.resumeSharesService.getShareWithAnalytics(user.id, resumeId);
  }

  @Put(':resumeId/share')
  async upsertShareSettings(
    @CurrentUser() user: User,
    @Param('resumeId') resumeId: string,
    @Body() dto: UpdateResumeShareDto,
  ) {
    return this.resumeSharesService.upsertShareSettings(user.id, resumeId, dto);
  }

  @Post(':resumeId/share/regenerate-slug')
  @HttpCode(HttpStatus.OK)
  async regenerateShareSlug(
    @CurrentUser() user: User,
    @Param('resumeId') resumeId: string,
  ) {
    return this.resumeSharesService.regenerateSlug(user.id, resumeId);
  }

  @Delete(':resumeId/share/analytics')
  @HttpCode(HttpStatus.OK)
  async resetShareAnalytics(
    @CurrentUser() user: User,
    @Param('resumeId') resumeId: string,
  ) {
    return this.resumeSharesService.resetAnalytics(user.id, resumeId);
  }
}
