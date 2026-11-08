'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ScoreMeterProps {
  score: number;
  className?: string;
  textColor?: string;
  variant?: 'light' | 'dark' | 'auto';
  animate?: boolean;
}

export function ScoreMeter({
  score,
  className = '',
  textColor,
  variant = 'auto',
  animate = true,
}: ScoreMeterProps) {
  const targetScore = Math.max(0, Math.min(100, Math.round(score)));
  const [displayScore, setDisplayScore] = useState<number>(animate ? 0 : targetScore);
  const currentScoreRef = useRef<number>(displayScore);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(targetScore);
      currentScoreRef.current = targetScore;
      return;
    }

    const startVal = currentScoreRef.current;
    const endVal = targetScore;
    if (startVal === endVal) return;

    let startTime: number | null = null;
    const duration = 1200; // ms smooth count-up

    let animId: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutCubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * ease);
      setDisplayScore(current);
      currentScoreRef.current = current;

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [targetScore, animate]);

  // Meter arc geometry:
  // Semi-circle arc from 180° to 360° (left to right)
  // Radius = 66, Center = (90, 80)
  const radius = 66;
  const strokeWidth = 9;
  const arcLength = Math.PI * radius; // ~207.35
  const strokeDashoffset = arcLength - (displayScore / 100) * arcLength;

  // Angle for indicator dot (180 deg = 0%, 360 deg = 100%)
  const angleDeg = 180 + (displayScore / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;
  const dotX = 90 + radius * Math.cos(angleRad);
  const dotY = 80 + radius * Math.sin(angleRad);

  const getStatus = (val: number) => {
    if (variant === 'dark') {
      if (val >= 85) return { label: 'High Alignment', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      if (val >= 70) return { label: 'Solid Evidence', badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      if (val >= 50) return { label: 'Needs Metrics', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      return { label: 'Incomplete Sections', badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
    if (val >= 85) return { label: 'High Alignment', badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
    if (val >= 70) return { label: 'Solid Evidence', badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
    if (val >= 50) return { label: 'Needs Metrics', badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
    return { label: 'Incomplete Sections', badgeClass: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700' };
  };

  const status = getStatus(displayScore);

  const resolvedNumberColor = textColor
    ? textColor
    : variant === 'dark'
    ? 'text-white'
    : 'text-zinc-900 dark:text-zinc-100';

  const resolvedTrackColor = variant === 'dark'
    ? 'text-zinc-800'
    : 'text-zinc-200 dark:text-zinc-800';

  const resolvedSubtextColor = variant === 'dark'
    ? 'text-zinc-400'
    : 'text-zinc-500 dark:text-zinc-400';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="relative w-[180px] h-[95px]">
        <svg viewBox="0 0 180 95" className="w-full h-full overflow-visible">
          {/* Background Track Arc */}
          <path
            d="M 24 80 A 66 66 0 0 1 156 80"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={resolvedTrackColor}
          />

          {/* Active Value Arc */}
          <path
            d="M 24 80 A 66 66 0 0 1 156 80"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-blue-500 transition-all duration-75 ease-out"
          />

          {/* Indicator Dot on the Arc */}
          <circle
            cx={dotX}
            cy={dotY}
            r={5}
            className="fill-white dark:fill-zinc-950 stroke-[2.5] stroke-blue-500 transition-all duration-75 ease-out"
          />
        </svg>

        {/* Score Number in Center of Arch */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-extrabold font-mono tracking-tight leading-none ${resolvedNumberColor}`}>
            {displayScore}
          </span>
          <span className={`text-[11px] font-medium mt-1 ${resolvedSubtextColor}`}>
            out of 100
          </span>
        </div>
      </div>

      {/* Status Rating Label */}
      <div className="mt-3 text-center">
        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${status.badgeClass}`}>
          {status.label}
        </span>
      </div>

      {/* Range Limits (0 and 100) */}
      <div className={`w-full flex justify-between px-4 text-[10px] font-mono mt-1 ${variant === 'dark' ? 'text-zinc-500' : 'text-zinc-400 dark:text-zinc-500'}`}>
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}
