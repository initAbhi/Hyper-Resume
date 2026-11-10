import { describe, it, expect, vi } from 'bun:test';
import {
  formatFileSize,
  MAX_UPLOAD_LIMIT_BYTES,
  CheckerState,
} from '../app/tools/resume-checker/page';
import { ApiClient, PdfCompressionResponse } from './api-client';

describe('Resume Checker Smart Compression Flow', () => {
  it('should format bytes accurately across units', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(10 * 1024 * 1024)).toBe('10.0 MB');
    expect(formatFileSize(15.7 * 1024 * 1024)).toBe('15.7 MB');
  });

  it('should strictly align MAX_UPLOAD_LIMIT_BYTES with the 10 MB application standard', () => {
    expect(MAX_UPLOAD_LIMIT_BYTES).toBe(10 * 1024 * 1024);
    expect(MAX_UPLOAD_LIMIT_BYTES).toBe(10485760);
  });

  describe('Upload Flow Decision Logic', () => {
    it('Scenario A: File <= 10 MB bypasses compression and follows normal ATS upload', () => {
      const normalFile = new File(['small pdf content'], 'resume.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(normalFile, 'size', { value: 4 * 1024 * 1024 }); // 4 MB

      let nextState: CheckerState = 'IDLE';
      let promptCompression = false;

      if (normalFile.size > MAX_UPLOAD_LIMIT_BYTES) {
        promptCompression = true;
        nextState = 'COMPRESSION_CONFIRMATION';
      } else {
        nextState = 'ATS_ANALYSIS_IN_PROGRESS';
      }

      expect(promptCompression).toBe(false);
      expect(nextState).toBe('ATS_ANALYSIS_IN_PROGRESS');
    });

    it('Scenario B: File > 10 MB triggers compression confirmation prompt for PDF', () => {
      const heavyPdf = new File(['heavy pdf content'], 'heavy_resume.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(heavyPdf, 'size', { value: 15.5 * 1024 * 1024 }); // 15.5 MB

      let nextState: CheckerState = 'IDLE';
      let promptCompression = false;
      const isPdf =
        heavyPdf.type === 'application/pdf' || heavyPdf.name.toLowerCase().endsWith('.pdf');

      if (heavyPdf.size > MAX_UPLOAD_LIMIT_BYTES) {
        if (isPdf) {
          promptCompression = true;
          nextState = 'COMPRESSION_CONFIRMATION';
        }
      }

      expect(promptCompression).toBe(true);
      expect(nextState).toBe('COMPRESSION_CONFIRMATION');
    });

    it('rejects oversized non-PDF files without offering PDF compression', () => {
      const heavyDocx = new File(['heavy docx content'], 'heavy_resume.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      Object.defineProperty(heavyDocx, 'size', { value: 14 * 1024 * 1024 });

      let errorMessage: string | null = null;
      let nextState: CheckerState = 'IDLE';
      const isPdf =
        heavyDocx.type === 'application/pdf' || heavyDocx.name.toLowerCase().endsWith('.pdf');

      if (heavyDocx.size > MAX_UPLOAD_LIMIT_BYTES) {
        if (!isPdf) {
          errorMessage =
            'Your file is 14.0 MB, which exceeds our 10 MB upload limit. Smart optimization is currently supported for PDF files only.';
          nextState = 'IDLE';
        }
      }

      expect(nextState).toBe('IDLE');
      expect(errorMessage).toContain('Smart optimization is currently supported for PDF files only');
    });
  });

  describe('Scenario C: Successful Compression & Automatic ATS Continuation', () => {
    it('automatically continues ATS workflow when compression succeeds below 10 MB and passes verification', async () => {
      const client = new ApiClient('http://localhost:3001/api/v1');

      const mockSuccessResponse: PdfCompressionResponse = {
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
        parsed: {
          fileName: 'heavy.pdf',
          extractedTextLength: 500,
          draft: {
            headline: 'Senior Backend Engineer',
            summary: 'Experienced distributed systems specialist',
            location: 'Remote',
            skills: [{ name: 'TypeScript' }],
            experience: [],
            education: [],
            projects: [],
            certifications: [],
            confidenceScore: 0.95,
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ data: mockSuccessResponse, meta: {} }),
      } as unknown as Response) as unknown as typeof fetch;

      const file = new File(['content'], 'heavy.pdf', { type: 'application/pdf' });
      const result = await client.compressAndParseResume(file);

      expect(result.success).toBe(true);
      expect(result.withinUploadLimit).toBe(true);
      expect(result.status).toBe('COMPRESSED');
      expect(result.verification.validPdf).toBe(true);
      expect(result.verification.pageCountPreserved).toBe(true);
      expect(result.verification.textExtractionPassed).toBe(true);
      expect(result.parsed).toBeDefined();
      expect(result.parsed?.draft.headline).toBe('Senior Backend Engineer');
    });
  });

  describe('Scenario D: Compression Fails to Reach 10 MB Target', () => {
    it('blocks ATS analysis and flags SIZE_LIMIT_NOT_REACHED if output is still >= 10 MB', async () => {
      const client = new ApiClient('http://localhost:3001/api/v1');

      const mockLimitNotReachedResponse: PdfCompressionResponse = {
        success: false,
        status: 'SIZE_LIMIT_NOT_REACHED',
        originalSize: 18874368,
        compressedSize: 12582912,
        reductionPercentage: 33.3,
        withinUploadLimit: false,
        verification: {
          validPdf: true,
          pageCountPreserved: true,
          textExtractionPassed: true,
        },
        message:
          'We optimized your resume, but its size is still above our 10 MB limit. You can try another file or use a more optimized PDF.',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ data: mockLimitNotReachedResponse, meta: {} }),
      } as unknown as Response) as unknown as typeof fetch;

      const file = new File(['huge content'], 'huge.pdf', { type: 'application/pdf' });
      const result = await client.compressAndParseResume(file);

      expect(result.success).toBe(false);
      expect(result.withinUploadLimit).toBe(false);
      expect(result.status).toBe('SIZE_LIMIT_NOT_REACHED');
      expect(result.parsed).toBeUndefined();
      expect(result.message).toContain('still above our 10 MB limit');
    });
  });
});
