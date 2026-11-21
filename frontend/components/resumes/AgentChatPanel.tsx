'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowUpRight,
  Bot,
  Briefcase,
  History,
  Loader2,
  Mail,
  Mic,
  PanelLeftClose,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Target,
  Trash2,
  User as UserIcon,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import {
  agentClient,
  type AgentApiClient,
  type AgentApprovalProposal,
  type AgentConversation,
  type AgentMessage,
  type AgentPlanStep,
  type AgentStreamConnection,
  type AgentTaskStatus,
} from '@/lib/agent-client';
import { AgentTaskProgress } from './AgentTaskProgress';
import { AgentDiffCard } from './AgentDiffCard';
import { AgentApprovalModal } from './AgentApprovalModal';
import { AgentMessageContent } from './AgentMessageMarkdown';
import {
  AgentAttachmentStatusBar,
  AgentAttachmentToolbar,
  AgentDropOverlay,
  useComposerAttachments,
} from './AgentComposerAttachments';
import {
  AgentMentionPopover,
  AgentMentionTriggerButton,
  AgentPinnedChipsBar,
  buildPinnedSubmissionPayload,
  useComposerMentions,
  type ComposerPinnedItem,
} from './AgentComposerMentions';
import {
  AgentContextualQuickActions,
  resolveContextualQuickActions,
  resolveScreenStarterChips,
  type ContextualQuickActionChip,
} from './AgentContextualQuickActions';
import {
  AgentOnboardingCards,
  type OnboardingCardItem,
} from './AgentOnboardingCards';

const MAX_MESSAGE_LENGTH = 10000;

const QUICK_PROMPTS = [
  'Audit my resume for ATS compliance and score weak areas',
  'Rewrite my experience bullets to emphasize measurable impact',
  'Tailor my headline and summary for a Senior Software Engineer role',
];

export interface AgentChatPanelProps {
  resumeId: string;
  resumeName: string;
  activeProposal: AgentApprovalProposal | null;
  onProposalChange: (proposal: AgentApprovalProposal | null) => void;
  focusedDiffPath?: string | null;
  onFocusDiffField?: (fieldPath: string) => void;
  onProposalApproved: (result: {
    newVersion: number;
    proposal: AgentApprovalProposal;
  }) => Promise<void> | void;
  onProposalRejected?: (proposal: AgentApprovalProposal) => void;
  onCollapse?: () => void;
  isMobileDrawer?: boolean;
  isOverflowing?: boolean;
  client?: AgentApiClient;
  externalPin?: ComposerPinnedItem | null;
  onExternalPinConsumed?: () => void;
}

interface ActiveTaskState {
  taskId: string;
  status: AgentTaskStatus;
  goal?: string;
  steps: AgentPlanStep[];
  statusMessage?: string | null;
  errorMessage?: string | null;
}

