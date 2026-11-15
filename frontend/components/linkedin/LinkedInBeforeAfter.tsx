'use client';

import React from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  FileText,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { AccessibleCopyButton } from './AccessibleCopyButton';
import type { LinkedInAudit } from '@/lib/api-client';

interface LinkedInBeforeAfterProps {
  audit: LinkedInAudit;
  appliedHeadline?: string;
  appliedAbout?: string;
  appliedSkills?: string[];
}

export function LinkedInBeforeAfter({
  audit,
  appliedHeadline,
  appliedAbout,
  appliedSkills,
}: LinkedInBeforeAfterProps) {
  const originalHeadline = audit.profileSnapshot?.headline || 'Unspecified Headline (e.g. Software Engineer)';
  const optimizedHeadline =
    appliedHeadline ||
    audit.appliedState?.appliedHeadline ||
    audit.optimizations?.headlineSuggestions?.[0]?.headline ||
    audit.targetRole;

  const originalAbout =
    audit.profileSnapshot?.summary ||
    'No summary provided yet. Recruiter search cannot index career narratives or core stack without an About section.';

  const optimizedAbout =
    appliedAbout ||
    audit.appliedState?.appliedAbout ||
    audit.optimizations?.aboutOptions?.[0]?.about ||
    '';

  const originalScore = Math.max(35, audit.overallScore - 32);
  const targetScore = Math.max(audit.overallScore, 88);
  const scoreDelta = targetScore - originalScore;

  return (
    <div className="space-y-5">
      {/* Score Improvement Header Banner */}
      <div className="rounded-xl border border-[#A7F3D0] dark:border-[#047857]/50 bg-[#ECFDF5]/60 dark:bg-[#064E3B]/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#059669] text-white">
            <Sparkles className="w-3 h-3" />
            Recruiter Indexability Delta
          </div>
          <h3 className="text-base font-bold text-[#065F46] dark:text-[#A7F3D0]">
            Before vs. After Optimization Impact
          </h3>
          <p className="text-xs text-[#065F46] dark:text-[#A7F3D0] max-w-xl">
            See how applying search-indexed headlines, structured fold-optimized About narratives, and verified stack keywords directly increases recruiter search appearances.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center px-3 py-1.5 rounded-lg border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C]">
            <div className="text-[10px] text-[#848D9A] font-medium">Before</div>
            <div className="text-xl font-bold text-[#DC2626]">{originalScore}/100</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#059669]" />
          <div className="text-center px-3 py-1.5 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] dark:bg-[#064E3B]/40">
            <div className="text-[10px] text-[#065F46] dark:text-[#A7F3D0] font-medium">Optimized</div>
            <div className="text-xl font-bold text-[#059669] dark:text-[#34D399]">{targetScore}/100</div>
          </div>
          <span className="px-2 py-1 rounded bg-[#059669] text-white text-xs font-bold">
            +{scoreDelta} pts
          </span>
        </div>
      </div>

      {/* 1. Headline Comparison */}
      <div className="rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] overflow-hidden shadow-xs">
        <div className="p-3.5 bg-[#F7F8FA] dark:bg-[#1D2128]/50 border-b border-[#E2E5E9] dark:border-[#252A33] flex items-center justify-between">
          <span className="text-xs font-bold text-[#1A1D23] dark:text-[#F0F2F5] uppercase tracking-wider">
            1. Headline Optimization (220 Character Cap)
          </span>
          <span className="text-[11px] text-[#848D9A]">Recruiter Card First Impression</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E2E5E9] dark:divide-[#252A33]">
          {/* Before */}
          <div className="p-4 space-y-2 bg-[#FFF8F8]/40 dark:bg-[#7F1D1D]/10">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626]">
              <XCircle className="w-3.5 h-3.5" />
              <span>Before (Weak SEO / Unindexed)</span>
            </div>
            <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4] italic bg-white dark:bg-[#14171C] p-3 rounded border border-[#FECACA] dark:border-[#7F1D1D]/40">
              &ldquo;{originalHeadline}&rdquo;
            </p>
            <ul className="text-[11px] text-[#DC2626] space-y-0.5">
              <li>&bull; Lacks secondary tech stack keywords</li>
              <li>&bull; Misses recruiter Boolean search queries</li>
              <li>&bull; No proof of scale or domain impact</li>
            </ul>
          </div>

          {/* After */}
          <div className="p-4 space-y-2 bg-[#F0FDF4]/40 dark:bg-[#064E3B]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#059669] dark:text-[#34D399]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>After (Optimized &amp; Search-Indexed)</span>
              </div>
              <AccessibleCopyButton text={optimizedHeadline} label="Copy" ariaLabel="Copy optimized headline" />
            </div>
            <p className="text-xs font-semibold text-[#1A1D23] dark:text-[#F0F2F5] bg-white dark:bg-[#14171C] p-3 rounded border border-[#A7F3D0] dark:border-[#047857]/50 leading-relaxed">
              &ldquo;{optimizedHeadline}&rdquo;
            </p>
            <ul className="text-[11px] text-[#065F46] dark:text-[#A7F3D0] space-y-0.5">
              <li>&bull; Matches exact recruiter search title syntax</li>
              <li>&bull; Includes verified technical skills and domain context</li>
              <li>&bull; Strictly calibrated within the 220-char limit</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. About / Summary Comparison */}
      <div className="rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] overflow-hidden shadow-xs">
        <div className="p-3.5 bg-[#F7F8FA] dark:bg-[#1D2128]/50 border-b border-[#E2E5E9] dark:border-[#252A33] flex items-center justify-between">
          <span className="text-xs font-bold text-[#1A1D23] dark:text-[#F0F2F5] uppercase tracking-wider">
            2. About Narrative &amp; Above-The-Fold Hook
          </span>
          <span className="text-[11px] text-[#848D9A]">First 265 Chars Hook Recruiter Attention</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E2E5E9] dark:divide-[#252A33]">
          {/* Before */}
          <div className="p-4 space-y-2 bg-[#FFF8F8]/40 dark:bg-[#7F1D1D]/10">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626]">
              <XCircle className="w-3.5 h-3.5" />
              <span>Before</span>
            </div>
            <div className="text-xs text-[#5A6270] dark:text-[#9EA7B4] bg-white dark:bg-[#14171C] p-3 rounded border border-[#FECACA] dark:border-[#7F1D1D]/40 whitespace-pre-line max-h-48 overflow-y-auto">
              {originalAbout}
            </div>
          </div>

          {/* After */}
          <div className="p-4 space-y-2 bg-[#F0FDF4]/40 dark:bg-[#064E3B]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#059669] dark:text-[#34D399]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>After (3-Part Storytelling Hook &amp; Metrics)</span>
              </div>
              <AccessibleCopyButton text={optimizedAbout} label="Copy" ariaLabel="Copy optimized About" />
            </div>
            <div className="text-xs text-[#1A1D23] dark:text-[#F0F2F5] bg-white dark:bg-[#14171C] p-3 rounded border border-[#A7F3D0] dark:border-[#047857]/50 whitespace-pre-line max-h-48 overflow-y-auto leading-relaxed">
              {optimizedAbout}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Skills Matrix & Evidenced Coverage */}
      <div className="rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] p-4 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-[#1A1D23] dark:text-[#F0F2F5] uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-[#0A66C2]" />
          3. Skills Optimization &amp; Recruiter Pinned Cards
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128]/50 space-y-1.5">
            <span className="font-semibold text-[#5A6270] dark:text-[#9EA7B4]">
              Pinned Top 3 on Recruiter Search Cards
            </span>
            <div className="flex flex-wrap gap-1.5">
              {audit.optimizations.skillsStrategy.top3PinnedSkills.map((sk) => (
                <span
                  key={sk}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0A66C2] text-white"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-[#A7F3D0] dark:border-[#047857]/50 bg-[#ECFDF5]/60 dark:bg-[#064E3B]/20 space-y-1.5">
            <span className="font-semibold text-[#065F46] dark:text-[#A7F3D0]">
              Evidenced in Experience (Added to Boost Coverage)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {audit.optimizations.skillsStrategy.evidencedSkillsToAdd.slice(0, 6).map((sk) => (
                <span
                  key={sk}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-white dark:bg-[#14171C] text-[#065F46] dark:text-[#A7F3D0] border border-[#A7F3D0]"
                >
                  +{sk}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
