'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { ShaderCard } from '@/components/reactbits';
import { apiClient, PromoStatus, SupportedCurrency } from '@/lib/api-client';

interface DisplayTier {
  id: string;
  name: string;
  priceInr: string;
  priceUsd: string;
  cadence: string;
  description: string;
  badge: string | null;
  ctaLabel: string;
  highlightColor: string;
  positionY: number;
  scale: number;
  bloom: number;
  intensity: number;
  fade: number;
  buttonStyle: string;
  features: string[];
}

const PRO_OPTIONS: DisplayTier[] = [
  {
    id: 'pro_weekly',
    name: 'Pro · 1 Week Pass',
    priceInr: '₹149',
    priceUsd: '$3',
    cadence: '7 days access',
    description: 'Try full HypeResume Pro for one week. Built for an urgent deadline or sprint.',
    badge: 'Try 1 Week',
    ctaLabel: 'Start 1-Week Pass',
    highlightColor: '#B48BFA',
    positionY: -0.09,
    scale: 4.2,
    bloom: 0.85,
    intensity: 1.0,
    fade: 0.78,
    buttonStyle: 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-lg',
    features: [
      '7 days unlimited HypeResume Pro access',
      'Unlimited STAR bullet rewrites & JD matching',
      'AI cover letters & LinkedIn profile optimizer',
      'Mock interview practice & weak-area coaching',
      'One-time payment — zero auto-renewal',
    ],
  },
  {
    id: 'pro_monthly',
    name: 'Pro · Monthly',
    priceInr: '₹399',
    priceUsd: '$9',
    cadence: '30 days access',
    description: 'Full access for your active job hunt month. Pay once without subscription traps.',
    badge: 'Most Popular',
    ctaLabel: 'Get Monthly Pro',
    highlightColor: '#FF9FFC',
    positionY: -0.07,
    scale: 4.0,
    bloom: 1.1,
    intensity: 1.15,
    fade: 0.74,
    buttonStyle: 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-xl shadow-violet-500/30 ring-2 ring-violet-400/50',
    features: [
      '30 days unlimited HypeResume Pro access',
      'Unlimited tailored resume variants per JD',
      'Evidence-quoted ATS match & keyword radar',
      'Unlimited AI cover letters & LinkedIn audits',
      'Full PDF + DOCX export with zero watermarks',
    ],
  },
  {
    id: 'pro_6month',
    name: 'Pro · 6 Months',
    priceInr: '₹1,200',
    priceUsd: '$29',
    cadence: '180 days (₹200/mo)',
    description: 'Half-year job switch coverage at 50% savings compared to monthly.',
    badge: 'Best Value · Save 50%',
    ctaLabel: 'Get 6-Month Pro',
    highlightColor: '#6EE7B7',
    positionY: -0.09,
    scale: 4.2,
    bloom: 0.9,
    intensity: 1.05,
    fade: 0.78,
    buttonStyle: 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-lg',
    features: [
      '180 days unlimited HypeResume Pro access',
      'Everything unlocked across builder & tools',
      'Extended mock interview simulator sessions',
      'Long-term application pipeline & versioning',
      'Zero recurring charge after 6 months',
    ],
  },
];

export function PricingSection() {
  const [currency, setCurrency] = useState<SupportedCurrency>('INR');
  const [promo, setPromo] = useState<PromoStatus | null>(null);

  useEffect(() => {
    let mounted = true;
    apiClient
      .getPromoStatus()
      .then((data) => {
        if (mounted) setPromo(data);
      })
      .catch(() => {
        // Silent fallback if backend unavailable
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="pricing" className="w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#090A10] text-white relative overflow-hidden">
      {/* Soft Center Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-[#5227FF]/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Editorial Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] text-zinc-300 text-xs font-semibold tracking-wider uppercase font-mono shadow-inner backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5227FF] animate-pulse" />
            <span>One Plan · Flexible Access</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            One Pro plan. Zero recurring subscription traps.
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Every paid option unlocks the full HypeResume Pro platform — unlimited AI tailoring, cover letters, LinkedIn optimization, and clean PDF exports. Pick the duration that fits your timeline.
          </p>

          {/* Currency Switcher */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex items-center rounded-full bg-white/[0.06] border border-white/[0.1] p-1">
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  currency === 'INR' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-300 hover:text-white'
                }`}
              >
                INR (₹) · India
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  currency === 'USD' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-300 hover:text-white'
                }`}
              >
                USD ($) · Global
              </button>
            </div>
          </div>
        </div>

        {/* Founding Member Lifetime Sales Banner */}
        {(!promo || (promo.enabled && !promo.isSoldOut)) && (
          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/80 via-zinc-900/90 to-violet-950/80 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shadow-emerald-950/20">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Founding Member Launch Offer</span>
                {promo ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 font-mono text-[11px]">
                    {promo.claimedSeats}/{promo.totalCap} claimed · {promo.remainingSeats} left
                  </span>
                ) : null}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Lifetime HypeResume Pro for {currency === 'INR' ? '₹999' : '$19'} one-time
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300">
                Early validation special for our first {promo?.totalCap ?? 10} customers. Pay once, keep Pro access permanently across every future update.
              </p>
            </div>
            <Link
              href={`/pricing?plan=pro_lifetime&currency=${currency}`}
              className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold text-xs sm:text-sm transition-colors shadow-lg"
            >
              <span>Claim Lifetime ({currency === 'INR' ? '₹999' : '$19'})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 3 Main Pro Access Duration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PRO_OPTIONS.map((p) => (
            <ShaderCard
              key={p.id}
              color="#5227FF"
              highlightColor={p.highlightColor}
              positionY={p.positionY}
              scale={p.scale}
              bloom={p.bloom}
              intensity={p.intensity}
              fade={p.fade}
              borderRadius="24px"
              className="h-full min-h-[540px] rounded-3xl"
            >
              <div className="p-8 sm:p-9 flex flex-col justify-between h-full relative">
                <div>
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
                      {currency === 'INR' ? p.priceInr : p.priceUsd}
                    </span>
                    <span className="text-xs sm:text-sm text-zinc-400 font-medium">
                      / {p.cadence}
                    </span>
                  </div>

                  <ul className="space-y-3 pt-5 text-xs sm:text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        <span className="text-zinc-200 font-medium leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8 mt-auto">
                  <Link href={`/pricing?plan=${p.id}&currency=${currency}`} className="block w-full">
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

        {/* Free Tier Strip */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Sparkles className="w-5 h-5 text-violet-400 shrink-0 hidden sm:block" />
            <div>
              <p className="text-sm font-semibold text-white">
                Want to explore first? Start with Free Starter ({currency === 'INR' ? '₹0' : '$0'})
              </p>
              <p className="text-xs text-zinc-400">
                Includes 5 welcome AI credits, full ATS resume builder, and unlimited unwatermarked PDF exports.
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="shrink-0 px-4 py-2 rounded-full bg-white/[0.1] hover:bg-white/[0.16] text-white text-xs font-semibold transition-colors"
          >
            Start Free →
          </Link>
        </div>
      </div>
    </section>
  );
}
