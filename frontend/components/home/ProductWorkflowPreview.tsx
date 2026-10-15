'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Sparkles, FileText, Briefcase, Check, RefreshCw } from 'lucide-react';

export function ProductWorkflowPreview() {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-2xl p-4 sm:p-6 lg:p-8 overflow-hidden text-left">
      {/* Product Workflow Titlebar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Live Application Optimizer Preview
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" className="gap-1 text-xs">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Evidence Synced
          </Badge>
          <span className="text-xs text-zinc-500 font-mono">Senior Backend Engineer</span>
        </div>
      </div>

      {/* 3-Column Deliberate Visual Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
        {/* 1. Job Description & Extracted Requirements (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <Briefcase className="w-4 h-4 text-blue-600" />
            Target Job Description (Excerpt)
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed italic bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
            &quot;Looking for a Backend Engineer with deep experience in PostgreSQL query optimization, resilient REST APIs, and microservices.&quot;
          </p>

          <div className="space-y-2 mt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Extracted Requirements
            </span>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs">
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">PostgreSQL Optimization</span>
              <Badge variant="success" className="text-[10px] py-0 px-2 gap-1">
                <CheckCircle2 className="w-3 h-3" /> Evidenced
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs">
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">REST API Design</span>
              <Badge variant="success" className="text-[10px] py-0 px-2 gap-1">
                <CheckCircle2 className="w-3 h-3" /> Evidenced
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs">
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">Distributed Caching (Redis)</span>
              <Badge variant="warning" className="text-[10px] py-0 px-2 gap-1">
                <AlertTriangle className="w-3 h-3" /> Unverified
              </Badge>
            </div>
          </div>
        </div>

        {/* 2. Candidate Master Resume Bullet (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <FileText className="w-4 h-4 text-indigo-600" />
            Candidate Master Resume (Experience)
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                FinTech Solutions — Software Engineer
              </span>
              <span className="text-[10px] text-zinc-500">2023 – Present</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              <strong className="text-zinc-800 dark:text-zinc-200">Original Bullet:</strong>
              <br />
              &quot;Worked on database optimization and backend APIs for payments processing.&quot;
            </p>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs space-y-1.5">
            <div className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Explainable Compatibility Analysis
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-normal">
              Candidate has evidenced PostgreSQL work in Project records. The original bullet is vague and lacks quantifiable outcomes requested by hiring panels.
            </p>
          </div>
        </div>

        {/* 3. Truthful Suggestion & Interactive Accept (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border-2 border-blue-500/30 bg-blue-50/30 dark:bg-blue-950/20 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
              Evidence-Backed Rewrite
            </div>
            <Badge variant="info" className="text-[10px]">
              STAR Method
            </Badge>
          </div>

          <div className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-900 text-xs leading-relaxed text-zinc-900 dark:text-zinc-100 font-medium">
            {accepted ? (
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Updated in tailored resume:
              </span>
            ) : (
              <span className="text-zinc-500 text-[11px] block mb-1">Proposed Tailored Bullet:</span>
            )}
            &quot;Engineered PostgreSQL indexing strategies and query optimizations, reducing p95 payment API latency by 34% across 1.2M daily transactions.&quot;
          </div>

          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
            🛡️ Strict Truthfulness: Sourced from verified metrics in candidate project repository. Zero hallucinated frameworks.
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button
              variant={accepted ? 'secondary' : 'primary'}
              size="sm"
              className="w-full text-xs"
              onClick={() => setAccepted(!accepted)}
            >
              {accepted ? 'Revert to Original' : 'Apply to Resume'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
