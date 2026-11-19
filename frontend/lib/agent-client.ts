import { apiClient, ApiError } from './api-client';

export type AgentMessageRole = 'user' | 'assistant' | 'system' | 'tool';

export type AgentTaskStatus =
  | 'PENDING'
  | 'PLANNING'
  | 'RUNNING'
  | 'AWAITING_APPROVAL'
  | 'AWAITING_CREDITS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type AgentPlanStepStatus =
  | 'PENDING'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED';

export interface AgentConversation {
  id: string;
  userId: string;
  activeResumeId?: string | null;
  title?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentMessage {
  id: string;
  conversationId: string;
  role: AgentMessageRole;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AgentPlanStep {
  stepIndex: number;
  toolName: string;
  description: string;
  inputArguments?: Record<string, unknown>;
  permissionTier?: string;
  status: AgentPlanStepStatus;
  error?: string;
}

export interface AgentPlan {
  goal: string;
  steps: AgentPlanStep[];
}

export interface EvidenceProvenance {
  sourceBulletIndex: number;
  originalEvidenceQuote: string;
  addedMetrics: string[];
  candidateConfirmationRequired: boolean;
  confirmationPrompt?: string;
}

export interface BulletDiffItem {
  bulletIndex: number;
  original: string;
  proposed: string;
  evidenceProvenance?: EvidenceProvenance;
}

export interface ExperienceSectionDiff {
  experienceIndex?: number;
  company: string;
  title: string;
  bulletDiffs: BulletDiffItem[];
  addedBullets?: string[];
}

export interface ProjectSectionDiff {
  projectIndex: number;
  name: string;
  description?: { original: string; proposed: string };
  highlightDiffs?: Array<{ highlightIndex: number; original: string; proposed: string }>;
  addedHighlights?: string[];
}

export interface SkillSectionDiff {
  original: Array<{ name: string; category?: string }>;
  proposed: Array<{ name: string; category?: string }>;
  addedSkills?: string[];
  removedSkills?: string[];
}

export interface ProposalSectionDiffs {
  headline?: { original: string; proposed: string };
  summary?: { original: string; proposed: string };
  contact?: { original: Record<string, unknown>; proposed: Record<string, unknown>; changedFields?: string[] };
  experience?: ExperienceSectionDiff[];
  projects?: ProjectSectionDiff[];
  skills?: SkillSectionDiff;
  education?: { original: unknown[]; proposed: unknown[] };
  certifications?: { original: unknown[]; proposed: unknown[] };
  customSections?: { original: unknown[]; proposed: unknown[] };
  templateKey?: { original: string; proposed: string };
  layout?: { original: Record<string, unknown>; proposed: Record<string, unknown>; changedFields?: string[] };
}

export interface AgentApprovalProposal {
  taskId: string;
  executionId: string;
  proposalHash: string;
  resumeId: string;
  expectedResumeVersion: number;
  sectionDiffs: ProposalSectionDiffs;
  beforeAtsScore?: number;
  projectedAtsScore?: number;
  expiresAt: string;
  changeSummary?: string;
}

export interface CreateConversationInput {
  activeResumeId?: string;
  title?: string;
}

export interface AgentMessageContext {
  route?: string;
  activeResumeId?: string;
  activeResumeName?: string;
  resumeDetached?: boolean;
  activeJobId?: string;
  jobTitle?: string;
  companyName?: string;
  jobDescriptionId?: string;
  jobDescriptionText?: string;
  applyUrl?: string;
  location?: string;
  workplace?: 'Remote' | 'Hybrid' | 'Onsite';
  activeApplicationId?: string;
  activeInterviewSessionId?: string;
  tone?: 'Executive' | 'Enthusiastic' | 'Technical' | 'Concise';
  focusSections?: string[];
  pinnedTargets?: PinnedAgentTarget[];
}

export interface PinnedAgentTarget {
  kind: 'section' | 'bullet' | 'job' | 'resume';
  id: string;
  label: string;
  sectionKey?: string;
  fieldPath?: string;
  excerpt?: string;
  resumeId?: string;
  jobId?: string;
  jobTitle?: string;
  companyName?: string;
}

export interface SubmitAgentMessageInput {
  content: string;
  activeResumeId?: string;
  idempotencyKey?: string;
  context?: AgentMessageContext;
}

export interface SubmitAgentMessageResponse {
  taskId: string;
  conversationId: string;
  messageId: string;
}

export interface StreamTicketResponse {
  ticket: string;
  expiresInSeconds: number;
}

export interface ApproveProposalInput {
  executionId: string;
  proposalHash: string;
  acceptedFieldPaths?: string[];
  reason?: string;
}

export interface ApproveProposalResponse {
  success: boolean;
  newVersion: number;
  resumed?: boolean;
}

export interface RejectProposalResponse {
  success: boolean;
  rejected: boolean;
}

export interface AgentTaskSummary {
  id: string;
  conversationId: string;
  userId: string;
  status: AgentTaskStatus;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgentParsedResumeAttachment {
  kind: 'resume';
  fileName: string;
  resumeId: string;
  resumeName: string;
  atsScore: number;
  topIssues: string[];
  extractedTextLength: number;
  headline?: string;
  skillsCount: number;
  experienceCount: number;
}

export interface AgentParsedJdAttachment {
  kind: 'jd';
  fileName?: string;
  jobDescriptionId: string;
  title: string;
  companyName: string;
  location?: string;
  workplace?: 'Remote' | 'Hybrid' | 'Onsite';
  applyUrl?: string;
  descriptionText: string;
  source?: string;
  extractedTextLength: number;
}

export type AgentParsedAttachment =
  | AgentParsedResumeAttachment
  | AgentParsedJdAttachment;

/**
 * Canonical normalized SSE event types covering both Phase 2 snake_case
 * emitted names and uppercase architectural equivalents.
 */
export type AgentStreamEventType =
  | 'task_status'
  | 'plan_created'
  | 'step_progress'
  | 'approval_requested'
  | 'message_chunk'
  | 'task_completed'
  | 'task_failed'
  | 'task_cancelled'
  | 'unknown';

export interface AgentStreamEvent<T = Record<string, unknown>> {
  id: string;
  type: AgentStreamEventType;
  rawType: string;
  data: T;
}

export interface TaskStatusEventData {
  taskId: string;
  status: AgentTaskStatus;
  message?: string;
}

export interface PlanCreatedEventData {
  taskId: string;
  goal: string;
  steps: AgentPlanStep[];
}

export interface StepProgressEventData {
  taskId: string;
  stepIndex: number;
  toolName: string;
  status: AgentPlanStepStatus;
  description?: string;
  data?: unknown;
  error?: string;
}

export interface MessageChunkEventData {
  taskId?: string;
  content?: string;
  chunk?: string;
}

export interface TaskCompletedEventData {
  taskId: string;
  summary?: string;
  messageId?: string;
  resumeId?: string;
  newVersion?: number;
  message?: string;
}

export interface TaskFailedEventData {
  taskId: string;
  status?: AgentTaskStatus;
  error: string;
  reason?: string;
}

export interface TaskCancelledEventData {
  taskId: string;
  reason?: string;
}

export interface EventSourceLike {
  readyState: number;
  onopen: ((ev: Event) => unknown) | null;
  onerror: ((ev: Event) => unknown) | null;
  onmessage: ((ev: MessageEvent) => unknown) | null;
  addEventListener: (type: string, listener: (ev: MessageEvent) => void) => void;
  removeEventListener: (type: string, listener: (ev: MessageEvent) => void) => void;
  close: () => void;
}

export type EventSourceConstructor = new (
  url: string,
  init?: EventSourceInit,
) => EventSourceLike;

export interface AgentStreamHandlers {
  onOpen?: () => void;
  onEvent?: (event: AgentStreamEvent) => void;
  onTaskStatus?: (data: TaskStatusEventData, eventId: string) => void;
  onPlanCreated?: (data: PlanCreatedEventData, eventId: string) => void;
  onStepProgress?: (data: StepProgressEventData, eventId: string) => void;
  onApprovalRequested?: (data: AgentApprovalProposal, eventId: string) => void;
  onMessageChunk?: (data: MessageChunkEventData, eventId: string) => void;
  onTaskCompleted?: (data: TaskCompletedEventData, eventId: string) => void;
  onTaskFailed?: (data: TaskFailedEventData, eventId: string) => void;
  onTaskCancelled?: (data: TaskCancelledEventData, eventId: string) => void;
  onUnknownEvent?: (event: AgentStreamEvent) => void;
  onReconnecting?: (attempt: number, delayMs: number) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export interface AgentStreamOptions {
  lastEventId?: string;
  taskId?: string;
  maxRetries?: number;
  baseRetryDelayMs?: number;
  maxRetryDelayMs?: number;
  EventSourceCtor?: EventSourceConstructor;
}

const KNOWN_SSE_EVENT_NAMES = [
  'heartbeat',
  'task_status',
  'plan_created',
  'step_progress',
  'approval_requested',
  'message_chunk',
  'task_completed',
  'task_failed',
  'task_cancelled',
  // Uppercase compatibility aliases
  'TASK_STARTED',
  'PLAN_CREATED',
  'STEP_STARTED',
  'STEP_COMPLETED',
  'TOOL_STARTED',
  'TOOL_COMPLETED',
  'AWAITING_APPROVAL',
  'AWAITING_CREDITS',
  'TASK_COMPLETED',
  'TASK_FAILED',
  'TASK_CANCELLED',
] as const;

export function normalizeStreamEventType(rawType: string): AgentStreamEventType {
  const lower = rawType.trim().toLowerCase();
  switch (lower) {
    case 'task_status':
    case 'task_started':
    case 'awaiting_credits':
      return 'task_status';
    case 'plan_created':
      return 'plan_created';
    case 'step_progress':
    case 'step_started':
    case 'step_completed':
    case 'tool_started':
    case 'tool_completed':
      return 'step_progress';
    case 'approval_requested':
    case 'awaiting_approval':
      return 'approval_requested';
    case 'message_chunk':
      return 'message_chunk';
    case 'task_completed':
      return 'task_completed';
    case 'task_failed':
      return 'task_failed';
    case 'task_cancelled':
      return 'task_cancelled';
    default:
      return 'unknown';
  }
}

function parseNumericSequence(id: string | undefined): bigint | null {
  if (!id || !/^\d+$/.test(id.trim())) return null;
  try {
    return BigInt(id.trim());
  } catch {
    return null;
  }
}

export class AgentStreamConnection {
  private eventSource: EventSourceLike | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isDisposed = false;
  private isTerminal = false;
  private retryAttempt = 0;
  private lastEventId: string | undefined;
  private readonly expectedTaskId: string | undefined;
  private highestNumericSeq: bigint | null = null;
  private readonly seenNonNumericIds = new Set<string>();
  private readonly maxRetries: number;
  private readonly baseRetryDelayMs: number;
  private readonly maxRetryDelayMs: number;
  private readonly EventSourceCtor: EventSourceConstructor | undefined;

  constructor(
    private readonly client: AgentApiClient,
    private readonly conversationId: string,
    private readonly handlers: AgentStreamHandlers,
    options: AgentStreamOptions = {},
  ) {
    this.lastEventId = options.lastEventId;
    this.expectedTaskId = options.taskId;
    this.highestNumericSeq = parseNumericSequence(options.lastEventId);
    this.maxRetries = options.maxRetries ?? 8;
    this.baseRetryDelayMs = options.baseRetryDelayMs ?? 1000;
    this.maxRetryDelayMs = options.maxRetryDelayMs ?? 10000;
    this.EventSourceCtor =
      options.EventSourceCtor ??
      (typeof window !== 'undefined' && typeof window.EventSource !== 'undefined'
        ? (window.EventSource as unknown as EventSourceConstructor)
        : typeof EventSource !== 'undefined'
          ? (EventSource as unknown as EventSourceConstructor)
          : undefined);
  }

  public getLastEventId(): string | undefined {
    return this.lastEventId;
  }

  public isActive(): boolean {
    return !this.isDisposed && !this.isTerminal;
  }

  public async connect(): Promise<void> {
    if (this.isDisposed) return;

    this.clearReconnectTimer();
    this.closeCurrentSource();

    if (!this.EventSourceCtor) {
      this.handlers.onError?.(new Error('EventSource is not supported in this environment.'));
      return;
    }

    let ticketRes: StreamTicketResponse;
    try {
      // Single-use ticket kept strictly in memory; never persisted in storage
      ticketRes = await this.client.requestStreamTicket(this.conversationId);
    } catch (err) {
      if (this.isDisposed) return;
      const error = err instanceof Error ? err : new Error('Failed to obtain SSE stream ticket.');
      const isNonRetryableClientError =
        err instanceof ApiError &&
        err.statusCode >= 400 &&
        err.statusCode < 500 &&
        err.statusCode !== 408 &&
        err.statusCode !== 429;
      if (isNonRetryableClientError) {
        this.handlers.onError?.(error);
        this.handlers.onClose?.();
        return;
      }
      // Transient network/server restart error: reconnect with backoff and only emit onError if retries are exhausted
      this.scheduleReconnect(error);
      return;
    }

    if (this.isDisposed) return;

    const params = new URLSearchParams();
    params.set('ticket', ticketRes.ticket);
    if (this.lastEventId) {
      params.set('lastEventId', this.lastEventId);
    }
    if (this.expectedTaskId) {
      params.set('taskId', this.expectedTaskId);
    }

    const baseUrl = this.client.getBaseUrl().replace(/\/+$/, '');
    const streamUrl = `${baseUrl}/agent/conversations/${encodeURIComponent(this.conversationId)}/stream?${params.toString()}`;

    const es = new this.EventSourceCtor(streamUrl, { withCredentials: true });
    this.eventSource = es;

    es.onopen = () => {
      if (this.isDisposed) return;
      this.retryAttempt = 0;
      this.handlers.onOpen?.();
    };

    const handleIncoming = (rawType: string) => (ev: MessageEvent) => {
      if (this.isDisposed) return;
      this.processIncomingMessage(rawType, ev);
    };

    for (const eventName of KNOWN_SSE_EVENT_NAMES) {
      es.addEventListener(eventName, handleIncoming(eventName));
    }

    es.onmessage = (ev: MessageEvent) => {
      if (this.isDisposed) return;
      this.processIncomingMessage('message', ev);
    };

    es.onerror = () => {
      if (this.isDisposed) return;
      this.closeCurrentSource();
      if (this.isTerminal) {
        this.handlers.onClose?.();
        return;
      }
      this.scheduleReconnect();
    };
  }

  public async reconnectForNewTask(): Promise<void> {
    if (this.isDisposed) return;
    this.isTerminal = false;
    this.retryAttempt = 0;
    await this.connect();
  }

  public disconnect(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.clearReconnectTimer();
    this.closeCurrentSource();
    this.handlers.onClose?.();
  }

  private processIncomingMessage(rawEventName: string, ev: MessageEvent): void {
    if (rawEventName.trim().toLowerCase() === 'heartbeat') {
      return;
    }

    let parsedData: Record<string, unknown> = {};
    let resolvedRawType = rawEventName;
    let resolvedId = ev.lastEventId || '';

    if (typeof ev.data === 'string' && ev.data.trim().length > 0) {
      try {
        const parsed = JSON.parse(ev.data);
        if (parsed && typeof parsed === 'object') {
          // Handle defensive unwrapping if an intermediate proxy wrapped { id, type, data }
          if (
            rawEventName === 'message' &&
            typeof (parsed as Record<string, unknown>).type === 'string' &&
            typeof (parsed as Record<string, unknown>).data === 'object' &&
            (parsed as Record<string, unknown>).data !== null
          ) {
            resolvedRawType = String((parsed as Record<string, unknown>).type);
            if (!resolvedId && typeof (parsed as Record<string, unknown>).id === 'string') {
              resolvedId = String((parsed as Record<string, unknown>).id);
            }
            parsedData = (parsed as Record<string, unknown>).data as Record<string, unknown>;
          } else {
            parsedData = parsed as Record<string, unknown>;
          }
        }
      } catch {
        // Non-JSON payload safely wrapped
        parsedData = { raw: ev.data };
      }
    }

    const normalizedType = normalizeStreamEventType(resolvedRawType);

    // Duplicate & out-of-order suppression for durable sequenced events.
    // Note: Per WHATWG EventSource spec, events omitted an `id:` field (such as ephemeral
    // `message_chunk` token deltas) inherit the previous event's `ev.lastEventId`, so
    // `message_chunk` MUST bypass sequence-number deduplication to avoid being dropped.
    if (resolvedId && normalizedType !== 'message_chunk') {
      const numericSeq = parseNumericSequence(resolvedId);
      if (numericSeq !== null) {
        if (this.highestNumericSeq !== null && numericSeq <= this.highestNumericSeq) {
          return;
        }
        this.highestNumericSeq = numericSeq;
      } else {
        if (this.seenNonNumericIds.has(resolvedId)) {
          return;
        }
        this.seenNonNumericIds.add(resolvedId);
      }
      this.lastEventId = resolvedId;
    }

    const streamEvent: AgentStreamEvent = {
      id: resolvedId,
      type: normalizedType,
      rawType: resolvedRawType,
      data: parsedData,
    };

    this.handlers.onEvent?.(streamEvent);

    const incomingTaskId =
      typeof parsedData.taskId === 'string' ? parsedData.taskId : undefined;
    const isForeignTaskEvent = Boolean(
      this.expectedTaskId && incomingTaskId && incomingTaskId !== this.expectedTaskId,
    );
    if (isForeignTaskEvent) {
      return;
    }

    switch (normalizedType) {
      case 'task_status': {
        const data = parsedData as unknown as TaskStatusEventData;
        if (resolvedRawType.toUpperCase() === 'AWAITING_CREDITS' && !data.status) {
          data.status = 'AWAITING_CREDITS';
        }
        this.handlers.onTaskStatus?.(data, resolvedId);
        break;
      }
      case 'plan_created':
        this.handlers.onPlanCreated?.(parsedData as unknown as PlanCreatedEventData, resolvedId);
        break;
      case 'step_progress': {
        const data = parsedData as unknown as StepProgressEventData;
        if (!data.status) {
          const upper = resolvedRawType.toUpperCase();
          if (upper === 'STEP_STARTED' || upper === 'TOOL_STARTED') data.status = 'EXECUTING';
          if (upper === 'STEP_COMPLETED' || upper === 'TOOL_COMPLETED') data.status = 'COMPLETED';
        }
        this.handlers.onStepProgress?.(data, resolvedId);
        break;
      }
      case 'approval_requested':
        this.handlers.onApprovalRequested?.(
          parsedData as unknown as AgentApprovalProposal,
          resolvedId,
        );
        break;
      case 'message_chunk':
        this.handlers.onMessageChunk?.(parsedData as unknown as MessageChunkEventData, resolvedId);
        break;
      case 'task_completed':
        this.isTerminal = true;
        this.handlers.onTaskCompleted?.(parsedData as unknown as TaskCompletedEventData, resolvedId);
        this.closeCurrentSource();
        break;
      case 'task_failed':
        this.isTerminal = true;
        this.handlers.onTaskFailed?.(parsedData as unknown as TaskFailedEventData, resolvedId);
        this.closeCurrentSource();
        break;
      case 'task_cancelled':
        this.isTerminal = true;
        this.handlers.onTaskCancelled?.(parsedData as unknown as TaskCancelledEventData, resolvedId);
        this.closeCurrentSource();
        break;
      default:
        this.handlers.onUnknownEvent?.(streamEvent);
        break;
    }
  }

  private scheduleReconnect(lastError?: Error): void {
    if (this.isDisposed || this.isTerminal) return;

    if (this.retryAttempt >= this.maxRetries) {
      const rawMsg = lastError?.message?.trim() || '';
      const isOpaqueFetchFailure =
        !rawMsg ||
        /^failed to fetch$/i.test(rawMsg) ||
        /^load failed$/i.test(rawMsg) ||
        /networkerror/i.test(rawMsg);
      this.handlers.onError?.(
        new Error(
          isOpaqueFetchFailure
            ? 'Live updates disconnected after maximum reconnect attempts. Please retry.'
            : rawMsg,
        ),
      );
      this.handlers.onClose?.();
      return;
    }

    const delayMs = Math.min(
      this.maxRetryDelayMs,
      this.baseRetryDelayMs * Math.pow(2, this.retryAttempt),
    );
    this.retryAttempt += 1;
    this.handlers.onReconnecting?.(this.retryAttempt, delayMs);

    this.reconnectTimer = setTimeout(() => {
      if (!this.isDisposed && !this.isTerminal) {
        void this.connect();
      }
    }, delayMs);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private closeCurrentSource(): void {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {
        // Ignore close errors
      }
      this.eventSource = null;
    }
  }
}

export interface RequestExecutor {
  request: <T>(endpoint: string, options?: RequestInit) => Promise<{ data: T }>;
  getBaseUrl: () => string;
}

export class AgentApiClient {
  constructor(private readonly transport: RequestExecutor = apiClient) {}

  getBaseUrl(): string {
    return this.transport.getBaseUrl();
  }

  async createConversation(input: CreateConversationInput = {}): Promise<AgentConversation> {
    const res = await this.transport.request<AgentConversation>('/agent/conversations', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return res.data;
  }

  async listConversations(): Promise<AgentConversation[]> {
    const res = await this.transport.request<AgentConversation[]>('/agent/conversations', {
      method: 'GET',
    });
    return Array.isArray(res.data) ? res.data : [];
  }

  async getConversation(conversationId: string): Promise<AgentConversation> {
    const res = await this.transport.request<AgentConversation>(
      `/agent/conversations/${encodeURIComponent(conversationId)}`,
      { method: 'GET' },
    );
    return res.data;
  }

  async getConversationMessages(conversationId: string): Promise<AgentMessage[]> {
    const res = await this.transport.request<AgentMessage[]>(
      `/agent/conversations/${encodeURIComponent(conversationId)}/messages`,
      { method: 'GET' },
    );
    return Array.isArray(res.data) ? res.data : [];
  }

  async listConversationTasks(conversationId: string): Promise<AgentTaskSummary[]> {
    const res = await this.transport.request<AgentTaskSummary[]>(
      `/agent/conversations/${encodeURIComponent(conversationId)}/tasks`,
      { method: 'GET' },
    );
    return Array.isArray(res.data) ? res.data : [];
  }

  async updateConversation(
    conversationId: string,
    updates: { title?: string },
  ): Promise<AgentConversation> {
    const res = await this.transport.request<AgentConversation>(
      `/agent/conversations/${encodeURIComponent(conversationId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      },
    );
    return res.data;
  }

  async deleteConversation(conversationId: string): Promise<{ deleted: true }> {
    const res = await this.transport.request<{ deleted: true }>(
      `/agent/conversations/${encodeURIComponent(conversationId)}`,
      { method: 'DELETE' },
    );
    return res.data;
  }

  async submitMessage(
    conversationId: string,
    input: SubmitAgentMessageInput,
  ): Promise<SubmitAgentMessageResponse> {
    const res = await this.transport.request<SubmitAgentMessageResponse>(
      `/agent/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    );
    return res.data;
  }

  async requestStreamTicket(conversationId: string): Promise<StreamTicketResponse> {
    const res = await this.transport.request<StreamTicketResponse>(
      `/agent/conversations/${encodeURIComponent(conversationId)}/stream-ticket`,
      { method: 'POST' },
    );
    return res.data;
  }

  connectToStream(
    conversationId: string,
    handlers: AgentStreamHandlers,
    options?: AgentStreamOptions,
  ): AgentStreamConnection {
    const connection = new AgentStreamConnection(this, conversationId, handlers, options);
    void connection.connect();
    return connection;
  }

  async approveProposal(
    taskId: string,
    input: ApproveProposalInput,
  ): Promise<ApproveProposalResponse> {
    const res = await this.transport.request<ApproveProposalResponse>(
      `/agent/tasks/${encodeURIComponent(taskId)}/approve`,
      {
        method: 'POST',
        body: JSON.stringify({
          executionId: input.executionId,
          proposalHash: input.proposalHash,
          decision: 'approve',
          ...(input.acceptedFieldPaths ? { acceptedFieldPaths: input.acceptedFieldPaths } : {}),
        }),
      },
    );
    return res.data;
  }

  async rejectProposal(
    taskId: string,
    input: ApproveProposalInput,
  ): Promise<RejectProposalResponse> {
    const res = await this.transport.request<RejectProposalResponse>(
      `/agent/tasks/${encodeURIComponent(taskId)}/approve`,
      {
        method: 'POST',
        body: JSON.stringify({
          executionId: input.executionId,
          proposalHash: input.proposalHash,
          decision: 'reject',
          ...(input.reason ? { reason: input.reason } : {}),
        }),
      },
    );
    return res.data;
  }

  async cancelTask(taskId: string): Promise<AgentTaskSummary> {
    const res = await this.transport.request<AgentTaskSummary>(
      `/agent/tasks/${encodeURIComponent(taskId)}/cancel`,
      { method: 'POST' },
    );
    return res.data;
  }

  async uploadAttachment(
    file: File,
    kind: 'auto' | 'resume' | 'jd' = 'auto',
  ): Promise<AgentParsedAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    if (kind !== 'auto') {
      formData.append('kind', kind);
    }
    const res = await this.transport.request<AgentParsedAttachment>(
      '/agent/attachments/parse',
      {
        method: 'POST',
        body: formData,
      },
    );
    return res.data;
  }

  async parseJobUrl(url: string): Promise<AgentParsedJdAttachment> {
    const res = await this.transport.request<AgentParsedJdAttachment>(
      '/agent/attachments/parse-url',
      {
        method: 'POST',
        body: JSON.stringify({ url: url.trim() }),
      },
    );
    return res.data;
  }
}

export function formatAgentApprovalError(err: unknown): {
  title: string;
  message: string;
  code: 'VERSION_CONFLICT' | 'EXPIRED' | 'HASH_MISMATCH' | 'NOT_FOUND' | 'UNKNOWN';
} {
  if (err instanceof ApiError) {
    if (err.statusCode === 409) {
      return {
        title: 'Resume version conflict',
        message:
          err.message ||
          'Your resume was edited after this proposal was generated. Ask the Agent to regenerate the proposal against your latest version.',
        code: 'VERSION_CONFLICT',
      };
    }
    if (err.statusCode === 410) {
      return {
        title: 'Proposal expired',
        message:
          err.message ||
          'This proposal expired after the 15-minute approval window. Ask the Agent to generate a fresh proposal.',
        code: 'EXPIRED',
      };
    }
    if (err.statusCode === 403) {
      return {
        title: 'Integrity verification failed',
        message:
          err.message ||
          'The proposal hash could not be verified. Please discard this proposal and generate a new one.',
        code: 'HASH_MISMATCH',
      };
    }
    if (err.statusCode === 404) {
      return {
        title: 'Proposal not found',
        message: err.message || 'This staged proposal is no longer available.',
        code: 'NOT_FOUND',
      };
    }
    return {
      title: 'Unable to process approval',
      message: err.message || 'An unexpected error occurred.',
      code: 'UNKNOWN',
    };
  }

  const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
  return {
    title: 'Unable to process approval',
    message: msg,
    code: 'UNKNOWN',
  };
}

export const agentClient = new AgentApiClient();

