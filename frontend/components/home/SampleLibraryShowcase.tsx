'use client';

import React from 'react';
import Link from 'next/link';
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
    <section className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#090A10] text-white relative overflow-hidden">
      
      {/* Ambient Radial Spotlight */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[700px] h-[500px] bg-[#5525F5]/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5525F5] animate-pulse" />
              <span>Career Disciplines</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Sample Library. Real-world resume examples across disciplines.
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Explore ATS-conscious resume architectures organized by career discipline. Each example demonstrates evidence-grounded STAR bullet structures and standard layout conventions.
            </p>
          </div>

          <Link href="/examples" className="self-start md:self-end">
            <button 
              type="button"
              className="inline-flex items-center justify-center rounded-xl text-xs font-semibold px-4 h-10 gap-2 bg-white/[0.06] hover:bg-white/[0.12] text-white transition-all shadow-sm backdrop-blur-md cursor-pointer hover:shadow-lg hover:shadow-violet-950/30"
            >
              <span>Browse All 150+ Samples</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

        {/* 8 Disciplines Clean Borderless Grid */}
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
                className="group p-6 rounded-2xl bg-[#0D0F18]/90 hover:bg-[#121526] backdrop-blur-xl shadow-lg hover:shadow-2xl hover:shadow-violet-950/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] text-[#A5B4FC] flex items-center justify-center group-hover:scale-105 group-hover:text-white group-hover:bg-[#5525F5]/30 transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10.5px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] text-zinc-400 font-medium">
                      {cat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                      {cat.metrics}
                    </p>
                  </div>

                  {/* Sample Role Tags */}
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {cat.roles.slice(0, 2).map((role) => (
                      <span
                        key={role}
                        className="px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 text-[10.5px] group-hover:text-zinc-300 transition-colors"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-1.5 text-xs text-[#A5B4FC] group-hover:text-white font-medium transition-colors">
                  <span>Inspect format</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
