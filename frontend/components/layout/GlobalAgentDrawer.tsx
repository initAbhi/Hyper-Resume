'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowUpRight,
  BookmarkCheck,
  Bot,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileText,
  History,
  Loader2,
  Mail,
  MapPin,
  Mic,
  Paperclip,
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
import { useGlobalAgent } from '@/lib/global-agent-context';
import { apiClient, type Resume } from '@/lib/api-client';
import { AgentTaskProgress } from '@/components/resumes/AgentTaskProgress';
import { AgentDiffCard } from '@/components/resumes/AgentDiffCard';
import { AgentApprovalModal } from '@/components/resumes/AgentApprovalModal';
import { AgentMessageContent } from '@/components/resumes/AgentMessageMarkdown';
import {
  AgentAttachmentStatusBar,
  AgentAttachmentToolbar,
  AgentDropOverlay,
  useComposerAttachments,
} from '@/components/resumes/AgentComposerAttachments';
import {
  AgentMentionPopover,
  AgentMentionTriggerButton,
  AgentPinnedChipsBar,
  buildPinnedSubmissionPayload,
  useComposerMentions,
} from '@/components/resumes/AgentComposerMentions';
import {
  AgentContextualQuickActions,
  resolveContextualQuickActions,
  resolveScreenStarterChips,
} from '@/components/resumes/AgentContextualQuickActions';
import {
  AgentOnboardingCards,
  type OnboardingCardItem,
} from '@/components/resumes/AgentOnboardingCards';

const GLOBAL_QUICK_PROMPTS = [
  'Find me remote engineering jobs and match them against my resume',
  'Tailor my resume for the selected job and draft a cover letter',
  'Prepare me for a technical interview for this role and ask the first question',
];

