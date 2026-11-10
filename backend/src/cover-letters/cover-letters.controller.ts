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
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { User } from '../users/entities/user.entity.js';
import { CoverLettersService } from './cover-letters.service.js';
import {
  GenerateCoverLetterDto,
  RegenerateCoverLetterDto,
  UpdateCoverLetterDto,
} from './dto/cover-letter.dto.js';
import { ExportPdfDto } from '../resumes/dto/export-pdf.dto.js';
import { ExportDocxDto } from '../resumes/dto/export-docx.dto.js';
import { PdfExportService } from '../resumes/pdf-export.service.js';
import { DocxExportService } from '../resumes/docx-export.service.js';

@Controller('cover-letters')
@UseGuards(JwtAuthGuard)
export class CoverLettersController {
  constructor(
    private readonly coverLettersService: CoverLettersService,
    private readonly pdfExportService: PdfExportService,
    private readonly docxExportService: DocxExportService,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: User,
    @Query('resumeId') resumeId?: string,
  ) {
    return this.coverLettersService.list(user.id, resumeId);
  }

  @Get(':id')
  async getOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.coverLettersService.getOne(user.id, id);
  }

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generate(
    @CurrentUser() user: User,
    @Body() dto: GenerateCoverLetterDto,
  ) {
    return this.coverLettersService.generate(user.id, dto);
  }

  @Post(':id/regenerate')
  @HttpCode(HttpStatus.OK)
  async regenerate(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: RegenerateCoverLetterDto,
  ) {
    return this.coverLettersService.regenerate(user.id, id, dto);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateCoverLetterDto,
  ) {
    return this.coverLettersService.update(user.id, id, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.coverLettersService.remove(user.id, id);
  }

  @Post(':id/export/pdf')
  @HttpCode(HttpStatus.OK)
  async exportPdf(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: ExportPdfDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const letter = await this.coverLettersService.getOne(user.id, id);
    const result = await this.pdfExportService.generateVectorPdf({
      ...dto,
      fileName: dto.fileName || `${letter.title} - Cover Letter`,
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

  @Post(':id/export/docx')
  @HttpCode(HttpStatus.OK)
  async exportDocx(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: ExportDocxDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const letter = await this.coverLettersService.getOne(user.id, id);
    const result = await this.docxExportService.generateCoverLetterDocx(
      letter,
      dto.fileName,
    );

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
}

