'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AnimatedContent from '@/components/AnimatedContent';
import FadeContent from '@/components/FadeContent';

const STEPS = [
  {
    n: '01',
    title: 'Build your master resume',
    body: 'Start blank, upload, or clone a benchmark. Structured sections stay ATS-safe while you edit.',
  },
  {
    n: '02',
    title: 'Match the job honestly',
    body: 'Paste a JD. We map requirements to evidence — and flag gaps instead of inventing skills.',
  },
  {
    n: '03',
    title: 'Rewrite with proof',
    body: 'Accept STAR-style upgrades grounded in your real metrics. Reject anything that isn’t true.',
  },
  {
    n: '04',
    title: 'Export & track',
    body: 'Download clean PDF/DOCX, share a recruiter link, and move applications through one pipeline.',
  },
] as const;

const BEFORE =
  'Responsible for checkout experiments and analyzing funnel drop-offs with product and engineering.';
const AFTER =
  'Led 22 checkout pricing experiments that increased quarterly ARR by $180K and reduced drop-off by 14%.';

export function ProductWorkflowStorytelling() {
  const [showAfter, setShowAfter] = useState(true);

  return (
    <section className="relative w-full bg-[#0a0a0a] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <AnimatedContent distance={36} duration={0.75} className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              How it works
            </p>
            <h2 className="mt-3 font-rubik text-3xl font-semibold tracking-tight sm:text-4xl">
              Four steps from facts to a job-ready application.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Build once, match honestly, rewrite with proof, then export and track — without the
              dark-pattern download wall.
            </p>
          </AnimatedContent>
          <Link
            href="/register"
            className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-white/[0.06] px-5 text-sm font-medium text-white transition hover:bg-white/[0.1] sm:self-auto"
          >
            Start free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-12">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:col-span-7">
            {STEPS.map((step, i) => (
              <FadeContent key={step.n} delay={i * 0.05} threshold={0.15}>
                <article className="h-full rounded-2xl bg-white/[0.035] p-5 sm:p-6">
                  <span className="font-mono text-xs text-zinc-600">{step.n}</span>
                  <h3 className="mt-2 text-base font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.body}</p>
                </article>
              </FadeContent>
            ))}
          </div>

          <FadeContent threshold={0.2} className="lg:col-span-5">
            <aside className="flex h-full flex-col rounded-2xl bg-white/[0.035] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold">Bullet rewrite</h3>
                <div className="flex rounded-full bg-black/40 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowAfter(false)}
                    className={`rounded-full px-3 py-1.5 transition ${
                      !showAfter ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Before
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAfter(true)}
                    className={`rounded-full px-3 py-1.5 transition ${
                      showAfter ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    After
                  </button>
                </div>
              </div>
              <p className="mt-5 flex-1 text-[15px] leading-relaxed text-zinc-300">
                {showAfter ? AFTER : BEFORE}
              </p>
              <div className="mt-6 border-t border-white/[0.05] pt-4 text-xs text-zinc-500">
                {showAfter
                  ? 'Metrics come from your input — never invented by the model.'
                  : 'Vague ownership language. Weak for ATS and recruiters.'}
              </div>
            </aside>
          </FadeContent>
        </div>
      </div>
    </section>
  );
}
