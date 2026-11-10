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
        <div className="flex items-center gap-1.5 font-bold text-xl tracking-tight text-white">
          <span>amazon</span>
          <svg className="w-5 h-3.5 text-[#FF9900]" viewBox="0 0 24 16" fill="currentColor">
            <path
              d="M2 9c6 5 14 5 20 0M18 6l4 3-4 3"
              stroke="#FF9900"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      ),
    },
    {
      name: 'Microsoft',
      render: () => (
        <div className="flex items-center gap-2.5 font-semibold text-lg text-white">
          <div className="grid grid-cols-2 gap-1 w-4 h-4">
            <span className="bg-[#F25022] rounded-[1px] w-2 h-2" />
            <span className="bg-[#7FBA00] rounded-[1px] w-2 h-2" />
            <span className="bg-[#00A4EF] rounded-[1px] w-2 h-2" />
            <span className="bg-[#FFB900] rounded-[1px] w-2 h-2" />
          </div>
          <span className="tracking-tight font-medium text-white">Microsoft</span>
        </div>
      ),
    },
    {
      name: 'Stripe',
      render: () => (
        <div className="font-extrabold text-2xl tracking-tight text-[#635BFF]">
          stripe
        </div>
      ),
    },
    {
      name: 'Meta',
      render: () => (
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-[#0081FB]">
          <svg className="w-6 h-4 text-[#0081FB]" viewBox="0 0 24 16" fill="currentColor">
            <path d="M16.5 2C14.3 2 12.8 3.5 12 4.5 11.2 3.5 9.7 2 7.5 2 3.8 2 1 5.3 1 9.5c0 4.3 3 7.5 6.8 7.5 2.6 0 4.2-1.6 5.1-2.8.9 1.2 2.5 2.8 5.1 2.8 3.8 0 6.8-3.2 6.8-7.5C24.8 5.3 21.8 2 16.5 2zm-9 12.5C4.7 14.5 3 12.3 3 9.5 3 6.7 4.7 4.5 7.5 4.5c2.1 0 3.8 1.8 4.2 4.5-.4 2.7-2.1 4.5-4.2 4.5zm9 0c-2.1 0-3.8-1.8-4.2-4.5.4-2.7 2.1-4.5 4.2-4.5 2.8 0 4.5 2.2 4.5 5 0 2.8-1.7 5-4.5 5z" />
          </svg>
          <span className="text-white font-semibold">Meta</span>
        </div>
      ),
    },
    {
      name: 'HubSpot',
      render: () => (
        <div className="flex items-center gap-1.5 font-bold text-lg text-[#FF7A59]">
          <svg className="w-5 h-5 text-[#FF7A59]" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="12" cy="4" r="2.5" />
            <circle cx="19" cy="16" r="2.5" />
            <circle cx="5" cy="16" r="2.5" />
            <line x1="12" y1="6.5" x2="12" y2="9.5" stroke="currentColor" strokeWidth="2" />
            <line x1="17.2" y1="14.8" x2="14.8" y2="13.2" stroke="currentColor" strokeWidth="2" />
            <line x1="6.8" y1="14.8" x2="9.2" y2="13.2" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="font-extrabold tracking-tight">HubSpot</span>
        </div>
      ),
    },
    {
      name: 'Anthropic',
      render: () => (
        <div className="font-mono font-bold text-lg tracking-widest text-[#D97757]">
          ANTHROP\C
        </div>
      ),
    },
    {
      name: 'OpenAI',
      render: () => (
        <div className="flex items-center gap-2 font-semibold text-lg text-white">
          <svg className="w-5 h-5 text-[#10A37F]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.28 9.87a6.22 6.22 0 0 0-.52-5.08 6.33 6.33 0 0 0-4.32-3.1 6.37 6.37 0 0 0-5.32 1.07 6.25 6.25 0 0 0-4.2-1.74A6.33 6.33 0 0 0 2.2 4.1a6.37 6.37 0 0 0-.8 5.38 6.24 6.24 0 0 0 .52 5.08 6.33 6.33 0 0 0 4.32 3.1 6.38 6.38 0 0 0 5.33-1.07 6.25 6.25 0 0 0 4.2 1.74 6.33 6.33 0 0 0 5.72-3.08 6.37 6.37 0 0 0 .8-5.38zm-8.83 9.42a4.47 4.47 0 0 1-2.92-1.07l.15-.09 4.84-2.8a.94.94 0 0 0 .47-.81v-6.84l2.17 1.25a.09.09 0 0 1 .05.08v5.82a4.5 4.5 0 0 1-4.76 4.46zm-8.52-3.71a4.46 4.46 0 0 1-.58-3.07l.15.09 4.84 2.8a.93.93 0 0 0 .94 0l5.92-3.42v2.5a.09.09 0 0 1-.04.08l-5.04 2.91a4.5 4.5 0 0 1-6.19-1.89zm-1.1-8.5a4.47 4.47 0 0 1 2.34-2l-.15.09-4.84 2.8a.94.94 0 0 0-.47.81v6.84l-2.17-1.25a.09.09 0 0 1-.05-.08V8.16a4.5 4.5 0 0 1 5.34-4.08zm14.12 4.41L12 8.07l5.92-3.42a.09.09 0 0 1 .09 0l5.04 2.91a4.5 4.5 0 0 1-1.74 8.28v-5.82a.93.93 0 0 0-.47-.81l-4.9-2.83zm2.5-3.02l-.15-.09-4.84-2.8a.93.93 0 0 0-.94 0L8.68 9.58V7.08a.09.09 0 0 1 .04-.08l5.04-2.91a4.5 4.5 0 0 1 6.69 3.99v.49zm-8.45 4.93l-2.73-1.58 2.73-1.58 2.73 1.58-2.73 1.58z" />
          </svg>
          <span className="font-semibold tracking-tight text-white">OpenAI</span>
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
              className="shrink-0 flex items-center transition-all duration-300 hover:scale-105 cursor-default"
            >
              {company.render()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
