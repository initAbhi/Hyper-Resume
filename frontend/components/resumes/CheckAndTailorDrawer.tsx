'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Crown,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Sparkles,
  RefreshCw,
  Eye,
  Plus,
} from 'lucide-react';

interface KeywordItem {
  name: string;
  matched: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

interface CheckAndTailorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: string;
  targetCompany?: string;
  initialScore?: number;
  onToggleHighlights?: (enabled: boolean) => void;
  isHighlightsEnabled?: boolean;
}

export function CheckAndTailorDrawer({
  isOpen,
  onClose,
  targetRole = 'MERN Stack Developer',
  targetCompany = 'Cloudesign',
  initialScore = 81,
  onToggleHighlights,
  isHighlightsEnabled = true,
}: CheckAndTailorDrawerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(3); // 0 to 4
  const [isTailorOpen, setIsTailorOpen] = useState(true);

  const keywords: KeywordItem[] = [
    { name: 'MERN Stack', matched: true, priority: 'High' },
    { name: 'REST APIs', matched: true, priority: 'Medium' },
    { name: 'CI/CD', matched: true, priority: 'Medium' },
    { name: 'NestJS', matched: true, priority: 'High' },
    { name: 'PostgreSQL', matched: true, priority: 'High' },
    { name: 'Redis', matched: true, priority: 'Medium' },
    { name: 'Docker', matched: true, priority: 'Medium' },
    { name: 'Kubernetes', matched: false, priority: 'High' },
  ];

  // Simulation of scanning phases
  const handleRerunScan = () => {
    setIsScanning(true);
    setCurrentPhase(0);

    const timer1 = setTimeout(() => setCurrentPhase(1), 800);
    const timer2 = setTimeout(() => setCurrentPhase(2), 1700);
    const timer3 = setTimeout(() => setCurrentPhase(3), 2600);
    const timer4 = setTimeout(() => {
      setCurrentPhase(4);
      setIsScanning(false);
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-in Left Drawer (Matching Screenshot 1 & 2) */}
      <div className="relative w-full max-w-[440px] bg-white dark:bg-zinc-900 h-full shadow-2xl border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-sm text-zinc-900 dark:text-zinc-100">
            <span>Check & Tailor</span>
            <Info className="w-4 h-4 text-zinc-400" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Scanning Animation State (Screenshot 1) */}
          {isScanning ? (
            <div className="space-y-6 animate-in fade-in">
              {/* Target Role Tag */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    {targetRole}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 flex items-center gap-1">
                    <Bookmark className="w-3 h-3 fill-current" />
                    Bookmarked
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                  <span>{targetCompany}</span>
                  <span>•</span>
                  <span className="text-blue-600 font-medium">View in Job Tracker</span>
                </div>
              </div>

              {/* 4 Multi-Phase Steps with Spinners & Checkmarks */}
              <div className="space-y-3.5 pl-2">
                {/* Phase 0 */}
                <div className="flex items-center gap-3 text-xs">
                  {currentPhase > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                  )}
                  <span
                    className={
                      currentPhase >= 0
                        ? 'font-medium text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-400'
                    }
                  >
                    Reading the job description...
                  </span>
                </div>

                {/* Phase 1 */}
                <div className="flex items-center gap-3 text-xs">
                  {currentPhase > 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : currentPhase === 1 ? (
                    <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-300 dark:border-zinc-700 shrink-0" />
                  )}
                  <span
                    className={
                      currentPhase >= 1
                        ? 'font-medium text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-400'
                    }
                  >
                    Matching your skills & keywords...
                  </span>
                </div>

                {/* Phase 2 */}
                <div className="flex items-center gap-3 text-xs">
                  {currentPhase > 2 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : currentPhase === 2 ? (
                    <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-300 dark:border-zinc-700 shrink-0" />
                  )}
                  <span
                    className={
                      currentPhase >= 2
                        ? 'font-medium text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-400'
                    }
                  >
                    Checking core responsibilities...
                  </span>
                </div>

                {/* Phase 3 */}
                <div className="flex items-center gap-3 text-xs">
                  {currentPhase >= 3 && currentPhase === 4 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : currentPhase === 3 ? (
                    <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-zinc-300 dark:border-zinc-700 shrink-0" />
                  )}
                  <span
                    className={
                      currentPhase >= 3
                        ? 'font-medium text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-400'
                    }
                  >
                    Scoring your fit...
                  </span>
                </div>
              </div>

              {/* Shimmering Skeletons (Screenshot 1) */}
              <div className="space-y-3 pt-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse border border-zinc-200/50 dark:border-zinc-700/40 p-3 space-y-1.5"
                  >
                    <div className="w-1/3 h-2 bg-zinc-200 dark:bg-zinc-700 rounded" />
                    <div className="w-2/3 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Match Report State (Screenshot 2) */
            <div className="space-y-5 animate-in fade-in">
              {/* Job Match Card */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Job Match
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">
                    Ready to send at 85%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-emerald-600 font-mono">
                    {initialScore}%
                  </span>
                  <button
                    onClick={handleRerunScan}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs flex items-center gap-1 font-medium transition-colors"
                    title="Rescan"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-evaluate</span>
                  </button>
                </div>

                {/* Dual-Tone Progress Bar with 85% Marker Line */}
                <div className="relative w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${initialScore}%` }}
                  />
                  {/* Target line at 85% */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-zinc-900 dark:bg-zinc-100 z-10"
                    style={{ left: '85%' }}
                    title="Target: 85%"
                  />
                </div>
              </div>

              {/* Target Role Card */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    {targetRole}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 flex items-center gap-1">
                    <Bookmark className="w-3 h-3 fill-current" />
                    Bookmarked
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                  <span>{targetCompany}</span>
                  <span>•</span>
                  <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                    View in Job Tracker
                  </span>
                  <span>•</span>
                  <span className="text-zinc-600 cursor-pointer hover:underline">
                    Edit
                  </span>
                </div>
              </div>

              {/* Customize for Another Job Button */}
              <button
                onClick={handleRerunScan}
                className="w-full py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 flex items-center justify-center gap-1.5 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg transition-colors hover:border-blue-400"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Customize for another job</span>
              </button>

              {/* Tailor Your Resume Card (Upgrade Banner Screenshot 2) */}
              <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-gradient-to-br from-purple-50/50 to-indigo-50/30 dark:from-purple-950/20 dark:to-indigo-950/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    Tailor your resume to this job
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => alert('AI Auto-Tailoring feature available in PRO plans!')}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  <span>Upgrade to Tailor</span>
                </button>

                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Upgrade to auto-fix every gap below — keywords, summary, title and bullets — and get an application-ready resume.
                </p>
              </div>

              {/* Keyword Highlights Toggle Pill */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    Highlight ATS Keywords on Canvas
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleHighlights?.(!isHighlightsEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    isHighlightsEnabled ? 'bg-rose-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                      isHighlightsEnabled ? 'left-4.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Tailor to this Job Accordion Table (Screenshot 2) */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-xs">
                <button
                  onClick={() => setIsTailorOpen(!isTailorOpen)}
                  className="w-full px-4 py-3 flex items-center justify-between font-bold text-xs text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <span>Tailor to this job</span>
                  {isTailorOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </button>

                {isTailorOpen && (
                  <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>ATS KEYWORDS</span>
                    </div>

                    {/* Keywords Table (Screenshot 2) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                        <span>Keyword</span>
                        <div className="flex items-center gap-6">
                          <span>Status</span>
                          <span className="w-16 text-right">Priority</span>
                        </div>
                      </div>

                      {keywords.map((kw, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-50 dark:border-zinc-800/40"
                        >
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">
                            {kw.name}
                          </span>
                          <div className="flex items-center gap-6">
                            {kw.matched ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                            <span
                              className={`w-16 text-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                kw.priority === 'High'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60'
                                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                              }`}
                            >
                              {kw.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 5 suggestions to improve your ATS score */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-center space-y-2">
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">
                  5 suggestions to improve your ATS score
                </span>
                <p className="text-[11px] text-zinc-500">
                  Upgrade to see them all and fix them in one click.
                </p>
                <button
                  type="button"
                  onClick={() => alert('AI Auto-Fix will optimize all 5 bullets instantly!')}
                  className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 text-white dark:text-zinc-900 text-xs font-semibold rounded-lg transition-colors"
                >
                  View Suggestions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

