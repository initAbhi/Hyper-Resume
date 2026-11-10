import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { ResumesService } from './resumes.service.js';
import type { ResumeContent } from './entities/resume.types.js';

describe('ResumesService - AI Profile Adaptation (Safeguards 1, 2, 3, 4, 5, 6)', () => {
  let service: ResumesService;
  let mockResumeRepo: any;
  let mockVersionRepo: any;
  let mockAnalysisRepo: any;
  let mockProfileRepo: any;
  let mockAdaptationRepo: any;
  let mockCreditsService: any;
  let mockAiService: any;
  let mockDataSource: any;

  const sampleSourceContent: ResumeContent = {
    contact: { fullName: 'Abhinav Singh', email: 'test@hyperresume.io' },
    headline: 'Senior Backend Engineer',
    summary: 'Experienced distributed systems engineer.',
    skills: [{ name: 'Go', category: 'Languages' }, { name: 'PostgreSQL', category: 'Databases' }],
    experience: [
      {
        company: 'Stripe',
        title: 'Senior Engineer',
        startDate: '2022-01',
        current: true,
        bullets: [
          'Maintained payment webhook processing infrastructure.',
          'Migrated legacy database tables to partitioned PostgreSQL schema.',
        ],
      },
    ],
    education: [{ school: 'IIT Delhi', degree: 'B.Tech', field: 'CS' }],
  };

  const sampleBenchmarkContent: ResumeContent = {
    contact: { fullName: 'Benchmark Leader', email: 'bench@benchmark.com' },
    headline: 'Staff Infrastructure Architect',
    summary: 'Engineered planetary scale systems at Google.',
    skills: [{ name: 'Go' }, { name: 'Kubernetes' }, { name: 'Kafka' }],
    experience: [],
    education: [],
  };

  beforeEach(() => {
    mockResumeRepo = {
      create: vi.fn((data) => ({ id: 'new-res-1', ...data, version: 1 })),
      save: vi.fn((data) => Promise.resolve({ id: data.id || 'new-res-1', ...data })),
      findOne: vi.fn().mockImplementation(({ where }) => {
        if (where.id === 'source-res-1' && where.userId === 'user-1') {
          return Promise.resolve({
            id: 'source-res-1',
            userId: 'user-1',
            name: 'Original Resume',
            templateKey: 'clean-modern',
            locale: 'en-US',
            content: sampleSourceContent,
            version: 1,
          });
        }
        return Promise.resolve(null);
      }),
    };

    mockVersionRepo = {
      create: vi.fn((data) => ({ id: 'ver-1', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'ver-1', ...data })),
    };

    mockAnalysisRepo = {};
    mockProfileRepo = {};

    mockAdaptationRepo = {
      create: vi.fn((data) => ({ id: 'adapt-1', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: data.id || 'adapt-1', ...data })),
      findOne: vi.fn().mockResolvedValue(null),
    };

    mockCreditsService = {
      getBalance: vi.fn().mockResolvedValue(10), // User has 10 credits
      deductCredits: vi.fn().mockResolvedValue({ id: 'cred-1' }),
    };

    mockAiService = {
      adaptResume: vi.fn().mockResolvedValue({
        payload: {
          headline: 'Staff Infrastructure Architect',
          summary: 'High-impact distributed systems engineer specializing in high-throughput cloud architectures.',
          experienceBullets: [
            {
              company: 'Stripe',
              title: 'Senior Engineer',
              bullets: [
                'Architected payment webhook infrastructure processing high-volume transactions.',
                'Executed PostgreSQL schema migration with zero customer downtime.',
              ],
            },
          ],
          recommendedBenchmarkSkills: ['Kubernetes', 'Kafka'],
        },
        telemetry: {
          promptTokens: 1200,
          completionTokens: 400,
          totalTokens: 1600,
          costUsd: 0.00136,
          modelId: 'gemini-3.5-flash-lite',
          pricingVersion: '2026-Q1',
        },
      }),
      adaptSection: vi.fn().mockResolvedValue({
        sectionKey: 'summary',
        adaptedContent: 'Adapted summary text.',
        telemetry: {
          promptTokens: 300,
          completionTokens: 100,
          totalTokens: 400,
          costUsd: 0.00034,
          modelId: 'gemini-3.5-flash-lite',
          pricingVersion: '2026-Q1',
        },
      }),
    };

    mockDataSource = {
      transaction: vi.fn(async (cb) => {
        return cb({
          getRepository: () => mockAdaptationRepo,
        });
      }),
    };

    service = new ResumesService(
      mockResumeRepo,
      mockVersionRepo,
      mockAnalysisRepo,
      mockProfileRepo,
      mockAdaptationRepo,
      mockCreditsService,
      mockAiService,
      mockDataSource,
    );
  });

  describe('adaptWithProfile', () => {
    it('safeguard 3: verifies balance, persists PENDING state first, calls AI outside transaction, then deducts credits atomically', async () => {
      const result = await service.adaptWithProfile('user-1', {
        sourceResumeId: 'source-res-1',
        sampleId: 'sample-alexander-vance',
        idempotencyKey: '00000000-0000-4000-8000-000000000001',
        targetRole: 'Staff Distributed Systems Engineer',
        sampleBenchmarkData: sampleBenchmarkContent,
      });

      // Credit balance checked first
      expect(mockCreditsService.getBalance).toHaveBeenCalledWith('user-1');
      // AI called outside transaction
      expect(mockAiService.adaptResume).toHaveBeenCalledTimes(1);
      // Atomic transaction called to deduct 3 credits and save SUCCEEDED
      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
      expect(mockCreditsService.deductCredits).toHaveBeenCalledWith(
        'user-1',
        3,
        'ai_adapt',
        'adapt:adapt-1',
        expect.any(String),
        expect.any(Object),
        expect.anything(),
      );

      expect(result.status).toBe('SUCCEEDED');
      expect(result.creditsCharged).toBe(3);
      expect(result.proposedContent).toBeDefined();
    });

    it('safeguard 5: returns existing SUCCEEDED adaptation when duplicate idempotencyKey is sent (0 extra charge, 0 AI calls)', async () => {
      mockAdaptationRepo.findOne.mockResolvedValueOnce({
        id: 'existing-adapt-1',
        userId: 'user-1',
        idempotencyKey: '00000000-0000-4000-8000-000000000001',
        status: 'SUCCEEDED',
        creditsCharged: 3,
        proposedContent: sampleSourceContent,
      });

      const result = await service.adaptWithProfile('user-1', {
        sourceResumeId: 'source-res-1',
        sampleId: 'sample-alexander-vance',
        idempotencyKey: '00000000-0000-4000-8000-000000000001',
      });

      expect(result.id).toBe('existing-adapt-1');
      // No extra AI inference or deduction triggered!
      expect(mockAiService.adaptResume).not.toHaveBeenCalled();
      expect(mockCreditsService.deductCredits).not.toHaveBeenCalled();
    });

    it('safeguard 5: throws ConflictException if request with same idempotencyKey is currently PENDING', async () => {
      mockAdaptationRepo.findOne.mockResolvedValueOnce({
        id: 'in-flight-adapt-1',
        userId: 'user-1',
        idempotencyKey: '00000000-0000-4000-8000-000000000002',
        status: 'PENDING',
      });

      await expect(
        service.adaptWithProfile('user-1', {
          sourceResumeId: 'source-res-1',
          sampleId: 'sample-alexander-vance',
          idempotencyKey: '00000000-0000-4000-8000-000000000002',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('blocks generation and throws ForbiddenException if user has insufficient credits', async () => {
      mockCreditsService.getBalance.mockResolvedValueOnce(2); // Has 2, requires 3

      await expect(
        service.adaptWithProfile('user-1', {
          sourceResumeId: 'source-res-1',
          sampleId: 'sample-alexander-vance',
          idempotencyKey: '00000000-0000-4000-8000-000000000003',
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(mockAiService.adaptResume).not.toHaveBeenCalled();
    });
  });

  describe('adaptSection (Safeguard 4)', () => {
    it('adapts a single section with 1 credit deduction and idempotency support', async () => {
      const result = await service.adaptSection('user-1', {
        sourceResumeId: 'source-res-1',
        sectionKey: 'summary',
        sampleId: 'sample-1',
        idempotencyKey: '00000000-0000-4000-8000-000000000004',
      });

      expect(mockAiService.adaptSection).toHaveBeenCalledWith('summary', expect.any(String), null, undefined);
      expect(mockCreditsService.deductCredits).toHaveBeenCalledWith(
        'user-1',
        1,
        'ai_adapt',
        'adapt-section:adapt-1',
        expect.any(String),
        expect.any(Object),
        expect.anything(),
      );
      expect(result.status).toBe('SUCCEEDED');
      expect(result.creditsCharged).toBe(1);
    });
  });

  describe('applyAdaptation (Safeguard 6)', () => {
    it('creates a new independent draft resume without mutating source resume', async () => {
      mockAdaptationRepo.findOne.mockResolvedValueOnce({
        id: 'adapt-1',
        userId: 'user-1',
        sourceResumeId: 'source-res-1',
        status: 'SUCCEEDED',
        proposedContent: {
          ...sampleSourceContent,
          headline: 'Adapted Headline',
          summary: 'Adapted Summary',
          experience: [
            {
              ...sampleSourceContent.experience[0],
              bullets: ['Accepted Bullet 1', 'Rejected Bullet 2'],
            },
          ],
        },
      });

      const newResume = await service.applyAdaptation('user-1', 'adapt-1', {
        title: 'My New Tailored Draft',
        summaryDecision: 'accept',
        bulletDecisions: {
          '0': {
            '0': 'accept',
            '1': 'reject',
          },
        },
        acceptedBenchmarkSkills: ['Kafka'],
      });

      expect(newResume.name).toBe('My New Tailored Draft');
      // First bullet accepted
      expect(newResume.content.experience[0].bullets[0]).toBe('Accepted Bullet 1');
      // Second bullet rejected -> retained original
      expect(newResume.content.experience[0].bullets[1]).toBe(sampleSourceContent.experience[0].bullets[1]);
      // Skills merged with explicitly accepted benchmark skill
      expect(newResume.content.skills.some((s) => s.name === 'Kafka')).toBe(true);
      // Source resume untouched
      expect(mockResumeRepo.save).toHaveBeenCalledTimes(1);
    });
  });
});

