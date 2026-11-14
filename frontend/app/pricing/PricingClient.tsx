'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  CreditCard,
  CheckCircle2,
  X,
  Sparkles,
  Lock,
  Flame,
  Clock,
  Crown,
} from 'lucide-react';
import {
  apiClient,
  PricingPlan,
  PaymentOrderResponse,
  PromoStatus,
  SupportedCurrency,
} from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { analytics } from '@/lib/analytics';

const FALLBACK_PRO_PLANS: PricingPlan[] = [
  {
    id: 'pro_weekly',
    name: 'HypeResume Pro — 1 Week Pass',
    tagline: 'Try full Pro capabilities for 7 days. Ideal for upcoming interview deadlines.',
    amountMinor: 14900,
    currency: 'INR',
    displayPrice: '₹149',
    prices: {
      INR: { amountMinor: 14900, displayPrice: '₹149' },
      USD: { amountMinor: 300, displayPrice: '$3' },
    },
    credits: 0,
    durationDays: 7,
    isLifetime: false,
    isPro: true,
    cadenceLabel: '1 week',
    billingType: 'one_time',
    badge: 'Try 1 Week',
    features: [
      '7 days unlimited HypeResume Pro access',
      'Unlimited STAR bullet rewrites & tailored versions',
      'Evidence-quoted Job Description matching',
      'AI Cover Letters & LinkedIn profile audits',
      'Mock Interview Simulator + weak-area practice',
      'One-time payment — zero automatic renewal',
    ],
  },
  {
    id: 'pro_monthly',
    name: 'HypeResume Pro — Monthly',
    tagline: 'Full platform access for an active 30-day job search sprint.',
    amountMinor: 39900,
    currency: 'INR',
    displayPrice: '₹399',
    prices: {
      INR: { amountMinor: 39900, displayPrice: '₹399' },
      USD: { amountMinor: 900, displayPrice: '$9' },
    },
    credits: 0,
    durationDays: 30,
    isLifetime: false,
    isPro: true,
    cadenceLabel: '1 month',
    billingType: 'one_time',
    badge: 'Most Popular',
    features: [
      '30 days unlimited HypeResume Pro access',
      'Unlimited tailored resume variants & exports',
      'Evidence-quoted JD matching & gap analysis',
      'AI Cover Letters & LinkedIn profile optimizer',
      'Full AI Mock Interview Simulator access',
      'Pay once for 30 days — zero surprise rebills',
    ],
  },
  {
    id: 'pro_6month',
    name: 'HypeResume Pro — 6 Months',
    tagline: 'Extended half-year job switch protection at ₹200/month effective rate.',
    amountMinor: 120000,
    currency: 'INR',
    displayPrice: '₹1,200',
    prices: {
      INR: { amountMinor: 120000, displayPrice: '₹1,200' },
      USD: { amountMinor: 2900, displayPrice: '$29' },
    },
    credits: 0,
    durationDays: 180,
    isLifetime: false,
    isPro: true,
    cadenceLabel: '6 months',
    billingType: 'one_time',
    badge: 'Best Value · Save 50%',
    features: [
      '180 days unlimited HypeResume Pro access',
      'Unlimited AI tailoring across every application',
      'Unlimited Cover Letters & LinkedIn audits',
      'Mock Interview simulator for every round',
      'Complete application tracker & career snapshots',
      'One-time 6-month pass — zero recurring fee',
    ],
  },
  {
    id: 'pro_lifetime',
    name: 'HypeResume Pro — Founding Lifetime',
    tagline: 'Early validation offer for our first cohort: unlock Pro permanently in one payment.',
    amountMinor: 99900,
    currency: 'INR',
    displayPrice: '₹999',
    prices: {
      INR: { amountMinor: 99900, displayPrice: '₹999' },
      USD: { amountMinor: 1900, displayPrice: '$19' },
    },
    credits: 0,
    durationDays: null,
    isLifetime: true,
    isPro: true,
    isPromoOffer: true,
    cadenceLabel: 'lifetime',
    billingType: 'one_time',
    badge: 'Founding Launch Offer',
    features: [
      'Permanent Lifetime HypeResume Pro access',
      'All future templates & AI upgrades included',
      'Unlimited bullet rewrites, JD matches & cover letters',
      'Unlimited LinkedIn optimizer & interview practice',
      'Clean PDF & DOCX export with zero watermarks',
      'Never expires · Strictly limited founding seats',
    ],
  },
];

