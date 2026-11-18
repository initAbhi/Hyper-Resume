import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RestoreVersionTool } from './restore-version.tool.js';
import { ToolPermissionTier } from '../tool.interface.js';

describe('RestoreVersionTool', () => {
  let tool: RestoreVersionTool;
  let mockResumesService: any;
  const mockUserId = '11111111-1111-1111-1111-111111111111';
  const mockResumeId = '22222222-2222-2222-2222-222222222222';
  const mockVersionId = '33333333-3333-3333-3333-333333333333';

  beforeEach(() => {
    mockResumesService = {
      restoreVersion: vi.fn(),
    };
    tool = new RestoreVersionTool(mockResumesService);
  });

  it('has STATE_MUTATING tier and requires mandatory human approval', () => {
    expect(tool.name).toBe('restore_resume_version');
    expect(tool.permissionTier).toBe(ToolPermissionTier.STATE_MUTATING);
    expect(tool.requiresApproval).toBe(true);
    expect(tool.creditCost).toBe(0);
    expect(tool.timeoutMs).toBe(8000);
  });

  it('rejects unexpected userId or invalid UUIDs in arguments', () => {
    expect(
      tool.validate({
        resumeId: mockResumeId,
        versionId: mockVersionId,
        userId: 'attacker',
      }).valid,
    ).toBe(false);

    expect(
      tool.validate({
        resumeId: 'not-a-uuid',
        versionId: mockVersionId,
      }).valid,
    ).toBe(false);
  });

  it('calls ResumesService.restoreVersion with context.userId', async () => {
    mockResumesService.restoreVersion.mockResolvedValueOnce({
      id: mockResumeId,
      version: 5,
    });

    const result = await tool.execute(
      { userId: mockUserId },
      { resumeId: mockResumeId, versionId: mockVersionId },
    );

    expect(result.success).toBe(true);
    expect(mockResumesService.restoreVersion).toHaveBeenCalledWith(
      mockUserId,
      mockResumeId,
      mockVersionId,
    );
  });
});

