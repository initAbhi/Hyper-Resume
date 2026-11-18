import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CreateResumeTool } from './create-resume.tool.js';
import { ToolPermissionTier } from '../tool.interface.js';

describe('CreateResumeTool', () => {
  let tool: CreateResumeTool;
  let mockResumesService: any;
  const mockUserId = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    mockResumesService = {
      createResume: vi.fn(),
    };
    tool = new CreateResumeTool(mockResumesService);
  });

  it('has correct permission tier and metadata: SAFE_MUTATING with NO approval', () => {
    expect(tool.name).toBe('create_resume');
    expect(tool.permissionTier).toBe(ToolPermissionTier.SAFE_MUTATING);
    expect(tool.requiresApproval).toBe(false);
    expect(tool.creditCost).toBe(0);
    expect(tool.timeoutMs).toBe(8000);
  });

  it('rejects unexpected userId in arguments', () => {
    expect(tool.validate({ name: 'Resume Draft', userId: 'attacker' }).valid).toBe(false);
  });

  it('calls ResumesService.createResume with context.userId', async () => {
    mockResumesService.createResume.mockResolvedValueOnce({
      id: 'res-new-1',
      name: 'Senior Infrastructure Resume',
      version: 1,
      templateKey: 'clean-modern',
    });

    const result = await tool.execute(
      { userId: mockUserId },
      { name: 'Senior Infrastructure Resume', templateKey: 'clean-modern' },
    );

    expect(result.success).toBe(true);
    expect(mockResumesService.createResume).toHaveBeenCalledWith(
      mockUserId,
      expect.objectContaining({
        name: 'Senior Infrastructure Resume',
        templateKey: 'clean-modern',
      }),
    );
  });
});

