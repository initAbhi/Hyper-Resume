import React from 'react';
import { constructMetadata } from '@/lib/seo';
import { PricingClient } from './PricingClient';

export const metadata = constructMetadata({
  title: 'Transparent Pricing — HypeResume Pro',
  description: 'Simple one-plan Pro pricing with flexible duration options: 1-Week Pass (₹149/$3), Monthly (₹399/$9), 6-Month Pass (₹1,200/$29), or Founding Lifetime Access (₹999/$19). Free tier with unwatermarked PDF export.',
  path: '/pricing',
});

export default function PricingPage() {
  return <PricingClient />;
}
