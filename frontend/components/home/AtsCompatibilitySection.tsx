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
  Cpu
} from 'lucide-react';

export function AtsCompatibilitySection() {
  const [activeTab, setActiveTab] = useState<'flow' | 'headings' | 'text'>('flow');

  const principles = [
    {
      id: 'flow',
      title: 'Deterministic Single-Column Flow',
      subtitle: 'Linear document structure',
      desc: 'Applicant Tracking Systems parse documents linearly. Multi-column floating boxes and nested tables often cause text streams to interleave, scrambling candidate experience.',
      metric: 'Linear DOM Stream',
      highlight: 'Prevents scrambled role dates & titles',
    },
    {
      id: 'headings',
      title: 'Recognized Section Hierarchy',
      subtitle: 'Standardized document landmarks',
      desc: 'Parsers categorize candidate experience using standard section tokens. We enforce recognized headings like Experience, Education, and Skills so parsers never categorize achievements under the wrong category.',
      metric: 'Standard Token Map',
      highlight: 'Consistent taxonomy across systems',
    },
    {
      id: 'text',
      title: 'Clean UTF-8 & Text Extraction',
      subtitle: 'True vector text layers',
      desc: 'Every PDF exported from HypeResume contains an authentic, selectable vector text layer with standard UTF-8 character encoding. No rasterized text or flattening that defeats OCR and text extraction engines.',
      metric: '100% Selectable Text',
      highlight: 'Zero unparsed ligature errors',
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#090A10] text-white relative overflow-hidden">
      
      {/* Ambient Radial Spotlight */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[400px] bg-[#5525F5]/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Editorial Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono">
            <Cpu className="w-3.5 h-3.5 text-[#5525F5]" />
            <span>Parser Architecture</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
            Designed for people. Structured for parsing.
          </h2>
          
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Clean document hierarchy, conventional section structures, and readable text layers help ensure your resume is accurately interpreted by recruiting systems and human reviewers alike.
          </p>
        </div>

        {/* Technical Architecture Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Technical Principle Tabs */}
          <div className="lg:col-span-5 space-y-3">
            {principles.map((p) => {
              const isActive = activeTab === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveTab(p.id as any)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#151827] border-[#5525F5] shadow-lg shadow-violet-500/20 ring-1 ring-[#5525F5]/30'
                      : 'bg-[#10121C]/60 backdrop-blur-md border-white/[0.08] hover:bg-[#141724] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      {p.subtitle}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      isActive 
                        ? 'bg-[#5525F5]/20 text-[#A5B4FC] border border-[#5525F5]/40' 
                        : 'bg-white/[0.04] text-zinc-400 border border-white/[0.06]'
                    }`}>
                      {p.metric}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white mt-1.5">
                    {p.title}
                  </h3>

                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                    {p.desc}
                  </p>

                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-[11px] text-[#A5B4FC] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{p.highlight}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Live ATS Parser Inspection Terminal Stream */}
          <div className="lg:col-span-7 bg-[#0E101B]/90 backdrop-blur-xl rounded-2xl border border-white/[0.1] shadow-2xl overflow-hidden">
            
            {/* Terminal Chrome Bar */}
            <div className="px-4 py-3 bg-[#131624] border-b border-white/[0.08] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-200">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">ATS Parser Inspection Stream</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                100% Parsable Layer
              </span>
            </div>

            {/* Parser Stream Nodes Demonstration */}
            <div className="p-5 sm:p-6 space-y-4 font-mono text-xs">
              
              {/* Stream Nodes */}
              <div className="space-y-3">
                
                {/* Node 1: Candidate Identity */}
                <div className={`p-3 rounded-xl border transition-all ${
                  activeTab === 'flow' 
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-200' 
                    : 'bg-[#141724] border-white/[0.06] text-zinc-300'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-blue-400 uppercase tracking-wider block font-bold">
                        NODE 01: CANDIDATE IDENTITY & CONTACT
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

                {/* Node 2: Experience Landmark */}
                <div className={`p-3 rounded-xl border transition-all ${
                  activeTab === 'flow' || activeTab === 'headings'
                    ? 'bg-blue-500/10 border-blue-500/40'
                    : 'bg-[#141724] border-white/[0.06]'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-blue-400 uppercase tracking-wider block font-bold">
                        NODE 02: SECTION_TOKEN [EXPERIENCE]
                      </span>
                      <p className="text-white font-semibold">
                        ClearPath Analytics <span className="text-zinc-500 font-normal">—</span> Senior Product Analyst
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        Date Range: 2022 – Present (Current Position Verified)
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold shrink-0 border border-emerald-500/30">
                      RECOGNIZED
                    </span>
                  </div>
                </div>

                {/* Node 3: STAR Bullet Vector Text */}
                <div className={`p-3 rounded-xl border transition-all ${
                  activeTab === 'text'
                    ? 'bg-emerald-500/10 border-emerald-500/40'
                    : 'bg-[#141724] border-white/[0.06]'
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
                        <span className="text-emerald-300 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                          Action Verb: Spearheaded
                        </span>
                        <span className="text-blue-300 bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 rounded">
                          Metric: $180K ARR (+14%)
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold shrink-0 border border-emerald-500/30">
                      EXTRACTED
                    </span>
                  </div>
                </div>

              </div>

              {/* Verified Architecture Attributes Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/[0.08] text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Single-Column Flow</span>
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
    </section>
  );
}
