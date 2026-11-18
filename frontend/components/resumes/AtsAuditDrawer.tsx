'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Sparkles,
  ShieldCheck,
  Target,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScoreMeter } from '@/components/resumes/ScoreMeter';
import { AtsAuditBreakdown } from '@/components/resumes/AtsAuditBreakdown';
import type { ResumeAnalysis } from '@/lib/api-client';

interface AtsAuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  docked?: boolean;
  score: number;
  analysis: ResumeAnalysis | null;
  isAnalyzing: boolean;
  onRunAudit: () => Promise<void>;
  onOpenFixMistakes?: () => void;
  resumeId: string;
  resumeTitle?: string;
}

export function AtsAuditDrawer({
  isOpen,
  onClose,
  docked = false,
  score,
  analysis,
  isAnalyzing,
  onRunAudit,
  onOpenFixMistakes,
  resumeId,
  resumeTitle,
}: AtsAuditDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll only in overlay mode
  useEffect(() => {
    if (docked) return;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, docked]);

  if (!isOpen) return null;

  const panelBody = (
      <div
        className={
          docked
            ? 'w-full h-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm flex flex-col overflow-hidden'
            : 'relative w-full max-w-[480px] bg-white dark:bg-zinc-900 h-full shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col z-10 animate-in slide-in-from-right duration-250 pointer-events-auto'
        }
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <h2
                id="ats-audit-title"
                className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate"
              >
                Resume Alignment &amp; Audit
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {resumeTitle || 'ATS Compatibility Analysis'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
            aria-label="Close Audit Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Live ATS Score Meter Card */}
          <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/50 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Resume Alignment Score
                </span>
              </div>
              <span className="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400">
                {score}/100
              </span>
            </div>

            {/* Live Semi-Circle Meter */}
            <div className="pt-4 pb-2">
              <ScoreMeter score={score} />
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center mt-2 leading-relaxed">
              HyperResume internal comparison metric evaluating quantified outcomes, action verbs, and section completeness.
            </p>
          </div>

          {/* Deep AI Audit Card */}
          <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Evidence Audit
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRunAudit}
                isLoading={isAnalyzing}
                className="text-xs py-1 px-3 font-semibold gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{analysis ? 'Re-run Audit' : 'Run Audit'}</span>
              </Button>
            </div>

            {analysis ? (
              <AtsAuditBreakdown
                score={score}
                atsScore={analysis.findings.atsScore}
                matchScore={analysis.findings.matchScore}
                compositeScore={analysis.findings.compositeScore}
                findings={analysis.findings}
                recommendations={analysis.recommendations}
                compact
                onOpenFixMistakes={() => {
                  onClose();
                  onOpenFixMistakes?.();
                }}
              />
            ) : (
              <div className="text-center py-6 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 space-y-3">
                <Sparkles className="w-6 h-6 mx-auto text-blue-500/80 animate-pulse" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    No Deep Audit Generated Yet
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                    Run an audit to check bullet structure, STAR/XYZ outcome density, parser risks, and ATS keyword matching.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onRunAudit}
                  isLoading={isAnalyzing}
                  className="text-xs font-semibold"
                >
                  Run Deep Audit Now
                </Button>
              </div>
            )}
          </div>

          {/* Quick Match JD Link */}
          <div className="p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                Targeting a Specific Role?
              </span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
              Compare this resume with a target job description to verify required skills, missing keywords, and evidence alignment.
            </p>
            <Link
              href={`/app/match?resumeId=${resumeId}`}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-xs text-xs"
            >
              <span>Match with Job Description</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60 shrink-0 flex items-center justify-between gap-3">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Live Score: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{score}/100</strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-7"
          >
            {docked ? 'Collapse' : 'Close'}
          </Button>
        </div>
      </div>
  );

  if (docked) {
    return (
      <div id="ats-audit-drawer-root" className="h-full w-full" aria-labelledby="ats-audit-title">
        {panelBody}
      </div>
    );
  }

  return (
    <div
      id="ats-audit-drawer-root"
      className="fixed inset-0 z-50 flex justify-end pointer-events-none"
      role="dialog"
      aria-labelledby="ats-audit-title"
    >
      <div
        className="fixed inset-0 bg-black/25 lg:hidden pointer-events-auto transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {panelBody}
    </div>
  );
}
