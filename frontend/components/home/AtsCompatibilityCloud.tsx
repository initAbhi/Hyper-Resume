'use client';

import React from 'react';

export function AtsCompatibilityCloud() {
  const atsEngines = [
    {
      name: 'Ashby',
      color: '#818CF8',
      render: () => (
        <span className="font-extrabold text-base tracking-tight text-[#818CF8]">
          Ashby
        </span>
      ),
    },
    {
      name: 'greenhouse',
      color: '#00B37E',
      render: () => (
        <span className="font-bold text-base tracking-tight text-[#00B37E] lowercase">
          greenhouse
        </span>
      ),
    },
    {
      name: 'workday.',
      color: '#38BDF8',
      render: () => (
        <div className="flex items-center">
          <span className="font-black text-base tracking-tighter text-[#38BDF8]">
            workday
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E57200] ml-0.5 inline-block" />
        </div>
      ),
    },
    {
      name: 'bambooHR',
      color: '#65B32E',
      render: () => (
        <div className="flex items-center gap-1 font-bold text-base tracking-tight text-[#65B32E]">
          <span>bamboo</span>
          <span className="text-white font-extrabold">HR</span>
        </div>
      ),
    },
    {
      name: 'LEVER',
      color: '#60A5FA',
      render: () => (
        <span className="font-black text-base tracking-widest text-[#60A5FA]">
          LEVER
        </span>
      ),
    },
    {
      name: 'JazzHR',
      color: '#C084FC',
      render: () => (
        <span className="font-extrabold text-base tracking-tight text-[#C084FC]">
          Jazz<span className="font-black">HR</span>
        </span>
      ),
    },
    {
      name: 'paycom',
      color: '#34D399',
      render: () => (
        <div className="flex items-center gap-1 font-bold text-sm text-[#34D399]">
          <span className="w-3 h-3 rounded bg-[#34D399] inline-block" />
          <span>paycom</span>
        </div>
      ),
    },
    {
      name: 'JOBVITE',
      color: '#38BDF8',
      render: () => (
        <span className="font-black text-sm tracking-wider text-[#38BDF8]">
          JOBVITE
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 text-center sm:px-6 sm:py-14 lg:px-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
        Built for real ATS parsers
      </p>
      <h3 className="mt-3 font-rubik text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Structured for systems that actually read resumes
      </h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
        Linear flow, standard section names, and selectable UTF-8 text — the conventions Workday,
        Greenhouse, Ashby, Lever, and peers expect.
      </p>

      <div className="relative mt-8 w-full select-none overflow-hidden marquee-mask py-2">
        <div className="flex animate-marquee items-center gap-3">
          {[...atsEngines, ...atsEngines].map((engine, idx) => (
            <div
              key={`${engine.name}-${idx}`}
              className="flex min-w-[140px] shrink-0 cursor-default items-center justify-center rounded-xl bg-white/[0.04] px-6 py-3.5"
            >
              {engine.render()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
