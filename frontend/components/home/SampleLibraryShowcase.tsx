'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
  CheckCircle2,
  FileText
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
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E6E8ED] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#101216]">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[#E6E8ED] dark:border-[#252A33]">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-[#1A1D23] border border-[#E6E8ED] dark:border-[#252A33] text-[#626B7A] dark:text-[#9EA7B4] text-xs font-semibold tracking-wider uppercase font-mono">
              <span>Career Disciplines</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#171923] dark:text-[#F0F2F5] tracking-tight leading-tight">
              Sample Library. Real-world resume examples across disciplines.
            </h2>
            <p className="text-sm sm:text-base text-[#626B7A] dark:text-[#9EA7B4] leading-relaxed">
              Explore ATS-conscious resume architectures organized by career discipline. Each example demonstrates evidence-grounded STAR bullet structures and standard layout conventions.
            </p>
          </div>

          <Link href="/examples" className="self-start md:self-end">
            <Button variant="outline" size="sm" className="rounded-md text-xs font-semibold px-4 h-9 gap-1.5 hover:border-[#3730F5] transition-colors">
              <span>Browse All 150+ Samples</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
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
                className="group p-5 rounded-2xl bg-white dark:bg-[#14171C] border border-[#E6E8ED] dark:border-[#252A33] shadow-xs hover:border-[#3730F5]/50 dark:hover:border-blue-500/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-[#F7F8FA] dark:bg-[#1D2128] border border-[#E6E8ED] dark:border-[#252A33] text-[#3730F5] dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                      {cat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#171923] dark:text-[#F0F2F5] group-hover:text-[#3730F5] dark:group-hover:text-blue-400 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-[#626B7A] dark:text-[#9EA7B4] mt-1 leading-snug line-clamp-2">
                      {cat.metrics}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#E6E8ED] dark:border-[#252A33] space-y-1.5">
                  <div className="flex flex-wrap gap-1">
                    {cat.roles.slice(0, 2).map((r) => (
                      <span
                        key={r}
                        className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 px-1.5 py-0.5 rounded"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[#3730F5] dark:text-blue-400 pt-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect format</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
