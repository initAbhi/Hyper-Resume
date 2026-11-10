import {
  BadRequestException,
  Injectable,
  Logger,
  PayloadTooLargeException,
} from '@nestjs/common';
import pdf from 'pdf-parse-fork';
import mammoth from 'mammoth';
import AdmZip from 'adm-zip';
import zlib from 'node:zlib';
import { AiService } from '../ai/ai.service.js';
import type { ParsedProfileDraft } from '../ai/interfaces/ai-provider.interface.js';
import {
  detectLinkedInProfilePdf,
  normalizeParsedProfileDraft,
  parseLinkedInProfileText,
} from './linkedin-pdf-parser.util.js';

@Injectable()
export class ResumeParserService {
  private readonly logger = new Logger(ResumeParserService.name);
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

  constructor(private readonly aiService: AiService) {}

  async parseUploadedFileWithRawText(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<{
    fileName: string;
    extractedTextLength: number;
    extractedText: string;
    draft: ParsedProfileDraft;
  }> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestException('Uploaded file is empty');
    }

    if (fileBuffer.length > this.MAX_FILE_SIZE) {
      throw new PayloadTooLargeException('File exceeds the 10MB upload limit');
    }

    this.logger.log(`Parsing uploaded resume file "${originalName}" (${fileBuffer.length} bytes, mime: ${mimeType})`);

    const text = await this.extractTextFromBuffer(fileBuffer, mimeType, originalName);

    if (!text || text.trim().length < 50) {
      this.logger.warn(`Insufficient extractable text from "${originalName}" (${text?.length || 0} chars)`);
      throw new BadRequestException(
        'The uploaded document contains insufficient or unextractable text. Please ensure it is not scanned/rasterized or password-protected.',
      );
    }

    this.logger.log(`Extracted ${text.length} characters from "${originalName}", initiating AI profile draft parsing`);

    const detection = detectLinkedInProfilePdf(text);
    let rawDraft: ParsedProfileDraft;
    try {
      rawDraft = await this.aiService.parseResumeText(text);
    } catch (err) {
      if (detection.isLinkedInPdf) {
        rawDraft = parseLinkedInProfileText(text);
      } else {
        throw err;
      }
    }

    const draft = normalizeParsedProfileDraft(rawDraft, text);

    this.logger.log(
      `Successfully generated ${draft.sourceType || 'standard_resume'} draft from "${originalName}"`,
    );

    return {
      fileName: originalName,
      extractedTextLength: text.length,
      extractedText: text,
      draft,
    };
  }

  async parseUploadedFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<{
    fileName: string;
    extractedTextLength: number;
    draft: ParsedProfileDraft;
  }> {
    const res = await this.parseUploadedFileWithRawText(fileBuffer, originalName, mimeType);
    return {
      fileName: res.fileName,
      extractedTextLength: res.extractedTextLength,
      draft: res.draft,
    };
  }

  public async extractTextFromBuffer(
    buffer: Buffer,
    mimeType: string,
    fileName: string,
  ): Promise<string> {
    const isLegacyDoc =
      mimeType === 'application/msword' ||
      fileName.toLowerCase().endsWith('.doc') ||
      (buffer.length >= 4 &&
        buffer[0] === 0xd0 &&
        buffer[1] === 0xcf &&
        buffer[2] === 0x11 &&
        buffer[3] === 0xe0);

    if (isLegacyDoc) {
      throw new BadRequestException(
        'Legacy binary .doc format is not supported. Please save your resume as .docx or .pdf and upload again.',
      );
    }

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

  private async extractFromDocx(buffer: Buffer): Promise<string> {
    if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
      throw new BadRequestException(
        'Invalid DOCX archive signature. Please upload a valid .docx Word document.',
      );
    }

    const sections: string[] = [];

    // 1. Primary extractor: mammoth parses OOXML paragraphs, tables, and lists cleanly
    try {
      const mammothResult = await mammoth.extractRawText({ buffer });
      if (mammothResult.value && mammothResult.value.trim().length > 0) {
        sections.push(mammothResult.value.trim());
      }
    } catch (err: any) {
      this.logger.warn(`Mammoth DOCX extraction warning: ${err?.message || err}`);
    }

    // 2. Zip XML pass: extract header/footer contact blocks and act as document.xml fallback
    try {
      const zip = new AdmZip(buffer);
      const entries = zip.getEntries();

      const headerFooterText = entries
        .filter((e) => /^word\/(header|footer)\d*\.xml$/i.test(e.entryName))
        .map((e) => this.extractXmlParagraphText(e.getData().toString('utf-8')))
        .filter(Boolean);

      if (headerFooterText.length > 0) {
        sections.unshift(headerFooterText.join('\n'));
      }

      if (sections.join('\n').trim().length < 50) {
        const docEntry = entries.find((e) => e.entryName === 'word/document.xml');
        if (docEntry) {
          const docXmlText = this.extractXmlParagraphText(
            docEntry.getData().toString('utf-8'),
          );
          if (docXmlText) sections.push(docXmlText);
        }
      }
    } catch (err: any) {
      if (sections.length === 0) {
        this.logger.warn(`DOCX ZIP extraction failed: ${err?.message || err}`);
        throw new BadRequestException(
          'Unable to read DOCX archive. Ensure the file is an unencrypted .docx Word document.',
        );
      }
    }

    return sections
      .join('\n\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private extractXmlParagraphText(xml: string): string {
    if (!xml) return '';
    const withBreaks = xml
      .replace(/<\/w:p>/gi, '\n')
      .replace(/<w:br\s*\/?>/gi, '\n')
      .replace(/<w:tab\s*\/?>/gi, ' ');

    const matches = withBreaks.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>|\n/g) || [];
    const text = matches
      .map((token) =>
        token === '\n' ? '\n' : token.replace(/<\/?w:t[^>]*>/gi, ''),
      )
      .join('');

    return this.decodeXmlEntities(text)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n');
  }

  private decodeXmlEntities(input: string): string {
    return input
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16)),
      );
  }
}
