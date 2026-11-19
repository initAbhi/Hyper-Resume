import { Injectable } from '@nestjs/common';
import { JobMatchingService } from '../../../job-matching/job-matching.service.js';
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

export interface MatchJobArgs {
  resumeId?: string;
  jobDescriptionText?: string;
  jobDescriptionId?: string;
  jobTitle?: string;
  companyName?: string;
}

@Injectable()
export class MatchJobTool implements AgentTool<MatchJobArgs, unknown> {
  readonly name = 'match_job_description';
  readonly description =
    'Analyzes a candidate resume against a target job description, identifying grounded evidence matches, missing critical skills, and ATS match score.';
  readonly permissionTier = ToolPermissionTier.AI_ANALYSIS;
  readonly requiresApproval = false;
  readonly isModelCallable = true;
  readonly creditCost = 1;
  readonly timeoutMs = 20000;

  readonly inputSchema = {
    type: 'object',
    properties: {
      resumeId: {
        type: 'string',
        description: 'UUID of the resume. If omitted, uses active resume context.',
      },
      jobDescriptionText: {
        type: 'string',
        description: 'Full text of the target job posting',
      },
      jobDescriptionId: {
        type: 'string',
        description: 'UUID of an existing persisted job description (optional)',
      },
      jobTitle: {
        type: 'string',
        description: 'Target job title (e.g. Senior Frontend Engineer)',
      },
      companyName: {
        type: 'string',
        description: 'Target employer name (e.g. Stripe)',
      },
    },
    required: [],
  };

  constructor(
    private readonly jobMatchingService: JobMatchingService,
    private readonly jobsService: JobsService,
  ) { }

  validate(args: unknown): ToolValidationResult<MatchJobArgs> {
    const forbidden = checkNoForbiddenUserId(args);
    if (forbidden) return { valid: false, errors: [forbidden] };

    if (!args || typeof args !== 'object') {
      return { valid: false, errors: ['Missing arguments for match_job_description'] };
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

    if (!raw.jobDescriptionId && !raw.jobDescriptionText) {
      errors.push('Either jobDescriptionText or jobDescriptionId must be provided');
    }

    if (errors.length > 0) return { valid: false, errors };

    return {
      valid: true,
      data: {
        resumeId: raw.resumeId as string | undefined,
        jobDescriptionText: raw.jobDescriptionText as string | undefined,
        jobDescriptionId: raw.jobDescriptionId as string | undefined,
        jobTitle: raw.jobTitle as string | undefined,
        companyName: raw.companyName as string | undefined,
      },
    };
  }

  async execute(
    context: ToolExecutionContext,
    args: MatchJobArgs,
  ): Promise<ToolResult<unknown>> {
    const targetResumeId = args.resumeId || context.activeResumeId;
    if (!targetResumeId) {
      return {
        success: false,
        error: 'No resumeId provided and no active resume in conversation context.',
      };
    }

    try {
      let targetJdId = args.jobDescriptionId;

      if (!targetJdId && args.jobDescriptionText) {
        const createdJd = await this.jobsService.createJobDescription(context.userId, {
          title: args.jobTitle || 'Target Role',
          companyName: args.companyName || 'Target Company',
          originalText: args.jobDescriptionText,
        });
        targetJdId = createdJd.id;
      }

      if (!targetJdId) {
        return {
          success: false,
          error: 'Could not resolve job description ID',
        };
      }

      const match = context.taskId
        ? await this.jobMatchingService.createJobMatch(
          context.userId,
          {
            resumeId: targetResumeId,
            jobDescriptionId: targetJdId,
          },
          { skipCreditCharge: true },
        )
        : await this.jobMatchingService.createJobMatch(context.userId, {
          resumeId: targetResumeId,
          jobDescriptionId: targetJdId,
        });

      const analysis = match.requirementsAnalysis || [];
      const matchedKeywords = analysis
        .filter((r) => r.status === 'supported')
        .map((r) => r.text);
      const missingHardSkills = analysis
        .filter((r) => r.status === 'not_evidenced' && r.type === 'skill')
        .map((r) => r.text);
      const requirementGaps = analysis.filter((r) => r.status !== 'supported');

      return {
        success: true,
        data: {
          jobMatchId: match.id,
          overallScore: match.overallScore,
          scoreComponents: match.scoreComponents,
          matchedKeywords,
          missingHardSkills,
          requirementGaps,
          recommendations: match.recommendations || [],
        },
        metadata: {
          resumeId: targetResumeId,
          jobDescriptionId: targetJdId,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Job description match analysis failed',
      };
    }
  }
}

