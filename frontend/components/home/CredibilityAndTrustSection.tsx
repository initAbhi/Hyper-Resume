'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  FileText, 
  Lock, 
  Sparkles, 
  Check, 
  UserCheck 
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
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E6E8ED] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#101216]">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-[#1A1D23] border border-[#E6E8ED] dark:border-[#252A33] text-[#626B7A] dark:text-[#9EA7B4] text-xs font-semibold tracking-wider uppercase font-mono">
            <span>Guiding Principles</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#171923] dark:text-[#F0F2F5] tracking-tight leading-tight">
            Built on evidence, not exaggeration.
          </h2>
          
          <p className="text-sm sm:text-base text-[#626B7A] dark:text-[#9EA7B4] leading-relaxed">
            A credible career technology company should empower your authentic qualifications, not invent false claims. We hold our product to uncompromising standards of transparency and evidence.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-6 rounded-2xl bg-white dark:bg-[#14171C] border border-[#E6E8ED] dark:border-[#252A33] shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] dark:bg-[#1D2128] border border-[#E6E8ED] dark:border-[#252A33] text-[#3730F5] dark:text-blue-400 flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                      {pillar.attribute}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#171923] dark:text-[#F0F2F5]">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#626B7A] dark:text-[#9EA7B4] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E6E8ED] dark:border-[#252A33] flex items-center gap-2 text-xs text-[#3730F5] dark:text-blue-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
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

