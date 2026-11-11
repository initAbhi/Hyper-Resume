'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, ArrowRight, X } from 'lucide-react';
import { apiClient, PromoStatus } from '@/lib/api-client';

const DISMISS_KEY = 'hr_founding_promo_dismissed';

export function FoundingSalesBanner() {
  const pathname = usePathname();
  const [promo, setPromo] = useState<PromoStatus | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

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
        if (mounted) {
          setPromo(data);
        }
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

  return (
    <div
      role="region"
      aria-label="Founding Lifetime Launch Offer"
      className="w-full bg-gradient-to-r from-emerald-950 via-zinc-900 to-violet-950 text-white border-b border-emerald-500/30 text-xs"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-center">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold text-[11px] uppercase tracking-wider shrink-0">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Founding Offer</span>
          </span>
          <p className="font-medium text-zinc-100 leading-snug">
            {promo.bannerText || 'Founding Member Launch: Lifetime HypeResume Pro at ₹999 ($19)'}{' '}
            <span className="font-mono font-bold text-emerald-300 ml-1">
              ({promo.claimedSeats}/{promo.totalCap} claimed · {promo.remainingSeats} left)
            </span>
          </p>
          <Link
            href="/pricing?plan=pro_lifetime"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-zinc-950 hover:bg-emerald-100 font-semibold text-[11px] transition-colors shrink-0"
          >
            <span>Claim ₹999 Lifetime</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss launch offer banner"
          className="text-zinc-400 hover:text-white p-1 rounded transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

