import React, { Suspense } from 'react';
import { constructMetadata } from '@/lib/seo';
import { PricingClient } from './PricingClient';

export const metadata = constructMetadata({
  title: 'Transparent Pricing — HypeResume Pro',
  description: 'Simple one-plan Pro pricing with regional rates: 1-Week Pass (₹149 / $7.99), Monthly (₹399 / $14.99), or Founding Lifetime (₹999 / $24.99). Free tier with unwatermarked PDF export.',
  path: '/pricing',
});

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-zinc-500">
          Loading pricing plans...
        </div>
      }
    >
      <PricingClient />
    </Suspense>
  );
}
