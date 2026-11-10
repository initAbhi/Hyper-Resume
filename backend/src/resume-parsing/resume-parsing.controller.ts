import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeParserService } from './resume-parser.service.js';
import { PdfCompressionService } from './pdf-compression.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

export interface UploadedFilePayload {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size?: number;
}

const COMPRESSION_FILE_INTERCEPTOR_OPTIONS = {
  limits: {
    fileSize: 30 * 1024 * 1024, // 30 MB
  },
};

@Controller('resume-parsing')
@UseGuards(JwtAuthGuard)
export class ResumeParsingController {
  constructor(
    private readonly parserService: ResumeParserService,
    private readonly compressionService: PdfCompressionService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAndParse(
    @UploadedFile() file?: UploadedFilePayload,
  ) {
    if (!file) {
      throw new BadRequestException('A PDF or DOCX file must be provided in the multipart request');
    }

    return this.parserService.parseUploadedFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Post('compress')
  @UseInterceptors(FileInterceptor('file', COMPRESSION_FILE_INTERCEPTOR_OPTIONS))
  async compressPdf(
    @UploadedFile() file?: UploadedFilePayload,
  ) {
    if (!file) {
      throw new BadRequestException('A PDF file must be provided for compression');
    }

    const result = await this.compressionService.compressPdf(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // Omit raw compressedBuffer from JSON response
    return {
      success: result.success,
      status: result.status,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      reductionPercentage: result.reductionPercentage,
      withinUploadLimit: result.withinUploadLimit,
      verification: result.verification,
      message: result.message,
    };
  }

  @Post('compress-and-parse')
  @UseInterceptors(FileInterceptor('file', COMPRESSION_FILE_INTERCEPTOR_OPTIONS))
  async compressAndParse(
    @UploadedFile() file?: UploadedFilePayload,
  ) {
    if (!file) {
      throw new BadRequestException('A PDF file must be provided for compression');
    }

    const compressionResult = await this.compressionService.compressPdf(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // If compression could not bring the file within the 10 MB limit or failed verification
    if (!compressionResult.success || !compressionResult.withinUploadLimit || !compressionResult.compressedBuffer) {
      return {
        success: false,
        status: compressionResult.status,
        originalSize: compressionResult.originalSize,
        compressedSize: compressionResult.compressedSize,
        reductionPercentage: compressionResult.reductionPercentage,
        withinUploadLimit: false,
        verification: compressionResult.verification,
        message:
          compressionResult.message ||
          'We optimized your resume, but its size is still above our 10 MB limit. You can try another file or use a more optimized PDF.',
      };
    }

    // Automatically continue existing ATS analysis workflow with verified compressed buffer
    const parsed = await this.parserService.parseUploadedFile(
      compressionResult.compressedBuffer,
      file.originalname,
      'application/pdf',
    );

    return {
      success: true,
      status: compressionResult.status,
      originalSize: compressionResult.originalSize,
      compressedSize: compressionResult.compressedSize,
      reductionPercentage: compressionResult.reductionPercentage,
      withinUploadLimit: true,
      verification: compressionResult.verification,
      parsed,
    };
  }
}
