'use client';

import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { SpotlightCard } from '@/components/reactbits/SpotlightCard';
import { StarBorder } from '@/components/reactbits/StarBorder';

export function PricingSection() {
  const plans = [
    {
      name: 'Free Starter',
      price: '₹0',
      cadence: 'forever',
      description: 'Ideal for initial master resume creation, ATS formatting, and direct vector PDF export.',
      badge: null,
      ctaLabel: 'Get Started Free',
      ctaHref: '/login',
      isFeatured: false,
      features: [
        'Master profile resume editor',
        'Standard single-column ATS templates',
        'Live ATS document structure audit',
        'Unlimited unwatermarked PDF exports',
        'Private encrypted storage',
      ],
    },
    {
      name: 'Job Hunt Pack',
      price: '₹299',
      cadence: 'one-time',
      description: 'Pay once for your active application cycle. No recurring subscription trap.',
      badge: 'Recommended',
      ctaLabel: 'Get Job Hunt Pack',
      ctaHref: '/login',
      isFeatured: true,
      features: [
        '50 AI optimization credits',
        'Evidence-grounded STAR bullet rewrites',
        'Unlimited tailored resume versions',
        'Job description match & gap analysis',
        'Application pipeline tracking sync',
      ],
    },
    {
      name: 'Pro Monthly',
      price: '₹699',
      cadence: 'per month',
      description: 'For ongoing career transitions, executive applications, and continuous interview prep.',
      badge: null,
      ctaLabel: 'Subscribe Monthly',
      ctaHref: '/login',
      isFeatured: false,
      features: [
        '150 AI credits refreshed monthly',
        'Priority AI model processing',
        'Advanced interview question simulator',
        'Target keyword density analysis',
        'Full version rollback history',
      ],
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#090A10] text-white relative overflow-hidden">
      
      {/* Soft Center Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#5525F5]/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5525F5] animate-pulse" />
            <span>Transparent Pricing</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
            Honest pricing with no deceptive paywalls.
          </h2>
          
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Start free. Upgrade only when you want automated AI bullet rewrites and unlimited tailored job versions. We never watermark your exported resumes or hide basic features behind paywalls.
          </p>
        </div>

        {/* 3-Tier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p) => {
            if (p.isFeatured) {
              return (
                <div
                  key={p.name}
                  className="p-6 sm:p-7 rounded-2xl flex flex-col justify-between transition-all duration-300 relative bg-gradient-to-b from-[#1C1838] to-[#0F111D] shadow-2xl hover:-translate-y-1.5"
                  style={{
                    boxShadow: '0 0 50px -15px rgba(217,70,239,0.3), inset 0 1px 0 rgba(255,255,255,0.15)'
                  }}
                >
                  {/* Recommended Badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D946EF] to-[#5525F5] text-white text-[10.5px] font-mono font-bold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-lg shadow-fuchsia-500/30">
                    {p.badge}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {p.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-snug">
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-2 flex items-baseline gap-1.5 border-t border-white/[0.08]">
                      <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                        {p.price}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        / {p.cadence}
                      </span>
                    </div>

                    <ul className="space-y-2.5 pt-3 border-t border-white/[0.08] text-xs">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-zinc-200">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8">
                    <Link href={p.ctaHref} className="block w-full">
                      <StarBorder className="w-full" speed="3.5s" glowColor="#D946EF">
                        <span className="flex items-center gap-1.5">
                          <span>{p.ctaLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </StarBorder>
                    </Link>
                  </div>
                </div>
              );
            }

            return (
              <SpotlightCard
                key={p.name}
                className="p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-lg hover:-translate-y-1"
                spotlightColor="rgba(139, 92, 246, 0.16)"
                borderGlowColor="rgba(168, 85, 247, 0.45)"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {p.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-snug">
                      {p.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-baseline gap-1.5 border-t border-white/[0.06]">
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                      {p.price}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      / {p.cadence}
                    </span>
                  </div>

                  <ul className="space-y-2.5 pt-3 border-t border-white/[0.06] text-xs">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-zinc-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link href={p.ctaHref} className="block w-full">
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center rounded-xl text-xs font-semibold h-11 px-4 cursor-pointer transition-all duration-200 bg-white/[0.05] hover:bg-white/[0.1] text-white shadow-sm"
                    >
                      <span>{p.ctaLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </button>
                  </Link>
                </div>
              </SpotlightCard>
            );
          })}
        </div>

      </div>
    </section>
  );
}
