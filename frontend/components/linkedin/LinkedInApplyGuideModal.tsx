'use client';

import React, { useState } from 'react';
import {
  ArrowUpRight,
  Award,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { AccessibleCopyButton } from './AccessibleCopyButton';
import { formatCompleteProfileKit } from '@/lib/linkedin-utils';
import type { LinkedInAudit } from '@/lib/api-client';

interface LinkedInApplyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: LinkedInAudit;
  appliedHeadline?: string;
  appliedAbout?: string;
  appliedSkills?: string[];
}

export function LinkedInApplyGuideModal({
  isOpen,
  onClose,
  audit,
  appliedHeadline,
  appliedAbout,
  appliedSkills,
}: LinkedInApplyGuideModalProps) {
  if (!isOpen) return null;

  const fullKit = formatCompleteProfileKit(
    audit,
    appliedHeadline,
    appliedAbout,
    appliedSkills,
  );

  const headline =
    appliedHeadline ||
    audit.appliedState?.appliedHeadline ||
    audit.optimizations?.headlineSuggestions?.[0]?.headline ||
    audit.profileSnapshot?.headline ||
    '';

  const about =
    appliedAbout ||
    audit.appliedState?.appliedAbout ||
    audit.optimizations?.aboutOptions?.[0]?.about ||
    audit.profileSnapshot?.summary ||
    '';

  const pinned = audit.optimizations?.skillsStrategy?.top3PinnedSkills || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-guide-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white dark:bg-[#14171C] rounded-2xl border border-[#E2E5E9] dark:border-[#252A33] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E5E9] dark:border-[#252A33] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] dark:bg-[#0A66C2]/20 dark:text-[#60A5FA]">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2
                id="apply-guide-modal-title"
                className="text-base font-bold text-[#1A1D23] dark:text-[#F0F2F5]"
              >
                LinkedIn Application Walkthrough
              </h2>
              <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4]">
                Step-by-step instructions to paste your optimized sections directly into LinkedIn.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close walkthrough modal"
            className="p-1.5 rounded-lg text-[#848D9A] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5] hover:bg-[#F1F3F5] dark:hover:bg-[#1D2128] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* 1-Click Export Kit Banner */}
          <div className="p-4 rounded-xl border border-[#A7F3D0] dark:border-[#047857]/50 bg-[#ECFDF5]/60 dark:bg-[#064E3B]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-[#065F46] dark:text-[#A7F3D0] text-sm">
                Complete Profile Kit (All Sections in 1 Click)
              </span>
              <p className="text-[#065F46] dark:text-[#A7F3D0] text-[11px] mt-0.5">
                Copies Headline, About narrative, Experience bullets, Pinned skills, and Featured suggestions into a single organized document.
              </p>
            </div>
            <AccessibleCopyButton
              text={fullKit}
              label="Copy Entire Profile Kit"
              ariaLabel="Copy entire profile kit"
            />
          </div>

          {/* Steps */}
          <div className="space-y-3.5">
            {/* Step 1 */}
            <div className="p-3.5 rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1A1D23] dark:text-[#F0F2F5] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0A66C2] text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  Update Your Headline (Recruiter Search Keyword Anchor)
                </span>
                <AccessibleCopyButton
                  text={headline}
                  label="Copy Headline"
                  ariaLabel="Copy headline"
                />
              </div>
              <p className="text-[#5A6270] dark:text-[#9EA7B4] text-[11px] leading-relaxed">
                Open your LinkedIn Profile &rarr; Click the <strong>pencil (Edit)</strong> icon in your top intro card &rarr; Paste into the <strong>Headline</strong> field &rarr; Click <strong>Save</strong>.
              </p>
              <div className="p-2.5 rounded bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] font-mono text-[11px] text-[#1A1D23] dark:text-[#F0F2F5]">
                {headline}
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1A1D23] dark:text-[#F0F2F5] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0A66C2] text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  Update Your About Section (Fold-Tested Hook &amp; Metrics)
                </span>
                <AccessibleCopyButton
                  text={about}
                  label="Copy About"
                  ariaLabel="Copy About section"
                />
              </div>
              <p className="text-[#5A6270] dark:text-[#9EA7B4] text-[11px] leading-relaxed">
                Scroll down to the <strong>About</strong> section &rarr; Click the <strong>pencil (Edit)</strong> icon &rarr; Paste your optimized narrative &rarr; Click <strong>Save</strong>.
              </p>
              <div className="p-2.5 rounded bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] font-sans text-[11px] text-[#1A1D23] dark:text-[#F0F2F5] whitespace-pre-line max-h-28 overflow-y-auto">
                {about}
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128]/40 space-y-2">
              <span className="font-bold text-[#1A1D23] dark:text-[#F0F2F5] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0A66C2] text-white flex items-center justify-center text-[10px]">
                  3
                </span>
                Pin Your Top 3 Skills to Recruiter Search Cards
              </span>
              <p className="text-[#5A6270] dark:text-[#9EA7B4] text-[11px] leading-relaxed">
                Scroll to <strong>Skills</strong> &rarr; Click the <strong>three dots &rarr; Reorder</strong> &rarr; Drag your 3 core skills to the top so they appear in recruiter preview snippets:
              </p>
              <div className="flex flex-wrap gap-2">
                {pinned.map((sk) => (
                  <span
                    key={sk}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0A66C2] text-white"
                  >
                    ★ {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128]/40 space-y-2">
              <span className="font-bold text-[#1A1D23] dark:text-[#F0F2F5] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#0A66C2] text-white flex items-center justify-center text-[10px]">
                  4
                </span>
                Clean Up Your Custom Profile URL
              </span>
              <p className="text-[#5A6270] dark:text-[#9EA7B4] text-[11px] leading-relaxed">
                On your LinkedIn profile page, look at the right rail &rarr; Click <strong>Public profile &amp; URL</strong> &rarr; Click <strong>Edit your custom URL</strong> &rarr; Set to a clean name slug (e.g. <code>/in/{audit.scoreReport.urlHealth.suggestedSlug}</code>) and remove random trailing numbers.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128]/50 flex items-center justify-between gap-3">
          <a
            href={audit.linkedinUrl || 'https://www.linkedin.com/in/'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A66C2] dark:text-[#60A5FA] hover:underline"
          >
            <span>Open LinkedIn Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#1A1D23] hover:bg-[#333945] text-white dark:bg-[#F0F2F5] dark:text-[#1A1D23] cursor-pointer"
          >
            Got It, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
