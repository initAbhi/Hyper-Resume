import { Injectable } from '@nestjs/common';
import { ResumesService } from '../../../resumes/resumes.service.js';
import { evaluateStructuredResumeAts } from '../../../ai/utils/ats-audit-engine.js';
import {
  AgentTool,
  checkNoForbiddenUserId,
  ToolExecutionContext,
  ToolPermissionTier,
  ToolResult,
  ToolValidationResult,
  UUID_REGEX,
} from '../tool.interface.js';

export interface RunAtsAuditArgs {
  resumeId?: string;
  targetJobDescription?: string;
}

@Injectable()
export class RunAtsAuditTool implements AgentTool<RunAtsAuditArgs, unknown> {
  readonly name = 'run_ats_audit';
  readonly description =
    "Executes HyperResume's comprehensive 5-dimension ATS audit engine on the specified resume. Evaluates parse rate, impact metrics, action verb strength, section structure, writing quality, and simulated ATS platforms.";
  readonly permissionTier = ToolPermissionTier.AI_ANALYSIS;
  readonly requiresApproval = false;
  readonly isModelCallable = true;
  readonly creditCost = 0;
  readonly timeoutMs = 10000;

  readonly inputSchema = {
    type: 'object',
    properties: {
      resumeId: {
        type: 'string',
        description:
          'UUID of the resume to audit. If omitted, uses active resume context.',
      },
      targetJobDescription: {
        type: 'string',
        description: 'Optional JD text to score keyword alignment',
      },
    },
    required: [],
  };

  constructor(private readonly resumesService: ResumesService) { }

  validate(args: unknown): ToolValidationResult<RunAtsAuditArgs> {
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

    if (raw.targetJobDescription !== undefined && typeof raw.targetJobDescription !== 'string') {
      errors.push('targetJobDescription must be a string');
    }

    if (errors.length > 0) return { valid: false, errors };

    return {
      valid: true,
      data: {
        resumeId: raw.resumeId as string | undefined,
        targetJobDescription: raw.targetJobDescription as string | undefined,
      },
    };
  }

  async execute(
    context: ToolExecutionContext,
    args: RunAtsAuditArgs,
  ): Promise<ToolResult<unknown>> {
    const targetResumeId = args.resumeId || context.activeResumeId;
    if (!targetResumeId) {
      return {
        success: false,
        error: 'No resumeId specified and no active resume in conversation context.',
      };
    }

    try {
      const resume = await this.resumesService.getResume(context.userId, targetResumeId);
      const auditResult = evaluateStructuredResumeAts(
        resume.content,
        undefined,
        resume.content?.headline,
        args.targetJobDescription,
      );

      const normalizedIssues: string[] = [];
      if (Array.isArray(auditResult.recommendations)) {
        for (const rec of auditResult.recommendations) {
          if (typeof rec === 'string' && rec.trim()) {
            normalizedIssues.push(rec.trim());
          }
        }
      }
      const parserRisks = (auditResult.findings as any)?.parserRisks;
      if (Array.isArray(parserRisks)) {
        for (const risk of parserRisks) {
          const msg =
            typeof risk === 'string'
              ? risk
              : risk?.message || risk?.title || risk?.recommendation;
          if (typeof msg === 'string' && msg.trim() && !normalizedIssues.includes(msg.trim())) {
            normalizedIssues.push(msg.trim());
          }
        }
      }

      return {
        success: true,
        data: {
          overallScore: auditResult.atsScore,
          compositeScore: auditResult.compositeScore,
          matchScore: auditResult.matchScore,
          issues: normalizedIssues,
          findings: auditResult.findings,
          recommendations: auditResult.recommendations,
          atsSimulations: auditResult.findings?.atsSystemSimulations,
          summary: `ATS Score: ${auditResult.atsScore}/100 with ${normalizedIssues.length} actionable improvement${normalizedIssues.length === 1 ? '' : 's'}.`,
        },
        metadata: {
          resumeId: targetResumeId,
          version: resume.version,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'ATS audit execution failed',
      };
    }
  }
}

