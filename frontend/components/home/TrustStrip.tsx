'use client';

import React from 'react';
import { Check } from 'lucide-react';

const CLAIMS = [
  'ATS builder + free PDF/DOCX',
  'Job match & live boards',
  'Cover letters · LinkedIn · interviews',
  '82 company benchmarks',
  'Application tracker included',
] as const;

/**
 * Verifiable trust strip — only claims backed by the shipped product.
 */
export function TrustStrip() {
  return (
    <section
      aria-label="Product guarantees"
      className="relative w-full border-y border-white/[0.06] bg-[#0a0a0a] px-4 py-4 sm:px-6 sm:py-5 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <ul className="flex gap-3 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-5 sm:gap-y-3 sm:overflow-visible sm:pb-0 lg:justify-between">
          {CLAIMS.map((claim) => (
            <li
              key={claim}
              className="flex shrink-0 items-center gap-2 text-[12px] text-zinc-400 sm:text-[13px]"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-300">
                <Check className="h-3 w-3" strokeWidth={2.5} />
              </span>
              <span className="whitespace-nowrap">{claim}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
