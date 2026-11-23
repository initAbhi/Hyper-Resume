'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Lock, Sparkles, X } from 'lucide-react';

interface SamplePaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PREVIEW_CARDS = [
  { company: 'Amazon', badge: 'Hired at Amazon', rotate: '-rotate-6', offset: 'translate-y-3' },
  { company: 'Apple', badge: 'Hired at Apple', rotate: 'rotate-0', offset: 'translate-y-0 scale-105 z-10' },
  { company: 'Meta', badge: 'Hired at Meta', rotate: 'rotate-6', offset: 'translate-y-3' },
] as const;

function AmazonLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 font-bold tracking-tight text-white ${className}`}>
      <span className="text-[13px] lowercase">amazon</span>
      <svg className="h-2.5 w-4 text-[#FF9900]" viewBox="0 0 24 12" fill="none" aria-hidden>
        <path
          d="M2 6c5.5 4.5 14.5 4.5 20 0"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M18.5 4.5L22 6.5l-3.5 2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function TeslaLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2C8.2 2.1 5.1 3.2 3 4.5c2.4-.4 5-.6 7.5-.6h3c2.5 0 5.1.2 7.5.6C18.9 3.2 15.8 2.1 12 2zm0 3.2C7.8 5.2 4.5 6 2 7.2v.3C5.4 6.3 8.6 5.8 12 5.8s6.6.5 10 1.7v-.3C19.5 6 16.2 5.2 12 5.2zm0 2.6c-3.2 0-6.1.4-8.8 1.2L12 22l8.8-12.999A24.6 24.6 0 0 0 12 7.8z" />
      </svg>
      <span className="text-[12px] font-semibold tracking-[0.18em] text-white">TESLA</span>
    </span>
  );
}

function MetaLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg className="h-3.5 w-5 text-[#0081FB]" viewBox="0 0 36 24" fill="currentColor" aria-hidden>
        <path d="M24.5 2.5C21.6 2.5 19.6 4.6 18.5 6.1 17.4 4.6 15.4 2.5 12.5 2.5 7.6 2.5 4 6.7 4 12.2c0 5.6 3.9 9.7 8.8 9.7 3.4 0 5.4-2.1 6.6-3.7 1.2 1.6 3.2 3.7 6.6 3.7 4.9 0 8.8-4.1 8.8-9.7 0-5.5-3.6-9.7-8.5-9.7zm-12 16.1c-2.9 0-5.1-2.9-5.1-6.4s2.2-6.4 5.1-6.4c2.7 0 4.9 2.3 5.4 5.8-.5 3.5-2.7 5.8-5.4 5.8zm12 0c-2.7 0-4.9-2.3-5.4-5.8.5-3.5 2.7-5.8 5.4-5.8 2.9 0 5.1 2.9 5.1 6.4s-2.2 6.4-5.1 6.4z" />
      </svg>
      <span className="text-[13px] font-semibold text-white">Meta</span>
    </span>
  );
}

function GoogleLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center font-bold tracking-tight ${className}`} aria-label="Google">
      <span className="text-[#4285F4]">G</span>
      <span className="text-[#EA4335]">o</span>
      <span className="text-[#FBBC05]">o</span>
      <span className="text-[#4285F4]">g</span>
      <span className="text-[#34A853]">l</span>
      <span className="text-[#EA4335]">e</span>
    </span>
  );
}

function AppleLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.7 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.7-2.8-.7-1.4 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1.1 1.6 2.2 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1.1 2.6-2.1.8-1.2 1.1-2.3 1.1-2.4-.1 0-2.1-.8-2.1-3.7zM14.4 6.3c.6-.7 1-1.7.9-2.7-0.9.1-1.9.6-2.5 1.3-.6.6-1.1 1.6-1 2.6 1 .1 1.9-.5 2.6-1.2z" />
      </svg>
      <span className="text-[13px] font-medium text-white">Apple</span>
    </span>
  );
}

function MiniResumeCard({
  badge,
  rotate,
  offset,
}: {
  badge: string;
  rotate: string;
  offset: string;
}) {
  return (
    <div
      className={`relative w-[96px] rounded-xl bg-gradient-to-b from-[#1e2430] to-[#151922] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/10 ${rotate} ${offset}`}
    >
      <span className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white shadow-md shadow-emerald-500/30">
        {badge}
      </span>
      <div className="mb-2 flex items-center gap-1.5">
        <div className="h-5 w-5 rounded-full bg-[#3872FA]/80" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="h-1.5 w-10 rounded-full bg-zinc-400/70" />
          <div className="h-1 w-7 rounded-full bg-zinc-500/50" />
        </div>
      </div>
      <div className="space-y-1 opacity-50">
        <div className="h-1 w-full rounded-full bg-zinc-500" />
        <div className="h-1 w-[92%] rounded-full bg-zinc-600" />
        <div className="h-1 w-full rounded-full bg-zinc-600" />
        <div className="h-1 w-[78%] rounded-full bg-zinc-600" />
        <div className="mt-2 h-1 w-full rounded-full bg-zinc-600" />
        <div className="h-1 w-[88%] rounded-full bg-zinc-600" />
        <div className="h-1 w-[70%] rounded-full bg-zinc-600" />
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-white/[0.02]" />
    </div>
  );
}

export function SamplePaywallModal({ isOpen, onClose }: SamplePaywallModalProps) {
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
      aria-labelledby="sample-paywall-title"
    >
      <button
        type="button"
        aria-label="Close paywall"
        className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-2xl bg-[#0f1218] shadow-[0_32px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
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

        {/* Visual stack */}
        <div className="relative overflow-hidden px-6 pb-2 pt-10">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0f1218] to-transparent" />
          <div className="relative mx-auto flex h-[148px] max-w-[300px] items-end justify-center gap-1.5">
            {PREVIEW_CARDS.map((card) => (
              <MiniResumeCard
                key={card.company}
                badge={card.badge}
                rotate={card.rotate}
                offset={card.offset}
              />
            ))}
          </div>
        </div>

        <div className="relative px-6 pb-7 pt-3 text-center">
          <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#3872FA]/25 bg-[#3872FA]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#93c5fd]">
            <Lock className="h-3 w-3" />
            Pro samples
          </div>

          <h2
            id="sample-paywall-title"
            className="font-rubik text-[1.55rem] font-semibold leading-snug tracking-tight text-white sm:text-[1.7rem]"
          >
            See the resumes that land interviews
          </h2>
          <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-zinc-400">
            Unlock 100+ proven resume samples from applicants who got hired at top companies.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5">
            <AmazonLogo />
            <TeslaLogo />
            <MetaLogo />
            <GoogleLogo className="text-[13px]" />
            <AppleLogo />
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">and 70+ more company-caliber formats</p>

          <Link
            href="/pricing"
            onClick={onClose}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3872FA] text-sm font-semibold text-white shadow-[0_12px_32px_rgba(56,114,250,0.35)] transition hover:bg-[#2f62e0]"
          >
            <Sparkles className="h-4 w-4" />
            Unlock Pro Samples
          </Link>
          <p className="mt-3 text-[11px] text-zinc-500">
            One-time Pro from ₹149 · No auto-renew traps
          </p>
        </div>
      </div>
    </div>
  );
}
