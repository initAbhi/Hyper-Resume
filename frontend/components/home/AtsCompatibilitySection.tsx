'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Layers,
  FileCheck2,
  TrendingUp
} from 'lucide-react';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { AnimatedList } from '@/components/reactbits/AnimatedList';

export function AtsCompatibilitySection() {
  const [activeTab, setActiveTab] = useState<'optimized' | 'draft'>('optimized');

  const liveChecks = [
    {
      id: 1,
      title: 'Deterministic ATS Document Flow',
      subtitle: 'Strict single-column hierarchy extracts cleanly in Workday, Greenhouse, Ashby, and Lever without scrambled text.',
      badge: '100% Parsable',
      badgeType: 'success' as const,
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 2,
      title: 'STAR & XYZ Metric Verification',
      subtitle: 'Every bullet is structured around Action + Context + Quantifiable Result ($180K ARR / 42% Latency).',
      badge: '+40 Pts Lift',
      badgeType: 'highlight' as const,
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 3,
      title: 'Grounded Evidence Matching',
      subtitle: 'Aligns job requirements to documented facts in your profile — strict anti-hallucination guardrails.',
      badge: 'Verified Match',
      badgeType: 'info' as const,
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 4,
      title: 'True Vector UTF-8 Encoding',
      subtitle: 'Preserves crisp selectable text layers that human recruiters and automated parsers read accurately.',
      badge: 'Clean PDF',
      badgeType: 'success' as const,
      icon: <FileCheck2 className="w-4 h-4" />,
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#090A10] text-white relative overflow-hidden">
      
      {/* Soft Ambient Radial Light */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[400px] bg-[#5525F5]/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Editorial Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D946EF] animate-pulse" />
            <span>Proven Candidate Outcomes</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
            Turn raw experience into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#A5B4FC]">
              interview-winning impact.
            </span>
          </h2>
          
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            See how generic job responsibilities are automatically restructured into quantified, ATS-verified achievements that executive hiring teams love.
          </p>
        </div>

        {/* 2-Column Visual Showcase (No harsh static borders!) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Left Column: Interactive Before vs. After Card */}
          <div className="lg:col-span-7 h-full">
            <SpotlightCard 
              className="p-6 sm:p-8 h-full flex flex-col justify-between"
              spotlightColor="rgba(217, 70, 239, 0.15)"
              borderGlowColor="rgba(217, 70, 239, 0.5)"
            >
              <div className="space-y-6">
                
                {/* Header & Mode Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.04]">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-fuchsia-400">
                      Live Bullet Transformation
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      Senior Backend Engineer Example
                    </h3>
                  </div>

                  <div className="inline-flex p-1 rounded-lg bg-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => setActiveTab('draft')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        activeTab === 'draft'
                          ? 'bg-rose-500/20 text-rose-300 font-semibold shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Original Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('optimized')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        activeTab === 'optimized'
                          ? 'bg-[#5525F5] text-white font-semibold shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      AI Optimized
                    </button>
                  </div>
                </div>

                {/* Displayed State */}
                {activeTab === 'draft' ? (
                  <div className="p-5 rounded-xl bg-rose-500/5 space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        Unoptimized Candidate Draft
                      </span>
                      <span className="text-zinc-500">Score: 58 / 100</span>
                    </div>

                    <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                      &quot;Responsible for writing backend APIs and improving database queries. Worked with Node.js and PostgreSQL to handle user requests and keep the app running.&quot;
                    </p>

                    <div className="pt-3 border-t border-rose-500/10 space-y-2 text-xs text-rose-300/80">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-400">✕</span>
                        <span>Lacks quantified performance metrics or throughput figures</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-rose-400">✕</span>
                        <span>Generic passive verbs (&quot;Responsible for&quot;, &quot;Worked with&quot;)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-gradient-to-br from-violet-500/10 via-[#151728] to-fuchsia-500/5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-fuchsia-400 font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                        HypeResume STAR Optimization
                      </span>
                      <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/15">
                        Score: 98 / 100 (+40 pts)
                      </span>
                    </div>

                    <p className="text-sm text-white leading-relaxed font-sans font-medium">
                      &quot;Architected distributed BullMQ queue workers and optimized PostgreSQL indexing, reducing p99 API query latency by <span className="text-emerald-300 font-semibold underline decoration-emerald-500/50 underline-offset-2">42%</span> and scaling core throughput to <span className="text-emerald-300 font-semibold underline decoration-emerald-500/50 underline-offset-2">18,000 req/sec</span> across 500K registered users.&quot;
                    </p>

                    <div className="pt-3 border-t border-white/[0.04] flex flex-wrap gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-fuchsia-500/15 text-fuchsia-300 font-mono text-[11px] font-semibold">
                        Action Verb: Architected
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-mono text-[11px] font-semibold">
                        Quantified: 42% latency reduction
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 font-mono text-[11px] font-semibold">
                        Scale: 18,000 req/sec
                      </span>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Card Action */}
              <div className="pt-6 mt-6 border-t border-white/[0.04] flex items-center justify-between text-xs text-zinc-400">
                <span>Grounds achievements strictly in verified candidate facts.</span>
                <Link 
                  href="/tools/bullet-improver"
                  className="font-semibold text-fuchsia-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                >
                  <span>Try Bullet Improver</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </SpotlightCard>
          </div>

          {/* Right Column: React Bits AnimatedList of Real-Time Checks */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-3 mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                Automated Verification Engine
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Click any verification layer to inspect standard ATS parsing and recruiting guidelines:
              </p>
            </div>

            {/* React Bits Animated List Component */}
            <AnimatedList items={liveChecks} interval={4000} />

            <div className="pt-4 mt-2">
              <Link href="/login" className="block w-full">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center rounded-xl text-xs font-semibold h-11 px-4 bg-white/[0.05] hover:bg-white/[0.1] text-white hover:text-fuchsia-300 transition-all cursor-pointer shadow-sm"
                >
                  <span>Build an ATS-Verified Resume</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </button>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
