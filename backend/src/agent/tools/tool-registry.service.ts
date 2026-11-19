import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AgentTool, ToolExecutionContext, ToolPermissionTier, ToolResult } from './tool.interface.js';
import { allowlistAndSanitizeToolArgs } from './tool-security.util.js';
import { ReadResumeTool } from './definitions/read-resume.tool.js';
import { ReadResumeVersionsTool } from './definitions/read-resume-versions.tool.js';
import { SearchJobsTool } from './definitions/search-jobs.tool.js';
import { ReadCareerProfileTool } from './definitions/read-career-profile.tool.js';
import { RunAtsAuditTool } from './definitions/run-ats-audit.tool.js';
import { MatchJobTool } from './definitions/match-job.tool.js';
import { GenerateBulletsTool } from './definitions/generate-bullets.tool.js';
import { ProposeEditsTool } from './definitions/propose-edits.tool.js';
import { GenerateCoverLetterTool } from './definitions/generate-cover-letter.tool.js';
import { StartInterviewTool } from './definitions/start-interview.tool.js';
import { SaveJobTool } from './definitions/save-job.tool.js';
import { CreateResumeTool } from './definitions/create-resume.tool.js';
import { ApplyApprovedEditsTool } from './definitions/apply-edits.tool.js';
import { RestoreVersionTool } from './definitions/restore-version.tool.js';
import { UpdateCareerProfileTool } from './definitions/update-career-profile.tool.js';
import { ParseJdOrPdfTool } from './definitions/parse-jd-or-pdf.tool.js';

