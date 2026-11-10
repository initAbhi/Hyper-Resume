import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { CoverLettersService } from './cover-letters.service.js';

describe('CoverLettersService', () => {
  let service: CoverLettersService;
  let mockCoverLetterRepo: any;
  let mockResumeRepo: any;
  let mockJobMatchRepo: any;
  let mockAiService: any;

  const sampleResume = {
    id: 'res-1',
    userId: 'usr-1',
    isArchived: false,
    content: {
      contact: {
        fullName: 'Alexander Sharma',
        email: 'alex@example.com',
        phone: '+1 415 555 0192',
        location: 'San Francisco, CA',
      },
      headline: 'Senior Full Stack Engineer',
      summary: 'Built scalable fintech infrastructure.',
      skills: [{ name: 'NestJS' }, { name: 'PostgreSQL' }],
      experience: [
        {
          title: 'Senior Full Stack Engineer',
          company: 'CloudScale Payments',
          startDate: '2023-01',
          current: true,
          bullets: ['Scaled ledger throughput to 25,000+ RPS.'],
        },
      ],
      education: [],
    },
  };

  beforeEach(() => {
    mockCoverLetterRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn((data) => ({ id: 'cl-1', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'cl-1', ...data })),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    mockResumeRepo = {
      findOne: vi.fn(),
    };

    mockJobMatchRepo = {
      findOne: vi.fn(),
    };

    mockAiService = {
      generateCoverLetter: vi.fn().mockResolvedValue({
        salutation: 'Dear Stripe Hiring Team,',
        openingParagraph: 'Opening impact paragraph grounded in CloudScale Payments.',
        bodyParagraphs: ['Body paragraph 1.', 'Body paragraph 2.'],
        closingParagraph: 'Closing invitation paragraph.',
        signOff: 'Sincerely,',
        highlightedKeywords: ['NestJS', 'PostgreSQL'],
        factualVerificationNotes: 'Verified against resume bullets.',
        provider: 'gemini',
      }),
    };

    service = new CoverLettersService(
      mockCoverLetterRepo,
      mockResumeRepo,
      mockJobMatchRepo,
      mockAiService,
    );
  });

  it('should generate and persist a cover letter seeded from verified resume contact and AI output', async () => {
    mockResumeRepo.findOne.mockResolvedValue(sampleResume);

    const saved = await service.generate('usr-1', {
      resumeId: 'res-1',
      targetRole: 'Staff Platform Engineer',
      companyName: 'Stripe',
      tone: 'Executive',
    });

    expect(saved.id).toBe('cl-1');
    expect(saved.title).toBe('Stripe — Staff Platform Engineer');
    expect(saved.senderName).toBe('Alexander Sharma');
    expect(saved.highlightedKeywords).toEqual(['NestJS', 'PostgreSQL']);
    expect(mockAiService.generateCoverLetter).toHaveBeenCalledWith(
      expect.objectContaining({
        targetRole: 'Staff Platform Engineer',
        companyName: 'Stripe',
        tone: 'Executive',
      }),
    );
  });

  it('should regenerate only the opening section while preserving existing body and closing', async () => {
    mockCoverLetterRepo.findOne.mockResolvedValue({
      id: 'cl-1',
      userId: 'usr-1',
      resumeId: 'res-1',
      targetRole: 'Staff Platform Engineer',
      companyName: 'Stripe',
      tone: 'Executive',
      salutation: 'Dear Stripe Hiring Team,',
      openingParagraph: 'Old opening.',
      bodyParagraphs: ['Kept body 1.', 'Kept body 2.'],
      closingParagraph: 'Kept closing.',
      signOff: 'Sincerely,',
      highlightedKeywords: ['NestJS'],
    });
    mockResumeRepo.findOne.mockResolvedValue(sampleResume);
    mockAiService.generateCoverLetter.mockResolvedValue({
      salutation: 'Dear Stripe Hiring Team,',
      openingParagraph: 'Sharper technical opening hook.',
      bodyParagraphs: ['Should not overwrite'],
      closingParagraph: 'Should not overwrite',
      signOff: 'Best,',
      highlightedKeywords: ['NestJS', 'PostgreSQL'],
      factualVerificationNotes: 'Verified.',
      provider: 'gemini',
    });

    const updated = await service.regenerate('usr-1', 'cl-1', {
      sectionFocus: 'opening',
      tone: 'Technical',
    });

    expect(updated.openingParagraph).toBe('Sharper technical opening hook.');
    expect(updated.bodyParagraphs).toEqual(['Kept body 1.', 'Kept body 2.']);
    expect(updated.closingParagraph).toBe('Kept closing.');
    expect(updated.tone).toBe('Technical');
  });

  it('should throw NotFoundException when generating with a missing resume', async () => {
    mockResumeRepo.findOne.mockResolvedValue(null);

    await expect(
      service.generate('usr-1', {
        resumeId: 'missing-res',
        targetRole: 'Engineer',
        companyName: 'Acme',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});

