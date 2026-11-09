'use client';

import React from 'react';

export interface GradientTextProps {
  children?: React.ReactNode;
  className?: string;
  colors?: string[]; // array of color strings
  animationSpeed?: string; // duration e.g. '6s'
}

export function GradientText({
  children,
  className = '',
  colors = ['#FFFFFF', '#D946EF', '#8B5CF6', '#38BDF8', '#FFFFFF'],
  animationSpeed = '8s',
}: GradientTextProps) {
  const gradientString = colors.join(', ');

  return (
    <span className={`relative inline-block ${className}`}>
      {/* Background Soft Glow */}
      <span
        className="absolute inset-0 blur-xl opacity-40 select-none pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(90deg, ${gradientString})`,
          backgroundSize: '200% auto',
          animation: `gradient-text-flow ${animationSpeed} linear infinite`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
        aria-hidden="true"
      >
        {children}
      </span>

      {/* Crisp Flowing Text */}
      <span
        className="relative z-10 inline-block font-bold"
        style={{
          backgroundImage: `linear-gradient(90deg, ${gradientString})`,
          backgroundSize: '200% auto',
          animation: `gradient-text-flow ${animationSpeed} linear infinite`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {children}
      </span>
    </span>
  );
}
