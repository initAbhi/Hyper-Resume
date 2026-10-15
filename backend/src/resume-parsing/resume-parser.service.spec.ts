import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { ResumeParserService } from './resume-parser.service.js';

describe('ResumeParserService', () => {
  let service: ResumeParserService;
  let mockAiService: any;

  beforeEach(() => {
    mockAiService = {
      parseResumeText: vi.fn().mockResolvedValue({
        headline: 'Senior Full Stack Engineer',
        summary: 'Experienced web engineer.',
        skills: [{ name: 'TypeScript', category: 'Tech' }],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        confidenceScore: 90,
      }),
    };

    service = new ResumeParserService(mockAiService);
  });

  it('should throw BadRequestException if buffer is empty', async () => {
    await expect(
      service.parseUploadedFile(Buffer.from(''), 'empty.pdf', 'application/pdf'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw PayloadTooLargeException if file exceeds 10MB', async () => {
    const hugeBuffer = Buffer.alloc(11 * 1024 * 1024);
    await expect(
      service.parseUploadedFile(hugeBuffer, 'huge.pdf', 'application/pdf'),
    ).rejects.toThrow(PayloadTooLargeException);
  });

  it('should throw BadRequestException if PDF contains unextractable / short text', async () => {
    const invalidPdf = Buffer.from('%PDF-1.4\nshort\n%%EOF');
    await expect(
      service.parseUploadedFile(invalidPdf, 'corrupt.pdf', 'application/pdf'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should successfully parse extracted resume text into structured candidate draft', async () => {
    const sampleResumeText = `
      Abhinav Singh
      Senior Full Stack Engineer
      Bengaluru, India
      Experienced software developer with extensive background in React, TypeScript, Go, and PostgreSQL.
      Experience:
      Acme Corp - Senior Engineer (2022 - Present)
      - Architected high-throughput microservices handling 8M+ daily events.
      Education:
      University of Technology - B.S. Computer Science
    `;

    const result = await service.parseUploadedFile(
      Buffer.from(sampleResumeText, 'utf-8'),
      'resume.txt',
      'text/plain',
    );

    expect(result.draft.headline).toBe('Senior Full Stack Engineer');
    expect(result.extractedTextLength).toBeGreaterThan(50);
    expect(mockAiService.parseResumeText).toHaveBeenCalled();
  });
});
