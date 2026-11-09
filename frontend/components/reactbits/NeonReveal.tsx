'use client';

import React, { useEffect, useState } from 'react';

interface NeonRevealProps {
  children?: React.ReactNode;
  tubeColor?: string;
  lightColor?: string;
  direction?: 'down' | 'up';
  delay?: number;
  duration?: number;
  className?: string;
}

export function NeonReveal({
  children,
  tubeColor = '#B163E9',
  lightColor = '#5525F5',
  direction = 'down',
  delay = 100,
  duration = 2000,
  className = '',
}: NeonRevealProps) {
  const [isLit, setIsLit] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLit(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* The Neon Glass Tube (Top or Bottom) */}
      <div 
        className={`absolute left-1/2 -translate-x-1/2 z-20 transition-all ease-out pointer-events-none ${
          direction === 'down' ? 'top-0' : 'bottom-0'
        }`}
        style={{
          width: isLit ? '86%' : '0%',
          maxWidth: '900px',
          height: '2px',
          transitionDuration: `${duration}ms`,
          background: `linear-gradient(90deg, transparent 0%, #FFFFFF 20%, ${tubeColor} 50%, #FFFFFF 80%, transparent 100%)`,
          boxShadow: isLit 
            ? `0 0 12px 2px #FFFFFF, 0 0 24px 6px ${tubeColor}, 0 0 48px 12px ${lightColor}`
            : 'none',
          opacity: isLit ? 1 : 0,
        }}
      />

      {/* Volumetric Downward Light Flood (Conical / Radial Glow) */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-1000 z-10 ${
          direction === 'down' ? 'top-0' : 'bottom-0'
        }`}
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: '420px',
          opacity: isLit ? 0.35 : 0,
          background: direction === 'down'
            ? `radial-gradient(ellipse 80% 60% at 50% 0%, ${lightColor} 0%, rgba(85,37,245,0.15) 45%, transparent 75%)`
            : `radial-gradient(ellipse 80% 60% at 50% 100%, ${lightColor} 0%, rgba(85,37,245,0.15) 45%, transparent 75%)`,
          filter: 'blur(30px)',
        }}
      />

      {/* Subtle Dust/Energy Particles or Ambient Glow beneath tube */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 -top-1 w-3/4 max-w-[700px] h-12 pointer-events-none z-10 transition-opacity duration-700"
        style={{
          opacity: isLit ? 0.6 : 0,
          background: `radial-gradient(ellipse at 50% 0%, ${tubeColor} 0%, transparent 70%)`,
          filter: 'blur(10px)',
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
