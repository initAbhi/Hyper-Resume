'use client';

import React, { useState, useEffect } from 'react';

export interface AnimatedListItem {
  id: string | number;
  title: string;
  subtitle: string;
  badge: string;
  badgeType?: 'success' | 'highlight' | 'info';
  icon?: React.ReactNode;
}

export interface AnimatedListProps {
  items: AnimatedListItem[];
  className?: string;
  interval?: number; // ms to cycle active highlight
}

export function AnimatedList({
  items,
  className = '',
  interval = 3500,
}: AnimatedListProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [items.length, interval]);

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={item.id}
            onClick={() => setActiveIndex(index)}
            className={`relative p-4 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden ${
              isActive
                ? 'bg-[#151829] shadow-lg shadow-violet-500/10 scale-[1.01]'
                : 'bg-[#0E101D]/70 hover:bg-[#121524] opacity-80 hover:opacity-100'
            }`}
          >
            {/* Active Left Indicator Pill */}
            {isActive && (
              <span 
                className="absolute left-0 inset-y-2 w-1 rounded-r-full bg-gradient-to-b from-[#D946EF] to-[#5525F5]"
                aria-hidden="true"
              />
            )}

            {/* Specular Edge for Active Item */}
            {isActive && (
              <span 
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent pointer-events-none"
                aria-hidden="true"
              />
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {item.icon && (
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 transition-colors ${
                    isActive ? 'bg-violet-500/20 text-violet-300' : 'bg-white/[0.04] text-zinc-400'
                  }`}>
                    {item.icon}
                  </div>
                )}
                <div>
                  <h4 className={`text-sm font-semibold transition-colors ${
                    isActive ? 'text-white' : 'text-zinc-300'
                  }`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                item.badgeType === 'success'
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : item.badgeType === 'highlight'
                  ? 'bg-fuchsia-500/15 text-fuchsia-300'
                  : 'bg-blue-500/15 text-blue-300'
              }`}>
                {item.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
