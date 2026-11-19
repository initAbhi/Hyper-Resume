import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AgentAttachmentService } from './agent-attachment.service.js';

describe('AgentAttachmentService', () => {
  let service: AgentAttachmentService;
  let mockResumeParser: any;
  let mockResumesService: any;
  let mockJobsService: any;
  let mockJdUrlParser: any;

  beforeEach(() => {
    mockResumeParser = {
      parseUploadedFileWithRawText: vi.fn(),
      extractTextFromBuffer: vi.fn(),
    };
    mockResumesService = {
      createResume: vi.fn().mockImplementation((_userId, dto) =>
        Promise.resolve({
          id: 'res-uuid-99',
          name: dto.name,
          templateKey: dto.templateKey,
          content: dto.content,
        }),
      ),
    };
    mockJobsService = {
      createJobDescription: vi.fn().mockImplementation((_userId, dto) =>
        Promise.resolve({
          id: 'jd-uuid-99',
          title: dto.title,
          companyName: dto.companyName,
          originalText: dto.originalText,
        }),
      ),
    };
    mockJdUrlParser = {
      fetchAndParseJobUrl: vi.fn().mockResolvedValue({
        jobDescriptionId: 'jd-url-1',
        title: 'Staff Engineer',
        companyName: 'Vercel',
        location: 'Remote',
        workplace: 'Remote',
        applyUrl: 'https://vercel.com/careers/staff',
        descriptionText: 'Build Next.js cloud infrastructure.',
        extractionSource: 'json_ld',
      }),
    };
    service = new AgentAttachmentService(
      mockResumeParser,
      mockResumesService,
      mockJobsService,
      mockJdUrlParser,
    );
  });

  it('imports an uploaded resume PDF, persists it, and computes instant ATS score', async () => {
    mockResumeParser.extractTextFromBuffer.mockResolvedValueOnce(
      'Jane Doe jane@example.com Senior Full Stack Engineer React Node.js PostgreSQL with 6+ years building web applications.',
    );
    mockResumeParser.parseUploadedFileWithRawText.mockResolvedValueOnce({
      fileName: 'Jane_Doe_Resume.pdf',
      extractedTextLength: 920,
      extractedText: 'Jane Doe jane@example.com Senior Full Stack Engineer React Node.js PostgreSQL',
      draft: {
        contact: {
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          location: 'Austin, TX',
        },
        headline: 'Senior Full Stack Engineer',
        summary: 'Full-stack engineer with 6+ years shipping TypeScript and PostgreSQL systems.',
        location: 'Austin, TX',
        skills: [{ name: 'TypeScript' }, { name: 'React' }, { name: 'PostgreSQL' }],
        experience: [
          {
            company: 'Acme Inc',
            title: 'Senior Engineer',
            startDate: '2022',
            current: true,
            bullets: ['Architected TypeScript APIs reducing p95 latency by 42% across 1M requests/day.'],
          },
        ],
        education: [{ school: 'UT Austin', degree: 'B.S.', field: 'Computer Science' }],
        projects: [],
        certifications: [],
        confidenceScore: 0.94,
      },
    });

    const result = await service.parseUploadedAttachment('user-1', {
      buffer: Buffer.from('%PDF-1.4 sample'),
      originalname: 'Jane_Doe_Resume.pdf',
      mimetype: 'application/pdf',
    });

    expect(result.kind).toBe('resume');
    if (result.kind === 'resume') {
      expect(result.resumeId).toBe('res-uuid-99');
      expect(result.resumeName).toBe('Jane Doe Resume');
      expect(result.atsScore).toBeGreaterThan(0);
      expect(result.skillsCount).toBe(3);
      expect(result.experienceCount).toBe(1);
    }
  });

  it('auto-classifies an uploaded Job Description PDF as kind="jd"', async () => {
    mockResumeParser.extractTextFromBuffer.mockResolvedValueOnce(
      'Senior Backend Engineer at Stripe\nAbout the role: Build payments infrastructure.\nResponsibilities: Design APIs.\nRequired qualifications: 5+ years distributed systems.\nPreferred qualifications: Go or Ruby.\nEqual opportunity employer. Apply now.',
    );
    mockResumeParser.parseUploadedFileWithRawText.mockResolvedValueOnce({
      fileName: 'Senior_Backend_Engineer_Stripe.pdf',
      extractedTextLength: 600,
      extractedText:
        'Senior Backend Engineer at Stripe\nAbout the role: Build payments infrastructure.\nResponsibilities: Design APIs.\nRequired qualifications: 5+ years distributed systems.\nPreferred qualifications: Go or Ruby.\nEqual opportunity employer. Apply now.',
      draft: {
        headline: '',
        summary: '',
        location: '',
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        confidenceScore: 0.2,
      },
    });

    const result = await service.parseUploadedAttachment('user-1', {
      buffer: Buffer.from('%PDF-1.4 jd'),
      originalname: 'Senior_Backend_Engineer_Stripe.pdf',
      mimetype: 'application/pdf',
    });

    expect(result.kind).toBe('jd');
    if (result.kind === 'jd') {
      expect(result.jobDescriptionId).toBe('jd-uuid-99');
      expect(result.title).toBe('Senior Backend Engineer');
      expect(result.companyName).toBe('Stripe');
    }
  });

  it('rejects unsupported file extensions and oversized uploads', async () => {
    await expect(
      service.parseUploadedAttachment('user-1', {
        buffer: Buffer.from('binary'),
        originalname: 'malware.exe',
        mimetype: 'application/x-msdownload',
      }),
    ).rejects.toThrow(/Unsupported file format/);

    await expect(
      service.parseUploadedAttachment('user-1', {
        buffer: Buffer.alloc(10 * 1024 * 1024 + 10),
        originalname: 'huge.pdf',
        mimetype: 'application/pdf',
      }),
    ).rejects.toThrow(/10 MB/);
  });
});

