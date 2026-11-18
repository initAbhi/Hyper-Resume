import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AgentTool, ToolExecutionContext, ToolResult } from './tool.interface.js';
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
   * Returns only tools that are safe to expose as model-callable function declarations.
   * STRICT SECURITY BOUNDARY:
   * State-mutating approval operations (like apply_approved_edits) are NEVER model-callable.
   */
  getModelCallableTools(): AgentTool[] {
    return this.getAll().filter((tool) => {
      // Explicit flag check if tool specifies isModelCallable === false
      if ('isModelCallable' in tool && (tool as any).isModelCallable === false) {
        return false;
      }
      // Never expose apply_approved_edits directly to an LLM
      if (tool.name === 'apply_approved_edits') {
        return false;
      }
      return true;
    });
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
   * Executes a tool with argument validation, execution timeout, and injected authenticated context.
   */
  async executeTool(
    name: string,
    context: ToolExecutionContext,
    rawArgs: unknown,
  ): Promise<ToolResult> {
    const tool = this.getOrThrow(name);

    // 1. Validate arguments
    const validation = tool.validate(rawArgs);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation error for tool '${name}': ${(validation.errors || []).join('; ')}`,
      };
    }

    // 2. Execute with timeout
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

