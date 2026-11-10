'use client';

import React, { Suspense } from 'react';
import CoverLetterStudioClient from '@/components/cover-letters/CoverLetterStudioClient';

export default function CoverLettersPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto py-16 text-center text-xs text-zinc-500">
          Loading Cover Letter Studio...
        </div>
      }
    >
      <CoverLetterStudioClient />
    </Suspense>
  );
}

