'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  CheckCheck,
  ShieldCheck,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { ScoreMeter } from '@/components/resumes/ScoreMeter';

export function InteractiveHeroStudio() {
  const [isOptimized, setIsOptimized] = useState(true);
  const [liveScore, setLiveScore] = useState(0);

  // Smooth count-up on load (0 -> 98) and animated easing when toggling
  useEffect(() => {
    const target = isOptimized ? 98 : 58;
    const start = liveScore;
    let startTime: number | null = null;
    const duration = 1200; // ms

    let animId: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setLiveScore(Math.round(start + (target - start) * ease));
      if (progress < 1) animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isOptimized]);

  return (
    <div className="relative w-full max-w-5xl mx-auto text-left">
      {/* Sleek Container Window Frame */}
      <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl shadow-blue-500/5 overflow-hidden transition-all">
        
        {/* macOS Window Chrome Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 bg-[#131722] text-white border-b border-zinc-800/80 gap-2">
          {/* Traffic lights + Filename */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FF5F56] inline-block shadow-xs" />
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FFBD2E] inline-block shadow-xs" />
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27C93F] inline-block shadow-xs" />
            </div>
            
            <div className="h-3.5 w-px bg-zinc-700/60 hidden sm:block shrink-0" />
            
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 min-w-0">
              <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate max-w-[130px] xs:max-w-[200px] sm:max-w-none text-[11px] sm:text-xs">
                Alex_Morgan_Product_Analyst.pdf
              </span>
            </div>
          </div>

          {/* ATS Status Pill - Strictly No-Wrap & Responsive */}
          <div className="shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all whitespace-nowrap ${
                isOptimized
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-xs shadow-emerald-500/10'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-xs shadow-rose-500/10'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isOptimized ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span className="font-mono">{isOptimized ? `${liveScore}% ATS Pass` : `${liveScore}% Needs Work`}</span>
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3 sm:p-5 lg:p-7 bg-zinc-50/70 dark:bg-zinc-950/50">
          
          {/* Interactive Mode Switcher (Clean, mobile-first segmented controller) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 mb-4 border-b border-zinc-200/80 dark:border-zinc-800">
            <div className="w-full sm:w-auto grid grid-cols-2 p-1 bg-zinc-200/70 dark:bg-zinc-800/90 rounded-xl border border-zinc-200/90 dark:border-zinc-700/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIsOptimized(false)}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 sm:px-3.5 rounded-lg transition-all cursor-pointer ${
                  !isOptimized
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <span className="truncate">1. Original Draft</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                  !isOptimized
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-zinc-300/60 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}>
                  58
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsOptimized(true)}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 sm:px-3.5 rounded-lg transition-all cursor-pointer ${
                  isOptimized
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/25 font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                <span className="truncate">2. AI Optimized</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                  isOptimized
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-300/60 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}>
                  98
                </span>
              </button>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
              <span>Tap buttons to preview ATS transformation</span>
            </div>
          </div>

          {/* Studio Grid: Document Canvas + Assistant Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
            
            {/* Left: Document Sheet Preview (Executive ATS standard document) */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-4 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm transition-all">
              
              {/* Document Header */}
              <div className="border-b border-zinc-900 dark:border-zinc-200 pb-3 mb-3.5 text-center">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white uppercase font-sans">
                  Alex Morgan
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10.5px] sm:text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 font-medium">
                  <span>San Francisco, CA</span>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span>(415) 555-0192</span>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="truncate">alex.morgan@email.com</span>
                  <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
                  <span className="hidden sm:inline">linkedin.com/in/alexmorgan</span>
                </div>
              </div>

              {/* Experience Section */}
              <div className="space-y-3.5 text-xs">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 border-b border-zinc-900 dark:border-zinc-700 pb-1 mb-2.5">
                    Professional Experience
                  </h4>
                  
                  {/* Job Title & Date with anti-break protection */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-0.5 sm:gap-2 font-bold text-zinc-950 dark:text-zinc-100">
                    <span className="text-[12px] sm:text-[13px] leading-snug">
                      ClearPath Analytics <span className="font-normal text-zinc-400">—</span> Senior Product Analyst
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium shrink-0 whitespace-nowrap">
                      2022 – Present
                    </span>
                  </div>

                  <ul className="mt-2.5 space-y-2.5 text-zinc-700 dark:text-zinc-300">
                    {/* Bullet 1 */}
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-400 dark:text-zinc-500 font-bold shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed">
                        Built automated dbt SQL pipelines processing 12M+ weekly active user events with zero data regression.
                      </span>
                    </li>

                    {/* The Interactive AI Optimized Bullet (Diff Card) */}
                    <li
                      className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                        isOptimized
                          ? 'bg-emerald-500/[0.06] dark:bg-emerald-500/[0.12] border-emerald-500/40 dark:border-emerald-500/30 shadow-xs'
                          : 'bg-rose-500/[0.06] dark:bg-rose-500/[0.12] border-rose-500/40 dark:border-rose-500/30'
                      }`}
                    >
                      {/* Top micro-banner */}
                      <div className={`px-3 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider border-b ${
                        isOptimized
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          {isOptimized ? (
                            <>
                              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>AI Optimized (STAR Framework)</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                              <span>Original Draft (Needs Work)</span>
                            </>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[9.5px] ${
                          isOptimized
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-200'
                            : 'bg-rose-500/20 text-rose-700 dark:text-rose-200'
                        }`}>
                          {isOptimized ? '+40 pts' : 'Score: 58'}
                        </span>
                      </div>

                      {/* Content Body */}
                      <div className="p-3 sm:p-3.5 space-y-2">
                        {isOptimized ? (
                          <>
                            <p className="text-zinc-900 dark:text-zinc-100 leading-relaxed font-medium">
                              <strong className="text-zinc-950 dark:text-white">Spearheaded 22 checkout pricing A/B experiments</strong>, identifying 3 high-converting funnels that{' '}
                              <strong className="text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1 py-0.5 rounded">
                                increased quarterly ARR by $180K
                              </strong>{' '}
                              and reduced checkout drop-off by{' '}
                              <strong className="text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1 py-0.5 rounded">
                                14%
                              </strong>.
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5 border-t border-emerald-500/20 text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                              <span className="inline-flex items-center gap-1">
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                STAR Metric Verified
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                100% Truthful Scaffolding
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-zinc-500 dark:text-zinc-400 line-through leading-relaxed">
                              Collaborated with product managers on checkout pricing tests.
                            </p>
                            
                            <div className="space-y-1 pt-1 border-t border-rose-500/20 text-[10.5px] text-rose-700 dark:text-rose-300">
                              <div className="flex items-start gap-1.5">
                                <span className="text-rose-500 font-bold shrink-0">✕</span>
                                <span><strong>Passive action verb:</strong> &ldquo;Collaborated&rdquo; lacks ownership and impact.</span>
                              </div>
                              <div className="flex items-start gap-1.5">
                                <span className="text-rose-500 font-bold shrink-0">✕</span>
                                <span><strong>Zero business metrics:</strong> Lacks revenue, conversion lift, or scale numbers.</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </li>

                    {/* Bullet 3 */}
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-400 dark:text-zinc-500 font-bold shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed">
                        Engineered Tableau &amp; Amplitude dashboards adopted by 45+ executives for quarterly retention roadmap.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Core Competencies */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-1.5">
                    Core Competencies &amp; Technical Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['SQL (PostgreSQL, BigQuery)', 'dbt', 'A/B Testing', 'Amplitude', 'Python', 'Tableau'].map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10.5px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Live AI Score & STAR Assistant */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Score Meter Card */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
                <div className="w-full flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800 text-xs">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    Live ATS Score Meter
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                    isOptimized 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {isOptimized ? `Passed (${liveScore})` : `Needs Review (${liveScore})`}
                  </span>
                </div>

                <div className="pt-3 pb-1 w-full">
                  <ScoreMeter score={isOptimized ? 98 : 58} />
                </div>

                <div className="grid grid-cols-2 gap-2 w-full mt-3 text-left text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/60">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">Action Verbs</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-[11.5px] sm:text-xs">
                      {isOptimized ? '100% Leadership' : '42% Weak/Passive'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/60">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-0.5">Quantified Lift</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-[11.5px] sm:text-xs">
                      {isOptimized ? '$180K + 14%' : 'Zero metrics'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instant Action CTA Card */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-blue-50/20 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/90 border border-blue-200/80 dark:border-zinc-800 space-y-3.5 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 shadow-xs shadow-blue-500/30">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white leading-tight">
                      Build Your ATS Resume in 3 Minutes
                    </h5>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Free export • 100% unwatermarked PDF
                    </p>
                  </div>
                </div>

                <Link href="/login" className="block w-full">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <span>Start Building Free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
                
                <div className="flex items-center justify-center gap-3 text-[10.5px] text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    No credit card
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Instant download
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
