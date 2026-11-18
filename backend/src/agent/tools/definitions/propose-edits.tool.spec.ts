import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  canonicalJsonStringify,
  computeProposalHash,
  ProposeEditsTool,
} from './propose-edits.tool.js';
import { ToolPermissionTier } from '../tool.interface.js';

describe('ProposeEditsTool', () => {
  let tool: ProposeEditsTool;
  let mockResumesService: any;
  let mockAiService: any;
  let mockToolExecutionRepo: any;
  const mockUserId = '11111111-1111-1111-1111-111111111111';
  const mockResumeId = '22222222-2222-2222-2222-222222222222';
  const mockTaskId = '33333333-3333-3333-3333-333333333333';

  beforeEach(() => {
    mockResumesService = {
      getResume: vi.fn(),
    };
    mockAiService = {
      adaptResume: vi.fn(),
    };
    mockToolExecutionRepo = {
      create: vi.fn((data) => ({ ...data, id: 'exec-1' })),
      save: vi.fn().mockImplementation((data) => Promise.resolve(data)),
    };
    tool = new ProposeEditsTool(mockResumesService, mockAiService, mockToolExecutionRepo);
  });

  it('has correct permission tier and metadata', () => {
    expect(tool.name).toBe('propose_resume_edits');
    expect(tool.permissionTier).toBe(ToolPermissionTier.AI_ANALYSIS);
    expect(tool.requiresApproval).toBe(false);
    expect(tool.creditCost).toBe(2);
    expect(tool.timeoutMs).toBe(25000);
  });

  it('rejects unexpected userId in arguments', () => {
    expect(tool.validate({ resumeId: mockResumeId, userId: 'attacker' }).valid).toBe(false);
  });

  it('computes deterministic SHA-256 hash regardless of object key order', () => {
    const payloadA = { b: 2, a: 1, c: { y: 'bar', x: 'foo' } };
    const payloadB = { a: 1, c: { x: 'foo', y: 'bar' }, b: 2 };

    const strA = canonicalJsonStringify(payloadA);
    const strB = canonicalJsonStringify(payloadB);
    expect(strA).toBe(strB);

    const hashA = computeProposalHash(payloadA);
    const hashB = computeProposalHash(payloadB);
    expect(hashA).toBe(hashB);
    expect(hashA).toHaveLength(64);
  });

  it('changes hash when proposal payload changes', () => {
    const payloadA = { version: 1, text: 'Managed Kafka pipelines' };
    const payloadB = { version: 1, text: 'Engineered real-time Kafka streaming pipelines' };

    const hashA = computeProposalHash(payloadA);
    const hashB = computeProposalHash(payloadB);
    expect(hashA).not.toBe(hashB);
  });

  it('generates proposal with evidence provenance and 15-minute expiry without modifying active resume', async () => {
    mockResumesService.getResume.mockResolvedValueOnce({
      id: mockResumeId,
      version: 4,
      content: {
        headline: 'Senior Engineer',
        summary: 'Experienced developer',
        experience: [
          {
            company: 'Stripe',
            title: 'Staff Engineer',
            bullets: ['Managed Kafka pipelines'],
          },
        ],
      },
    });

    const result = await tool.execute(
      { userId: mockUserId, taskId: mockTaskId },
      { resumeId: mockResumeId, targetRole: 'Principal Systems Architect' },
    );

    expect(result.success).toBe(true);
    const data = result.data as any;
    expect(data.proposalHash).toBeDefined();
    expect(data.expectedResumeVersion).toBe(4);
    expect(data.sectionDiffs.experience[0].bulletDiffs[0].evidenceProvenance).toBeDefined();

    // Verify 15-minute expiry
    const expiry = new Date(data.expiresAt).getTime();
    const now = Date.now();
    expect(expiry - now).toBeGreaterThan(14 * 60 * 1000);
    expect(expiry - now).toBeLessThanOrEqual(15 * 60 * 1000 + 1000);

    // Verify persisted in tool execution repo
    expect(mockToolExecutionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: mockTaskId,
        userId: mockUserId,
        status: 'PENDING_APPROVAL',
        expectedResumeVersion: 4,
      }),
    );
  });
});

