'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Check, 
  ArrowRight, 
  Calendar, 
  FileText, 
  Building2, 
  Clock, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ApplicationPipelineWorkspace() {
  const columns = [
    {
      title: 'Bookmarked',
      count: 2,
      badgeColor: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
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
      badgeColor: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
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
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
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
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E6E8ED] dark:border-[#252A33] bg-white dark:bg-[#0C0D13]">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F7F8FA] dark:bg-[#1A1D23] border border-[#E6E8ED] dark:border-[#252A33] text-[#626B7A] dark:text-[#9EA7B4] text-xs font-semibold tracking-wider uppercase font-mono">
            <span>Unified Workflow</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#171923] dark:text-[#F0F2F5] tracking-tight leading-tight">
            Keep every application organized.
          </h2>
          
          <p className="text-sm sm:text-base text-[#626B7A] dark:text-[#9EA7B4] leading-relaxed">
            Bring resume preparation, job-specific versions, and application progress into one organized workspace. Always know which resume was submitted to each company and which achievements to speak to in interviews.
          </p>
        </div>

        {/* Realistic Pipeline Board Preview */}
        <div className="rounded-2xl border border-[#E6E8ED] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#14171C] p-4 sm:p-6 shadow-sm overflow-hidden">
          
          {/* Board Top Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#E6E8ED] dark:border-[#252A33] gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-bold text-[#171923] dark:text-[#F0F2F5]">
                <Briefcase className="w-4 h-4 text-[#3730F5] dark:text-blue-400" />
                <span>Active Job Search Cycle</span>
              </div>
              <span className="text-zinc-400 font-mono">· 6 Opportunities Tracked</span>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" variant="outline" className="h-8 text-xs font-semibold rounded-md gap-1.5 hover:border-[#3730F5]">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Application</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((col) => (
              <div
                key={col.title}
                className="p-3.5 rounded-xl bg-white/70 dark:bg-[#101216]/60 border border-[#E6E8ED] dark:border-[#252A33] space-y-3"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between text-xs font-semibold text-[#171923] dark:text-[#F0F2F5]">
                  <div className="flex items-center gap-2">
                    <span>{col.title}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${col.badgeColor}`}>
                      {col.count}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-2.5">
                  {col.cards.map((c) => (
                    <div
                      key={c.company}
                      className={`p-3.5 rounded-xl border bg-white dark:bg-[#171923] space-y-2 transition-all ${
                        c.highlight
                          ? 'border-[#3730F5]/40 dark:border-blue-500/40 shadow-xs ring-1 ring-[#3730F5]/10'
                          : 'border-[#E6E8ED] dark:border-[#252A33] shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-[#171923] dark:text-[#F0F2F5]">
                            {c.company}
                          </div>
                          <div className="text-[11px] text-[#626B7A] dark:text-[#9EA7B4] font-medium">
                            {c.role}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                          {c.score}
                        </span>
                      </div>

                      <div className="pt-1.5 border-t border-[#E6E8ED] dark:border-[#252A33] space-y-1 text-[10.5px]">
                        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                          <FileText className="w-3 h-3 text-[#3730F5] dark:text-blue-400 shrink-0" />
                          <span className="truncate">{c.resume}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px]">
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
          <div className="mt-5 pt-4 border-t border-[#E6E8ED] dark:border-[#252A33] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#626B7A] dark:text-[#9EA7B4] gap-3">
            <span>Associate exact resume versions, interview dates, and recruiter contact notes in one private system.</span>
            <Link href="/login" className="font-semibold text-[#3730F5] dark:text-blue-400 hover:underline inline-flex items-center gap-1">
              <span>Open Application Workspace</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}