export function GlobalAgentDrawer() {
  const {
    isOpen,
    closeDrawer,
    pageContext,
    updateContext,
    clearJobContext,
    clearResumeContext,
    selectResumeContext,
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
    dismissNotice,
    submitMessage,
    launchPrompt,
    approveProposal,
    rejectProposal,
    cancelActiveTask,
    startNewConversation,
    reconnectStream,
    reloadHistory,
  } = useGlobalAgent();

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inputId = useId();
  const titleId = useId();
  const mentionListboxId = useId();

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isApprovalBusy, setIsApprovalBusy] = useState(false);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const [showResumePicker, setShowResumePicker] = useState(false);
  const [availableResumes, setAvailableResumes] = useState<Resume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);

  const composerAttachments = useComposerAttachments({
    onResumeParsed: (res) => {
      selectResumeContext({ id: res.resumeId, name: res.resumeName });
      setAvailableResumes((prev) =>
        prev.some((r) => r.id === res.resumeId)
          ? prev
          : [
              {
                id: res.resumeId,
                name: res.resumeName,
                templateKey: 'clean-modern',
                version: 1,
                isMaster: false,
                isArchived: false,
              } as Resume,
              ...prev,
            ],
      );
    },
    onJdParsed: (jd) => {
      updateContext({
        jobDescriptionId: jd.jobDescriptionId,
        jobTitle: jd.title,
        companyName: jd.companyName,
        jobDescriptionText: jd.descriptionText,
        applyUrl: jd.applyUrl,
        location: jd.location,
        workplace: jd.workplace,
      });
    },
  });

  const composerMentions = useComposerMentions({
    currentResumeId: pageContext.activeResumeId,
    currentResumeName: pageContext.activeResumeName,
    activeJob:
      pageContext.jobTitle || pageContext.companyName
        ? {
            jobDescriptionId: pageContext.jobDescriptionId,
            jobTitle: pageContext.jobTitle,
            companyName: pageContext.companyName,
            jobDescriptionText: pageContext.jobDescriptionText,
            applyUrl: pageContext.applyUrl,
            location: pageContext.location,
          }
        : null,
    availableResumes: availableResumes.length > 0 ? availableResumes : undefined,
  });

  const handleToggleResumePicker = async () => {
    const nextOpen = !showResumePicker;
    setShowResumePicker(nextOpen);
    if (nextOpen && availableResumes.length === 0 && !isLoadingResumes) {
      setIsLoadingResumes(true);
      try {
        const res = await apiClient.listResumes();
        setAvailableResumes(Array.isArray(res) ? res : []);
      } catch {
        setAvailableResumes([]);
      } finally {
        setIsLoadingResumes(false);
      }
    }
  };

  const getAcceptedFieldPaths = () => {
    if (!activeProposal) return undefined;
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
    } = activeProposal.sectionDiffs || {};
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
  };

  // Sync native <dialog> top-layer modal open/close state with isOpen
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open && typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    } else if (dialog.open && typeof dialog.close === 'function') {
      dialog.close();
    }
  }, [isOpen]);

  // Handle native Escape cancel event cleanly without terminating running tasks
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      closeDrawer();
    };
    dialog.addEventListener('cancel', onCancel);
    return () => dialog.removeEventListener('cancel', onCancel);
  }, [closeDrawer]);

  // Auto-scroll conversation log (instant 60fps follow while streaming to avoid smooth-scroll jank)
  useEffect(() => {
    if (!isOpen || !messagesEndRef.current) return;
    if (typeof messagesEndRef.current.scrollIntoView === 'function') {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      messagesEndRef.current.scrollIntoView({
        behavior: streamingText || prefersReducedMotion ? 'auto' : 'smooth',
        block: 'end',
      });
    }
  }, [
    isOpen,
    messages.length,
    activeTask?.status,
    activeTask?.steps.length,
    activeProposal?.executionId,
    streamingText,
  ]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
      closeDrawer();
    }
  };

  const submitDraftWithMentions = () => {
    const activePins = composerMentions.pinnedItems;
    if (activePins.length > 0) {
      const payload = buildPinnedSubmissionPayload(draftInput, activePins, pageContext);
      composerMentions.closeMentionMenu();
      composerMentions.clearPinnedItems();
      setDraftInput('');
      void submitMessage(payload.content, payload.contextPatch);
      return;
    }
    composerMentions.closeMentionMenu();
    void submitMessage();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitDraftWithMentions();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (composerMentions.handleMentionKeyDown(e, draftInput, setDraftInput)) {
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault();
      submitDraftWithMentions();
    }
  };

  const isTaskRunning =
    activeTask?.status === 'PENDING' ||
    activeTask?.status === 'PLANNING' ||
    activeTask?.status === 'RUNNING';

  return (
    <>
      <dialog
        ref={dialogRef}
        id="global-agent-drawer"
        data-testid="global-agent-drawer"
        aria-labelledby={titleId}
        open={typeof window === 'undefined' ? isOpen : undefined}
        onClick={handleBackdropClick}
        className="print:hidden fixed inset-0 m-0 p-0 w-full max-w-none h-[100svh] max-h-none bg-transparent border-0 backdrop:bg-black/40 backdrop:backdrop-blur-xs open:flex justify-end"
      >
        <div
          ref={sheetRef}
          {...composerAttachments.dragHandlers}
          className="relative w-full max-w-lg h-[100svh] bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden"
        >
          <AgentDropOverlay visible={composerAttachments.isDraggingOver} />
          {/* Drawer Header */}
          <div className="px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#285FEA] text-white flex items-center justify-center shadow-xs shrink-0">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2
                  id={titleId}
                  className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight truncate"
                >
                  AI Career Assistant
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {connectionState === 'connected' && (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-500 shrink-0" aria-hidden="true" />
                      <span>Live updates connected</span>
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
                    <span className="truncate">
                      Jobs · Match · Tailoring · Cover Letters · Interviews
                    </span>
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
                  aria-label="Conversation history"
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
                        onClick={() => {
                          setShowHistoryMenu(false);
                          void selectConversation(conv.id);
                        }}
                        className="flex-1 text-left truncate cursor-pointer"
                      >
                        {conv.title || 'Career Assistant'}
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete conversation ${conv.title || conv.id}`}
                        onClick={() => void deleteConversation(conv.id)}
                        className="p-1 rounded text-zinc-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={startNewConversation}
                  disabled={isSubmitting || isTaskRunning}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
                  aria-label="Start new conversation"
                  title="Start new conversation"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                autoFocus
                onClick={closeDrawer}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close AI Career Assistant"
                title="Close drawer (running tasks continue in background)"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Interactive Context Bar: Attach, Switch, or Remove Resume & Target Job */}
          <div
            data-testid="global-agent-context-bar"
            className="relative px-4 py-2 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-wrap items-center gap-1.5 text-[11px] shrink-0"
          >
            {pageContext.activeResumeName || pageContext.activeResumeId ? (
              <span
                data-testid="attached-resume-chip"
                className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 pl-2 pr-1 py-0.5 text-zinc-700 dark:text-zinc-200 max-w-[230px] shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => void handleToggleResumePicker()}
                  className="inline-flex items-center gap-1 min-w-0 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  aria-label="Switch attached resume"
                  aria-expanded={showResumePicker}
                  title="Click to switch resume"
                >
                  <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
                  <span className="truncate font-medium">
                    {pageContext.activeResumeName || 'Active Resume'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResumePicker(false);
                    clearResumeContext();
                  }}
                  className="ml-0.5 p-0.5 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer shrink-0"
                  aria-label="Remove attached resume"
                  title="Detach resume from assistant"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </span>
            ) : (
              <button
                type="button"
                data-testid="attach-resume-btn"
                onClick={() => void handleToggleResumePicker()}
                aria-expanded={showResumePicker}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 px-2.5 py-0.5 text-zinc-600 dark:text-zinc-400 font-medium transition-colors cursor-pointer"
              >
                <Paperclip className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span>Attach resume</span>
              </button>
            )}

            {(pageContext.jobTitle || pageContext.companyName) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 pl-2 pr-1 py-0.5 text-blue-800 dark:text-blue-200 max-w-[230px]">
                <Briefcase className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {pageContext.jobTitle || 'Role'}
                  {pageContext.companyName ? ` @ ${pageContext.companyName}` : ''}
                </span>
                <button
                  type="button"
                  onClick={clearJobContext}
                  className="ml-0.5 p-0.5 rounded-full hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer shrink-0"
                  aria-label="Clear selected job context"
                  title="Remove job context"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </span>
            )}

            {/* Resume Switcher / Attachment Popover */}
            {showResumePicker && (
              <div
                data-testid="resume-context-picker"
                className="absolute left-4 top-full mt-1 z-30 w-72 max-h-64 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl p-1.5 space-y-0.5"
              >
                <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Select Resume Context
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowResumePicker(false)}
                    className="p-0.5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                    aria-label="Close resume picker"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>

                {isLoadingResumes ? (
                  <div className="flex items-center gap-2 px-2.5 py-3 text-xs text-zinc-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    <span>Loading your resumes…</span>
                  </div>
                ) : availableResumes.length === 0 ? (
                  <div className="px-2.5 py-2 text-xs text-zinc-500 space-y-1.5">
                    <p>No resumes found yet.</p>
                    <Link
                      href="/app/resumes"
                      onClick={() => {
                        setShowResumePicker(false);
                        closeDrawer();
                      }}
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Go to My Resumes <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                    </Link>
                  </div>
                ) : (
                  availableResumes.map((r) => {
                    const isSelected = pageContext.activeResumeId === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          selectResumeContext({ id: r.id, name: r.name });
                          setShowResumePicker(false);
                        }}
                        className={`w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 min-w-0">
                          <FileText className="w-3.5 h-3.5 shrink-0 text-blue-500" aria-hidden="true" />
                          <span className="truncate">{r.name}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />}
                      </button>
                    );
                  })
                )}

                {(pageContext.activeResumeId || pageContext.activeResumeName) && (
                  <div className="pt-1 mt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResumePicker(false);
                        clearResumeContext();
                      }}
                      className="w-full flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Detach resume (chat without resume)</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notice Banner */}
          {notice && (
            <div
              role="status"
              aria-live="polite"
              className={`px-4 py-2 text-xs flex items-center justify-between gap-2 border-b shrink-0 ${
                notice.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {notice.message}
              </span>
              <button
                type="button"
                onClick={dismissNotice}
                className="p-0.5 rounded hover:bg-black/5 cursor-pointer"
                aria-label="Dismiss message"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Main Scrollable Thread */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 overscroll-contain">
            {isLoadingHistory && (
              <div className="space-y-3" aria-label="Loading conversation">
                <div className="h-12 w-3/4 rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse motion-reduce:animate-none" />
                <div className="h-14 w-5/6 ml-auto rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse motion-reduce:animate-none" />
              </div>
            )}

            {!isLoadingHistory && historyError && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {historyError}
                </span>
                <button
                  type="button"
                  onClick={() => void reloadHistory()}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-rose-200 text-[11px] font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" aria-hidden="true" />
                  Retry
                </button>
              </div>
            )}

            {!isLoadingHistory && !historyError && messages.length === 0 && !activeTask && (
              <div
                data-testid="global-agent-empty-state"
                className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-4 space-y-3"
              >
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Your cross-product AI career copilot
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Run end-to-end workflows across Job Discovery, Match Analysis, Resume Tailoring, Cover Letter Studio, and Mock Interviews. Resume edits always require your explicit approval.
                  </p>
                </div>
                <AgentOnboardingCards
                  disabled={isSubmitting || isTaskRunning}
                  onSelectAction={(card: OnboardingCardItem) => {
                    if (card.intent === 'open_jd_url') {
                      if (pageContext.jobTitle || pageContext.companyName) {
                        void submitMessage(
                          `Match and tailor my resume for ${pageContext.jobTitle || 'this role'}${pageContext.companyName ? ` at ${pageContext.companyName}` : ''} and propose edits.`,
                        );
                      } else {
                        composerAttachments.setShowUrlBar(true);
                      }
                      return;
                    }
                    if (card.prompt) {
                      void submitMessage(card.prompt);
                    }
                  }}
                />
                <AgentContextualQuickActions
                  ariaLabel="Quick actions for this screen"
                  disabled={isSubmitting || isTaskRunning}
                  chips={resolveScreenStarterChips({
                    route: pageContext.route,
                    resumeName: pageContext.activeResumeName,
                    hasActiveResume: Boolean(pageContext.activeResumeId),
                    activeJob:
                      pageContext.jobTitle || pageContext.companyName
                        ? {
                            title: pageContext.jobTitle,
                            companyName: pageContext.companyName,
                          }
                        : null,
                  })}
                  onSelectChip={(chip) => {
                    if (chip.intent === 'open_jd_url') {
                      composerAttachments.setShowUrlBar(true);
                      return;
                    }
                    if (chip.prompt) {
                      void submitMessage(chip.prompt);
                    }
                  }}
                />
                <div className="space-y-1.5">
                  {GLOBAL_QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => void submitMessage(prompt)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {(() => {
              const visibleMessages = messages.filter(
                (m) => m.role === 'user' || m.role === 'assistant',
              );
              return visibleMessages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const isLastAssistant = !isUser && idx === visibleMessages.length - 1;
                const contextualChips =
                  isLastAssistant && !isTaskRunning && !isSubmitting && !activeProposal
                    ? resolveContextualQuickActions({
                        lastAssistantMessageId: msg.id,
                        lastAssistantContent: msg.content,
                        hasActiveResume: Boolean(pageContext.activeResumeId),
                        activeJob:
                          pageContext.jobTitle || pageContext.companyName
                            ? {
                                title: pageContext.jobTitle,
                                companyName: pageContext.companyName,
                              }
                            : null,
                        artifacts: {
                          matchScore: artifacts.latestMatch?.overallScore,
                          discoveredJobsCount: artifacts.discoveredJobs.length,
                          hasCoverLetter: Boolean(artifacts.generatedCoverLetter),
                          hasInterviewSession: Boolean(artifacts.interviewSession),
                        },
                        route: pageContext.route,
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
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-800'
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
                            ? 'bg-[#285FEA] text-white rounded-tr-sm shadow-2xs'
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
                        disabled={isSubmitting || isTaskRunning}
                        onSelectChip={(chip) => {
                          if (chip.intent === 'open_jd_url') {
                            composerAttachments.setShowUrlBar(true);
                            return;
                          }
                          if (chip.prompt) {
                            void submitMessage(chip.prompt);
                          }
                        }}
                      />
                    )}
                  </div>
                );
              });
            })()}

            {streamingText && (
              <div
                data-testid="agent-streaming-bubble"
                aria-busy="true"
                className="flex items-start gap-2.5"
              >
                <div
                  aria-hidden="true"
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                >
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs leading-relaxed bg-zinc-100/90 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-800 break-words">
                  <AgentMessageContent content={streamingText} isUser={false} />
                  <span
                    aria-hidden="true"
                    className="inline-block w-1.5 h-3.5 ml-1 align-middle rounded-xs bg-[#285FEA] dark:bg-blue-400 animate-pulse motion-reduce:animate-none"
                  />
                </div>
              </div>
            )}

            {/* Task Progress (Reused Phase 3 Component) */}
            {activeTask && (
              <AgentTaskProgress
                taskId={activeTask.taskId}
                status={activeTask.status}
                goal={activeTask.goal}
                steps={activeTask.steps}
                statusMessage={activeTask.statusMessage}
                errorMessage={activeTask.errorMessage}
                isCancelling={isCancelling}
                onCancel={() => void cancelActiveTask()}
                onRetry={
                  lastSubmittedPrompt
                    ? () => void submitMessage(lastSubmittedPrompt)
                    : undefined
                }
              />
            )}

            {/* Structured Artifact: Discovered Jobs */}
            {artifacts.discoveredJobs.length > 0 && (
              <section
                data-testid="agent-discovered-jobs-card"
                aria-label="Discovered job listings"
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                    Matching Job Opportunities ({artifacts.discoveredJobs.length})
                  </span>
                  <Link
                    href="/app/job-search"
                    onClick={closeDrawer}
                    className="text-[11px] font-medium text-blue-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    Open Job Search
                    <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  </Link>
                </div>
                <ul className="space-y-2">
                  {artifacts.discoveredJobs.slice(0, 4).map((job, idx) => (
                    <li
                      key={`${job.company}-${job.title}-${idx}`}
                      className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 p-2.5 space-y-1.5 bg-zinc-50/50 dark:bg-zinc-950/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {job.title}
                          </p>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                            {job.company}
                            {job.location ? ` · ${job.location}` : ''}
                          </p>
                        </div>
                        {typeof job.matchScore === 'number' && (
                          <span className="shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                            {job.matchScore}% Fit
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-500">
                        {job.workplace && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5">
                            <MapPin className="w-2.5 h-2.5" aria-hidden="true" />
                            {job.workplace}
                          </span>
                        )}
                        {job.source && (
                          <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 uppercase">
                            {job.source}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            launchPrompt({
                              prompt: `Analyze ${job.title} at ${job.company} against my active resume and explain my skill gaps.`,
                              context: {
                                activeJobId: job.id,
                                jobTitle: job.title,
                                companyName: job.company,
                                location: job.location,
                                applyUrl: job.applyUrl,
                                jobDescriptionText: job.descriptionText || job.descriptionSnippet,
                              },
                            })
                          }
                          className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          Match &amp; Analyze
                        </button>
                        {job.applyUrl && (
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 inline-flex items-center gap-0.5 ml-auto"
                          >
                            Job Post
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Structured Artifact: Job Match Summary */}
            {artifacts.latestMatch && (
              <section
                data-testid="agent-match-result-card"
                aria-label="Job match summary"
                className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    Resume Match Analysis
                  </span>
                  <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[11px] font-bold">
                    {artifacts.latestMatch.overallScore}%
                  </span>
                </div>
                {artifacts.latestMatch.missingHardSkills.length > 0 && (
                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300">
                    <strong>Identified gaps:</strong>{' '}
                    {artifacts.latestMatch.missingHardSkills.slice(0, 5).join(', ')}
                  </p>
                )}
                <Link
                  href={`/app/match?matchId=${encodeURIComponent(artifacts.latestMatch.jobMatchId)}`}
                  onClick={closeDrawer}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Open Full Match Report
                  <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </section>
            )}

            {/* Structured Artifact: Saved Application */}
            {artifacts.savedApplication && (
              <div
                data-testid="agent-saved-application-card"
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-3 py-2.5 flex items-center justify-between gap-2 text-xs"
              >
                <span className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 min-w-0">
                  <BookmarkCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {artifacts.savedApplication.alreadyTracked ? 'Already tracked:' : 'Saved to tracker:'}{' '}
                    <strong>{artifacts.savedApplication.role}</strong> at{' '}
                    {artifacts.savedApplication.company}
                  </span>
                </span>
                <Link
                  href="/app/applications"
                  onClick={closeDrawer}
                  className="text-[11px] font-semibold text-blue-600 hover:underline shrink-0"
                >
                  Tracker
                </Link>
              </div>
            )}

            {/* Pending Resume Proposal Diff Card (Reused Phase 3 Component) */}
            {activeProposal && (
              <AgentDiffCard
                proposal={activeProposal}
                confirmedMetricIds={confirmedMetricIds}
                onToggleMetricConfirm={toggleMetricConfirm}
                selectedFieldPaths={selectedFieldPaths}
                onToggleFieldSelect={toggleFieldSelect}
                onOpenApprovalModal={() => setIsApprovalModalOpen(true)}
                onReject={() => void rejectProposal(activeProposal)}
                isSubmitting={isApprovalBusy}
              />
            )}

            {/* Structured Artifact: Generated Cover Letter */}
            {artifacts.generatedCoverLetter && (
              <section
                data-testid="agent-cover-letter-card"
                aria-label="Generated cover letter draft"
                className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                    Cover Letter Staged for Review
                  </span>
                </div>
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                  {artifacts.generatedCoverLetter.title}
                </p>
                {artifacts.generatedCoverLetter.openingParagraph && (
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-3">
                    {artifacts.generatedCoverLetter.openingParagraph}
                  </p>
                )}
                <Link
                  href={`/app/cover-letters?${new URLSearchParams({
                    ...(pageContext.activeResumeId ? { resumeId: pageContext.activeResumeId } : {}),
                    coverLetterId: artifacts.generatedCoverLetter.coverLetterId,
                  }).toString()}`}
                  onClick={closeDrawer}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
                >
                  Review in Cover Letter Studio
                  <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </section>
            )}

            {/* Structured Artifact: Mock Interview Session & First Question */}
            {artifacts.interviewSession && (
              <section
                data-testid="agent-interview-session-card"
                aria-label="Mock interview session ready"
                className="rounded-xl border border-purple-200/80 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />
                    Mock Interview Ready — {artifacts.interviewSession.targetRole}
                  </span>
                </div>
                {artifacts.interviewSession.firstQuestion?.questionText && (
                  <div className="rounded-lg bg-white dark:bg-zinc-900 border border-purple-200/70 dark:border-purple-800/60 p-2.5 text-xs text-zinc-800 dark:text-zinc-200">
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-purple-700 dark:text-purple-300 mb-1">
                      Question 1
                    </span>
                    {artifacts.interviewSession.firstQuestion.questionText}
                  </div>
                )}
                <Link
                  href={`/app/interview/${encodeURIComponent(artifacts.interviewSession.sessionId)}`}
                  onClick={closeDrawer}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                  Enter Live Interview Session
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </section>
            )}

            {streamError && (
              <div
                role="alert"
                className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2"
              >
                <span>{streamError}</span>
                <button
                  type="button"
                  onClick={reconnectStream}
                  className="px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-amber-300 text-[11px] font-semibold cursor-pointer"
                >
                  Reconnect
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={handleFormSubmit}
            className="relative p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 space-y-1.5 shrink-0"
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
              onClearJd={() => {
                composerAttachments.clearParsedJd();
                clearJobContext();
              }}
              onClearError={composerAttachments.clearError}
              onQuickPrompt={(prompt) => launchPrompt({ prompt, autoSubmit: true })}
              disabled={isSubmitting || isTaskRunning}
              showOpenResumeLink
            />
            {inputError && (
              <p role="alert" className="text-[11px] text-rose-600 font-medium px-1">
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
                  composerMentions.selectOption(opt, draftInput, setDraftInput);
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
                  composerMentions.openMentionMenu(draftInput, setDraftInput);
                  textareaRef.current?.focus();
                }}
              />
              <div className="flex-1 min-w-0">
                <label htmlFor={inputId} className="sr-only">
                  Ask the AI Career Assistant
                </label>
                <textarea
                  ref={textareaRef}
                  id={inputId}
                  rows={2}
                  value={draftInput}
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
                  onChange={(e) => {
                    setDraftInput(e.target.value);
                    composerMentions.handleTextChange(e.target.value, e.target.selectionStart);
                    if (inputError) setInputError(null);
                  }}
                  onClick={(e) => {
                    const el = e.currentTarget;
                    composerMentions.handleTextChange(el.value, el.selectionStart);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type @ to pin @Experience, @Job, @Resume — or drop a PDF/JD URL…"
                  className="w-full resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
                />
              </div>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  isTaskRunning ||
                  (draftInput.trim().length === 0 && composerMentions.pinnedItems.length === 0)
                }
                aria-label="Send message to AI Career Assistant"
                className="h-10 w-10 rounded-xl bg-[#285FEA] hover:bg-[#1E4BC8] text-white flex items-center justify-center shadow-xs transition-colors disabled:opacity-45 cursor-pointer shrink-0"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                ) : (
                  <Send className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between text-[10.5px] text-zinc-500 dark:text-zinc-400 px-1">
              <span>Type @ to pin sections/jobs · Closing drawer keeps tasks running</span>
              {draftInput.length > 8000 && (
                <span className={draftInput.length > 10000 ? 'text-rose-600 font-semibold' : ''}>
                  {draftInput.length.toLocaleString()} / 10,000
                </span>
              )}
            </div>
          </form>
        </div>
      </dialog>

      {/* Reused Phase 3 HITL Approval Modal */}
      <AgentApprovalModal
        isOpen={isApprovalModalOpen}
        resumeName={pageContext.activeResumeName || 'Active Resume'}
        proposal={activeProposal}
        confirmedMetricIds={confirmedMetricIds}
        onToggleMetricConfirm={toggleMetricConfirm}
        acceptedFieldPaths={getAcceptedFieldPaths()}
        onApprove={async (proposal, acceptedFieldPaths) => {
          setIsApprovalBusy(true);
          try {
            await approveProposal(proposal, acceptedFieldPaths);
            setIsApprovalModalOpen(false);
          } finally {
            setIsApprovalBusy(false);
          }
        }}
        onReject={async (proposal, reason) => {
          setIsApprovalBusy(true);
          try {
            await rejectProposal(proposal, reason);
            setIsApprovalModalOpen(false);
          } finally {
            setIsApprovalBusy(false);
          }
        }}
        onClose={() => setIsApprovalModalOpen(false)}
      />
    </>
  );
}
