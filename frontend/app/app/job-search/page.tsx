'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Briefcase, 
  Filter, 
  ExternalLink, 
  Bell, 
  Check, 
  TrendingUp, 
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AiJobSearchPage() {
  const [isNotified, setIsNotified] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const mockJobs = [
    {
      title: 'Senior Software Engineer — Distributed Systems',
      company: 'Capital One',
      location: 'New York, NY (Hybrid)',
      source: 'Workday ATS',
      date: 'Today',
      matchScore: 98,
      tags: ['PostgreSQL', 'Go', 'Kafka', 'AWS'],
    },
    {
      title: 'Senior Product Analyst — Growth & Experiments',
      company: 'Adobe',
      location: 'San Francisco, CA (Remote)',
      source: 'Greenhouse',
      date: '2h ago',
      matchScore: 96,
      tags: ['dbt', 'SQL', 'A/B Testing', 'Tableau'],
    },
    {
      title: 'Machine Learning Infrastructure Engineer',
      company: 'Apple',
      location: 'Cupertino, CA',
      source: 'Apple Careers ATS',
      date: '5h ago',
      matchScore: 92,
      tags: ['Python', 'Kubernetes', 'PyTorch'],
    },
    {
      title: 'Lead Full Stack Generalist',
      company: 'Linear',
      location: 'Remote (US/EU)',
      source: 'Ashby',
      date: '1d ago',
      matchScore: 94,
      tags: ['TypeScript', 'React', 'Node.js'],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-6">
      
      {/* Top Banner / Hero (Rezi Screenshot 1 & 2 inspired) */}
      <div className="relative rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 sm:p-12 shadow-sm overflow-hidden text-center sm:text-left">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Coming Soon • Sourced Direct from ATS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Find real open jobs and get hired fast.
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            This is not a generic job board. We source over 1.3M verified openings directly from company career sites—not those &quot;resume black holes&quot; like LinkedIn or Indeed. Auto-matches jobs against your HyperResume profile with live ATS match scoring.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={() => setIsNotified(!isNotified)}
              className="w-full sm:w-auto rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 h-11 gap-2 shadow-sm"
            >
              {isNotified ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>You&apos;re On The Early Access List</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Notify Me When Live</span>
                </>
              )}
            </Button>

            <Link href="/app/resumes" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto rounded-full text-xs font-semibold h-11 px-6">
                Back to My Resumes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Job Table Preview Mockup */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden space-y-0">
        
        {/* Table Chrome Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-800/30">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Live Sourced Openings Preview
            </span>
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
              (Updated Hourly from Ashby, Greenhouse & Workday)
            </span>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['All', 'Remote', 'Data & Analytics', 'Engineering'].map((flt) => (
              <button
                key={flt}
                onClick={() => setActiveFilter(flt)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === flt
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {flt}
              </button>
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
          {mockJobs.map((job, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {job.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {job.source}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-zinc-500 text-xs flex-wrap">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                  <span>• {job.date}</span>
                </div>

                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  {job.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Match Score & Action */}
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{job.matchScore}% Match</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Based on your CV</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNotified(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs hover:opacity-90 transition-opacity"
                >
                  Tailor CV
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Cut Out The Middlemen
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            All postings are extracted straight from company ATS domains. No ghost jobs, expired postings, or third-party recruiters scraping stale data.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Live Match Compatibility
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Our ATS engine analyzes every job description against your master profile to instantly show match scores and missing skill keywords.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Pipeline Auto-Sync
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Save discovered jobs directly into your Active Applications board with one click, preserving version associations and interview stages.
          </p>
        </div>
      </div>

    </div>
  );
}
