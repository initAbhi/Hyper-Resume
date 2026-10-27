'use client';

import React from 'react';

interface ScoreMeterProps {
  score: number;
  className?: string;
}

export function ScoreMeter({ score, className = '' }: ScoreMeterProps) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));

  // Meter arc geometry:
  // Semi-circle arc from 180° to 360° (left to right)
  // Radius = 66, Center = (90, 80)
  const radius = 66;
  const strokeWidth = 9;
  const arcLength = Math.PI * radius; // ~207.35
  const strokeDashoffset = arcLength - (safeScore / 100) * arcLength;

  // Angle for indicator dot (180 deg = 0%, 360 deg = 100%)
  const angleDeg = 180 + (safeScore / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;
  const dotX = 90 + radius * Math.cos(angleRad);
  const dotY = 80 + radius * Math.sin(angleRad);

  const getStatus = (val: number) => {
    if (val >= 85) return { label: 'High Alignment', badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
    if (val >= 70) return { label: 'Solid Evidence', badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
    if (val >= 50) return { label: 'Needs Metrics', badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
    return { label: 'Incomplete Sections', badgeClass: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700' };
  };

  const status = getStatus(safeScore);

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
            className="text-zinc-200 dark:text-zinc-800"
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
            className="text-blue-600 dark:text-blue-500 transition-all duration-700 ease-out"
          />

          {/* Indicator Dot on the Arc */}
          <circle
            cx={dotX}
            cy={dotY}
            r={5}
            className="fill-white dark:fill-zinc-950 stroke-[2.5] stroke-blue-600 dark:stroke-blue-400 transition-all duration-700 ease-out"
          />
        </svg>

        {/* Score Number in Center of Arch */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
            {safeScore}
          </span>
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            out of 100
          </span>
        </div>
      </div>

      {/* Status Rating Label */}
      <div className="mt-3 text-center">
        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${status.badgeClass}`}>
          {status.label}
        </span>
      </div>

      {/* Range Limits (0 and 100) */}
      <div className="w-full flex justify-between px-4 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 mt-1">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}
