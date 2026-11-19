import { Injectable } from '@nestjs/common';
import { InterviewsService } from '../../../interviews/interviews.service.js';
import { JobsService } from '../../../jobs/jobs.service.js';
import {
  AgentTool,
  checkNoForbiddenUserId,
  ToolExecutionContext,
  ToolPermissionTier,
  ToolResult,
  ToolValidationResult,
  UUID_REGEX,
} from '../tool.interface.js';

export interface StartInterviewArgs {
  resumeId?: string;
  jobDescriptionText?: string;
  jobDescriptionId?: string;
  sessionMode?: 'quick_practice' | 'full_mock' | 'weak_area';
  targetRole?: string;
}

@Injectable()
export class StartInterviewTool implements AgentTool<StartInterviewArgs, unknown> {
  readonly name = 'start_interview_session';
  readonly description =
    'Initializes an AI mock interview practice session based on the candidate resume and target job description.';
  readonly permissionTier = ToolPermissionTier.AI_ANALYSIS;
  readonly requiresApproval = false;
  readonly isModelCallable = true;
  readonly creditCost = 2;
  readonly timeoutMs = 20000;

  readonly inputSchema = {
    type: 'object',
    properties: {
      resumeId: {
        type: 'string',
        description: 'UUID of the candidate resume. If omitted, active resume is used.',
      },
      jobDescriptionText: {
        type: 'string',
        description: 'Target job description text for generating role-specific questions',
      },
      jobDescriptionId: {
        type: 'string',
        description: 'UUID of existing job description (optional)',
      },
      sessionMode: {
        type: 'string',
        enum: ['quick_practice', 'full_mock', 'weak_area'],
        default: 'quick_practice',
      },
      targetRole: {
        type: 'string',
        description: 'Target job title (e.g. Senior Backend Engineer)',
      },
    },
    required: [],
  };

  constructor(
    private readonly interviewsService: InterviewsService,
    private readonly jobsService: JobsService,
  ) { }

  validate(args: unknown): ToolValidationResult<StartInterviewArgs> {
    const forbidden = checkNoForbiddenUserId(args);
    if (forbidden) return { valid: false, errors: [forbidden] };

    if (!args || typeof args !== 'object') {
      return { valid: true, data: {} };
    }

    const raw = args as Record<string, unknown>;
    const errors: string[] = [];

    if (raw.resumeId !== undefined) {
      if (typeof raw.resumeId !== 'string' || !UUID_REGEX.test(raw.resumeId)) {
        errors.push('resumeId must be a valid UUIDv4 string');
      }
    }

    if (raw.jobDescriptionId !== undefined) {
      if (typeof raw.jobDescriptionId !== 'string' || !UUID_REGEX.test(raw.jobDescriptionId)) {
        errors.push('jobDescriptionId must be a valid UUIDv4 string');
      }
    }

    if (raw.sessionMode !== undefined) {
      const allowed = ['quick_practice', 'full_mock', 'weak_area'];
      if (!allowed.includes(raw.sessionMode as string)) {
        errors.push(`sessionMode must be one of: ${allowed.join(', ')}`);
      }
    }

    if (errors.length > 0) return { valid: false, errors };

    return {
      valid: true,
      data: {
        resumeId: raw.resumeId as string | undefined,
        jobDescriptionText:
          typeof raw.jobDescriptionText === 'string' ? raw.jobDescriptionText.trim() : undefined,
        jobDescriptionId: raw.jobDescriptionId as string | undefined,
        sessionMode: (raw.sessionMode as any) || 'quick_practice',
        targetRole: typeof raw.targetRole === 'string' ? raw.targetRole.trim() : undefined,
      },
    };
  }

  async execute(
    context: ToolExecutionContext,
    args: StartInterviewArgs,
  ): Promise<ToolResult<unknown>> {
    const targetResumeId = args.resumeId || context.activeResumeId;
    if (!targetResumeId) {
      return {
        success: false,
        error: 'No resumeId provided and no active resume in conversation context.',
      };
    }

    try {
      let resolvedJdId = args.jobDescriptionId;

      if (!resolvedJdId && args.jobDescriptionText) {
        const createdJd = await this.jobsService.createJobDescription(context.userId, {
          title: args.targetRole || 'Target Role',
          originalText: args.jobDescriptionText,
        });
        resolvedJdId = createdJd.id;
      }

      const payload = {
        resumeId: targetResumeId,
        jobDescriptionId: resolvedJdId,
        sessionMode: args.sessionMode || 'quick_practice',
        targetRole: args.targetRole || 'Target Role',
      };
      const session = context.taskId
        ? await this.interviewsService.startSession(
          context.userId,
          payload,
          `agent:${context.taskId}:${resolvedJdId || targetResumeId}`,
          { skipCreditCharge: true },
        )
        : await this.interviewsService.startSession(context.userId, payload);

      return {
        success: true,
        data: {
          sessionId: session.id,
          sessionMode: session.sessionMode,
          targetRole: session.targetRole,
          totalQuestions: session.totalQuestions,
          status: session.status,
          firstQuestion: (session as any).activeQuestion
            ? {
              id: (session as any).activeQuestion.id,
              orderIndex: (session as any).activeQuestion.orderIndex,
              questionText: (session as any).activeQuestion.questionText,
            }
            : undefined,
        },
        metadata: {
          resumeId: targetResumeId,
          jobDescriptionId: resolvedJdId,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to start interview practice session',
      };
    }
  }
}

