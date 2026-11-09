'use client';

import React from 'react';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
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
      desc: 'Resumes are typeset in single-column layouts with recognized headings, standard date formatting, and selectable UTF-8 vector text layers. No tables or floating boxes that break ATS text extraction.',
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
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#090A10] text-white relative overflow-hidden">
      
      {/* Ambient Radial Spotlight */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[350px] bg-[#5525F5]/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5525F5] animate-pulse" />
            <span>Guiding Principles</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
            Built on evidence, not exaggeration.
          </h2>
          
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            A credible career technology company should empower your authentic qualifications, not invent false claims. We hold our product to uncompromising standards of transparency and evidence.
          </p>
        </div>

        {/* 4 Pillars Grid with SpotlightCards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <SpotlightCard
                key={pillar.title}
                className="p-6 h-full flex flex-col justify-between space-y-4 shadow-lg hover:-translate-y-1 transition-all duration-300"
                spotlightColor="rgba(139, 92, 246, 0.16)"
                borderGlowColor="rgba(168, 85, 247, 0.45)"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] text-[#A5B4FC] flex items-center justify-center font-bold shadow-inner">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300 font-semibold">
                      {pillar.attribute}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2 text-xs text-zinc-300 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enforced across all templates &amp; AI suggestions</span>
                </div>
              </SpotlightCard>
            );
          })}
        </div>

      </div>
    </section>
  );
}
