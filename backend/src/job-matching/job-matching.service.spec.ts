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
          { id: 'req-1', type: 'required_skill' },
          { id: 'req-2', type: 'required_skill' },
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
});
