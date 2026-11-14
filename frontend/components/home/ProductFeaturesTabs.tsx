'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const FEATURE_TABS = [
  {
    title: 'Overview',
    value: 'overview',
    heading: 'Your career workspace',
    blurb:
      'Resumes, credits, applications, and next actions in one calm overview — build once, then apply everywhere.',
    img: '/marketing/product/overview-v2.png',
    alt: 'HypeResume workspace overview dashboard',
    href: '/register?redirect=/app',
  },
  {
    title: 'Samples',
    value: 'samples',
    heading: '82 company benchmarks',
    blurb:
      'Clone role-ready formats used for top companies, then adapt them to your verified profile.',
    img: '/marketing/product/samples-v2.png',
    alt: 'HypeResume sample resume library',
    href: '/examples',
  },
  {
    title: 'Match',
    value: 'match',
    heading: 'Evidence-cited job match',
    blurb:
      'Paste a JD. See which requirements are supported in your bullets versus which need confirmation.',
    img: '/marketing/product/match-v2.png',
    alt: 'HypeResume job match analysis',
    href: '/tools/job-match',
  },
  {
    title: 'Cover letters',
    value: 'cover',
    heading: 'Cover letters from proof',
    blurb:
      'Generate letters anchored in achievements you already documented — export PDF or DOCX.',
    img: '/marketing/product/cover-letters-v2.png',
    alt: 'HypeResume cover letter studio',
    href: '/register?redirect=/app/cover-letters',
  },
  {
    title: 'Jobs',
    value: 'jobs',
    heading: 'Live ATS job boards',
    blurb:
      'Search Greenhouse, Ashby, and Lever openings inside the workspace — then save to your tracker.',
    img: '/marketing/product/job-search-v2.png',
    alt: 'HypeResume live job search',
    href: '/register?redirect=/app/job-search',
  },
] as const;

type TabValue = (typeof FEATURE_TABS)[number]['value'];

/**
 * Product tour using full-width landscape screenshots only.
 */
export function ProductFeaturesTabs() {
  const [active, setActive] = useState<TabValue>('overview');
  const current = FEATURE_TABS.find((t) => t.value === active) ?? FEATURE_TABS[0];

  return (
    <section className="relative w-full overflow-hidden bg-[#0a0a0a] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Complete job-seeker platform
          </p>
          <h2 className="mt-3 font-rubik text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything from draft to interview — in one workspace.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Resume builder, samples, job match, cover letters, live boards, tracker, LinkedIn, and
            mock interviews. Real HypeResume screens.
          </p>
        </div>

        <div className="mt-10 flex w-full justify-center sm:mt-12">
          <div
            role="tablist"
            aria-label="Product modules"
            className="no-visible-scrollbar flex max-w-full flex-row items-center gap-1 overflow-x-auto rounded-full bg-white/[0.04] p-1 sm:gap-1.5"
          >
            {FEATURE_TABS.map((tab) => {
              const isActive = tab.value === active;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(tab.value)}
                  className={cn(
                    'relative shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors sm:px-4',
                    isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200',
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="product-tab-pill"
                      className="absolute inset-0 rounded-full bg-zinc-800"
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                    />
                  ) : null}
                  <span className="relative z-10">{tab.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 w-full sm:mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#6b3aff] to-[#5525F5] p-3 sm:rounded-[28px] sm:p-5 lg:p-6"
            >
              <div className="mb-4 flex flex-col items-center gap-3 text-center sm:mb-5">
                <div className="max-w-xl">
                  <p className="text-base font-semibold tracking-tight text-white sm:text-xl">
                    {current.heading}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-white/75">{current.blurb}</p>
                </div>
                <Link
                  href={current.href}
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-4 text-sm font-medium text-white transition hover:bg-white/25"
                >
                  Open
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="relative w-full overflow-hidden rounded-xl bg-[#0a0a0a] shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:rounded-2xl">
                <Image
                  src={current.img}
                  alt={current.alt}
                  width={1600}
                  height={900}
                  className="h-auto w-full"
                  sizes="(max-width: 1024px) 100vw, 960px"
                  priority={current.value === 'overview'}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
