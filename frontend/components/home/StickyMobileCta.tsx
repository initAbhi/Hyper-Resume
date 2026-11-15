'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/** Persistent primary CTA for Meta / mobile traffic after leaving the hero. */
export function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0a0a0a]/92 px-4 py-3 backdrop-blur-xl transition-transform duration-300 sm:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <Link
        href="/register"
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-zinc-950"
      >
        Build My Resume
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
