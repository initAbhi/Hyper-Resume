'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { logger } from '@/lib/logger';
import { analytics } from '@/lib/analytics';

const pixelLogger = logger.child('MetaPixel');

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

function PixelRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const queryStr = searchParams?.toString();
    const fullRoute = queryStr ? `${pathname}?${queryStr}` : pathname;

    // Record genuine route transitions into first-party funnel analytics (landing_view / PageView)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      analytics.trackFunnelStep('landing_view', { path: fullRoute });
      return;
    }

    analytics.track('landing_view', { path: fullRoute });

    if (META_PIXEL_ID && typeof window !== 'undefined' && typeof window.fbq === 'function') {
      // Fire PageView on client-side route transitions (initial load already tracked by inline Pixel script)
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
  eventData?: { eventID?: string },
) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      if (eventData?.eventID) {
        window.fbq('track', eventName, options, eventData);
      } else {
        window.fbq('track', eventName, options);
      }
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
