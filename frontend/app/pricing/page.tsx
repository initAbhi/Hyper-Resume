import React from 'react';
import { constructMetadata } from '@/lib/seo';
import { PricingClient } from './PricingClient';

export const metadata = constructMetadata({
  title: 'Transparent Pricing — Built for Serious Candidates',
  description: 'Predictable, credit-based pricing for active job seekers. Free tier for master profiles, one-time packs, and pro plans with full PDF export access.',
  path: '/pricing',
});

export default function PricingPage() {
  return <PricingClient />;
}
