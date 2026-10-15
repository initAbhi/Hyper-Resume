import {
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
} from '@nestjs/common';
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

    const text = this.extractTextFromBuffer(fileBuffer, mimeType, originalName);

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

  private extractTextFromBuffer(
    buffer: Buffer,
    mimeType: string,
    fileName: string,
  ): string {
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

  private extractFromPdf(buffer: Buffer): string {
    // Check PDF magic bytes
    if (!buffer.subarray(0, 5).toString('ascii').startsWith('%PDF-')) {
      throw new BadRequestException('Invalid PDF structure or header missing');
    }

    const raw = buffer.toString('binary');

    // Extract text between BT (Begin Text) and ET (End Text) or Tj/TJ tokens safely
    const textChunks: string[] = [];
    const textRegex = /\(([^)]+)\)\s*Tj|\[([^\]]+)\]\s*TJ/g;
    let match: RegExpExecArray | null;

    while ((match = textRegex.exec(raw)) !== null) {
      if (match[1]) {
        textChunks.push(match[1]);
      } else if (match[2]) {
        // TJ array matches (e.g. [(Hel) -10 (lo)])
        const innerMatches = match[2].match(/\(([^)]+)\)/g);
        if (innerMatches) {
          innerMatches.forEach((m) => textChunks.push(m.slice(1, -1)));
        }
      }
    }

    if (textChunks.length === 0) {
      // Stream extraction fallback
      const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
      let streamMatch: RegExpExecArray | null;
      while ((streamMatch = streamRegex.exec(raw)) !== null) {
        const streamData = streamMatch[1];
        const readable = streamData.replace(/[^a-zA-Z0-9\s.,@:;()-]/g, ' ');
        if (readable.trim().length > 30) {
          textChunks.push(readable.trim());
        }
      }
    }

    return textChunks.join(' ').replace(/\s+/g, ' ');
  }

  private extractFromDocx(buffer: Buffer): string {
    const raw = buffer.toString('binary');
    // Extract XML contents from word/document.xml without external xml entities
    const xmlMatch = /<w:t[^>]*>(.*?)<\/w:t>/g;
    const textPieces: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = xmlMatch.exec(raw)) !== null) {
      textPieces.push(match[1]);
    }

    if (textPieces.length === 0) {
      // Fallback clean ASCII text extraction from binary stream
      const cleaned = raw.replace(/<[^>]+>/g, ' ').replace(/[^a-zA-Z0-9\s.,@:;()-]/g, ' ');
      return cleaned.replace(/\s+/g, ' ');
    }

    return textPieces.join(' ');
  }
}