function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function AgentChatPanel({
  resumeId,
  resumeName,
  activeProposal,
  onProposalChange,
  focusedDiffPath,
  onFocusDiffField,
  onProposalApproved,
  onProposalRejected,
  onCollapse,
  isMobileDrawer = false,
  isOverflowing = false,
  client = agentClient,
  externalPin,
  onExternalPinConsumed,
}: AgentChatPanelProps) {
  const inputId = useId();
  const inputHintId = useId();
  const mentionListboxId = useId();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesListRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<AgentStreamConnection | null>(null);
  const lastEventIdRef = useRef<string | undefined>(undefined);
  const submitInFlightRef = useRef(false);
  const activeConversationIdRef = useRef<string | null>(null);

  // Conversation & messages state
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Composer state
  const [inputValue, setInputValue] = useState('');
  const [lastSubmittedPrompt, setLastSubmittedPrompt] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active task & streaming state
  const [activeTask, setActiveTask] = useState<ActiveTaskState | null>(null);
  const [streamingAssistantText, setStreamingAssistantText] = useState('');
  const [connectionState, setConnectionState] = useState<
    'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected'
  >('idle');
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [panelArtifacts, setPanelArtifacts] = useState<{
    atsScore?: number;
    atsIssues?: string[];
    jobs?: Array<{ title: string; company: string; matchScore?: number }>;
    matchScore?: number;
    jobMatchId?: string;
    coverLetterId?: string;
    coverLetterTitle?: string;
    interviewSessionId?: string;
    interviewRole?: string;
  }>({});

  // Approval, selective field cherry-pick & metric confirmation state
  const [confirmedMetricIds, setConfirmedMetricIds] = useState<Record<string, boolean>>({});
  const [selectedFieldPaths, setSelectedFieldPaths] = useState<Record<string, boolean>>({});
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isApprovalActionBusy, setIsApprovalActionBusy] = useState(false);

  const composerAttachments = useComposerAttachments({ client });
  const composerMentions = useComposerMentions({
    currentResumeId: resumeId,
    currentResumeName: resumeName,
    activeJob: composerAttachments.state.parsedJd
      ? {
          jobDescriptionId: composerAttachments.state.parsedJd.jobDescriptionId,
          jobTitle: composerAttachments.state.parsedJd.title,
          companyName: composerAttachments.state.parsedJd.companyName,
          jobDescriptionText: composerAttachments.state.parsedJd.descriptionText,
          applyUrl: composerAttachments.state.parsedJd.applyUrl,
          location: composerAttachments.state.parsedJd.location,
        }
      : null,
  });

  // Pin canvas bullet/section pushed from CanvasFloatingToolbar "Ask AI Agent"
  useEffect(() => {
    if (!externalPin) return;
    composerMentions.pinItem(externalPin);
    onExternalPinConsumed?.();
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [externalPin, composerMentions.pinItem, onExternalPinConsumed]);

  // Keep latest callbacks in refs so SSE listeners never close over stale props
  const onProposalChangeRef = useRef(onProposalChange);
  onProposalChangeRef.current = onProposalChange;
  const openEventStreamRef = useRef<
    ((convId: string, taskId: string, opts?: { forceReplay?: boolean }) => void) | null
  >(null);

  const scrollToBottom = useCallback((instant = false) => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior: ScrollBehavior = instant || prefersReducedMotion ? 'auto' : 'smooth';

    if (messagesListRef.current && typeof messagesListRef.current.scrollTo === 'function') {
      messagesListRef.current.scrollTo({
        top: messagesListRef.current.scrollHeight,
        behavior,
      });
      return;
    }

    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({
        behavior,
        block: 'end',
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(Boolean(streamingAssistantText));
  }, [messages.length, activeTask?.status, activeTask?.steps.length, activeProposal?.executionId, streamingAssistantText, scrollToBottom]);

  // Disconnect stream cleanly on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.disconnect();
        streamRef.current = null;
      }
    };
  }, []);

  const loadHistoryInFlightRef = useRef<string | null>(null);

  const loadConversationHistory = useCallback(async (force = false) => {
    if (!force && loadHistoryInFlightRef.current === resumeId) {
      return;
    }
    loadHistoryInFlightRef.current = resumeId;
    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const convList = await client.listConversations();
      const resumeConvs = convList.filter((c) => c.activeResumeId === resumeId);
      setConversations(resumeConvs);
      const matching = resumeConvs[0];

      if (matching) {
        setConversationId(matching.id);
        activeConversationIdRef.current = matching.id;
        const history = await client.getConversationMessages(matching.id);
        setMessages(history);

        // Rehydrate in-flight or awaiting-approval task across page reloads (FN-18)
        if (typeof client.listConversationTasks === 'function') {
          try {
            const tasks = await client.listConversationTasks(matching.id);
            const active = tasks.find((t) =>
              ['PENDING', 'PLANNING', 'RUNNING', 'AWAITING_APPROVAL'].includes(t.status),
            );
            if (active) {
              const meta = (active.metadata as Record<string, any> | undefined) || {};
              const plan = meta.plan;
              setActiveTask({
                taskId: active.id,
                status: active.status,
                goal: plan?.goal,
                steps: Array.isArray(plan?.steps) ? plan.steps : [],
                statusMessage:
                  active.status === 'AWAITING_APPROVAL'
                    ? 'Waiting for your approval'
                    : 'Resuming active task…',
              });
              if (active.status === 'AWAITING_APPROVAL' && meta.stagedProposal) {
                onProposalChangeRef.current(meta.stagedProposal as AgentApprovalProposal);
              }
              // Reconnect SSE stream with full task replay so in-flight progress & staged approval diffs restore seamlessly
              openEventStreamRef.current?.(matching.id, active.id, { forceReplay: true });
            }
          } catch {
            // Non-fatal task rehydration fallback
          }
        }
      } else {
        setConversationId(null);
        activeConversationIdRef.current = null;
        setMessages([]);
      }
    } catch (err) {
      setHistoryError(
        err instanceof Error
          ? err.message
          : 'Unable to load previous agent conversation.',
      );
    } finally {
      setIsLoadingHistory(false);
      if (loadHistoryInFlightRef.current === resumeId) {
        loadHistoryInFlightRef.current = null;
      }
    }
  }, [client, resumeId]);

  useEffect(() => {
    // Reset stream and proposal when switching resumes
    if (streamRef.current) {
      streamRef.current.disconnect();
      streamRef.current = null;
    }
    lastEventIdRef.current = undefined;
    setActiveTask(null);
    setStreamingAssistantText('');
    setStreamError(null);
    setConnectionState('idle');
    setConfirmedMetricIds({});
    onProposalChangeRef.current(null);
    void loadConversationHistory();
  }, [loadConversationHistory]);

  const refreshMessages = useCallback(
    async (convId: string) => {
      try {
        const latest = await client.getConversationMessages(convId);
        if (activeConversationIdRef.current === convId) {
          setMessages(latest);
        }
      } catch {
        // Preserve current messages if background sync fails
      }
    },
    [client],
  );

  const openEventStream = useCallback(
    (convId: string, taskId: string, opts?: { forceReplay?: boolean }) => {
      if (streamRef.current) {
        streamRef.current.disconnect();
        streamRef.current = null;
      }

      if (opts?.forceReplay) {
        lastEventIdRef.current = undefined;
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
            if (data.status === 'COMPLETED' && data.data && typeof data.data === 'object') {
              const p = data.data as Record<string, any>;
              if (data.toolName === 'run_ats_audit') {
                const rawIssueSource = Array.isArray(p.issues)
                  ? p.issues
                  : Array.isArray(p.recommendations)
                    ? p.recommendations
                    : Array.isArray(p.findings)
                      ? p.findings
                      : [];
                setPanelArtifacts((prev) => ({
                  ...prev,
                  atsScore: Number(p.overallScore ?? p.atsScore ?? p.score ?? 0),
                  atsIssues: rawIssueSource
                    .slice(0, 4)
                    .map((x: any) =>
                      typeof x === 'string'
                        ? x
                        : x?.message || x?.title || x?.suggestion || '',
                    )
                    .filter(Boolean),
                }));
              } else if (data.toolName === 'search_discovered_jobs' && Array.isArray(p.jobs)) {
                setPanelArtifacts((prev) => ({
                  ...prev,
                  jobs: p.jobs.slice(0, 3).map((j: any) => ({
                    title: j.title || 'Role',
                    company: j.company || 'Company',
                    matchScore: typeof j.matchScore === 'number' ? j.matchScore : undefined,
                  })),
                }));
              } else if (data.toolName === 'match_job_description' && p.jobMatchId) {
                setPanelArtifacts((prev) => ({
                  ...prev,
                  matchScore: Number(p.overallScore ?? 0),
                  jobMatchId: String(p.jobMatchId),
                }));
              } else if (data.toolName === 'generate_cover_letter' && p.coverLetterId) {
                setPanelArtifacts((prev) => ({
                  ...prev,
                  coverLetterId: String(p.coverLetterId),
                  coverLetterTitle: String(p.title || 'Cover Letter Draft'),
                }));
              } else if (data.toolName === 'start_interview_session' && p.sessionId) {
                setPanelArtifacts((prev) => ({
                  ...prev,
                  interviewSessionId: String(p.sessionId),
                  interviewRole: String(p.targetRole || 'Mock Interview'),
                }));
              }
            }

            setActiveTask((prev) => {
              const currentSteps = prev?.steps ? [...prev.steps] : [];
              const existingIdx = currentSteps.findIndex(
                (s) => s.stepIndex === data.stepIndex,
              );
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
                currentSteps[existingIdx] = {
                  ...currentSteps[existingIdx],
                  ...updatedStep,
                };
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
            // Unchecked by default — never auto-confirm metrics
            setConfirmedMetricIds({});
            setSelectedFieldPaths({});
            onProposalChangeRef.current(proposal);
            void refreshMessages(convId);
          },
          onMessageChunk: (data) => {
            const delta = data.chunk || data.content || '';
            if (delta) {
              setStreamingAssistantText((prev) => prev + delta);
            }
          },
          onTaskCompleted: (data) => {
            setActiveTask((prev) => ({
              taskId: data.taskId || prev?.taskId || taskId,
              status: 'COMPLETED',
              goal: prev?.goal || data.summary,
              steps: prev?.steps || [],
              statusMessage: data.message || 'Task completed',
              errorMessage: null,
            }));
            if (data.summary && data.summary.trim().length > 0) {
              const completedId = data.messageId || `completed-${data.taskId || taskId}`;
              setMessages((prev) =>
                prev.some((m) => m.id === completedId)
                  ? prev
                  : [
                      ...prev,
                      {
                        id: completedId,
                        conversationId: convId,
                        role: 'assistant',
                        content: data.summary!,
                        createdAt: new Date().toISOString(),
                      },
                    ],
              );
            }
            setStreamingAssistantText('');
            setConnectionState('idle');
            void refreshMessages(convId);
          },
          onTaskFailed: (data) => {
            const isCredits =
              data.status === 'AWAITING_CREDITS' ||
              data.reason === 'INSUFFICIENT_CREDITS';
            setActiveTask((prev) => ({
              taskId: data.taskId || prev?.taskId || taskId,
              status: isCredits ? 'AWAITING_CREDITS' : 'FAILED',
              goal: prev?.goal,
              steps: prev?.steps || [],
              statusMessage: null,
              errorMessage: data.error || 'The task encountered an unexpected error.',
            }));
            setStreamingAssistantText('');
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
            setStreamingAssistantText('');
            setConnectionState('idle');
            onProposalChangeRef.current(null);
          },
          onReconnecting: () => {
            setConnectionState('reconnecting');
            setStreamError(null);
          },
          onError: (err) => {
            setConnectionState('disconnected');
            setStreamError(err.message);
          },
          onClose: () => {
            setConnectionState((prev) => (prev === 'disconnected' ? 'disconnected' : 'idle'));
          },
        },
        {
          lastEventId: opts?.forceReplay ? undefined : lastEventIdRef.current,
          taskId,
        },
      );
    },
    [client, refreshMessages],
  );
  openEventStreamRef.current = openEventStream;

  const handleSubmitMessage = async (rawContent?: string) => {
    const rawUserText = (rawContent ?? inputValue).trim();
    const activePins = rawContent ? [] : composerMentions.pinnedItems;

    if (!rawUserText && activePins.length === 0) {
      setInputError('Please enter an instruction for the AI Agent.');
      return;
    }

    const pinnedPayload = buildPinnedSubmissionPayload(rawUserText, activePins);
    const content = pinnedPayload.content;

    if (content.length > MAX_MESSAGE_LENGTH) {
      setInputError(
        `Instructions must be ${MAX_MESSAGE_LENGTH.toLocaleString()} characters or fewer.`,
      );
      return;
    }

    if (submitInFlightRef.current) return;
    submitInFlightRef.current = true;
    setLastSubmittedPrompt(content);
    setIsSubmitting(true);
    setInputError(null);
    setStreamError(null);

    let optimisticMsgId: string | null = null;
    try {
      let targetConvId = conversationId;
      if (!targetConvId) {
        const created = await client.createConversation({
          activeResumeId: resumeId,
          title: resumeName ? `${resumeName} Assistant` : 'Resume Assistant',
        });
        targetConvId = created.id;
        setConversationId(created.id);
        activeConversationIdRef.current = created.id;
      }

      const idempotencyKey = generateIdempotencyKey();
      optimisticMsgId = `optimistic-${idempotencyKey}`;
      const optimisticUserMsg: AgentMessage = {
        id: optimisticMsgId,
        conversationId: targetConvId,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticUserMsg]);
      setInputValue('');
      composerMentions.closeMentionMenu();
      composerMentions.clearPinnedItems();
      setStreamingAssistantText('');
      setPanelArtifacts({});
      onProposalChange(null);
      setConfirmedMetricIds({});

      const attachedJd = composerAttachments.state.parsedJd;
      const attachedResume = composerAttachments.state.parsedResume;
      const effectiveResumeId =
        pinnedPayload.overrideResumeId || attachedResume?.resumeId || resumeId;
      const mergedContext = {
        ...(attachedJd
          ? {
              activeResumeId: effectiveResumeId,
              activeResumeName: attachedResume?.resumeName || resumeName,
              jobDescriptionId: attachedJd.jobDescriptionId,
              jobTitle: attachedJd.title,
              companyName: attachedJd.companyName,
              jobDescriptionText: attachedJd.descriptionText,
              applyUrl: attachedJd.applyUrl,
              location: attachedJd.location,
              workplace: attachedJd.workplace,
            }
          : {}),
        ...pinnedPayload.contextPatch,
      };
      const hasContext = Object.keys(mergedContext).length > 0;
      const submitted = await client.submitMessage(targetConvId, {
        content,
        activeResumeId: effectiveResumeId,
        idempotencyKey,
        ...(hasContext ? { context: mergedContext } : {}),
      });

      // Replace optimistic message ID with server ID
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticMsgId ? { ...m, id: submitted.messageId || m.id } : m,
        ),
      );

      setActiveTask({
        taskId: submitted.taskId,
        status: 'PENDING',
        steps: [],
        statusMessage: 'Understanding your request',
        errorMessage: null,
      });

      openEventStream(targetConvId, submitted.taskId);
    } catch (err) {
      if (optimisticMsgId) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMsgId));
      }
      if (!rawContent) {
        setInputValue(content);
      }
      setInputError(
        err instanceof Error
          ? err.message
          : 'Failed to submit instruction. Please try again.',
      );
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmitMessage();
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (composerMentions.handleMentionKeyDown(e, inputValue, setInputValue)) {
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault();
      void handleSubmitMessage();
    }
  };

  const handleCancelActiveTask = async () => {
    if (!activeTask || isCancelling) return;
    setIsCancelling(true);
    try {
      await client.cancelTask(activeTask.taskId);
      setActiveTask((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
      onProposalChange(null);
      setIsApprovalModalOpen(false);
      if (streamRef.current) {
        streamRef.current.disconnect();
        streamRef.current = null;
      }
    } catch (err) {
      setStreamError(
        err instanceof Error ? err.message : 'Unable to cancel task right now.',
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handleToggleMetricConfirm = useCallback((metricId: string, checked: boolean) => {
    setConfirmedMetricIds((prev) => ({
      ...prev,
      [metricId]: checked,
    }));
  }, []);

  const handleToggleFieldSelect = useCallback((fieldPath: string, checked: boolean) => {
    setSelectedFieldPaths((prev) => ({
      ...prev,
      [fieldPath]: checked,
    }));
  }, []);

  const getAcceptedFieldPaths = useCallback(
    (proposal: AgentApprovalProposal | null): string[] | undefined => {
      if (!proposal) return undefined;
      const explicitUnchecked = Object.values(selectedFieldPaths).some((v) => v === false);
      if (!explicitUnchecked) return undefined;
      const accepted: string[] = [];
      const {
        headline,
        summary,
        contact,
        experience,
        projects,
        skills,
        education,
        certifications,
        customSections,
        templateKey,
        layout,
      } = proposal.sectionDiffs || {};
      if (headline && selectedFieldPaths['headline'] !== false) accepted.push('headline');
      if (summary && selectedFieldPaths['summary'] !== false) accepted.push('summary');
      if (contact && selectedFieldPaths['contact'] !== false) accepted.push('contact');
      if (skills && selectedFieldPaths['skills'] !== false) accepted.push('skills');
      if (projects && selectedFieldPaths['projects'] !== false) accepted.push('projects');
      if (education && selectedFieldPaths['education'] !== false) accepted.push('education');
      if (certifications && selectedFieldPaths['certifications'] !== false) accepted.push('certifications');
      if (customSections && selectedFieldPaths['customSections'] !== false) accepted.push('customSections');
      if (templateKey && selectedFieldPaths['templateKey'] !== false) accepted.push('templateKey');
      if (layout && selectedFieldPaths['layout'] !== false) accepted.push('layout');
      if (Array.isArray(experience)) {
        experience.forEach((exp, expIdx) => {
          (exp.bulletDiffs || []).forEach((b) => {
            const p = `experience.${expIdx}.bullets.${b.bulletIndex}`;
            if (selectedFieldPaths[p] !== false) accepted.push(p);
          });
        });
      }
      return accepted;
    },
    [selectedFieldPaths],
  );

  const handleApproveProposal = async (
    proposal: AgentApprovalProposal,
    acceptedFieldPaths?: string[],
  ) => {
    setIsApprovalActionBusy(true);
    try {
      const result = await client.approveProposal(proposal.taskId, {
        executionId: proposal.executionId,
        proposalHash: proposal.proposalHash,
        acceptedFieldPaths: acceptedFieldPaths ?? getAcceptedFieldPaths(proposal),
      });

      setIsApprovalModalOpen(false);
      onProposalChange(null);
      setConfirmedMetricIds({});
      setSelectedFieldPaths({});
      setActiveTask((prev) =>
        prev
          ? {
              ...prev,
              status: 'COMPLETED',
              statusMessage: `Applied changes (v${result.newVersion})`,
            }
          : null,
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `applied-${proposal.executionId}`,
          conversationId: conversationId || '',
          role: 'assistant',
          content: `Approved changes have been applied to your resume (version v${result.newVersion}). A backup snapshot was saved to your version history.`,
          createdAt: new Date().toISOString(),
        },
      ]);

      await onProposalApproved({ newVersion: result.newVersion, proposal });
    } finally {
      setIsApprovalActionBusy(false);
    }
  };

  const handleRejectProposal = async (proposal: AgentApprovalProposal, reason?: string) => {
    setIsApprovalActionBusy(true);
    try {
      await client.rejectProposal(proposal.taskId, {
        executionId: proposal.executionId,
        proposalHash: proposal.proposalHash,
        reason,
      });

      setIsApprovalModalOpen(false);
      onProposalChange(null);
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

      setMessages((prev) => [
        ...prev,
        {
          id: `rejected-${proposal.executionId}`,
          conversationId: conversationId || '',
          role: 'assistant',
          content:
            'Proposal discarded. Your resume remains unchanged. Tell me how you would like to adjust the approach.',
          createdAt: new Date().toISOString(),
        },
      ]);

      onProposalRejected?.(proposal);
    } finally {
      setIsApprovalActionBusy(false);
    }
  };

  const handleStartNewConversation = async () => {
    if (streamRef.current) {
      streamRef.current.disconnect();
      streamRef.current = null;
    }
    lastEventIdRef.current = undefined;
    setConversationId(null);
    activeConversationIdRef.current = null;
    setMessages([]);
    setActiveTask(null);
    setStreamingAssistantText('');
    setStreamError(null);
    setInputError(null);
    setConnectionState('idle');
    setConfirmedMetricIds({});
    onProposalChange(null);
  };

  const isTaskActive =
    activeTask?.status === 'PENDING' ||
    activeTask?.status === 'PLANNING' ||
    activeTask?.status === 'RUNNING';

  // Resilient Task Polling Safety Net: prevents stuck spinners or missed proposals if SSE ever blips or disconnects
  useEffect(() => {
    if (!isTaskActive || !conversationId || !activeTask?.taskId) return;
    if (typeof client.listConversationTasks !== 'function') return;

    const targetTaskId = activeTask.taskId;
    const targetConvId = conversationId;

    const poll = async () => {
      try {
        const tasks = await client.listConversationTasks(targetConvId);
        const match = tasks.find((t) => t.id === targetTaskId);
        if (!match) return;
        const meta = (match.metadata as Record<string, any> | undefined) || {};
        const plan = meta.plan;

        if (match.status === 'AWAITING_APPROVAL') {
          setActiveTask((prev) => ({
            taskId: match.id,
            status: 'AWAITING_APPROVAL',
            goal: plan?.goal || prev?.goal,
            steps: Array.isArray(plan?.steps) ? plan.steps : prev?.steps || [],
            statusMessage: 'Waiting for your approval',
            errorMessage: null,
          }));
          setConnectionState('idle');
          setStreamError(null);
          if (meta.stagedProposal) {
            onProposalChangeRef.current(meta.stagedProposal as AgentApprovalProposal);
          }
          void refreshMessages(targetConvId);
        } else if (match.status === 'COMPLETED') {
          setActiveTask((prev) => ({
            taskId: match.id,
            status: 'COMPLETED',
            goal: plan?.goal || prev?.goal,
            steps: Array.isArray(plan?.steps) ? plan.steps : prev?.steps || [],
            statusMessage: 'Task completed',
            errorMessage: null,
          }));
          setStreamingAssistantText('');
          setConnectionState('idle');
          setStreamError(null);
          void refreshMessages(targetConvId);
        } else if (match.status === 'FAILED' || match.status === 'AWAITING_CREDITS') {
          setActiveTask((prev) => ({
            taskId: match.id,
            status: match.status,
            goal: plan?.goal || prev?.goal,
            steps: Array.isArray(plan?.steps) ? plan.steps : prev?.steps || [],
            statusMessage: null,
            errorMessage:
              meta.executionError || meta.lastError || 'The task encountered an unexpected error.',
          }));
          setStreamingAssistantText('');
          setConnectionState('idle');
        }
      } catch {
        // Non-fatal fallback poll
      }
    };

    const intervalId = setInterval(() => {
      void poll();
    }, 3500);
    return () => clearInterval(intervalId);
  }, [isTaskActive, conversationId, activeTask?.taskId, client, refreshMessages]);

  return (
    <aside
      data-testid="agent-chat-panel"
      aria-label="AI Career Agent"
      {...composerAttachments.dragHandlers}
      className={`relative flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-sm overflow-clip ${
        isMobileDrawer
          ? 'h-full w-full rounded-none sm:rounded-l-2xl'
          : 'rounded-2xl h-full min-h-0 w-full'
      }`}
    >
      <AgentDropOverlay visible={composerAttachments.isDraggingOver} />
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight truncate">
              AI Resume Agent
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              {connectionState === 'connected' && (
                <>
                  <Wifi className="w-3 h-3 text-emerald-500 shrink-0" aria-hidden="true" />
                  <span>Live updates active</span>
                </>
              )}
              {connectionState === 'reconnecting' && (
                <>
                  <Loader2
                    className="w-3 h-3 text-amber-500 animate-spin motion-reduce:animate-none shrink-0"
                    aria-hidden="true"
                  />
                  <span>Reconnecting…</span>
                </>
              )}
              {connectionState === 'disconnected' && (
                <>
                  <WifiOff className="w-3 h-3 text-rose-500 shrink-0" aria-hidden="true" />
                  <span>Disconnected</span>
                </>
              )}
              {(connectionState === 'idle' || connectionState === 'connecting') && (
                <span className="truncate">Reviews &amp; proposes verified edits</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 relative">
          {conversations.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistoryMenu((v) => !v)}
              aria-expanded={showHistoryMenu}
              aria-label="Switch conversation history"
              title="Conversation history"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <History className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          {showHistoryMenu && (
            <div
              role="menu"
              aria-label="Past conversations"
              className="absolute right-0 top-9 z-30 w-64 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg p-1.5 space-y-1 max-h-60 overflow-y-auto"
            >
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Recent Threads ({conversations.length})
              </p>
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center justify-between gap-1 rounded-lg px-2 py-1.5 text-xs ${
                    conv.id === conversationId
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={async () => {
                      setShowHistoryMenu(false);
                      if (streamRef.current) {
                        streamRef.current.disconnect();
                        streamRef.current = null;
                      }
                      lastEventIdRef.current = undefined;
                      setActiveTask(null);
                      setStreamingAssistantText('');
                      setStreamError(null);
                      setConnectionState('idle');
                      onProposalChangeRef.current(null);
                      setConversationId(conv.id);
                      activeConversationIdRef.current = conv.id;
                      const history = await client.getConversationMessages(conv.id);
                      setMessages(history);
                    }}
                    className="flex-1 text-left truncate cursor-pointer"
                  >
                    {conv.title || 'Resume Conversation'}
                  </button>
                  {typeof client.deleteConversation === 'function' && (
                    <button
                      type="button"
                      aria-label={`Delete conversation ${conv.title || conv.id}`}
                      onClick={async () => {
                        try {
                          await client.deleteConversation(conv.id);
                          setConversations((prev) => prev.filter((c) => c.id !== conv.id));
                          if (conv.id === conversationId) {
                            await handleStartNewConversation();
                          }
                        } catch {
                          // Ignore deletion errors
                        }
                      }}
                      className="p-1 rounded text-zinc-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleStartNewConversation}
              disabled={isSubmitting || isTaskActive}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
              title="Start new conversation"
              aria-label="Start new conversation"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title={isMobileDrawer ? 'Close AI Agent' : 'Collapse AI Agent panel'}
              aria-label={isMobileDrawer ? 'Close AI Agent' : 'Collapse AI Agent panel'}
            >
              {isMobileDrawer ? (
                <X className="w-4 h-4" aria-hidden="true" />
              ) : (
                <PanelLeftClose className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Conversation Area */}
      <div
        ref={messagesListRef}
        data-testid="agent-messages-list"
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4 overscroll-contain [scrollbar-gutter:stable]"
      >
        {/* Loading Skeleton */}
        {isLoadingHistory && (
          <div className="space-y-3" aria-label="Loading conversation history">
            <div className="h-12 w-3/4 rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse motion-reduce:animate-none" />
            <div className="h-16 w-5/6 ml-auto rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse motion-reduce:animate-none" />
          </div>
        )}

        {/* History Error State */}
        {!isLoadingHistory && historyError && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-900 dark:text-rose-200 flex items-start justify-between gap-2"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{historyError}</span>
            </div>
            <button
              type="button"
              onClick={() => void loadConversationHistory()}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-700 font-semibold text-[11px] hover:bg-rose-100 cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingHistory && !historyError && messages.length === 0 && !activeTask && (
          <div
            data-testid="agent-empty-state"
            className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 p-4 space-y-3"
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                What would you like to improve on “{resumeName || 'this resume'}”?
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Ask the Agent to audit ATS compliance, strengthen bullets, or propose targeted edits. Every edit requires your review and approval before modifying your resume.
              </p>
            </div>
            <AgentOnboardingCards
              disabled={isSubmitting || isTaskActive}
              onSelectAction={(card: OnboardingCardItem) => {
                if (card.intent === 'open_jd_url') {
                  if (composerAttachments.state.parsedJd) {
                    const jd = composerAttachments.state.parsedJd;
                    void handleSubmitMessage(
                      `Match and tailor my resume for ${jd.title} at ${jd.companyName} and propose edits.`,
                    );
                  } else {
                    composerAttachments.setShowUrlBar(true);
                  }
                  return;
                }
                if (card.prompt) {
                  void handleSubmitMessage(card.prompt);
                }
              }}
            />
            <AgentContextualQuickActions
              ariaLabel="Quick resume actions"
              disabled={isSubmitting || isTaskActive}
              chips={resolveScreenStarterChips({
                route: '/app/resumes',
                resumeName,
                hasActiveResume: true,
                activeJob: composerAttachments.state.parsedJd
                  ? {
                      title: composerAttachments.state.parsedJd.title,
                      companyName: composerAttachments.state.parsedJd.companyName,
                    }
                  : null,
              })}
              onSelectChip={(chip: ContextualQuickActionChip) => {
                if (chip.intent === 'open_jd_url') {
                  composerAttachments.setShowUrlBar(true);
                  return;
                }
                if (chip.prompt) {
                  void handleSubmitMessage(chip.prompt);
                }
              }}
            />
            <div className="space-y-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void handleSubmitMessage(prompt)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Persisted Messages */}
        {(() => {
          const visibleMessages = messages.filter(
            (m) => m.role === 'user' || m.role === 'assistant',
          );
          return visibleMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isLastAssistant = !isUser && idx === visibleMessages.length - 1;
            const contextualChips =
              isLastAssistant && !isTaskActive && !isSubmitting && !activeProposal
                ? resolveContextualQuickActions({
                    lastAssistantMessageId: msg.id,
                    lastAssistantContent: msg.content,
                    hasActiveResume: true,
                    activeJob: composerAttachments.state.parsedJd
                      ? {
                          title: composerAttachments.state.parsedJd.title,
                          companyName: composerAttachments.state.parsedJd.companyName,
                        }
                      : null,
                    artifacts: {
                      atsScore: panelArtifacts.atsScore,
                      matchScore: panelArtifacts.matchScore,
                      discoveredJobsCount: panelArtifacts.jobs?.length,
                      hasCoverLetter: Boolean(panelArtifacts.coverLetterId),
                      hasInterviewSession: Boolean(panelArtifacts.interviewSessionId),
                    },
                    route: '/app/resumes',
                  })
                : [];

            return (
              <div key={msg.id} className="space-y-2">
                <div
                  data-message-role={msg.role}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    aria-hidden="true"
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                      isUser
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-800 dark:border-zinc-200'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-800'
                    }`}
                  >
                    {isUser ? (
                      <UserIcon className="w-3.5 h-3.5" />
                    ) : (
                      <Bot className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed break-words ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-sm shadow-2xs'
                        : 'bg-zinc-100/90 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-800 rounded-tl-sm'
                    }`}
                  >
                    <AgentMessageContent
                      content={msg.content}
                      isUser={isUser}
                      createdAt={msg.createdAt}
                    />
                  </div>
                </div>
                {contextualChips.length > 0 && (
                  <AgentContextualQuickActions
                    className="pl-9"
                    chips={contextualChips}
                    disabled={isSubmitting || isTaskActive}
                    onSelectChip={(chip) => {
                      if (chip.intent === 'open_jd_url') {
                        composerAttachments.setShowUrlBar(true);
                        return;
                      }
                      if (chip.prompt) {
                        void handleSubmitMessage(chip.prompt);
                      }
                    }}
                  />
                )}
              </div>
            );
          });
        })()}

        {/* Streamed Assistant Text Preview (Live Token-by-Token Markdown) */}
        {streamingAssistantText && (
          <div
            data-testid="agent-streaming-bubble"
            aria-busy="true"
            className="flex items-start gap-2.5"
          >
            <div
              aria-hidden="true"
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800"
            >
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs leading-relaxed bg-zinc-100/90 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-800 break-words">
              <AgentMessageContent content={streamingAssistantText} isUser={false} />
              <span
                aria-hidden="true"
                className="inline-block w-1.5 h-3.5 ml-1 align-middle rounded-xs bg-blue-600 dark:bg-blue-400 animate-pulse motion-reduce:animate-none"
              />
            </div>
          </div>
        )}

        {/* Live Task Progress */}
        {activeTask && (
          <AgentTaskProgress
            taskId={activeTask.taskId}
            status={activeTask.status}
            goal={activeTask.goal}
            steps={activeTask.steps}
            statusMessage={activeTask.statusMessage}
            errorMessage={activeTask.errorMessage}
            isCancelling={isCancelling}
            onCancel={handleCancelActiveTask}
            onRetry={
              lastSubmittedPrompt
                ? () => void handleSubmitMessage(lastSubmittedPrompt)
                : undefined
            }
          />
        )}

        {/* Structured Tool Artifact Cards inside Resume Editor Panel (UX-10) */}
        {panelArtifacts.atsScore !== undefined && (
          <div className="rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                ATS Audit Result
              </span>
              <span className="rounded-full bg-blue-600 text-white px-2 py-0.5 text-[11px] font-bold">
                {panelArtifacts.atsScore}/100
              </span>
            </div>
            {panelArtifacts.atsIssues && panelArtifacts.atsIssues.length > 0 && (
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-zinc-700 dark:text-zinc-300">
                {panelArtifacts.atsIssues.map((iss, idx) => (
                  <li key={idx}>{iss}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {panelArtifacts.jobs && panelArtifacts.jobs.length > 0 && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                Top Matching Roles
              </span>
              <Link href="/app/job-search" className="text-[11px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-0.5">
                View All <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
            {panelArtifacts.jobs.map((j, i) => (
              <p key={i} className="text-[11px] text-zinc-700 dark:text-zinc-300">
                <strong>{j.title}</strong> at {j.company}{typeof j.matchScore === 'number' ? ` (${j.matchScore}% Fit)` : ''}
              </p>
            ))}
          </div>
        )}
        {panelArtifacts.coverLetterId && (
          <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-3 flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 truncate">
              <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" aria-hidden="true" />
              <span className="truncate">{panelArtifacts.coverLetterTitle}</span>
            </span>
            <Link
              href={`/app/cover-letters?resumeId=${encodeURIComponent(resumeId)}&coverLetterId=${encodeURIComponent(panelArtifacts.coverLetterId)}`}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
            >
              Open Studio
            </Link>
          </div>
        )}
        {panelArtifacts.interviewSessionId && (
          <div className="rounded-xl border border-purple-200/80 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 p-3 flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 truncate">
              <Mic className="w-3.5 h-3.5 text-purple-600 shrink-0" aria-hidden="true" />
              <span className="truncate">{panelArtifacts.interviewRole}</span>
            </span>
            <Link
              href={`/app/interview/${encodeURIComponent(panelArtifacts.interviewSessionId)}`}
              className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline shrink-0"
            >
              Start Practice
            </Link>
          </div>
        )}

        {/* Pending Proposal Diff Review Card */}
        {activeProposal && (
          <AgentDiffCard
            proposal={activeProposal}
            confirmedMetricIds={confirmedMetricIds}
            onToggleMetricConfirm={handleToggleMetricConfirm}
            selectedFieldPaths={selectedFieldPaths}
            onToggleFieldSelect={handleToggleFieldSelect}
            onFocusField={onFocusDiffField}
            focusedFieldPath={focusedDiffPath}
            onOpenApprovalModal={() => setIsApprovalModalOpen(true)}
            onReject={() => void handleRejectProposal(activeProposal)}
            isSubmitting={isApprovalActionBusy}
            isOverflowing={isOverflowing}
          />
        )}

        {/* Stream Connection Error */}
        {streamError && (
          <div
            role="alert"
            className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2"
          >
            <span>{streamError}</span>
            {conversationId && activeTask && (
              <button
                type="button"
                onClick={() => openEventStream(conversationId, activeTask.taskId, { forceReplay: true })}
                className="px-2 py-1 rounded-md bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700 text-[11px] font-semibold hover:bg-amber-100 cursor-pointer shrink-0"
              >
                Reconnect
              </button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer Form */}
      <form
        onSubmit={handleFormSubmit}
        className="relative p-3 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/50 space-y-2 shrink-0"
      >
        <AgentPinnedChipsBar
          items={composerMentions.pinnedItems}
          onRemove={composerMentions.unpinItem}
          liveAnnouncement={composerMentions.liveAnnouncement}
        />
        <AgentAttachmentStatusBar
          state={composerAttachments.state}
          showUrlBar={composerAttachments.showUrlBar}
          urlInput={composerAttachments.urlInput}
          onUrlInputChange={composerAttachments.setUrlInput}
          onSubmitUrl={() => void composerAttachments.handleParseUrl()}
          onCloseUrlBar={() => composerAttachments.setShowUrlBar(false)}
          onClearResume={composerAttachments.clearParsedResume}
          onClearJd={composerAttachments.clearParsedJd}
          onClearError={composerAttachments.clearError}
          onQuickPrompt={(prompt) => void handleSubmitMessage(prompt)}
          disabled={isSubmitting || isTaskActive}
          showOpenResumeLink
        />
        {inputError && (
          <p
            role="alert"
            data-testid="agent-input-error"
            className="text-[11px] text-rose-600 dark:text-rose-400 font-medium px-1"
          >
            {inputError}
          </p>
        )}
        <div className="relative flex items-end gap-1.5">
          <AgentMentionPopover
            listboxId={mentionListboxId}
            isOpen={composerMentions.isOpen}
            query={composerMentions.activeMention?.query || ''}
            options={composerMentions.filteredOptions}
            highlightedIndex={composerMentions.highlightedIndex}
            onHighlight={composerMentions.setHighlightedIndex}
            onSelect={(opt) => {
              composerMentions.selectOption(opt, inputValue, setInputValue);
              textareaRef.current?.focus();
            }}
            onClose={composerMentions.closeMentionMenu}
          />
          <AgentAttachmentToolbar
            fileInputRef={composerAttachments.fileInputRef}
            onFileSelected={(file) => void composerAttachments.handleFileUpload(file)}
            onOpenFilePicker={composerAttachments.openFilePicker}
            showUrlBar={composerAttachments.showUrlBar}
            onToggleUrlBar={() => composerAttachments.setShowUrlBar((v) => !v)}
            disabled={isSubmitting}
          />
          <AgentMentionTriggerButton
            isOpen={composerMentions.isOpen}
            disabled={isSubmitting}
            onClick={() => {
              composerMentions.openMentionMenu(inputValue, setInputValue);
              textareaRef.current?.focus();
            }}
          />
          <div className="flex-1 min-w-0">
            <label htmlFor={inputId} className="sr-only">
              Ask the AI Resume Agent
            </label>
            <textarea
              ref={textareaRef}
              id={inputId}
              rows={2}
              value={inputValue}
              disabled={isSubmitting}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={composerMentions.isOpen}
              aria-controls={composerMentions.isOpen ? mentionListboxId : undefined}
              aria-activedescendant={
                composerMentions.isOpen && composerMentions.filteredOptions.length > 0
                  ? `${mentionListboxId}-opt-${composerMentions.highlightedIndex}`
                  : undefined
              }
              aria-describedby={inputHintId}
              aria-invalid={inputError ? 'true' : undefined}
              onChange={(e) => {
                setInputValue(e.target.value);
                composerMentions.handleTextChange(e.target.value, e.target.selectionStart);
                if (inputError) setInputError(null);
              }}
              onClick={(e) => {
                const el = e.currentTarget;
                composerMentions.handleTextChange(el.value, el.selectionStart);
              }}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Type @ to pin @Experience, @Job, @Resume — or drop a PDF/JD URL…"
              className="w-full resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={
              isSubmitting ||
              isTaskActive ||
              (inputValue.trim().length === 0 && composerMentions.pinnedItems.length === 0)
            }
            aria-label="Send instruction to AI Agent"
            className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs transition-colors disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <Send className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <div
          id={inputHintId}
          className="flex items-center justify-between text-[10.5px] text-zinc-500 dark:text-zinc-400 px-1"
        >
          <span>Type @ to pin sections/jobs · Drop PDF or JD URL · Enter to send</span>
          {inputValue.length > 8000 && (
            <span
              className={
                inputValue.length > MAX_MESSAGE_LENGTH ? 'text-rose-600 font-semibold' : ''
              }
            >
              {inputValue.length.toLocaleString()} / {MAX_MESSAGE_LENGTH.toLocaleString()}
            </span>
          )}
        </div>
      </form>

      {/* Human-in-the-Loop Approval Modal */}
      <AgentApprovalModal
        isOpen={isApprovalModalOpen}
        resumeName={resumeName}
        proposal={activeProposal}
        confirmedMetricIds={confirmedMetricIds}
        onToggleMetricConfirm={handleToggleMetricConfirm}
        acceptedFieldPaths={getAcceptedFieldPaths(activeProposal)}
        onApprove={handleApproveProposal}
        onReject={handleRejectProposal}
        onClose={() => setIsApprovalModalOpen(false)}
      />
    </aside>
  );
}

