import { Injectable } from '@nestjs/common';
import { JobDiscoveryService } from '../../../job-discovery/job-discovery.service.js';
import {
  AgentTool,
  checkNoForbiddenUserId,
  ToolExecutionContext,
  ToolPermissionTier,
  ToolResult,
  ToolValidationResult,
  UUID_REGEX,
} from '../tool.interface.js';

export interface SaveJobArgs {
  title: string;
  company: string;
  location?: string;
  workplace?: 'Remote' | 'Hybrid' | 'Onsite';
  applyUrl?: string;
  resumeId?: string;
  descriptionText?: string;
}

@Injectable()
export class SaveJobTool implements AgentTool<SaveJobArgs, unknown> {
  readonly name = 'save_job_to_tracker';
  readonly description =
    "Adds a discovered job opportunity into the candidate's application tracker pipeline ('saved' status). Safe additive operation.";
  readonly permissionTier = ToolPermissionTier.SAFE_MUTATING;
  readonly requiresApproval = false;
  readonly isModelCallable = true;
  readonly creditCost = 0;
  readonly timeoutMs = 8000;

  readonly inputSchema = {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Job title (e.g. Senior Distributed Systems Engineer)',
      },
      company: {
        type: 'string',
        description: 'Target employer or company name (e.g. Stripe)',
      },
      location: {
        type: 'string',
        description: 'Job location (e.g. San Francisco, CA or Remote)',
      },
      workplace: {
        type: 'string',
        enum: ['Remote', 'Hybrid', 'Onsite'],
        default: 'Remote',
      },
      applyUrl: {
        type: 'string',
        description: 'Direct URL to apply for the job',
      },
      resumeId: {
        type: 'string',
        description: 'Optional resume UUID to associate with this tracked application',
      },
      descriptionText: {
        type: 'string',
        description: 'Optional job description text to persist with the saved job',
      },
    },
    required: ['title', 'company'],
  };

  constructor(private readonly jobDiscoveryService: JobDiscoveryService) { }

  validate(args: unknown): ToolValidationResult<SaveJobArgs> {
    const forbidden = checkNoForbiddenUserId(args);
    if (forbidden) return { valid: false, errors: [forbidden] };

    if (!args || typeof args !== 'object') {
      return { valid: false, errors: ['Missing arguments for save_job_to_tracker'] };
    }

    const raw = args as Record<string, unknown>;
    const errors: string[] = [];

    if (!raw.title || typeof raw.title !== 'string' || !raw.title.trim()) {
      errors.push('title is required and must be a non-empty string');
    }

    if (!raw.company || typeof raw.company !== 'string' || !raw.company.trim()) {
      errors.push('company is required and must be a non-empty string');
    }

    if (raw.workplace !== undefined) {
      const allowed = ['Remote', 'Hybrid', 'Onsite'];
      if (!allowed.includes(raw.workplace as string)) {
        errors.push(`workplace must be one of: ${allowed.join(', ')}`);
      }
    }

    if (raw.resumeId !== undefined) {
      if (typeof raw.resumeId !== 'string' || !UUID_REGEX.test(raw.resumeId)) {
        errors.push('resumeId must be a valid UUIDv4 string');
      }
    }

    if (raw.applyUrl !== undefined && typeof raw.applyUrl === 'string') {
      try {
        const parsed = new URL(raw.applyUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          errors.push('applyUrl must be an http or https URL');
        }
      } catch {
        errors.push('applyUrl must be a valid URL string');
      }
    }

    if (errors.length > 0) return { valid: false, errors };

    return {
      valid: true,
      data: {
        title: (raw.title as string).trim(),
        company: (raw.company as string).trim(),
        location: typeof raw.location === 'string' ? raw.location.trim() : undefined,
        workplace: (raw.workplace as any) || 'Remote',
        applyUrl: typeof raw.applyUrl === 'string' ? raw.applyUrl.trim() : undefined,
        resumeId: raw.resumeId as string | undefined,
        descriptionText:
          typeof raw.descriptionText === 'string' ? raw.descriptionText.trim() : undefined,
      },
    };
  }

  async execute(
    context: ToolExecutionContext,
    args: SaveJobArgs,
  ): Promise<ToolResult<unknown>> {
    try {
      const locationText = args.location || (args.workplace ? `${args.workplace}` : undefined);
      const descText =
        args.descriptionText || `${args.title} at ${args.company}${locationText ? ` (${locationText})` : ''}`;

      const result = await this.jobDiscoveryService.saveDiscoveredJobToTracker(context.userId, {
        title: args.title,
        company: args.company,
        location: locationText,
        applyUrl: args.applyUrl,
        descriptionText: descText,
        resumeId: args.resumeId || context.activeResumeId,
      });

      return {
        success: true,
        data: {
          applicationId: result.application.id,
          status: result.application.status,
          company: result.application.company,
          role: result.application.role,
          alreadyTracked: result.alreadyTracked,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to save job to application tracker',
      };
    }
  }
}

