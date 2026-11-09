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
  Eye
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
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E6E8ED] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#101216]">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Editorial Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-[#1A1D23] border border-[#E6E8ED] dark:border-[#252A33] text-[#626B7A] dark:text-[#9EA7B4] text-xs font-semibold tracking-wider uppercase font-mono">
            <span>Parser Architecture</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#171923] dark:text-[#F0F2F5] tracking-tight leading-tight">
            Designed for people. Structured for parsing.
          </h2>
          
          <p className="text-sm sm:text-base text-[#626B7A] dark:text-[#9EA7B4] leading-relaxed">
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
                  className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#171923] border-[#3730F5] dark:border-blue-500 shadow-sm ring-1 ring-[#3730F5]/20'
                      : 'bg-white/60 dark:bg-[#14171C]/60 border-[#E6E8ED] dark:border-[#252A33] hover:bg-white dark:hover:bg-[#171923] hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#626B7A] dark:text-[#9EA7B4]">
                      {p.subtitle}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      isActive 
                        ? 'bg-[#3730F5]/10 text-[#3730F5] dark:text-blue-400' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}>
                      {p.metric}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#171923] dark:text-[#F0F2F5] mt-1.5">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#626B7A] dark:text-[#9EA7B4] mt-1.5 leading-relaxed">
                    {p.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: High-Fidelity Technical Document Inspector */}
          <div className="lg:col-span-7 bg-white dark:bg-[#14171C] rounded-2xl border border-[#E6E8ED] dark:border-[#252A33] shadow-sm overflow-hidden">
            
            {/* Inspector Chrome Bar */}
            <div className="px-4 py-3 bg-[#F7F8FA] dark:bg-[#1D2128] border-b border-[#E6E8ED] dark:border-[#252A33] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-[#3730F5] dark:text-blue-400" />
                <span className="font-semibold text-[#171923] dark:text-[#F0F2F5]">
                  ATS Parser Inspection Stream
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  100% Parsable Layer
                </span>
              </div>
            </div>

            {/* Inspector Display Content */}
            <div className="p-5 sm:p-6 space-y-5">
              
              {/* Document Stream Hierarchy */}
              <div className="space-y-3 font-mono text-xs">
                
                {/* Node 1: Header */}
                <div className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#101216] border border-[#E6E8ED] dark:border-[#252A33] flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                      NODE 01: CANDIDATE IDENTITY & CONTACT
                    </span>
                    <p className="text-zinc-800 dark:text-zinc-200 font-semibold">
                      Alex Morgan <span className="font-normal text-zinc-500">· Senior Product Analyst</span>
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      alex.morgan@email.com · (415) 555-0192 · San Francisco, CA
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                    PASS
                  </span>
                </div>

                {/* Node 2: Experience Landmark */}
                <div className={`p-3 rounded-lg border transition-all ${
                  activeTab === 'flow' || activeTab === 'headings'
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40'
                    : 'bg-[#F7F8FA] dark:bg-[#101216] border-[#E6E8ED] dark:border-[#252A33]'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-wider block font-bold">
                        NODE 02: SECTION_TOKEN [EXPERIENCE]
                      </span>
                      <p className="text-zinc-800 dark:text-zinc-200 font-semibold">
                        ClearPath Analytics <span className="text-zinc-400 font-normal">—</span> Senior Product Analyst
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Date Range: 2022 – Present (Current Position Verified)
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                      RECOGNIZED
                    </span>
                  </div>
                </div>

                {/* Node 3: STAR Bullet Vector Text */}
                <div className={`p-3 rounded-lg border transition-all ${
                  activeTab === 'text'
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                    : 'bg-[#F7F8FA] dark:bg-[#101216] border-[#E6E8ED] dark:border-[#252A33]'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block font-bold">
                        NODE 03: BULLET_ACHIEVEMENT [TEXT_LAYER_RAW]
                      </span>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
                        &quot;Spearheaded 22 checkout pricing A/B experiments, identifying 3 high-converting funnels that increased quarterly ARR by $180K and reduced checkout drop-off by 14%.&quot;
                      </p>
                      <div className="flex flex-wrap gap-2 text-[10px] pt-1">
                        <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                          Action Verb: Spearheaded
                        </span>
                        <span className="text-blue-700 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">
                          Metric: $180K ARR (+14%)
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                      EXTRACTED
                    </span>
                  </div>
                </div>

              </div>

              {/* Verified Architecture Attributes Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#E6E8ED] dark:border-[#252A33] text-[11px] text-[#626B7A] dark:text-[#9EA7B4]">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Single-Column Flow</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Standard Headings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Zero Table Traps</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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

