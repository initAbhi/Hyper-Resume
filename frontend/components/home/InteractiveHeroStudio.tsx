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
  Zap,
  Target,
  Layers,
  ChevronRight,
  ExternalLink,
  Check
} from 'lucide-react';
import { ScoreMeter } from '@/components/resumes/ScoreMeter';

export function InteractiveHeroStudio() {
  // 3 Modes: 'original' | 'intelligence' | 'optimized'
  const [activeStage, setActiveStage] = useState<'original' | 'intelligence' | 'optimized'>('optimized');
  const [liveScore, setLiveScore] = useState(0);

  // Smooth count-up score animation on mode switch
  useEffect(() => {
    let target = 98;
    if (activeStage === 'original') target = 58;
    if (activeStage === 'intelligence') target = 86;

    const start = liveScore;
    let startTime: number | null = null;
    const duration = 800; // ms

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
  }, [activeStage]);

  return (
    <div className="relative w-full max-w-6xl mx-auto select-none">
      
      {/* Master Obsidian Cockpit Container (Sleek, Borderless Dark Glass) */}
      <div className="relative w-full rounded-3xl bg-[#0B0D16]/95 p-5 sm:p-7 lg:p-9 shadow-2xl backdrop-blur-2xl overflow-hidden">
        
        {/* Soft Volumetric Underglow */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-3/4 max-w-[700px] h-64 bg-[#5525F5]/25 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -top-24 right-10 w-96 h-64 bg-[#4263FF]/15 blur-3xl pointer-events-none rounded-full" />

        {/* Tactile Coordinate Grid Texture */}
        <div 
          className="absolute inset-0 opacity-[0.025] pointer-events-none" 
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.85) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* ========================================================
            TOP CHASSIS BAR: STAGE SWITCHER & LIVE ENGINE STATUS
        ======================================================== */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-6">
          
          {/* Stage Switcher Tabs */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-[#121424] shadow-inner max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveStage('original')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeStage === 'original'
                  ? 'bg-[#1C2034] text-rose-400 font-semibold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              1. Original Draft
            </button>
            
            <button
              onClick={() => setActiveStage('intelligence')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeStage === 'intelligence'
                  ? 'bg-[#1C2034] text-blue-400 font-semibold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              2. ATS Intelligence
            </button>

            <button
              onClick={() => setActiveStage('optimized')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeStage === 'optimized'
                  ? 'bg-[#5525F5] text-white font-semibold shadow-lg shadow-violet-500/35'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3. Job-Matched STAR</span>
            </button>
          </div>

          {/* Live Engine Status Badge */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-zinc-400 hidden sm:inline">Engine Status:</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold ${
              activeStage === 'optimized' 
                ? 'bg-emerald-500/15 text-emerald-300' 
                : activeStage === 'intelligence'
                ? 'bg-blue-500/15 text-blue-300'
                : 'bg-rose-500/15 text-rose-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                activeStage === 'optimized' 
                  ? 'bg-emerald-400 animate-pulse' 
                  : activeStage === 'intelligence' 
                  ? 'bg-blue-400 animate-pulse' 
                  : 'bg-rose-400'
              }`} />
              {activeStage === 'optimized' ? 'Verified 98% ATS Pass' : activeStage === 'intelligence' ? 'Scanning Token Layers' : 'Needs Optimization'}
            </span>
          </div>
        </div>

        {/* ========================================================
            COCKPIT GRID: BALANCED DOCKED FLANKS (ZERO OVERLAP, BORDERLESS)
        ======================================================== */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mt-2 text-left">
          
          {/* LEFT FLANK: LIVE METRICS & ATS AUDIT (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Card 1: Live ATS Score Audit Gauge */}
            <div className="rounded-2xl bg-[#101320]/95 p-6 text-white shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <TrendingUp className="w-4 h-4 text-[#5525F5]" />
                  <span>Live ATS Score</span>
                </div>
                <span className={`text-[10.5px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                  liveScore >= 80 
                    ? 'bg-emerald-500/15 text-emerald-400' 
                    : 'bg-rose-500/15 text-rose-400'
                }`}>
                  {liveScore >= 80 ? 'Passed (98)' : 'Review (58)'}
                </span>
              </div>

              {/* Gauge */}
              <div className="flex flex-col items-center py-1">
                <ScoreMeter score={liveScore} variant="dark" textColor="text-white" />
                <p className="text-[11px] text-zinc-400 font-mono mt-1 text-center">
                  Candidate: Alex Morgan · Senior Product Analyst
                </p>
              </div>

              {/* Detailed Breakdown Sub-meters */}
              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex justify-between items-center text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Action & Impact Verbs</span>
                  </span>
                  <span className="font-bold text-emerald-400 font-mono text-[11px]">
                    {activeStage === 'original' ? '52%' : '100%'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Quantifiable STAR Lift</span>
                  </span>
                  <span className="font-bold text-emerald-400 font-mono text-[11px]">
                    {activeStage === 'original' ? '+0 Pts' : '$180K + 14%'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Deterministic Single-Column</span>
                  </span>
                  <span className="font-bold text-blue-400 font-mono text-[11px]">
                    100% Pass
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Job Requirement Match Panel */}
            <div className="rounded-2xl bg-[#101320]/95 p-6 text-white shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Target className="w-4 h-4 text-[#5525F5]" />
                  <span>Job Requirement Match</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-2.5 py-1 rounded-full">
                  Target: Stripe
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#161928]">
                  <span className="text-zinc-300 text-[11.5px]">SQL / Analytics Engineering</span>
                  <span className="text-emerald-400 font-bold font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Verified Match
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#161928]">
                  <span className="text-zinc-300 text-[11.5px]">A/B Testing & ARR Impact</span>
                  <span className={`font-bold font-mono text-[10px] px-2 py-0.5 rounded-md ${
                    activeStage === 'original' 
                      ? 'bg-amber-500/10 text-amber-400' 
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {activeStage === 'original' ? 'Needs STAR Proof' : 'Verified Match'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#161928]">
                  <span className="text-zinc-300 text-[11.5px]">Single-Column A4 Parsing</span>
                  <span className="text-blue-400 font-bold font-mono text-[10px] bg-blue-500/10 px-2 py-0.5 rounded-md">
                    Deterministic
                  </span>
                </div>
              </div>

              {/* Application Branching Pill */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#5525F5]" />
                  <span>Branch: Tailored v2</span>
                </span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>A4 Ready</span>
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT FLANK: THE PRISTINE A4 RESUME DOCUMENT (lg:col-span-7) */}
          <div className="lg:col-span-7 w-full">
            <div className="relative rounded-2xl bg-white text-zinc-900 shadow-2xl p-6 sm:p-8 overflow-hidden transition-all">
              
              {/* Luminous laser scanning beam (active during ATS Intelligence stage) */}
              {activeStage === 'intelligence' && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#4263FF] to-transparent animate-scan-beam z-30 pointer-events-none shadow-[0_0_15px_#4263FF]" />
              )}

              {/* Resume Document Header */}
              <div className="pb-4 mb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                      ALEX MORGAN
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-[#5525F5] mt-0.5 font-sans">
                      Senior Product Analyst · Experimentation & Growth
                    </p>
                  </div>
                  
                  {/* Document format badge */}
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 shrink-0">
                    A4 · UTF-8 · Selectable
                  </span>
                </div>

                {/* Contact meta strip */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500 mt-2 font-mono">
                  <span>San Francisco, CA</span>
                  <span>•</span>
                  <span>alex.morgan@email.com</span>
                  <span>•</span>
                  <span className="text-[#4263FF]">linkedin.com/in/alexmorgan</span>
                </div>
              </div>

              {/* Experience Section */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-zinc-900 uppercase tracking-wider text-[11px]">
                      Professional Experience
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">2021 — PRESENT</span>
                  </div>
                  
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-semibold text-zinc-800">ClearPath Analytics — Senior Product Analyst</span>
                    <span className="text-[10px] text-zinc-500">San Francisco</span>
                  </div>
                </div>

                {/* Standard Baseline Bullet */}
                <div className="flex items-start gap-2 text-[11.5px] text-zinc-600 leading-relaxed">
                  <span className="text-zinc-400 font-bold shrink-0 mt-0.5">•</span>
                  <span>
                    Built automated dbt SQL pipelines processing 12M+ weekly active user events with zero data regression across production models.
                  </span>
                </div>

                {/* ========================================================
                    DYNAMIC BULLET: TRANSFORMING (ORIGINAL vs. STAR OPTIMIZED)
                ======================================================== */}
                <div 
                  className={`p-4 rounded-xl transition-all duration-300 relative ${
                    activeStage === 'original'
                      ? 'bg-rose-50/90 text-zinc-700'
                      : 'bg-gradient-to-r from-emerald-50/95 via-blue-50/70 to-purple-50/50 shadow-xs'
                  }`}
                >
                  {/* Bullet Transformation Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider font-mono ${
                      activeStage === 'original' ? 'text-rose-600' : 'text-emerald-700'
                    }`}>
                      {activeStage === 'original' ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Original Draft (Vague / Missing Proof)</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-[#5525F5]" />
                          <span>AI Optimized (STAR / XYZ Framework)</span>
                        </>
                      )}
                    </span>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      activeStage === 'original' 
                        ? 'bg-rose-100 text-rose-700' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {activeStage === 'original' ? '+0 Pts' : '+40 Pts ATS Lift'}
                    </span>
                  </div>

                  {/* Bullet Content */}
                  <p className="text-[12px] leading-relaxed text-zinc-800">
                    {activeStage === 'original' ? (
                      <span>
                        Responsible for checkout experiments and analyzing funnel drop-offs with cross-functional product and engineering teams.
                      </span>
                    ) : (
                      <span>
                        <strong className="text-zinc-950 font-bold underline decoration-[#5525F5]/40 decoration-2">
                          Spearheaded 22 checkout pricing A/B experiments
                        </strong>
                        , identifying 3 high-converting funnels that{' '}
                        <span className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-semibold">
                          increased quarterly ARR by $180K
                        </span>{' '}
                        and reduced checkout drop-off by{' '}
                        <span className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded font-semibold">
                          14%
                        </span>.
                      </span>
                    )}
                  </p>

                  {/* Grounding Verification Markers */}
                  {activeStage !== 'original' && (
                    <div className="flex items-center gap-3 mt-2.5 pt-2 text-[10px] text-zinc-600">
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                        <CheckCheck className="w-3 h-3" />
                        <span>STAR Metric Verified</span>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-medium text-zinc-600">
                        <ShieldCheck className="w-3 h-3 text-[#5525F5]" />
                        <span>100% Fact-Grounded</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Second Supporting Bullet */}
                <div className="flex items-start gap-2 text-[11.5px] text-zinc-600 leading-relaxed">
                  <span className="text-zinc-400 font-bold shrink-0 mt-0.5">•</span>
                  <span>
                    Engineered Tableau & Amplitude executive retention cockpits adopted by 45+ stakeholders for monthly roadmap prioritization.
                  </span>
                </div>

                {/* Skills Tag Cloud */}
                <div className="pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono block mb-1.5">
                    Core Competencies & Verified Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['SQL (PostgreSQL, BigQuery)', 'dbt', 'A/B Testing', 'Amplitude', 'Python', 'Tableau'].map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 text-[10.5px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* ========================================================
            BOTTOM INTERACTIVE HINT & CALL TO ACTION
        ======================================================== */}
        <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5525F5] animate-ping" />
            <span>Click tabs above to toggle between Original Draft, ATS Intelligence, and Job-Matched STAR.</span>
          </div>

          <Link 
            href="/register" 
            className="inline-flex items-center gap-1 text-white hover:text-[#A5B4FC] font-medium transition-colors cursor-pointer"
          >
            <span>Start Building with Your Profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}
