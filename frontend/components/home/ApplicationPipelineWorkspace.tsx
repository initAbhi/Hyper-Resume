'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  ArrowRight, 
  Calendar, 
  FileText, 
  Plus
} from 'lucide-react';

export function ApplicationPipelineWorkspace() {
  const columns = [
    {
      title: 'Bookmarked',
      count: 2,
      badgeColor: 'bg-white/[0.06] text-zinc-300',
      cards: [
        {
          company: 'Linear',
          role: 'Product Engineer',
          resume: 'Tailored — Product Focus',
          date: 'Saved 2d ago',
          score: '92%',
        },
        {
          company: 'Ramp',
          role: 'Backend Systems Engineer',
          resume: 'Tailored — Distributed Systems',
          date: 'Saved 4d ago',
          score: '88%',
        },
      ],
    },
    {
      title: 'Applied',
      count: 2,
      badgeColor: 'bg-blue-500/15 text-blue-300',
      cards: [
        {
          company: 'Google',
          role: 'Staff Software Engineer',
          resume: 'Resume: Modern ATS v3',
          date: 'Submitted Nov 3',
          score: '96%',
        },
        {
          company: 'Datadog',
          role: 'Senior Platform Engineer',
          resume: 'Resume: Clean Infrastructure',
          date: 'Submitted Nov 1',
          score: '94%',
        },
      ],
    },
    {
      title: 'Interviewing',
      count: 2,
      badgeColor: 'bg-emerald-500/15 text-emerald-300',
      cards: [
        {
          company: 'Stripe',
          role: 'Senior Product Analyst',
          resume: 'Tailored — A/B & SQL Metrics',
          date: 'Technical Round · Tomorrow',
          score: '98%',
          highlight: true,
        },
        {
          company: 'Vercel',
          role: 'Full Stack Engineer',
          resume: 'Resume: Next.js Ecosystem',
          date: 'System Design · Nov 12',
          score: '91%',
        },
      ],
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#090A10] text-white relative overflow-hidden">
      
      {/* Soft Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#5525F5]/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5525F5] animate-pulse" />
            <span>Unified Workflow</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
            Keep every application organized.
          </h2>
          
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Bring resume preparation, job-specific versions, and application progress into one organized workspace. Always know which resume was submitted to each company and which achievements to speak to in interviews.
          </p>
        </div>

        {/* Realistic Pipeline Board Preview */}
        <div className="rounded-2xl bg-[#0E101B]/90 backdrop-blur-xl p-4 sm:p-6 shadow-2xl overflow-hidden">
          
          {/* Board Top Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-bold text-white">
                <Briefcase className="w-4 h-4 text-[#A5B4FC]" />
                <span>Active Job Search Cycle</span>
              </div>
              <span className="text-zinc-500 font-mono">· 6 Opportunities Tracked</span>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/login">
                <button 
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg text-xs font-semibold px-3 h-8 gap-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-white transition-all shadow-sm backdrop-blur-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Application</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((col) => (
              <div
                key={col.title}
                className="p-3.5 rounded-xl bg-[#0B0D18]/90 backdrop-blur-md space-y-3 shadow-md"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <div className="flex items-center gap-2">
                    <span>{col.title}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${col.badgeColor}`}>
                      {col.count}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-2.5">
                  {col.cards.map((c) => (
                    <div
                      key={c.company}
                      className={`p-3.5 rounded-xl space-y-2 transition-all duration-200 ${
                        c.highlight
                          ? 'bg-gradient-to-b from-[#1E1B38] to-[#151726] shadow-[0_0_25px_rgba(85,37,245,0.25)] ring-1 ring-violet-500/30'
                          : 'bg-[#141727]/90 hover:bg-[#181B2E] shadow-sm hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-white">
                            {c.company}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-medium">
                            {c.role}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                          {c.score}
                        </span>
                      </div>

                      <div className="pt-2 space-y-1 text-[10.5px]">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <FileText className="w-3 h-3 text-[#A5B4FC] shrink-0" />
                          <span className="truncate">{c.resume}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px]">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>{c.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Workspace Action */}
          <div className="mt-5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400 gap-3">
            <span>Associate exact resume versions, interview dates, and recruiter contact notes in one private system.</span>
            <Link href="/login" className="font-semibold text-[#A5B4FC] hover:text-white inline-flex items-center gap-1 transition-colors">
              <span>Open Application Workspace</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
