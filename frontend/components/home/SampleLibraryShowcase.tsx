'use client';

import React from 'react';
import Link from 'next/link';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { 
  Code, 
  TrendingUp, 
  Briefcase, 
  DollarSign, 
  Palette, 
  Scale, 
  Stethoscope, 
  GraduationCap, 
  ArrowRight,
} from 'lucide-react';

export function SampleLibraryShowcase() {
  const categories = [
    {
      title: 'Software Engineering',
      slug: 'software-engineer',
      icon: Code,
      badge: '18 Verified Samples',
      roles: ['Backend Engineer', 'Full Stack Developer', 'DevOps / SRE', 'Cloud Architect'],
      metrics: 'STAR impact bullets with scale & throughput numbers',
    },
    {
      title: 'Marketing & Growth',
      slug: 'marketing',
      icon: TrendingUp,
      badge: '14 Verified Samples',
      roles: ['Product Marketing Manager', 'Growth Lead', 'SEO Specialist', 'Lifecycle Marketer'],
      metrics: 'CAC reduction, funnel conversion lift & ARR growth',
    },
    {
      title: 'Business & Operations',
      slug: 'business',
      icon: Briefcase,
      badge: '16 Verified Samples',
      roles: ['Operations Manager', 'Business Analyst', 'Strategy Consultant', 'Chief of Staff'],
      metrics: 'OpEx efficiency, cross-functional velocity & OKRs',
    },
    {
      title: 'Finance & Banking',
      slug: 'finance',
      icon: DollarSign,
      badge: '12 Verified Samples',
      roles: ['Investment Banking Analyst', 'Financial Modeling', 'Corporate FP&A', 'Risk Associate'],
      metrics: 'AUM volume, DCF valuation accuracy & portfolio metrics',
    },
    {
      title: 'Design & Product',
      slug: 'design',
      icon: Palette,
      badge: '12 Verified Samples',
      roles: ['Product Designer', 'UX Researcher', 'Design Systems Lead', 'UI Architect'],
      metrics: 'Task completion rates, usability lift & design tokens',
    },
    {
      title: 'Legal & Compliance',
      slug: 'legal',
      icon: Scale,
      badge: '10 Verified Samples',
      roles: ['Corporate Counsel', 'Paralegal', 'Contract Specialist', 'Regulatory Analyst'],
      metrics: 'Regulatory audits, risk mitigation & transaction scale',
    },
    {
      title: 'Healthcare & Medical',
      slug: 'medical',
      icon: Stethoscope,
      badge: '10 Verified Samples',
      roles: ['Clinical Nurse', 'Medical Researcher', 'Health Informatics', 'BioTech Lead'],
      metrics: 'Patient throughput, compliance audits & clinical trials',
    },
    {
      title: 'Students & Early Career',
      slug: 'fresher',
      icon: GraduationCap,
      badge: '14 Verified Samples',
      roles: ['Computer Science Graduate', 'Finance Intern', 'Research Assistant', 'Tech Fresher'],
      metrics: 'Academic coursework, capstone projects & GPA benchmarks',
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#090A10] text-white relative overflow-hidden">
      
      {/* Ambient Radial Spotlight */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[400px] bg-[#5525F5]/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.04]">
          <div className="space-y-3 max-w-2xl">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#5525F5] animate-pulse" />
              <span>Career Disciplines</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
              Sample Library. Real-world resume examples across disciplines.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Explore ATS-conscious resume architectures organized by career discipline. Each example demonstrates evidence-grounded STAR bullet structures and standard layout conventions.
            </p>
          </div>

          <Link href="/examples" className="self-start md:self-end">
            <button 
              type="button"
              className="inline-flex items-center justify-center rounded-lg text-xs font-semibold px-4 h-9 gap-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-white hover:text-fuchsia-300 transition-all shadow-sm backdrop-blur-md cursor-pointer"
            >
              <span>Browse All 150+ Samples</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        {/* 8 Disciplines Clean Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const targetHref = cat.slug === 'software-engineer' || cat.slug === 'fresher' 
              ? `/examples/${cat.slug}` 
              : `/examples?discipline=${cat.slug}`;

            return (
              <Link
                key={cat.title}
                href={targetHref}
                className="group block h-full cursor-pointer"
              >
                <SpotlightCard
                  className="p-5 h-full flex flex-col justify-between shadow-lg hover:-translate-y-1 transition-all duration-300"
                  spotlightColor="rgba(139, 92, 246, 0.16)"
                  borderGlowColor="rgba(168, 85, 247, 0.45)"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.05] text-[#A5B4FC] flex items-center justify-center group-hover:scale-105 group-hover:text-white transition-all shadow-inner">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300 font-semibold">
                        {cat.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-snug line-clamp-2">
                        {cat.metrics}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-white/[0.06] space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {cat.roles.slice(0, 2).map((r) => (
                        <span
                          key={r}
                          className="text-[10px] font-medium text-zinc-300 bg-white/[0.04] px-1.5 py-0.5 rounded"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#A5B4FC] group-hover:text-white pt-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Inspect format</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </SpotlightCard>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
