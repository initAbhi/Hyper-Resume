'use client';

import React from 'react';

export interface StarBorderProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  speed?: string; // animation duration e.g. '4s'
  glowColor?: string;
}

export function StarBorder({
  children,
  className = '',
  speed = '4s',
  glowColor = '#D946EF',
  style,
  ...props
}: StarBorderProps) {
  return (
    <button
      className={`relative inline-flex items-center justify-center p-[1.5px] overflow-hidden rounded-xl group select-none cursor-pointer focus:outline-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${className}`}
      style={style}
      {...props}
    >
      {/* 1. Rotating Laser Beam / Star Trail */}
      <span
        className="absolute -inset-[150%] pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `conic-gradient(from 0deg, transparent 0%, transparent 70%, #5525F5 80%, ${glowColor} 92%, #FFFFFF 98%, transparent 100%)`,
          animation: `star-border-spin ${speed} linear infinite`,
        }}
        aria-hidden="true"
      />

      {/* 2. Soft Outer Glow on Hover */}
      <span 
        className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-60 transition-opacity duration-300 blur-md -z-10"
        style={{ background: glowColor }}
        aria-hidden="true"
      />

      {/* 3. Inner Surface Card */}
      <span className="relative z-10 flex items-center justify-center w-full h-full px-6 py-3 rounded-[11px] bg-[#0E101D] text-white font-semibold text-sm transition-colors duration-200 group-hover:bg-[#141728] shadow-inner">
        {children}
      </span>
    </button>
  );
}
