'use client';

import React from 'react';

export function AtsCompatibilityCloud() {
  const atsEngines = [
    {
      name: 'Ashby',
      color: '#6366F1',
      render: () => (
        <span className="font-extrabold text-lg tracking-tight text-[#4F46E5] dark:text-[#818CF8]">
          Ashby
        </span>
      ),
    },
    {
      name: 'greenhouse',
      color: '#00B37E',
      render: () => (
        <span className="font-bold text-lg tracking-tight text-[#00B37E] lowercase">
          greenhouse
        </span>
      ),
    },
    {
      name: 'workday.',
      color: '#005CB9',
      render: () => (
        <div className="flex items-center">
          <span className="font-black text-lg tracking-tighter text-[#005CB9] dark:text-[#38BDF8]">
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
        <div className="flex items-center gap-1 font-bold text-lg tracking-tight text-[#65B32E]">
          <span>bamboo</span>
          <span className="text-zinc-800 dark:text-zinc-200 font-extrabold">HR</span>
          <span className="text-[10px] text-[#65B32E] -mt-2">™</span>
        </div>
      ),
    },
    {
      name: 'LEVER',
      color: '#0052CC',
      render: () => (
        <span className="font-black text-lg tracking-widest text-[#0052CC] dark:text-[#60A5FA]">
          LEVER
        </span>
      ),
    },
    {
      name: 'JazzHR',
      color: '#7B2CBF',
      render: () => (
        <span className="font-extrabold text-lg tracking-tight text-[#7B2CBF] dark:text-[#C084FC]">
          Jazz<span className="font-black">HR</span>
        </span>
      ),
    },
    {
      name: 'paycom',
      color: '#00875A',
      render: () => (
        <div className="flex items-center gap-1 font-bold text-base text-[#00875A] dark:text-[#34D399]">
          <span className="w-3.5 h-3.5 rounded bg-[#00875A] inline-block" />
          <span>paycom</span>
        </div>
      ),
    },
    {
      name: 'JOBVITE',
      color: '#0070BA',
      render: () => (
        <span className="font-black text-base tracking-wider text-[#0070BA] dark:text-[#38BDF8]">
          JOBVITE
        </span>
      ),
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
      {/* Pill header */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4 border border-emerald-200/60 dark:border-emerald-800/60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>100% Parser Audit Guarantee</span>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
        Engineered for every major Applicant Tracking System
      </h3>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xl mx-auto">
        Never get lost in the ATS black hole. Our layouts are certified for zero parsing errors across top hiring platforms.
      </p>

      {/* Logos Strip */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 sm:gap-8 items-center justify-center">
        {atsEngines.map((engine) => (
          <div
            key={engine.name}
            className="flex items-center justify-center p-3 sm:p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            {engine.render()}
          </div>
        ))}
      </div>
    </div>
  );
}
