'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Ban, CircleCheck } from 'lucide-react';
import FadeContent from '@/components/FadeContent';

const ROWS = [
  {
    pain: 'Generic AI invents “40% latency wins” you can’t defend',
    fix: 'Metric sanitizer flags unverified claims for confirmation',
  },
  {
    pain: 'Builders hold PDF hostage behind auto-renewing trials',
    fix: 'Unlimited free unwatermarked PDF & DOCX on Starter',
  },
  {
    pain: 'Opaque “match %” that encourages keyword stuffing',
    fix: 'Evidence-cited JD fit: supported vs needs confirmation',
  },
  {
    pain: 'Resume tools that stop at the download button',
    fix: 'Match → live boards → cover letter → tracker → mock interview',
  },
] as const;

/**
 * Objection-handling differentiators — borderless, tonal rows.
 */
export function DifferentiatorSection() {
  return (
    <section className="relative w-full bg-[#0a0a0a] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Why HypeResume
          </p>
          <h2 className="mt-3 font-rubik text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for candidates tired of hype and paywalls.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
            We compete on honesty: truthful AI, free exports, and a full apply loop — not
            fabricated social proof.
          </p>
        </div>

        <div className="mt-10 space-y-2">
          <div className="hidden grid-cols-2 gap-8 px-5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 sm:grid sm:px-6">
            <span>The usual trap</span>
            <span>What we ship instead</span>
          </div>
          {ROWS.map((row, i) => (
            <FadeContent key={row.pain} delay={i * 0.04} threshold={0.1}>
              <div className="grid gap-4 rounded-2xl bg-white/[0.035] px-5 py-5 sm:grid-cols-2 sm:gap-8 sm:px-6">
                <div className="flex gap-3">
                  <Ban className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600 sm:hidden">
                      The usual trap
                    </p>
                    <p className="text-sm leading-relaxed text-zinc-400">{row.pain}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-violet-400/80 sm:hidden">
                      What we ship
                    </p>
                    <p className="text-sm leading-relaxed text-zinc-200">{row.fix}</p>
                  </div>
                </div>
              </div>
            </FadeContent>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/register"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
          >
            Start free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            See transparent pricing →
          </Link>
        </div>
      </div>
    </section>
  );
}
