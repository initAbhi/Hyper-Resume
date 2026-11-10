'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCheck,
  CheckCircle2,
  EyeOff,
  LocateFixed,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  SpellCheck2,
  Wand2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  ResumeContent,
  WritingCheckCategory,
  WritingCheckResponse,
  WritingIssueItem,
} from '@/lib/api-client';
import {
  applyAllSafeFixes,
  applyWritingIssueFix,
  isAutoFixableIssue,
} from '@/lib/writing-checker';

interface FixMistakesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resumeTitle: string;
  resumeTargetRole?: string;
  content: ResumeContent;
  localReport: WritingCheckResponse;
  aiReport: WritingCheckResponse | null;
  activeReport: WritingCheckResponse;
  ignoredIds: string[];
  onIgnoreIssue: (issueId: string) => void;
  onResetIgnored: () => void;
  onApplyContent: (nextContent: ResumeContent) => void;
  onRunAiDeepCheck: () => Promise<void>;
  isRunningAiCheck: boolean;
  aiCheckError: string | null;
  onLocateIssue: (issue: WritingIssueItem) => void;
}

type FilterTabId = 'all' | WritingCheckCategory;

const FILTER_TABS: Array<{ id: FilterTabId; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'spelling', label: 'Spelling' },
  { id: 'grammar', label: 'Grammar' },
  { id: 'buzzword', label: 'Buzzwords' },
  { id: 'weak_phrasing', label: 'Clarity' },
];

const CATEGORY_META: Record<
  WritingCheckCategory,
  {
    label: string;
    pillClass: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  spelling: {
    label: 'Spelling',
    pillClass:
      'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    icon: SpellCheck2,
  },
  grammar: {
    label: 'Grammar',
    pillClass:
      'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: AlertTriangle,
  },
  buzzword: {
    label: 'Buzzword / Fluff',
    pillClass:
      'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    icon: Sparkles,
  },
  weak_phrasing: {
    label: 'Weak Phrasing',
    pillClass:
      'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    icon: AlertCircle,
  },
};

function renderDiffSegment(issue: WritingIssueItem) {
  const { originalText, matchedText, suggestedReplacement } = issue;
  if (!matchedText) {
    return (
      <span className="text-zinc-700 dark:text-zinc-300">{originalText}</span>
    );
  }
  const idx = originalText.toLowerCase().indexOf(matchedText.toLowerCase());
  if (idx === -1) {
    return (
      <span className="text-zinc-700 dark:text-zinc-300">{originalText}</span>
    );
  }

  const before = originalText.slice(0, idx);
  const target = originalText.slice(idx, idx + matchedText.length);
  const after = originalText.slice(idx + matchedText.length);
  const trimmedAfter = after.trimStart().toLowerCase();
  const repLower = (suggestedReplacement || '').trim().toLowerCase();
  const isRedundantWithTrailingText =
    !suggestedReplacement ||
    suggestedReplacement.startsWith('Trim') ||
    repLower === '(remove)' ||
    repLower === '(omit pronoun)' ||
    (repLower.length >= 6 && trimmedAfter.startsWith(repLower)) ||
    suggestedReplacement === issue.rewrittenText;

  return (
    <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
      {before}
      <mark className="px-1 py-0.5 rounded bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 line-through decoration-rose-500 font-medium">
        {target}
      </mark>
      {!isRedundantWithTrailingText && (
        <>
          {' '}
          <mark className="px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 font-semibold not-italic">
            {suggestedReplacement}
          </mark>
        </>
      )}
      {after}
    </span>
  );
}

