'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { logger } from '@/lib/logger';

const pixelLogger = logger.child('MetaPixel');

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '1117348281146781';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

function PixelRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      // Fire PageView on every Next.js client-side route change
      window.fbq('track', 'PageView');
      pixelLogger.debug('Dispatched PageView on route change', { pathname });
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * MetaPixel Component
 * Listens for route transitions and dispatches PageViews
 */
export function MetaPixel() {
  return (
    <Suspense fallback={null}>
      <PixelRouteTracker />
    </Suspense>
  );
}

/**
 * Helper to safely track Meta Pixel standard & custom events anywhere in the app
 */
export function trackMetaEvent(
  eventName:
    | 'PageView'
    | 'ViewContent'
    | 'Search'
    | 'AddToCart'
    | 'InitiateCheckout'
    | 'AddPaymentInfo'
    | 'Purchase'
    | 'Lead'
    | 'CompleteRegistration'
    | 'Contact'
    | 'CustomizeProduct'
    | 'Donate'
    | 'FindLocation'
    | 'Schedule'
    | 'StartTrial'
    | 'SubmitApplication'
    | 'Subscribe',
  options: Record<string, any> = {},
) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', eventName, options);
      pixelLogger.debug(`Tracked event: ${eventName}`, options);
    } catch (e) {
      pixelLogger.warn(`Failed to track event: ${eventName}`, e);
    }
  }
}

export function trackMetaCustomEvent(eventName: string, options: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('trackCustom', eventName, options);
      pixelLogger.debug(`Tracked custom event: ${eventName}`, options);
    } catch (e) {
      pixelLogger.warn(`Failed to track custom event: ${eventName}`, e);
    }
  }
}
