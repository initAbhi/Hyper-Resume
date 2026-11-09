'use client';

import React from 'react';

interface DappledLightProps {
  className?: string;
  color?: string;
  opacity?: number;
}

export function DappledLight({
  className = '',
  color = '#8B5CF6',
  opacity = 0.35,
}: DappledLightProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Primary Ambient Light Beam */}
      <div
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[120px] transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at center, ${color} 0%, rgba(139, 92, 246, 0.15) 50%, transparent 75%)`,
          opacity,
        }}
      />

      {/* Swaying Foliage / Dappled Shadow Masks */}
      <div 
        className="absolute top-0 inset-x-0 h-[480px] opacity-40 mix-blend-soft-light"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 30%, transparent 25px, rgba(0,0,0,0.85) 60px, transparent 120px),
            radial-gradient(circle at 65% 20%, transparent 35px, rgba(0,0,0,0.9) 70px, transparent 140px),
            radial-gradient(circle at 45% 60%, transparent 20px, rgba(0,0,0,0.8) 50px, transparent 100px),
            radial-gradient(circle at 80% 50%, transparent 30px, rgba(0,0,0,0.85) 65px, transparent 130px)
          `,
          filter: 'blur(32px)',
        }}
      />

      {/* Secondary Soft Vignette */}
      <div
        className="absolute top-1/4 right-[5%] w-[500px] h-[400px] rounded-full blur-[140px] opacity-20"
        style={{
          background: 'radial-gradient(circle, #D946EF 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
