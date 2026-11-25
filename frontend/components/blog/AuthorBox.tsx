import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import type { BlogAuthor } from '@/lib/blog';

export function AuthorBox({ author }: { author: BlogAuthor }) {
  const initials = author.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="not-prose mt-10 rounded-2xl border border-[#E4E7EC] bg-[#F7F8FA] p-5 sm:p-6 dark:border-[#22262E] dark:bg-[#14171C]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#285FEA] text-sm font-bold text-white dark:bg-[#3B82F6]">
          {initials}
        </div>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-[#1A1D23] dark:text-[#F0F2F5]">
              {author.name}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-[#10B981]">
              <ShieldCheck className="h-3 w-3" />
              {author.role}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-[#525866] dark:text-[#9CA3AF]">
            {author.bio ??
              'Building HypeResume — an evidence-grounded AI resume builder with deterministic metric validation, Puppeteer vector PDF verification, and zero auto-renew traps.'}
          </p>
          <div className="pt-1">
            <Link
              href="/tools/resume-checker"
              className="text-xs font-semibold text-[#285FEA] hover:underline dark:text-[#60A5FA]"
            >
              Try our free ATS parser audit →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
