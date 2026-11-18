import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ReadResumeTool } from './read-resume.tool.js';
import { ToolPermissionTier } from '../tool.interface.js';

describe('ReadResumeTool', () => {
  let tool: ReadResumeTool;
  let mockResumesService: any;
  const mockUserId = '11111111-1111-1111-1111-111111111111';
  const mockResumeId = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    mockResumesService = {
      getResume: vi.fn(),
    };
    tool = new ReadResumeTool(mockResumesService);
  });

  it('has correct permission tier and metadata', () => {
    expect(tool.name).toBe('read_resume');
    expect(tool.permissionTier).toBe(ToolPermissionTier.READ_ONLY);
    expect(tool.requiresApproval).toBe(false);
    expect(tool.creditCost).toBe(0);
    expect(tool.timeoutMs).toBe(5000);
  });

  it('validates valid input with resumeId', () => {
    const val = tool.validate({ resumeId: mockResumeId });
    expect(val.valid).toBe(true);
    expect(val.data?.resumeId).toBe(mockResumeId);
  });

  it('rejects invalid UUID for resumeId', () => {
    const val = tool.validate({ resumeId: 'not-a-uuid' });
    expect(val.valid).toBe(false);
    expect(val.errors?.[0]).toContain('valid UUID');
  });

  it('CRITICAL: rejects arguments containing unexpected userId', () => {
    const val = tool.validate({
      resumeId: mockResumeId,
      userId: 'attacker-injected-user-id',
    });
    expect(val.valid).toBe(false);
    expect(val.errors?.[0]).toContain('userId cannot be provided');
  });

  it('executes using authenticated context.userId and target resumeId', async () => {
    mockResumesService.getResume.mockResolvedValueOnce({
      id: mockResumeId,
      name: 'Test Resume',
      version: 2,
      templateKey: 'clean-modern',
      content: { headline: 'Software Engineer' },
    });

    const result = await tool.execute(
      { userId: mockUserId },
      { resumeId: mockResumeId },
    );

    expect(result.success).toBe(true);
    expect(mockResumesService.getResume).toHaveBeenCalledWith(mockUserId, mockResumeId);
    expect(result.data).toEqual({ headline: 'Software Engineer' });
  });

  it('falls back to active resume context when resumeId is omitted', async () => {
    mockResumesService.getResume.mockResolvedValueOnce({
      id: mockResumeId,
      name: 'Active Resume',
      version: 1,
      content: {},
    });

    const result = await tool.execute(
      { userId: mockUserId, activeResumeId: mockResumeId },
      {},
    );

    expect(result.success).toBe(true);
    expect(mockResumesService.getResume).toHaveBeenCalledWith(mockUserId, mockResumeId);
  });

  it('handles cross-tenant access rejection from domain service', async () => {
    mockResumesService.getResume.mockRejectedValueOnce(
      new Error('Resume not found or access denied'),
    );

    const result = await tool.execute(
      { userId: mockUserId },
      { resumeId: mockResumeId },
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('access denied');
  });
});

