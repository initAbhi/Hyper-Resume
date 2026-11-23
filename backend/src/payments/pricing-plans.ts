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
  /** Hidden from public pricing UI while kept for existing purchasers */
  isHidden?: boolean;
  cadenceLabel: string;
  billingType: 'one_time' | 'recurring_monthly';
  badge?: string;
  features: string[];
}

/** Weekly AI credit grant for every active Pro pass */
export const PRO_WEEKLY_CREDITS = 75;
export const FREE_SIGNUP_CREDITS = 10;
/** Free Starter hard caps (Pro = unlimited) */
export const FREE_MAX_RESUMES = 2;
export const FREE_MAX_APPLICATIONS = 50;

const PRO_SHARED_FEATURES = [
  `${PRO_WEEKLY_CREDITS} AI credits every week (job match, rewrites, cover letters, interviews)`,
  'All 10 ATS resume templates (8 Premium unlocked)',
  'Unlimited resumes & unlimited job application tracking',
  'Full Sample Library with company-caliber formats',
  'Mock Interview Studio, Cover Letters & LinkedIn optimizer',
  'Clean unwatermarked PDF & DOCX exports',
];

export const PRICING_PLANS: Record<string, PlanConfig> = {
  free_tier: {
    id: 'free_tier',
    name: 'Free Starter',
    tagline: `Build forever free with ${FREE_SIGNUP_CREDITS} lifetime AI credits to try optimization`,
    amountMinor: 0,
    currency: 'INR',
    displayPrice: '₹0',
    prices: {
      INR: { amountMinor: 0, displayPrice: '₹0' },
      USD: { amountMinor: 0, displayPrice: '$0' },
    },
    credits: FREE_SIGNUP_CREDITS,
    durationDays: 0,
    isPro: false,
    isLifetime: false,
    cadenceLabel: 'Free Forever',
    billingType: 'one_time',
    features: [
      `${FREE_SIGNUP_CREDITS} lifetime AI credits (no weekly refill)`,
      "2 free ATS templates: Jake's Resume + Awesome CV",
      `Up to ${FREE_MAX_RESUMES} active resumes at once`,
      `Up to ${FREE_MAX_APPLICATIONS} job applications tracked`,
      'Unlimited manual editing & watermark-free PDF/DOCX exports',
      'Public recruiter share links',
      'Zero model training privacy guarantee',
    ],
  },
  pro_weekly: {
    id: 'pro_weekly',
    name: 'HypeResume Pro — 1 Week Pass',
    tagline: 'Full Pro for an urgent interview sprint — 75 AI credits this week',
    amountMinor: 14900, // ₹149 (Tier 2/3 default)
    currency: 'INR',
    displayPrice: '₹149',
    prices: {
      INR: { amountMinor: 14900, displayPrice: '₹149' },
      USD: { amountMinor: 799, displayPrice: '$7.99' }, // Tier 1
    },
    credits: PRO_WEEKLY_CREDITS,
    durationDays: 7,
    isPro: true,
    isLifetime: false,
    cadenceLabel: '7-day Pro access · One-time pass',
    billingType: 'one_time',
    badge: 'Try 1 Week',
    features: [
      '7 days of HypeResume Pro access',
      `${PRO_WEEKLY_CREDITS} AI credits for the week`,
      'No automatic renewal or surprise rebilling',
      ...PRO_SHARED_FEATURES.slice(1, 4),
    ],
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'HypeResume Pro — 1 Month',
    tagline: 'Flexible full-month job search pass with 75 AI credits every week',
    amountMinor: 39900, // ₹399
    currency: 'INR',
    displayPrice: '₹399',
    prices: {
      INR: { amountMinor: 39900, displayPrice: '₹399', effectiveMonthly: '₹399/mo' },
      USD: { amountMinor: 1499, displayPrice: '$14.99', effectiveMonthly: '$14.99/mo' }, // Tier 1
    },
    credits: PRO_WEEKLY_CREDITS,
    durationDays: 30,
    isPro: true,
    isLifetime: false,
    cadenceLabel: '30-day Pro access · Pay as you go',
    billingType: 'one_time',
    badge: 'Most Flexible',
    features: [
      '30 days of HypeResume Pro access',
      `${PRO_WEEKLY_CREDITS} AI credits refilled every week`,
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
    credits: PRO_WEEKLY_CREDITS,
    durationDays: 180,
    isPro: true,
    isLifetime: false,
    isHidden: true,
    cadenceLabel: '6 months Pro access · Save 50%',
    billingType: 'one_time',
    badge: 'Save 50%',
    features: [
      '180 days of HypeResume Pro access (just ₹200/month)',
      `${PRO_WEEKLY_CREDITS} AI credits refilled every week`,
      ...PRO_SHARED_FEATURES,
    ],
  },
  pro_lifetime: {
    id: 'pro_lifetime',
    name: 'HypeResume Pro — Founding Lifetime',
    tagline: 'Pay once, keep Pro forever — 75 AI credits every week for life',
    amountMinor: 99900, // ₹999
    currency: 'INR',
    displayPrice: '₹999',
    prices: {
      INR: { amountMinor: 99900, displayPrice: '₹999' },
      USD: { amountMinor: 2499, displayPrice: '$24.99' }, // Tier 1
    },
    credits: PRO_WEEKLY_CREDITS,
    durationDays: null,
    isPro: true,
    isLifetime: true,
    isPromoOffer: true,
    cadenceLabel: 'Lifetime Pro access · Limited Founding Seats',
    billingType: 'one_time',
    badge: 'Founding Launch Offer',
    features: [
      'Permanent Lifetime access to all HypeResume Pro tools & future templates',
      `${PRO_WEEKLY_CREDITS} AI credits refilled every week — forever`,
      'Cheaper than 6 months during Founding Cohort',
      ...PRO_SHARED_FEATURES,
    ],
  },
  /** Kept hidden so any completed smoke purchases still resolve plan metadata */
  live_smoke_50: {
    id: 'live_smoke_50',
    name: 'Live Payment Smoke Test',
    tagline: '₹50 one-time charge to verify live Dodo Payments end-to-end',
    amountMinor: 5000, // ₹50
    currency: 'INR',
    displayPrice: '₹50',
    prices: {
      INR: { amountMinor: 5000, displayPrice: '₹50' },
      USD: { amountMinor: 59, displayPrice: '$0.59' },
    },
    credits: 5,
    durationDays: 1,
    isPro: true,
    isLifetime: false,
    isHidden: true,
    cadenceLabel: '1-day Pro smoke pass · Live gateway only',
    billingType: 'one_time',
    badge: '₹50 Live Test',
    features: [
      'Temporary 1-day Pro unlock for live payment verification',
      '5 AI credits included',
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

export function getPublicPricingPlans(): PlanConfig[] {
  return Object.values(PRICING_PLANS).filter((p) => !p.isHidden && p.id !== 'free_tier');
}
