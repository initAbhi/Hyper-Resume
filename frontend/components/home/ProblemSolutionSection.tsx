'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  XCircle, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  FileX, 
  FileCheck2,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProblemSolutionSection() {
  const problems = [
    {
      title: 'Scrambled ATS Parser Extractions',
      description: 'Multi-column layouts, graphics, and floating textboxes scramble linear text parsers in Workday, Greenhouse, and Ashby, merging dates and titles into gibberish.',
      tag: 'Format Failure',
    },
    {
      title: 'Vague, Passive Job Duties',
      description: 'Phrases like "Responsible for managing projects" get ignored by recruiters looking for quantifiable impact, metrics, and technical ownership.',
      tag: 'Weak Storytelling',
    },
    {
      title: 'AI Hallucinations & Fabricated Skills',
      description: 'Generic AI bots fabricate unearned qualifications, fake tools, or exaggerated numbers that collapse under scrutiny during technical interviews.',
      tag: 'Trust Breach',
    },
    {
      title: 'Blind Keyword Stuffing',
      description: 'Shoehorning raw keywords into hidden white text or unevidenced lists triggers algorithmic disqualification and immediate recruiter skepticism.',
      tag: 'Rejection Trap',
    },
  ];

  const solutions = [
    {
      title: 'Deterministic Single-Column Flow',
      description: 'Strict, single-column reading orders with recognized section landmarks (Experience, Education, Skills) ensure 100% clean, predictable ATS text extraction.',
      tag: 'ATS Engineered',
    },
    {
      title: 'STAR & XYZ Impact Structuring',
      description: 'Transform passive duties into evidence-backed accomplishments following Google\'s XYZ formula: "Accomplished [X], as measured by [Y], by doing [Z]."',
      tag: 'Verified Metrics',
    },
    {
      title: 'Evidence-Grounded AI Assistance',
      description: 'Our engine only structures facts, dates, and technologies you actually provide. It strictly refuses to invent fake employers or unearned skills.',
      tag: 'Zero Hallucinations',
    },
    {
      title: 'Transparent Requirement Gap Analysis',
      description: 'Quote target Job Descriptions line-by-line against your documented background. See clearly what is supported vs. what requires authentic upskilling.',
      tag: 'Cited Matching',
    },
  ];

  return (
    <section className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#090A10] text-white relative overflow-hidden border-t border-b border-white/[0.04]">
      {/* Ambient background radiance */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[400px] bg-rose-500/[0.04] blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[400px] bg-[#285FEA]/[0.06] blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-14 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 text-center mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-inner backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#285FEA] animate-pulse" />
            <span>Problem vs. Solution</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Why 75% of traditional resumes fail — and how HypeResume fixes it.
          </h2>
          
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Traditional resume builders prioritize cosmetic graphics over machine parsing. Generic AI chatbots invent fake credentials. HypeResume bridges human credibility with deterministic ATS architecture.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* THE PROBLEM CARD */}
          <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-b from-rose-950/20 to-[#0D0F18]/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-rose-500/15">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center font-bold">
                    <FileX className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">The Traditional Resume Trap</h3>
                    <p className="text-xs text-rose-400/90 font-medium">Why applications get silently ignored</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/20">
                  Legacy Flaws
                </span>
              </div>

              <div className="space-y-4">
                {problems.map((prob, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-rose-500/10 space-y-1.5 hover:bg-rose-500/[0.04] transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <h4 className="text-sm font-semibold text-zinc-100">{prob.title}</h4>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 shrink-0">
                        {prob.tag}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed pl-6">
                      {prob.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-xs text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Result: Low response rates, parsing rejection, and awkward interview gaps.</span>
            </div>
          </div>

          {/* THE SOLUTION CARD */}
          <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-emerald-950/20 to-[#0D0F18]/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-emerald-500/15">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">The HypeResume Standard</h3>
                    <p className="text-xs text-emerald-400/90 font-medium">Evidence-grounded &amp; ATS-deterministic</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/20">
                  100% Verified
                </span>
              </div>

              <div className="space-y-4">
                {solutions.map((sol, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-emerald-500/10 space-y-1.5 hover:bg-emerald-500/[0.04] transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <h4 className="text-sm font-semibold text-zinc-100">{sol.title}</h4>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 shrink-0">
                        {sol.tag}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed pl-6">
                      {sol.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs text-emerald-200">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Result: Uncompromised recruiter trust, clean parsing &amp; confident interviews.</span>
              </div>
              <Link href="/register">
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <span>Build Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

