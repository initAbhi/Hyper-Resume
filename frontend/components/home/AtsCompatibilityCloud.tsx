'use client';

import React from 'react';

export function AtsCompatibilityCloud() {
  const atsEngines = [
    {
      name: 'Ashby',
      color: '#6366F1',
      render: () => (
        <span className="font-extrabold text-base tracking-tight text-[#4F46E5] dark:text-[#818CF8]">
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
      color: '#005CB9',
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
      color: '#0052CC',
      render: () => (
        <span className="font-black text-base tracking-widest text-[#0052CC] dark:text-[#60A5FA]">
          LEVER
        </span>
      ),
    },
    {
      name: 'JazzHR',
      color: '#7B2CBF',
      render: () => (
        <span className="font-extrabold text-base tracking-tight text-[#7B2CBF] dark:text-[#C084FC]">
          Jazz<span className="font-black">HR</span>
        </span>
      ),
    },
    {
      name: 'paycom',
      color: '#00875A',
      render: () => (
        <div className="flex items-center gap-1 font-bold text-sm text-[#00875A] dark:text-[#34D399]">
          <span className="w-3 h-3 rounded bg-[#00875A] inline-block" />
          <span>paycom</span>
        </div>
      ),
    },
    {
      name: 'JOBVITE',
      color: '#0070BA',
      render: () => (
        <span className="font-black text-sm tracking-wider text-[#0070BA] dark:text-[#38BDF8]">
          JOBVITE
        </span>
      ),
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] text-zinc-300 text-xs font-semibold mb-3 border border-white/[0.08] font-mono uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-[#5525F5] animate-pulse" />
        <span>Standard Single-Column Layouts</span>
      </div>

      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
        Engineered for standard parsing conventions
      </h3>
      <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl mx-auto leading-relaxed">
        Single-column document flow and clean text layers help ensure your qualifications extract accurately in systems like Workday, Greenhouse, Ashby, and Lever.
      </p>

      {/* Endless Moving ATS Cards Conveyor */}
      <div className="mt-8 relative w-full overflow-hidden marquee-mask py-3 select-none">
        <div className="flex animate-marquee gap-4 items-center">
          {/* Repeating array 2x for seamless 50% infinite translation loop */}
          {[...atsEngines, ...atsEngines].map((engine, idx) => (
            <div
              key={`${engine.name}-${idx}`}
              className="flex items-center justify-center px-6 py-3.5 rounded-xl bg-[#121422]/70 backdrop-blur-md border border-white/[0.08] shadow-lg hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(85,37,245,0.25)] hover:-translate-y-1 transition-all duration-300 shrink-0 min-w-[145px] cursor-default"
            >
              {engine.render()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
