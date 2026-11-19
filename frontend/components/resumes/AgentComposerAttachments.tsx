'use client';

import React, { useCallback, useId, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowUpRight,
  FileText,
  Link2,
  Loader2,
  Paperclip,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  agentClient,
  type AgentApiClient,
  type AgentParsedAttachment,
  type AgentParsedJdAttachment,
  type AgentParsedResumeAttachment,
} from '@/lib/agent-client';

const MAX_CLIENT_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_EXT_REGEX = /\.(pdf|docx|txt)$/i;

export interface ComposerAttachmentState {
  status: 'idle' | 'uploading' | 'parsing_url' | 'ready' | 'error';
  fileName?: string;
  parsedResume: AgentParsedResumeAttachment | null;
  parsedJd: AgentParsedJdAttachment | null;
  errorMessage: string | null;
  liveAnnouncement: string;
}

export interface UseComposerAttachmentsOptions {
  client?: AgentApiClient;
  onResumeParsed?: (resume: AgentParsedResumeAttachment) => void;
  onJdParsed?: (jd: AgentParsedJdAttachment) => void;
}

export function useComposerAttachments(options: UseComposerAttachmentsOptions = {}) {
  const { client = agentClient, onResumeParsed, onJdParsed } = options;

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showUrlBar, setShowUrlBar] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [state, setState] = useState<ComposerAttachmentState>({
    status: 'idle',
    parsedResume: null,
    parsedJd: null,
    errorMessage: null,
    liveAnnouncement: '',
  });

  const dragDepthRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return;

      if (!ACCEPTED_EXT_REGEX.test(file.name)) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: 'Unsupported file type. Please drop a .pdf, .docx, or .txt file.',
          liveAnnouncement: 'Upload failed: unsupported file type.',
        }));
        return;
      }

      if (file.size > MAX_CLIENT_FILE_BYTES) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: 'File exceeds the 10 MB upload limit.',
          liveAnnouncement: 'Upload failed: file exceeds 10 megabytes.',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        status: 'uploading',
        fileName: file.name,
        errorMessage: null,
        liveAnnouncement: `Uploading and parsing ${file.name}…`,
      }));

      try {
        const result: AgentParsedAttachment = await client.uploadAttachment(file, 'auto');
        if (result.kind === 'resume') {
          setState((prev) => ({
            ...prev,
            status: 'ready',
            fileName: result.fileName,
            parsedResume: result,
            errorMessage: null,
            liveAnnouncement: `Resume ${result.resumeName} parsed. Instant ATS score is ${result.atsScore} out of 100.`,
          }));
          onResumeParsed?.(result);
        } else {
          setState((prev) => ({
            ...prev,
            status: 'ready',
            fileName: result.fileName,
            parsedJd: result,
            errorMessage: null,
            liveAnnouncement: `Job description attached: ${result.title} at ${result.companyName}.`,
          }));
          onJdParsed?.(result);
        }
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Unable to parse the uploaded file. Please try another PDF or DOCX.';
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: msg,
          liveAnnouncement: `Attachment error: ${msg}`,
        }));
      }
    },
    [client, onJdParsed, onResumeParsed],
  );

  const handleParseUrl = useCallback(
    async (rawUrl?: string) => {
      const target = (rawUrl ?? urlInput).trim();
      if (!target) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: 'Please paste a job posting URL (https://…).',
          liveAnnouncement: 'Please paste a valid job posting URL.',
        }));
        return;
      }

      if (!/^https?:\/\//i.test(target)) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: 'Job URL must start with https:// or http://',
          liveAnnouncement: 'Invalid URL scheme.',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        status: 'parsing_url',
        errorMessage: null,
        liveAnnouncement: 'Fetching and parsing job description URL…',
      }));

      try {
        const result = await client.parseJobUrl(target);
        setUrlInput('');
        setShowUrlBar(false);
        setState((prev) => ({
          ...prev,
          status: 'ready',
          parsedJd: result,
          errorMessage: null,
          liveAnnouncement: `Job description parsed: ${result.title} at ${result.companyName}.`,
        }));
        onJdParsed?.(result);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Could not extract job details from that URL. Try pasting the JD text directly.';
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: msg,
          liveAnnouncement: `Job URL parsing failed: ${msg}`,
        }));
      }
    },
    [client, onJdParsed, urlInput],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer?.types?.includes('Files')) return;
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current += 1;
    setIsDraggingOver(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer?.types?.includes('Files')) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer?.types?.includes('Files')) return;
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDraggingOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragDepthRef.current = 0;
      setIsDraggingOver(false);
      const droppedFile = e.dataTransfer?.files?.[0];
      if (droppedFile) {
        void handleFileUpload(droppedFile);
      }
    },
    [handleFileUpload],
  );

  const clearParsedResume = useCallback(() => {
    setState((prev) => ({
      ...prev,
      parsedResume: null,
      status: prev.parsedJd ? 'ready' : 'idle',
    }));
  }, []);

  const clearParsedJd = useCallback(() => {
    setState((prev) => ({
      ...prev,
      parsedJd: null,
      status: prev.parsedResume ? 'ready' : 'idle',
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errorMessage: null,
      status: prev.parsedResume || prev.parsedJd ? 'ready' : 'idle',
    }));
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    state,
    isDraggingOver,
    showUrlBar,
    setShowUrlBar,
    urlInput,
    setUrlInput,
    fileInputRef,
    openFilePicker,
    handleFileUpload,
    handleParseUrl,
    clearParsedResume,
    clearParsedJd,
    clearError,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}

export function AgentDropOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      data-testid="agent-drop-overlay"
      className="absolute inset-0 z-30 bg-blue-600/12 dark:bg-blue-500/20 backdrop-blur-[2px] border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center p-6 pointer-events-none"
    >
      <div className="bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800 rounded-2xl shadow-lg px-5 py-4 text-center max-w-xs space-y-1.5">
        <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <UploadCloud className="w-5 h-5" aria-hidden="true" />
        </div>
        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          Drop PDF, DOCX, or TXT to attach
        </p>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Resumes get an instant ATS audit; Job Descriptions attach for 1-click matching &amp; tailoring.
        </p>
      </div>
    </div>
  );
}

