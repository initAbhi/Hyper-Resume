import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SaveJobTool } from './save-job.tool.js';
import { ToolPermissionTier } from '../tool.interface.js';

describe('SaveJobTool', () => {
  let tool: SaveJobTool;
  let mockJobDiscoveryService: any;
  const mockUserId = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    mockJobDiscoveryService = {
      saveDiscoveredJobToTracker: vi.fn(),
    };
    tool = new SaveJobTool(mockJobDiscoveryService);
  });

  it('has correct permission tier and metadata: SAFE_MUTATING with NO approval', () => {
    expect(tool.name).toBe('save_job_to_tracker');
    expect(tool.permissionTier).toBe(ToolPermissionTier.SAFE_MUTATING);
    expect(tool.requiresApproval).toBe(false);
    expect(tool.creditCost).toBe(0);
    expect(tool.timeoutMs).toBe(8000);
  });

  it('rejects unexpected userId in arguments', () => {
    expect(
      tool.validate({ title: 'Engineer', company: 'Stripe', userId: 'attacker' }).valid,
    ).toBe(false);
  });

  it('calls JobDiscoveryService.saveDiscoveredJobToTracker with context.userId', async () => {
    mockJobDiscoveryService.saveDiscoveredJobToTracker.mockResolvedValueOnce({
      application: {
        id: 'app-1',
        status: 'saved',
        company: 'Stripe',
        role: 'Staff Infrastructure Engineer',
      },
      alreadyTracked: false,
    });

    const result = await tool.execute(
      { userId: mockUserId },
      {
        title: 'Staff Infrastructure Engineer',
        company: 'Stripe',
        location: 'San Francisco, CA',
        workplace: 'Remote',
      },
    );

    expect(result.success).toBe(true);
    expect(mockJobDiscoveryService.saveDiscoveredJobToTracker).toHaveBeenCalledWith(
      mockUserId,
      expect.objectContaining({
        title: 'Staff Infrastructure Engineer',
        company: 'Stripe',
      }),
    );
  });
});

