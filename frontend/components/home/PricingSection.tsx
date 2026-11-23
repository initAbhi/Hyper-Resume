'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
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
  isPromo?: boolean;
}

const PRO_OPTIONS: DisplayTier[] = [
  {
    id: 'pro_weekly',
    name: 'Pro · 1 Week Pass',
    priceInr: '₹149',
    priceUsd: '$7.99',
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
      '7 days of HypeResume Pro access',
      '75 AI credits for the week',
      'All 10 ATS templates unlocked',
      'AI cover letters, LinkedIn & interviews',
      'One-time payment — zero auto-renewal',
    ],
  },
  {
    id: 'pro_monthly',
    name: 'Pro · Monthly',
    priceInr: '₹399',
    priceUsd: '$14.99',
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
      'bg-white text-zinc-950 hover:bg-zinc-100 shadow-xl shadow-blue-500/30 ring-2 ring-blue-400/50',
    features: [
      '30 days of HypeResume Pro access',
      '75 AI credits refilled every week',
      'All 10 ATS templates + sample library',
      'Cover letters, LinkedIn & interviews',
      'Full PDF + DOCX export with zero watermarks',
    ],
  },
  {
    id: 'pro_lifetime',
    name: 'Pro · Lifetime',
    priceInr: '₹999',
    priceUsd: '$24.99',
    cadence: 'forever',
    description: 'Founding member special. Pay once, keep HypeResume Pro permanently.',
    badge: 'Founding Offer',
    ctaLabel: 'Claim Lifetime',
    highlightColor: '#60A5FA',
    positionY: -0.08,
    scale: 4.1,
    bloom: 1.0,
    intensity: 1.1,
    fade: 0.76,
    buttonStyle:
      'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-400 hover:to-indigo-400 shadow-xl shadow-blue-500/30',
    features: [
      'Lifetime HypeResume Pro access',
      '75 AI credits every week — forever',
      'All 10 ATS templates + sample library',
      'Cover letters, LinkedIn & interviews',
      'Never expires · Limited founding seats',
    ],
    isPromo: true,
  },
];

export function PricingSection() {
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [promo, setPromo] = useState<PromoStatus | null>(null);
  const [geoLabel, setGeoLabel] = useState('Detecting your region…');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiClient.getPricingContext().catch(() => null),
      apiClient.getPromoStatus().catch(() => null),
    ]).then(([ctx, promoData]) => {
      if (!mounted) return;
      if (ctx?.currency) {
        setCurrency(ctx.currency);
        setGeoLabel(
          ctx.countryCode
            ? `Prices for ${ctx.countryCode} · ${ctx.currency}`
            : `Prices in ${ctx.currency}`,
        );
      } else {
        setCurrency('USD');
        setGeoLabel('Prices in USD');
      }
      if (promoData) setPromo(promoData);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const visiblePlans = useMemo(
    () =>
      PRO_OPTIONS.filter((p) => {
        if (p.id !== 'pro_lifetime') return true;
        if (!promo) return true;
        return promo.enabled && !promo.isSoldOut;
      }),
    [promo],
  );

  return (
    <section
      id="pricing"
      className="relative w-full overflow-hidden bg-[#0a0a0a] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-[#3872FA]/12 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl space-y-10">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
            Pricing
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem]">
            One Pro plan. Zero recurring subscription traps.
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
            Every paid option unlocks HypeResume Pro — 75 AI credits every week, all 10 templates,
            cover letters, LinkedIn optimization, and clean PDF exports. Prices are shown for your
            region automatically.
          </p>
          <div className="flex justify-center pt-1">
            <div className="inline-flex items-center rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-zinc-400">
              {geoLabel}
            </div>
          </div>
        </div>

        <div className="mx-auto grid w-full grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {visiblePlans.map((p) => {
            const remainingLabel =
              p.isPromo && promo
                ? `${promo.remainingSeats} of ${promo.totalCap} seats left`
                : null;
            const price = currency === 'INR' ? p.priceInr : p.priceUsd;

            return (
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
                className="h-full min-h-[520px] rounded-3xl"
              >
                <div className="relative flex h-full flex-col justify-between p-7 sm:p-8">
                  <div>
                    {p.badge ? (
                      <div className="mb-4 inline-flex flex-wrap items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-300 shadow-sm shadow-blue-500/20">
                        <span>✦</span>
                        <span>{p.badge}</span>
                        {remainingLabel ? (
                          <span className="font-mono text-[10px] font-medium text-blue-200/80">
                            · {remainingLabel}
                          </span>
                        ) : null}
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
                        {price}
                      </span>
                      <span className="text-xs font-medium text-zinc-400 sm:text-sm">
                        / {p.cadence}
                      </span>
                    </div>

                    <ul className="space-y-3 pt-5 text-xs sm:text-sm">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                          <span className="font-medium leading-snug text-zinc-200">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-8">
                    <Link
                      href={`/pricing?plan=${p.id}`}
                      className={`block w-full cursor-pointer rounded-full px-6 py-3.5 text-center text-sm font-semibold transition-all duration-200 ${p.buttonStyle}`}
                    >
                      {p.ctaLabel}
                      {p.isPromo ? <ArrowRight className="ml-1.5 inline h-4 w-4" /> : null}
                    </Link>
                  </div>
                </div>
              </ShaderCard>
            );
          })}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-white/[0.035] px-6 py-4 sm:flex-row">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Sparkles className="hidden h-5 w-5 shrink-0 text-zinc-400 sm:block" />
            <div>
              <p className="text-sm font-semibold text-white">
                Want to explore first? Start with Free Starter ({currency === 'INR' ? '₹0' : '$0'})
              </p>
              <p className="text-xs text-zinc-400">
                Includes 10 lifetime AI credits, Jake&apos;s + Awesome CV, 2 resumes, 50 tracked apps,
                and unlimited unwatermarked PDF exports.
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