interface AgentAttachmentStatusBarProps {
  state: ComposerAttachmentState;
  showUrlBar: boolean;
  urlInput: string;
  onUrlInputChange: (val: string) => void;
  onSubmitUrl: () => void;
  onCloseUrlBar: () => void;
  onClearResume: () => void;
  onClearJd: () => void;
  onClearError: () => void;
  onQuickPrompt: (prompt: string) => void;
  disabled?: boolean;
  showOpenResumeLink?: boolean;
}

export function AgentAttachmentStatusBar({
  state,
  showUrlBar,
  urlInput,
  onUrlInputChange,
  onSubmitUrl,
  onCloseUrlBar,
  onClearResume,
  onClearJd,
  onClearError,
  onQuickPrompt,
  disabled = false,
  showOpenResumeLink = false,
}: AgentAttachmentStatusBarProps) {
  const urlInputId = useId();
  const isBusy = state.status === 'uploading' || state.status === 'parsing_url';

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCloseUrlBar();
      return;
    }
    if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault();
      onSubmitUrl();
    }
  };

  return (
    <div className="space-y-1.5">
      {/* Screen-reader polite status announcement */}
      <div className="sr-only" aria-live="polite" role="status">
        {state.liveAnnouncement}
      </div>

      {/* Inline JD URL Bar */}
      {showUrlBar && (
        <div
          data-testid="agent-jd-url-bar"
          className="flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-zinc-950 p-1.5 shadow-xs"
        >
          <Link2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ml-1 shrink-0" aria-hidden="true" />
          <label htmlFor={urlInputId} className="sr-only">
            Paste job posting URL
          </label>
          <input
            id={urlInputId}
            type="url"
            value={urlInput}
            disabled={isBusy}
            onChange={(e) => onUrlInputChange(e.target.value)}
            onKeyDown={handleUrlKeyDown}
            placeholder="Paste Greenhouse, Lever, Ashby, or career page URL (https://…)"
            autoFocus
            className="flex-1 min-w-0 bg-transparent text-[11.5px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none px-1"
          />
          <button
            type="button"
            disabled={isBusy || urlInput.trim().length === 0}
            onClick={onSubmitUrl}
            className="px-2.5 py-1 rounded-lg bg-[#285FEA] hover:bg-[#1E4BC8] text-white text-[11px] font-semibold transition-colors disabled:opacity-45 cursor-pointer shrink-0"
          >
            {state.status === 'parsing_url' ? (
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
            ) : (
              'Parse JD'
            )}
          </button>
          <button
            type="button"
            onClick={onCloseUrlBar}
            aria-label="Close job URL bar"
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Busy indicator chip */}
      {isBusy && (
        <div
          aria-busy="true"
          data-testid="agent-attachment-loading"
          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/30 px-2.5 py-1 text-[11px] text-blue-800 dark:text-blue-200 font-medium"
        >
          <Loader2 className="w-3 h-3 animate-spin shrink-0" aria-hidden="true" />
          <span>
            {state.status === 'uploading'
              ? `Parsing ${state.fileName || 'file'} & scoring ATS…`
              : 'Fetching & parsing job description URL…'}
          </span>
        </div>
      )}

      {/* Error alert chip */}
      {state.errorMessage && (
        <div
          role="alert"
          data-testid="agent-attachment-error"
          className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1.5 text-[11px] text-rose-700 dark:text-rose-300 flex items-start justify-between gap-2"
        >
          <span className="flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{state.errorMessage}</span>
          </span>
          <button
            type="button"
            onClick={onClearError}
            aria-label="Dismiss attachment error"
            className="p-0.5 rounded hover:bg-rose-200/60 dark:hover:bg-rose-900/50 cursor-pointer shrink-0"
          >
            <X className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Ready Parsed Resume Chip + Instant 1-Click Actions */}
      {state.parsedResume && (
        <div
          data-testid="agent-attached-resume-chip"
          className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/25 px-2.5 py-2 space-y-1.5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 text-[11px] font-semibold text-emerald-900 dark:text-emerald-200">
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              <span className="truncate">{state.parsedResume.resumeName}</span>
              <span className="rounded-full bg-emerald-600 text-white px-1.5 py-0.5 text-[10px] font-bold shrink-0">
                {`ATS ${state.parsedResume.atsScore}/100`}
              </span>
            </div>
            <button
              type="button"
              onClick={onClearResume}
              aria-label={`Dismiss ${state.parsedResume.resumeName} attachment banner`}
              className="p-0.5 rounded-full text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60 cursor-pointer shrink-0"
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                onQuickPrompt(
                  'Audit my newly uploaded resume and propose edits across headline, summary, bullets, and skills to push my ATS score above 95.',
                )
              }
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 text-[10.5px] font-semibold transition-colors disabled:opacity-45 cursor-pointer"
            >
              <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
              Fix to ATS 95+
            </button>
            {state.parsedJd && (
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  onQuickPrompt(
                    `Match and tailor my uploaded resume for ${state.parsedJd!.title} at ${state.parsedJd!.companyName}.`,
                  )
                }
                className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100/60 px-2 py-0.5 text-[10.5px] font-semibold transition-colors disabled:opacity-45 cursor-pointer"
              >
                Tailor to {state.parsedJd.companyName}
              </button>
            )}
            {showOpenResumeLink && (
              <Link
                href={`/app/resumes/${encodeURIComponent(state.parsedResume.resumeId)}`}
                className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-300 hover:underline ml-auto"
              >
                Open in Editor
                <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Ready Parsed JD Chip + Instant 1-Click Actions */}
      {state.parsedJd && (
        <div
          data-testid="agent-attached-jd-chip"
          className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/25 px-2.5 py-2 space-y-1.5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 text-[11px] font-semibold text-indigo-900 dark:text-indigo-200">
              <Link2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {`${state.parsedJd.title} @ ${state.parsedJd.companyName}`}
              </span>
              {state.parsedJd.workplace && (
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-200 px-1.5 py-0.5 text-[10px] font-medium shrink-0">
                  {state.parsedJd.workplace}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClearJd}
              aria-label={`Remove attached job description ${state.parsedJd.title}`}
              className="p-0.5 rounded-full text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200/60 dark:hover:bg-indigo-900/60 cursor-pointer shrink-0"
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                onQuickPrompt(
                  `Match my resume against ${state.parsedJd!.title} at ${state.parsedJd!.companyName} and show missing keywords.`,
                )
              }
              className="inline-flex items-center gap-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-0.5 text-[10.5px] font-semibold transition-colors disabled:opacity-45 cursor-pointer"
            >
              Match Resume
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                onQuickPrompt(
                  `Tailor my resume for ${state.parsedJd!.title} at ${state.parsedJd!.companyName} and propose edits to maximize ATS match.`,
                )
              }
              className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-zinc-900 border border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200 hover:bg-indigo-100/60 px-2 py-0.5 text-[10.5px] font-semibold transition-colors disabled:opacity-45 cursor-pointer"
            >
              <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
              Tailor Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface AgentAttachmentToolbarProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelected: (file: File) => void;
  onOpenFilePicker: () => void;
  showUrlBar: boolean;
  onToggleUrlBar: () => void;
  disabled?: boolean;
}

export function AgentAttachmentToolbar({
  fileInputRef,
  onFileSelected,
  onOpenFilePicker,
  showUrlBar,
  onToggleUrlBar,
  disabled = false,
}: AgentAttachmentToolbarProps) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="sr-only"
        aria-label="Upload PDF, DOCX, or TXT resume or job description"
        data-testid="agent-attachment-file-input"
        onChange={(e) => {
          const picked = e.target.files?.[0];
          if (picked) {
            onFileSelected(picked);
          }
          e.target.value = '';
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={onOpenFilePicker}
        title="Attach PDF/DOCX resume or job description"
        aria-label="Attach PDF or DOCX resume or job description"
        data-testid="agent-attach-file-btn"
        className="h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-colors disabled:opacity-45 cursor-pointer"
      >
        <Paperclip className="w-4 h-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onToggleUrlBar}
        aria-expanded={showUrlBar}
        title="Paste job posting URL"
        aria-label="Paste job posting URL"
        data-testid="agent-attach-url-btn"
        className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-colors disabled:opacity-45 cursor-pointer ${
          showUrlBar
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      >
        <Link2 className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
