'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to client-side diagnostics if needed
    console.error('Frontend ErrorBoundary caught error:', error);
  }, [error]);

  return (
    <div className="flex flex-1 min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md w-full flex flex-col gap-6 text-center">
        <Alert variant="destructive" title="An error occurred">
          {error.message || 'An unexpected application error occurred.'}
        </Alert>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
          <Button variant="primary" onClick={() => reset()}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
