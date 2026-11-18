'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  formatAgentApprovalError,
  type AgentApprovalProposal,
} from '@/lib/agent-client';
import { analyzeProposalChanges } from './AgentDiffCard';

export interface AgentApprovalModalProps {
  isOpen: boolean;
  resumeName: string;
  proposal: AgentApprovalProposal | null;
  confirmedMetricIds: Record<string, boolean>;
  onToggleMetricConfirm: (metricId: string, checked: boolean) => void;
  acceptedFieldPaths?: string[];
  onApprove: (proposal: AgentApprovalProposal, acceptedFieldPaths?: string[]) => Promise<void>;
  onReject: (proposal: AgentApprovalProposal, reason?: string) => Promise<void>;
  onClose: () => void;
}

export function AgentApprovalModal({
  isOpen,
  resumeName,
  proposal,
  confirmedMetricIds,
  onToggleMetricConfirm,
  acceptedFieldPaths,
  onApprove,
  onReject,
  onClose,
}: AgentApprovalModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const inFlightRef = useRef(false);
  const titleId = useId();
  const idPrefix = useId();
  const rejectReasonId = useId();

  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [errorState, setErrorState] = useState<{
    title: string;
    message: string;
    code: string;
  } | null>(null);

  // Live 1-second reactive countdown for proposal expiry window (UX-12)
  useEffect(() => {
    if (!isOpen || !proposal?.expiresAt) return;
    setNowMs(Date.now());
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, proposal?.expiresAt]);

  // Sync native <dialog> top-layer modal open/close state with isOpen prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && proposal) {
      setErrorState(null);
      if (!dialog.open && typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    } else if (dialog.open && typeof dialog.close === 'function') {
      dialog.close();
    }
  }, [isOpen, proposal]);

  // Handle native Escape / close events from the browser
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      if (inFlightRef.current) {
        e.preventDefault();
        return;
      }
      onClose();
    };

    const handleClose = () => {
      if (dialog.returnValue) {
        dialog.returnValue = '';
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('close', handleClose);
    };
  }, [onClose]);

  if (!proposal) {
    return (
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto p-0 rounded-2xl bg-transparent backdrop:bg-black/45 backdrop:backdrop-blur-xs"
      >
        <h2 id={titleId} className="sr-only">
          Review proposal
        </h2>
      </dialog>
    );
  }

  const stats = analyzeProposalChanges(proposal);
  const remainingMs = proposal.expiresAt
    ? Math.max(0, new Date(proposal.expiresAt).getTime() - nowMs)
    : null;
  const isExpired = remainingMs !== null && remainingMs <= 0;
  const countdownLabel =
    remainingMs !== null && remainingMs > 0
      ? `${Math.floor(remainingMs / 60000)}m ${String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0')}s`
      : null;
  const allRequiredConfirmed = stats.metricConfirmations.every((item) =>
    Boolean(confirmedMetricIds[item.id]),
  );

  const handleApproveClick = async () => {
    if (inFlightRef.current || !allRequiredConfirmed || isExpired) return;
    inFlightRef.current = true;
    setPendingAction('approve');
    setErrorState(null);

    try {
      await onApprove(proposal, acceptedFieldPaths);
      setRejectReason('');
      if (dialogRef.current?.open) {
        dialogRef.current.close('approved');
      }
    } catch (err) {
      setErrorState(formatAgentApprovalError(err));
    } finally {
      inFlightRef.current = false;
      setPendingAction(null);
    }
  };

  const handleRejectClick = async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setPendingAction('reject');
    setErrorState(null);

    try {
      await onReject(proposal, rejectReason.trim() || undefined);
      setRejectReason('');
      if (dialogRef.current?.open) {
        dialogRef.current.close('rejected');
      }
    } catch (err) {
      setErrorState(formatAgentApprovalError(err));
    } finally {
      inFlightRef.current = false;
      setPendingAction(null);
    }
  };

  const handleDismiss = () => {
    if (inFlightRef.current) return;
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      data-testid="agent-approval-modal"
      aria-labelledby={titleId}
      open={typeof window === 'undefined' ? isOpen : undefined}
      className="m-auto p-0 w-[calc(100vw-2rem)] max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xl backdrop:bg-black/45 backdrop:backdrop-blur-xs open:flex flex-col max-h-[85vh] overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight"
            >
              Approve &amp; Apply Resume Changes
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
              {resumeName || 'Untitled Resume'} · Expected version v{proposal.expectedResumeVersion}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          disabled={pendingAction !== null}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
          aria-label="Close approval modal"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
        {/* Summary Stats */}
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 p-3.5 space-y-2">
          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            {proposal.changeSummary || 'AI-proposed resume refinements'}
          </p>
          <dl className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 px-2 py-1.5">
              <dt className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                Sections
              </dt>
              <dd className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {stats.affectedSections}
              </dd>
            </div>
            <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 px-2 py-1.5">
              <dt className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                Edits
              </dt>
              <dd className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {stats.totalChanges}
              </dd>
            </div>
            <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 px-2 py-1.5">
              <dt className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                Base Version
              </dt>
              <dd className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                v{proposal.expectedResumeVersion}
              </dd>
            </div>
          </dl>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between gap-2 pt-0.5">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>
                A version snapshot is automatically created before applying verified edits.
              </span>
            </span>
            {countdownLabel && (
              <span className="shrink-0 font-mono text-[10.5px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded px-1.5 py-0.5">
                {countdownLabel}
              </span>
            )}
          </p>
        </div>

        {/* Expired Proposal Warning */}
        {isExpired && (
          <div
            role="alert"
            className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">This proposal has expired</p>
              <p className="mt-0.5">
                Proposals expire after 15 minutes for safety. Reject or close this dialog and ask the Agent to generate an updated proposal.
              </p>
            </div>
          </div>
        )}

        {/* Unverified Metric Confirmations */}
        {stats.metricConfirmations.length > 0 && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                Unverified Metric Verification ({stats.metricConfirmations.length})
              </span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              HyperResume never fabricates achievements. Confirm each metric below before applying changes to your resume.
            </p>
            <div className="space-y-2">
              {stats.metricConfirmations.map((item, idx) => {
                const checkboxId = `${idPrefix}-confirm-${idx}`;
                const checked = Boolean(confirmedMetricIds[item.id]);
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 rounded-lg bg-white/80 dark:bg-zinc-900/70 border border-amber-200/70 dark:border-amber-900/60 p-2"
                  >
                    <input
                      id={checkboxId}
                      type="checkbox"
                      checked={checked}
                      disabled={pendingAction !== null}
                      onChange={(e) => onToggleMetricConfirm(item.id, e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-amber-400 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <label
                      htmlFor={checkboxId}
                      className="text-xs text-zinc-800 dark:text-zinc-200 leading-snug cursor-pointer select-none"
                    >
                      <span className="block font-medium text-[11px] text-zinc-500 dark:text-zinc-400">
                        {item.sectionLabel}
                      </span>
                      {item.confirmationPrompt}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Optional Rejection Feedback (UX-07) */}
        <div className="space-y-1">
          <label
            htmlFor={rejectReasonId}
            className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400"
          >
            Rejection note (optional — helps refine the next proposal)
          </label>
          <input
            id={rejectReasonId}
            type="text"
            value={rejectReason}
            disabled={pendingAction !== null}
            onChange={(e) => setRejectReason(e.target.value)}
            maxLength={300}
            placeholder="e.g. Keep my original summary tone, focus only on backend metrics…"
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Actionable Backend Error Feedback */}
        {errorState && (
          <div
            role="alert"
            data-testid="approval-modal-error"
            data-error-code={errorState.code}
            className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-900 dark:text-rose-200 space-y-1"
          >
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {errorState.title}
            </p>
            <p className="leading-relaxed">{errorState.message}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/40 flex items-center justify-between gap-2">
        <button
          type="button"
          autoFocus
          onClick={handleDismiss}
          disabled={pendingAction !== null}
          className="px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 cursor-pointer"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRejectClick}
            disabled={pendingAction !== null}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {pendingAction === 'reject' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            Reject
          </button>

          <button
            type="button"
            onClick={handleApproveClick}
            disabled={pendingAction !== null || !allRequiredConfirmed || isExpired}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            {pendingAction === 'approve' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            Approve &amp; Apply
          </button>
        </div>
      </div>
    </dialog>
  );
}

