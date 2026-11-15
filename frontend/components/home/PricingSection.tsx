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
    buttonStyle:
      'bg-white text-zinc-950 hover:bg-zinc-100 shadow-xl shadow-violet-500/30 ring-2 ring-violet-400/50',
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
    highlightColor: '#A78BFA',
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
    <section
      id="pricing"
      className="relative w-full overflow-hidden bg-[#0a0a0a] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-[#5525F5]/12 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl space-y-10">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Pricing
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem]">
            One Pro plan. Zero recurring subscription traps.
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
            Every paid option unlocks the full HypeResume Pro platform — unlimited AI tailoring,
            cover letters, LinkedIn optimization, and clean PDF exports. Pick the duration that fits
            your timeline.
          </p>

          <div className="flex justify-center pt-1">
            <div className="inline-flex items-center rounded-full bg-white/[0.06] p-1">
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  currency === 'INR' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                INR (₹) · India
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  currency === 'USD' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                USD ($) · Global
              </button>
            </div>
          </div>
        </div>

        {/* Founding offer — tonal surface, white CTA (matches final CTA theme) */}
        {(!promo || (promo.enabled && !promo.isSoldOut)) && (
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-white/[0.04] p-5 text-center sm:flex-row sm:items-center sm:p-6 sm:text-left">
            <div className="space-y-1.5">
              <div className="inline-flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400 sm:justify-start">
                <Flame className="h-3.5 w-3.5 text-[#a78bfa]" />
                <span>Founding member offer</span>
                {promo ? (
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 font-mono text-[10px] normal-case tracking-normal text-zinc-400">
                    {promo.claimedSeats}/{promo.totalCap} claimed · {promo.remainingSeats} left
                  </span>
                ) : null}
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                Lifetime HypeResume Pro for {currency === 'INR' ? '₹999' : '$19'} one-time
              </h3>
              <p className="mx-auto max-w-xl text-xs leading-relaxed text-zinc-400 sm:mx-0 sm:text-sm">
                Early validation special for our first 200 customers. Pay once, keep Pro permanently
                across every future update.
              </p>
            </div>
            <Link
              href={`/pricing?plan=pro_lifetime&currency=${currency}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-100 sm:text-sm"
            >
              <span>Claim Lifetime ({currency === 'INR' ? '₹999' : '$19'})</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 lg:gap-8">
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
              <div className="relative flex h-full flex-col justify-between p-8 sm:p-9">
                <div>
                  {p.badge ? (
                    <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/20 px-3.5 py-1 text-xs font-semibold text-violet-300 shadow-sm shadow-violet-500/20">
                      <span>✦</span>
                      <span>{p.badge}</span>
                    </div>
                  ) : (
                    <div className="mb-4 h-7" />
                  )}

                  <h3 className="text-2xl font-bold tracking-tight text-white">{p.name}</h3>
                  <p className="mt-2 min-h-[38px] text-xs leading-relaxed text-zinc-400 sm:text-sm">
                    {p.description}
                  </p>

                  <div className="flex items-baseline gap-1.5 pb-2 pt-4">
                    <span className="font-mono text-3xl font-black tracking-tight text-white sm:text-4xl">
                      {currency === 'INR' ? p.priceInr : p.priceUsd}
                    </span>
                    <span className="text-xs font-medium text-zinc-400 sm:text-sm">
                      / {p.cadence}
                    </span>
                  </div>

                  <ul className="space-y-3 pt-5 text-xs sm:text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                        <span className="font-medium leading-snug text-zinc-200">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-8">
                  <Link href={`/pricing?plan=${p.id}&currency=${currency}`} className="block w-full">
                    <button
                      type="button"
                      className={`w-full cursor-pointer rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-200 ${p.buttonStyle}`}
                    >
                      {p.ctaLabel}
                    </button>
                  </Link>
                </div>
              </div>
            </ShaderCard>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-white/[0.035] px-6 py-4 sm:flex-row">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Sparkles className="hidden h-5 w-5 shrink-0 text-zinc-400 sm:block" />
            <div>
              <p className="text-sm font-semibold text-white">
                Want to explore first? Start with Free Starter ({currency === 'INR' ? '₹0' : '$0'})
              </p>
              <p className="text-xs text-zinc-500">
                Includes 5 welcome AI credits, full ATS resume builder, and unlimited unwatermarked
                PDF exports.
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="shrink-0 rounded-full bg-white/[0.08] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.12]"
          >
            Start Free →
          </Link>
        </div>
      </div>
    </section>
  );
}
