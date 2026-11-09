'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
  borderGlowColor?: string;
}

export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(139, 92, 246, 0.16)', // Violet glow
  spotlightSize = 340,
  borderGlowColor = 'rgba(168, 85, 247, 0.45)',
  style,
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl bg-[#0D0F18]/90 overflow-hidden transition-all duration-300 ${className}`}
      style={{
        ...style,
      }}
      {...props}
    >
      {/* 1. Dynamic Cursor Spotlight Fill (Soft inner illumination) */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
        style={{
          opacity,
          background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
        aria-hidden="true"
      />

      {/* 2. Dynamic Specular Border Glow (Border ONLY lights up under cursor) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-20"
        style={{
          opacity,
          padding: '1px',
          background: `radial-gradient(${spotlightSize * 0.75}px circle at ${position.x}px ${position.y}px, ${borderGlowColor}, transparent 70%)`,
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
        aria-hidden="true"
      />

      {/* 3. Subtle Static Top Specular Sheen (Subtle natural light from above) */}
      <div 
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent z-10"
        aria-hidden="true"
      />

      {/* 4. Child Content */}
      <div className="relative z-30 h-full w-full">
        {children}
      </div>
    </div>
  );
}
