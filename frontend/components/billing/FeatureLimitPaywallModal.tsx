'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Crown, FileText, Lock, Sparkles, X } from 'lucide-react';

export type FeatureLimitKind = 'resumes' | 'applications' | 'writing_fixes';

interface FeatureLimitPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  kind: FeatureLimitKind;
  limit?: number;
  current?: number;
}

const COPY: Record<
  FeatureLimitKind,
  {
    badge: string;
    title: string;
    body: (limit: number) => string;
    Icon: typeof FileText;
  }
> = {
  resumes: {
    badge: 'Resume limit',
    title: 'Upgrade for unlimited resumes',
    body: (limit) =>
      `Free Starter includes up to ${limit} active resumes. Archive one or upgrade to Pro for unlimited versions, premium templates, and 75 AI credits every week.`,
    Icon: FileText,
  },
  applications: {
    badge: 'Tracker limit',
    title: 'Upgrade for unlimited tracking',
    body: (limit) =>
      `Free Starter tracks up to ${limit} job applications. Upgrade to Pro for unlimited pipeline tracking plus premium templates and weekly AI credits.`,
    Icon: Briefcase,
  },
  writing_fixes: {
    badge: 'Writing fixes',
    title: 'Unlock one-click writing fixes',
    body: () =>
      'Free Starter shows every writing issue so you can edit manually. Upgrade to Pro to reveal AI corrections and apply fixes instantly — plus premium templates and 75 AI credits every week.',
    Icon: Sparkles,
  },
};

export function FeatureLimitPaywallModal({
  isOpen,
  onClose,
  kind,
  limit,
  current,
}: FeatureLimitPaywallModalProps) {
  const copy = COPY[kind];
  const Icon = copy.Icon;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feature-limit-paywall-title"
    >
      <button
        type="button"
        aria-label="Close paywall"
        className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-2xl bg-[#0f1218] shadow-[0_32px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-36"
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 50% 0%, rgba(56,114,250,0.22), transparent 70%)',
          }}
          aria-hidden
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative px-6 pb-7 pt-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3872FA]/15 ring-1 ring-[#3872FA]/30">
            <Crown className="h-7 w-7 text-[#93c5fd]" />
          </div>

          <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
            <Lock className="h-3 w-3" />
            {copy.badge}
            {typeof current === 'number' && typeof limit === 'number' ? ` · ${current}/${limit}` : ''}
          </div>

          <h2
            id="feature-limit-paywall-title"
            className="font-rubik text-[1.45rem] font-semibold leading-snug tracking-tight text-white sm:text-[1.6rem]"
          >
            {copy.title}
          </h2>
          <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-zinc-400">
            {copy.body(limit ?? 0)}
          </p>

          <div className="mx-auto mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <Icon className="h-3.5 w-3.5" />
            <span>
              {kind === 'writing_fixes' ? 'Pro unlocks instant Apply Fix' : 'Pro unlocks this limit instantly'}
            </span>
          </div>

          <Link
            href="/pricing"
            onClick={onClose}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3872FA] text-sm font-semibold text-white shadow-[0_12px_32px_rgba(56,114,250,0.35)] transition hover:bg-[#2f62e0]"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade to Pro
          </Link>
          <p className="mt-3 text-[11px] text-zinc-500">
            One-time Pro from ₹149 · No auto-renew traps
          </p>
        </div>
      </div>
    </div>
  );
}
