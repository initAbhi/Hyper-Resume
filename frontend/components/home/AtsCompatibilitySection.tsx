'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import AnimatedContent from '@/components/AnimatedContent';
import FadeContent from '@/components/FadeContent';

const PRINCIPLES = [
  {
    id: 'flow',
    label: 'Reading order',
    title: 'Linear document flow',
    desc: 'ATS systems read top to bottom. Floating boxes scramble titles and dates. Our single-column presets keep the stream deterministic.',
    points: ['Ordered DOM / text stream', 'Dates stay with the right role', 'Workday, Greenhouse, Lever ready'],
  },
  {
    id: 'headings',
    label: 'Section landmarks',
    title: 'Standard section tokens',
    desc: 'Creative headings get ignored. We use Experience, Education, Skills, and Projects — tokens parsers already understand.',
    points: ['Recognized taxonomy', 'No discarded history blocks', 'Ashby · Taleo · Lever'],
  },
  {
    id: 'text',
    label: 'Selectable text',
    title: 'Clean UTF-8 vector PDFs',
    desc: 'Graphic builders flatten text into images. Every HypeResume PDF keeps real selectable text recruiters can extract.',
    points: ['100% selectable layer', 'Standard fonts & encoding', 'Free unwatermarked export'],
  },
] as const;

export function AtsCompatibilitySection() {
  const [active, setActive] = useState<(typeof PRINCIPLES)[number]['id']>('flow');
  const current = PRINCIPLES.find((p) => p.id === active) ?? PRINCIPLES[0];

  return (
    <section className="relative w-full bg-[#0a0a0a] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AnimatedContent distance={36} duration={0.75} className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            ATS architecture
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            Designed for people.
            <span className="block text-zinc-500">Structured for parsers.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Clean hierarchy, conventional sections, and readable vector text — so hiring systems and
            humans both see what you meant.
          </p>
        </AnimatedContent>

        <div className="mt-10 grid gap-3 lg:mt-14 lg:grid-cols-12 lg:gap-5">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:col-span-4 lg:flex-col lg:overflow-visible lg:pb-0">
            {PRINCIPLES.map((p) => {
              const on = p.id === active;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActive(p.id)}
                  className={`min-w-[140px] shrink-0 rounded-2xl px-4 py-3.5 text-left transition lg:min-w-0 ${
                    on
                      ? 'bg-white/[0.07] text-white'
                      : 'bg-transparent text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300'
                  }`}
                >
                  <span className="block text-[11px] uppercase tracking-wider text-zinc-500">
                    {p.label}
                  </span>
                  <span className="mt-1 block text-sm font-medium">{p.title}</span>
                </button>
              );
            })}
          </div>

          <FadeContent key={current.id} className="lg:col-span-8" duration={0.5}>
            <div className="rounded-2xl bg-white/[0.035] p-6 sm:p-8">
              <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {current.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
                {current.desc}
              </p>
              <ul className="mt-6 space-y-3">
                {current.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-zinc-300">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                      <Check className="h-3 w-3 text-zinc-200" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </FadeContent>
        </div>
      </div>
    </section>
  );
}
