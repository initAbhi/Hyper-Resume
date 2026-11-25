import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import type { PrimaryToolKey } from '@/lib/blog';
import { BLOG_TOOL_CONFIG } from './toolConfig';

export function StickyToolSidebar({ primaryTool }: { primaryTool: PrimaryToolKey }) {
  const tool = BLOG_TOOL_CONFIG[primaryTool] ?? BLOG_TOOL_CONFIG['resume-checker'];

  return (
    <div className="space-y-4">
      {/* Primary Contextual Tool Card */}
      <div className="rounded-2xl border border-[#E4E7EC] bg-white p-5 shadow-xs dark:border-[#22262E] dark:bg-[#14171C]">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#285FEA]/10 px-2.5 py-1 text-[11px] font-semibold text-[#285FEA] dark:bg-[#3B82F6]/15 dark:text-[#60A5FA]">
          <Sparkles className="h-3 w-3" />
          {tool.badge}
        </span>

        <h3 className="mt-3 text-base font-bold leading-snug text-[#1A1D23] dark:text-[#F0F2F5]">
          {tool.title}
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-[#525866] dark:text-[#9CA3AF]">
          {tool.description}
        </p>

        <ul className="mt-4 space-y-2">
          {tool.highlights.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-xs text-[#1A1D23] dark:text-[#D1D5DB]"
            >
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#10B981]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <Link
          href={tool.href}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#285FEA] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#1E4ECC] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB]"
        >
          <span>{tool.ctaLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Secondary Product Card: Free Vector PDF + Jake's Resume */}
      <div className="rounded-2xl border border-[#E4E7EC] bg-[#F7F8FA] p-5 dark:border-[#22262E] dark:bg-[#14171C]/60">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
          <FileText className="h-4 w-4 text-[#285FEA] dark:text-[#3B82F6]" />
          <span>No .txt Paywall Traps</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-[#525866] dark:text-[#9CA3AF]">
          Build with Jake&apos;s Resume &amp; 80+ verified company samples. Export unwatermarked Vector PDF &amp; DOCX for ₹0.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Link
            href="/examples"
            className="text-xs font-semibold text-[#285FEA] hover:underline dark:text-[#60A5FA]"
          >
            Browse Samples →
          </Link>
          <Link
            href="/register"
            className="text-xs font-semibold text-[#1A1D23] hover:underline dark:text-[#F0F2F5]"
          >
            Open Editor
          </Link>
        </div>
      </div>
    </div>
  );
}
