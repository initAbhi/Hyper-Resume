import {
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
} from '@nestjs/common';
import pdf from 'pdf-parse-fork';
import zlib from 'node:zlib';
import { AiService } from '../ai/ai.service.js';
import type { ParsedProfileDraft } from '../ai/interfaces/ai-provider.interface.js';

@Injectable()
export class ResumeParserService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

  constructor(private readonly aiService: AiService) {}

  async parseUploadedFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<{
    fileName: string;
    extractedTextLength: number;
    draft: ParsedProfileDraft;
  }> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestException('Uploaded file is empty');
    }

    if (fileBuffer.length > this.MAX_FILE_SIZE) {
      throw new PayloadTooLargeException('File exceeds the 10MB upload limit');
    }

    const text = await this.extractTextFromBuffer(fileBuffer, mimeType, originalName);

    if (!text || text.trim().length < 50) {
      throw new BadRequestException(
        'The uploaded document contains insufficient or unextractable text. Please ensure it is not scanned/rasterized or password-protected.',
      );
    }

    // Pass extracted text to AI extraction engine
    const draft = await this.aiService.parseResumeText(text);

    return {
      fileName: originalName,
      extractedTextLength: text.length,
      draft,
    };
  }

  private async extractTextFromBuffer(
    buffer: Buffer,
    mimeType: string,
    fileName: string,
  ): Promise<string> {
    const isPdf =
      mimeType === 'application/pdf' ||
      fileName.toLowerCase().endsWith('.pdf') ||
      buffer.subarray(0, 5).toString('ascii').startsWith('%PDF-');

    const isDocx =
      mimeType.includes('wordprocessingml') ||
      fileName.toLowerCase().endsWith('.docx') ||
      (buffer[0] === 0x50 && buffer[1] === 0x4b); // PK header

    if (isPdf) {
      return this.extractFromPdf(buffer);
    }

    if (isDocx) {
      return this.extractFromDocx(buffer);
    }

    // Fallback: UTF-8 plain text
    return buffer.toString('utf-8');
  }

  private async extractFromPdf(buffer: Buffer): Promise<string> {
    // Check PDF magic bytes
    if (!buffer.subarray(0, 5).toString('ascii').startsWith('%PDF-')) {
      throw new BadRequestException('Invalid PDF structure or header missing');
    }

    // 1. Primary extractor: pdf-parse-fork
    try {
      const parsed = await pdf(buffer);
      if (parsed.text && parsed.text.trim().length >= 50) {
        return parsed.text;
      }
    } catch {
      // Fallback to internal decompressor & stream extraction
    }

    // 2. Secondary fallback: decompress flate streams and extract tokens
    const raw = buffer.toString('binary');
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let streamMatch: RegExpExecArray | null;
    const textChunks: string[] = [];

    while ((streamMatch = streamRegex.exec(raw)) !== null) {
      let content = streamMatch[1];
      try {
        const decompressed = zlib.inflateSync(Buffer.from(content, 'binary'));
        content = decompressed.toString('binary');
      } catch {
        // Continue with raw stream if not flate compressed
      }

      const textRegex = /\(([^)]+)\)\s*Tj|\[([^\]]+)\]\s*TJ/g;
      let textMatch: RegExpExecArray | null;
      while ((textMatch = textRegex.exec(content)) !== null) {
        if (textMatch[1]) {
          textChunks.push(textMatch[1]);
        } else if (textMatch[2]) {
          const innerMatches = textMatch[2].match(/\(([^)]+)\)/g);
          if (innerMatches) {
            innerMatches.forEach((m) => textChunks.push(m.slice(1, -1)));
          }
        }
      }
    }

    const reconstructed = textChunks.join(' ').replace(/\s+/g, ' ');
    if (reconstructed.trim().length >= 50) {
      return reconstructed;
    }

    // 3. Fallback: plain ASCII stream strings
    const readable = raw.replace(/[^a-zA-Z0-9\s.,@:;()-]/g, ' ').replace(/\s+/g, ' ');
    return readable;
  }

  private extractFromDocx(buffer: Buffer): string {
    const raw = buffer.toString('binary');
    const xmlMatch = /<w:t[^>]*>(.*?)<\/w:t>/g;
    const textPieces: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = xmlMatch.exec(raw)) !== null) {
      textPieces.push(match[1]);
    }

    if (textPieces.length === 0) {
      const cleaned = raw.replace(/<[^>]+>/g, ' ').replace(/[^a-zA-Z0-9\s.,@:;()-]/g, ' ');
      return cleaned.replace(/\s+/g, ' ');
    }

    return textPieces.join(' ');
  }
}
