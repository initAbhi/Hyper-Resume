import { Injectable } from '@nestjs/common';
import { ResumesService } from '../../../resumes/resumes.service.js';
import {
  AgentTool,
  checkNoForbiddenUserId,
  ToolExecutionContext,
  ToolPermissionTier,
  ToolResult,
  ToolValidationResult,
  UUID_REGEX,
} from '../tool.interface.js';

export interface ReadResumeVersionsArgs {
  resumeId?: string;
}

@Injectable()
export class ReadResumeVersionsTool implements AgentTool<ReadResumeVersionsArgs, unknown> {
  readonly name = 'read_resume_versions';
  readonly description =
    'Retrieves the list of historical snapshot versions for a resume, including version numbers, change summaries, and creation timestamps.';
  readonly permissionTier = ToolPermissionTier.READ_ONLY;
  readonly requiresApproval = false;
  readonly creditCost = 0;
  readonly timeoutMs = 5000;

  readonly inputSchema = {
    type: 'object',
    properties: {
      resumeId: {
        type: 'string',
        description: 'UUID of the resume. If omitted, uses active resume context.',
      },
    },
    required: [],
  };

  constructor(private readonly resumesService: ResumesService) {}

  validate(args: unknown): ToolValidationResult<ReadResumeVersionsArgs> {
    const forbidden = checkNoForbiddenUserId(args);
    if (forbidden) return { valid: false, errors: [forbidden] };

    if (!args || typeof args !== 'object') {
      return { valid: true, data: {} };
    }

    const raw = args as Record<string, unknown>;
    if (raw.resumeId !== undefined) {
      if (typeof raw.resumeId !== 'string' || !UUID_REGEX.test(raw.resumeId)) {
        return { valid: false, errors: ['resumeId must be a valid UUIDv4 string'] };
      }
      return { valid: true, data: { resumeId: raw.resumeId } };
    }

    return { valid: true, data: {} };
  }

  async execute(
    context: ToolExecutionContext,
    args: ReadResumeVersionsArgs,
  ): Promise<ToolResult<unknown>> {
    const targetResumeId = args.resumeId || context.activeResumeId;
    if (!targetResumeId) {
      return {
        success: false,
        error: 'No resumeId provided and no active resume in conversation context.',
      };
    }

    try {
      const versions = await this.resumesService.listVersions(context.userId, targetResumeId);
      const formatted = versions.map((v) => ({
        id: v.id,
        versionNumber: v.versionNumber,
        changeSummary: v.changeSummary,
        createdAt: v.createdAt,
      }));

      return {
        success: true,
        data: formatted,
        metadata: {
          resumeId: targetResumeId,
          totalVersions: formatted.length,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to list resume versions',
      };
    }
  }
}

