'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  RotateCcw,
  Check,
  ShieldCheck,
  TrendingUp,
  Sliders,
  CheckCheck
} from 'lucide-react';
import { ScoreMeter } from '@/components/resumes/ScoreMeter';

export function InteractiveHeroStudio() {
  const [isOptimized, setIsOptimized] = useState(true);

  return (
    <div className="relative w-full max-w-5xl mx-auto text-left">
      {/* Sleek Container Window Frame */}
      <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden transition-all">
        
        {/* macOS Window Chrome Header (Matches Rezi's high-contrast header) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#1e2433] text-white border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
            </div>
            <div className="h-4 w-px bg-zinc-700 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span className="truncate max-w-[200px] sm:max-w-none">
                Alex_Morgan_Product_Analyst.pdf
              </span>
            </div>
          </div>

          {/* ATS Status Pill */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isOptimized ? '98% ATS Pass' : '58% Needs Work'}</span>
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8 bg-zinc-50/60 dark:bg-zinc-950/40">
          
          {/* Interactive Mode Switcher (Clean, mobile-first segmented controller) */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200/80 dark:border-zinc-800 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-200/70 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIsOptimized(false)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  !isOptimized
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                1. Original Draft (Score: 58)
              </button>
              <button
                type="button"
                onClick={() => setIsOptimized(true)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                  isOptimized
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>2. AI Optimized (Score: 98)</span>
              </button>
            </div>

            <span className="text-xs text-zinc-500 hidden sm:inline">
              Click tabs to toggle live ATS score & STAR rewrite
            </span>
          </div>

          {/* Studio Grid: Document Canvas + Assistant Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Document Sheet Preview */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-5 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              {/* Document Header */}
              <div className="border-b border-zinc-900 dark:border-zinc-100 pb-2.5 mb-3 text-center">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white uppercase font-serif">
                  Alex Morgan
                </h3>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                  San Francisco, CA • (415) 555-0192 • alex.morgan@email.com • linkedin.com/in/alexmorgan
                </p>
              </div>

              {/* Experience Section */}
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 border-b border-zinc-900 dark:border-zinc-700 pb-0.5 mb-2">
                    Professional Experience
                  </h4>
                  
                  <div className="flex justify-between items-baseline font-bold text-zinc-950 dark:text-zinc-100">
                    <span>ClearPath Analytics — Senior Product Analyst</span>
                    <span className="text-[11px] text-zinc-500 font-normal">2022 – Present</span>
                  </div>

                  <ul className="mt-2 space-y-2 text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold">•</span>
                      <span>Built automated dbt SQL pipelines processing 12M+ weekly active user events with zero data regression.</span>
                    </li>

                    {/* The Interactive Optimized Bullet */}
                    <li
                      className={`p-2.5 rounded-xl border transition-all duration-300 ${
                        isOptimized
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                          : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`font-bold mt-0.5 ${isOptimized ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isOptimized ? '✓' : '✗'}
                        </span>
                        <div className="space-y-1">
                          <p className="leading-relaxed font-medium">
                            {isOptimized ? (
                              <>
                                <strong>Spearheaded 22 checkout pricing A/B experiments</strong>, identifying 3 high-converting funnels that <strong>increased quarterly ARR by $180K</strong> and reduced checkout drop-off by 14%.
                              </>
                            ) : (
                              <>
                                <span className="line-through text-zinc-500 mr-1.5">
                                  Collaborated with product managers on checkout pricing tests.
                                </span>
                                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block mt-1">
                                  ⚠️ Lacks quantifiable business metrics & active STAR leadership verb.
                                </span>
                              </>
                            )}
                          </p>
                          <div className="flex items-center gap-2 pt-0.5 text-[10px]">
                            {isOptimized ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300">
                                <CheckCheck className="w-3.5 h-3.5" />
                                STAR Metric Verified · 100% Truthful Scaffolding
                              </span>
                            ) : (
                              <span className="text-rose-600 font-medium">
                                Flagged by Workday & Greenhouse parser audits
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold">•</span>
                      <span>Engineered Tableau & Amplitude dashboards adopted by 45+ executives for quarterly retention roadmap.</span>
                    </li>
                  </ul>
                </div>

                {/* Core Competencies */}
                <div className="pt-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 border-b border-zinc-900 dark:border-zinc-700 pb-0.5 mb-1.5">
                    Core Competencies
                  </h4>
                  <p className="text-zinc-700 dark:text-zinc-300">
                    SQL (PostgreSQL, BigQuery, Snowflake), dbt, Experimentation (A/B Testing), Amplitude, Python, Statistical Cohorts, Tableau
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Live AI Score & STAR Assistant */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Score Meter Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
                <div className="w-full flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 text-xs">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                    Live ATS Score Meter
                  </span>
                  <span className={`font-bold ${isOptimized ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isOptimized ? 'Passed' : 'Needs Review'}
                  </span>
                </div>

                <div className="pt-3 pb-1 w-full">
                  <ScoreMeter score={isOptimized ? 98 : 58} />
                </div>

                <div className="grid grid-cols-2 gap-2 w-full mt-3 text-left text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Action Verbs</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {isOptimized ? '100% Strong' : '42% Weak/Passive'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">Quantified Impact</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {isOptimized ? '$180K + 14% lift' : 'Zero metrics'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instant Action CTA Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-zinc-900 dark:to-zinc-800/80 border border-blue-200/80 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-950 dark:text-white">
                      Build Your ATS Resume in 3 Minutes
                    </h5>
                    <p className="text-[11px] text-zinc-500">
                      Free export. 100% unwatermarked PDF.
                    </p>
                  </div>
                </div>

                <Link href="/login" className="block w-full">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <span>Start Building Free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