export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);
  private readonly tools = new Map<string, AgentTool>();

  constructor(
    readResumeTool?: ReadResumeTool,
    readResumeVersionsTool?: ReadResumeVersionsTool,
    searchJobsTool?: SearchJobsTool,
    readCareerProfileTool?: ReadCareerProfileTool,
    runAtsAuditTool?: RunAtsAuditTool,
    matchJobTool?: MatchJobTool,
    generateBulletsTool?: GenerateBulletsTool,
    proposeEditsTool?: ProposeEditsTool,
    generateCoverLetterTool?: GenerateCoverLetterTool,
    startInterviewTool?: StartInterviewTool,
    saveJobTool?: SaveJobTool,
    createResumeTool?: CreateResumeTool,
    applyApprovedEditsTool?: ApplyApprovedEditsTool,
    restoreVersionTool?: RestoreVersionTool,
    updateCareerProfileTool?: UpdateCareerProfileTool,
    parseJdOrPdfTool?: ParseJdOrPdfTool,
  ) {
    const injected = [
      readResumeTool,
      readResumeVersionsTool,
      searchJobsTool,
      readCareerProfileTool,
      runAtsAuditTool,
      matchJobTool,
      generateBulletsTool,
      proposeEditsTool,
      generateCoverLetterTool,
      startInterviewTool,
      saveJobTool,
      createResumeTool,
      applyApprovedEditsTool,
      restoreVersionTool,
      updateCareerProfileTool,
      parseJdOrPdfTool,
    ].filter(Boolean) as AgentTool[];

    for (const tool of injected) {
      this.register(tool);
    }
  }

  /**
   * Registers a tool into the registry.
   * Throws an error if a tool with the same name is already registered.
   */
  register(tool: AgentTool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Duplicate tool registration: tool '${tool.name}' is already registered`);
    }
    this.tools.set(tool.name, tool);
    this.logger.debug(`Registered agent tool: ${tool.name} [${tool.permissionTier}]`);
  }

  /**
   * Retrieves a tool by its exact catalog name.
   */
  get(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  getTool(name: string): AgentTool | undefined {
    return this.get(name);
  }

  /**
   * Retrieves a tool or throws NotFoundException if unknown.
   */
  getOrThrow(name: string): AgentTool {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new NotFoundException(`Unknown tool: '${name}' is not registered in the agent tool registry`);
    }
    return tool;
  }

  /**
   * Returns all 15 registered tools.
   */
  getAll(): AgentTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Total count of registered tools.
   */
  get count(): number {
    return this.tools.size;
  }

  /**
   * Checks whether a registered tool is explicitly allowed to be called by an LLM.
   * FAIL-CLOSED SECURITY INVARIANT:
   * - Unknown tools -> false
   * - apply_approved_edits -> ALWAYS false
   * - Any tool with isModelCallable === false -> false
   * - Any STATE_MUTATING tool without explicit isModelCallable === true -> false
   */
  isToolModelCallable(name: string): boolean {
    const tool = this.tools.get(name);
    if (!tool) return false;
    if (tool.name === 'apply_approved_edits') return false;
    if (tool.isModelCallable === false) return false;
    if (tool.permissionTier === ToolPermissionTier.STATE_MUTATING && tool.isModelCallable !== true) {
      return false;
    }
    return true;
  }

  /**
   * Returns only tools that are safe to expose as model-callable function declarations.
   * STRICT SECURITY BOUNDARY:
   * State-mutating approval operations (like apply_approved_edits) are NEVER model-callable.
   */
  getModelCallableTools(): AgentTool[] {
    return this.getAll().filter((tool) => this.isToolModelCallable(tool.name));
  }

  /**
   * Generates Gemini REST Function Declarations for all model-callable tools.
   */
  getGeminiFunctionDeclarations(): GeminiFunctionDeclaration[] {
    return this.getModelCallableTools().map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    }));
  }

  getFunctionDeclarations(): GeminiFunctionDeclaration[] {
    return this.getGeminiFunctionDeclarations();
  }

  /**
   * Executes a tool with strict isModelCallable enforcement, output tool-arg allowlisting,
   * argument validation, execution timeout, and injected authenticated context.
   */
  async executeTool(
    name: string,
    context: ToolExecutionContext,
    rawArgs: unknown,
    options?: { caller?: 'model' | 'system' },
  ): Promise<ToolResult> {
    const tool = this.getOrThrow(name);

    // 0. Enforce mandatory isModelCallable boundary for model-initiated invocations
    if (options?.caller === 'model' && !this.isToolModelCallable(name)) {
      this.logger.warn(
        `SECURITY BLOCK: Model attempted to invoke non-model-callable tool '${name}'`,
      );
      return {
        success: false,
        error: `Security violation: tool '${name}' is not model-callable and cannot be invoked directly by the AI agent.`,
      };
    }

    // 1. Strict Output Tool-Arg Allowlisting & Injection Sanitization
    const allowlistCheck = allowlistAndSanitizeToolArgs(tool, rawArgs);
    if (!allowlistCheck.valid) {
      this.logger.warn(`SECURITY BLOCK on tool '${name}': ${allowlistCheck.error}`);
      return {
        success: false,
        error: allowlistCheck.error || `Security validation failed for tool '${name}'`,
      };
    }
    if (allowlistCheck.droppedKeys.length > 0) {
      this.logger.warn(
        `Allowlist stripped unexpected argument key(s) on tool '${name}': ${allowlistCheck.droppedKeys.join(', ')}`,
      );
    }
    if (allowlistCheck.injectionSignals.length > 0) {
      this.logger.warn(
        `Neutralized prompt-injection signal(s) in tool '${name}' arguments: ${allowlistCheck.injectionSignals.join(', ')}`,
      );
    }

    // 2. Validate allowlisted arguments with tool-specific schema validator
    const validation = tool.validate(allowlistCheck.sanitizedArgs);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation error for tool '${name}': ${(validation.errors || []).join('; ')}`,
      };
    }

    // 3. Execute with timeout
    const timeoutMs = tool.timeoutMs || 10000;
    const executePromise = tool.execute(context, validation.data);

    let timeoutTimer: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<ToolResult>((_, reject) => {
      timeoutTimer = setTimeout(() => {
        reject(new Error(`Tool execution timeout exceeded (${timeoutMs}ms) for tool '${name}'`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([executePromise, timeoutPromise]);
      return result;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || `Execution failed for tool '${name}'`,
      };
    } finally {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
      }
    }
  }
}

