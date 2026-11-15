'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FileText, 
  Target, 
  Sparkles, 
  Mic, 
  Briefcase, 
  LayoutTemplate,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureTab {
  id: string;
  name: string;
  shortDesc: string;
  icon: React.ElementType;
  tag: string;
  screenshot: string;
  alt: string;
  headline: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
}

export function ProductFeatureScreenshots() {
  const tabs: FeatureTab[] = [
    {
      id: 'builder',
      name: 'Resume Builder Studio',
      shortDesc: 'Live 3-Pane Editor & Scoring',
      icon: FileText,
      tag: 'Core Platform',
      screenshot: '/product-screens/15_resume_builder_editor_workspace.png',
      alt: 'HypeResume Live Resume Builder Workspace and Real-Time ATS Score Meter',
      headline: 'A focused, distraction-free cockpit engineered for single-page precision.',
      bullets: [
        'Instant real-time ATS scoring (0–100) reacting to every edit',
        'Automatic typography, margin, and pagination calculation',
        'Built-in STAR formula rewriter with evidence preservation',
        'Version history with instant branch diffing and rollback'
      ],
      ctaLabel: 'Open Resume Studio',
      ctaHref: '/register'
    },
    {
      id: 'job-match',
      name: 'Evidence Job Match',
      shortDesc: 'Requirement Gap Radar',
      icon: Target,
      tag: 'AI Intelligence',
      screenshot: '/product-screens/11_job_match_analysis_result.png',
      alt: 'HypeResume Job Match Analysis with Cited Requirements and Gap Identification',
      headline: 'Match target job descriptions with cited evidence, not hallucinated keywords.',
      bullets: [
        'Quotes exact lines from the job description with requirement weight',
        'Categorizes points into Supported, Needs Confirmation, and Documented Gaps',
        'One-click tailored resume branch generation per application',
        'Identifies missing technical competencies before you submit'
      ],
      ctaLabel: 'Test Job Match Tool',
      ctaHref: '/tools/job-match'
    },
    {
      id: 'bullet-improver',
      name: 'STAR Bullet Improver',
      shortDesc: 'XYZ Formula Transformation',
      icon: Sparkles,
      tag: 'Impact Engine',
      screenshot: '/product-screens/08_bullet_improver_xyz_results.png',
      alt: 'HypeResume STAR and Google XYZ Bullet Point Transformation Engine',
      headline: 'Convert passive task descriptions into high-leverage business outcomes.',
      bullets: [
        'Follows Google\'s proven XYZ framework (Accomplished X, measured by Y, by doing Z)',
        'Suggests actionable metric placeholders without inventing fake numbers',
        'Generates 3 calibrated variations (Metric-Focused, Leadership, Technical)',
        'Maintains authentic factual integrity of your original experience'
      ],
      ctaLabel: 'Try Bullet Improver Free',
      ctaHref: '/tools/bullet-improver'
    },
    {
      id: 'interview',
      name: 'AI Mock Interview',
      shortDesc: 'Role-Specific Simulator',
      icon: Mic,
      tag: 'Interview Prep',
      screenshot: '/product-screens/18_ai_interview_studio.png',
      alt: 'HypeResume AI Mock Interview Studio with Live Answer Feedback',
      headline: 'Practice behavioral and technical rounds tailored to your target job.',
      bullets: [
        'Simulates real technical recruiter, hiring manager, and executive questions',
        'Turn-by-turn STAR evaluation grading your responses with actionable critiques',
        'Detects vague claims and prompts you for specific project metrics',
        'Targeted practice modes: Quick Practice, Full Mock, or Weak-Area Focus'
      ],
      ctaLabel: 'Start Practice Session',
      ctaHref: '/register'
    },
    {
      id: 'pipeline',
      name: 'Application Pipeline',
      shortDesc: 'Kanban Job Search Tracker',
      icon: Briefcase,
      tag: 'Search Management',
      screenshot: '/product-screens/19_job_applications_pipeline.png',
      alt: 'HypeResume Application Kanban Pipeline Tracking Job Opportunities',
      headline: 'Keep every tailored resume, match score, and interview date organized.',
      bullets: [
        'Visual Kanban stages: Draft, Applied, Interviewing, Offer, and Archived',
        'Direct link between each application and its tailored resume snapshot',
        'Track compensation expectations, recruiter notes, and interview dates',
        'Zero messy spreadsheets — unified career application lifecycle'
      ],
      ctaLabel: 'Organize Your Search',
      ctaHref: '/register'
    },
    {
      id: 'templates',
      name: '10 ATS Templates',
      shortDesc: 'Deterministic Vector Layouts',
      icon: LayoutTemplate,
      tag: 'Design Library',
      screenshot: '/product-screens/12_resume_templates_gallery.png',
      alt: 'HypeResume Production Resume Templates Gallery',
      headline: 'Beautiful typographic designs certified for linear parser reading.',
      bullets: [
        '10 proven templates including Classic ATS, Jake\'s, Modern, and Ivy League',
        '100% vector-clean PDF and DOCX export with selectable UTF-8 text',
        'Customizable accent palettes, typography scales, and compact margins',
        'Completely free unwatermarked exports on all standard templates'
      ],
      ctaLabel: 'Explore All Templates',
      ctaHref: '/examples'
    },
  ];

  const [activeTabId, setActiveTabId] = useState<string>('builder');
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const IconComponent = activeTab.icon;

  return (
    <section className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#090A10] text-white relative overflow-hidden">
      
      {/* Subtle radial spotlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#285FEA]/[0.08] blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 text-center mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-inner backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#285FEA] animate-pulse" />
            <span>Product Showcase</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            See the actual platform in action.
          </h2>
          
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            No mockups or artificial renders. Explore actual production screens from the HypeResume application suite.
          </p>
        </div>

        {/* Feature Tab Selector (Desktop pills, mobile scroll) */}
        <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none no-scrollbar">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? 'bg-[#181C2E] text-white border-[#285FEA] shadow-md shadow-[#285FEA]/20'
                    : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06] hover:text-zinc-200'
                }`}
              >
                <TabIcon className={`w-4 h-4 ${isActive ? 'text-[#3B75F2]' : 'text-zinc-400'}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Feature Deep Dive Showcase Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0C0E17]/95 backdrop-blur-2xl p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8">
          
          {/* Top metadata & overview */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#285FEA]/15 text-[#3B75F2] flex items-center justify-center font-bold">
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#3B75F2] font-semibold">
                  {activeTab.tag}
                </span>
                <span className="text-zinc-600">&bull;</span>
                <span className="text-xs text-zinc-400 font-medium">{activeTab.shortDesc}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeTab.headline}
              </h3>
            </div>

            <Link href={activeTab.ctaHref} className="shrink-0">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-lg shadow-white/5"
              >
                <span>{activeTab.ctaLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>

          {/* Key Advantages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeTab.bullets.map((bullet, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-zinc-300 leading-snug">{bullet}</span>
              </div>
            ))}
          </div>

          {/* Real High-Resolution Screenshot in Browser Container */}
          <div className="rounded-xl border border-white/[0.1] bg-[#06070B] overflow-hidden shadow-2xl relative group">
            {/* macOS-style top toolbar */}
            <div className="h-9 px-4 bg-[#141722] border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="px-4 py-1 rounded-md bg-black/40 text-[11px] font-mono text-zinc-400 max-w-[260px] truncate border border-white/[0.04]">
                https://hype-resume.com/app/{activeTab.id}
              </div>
              <div className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                Verified Production UI
              </div>
            </div>

            {/* Production Screenshot Image */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-[#08090E] overflow-hidden">
              <Image
                src={activeTab.screenshot}
                alt={activeTab.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
                priority={activeTab.id === 'builder'}
                className="object-contain object-top transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

