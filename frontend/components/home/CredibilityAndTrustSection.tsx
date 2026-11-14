'use client';

import React from 'react';
import { ShieldCheck, Search, FileText, Lock } from 'lucide-react';
import FadeContent from '@/components/FadeContent';

const PILLARS = [
  {
    icon: ShieldCheck,
    label: 'Integrity',
    title: 'Evidence-grounded suggestions',
    desc: 'We structure facts, dates, and metrics you provide. No fake employers, degrees, or invented numbers.',
  },
  {
    icon: Search,
    label: 'Matching',
    title: 'Honest job matching',
    desc: 'Requirements map to documented experience. Gaps stay visible — we don’t keyword-stuff your resume.',
  },
  {
    icon: FileText,
    label: 'Export',
    title: 'Parser-friendly exports',
    desc: 'Single-column defaults, standard headings, selectable UTF-8 PDFs that ATS systems can actually read.',
  },
  {
    icon: Lock,
    label: 'Privacy',
    title: 'Private by default',
    desc: 'Your resumes stay in private storage. We don’t sell your data or train public models on your documents.',
  },
] as const;

/** Clean 2×2 principles — no MagicBento SaaS demos / charts. */
export function CredibilityAndTrustSection() {
  return (
    <section className="relative w-full bg-[#0a0a0a] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Principles
          </p>
          <h2 className="mt-3 font-rubik text-3xl font-semibold tracking-tight sm:text-4xl">
            Built on evidence, not exaggeration.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Career tools should strengthen what you actually did — not invent a better version of you.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <FadeContent key={p.title} delay={i * 0.05} threshold={0.12}>
                <article className="h-full rounded-2xl bg-white/[0.035] p-6 sm:p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500">{p.label}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.desc}</p>
                </article>
              </FadeContent>
            );
          })}
        </div>
      </div>
    </section>
  );
}
