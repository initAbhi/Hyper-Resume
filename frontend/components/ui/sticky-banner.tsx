'use client';

import React, { SVGProps, useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { cn } from '@/lib/utils';

export const StickyBanner = ({
  className,
  children,
  hideOnScroll = false,
  onClose,
}: {
  className?: string;
  children: React.ReactNode;
  hideOnScroll?: boolean;
  onClose?: () => void;
}) => {
  const [open, setOpen] = useState(true);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (hideOnScroll && latest > 40) {
      setOpen(false);
    } else if (hideOnScroll) {
      setOpen(true);
    }
  });

  if (!open) return null;

  return (
    <motion.div
      className={cn(
        'sticky inset-x-0 top-0 z-[60] flex h-9 w-full items-center justify-center px-3 sm:h-10 sm:px-4',
        className,
      )}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="flex w-full max-w-6xl items-center justify-center overflow-hidden pr-7 sm:pr-10">
        {children}
      </div>

      <motion.button
        type="button"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        aria-label="Dismiss banner"
        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1 text-white/80 transition hover:bg-white/10 hover:text-white sm:right-3"
        onClick={() => {
          setOpen(false);
          onClose?.();
        }}
      >
        <CloseIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </motion.button>
    </motion.div>
  );
};

const CloseIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  );
};
