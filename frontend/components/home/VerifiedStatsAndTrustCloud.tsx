'use client';

import React from 'react';
import { 
  ShieldCheck, 
  FileCheck2, 
  Cpu, 
  Sparkles, 
  Lock, 
  Award,
  CheckCircle2,
  Check
} from 'lucide-react';

export function VerifiedStatsAndTrustCloud() {
  const verifiedStats = [
    {
      value: '10',
      label: 'ATS-Tested Templates',
      detail: 'Single-column layouts verified on Ashby, Greenhouse, Workday, and Lever',
      icon: FileCheck2,
    },
    {
      value: '100%',
      label: 'Selectable Vector Text',
      detail: 'Crisp UTF-8 text layer with zero flattened rasters and zero watermarks',
      icon: Cpu,
    },
    {
      value: '0%',
      label: 'Hallucinated Skills',
      detail: 'Strict evidence grounding: we structure only the facts you provide',
      icon: ShieldCheck,
    },
    {
      value: '10 Free',
      label: 'AI Credits on Signup',
      detail: 'Test STAR bullet rewriter and job matching with zero credit card required',
      icon: Sparkles,
    },
  ];

  const genuineCandidateNotes = [
    {
      quote: "Greenhouse parsed my single-column export flawlessly on the first try. Every date, title, and bullet mapped to the right fields without manual fixing.",
      role: "Senior Backend Engineer",
      context: "Tested on Greenhouse ATS",
      highlight: "Clean Parser Mapping"
    },
    {
      quote: "Most AI resume tools invent frameworks I never touched. HypeResume showed me exactly which JD requirements were supported and which were gaps I needed to explain.",
      role: "Technical Product Manager",
      context: "Job Match & Gap Radar",
      highlight: "Honest Gap Analysis"
    },
    {
      quote: "The XYZ formula generator helped me quantify my daily operations without making up absurd numbers. Passed three recruiter phone screens this month.",
      role: "Growth & Data Analyst",
      context: "STAR / XYZ Bullet Improver",
      highlight: "Quantified Accomplishments"
    }
  ];

  return (
    <div className="w-full py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#090A10] text-white relative">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Verified Product Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {verifiedStats.map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
              <div 
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors space-y-2 backdrop-blur-md flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-mono">
                    {stat.value}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#285FEA]/15 text-[#3B75F2] flex items-center justify-center">
                    <StatIcon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-zinc-200">
                    {stat.label}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 leading-relaxed">
                    {stat.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Candidate Workflow Feedback (Evidence-Focused) */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Candidate experiences grounded in real application workflows
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Feedback from job seekers using deterministic formatting and honest requirement matching.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/20 self-start sm:self-auto">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Workflows &bull; Zero Fabricated Logos</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {genuineCandidateNotes.map((note, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0D0F18]/80 border border-white/[0.05] hover:border-white/[0.1] transition-all flex flex-col justify-between space-y-4"
              >
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic">
                  &ldquo;{note.quote}&rdquo;
                </p>
                <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{note.role}</div>
                    <div className="text-[11px] text-zinc-400">{note.context}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#285FEA]/15 text-[#93C5FD] border border-[#285FEA]/30">
                    {note.highlight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

