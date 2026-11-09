'use client';

import React from 'react';

export function CompanyLogoCloud() {
  const companies = [
    {
      name: 'Google',
      render: () => (
        <div className="flex items-center gap-0.5 font-bold text-xl tracking-tight">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </div>
      ),
    },
    {
      name: 'Amazon',
      render: () => (
        <div className="flex items-center font-bold text-xl tracking-tight text-white">
          <span>amazon</span>
          <span className="text-[#FF9900] text-lg font-black ml-0.5">.</span>
        </div>
      ),
    },
    {
      name: 'Microsoft',
      render: () => (
        <div className="flex items-center gap-2 font-semibold text-lg text-zinc-100">
          <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
            <span className="bg-[#F25022] rounded-[1px] w-2 h-2" />
            <span className="bg-[#7FBA00] rounded-[1px] w-2 h-2" />
            <span className="bg-[#00A4EF] rounded-[1px] w-2 h-2" />
            <span className="bg-[#FFB900] rounded-[1px] w-2 h-2" />
          </div>
          <span>Microsoft</span>
        </div>
      ),
    },
    {
      name: 'Stripe',
      render: () => (
        <div className="font-extrabold text-xl tracking-tight text-[#635BFF]">
          stripe
        </div>
      ),
    },
    {
      name: 'Meta',
      render: () => (
        <div className="font-bold text-lg tracking-tight text-[#0668E1]">
          Meta
        </div>
      ),
    },
    {
      name: 'HubSpot',
      render: () => (
        <div className="font-bold text-lg text-[#FF7A59]">
          HubSpot
        </div>
      ),
    },
    {
      name: 'Anthropic',
      render: () => (
        <div className="font-mono font-bold text-lg tracking-widest text-[#CC785C] dark:text-[#E08A6E]">
          ANTHROP\C
        </div>
      ),
    },
    {
      name: 'OpenAI',
      render: () => (
        <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight text-emerald-400">
          <span className="w-4 h-4 rounded-full border-2 border-current inline-block" />
          <span className="text-white">OpenAI</span>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-7 font-mono">
        Helping ambitious professionals land interviews at top companies such as
      </p>

      {/* Endless Moving Logos Marquee (Smooth reverse direction for balanced motion) */}
      <div className="relative w-full overflow-hidden marquee-mask py-2 select-none">
        <div className="flex animate-marquee-reverse gap-10 sm:gap-14 md:gap-16 items-center">
          {/* Repeating array 2x for seamless 50% infinite translation loop */}
          {[...companies, ...companies].map((company, idx) => (
            <div
              key={`${company.name}-${idx}`}
              className="shrink-0 flex items-center grayscale hover:grayscale-0 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-105 cursor-default"
            >
              {company.render()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
