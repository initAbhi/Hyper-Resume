import { Injectable } from '@nestjs/common';
import { CoverLettersService } from '../../../cover-letters/cover-letters.service.js';
import {
  AgentTool,
  checkNoForbiddenUserId,
  ToolExecutionContext,
  ToolPermissionTier,
  ToolResult,
  ToolValidationResult,
  UUID_REGEX,
} from '../tool.interface.js';

export interface GenerateCoverLetterArgs {
  resumeId?: string;
  targetRole: string;
  companyName: string;
  tone?: 'Executive' | 'Enthusiastic' | 'Technical' | 'Concise';
  jobDescriptionText?: string;
}

@Injectable()
export class GenerateCoverLetterTool implements AgentTool<GenerateCoverLetterArgs, unknown> {
  readonly name = 'generate_cover_letter';
  readonly description =
    'Generates a personalized cover letter draft connecting candidate achievements with target job priorities. Stages the letter non-destructively.';
  readonly permissionTier = ToolPermissionTier.AI_ANALYSIS;
  readonly requiresApproval = false;
  readonly creditCost = 2;
  readonly timeoutMs = 25000;

  readonly inputSchema = {
    type: 'object',
    properties: {
      resumeId: {
        type: 'string',
        description: 'UUID of the source resume. If omitted, uses active resume context.',
      },
      targetRole: {
        type: 'string',
        description: 'Target job role title (e.g. Senior Backend Engineer)',
      },
      companyName: {
        type: 'string',
        description: 'Target company or employer name (e.g. Stripe)',
      },
      tone: {
        type: 'string',
        enum: ['Executive', 'Enthusiastic', 'Technical', 'Concise'],
        default: 'Executive',
      },
      jobDescriptionText: {
        type: 'string',
        description: 'Optional job description text to align cover letter focus',
      },
    },
    required: ['targetRole', 'companyName'],
  };

  constructor(private readonly coverLettersService: CoverLettersService) { }

  validate(args: unknown): ToolValidationResult<GenerateCoverLetterArgs> {
    const forbidden = checkNoForbiddenUserId(args);
    if (forbidden) return { valid: false, errors: [forbidden] };

    if (!args || typeof args !== 'object') {
      return { valid: false, errors: ['Missing arguments for generate_cover_letter'] };
    }

    const raw = args as Record<string, unknown>;
    const errors: string[] = [];

    if (!raw.targetRole || typeof raw.targetRole !== 'string' || !raw.targetRole.trim()) {
      errors.push('targetRole is required and must be a non-empty string');
    }

    if (!raw.companyName || typeof raw.companyName !== 'string' || !raw.companyName.trim()) {
      errors.push('companyName is required and must be a non-empty string');
    }

    if (raw.resumeId !== undefined) {
      if (typeof raw.resumeId !== 'string' || !UUID_REGEX.test(raw.resumeId)) {
        errors.push('resumeId must be a valid UUIDv4 string');
      }
    }

    if (raw.tone !== undefined) {
      const allowed = ['Executive', 'Enthusiastic', 'Technical', 'Concise'];
      if (!allowed.includes(raw.tone as string)) {
        errors.push(`tone must be one of: ${allowed.join(', ')}`);
      }
    }

    if (errors.length > 0) return { valid: false, errors };

    return {
      valid: true,
      data: {
        resumeId: raw.resumeId as string | undefined,
        targetRole: (raw.targetRole as string).trim(),
        companyName: (raw.companyName as string).trim(),
        tone: (raw.tone as any) || 'Executive',
        jobDescriptionText:
          typeof raw.jobDescriptionText === 'string' ? raw.jobDescriptionText.trim() : undefined,
      },
    };
  }

  async execute(
    context: ToolExecutionContext,
    args: GenerateCoverLetterArgs,
  ): Promise<ToolResult<unknown>> {
    const targetResumeId = args.resumeId || context.activeResumeId;
    if (!targetResumeId) {
      return {
        success: false,
        error: 'No resumeId provided and no active resume in conversation context.',
      };
    }

    try {
      const payload = {
        resumeId: targetResumeId,
        targetRole: args.targetRole,
        companyName: args.companyName,
        tone: args.tone || 'Executive',
        jobDescription: args.jobDescriptionText,
      };
      const letter = context.taskId
        ? await this.coverLettersService.generate(context.userId, payload, {
          skipCreditCharge: true,
        })
        : await this.coverLettersService.generate(context.userId, payload);

      return {
        success: true,
        data: {
          coverLetterId: letter.id,
          title: letter.title,
          targetRole: letter.targetRole,
          companyName: letter.companyName,
          openingParagraph: letter.openingParagraph,
          bodyParagraphs: letter.bodyParagraphs,
          closingParagraph: letter.closingParagraph,
        },
        metadata: {
          resumeId: targetResumeId,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Cover letter generation failed',
      };
    }
  }
}

