'use client';

import React, { Suspense } from 'react';
import LinkedInOptimizerStudio from '@/components/linkedin/LinkedInOptimizerStudio';

export default function LinkedInStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto py-16 text-center text-xs text-[#5A6270] dark:text-[#9EA7B4]">
          Loading LinkedIn Profile Studio...
        </div>
      }
    >
      <LinkedInOptimizerStudio />
    </Suspense>
  );
}

