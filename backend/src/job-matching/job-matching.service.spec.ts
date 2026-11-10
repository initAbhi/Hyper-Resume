import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { JobMatchingService } from './job-matching.service.js';

describe('JobMatchingService', () => {
  let service: JobMatchingService;
  let mockJobMatchRepo: any;
  let mockResumeRepo: any;
  let mockJobRepo: any;
  let mockCreditLedgerRepo: any;
  let mockAiService: any;

  beforeEach(() => {
    mockJobMatchRepo = {
      create: vi.fn((data) => ({ id: 'match-1', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'match-1', ...data })),
      findOne: vi.fn(),
      find: vi.fn(),
    };

    mockResumeRepo = {
      findOne: vi.fn(),
    };

    mockJobRepo = {
      findOne: vi.fn(),
    };

    mockCreditLedgerRepo = {
      create: vi.fn((data) => ({ id: 'deduct-1', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'deduct-1', ...data })),
      createQueryBuilder: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getRawOne: vi.fn().mockResolvedValue({ sum: '5' }),
      })),
    };

      mockAiService = {
      parseJobDescription: vi.fn().mockResolvedValue([
        { id: 'req-1', type: 'required_skill', importance: 'critical', text: 'Redis caching', keywords: ['Redis'] },
        { id: 'req-2', type: 'required_skill', importance: 'high', text: 'Rust programming', keywords: ['Rust'] },
      ]),
      parseResumeText: vi.fn().mockResolvedValue({
        skills: [{ name: 'Redis', category: 'Database' }],
        experience: [{ company: 'Acme', title: 'Backend Engineer', startDate: '2022', current: true, bullets: ['Led Redis cluster migration'] }],
      }),
      matchRequirements: vi.fn().mockResolvedValue([
        {
          requirementId: 'req-1',
          status: 'supported',
          confidence: 95,
          evidenceQuotes: ['Led Redis cluster migration cutting latency by 34%'],
          explanation: 'Demonstrated in production experience',
          suggestedAction: 'Keep prioritized',
        },
        {
          requirementId: 'req-2',
          status: 'not_evidenced',
          confidence: 90,
          evidenceQuotes: [],
          explanation: 'No mention of Rust found in resume',
          suggestedAction: 'Do not invent this skill',
        },
      ]),
      tailorForJob: vi.fn().mockResolvedValue({
        suggestedHeadline: 'Backend Engineer | Redis & Distributed Systems',
        suggestedSummary: 'Experienced Backend Engineer with verified Redis production expertise.',
        bulletImprovements: [],
        factualVerificationNotes: 'Grounded in verified candidate evidence.',
      }),
    };

    service = new JobMatchingService(
      mockJobMatchRepo,
      mockResumeRepo,
      mockJobRepo,
      mockCreditLedgerRepo,
      mockAiService,
    );
  });

  describe('createJobMatch', () => {
    it('should calculate 5-component scores, create match record, and deduct 1 credit', async () => {
      mockResumeRepo.findOne.mockResolvedValue({
        id: 'res-1',
        userId: 'user-1',
        content: {
          contact: { email: 'test@example.com' },
          headline: 'Senior Backend Engineer',
          experience: [{ bullets: ['Led Redis migration'] }],
        },
      });

      mockJobRepo.findOne.mockResolvedValue({
        id: 'job-1',
        userId: 'user-1',
        title: 'Backend Engineer',
        parsedRequirements: [
          { id: 'req-1', type: 'required_skill', importance: 'critical', text: 'Redis caching', keywords: ['Redis'] },
          { id: 'req-2', type: 'required_skill', importance: 'high', text: 'Rust programming', keywords: ['Rust'] },
        ],
      });

      const match = await service.createJobMatch('user-1', {
        resumeId: 'res-1',
        jobDescriptionId: 'job-1',
      });

      expect(match.overallScore).toBeDefined();
      expect(match.scoreComponents.requiredSkillsScore).toBe(50); // 1 of 2 supported
      expect(match.scoreComponents.formattingScore).toBe(95);
      expect(match.requirementsAnalysis).toHaveLength(2);
      expect((match.requirementsAnalysis[1] as any).keywords).toEqual(['Rust']);
      expect(match.jobDescription?.title).toBe('Backend Engineer');

      // Verify credit deduction
      expect(mockCreditLedgerRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          amount: -1,
          transactionType: 'resume_analysis',
        }),
      );
    });

    it('should throw NotFoundException if resume belongs to another user (Ownership check)', async () => {
      // Resume not found for user-2
      mockResumeRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createJobMatch('user-2', {
          resumeId: 'res-user-1',
          jobDescriptionId: 'job-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if job description belongs to another user', async () => {
      mockResumeRepo.findOne.mockResolvedValue({ id: 'res-1', userId: 'user-1' });
      // Job not found for user-1
      mockJobRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createJobMatch('user-1', {
          resumeId: 'res-1',
          jobDescriptionId: 'job-user-2',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listJobMatches & generateTailoringSuggestions', () => {
    it('should list enriched job matches for a resume and generate tailoring suggestions', async () => {
      mockJobMatchRepo.find.mockResolvedValue([
        {
          id: 'match-1',
          userId: 'user-1',
          resumeId: 'res-1',
          jobDescriptionId: 'job-1',
          overallScore: 72,
          requirementsAnalysis: [{ requirementId: 'req-1', status: 'not_evidenced' }],
          jobDescription: {
            id: 'job-1',
            title: 'Backend Engineer',
            companyName: 'Stripe',
            parsedRequirements: [
              { id: 'req-1', text: 'Kubernetes orchestration', importance: 'critical', keywords: ['Kubernetes'] },
            ],
          },
        },
      ]);

      const matches = await service.listJobMatches('user-1', 'res-1');
      expect(matches).toHaveLength(1);
      expect((matches[0].requirementsAnalysis[0] as any).keywords).toEqual(['Kubernetes']);

      mockJobMatchRepo.findOne.mockResolvedValue({
        id: 'match-1',
        userId: 'user-1',
        resumeId: 'res-1',
        jobDescriptionId: 'job-1',
        resume: { id: 'res-1', content: { headline: 'Dev', summary: 'Sum', skills: [], experience: [] } },
        jobDescription: {
          id: 'job-1',
          title: 'Backend Engineer',
          companyName: 'Stripe',
          parsedRequirements: [],
        },
        requirementsAnalysis: [],
      });

      const tailor = await service.generateTailoringSuggestions('user-1', 'match-1');
      expect(tailor.suggestedHeadline).toContain('Backend Engineer');
      expect(tailor.jobTitle).toBe('Backend Engineer');
    });

    it('should create an AI-tailored resume from match while scrubbing fabricated bullet metrics', async () => {
      mockResumeRepo.create = vi.fn((data) => ({ id: 'res-tailored-1', ...data }));
      mockResumeRepo.save = vi.fn((data) => Promise.resolve(data));

      mockJobMatchRepo.findOne.mockResolvedValue({
        id: 'match-1',
        userId: 'user-1',
        resumeId: 'res-1',
        jobDescriptionId: 'job-1',
        resume: {
          id: 'res-1',
          userId: 'user-1',
          name: 'Master Profile',
          templateKey: 'clean-modern',
          locale: 'en-US',
          content: {
            contact: { fullName: 'Alex', email: 'alex@example.com' },
            headline: 'Software Engineer',
            summary: 'Backend engineer specializing in distributed APIs.',
            skills: [{ name: 'Go' }, { name: 'PostgreSQL' }],
            experience: [
              {
                company: 'CloudScale',
                title: 'Backend Engineer',
                startDate: '2022',
                current: true,
                bullets: ['Built distributed Go workers handling 12,000 events/sec.'],
              },
            ],
            education: [],
          },
        },
        jobDescription: {
          id: 'job-1',
          title: 'Senior Go Platform Engineer',
          companyName: 'Stripe',
          parsedRequirements: [],
        },
        requirementsAnalysis: [],
      });

      const created = await service.createTailoredResumeFromMatch('user-1', 'match-1', {
        applyHeadline: 'Senior Go Platform Engineer | Distributed Systems',
        applySummary: 'Senior platform engineer delivering resilient Go microservices and PostgreSQL pipelines.',
        bulletUpdates: [
          {
            company: 'CloudScale',
            originalBullet: 'Built distributed Go workers handling 12,000 events/sec.',
            tailoredBullet: 'Engineered resilient Go workers handling 12,000 events/sec and saved $9M.',
          },
        ],
      });

      expect(created.resume.name).toBe('Senior Go Platform Engineer (Stripe)');
      expect(created.resume.isMaster).toBe(false);
      expect(created.resume.content.headline).toBe('Senior Go Platform Engineer | Distributed Systems');
      expect(created.resume.content.experience[0].bullets[0]).not.toContain('$9M');
      expect(created.resume.content.experience[0].bullets[0]).toContain('12,000 events/sec');
      expect(created.resume.content.meta?.tailoredFromMatchId).toBe('match-1');
      expect(created.appliedChanges.bulletsApplied).toBe(1);
      expect(created.appliedChanges.warnings.length).toBeGreaterThan(0);
    });

    it('should evaluate public plain-text job matches via real requirement pipeline without deducting credits', async () => {
      const publicMatch = await service.analyzePublicJobMatch({
        resumeText:
          'Senior Backend Engineer with production Redis caching and distributed microservices experience.',
        jobDescriptionText:
          'Looking for a Backend Engineer skilled in Redis caching and Rust systems programming.',
        targetRole: 'Backend Engineer',
      });

      expect(publicMatch.overallScore).toBeGreaterThan(0);
      expect(publicMatch.scoreComponents.requiredSkillsScore).toBe(50);
      expect(publicMatch.requirementsAnalysis).toHaveLength(2);
      expect(publicMatch.recommendations.length).toBeGreaterThan(0);
      expect(mockCreditLedgerRepo.create).not.toHaveBeenCalled();
      expect(mockJobMatchRepo.save).not.toHaveBeenCalled();
    });
  });
});
