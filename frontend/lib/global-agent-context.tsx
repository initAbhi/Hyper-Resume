'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './auth-context';
import {
  agentClient,
  type AgentApiClient,
  type AgentApprovalProposal,
  type AgentMessage,
  type AgentMessageContext,
  type AgentPlanStep,
  type AgentStreamConnection,
  type AgentTaskStatus,
} from './agent-client';

export interface GlobalDiscoveredJobArtifact {
  id?: string;
  title: string;
  company: string;
  location?: string;
  workplace?: string;
  source?: string;
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  applyUrl?: string;
  descriptionSnippet?: string;
  descriptionText?: string;
}

export interface GlobalMatchArtifact {
  jobMatchId: string;
  overallScore: number;
  matchedKeywords: string[];
  missingHardSkills: string[];
}

export interface GlobalSavedApplicationArtifact {
  applicationId: string;
  company: string;
  role: string;
  status: string;
  alreadyTracked?: boolean;
}

export interface GlobalCoverLetterArtifact {
  coverLetterId: string;
  title: string;
  companyName: string;
  targetRole: string;
  openingParagraph?: string;
}

export interface GlobalInterviewArtifact {
  sessionId: string;
  targetRole: string;
  sessionMode?: string;
  totalQuestions?: number;
  firstQuestion?: {
    id: string;
    orderIndex: number;
    questionText: string;
  };
}

export interface GlobalWorkflowArtifacts {
  discoveredJobs: GlobalDiscoveredJobArtifact[];
  latestMatch: GlobalMatchArtifact | null;
  savedApplication: GlobalSavedApplicationArtifact | null;
  generatedCoverLetter: GlobalCoverLetterArtifact | null;
  interviewSession: GlobalInterviewArtifact | null;
}

export interface GlobalActiveTaskState {
  taskId: string;
  status: AgentTaskStatus;
  goal?: string;
  steps: AgentPlanStep[];
  statusMessage?: string | null;
  errorMessage?: string | null;
}

export interface LaunchAgentPromptOptions {
  prompt: string;
  autoSubmit?: boolean;
  context?: Partial<AgentMessageContext>;
}

export interface GlobalAgentContextValue {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  pageContext: AgentMessageContext;
  updateContext: (patch: Partial<AgentMessageContext>) => void;
  clearJobContext: () => void;
  conversations: Array<{ id: string; title?: string | null; updatedAt: string }>;
  conversationId: string | null;
  selectConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  messages: AgentMessage[];
  isLoadingHistory: boolean;
  historyError: string | null;
  draftInput: string;
  setDraftInput: (value: string) => void;
  lastSubmittedPrompt: string | null;
  inputError: string | null;
  setInputError: (value: string | null) => void;
  isSubmitting: boolean;
  activeTask: GlobalActiveTaskState | null;
  activeProposal: AgentApprovalProposal | null;
  confirmedMetricIds: Record<string, boolean>;
  toggleMetricConfirm: (metricId: string, checked: boolean) => void;
  selectedFieldPaths: Record<string, boolean>;
  toggleFieldSelect: (fieldPath: string, checked: boolean) => void;
  streamingText: string;
  connectionState: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected';
  streamError: string | null;
  isCancelling: boolean;
  artifacts: GlobalWorkflowArtifacts;
  notice: { type: 'success' | 'info' | 'error'; message: string } | null;
  dismissNotice: () => void;
  launchPrompt: (options: LaunchAgentPromptOptions) => void;
  submitMessage: (overrideContent?: string, overrideContext?: Partial<AgentMessageContext>) => Promise<void>;
  approveProposal: (
    proposal: AgentApprovalProposal,
    acceptedFieldPaths?: string[],
  ) => Promise<{ success: boolean; newVersion: number; resumed?: boolean }>;
  rejectProposal: (proposal: AgentApprovalProposal, reason?: string) => Promise<void>;
  cancelActiveTask: () => Promise<void>;
  startNewConversation: () => void;
  reconnectStream: () => void;
  reloadHistory: () => Promise<void>;
}

const EMPTY_ARTIFACTS: GlobalWorkflowArtifacts = {
  discoveredJobs: [],
  latestMatch: null,
  savedApplication: null,
  generatedCoverLetter: null,
  interviewSession: null,
};

