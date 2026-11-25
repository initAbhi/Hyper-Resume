import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import type { PrimaryToolKey } from '@/lib/blog';
import { BLOG_TOOL_CONFIG } from '../toolConfig';

interface ToolCtaCardProps {
  tool?: PrimaryToolKey;
  title?: string;
  description?: string;
  ctaLabel?: string;
  href?: string;
}

export function ToolCtaCard({
  tool = 'resume-checker',
  title,
  description,
  ctaLabel,
  href,
}: ToolCtaCardProps) {
  const config = BLOG_TOOL_CONFIG[tool] ?? BLOG_TOOL_CONFIG['resume-checker'];

  return (
    <div className="not-prose my-8 rounded-2xl border border-[#285FEA]/25 bg-gradient-to-br from-[#285FEA]/[0.06] via-white to-white p-6 shadow-sm dark:border-[#3B82F6]/30 dark:from-[#3B82F6]/[0.12] dark:via-[#14171C] dark:to-[#14171C]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#285FEA]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#285FEA] dark:bg-[#3B82F6]/20 dark:text-[#60A5FA]">
            <Sparkles className="h-3 w-3" />
            {config.badge}
          </span>
          <h4 className="text-lg font-bold tracking-tight text-[#1A1D23] dark:text-[#F0F2F5]">
            {title ?? config.title}
          </h4>
          <p className="text-sm leading-relaxed text-[#525866] dark:text-[#9CA3AF]">
            {description ?? config.description}
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href={href ?? config.href}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285FEA] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1E4ECC] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB]"
          >
            <span>{ctaLabel ?? config.ctaLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#E4E7EC] pt-3.5 text-xs text-[#525866] dark:border-[#22262E] dark:text-[#9CA3AF]">
        {config.highlights.map((item) => (
          <span key={item} className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
