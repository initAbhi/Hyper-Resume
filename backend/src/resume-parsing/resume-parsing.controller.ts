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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

export interface UploadedFilePayload {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size?: number;
}

@Controller('resume-parsing')
@UseGuards(JwtAuthGuard)
export class ResumeParsingController {
  constructor(private readonly parserService: ResumeParserService) {}

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
}
