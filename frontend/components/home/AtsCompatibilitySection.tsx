'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Layers, 
  Code2, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  FileSearch,
  Check,
  Eye,
  Terminal,
  Cpu,
  ArrowRight
} from 'lucide-react';

export function AtsCompatibilitySection() {
  const [activeTab, setActiveTab] = useState<'flow' | 'headings' | 'text'>('flow');

  const principles = [
    {
      id: 'flow',
      tabLabel: '01 / Single-Column Flow',
      title: 'Deterministic Single-Column Flow',
      subtitle: 'Linear Document Stream',
      desc: 'Applicant Tracking Systems parse documents linearly. Multi-column floating boxes and nested tables often cause text streams to interleave, scrambling candidate experience and confusing job titles with company names.',
      solution: 'HypeResume compiles your resume into a single, predictable coordinate stream so dates, titles, and bullet points are parsed in their exact intended chronological sequence.',
      metric: 'Linear DOM Stream',
      highlight: 'Zero scrambled role dates & titles',
    },
    {
      id: 'headings',
      tabLabel: '02 / Section Landmarks',
      title: 'Recognized Section Hierarchy',
      subtitle: 'Standard Token Taxonomy',
      desc: 'Parsers categorize candidate experience using standard section tokens. Non-standard headings like "Where I\'ve Been" or "Core Passions" often cause entire employment histories to be discarded or misclassified.',
      solution: 'We enforce standard, battle-tested section tokens (Experience, Education, Skills, Projects) recognized by Ashby, Greenhouse, Workday, Lever, and Taleo.',
      metric: 'Standard Token Map',
      highlight: '100% taxonomy match across ATS',
    },
    {
      id: 'text',
      tabLabel: '03 / Clean UTF-8 Layers',
      title: 'Clean UTF-8 & Vector Text Extraction',
      subtitle: 'True Native Vector Layer',
      desc: 'Many graphic resume tools export flattened raster images or non-standard fonts with broken ligature glyphs (like "fi", "fl", "th"), causing parsers to read corrupted gibberish instead of your actual words.',
      solution: 'Every PDF exported from HypeResume contains an authentic, selectable vector text layer with standard UTF-8 character encoding, ensuring 100% accurate OCR and search extraction.',
      metric: '100% Selectable Text',
      highlight: 'Zero unparsed ligature errors',
    },
  ];

  const currentPrinciple = principles.find(p => p.id === activeTab) || principles[0];

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#090A10] text-white relative overflow-hidden">
      
      {/* Ambient Volumetric Violet Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#5525F5]/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-inner backdrop-blur-md">
            <Cpu className="w-3.5 h-3.5 text-[#5525F5]" />
            <span>Parser Architecture</span>
          </div>
          
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Designed for people. Structured for parsing.
          </h2>
          
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Clean document hierarchy, conventional section structures, and readable vector text layers ensure your resume is accurately interpreted by recruiting systems and human hiring managers alike.
          </p>
        </div>

        {/* Master ATS Inspection Workbench (Linear / Stripe level unified chassis) */}
        <div className="rounded-3xl bg-[#0C0E17]/90 border border-white/[0.08] p-5 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl overflow-hidden">
          
          {/* Top Tab Bar: Interactive Principles */}
          <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-white/[0.08]">
            {principles.map((p) => {
              const isActive = activeTab === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveTab(p.id as any)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#181B2C] text-white font-semibold shadow-md border border-[#5525F5]/60 ring-1 ring-[#5525F5]/30'
                      : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] border border-white/[0.05]'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#5525F5] animate-pulse' : 'bg-zinc-600'}`} />
                  <span>{p.tabLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Workbench Split View (Context + Live Terminal) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
            
            {/* Left Column (5 Cols): Technical Context & Verification */}
            <div className="lg:col-span-5 space-y-6 text-left">
              
              <div className="space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#A5B4FC] font-bold">
                  {currentPrinciple.subtitle}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {currentPrinciple.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {currentPrinciple.desc}
                </p>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                  {currentPrinciple.solution}
                </p>
              </div>

              {/* Engineering Guarantees Checklist */}
              <div className="p-4 rounded-xl bg-[#121422] border border-white/[0.06] space-y-2.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1">
                  HypeResume Engineering Guarantees
                </div>
                
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Strict single-column reading order (no columns)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Standard ATS dictionary taxonomy mapping</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero table cells, floating textboxes, or canvas hacks</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>True selectable UTF-8 vector text layers in every PDF</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[#A5B4FC]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Verified compatible with Ashby, Greenhouse, Workday, Lever</span>
              </div>

            </div>

            {/* Right Column (7 Cols): Live ATS Parser Inspection Terminal */}
            <div className="lg:col-span-7 rounded-2xl bg-[#08090F] border border-white/[0.09] shadow-2xl overflow-hidden font-mono text-xs">
              
              {/* Terminal Title Bar */}
              <div className="px-4 py-3 bg-[#10121D] border-b border-white/[0.08] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-zinc-400 text-[11px] ml-1.5 font-mono">
                    ats-parser://candidate-stream.jsonl
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  100% Parsable Layer
                </span>
              </div>

              {/* Parser Terminal Body */}
              <div className="p-5 sm:p-6 space-y-3.5">
                
                {/* Node 1: Candidate Identity */}
                <div className={`p-3.5 rounded-xl border transition-all duration-200 ${
                  activeTab === 'flow' 
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-200 ring-1 ring-blue-500/30' 
                    : 'bg-[#11131E] border-white/[0.06] text-zinc-300'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-blue-400 uppercase tracking-wider block font-bold">
                        NODE 01: CANDIDATE_IDENTITY & CONTACT
                      </span>
                      <p className="text-white font-semibold">
                        Alex Morgan <span className="text-zinc-500 font-normal">—</span> Senior Product Analyst
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        alex.morgan@email.com · (415) 555-0192 · San Francisco, CA
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold shrink-0 border border-emerald-500/30">
                      PASS
                    </span>
                  </div>
                </div>

                {/* Node 2: Section Landmark */}
                <div className={`p-3.5 rounded-xl border transition-all duration-200 ${
                  activeTab === 'headings'
                    ? 'bg-purple-500/15 border-purple-500/50 text-purple-200 ring-1 ring-purple-500/30'
                    : 'bg-[#11131E] border-white/[0.06] text-zinc-300'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#C4B5FD] uppercase tracking-wider block font-bold">
                        NODE 02: SECTION_TOKEN [EXPERIENCE]
                      </span>
                      <p className="text-white font-semibold">
                        ClearPath Analytics <span className="text-zinc-500 font-normal">—</span> Senior Product Analyst
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        Date Range: 2021 – Present (Linear Chronology Aligned)
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold shrink-0 border border-emerald-500/30">
                      RECOGNIZED
                    </span>
                  </div>
                </div>

                {/* Node 3: Raw Text Layer Bullet */}
                <div className={`p-3.5 rounded-xl border transition-all duration-200 ${
                  activeTab === 'text'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 ring-1 ring-emerald-500/30'
                    : 'bg-[#11131E] border-white/[0.06] text-zinc-300'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">
                        NODE 03: BULLET_ACHIEVEMENT [TEXT_LAYER_RAW]
                      </span>
                      <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                        &quot;Spearheaded 22 checkout pricing A/B experiments, identifying 3 high-converting funnels that increased quarterly ARR by $180K and reduced checkout drop-off by 14%.&quot;
                      </p>
                      <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                        <span className="text-emerald-300 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded">
                          Action Verb: Spearheaded
                        </span>
                        <span className="text-blue-300 bg-blue-950/70 border border-blue-800/50 px-2 py-0.5 rounded">
                          Metric: $180K ARR (+14%)
                        </span>
                        <span className="text-purple-300 bg-purple-950/70 border border-purple-800/50 px-2 py-0.5 rounded">
                          Encoding: UTF-8 Valid
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold shrink-0 border border-emerald-500/30">
                      EXTRACTED
                    </span>
                  </div>
                </div>

                {/* Bottom Terminal Status Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/[0.08] text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Single-Column</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Standard Headings</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Zero Table Traps</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Clean UTF-8 PDF</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
