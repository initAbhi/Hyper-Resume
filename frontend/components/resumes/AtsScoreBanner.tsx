'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Target,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ResumeAnalysis } from '@/lib/api-client';

interface AtsScoreBannerProps {
  score: number;
  analysis: ResumeAnalysis | null;
  isAnalyzing: boolean;
  onRunAudit: () => Promise<void>;
  onOpenDetails: () => void;
  resumeId: string;
}

export function AtsScoreBanner({
  score,
  analysis,
  isAnalyzing,
  onRunAudit,
  onOpenDetails,
  resumeId,
}: AtsScoreBannerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Status configuration based on score
  const getStatusInfo = (val: number) => {
    if (val >= 85) {
      return {
        label: 'High Alignment',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        strokeColor: '#10b981',
        pulseBg: 'bg-emerald-500',
      };
    }
    if (val >= 70) {
      return {
        label: 'Solid Evidence',
        badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        strokeColor: '#3b82f6',
        pulseBg: 'bg-blue-500',
      };
    }
    if (val >= 50) {
      return {
        label: 'Needs Metrics',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        strokeColor: '#f59e0b',
        pulseBg: 'bg-amber-500',
      };
    }
    return {
      label: 'Incomplete Sections',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      strokeColor: '#ef4444',
      pulseBg: 'bg-rose-500',
    };
  };

  const status = getStatusInfo(score);

  // SVG circular ring calculation (radius 16, circumference = 2 * PI * 16 ≈ 100.53)
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div className="print:hidden w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs transition-all duration-150 overflow-hidden">
      {/* Main Bar Content */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3">
        {/* Left: Score Badge & Title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Animated Circular Score Ring */}
          <button
            type="button"
            onClick={onOpenDetails}
            className="group relative flex items-center justify-center shrink-0 cursor-pointer focus:outline-hidden"
            title="Click to view detailed ATS audit breakdown"
          >
            <svg className="w-10 h-10 -rotate-90 transform" viewBox="0 0 40 40">
              {/* Background Track */}
              <circle
                cx="20"
                cy="20"
                r={radius}
                className="stroke-zinc-100 dark:stroke-zinc-800"
                strokeWidth="3.5"
                fill="transparent"
              />
              {/* Progress Stroke */}
              <circle
                cx="20"
                cy="20"
                r={radius}
                stroke={status.strokeColor}
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute font-mono font-black text-xs text-zinc-900 dark:text-zinc-100 group-hover:scale-105 transition-transform">
              {score}
            </span>
          </button>

          {/* Label, Status Badge & Insight Text */}
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${status.pulseBg} animate-pulse`} />
                Resume Alignment Score
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${status.badgeBg}`}
              >
                {status.label}
              </span>
            </div>

            {!isCollapsed && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-md hidden sm:block">
                {analysis
                  ? `Deep audit complete: ${analysis.findings?.bulletQuality?.length || 0} bullets analyzed · Action verbs & metrics verified`
                  : 'Live engine: Evaluating quantified outcomes, action verbs & section completeness'}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Run / Re-run Audit Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRunAudit}
            isLoading={isAnalyzing}
            className="text-xs py-1 px-2.5 h-8 font-medium gap-1.5 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Run Gemini ATS & STAR evidence audit"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">{analysis ? 'Re-run Audit' : 'Run Audit'}</span>
            <span className="sm:hidden">Audit</span>
          </Button>

          {/* View Details / Drawer Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenDetails}
            className="text-xs py-1 px-3 h-8 font-semibold gap-1.5 shadow-2xs"
            title="Open comprehensive evidence audit, findings & breakdown drawer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Audit Details</span>
            <span className="md:hidden">Details</span>
          </Button>

          {/* Quick Match JD Link */}
          <Link
            href={`/app/match?resumeId=${resumeId}`}
            className="hidden xl:inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Match with target job description"
          >
            <Target className="w-3.5 h-3.5 text-zinc-500" />
            <span>Match JD</span>
          </Link>

          {/* Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand banner' : 'Collapse banner'}
            aria-label={isCollapsed ? 'Expand banner' : 'Collapse banner'}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
