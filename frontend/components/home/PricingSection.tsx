'use client';

import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      ctaVariant: 'outline' as const,
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
      ctaVariant: 'primary' as const,
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
      ctaVariant: 'outline' as const,
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
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E6E8ED] dark:border-[#252A33] bg-white dark:bg-[#0C0D13]">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F7F8FA] dark:bg-[#1A1D23] border border-[#E6E8ED] dark:border-[#252A33] text-[#626B7A] dark:text-[#9EA7B4] text-xs font-semibold tracking-wider uppercase font-mono">
            <span>Transparent Pricing</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#171923] dark:text-[#F0F2F5] tracking-tight leading-tight">
            Honest pricing with no deceptive paywalls.
          </h2>
          
          <p className="text-sm sm:text-base text-[#626B7A] dark:text-[#9EA7B4] leading-relaxed">
            Start free. Upgrade only when you want automated AI bullet rewrites and unlimited tailored job versions. We never watermark your exported resumes or hide basic features behind paywalls.
          </p>
        </div>

        {/* 3-Tier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p) => {
            const isFeatured = p.badge !== null;
            return (
              <div
                key={p.name}
                className={`p-6 sm:p-7 rounded-2xl flex flex-col justify-between transition-all relative ${
                  isFeatured
                    ? 'bg-white dark:bg-[#14171C] border-2 border-[#3730F5] dark:border-blue-500 shadow-md ring-2 ring-[#3730F5]/10'
                    : 'bg-[#F7F8FA] dark:bg-[#14171C]/60 border border-[#E6E8ED] dark:border-[#252A33] shadow-xs'
                }`}
              >
                {/* Recommended Badge */}
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3730F5] text-white text-[10.5px] font-mono font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                    {p.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#171923] dark:text-[#F0F2F5]">
                      {p.name}
                    </h3>
                    <p className="text-xs text-[#626B7A] dark:text-[#9EA7B4] mt-1 leading-snug">
                      {p.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-baseline gap-1.5 border-t border-[#E6E8ED] dark:border-[#252A33]">
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#171923] dark:text-[#F0F2F5]">
                      {p.price}
                    </span>
                    <span className="text-xs text-[#626B7A] dark:text-[#9EA7B4] font-mono">
                      / {p.cadence}
                    </span>
                  </div>

                  <ul className="space-y-2.5 pt-3 border-t border-[#E6E8ED] dark:border-[#252A33] text-xs text-[#626B7A] dark:text-[#9EA7B4]">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#3730F5] dark:text-blue-400 shrink-0 mt-0.5" />
                        <span className="text-zinc-700 dark:text-zinc-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link href={p.ctaHref} className="block w-full">
                    <Button
                      variant={p.ctaVariant}
                      size="md"
                      className={`w-full rounded-md text-xs font-semibold h-10 ${
                        isFeatured
                          ? 'bg-[#3730F5] hover:bg-[#2820D4] text-white shadow-xs'
                          : 'hover:border-[#3730F5]'
                      }`}
                    >
                      <span>{p.ctaLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
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

