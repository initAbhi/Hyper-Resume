'use client';

import React from 'react';

export interface NeonRevealProps {
  children?: React.ReactNode;
  className?: string;
  neonColor?: string; // Hex or rgba
  glowIntensity?: number; // 0 to 1
  beamHeight?: number; // Height of light cone in px
  tubeWidth?: string; // Width of neon tube (e.g. '85%', 'full')
  revealDelay?: number;
}

export function NeonReveal({
  children,
  className = '',
  neonColor = '#D946EF',
  glowIntensity = 0.85,
  beamHeight = 420,
  tubeWidth = '80%',
}: NeonRevealProps) {
  return (
    <div className={`relative w-full flex flex-col items-center overflow-hidden ${className}`}>
      
      {/* ========================================================
          1. NEON TUBE (Horizontal glowing light source)
      ======================================================== */}
      <div 
        className="relative z-20 flex items-center justify-center pointer-events-none"
        style={{ width: tubeWidth }}
      >
        {/* Core High-Intensity Tube */}
        <div 
          className="w-full h-[2.5px] rounded-full bg-gradient-to-r from-transparent via-white to-transparent"
          style={{
            boxShadow: `
              0 0 10px 2px rgba(255, 255, 255, 0.9),
              0 0 20px 4px ${neonColor},
              0 0 45px 12px rgba(139, 92, 246, ${glowIntensity * 0.75}),
              0 0 90px 25px rgba(85, 37, 245, ${glowIntensity * 0.45})
            `
          }}
        />

        {/* Ambient Tube Halo */}
        <div 
          className="absolute inset-x-0 -top-3 h-7 rounded-full blur-md pointer-events-none opacity-90"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${neonColor} 50%, transparent 100%)`
          }}
        />
      </div>

      {/* ========================================================
          2. ATMOSPHERIC DOWNWARD LIGHT CONE (Stage Spotlight)
      ======================================================== */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl pointer-events-none z-10 transition-opacity duration-1000"
        style={{ height: `${beamHeight}px` }}
      >
        {/* Trapezoidal Volumetric Beam */}
        <div 
          className="w-full h-full opacity-70"
          style={{
            clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)',
            background: `linear-gradient(180deg, 
              rgba(217, 70, 239, 0.28) 0%, 
              rgba(139, 92, 246, 0.15) 35%, 
              rgba(66, 99, 255, 0.05) 70%, 
              transparent 100%)`,
            filter: 'blur(36px)',
          }}
        />

        {/* Secondary Soft Radial Focus */}
        <div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[70%] h-48 rounded-full blur-3xl pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, rgba(217, 70, 239, 0.3) 0%, rgba(139, 92, 246, 0.15) 50%, transparent 80%)`
          }}
        />
      </div>

      {/* ========================================================
          3. REVEALED CONTENT (Bathed in neon light)
      ======================================================== */}
      <div className="relative z-20 w-full pt-8 sm:pt-12">
        {children}
      </div>

    </div>
  );
}
