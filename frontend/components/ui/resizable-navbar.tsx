'use client';

import { cn } from '@/lib/utils';
import { Menu as IconMenu2, X as IconX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sticky landing navbar — no white borders. Soft frosted pill only after scroll.
 */
export const Navbar = ({ children, className }: NavbarProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sync = () => {
      const y =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setVisible(y > 24);
    };
    const raf = window.requestAnimationFrame(sync);
    window.addEventListener('scroll', sync, { passive: true });
    const id = window.setInterval(sync, 400);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', sync);
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className={cn('sticky inset-x-0 top-0 z-50 w-full', className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, {
              visible,
            })
          : child,
      )}
    </div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <div
      className={cn(
        'relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between gap-4 px-5 py-2.5 transition-all duration-300 lg:flex',
        visible
          ? 'mt-2 rounded-full bg-[#0c0c0e]/85 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl'
          : 'rounded-none bg-transparent shadow-none',
        className,
      )}
    >
      {children}
    </div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        'absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-300 transition duration-200 hover:text-white lg:flex lg:space-x-2',
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2 text-zinc-300"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full bg-white/10"
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <div
      className={cn(
        'relative z-50 mx-auto flex w-full max-w-[calc(100vw-1.5rem)] flex-col items-center justify-between px-3 py-2 transition-all duration-300 lg:hidden',
        visible
          ? 'mt-2 rounded-2xl bg-[#0c0c0e]/90 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl'
          : 'rounded-2xl bg-transparent shadow-none',
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavHeader = ({ children, className }: MobileNavHeaderProps) => {
  return (
    <div className={cn('flex w-full flex-row items-center justify-between gap-2', className)}>
      {children}
    </div>
  );
};

export const MobileNavMenu = ({ children, className, isOpen, onClose }: MobileNavMenuProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className={cn(
              'fixed inset-x-3 top-[4.5rem] z-[80] flex max-h-[min(28rem,calc(100dvh-5.5rem))] flex-col items-stretch gap-1 overflow-y-auto rounded-2xl border border-white/10 bg-[#0c0c0e] px-3 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.65)] lg:hidden',
              className,
            )}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      className="relative z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
    >
      {isOpen ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
    </button>
  );
};

export const NavbarButton = ({
  href,
  children,
  className,
  variant = 'primary',
  ...props
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'dark' | 'gradient';
} & Omit<React.ComponentPropsWithoutRef<'a'>, 'href'>) => {
  const baseStyles =
    'px-4 py-2 rounded-full text-sm font-semibold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-flex items-center justify-center text-center';

  const variantStyles = {
    primary:
      'bg-white text-zinc-950 shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:bg-zinc-100',
    secondary: 'bg-white/[0.08] text-white shadow-none hover:bg-white/[0.14]',
    dark: 'bg-zinc-950 text-white',
    gradient:
      'bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.25)_inset]',
  };

  return (
    <Link href={href || '#'} className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </Link>
  );
};
