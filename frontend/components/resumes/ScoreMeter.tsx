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
  // Radius = 68, Center = (90, 80)
  // Circumference of semi-circle = Math.PI * 68 = 213.628
  const radius = 68;
  const strokeWidth = 14;
  const arcLength = Math.PI * radius; // ~213.63

  // Angle for indicator dot (180 deg = 0%, 360 deg = 100%)
  const angleDeg = 180 + (safeScore / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;
  const dotX = 90 + radius * Math.cos(angleRad);
  const dotY = 80 + radius * Math.sin(angleRad);

  const getStatus = (val: number) => {
    if (val >= 80) return { label: 'Ready to apply', color: 'text-emerald-500', badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };
    if (val >= 60) return { label: 'Good foundation', color: 'text-blue-500', badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400' };
    if (val >= 40) return { label: 'Needs improvement', color: 'text-amber-500', badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400' };
    return { label: 'Incomplete facts', color: 'text-rose-500', badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400' };
  };

  const status = getStatus(safeScore);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="relative w-[180px] h-[105px]">
        <svg viewBox="0 0 180 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="28%" stopColor="#f59e0b" />
              <stop offset="65%" stopColor="#eab308" />
              <stop offset="85%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 22 80 A 68 68 0 0 1 158 80"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="text-zinc-200 dark:text-zinc-800"
          />

          {/* Gradient Colored Arc */}
          <path
            d="M 22 80 A 68 68 0 0 1 158 80"
            fill="none"
            stroke="url(#scoreGaugeGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Indicator Dot on the Arc */}
          <g filter="url(#gaugeShadow)">
            <circle
              cx={dotX}
              cy={dotY}
              r={9}
              className="fill-zinc-900 dark:fill-white stroke-2 stroke-white dark:stroke-zinc-950 transition-all duration-500 ease-out"
            />
            <circle
              cx={dotX}
              cy={dotY}
              r={4}
              className="fill-blue-500 transition-all duration-500 ease-out"
            />
          </g>
        </svg>

        {/* Score Number in Center of Arch */}
        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
            {safeScore}
          </span>
          <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>

      {/* Status Rating Label */}
      <div className="mt-2 text-center">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${status.badgeBg}`}>
          {status.label}
        </span>
      </div>

      {/* Range Limits (0 and 100) */}
      <div className="w-full flex justify-between px-3 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 mt-1">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}
