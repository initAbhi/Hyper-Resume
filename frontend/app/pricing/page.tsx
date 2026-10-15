import React from 'react';
import { constructMetadata } from '@/lib/seo';
import { PricingClient } from './PricingClient';

export const metadata = constructMetadata({
  title: 'Honest Pricing — Pay Only for Real Results',
  description: 'Transparent pricing for Indian job seekers. Free tier for master profiles, one-time packs for active searchers, and pro plans with zero deceptive paywalls.',
  path: '/pricing',
});

export default function PricingPage() {
  return <PricingClient />;
}
