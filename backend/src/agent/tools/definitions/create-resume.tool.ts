import { Injectable } from '@nestjs/common';
import { ResumesService } from '../../../resumes/resumes.service.js';
import {
  AgentTool,
  checkNoForbiddenUserId,
  ToolExecutionContext,
  ToolPermissionTier,
  ToolResult,
  ToolValidationResult,
} from '../tool.interface.js';

export interface CreateResumeArgs {
  name: string;
  templateKey?: string;
  targetRole?: string;
}

@Injectable()
export class CreateResumeTool implements AgentTool<CreateResumeArgs, unknown> {
  readonly name = 'create_resume';
  readonly description =
    'Creates a new independent resume draft for the candidate. Safe additive operation; does not overwrite any existing resume.';
  readonly permissionTier = ToolPermissionTier.SAFE_MUTATING;
  readonly requiresApproval = false;
  readonly isModelCallable = true;
  readonly creditCost = 0;
  readonly timeoutMs = 8000;

  readonly inputSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Title of the new resume draft (e.g. Senior Backend Resume - 2026)',
      },
      templateKey: {
        type: 'string',
        description: 'Visual template identifier (e.g. clean-modern, classic, executive)',
        default: 'clean-modern',
      },
      targetRole: {
        type: 'string',
        description: 'Target job title (e.g. Staff Engineer)',
      },
    },
    required: ['name'],
  };

  constructor(private readonly resumesService: ResumesService) {}

  validate(args: unknown): ToolValidationResult<CreateResumeArgs> {
    const forbidden = checkNoForbiddenUserId(args);
    if (forbidden) return { valid: false, errors: [forbidden] };

    if (!args || typeof args !== 'object') {
      return { valid: false, errors: ['Missing arguments for create_resume'] };
    }

    const raw = args as Record<string, unknown>;
    const errors: string[] = [];

    if (!raw.name || typeof raw.name !== 'string' || !raw.name.trim()) {
      errors.push('name is required and must be a non-empty string');
    }

    if (errors.length > 0) return { valid: false, errors };

    return {
      valid: true,
      data: {
        name: (raw.name as string).trim(),
        templateKey:
          typeof raw.templateKey === 'string' && raw.templateKey.trim()
            ? raw.templateKey.trim()
            : 'clean-modern',
        targetRole: typeof raw.targetRole === 'string' ? raw.targetRole.trim() : undefined,
      },
    };
  }

  async execute(
    context: ToolExecutionContext,
    args: CreateResumeArgs,
  ): Promise<ToolResult<unknown>> {
    try {
      const resume = await this.resumesService.createResume(context.userId, {
        name: args.name,
        templateKey: args.templateKey || 'clean-modern',
        targetRole: args.targetRole,
      });

      return {
        success: true,
        data: {
          resumeId: resume.id,
          name: resume.name,
          version: resume.version,
          templateKey: resume.templateKey,
        },
        metadata: {
          createdResumeId: resume.id,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to create new resume draft',
      };
    }
  }
}