const GlobalAgentContext = createContext<GlobalAgentContextValue | null>(null);

export function mergeAgentContext(
  prev: AgentMessageContext,
  patch: Partial<AgentMessageContext>,
): AgentMessageContext {
  const next: AgentMessageContext = { ...prev };
  let changed = false;
  for (const [key, val] of Object.entries(patch) as Array<
    [keyof AgentMessageContext, AgentMessageContext[keyof AgentMessageContext]]
  >) {
    if (val === undefined) continue;
    if (next[key] !== val) {
      (next as Record<string, unknown>)[key] = val;
      changed = true;
    }
  }
  return changed ? next : prev;
}

function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `gmsg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface GlobalAgentProviderProps {
  children: React.ReactNode;
  client?: AgentApiClient;
  overrideUserId?: string | null;
  overridePathname?: string;
}

export function GlobalAgentProvider({
  children,
  client = agentClient,
  overrideUserId,
  overridePathname,
}: GlobalAgentProviderProps) {
  if (overrideUserId !== undefined || overridePathname !== undefined) {
    return (
      <GlobalAgentProviderCore
        client={client}
        currentUserId={overrideUserId ?? null}
        pathname={overridePathname ?? '/app'}
      >
        {children}
      </GlobalAgentProviderCore>
    );
  }
  return (
    <GlobalAgentProviderWithAuth client={client}>
      {children}
    </GlobalAgentProviderWithAuth>
  );
}

function GlobalAgentProviderWithAuth({
  children,
  client,
}: {
  children: React.ReactNode;
  client: AgentApiClient;
}) {
  const auth = useAuth();
  const routerPathname = usePathname();
  return (
    <GlobalAgentProviderCore
      client={client}
      currentUserId={auth.user?.id ?? null}
      pathname={routerPathname ?? '/app'}
      onTaskCompletedRefresh={auth.refreshUser}
    >
      {children}
    </GlobalAgentProviderCore>
  );
}

function GlobalAgentProviderCore({
  children,
  client,
  currentUserId,
  pathname,
  onTaskCompletedRefresh,
}: {
  children: React.ReactNode;
  client: AgentApiClient;
  currentUserId: string | null;
  pathname: string;
  onTaskCompletedRefresh?: () => Promise<void>;
}) {

  const [isOpen, setIsOpen] = useState(false);
  const [pageContext, setPageContext] = useState<AgentMessageContext>({ route: pathname });
  const [conversations, setConversations] = useState<
    Array<{ id: string; title?: string | null; updatedAt: string }>
  >([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [draftInput, setDraftInput] = useState('');
  const [lastSubmittedPrompt, setLastSubmittedPrompt] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTask, setActiveTask] = useState<GlobalActiveTaskState | null>(null);
  const [activeProposal, setActiveProposal] = useState<AgentApprovalProposal | null>(null);
  const [confirmedMetricIds, setConfirmedMetricIds] = useState<Record<string, boolean>>({});
  const [selectedFieldPaths, setSelectedFieldPaths] = useState<Record<string, boolean>>({});
  const [streamingText, setStreamingText] = useState('');
  const [connectionState, setConnectionState] = useState<
    'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected'
  >('idle');
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [artifacts, setArtifacts] = useState<GlobalWorkflowArtifacts>(EMPTY_ARTIFACTS);
  const [notice, setNotice] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  const streamRef = useRef<AgentStreamConnection | null>(null);
  const lastEventIdRef = useRef<string | undefined>(undefined);
  const submitInFlightRef = useRef(false);
  const convIdRef = useRef<string | null>(null);
  const pageContextRef = useRef<AgentMessageContext>(pageContext);
  const loadedForUserRef = useRef<string | null>(null);
  const previousUserIdRef = useRef<string | null>(currentUserId);

  pageContextRef.current = pageContext;
  convIdRef.current = conversationId;

  // Sync route on navigation without clobbering selected job/resume context
  useEffect(() => {
    setPageContext((prev) => (prev.route === pathname ? prev : { ...prev, route: pathname }));
  }, [pathname]);

  // Strict user isolation: clear ALL in-memory state and disconnect SSE on logout or account switch
  useEffect(() => {
    if (previousUserIdRef.current !== currentUserId) {
      if (streamRef.current) {
        streamRef.current.disconnect();
        streamRef.current = null;
      }
      lastEventIdRef.current = undefined;
      loadedForUserRef.current = null;
      setIsOpen(false);
      setConversationId(null);
      setMessages([]);
      setActiveTask(null);
      setActiveProposal(null);
      setConfirmedMetricIds({});
      setStreamingText('');
      setStreamError(null);
      setHistoryError(null);
      setConnectionState('idle');
      setArtifacts(EMPTY_ARTIFACTS);
      setPageContext({ route: pathname });
      setNotice(null);
      previousUserIdRef.current = currentUserId;
    }
  }, [currentUserId, pathname]);

  // Cleanup SSE connection on provider unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.disconnect();
        streamRef.current = null;
      }
    };
  }, []);

  // Auto-dismiss transient notices
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const reloadHistory = useCallback(async () => {
    if (!currentUserId) return;
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const convList = await client.listConversations();
      setConversations(convList);
      if (convList.length > 0) {
        const latest = convList[0];
        setConversationId(latest.id);
        convIdRef.current = latest.id;
        const msgs = await client.getConversationMessages(latest.id);
        setMessages(msgs);
        const savedCtx = (latest.metadata as Record<string, unknown> | undefined)
          ?.workflowContext as Partial<AgentMessageContext> | undefined;
        if (savedCtx) {
          setPageContext((prev) => mergeAgentContext(prev, savedCtx));
        }
        // Rehydrate in-flight task across reloads (FN-18)
        if (typeof client.listConversationTasks === 'function') {
          try {
            const tasks = await client.listConversationTasks(latest.id);
            const inFlight = tasks.find((t) =>
              ['PENDING', 'PLANNING', 'RUNNING', 'AWAITING_APPROVAL'].includes(t.status),
            );
            if (inFlight) {
              const plan = (inFlight.metadata as Record<string, any> | undefined)?.plan;
              setActiveTask({
                taskId: inFlight.id,
                status: inFlight.status,
                goal: plan?.goal,
                steps: Array.isArray(plan?.steps) ? plan.steps : [],
                statusMessage:
                  inFlight.status === 'AWAITING_APPROVAL'
                    ? 'Waiting for your approval'
                    : 'Resuming task…',
              });
            }
          } catch {
            // Non-fatal fallback
          }
        }
      }
      loadedForUserRef.current = currentUserId;
    } catch (err) {
      setHistoryError(
        err instanceof Error ? err.message : 'Unable to load conversation history.',
      );
    } finally {
      setIsLoadingHistory(false);
    }
  }, [client, currentUserId]);

  // Lazy-load conversation history on first drawer open
  useEffect(() => {
    if (isOpen && currentUserId && loadedForUserRef.current !== currentUserId) {
      void reloadHistory();
    }
  }, [isOpen, currentUserId, reloadHistory]);

  const refreshMessages = useCallback(
    async (convId: string) => {
      try {
        const latest = await client.getConversationMessages(convId);
        if (convIdRef.current === convId) {
          setMessages(latest);
        }
      } catch {
        // Keep optimistic messages if sync fails
      }
    },
    [client],
  );

  const captureToolArtifact = useCallback((toolName: string, data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const payload = data as Record<string, any>;

    if (toolName === 'search_discovered_jobs' && Array.isArray(payload.jobs)) {
      const jobs: GlobalDiscoveredJobArtifact[] = payload.jobs.slice(0, 6).map((j: any) => ({
        id: j.id,
        title: j.title || 'Untitled Role',
        company: j.company || 'Company',
        location: j.location,
        workplace: j.workplace,
        source: j.source,
        matchScore: typeof j.matchScore === 'number' ? j.matchScore : undefined,
        matchedSkills: Array.isArray(j.matchedSkills) ? j.matchedSkills : undefined,
        missingSkills: Array.isArray(j.missingSkills) ? j.missingSkills : undefined,
        applyUrl: j.applyUrl,
        descriptionSnippet: j.descriptionSnippet,
        descriptionText: j.descriptionText,
      }));
      setArtifacts((prev) => ({ ...prev, discoveredJobs: jobs }));
      if (jobs[0]) {
        setPageContext((prev) =>
          prev.jobTitle
            ? prev
            : mergeAgentContext(prev, {
              activeJobId: jobs[0].id,
              jobTitle: jobs[0].title,
              companyName: jobs[0].company,
              location: jobs[0].location,
              applyUrl: jobs[0].applyUrl,
            }),
        );
      }
    } else if (toolName === 'match_job_description' && payload.jobMatchId) {
      setArtifacts((prev) => ({
        ...prev,
        latestMatch: {
          jobMatchId: String(payload.jobMatchId),
          overallScore: Number(payload.overallScore ?? 0),
          matchedKeywords: Array.isArray(payload.matchedKeywords) ? payload.matchedKeywords : [],
          missingHardSkills: Array.isArray(payload.missingHardSkills)
            ? payload.missingHardSkills
            : [],
        },
      }));
    } else if (toolName === 'save_job_to_tracker' && payload.applicationId) {
      setArtifacts((prev) => ({
        ...prev,
        savedApplication: {
          applicationId: String(payload.applicationId),
          company: String(payload.company || ''),
          role: String(payload.role || ''),
          status: String(payload.status || 'saved'),
          alreadyTracked: Boolean(payload.alreadyTracked),
        },
      }));
      setPageContext((prev) =>
        mergeAgentContext(prev, { activeApplicationId: String(payload.applicationId) }),
      );
    } else if (toolName === 'generate_cover_letter' && payload.coverLetterId) {
      setArtifacts((prev) => ({
        ...prev,
        generatedCoverLetter: {
          coverLetterId: String(payload.coverLetterId),
          title: String(payload.title || 'Cover Letter Draft'),
          companyName: String(payload.companyName || ''),
          targetRole: String(payload.targetRole || ''),
          openingParagraph:
            typeof payload.openingParagraph === 'string' ? payload.openingParagraph : undefined,
        },
      }));
    } else if (toolName === 'start_interview_session' && payload.sessionId) {
      setArtifacts((prev) => ({
        ...prev,
        interviewSession: {
          sessionId: String(payload.sessionId),
          targetRole: String(payload.targetRole || 'Target Role'),
          sessionMode: payload.sessionMode,
          totalQuestions: payload.totalQuestions,
          firstQuestion: payload.firstQuestion,
        },
      }));
      setPageContext((prev) =>
        mergeAgentContext(prev, { activeInterviewSessionId: String(payload.sessionId) }),
      );
    }
  }, []);

  const connectStream = useCallback(
    (convId: string, taskId: string) => {
      if (streamRef.current) {
        streamRef.current.disconnect();
        streamRef.current = null;
      }

      setConnectionState('connecting');
      setStreamError(null);

      streamRef.current = client.connectToStream(
        convId,
        {
          onOpen: () => {
            setConnectionState('connected');
            setStreamError(null);
          },
          onEvent: (ev) => {
            if (ev.id) {
              lastEventIdRef.current = ev.id;
            }
          },
          onTaskStatus: (data) => {
            setActiveTask((prev) => ({
              taskId: data.taskId || prev?.taskId || taskId,
              status: data.status || prev?.status || 'RUNNING',
              goal: prev?.goal,
              steps: prev?.steps || [],
              statusMessage: data.message ?? prev?.statusMessage,
              errorMessage: prev?.errorMessage,
            }));
          },
          onPlanCreated: (data) => {
            setActiveTask((prev) => ({
              taskId: data.taskId || prev?.taskId || taskId,
              status: 'RUNNING',
              goal: data.goal,
              steps: Array.isArray(data.steps) ? data.steps : [],
              statusMessage: 'Plan created',
              errorMessage: null,
            }));
          },
          onStepProgress: (data) => {
            if (data.status === 'COMPLETED' && data.data) {
              captureToolArtifact(data.toolName, data.data);
            }

            setActiveTask((prev) => {
              const currentSteps = prev?.steps ? [...prev.steps] : [];
              const existingIdx = currentSteps.findIndex((s) => s.stepIndex === data.stepIndex);
              const updatedStep: AgentPlanStep = {
                stepIndex: data.stepIndex,
                toolName: data.toolName,
                description:
                  data.description ||
                  (existingIdx >= 0 ? currentSteps[existingIdx].description : data.toolName),
                status: data.status,
                error: data.error,
              };
              if (existingIdx >= 0) {
                currentSteps[existingIdx] = { ...currentSteps[existingIdx], ...updatedStep };
              } else {
                currentSteps.push(updatedStep);
                currentSteps.sort((a, b) => a.stepIndex - b.stepIndex);
              }
              return {
                taskId: data.taskId || prev?.taskId || taskId,
                status: prev?.status === 'AWAITING_APPROVAL' ? 'AWAITING_APPROVAL' : 'RUNNING',
                goal: prev?.goal,
                steps: currentSteps,
                statusMessage: data.description ?? prev?.statusMessage,
                errorMessage: prev?.errorMessage,
              };
            });
          },
          onApprovalRequested: (proposal) => {
            setActiveTask((prev) => ({
              taskId: proposal.taskId || prev?.taskId || taskId,
              status: 'AWAITING_APPROVAL',
              goal: prev?.goal,
              steps: prev?.steps || [],
              statusMessage: 'Waiting for your approval',
              errorMessage: null,
            }));
            setConfirmedMetricIds({});
            setActiveProposal(proposal);
          },
          onMessageChunk: (data) => {
            const delta = data.chunk || data.content || '';
            if (delta) setStreamingText((prev) => prev + delta);
          },
          onTaskCompleted: (data) => {
            setActiveTask((prev) => ({
              taskId: data.taskId || prev?.taskId || taskId,
              status: 'COMPLETED',
              goal: prev?.goal || data.summary,
              steps: prev?.steps || [],
              statusMessage: data.message || 'Workflow completed',
              errorMessage: null,
            }));
            setStreamingText('');
            setConnectionState('idle');
            void refreshMessages(convId);
            if (onTaskCompletedRefresh) {
              void onTaskCompletedRefresh();
            }
          },
          onTaskFailed: (data) => {
            const isCredits =
              data.status === 'AWAITING_CREDITS' || data.reason === 'INSUFFICIENT_CREDITS';
            setActiveTask((prev) => ({
              taskId: data.taskId || prev?.taskId || taskId,
              status: isCredits ? 'AWAITING_CREDITS' : 'FAILED',
              goal: prev?.goal,
              steps: prev?.steps || [],
              statusMessage: null,
              errorMessage: data.error || 'The task encountered an error.',
            }));
            setStreamingText('');
            setConnectionState('idle');
          },
          onTaskCancelled: (data) => {
            setActiveTask((prev) => ({
              taskId: data.taskId || prev?.taskId || taskId,
              status: 'CANCELLED',
              goal: prev?.goal,
              steps: prev?.steps || [],
              statusMessage: data.reason || 'Task cancelled',
              errorMessage: null,
            }));
            setStreamingText('');
            setConnectionState('idle');
            setActiveProposal(null);
          },
          onReconnecting: () => setConnectionState('reconnecting'),
          onError: (err) => {
            setConnectionState('disconnected');
            setStreamError(err.message);
          },
          onClose: () => {
            setConnectionState((prev) => (prev === 'disconnected' ? 'disconnected' : 'idle'));
          },
        },
        { lastEventId: lastEventIdRef.current, taskId },
      );
    },
    [client, captureToolArtifact, refreshMessages, onTaskCompletedRefresh],
  );

  const updateContext = useCallback((patch: Partial<AgentMessageContext>) => {
    setPageContext((prev) => mergeAgentContext(prev, patch));
  }, []);

  const clearJobContext = useCallback(() => {
    setPageContext((prev) => ({
      route: prev.route,
      activeResumeId: prev.activeResumeId,
      activeResumeName: prev.activeResumeName,
      tone: prev.tone,
    }));
  }, []);

  const submitMessage = useCallback(
    async (overrideContent?: string, overrideContext?: Partial<AgentMessageContext>) => {
      const content = (overrideContent ?? draftInput).trim();
      if (!content) {
        setInputError('Please enter an instruction for the AI Career Assistant.');
        return;
      }
      if (content.length > 10000) {
        setInputError('Instructions must be 10,000 characters or fewer.');
        return;
      }
      if (submitInFlightRef.current) return;

      submitInFlightRef.current = true;
      setLastSubmittedPrompt(content);
      setIsSubmitting(true);
      setInputError(null);
      setStreamError(null);

      const mergedCtx = overrideContext
        ? mergeAgentContext(pageContextRef.current, overrideContext)
        : pageContextRef.current;

      if (overrideContext) {
        setPageContext(mergedCtx);
      }

      try {
        let targetConvId = convIdRef.current;
        if (!targetConvId) {
          const created = await client.createConversation({
            activeResumeId: mergedCtx.activeResumeId,
            title: mergedCtx.companyName
              ? `${mergedCtx.companyName} Career Workflow`
              : 'Career Assistant',
          });
          targetConvId = created.id;
          setConversationId(created.id);
          convIdRef.current = created.id;
        }

        const idempotencyKey = generateIdempotencyKey();
        const optimisticId = `gopt-${idempotencyKey}`;
        setMessages((prev) => [
          ...prev,
          {
            id: optimisticId,
            conversationId: targetConvId,
            role: 'user',
            content,
            createdAt: new Date().toISOString(),
          },
        ]);
        setDraftInput('');
        setStreamingText('');
        setActiveProposal(null);
        setConfirmedMetricIds({});

        const submitted = await client.submitMessage(targetConvId, {
          content,
          activeResumeId: mergedCtx.activeResumeId,
          idempotencyKey,
          context: mergedCtx,
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId ? { ...m, id: submitted.messageId || m.id } : m,
          ),
        );

        setActiveTask({
          taskId: submitted.taskId,
          status: 'PENDING',
          steps: [],
          statusMessage: 'Understanding your request',
          errorMessage: null,
        });

        connectStream(targetConvId, submitted.taskId);
      } catch (err) {
        setInputError(
          err instanceof Error ? err.message : 'Unable to send instruction. Please try again.',
        );
      } finally {
        submitInFlightRef.current = false;
        setIsSubmitting(false);
      }
    },
    [client, draftInput, connectStream],
  );

  const launchPrompt = useCallback(
    ({ prompt, autoSubmit = true, context }: LaunchAgentPromptOptions) => {
      if (context) {
        const next = mergeAgentContext(pageContextRef.current, context);
        pageContextRef.current = next;
        setPageContext(next);
      }
      setIsOpen(true);
      if (autoSubmit) {
        void submitMessage(prompt, context);
      } else {
        setDraftInput(prompt);
      }
    },
    [submitMessage],
  );

  const approveProposal = useCallback(
    async (proposal: AgentApprovalProposal, acceptedFieldPaths?: string[]) => {
      const result = await client.approveProposal(proposal.taskId, {
        executionId: proposal.executionId,
        proposalHash: proposal.proposalHash,
        acceptedFieldPaths,
      });

      setActiveProposal(null);
      setConfirmedMetricIds({});
      setSelectedFieldPaths({});

      if (result.resumed) {
        setActiveTask((prev) =>
          prev
            ? {
              ...prev,
              status: 'RUNNING',
              statusMessage: `Resume updated (v${result.newVersion}) — continuing remaining steps`,
            }
            : null,
        );
        setNotice({
          type: 'success',
          message: `Approved changes applied (v${result.newVersion}). Continuing remaining workflow steps.`,
        });
        // Ensure SSE stream is open for post-approval steps
        if (convIdRef.current && (!streamRef.current || !streamRef.current.isActive())) {
          connectStream(convIdRef.current, proposal.taskId);
        }
      } else {
        setActiveTask((prev) =>
          prev
            ? {
              ...prev,
              status: 'COMPLETED',
              statusMessage: `Applied changes (v${result.newVersion})`,
            }
            : null,
        );
        setNotice({
          type: 'success',
          message: `Approved changes applied to your resume (v${result.newVersion}).`,
        });
      }

      return result;
    },
    [client, connectStream],
  );

  const rejectProposal = useCallback(
    async (proposal: AgentApprovalProposal, reason?: string) => {
      await client.rejectProposal(proposal.taskId, {
        executionId: proposal.executionId,
        proposalHash: proposal.proposalHash,
        reason,
      });

      setActiveProposal(null);
      setConfirmedMetricIds({});
      setSelectedFieldPaths({});
      setActiveTask((prev) =>
        prev
          ? {
            ...prev,
            status: 'CANCELLED',
            statusMessage: 'Proposal rejected — your resume was not modified.',
          }
          : null,
      );
      setNotice({
        type: 'info',
        message: 'Proposal discarded. Your resume remains unchanged.',
      });
    },
    [client],
  );

  const cancelActiveTask = useCallback(async () => {
    if (!activeTask || isCancelling) return;
    setIsCancelling(true);
    try {
      await client.cancelTask(activeTask.taskId);
      setActiveTask((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
      setActiveProposal(null);
      if (streamRef.current) {
        streamRef.current.disconnect();
        streamRef.current = null;
      }
    } catch (err) {
      setStreamError(err instanceof Error ? err.message : 'Unable to cancel task.');
    } finally {
      setIsCancelling(false);
    }
  }, [activeTask, isCancelling, client]);

  const startNewConversation = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.disconnect();
      streamRef.current = null;
    }
    lastEventIdRef.current = undefined;
    setConversationId(null);
    convIdRef.current = null;
    setMessages([]);
    setActiveTask(null);
    setActiveProposal(null);
    setConfirmedMetricIds({});
    setStreamingText('');
    setStreamError(null);
    setInputError(null);
    setConnectionState('idle');
    setArtifacts(EMPTY_ARTIFACTS);
  }, []);

  const reconnectStream = useCallback(() => {
    if (convIdRef.current && activeTask?.taskId) {
      connectStream(convIdRef.current, activeTask.taskId);
    }
  }, [activeTask, connectStream]);

  const toggleMetricConfirm = useCallback((metricId: string, checked: boolean) => {
    setConfirmedMetricIds((prev) => ({ ...prev, [metricId]: checked }));
  }, []);

  const toggleFieldSelect = useCallback((fieldPath: string, checked: boolean) => {
    setSelectedFieldPaths((prev) => ({ ...prev, [fieldPath]: checked }));
  }, []);

  const selectConversation = useCallback(
    async (targetId: string) => {
      if (streamRef.current) {
        streamRef.current.disconnect();
        streamRef.current = null;
      }
      setConversationId(targetId);
      convIdRef.current = targetId;
      setActiveTask(null);
      setActiveProposal(null);
      setArtifacts(EMPTY_ARTIFACTS);
      const msgs = await client.getConversationMessages(targetId);
      setMessages(msgs);
    },
    [client],
  );

  const deleteConversation = useCallback(
    async (targetId: string) => {
      if (typeof client.deleteConversation === 'function') {
        await client.deleteConversation(targetId);
      }
      setConversations((prev) => prev.filter((c) => c.id !== targetId));
      if (convIdRef.current === targetId) {
        startNewConversation();
      }
    },
    [client, startNewConversation],
  );

  return (
    <GlobalAgentContext.Provider
      value={{
        isOpen,
        openDrawer: () => setIsOpen(true),
        closeDrawer: () => setIsOpen(false),
        toggleDrawer: () => setIsOpen((prev) => !prev),
        pageContext,
        updateContext,
        clearJobContext,
        conversations,
        conversationId,
        selectConversation,
        deleteConversation,
        messages,
        isLoadingHistory,
        historyError,
        draftInput,
        setDraftInput,
        lastSubmittedPrompt,
        inputError,
        setInputError,
        isSubmitting,
        activeTask,
        activeProposal,
        confirmedMetricIds,
        toggleMetricConfirm,
        selectedFieldPaths,
        toggleFieldSelect,
        streamingText,
        connectionState,
        streamError,
        isCancelling,
        artifacts,
        notice,
        dismissNotice: () => setNotice(null),
        launchPrompt,
        submitMessage,
        approveProposal,
        rejectProposal,
        cancelActiveTask,
        startNewConversation,
        reconnectStream,
        reloadHistory,
      }}
    >
      {children}
    </GlobalAgentContext.Provider>
  );
}

export function useGlobalAgent(): GlobalAgentContextValue {
  const ctx = useContext(GlobalAgentContext);
  if (!ctx) {
    throw new Error('useGlobalAgent must be used within a GlobalAgentProvider');
  }
  return ctx;
}

export function useOptionalGlobalAgent(): GlobalAgentContextValue | null {
  return useContext(GlobalAgentContext);
}
