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
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ResumeSharesService,
  type ViewerTelemetryContext,
} from './resume-shares.service.js';
import { RecordShareEventDto } from './dto/update-resume-share.dto.js';
import { ExportPdfDto } from './dto/export-pdf.dto.js';

function extractViewerContext(req: Request): ViewerTelemetryContext {
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp =
    (Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded?.split(',')[0]?.trim()) ||
    req.ip ||
    'unknown';
  const uaHeader = req.headers['user-agent'];
  const refHeader = req.headers['referer'] || req.headers['referrer'];

  return {
    ip: clientIp,
    userAgent: typeof uaHeader === 'string' ? uaHeader : undefined,
    referer: typeof refHeader === 'string' ? refHeader : undefined,
  };
}

@Controller('public/resumes')
export class PublicResumeSharesController {
  constructor(private readonly sharesService: ResumeSharesService) {}

  @Get(':slug')
  async getPublicSharedResume(
    @Param('slug') slug: string,
    @Query('track') track: string | undefined,
    @Req() req: Request,
  ) {
    const shouldTrack = track !== '0' && track !== 'false';
    return this.sharesService.getPublicResumeBySlug(
      slug,
      extractViewerContext(req),
      shouldTrack,
    );
  }

  @Post(':slug/events')
  @HttpCode(HttpStatus.CREATED)
  async recordEvent(
    @Param('slug') slug: string,
    @Body() dto: RecordShareEventDto,
    @Req() req: Request,
  ) {
    return this.sharesService.recordPublicEvent(
      slug,
      dto.eventType,
      extractViewerContext(req),
    );
  }

  @Get(':slug/docx')
  async exportPublicDocx(
    @Param('slug') slug: string,
    @Query('pageSize') pageSize: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const normalizedSize = pageSize === 'US Letter' ? 'US Letter' : 'A4';
    const result = await this.sharesService.exportPublicDocx(
      slug,
      normalizedSize,
      extractViewerContext(req),
    );

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(result.fileName)}"`,
      'X-ATS-Text-Verified': String(result.atsVerified),
      'X-DOCX-Size-Bytes': String(result.sizeBytes),
      'Cache-Control': 'no-store',
    });

    return new StreamableFile(result.buffer);
  }

  @Post(':slug/pdf')
  @HttpCode(HttpStatus.OK)
  async exportPublicPdf(
    @Param('slug') slug: string,
    @Body() dto: ExportPdfDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const result = await this.sharesService.exportPublicPdf(
      slug,
      dto,
      extractViewerContext(req),
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(result.fileName)}"`,
      'X-ATS-Text-Verified': String(result.atsVerified),
      'X-PDF-Page-Count': String(result.pageCount),
      'X-PDF-Size-Bytes': String(result.sizeBytes),
      'Cache-Control': 'no-store',
    });

    return new StreamableFile(result.buffer);
  }
}

