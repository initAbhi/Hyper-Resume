import React from 'react';
import { Check, X } from 'lucide-react';

interface BeforeAfterBulletProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  note?: string;
}

export function BeforeAfterBullet({
  before,
  after,
  beforeLabel = 'Before (Weak / Hallucinated)',
  afterLabel = 'After (Evidence-Grounded)',
  note,
}: BeforeAfterBulletProps) {
  return (
    <div className="not-prose my-6 overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-xs dark:border-[#22262E] dark:bg-[#14171C]">
      <div className="grid grid-cols-1 divide-y divide-[#E4E7EC] md:grid-cols-2 md:divide-x md:divide-y-0 dark:divide-[#22262E]">
        <div className="bg-rose-50/40 p-4 sm:p-5 dark:bg-rose-950/15">
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#EF4444]">
            <X className="h-3.5 w-3.5" />
            {beforeLabel}
          </div>
          <p className="text-sm leading-relaxed text-[#1A1D23] dark:text-[#F0F2F5]">{before}</p>
        </div>

        <div className="bg-emerald-50/40 p-4 sm:p-5 dark:bg-emerald-950/15">
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#10B981]">
            <Check className="h-3.5 w-3.5" />
            {afterLabel}
          </div>
          <p className="text-sm leading-relaxed text-[#1A1D23] dark:text-[#F0F2F5]">{after}</p>
        </div>
      </div>

      {note && (
        <div className="border-t border-[#E4E7EC] bg-[#F7F8FA] px-4 py-2.5 text-xs text-[#525866] sm:px-5 dark:border-[#22262E] dark:bg-[#0D0F12] dark:text-[#9CA3AF]">
          <span className="font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">Why this works: </span>
          {note}
        </div>
      )}
    </div>
  );
}
