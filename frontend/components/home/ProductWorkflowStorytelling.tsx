'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Briefcase, 
  GitFork, 
  Check, 
  Sliders, 
  ArrowRight,
  TrendingUp,
  Search,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProductWorkflowStorytelling() {
  // Section 2: Job description analysis filter state
  const [filterType, setFilterType] = useState<'all' | 'supported' | 'gap'>('all');

  // Section 3: Interactive before / after bullet accept toggle
  const [isAccepted, setIsAccepted] = useState(false);

  // Section 4: Active tailored variant view
  const [activeVariant, setActiveVariant] = useState<'backend' | 'analyst' | 'solutions'>('backend');

  const requirements = [
    {
      skill: 'PostgreSQL Query Optimization & Indexing',
      type: 'required',
      status: 'supported',
      evidence: 'Spearheaded automated SQL pipelines & query tuning (Algoocean)',
    },
    {
      skill: 'RESTful API & Microservices Architecture',
      type: 'required',
      status: 'supported',
      evidence: 'Designed NestJS services serving 500K registered users',
    },
    {
      skill: 'Distributed Asynchronous Job Queues (Redis/BullMQ)',
      type: 'required',
      status: 'supported',
      evidence: 'Built background job processing for transactional workloads',
    },
    {
      skill: 'Kubernetes Cluster Provisioning (EKS/GKE)',
      type: 'preferred',
      status: 'gap',
      evidence: 'Docker & AWS EC2 documented; no direct Kubernetes cluster management evidenced.',
    },
  ];

  const filteredRequirements = requirements.filter((r) => {
    if (filterType === 'supported') return r.status === 'supported';
    if (filterType === 'gap') return r.status === 'gap';
    return true;
  });

  const variants = {
    backend: {
      role: 'Staff Backend Engineer',
      target: 'Distributed Systems & Data Infrastructure',
      matchScore: '94%',
      primaryHighlight: 'Optimized high-throughput NestJS APIs & PostgreSQL indexing serving 500K users',
      skillsEmphasized: ['PostgreSQL', 'NestJS', 'Redis', 'BullMQ', 'AWS EC2', 'System Design'],
    },
    analyst: {
      role: 'Senior Product Analyst',
      target: 'Growth, Experimentation & Core Funnel Metrics',
      matchScore: '91%',
      primaryHighlight: 'Spearheaded 22 checkout pricing A/B experiments, increasing quarterly ARR by $180K',
      skillsEmphasized: ['A/B Testing', 'dbt', 'SQL / BigQuery', 'Amplitude', 'Tableau', 'STAR Metric Lift'],
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
    <div className="w-full space-y-24 sm:space-y-32 py-16 sm:py-24">
      
      {/* =====================================================
          STORYTELLING 01: BUILD A STRUCTURED RESUME
      ===================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Editorial Content */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest text-[#3730F5] dark:text-blue-400 uppercase">
              01 / STRUCTURE
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#171923] dark:text-[#F0F2F5] leading-tight">
              Start with the experience you already have.
            </h2>
            <p className="text-sm sm:text-base text-[#626B7A] dark:text-[#9EA7B4] leading-relaxed">
              Build a structured resume from your professional experience, education, projects, and skills. Keep your information organized and under your control without wrestling with erratic word processor margins.
            </p>
            <div className="pt-2 flex flex-col gap-2.5 text-xs text-[#626B7A] dark:text-[#9EA7B4]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3730F5] dark:text-blue-400 shrink-0" />
                <span>Deterministic single-column layout prevents text fragmentation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3730F5] dark:text-blue-400 shrink-0" />
                <span>Standard section hierarchies: Summary, Experience, Education, Skills</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3730F5] dark:text-blue-400 shrink-0" />
                <span>Real-time A4 height guidance prevents accidental blank page overflows</span>
              </div>
            </div>
            <div className="pt-3">
              <Link href="/login">
                <Button size="sm" className="rounded-md bg-[#3730F5] hover:bg-[#2820D4] text-white text-xs font-semibold px-4 h-9 gap-1.5 shadow-xs">
                  <span>Open Master Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* High-Fidelity Master Editor Demonstration */}
          <div className="lg:col-span-7 bg-white dark:bg-[#14171C] rounded-2xl border border-[#E6E8ED] dark:border-[#252A33] shadow-lg overflow-hidden">
            {/* Editor Top Navigation */}
            <div className="px-4 py-3 bg-[#F7F8FA] dark:bg-[#1D2128] border-b border-[#E6E8ED] dark:border-[#252A33] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium text-[#171923] dark:text-[#F0F2F5]">
                <FileText className="w-4 h-4 text-[#3730F5] dark:text-blue-400" />
                <span>Master Profile Editor</span>
                <span className="text-[10px] text-zinc-400 font-mono">• Saved to private storage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
                  A4 · 1 Sheet Fitted
                </span>
              </div>
            </div>

            {/* Editor Workspace Split View */}
            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-5 text-xs">
              
              {/* Left Form Navigator */}
              <div className="sm:col-span-4 space-y-1.5 border-r border-[#E6E8ED] dark:border-[#252A33] pr-4">
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
                    className={`p-2 rounded-lg text-left transition-all ${
                      s.active
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-[#3730F5] dark:text-blue-400 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="text-[11px] leading-tight">{s.name}</div>
                    <div className="text-[10px] opacity-70 font-mono">{s.count}</div>
                  </div>
                ))}
              </div>

              {/* Right Live Document Preview Snippet */}
              <div className="sm:col-span-8 bg-[#F7F8FA] dark:bg-[#101216] p-4 rounded-xl border border-[#E6E8ED] dark:border-[#252A33] space-y-3 font-sans">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <h4 className="text-base font-extrabold uppercase tracking-tight text-zinc-950 dark:text-white font-rubik">
                    Abhi Singh
                  </h4>
                  <p className="text-[11px] font-medium text-[#3730F5] dark:text-blue-400 font-rubik">
                    Full Stack Developer · Node.js, NestJS, Next.js, PostgreSQL, Redis, AWS
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-mono border-b border-zinc-200 dark:border-zinc-800 pb-0.5">
                    Experience
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                      <span>Full Stack Developer — Algoocean Technologies</span>
                      <span className="text-[10px] text-zinc-500 font-normal">2024 – Present</span>
                    </div>
                    <ul className="list-disc pl-3.5 space-y-1 text-[10.5px] text-zinc-700 dark:text-zinc-300 leading-snug">
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
          <div className="lg:col-span-7 order-2 lg:order-1 bg-white dark:bg-[#14171C] rounded-2xl border border-[#E6E8ED] dark:border-[#252A33] shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-[#F7F8FA] dark:bg-[#1D2128] border-b border-[#E6E8ED] dark:border-[#252A33] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium text-[#171923] dark:text-[#F0F2F5]">
                <Search className="w-4 h-4 text-[#3730F5] dark:text-blue-400" />
                <span>Job Description Requirement Mapping</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[#3730F5] dark:text-blue-400 font-bold">
                  88% Evidence Alignment
                </span>
              </div>
            </div>

            {/* Target Job Meta */}
            <div className="p-4 border-b border-[#E6E8ED] dark:border-[#252A33] bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400 block">Target Opportunity</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Senior Backend Engineer</span>
                <span className="text-zinc-500 font-medium"> · Stripe / Razorpay benchmark</span>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-0.5 bg-zinc-200/60 dark:bg-zinc-800 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500'
                  }`}
                >
                  All (4)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('supported')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    filterType === 'supported'
                      ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-zinc-500'
                  }`}
                >
                  Supported (3)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('gap')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    filterType === 'gap'
                      ? 'bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-400 shadow-xs'
                      : 'text-zinc-500'
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
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-200/80 dark:border-emerald-900/30'
                        : 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-200/80 dark:border-amber-900/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                            {req.skill}
                          </span>
                          <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
                            req.type === 'required'
                              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                              : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            {req.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          <span className="font-medium text-zinc-500">Documented Evidence:</span> {req.evidence}
                        </p>
                      </div>

                      <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isSupported
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
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
            <div className="p-3 bg-[#F7F8FA] dark:bg-[#1D2128] border-t border-[#E6E8ED] dark:border-[#252A33] text-[11px] text-zinc-500 flex items-center justify-between">
              <span>Evaluates documented experience only. Does not invent unevidenced qualifications.</span>
              <span className="font-mono text-zinc-400">Zero Hallucinations</span>
            </div>
          </div>

          {/* Editorial Content (Right on Desktop) */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest text-[#3730F5] dark:text-blue-400 uppercase">
              02 / UNDERSTAND
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#171923] dark:text-[#F0F2F5] leading-tight">
              Understand the opportunity before you apply.
            </h2>
            <p className="text-sm sm:text-base text-[#626B7A] dark:text-[#9EA7B4] leading-relaxed">
              Analyze a job description to understand its core requirements, identify relevant qualifications, and see where your documented experience already provides genuine evidence.
            </p>
            <div className="pt-2 flex flex-col gap-2.5 text-xs text-[#626B7A] dark:text-[#9EA7B4]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3730F5] dark:text-blue-400 shrink-0" />
                <span>Distinguishes hard required competencies from preferred extras</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3730F5] dark:text-blue-400 shrink-0" />
                <span>Flags factual gaps honestly instead of generating misleading claims</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3730F5] dark:text-blue-400 shrink-0" />
                <span>Prevents algorithmic keyword stuffing that triggers recruiter rejection</span>
              </div>
            </div>
            <div className="pt-3">
              <Link href="/tools/job-match">
                <Button size="sm" variant="outline" className="rounded-md text-xs font-semibold px-4 h-9 gap-1.5">
                  <span>Try Job Match Analyzer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
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
            <span className="text-xs font-mono font-bold tracking-widest text-[#3730F5] dark:text-blue-400 uppercase">
              03 / REFINE
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#171923] dark:text-[#F0F2F5] leading-tight">
              Make your real achievements stand out.
            </h2>
            <p className="text-sm sm:text-base text-[#626B7A] dark:text-[#9EA7B4] leading-relaxed">
              Improve the clarity, structure, and impact of your existing achievements while strictly preserving the facts behind your experience.
            </p>
            <div className="pt-2 flex flex-col gap-2.5 text-xs text-[#626B7A] dark:text-[#9EA7B4]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3730F5] dark:text-blue-400 shrink-0" />
                <span>Converts passive descriptions into decisive ownership verbs</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3730F5] dark:text-blue-400 shrink-0" />
                <span>STAR Framework: Situation, Task, Action, and Quantified Result</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3730F5] dark:text-blue-400 shrink-0" />
                <span>Strict truth guardrails: never invents false titles, metrics, or employers</span>
              </div>
            </div>
            <div className="pt-3">
              <Link href="/tools/bullet-improver">
                <Button size="sm" className="rounded-md bg-[#3730F5] hover:bg-[#2820D4] text-white text-xs font-semibold px-4 h-9 gap-1.5 shadow-xs">
                  <span>Try Bullet Improver</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Bullet Transformation Visual (Side-by-Side Before vs After) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#14171C] rounded-2xl border border-[#E6E8ED] dark:border-[#252A33] shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-[#F7F8FA] dark:bg-[#1D2128] border-b border-[#E6E8ED] dark:border-[#252A33] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium text-[#171923] dark:text-[#F0F2F5]">
                <Sparkles className="w-4 h-4 text-[#3730F5] dark:text-blue-400" />
                <span>STAR Impact Transformation Demonstration</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono italic">
                Illustrative sample grounded in provided metrics
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs">
              
              {/* BEFORE CARD */}
              <div className="p-4 rounded-xl bg-[#F7F8FA] dark:bg-[#101216] border border-[#E6E8ED] dark:border-[#252A33] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    ORIGINAL DRAFT (WEAK &amp; PASSIVE)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">Score: 42</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-through leading-relaxed">
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
                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
              </div>

              {/* AFTER CARD */}
              <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-300/80 dark:border-emerald-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    EVIDENCE-GROUNDED REWRITE (STAR STRUCTURE)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                    Score: 98 (+56 pts)
                  </span>
                </div>
                
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed font-sans">
                  &ldquo;<strong className="text-[#171923] dark:text-white font-bold">Optimized database query patterns</strong>, reducing average response time by <strong className="text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-1 py-0.5 rounded font-mono">32%</strong> across core application workflows.&rdquo;
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10.5px]">
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                    ✓ Strong Action: Optimized
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-800 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
                    ✓ Metric: 32% latency reduction
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-medium">
                    ✓ Scope: Core workflows
                  </span>
                </div>
              </div>

              {/* Action Simulation */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <div className="text-[11px] text-zinc-500">
                  {isAccepted ? '✓ Applied to your master resume document' : 'Click to preview integration into document'}
                </div>
                <button
                  type="button"
                  onClick={() => setIsAccepted(!isAccepted)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isAccepted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#3730F5] hover:bg-[#2820D4] text-white shadow-xs'
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#5525F5]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Branch Header & Quick Selectors */}
            <div className="flex items-center justify-between mb-4 px-2 text-xs">
              <div className="flex items-center gap-2 font-medium text-[#171923] dark:text-[#F0F2F5]">
                <GitFork className="w-4 h-4 text-[#5525F5] dark:text-blue-400" />
                <span className="font-semibold">1 Master Profile → 3 Tailored 3D Documents</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Tap document to inspect</span>
            </div>

            {/* 3D Dimensional Fanned-Out Cards Container */}
            <div className="relative min-h-[360px] sm:min-h-[400px] w-full preserve-3d flex items-center justify-center">
              
              {/* CARD 1: BACKEND ENGINEER (Angled Left) */}
              <div
                onClick={() => setActiveVariant('backend')}
                className={`absolute w-full max-w-[360px] sm:max-w-[420px] rounded-2xl p-5 border transition-all duration-500 cursor-pointer shadow-xl preserve-3d ${
                  activeVariant === 'backend'
                    ? 'z-30 bg-white dark:bg-[#141720] border-[#5525F5] shadow-2xl shadow-violet-500/20 scale-105'
                    : 'z-10 bg-zinc-50 dark:bg-[#101218] border-zinc-200 dark:border-zinc-800 opacity-80 hover:opacity-100'
                }`}
                style={{
                  transform: activeVariant === 'backend'
                    ? 'translateZ(50px) translateY(0px) rotateY(0deg)'
                    : 'translateZ(10px) translateX(-50px) translateY(-15px) rotateY(-12deg) rotateZ(-3deg)',
                }}
              >
                <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block">Tailored Variant 01</span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Backend Systems Engineer</h4>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    94% Match
                  </span>
                </div>

                <p className="text-[11.5px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium mb-3">
                  &ldquo;Architected distributed BullMQ queue workers and Redis caching layers, scaling API throughput to 18,000 req/sec.&rdquo;
                </p>

                <div className="flex flex-wrap gap-1">
                  {['NestJS', 'PostgreSQL', 'Redis', 'BullMQ', 'AWS EC2'].map((s) => (
                    <span key={s} className="px-1.5 py-0.5 text-[9.5px] rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* CARD 2: PRODUCT ANALYST (Center / High Elevation) */}
              <div
                onClick={() => setActiveVariant('analyst')}
                className={`absolute w-full max-w-[360px] sm:max-w-[420px] rounded-2xl p-5 border transition-all duration-500 cursor-pointer shadow-xl preserve-3d ${
                  activeVariant === 'analyst'
                    ? 'z-30 bg-white dark:bg-[#141720] border-[#5525F5] shadow-2xl shadow-violet-500/20 scale-105'
                    : 'z-15 bg-zinc-50 dark:bg-[#101218] border-zinc-200 dark:border-zinc-800 opacity-80 hover:opacity-100'
                }`}
                style={{
                  transform: activeVariant === 'analyst'
                    ? 'translateZ(50px) translateY(0px) rotateY(0deg)'
                    : 'translateZ(20px) translateY(10px) rotateY(0deg)',
                }}
              >
                <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#5525F5] dark:text-blue-400 font-semibold block">Tailored Variant 02 · Recommended</span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Senior Product Analyst</h4>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    98% Match
                  </span>
                </div>

                <p className="text-[11.5px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium mb-3">
                  &ldquo;Spearheaded 22 checkout pricing A/B experiments, identifying 3 high-converting funnels that increased quarterly ARR by $180K.&rdquo;
                </p>

                <div className="flex flex-wrap gap-1">
                  {['SQL & dbt', 'A/B Testing', 'Tableau', 'Amplitude', 'Retention Funnels'].map((s) => (
                    <span key={s} className="px-1.5 py-0.5 text-[9.5px] rounded bg-blue-50 dark:bg-blue-950/40 text-[#5525F5] dark:text-blue-300 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* CARD 3: SOLUTIONS ARCHITECT (Angled Right) */}
              <div
                onClick={() => setActiveVariant('solutions')}
                className={`absolute w-full max-w-[360px] sm:max-w-[420px] rounded-2xl p-5 border transition-all duration-500 cursor-pointer shadow-xl preserve-3d ${
                  activeVariant === 'solutions'
                    ? 'z-30 bg-white dark:bg-[#141720] border-[#5525F5] shadow-2xl shadow-violet-500/20 scale-105'
                    : 'z-10 bg-zinc-50 dark:bg-[#101218] border-zinc-200 dark:border-zinc-800 opacity-80 hover:opacity-100'
                }`}
                style={{
                  transform: activeVariant === 'solutions'
                    ? 'translateZ(50px) translateY(0px) rotateY(0deg)'
                    : 'translateZ(10px) translateX(50px) translateY(-15px) rotateY(12deg) rotateZ(3deg)',
                }}
              >
                <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block">Tailored Variant 03</span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Cloud Solutions Architect</h4>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    91% Match
                  </span>
                </div>

                <p className="text-[11.5px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium mb-3">
                  &ldquo;Designed multi-region failover and containerized microservices architectures delivering 99.99% uptime SLAs across AWS regions.&rdquo;
                </p>

                <div className="flex flex-wrap gap-1">
                  {['AWS VPC', 'Terraform', 'Docker', 'Prometheus', 'SLA 99.99%'].map((s) => (
                    <span key={s} className="px-1.5 py-0.5 text-[9.5px] rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Meta */}
            <div className="mt-4 px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-[#161822] border border-[#E6E8ED] dark:border-[#252A33] text-[11px] text-zinc-500 text-center">
              Each variant preserves its own version history, job match analysis, and clean PDF export.
            </div>
          </div>

          {/* Editorial Content (Right on Desktop) */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest text-[#5525F5] dark:text-blue-400 uppercase">
              04 / ADAPT
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#171923] dark:text-[#F0F2F5] leading-tight">
              One professional profile. Multiple focused applications.
            </h2>
            <p className="text-sm sm:text-base text-[#626B7A] dark:text-[#9EA7B4] leading-relaxed">
              Use your authentic experience to prepare focused, high-relevance applications for the specific jobs you want—without maintaining fragmented Word documents across dozens of folders.
            </p>
            <div className="pt-2 flex flex-col gap-2.5 text-xs text-[#626B7A] dark:text-[#9EA7B4]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5525F5] dark:text-blue-400 shrink-0" />
                <span>Single master profile branches into unlimited tailored versions</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5525F5] dark:text-blue-400 shrink-0" />
                <span>Highlights relevant achievements while retaining factual continuity</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5525F5] dark:text-blue-400 shrink-0" />
                <span>Always know which resume version was submitted to each company</span>
              </div>
            </div>
            <div className="pt-3">
              <Link href="/login">
                <Button size="sm" className="rounded-md bg-[#5525F5] hover:bg-[#4318D8] text-white text-xs font-semibold px-4 h-9 gap-1.5 shadow-sm">
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

