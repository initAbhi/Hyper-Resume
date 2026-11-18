import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import crypto from 'node:crypto';
import { AgentTask } from './entities/agent-task.entity.js';
import { AgentToolExecution } from './entities/agent-tool-execution.entity.js';
import { AgentMessage } from './entities/agent-message.entity.js';
import { ToolRegistryService } from './tools/tool-registry.service.js';
import { computeProposalHash } from './tools/definitions/propose-edits.tool.js';
import { CreditsService } from '../credits/credits.service.js';
import { AgentService } from './agent.service.js';
import { Resume } from '../resumes/entities/resume.entity.js';
import { ResumeVersion } from '../resumes/entities/resume-version.entity.js';
import { AgentPlan } from './agent-planner.service.js';
import { GeminiAiProvider } from '../ai/providers/gemini-ai.provider.js';

@Injectable()
export class AgentExecutorService {
  private readonly logger = new Logger(AgentExecutorService.name);

  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly creditsService: CreditsService,
    private readonly agentService: AgentService,
    @InjectRepository(AgentTask)
    private readonly taskRepo: Repository<AgentTask>,
    @InjectRepository(AgentToolExecution)
    private readonly toolExecutionRepo: Repository<AgentToolExecution>,
    @InjectRepository(AgentMessage)
    private readonly messageRepo: Repository<AgentMessage>,
    private readonly dataSource: DataSource,
    @Optional()
    private readonly geminiProvider?: GeminiAiProvider,
  ) { }

  async executeTask(task: AgentTask, fenceToken: number, _leaseToken: string): Promise<void> {
    const currentTask = await this.taskRepo.findOne({ where: { id: task.id } });
    if (!currentTask) {
      this.logger.warn(`Task ${task.id} not found during execution dispatch`);
      return;
    }

    // Fencing token check
    if (currentTask.fenceToken !== fenceToken) {
      this.logger.warn(
        `STALE_FENCE_TOKEN: Fencing token mismatch on task ${task.id}: DB=${currentTask.fenceToken}, worker=${fenceToken}. Aborting execution.`,
      );
      return;
    }

    if (currentTask.status === 'CANCELLED') {
      this.logger.log(`Task ${task.id} is cancelled. Aborting execution.`);
      return;
    }

    const plan = currentTask.metadata?.plan as AgentPlan | undefined;
    if (!plan || !plan.steps || plan.steps.length === 0) {
      if (plan?.directResponse) {
        currentTask.status = 'COMPLETED';
        await this.taskRepo.save(currentTask);

        const assistantMessage = this.messageRepo.create({
          conversationId: currentTask.conversationId,
          role: 'assistant',
          content: plan.directResponse,
        });
        await this.messageRepo.save(assistantMessage);

        await this.agentService.publishEvent(currentTask.id, currentTask.conversationId, 'task_completed', {
          taskId: currentTask.id,
          summary: plan.directResponse,
          messageId: assistantMessage.id,
          workflowState: {},
        });
        return;
      }

      this.logger.warn(`No plan found for task ${task.id}`);
      currentTask.status = 'COMPLETED';
      await this.taskRepo.save(currentTask);
      return;
    }

    const workflowState: Record<string, any> = {
      ...(currentTask.metadata?.workflowState as Record<string, any> | undefined),
    };
    const stepOutputs: Record<string, any> = {
      ...(currentTask.metadata?.stepOutputs as Record<string, any> | undefined),
    };
    const taskContext = ((currentTask.taskInput as any)?.context || {}) as Record<string, any>;

    // Seed selectedJob from page context if not already captured
    if (!workflowState.selectedJob && (taskContext.jobTitle || taskContext.companyName)) {
      workflowState.selectedJob = {
        id: taskContext.activeJobId,
        title: taskContext.jobTitle,
        company: taskContext.companyName,
        location: taskContext.location,
        workplace: taskContext.workplace,
        applyUrl: taskContext.applyUrl,
        descriptionText: taskContext.jobDescriptionText,
        jobDescriptionId: taskContext.jobDescriptionId,
      };
    }

    for (const step of plan.steps) {
      // Re-verify fencing token and cancellation before each step
      const stepCheck = await this.taskRepo.findOne({ where: { id: task.id } });
      if (!stepCheck || stepCheck.fenceToken !== fenceToken) {
        this.logger.warn(`Fence token advanced during step execution for task ${task.id}. Aborting.`);
        return;
      }
      if (stepCheck.status === 'CANCELLED') {
        this.logger.log(`Task ${task.id} cancelled prior to step ${step.stepIndex}`);
        return;
      }

      // Skip already completed steps (idempotent recovery & post-approval resumption)
      if (step.status === 'COMPLETED') {
        continue;
      }

      step.status = 'EXECUTING';
      currentTask.metadata = {
        ...currentTask.metadata,
        plan,
        workflowState,
        stepOutputs,
      };
      await this.taskRepo.save(currentTask);

      await this.agentService.publishEvent(currentTask.id, currentTask.conversationId, 'step_progress', {
        taskId: currentTask.id,
        stepIndex: step.stepIndex,
        toolName: step.toolName,
        status: 'EXECUTING',
        description: step.description,
      });

      const tool = this.toolRegistry.getTool(step.toolName);
      if (!tool) {
        const missingError = `Unknown tool '${step.toolName}' requested in execution plan`;
        step.status = 'FAILED';
        this.logger.error(missingError);
        currentTask.status = 'FAILED';
        currentTask.metadata = { ...currentTask.metadata, plan, workflowState, stepOutputs, executionError: missingError };
        await this.taskRepo.save(currentTask);
        await this.agentService.publishEvent(currentTask.id, currentTask.conversationId, 'step_progress', {
          taskId: currentTask.id,
          stepIndex: step.stepIndex,
          toolName: step.toolName,
          status: 'FAILED',
          error: missingError,
        });
        await this.agentService.publishEvent(currentTask.id, currentTask.conversationId, 'task_failed', {
          taskId: currentTask.id,
          status: 'FAILED',
          error: missingError,
        });
        return;
      }

      // Resolve chained cross-service arguments from prior step outputs & page context
      const resolvedArgs = this.resolveStepArguments(
        step.toolName,
        step.inputArguments,
        currentTask,
        workflowState,
        taskContext,
      );

      // Authoritative validation before credit reservation or tool execution
      let validatedArgs = resolvedArgs;
      if (typeof tool.validate === 'function') {
        const validation = tool.validate(resolvedArgs);
        if (!validation.valid) {
          step.status = 'FAILED';
          const validationError = (validation.errors || ['Invalid tool arguments']).join('; ');
          currentTask.status = 'FAILED';
          currentTask.metadata = { ...currentTask.metadata, plan, workflowState, stepOutputs, executionError: validationError };
          await this.taskRepo.save(currentTask);
          await this.agentService.publishEvent(currentTask.id, currentTask.conversationId, 'step_progress', {
            taskId: currentTask.id,
            stepIndex: step.stepIndex,
            toolName: step.toolName,
            status: 'FAILED',
            error: validationError,
          });
          await this.agentService.publishEvent(currentTask.id, currentTask.conversationId, 'task_failed', {
            taskId: currentTask.id,
            status: 'FAILED',
            error: validationError,
          });
          return;
        }
        if (validation.data && typeof validation.data === 'object') {
          validatedArgs = validation.data as Record<string, any>;
        }
      }

      // Mandatory human-in-the-loop gate for ANY state-mutating tool marked requiresApproval === true
      if (tool.requiresApproval && step.toolName !== 'propose_resume_edits') {
        const proposalId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const proposalPayload = {
          proposalId,
          toolName: step.toolName,
          stepIndex: step.stepIndex,
          arguments: validatedArgs,
        };
        const proposalHash = computeProposalHash(proposalPayload);

        const stagedExecution = this.toolExecutionRepo.create({
          id: proposalId,
          taskId: currentTask.id,
          userId: currentTask.userId,
          toolName: step.toolName,
          status: 'PENDING_APPROVAL',
          proposalHash,
          resumeId: (validatedArgs.resumeId as string | undefined) || (currentTask.taskInput as any)?.activeResumeId,
          isConsumed: false,
          expiresAt,
          outputPayload: {
            proposalId,
            proposalHash,
            toolName: step.toolName,
            stepIndex: step.stepIndex,
            arguments: validatedArgs,
            changeSummary: step.description || `Approve ${step.toolName}`,
          },
        });
        await this.toolExecutionRepo.save(stagedExecution);

        currentTask.status = 'AWAITING_APPROVAL';
        currentTask.metadata = {
          ...currentTask.metadata,
          plan,
          workflowState,
          stepOutputs,
          activeProposal: {
            proposalId,
            proposalHash,
            toolName: step.toolName,
            resumeId: stagedExecution.resumeId,
            expiresAt: expiresAt.toISOString(),
          },
        };
        await this.taskRepo.save(currentTask);

        await this.agentService.publishEvent(currentTask.id, currentTask.conversationId, 'approval_requested', {
          taskId: currentTask.id,
          executionId: proposalId,
          proposalHash,
          toolName: step.toolName,
          resumeId: stagedExecution.resumeId,
          arguments: validatedArgs,
          sectionDiffs: {
            headline: {
              original: `Action: ${step.toolName}`,
              proposed: step.description || JSON.stringify(validatedArgs),
            },
          },
          expiresAt: expiresAt.toISOString(),
        });
        return;
      }

      let reservationKey: string | null = null;
      if (tool.creditCost > 0) {
        try {
          const res = await this.creditsService.reserveCredits(
            currentTask.userId,
            tool.creditCost,
            currentTask.id,
            step.stepIndex,
          );
          reservationKey = res.reservationKey;
        } catch (err: any) {
          step.status = 'FAILED';
          const isSpendingCap = typeof err?.message === 'string' && err.message.includes('spending limit exceeded');
          currentTask.status = isSpendingCap ? 'FAILED' : 'AWAITING_CREDITS';
          currentTask.metadata = { ...currentTask.metadata, plan, workflowState, stepOutputs };
          await this.taskRepo.save(currentTask);
          await this.agentService.publishEvent(currentTask.id, currentTask.conversationId, 'task_failed', {
            taskId: currentTask.id,
            status: currentTask.status,
            error: err.message,
            reason: isSpendingCap ? 'TASK_SPENDING_LIMIT_EXCEEDED' : 'INSUFFICIENT_CREDITS',
          });
          return;
        }
      }

      let lastStepError: string | undefined;
      try {
        const context = {
          userId: currentTask.userId,
          taskId: currentTask.id,
          conversationId: currentTask.conversationId,
          activeResumeId: (currentTask.taskInput as any)?.activeResumeId,
        };

        const result = await this.executeToolWithTransientRetry(tool, context, validatedArgs);

        if (!result.success) {
          if (reservationKey) {
            await this.creditsService.releaseReservation(reservationKey, result.error);
          }
          step.status = 'FAILED';
          lastStepError = result.error || `Tool ${step.toolName} returned failure`;
          currentTask.metadata = {
            ...currentTask.metadata,
            plan,
            workflowState,
            stepOutputs,
            lastError: lastStepError,
          };
          await this.taskRepo.save(currentTask);

          await this.agentService.publishEvent(currentTask.id, currentTask.conversationId, 'step_progress', {
            taskId: currentTask.id,
            stepIndex: step.stepIndex,
            toolName: step.toolName,
            status: 'FAILED',
            error: result.error,
          });
        } else {
          if (reservationKey) {
            await this.creditsService.commitReservation(reservationKey);
          }
          step.status = 'COMPLETED';
          stepOutputs[String(step.stepIndex)] = result.data;
          this.captureWorkflowState(step.toolName, result.data, currentTask, workflowState, result.metadata);

          currentTask.metadata = {
            ...currentTask.metadata,
            plan,
            workflowState,
            stepOutputs,
          };
          await this.taskRepo.save(currentTask);

          await this.agentService.publishEvent(currentTask.id, currentTask.conversationId, 'step_progress', {
            taskId: currentTask.id,
            stepIndex: step.stepIndex,
            toolName: step.toolName,
            status: 'COMPLETED',
            data: result.data,
          });

          // Check if proposal generated requiring human approval (e.g. propose_resume_edits)
          if (step.toolName === 'propose_resume_edits' && (result.data as any)?.proposalHash) {
            const proposalData = result.data as any;
            currentTask.status = 'AWAITING_APPROVAL';
            currentTask.metadata = {
              ...currentTask.metadata,
              plan,
              workflowState,
              stepOutputs,
              activeProposal: {
                proposalId: proposalData.proposalId,
                proposalHash: proposalData.proposalHash,
                resumeId: proposalData.resumeId,
                expectedResumeVersion: proposalData.expectedResumeVersion,
                expiresAt: proposalData.expiresAt,
              },
            };
            await this.taskRepo.save(currentTask);

            const proposalMessageText = this.buildProposalIntroMessage(proposalData, workflowState);
            const proposalMsg = this.messageRepo.create({
              conversationId: currentTask.conversationId,
              role: 'assistant',
              content: proposalMessageText,
            });
            await this.messageRepo.save(proposalMsg);

            await this.agentService.publishEvent(currentTask.id, currentTask.conversationId, 'approval_requested', {
              taskId: currentTask.id,
              executionId: proposalData.proposalId,
              proposalHash: proposalData.proposalHash,
              resumeId: proposalData.resumeId,
              expectedResumeVersion: proposalData.expectedResumeVersion,
              sectionDiffs: proposalData.sectionDiffs,
              expiresAt: proposalData.expiresAt,
              changeSummary: proposalData.changeSummary,
            });

            // Pause execution and return; task is now AWAITING_APPROVAL
            return;
          }
        }
      } catch (err: any) {
        if (reservationKey) {
          await this.creditsService.releaseReservation(reservationKey, err.message);
        }
        step.status = 'FAILED';
        lastStepError = err.message || 'Tool execution error';
        currentTask.metadata = {
          ...currentTask.metadata,
          plan,
          workflowState,
          stepOutputs,
          lastError: lastStepError,
        };
        await this.taskRepo.save(currentTask);
        await this.agentService.publishEvent(currentTask.id, currentTask.conversationId, 'step_progress', {
          taskId: currentTask.id,
          stepIndex: step.stepIndex,
          toolName: step.toolName,
          status: 'FAILED',
          error: err.message,
        });
      }

      if (step.status === 'FAILED') {
        currentTask.status = 'FAILED';
        currentTask.metadata = {
          ...currentTask.metadata,
          plan,
          workflowState,
          stepOutputs,
          executionError: lastStepError,
        };
        await this.taskRepo.save(currentTask);
        await this.agentService.publishEvent(currentTask.id, currentTask.conversationId, 'task_failed', {
          taskId: currentTask.id,
          status: 'FAILED',
          error: lastStepError || 'Execution step failed',
        });
        return;
      }
    }

    // If all steps finished, synthesize an intelligent response grounded in actual tool outputs
    const summaryContent = await this.synthesizeCompletionResponse(currentTask, plan, workflowState);

    currentTask.status = 'COMPLETED';
    currentTask.metadata = { ...currentTask.metadata, plan, workflowState, stepOutputs };
    await this.taskRepo.save(currentTask);

    const assistantMessage = this.messageRepo.create({
      conversationId: currentTask.conversationId,
      role: 'assistant',
      content: summaryContent,
    });
    await this.messageRepo.save(assistantMessage);

    await this.agentService.publishEvent(currentTask.id, currentTask.conversationId, 'task_completed', {
      taskId: currentTask.id,
      summary: summaryContent,
      messageId: assistantMessage.id,
      workflowState,
    });
  }

  private isTransientProviderError(err: any): boolean {
    const status = Number(err?.status ?? err?.statusCode ?? err?.response?.status ?? 0);
    if (status === 429 || status === 503 || status === 504) {
      return true;
    }
    const msg = String(err?.message || '');
    return /\b(429|503|504)\b|rate limit|service unavailable|timed?\s*out|econnreset|etimedout/i.test(
      msg,
    );
  }

  private async executeToolWithTransientRetry(
    tool: { name: string; timeoutMs?: number; execute: (context: any, args: Record<string, any>) => Promise<any> },
    context: Record<string, any>,
    args: Record<string, any>,
  ): Promise<any> {
    const maxAttempts = 2;
    const baseDelayMs = process.env.NODE_ENV === 'test' || process.env.VITEST ? 25 : 400;
    const timeoutMs = tool.timeoutMs || 15000;
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let timeoutTimer: NodeJS.Timeout | null = null;
      try {
        const runPromise =
          typeof (this.toolRegistry as any)?.executeTool === 'function'
            ? this.toolRegistry.executeTool(tool.name, context as any, args)
            : Promise.race([
                tool.execute(context, args),
                new Promise<never>((_, reject) => {
                  timeoutTimer = setTimeout(
                    () => reject(new Error(`Tool execution timeout exceeded (${timeoutMs}ms) for tool '${tool.name}'`)),
                    timeoutMs,
                  );
                }),
              ]);
        return await runPromise;
      } catch (err: any) {
        lastError = err;
        if (attempt < maxAttempts && this.isTransientProviderError(err)) {
          this.logger.warn(
            `Transient error in tool '${tool.name}' (attempt ${attempt}/${maxAttempts}): ${err?.message}. Retrying...`,
          );
          await new Promise((resolve) => setTimeout(resolve, baseDelayMs * attempt));
          continue;
        }
        throw err;
      } finally {
        if (timeoutTimer) {
          clearTimeout(timeoutTimer);
        }
      }
    }

    throw lastError;
  }

  private resolveStepArguments(
    toolName: string,
    rawArgs: Record<string, any>,
    task: AgentTask,
    workflowState: Record<string, any>,
    taskContext: Record<string, any>,
  ): Record<string, any> {
    const args: Record<string, any> = { ...rawArgs };
    delete args.userId;

    const activeResumeId = (task.taskInput as any)?.activeResumeId || taskContext.activeResumeId;
    const job = workflowState.selectedJob || {};
    const toolDef = this.toolRegistry.getTool(toolName);
    const props = (toolDef?.inputSchema as any)?.properties;
    const acceptsResumeId = !props || Object.prototype.hasOwnProperty.call(props, 'resumeId');

    if (activeResumeId && !args.resumeId && acceptsResumeId) {
      args.resumeId = activeResumeId;
    }

    if (toolName === 'match_job_description') {
      if (!args.jobDescriptionId && job.jobDescriptionId) args.jobDescriptionId = job.jobDescriptionId;
      if (!args.jobDescriptionText && job.descriptionText) args.jobDescriptionText = job.descriptionText;
      if ((!args.jobTitle || args.jobTitle === 'Target Role' || args.jobTitle === 'Software Engineer') && job.title) {
        args.jobTitle = job.title;
      }
      if ((!args.companyName || args.companyName === 'Target Company') && job.company) {
        args.companyName = job.company;
      }
      if (!args.jobDescriptionId && !args.jobDescriptionText && (args.jobTitle || args.companyName)) {
        args.jobDescriptionText = `${args.jobTitle || 'Role'} at ${args.companyName || 'Company'}`;
      }
    } else if (toolName === 'save_job_to_tracker') {
      if ((!args.title || args.title === 'Software Engineer') && job.title) args.title = job.title;
      if ((!args.company || args.company === 'Target Company') && job.company) args.company = job.company;
      if (!args.location && job.location) args.location = job.location;
      if (!args.applyUrl && job.applyUrl) args.applyUrl = job.applyUrl;
      if (!args.descriptionText && job.descriptionText) args.descriptionText = job.descriptionText;
    } else if (toolName === 'propose_resume_edits') {
      if ((!args.targetRole || args.targetRole === 'Software Engineer') && job.title) {
        args.targetRole = job.title;
      }
      if (!args.targetJobDescription && job.descriptionText) {
        args.targetJobDescription = job.descriptionText;
      }
    } else if (toolName === 'generate_cover_letter') {
      if ((!args.targetRole || args.targetRole === 'Target Role' || args.targetRole === 'Software Engineer') && job.title) {
        args.targetRole = job.title;
      }
      if ((!args.companyName || args.companyName === 'Target Company') && job.company) {
        args.companyName = job.company;
      }
      if (!args.jobDescriptionText && job.descriptionText) {
        args.jobDescriptionText = job.descriptionText;
      }
      if (!args.tone && taskContext.tone) {
        args.tone = taskContext.tone;
      }
    } else if (toolName === 'start_interview_session') {
      if ((!args.targetRole || args.targetRole === 'Software Engineer') && job.title) {
        args.targetRole = job.title;
      }
      if (!args.jobDescriptionId && job.jobDescriptionId) args.jobDescriptionId = job.jobDescriptionId;
      if (!args.jobDescriptionText && job.descriptionText) args.jobDescriptionText = job.descriptionText;
    }

    return args;
  }

  private extractAtsIssues(payload: Record<string, any>): string[] {
    const out: string[] = [];
    const pushItem = (item: unknown) => {
      const text =
        typeof item === 'string'
          ? item.trim()
          : item && typeof item === 'object'
            ? String((item as any).message || (item as any).title || (item as any).suggestion || (item as any).recommendation || '').trim()
            : '';
      if (text && !out.includes(text)) {
        out.push(text);
      }
    };

    if (Array.isArray(payload.issues)) {
      payload.issues.forEach(pushItem);
    }
    if (Array.isArray(payload.recommendations)) {
      payload.recommendations.forEach(pushItem);
    }
    if (Array.isArray(payload.findings)) {
      payload.findings.forEach(pushItem);
    } else if (payload.findings && typeof payload.findings === 'object') {
      if (Array.isArray(payload.findings.parserRisks)) {
        payload.findings.parserRisks.forEach(pushItem);
      }
      if (Array.isArray(payload.findings.bulletQuality)) {
        for (const b of payload.findings.bulletQuality) {
          if (b && b.xyzCompliant === false && b.feedback) {
            pushItem(b.feedback);
          }
        }
      }
    }
    return out;
  }

  private captureWorkflowState(
    toolName: string,
    data: unknown,
    task: AgentTask,
    workflowState: Record<string, any>,
    metadata?: Record<string, any>,
  ): void {
    const payload = (data || {}) as Record<string, any>;
    const meta = (metadata || {}) as Record<string, any>;

    if (toolName === 'search_discovered_jobs' && Array.isArray(payload.jobs) && payload.jobs.length > 0) {
      const instruction = String((task.taskInput as any)?.content || '').toLowerCase();
      // Preserve explicit company match if mentioned in user instruction; otherwise top-ranked job
      const preferred =
        payload.jobs.find(
          (j: any) =>
            typeof j?.company === 'string' &&
            j.company.length > 1 &&
            instruction.includes(j.company.toLowerCase()),
        ) || payload.jobs[0];

      workflowState.discoveredJobsCount = payload.jobs.length;
      if (preferred) {
        workflowState.selectedJob = {
          id: preferred.id,
          title: preferred.title,
          company: preferred.company,
          location: preferred.location,
          workplace: preferred.workplace,
          applyUrl: preferred.applyUrl,
          descriptionText: preferred.descriptionText || preferred.descriptionSnippet || `${preferred.title} at ${preferred.company}`,
        };
      }
    } else if (toolName === 'match_job_description') {
      workflowState.lastMatch = {
        jobMatchId: payload.jobMatchId,
        overallScore: payload.overallScore,
        missingHardSkills: payload.missingHardSkills,
      };
    } else if (toolName === 'save_job_to_tracker') {
      workflowState.savedApplication = {
        applicationId: payload.applicationId,
        company: payload.company,
        role: payload.role,
        alreadyTracked: payload.alreadyTracked,
      };
    } else if (toolName === 'generate_cover_letter') {
      workflowState.coverLetter = {
        coverLetterId: payload.coverLetterId,
        title: payload.title,
        companyName: payload.companyName,
        targetRole: payload.targetRole,
      };
    } else if (toolName === 'start_interview_session') {
      workflowState.interviewSession = {
        sessionId: payload.sessionId,
        targetRole: payload.targetRole,
        firstQuestion: payload.firstQuestion,
      };
    } else if (toolName === 'run_ats_audit') {
      const normalizedIssues = this.extractAtsIssues(payload);
      workflowState.atsAudit = {
        overallScore: payload.overallScore ?? payload.atsScore ?? payload.score,
        issues: normalizedIssues,
        recommendations: Array.isArray(payload.recommendations) ? payload.recommendations : normalizedIssues,
        wordCount: payload.wordCount ?? payload.findings?.wordCount,
        summary: payload.summary,
      };
    } else if (toolName === 'generate_bullet_variations') {
      workflowState.bulletVariations = {
        originalBullet: payload.originalBullet,
        rewrittenBullet: payload.rewrittenBullet,
        variants: Array.isArray(payload.variants) ? payload.variants : [],
      };
    } else if (toolName === 'create_resume') {
      workflowState.createdResume = {
        resumeId: payload.resumeId || payload.id,
        name: payload.name,
      };
    } else if (toolName === 'read_resume') {
      // ReadResumeTool returns data = resume.content and metadata = { resumeId, name, version, templateKey }
      const contentObj = payload.content && typeof payload.content === 'object' ? payload.content : payload;
      const expArr = Array.isArray(contentObj.experience) ? contentObj.experience : [];
      const skillArr = Array.isArray(contentObj.skills) ? contentObj.skills : [];
      const projArr = Array.isArray(contentObj.projects) ? contentObj.projects : [];
      workflowState.readResume = {
        resumeId: meta.resumeId || payload.resumeId || payload.id,
        name: meta.name || payload.name || contentObj.contact?.fullName || 'Your Resume',
        fullName: contentObj.contact?.fullName,
        headline: contentObj.headline,
        summary: typeof contentObj.summary === 'string' ? contentObj.summary.slice(0, 400) : undefined,
        experienceCount: expArr.length,
        skillsCount: skillArr.length,
        skills: skillArr.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean).slice(0, 25),
        experiencePreview: expArr.slice(0, 3).map((e: any) => ({
          title: e?.title,
          company: e?.company,
          bullets: Array.isArray(e?.bullets) ? e.bullets.slice(0, 3) : [],
        })),
        projectsPreview: projArr.slice(0, 3).map((p: any) => ({
          name: p?.name,
          technologies: p?.technologies,
        })),
      };
    } else if (toolName === 'read_resume_versions') {
      workflowState.resumeVersions = Array.isArray(payload.versions)
        ? payload.versions.slice(0, 5)
        : [];
    } else if (toolName === 'read_career_profile') {
      workflowState.careerProfile = {
        headline: payload.headline,
        location: payload.location,
        skillsCount: Array.isArray(payload.skills) ? payload.skills.length : 0,
      };
    } else if (toolName === 'update_career_profile') {
      workflowState.profileUpdated = {
        updatedFields: payload.updatedFields || [],
        totalSkills: payload.totalSkills,
      };
    }
  }

  private buildProposalIntroMessage(
    proposalData: Record<string, any>,
    workflowState: Record<string, any>,
  ): string {
    const diffs = proposalData.sectionDiffs || {};
    const changedSections: string[] = [];
    if (diffs.headline?.proposed && diffs.headline.proposed.trim() !== (diffs.headline.original || '').trim()) {
      changedSections.push('**Headline**');
    }
    if (diffs.summary?.proposed && diffs.summary.proposed.trim() !== (diffs.summary.original || '').trim()) {
      changedSections.push('**Summary**');
    }
    const bulletChanges = Array.isArray(diffs.experience)
      ? diffs.experience.reduce(
          (acc: number, exp: any) =>
            acc +
            (Array.isArray(exp?.bulletDiffs)
              ? exp.bulletDiffs.filter(
                  (b: any) => (b?.proposed || '').trim() !== (b?.original || '').trim(),
                ).length
              : 0),
          0,
        )
      : 0;
    if (bulletChanges > 0) {
      changedSections.push(`**${bulletChanges} Experience Bullet${bulletChanges === 1 ? '' : 's'}**`);
    }
    const addedSkills = Array.isArray(diffs.skills?.addedSkills) ? diffs.skills.addedSkills : [];
    if (addedSkills.length > 0) {
      changedSections.push(`**${addedSkills.length} New Skill${addedSkills.length === 1 ? '' : 's'}** (${addedSkills.slice(0, 5).join(', ')})`);
    }

    const parts: string[] = [];
    if (workflowState.atsAudit?.overallScore !== undefined) {
      parts.push(`**Current ATS Score:** ${workflowState.atsAudit.overallScore}/100.`);
    }
    if (changedSections.length > 0) {
      parts.push(
        `I've prepared proposed edits across ${changedSections.join(', ')}. Review the diff card below and click **Review & Approve** to apply them to your live resume canvas (nothing is modified until you approve).`,
      );
    } else {
      parts.push(
        `I've prepared a proposal for your review below. Click **Review & Approve** to apply or **Reject** with feedback to refine it.`,
      );
    }
    return parts.join('\n\n');
  }

  private async synthesizeCompletionResponse(
    task: AgentTask,
    plan: AgentPlan,
    workflowState: Record<string, any>,
  ): Promise<string> {
    const userInstruction = String((task.taskInput as any)?.content || plan.goal || '').trim();
    const fallback = this.buildCompletionSummary(plan, workflowState);

    if (
      !this.geminiProvider ||
      process.env.NODE_ENV === 'test' ||
      process.env.VITEST
    ) {
      return fallback;
    }

    try {
      const compactState = JSON.stringify(workflowState).slice(0, 5000);
      const response = await this.geminiProvider.callGeminiWithFunctions(
        [
          {
            role: 'user',
            parts: [
              {
                text: `User's request: "${userInstruction}"\n\nExecuted tools: ${plan.steps.map((s) => s.toolName).join(', ')}\n\nVerified Tool Results (JSON):\n${compactState}\n\nRespond directly and helpfully to the user's request in clear, concise Markdown using ONLY the verified tool results above.`,
              },
            ],
          },
        ],
        undefined,
        {
          systemInstruction:
            'You are HyperResume\'s AI Career Agent. Give a direct, specific, actionable Markdown response grounded strictly in the candidate\'s real resume and tool outputs. Quote exact details (ATS score, specific weak areas, headline, skills, or roles) when present. Never invent metrics or fake experience. If the user asked for advice on improving their resume, give concrete resume-specific changes and offer to apply them with a single prompt. NEVER say robotic filler like "I\'ve finished executing your request" or "All steps have been verified."',
          temperature: 0.3,
        },
      );

      const text = response.text?.trim();
      if (text && text.length > 20) {
        // Emit lightweight streaming chunks so live streaming UI updates smoothly
        const words = text.split(/(\s+)/);
        const chunkSize = Math.max(12, Math.ceil(words.length / 4));
        for (let i = 0; i < words.length; i += chunkSize) {
          const chunk = words.slice(i, i + chunkSize).join('');
          if (chunk) {
            await this.agentService.publishEvent(task.id, task.conversationId, 'message_chunk', {
              taskId: task.id,
              chunk,
            });
          }
        }
        return text;
      }
    } catch (err: any) {
      this.logger.warn(`Post-tool response synthesis fell back to structured summary: ${err?.message}`);
    }

    return fallback;
  }

  private buildCompletionSummary(plan: AgentPlan, workflowState: Record<string, any>): string {
    const highlights: string[] = [];

    if (workflowState.atsAudit && workflowState.atsAudit.overallScore !== undefined) {
      const score = workflowState.atsAudit.overallScore;
      const issueList = Array.isArray(workflowState.atsAudit.issues)
        ? workflowState.atsAudit.issues
        : [];
      const topIssues = issueList
        .slice(0, 5)
        .map((i: any) => `- ${typeof i === 'string' ? i : i.message || i.title || i.suggestion || JSON.stringify(i)}`)
        .join('\n');
      highlights.push(
        `### ATS Audit Complete — Score: **${score}/100**${topIssues ? `\n\n**Top Findings & Recommendations:**\n${topIssues}` : ''}`,
      );
    }
    if (workflowState.bulletVariations?.rewrittenBullet) {
      const variants = (Array.isArray(workflowState.bulletVariations.variants)
        ? workflowState.bulletVariations.variants
        : []
      )
        .slice(0, 3)
        .map((v: any) => `- **${v.style || 'Variant'}:** ${v.bullet || v}`)
        .join('\n');
      highlights.push(
        `### Rewritten Bullet\n> ${workflowState.bulletVariations.rewrittenBullet}${variants ? `\n\n**Alternatives:**\n${variants}` : ''}`,
      );
    }
    if (workflowState.createdResume?.resumeId) {
      highlights.push(
        `Created new resume **"${workflowState.createdResume.name || 'Tailored Resume'}"**.`,
      );
    }
    if (workflowState.selectedJob?.title) {
      highlights.push(
        `**Target Role:** ${workflowState.selectedJob.title}${workflowState.selectedJob.company ? ` at ${workflowState.selectedJob.company}` : ''}${workflowState.discoveredJobsCount ? ` (selected from ${workflowState.discoveredJobsCount} live matches)` : ''}.`,
      );
    }
    if (workflowState.lastMatch?.overallScore !== undefined) {
      const missing = Array.isArray(workflowState.lastMatch.missingHardSkills)
        ? workflowState.lastMatch.missingHardSkills.slice(0, 5)
        : [];
      highlights.push(
        `**Resume Match Score:** ${workflowState.lastMatch.overallScore}%${missing.length > 0 ? ` — Missing keywords: ${missing.join(', ')}` : ''}.`,
      );
    }
    if (workflowState.savedApplication?.applicationId) {
      highlights.push(
        workflowState.savedApplication.alreadyTracked
          ? 'Role was already saved in your Application Tracker.'
          : 'Saved role to your Application Tracker.',
      );
    }
    if (workflowState.coverLetter?.coverLetterId) {
      highlights.push(
        `Drafted cover letter **"${workflowState.coverLetter.title || workflowState.coverLetter.targetRole}"** — ready to review in Cover Letter Studio.`,
      );
    }
    if (workflowState.interviewSession?.sessionId) {
      const q = workflowState.interviewSession.firstQuestion?.questionText;
      highlights.push(
        q
          ? `**Interview Session Ready.** First question:\n> "${q}"`
          : 'Interview practice session initialized and ready to begin.',
      );
    }
    if (workflowState.profileUpdated?.updatedFields?.length) {
      highlights.push(
        `Updated your Career Vault profile (${workflowState.profileUpdated.updatedFields.join(', ')}).`,
      );
    }
    if (highlights.length === 0 && workflowState.readResume) {
      const r = workflowState.readResume;
      const skillPreview = Array.isArray(r.skills) && r.skills.length > 0 ? ` (${r.skills.slice(0, 8).join(', ')})` : '';
      highlights.push(
        `Reviewed **"${r.name || 'Your Resume'}"**${r.headline ? ` — *${r.headline}*` : ''}: **${r.experienceCount ?? 0} experience roles** and **${r.skillsCount ?? 0} skills**${skillPreview}.\n\nTell me if you'd like me to **run an ATS audit**, **propose edits to boost your ATS score**, **add relevant skills**, or **tailor it for a specific role**.`,
      );
    }
    if (highlights.length === 0 && workflowState.careerProfile) {
      highlights.push(
        `Reviewed your Career Vault profile (${workflowState.careerProfile.headline || 'No headline set yet'}, ${workflowState.careerProfile.skillsCount || 0} skills). Tell me what role you are targeting and I can tailor your resume or find matching jobs.`,
      );
    }

    if (highlights.length > 0) {
      return highlights.join('\n\n');
    }
    return `Completed **${plan.goal}**. Tell me what you'd like to improve next — for example, *"Audit my resume for ATS score"*, *"Add more relevant skills"*, or *"Rewrite my experience bullets with stronger impact."*`;
  }

  async approveAndApplyProposal(
    taskId: string,
    executionId: string,
    clientProposalHash: string,
    userId: string,
    acceptedFieldPaths?: string[],
  ): Promise<{ success: boolean; newVersion: number; resumed?: boolean }> {
    return this.dataSource.transaction(async (manager) => {
      // 1. Pessimistic lock on execution record (strict AND binding: executionId + taskId + userId)
      const execution = await manager.findOne(AgentToolExecution, {
        where: { id: executionId, taskId, userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!execution) {
        throw new NotFoundException('Staged proposal not found or does not belong to authenticated user');
      }

      if (execution.isConsumed) {
        throw new ConflictException('Staged proposal has already been consumed (single-use invariant)');
      }

      if (execution.status !== 'PENDING_APPROVAL') {
        throw new BadRequestException(`Staged proposal is not awaiting approval (current status: ${execution.status})`);
      }

      if (execution.expiresAt && new Date() > execution.expiresAt) {
        throw new GoneException('Staged proposal has expired (15-minute window exceeded)');
      }

      if (execution.proposalHash !== clientProposalHash) {
        throw new ForbiddenException('Cryptographic proposal hash mismatch: proposal payload was altered');
      }

      const serverPayload = (execution.outputPayload || {}) as any;

      // Support generic approval-gated tools (e.g. restore_resume_version, update_career_profile)
      if (execution.toolName && execution.toolName !== 'propose_resume_edits') {
        execution.isConsumed = true;
        execution.status = 'APPROVED';
        execution.approvedAt = new Date();
        await manager.save(execution);

        const execResult = await this.toolRegistry.executeTool(
          execution.toolName,
          {
            userId,
            taskId,
            conversationId: '',
            activeResumeId: execution.resumeId || undefined,
          },
          serverPayload.arguments || {},
        );
        if (!execResult.success) {
          throw new BadRequestException(execResult.error || `Failed to execute approved action ${execution.toolName}`);
        }

        const task = await manager.findOne(AgentTask, { where: { id: taskId, userId } });
        const plan = task?.metadata?.plan as AgentPlan | undefined;
        if (plan?.steps && typeof serverPayload.stepIndex === 'number' && plan.steps[serverPayload.stepIndex]) {
          plan.steps[serverPayload.stepIndex].status = 'COMPLETED';
        }
        const hasRemainingSteps = Boolean(plan?.steps?.some((s) => s.status === 'PENDING'));

        if (task) {
          task.status = hasRemainingSteps ? 'PENDING' : 'COMPLETED';
          if (hasRemainingSteps) {
            task.leaseToken = null;
            task.heartbeatAt = null;
          }
          task.metadata = { ...task.metadata, plan, activeProposal: null };
          await manager.save(task);

          if (!hasRemainingSteps) {
            const msg = manager.create(AgentMessage, {
              conversationId: task.conversationId,
              role: 'assistant',
              content: `Approved and completed **${execution.toolName.replace(/_/g, ' ')}**.`,
            });
            await manager.save(msg);
          }

          await this.agentService.publishEvent(
            taskId,
            task.conversationId,
            hasRemainingSteps ? 'task_status' : 'task_completed',
            {
              taskId,
              status: hasRemainingSteps ? 'RUNNING' : 'COMPLETED',
              message: `Approved ${execution.toolName} executed successfully`,
            },
            manager,
          );
        }

        return { success: true, newVersion: (execResult.data as any)?.newVersion || 1, resumed: hasRemainingSteps };
      }

      if (!execution.resumeId) {
        throw new BadRequestException('Proposal does not specify a target resume');
      }

      // 2. Pessimistic lock on target Resume
      const resume = await manager.findOne(Resume, {
        where: { id: execution.resumeId, userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!resume) {
        throw new NotFoundException('Target resume not found');
      }

      if (
        execution.expectedResumeVersion !== null &&
        execution.expectedResumeVersion !== undefined &&
        resume.version !== execution.expectedResumeVersion
      ) {
        throw new ConflictException(
          `Resume was modified (version ${resume.version}) after proposal was formulated (version ${execution.expectedResumeVersion}). Please re-generate proposal.`,
        );
      }

      // 3. Mark execution consumed and approved
      execution.isConsumed = true;
      execution.status = 'APPROVED';
      execution.approvedAt = new Date();
      await manager.save(execution);

      // 4. Apply server-persisted diffs to resume content (honoring optional selective acceptedFieldPaths)
      const sectionDiffs = serverPayload.sectionDiffs || {};
      const acceptedSet =
        Array.isArray(acceptedFieldPaths) && acceptedFieldPaths.length > 0
          ? new Set(acceptedFieldPaths)
          : null;
      const shouldApply = (fieldPath: string) => {
        if (!acceptedSet) return true;
        if (acceptedSet.has(fieldPath)) return true;
        // Support both dot notation (experience.0.bullets.1) and bracket notation (experience[0].bullets[1])
        const normalizedDot = fieldPath.replace(/\[(\d+)\]/g, '.$1');
        const normalizedBracket = normalizedDot.replace(/\.(\d+)/g, '[$1]');
        return acceptedSet.has(normalizedDot) || acceptedSet.has(normalizedBracket);
      };

      if (resume.content) {
        if (sectionDiffs.headline?.proposed && shouldApply('headline')) {
          resume.content.headline = sectionDiffs.headline.proposed;
        }
        if (sectionDiffs.summary?.proposed && shouldApply('summary')) {
          resume.content.summary = sectionDiffs.summary.proposed;
        }
        if (Array.isArray(sectionDiffs.experience) && Array.isArray(resume.content.experience)) {
          for (let expIdx = 0; expIdx < sectionDiffs.experience.length; expIdx++) {
            const expDiff = sectionDiffs.experience[expIdx];
            const targetExp = resume.content.experience[expIdx];
            if (!targetExp || !Array.isArray(expDiff?.bulletDiffs) || !Array.isArray(targetExp.bullets)) {
              continue;
            }
            for (const bDiff of expDiff.bulletDiffs) {
              const fieldPath = `experience.${expIdx}.bullets.${bDiff?.bulletIndex}`;
              if (
                typeof bDiff?.bulletIndex === 'number' &&
                typeof bDiff?.proposed === 'string' &&
                bDiff.bulletIndex >= 0 &&
                bDiff.bulletIndex < targetExp.bullets.length &&
                shouldApply(fieldPath)
              ) {
                targetExp.bullets[bDiff.bulletIndex] = bDiff.proposed;
              }
            }
          }
        }
        if (Array.isArray(sectionDiffs.skills?.proposed) && shouldApply('skills')) {
          resume.content.skills = sectionDiffs.skills.proposed;
        }
        if (Array.isArray(sectionDiffs.projects?.proposed) && shouldApply('projects')) {
          resume.content.projects = sectionDiffs.projects.proposed;
        }
      }

      resume.version = resume.version + 1;
      const updatedResume = await manager.save(resume);

      // 5. Create immutable snapshot in resume_versions
      const versionSnapshot = manager.create(ResumeVersion, {
        resumeId: resume.id,
        versionNumber: updatedResume.version,
        changeSummary: serverPayload.changeSummary || 'AI Tailored Proposal Approved',
        contentSnapshot: updatedResume.content,
      });
      await manager.save(versionSnapshot);

      // 6. Resume remaining workflow steps if any exist after this approval checkpoint;
      // otherwise mark task COMPLETED.
      const task = await manager.findOne(AgentTask, { where: { id: taskId, userId } });
      const plan = task?.metadata?.plan as AgentPlan | undefined;
      const hasRemainingSteps = Boolean(
        plan?.steps?.some((s) => s.status === 'PENDING'),
      );

      if (task) {
        if (hasRemainingSteps) {
          task.status = 'PENDING';
          task.leaseToken = null;
          task.heartbeatAt = null;
          task.metadata = {
            ...task.metadata,
            activeProposal: null,
            lastApprovedResumeVersion: updatedResume.version,
          };
        } else {
          task.status = 'COMPLETED';
          task.metadata = {
            ...task.metadata,
            activeProposal: null,
            lastApprovedResumeVersion: updatedResume.version,
          };
        }
        await manager.save(task);
      }

      if (hasRemainingSteps) {
        await this.agentService.publishEvent(
          taskId,
          task?.conversationId || execution.taskId,
          'task_status',
          {
            taskId,
            status: 'RUNNING',
            resumeId: updatedResume.id,
            newVersion: updatedResume.version,
            message: 'Approved edits applied — continuing remaining workflow steps',
          },
          manager,
        );
      } else {
        if (task?.conversationId) {
          const confirmMsg = manager.create(AgentMessage, {
            conversationId: task.conversationId,
            role: 'assistant',
            content: `Applied your approved resume changes (**v${updatedResume.version}** saved with a version snapshot).`,
          });
          await manager.save(confirmMsg);
        }
        await this.agentService.publishEvent(
          taskId,
          task?.conversationId || execution.taskId,
          'task_completed',
          {
            taskId,
            resumeId: updatedResume.id,
            newVersion: updatedResume.version,
            summary: `Applied your approved resume changes (v${updatedResume.version} saved with a version snapshot).`,
            message: 'Approved edits applied successfully',
          },
          manager,
        );
      }

      return {
        success: true,
        newVersion: updatedResume.version,
        resumed: hasRemainingSteps,
      };
    });
  }

  async rejectProposal(
    taskId: string,
    executionId: string,
    userId: string,
    clientProposalHash?: string,
    reason?: string,
  ): Promise<void> {
    const execution = await this.toolExecutionRepo.findOne({
      where: { id: executionId, taskId, userId },
    });

    if (!execution) {
      throw new NotFoundException('Staged proposal not found or does not belong to authenticated user');
    }

    if (execution.isConsumed || execution.status !== 'PENDING_APPROVAL') {
      throw new ConflictException(
        `Staged proposal can no longer be rejected (current status: ${execution.status})`,
      );
    }

    if (clientProposalHash && execution.proposalHash && execution.proposalHash !== clientProposalHash) {
      throw new ForbiddenException('Cryptographic proposal hash mismatch');
    }

    execution.status = 'REJECTED';
    execution.isConsumed = true;
    await this.toolExecutionRepo.save(execution);

    const task = await this.taskRepo.findOne({ where: { id: taskId, userId } });
    if (task) {
      task.status = 'CANCELLED';
      task.metadata = {
        ...task.metadata,
        activeProposal: null,
        rejectionReason: reason?.trim() || undefined,
      };
      await this.taskRepo.save(task);

      const rejectSummary = reason?.trim()
        ? `Proposal rejected ("${reason.trim()}"). No changes were applied to your resume.`
        : 'Proposal rejected. No changes were applied to your resume.';
      const msg = this.messageRepo.create({
        conversationId: task.conversationId,
        role: 'assistant',
        content: rejectSummary,
      });
      await this.messageRepo.save(msg);

      await this.agentService.publishEvent(taskId, task.conversationId, 'task_cancelled', {
        taskId,
        reason: rejectSummary,
      });
    }
  }
}

