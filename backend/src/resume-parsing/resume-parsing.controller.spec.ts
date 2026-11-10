import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResumeParsingController, UploadedFilePayload } from './resume-parsing.controller.js';
import { ResumeParserService } from './resume-parser.service.js';
import { PdfCompressionService, CompressionResult } from './pdf-compression.service.js';
import { BadRequestException } from '@nestjs/common';
import type { ParsedProfileDraft } from '../ai/interfaces/ai-provider.interface.js';

describe('ResumeParsingController', () => {
  let controller: ResumeParsingController;
  let parserService: ResumeParserService;
  let compressionService: PdfCompressionService;

  const mockDraft: ParsedProfileDraft = {
    headline: 'Senior Backend Engineer',
    summary: 'Experienced engineer specialized in microservices',
    location: 'San Francisco, CA',
    skills: [
      { name: 'TypeScript', category: 'technical' },
      { name: 'PostgreSQL', category: 'technical' },
    ],
    experience: [
      {
        company: 'Tech Corp',
        title: 'Backend Engineer',
        startDate: '2021',
        current: true,
        bullets: ['Architected distributed pipelines with 99.99% uptime.'],
      },
    ],
    education: [
      {
        school: 'Tech University',
        degree: 'BS',
        field: 'Computer Science',
      },
    ],
    projects: [],
    certifications: [],
    confidenceScore: 0.95,
  };

  beforeEach(() => {
    parserService = {
      parseUploadedFile: vi.fn(),
    } as unknown as ResumeParserService;

    compressionService = {
      compressPdf: vi.fn(),
    } as unknown as PdfCompressionService;

    controller = new ResumeParsingController(parserService, compressionService);
  });

  describe('uploadAndParse', () => {
    it('should throw BadRequestException if file is missing', async () => {
      await expect(controller.uploadAndParse(undefined)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should parse file and return draft when valid file is provided', async () => {
      const mockFile: UploadedFilePayload = {
        buffer: Buffer.from('%PDF-1.4 mock content'),
        originalname: 'resume.pdf',
        mimetype: 'application/pdf',
      };

      vi.spyOn(parserService, 'parseUploadedFile').mockResolvedValueOnce({
        fileName: 'resume.pdf',
        extractedTextLength: 450,
        draft: mockDraft,
      });

      const result = await controller.uploadAndParse(mockFile);

      expect(parserService.parseUploadedFile).toHaveBeenCalledWith(
        mockFile.buffer,
        'resume.pdf',
        'application/pdf',
      );
      expect(result.draft.headline).toBe('Senior Backend Engineer');
    });
  });

  describe('compressPdf', () => {
    it('should throw BadRequestException if file is missing', async () => {
      await expect(controller.compressPdf(undefined)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return compression metadata and omit raw buffer from response', async () => {
      const mockFile: UploadedFilePayload = {
        buffer: Buffer.from('%PDF-1.4 oversized mock content'),
        originalname: 'large_resume.pdf',
        mimetype: 'application/pdf',
      };

      const mockResult: CompressionResult = {
        success: true,
        status: 'COMPRESSED',
        originalSize: 15728640,
        compressedSize: 4500000,
        reductionPercentage: 71.4,
        withinUploadLimit: true,
        verification: {
          validPdf: true,
          pageCountPreserved: true,
          textExtractionPassed: true,
        },
        compressedBuffer: Buffer.from('%PDF-1.4 compressed'),
      };

      vi.spyOn(compressionService, 'compressPdf').mockResolvedValueOnce(mockResult);

      const response = await controller.compressPdf(mockFile);

      expect(response.success).toBe(true);
      expect(response.status).toBe('COMPRESSED');
      expect(response.originalSize).toBe(15728640);
      expect(response.compressedSize).toBe(4500000);
      expect(response.withinUploadLimit).toBe(true);
      expect((response as any).compressedBuffer).toBeUndefined();
    });
  });

  describe('compressAndParse', () => {
    it('should throw BadRequestException if file is missing', async () => {
      await expect(controller.compressAndParse(undefined)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully compress, verify, and automatically continue to ATS parsing', async () => {
      const mockFile: UploadedFilePayload = {
        buffer: Buffer.from('%PDF-1.4 15MB content'),
        originalname: 'my_heavy_resume.pdf',
        mimetype: 'application/pdf',
      };

      const compressedBuffer = Buffer.from('%PDF-1.4 compressed 4MB');

      const mockResult: CompressionResult = {
        success: true,
        status: 'COMPRESSED',
        originalSize: 15728640,
        compressedSize: 4194304,
        reductionPercentage: 73.3,
        withinUploadLimit: true,
        verification: {
          validPdf: true,
          pageCountPreserved: true,
          textExtractionPassed: true,
        },
        compressedBuffer,
      };

      vi.spyOn(compressionService, 'compressPdf').mockResolvedValueOnce(mockResult);
      vi.spyOn(parserService, 'parseUploadedFile').mockResolvedValueOnce({
        fileName: 'my_heavy_resume.pdf',
        extractedTextLength: 600,
        draft: mockDraft,
      });

      const response = await controller.compressAndParse(mockFile);

      expect(response.success).toBe(true);
      expect(response.withinUploadLimit).toBe(true);
      expect(response.status).toBe('COMPRESSED');
      expect(parserService.parseUploadedFile).toHaveBeenCalledWith(
        compressedBuffer,
        'my_heavy_resume.pdf',
        'application/pdf',
      );
      expect(response.parsed?.draft.headline).toBe('Senior Backend Engineer');
    });

    it('should stop and NOT continue ATS analysis if compression cannot reach 10MB limit', async () => {
      const mockFile: UploadedFilePayload = {
        buffer: Buffer.from('%PDF-1.4 20MB content'),
        originalname: 'giant_resume.pdf',
        mimetype: 'application/pdf',
      };

      const mockResult: CompressionResult = {
        success: false,
        status: 'SIZE_LIMIT_NOT_REACHED',
        originalSize: 20971520,
        compressedSize: 12582912,
        reductionPercentage: 40.0,
        withinUploadLimit: false,
        verification: {
          validPdf: true,
          pageCountPreserved: true,
          textExtractionPassed: true,
        },
        compressedBuffer: Buffer.from('%PDF-1.4 still 12MB'),
        message: 'We optimized your resume, but its size is still above our 10 MB limit.',
      };

      vi.spyOn(compressionService, 'compressPdf').mockResolvedValueOnce(mockResult);

      const response = await controller.compressAndParse(mockFile);

      expect(response.success).toBe(false);
      expect(response.withinUploadLimit).toBe(false);
      expect(response.status).toBe('SIZE_LIMIT_NOT_REACHED');
      expect(parserService.parseUploadedFile).not.toHaveBeenCalled();
      expect(response.parsed).toBeUndefined();
    });
  });
});
