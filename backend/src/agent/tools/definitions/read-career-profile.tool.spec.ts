import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ReadCareerProfileTool } from './read-career-profile.tool.js';
import { ToolPermissionTier } from '../tool.interface.js';

describe('ReadCareerProfileTool', () => {
  let tool: ReadCareerProfileTool;
  let mockProfilesService: any;
  const mockUserId = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    mockProfilesService = {
      getProfileByUserId: vi.fn(),
    };
    tool = new ReadCareerProfileTool(mockProfilesService);
  });

  it('has correct permission tier and metadata', () => {
    expect(tool.name).toBe('read_career_profile');
    expect(tool.permissionTier).toBe(ToolPermissionTier.READ_ONLY);
    expect(tool.requiresApproval).toBe(false);
    expect(tool.creditCost).toBe(0);
  });

  it('rejects unexpected userId in arguments', () => {
    expect(tool.validate({ userId: 'hacker' }).valid).toBe(false);
  });

  it('retrieves profile and distinguishes verified skills', async () => {
    mockProfilesService.getProfileByUserId.mockResolvedValueOnce({
      id: 'profile-1',
      headline: 'Principal Engineer',
      summary: 'Experienced distributed systems builder',
      location: 'San Francisco, CA',
      skills: [{ name: 'TypeScript', category: 'Languages', level: 'expert' }],
      experience: [{}],
      education: [{}],
      projects: [{}],
    });

    const result = await tool.execute({ userId: mockUserId }, {});

    expect(result.success).toBe(true);
    expect(mockProfilesService.getProfileByUserId).toHaveBeenCalledWith(mockUserId);
    const data = result.data as any;
    expect(data.headline).toBe('Principal Engineer');
    expect(data.verifiedSkills[0].name).toBe('TypeScript');
    expect(data.verifiedSkills[0].verified).toBe(true);
  });
});

