import { Injectable } from '@nestjs/common';
import { AiService } from '../../../ai/ai.service.js';
import {
  AgentTool,
  checkNoForbiddenUserId,
  ToolExecutionContext,
  ToolPermissionTier,
  ToolResult,
  ToolValidationResult,
} from '../tool.interface.js';

export interface GenerateBulletsArgs {
  roleTitle: string;
  rawBullet: string;
  companyName?: string;
  metricHint?: string;
  framework?: 'XYZ' | 'STAR' | 'concise';
}

@Injectable()
export class GenerateBulletsTool implements AgentTool<GenerateBulletsArgs, unknown> {
  readonly name = 'generate_bullet_variations';
  readonly description =
    'Generates alternative impact-oriented bullet points adhering to XYZ or STAR frameworks without fabricating metrics.';
  readonly permissionTier = ToolPermissionTier.AI_ANALYSIS;
  readonly requiresApproval = false;
  readonly creditCost = 1;
  readonly timeoutMs = 15000;

  readonly inputSchema = {
    type: 'object',
    properties: {
      roleTitle: {
        type: 'string',
        description: 'Job title or role (e.g. Senior Backend Engineer)',
      },
      rawBullet: {
        type: 'string',
        description: 'Draft or source bullet text to improve',
      },
      companyName: {
        type: 'string',
        description: 'Company or organization name (optional)',
      },
      metricHint: {
        type: 'string',
        description: 'Candidate-provided metric or scale hint (optional)',
      },
      framework: {
        type: 'string',
        enum: ['XYZ', 'STAR', 'concise'],
        default: 'XYZ',
      },
    },
    required: ['roleTitle', 'rawBullet'],
  };

  constructor(private readonly aiService: AiService) {}

  validate(args: unknown): ToolValidationResult<GenerateBulletsArgs> {
    const forbidden = checkNoForbiddenUserId(args);
    if (forbidden) return { valid: false, errors: [forbidden] };

    if (!args || typeof args !== 'object') {
      return { valid: false, errors: ['Missing arguments for generate_bullet_variations'] };
    }

    const raw = args as Record<string, unknown>;
    const errors: string[] = [];

    if (!raw.roleTitle || typeof raw.roleTitle !== 'string' || !raw.roleTitle.trim()) {
      errors.push('roleTitle is required and must be a non-empty string');
    }

    if (!raw.rawBullet || typeof raw.rawBullet !== 'string' || !raw.rawBullet.trim()) {
      errors.push('rawBullet is required and must be a non-empty string');
    }

    if (raw.framework !== undefined) {
      const allowed = ['XYZ', 'STAR', 'concise'];
      if (!allowed.includes(raw.framework as string)) {
        errors.push(`framework must be one of: ${allowed.join(', ')}`);
      }
    }

    if (errors.length > 0) return { valid: false, errors };

    return {
      valid: true,
      data: {
        roleTitle: (raw.roleTitle as string).trim(),
        rawBullet: (raw.rawBullet as string).trim(),
        companyName: typeof raw.companyName === 'string' ? raw.companyName.trim() : undefined,
        metricHint: typeof raw.metricHint === 'string' ? raw.metricHint.trim() : undefined,
        framework: (raw.framework as any) || 'XYZ',
      },
    };
  }

  async execute(
    _context: ToolExecutionContext,
    args: GenerateBulletsArgs,
  ): Promise<ToolResult<unknown>> {
    try {
      const contextualRole = args.companyName
        ? `${args.roleTitle} at ${args.companyName}`
        : args.roleTitle;
      const contextualHint = [
        args.metricHint,
        args.framework && args.framework !== 'XYZ' ? `Preferred framework: ${args.framework}` : undefined,
      ]
        .filter(Boolean)
        .join(' | ');

      const result = await this.aiService.rewriteBullet(
        args.rawBullet,
        contextualRole,
        contextualHint || undefined,
      );

      return {
        success: true,
        data: {
          originalBullet: args.rawBullet,
          rewrittenBullet: result.rewrittenBullet,
          variants: result.variants || [],
          framework: args.framework || 'XYZ',
          factualVerificationNotes: result.factualVerificationNotes,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Bullet variation generation failed',
      };
    }
  }
}

