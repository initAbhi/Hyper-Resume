'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  FileText,
  Layers,
  MessagesSquare,
  Radar,
  Share2,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react';
import FadeContent from '@/components/FadeContent';

const PILLARS = [
  {
    icon: FileText,
    title: 'ATS Resume Builder',
    body: '10 parser-safe templates, structured editing, writing fixes, and free PDF & DOCX — no watermarks.',
    href: '/register?redirect=/app/resumes',
  },
  {
    icon: Layers,
    title: '82 company samples',
    body: 'Benchmark resumes across engineering, product, and more. Adapt one to your verified profile.',
    href: '/examples',
  },
  {
    icon: Target,
    title: 'Job matching',
    body: 'Evidence-cited fit against any JD — supported vs needs confirmation, never keyword stuffing.',
    href: '/tools/job-match',
  },
  {
    icon: Sparkles,
    title: 'Cover letter studio',
    body: 'Tone-controlled letters grounded in achievements you already documented.',
    href: '/register?redirect=/app/cover-letters',
  },
  {
    icon: Radar,
    title: 'Live job search',
    body: 'Query Ashby, Greenhouse, and Lever boards, score overlap, bookmark into Applications.',
    href: '/register?redirect=/app/job-search',
  },
  {
    icon: UserRound,
    title: 'LinkedIn studio',
    body: 'Import a LinkedIn PDF, score the above-the-fold story, draft tighter headlines and About.',
    href: '/register?redirect=/app/linkedin',
  },
  {
    icon: MessagesSquare,
    title: 'Mock interviews',
    body: 'Resume + JD grounded practice with STAR and technical feedback before the real screen.',
    href: '/register?redirect=/app/interview',
  },
  {
    icon: Share2,
    title: 'Share & track',
    body: 'Kanban applications and send trackable /r/ recruiter links with view analytics.',
    href: '/register?redirect=/app/applications',
  },
] as const;

/**
 * Full job-seeker platform — uses full-width landscape product shots only.
 */
export function CareerLoopSection() {
  return (
    <section className="relative w-full bg-[#0a0a0a] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            One platform
          </p>
          <h2 className="mt-3 font-rubik text-3xl font-semibold tracking-tight sm:text-4xl">
            Stop stitching five tools together for one job search.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
            HypeResume covers the full loop — build, match, discover, write, track, share, and
            practice — so you are not bouncing between a builder, a tracker, and ChatGPT.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <FadeContent threshold={0.1}>
            <figure className="overflow-hidden rounded-2xl bg-white/[0.035] p-2 sm:p-3">
              <div className="overflow-hidden rounded-xl">
                <Image
                  src="/marketing/product/job-search-v2.png"
                  alt="Live job board discovery in HypeResume"
                  width={1600}
                  height={900}
                  className="h-auto w-full"
                  sizes="(max-width: 1024px) 100vw, 560px"
                />
              </div>
              <figcaption className="px-2 py-3 text-sm text-zinc-400">
                <span className="font-medium text-white">Live job search</span>
                {' — '}
                Ashby, Greenhouse, Lever feeds with resume-fit scoring.
              </figcaption>
            </figure>
          </FadeContent>
          <FadeContent delay={0.06} threshold={0.1}>
            <figure className="overflow-hidden rounded-2xl bg-white/[0.035] p-2 sm:p-3">
              <div className="overflow-hidden rounded-xl">
                <Image
                  src="/marketing/product/interview-v2.png"
                  alt="Role-specific interview practice in HypeResume"
                  width={1600}
                  height={900}
                  className="h-auto w-full"
                  sizes="(max-width: 1024px) 100vw, 560px"
                />
              </div>
              <figcaption className="px-2 py-3 text-sm text-zinc-400">
                <span className="font-medium text-white">Interview studio</span>
                {' — '}
                Resume + JD grounded practice with STAR and technical feedback.
              </figcaption>
            </figure>
          </FadeContent>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <FadeContent key={mod.title} delay={(i % 4) * 0.04} threshold={0.08}>
                <Link
                  href={mod.href}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:from-white/[0.1] hover:to-violet-500/[0.06]"
                >
                  <span
                    className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-violet-500/10 blur-2xl transition group-hover:bg-violet-400/20"
                    aria-hidden
                  />
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20 text-violet-200">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="relative mt-3 text-sm font-semibold text-white">{mod.title}</h3>
                  <p className="relative mt-1.5 flex-1 text-xs leading-relaxed text-zinc-500">{mod.body}</p>
                  <span className="relative mt-3 inline-flex items-center gap-1 text-xs font-medium text-violet-300/80 transition group-hover:text-violet-200">
                    Explore
                    <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </FadeContent>
            );
          })}
        </div>
      </div>
    </section>
  );
}