const FAQS = [
  {
    q: 'What is included in HypeResume Pro across all options?',
    a: 'All four paid options belong to the same unified plan: HypeResume Pro. You get unlimited AI bullet rewrites, job description match analyses, AI cover letters, LinkedIn profile optimizations, mock interview simulator sessions, and clean PDF/DOCX exports. You only choose the pass duration: 1 week, 1 month, 6 months, or Founding Lifetime.',
  },
  {
    q: 'Are there hidden recurring subscriptions or automatic renewals?',
    a: 'No. Every Pro Pass (1 Week, 1 Month, 6 Months, and Founding Lifetime) is processed as a transparent one-time pass. When your pass expires, you keep all your resumes, data, and free PDF export access without unexpected card charges.',
  },
  {
    q: 'What does Free Starter include?',
    a: 'Every new account receives 5 Free Welcome AI credits, full access to all 10 ATS resume templates, unlimited manual editing and cloud saving, and unlimited clean PDF downloads with zero watermarks.',
  },
  {
    q: 'How does the ₹999 ($19) Founding Lifetime Launch Offer work?',
    a: 'During our early validation phase, we opened a strictly limited Founding Member Lifetime seat cap tracked directly in our database. While seats remain, paying ₹999 ($19) once grants permanent Pro access with zero renewal fees ever.',
  },
  {
    q: 'What happens on Free Starter if an AI request fails?',
    a: 'Our credit ledger is atomic and idempotent. If an AI operation fails on a free account, any reserved credits are automatically refunded. Pro Pass holders enjoy unlimited retries at 0 credit cost.',
  },
  {
    q: 'Are my resumes or personal data used to train AI models?',
    a: 'Never. We enforce strict zero-retention privacy policies with AI providers and never use candidate resumes, achievements, or job descriptions to train AI models.',
  },
];

function getPlanPrice(plan: PricingPlan, currency: SupportedCurrency) {
  if (plan.prices && plan.prices[currency]) {
    return plan.prices[currency];
  }
  return {
    amountMinor: plan.amountMinor,
    displayPrice: plan.displayPrice,
  };
}

