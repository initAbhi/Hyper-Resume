import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ApplyApprovedEditsTool } from './apply-edits.tool.js';
import { ToolPermissionTier } from '../tool.interface.js';

describe('ApplyApprovedEditsTool', () => {
  let tool: ApplyApprovedEditsTool;
  let mockResumesService: any;
  let mockToolExecutionRepo: any;
  const mockUserId = '11111111-1111-1111-1111-111111111111';
  const mockResumeId = '22222222-2222-2222-2222-222222222222';
  const mockProposalId = '33333333-3333-3333-3333-333333333333';
  const mockProposalHash = 'a'.repeat(64);

  beforeEach(() => {
    mockResumesService = {
      getResume: vi.fn(),
      updateResume: vi.fn(),
      createVersion: vi.fn(),
    };
    mockToolExecutionRepo = {
      findOne: vi.fn(),
      save: vi.fn().mockImplementation((data) => Promise.resolve(data)),
    };
    tool = new ApplyApprovedEditsTool(mockResumesService, mockToolExecutionRepo);
  });

  it('CRITICAL: has STATE_MUTATING tier, requires mandatory approval, and is NOT model callable', () => {
    expect(tool.name).toBe('apply_approved_edits');
    expect(tool.permissionTier).toBe(ToolPermissionTier.STATE_MUTATING);
    expect(tool.requiresApproval).toBe(true);
    expect(tool.isModelCallable).toBe(false);
    expect(tool.creditCost).toBe(0);
    expect(tool.timeoutMs).toBe(10000);
  });

  it('rejects unexpected userId or invalid proposalHash in arguments', () => {
    expect(
      tool.validate({
        proposalId: mockProposalId,
        proposalHash: mockProposalHash,
        resumeId: mockResumeId,
        userId: 'attacker',
      }).valid,
    ).toBe(false);

    expect(
      tool.validate({
        proposalId: mockProposalId,
        proposalHash: 'too-short',
        resumeId: mockResumeId,
      }).valid,
    ).toBe(false);
  });

  it('applies proposal edits when hash, ownership, and expected version match', async () => {
    mockResumesService.getResume.mockResolvedValueOnce({
      id: mockResumeId,
      version: 3,
      content: { headline: 'Old Headline' },
    });
    mockResumesService.updateResume.mockResolvedValueOnce({
      id: mockResumeId,
      version: 4,
    });
    mockToolExecutionRepo.findOne.mockResolvedValueOnce({
      id: mockProposalId,
      userId: mockUserId,
      proposalHash: mockProposalHash,
      expectedResumeVersion: 3,
      isConsumed: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      outputPayload: {
        sectionDiffs: { headline: { proposed: 'Principal Engineer' } },
        changeSummary: 'Applied AI Tailoring',
      },
    });

    const result = await tool.execute(
      { userId: mockUserId },
      {
        proposalId: mockProposalId,
        proposalHash: mockProposalHash,
        resumeId: mockResumeId,
      },
    );

    expect(result.success).toBe(true);
    expect(mockResumesService.updateResume).toHaveBeenCalledWith(
      mockUserId,
      mockResumeId,
      expect.objectContaining({
        expectedVersion: 3,
      }),
    );
    expect(mockToolExecutionRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        isConsumed: true,
        status: 'APPROVED',
      }),
    );
  });

  it('rejects proposal when expected resume version conflicts with live resume version', async () => {
    mockResumesService.getResume.mockResolvedValueOnce({
      id: mockResumeId,
      version: 5, // Resume was modified concurrently
      content: {},
    });
    mockToolExecutionRepo.findOne.mockResolvedValueOnce({
      id: mockProposalId,
      userId: mockUserId,
      proposalHash: mockProposalHash,
      expectedResumeVersion: 3, // Staged for v3
      isConsumed: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const result = await tool.execute(
      { userId: mockUserId },
      {
        proposalId: mockProposalId,
        proposalHash: mockProposalHash,
        resumeId: mockResumeId,
      },
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('conflict');
  });

  it('rejects proposal when single-use isConsumed is already true', async () => {
    mockResumesService.getResume.mockResolvedValueOnce({
      id: mockResumeId,
      version: 3,
      content: {},
    });
    mockToolExecutionRepo.findOne.mockResolvedValueOnce({
      id: mockProposalId,
      userId: mockUserId,
      proposalHash: mockProposalHash,
      expectedResumeVersion: 3,
      isConsumed: true, // Already consumed
    });

    const result = await tool.execute(
      { userId: mockUserId },
      {
        proposalId: mockProposalId,
        proposalHash: mockProposalHash,
        resumeId: mockResumeId,
      },
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('already been consumed');
  });

  it('rejects proposal when expired', async () => {
    mockResumesService.getResume.mockResolvedValueOnce({
      id: mockResumeId,
      version: 3,
      content: {},
    });
    mockToolExecutionRepo.findOne.mockResolvedValueOnce({
      id: mockProposalId,
      userId: mockUserId,
      proposalHash: mockProposalHash,
      expectedResumeVersion: 3,
      isConsumed: false,
      expiresAt: new Date(Date.now() - 5000), // Expired 5 seconds ago
    });

    const result = await tool.execute(
      { userId: mockUserId },
      {
        proposalId: mockProposalId,
        proposalHash: mockProposalHash,
        resumeId: mockResumeId,
      },
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('expired');
  });
});

