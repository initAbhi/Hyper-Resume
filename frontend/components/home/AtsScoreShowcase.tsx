'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import CometDial from '@/components/CometDial';
import FadeContent from '@/components/FadeContent';

const DIMENSIONS = [
  { name: 'Formatting', weight: '25%', tip: 'Linear flow, standard headings, selectable text' },
  { name: 'Measurable results', weight: '25%', tip: 'Quantified impact without invented numbers' },
  { name: 'Action verbs', weight: '20%', tip: 'Strong openers; tech tokens preserved' },
  { name: 'Technical depth', weight: '15%', tip: 'Skills evidenced in bullets, not just listed' },
  { name: 'Brevity', weight: '15%', tip: 'Tight lines recruiters can skim in seconds' },
] as const;

export function AtsScoreShowcase() {
  const [score, setScore] = useState(94);

  return (
    <section className="relative w-full overflow-hidden bg-[#0a0a0a] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            ATS & writing audit
          </p>
          <h2 className="mt-3 font-rubik text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem]">
            See what parsers see — before you apply.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
            A transparent 5-dimension score plus writing rules — so you fix structure and clarity,
            not chase a vanity match percentage.
          </p>
        </div>

        <div className="mt-10 grid items-center gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-10">
          <FadeContent className="relative lg:col-span-7" threshold={0.12}>
            <div className="relative aspect-[3/3.5] overflow-hidden rounded-xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:aspect-[4/4.6]">
              <Image
                src="/marketing/hero/erik-resume.webp"
                alt="Dense ATS-friendly resume preview"
                width={2000}
                height={2583}
                className="h-full w-full object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
            </div>

            <div className="absolute left-3 top-4 z-10 max-w-[210px] rounded-xl bg-[#121214]/94 p-3 shadow-2xl ring-1 ring-white/10 backdrop-blur-md sm:left-4 sm:top-6 sm:max-w-[230px] sm:p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                What we found
              </p>
              <ul className="mt-2 space-y-1.5 text-[11px] leading-snug text-zinc-300">
                <li className="flex gap-1.5">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                  Strong technical skills
                </li>
                <li className="flex gap-1.5">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                  Quantified impact bullets
                </li>
                <li className="flex gap-1.5 text-zinc-500">
                  <span className="mt-0.5 h-3 w-3 shrink-0 text-center text-[10px]">○</span>
                  Add 1 metric in Projects
                </li>
              </ul>
            </div>

            <div className="absolute bottom-4 right-3 z-10 hidden max-w-[220px] rounded-xl bg-[#121214]/94 p-3 shadow-2xl ring-1 ring-white/10 backdrop-blur-md sm:block sm:right-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-300">
                Evidence-safe rewrite
              </p>
              <p className="mt-1.5 text-[10px] leading-snug text-zinc-500 line-through">
                Developed Spring Boot on AWS EC2.
              </p>
              <p className="mt-1 text-[11px] leading-snug text-zinc-200">
                Cut deploy overhead 40% containerizing Spring Boot on EC2 for 30+ stakeholders.
              </p>
            </div>
          </FadeContent>

          <FadeContent delay={0.08} className="lg:col-span-5" threshold={0.12}>
            <div className="rounded-2xl bg-white/[0.035] px-6 py-8 sm:px-8">
              <div className="flex justify-center">
                <CometDial
                  value={score}
                  onChange={setScore}
                  label="Overall readiness"
                />
              </div>
              <ul className="mt-8 space-y-3 border-t border-white/[0.06] pt-6">
                {DIMENSIONS.map((d) => (
                  <li key={d.name} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-white">{d.name}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{d.tip}</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium tabular-nums text-zinc-400">
                      {d.weight}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/tools/resume-checker"
                className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
              >
                Run free ATS check
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-center text-[11px] text-zinc-500">
                Upload a PDF or DOCX — no account required.
              </p>
            </div>
          </FadeContent>
        </div>
      </div>
    </section>
  );
}
