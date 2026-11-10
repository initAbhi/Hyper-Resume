'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { ShaderCard } from '@/components/reactbits';

export function PricingSection() {
  const plans = [
    {
      name: 'Free Starter',
      price: '₹0',
      cadence: 'forever',
      description: 'Initial master resume creation, ATS formatting, and direct vector PDF export.',
      badge: null,
      ctaLabel: 'Get Started Free',
      ctaHref: '/login',
      isFeatured: false,
      flameColor: '#5227FF',
      highlightColor: '#B48BFA',
      positionY: -0.09,
      scale: 4.2,
      bloom: 0.85,
      intensity: 1.0,
      fade: 0.78,
      buttonStyle: 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-lg',
      features: [
        'Master profile resume editor',
        'Standard single-column ATS templates',
        'Live ATS structure audit',
        'Unlimited vector PDF exports',
        'Private encrypted cloud storage',
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
      flameColor: '#5227FF',
      highlightColor: '#FF9FFC',
      positionY: -0.07,
      scale: 4.0,
      bloom: 1.1,
      intensity: 1.15,
      fade: 0.74,
      buttonStyle: 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-xl shadow-violet-500/30 ring-2 ring-violet-400/50',
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
      description: 'For ongoing career transitions, executive roles, and continuous interview prep.',
      badge: null,
      ctaLabel: 'Subscribe Monthly',
      ctaHref: '/login',
      isFeatured: false,
      flameColor: '#5227FF',
      highlightColor: '#C4B5FD',
      positionY: -0.09,
      scale: 4.2,
      bloom: 0.9,
      intensity: 1.05,
      fade: 0.78,
      buttonStyle: 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-lg',
      features: [
        '150 AI credits refreshed monthly',
        'Priority AI model processing',
        'Interactive interview simulator',
        'Target keyword density analysis',
        'Full version rollback history',
      ],
    },
  ];

  return (
    <section id="pricing" className="w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#090A10] text-white relative overflow-hidden">
      {/* Soft Center Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-[#5227FF]/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-14 relative z-10">
        
        {/* Editorial Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-inner backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5227FF] animate-pulse" />
            <span>Transparent Pricing</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Honest pricing with no deceptive paywalls.
          </h2>
          
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Start free. Upgrade only when you want automated AI bullet rewrites and unlimited tailored job versions. We never watermark your exported resumes or hide basic features.
          </p>
        </div>

        {/* 3-Tier Grid with React Bits ShaderCard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((p) => (
            <ShaderCard
              key={p.name}
              color={p.flameColor}
              highlightColor={p.highlightColor}
              positionY={p.positionY}
              scale={p.scale}
              bloom={p.bloom}
              intensity={p.intensity}
              fade={p.fade}
              borderRadius="24px"
              className="h-full min-h-[580px] rounded-3xl"
            >
              <div className="p-8 sm:p-9 flex flex-col justify-between h-full relative">
                {/* Top: Header, Price & Features */}
                <div>
                  {/* Recommended Badge */}
                  {p.badge ? (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold mb-4 border border-violet-500/30 shadow-sm shadow-violet-500/20">
                      <span>✦</span>
                      <span>{p.badge}</span>
                    </div>
                  ) : (
                    <div className="h-7 mb-4" />
                  )}

                  <h3 className="text-2xl font-bold text-white tracking-tight">{p.name}</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed min-h-[38px]">
                    {p.description}
                  </p>

                  <div className="flex items-baseline gap-1.5 pt-4 pb-2">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                      {p.price}
                    </span>
                    <span className="text-xs sm:text-sm text-zinc-400 font-medium">
                      / {p.cadence}
                    </span>
                  </div>

                  <ul className="space-y-3 pt-5 text-xs sm:text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        <span className="text-zinc-200 font-medium leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Action Pill Button (Over Rising Luminous Flame) */}
                <div className="pt-8 mt-auto">
                  <Link href={p.ctaHref} className="block w-full">
                    <button
                      type="button"
                      className={`w-full py-3.5 px-6 rounded-full font-semibold text-sm cursor-pointer transition-all duration-200 ${p.buttonStyle}`}
                    >
                      {p.ctaLabel}
                    </button>
                  </Link>
                </div>
              </div>
            </ShaderCard>
          ))}
        </div>

      </div>
    </section>
  );
}
