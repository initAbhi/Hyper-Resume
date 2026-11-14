'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';

export type HoverEffectItem = {
  title: string;
  description: string;
  link: string;
  meta?: string;
  icon?: React.ReactNode;
};

/**
 * Aceternity hover spotlight grid — no hairline borders; tonal surfaces + violet glow.
 */
export function HoverEffect({
  items,
  className,
}: {
  items: HoverEffectItem[];
  className?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4', className)}>
      {items.map((item, idx) => (
        <Link
          href={item.link}
          key={item.link + item.title}
          className="group relative block h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute -inset-px block h-[calc(100%+2px)] w-[calc(100%+2px)] rounded-2xl bg-gradient-to-b from-violet-500/35 via-violet-500/10 to-transparent"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.18 } }}
                exit={{ opacity: 0, transition: { duration: 0.12, delay: 0.04 } }}
              />
            )}
          </AnimatePresence>
          <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-300 group-hover:from-white/[0.1] group-hover:to-violet-500/[0.06] sm:p-5">
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl transition group-hover:bg-violet-400/20"
              aria-hidden
            />
            <div className="relative flex items-start justify-between gap-2">
              {item.icon ? (
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200 shadow-[0_0_24px_rgba(124,92,255,0.25)]">
                  {item.icon}
                </span>
              ) : null}
              {item.meta ? (
                <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  {item.meta}
                </span>
              ) : null}
            </div>
            <h3 className="relative mt-4 text-sm font-semibold text-white sm:text-base">{item.title}</h3>
            <p className="relative mt-1.5 flex-1 text-[11px] leading-relaxed text-zinc-500 sm:text-xs">
              {item.description}
            </p>
            <span className="relative mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-violet-300/80 transition group-hover:text-violet-200">
              View formats
              <span className="transition group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
