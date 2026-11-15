'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AnimatedContent from '@/components/AnimatedContent';
import FadeContent from '@/components/FadeContent';

export function ApplicationPipelineWorkspace() {
  return (
    <section className="w-full bg-[#0a0a0a] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <AnimatedContent distance={36} duration={0.75}>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              Application tracker
            </p>
            <h2 className="mt-3 font-rubik text-3xl font-semibold tracking-tight sm:text-4xl">
              Know which resume version went where.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
              Track every application in one pipeline — link the tailored resume, notes, and next
              interview so your search stays organized.
            </p>
          </AnimatedContent>
          <Link
            href="/register?redirect=/app/applications"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-white/[0.06] px-5 text-sm font-medium text-white transition hover:bg-white/[0.1]"
          >
            Open tracker
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <FadeContent className="mt-10" threshold={0.1}>
          <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-[#6b3aff]/80 to-[#5525F5] p-2 sm:p-3 lg:p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marketing/product/applications-v2.png"
              alt="HypeResume job application pipeline tracker"
              className="h-auto w-full rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              width={1600}
              height={900}
            />
          </div>
        </FadeContent>
      </div>
    </section>
  );
}
