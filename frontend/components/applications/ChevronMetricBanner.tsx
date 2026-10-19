'use client';

import React from 'react';
import { JobApplicationStatus } from '@/lib/api-client';

interface StageMetric {
  key: JobApplicationStatus | 'all';
  label: string;
  count: number;
}

interface ChevronMetricBannerProps {
  activeFilter: JobApplicationStatus | 'all';
  onSelectFilter: (filter: JobApplicationStatus | 'all') => void;
  counts: Record<JobApplicationStatus | 'all', number>;
}

const STAGES: { key: JobApplicationStatus; label: string }[] = [
  { key: 'bookmarked', label: 'BOOKMARKED' },
  { key: 'applying', label: 'APPLYING' },
  { key: 'applied', label: 'APPLIED' },
  { key: 'interviewing', label: 'INTERVIEWING' },
  { key: 'negotiating', label: 'NEGOTIATING' },
  { key: 'accepted', label: 'ACCEPTED' },
];

export function ChevronMetricBanner({
  activeFilter,
  onSelectFilter,
  counts,
}: ChevronMetricBannerProps) {
  return (
    <div className="w-full">
      {/* Mobile scroll / Desktop grid banner */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar sm:grid sm:grid-cols-6 sm:gap-2">
        {STAGES.map((stage, idx) => {
          const isActive = activeFilter === stage.key;
          const count = counts[stage.key] ?? 0;

          return (
            <button
              key={stage.key}
              type="button"
              onClick={() => onSelectFilter(isActive ? 'all' : stage.key)}
              className={`group relative flex flex-col items-center justify-center py-2.5 px-3 min-w-[120px] sm:min-w-0 rounded-lg transition-all border text-center select-none cursor-pointer ${
                isActive
                  ? 'bg-blue-600/10 dark:bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {/* Stepper Arrow Connector on desktop */}
              {idx < STAGES.length - 1 && (
                <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-zinc-300 dark:text-zinc-700">
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" className="opacity-40">
                    <path
                      d="M1 1L7 7L1 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}

              <div className="text-xl sm:text-2xl font-bold tracking-tight">
                {count > 0 ? count : '—'}
              </div>
              <div
                className={`text-[10px] tracking-wider uppercase font-semibold mt-0.5 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200'
                }`}
              >
                {stage.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter status reset bar if filtered */}
      {activeFilter !== 'all' && (
        <div className="flex items-center justify-between text-xs px-1 pt-2 text-zinc-500 dark:text-zinc-400">
          <span>
            Filtering by stage:{' '}
            <strong className="text-zinc-900 dark:text-zinc-100 capitalize">{activeFilter}</strong> (
            {counts[activeFilter] || 0} jobs)
          </span>
          <button
            onClick={() => onSelectFilter('all')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
          >
            Show All Applications ({counts.all || 0})
          </button>
        </div>
      )}
    </div>
  );
}
