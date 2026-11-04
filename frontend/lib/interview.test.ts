import { describe, expect, it, vi, beforeEach } from 'bun:test';
import { ApiClient } from './api-client';

describe('ApiClient Interview Studio Methods', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should call startInterview with correct payload and optional idempotency-key header', async () => {
    const mockSession = {
      id: 'sess-123',
      userId: 'usr-1',
      sessionMode: 'quick_practice',
      targetRole: 'Full Stack Engineer',
      status: 'in_progress',
      currentQuestionIndex: 0,
      totalQuestions: 3,
      creditsCharged: 2,
      isFreeTrial: false,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-request-id': 'req-start-int' }),
      json: async () => ({ data: mockSession }),
    } as unknown as Response) as unknown as typeof fetch;

    const client = new ApiClient('http://localhost:3001/api/v1');
    const result = await client.startInterview({
      resumeId: 'res-1',
      sessionMode: 'quick_practice',
      targetRole: 'Full Stack Engineer',
      difficulty: 'mid',
      idempotencyKey: 'idemp-key-abc',
    });

    expect(result.id).toBe('sess-123');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/interviews/start',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'idempotency-key': 'idemp-key-abc',
        }),
      }),
    );
  });

  it('should call submitInterviewAnswer and return evaluated turn', async () => {
    const mockTurn = {
      id: 'turn-123',
      sessionId: 'sess-123',
      questionId: 'q-1',
      candidateAnswer: 'I architected a distributed cache using Redis and NestJS.',
      turnScore: 88,
      status: 'evaluated',
      evaluation: {
        score: 88,
        strengths: ['Clear architecture pattern', 'Good STAR result'],
        improvementTip: 'Mention latency benchmarks before and after.',
        idealAnswerDraft: 'Staff-level model answer draft...',
      },
      followUpQuestion: 'How did you handle cache invalidation during race conditions?',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-request-id': 'req-answer' }),
      json: async () => ({ data: mockTurn }),
    } as unknown as Response) as unknown as typeof fetch;

    const client = new ApiClient('http://localhost:3001/api/v1');
    const result = await client.submitInterviewAnswer('sess-123', {
      questionId: 'q-1',
      candidateAnswer: 'I architected a distributed cache using Redis and NestJS.',
      timeTakenSeconds: 45,
    });

    expect(result.id).toBe('turn-123');
    expect(result.turnScore).toBe(88);
    expect(result.followUpQuestion).toContain('cache invalidation');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/interviews/sess-123/answer',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          questionId: 'q-1',
          candidateAnswer: 'I architected a distributed cache using Redis and NestJS.',
          timeTakenSeconds: 45,
        }),
      }),
    );
  });

  it('should call submitInterviewFollowUp and receive updated turn with follow-up score', async () => {
    const mockUpdatedTurn = {
      id: 'turn-123',
      sessionId: 'sess-123',
      followUpAnswer: 'We used distributed locking with Redis Redlock and versioned cache tags.',
      followUpScore: 92,
      status: 'evaluated',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-request-id': 'req-followup' }),
      json: async () => ({ data: mockUpdatedTurn }),
    } as unknown as Response) as unknown as typeof fetch;

    const client = new ApiClient('http://localhost:3001/api/v1');
    const result = await client.submitInterviewFollowUp('sess-123', {
      questionId: 'q-1',
      followUpAnswer: 'We used distributed locking with Redis Redlock and versioned cache tags.',
    });

    expect(result.followUpScore).toBe(92);
    expect(result.followUpAnswer).toContain('distributed locking');
  });

  it('should call finishInterviewSession and return final scorecard session', async () => {
    const mockFinishedSession = {
      id: 'sess-123',
      status: 'completed',
      overallScore: 86,
      scoreBreakdown: {
        starScore: 88,
        technicalScore: 84,
      },
      completedAt: '2026-11-04T12:00:00.000Z',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-request-id': 'req-finish' }),
      json: async () => ({ data: mockFinishedSession }),
    } as unknown as Response) as unknown as typeof fetch;

    const client = new ApiClient('http://localhost:3001/api/v1');
    const result = await client.finishInterviewSession('sess-123');

    expect(result.status).toBe('completed');
    expect(result.overallScore).toBe(86);
    expect(result.scoreBreakdown?.starScore).toBe(88);
  });

  it('should call getInterviewReport and verify report structure and gating attributes', async () => {
    const mockReport = {
      session: {
        id: 'sess-123',
        status: 'completed',
        overallScore: 82,
        targetRole: 'Staff Frontend Engineer',
        subScores: { technicalDepth: 85, clarityCommunication: 80, structuredThinking: 82, relevanceRole: 81 },
      },
      questions: [
        { id: 'q-1', orderIndex: 0, questionText: 'Explain React Concurrent Mode', category: 'architecture' },
        { id: 'q-2', orderIndex: 1, questionText: 'How do you prevent INP degradation?', category: 'frontend_perf' },
      ],
      turns: [
        {
          id: 't-1',
          questionId: 'q-1',
          turnScore: 85,
          evaluation: {
            score: 85,
            strengths: ['Good understanding of transitions'],
            improvementTip: 'Mention useDeferredValue',
            idealAnswerDraft: 'Concurrent rendering allows React to interrupt...',
          },
        },
      ],
      isPaidUser: false,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-request-id': 'req-report' }),
      json: async () => ({ data: mockReport }),
    } as unknown as Response) as unknown as typeof fetch;

    const client = new ApiClient('http://localhost:3001/api/v1');
    const report = await client.getInterviewReport('sess-123');

    expect(report.session.overallScore).toBe(82);
    expect(report.questions.length).toBe(2);
    expect(report.isPaidUser).toBe(false);
  });
});
