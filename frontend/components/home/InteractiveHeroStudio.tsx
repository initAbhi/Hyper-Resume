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
  ExternalLink
} from 'lucide-react';
import { ScoreMeter } from '@/components/resumes/ScoreMeter';

export function InteractiveHeroStudio() {
  // 3 Modes: 'original' | 'intelligence' | 'optimized'
  const [activeStage, setActiveStage] = useState<'original' | 'intelligence' | 'optimized'>('optimized');
  const [liveScore, setLiveScore] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth count-up score animation on mode switch
  useEffect(() => {
    let target = 98;
    if (activeStage === 'original') target = 58;
    if (activeStage === 'intelligence') target = 86;

    const start = liveScore;
    let startTime: number | null = null;
    const duration = 900; // ms

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
      
      {/* Interactive Stage Selector Controls (Apple / Linear style Segmented Pill) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-1">
        
        {/* Stage Switcher Tabs */}
        <div className="inline-flex items-center p-1 rounded-xl bg-[#11131C] border border-[#222638] shadow-lg max-w-full overflow-x-auto">
          <button
            onClick={() => setActiveStage('original')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeStage === 'original'
                ? 'bg-[#1C2030] text-rose-400 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            1. Original Draft
          </button>
          
          <button
            onClick={() => setActiveStage('intelligence')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeStage === 'intelligence'
                ? 'bg-[#1C2030] text-blue-400 font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            2. ATS Intelligence
          </button>

          <button
            onClick={() => setActiveStage('optimized')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeStage === 'optimized'
                ? 'bg-[#5525F5] text-white font-semibold shadow-xs shadow-violet-500/25'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3. Job-Matched STAR</span>
          </button>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-zinc-400 hidden sm:inline">Engine Status:</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
            activeStage === 'optimized' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : activeStage === 'intelligence'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              activeStage === 'optimized' ? 'bg-emerald-400 animate-pulse' : activeStage === 'intelligence' ? 'bg-blue-400 animate-pulse' : 'bg-rose-400'
            }`} />
            {activeStage === 'optimized' ? 'Verified 98% Pass' : activeStage === 'intelligence' ? 'Scanning Token Layers' : 'Needs Optimization'}
          </span>
        </div>
      </div>

      {/* 3D THEATER STAGE (Perspective Viewport inspired by reference photo) */}
      <div 
        className="relative w-full rounded-3xl p-4 sm:p-8 lg:p-10 bg-[#090A10] border border-[#1E2235] shadow-2xl overflow-hidden perspective-1400"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        
        {/* Directional Raking Light & Violet Glow from Beneath (Directly from user reference photo) */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-[#5525F5]/25 via-[#4263FF]/15 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-28 right-10 w-[500px] h-[350px] bg-[#5525F5]/20 blur-3xl pointer-events-none rounded-full" />
        
        {/* Subtle Fine Coordinate Grid */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none" 
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* 3D Preserved Container */}
        <div 
          className="relative w-full min-h-[580px] lg:min-h-[640px] preserve-3d transition-transform duration-700 ease-out flex items-center justify-center"
          style={{
            transform: isHovered 
              ? 'rotateX(8deg) rotateY(-4deg) rotateZ(0deg)' 
              : 'rotateX(11deg) rotateY(-8deg) rotateZ(1deg)',
          }}
        >

          {/* ========================================================
              LAYER 0: DARK MATTE PEDESTAL BASE (From Reference Image)
          ======================================================== */}
          <div 
            className="absolute inset-x-4 sm:inset-x-10 bottom-6 sm:bottom-8 h-[380px] rounded-2xl bg-[#0F111A] border border-[#23273A] shadow-2xl preserve-3d"
            style={{
              transform: 'translateZ(-40px)',
              boxShadow: '0 30px 80px -20px rgba(0,0,0,0.8), 0 0 50px -10px rgba(85,37,245,0.3)',
            }}
          >
            {/* Matte debossed grooves / card slots from reference render */}
            <div className="absolute top-4 left-6 flex items-center gap-2">
              <span className="w-16 h-1.5 rounded-full bg-[#1A1D2C] border-t border-[#2A2E44]" />
              <span className="w-8 h-1.5 rounded-full bg-[#1A1D2C] border-t border-[#2A2E44]" />
            </div>

            <div className="absolute bottom-4 right-6 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <span>HYPE-RESUME / CORE-ARCH</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#5525F5]" />
            </div>
          </div>

          {/* ========================================================
              LAYER 1: MAIN FLOATING A4 RESUME DOCUMENT
          ======================================================== */}
          <div 
            className="relative z-10 w-full max-w-[520px] rounded-2xl bg-white text-zinc-900 shadow-2xl p-6 sm:p-8 preserve-3d transition-all duration-500 border border-zinc-200/80"
            style={{
              transform: 'translateZ(30px)',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.45), 0 0 35px -5px rgba(85,37,245,0.25)',
            }}
          >
            
            {/* Luminous laser scanning beam (active during ATS Intelligence stage) */}
            {activeStage === 'intelligence' && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#4263FF] to-transparent animate-scan-beam z-30 pointer-events-none shadow-[0_0_15px_#4263FF]" />
            )}

            {/* Resume Document Header */}
            <div className="border-b border-zinc-200 pb-4 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                    ALEX MORGAN
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold text-[#5525F5] mt-0.5 font-sans">
                    Senior Product Analyst · Experimentation & Growth
                  </p>
                </div>
                
                {/* Document format badge */}
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 shrink-0">
                  A4 · UTF-8
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

              {/* Standard Bullet (Unchanged Baseline) */}
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
                className={`p-3 rounded-xl border transition-all duration-300 relative ${
                  activeStage === 'original'
                    ? 'bg-rose-50/70 border-rose-200 text-zinc-700'
                    : 'bg-gradient-to-r from-emerald-50/90 via-blue-50/60 to-purple-50/40 border-emerald-300 shadow-sm'
                }`}
              >
                {/* Bullet Transformation Badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider font-mono ${
                    activeStage === 'original' ? 'text-rose-600' : 'text-emerald-700'
                  }`}>
                    {activeStage === 'original' ? (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        <span>Original Draft (Vague / Missing Proof)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-[#5525F5]" />
                        <span>AI Optimized (STAR / XYZ Framework)</span>
                      </>
                    )}
                  </span>

                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    activeStage === 'original' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
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
                  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-emerald-200/60 text-[10px] text-zinc-600">
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
              <div className="pt-2 border-t border-zinc-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono block mb-1.5">
                  Core Competencies & Verified Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['SQL (PostgreSQL, BigQuery)', 'dbt', 'A/B Testing', 'Amplitude', 'Python', 'Tableau'].map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[10px] font-medium border border-zinc-200/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================
              LAYER 2: FLOATING ATS SCORE AUDIT GAUGE (Top-Right Satellite)
          ======================================================== */}
          <div 
            className="absolute -top-4 sm:-top-8 -right-2 sm:-right-8 w-[240px] sm:w-[280px] rounded-2xl bg-[#11131E]/95 backdrop-blur-md border border-[#262B40] p-4 text-white shadow-2xl preserve-3d animate-float-panel-top hidden md:block"
            style={{
              transform: 'translateZ(70px)',
              boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8), 0 0 30px -5px rgba(85,37,245,0.4)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#22273A] mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                <TrendingUp className="w-4 h-4 text-[#4263FF]" />
                <span>Live ATS Score</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                liveScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {liveScore >= 80 ? 'Passed (98)' : 'Review (58)'}
              </span>
            </div>

            {/* Gauge */}
            <div className="flex flex-col items-center py-1">
              <ScoreMeter score={liveScore} variant="dark" textColor="text-white" />
              <p className="text-[10px] text-zinc-400 font-mono mt-1">
                Candidate: Alex Morgan
              </p>
            </div>

            {/* Breakdown Sub-meters */}
            <div className="space-y-1.5 mt-3 pt-3 border-t border-[#22273A] text-[11px]">
              <div className="flex justify-between items-center text-zinc-300">
                <span>Action & Impact Verbs</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {activeStage === 'original' ? '52%' : '100%'}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-300">
                <span>Quantifiable STAR Lift</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {activeStage === 'original' ? '30%' : '$180K + 14%'}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-300">
                <span>Deterministic ATS Format</span>
                <span className="font-bold text-blue-400 font-mono">100% Pass</span>
              </div>
            </div>
          </div>

          {/* ========================================================
              LAYER 3: JOB REQUIREMENT MATCH PANEL (Bottom-Left Satellite)
          ======================================================== */}
          <div 
            className="absolute -bottom-6 -left-2 sm:-left-8 w-[250px] sm:w-[290px] rounded-2xl bg-[#11131E]/95 backdrop-blur-md border border-[#262B40] p-4 text-white shadow-2xl preserve-3d animate-float-panel-bottom hidden md:block"
            style={{
              transform: 'translateZ(60px)',
              boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8), 0 0 30px -5px rgba(66,99,255,0.3)',
            }}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-[#22273A] mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                <Target className="w-4 h-4 text-[#5525F5]" />
                <span>Job Requirement Match</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Target: Stripe</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#181B29] border border-[#252A3F]">
                <span className="text-zinc-300">SQL / Analytics Engineering</span>
                <span className="text-emerald-400 font-bold font-mono text-[10px]">Verified Match</span>
              </div>
              
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#181B29] border border-[#252A3F]">
                <span className="text-zinc-300">A/B Testing & ARR Impact</span>
                <span className={`font-bold font-mono text-[10px] ${
                  activeStage === 'original' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {activeStage === 'original' ? 'Needs STAR Proof' : 'Verified Match'}
                </span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#181B29] border border-[#252A3F]">
                <span className="text-zinc-300">Single-Column A4 Parsing</span>
                <span className="text-blue-400 font-bold font-mono text-[10px]">Deterministic</span>
              </div>
            </div>

            {/* Application Branching Pill */}
            <div className="mt-3 pt-2.5 border-t border-[#22273A] flex items-center justify-between text-[10px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#5525F5]" />
                <span>Branch: Tailored v2</span>
              </span>
              <span className="text-emerald-400 font-bold">A4 Ready</span>
            </div>
          </div>

        </div>

        {/* Bottom Interactive Hint */}
        <div className="mt-6 pt-4 border-t border-[#1C2030] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5525F5] animate-ping" />
            <span>Click tabs above to toggle between Original Draft, ATS Intelligence, and Job-Matched STAR.</span>
          </div>

          <Link 
            href="/login" 
            className="inline-flex items-center gap-1 text-white hover:text-[#4263FF] font-medium transition-colors cursor-pointer"
          >
            <span>Start Building with Your Profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}
