import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RunAtsAuditTool } from './run-ats-audit.tool.js';
import { ToolPermissionTier } from '../tool.interface.js';

describe('RunAtsAuditTool', () => {
  let tool: RunAtsAuditTool;
  let mockResumesService: any;
  const mockUserId = '11111111-1111-1111-1111-111111111111';
  const mockResumeId = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    mockResumesService = {
      getResume: vi.fn(),
    };
    tool = new RunAtsAuditTool(mockResumesService);
  });

  it('has correct permission tier and metadata', () => {
    expect(tool.name).toBe('run_ats_audit');
    expect(tool.permissionTier).toBe(ToolPermissionTier.AI_ANALYSIS);
    expect(tool.requiresApproval).toBe(false);
    expect(tool.creditCost).toBe(0);
  });

  it('rejects invalid UUID or forbidden userId in arguments', () => {
    expect(tool.validate({ resumeId: 'invalid' }).valid).toBe(false);
    expect(tool.validate({ userId: 'hacker' }).valid).toBe(false);
  });

  it('runs ATS audit engine deterministically on resume content', async () => {
    mockResumesService.getResume.mockResolvedValueOnce({
      id: mockResumeId,
      version: 1,
      content: {
        contact: { fullName: 'Jane Doe', email: 'jane@example.com' },
        headline: 'Staff Software Engineer',
        summary: 'Architect with 10 years experience',
        skills: [{ name: 'Rust' }, { name: 'PostgreSQL' }],
        experience: [
          {
            company: 'Tech Corp',
            title: 'Lead Architect',
            bullets: ['Led cross-functional team optimizing latency by 45%'],
          },
        ],
      },
    });

    const result = await tool.execute(
      { userId: mockUserId },
      { resumeId: mockResumeId },
    );

    expect(result.success).toBe(true);
    expect(mockResumesService.getResume).toHaveBeenCalledWith(mockUserId, mockResumeId);
    const data = result.data as any;
    expect(data.overallScore).toBeGreaterThanOrEqual(0);
    expect(data.findings).toBeDefined();
  });
});