export function PricingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, creditBalance, hasActivePro, isAuthenticated, refreshUser } = useAuth();

  const initialCurrencyParam = searchParams?.get('currency')?.toUpperCase();
  const [currency, setCurrency] = useState<SupportedCurrency>(
    initialCurrencyParam === 'USD' ? 'USD' : 'INR',
  );
  const [plans, setPlans] = useState<PricingPlan[]>(FALLBACK_PRO_PLANS);
  const [promo, setPromo] = useState<PromoStatus | null>(null);
  const [activePlan, setActivePlan] = useState<PricingPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'review' | 'processing' | 'success' | 'error'>('review');
  const [orderData, setOrderData] = useState<PaymentOrderResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successReceipt, setSuccessReceipt] = useState<{
    orderId: string;
    paymentId: string;
    planName: string;
    isLifetime: boolean;
    proExpiresAt: string | null;
    newBalance: number;
  } | null>(null);

  const autoOpenedPlanRef = useRef(false);

  useEffect(() => {
    analytics.track('pricing_viewed', { source: 'pricing_page' });

    apiClient
      .getPricingPlans()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data);
        }
      })
      .catch(() => {
        // Use predefined fallback plans
      });

    apiClient
      .getPromoStatus()
      .then((data) => setPromo(data))
      .catch(() => {
        // Keep silent if backend offline
      });
  }, []);

  // Verify returning payment from Dodo Checkout (using REAL verified fields!)
  useEffect(() => {
    const statusParam = searchParams?.get('status');
    const orderIdParam = searchParams?.get('orderId');

    if (orderIdParam && statusParam !== 'cancelled') {
      setIsCheckoutOpen(true);
      setCheckoutStep('processing');
      apiClient
        .verifyPayment({ orderId: orderIdParam })
        .then(async (result) => {
          if (result.verified) {
            await refreshUser();
            const returnedCurrency = (result.currency || 'INR') as SupportedCurrency;
            const returnedAmountMinor = result.amountMinor ?? 39900;

            analytics.track('purchase_completed', {
              orderId: result.orderId || orderIdParam,
              paymentId: result.paymentId,
              planId: result.planId || 'pro_monthly',
              planName: result.planName || 'HypeResume Pro',
              amountMinor: returnedAmountMinor,
              currency: returnedCurrency,
            });

            setSuccessReceipt({
              orderId: result.orderId || orderIdParam,
              paymentId: result.paymentId,
              planName: result.planName || 'HypeResume Pro',
              isLifetime: Boolean(result.isLifetime),
              proExpiresAt: result.proExpiresAt || null,
              newBalance: result.balance,
            });
            setCheckoutStep('success');
            if (typeof window !== 'undefined') {
              window.history.replaceState({}, '', '/pricing');
            }
          } else {
            setCheckoutStep('error');
            setErrorMessage(
              'Payment has not cleared with Dodo Payments yet. Complete checkout or wait a few seconds and retry verification.',
            );
          }
        })
        .catch((err) => {
          setCheckoutStep('error');
          setErrorMessage(err instanceof Error ? err.message : 'Payment verification could not be completed.');
        });
    } else if (statusParam === 'cancelled') {
      setIsCheckoutOpen(true);
      setCheckoutStep('error');
      setErrorMessage('Checkout was cancelled before payment completed. No charges were made.');
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/pricing');
      }
    }
  }, [searchParams, refreshUser]);

  // Auto-open requested ?plan= checkout when returning from /register or /login
  useEffect(() => {
    const planParam = searchParams?.get('plan');
    if (
      !autoOpenedPlanRef.current &&
      isAuthenticated &&
      planParam &&
      plans.length > 0 &&
      !searchParams?.get('orderId')
    ) {
      const target = plans.find((p) => p.id === planParam);
      if (target) {
        autoOpenedPlanRef.current = true;
        setActivePlan(target);
        setCheckoutStep('review');
        setErrorMessage('');
        setOrderData(null);
        setIsCheckoutOpen(true);
      }
    }
  }, [isAuthenticated, searchParams, plans]);

  const visiblePlans = plans.filter((p) => {
    if (p.id === 'pro_lifetime' && promo && (!promo.enabled || promo.isSoldOut)) {
      return false;
    }
    return true;
  });

  const handleSelectPlan = (plan: PricingPlan) => {
    const price = getPlanPrice(plan, currency);
    if (price.amountMinor === 0) {
      router.push(isAuthenticated ? '/app' : '/register');
      return;
    }

    if (!isAuthenticated) {
      router.push(`/register?redirect=/pricing&plan=${encodeURIComponent(plan.id)}&currency=${currency}`);
      return;
    }

    setActivePlan(plan);
    setCheckoutStep('review');
    setErrorMessage('');
    setOrderData(null);
    setIsCheckoutOpen(true);
    analytics.track('checkout_started', {
      planId: plan.id,
      planName: plan.name,
      amountMinor: price.amountMinor,
      currency,
    });
  };

  const handleInitiateOrder = async () => {
    if (!activePlan) return;
    setCheckoutStep('processing');
    setErrorMessage('');

    try {
      const order = await apiClient.createPaymentOrder({
        planId: activePlan.id,
        currency,
      });
      setOrderData(order);

      if (order.checkoutUrl) {
        analytics.track('checkout_started', {
          planId: activePlan.id,
          planName: activePlan.name,
          amountMinor: order.amountMinor,
          currency: order.currency,
          orderId: order.orderId,
          provider: order.provider,
        });
        window.location.href = order.checkoutUrl;
        return;
      }

      setCheckoutStep('error');
      setErrorMessage('Payment gateway did not return a hosted checkout URL. Please contact support.');
    } catch (err: unknown) {
      setCheckoutStep('error');
      setErrorMessage(err instanceof Error ? err.message : 'Unable to create checkout order. Please try again.');
    }
  };

  const formatExpiry = (iso: string | null | undefined) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <Badge variant="info" className="mb-3 px-3 py-1 font-semibold text-xs">
          One Unified Plan · HypeResume Pro
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Simple One-Plan Access. <br className="hidden sm:inline" />
          Zero Subscription Traps.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
          Start free with 5 welcome AI credits and unlimited PDF downloads, or unlock full HypeResume Pro for 1 week, 1 month, 6 months, or lifetime.
        </p>

        {/* Currency Selector */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1">
            <button
              type="button"
              onClick={() => setCurrency('INR')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                currency === 'INR'
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              INR (₹) · India
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              USD ($) · Global
            </button>
          </div>
        </div>

        {/* Authenticated Entitlement Pill */}
        {isAuthenticated && (
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Signed in as <strong>{user?.email}</strong> ·{' '}
              {hasActivePro ? (
                <strong className="text-emerald-700 dark:text-emerald-400">
                  {user?.isLifetimePro
                    ? 'HypeResume Pro Lifetime Active'
                    : `HypeResume Pro Active (until ${formatExpiry(user?.proExpiresAt)})`}
                </strong>
              ) : (
                <>
                  Balance: <strong>{creditBalance} Free Credits</strong>
                </>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Founding Lifetime Offer Banner (Live PostgreSQL Seat Counter) */}
      {promo && promo.enabled && !promo.isSoldOut && (
        <div className="mb-12 rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-r from-emerald-950 via-zinc-900 to-violet-950 text-white p-6 sm:p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Founding Lifetime Offer
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono font-semibold text-zinc-100">
                {promo.claimedSeats} / {promo.totalCap} seats claimed · {promo.remainingSeats} remaining
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold">
              Pay {currency === 'INR' ? '₹999' : '$19'} once. Get Lifetime HypeResume Pro forever.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {promo.bannerText ||
                'To validate HypeResume with our earliest job seekers, our first 200 founding members unlock permanent Lifetime Pro access at ₹999 ($19). Live seat count verified directly from our database.'}
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="shrink-0 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold shadow-lg"
            onClick={() => {
              const lifetimePlan = plans.find((p) => p.id === 'pro_lifetime') || FALLBACK_PRO_PLANS[3];
              handleSelectPlan(lifetimePlan);
            }}
          >
            <Crown className="w-4 h-4 mr-2" />
            Claim Lifetime ({currency === 'INR' ? '₹999' : '$19'})
          </Button>
        </div>
      )}

      {/* Pro Option Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${visiblePlans.length >= 4 ? 'xl:grid-cols-4' : 'lg:grid-cols-3'} gap-6 items-stretch mb-12`}>
        {visiblePlans.map((plan) => {
          const price = getPlanPrice(plan, currency);
          const isHighlighted = plan.id === 'pro_monthly' || plan.id === 'pro_lifetime';

          return (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between transition-all duration-200 ${
                plan.id === 'pro_lifetime'
                  ? 'border-2 border-emerald-600 dark:border-emerald-500 shadow-xl bg-white dark:bg-zinc-900 ring-4 ring-emerald-500/10'
                  : plan.id === 'pro_monthly'
                    ? 'border-2 border-blue-600 dark:border-blue-500 shadow-xl bg-white dark:bg-zinc-900 ring-4 ring-blue-600/10'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60'
              }`}
            >
              <div>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between gap-2 min-h-[26px]">
                    {plan.badge ? (
                      <Badge
                        variant={plan.id === 'pro_lifetime' ? 'success' : 'info'}
                        className="w-fit text-xs font-semibold"
                      >
                        {plan.badge}
                      </Badge>
                    ) : (
                      <span />
                    )}
                    {plan.id === 'pro_lifetime' && promo ? (
                      <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {promo.remainingSeats} left
                      </span>
                    ) : null}
                  </div>
                  <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                    {plan.name.replace('HypeResume Pro — ', '')}
                  </CardTitle>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 font-mono">
                      {price.displayPrice}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      / {plan.cadenceLabel || (plan.isLifetime ? 'lifetime' : 'pass')}
                    </span>
                  </div>
                  <CardDescription className="text-xs mt-2 leading-relaxed min-h-[40px]">
                    {plan.tagline}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2">
                  <div className="p-2.5 mb-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        AI Operations
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Unlimited Pro
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-6">
                <Button
                  variant={isHighlighted ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full justify-center font-medium shadow-sm"
                >
                  <span>Choose {plan.name.replace('HypeResume Pro — ', '')}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Free Starter Callout */}
      <div className="mb-16 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/70 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Free Starter ({currency === 'INR' ? '₹0' : '$0'} forever)
            </h3>
            <Badge variant="neutral" className="text-xs">5 Welcome AI Credits</Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Build unlimited resumes manually, test our ATS audits & job matcher with 5 free AI credits, and export unlimited clean watermark-free PDFs.
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={() => router.push(isAuthenticated ? '/app' : '/register')}
          className="shrink-0"
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Start Free Account'}
        </Button>
      </div>

      {/* Feature Comparison Table */}
      <div className="mb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Free Starter vs. HypeResume Pro
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Every paid option (1 Week, 1 Month, 6 Months, Lifetime) unlocks the exact same full Pro suite.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Capability</th>
                <th className="py-3.5 px-4 font-semibold text-center">Free Starter ({currency === 'INR' ? '₹0' : '$0'})</th>
                <th className="py-3.5 px-4 font-semibold text-center text-blue-600 dark:text-blue-400">
                  HypeResume Pro (1 Week / Monthly / 6M / Lifetime)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-300">
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  AI Bullet Rewrites & STAR Improvements
                </td>
                <td className="py-3 px-4 text-center">Up to 5 welcome credits</td>
                <td className="py-3 px-4 text-center font-semibold text-emerald-600">Unlimited during active pass</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  Evidence-Quoted JD Matching & Tailoring
                </td>
                <td className="py-3 px-4 text-center">Uses welcome credits (1–2/run)</td>
                <td className="py-3 px-4 text-center font-semibold text-emerald-600">Unlimited during active pass</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  AI Cover Letters & LinkedIn Optimizer
                </td>
                <td className="py-3 px-4 text-center">2 credits per generation</td>
                <td className="py-3 px-4 text-center font-semibold text-emerald-600">Unlimited during active pass</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  Mock Interview Simulator & Weak-Area Drill
                </td>
                <td className="py-3 px-4 text-center">2 credits per session</td>
                <td className="py-3 px-4 text-center font-semibold text-emerald-600">Unlimited during active pass</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  10 ATS Templates & Unwatermarked PDF/DOCX Export
                </td>
                <td className="py-3 px-4 text-center text-emerald-600 font-medium">Included Free</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-medium">Included</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  Forced Auto-Renewals
                </td>
                <td className="py-3 px-4 text-center text-zinc-400">None</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-semibold">
                  None (Transparent One-Time Passes)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust Guarantee Card */}
      <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-center max-w-3xl mx-auto flex flex-col items-center gap-3 mb-20 shadow-sm">
        <ShieldCheck className="w-9 h-9 text-emerald-600 dark:text-emerald-500" />
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Our Fair Pricing & Truthfulness Guarantee
        </h3>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          Every Pro pass is billed once with zero surprise auto-renewals. Seat counters on our Founding Lifetime Offer reflect real completed purchases verified on our server. Export clean, unwatermarked resumes anytime.
        </p>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider">Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs"
            >
              <h4 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 mb-2">
                {faq.q}
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Modal Dialog */}
      {isCheckoutOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 overflow-hidden">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              aria-label="Close checkout dialog"
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Step: Review & Redirect to Dodo Checkout */}
            {checkoutStep === 'review' && activePlan && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    Order Summary
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 mb-5 space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <span>{activePlan.name}</span>
                    <span className="text-base text-blue-600 dark:text-blue-400 font-mono">
                      {getPlanPrice(activePlan, currency).displayPrice}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500">
                    <span>Access Unlocked:</span>
                    <span className="font-semibold text-emerald-600">
                      {activePlan.isLifetime
                        ? 'Permanent Lifetime Pro'
                        : `${activePlan.durationDays || 30} Days Full Pro`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500">
                    <span>Currency / Billing:</span>
                    <span>{currency} · One-time (No auto-renewal)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-6">
                  <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>256-bit encrypted checkout via Dodo Payments (UPI, Cards, International).</span>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  onClick={handleInitiateOrder}
                >
                  Continue to Dodo Checkout
                </Button>
              </div>
            )}

            {/* Step: Processing */}
            {checkoutStep === 'processing' && (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  {orderData ? 'Redirecting to Dodo Payments...' : 'Verifying Payment with Dodo Gateway...'}
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Confirming cryptographic settlement directly with Dodo Payments. Do not close this window.
                </p>
              </div>
            )}

            {/* Step: Success Receipt */}
            {checkoutStep === 'success' && successReceipt && (
              <div className="py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-center text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                  HypeResume Pro Activated!
                </h3>
                <p className="text-center text-xs text-zinc-500 mb-6">
                  {successReceipt.planName} is now active on your account.
                </p>

                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Order Reference:</span>
                    <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                      {successReceipt.orderId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Pro Status:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {successReceipt.isLifetime
                        ? 'Lifetime Active'
                        : `Active until ${formatExpiry(successReceipt.proExpiresAt)}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700">
                    <span className="text-zinc-500">Credit Balance:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {successReceipt.newBalance} credits
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="md"
                    className="flex-1 justify-center"
                    onClick={() => setIsCheckoutOpen(false)}
                  >
                    Close
                  </Button>
                  <Link href="/app/resumes" className="flex-1">
                    <Button variant="primary" size="md" className="w-full justify-center">
                      Go to Resumes
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Step: Error */}
            {checkoutStep === 'error' && (
              <div className="py-2">
                <Alert variant="destructive" title="Checkout Notice" className="mb-5">
                  {errorMessage}
                </Alert>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="md"
                    className="flex-1 justify-center"
                    onClick={() => setIsCheckoutOpen(false)}
                  >
                    Close
                  </Button>
                  {activePlan && (
                    <Button
                      variant="primary"
                      size="md"
                      className="flex-1 justify-center"
                      onClick={() => {
                        setCheckoutStep('review');
                        setOrderData(null);
                      }}
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
