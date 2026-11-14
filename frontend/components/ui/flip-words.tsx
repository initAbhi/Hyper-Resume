'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

/** Shared ease — soft decelerate so width + slide feel intentional, not snappy */
const EASE = [0.22, 1, 0.36, 1] as const;
const WIDTH_MS = 0.72;
const SLIDE_MS = 0.78;

/**
 * Smooth vertical flip: current word slides up, next rises from below.
 * Invisible sizer uses the *active* word so trailing text reflows with width.
 */
export function FlipWords({
  words,
  duration = 3400,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const currentWord = words[index] ?? '';

  useEffect(() => {
    if (words.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, duration);
    return () => window.clearInterval(id);
  }, [words, duration]);

  return (
    <motion.span
      layout
      transition={{ duration: WIDTH_MS, ease: EASE }}
      className="relative inline-grid overflow-hidden align-baseline"
    >
      {/* Width tracks the active word only — not the longest */}
      <span
        className="invisible col-start-1 row-start-1 whitespace-nowrap font-semibold"
        aria-hidden
      >
        {currentWord}
      </span>
      <span className="absolute inset-0 overflow-hidden">
        {/* Overlap exit↑ + enter↑ so the slot never blanks mid-swap */}
        <AnimatePresence initial={false}>
          <motion.span
            key={currentWord}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: SLIDE_MS, ease: EASE }}
            className={cn(
              'absolute left-0 top-0 whitespace-nowrap bg-gradient-to-r from-violet-200 via-white to-violet-300 bg-clip-text font-semibold text-transparent',
              className,
            )}
          >
            {currentWord}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.span>
  );
}
