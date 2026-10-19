'use client';

import React from 'react';

export function CompanyLogoCloud() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
      <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-8">
        Helping ambitious professionals land interviews at top companies such as
      </p>

      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 transition-all duration-200">
        
        {/* Google */}
        <div className="flex items-center gap-0.5 font-bold text-xl tracking-tight">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </div>

        {/* Amazon */}
        <div className="flex items-center font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-100">
          <span>amazon</span>
          <span className="text-[#FF9900] text-lg font-black ml-0.5">.</span>
        </div>

        {/* Microsoft */}
        <div className="flex items-center gap-2 font-semibold text-lg text-zinc-800 dark:text-zinc-200">
          <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
            <span className="bg-[#F25022] rounded-[1px] w-2 h-2" />
            <span className="bg-[#7FBA00] rounded-[1px] w-2 h-2" />
            <span className="bg-[#00A4EF] rounded-[1px] w-2 h-2" />
            <span className="bg-[#FFB900] rounded-[1px] w-2 h-2" />
          </div>
          <span>Microsoft</span>
        </div>

        {/* Stripe */}
        <div className="font-extrabold text-xl tracking-tight text-[#635BFF]">
          stripe
        </div>

        {/* Meta */}
        <div className="font-bold text-lg tracking-tight text-[#0668E1]">
          Meta
        </div>

        {/* HubSpot */}
        <div className="font-bold text-lg text-[#FF7A59]">
          HubSpot
        </div>

        {/* Anthropic */}
        <div className="font-mono font-bold text-lg tracking-widest text-[#CC785C] dark:text-[#E08A6E]">
          ANTHROP\C
        </div>

        {/* OpenAI */}
        <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight text-emerald-600 dark:text-emerald-400">
          <span className="w-4 h-4 rounded-full border-2 border-current inline-block" />
          <span className="text-zinc-900 dark:text-zinc-100">OpenAI</span>
        </div>

      </div>
    </div>
  );
}
