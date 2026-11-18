export enum ToolPermissionTier {
  READ_ONLY = 'READ_ONLY',
  AI_ANALYSIS = 'AI_ANALYSIS',
  SAFE_MUTATING = 'SAFE_MUTATING',
  STATE_MUTATING = 'STATE_MUTATING',
}

export interface ToolExecutionContext {
  readonly userId: string;
  readonly conversationId?: string;
  readonly taskId?: string;
  readonly activeResumeId?: string;
}

export interface ToolValidationResult<T = unknown> {
  readonly valid: boolean;
  readonly data?: T;
  readonly errors?: string[];
}

export interface ToolResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface AgentTool<TArgs = unknown, TResult = unknown> {
  readonly name: string;
  readonly description: string;
  readonly permissionTier: ToolPermissionTier;
  readonly requiresApproval: boolean;
  readonly creditCost: number;
  readonly timeoutMs: number;
  readonly inputSchema: Record<string, unknown>;

  validate(args: unknown): ToolValidationResult<TArgs>;
  execute(context: ToolExecutionContext, args: TArgs): Promise<ToolResult<TResult>>;
}

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const ATS_BOARD_TOKEN_REGEX = /^[a-z0-9][a-z0-9_-]{0,62}$/;

/**
 * Validates that args do not contain client-supplied or LLM-generated userId fields.
 * Throws or returns an error string if found.
 */
export function checkNoForbiddenUserId(args: unknown): string | null {
  if (typeof args === 'object' && args !== null) {
    const record = args as Record<string, unknown>;
    if ('userId' in record || 'user_id' in record) {
      return 'Security violation: userId cannot be provided in tool arguments. Authentication context is strictly authoritative.';
    }
  }
  return null;
}

