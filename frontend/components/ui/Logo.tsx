'use client';

import React from 'react';
import Image from 'next/image';

export interface LogoProps {
  variant?: 'full' | 'icon' | 'text' | 'banner';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  priority?: boolean;
}

const sizeConfig = {
  sm: {
    iconSize: 26,
    textSize: 'text-base font-extrabold tracking-tight',
    gap: 'gap-2',
  },
  md: {
    iconSize: 32,
    textSize: 'text-xl font-extrabold tracking-tight',
    gap: 'gap-2.5',
  },
  lg: {
    iconSize: 38,
    textSize: 'text-2xl font-black tracking-tight',
    gap: 'gap-3',
  },
  xl: {
    iconSize: 48,
    textSize: 'text-3xl font-black tracking-tight',
    gap: 'gap-3.5',
  },
};

export function Logo({
  variant = 'full',
  size = 'md',
  className = '',
  priority = true,
}: LogoProps) {
  const cfg = sizeConfig[size] || sizeConfig.md;

  // Banner / Full Image Logo
  if (variant === 'banner') {
    return (
      <div className={`relative inline-flex items-center shrink-0 ${className}`}>
        <Image
          src="/logos/logo-full.png"
          alt="HypeResume Logo"
          width={cfg.iconSize * 3.5}
          height={cfg.iconSize}
          priority={priority}
          className="object-contain h-auto max-w-full"
        />
      </div>
    );
  }

  // Icon only
  if (variant === 'icon') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <Image
          src="/logos/logo-icon.png"
          alt="HypeResume Logo"
          width={cfg.iconSize}
          height={cfg.iconSize}
          priority={priority}
          style={{ width: `${cfg.iconSize}px`, height: `${cfg.iconSize}px` }}
          className="object-contain"
        />
      </div>
    );
  }

  // Pure HTML Typography Wordmark (sharp, crisp, accessible)
  const Wordmark = () => (
    <span className={`tracking-tight select-none font-sans leading-none flex items-center ${cfg.textSize}`}>
      <span className="text-[#1A1D23] dark:text-[#F0F2F5]">Hype</span>
      <span className="text-[#285FEA]">Resume</span>
    </span>
  );

  // Text only
  if (variant === 'text') {
    return (
      <div className={`relative inline-flex items-center shrink-0 ${className}`}>
        <Wordmark />
      </div>
    );
  }

  // Full brand (Official Icon + Pure HTML Wordmark)
  return (
    <div className={`inline-flex items-center ${cfg.gap} select-none shrink-0 ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center">
        <Image
          src="/logos/logo-icon.png"
          alt="HypeResume Icon"
          width={cfg.iconSize}
          height={cfg.iconSize}
          priority={priority}
          style={{ width: `${cfg.iconSize}px`, height: `${cfg.iconSize}px` }}
          className="object-contain"
        />
      </div>
      <Wordmark />
    </div>
  );
}

export default Logo;
