'use client';

import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

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
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#090A10] text-white relative overflow-hidden">
      
      {/* Soft Center Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#5525F5]/12 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-inner">
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
            return (
              <div
                key={p.name}
                className={`p-6 sm:p-7 rounded-2xl flex flex-col justify-between transition-all duration-300 relative ${
                  p.isFeatured
                    ? 'bg-gradient-to-b from-[#1C1A38] to-[#121422] backdrop-blur-xl border-2 border-[#5525F5] glow-violet-deep shadow-2xl hover:-translate-y-1.5'
                    : 'bg-[#121422]/65 backdrop-blur-md border border-white/[0.08] shadow-lg hover:border-violet-500/40 hover:shadow-[0_0_30px_rgba(85,37,245,0.2)] hover:-translate-y-1'
                }`}
              >
                {/* Recommended Badge */}
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#5525F5] text-white text-[10.5px] font-mono font-bold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-lg shadow-violet-500/40 border border-violet-400/40">
                    {p.badge}
                  </div>
                )}

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
                        <span className="text-zinc-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link href={p.ctaHref} className="block w-full">
                    <button
                      type="button"
                      className={`w-full inline-flex items-center justify-center rounded-lg text-xs font-semibold h-11 px-4 cursor-pointer transition-all duration-200 ${
                        p.isFeatured
                          ? 'bg-[#5525F5] hover:bg-[#4318D8] text-white shadow-lg shadow-violet-500/25 border border-violet-400/30'
                          : 'border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-white hover:border-violet-400/60 shadow-sm backdrop-blur-md'
                      }`}
                    >
                      <span>{p.ctaLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
