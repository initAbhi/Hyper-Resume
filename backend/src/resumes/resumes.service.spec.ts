import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConflictException } from '@nestjs/common';
import { ResumesService } from './resumes.service.js';

describe('ResumesService', () => {
  let service: ResumesService;
  let mockResumeRepo: any;
  let mockVersionRepo: any;
  let mockAnalysisRepo: any;
  let mockProfileRepo: any;

  beforeEach(() => {
    mockResumeRepo = {
      create: vi.fn((data) => ({ id: 'res-1', ...data, version: 1 })),
      save: vi.fn((data) => Promise.resolve({ id: 'res-1', ...data })),
      findOne: vi.fn(),
      findAndCount: vi.fn(),
    };

    mockVersionRepo = {
      create: vi.fn((data) => ({ id: 'ver-1', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'ver-1', ...data })),
      find: vi.fn(),
      findOne: vi.fn(),
    };

    mockAnalysisRepo = {
      create: vi.fn((data) => ({ id: 'ana-1', ...data })),
      save: vi.fn((data) => Promise.resolve({ id: 'ana-1', ...data })),
    };

    mockProfileRepo = {
      findOne: vi.fn().mockResolvedValue({
        headline: 'Staff Engineer',
        location: 'Bengaluru',
        skills: [{ name: 'Go', category: 'Backend' }],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
      }),
    };

    service = new ResumesService(
      mockResumeRepo,
      mockVersionRepo,
      mockAnalysisRepo,
      mockProfileRepo,
    );
  });

  describe('createResume', () => {
    it('should seed resume from master profile and initialize version 1', async () => {
      const result = await service.createResume('user-1', {
        name: 'Target: Stripe Staff Infrastructure',
      });

      expect(result.id).toBe('res-1');
      expect(result.name).toBe('Target: Stripe Staff Infrastructure');
      expect(mockVersionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          resumeId: 'res-1',
          versionNumber: 1,
          changeSummary: 'Initial version created',
        }),
      );
    });
  });

  describe('updateResume', () => {
    it('should throw ConflictException when expectedVersion conflicts with database', async () => {
      mockResumeRepo.findOne.mockResolvedValue({
        id: 'res-1',
        userId: 'user-1',
        version: 3,
        isArchived: false,
      });

      await expect(
        service.updateResume('user-1', 'res-1', {
          name: 'Conflicting Name',
          expectedVersion: 2, // Outdated version submitted
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully update and preserve changes when version matches', async () => {
      const activeResume = {
        id: 'res-1',
        userId: 'user-1',
        name: 'Old Name',
        version: 2,
        isArchived: false,
      };
      mockResumeRepo.findOne.mockResolvedValue(activeResume);

      const result = await service.updateResume('user-1', 'res-1', {
        name: 'Updated Name',
        expectedVersion: 2,
      });

      expect(result.name).toBe('Updated Name');
    });
  });

  describe('runAnalysis', () => {
    it('should evaluate action verbs, quantifiable metrics, and calculate ATS audit score', async () => {
      mockResumeRepo.findOne.mockResolvedValue({
        id: 'res-1',
        userId: 'user-1',
        isArchived: false,
        content: {
          contact: { fullName: 'Abhinav Singh', email: 'test@hyperresume.io' },
          headline: 'Senior Backend Engineer',
          summary: 'Experienced distributed systems engineer.',
          skills: [{ name: 'Go' }, { name: 'PostgreSQL' }],
          experience: [
            {
              company: 'Acme Corp',
              title: 'Senior Engineer',
              startDate: '2022',
              current: true,
              bullets: [
                'Architected distributed microservices reducing p99 latency by 34% across 8M transactions.',
                'Refactored legacy queries and migrated tables.',
              ],
            },
          ],
          education: [{ school: 'MIT', degree: 'BS', field: 'CS' }],
        },
      });

      const analysis = await service.runAnalysis('user-1', 'res-1', {
        analysisType: 'ats_check',
      });

      expect(analysis.score).toBeGreaterThanOrEqual(70);
      expect(analysis.findings.actionVerbsCount).toBe(2);
      expect(analysis.findings.metricsCount).toBe(1);
      expect(analysis.recommendations).toBeDefined();
    });
  });
});
