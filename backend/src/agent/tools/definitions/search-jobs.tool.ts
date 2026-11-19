import { Injectable } from '@nestjs/common';
import { JobDiscoveryService } from '../../../job-discovery/job-discovery.service.js';
import {
  AgentTool,
  ATS_BOARD_TOKEN_REGEX,
  checkNoForbiddenUserId,
  ToolExecutionContext,
  ToolPermissionTier,
  ToolResult,
  ToolValidationResult,
  UUID_REGEX,
} from '../tool.interface.js';

export interface SearchJobsArgs {
  query?: string;
  workplace?: 'all' | 'Remote' | 'Hybrid' | 'Onsite';
  source?: 'all' | 'ashby' | 'greenhouse' | 'lever' | 'remotive' | 'arbeitnow';
  boardToken?: string;
  resumeId?: string;
}

@Injectable()
export class SearchJobsTool implements AgentTool<SearchJobsArgs, unknown> {
  readonly name = 'search_discovered_jobs';
  readonly description =
    'Searches live postings across major tech ATS job boards (Ashby, Greenhouse, Lever, Remotive, Arbeitnow) and ranks results by candidate profile fit.';
  readonly permissionTier = ToolPermissionTier.READ_ONLY;
  readonly requiresApproval = false;
  readonly isModelCallable = true;
  readonly creditCost = 0;
  readonly timeoutMs = 15000;

  readonly inputSchema = {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Job title or search keywords (e.g. Senior Software Engineer)',
      },
      workplace: {
        type: 'string',
        enum: ['all', 'Remote', 'Hybrid', 'Onsite'],
        default: 'all',
      },
      source: {
        type: 'string',
        enum: ['all', 'ashby', 'greenhouse', 'lever', 'remotive', 'arbeitnow'],
        default: 'all',
      },
      boardToken: {
        type: 'string',
        description: "Specific ATS company slug (e.g. 'stripe', 'linear', 'figma')",
      },
      resumeId: {
        type: 'string',
        description: 'Optional resume UUID to calculate keyword relevance matching',
      },
    },
    required: [],
  };

  constructor(private readonly jobDiscoveryService: JobDiscoveryService) { }

  validate(args: unknown): ToolValidationResult<SearchJobsArgs> {
    const forbidden = checkNoForbiddenUserId(args);
    if (forbidden) return { valid: false, errors: [forbidden] };

    if (!args || typeof args !== 'object') {
      return { valid: true, data: {} };
    }

    const raw = args as Record<string, unknown>;
    const errors: string[] = [];

    if (raw.boardToken !== undefined) {
      if (typeof raw.boardToken !== 'string' || !ATS_BOARD_TOKEN_REGEX.test(raw.boardToken)) {
        errors.push(
          'boardToken must be a lowercase alphanumeric slug matching /^[a-z0-9][a-z0-9_-]{0,62}$/',
        );
      }
    }

    if (raw.workplace !== undefined) {
      const allowed = ['all', 'Remote', 'Hybrid', 'Onsite'];
      if (!allowed.includes(raw.workplace as string)) {
        errors.push(`workplace must be one of: ${allowed.join(', ')}`);
      }
    }

    if (raw.source !== undefined) {
      const allowed = ['all', 'ashby', 'greenhouse', 'lever', 'remotive', 'arbeitnow'];
      if (!allowed.includes(raw.source as string)) {
        errors.push(`source must be one of: ${allowed.join(', ')}`);
      }
    }

    if (raw.resumeId !== undefined) {
      if (typeof raw.resumeId !== 'string' || !UUID_REGEX.test(raw.resumeId)) {
        errors.push('resumeId must be a valid UUIDv4 string');
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return {
      valid: true,
      data: {
        query: typeof raw.query === 'string' ? raw.query.trim() : undefined,
        workplace: raw.workplace as any,
        source: raw.source as any,
        boardToken: typeof raw.boardToken === 'string' ? raw.boardToken.trim().toLowerCase() : undefined,
        resumeId: typeof raw.resumeId === 'string' ? raw.resumeId : undefined,
      },
    };
  }

  async execute(
    context: ToolExecutionContext,
    args: SearchJobsArgs,
  ): Promise<ToolResult<unknown>> {
    try {
      const workplace = args.workplace ? (args.workplace.toLowerCase() as 'all' | 'remote' | 'hybrid' | 'onsite') : 'all';
      const result = await this.jobDiscoveryService.searchJobs(context.userId, {
        q: args.query,
        workplace,
        source: args.source || 'all',
        boardToken: args.boardToken,
        resumeId: args.resumeId || context.activeResumeId,
      });

      return {
        success: true,
        data: result,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Job discovery search failed',
      };
    }
  }
}

