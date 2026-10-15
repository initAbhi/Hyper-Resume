export interface PlanConfig {
  id: string;
  name: string;
  tagline: string;
  amountMinor: number; // in lowest currency denomination (paise / cents)
  currency: string;
  displayPrice: string;
  credits: number;
  billingType: 'one_time' | 'recurring_monthly';
  badge?: string;
  features: string[];
}

export const PRICING_PLANS: Record<string, PlanConfig> = {
  free_tier: {
    id: 'free_tier',
    name: 'Free Starter',
    tagline: 'Explore truthful AI career optimization without upfront cost',
    amountMinor: 0,
    currency: 'INR',
    displayPrice: '₹0',
    credits: 5,
    billingType: 'one_time',
    features: [
      '5 Welcome AI Optimization Credits',
      'Full ATS single-column document editor',
      'Grounded job description matcher',
      'Clean PDF Export with zero watermarks',
      'Zero model training privacy protection',
    ],
  },
  job_hunt_pack: {
    id: 'job_hunt_pack',
    name: 'Job Hunt Pack',
    tagline: 'Ideal for targeted applications to specific dream companies',
    amountMinor: 39900, // ₹399
    currency: 'INR',
    displayPrice: '₹399',
    credits: 30,
    billingType: 'one_time',
    badge: 'Most Popular',
    features: [
      '30 AI Optimization Credits (~15 full job matches)',
      'Grounded STAR / XYZ bullet rewrites',
      'Evidence quote citations & missing keyword radar',
      'Create separate tailored resume variants',
      'Never expires · One-time purchase',
    ],
  },
  job_hunt_pro: {
    id: 'job_hunt_pro',
    name: 'Job Hunt Pro',
    tagline: 'Maximum power for competitive career transitions and senior roles',
    amountMinor: 89900, // ₹899
    currency: 'INR',
    displayPrice: '₹899',
    credits: 100,
    billingType: 'one_time',
    badge: 'Best Value',
    features: [
      '100 AI Optimization Credits (~50 full job matches)',
      'Deep structural ATS compliance audits',
      'Unlimited tailored variants & snapshot versions',
      'Full application pipeline tracking',
      'Complete career data portability (JSON export)',
      'Priority email support',
    ],
  },
};
