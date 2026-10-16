'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Sparkles, ArrowRight, Check } from 'lucide-react';

export function ProductWorkflowPreview() {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Ambient glow behind the card */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-blue-500/10 rounded-3xl blur-2xl opacity-60 dark:opacity-40 pointer-events-none" />
      
      <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <div className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1">
              <span className="text-[11px] text-zinc-400 font-mono">hyperresume.ai/app/resumes/optimize</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ATS Ready
            </span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
          
          {/* Left Panel: Job Requirements */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Job Requirements
              </h3>
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                3 found
              </span>
            </div>
            
            <div className="space-y-2">
              {[
                { skill: 'PostgreSQL Optimization', status: 'match' },
                { skill: 'REST API Design', status: 'match' },
                { skill: 'Redis Caching', status: 'gap' },
              ].map((req) => (
                <div key={req.skill} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">{req.skill}</span>
                  {req.status === 'match' ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Match
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Gap
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                <span>Match Score</span>
                <span className="font-bold text-zinc-900 dark:text-white">78%</span>
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all" style={{ width: '78%' }} />
              </div>
            </div>
          </div>

          {/* Center Panel: Original Bullet */}
          <div className="p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Original Bullet
            </h3>
            
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">FinTech Solutions — Software Engineer</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                &quot;Worked on database optimization and backend APIs for payments processing.&quot;
              </p>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <strong>Weak bullet.</strong> Vague responsibilities, no metrics, doesn&apos;t demonstrate the PostgreSQL expertise this role requires.
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <ArrowRight className="w-3 h-3" />
              <span>See improved version →</span>
            </div>
          </div>

          {/* Right Panel: AI Rewrite */}
          <div className="p-5 space-y-4 bg-blue-50/30 dark:bg-blue-950/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Improved Bullet
              </h3>
              <span className="text-[10px] font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full">
                STAR Method
              </span>
            </div>

            <div className={`p-3 rounded-lg border text-sm leading-relaxed font-medium transition-all ${
              accepted
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-white dark:bg-zinc-900 border-blue-200 dark:border-blue-800 text-zinc-800 dark:text-zinc-200'
            }`}>
              {accepted && (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs mb-2">
                  <Check className="w-3.5 h-3.5" />
                  Applied to resume
                </span>
              )}
              &quot;Engineered PostgreSQL indexing strategies and query optimizations, reducing p95 payment API latency by 34% across 1.2M daily transactions.&quot;
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Sourced from verified project metrics. Only your authentic experience is used.
            </p>

            <button
              className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                accepted
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
              }`}
              onClick={() => setAccepted(!accepted)}
            >
              {accepted ? 'Revert to original' : 'Apply to resume'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
