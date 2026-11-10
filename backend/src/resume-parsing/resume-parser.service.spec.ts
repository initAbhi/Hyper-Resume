import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { Document, Header, Packer, Paragraph } from 'docx';
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

  it('should cleanly extract text from real compressed OOXML .docx including header contact details', async () => {
    const doc = new Document({
      sections: [
        {
          headers: {
            default: new Header({
              children: [
                new Paragraph('Priya Nair | priya.nair@example.com | Seattle, WA'),
              ],
            }),
          },
          children: [
            new Paragraph('Principal Distributed Systems Engineer'),
            new Paragraph({
              text: 'Engineered Kafka settlement consumer processing 40M+ daily events at 99.99% SLA.',
              bullet: { level: 0 },
            }),
            new Paragraph('Skills: Go, Kubernetes, Kafka, PostgreSQL, Redis'),
          ],
        },
      ],
    });

    const docxBuffer = await Packer.toBuffer(doc);
    const result = await service.parseUploadedFile(
      docxBuffer,
      'priya_resume.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );

    expect(result.fileName).toBe('priya_resume.docx');
    const extractedArg = mockAiService.parseResumeText.mock.calls[0][0] as string;
    expect(extractedArg).toContain('priya.nair@example.com');
    expect(extractedArg).toContain('40M+ daily events');
    expect(extractedArg).toContain('Kubernetes');
  });

  it('should reject legacy binary .doc files with a clear BadRequestException', async () => {
    const oleHeader = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    await expect(
      service.parseUploadedFile(oleHeader, 'legacy_resume.doc', 'application/msword'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject corrupt PK-prefixed .docx archives instead of passing binary garbage', async () => {
    const corruptDocx = Buffer.from('PK\x03\x04corrupted-binary-stream-not-a-valid-zip');
    await expect(
      service.parseUploadedFile(
        corruptDocx,
        'corrupt.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
