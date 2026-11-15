'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  FileSearch,
  Filter,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import { AccessibleCopyButton } from './AccessibleCopyButton';
import type { LinkedInAudit } from '@/lib/api-client';

interface LinkedInKeywordHeatmapProps {
  audit: LinkedInAudit;
  stagedSkills: string[];
  onToggleSkill: (skill: string) => void;
  onInsertKeywordToHeadline?: (keyword: string) => void;
}

export function LinkedInKeywordHeatmap({
  audit,
  stagedSkills,
  onToggleSkill,
  onInsertKeywordToHeadline,
}: LinkedInKeywordHeatmapProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'verified' | 'evidenced' | 'gaps'>('all');

  const headline = (audit.appliedState?.appliedHeadline || audit.profileSnapshot?.headline || '').toLowerCase();
  const about = (audit.appliedState?.appliedAbout || audit.profileSnapshot?.summary || '').toLowerCase();
  const experienceText = (audit.profileSnapshot?.experience || [])
    .flatMap((e) => [e.title, e.company, ...(e.bullets || [])])
    .join(' ')
    .toLowerCase();

  const declaredSkills = useMemo(() => {
    return (audit.profileSnapshot?.skills || []).map((s) => s.name?.trim()).filter(Boolean) as string[];
  }, [audit]);

  const pinnedSkills = audit.optimizations.skillsStrategy.top3PinnedSkills || [];
  const evidencedToAdd = audit.optimizations.skillsStrategy.evidencedSkillsToAdd || [];
  const gapsToConfirm = audit.optimizations.skillsStrategy.targetRoleKeywordsToConfirm || [];

  // Combine unique keywords with placement metadata
  const keywordItems = useMemo(() => {
    const map = new Map<
      string,
      {
        keyword: string;
        type: 'pinned' | 'verified' | 'evidenced' | 'gap';
        inHeadline: boolean;
        inAbout: boolean;
        inExperience: boolean;
        isQueued: boolean;
      }
    >();

    // 1. Pinned
    for (const kw of pinnedSkills) {
      const lower = kw.toLowerCase();
      map.set(kw, {
        keyword: kw,
        type: 'pinned',
        inHeadline: headline.includes(lower),
        inAbout: about.includes(lower),
        inExperience: experienceText.includes(lower),
        isQueued: stagedSkills.includes(kw),
      });
    }

    // 2. Declared
    for (const kw of declaredSkills) {
      if (map.has(kw)) continue;
      const lower = kw.toLowerCase();
      map.set(kw, {
        keyword: kw,
        type: 'verified',
        inHeadline: headline.includes(lower),
        inAbout: about.includes(lower),
        inExperience: experienceText.includes(lower),
        isQueued: stagedSkills.includes(kw),
      });
    }

    // 3. Evidenced
    for (const kw of evidencedToAdd) {
      if (map.has(kw)) continue;
      const lower = kw.toLowerCase();
      map.set(kw, {
        keyword: kw,
        type: 'evidenced',
        inHeadline: headline.includes(lower),
        inAbout: about.includes(lower),
        inExperience: true,
        isQueued: stagedSkills.includes(kw),
      });
    }

    // 4. Gaps
    for (const kw of gapsToConfirm) {
      if (map.has(kw)) continue;
      const lower = kw.toLowerCase();
      map.set(kw, {
        keyword: kw,
        type: 'gap',
        inHeadline: headline.includes(lower),
        inAbout: about.includes(lower),
        inExperience: experienceText.includes(lower),
        isQueued: stagedSkills.includes(kw),
      });
    }

    return Array.from(map.values());
  }, [
    pinnedSkills,
    declaredSkills,
    evidencedToAdd,
    gapsToConfirm,
    headline,
    about,
    experienceText,
    stagedSkills,
  ]);

  const filtered = useMemo(() => {
    return keywordItems.filter((item) => {
      if (searchTerm && !item.keyword.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (activeCategory === 'verified') return item.type === 'verified' || item.type === 'pinned';
      if (activeCategory === 'evidenced') return item.type === 'evidenced';
      if (activeCategory === 'gaps') return item.type === 'gap';
      return true;
    });
  }, [keywordItems, searchTerm, activeCategory]);

  const coveragePct = audit.scoreReport.evidencedKeywordCoveragePct ?? 85;

  return (
    <div className="space-y-4">
      {/* Coverage Meter */}
      <div className="rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0A66C2] dark:text-[#60A5FA]">
                Target Role Keyword Indexing
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#0A66C2] dark:text-[#93C5FD]">
                {coveragePct}% Match
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#1A1D23] dark:text-[#F0F2F5] mt-0.5">
              Recruiter Search Term Heatmap: {audit.targetRole}
            </h4>
          </div>

          <AccessibleCopyButton
            text={keywordItems.map((k) => k.keyword).join(', ')}
            label="Copy All Keywords"
            ariaLabel="Copy all keywords"
          />
        </div>

        <progress
          className="hr-progress w-full h-2 block"
          value={coveragePct}
          max={100}
          aria-label={`Keyword match coverage: ${coveragePct}%`}
        />

        <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4]">
          LinkedIn Recruiter searches for specific keyword density across Headline, About, and Work Experience. Ensure high-priority technologies appear in at least two sections.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { key: 'all', label: `All (${keywordItems.length})` },
            { key: 'verified', label: `Indexed Skills (${declaredSkills.length})` },
            { key: 'evidenced', label: `Evidenced in Bullets (${evidencedToAdd.length})` },
            { key: 'gaps', label: `Market Keyword Gaps (${gapsToConfirm.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategory(tab.key as typeof activeCategory)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === tab.key
                  ? 'bg-[#0A66C2] text-white shadow-2xs'
                  : 'border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] text-[#5A6270] dark:text-[#9EA7B4] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-[#848D9A] absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-8 pr-2.5 text-xs rounded-md border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] text-[#1A1D23] dark:text-[#F0F2F5]"
          />
        </div>
      </div>

      {/* Keyword Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filtered.map((item) => {
          return (
            <div
              key={item.keyword}
              className={`p-3 rounded-lg border text-xs space-y-2 transition-colors ${
                item.type === 'pinned'
                  ? 'border-[#0A66C2] bg-[#EFF6FF]/60 dark:border-[#3B82F6] dark:bg-[#1E3A8A]/20'
                  : item.type === 'evidenced'
                    ? 'border-[#A7F3D0] bg-[#ECFDF5]/60 dark:border-[#047857]/40 dark:bg-[#064E3B]/20'
                    : item.type === 'gap'
                      ? 'border-[#FDE68A] bg-[#FFFBEB]/70 dark:border-[#92400E]/40 dark:bg-[#78350F]/20'
                      : 'border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C]'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="font-bold text-[#1A1D23] dark:text-[#F0F2F5] truncate">
                  {item.keyword}
                </span>

                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                    item.type === 'pinned'
                      ? 'bg-[#0A66C2] text-white'
                      : item.type === 'evidenced'
                        ? 'bg-[#059669] text-white'
                        : item.type === 'gap'
                          ? 'bg-[#D97706] text-white'
                          : 'bg-[#F1F3F5] dark:bg-[#1D2128] text-[#5A6270] dark:text-[#9EA7B4]'
                  }`}
                >
                  {item.type === 'pinned'
                    ? 'Pinned'
                    : item.type === 'evidenced'
                      ? 'In Bullets'
                      : item.type === 'gap'
                        ? 'Market Gap'
                        : 'Indexed'}
                </span>
              </div>

              {/* Placement Badges */}
              <div className="flex items-center gap-1 text-[10px] flex-wrap">
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    item.inHeadline
                      ? 'bg-[#059669]/15 text-[#059669] font-semibold'
                      : 'bg-[#F1F3F5] dark:bg-[#1D2128] text-[#848D9A]'
                  }`}
                >
                  Headline {item.inHeadline ? '✓' : '—'}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    item.inAbout
                      ? 'bg-[#059669]/15 text-[#059669] font-semibold'
                      : 'bg-[#F1F3F5] dark:bg-[#1D2128] text-[#848D9A]'
                  }`}
                >
                  About {item.inAbout ? '✓' : '—'}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    item.inExperience
                      ? 'bg-[#059669]/15 text-[#059669] font-semibold'
                      : 'bg-[#F1F3F5] dark:bg-[#1D2128] text-[#848D9A]'
                  }`}
                >
                  Experience {item.inExperience ? '✓' : '—'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-[#E2E5E9]/60 dark:border-[#252A33]">
                <button
                  type="button"
                  onClick={() => onToggleSkill(item.keyword)}
                  className="text-[11px] font-semibold text-[#0A66C2] dark:text-[#60A5FA] hover:underline cursor-pointer"
                >
                  {item.isQueued ? '✓ Queued' : '+ Queue Skill'}
                </button>

                {onInsertKeywordToHeadline && !item.inHeadline && (
                  <button
                    type="button"
                    onClick={() => onInsertKeywordToHeadline(item.keyword)}
                    className="text-[10px] text-[#5A6270] dark:text-[#9EA7B4] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5] cursor-pointer"
                  >
                    + To Headline
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
