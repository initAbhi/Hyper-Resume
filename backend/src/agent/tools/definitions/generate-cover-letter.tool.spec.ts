import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GenerateCoverLetterTool } from './generate-cover-letter.tool.js';
import { ToolPermissionTier } from '../tool.interface.js';

describe('GenerateCoverLetterTool', () => {
  let tool: GenerateCoverLetterTool;
  let mockCoverLettersService: any;
  const mockUserId = '11111111-1111-1111-1111-111111111111';
  const mockResumeId = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    mockCoverLettersService = {
      generate: vi.fn(),
    };
    tool = new GenerateCoverLetterTool(mockCoverLettersService);
  });

  it('has correct permission tier and metadata', () => {
    expect(tool.name).toBe('generate_cover_letter');
    expect(tool.permissionTier).toBe(ToolPermissionTier.AI_ANALYSIS);
    expect(tool.requiresApproval).toBe(false);
    expect(tool.creditCost).toBe(2);
    expect(tool.timeoutMs).toBe(25000);
  });

  it('rejects unexpected userId in arguments', () => {
    expect(
      tool.validate({
        targetRole: 'Architect',
        companyName: 'Linear',
        userId: 'attacker',
      }).valid,
    ).toBe(false);
  });

  it('calls CoverLettersService.generate with context.userId and correct parameters', async () => {
    mockCoverLettersService.generate.mockResolvedValueOnce({
      id: 'cl-1',
      title: 'Cover Letter for Linear',
      targetRole: 'Staff Architect',
      companyName: 'Linear',
      openingParagraph: 'I am excited to apply...',
      bodyParagraphs: ['In my previous role...'],
      closingParagraph: 'Thank you for your consideration.',
    });

    const result = await tool.execute(
      { userId: mockUserId },
      {
        resumeId: mockResumeId,
        targetRole: 'Staff Architect',
        companyName: 'Linear',
        tone: 'Executive',
      },
    );

    expect(result.success).toBe(true);
    expect(mockCoverLettersService.generate).toHaveBeenCalledWith(
      mockUserId,
      expect.objectContaining({
        resumeId: mockResumeId,
        targetRole: 'Staff Architect',
        companyName: 'Linear',
        tone: 'Executive',
      }),
    );
  });
});

