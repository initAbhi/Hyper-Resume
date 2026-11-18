import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ReadResumeVersionsTool } from './read-resume-versions.tool.js';
import { ToolPermissionTier } from '../tool.interface.js';

describe('ReadResumeVersionsTool', () => {
  let tool: ReadResumeVersionsTool;
  let mockResumesService: any;
  const mockUserId = '11111111-1111-1111-1111-111111111111';
  const mockResumeId = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    mockResumesService = {
      listVersions: vi.fn(),
    };
    tool = new ReadResumeVersionsTool(mockResumesService);
  });

  it('has correct permission tier and metadata', () => {
    expect(tool.name).toBe('read_resume_versions');
    expect(tool.permissionTier).toBe(ToolPermissionTier.READ_ONLY);
    expect(tool.requiresApproval).toBe(false);
    expect(tool.creditCost).toBe(0);
  });

  it('rejects invalid UUID or forbidden userId in arguments', () => {
    expect(tool.validate({ resumeId: 'bad' }).valid).toBe(false);
    expect(tool.validate({ userId: 'hacker' }).valid).toBe(false);
  });

  it('invokes ResumesService.listVersions with context.userId', async () => {
    mockResumesService.listVersions.mockResolvedValueOnce([
      { id: 'v1', versionNumber: 1, changeSummary: 'Initial', createdAt: new Date() },
      { id: 'v2', versionNumber: 2, changeSummary: 'Updated', createdAt: new Date() },
    ]);

    const result = await tool.execute(
      { userId: mockUserId },
      { resumeId: mockResumeId },
    );

    expect(result.success).toBe(true);
    expect(mockResumesService.listVersions).toHaveBeenCalledWith(mockUserId, mockResumeId);
    expect((result.data as any[]).length).toBe(2);
  });
});