export function FixMistakesDrawer({
  isOpen,
  onClose,
  resumeTitle,
  resumeTargetRole,
  content,
  aiReport,
  activeReport,
  ignoredIds,
  onIgnoreIssue,
  onResetIgnored,
  onApplyContent,
  onRunAiDeepCheck,
  isRunningAiCheck,
  aiCheckError,
  onLocateIssue,
}: FixMistakesDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pointerDownOutsideRef = useRef(false);
  const titleId = useId();

  const [activeTab, setActiveTab] = useState<FilterTabId>('all');
  const [liveStatusMessage, setLiveStatusMessage] = useState('');

  // Sync open state cleanly with native modal <dialog>
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const ignoredSet = useMemo(() => new Set(ignoredIds), [ignoredIds]);

  const visibleIssues = useMemo(
    () => (activeReport.issues || []).filter((i) => !ignoredSet.has(i.id)),
    [activeReport.issues, ignoredSet],
  );

  const counts = useMemo(() => {
    return {
      all: visibleIssues.length,
      spelling: visibleIssues.filter((i) => i.category === 'spelling').length,
      grammar: visibleIssues.filter((i) => i.category === 'grammar').length,
      buzzword: visibleIssues.filter((i) => i.category === 'buzzword').length,
      weak_phrasing: visibleIssues.filter((i) => i.category === 'weak_phrasing').length,
    };
  }, [visibleIssues]);

  const filteredIssues = useMemo(() => {
    if (activeTab === 'all') return visibleIssues;
    return visibleIssues.filter((i) => i.category === activeTab);
  }, [visibleIssues, activeTab]);

  const autoFixableVisible = useMemo(
    () => filteredIssues.filter(isAutoFixableIssue),
    [filteredIssues],
  );

  const handleApplySingle = (issue: WritingIssueItem) => {
    const updated = applyWritingIssueFix(content, issue);
    if (updated !== content) {
      onApplyContent(updated);
      setLiveStatusMessage(
        `Applied fix in ${issue.locationLabel}: replaced "${issue.matchedText}".`,
      );
    }
  };

  const handleApplyAll = () => {
    const { updated, appliedCount } = applyAllSafeFixes(
      content,
      autoFixableVisible,
    );
    if (appliedCount > 0) {
      onApplyContent(updated);
      setLiveStatusMessage(
        `Applied ${appliedCount} automatic fix${appliedCount === 1 ? '' : 'es'} cleanly.`,
      );
    }
  };

  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number,
  ) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const nextIdx = (idx + dir + FILTER_TABS.length) % FILTER_TABS.length;
    setActiveTab(FILTER_TABS[nextIdx].id);
    tabRefs.current[nextIdx]?.focus();
  };

  const scoreTone =
    activeReport.overallWritingScore >= 90
      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
      : activeReport.overallWritingScore >= 70
      ? 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
      : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800';

  const isPointerOutsideDialog = (e: React.PointerEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return false;
    const r = dialog.getBoundingClientRect();
    return (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    );
  };

  return (
    <dialog
      ref={dialogRef}
      id="fix-mistakes-drawer"
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onPointerDown={(e) => {
        pointerDownOutsideRef.current = isPointerOutsideDialog(e);
      }}
      onPointerUp={(e) => {
        if (pointerDownOutsideRef.current && isPointerOutsideDialog(e)) {
          onClose();
        }
        pointerDownOutsideRef.current = false;
      }}
      className="m-0 ml-auto h-full max-h-none w-full max-w-[460px] p-0 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xl [overscroll-behavior:contain] backdrop:bg-black/45 backdrop:backdrop-blur-xs backdrop:overflow-hidden backdrop:[overscroll-behavior:contain]"
    >
      <div className="flex flex-col h-full w-full">
        {/* Top Drawer Header */}
        <header className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <SpellCheck2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <h2
                id={titleId}
                className="text-sm font-bold text-zinc-900 dark:text-zinc-100"
              >
                Grammar, Spelling &amp; Clarity Audit
              </h2>
              {aiReport?.provider && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {aiReport.provider === 'mock' ? 'Rule + Engine Scan' : 'Gemini AI Deep Scan'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {resumeTitle || 'Resume Draft'}
              {resumeTargetRole ? ` · Target: ${resumeTargetRole}` : ''}
            </p>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close Grammar & Writing Audit"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Accessible Polite Status Region */}
        <div role="status" aria-live="polite" className="sr-only">
          {liveStatusMessage}
        </div>

        {/* Summary Score & Action Controls */}
        <section className="p-4 sm:px-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1.5 rounded-xl border text-center min-w-[74px] ${scoreTone}`}
              >
                <div className="text-lg font-extrabold font-mono leading-none">
                  {activeReport.overallWritingScore}
                </div>
                <div className="text-[9.5px] font-semibold uppercase tracking-wider mt-0.5 opacity-80">
                  Writing
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {visibleIssues.length === 0
                    ? 'No Writing Mistakes Detected'
                    : `${visibleIssues.length} Flagged Writing Item${
                        visibleIssues.length === 1 ? '' : 's'
                      }`}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {counts.spelling} spelling · {counts.grammar} grammar ·{' '}
                  {counts.buzzword} buzzwords · {counts.weak_phrasing} weak
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              id="fix-all-mistakes-btn"
              type="button"
              variant="primary"
              size="sm"
              disabled={autoFixableVisible.length === 0}
              onClick={handleApplyAll}
              className="text-xs gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Fix All Auto-Fixable ({autoFixableVisible.length})</span>
            </Button>

            <Button
              id="run-ai-writing-check-btn"
              type="button"
              variant="outline"
              size="sm"
              isLoading={isRunningAiCheck}
              onClick={() => void onRunAiDeepCheck()}
              className="text-xs gap-1.5 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            >
              {aiReport ? (
                <RefreshCw className="w-3.5 h-3.5" />
              ) : (
                <Wand2 className="w-3.5 h-3.5" />
              )}
              <span>{aiReport ? 'Re-run AI Deep Polish' : 'AI Deep Grammar Scan'}</span>
            </Button>
          </div>

          {aiCheckError && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-[11px]">
              {aiCheckError}
            </div>
          )}

          {/* Category Filter Tablist (single-row scrolling pattern) */}
          <div
            role="tablist"
            aria-label="Filter writing issues by category"
            className="flex items-center gap-1 overflow-x-auto pt-1 pb-0.5 border-t border-zinc-200/70 dark:border-zinc-800"
          >
            {FILTER_TABS.map((tab, idx) => {
              const selected = activeTab === tab.id;
              const tabCount = counts[tab.id];
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[idx] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  className={`relative flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap flex-none transition-colors ${
                    selected
                      ? 'text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/50 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      selected
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {tabCount}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Scrollable Issue Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="py-10 px-4 text-center space-y-3 rounded-xl border border-dashed border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {activeTab === 'all'
                    ? 'Writing Check Passed — Publication Ready'
                    : `No ${FILTER_TABS.find((t) => t.id === activeTab)?.label} Issues Found`}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  {activeReport.factualVerificationNotes}
                </p>
              </div>
              {ignoredIds.length > 0 && (
                <button
                  type="button"
                  onClick={onResetIgnored}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Restore {ignoredIds.length} dismissed alert(s)
                </button>
              )}
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const cat = CATEGORY_META[issue.category];
              const Icon = cat.icon;
              const autoFixable = isAutoFixableIssue(issue);

              return (
                <article
                  key={issue.id}
                  data-issue-id={issue.id}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-2.5"
                >
                  {/* Category + Field Location Header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold border ${cat.pillClass}`}
                      >
                        <Icon className="w-3 h-3 shrink-0" />
                        <span>{cat.label}</span>
                      </span>
                      <span className="text-[10.5px] font-medium text-zinc-500 dark:text-zinc-400 truncate max-w-[190px]">
                        {issue.locationLabel}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onLocateIssue(issue)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <LocateFixed className="w-3 h-3" />
                      <span>Locate</span>
                    </button>
                  </div>

                  {/* Reason */}
                  <p className="text-[11.5px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {issue.reason}
                  </p>

                  {/* Inline Highlighted Preview */}
                  <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 text-[11.5px] space-y-1.5">
                    <div>{renderDiffSegment(issue)}</div>
                    {autoFixable && issue.rewrittenText !== issue.originalText && (
                      <div className="pt-1.5 border-t border-zinc-200/60 dark:border-zinc-700/50 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{issue.rewrittenText}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => onIgnoreIssue(issue.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                    >
                      <EyeOff className="w-3 h-3" />
                      <span>Ignore</span>
                    </button>

                    {autoFixable ? (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleApplySingle(issue)}
                        className="h-7 text-[11px] px-2.5 gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Apply Fix</span>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onLocateIssue(issue)}
                        className="h-7 text-[11px] px-2.5 gap-1"
                      >
                        <LocateFixed className="w-3 h-3" />
                        <span>Edit in Form</span>
                      </Button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Footer Zero-Fabrication Notice */}
        <footer className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 flex items-center justify-between gap-2 text-[10.5px] text-zinc-500 dark:text-zinc-400 shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Zero-fabrication rewrite guard active</span>
          </span>
          {ignoredIds.length > 0 && (
            <button
              type="button"
              onClick={onResetIgnored}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Show {ignoredIds.length} ignored
            </button>
          )}
        </footer>
      </div>
    </dialog>
  );
}
