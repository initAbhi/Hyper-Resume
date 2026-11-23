'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { apiClient, PromoStatus } from '@/lib/api-client';
import { StickyBanner } from '@/components/ui/sticky-banner';

const DISMISS_KEY = 'hr_founding_promo_dismissed';

export function FoundingSalesBanner() {
  const pathname = usePathname();
  const [promo, setPromo] = useState<PromoStatus | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage?.getItem(DISMISS_KEY) === '1') {
        setIsDismissed(true);
        return;
      }
    } catch {
      // Ignore storage failures
    }

    let mounted = true;
    apiClient
      .getPromoStatus()
      .then((data) => {
        if (mounted) setPromo(data);
      })
      .catch(() => {
        // Hide banner silently if API is unreachable
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (
    isDismissed ||
    !promo ||
    !promo.enabled ||
    promo.isSoldOut ||
    pathname?.startsWith('/app') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/r/')
  ) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      window.sessionStorage?.setItem(DISMISS_KEY, '1');
    } catch {
      // Ignore storage failures
    }
  };

  const remaining = promo.remainingSeats;
  const usdLabel =
    typeof promo.priceUsd === 'number'
      ? Number.isInteger(promo.priceUsd)
        ? `$${promo.priceUsd}`
        : `$${promo.priceUsd.toFixed(2)}`
      : '$24.99';
  const headline =
    promo.bannerText ||
    `Founding Lifetime Pro — ₹${promo.priceInr || 999} (${usdLabel}) one-time`;

  return (
    <StickyBanner
      hideOnScroll={false}
      onClose={handleDismiss}
      className="bg-gradient-to-r from-[#1e3a8a] via-[#285FEA] to-[#4f46e5] text-white shadow-[0_8px_24px_rgba(40,95,234,0.28)]"
    >
      {/* Whole banner text links to pricing; Claim CTA only on sm+ so mobile stays one line */}
      <Link
        href="/pricing?plan=pro_lifetime"
        className="flex min-w-0 items-center justify-center gap-2 text-center text-[11px] leading-none text-white/95 sm:text-xs"
      >
        <span className="truncate font-medium">
          {headline}
          <span className="ml-1.5 font-semibold text-white/80">· {remaining} left</span>
        </span>
        <span className="hidden shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1e3a8a] transition hover:bg-blue-50 sm:inline-flex">
          Claim offer
          <ArrowRight className="h-3 w-3" />
        </span>
      </Link>
    </StickyBanner>
  );
}
