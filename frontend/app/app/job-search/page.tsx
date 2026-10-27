'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  Building2, 
  MapPin, 
  Briefcase, 
  Bell, 
  Check, 
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AiJobSearchPage() {
  const [isNotified, setIsNotified] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const sampleOpenings = [
    {
      title: 'Senior Software Engineer — Distributed Systems',
      company: 'Datadog',
      location: 'New York, NY (Hybrid)',
      source: 'Workday',
      date: 'Today',
      matchScore: 92,
      tags: ['Go', 'PostgreSQL', 'Kafka', 'Kubernetes'],
    },
    {
      title: 'Senior Product Analyst — Growth & Experimentation',
      company: 'Figma',
      location: 'San Francisco, CA (Remote)',
      source: 'Greenhouse',
      date: '2h ago',
      matchScore: 88,
      tags: ['SQL', 'Python', 'A/B Testing', 'dbt'],
    },
    {
      title: 'Infrastructure & Cloud Platform Engineer',
      company: 'Stripe',
      location: 'Seattle, WA',
      source: 'Ashby',
      date: '5h ago',
      matchScore: 85,
      tags: ['AWS', 'Terraform', 'Linux', 'Go'],
    },
    {
      title: 'Staff Full-Stack Engineer',
      company: 'Linear',
      location: 'Remote (US/EU)',
      source: 'Ashby',
      date: '1d ago',
      matchScore: 90,
      tags: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    },
  ];

  const filteredJobs = sampleOpenings.filter((job) => {
    if (activeFilter === 'Remote') return job.location.includes('Remote');
    if (activeFilter === 'Engineering') return job.title.includes('Engineer');
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Top Banner */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Planned Feature · Direct ATS Indexing</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Direct ATS Job Discovery
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Index openings directly from corporate career boards (Greenhouse, Lever, Ashby, Workday). Evaluate role requirements against your master resume before applying.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <Button
              onClick={() => setIsNotified(!isNotified)}
              variant="primary"
              size="sm"
              className="gap-2"
            >
              {isNotified ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Subscribed for Updates</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notify Me When Available</span>
                </>
              )}
            </Button>

            <Link href="/app/resumes">
              <Button variant="outline" size="sm">
                Back to My Resumes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Job Table Preview */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Table Chrome Bar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-xs sm:text-sm text-foreground">
              Direct Feed Prototype Preview
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['All', 'Remote', 'Engineering'].map((flt) => (
              <button
                key={flt}
                onClick={() => setActiveFilter(flt)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  activeFilter === flt
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {flt}
              </button>
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border text-xs">
          {filteredJobs.map((job, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-foreground">
                    {job.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground border border-border">
                    {job.source}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-muted-foreground text-xs flex-wrap">
                  <span className="font-medium text-foreground flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                  <span>· {job.date}</span>
                </div>

                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  {job.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-muted/60 text-muted-foreground border border-border"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Match Score & Action */}
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-foreground">
                    {job.matchScore}%
                  </div>
                  <span className="text-[10px] text-muted-foreground">Compatibility</span>
                </div>

                <Link href={`/app/match`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    Match CV
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">
            Direct ATS Origin
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Sourced directly from verified company hiring endpoints to minimize stale or duplicate postings.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground font-bold">
            <Briefcase className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">
            Immediate Evidence Matching
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Cross-references parsed job requirements with your experience bullets so you know where you stand prior to submission.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-foreground">
            Pipeline Integration
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Save interesting positions directly to your Application Tracker with salary parameters and follow-up deadlines.
          </p>
        </div>
      </div>
    </div>
  );
}
