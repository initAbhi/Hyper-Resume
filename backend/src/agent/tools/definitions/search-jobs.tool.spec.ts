import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SearchJobsTool } from './search-jobs.tool.js';
import { ToolPermissionTier } from '../tool.interface.js';

describe('SearchJobsTool', () => {
  let tool: SearchJobsTool;
  let mockJobDiscoveryService: any;
  const mockUserId = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    mockJobDiscoveryService = {
      searchJobs: vi.fn(),
    };
    tool = new SearchJobsTool(mockJobDiscoveryService);
  });

  it('has correct permission tier and metadata', () => {
    expect(tool.name).toBe('search_discovered_jobs');
    expect(tool.permissionTier).toBe(ToolPermissionTier.READ_ONLY);
    expect(tool.requiresApproval).toBe(false);
    expect(tool.creditCost).toBe(0);
  });

  it('validates boardToken slug format strictly to prevent SSRF', () => {
    expect(tool.validate({ boardToken: 'stripe' }).valid).toBe(true);
    expect(tool.validate({ boardToken: 'linear-app' }).valid).toBe(true);

    // SSRF / URL / injection attacks must fail validation
    expect(tool.validate({ boardToken: 'https://attacker.com' }).valid).toBe(false);
    expect(tool.validate({ boardToken: 'token;DROP TABLE' }).valid).toBe(false);
    expect(tool.validate({ boardToken: '../path/traversal' }).valid).toBe(false);
  });

  it('rejects unexpected userId in arguments', () => {
    const val = tool.validate({ query: 'engineer', userId: 'attacker' });
    expect(val.valid).toBe(false);
  });

  it('executes job discovery with context.userId and correct parameters', async () => {
    mockJobDiscoveryService.searchJobs.mockResolvedValueOnce({
      total: 5,
      jobs: [{ id: 'job-1', title: 'Staff Engineer', company: 'Stripe' }],
    });

    const result = await tool.execute(
      { userId: mockUserId },
      { query: 'Staff Engineer', workplace: 'Remote', source: 'ashby' },
    );

    expect(result.success).toBe(true);
    expect(mockJobDiscoveryService.searchJobs).toHaveBeenCalledWith(
      mockUserId,
      expect.objectContaining({
        q: 'Staff Engineer',
        workplace: 'remote',
        source: 'ashby',
      }),
    );
  });
});

