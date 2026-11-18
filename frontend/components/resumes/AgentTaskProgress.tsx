'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  Ban,
  Coins,
  XCircle,
} from 'lucide-react';
import type { AgentPlanStep, AgentTaskStatus } from '@/lib/agent-client';

export interface AgentTaskProgressProps {
  taskId?: string | null;
  status: AgentTaskStatus;
  goal?: string;
  steps: AgentPlanStep[];
  statusMessage?: string | null;
  errorMessage?: string | null;
  isCancelling?: boolean;
  onCancel?: () => void;
  onRetry?: () => void;
}

const TOOL_FRIENDLY_LABELS: Record<string, string> = {
  read_resume: 'Reading your resume',
  read_resume_versions: 'Checking resume version history',
  read_career_profile: 'Reviewing your career profile',
  run_ats_audit: 'Auditing ATS compliance and scoring',
  match_job_description: 'Analyzing job requirements',
  generate_bullet_variations: 'Generating bullet improvements',
  propose_resume_edits: 'Preparing a resume proposal',
  apply_approved_edits: 'Applying approved changes',
  restore_resume_version: 'Restoring resume version',
  update_career_profile: 'Updating career profile',
  search_discovered_jobs: 'Searching matching roles',
  save_job_to_tracker: 'Saving role to job tracker',
  create_resume: 'Creating resume draft',
  generate_cover_letter: 'Drafting tailored cover letter',
  start_interview_session: 'Preparing mock interview session',
};

export function getFriendlyStepLabel(step: AgentPlanStep): string {
  if (TOOL_FRIENDLY_LABELS[step.toolName]) {
    return TOOL_FRIENDLY_LABELS[step.toolName];
  }
  return step.description || step.toolName.replace(/_/g, ' ');
}

export function getFriendlyTaskStatusHeading(
  status: AgentTaskStatus,
  steps: AgentPlanStep[],
  statusMessage?: string | null,
): string {
  const activeStep = steps.find((s) => s.status === 'EXECUTING');
  switch (status) {
    case 'PENDING':
      return 'Understanding your request';
    case 'PLANNING':
      return 'Creating an execution plan';
    case 'RUNNING':
      if (activeStep) {
        return getFriendlyStepLabel(activeStep);
      }
      return statusMessage || 'Executing your request';
    case 'AWAITING_APPROVAL':
      return 'Waiting for your approval';
    case 'AWAITING_CREDITS':
      return 'Additional credits required to continue';
    case 'COMPLETED':
      return 'Task completed';
    case 'FAILED':
      return 'Task could not be completed';
    case 'CANCELLED':
      return 'Task cancelled';
    default:
      return 'Processing request';
  }
}

const STATUS_BADGE_STYLES: Record<
  AgentTaskStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: 'Queued',
    className:
      'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
  },
  PLANNING: {
    label: 'Planning',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  },
  RUNNING: {
    label: 'Running',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  },
  AWAITING_APPROVAL: {
    label: 'Approval Required',
    className:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  },
  AWAITING_CREDITS: {
    label: 'Credits Needed',
    className:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  },
  COMPLETED: {
    label: 'Completed',
    className:
      'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  },
  FAILED: {
    label: 'Failed',
    className:
      'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
  },
  CANCELLED: {
    label: 'Cancelled',
    className:
      'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
  },
};

export function AgentTaskProgress({
  status,
  goal,
  steps,
  statusMessage,
  errorMessage,
  isCancelling = false,
  onCancel,
  onRetry,
}: AgentTaskProgressProps) {
  const badge = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.PENDING;
  const heading = getFriendlyTaskStatusHeading(status, steps, statusMessage);
  const isActive =
    status === 'PENDING' ||
    status === 'PLANNING' ||
    status === 'RUNNING' ||
    status === 'AWAITING_APPROVAL';

  return (
    <div
      data-testid="agent-task-progress"
      data-task-status={status}
      className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-2xs p-3.5 space-y-3"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="mt-0.5 shrink-0" aria-hidden="true">
            {(status === 'PENDING' || status === 'PLANNING' || status === 'RUNNING') && (
              <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin motion-reduce:animate-none" />
            )}
            {status === 'AWAITING_APPROVAL' && (
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            )}
            {status === 'AWAITING_CREDITS' && (
              <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            )}
            {status === 'COMPLETED' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
            {status === 'FAILED' && (
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            )}
            {status === 'CANCELLED' && (
              <Ban className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            )}
          </div>
          <div className="min-w-0">
            <p
              role="status"
              aria-live="polite"
              className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug"
            >
              {heading}
            </p>
            {goal && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                {goal}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.className}`}
          >
            {badge.label}
          </span>
          {isActive && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isCancelling}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
              aria-label="Cancel active task"
            >
              {isCancelling ? 'Cancelling…' : 'Cancel'}
            </button>
          )}
        </div>
      </div>

      {/* Ordered Execution Steps */}
      {steps.length > 0 && (
        <ol className="space-y-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/80" aria-label="Execution steps">
          {steps.map((step) => {
            const label = getFriendlyStepLabel(step);
            const stateText =
              step.status === 'COMPLETED'
                ? 'Completed'
                : step.status === 'EXECUTING'
                  ? 'In progress'
                  : step.status === 'FAILED'
                    ? 'Failed'
                    : step.status === 'SKIPPED'
                      ? 'Skipped'
                      : 'Pending';

            return (
              <li
                key={`${step.stepIndex}-${step.toolName}`}
                data-step-status={step.status}
                className="flex items-start gap-2 text-xs"
              >
                <span className="mt-0.5 shrink-0" aria-hidden="true">
                  {step.status === 'COMPLETED' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {step.status === 'EXECUTING' && (
                    <Loader2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin motion-reduce:animate-none" />
                  )}
                  {step.status === 'FAILED' && (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  )}
                  {(step.status === 'PENDING' || step.status === 'SKIPPED') && (
                    <Circle className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <span
                    className={
                      step.status === 'COMPLETED'
                        ? 'text-zinc-700 dark:text-zinc-300'
                        : step.status === 'EXECUTING'
                          ? 'font-medium text-zinc-900 dark:text-zinc-100'
                          : step.status === 'FAILED'
                            ? 'font-medium text-rose-700 dark:text-rose-300'
                            : 'text-zinc-400 dark:text-zinc-500'
                    }
                  >
                    {label}
                  </span>
                  <span className="sr-only"> — {stateText}</span>
                  {step.error && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                      {step.error}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Critical Error / Credits Alert */}
      {(status === 'FAILED' || status === 'AWAITING_CREDITS' || status === 'CANCELLED') && (errorMessage || status === 'CANCELLED') && (
        <div
          role={status === 'CANCELLED' ? 'status' : 'alert'}
          className={`rounded-lg px-3 py-2 text-xs border flex flex-wrap items-center justify-between gap-2 ${status === 'AWAITING_CREDITS'
              ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
              : status === 'CANCELLED'
                ? 'bg-zinc-50 border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300'
                : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
            }`}
        >
          <span className="flex-1 min-w-0">
            {errorMessage || statusMessage || 'Task was cancelled.'}
          </span>
          {status === 'AWAITING_CREDITS' && (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 text-[11px] font-semibold transition-colors shrink-0"
            >
              Buy Credits / Upgrade
              <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          )}
          {(status === 'FAILED' || status === 'CANCELLED') && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-zinc-900 border border-current/25 px-2.5 py-1 text-[11px] font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}

