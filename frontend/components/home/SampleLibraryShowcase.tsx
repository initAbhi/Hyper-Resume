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
import AnimatedContent from '@/components/AnimatedContent';
import { HoverEffect } from '@/components/ui/hover-effect';

const CATEGORIES = [
  {
    title: 'Software Engineering',
    slug: 'software-engineer',
    icon: <Code className="h-4 w-4" />,
    count: '15 samples',
    blurb: 'Backend, full-stack, DevOps, cloud.',
  },
  {
    title: 'Marketing & Growth',
    slug: 'marketing',
    icon: <TrendingUp className="h-4 w-4" />,
    count: '7 samples',
    blurb: 'PMM, growth, SEO, lifecycle.',
  },
  {
    title: 'Business & Product',
    slug: 'business',
    icon: <Briefcase className="h-4 w-4" />,
    count: '8 samples',
    blurb: 'PM, BA, strategy, operations.',
  },
  {
    title: 'Finance & Banking',
    slug: 'finance',
    icon: <DollarSign className="h-4 w-4" />,
    count: '7 samples',
    blurb: 'IB, FP&A, modeling, risk.',
  },
  {
    title: 'Design & UX',
    slug: 'design',
    icon: <Palette className="h-4 w-4" />,
    count: '6 samples',
    blurb: 'Product design, research, systems.',
  },
  {
    title: 'Legal & Compliance',
    slug: 'legal',
    icon: <Scale className="h-4 w-4" />,
    count: '4 samples',
    blurb: 'Counsel, contracts, regulatory.',
  },
  {
    title: 'Healthcare',
    slug: 'medical',
    icon: <Stethoscope className="h-4 w-4" />,
    count: '6 samples',
    blurb: 'Clinical, research, informatics.',
  },
  {
    title: 'Students & Early Career',
    slug: 'fresher',
    icon: <GraduationCap className="h-4 w-4" />,
    count: '5 samples',
    blurb: 'Interns, freshers, research assistants.',
  },
] as const;

export function SampleLibraryShowcase() {
  const items = CATEGORIES.map((cat) => {
    const href =
      cat.slug === 'software-engineer' || cat.slug === 'fresher'
        ? `/examples/${cat.slug}`
        : `/examples?discipline=${cat.slug}`;
    return {
      title: cat.title,
      description: cat.blurb,
      link: href,
      meta: cat.count,
      icon: cat.icon,
    };
  });

  return (
    <section className="w-full bg-[#0a0a0a] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <AnimatedContent distance={28} duration={0.7}>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              Sample library
            </p>
            <h2 className="mt-3 font-rubik text-3xl font-semibold tracking-tight sm:text-4xl">
              82 company-caliber samples across 12 disciplines.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
              Browse dense ATS formats by role — then adapt one to your verified profile while
              sample company names stay quarantined.
            </p>
          </AnimatedContent>
          <Link
            href="/examples"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-white/[0.06] px-5 text-sm font-medium text-white transition hover:bg-white/[0.1]"
          >
            Browse all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10">
          <HoverEffect items={items} />
        </div>
      </div>
    </section>
  );
}
