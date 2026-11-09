'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Sparkles, 
  GitFork, 
  ArrowRight, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProductWorkflowStorytelling() {
  // State for interactive storytelling demonstrations
  const [filterType, setFilterType] = useState<'all' | 'supported' | 'gap'>('all');
  const [isAccepted, setIsAccepted] = useState(false);
  const [activeVariant, setActiveVariant] = useState<'backend' | 'analyst' | 'solutions'>('analyst');

  // Realistic sample requirements for Section 02
  const requirements = [
    {
      skill: 'PostgreSQL & Database Optimization',
      status: 'supported' as const,
      type: 'required' as const,
      evidence: '42% query latency reduction using Redis & indexed relational schema in production',
    },
    {
      skill: 'NestJS / TypeScript Backend Services',
      status: 'supported' as const,
      type: 'required' as const,
      evidence: 'Maintained core API for 500K registered users with zero downtime deployments',
    },
    {
      skill: 'Distributed Queue Architecture',
      status: 'supported' as const,
      type: 'preferred' as const,
      evidence: 'BullMQ and Redis asynchronous workers processing background jobs',
    },
    {
      skill: 'Kubernetes Cluster Administration',
      status: 'gap' as const,
      type: 'preferred' as const,
      evidence: 'No documented Kubernetes production orchestration in current master profile',
    },
  ];

  const filteredRequirements = requirements.filter((r) => {
    if (filterType === 'all') return true;
    if (filterType === 'supported') return r.status === 'supported';
    if (filterType === 'gap') return r.status === 'gap';
    return true;
  });

  // Variant definitions for Section 04
  const variants = {
    backend: {
      role: 'Backend Systems Engineer',
      target: 'High-Concurrency Core API Platforms',
      matchScore: '94%',
      primaryHighlight: 'Architected distributed BullMQ queue workers and Redis caching layers, scaling API throughput to 18,000 req/sec',
      skillsEmphasized: ['NestJS', 'PostgreSQL', 'Redis', 'BullMQ', 'AWS EC2', 'Docker'],
    },
    analyst: {
      role: 'Senior Product Analyst',
      target: 'Experimentation & Growth Architecture',
      matchScore: '98%',
      primaryHighlight: 'Spearheaded 22 checkout pricing A/B experiments, identifying 3 high-converting funnels that increased quarterly ARR by $180K',
      skillsEmphasized: ['SQL & dbt', 'A/B Testing', 'Tableau', 'Amplitude', 'Retention Funnels'],
    },
    solutions: {
      role: 'Solutions Architect',
      target: 'Cloud Architecture & Enterprise Delivery',
      matchScore: '89%',
      primaryHighlight: 'Architected cloud-native file storage platform with secure multi-tenant access on AWS',
      skillsEmphasized: ['AWS S3', 'Nginx', 'Docker', 'PM2', 'Prometheus', 'Security Compliance'],
    },
  };

  return (
    <div className="w-full space-y-24 sm:space-y-32 py-16 sm:py-24 text-white relative">
      
      {/* =====================================================
          STORYTELLING 01: BUILD A STRUCTURED RESUME
      ===================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Editorial Content */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest text-[#5525F5] uppercase">
              01 / STRUCTURE
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Start with the experience you already have.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Build a structured resume from your professional experience, education, projects, and skills. Keep your information organized and under your control without wrestling with erratic word processor margins.
            </p>
            <div className="pt-2 flex flex-col gap-2.5 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5525F5] shrink-0" />
                <span>Deterministic single-column layout prevents text fragmentation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5525F5] shrink-0" />
                <span>Standard section hierarchies: Summary, Experience, Education, Skills</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5525F5] shrink-0" />
                <span>Real-time A4 height guidance prevents accidental blank page overflows</span>
              </div>
            </div>
            <div className="pt-3">
              <Link href="/login">
                <Button size="sm" className="rounded-lg bg-[#5525F5] hover:bg-[#4318D8] text-white text-xs font-semibold px-4 h-9 gap-1.5 shadow-md shadow-violet-500/20 border border-violet-400/30">
                  <span>Open Master Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* High-Fidelity Master Editor Demonstration */}
          <div 
            className="lg:col-span-7 bg-[#0E101D] rounded-2xl shadow-2xl overflow-hidden"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 50px -15px rgba(0,0,0,0.8)' }}
          >
            {/* Editor Top Navigation */}
            <div className="px-4 py-3 bg-[#131624] border-b border-white/[0.04] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium text-white">
                <FileText className="w-4 h-4 text-[#5525F5]" />
                <span className="font-semibold">Master Profile Editor</span>
                <span className="text-[10px] text-zinc-400 font-mono">• Saved to private storage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300 font-semibold shadow-xs">
                  A4 · 1 Sheet Fitted
                </span>
              </div>
            </div>

            {/* Editor Workspace Split View */}
            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-5 text-xs">
              
              {/* Left Form Navigator */}
              <div className="sm:col-span-4 space-y-1.5 border-r border-white/[0.04] pr-4">
                {[
                  { name: '1. Contact & Identity', active: false, count: '6 fields' },
                  { name: '2. Professional Summary', active: false, count: '3 lines' },
                  { name: '3. Work Experience', active: true, count: '2 roles' },
                  { name: '4. Technical Skills', active: false, count: '49 skills' },
                  { name: '5. Selected Projects', active: false, count: '3 projects' },
                  { name: '6. Education', active: false, count: '1 degree' },
                ].map((s) => (
                  <div
                    key={s.name}
                    className={`p-2 rounded-xl text-left transition-all ${
                      s.active
                        ? 'bg-[#5525F5]/20 text-[#A5B4FC] font-semibold border border-[#5525F5]/40'
                        : 'text-zinc-400 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="text-[11px] leading-tight">{s.name}</div>
                    <div className="text-[10px] opacity-70 font-mono">{s.count}</div>
                  </div>
                ))}
              </div>

              {/* Right Live Document Preview Snippet (High-Contrast White Card) */}
              <div className="sm:col-span-8 bg-white text-zinc-900 p-4 rounded-xl shadow-xl space-y-3 font-sans border border-zinc-200">
                <div className="border-b border-zinc-200 pb-2">
                  <h4 className="text-base font-extrabold uppercase tracking-tight text-zinc-950">
                    Abhi Singh
                  </h4>
                  <p className="text-[11px] font-semibold text-[#5525F5]">
                    Full Stack Developer · Node.js, NestJS, Next.js, PostgreSQL, Redis, AWS
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-700 font-mono border-b border-zinc-200 pb-0.5">
                    Experience
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline text-[11px] font-bold text-zinc-900">
                      <span>Full Stack Developer — Algoocean Technologies</span>
                      <span className="text-[10px] text-zinc-500 font-normal">2024 – Present</span>
                    </div>
                    <ul className="list-disc pl-3.5 space-y-1 text-[10.5px] text-zinc-700 leading-snug">
                      <li>Developed and maintained scalable backend services using NestJS and PostgreSQL for 500K registered users.</li>
                      <li>Designed asynchronous workflows using Redis and BullMQ to improve queue throughput by 42%.</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          STORYTELLING 02: UNDERSTAND THE JOB BEFORE APPLYING
      ===================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Job Analyzer Visual (Left on Desktop) */}
          <div 
            className="lg:col-span-7 order-2 lg:order-1 bg-[#0E101D] rounded-2xl shadow-2xl overflow-hidden"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 50px -15px rgba(0,0,0,0.8)' }}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-[#131624] border-b border-white/[0.04] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium text-white">
                <Search className="w-4 h-4 text-[#5525F5]" />
                <span className="font-semibold">Job Description Requirement Mapping</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  88% Evidence Alignment
                </span>
              </div>
            </div>

            {/* Target Job Meta */}
            <div className="p-4 border-b border-white/[0.04] bg-[#141724] flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400 block">Target Opportunity</span>
                <span className="font-bold text-white text-sm">Senior Backend Engineer</span>
                <span className="text-zinc-400 font-medium"> · Stripe / Razorpay benchmark</span>
              </div>
              
              {/* Filter Tabs */}
              <div 
                className="flex items-center gap-1 p-0.5 bg-[#0C0E17] rounded-lg text-[11px] font-semibold"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
              >
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-white/[0.1] text-white shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All (4)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('supported')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    filterType === 'supported'
                      ? 'bg-emerald-500/20 text-emerald-300 shadow-xs border border-emerald-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Supported (3)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('gap')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    filterType === 'gap'
                      ? 'bg-amber-500/20 text-amber-300 shadow-xs border border-amber-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Gaps (1)
                </button>
              </div>
            </div>

            {/* Requirements Evidence List */}
            <div className="p-4 sm:p-5 space-y-2.5 text-xs">
              {filteredRequirements.map((req) => {
                const isSupported = req.status === 'supported';
                return (
                  <div
                    key={req.skill}
                    className={`p-3 rounded-xl border transition-all ${
                      isSupported
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">
                            {req.skill}
                          </span>
                          <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
                            req.type === 'required'
                              ? 'bg-white/[0.08] text-zinc-300'
                              : 'bg-white/[0.04] text-zinc-400'
                          }`}>
                            {req.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                          <span className="font-medium text-zinc-400">Documented Evidence:</span> {req.evidence}
                        </p>
                      </div>

                      <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isSupported
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {isSupported ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Supported
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            Factual Gap
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Insight */}
            <div className="p-3 bg-[#131624] border-t border-white/[0.04] text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Evaluates documented experience only. Does not invent unevidenced qualifications.</span>
              <span className="font-mono text-zinc-300 font-semibold">Zero Hallucinations</span>
            </div>
          </div>

          {/* Editorial Content (Right on Desktop) */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest text-[#5525F5] uppercase">
              02 / UNDERSTAND
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Understand the opportunity before you apply.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Analyze a job description to understand its core requirements, identify relevant qualifications, and see where your documented experience already provides genuine evidence.
            </p>
            <div className="pt-2 flex flex-col gap-2.5 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5525F5] shrink-0" />
                <span>Distinguishes hard required competencies from preferred extras</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5525F5] shrink-0" />
                <span>Flags factual gaps honestly instead of generating misleading claims</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5525F5] shrink-0" />
                <span>Prevents algorithmic keyword stuffing that triggers recruiter rejection</span>
              </div>
            </div>
            <div className="pt-3">
              <Link href="/tools/job-match">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg text-xs font-semibold px-4 h-9 gap-1.5 bg-white/[0.06] text-white hover:bg-white/[0.12] hover:text-fuchsia-300 shadow-sm backdrop-blur-md cursor-pointer transition-all"
                >
                  <span>Try Job Match Analyzer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          STORYTELLING 03: IMPROVE WITHOUT INVENTING
      ===================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Editorial Content */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest text-[#5525F5] uppercase">
              03 / REFINE
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Make your real achievements stand out.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Improve the clarity, structure, and impact of your existing achievements while strictly preserving the facts behind your experience.
            </p>
            <div className="pt-2 flex flex-col gap-2.5 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5525F5] shrink-0" />
                <span>Converts passive descriptions into decisive ownership verbs</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5525F5] shrink-0" />
                <span>STAR Framework: Situation, Task, Action, and Quantified Result</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5525F5] shrink-0" />
                <span>Strict truth guardrails: never invents false titles, metrics, or employers</span>
              </div>
            </div>
            <div className="pt-3">
              <Link href="/tools/bullet-improver">
                <Button size="sm" className="rounded-lg bg-[#5525F5] hover:bg-[#4318D8] text-white text-xs font-semibold px-4 h-9 gap-1.5 shadow-md shadow-violet-500/20 border border-violet-400/30">
                  <span>Try Bullet Improver</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Bullet Transformation Visual */}
          <div 
            className="lg:col-span-7 bg-[#0E101D] rounded-2xl shadow-2xl overflow-hidden"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 50px -15px rgba(0,0,0,0.8)' }}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-[#131624] border-b border-white/[0.04] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium text-white">
                <Sparkles className="w-4 h-4 text-[#5525F5]" />
                <span className="font-semibold">STAR Impact Transformation Demonstration</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono italic">
                Illustrative sample grounded in provided metrics
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs">
              
              {/* BEFORE CARD */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    ORIGINAL DRAFT (WEAK &amp; PASSIVE)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">Score: 42</span>
                </div>
                <p className="text-sm text-zinc-300 line-through leading-relaxed">
                  &ldquo;Worked on database optimization and improved performance.&rdquo;
                </p>
                <div className="flex items-center gap-3 text-[10.5px] text-zinc-400 font-mono pt-1">
                  <span>✕ Passive verb (&ldquo;Worked on&rdquo;)</span>
                  <span>✕ Zero scale</span>
                  <span>✕ Unquantified lift</span>
                </div>
              </div>

              {/* ARROW INDICATOR */}
              <div className="flex items-center justify-center -my-1">
                <div className="h-6 w-px bg-white/[0.15]" />
              </div>

              {/* AFTER CARD */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    EVIDENCE-GROUNDED REWRITE (STAR STRUCTURE)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-800/40 px-2 py-0.5 rounded">
                    Score: 98 (+56 pts)
                  </span>
                </div>
                
                <p className="text-sm font-medium text-white leading-relaxed font-sans">
                  &ldquo;<strong className="text-white font-bold underline decoration-[#5525F5] decoration-2">Optimized database query patterns</strong>, reducing average response time by <strong className="text-emerald-300 bg-emerald-950/70 border border-emerald-800/40 px-1 py-0.5 rounded font-mono">32%</strong> across core application workflows.&rdquo;
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10.5px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 font-medium">
                    ✓ Strong Action: Optimized
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40 font-medium">
                    ✓ Metric: 32% latency reduction
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300 font-medium">
                    ✓ Scope: Core workflows
                  </span>
                </div>
              </div>

              {/* Action Simulation */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <div className="text-[11px] text-zinc-400">
                  {isAccepted ? '✓ Applied to your master resume document' : 'Click to preview integration into document'}
                </div>
                <button
                  type="button"
                  onClick={() => setIsAccepted(!isAccepted)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isAccepted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#5525F5] hover:bg-[#4318D8] text-white shadow-sm border border-violet-400/30'
                  }`}
                >
                  {isAccepted ? 'Revert to Draft' : 'Accept STAR Bullet'}
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          STORYTELLING 04: ADAPT APPLICATIONS FOR SPECIFIC JOBS
      ===================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Visual: Dimensional 3D Document Fan-Out (Left on Desktop) */}
          <div className="lg:col-span-7 order-2 lg:order-1 relative perspective-1200 py-6">
            
            {/* Ambient Violet Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#5525F5]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Branch Header & Quick Selectors */}
            <div className="flex items-center justify-between mb-4 px-2 text-xs">
              <div className="flex items-center gap-2 font-medium text-white">
                <GitFork className="w-4 h-4 text-[#5525F5]" />
                <span className="font-semibold">1 Master Profile → 3 Tailored 3D Documents</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Tap document to inspect</span>
            </div>

            {/* 3D Dimensional Fanned-Out Cards Container */}
            <div className="relative min-h-[360px] sm:min-h-[400px] w-full preserve-3d flex items-center justify-center">
              
              {/* CARD 1: BACKEND ENGINEER (Angled Left) */}
              <div
                onClick={() => setActiveVariant('backend')}
                className={`absolute w-full max-w-[360px] sm:max-w-[420px] rounded-2xl p-5 transition-all duration-500 cursor-pointer shadow-xl preserve-3d ${
                  activeVariant === 'backend'
                    ? 'z-30 bg-[#161928] border border-[#5525F5] shadow-2xl shadow-violet-500/25 scale-105'
                    : 'z-10 bg-[#10121C]/80 backdrop-blur-md opacity-80 hover:opacity-100 hover:border-violet-500/30'
                }`}
                style={{
                  transform: activeVariant === 'backend'
                    ? 'translateZ(50px) translateY(0px) rotateY(0deg)'
                    : 'translateZ(10px) translateX(-50px) translateY(-15px) rotateY(-12deg) rotateZ(-3deg)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)'
                }}
              >
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block">Tailored Variant 01</span>
                    <h4 className="text-sm font-bold text-white">Backend Systems Engineer</h4>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    94% Match
                  </span>
                </div>

                <p className="text-[11.5px] text-zinc-300 leading-relaxed font-medium mb-3">
                  &ldquo;Architected distributed BullMQ queue workers and Redis caching layers, scaling API throughput to 18,000 req/sec.&rdquo;
                </p>

                <div className="flex flex-wrap gap-1">
                  {['NestJS', 'PostgreSQL', 'Redis', 'BullMQ', 'AWS EC2'].map((s) => (
                    <span key={s} className="px-2 py-0.5 text-[9.5px] rounded bg-white/[0.06] text-zinc-300 shadow-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* CARD 2: PRODUCT ANALYST (Center / High Elevation) */}
              <div
                onClick={() => setActiveVariant('analyst')}
                className={`absolute w-full max-w-[360px] sm:max-w-[420px] rounded-2xl p-5 transition-all duration-500 cursor-pointer shadow-xl preserve-3d ${
                  activeVariant === 'analyst'
                    ? 'z-30 bg-[#161928] border border-[#5525F5] shadow-2xl shadow-violet-500/25 scale-105'
                    : 'z-15 bg-[#10121C]/80 backdrop-blur-md opacity-80 hover:opacity-100 hover:border-violet-500/30'
                }`}
                style={{
                  transform: activeVariant === 'analyst'
                    ? 'translateZ(50px) translateY(0px) rotateY(0deg)'
                    : 'translateZ(20px) translateY(10px) rotateY(0deg)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)'
                }}
              >
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#A5B4FC] font-semibold block">Tailored Variant 02 · Recommended</span>
                    <h4 className="text-sm font-bold text-white">Senior Product Analyst</h4>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    98% Match
                  </span>
                </div>

                <p className="text-[11.5px] text-zinc-200 leading-relaxed font-medium mb-3">
                  &ldquo;Spearheaded 22 checkout pricing A/B experiments, identifying 3 high-converting funnels that increased quarterly ARR by $180K.&rdquo;
                </p>

                <div className="flex flex-wrap gap-1">
                  {['SQL & dbt', 'A/B Testing', 'Tableau', 'Amplitude', 'Retention Funnels'].map((s) => (
                    <span key={s} className="px-2 py-0.5 text-[9.5px] rounded bg-[#5525F5]/20 text-[#A5B4FC] font-medium shadow-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* CARD 3: SOLUTIONS ARCHITECT (Angled Right) */}
              <div
                onClick={() => setActiveVariant('solutions')}
                className={`absolute w-full max-w-[360px] sm:max-w-[420px] rounded-2xl p-5 transition-all duration-500 cursor-pointer shadow-xl preserve-3d ${
                  activeVariant === 'solutions'
                    ? 'z-30 bg-[#161928] border border-[#5525F5] shadow-2xl shadow-violet-500/25 scale-105'
                    : 'z-10 bg-[#10121C]/80 backdrop-blur-md opacity-80 hover:opacity-100 hover:border-violet-500/30'
                }`}
                style={{
                  transform: activeVariant === 'solutions'
                    ? 'translateZ(50px) translateY(0px) rotateY(0deg)'
                    : 'translateZ(10px) translateX(50px) translateY(-15px) rotateY(12deg) rotateZ(3deg)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)'
                }}
              >
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block">Tailored Variant 03</span>
                    <h4 className="text-sm font-bold text-white">Cloud Solutions Architect</h4>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    91% Match
                  </span>
                </div>

                <p className="text-[11.5px] text-zinc-300 leading-relaxed font-medium mb-3">
                  &ldquo;Designed multi-region failover and containerized microservices architectures delivering 99.99% uptime SLAs across AWS regions.&rdquo;
                </p>

                <div className="flex flex-wrap gap-1">
                  {['AWS VPC', 'Terraform', 'Docker', 'Prometheus', 'SLA 99.99%'].map((s) => (
                    <span key={s} className="px-2 py-0.5 text-[9.5px] rounded bg-white/[0.06] text-zinc-300 shadow-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Meta */}
            <div 
              className="mt-4 px-3 py-2 rounded-xl bg-[#131624] text-[11px] text-zinc-400 text-center"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
            >
              Each variant preserves its own version history, job match analysis, and clean PDF export.
            </div>
          </div>

          {/* Editorial Content (Right on Desktop) */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest text-[#5525F5] uppercase">
              04 / ADAPT
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              One professional profile. Multiple focused applications.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Use your authentic experience to prepare focused, high-relevance applications for the specific jobs you want—without maintaining fragmented Word documents across dozens of folders.
            </p>
            <div className="pt-2 flex flex-col gap-2.5 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5525F5] shrink-0" />
                <span>Single master profile branches into unlimited tailored versions</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5525F5] shrink-0" />
                <span>Highlights relevant achievements while retaining factual continuity</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5525F5] shrink-0" />
                <span>Always know which resume version was submitted to each company</span>
              </div>
            </div>
            <div className="pt-3">
              <Link href="/login">
                <Button size="sm" className="rounded-lg bg-[#5525F5] hover:bg-[#4318D8] text-white text-xs font-semibold px-4 h-9 gap-1.5 shadow-md shadow-violet-500/20 border border-violet-400/30">
                  <span>Start Tailoring Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
