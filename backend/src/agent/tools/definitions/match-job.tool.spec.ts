import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MatchJobTool } from './match-job.tool.js';
import { ToolPermissionTier } from '../tool.interface.js';

describe('MatchJobTool', () => {
  let tool: MatchJobTool;
  let mockJobMatchingService: any;
  let mockJobsService: any;
  const mockUserId = '11111111-1111-1111-1111-111111111111';
  const mockResumeId = '22222222-2222-2222-2222-222222222222';
  const mockJdId = '33333333-3333-3333-3333-333333333333';

  beforeEach(() => {
    mockJobMatchingService = {
      createJobMatch: vi.fn(),
    };
    mockJobsService = {
      createJobDescription: vi.fn(),
    };
    tool = new MatchJobTool(mockJobMatchingService, mockJobsService);
  });

  it('has correct permission tier and metadata', () => {
    expect(tool.name).toBe('match_job_description');
    expect(tool.permissionTier).toBe(ToolPermissionTier.AI_ANALYSIS);
    expect(tool.requiresApproval).toBe(false);
    expect(tool.creditCost).toBe(1);
    expect(tool.timeoutMs).toBe(20000);
  });

  it('rejects unexpected userId in arguments', () => {
    expect(tool.validate({ resumeId: mockResumeId, userId: 'attacker' }).valid).toBe(false);
  });

  it('executes job matching with existing jobDescriptionId', async () => {
    mockJobMatchingService.createJobMatch.mockResolvedValueOnce({
      id: 'match-1',
      overallScore: 85,
      scoreComponents: { requiredSkillsScore: 90 },
      requirementsAnalysis: [
        { text: 'TypeScript', status: 'supported' },
        { text: 'Kubernetes', status: 'not_evidenced', type: 'skill' },
      ],
      recommendations: ['Highlight Kubernetes projects'],
    });

    const result = await tool.execute(
      { userId: mockUserId },
      { resumeId: mockResumeId, jobDescriptionId: mockJdId },
    );

    expect(result.success).toBe(true);
    expect(mockJobMatchingService.createJobMatch).toHaveBeenCalledWith(mockUserId, {
      resumeId: mockResumeId,
      jobDescriptionId: mockJdId,
    });
    const data = result.data as any;
    expect(data.matchedKeywords).toContain('TypeScript');
    expect(data.missingHardSkills).toContain('Kubernetes');
  });

  it('automatically persists JD text when jobDescriptionText is provided', async () => {
    mockJobsService.createJobDescription.mockResolvedValueOnce({ id: 'new-jd-id' });
    mockJobMatchingService.createJobMatch.mockResolvedValueOnce({
      id: 'match-2',
      overallScore: 92,
      requirementsAnalysis: [],
    });

    const result = await tool.execute(
      { userId: mockUserId },
      {
        resumeId: mockResumeId,
        jobDescriptionText: 'Looking for a Senior Rust Engineer...',
        jobTitle: 'Senior Rust Engineer',
        companyName: 'Cloudflare',
      },
    );

    expect(result.success).toBe(true);
    expect(mockJobsService.createJobDescription).toHaveBeenCalledWith(
      mockUserId,
      expect.objectContaining({
        title: 'Senior Rust Engineer',
        companyName: 'Cloudflare',
      }),
    );
  });
});

