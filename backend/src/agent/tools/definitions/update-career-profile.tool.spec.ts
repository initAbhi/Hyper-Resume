import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UpdateCareerProfileTool } from './update-career-profile.tool.js';
import { ToolPermissionTier } from '../tool.interface.js';

describe('UpdateCareerProfileTool', () => {
  let tool: UpdateCareerProfileTool;
  let mockProfilesService: any;
  const mockUserId = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    mockProfilesService = {
      getProfileByUserId: vi.fn(),
      updateProfileByUserId: vi.fn(),
    };
    tool = new UpdateCareerProfileTool(mockProfilesService);
  });

  it('has STATE_MUTATING tier and requires mandatory human approval', () => {
    expect(tool.name).toBe('update_career_profile');
    expect(tool.permissionTier).toBe(ToolPermissionTier.STATE_MUTATING);
    expect(tool.requiresApproval).toBe(true);
    expect(tool.creditCost).toBe(0);
    expect(tool.timeoutMs).toBe(8000);
  });

  it('rejects unexpected userId in arguments', () => {
    expect(tool.validate({ headline: 'Lead Architect', userId: 'attacker' }).valid).toBe(false);
  });

  it('CRITICAL: only adds candidate-confirmed verified skills, preserving existing skills', async () => {
    mockProfilesService.getProfileByUserId.mockResolvedValueOnce({
      id: 'prof-1',
      skills: [{ name: 'React', category: 'General', level: 'advanced' }],
    });
    mockProfilesService.updateProfileByUserId.mockResolvedValueOnce({
      id: 'prof-1',
    });

    const result = await tool.execute(
      { userId: mockUserId },
      {
        verifiedSkillsToAdd: ['NestJS', 'PostgreSQL'],
        headline: 'Senior Full Stack Engineer',
      },
    );

    expect(result.success).toBe(true);
    expect(mockProfilesService.updateProfileByUserId).toHaveBeenCalledWith(
      mockUserId,
      expect.objectContaining({
        headline: 'Senior Full Stack Engineer',
        skills: expect.arrayContaining([
          expect.objectContaining({ name: 'React' }),
          expect.objectContaining({ name: 'NestJS' }),
          expect.objectContaining({ name: 'PostgreSQL' }),
        ]),
      }),
    );
  });
});

