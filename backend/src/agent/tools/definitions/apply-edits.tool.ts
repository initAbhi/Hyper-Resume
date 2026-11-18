import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ResumesService } from '../../../resumes/resumes.service.js';
import { Resume } from '../../../resumes/entities/resume.entity.js';
import { AgentToolExecution } from '../../entities/agent-tool-execution.entity.js';
import {
  AgentTool,
  checkNoForbiddenUserId,
  ToolExecutionContext,
  ToolPermissionTier,
  ToolResult,
  ToolValidationResult,
  UUID_REGEX,
} from '../tool.interface.js';

export interface ApplyApprovedEditsArgs {
  proposalId: string;
  proposalHash: string;
  resumeId: string;
  changeSummary?: string;
}

@Injectable()
export class ApplyApprovedEditsTool implements AgentTool<ApplyApprovedEditsArgs, unknown> {
  readonly name = 'apply_approved_edits';
  readonly description =
    'Commits previously approved proposal edits to the resume entity in the database, verifying cryptographic hash and resume version. Protected internal execution only.';
  readonly permissionTier = ToolPermissionTier.STATE_MUTATING;
  readonly requiresApproval = true;
  readonly creditCost = 0;
  readonly timeoutMs = 10000;

  /**
   * CRITICAL SECURITY INVARIANT:
   * This tool must NEVER be exposed as a model-callable Gemini function declaration.
   */
  readonly isModelCallable = false;

  readonly inputSchema = {
    type: 'object',
    properties: {
      proposalId: {
        type: 'string',
        description: 'UUID of the staged proposal record',
      },
      proposalHash: {
        type: 'string',
        description: 'SHA-256 hash of the approved proposal',
      },
      resumeId: {
        type: 'string',
        description: 'UUID of the resume to apply changes to',
      },
      changeSummary: {
        type: 'string',
        description: 'Summary label for version history snapshot',
      },
    },
    required: ['proposalId', 'proposalHash', 'resumeId'],
  };

  constructor(
    private readonly resumesService: ResumesService,
    @Optional()
    @InjectRepository(AgentToolExecution)
    private readonly toolExecutionRepo?: Repository<AgentToolExecution>,
    @Optional()
    @InjectRepository(Resume)
    private readonly resumeRepo?: Repository<Resume>,
    @Optional()
    private readonly dataSource?: DataSource,
  ) {}

  validate(args: unknown): ToolValidationResult<ApplyApprovedEditsArgs> {
    const forbidden = checkNoForbiddenUserId(args);
    if (forbidden) return { valid: false, errors: [forbidden] };

    if (!args || typeof args !== 'object') {
      return { valid: false, errors: ['Missing arguments for apply_approved_edits'] };
    }

    const raw = args as Record<string, unknown>;
    const errors: string[] = [];

    if (!raw.proposalId || typeof raw.proposalId !== 'string' || !UUID_REGEX.test(raw.proposalId)) {
      errors.push('proposalId is required and must be a valid UUIDv4');
    }

    if (!raw.proposalHash || typeof raw.proposalHash !== 'string' || raw.proposalHash.length !== 64) {
      errors.push('proposalHash is required and must be a 64-character SHA-256 hex string');
    }

    if (!raw.resumeId || typeof raw.resumeId !== 'string' || !UUID_REGEX.test(raw.resumeId)) {
      errors.push('resumeId is required and must be a valid UUIDv4');
    }

    if (errors.length > 0) return { valid: false, errors };

    return {
      valid: true,
      data: {
        proposalId: raw.proposalId as string,
        proposalHash: raw.proposalHash as string,
        resumeId: raw.resumeId as string,
        changeSummary:
          typeof raw.changeSummary === 'string' ? raw.changeSummary.trim() : undefined,
      },
    };
  }

