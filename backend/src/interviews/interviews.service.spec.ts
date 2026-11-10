import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadGatewayException, BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InterviewsService, INTERVIEW_CREDIT_COSTS } from './interviews.service.js';
import type { InterviewSession } from './entities/interview-session.entity.js';

describe('InterviewsService', () => {
  let service: InterviewsService;
  let mockDataSource: any;
  let mockSessionRepo: any;
  let mockQuestionRepo: any;
  let mockTurnRepo: any;
  let mockResumeRepo: any;
  let mockJdRepo: any;
  let mockPaymentRepo: any;
  let mockCreditsService: any;
  let mockAiProvider: any;

  const mockUser = { id: 'usr-123', email: 'test@hyperresume.ai' };
  const mockResume = {
    id: 'res-123',
    userId: 'usr-123',
    content: {
      headline: 'Senior Full Stack Engineer',
      skills: [{ name: 'React' }, { name: 'NestJS' }, { name: 'PostgreSQL' }],
      experience: [
        {
          title: 'Senior Engineer',
          company: 'Acme Corp',
          bullets: ['Engineered high-throughput caching layer reducing latency by 45%'],
        },
      ],
      projects: [],
    },
  };

  beforeEach(() => {
    mockDataSource = {
      transaction: vi.fn(async (cb) => {
        const mockManager = {
          findOne: vi.fn(),
          create: vi.fn((_entity, data) => ({ ...data, id: 'sess-generated-id' })),
          save: vi.fn(async (_entityOrData, data) => data || _entityOrData),
        };
        return cb(mockManager);
      }),
    };

    mockSessionRepo = {
      findOne: vi.fn(),
      findAndCount: vi.fn(),
      save: vi.fn(async (s) => s),
    };

    mockQuestionRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
      save: vi.fn(async (q) => q),
    };

    mockTurnRepo = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn((data) => ({ ...data, id: 'turn-123', updatedAt: new Date() })),
      save: vi.fn(async (t) => t),
    };

    mockResumeRepo = {
      findOne: vi.fn(async ({ where }) => {
        if (where.id === 'res-123' && where.userId === 'usr-123') return mockResume;
        return null;
      }),
    };

    mockJdRepo = {
      findOne: vi.fn(async ({ where }) => {
        if (where.id === 'jd-123' && where.userId === 'usr-123') return { id: 'jd-123', userId: 'usr-123', title: 'Tech Lead' };
        return null;
      }),
    };

    mockPaymentRepo = {
      exists: vi.fn(),
    };

    mockCreditsService = {
      getBalance: vi.fn(async () => 20),
      deductCredits: vi.fn(async () => ({})),
      refundCredits: vi.fn(async () => ({})),
    };

    mockAiProvider = {
      generateQuestions: vi.fn(async () => ({
        questions: [
          { orderIndex: 0, category: 'role_alignment', questionText: 'Q1?', contextHint: 'Hint 1' },
          { orderIndex: 1, category: 'resume_claim', questionText: 'Q2?', contextHint: 'Hint 2' },
          { orderIndex: 2, category: 'technical_depth', questionText: 'Q3?', contextHint: 'Hint 3' },
        ],
        telemetry: { inputTokens: 1000, outputTokens: 400, thinkingTokens: 0, estimatedCostUsd: 0.00026 },
      })),
      evaluateAnswer: vi.fn(async () => ({
        evaluation: {
          turnScore: 85,
          metricsDetected: true,
          technicalAccuracyNotes: 'Solid',
          strengths: ['Great STAR structure'],
          improvementTip: 'Add counter-metric',
          idealAnswerDraft: 'Model answer text',
        },
        telemetry: { inputTokens: 800, outputTokens: 300, thinkingTokens: 0, estimatedCostUsd: 0.0002 },
      })),
      evaluateFollowUp: vi.fn(async () => ({
        score: 80,
        notes: 'Good follow-up response',
        telemetry: { inputTokens: 400, outputTokens: 100, thinkingTokens: 0, estimatedCostUsd: 0.00008 },
      })),
      synthesizeFinalReport: vi.fn(async () => ({
        report: {
          overallScore: 85,
          scoreBreakdown: { starScore: 85, technicalScore: 85, relevanceScore: 90, clarityScore: 85 },
          summaryFeedback: { strengths: ['Clear'], improvements: ['More metrics'], actionItems: ['Practice'] },
        },
        telemetry: { inputTokens: 1000, outputTokens: 300, thinkingTokens: 0, estimatedCostUsd: 0.00022 },
      })),
    };

    service = new InterviewsService(
      mockDataSource,
      mockSessionRepo,
      mockQuestionRepo,
      mockTurnRepo,
      mockResumeRepo,
      mockJdRepo,
      mockPaymentRepo,
      mockCreditsService,
      mockAiProvider,
    );
  });

  describe('startSession', () => {
    it('should throw NotFoundException if resume does not belong to user', async () => {
      await expect(
        service.startSession(mockUser.id, {
          resumeId: 'wrong-res-id',
          sessionMode: 'quick_practice',
          targetRole: 'Frontend Developer',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if free user tries to start Full Mock', async () => {
      mockPaymentRepo.exists.mockResolvedValue(false); // Free user

      await expect(
        service.startSession(mockUser.id, {
          resumeId: 'res-123',
          sessionMode: 'full_mock',
          targetRole: 'Backend Developer',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if free user already completed trial', async () => {
      mockPaymentRepo.exists.mockResolvedValue(false);
      mockSessionRepo.findOne.mockImplementation(async ({ where }: any) => {
        if (where.isFreeTrial) return { id: 'past-sess-1', isFreeTrial: true, status: 'completed' };
        return null;
      });

      await expect(
        service.startSession(mockUser.id, {
          resumeId: 'res-123',
          sessionMode: 'quick_practice',
          targetRole: 'Full Stack Developer',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should successfully start Full Mock for paid customer and deduct 5 credits', async () => {
      mockPaymentRepo.exists.mockResolvedValue(true); // Paid customer

      const result = await service.startSession(mockUser.id, {
        resumeId: 'res-123',
        sessionMode: 'full_mock',
        targetRole: 'Full Stack Developer',
      });

      expect(result).toBeDefined();
      expect(mockCreditsService.deductCredits).toHaveBeenCalledWith(
        mockUser.id,
        5,
        'mock_interview',
        expect.stringContaining('interview-start-'),
        expect.any(String),
        expect.any(Object),
        expect.anything(),
      );
      expect(mockAiProvider.generateQuestions).toHaveBeenCalled();
    });

    it('should refund credits atomically if AI question generation fails', async () => {
      mockPaymentRepo.exists.mockResolvedValue(true);
      mockAiProvider.generateQuestions.mockRejectedValueOnce(new Error('AI Gateway Timeout'));

      await expect(
        service.startSession(mockUser.id, {
          resumeId: 'res-123',
          sessionMode: 'full_mock',
          targetRole: 'Full Stack Developer',
        }),
      ).rejects.toThrow(BadGatewayException);

      expect(mockCreditsService.refundCredits).toHaveBeenCalledWith(
        mockUser.id,
        5,
        expect.stringContaining('refund-session-'),
        expect.any(String),
        expect.anything(),
      );
    });
  });

  describe('submitAnswer & stale recovery', () => {
    it('should throw ConflictException if evaluation is in progress within 30 seconds', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        id: 'sess-123',
        userId: mockUser.id,
        status: 'in_progress',
        expiresAt: new Date(Date.now() + 3600000),
      });
      mockQuestionRepo.findOne.mockResolvedValue({ id: 'q-1', sessionId: 'sess-123' });
      mockTurnRepo.findOne.mockResolvedValue({
        id: 'turn-123',
        status: 'evaluating',
        updatedAt: new Date(), // Just now
      });

      await expect(
        service.submitAnswer(mockUser.id, 'sess-123', {
          questionId: 'q-1',
          candidateAnswer: 'I architected a Redis cache layer for the database.',
          timeTakenSeconds: 30,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should recover and evaluate if turn was evaluating for > 30 seconds (stale recovery)', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        id: 'sess-123',
        userId: mockUser.id,
        status: 'in_progress',
        expiresAt: new Date(Date.now() + 3600000),
        totalInputTokens: 0,
        totalOutputTokens: 0,
        thinkingTokens: 0,
        estimatedCostUsd: 0,
        currentQuestionIndex: 0,
        totalQuestions: 3,
      });
      mockQuestionRepo.findOne.mockResolvedValue({ id: 'q-1', sessionId: 'sess-123', category: 'resume_claim' });
      mockTurnRepo.findOne.mockResolvedValue({
        id: 'turn-123',
        status: 'evaluating',
        updatedAt: new Date(Date.now() - 40000), // 40 seconds ago (stale!)
      });

      const res = await service.submitAnswer(mockUser.id, 'sess-123', {
        questionId: 'q-1',
        candidateAnswer: 'I architected a Redis cache layer for the database.',
        timeTakenSeconds: 30,
      });

      expect(res.status).toBe('evaluated');
      expect(mockAiProvider.evaluateAnswer).toHaveBeenCalled();
    });
  });

  describe('getReport & server-side entitlement redaction', () => {
    it('should redact Questions 2 and 3 model answers for free trial users', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        id: 'sess-123',
        userId: mockUser.id,
        status: 'completed',
        overallScore: 82,
      });
      mockTurnRepo.find.mockResolvedValue([
        { id: 't-1', evaluation: { idealAnswerDraft: 'Model Answer 1' } },
        { id: 't-2', evaluation: { idealAnswerDraft: 'Model Answer 2' } },
        { id: 't-3', evaluation: { idealAnswerDraft: 'Model Answer 3' } },
      ]);
      mockQuestionRepo.find.mockResolvedValue([
        { id: 'q-1', orderIndex: 0 },
        { id: 'q-2', orderIndex: 1 },
        { id: 'q-3', orderIndex: 2 },
      ]);
      mockPaymentRepo.exists.mockResolvedValue(false); // Free user

      const report = await service.getReport(mockUser.id, 'sess-123');

      expect(report.isPaidUser).toBe(false);
      // Question 1 model answer preserved
      expect(report.turns[0]?.evaluation?.idealAnswerDraft).toBe('Model Answer 1');
      // Questions 2 & 3 redacted
      expect(report.turns[1]?.evaluation?.idealAnswerDraft).toBeUndefined();
      expect((report.turns[1]?.evaluation as any).isLockedForPro).toBe(true);
      expect(report.turns[2]?.evaluation?.idealAnswerDraft).toBeUndefined();
      expect((report.turns[2]?.evaluation as any).isLockedForPro).toBe(true);
    });

    it('should preserve all model answers for paid credit-pack customers', async () => {
      mockSessionRepo.findOne.mockResolvedValue({
        id: 'sess-123',
        userId: mockUser.id,
        status: 'completed',
        overallScore: 90,
      });
      mockTurnRepo.find.mockResolvedValue([
        { id: 't-1', evaluation: { idealAnswerDraft: 'Model Answer 1' } },
        { id: 't-2', evaluation: { idealAnswerDraft: 'Model Answer 2' } },
        { id: 't-3', evaluation: { idealAnswerDraft: 'Model Answer 3' } },
      ]);
      mockQuestionRepo.find.mockResolvedValue([
        { id: 'q-1', orderIndex: 0 },
        { id: 'q-2', orderIndex: 1 },
        { id: 'q-3', orderIndex: 2 },
      ]);
      mockPaymentRepo.exists.mockResolvedValue(true); // Paid customer

      const report = await service.getReport(mockUser.id, 'sess-123');

      expect(report.isPaidUser).toBe(true);
      expect(report.turns[0]?.evaluation?.idealAnswerDraft).toBe('Model Answer 1');
      expect(report.turns[1]?.evaluation?.idealAnswerDraft).toBe('Model Answer 2');
      expect(report.turns[2]?.evaluation?.idealAnswerDraft).toBe('Model Answer 3');
    });
  });
});
