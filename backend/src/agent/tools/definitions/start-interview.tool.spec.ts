import { describe, expect, it, vi, beforeEach } from 'vitest';
import { StartInterviewTool } from './start-interview.tool.js';
import { ToolPermissionTier } from '../tool.interface.js';

describe('StartInterviewTool', () => {
  let tool: StartInterviewTool;
  let mockInterviewsService: any;
  let mockJobsService: any;
  const mockUserId = '11111111-1111-1111-1111-111111111111';
  const mockResumeId = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    mockInterviewsService = {
      startSession: vi.fn(),
    };
    mockJobsService = {
      createJobDescription: vi.fn(),
    };
    tool = new StartInterviewTool(mockInterviewsService, mockJobsService);
  });

  it('has correct permission tier and metadata', () => {
    expect(tool.name).toBe('start_interview_session');
    expect(tool.permissionTier).toBe(ToolPermissionTier.AI_ANALYSIS);
    expect(tool.requiresApproval).toBe(false);
    expect(tool.creditCost).toBe(2);
    expect(tool.timeoutMs).toBe(20000);
  });

  it('rejects unexpected userId in arguments', () => {
    expect(tool.validate({ resumeId: mockResumeId, userId: 'attacker' }).valid).toBe(false);
  });

  it('calls InterviewsService.startSession with context.userId and correct mode', async () => {
    mockInterviewsService.startSession.mockResolvedValueOnce({
      id: 'session-1',
      sessionMode: 'quick_practice',
      targetRole: 'Senior Backend Engineer',
      totalQuestions: 5,
      status: 'in_progress',
      activeQuestion: { id: 'q-1', orderIndex: 0, questionText: 'Tell me about yourself' },
    });

    const result = await tool.execute(
      { userId: mockUserId },
      { resumeId: mockResumeId, sessionMode: 'quick_practice', targetRole: 'Senior Backend Engineer' },
    );

    expect(result.success).toBe(true);
    expect(mockInterviewsService.startSession).toHaveBeenCalledWith(
      mockUserId,
      expect.objectContaining({
        resumeId: mockResumeId,
        sessionMode: 'quick_practice',
        targetRole: 'Senior Backend Engineer',
      }),
    );
  });
});

