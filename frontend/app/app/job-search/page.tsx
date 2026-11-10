'use client';

import React, { Suspense } from 'react';
import LiveJobDiscoveryClient from '@/components/job-search/LiveJobDiscoveryClient';

export default function LiveJobDiscoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto py-16 text-center text-xs text-[#5A6270] dark:text-[#9EA7B4]">
          Loading Live Job Board Discovery...
        </div>
      }
    >
      <LiveJobDiscoveryClient />
    </Suspense>
  );
}
