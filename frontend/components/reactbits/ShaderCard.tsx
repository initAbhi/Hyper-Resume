'use client';

import React, { useState } from 'react';

interface ShaderCardProps {
  children: React.ReactNode;
  flameColor?: string;
  className?: string;
}

export function ShaderCard({
  children,
  flameColor = '#5525F5',
  className = '',
}: ShaderCardProps) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`relative group rounded-2xl overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Animated Luminous Flame Backlight (behind the card) */}
      <div
        className="absolute -inset-1 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"
        style={{
          background: `radial-gradient(circle 350px at ${mousePos.x}% ${mousePos.y}%, ${flameColor} 0%, rgba(66,99,255,0.2) 50%, transparent 80%)`,
        }}
      />

      {/* Luminous Animated Rim / Contour Border */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none p-[1.5px] transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, ${flameColor} 50%, rgba(66,99,255,0.3) 100%)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
        }}
      />

      {/* Card Content Surface */}
      <div className="relative z-10 h-full rounded-2xl bg-[#0E101B]/95 backdrop-blur-2xl">
        {children}
      </div>
    </div>
  );
}
