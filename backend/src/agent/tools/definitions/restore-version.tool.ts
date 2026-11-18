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

export interface RestoreVersionArgs {
  resumeId: string;
  versionId: string;
}

@Injectable()
export class RestoreVersionTool implements AgentTool<RestoreVersionArgs, unknown> {
  readonly name = 'restore_resume_version';
  readonly description =
    "Restores a resume's content to the exact state of a previous snapshot version. Overwrites active resume content; requires human approval.";
  readonly permissionTier = ToolPermissionTier.STATE_MUTATING;
  readonly requiresApproval = true;
  readonly creditCost = 0;
  readonly timeoutMs = 8000;

  readonly inputSchema = {
    type: 'object',
    properties: {
      resumeId: {
        type: 'string',
        description: 'UUID of the target resume to roll back',
      },
      versionId: {
        type: 'string',
        description: 'UUID of the historical snapshot version to restore',
      },
    },
    required: ['resumeId', 'versionId'],
  };

  constructor(private readonly resumesService: ResumesService) {}

  validate(args: unknown): ToolValidationResult<RestoreVersionArgs> {
    const forbidden = checkNoForbiddenUserId(args);
    if (forbidden) return { valid: false, errors: [forbidden] };

    if (!args || typeof args !== 'object') {
      return { valid: false, errors: ['Missing arguments for restore_resume_version'] };
    }

    const raw = args as Record<string, unknown>;
    const errors: string[] = [];

    if (!raw.resumeId || typeof raw.resumeId !== 'string' || !UUID_REGEX.test(raw.resumeId)) {
      errors.push('resumeId is required and must be a valid UUIDv4');
    }

    if (!raw.versionId || typeof raw.versionId !== 'string' || !UUID_REGEX.test(raw.versionId)) {
      errors.push('versionId is required and must be a valid UUIDv4');
    }

    if (errors.length > 0) return { valid: false, errors };

    return {
      valid: true,
      data: {
        resumeId: raw.resumeId as string,
        versionId: raw.versionId as string,
      },
    };
  }

  async execute(
    context: ToolExecutionContext,
    args: RestoreVersionArgs,
  ): Promise<ToolResult<unknown>> {
    try {
      const restored = await this.resumesService.restoreVersion(
        context.userId,
        args.resumeId,
        args.versionId,
      );

      return {
        success: true,
        data: {
          success: true,
          resumeId: restored.id,
          newLiveVersion: restored.version,
        },
        metadata: {
          restoredFromVersionId: args.versionId,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to restore historical resume version',
      };
    }
  }
}

