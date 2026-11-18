import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GenerateBulletsTool } from './generate-bullets.tool.js';
import { ToolPermissionTier } from '../tool.interface.js';

describe('GenerateBulletsTool', () => {
  let tool: GenerateBulletsTool;
  let mockAiService: any;
  const mockUserId = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    mockAiService = {
      rewriteBullet: vi.fn(),
    };
    tool = new GenerateBulletsTool(mockAiService);
  });

  it('has correct permission tier and metadata', () => {
    expect(tool.name).toBe('generate_bullet_variations');
    expect(tool.permissionTier).toBe(ToolPermissionTier.AI_ANALYSIS);
    expect(tool.requiresApproval).toBe(false);
    expect(tool.creditCost).toBe(1);
    expect(tool.timeoutMs).toBe(15000);
  });

  it('rejects unexpected userId in arguments', () => {
    expect(
      tool.validate({ roleTitle: 'Dev', rawBullet: 'Built API', userId: 'bad' }).valid,
    ).toBe(false);
  });

  it('rejects missing roleTitle or rawBullet', () => {
    expect(tool.validate({ roleTitle: '' }).valid).toBe(false);
    expect(tool.validate({ rawBullet: '' }).valid).toBe(false);
  });

  it('calls AiService.rewriteBullet with grounding input', async () => {
    mockAiService.rewriteBullet.mockResolvedValueOnce({
      rewrittenBullet: 'Engineered high-throughput payment pipeline processing 10k RPS',
      variants: [
        {
          style: 'XYZ',
          bullet: 'Engineered high-throughput payment pipeline processing 10k RPS',
        },
      ],
      factualVerificationNotes: 'Grounded in candidate hint',
    });

    const result = await tool.execute(
      { userId: mockUserId },
      {
        roleTitle: 'Staff Backend Engineer',
        rawBullet: 'Worked on payment pipeline',
        metricHint: '10k RPS',
        framework: 'XYZ',
      },
    );

    expect(result.success).toBe(true);
    expect(mockAiService.rewriteBullet).toHaveBeenCalledWith(
      'Worked on payment pipeline',
      'Staff Backend Engineer',
      '10k RPS',
    );
    const data = result.data as any;
    expect(data.variants).toHaveLength(1);
  });
});

