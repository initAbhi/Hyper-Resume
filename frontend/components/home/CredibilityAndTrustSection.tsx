'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  FileText, 
  Lock, 
  Check, 
} from 'lucide-react';

export function CredibilityAndTrustSection() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: 'Evidence-Grounded Suggestions',
      desc: 'Our engine structures and articulates the authentic facts, dates, and metrics you provide. We strictly prohibit the fabrication of unearned degrees, fake employers, or fictional achievements.',
      attribute: 'Zero Fabricated Content',
    },
    {
      icon: Search,
      title: 'Transparent Requirement Matching',
      desc: 'We map job requirements directly to documented qualifications in your work experience. When you lack evidence for a required competency, we highlight the gap honestly rather than hallucinating keywords.',
      attribute: 'Honest Gap Analysis',
    },
    {
      icon: FileText,
      title: 'Standard Parsing Conventions',
      desc: 'Templates prioritize clean single-column ATS defaults alongside selectable-text modern layouts—with recognized headings, standard dates, and selectable UTF-8 vector layers without broken tables or floating text boxes.',
      attribute: 'Deterministic Flow',
    },
    {
      icon: Lock,
      title: 'Total Candidate Control & Privacy',
      desc: 'Your career data, resume drafts, and target job descriptions are stored in private storage. We do not sell your personal data or use your career documents to train public foundational AI models.',
      attribute: 'Private & Secure',
    },
  ];

  return (
    <section className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#090A10] text-white relative overflow-hidden">
      
      {/* Ambient Radial Spotlight */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[700px] h-[450px] bg-[#5525F5]/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-inner backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5525F5] animate-pulse" />
            <span>Guiding Principles</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Built on evidence, not exaggeration.
          </h2>
          
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            A credible career technology company should empower your authentic qualifications, not invent false claims. We hold our product to uncompromising standards of transparency and evidence.
          </p>
        </div>

        {/* 4 Pillars Grid (Borderless Tonal Glass) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-7 sm:p-8 rounded-2xl bg-[#0D0F18]/90 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5 hover:bg-[#121526] hover:shadow-2xl hover:shadow-violet-950/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.05] text-[#A5B4FC] flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10.5px] font-mono px-3 py-1 rounded-full bg-white/[0.04] text-zinc-400 font-medium">
                      {pillar.attribute}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs text-zinc-300 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Enforced across all templates &amp; AI suggestions</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
