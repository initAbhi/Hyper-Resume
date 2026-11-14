'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AnimatedContent from '@/components/AnimatedContent';
import GradientText from '@/components/GradientText';

const FAQS = [
  {
    q: 'How does HypeResume stay ATS-compatible?',
    a: 'Templates follow parsing conventions: linear reading order, standard section names, clean UTF-8 text, and normal date formats. We avoid floating boxes and graphics that scramble extraction in Workday, Greenhouse, Ashby, and Lever.',
  },
  {
    q: 'Does the AI invent achievements?',
    a: 'No. Suggestions restructure and clarify what you provide. Unverified metrics are flagged for confirmation. We never fabricate employers, degrees, skills, or numbers.',
  },
  {
    q: 'Is PDF and DOCX export really free?',
    a: 'Yes. Unwatermarked, selectable-text PDF and native DOCX export are free on the Starter plan across all 10 templates. No .txt trap.',
  },
  {
    q: 'How is pricing different from Zety or Resume.io?',
    a: 'HypeResume Pro is a transparent one-time pass (from ₹149 / $3 for a week, or Founding Lifetime at ₹999 / $19) — not an auto-renewing 4-week trial that locks your PDF.',
  },
  {
    q: 'Can I keep multiple versions for different roles?',
    a: 'Yes. Branch from a master profile into job-specific versions with their own history, match analysis, share links, and exports.',
  },
  {
    q: 'Is my data private?',
    a: 'Resumes stay in private storage. We don’t sell personal data or use your documents to train public foundation models.',
  },
] as const;

export function FaqAndFinalCta() {
  const [open, setOpen] = useState(0);

  return (
    <>
      <section className="w-full bg-[#0a0a0a] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12 lg:gap-16">
          <AnimatedContent distance={30} duration={0.7} className="lg:col-span-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              Questions
            </p>
            <h2 className="mt-3 font-rubik text-3xl font-semibold tracking-tight sm:text-4xl">
              Straight answers.
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              No fake urgency. No invented user counts. Just how the product works.
            </p>
          </AnimatedContent>

          <div className="divide-y divide-white/[0.06] lg:col-span-8">
            {FAQS.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div key={faq.q} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-start justify-between gap-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[15px] font-medium text-white sm:text-base">{faq.q}</span>
                    <span className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-[#a78bfa]">
                      {isOpen ? 'Close' : 'Open'}
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pt-3 text-sm leading-relaxed text-zinc-400">{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative w-full overflow-hidden bg-[#0a0a0a] px-4 py-20 text-center text-white sm:px-6 sm:py-28 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(85,37,245,0.18), transparent 70%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="font-rubik text-3xl font-semibold tracking-tight sm:text-5xl">
            Make your next{' '}
            <GradientText
              colors={['#ffffff', '#C4B5FD', '#5525F5', '#ffffff']}
              animationSpeed={6}
              className="inline"
            >
              application
            </GradientText>{' '}
            count.
          </h2>
          <p className="mt-4 text-sm text-zinc-400 sm:text-base">
            Start with your real experience. Match it to the job. Export free — no card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="w-full sm:w-auto">
              <span className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100 sm:w-auto">
                Build my resume
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/tools/resume-checker" className="w-full sm:w-auto">
              <span className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-semibold text-white transition hover:bg-white/[0.08] sm:w-auto">
                Free ATS check
              </span>
            </Link>
          </div>
          <p className="mt-5 text-xs text-zinc-500">
            5 AI credits on signup · Free PDF &amp; DOCX · One-time Pro from ₹149 / $3
          </p>
        </div>
      </section>
    </>
  );
}