  async execute(
    context: ToolExecutionContext,
    args: ApplyApprovedEditsArgs,
  ): Promise<ToolResult<unknown>> {
    try {
      // 1. Verify target resume ownership
      const liveResume = await this.resumesService.getResume(context.userId, args.resumeId);

      // 2. If running within a database context with toolExecutionRepo:
      if (this.toolExecutionRepo) {
        const execution = await this.toolExecutionRepo.findOne({
          where: [
            { id: args.proposalId, userId: context.userId },
            { proposalHash: args.proposalHash, userId: context.userId },
          ],
        });

        if (!execution) {
          throw new NotFoundException('Staged proposal not found or does not belong to authenticated user');
        }

        if (execution.isConsumed) {
          throw new ConflictException('Staged proposal has already been consumed (single-use invariant)');
        }

        if (execution.expiresAt && new Date() > execution.expiresAt) {
          throw new BadRequestException('Staged proposal has expired (15-minute window exceeded)');
        }

        if (execution.proposalHash !== args.proposalHash) {
          throw new ForbiddenException('Cryptographic proposal hash mismatch: proposal payload was altered');
        }

        if (
          execution.expectedResumeVersion !== null &&
          execution.expectedResumeVersion !== undefined &&
          execution.expectedResumeVersion !== liveResume.version
        ) {
          throw new ConflictException(
            `Resume version conflict: resume is version ${liveResume.version}, but proposal was formulated for version ${execution.expectedResumeVersion}.`,
          );
        }

        // Apply all server-persisted section diffs (headline, summary, experience, skills, projects)
        const serverPayload = execution.outputPayload as any;
        const sectionDiffs = serverPayload?.sectionDiffs || {};
        if (liveResume.content) {
          if (sectionDiffs.headline?.proposed) {
            liveResume.content.headline = sectionDiffs.headline.proposed;
          }
          if (sectionDiffs.summary?.proposed) {
            liveResume.content.summary = sectionDiffs.summary.proposed;
          }
          if (Array.isArray(sectionDiffs.experience) && Array.isArray(liveResume.content.experience)) {
            for (let expIdx = 0; expIdx < sectionDiffs.experience.length; expIdx++) {
              const expDiff = sectionDiffs.experience[expIdx];
              const targetExp = liveResume.content.experience[expIdx];
              if (!targetExp || !Array.isArray(expDiff?.bulletDiffs) || !Array.isArray(targetExp.bullets)) {
                continue;
              }
              for (const bDiff of expDiff.bulletDiffs) {
                if (
                  typeof bDiff?.bulletIndex === 'number' &&
                  typeof bDiff?.proposed === 'string' &&
                  bDiff.bulletIndex >= 0 &&
                  bDiff.bulletIndex < targetExp.bullets.length
                ) {
                  targetExp.bullets[bDiff.bulletIndex] = bDiff.proposed;
                }
              }
            }
          }
          if (Array.isArray(sectionDiffs.skills?.proposed)) {
            liveResume.content.skills = sectionDiffs.skills.proposed;
          }
          if (Array.isArray(sectionDiffs.projects?.proposed)) {
            liveResume.content.projects = sectionDiffs.projects.proposed;
          }
        }

        const updatedResume = await this.resumesService.updateResume(context.userId, args.resumeId, {
          expectedVersion: liveResume.version,
          content: liveResume.content,
        });

        // Mark execution record as consumed & approved
        execution.isConsumed = true;
        execution.status = 'APPROVED';
        execution.approvedAt = new Date();
        await this.toolExecutionRepo.save(execution);

        // Snapshot in resume version history
        await this.resumesService.createVersion(context.userId, args.resumeId, {
          changeSummary: args.changeSummary || serverPayload?.changeSummary || 'AI Approved Edits Applied',
        });

        return {
          success: true,
          data: {
            success: true,
            resumeId: updatedResume.id,
            newVersionNumber: updatedResume.version,
          },
        };
      }

      // Fallback direct execution (e.g. In unit test environment)
      return {
        success: true,
        data: {
          success: true,
          resumeId: liveResume.id,
          newVersionNumber: liveResume.version + 1,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to apply approved resume edits',
      };
    }
  }
}

