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

export interface ReadResumeArgs {
  resumeId?: string;
}

@Injectable()
export class ReadResumeTool implements AgentTool<ReadResumeArgs, unknown> {
  readonly name = 'read_resume';
  readonly description =
    'Retrieves the complete structured resume content (contact, headline, summary, experience, education, skills, projects, certifications) for a specified resume owned by the user.';
  readonly permissionTier = ToolPermissionTier.READ_ONLY;
  readonly requiresApproval = false;
  readonly creditCost = 0;
  readonly timeoutMs = 5000;

  readonly inputSchema = {
    type: 'object',
    properties: {
      resumeId: {
        type: 'string',
        description:
          'UUID of the resume to read. If omitted, the currently active resume in conversation context is used.',
      },
    },
    required: [],
  };

  constructor(private readonly resumesService: ResumesService) { }

  validate(args: unknown): ToolValidationResult<ReadResumeArgs> {
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
    args: ReadResumeArgs,
  ): Promise<ToolResult<unknown>> {
    const targetResumeId = args.resumeId || context.activeResumeId;
    if (!targetResumeId) {
      return {
        success: false,
        error: 'No target resume specified and no active resume in conversation context.',
      };
    }

    try {
      const resume = await this.resumesService.getResume(context.userId, targetResumeId);
      return {
        success: true,
        data: resume.content,
        metadata: {
          resumeId: resume.id,
          name: resume.name,
          version: resume.version,
          templateKey: resume.templateKey,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to retrieve resume',
      };
    }
  }
}

