export type SupportedCurrency = 'INR' | 'USD';

export interface CurrencyPrice {
  amountMinor: number;
  displayPrice: string;
  effectiveMonthly?: string;
}

export interface PlanConfig {
  id: string;
  name: string;
  tagline: string;
  amountMinor: number; // default INR amount in minor units (paise)
  currency: SupportedCurrency;
  displayPrice: string;
  prices: Record<SupportedCurrency, CurrencyPrice>;
  credits: number;
  durationDays: number | null; // 0 = free starter, null = lifetime access
  isPro: boolean;
  isLifetime: boolean;
  isPromoOffer?: boolean;
  cadenceLabel: string;
  billingType: 'one_time' | 'recurring_monthly';
  badge?: string;
  features: string[];
}

const PRO_SHARED_FEATURES = [
  'Unlimited AI job description matching & evidence citations',
  'Unlimited grounded STAR / XYZ bullet rewrites & summary tailoring',
  'Full Mock, Weak-Area & Quick Practice AI Interview Studio',
  'Unlimited AI Cover Letters & LinkedIn Profile Optimizer audits',
  'All 10 ATS resume templates + clean unwatermarked PDF & DOCX exports',
];

export const PRICING_PLANS: Record<string, PlanConfig> = {
  free_tier: {
    id: 'free_tier',
    name: 'Free Starter',
    tagline: 'Build your ATS resume free forever + 5 welcome AI credits to test optimization',
    amountMinor: 0,
    currency: 'INR',
    displayPrice: '₹0',
    prices: {
      INR: { amountMinor: 0, displayPrice: '₹0' },
      USD: { amountMinor: 0, displayPrice: '$0' },
    },
    credits: 5,
    durationDays: 0,
    isPro: false,
    isLifetime: false,
    cadenceLabel: 'Free Forever',
    billingType: 'one_time',
    features: [
      '5 Welcome AI Optimization Credits (~2 job matches or 1 quick interview)',
      'Full ATS resume editor across all 10 templates',
      'Unlimited watermark-free PDF & DOCX exports',
      'Public recruiter share links & analytics',
      'Zero model training privacy guarantee',
    ],
  },
  pro_weekly: {
    id: 'pro_weekly',
    name: 'HypeResume Pro — 1 Week Pass',
    tagline: 'Try full unlimited Pro power during an urgent interview sprint',
    amountMinor: 14900, // ₹149
    currency: 'INR',
    displayPrice: '₹149',
    prices: {
      INR: { amountMinor: 14900, displayPrice: '₹149' },
      USD: { amountMinor: 300, displayPrice: '$3' },
    },
    credits: 100,
    durationDays: 7,
    isPro: true,
    isLifetime: false,
    cadenceLabel: '7-day Pro access · One-time pass',
    billingType: 'one_time',
    badge: 'Try 1 Week',
    features: [
      '7 days of unrestricted HypeResume Pro access',
      'Ideal for testing before committing or rapid application sprints',
      'No automatic renewal or surprise rebilling',
      ...PRO_SHARED_FEATURES.slice(0, 3),
    ],
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'HypeResume Pro — 1 Month',
    tagline: 'Flexible full-month job search accelerator with zero auto-renewal traps',
    amountMinor: 39900, // ₹399
    currency: 'INR',
    displayPrice: '₹399',
    prices: {
      INR: { amountMinor: 39900, displayPrice: '₹399', effectiveMonthly: '₹399/mo' },
      USD: { amountMinor: 900, displayPrice: '$9', effectiveMonthly: '$9/mo' },
    },
    credits: 300,
    durationDays: 30,
    isPro: true,
    isLifetime: false,
    cadenceLabel: '30-day Pro access · Pay as you go',
    billingType: 'one_time',
    badge: 'Most Flexible',
    features: [
      '30 full days of unlimited HypeResume Pro access',
      'Renew manually only if your job search continues',
      ...PRO_SHARED_FEATURES,
    ],
  },
  pro_6month: {
    id: 'pro_6month',
    name: 'HypeResume Pro — 6 Months',
    tagline: 'Our best standard value (₹200/mo effective — 50% off monthly)',
    amountMinor: 120000, // ₹1,200
    currency: 'INR',
    displayPrice: '₹1,200',
    prices: {
      INR: { amountMinor: 120000, displayPrice: '₹1,200', effectiveMonthly: '₹200/mo' },
      USD: { amountMinor: 2900, displayPrice: '$29', effectiveMonthly: '$4.83/mo' },
    },
    credits: 1500,
    durationDays: 180,
    isPro: true,
    isLifetime: false,
    cadenceLabel: '6 months Pro access · Save 50%',
    billingType: 'one_time',
    badge: 'Save 50%',
    features: [
      '180 days of unlimited HypeResume Pro access (just ₹200/month)',
      'Covers full placement season, campus hiring, or senior role switches',
      ...PRO_SHARED_FEATURES,
    ],
  },
  pro_lifetime: {
    id: 'pro_lifetime',
    name: 'HypeResume Pro — Founding Lifetime',
    tagline: 'Limited initial validation offer: Pay once, keep Pro forever',
    amountMinor: 99900, // ₹999
    currency: 'INR',
    displayPrice: '₹999',
    prices: {
      INR: { amountMinor: 99900, displayPrice: '₹999' },
      USD: { amountMinor: 1900, displayPrice: '$19' },
    },
    credits: 5000,
    durationDays: null,
    isPro: true,
    isLifetime: true,
    isPromoOffer: true,
    cadenceLabel: 'Lifetime Pro access · Limited Founding Seats',
    billingType: 'one_time',
    badge: 'Founding Launch Offer',
    features: [
      'Permanent Lifetime access to all HypeResume Pro tools & future templates',
      'Cheaper than 6 months (₹999 one-time vs ₹1,200) during Founding Cohort',
      ...PRO_SHARED_FEATURES,
    ],
  },
};

export function normalizeCurrency(currency?: string): SupportedCurrency {
  return currency?.toUpperCase() === 'USD' ? 'USD' : 'INR';
}

export function formatMinorAmount(amountMinor: number, currency: SupportedCurrency = 'INR'): string {
  const major = amountMinor / 100;
  if (currency === 'USD') {
    return Number.isInteger(major) ? `$${major}` : `$${major.toFixed(2)}`;
  }
  return `₹${Math.round(major).toLocaleString('en-IN')}`;
}

export function resolvePlanPricing(
  planId: string,
  currency?: string,
): {
  plan: PlanConfig;
  currency: SupportedCurrency;
  amountMinor: number;
  displayPrice: string;
} | null {
  const plan = PRICING_PLANS[planId];
  if (!plan) return null;
  const resolvedCurrency = normalizeCurrency(currency);
  const localized = plan.prices[resolvedCurrency] || plan.prices.INR;
  return {
    plan,
    currency: resolvedCurrency,
    amountMinor: localized.amountMinor,
    displayPrice: localized.displayPrice,
  };
}
