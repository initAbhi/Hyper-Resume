'use client';

import React, { useState } from 'react';
import {
  Award,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  MapPin,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { AccessibleCopyButton } from './AccessibleCopyButton';
import { LinkedInIcon } from './LinkedInIcon';
import type { LinkedInAudit } from '@/lib/api-client';
import { splitAboutFold } from '@/lib/linkedin-utils';

interface LinkedInMockupPreviewProps {
  audit: LinkedInAudit;
  currentHeadline: string;
  currentAbout: string;
  currentSkills: string[];
  candidateName?: string;
}

const BANNER_THEMES = [
  { id: 'slate', name: 'Executive Slate', bg: 'from-[#0F172A] via-[#1E293B] to-[#334155]' },
  { id: 'linkedin', name: 'LinkedIn Blue', bg: 'from-[#0A66C2] via-[#004182] to-[#0A66C2]' },
  { id: 'cyber', name: 'Tech Gradient', bg: 'from-[#1E1B4B] via-[#312E81] to-[#4338CA]' },
  { id: 'emerald', name: 'Emerald Impact', bg: 'from-[#064E3B] via-[#065F46] to-[#047857]' },
];

export function LinkedInMockupPreview({
  audit,
  currentHeadline,
  currentAbout,
  currentSkills,
  candidateName = 'Alex Mercer',
}: LinkedInMockupPreviewProps) {
  const [viewMode, setViewMode] = useState<'profile' | 'search_result'>('profile');
  const [hasOpenToWork, setHasOpenToWork] = useState(true);
  const [bannerTheme, setBannerTheme] = useState(BANNER_THEMES[0]);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  const headlineText =
    currentHeadline ||
    audit.appliedState?.appliedHeadline ||
    audit.optimizations?.headlineSuggestions?.[0]?.headline ||
    audit.profileSnapshot?.headline ||
    `${audit.targetRole} | Specialized in Modern Scalable Systems`;

  const aboutText =
    currentAbout ||
    audit.appliedState?.appliedAbout ||
    audit.optimizations?.aboutOptions?.[0]?.about ||
    audit.profileSnapshot?.summary ||
    'Experienced engineer delivering scalable applications and clean system architecture.';

  const aboutFold = splitAboutFold(aboutText);

  const pinnedSkills =
    audit.optimizations?.skillsStrategy?.top3PinnedSkills?.length > 0
      ? audit.optimizations.skillsStrategy.top3PinnedSkills
      : currentSkills.slice(0, 3);

  const allSkills = Array.from(new Set([...pinnedSkills, ...currentSkills]));

  const latestExp = audit.profileSnapshot?.experience?.[0];
  const education = audit.profileSnapshot?.education?.[0];
  const location = audit.profileSnapshot?.contact?.location || 'San Francisco Bay Area';

  // Initials for avatar
  const initials = candidateName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AM';

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128]/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">Preview Mode:</span>
          <div className="inline-flex rounded-lg border border-[#E2E5E9] dark:border-[#252A33] p-0.5 bg-white dark:bg-[#14171C]">
            <button
              type="button"
              onClick={() => setViewMode('profile')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'profile'
                  ? 'bg-[#0A66C2] text-white shadow-2xs'
                  : 'text-[#5A6270] dark:text-[#9EA7B4] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5]'
              }`}
            >
              Full Profile View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('search_result')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'search_result'
                  ? 'bg-[#0A66C2] text-white shadow-2xs'
                  : 'text-[#5A6270] dark:text-[#9EA7B4] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5]'
              }`}
            >
              Recruiter Search Card
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasOpenToWork}
              onChange={(e) => setHasOpenToWork(e.target.checked)}
              className="rounded border-[#CBD0D7] text-[#059669]"
            />
            <span className="text-[#1A1D23] dark:text-[#F0F2F5] font-medium">#OpenToWork Frame</span>
          </label>

          {viewMode === 'profile' && (
            <div className="flex items-center gap-1">
              <span className="text-[#848D9A]">Banner:</span>
              <div className="flex gap-1">
                {BANNER_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    title={theme.name}
                    onClick={() => setBannerTheme(theme)}
                    className={`w-4 h-4 rounded-full bg-linear-to-r ${theme.bg} border ${
                      bannerTheme.id === theme.id
                        ? 'border-white ring-2 ring-[#0A66C2]'
                        : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {viewMode === 'search_result' ? (
        /* RECRUITER SEARCH RESULT VIEW (How candidate appears in LinkedIn Recruiter search listings) */
        <div className="rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E2E5E9] dark:border-[#252A33] pb-2 text-[11px] text-[#5A6270] dark:text-[#9EA7B4]">
            <span className="flex items-center gap-1.5 font-semibold text-[#0A66C2] dark:text-[#60A5FA]">
              <Search className="w-3.5 h-3.5" />
              LinkedIn Recruiter Search Snippet (Candidate Card)
            </span>
            <span>Target Role Filter: &ldquo;{audit.targetRole}&rdquo;</span>
          </div>

          <div className="flex items-start gap-3.5 pt-1">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-base text-white shadow-xs ${
                  hasOpenToWork
                    ? 'ring-3 ring-[#059669] bg-[#0A66C2]'
                    : 'bg-[#0A66C2]'
                }`}
              >
                {initials}
              </div>
              {hasOpenToWork && (
                <div className="absolute -bottom-1 -right-1 bg-[#059669] text-white text-[8px] font-bold px-1 py-0.2 rounded-full border border-white">
                  OPEN
                </div>
              )}
            </div>

            {/* Snippet Details */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm font-bold text-[#1A1D23] dark:text-[#F0F2F5] hover:underline cursor-pointer">
                    {candidateName}
                  </h3>
                  <span className="text-[10px] text-[#848D9A]">· 1st / 2nd</span>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                    Match Score: {audit.overallScore}%
                  </span>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                  <AccessibleCopyButton text={headlineText} label="Copy Headline" ariaLabel="Copy headline" />
                </div>
              </div>

              {/* Headline snippet as seen by recruiter */}
              <p className="text-xs text-[#1A1D23] dark:text-[#F0F2F5] font-medium leading-snug line-clamp-2">
                {headlineText}
              </p>

              <div className="flex items-center gap-3 text-[11px] text-[#5A6270] dark:text-[#9EA7B4] pt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#848D9A]" />
                  {location}
                </span>
                {latestExp && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#848D9A]" />
                    {latestExp.company}
                  </span>
                )}
                {hasOpenToWork && (
                  <span className="text-[#059669] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Open to work: {audit.targetRole}
                  </span>
                )}
              </div>

              {/* Matched Skills Chips */}
              <div className="flex flex-wrap gap-1 pt-1.5">
                {pinnedSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#0A66C2] dark:text-[#93C5FD] border border-[#BFDBFE] dark:border-[#1E3A8A]"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-[#0A66C2]" />
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* FULL LINKEDIN PROFILE MOCKUP */
        <div className="rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] overflow-hidden shadow-xs">
          {/* Cover Banner */}
          <div
            className={`h-28 sm:h-36 bg-linear-to-r ${bannerTheme.bg} relative p-3 flex justify-end items-start`}
          >
            <div className="text-[10px] text-white/80 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded">
              Ideal Banner: 1584 &times; 396 px
            </div>
          </div>

          {/* Profile Card Header */}
          <div className="px-5 pb-5 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 -mt-14 sm:-mt-16 mb-3">
              {/* Profile Avatar */}
              <div className="relative">
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-[#14171C] flex items-center justify-center font-bold text-2xl text-white shadow-md ${
                    hasOpenToWork
                      ? 'ring-4 ring-[#059669] bg-[#0A66C2]'
                      : 'bg-[#0A66C2]'
                  }`}
                >
                  {initials}
                </div>
                {hasOpenToWork && (
                  <div className="absolute -bottom-1 inset-x-0 mx-auto w-max bg-[#059669] text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white shadow-2xs">
                    #OPENTOWORK
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0 flex-wrap">
                <AccessibleCopyButton
                  text={headlineText}
                  label="Copy Headline"
                  ariaLabel="Copy full headline"
                />
                <AccessibleCopyButton
                  text={aboutText}
                  label="Copy About"
                  ariaLabel="Copy About section"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#1A1D23] dark:text-[#F0F2F5]">
                    {candidateName}
                  </h2>
                  <span className="text-xs text-[#848D9A]">(He/Him/They)</span>
                  <ShieldCheck className="w-4 h-4 text-[#0A66C2] fill-[#0A66C2]/20" />
                </div>
                {/* Headline */}
                <p className="text-xs sm:text-sm text-[#1A1D23] dark:text-[#F0F2F5] font-medium leading-relaxed mt-1">
                  {headlineText}
                </p>
              </div>

              {/* Location, Connections, Contact */}
              <div className="flex items-center gap-2 text-xs text-[#5A6270] dark:text-[#9EA7B4] flex-wrap">
                <span>{location}</span>
                <span>·</span>
                <span className="text-[#0A66C2] dark:text-[#60A5FA] font-semibold hover:underline cursor-pointer">
                  Contact info
                </span>
                <span>·</span>
                <span className="text-[#0A66C2] dark:text-[#60A5FA] font-semibold hover:underline cursor-pointer">
                  500+ connections
                </span>
              </div>

              {/* Open to Work Card */}
              {hasOpenToWork && (
                <div className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5]/60 dark:border-[#047857]/40 dark:bg-[#064E3B]/20 p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#065F46] dark:text-[#A7F3D0]">
                      Open to work: {audit.targetRole} roles
                    </span>
                    <span className="text-[10px] font-semibold text-[#059669]">
                      Visible to Recruiters &amp; Network
                    </span>
                  </div>
                  <p className="text-[11px] text-[#065F46] dark:text-[#A7F3D0]">
                    Remote, Hybrid · Full-time · San Francisco, New York, or Remote
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* About Section */}
          <div className="border-t border-[#E2E5E9] dark:border-[#252A33] p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1A1D23] dark:text-[#F0F2F5]">
                About
              </h3>
              <span className="text-[10px] font-mono text-[#848D9A]">
                {aboutText.length}/2,600 chars
              </span>
            </div>

            <div className="text-xs leading-relaxed text-[#1A1D23] dark:text-[#F0F2F5] whitespace-pre-line">
              {isAboutExpanded ? (
                aboutText
              ) : (
                <>
                  <span className="bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 px-0.5 rounded-xs">
                    {aboutFold.beforeFold}
                  </span>
                  {aboutFold.exceedsFold && (
                    <button
                      type="button"
                      onClick={() => setIsAboutExpanded(true)}
                      className="ml-1 text-[#0A66C2] dark:text-[#60A5FA] font-semibold hover:underline cursor-pointer"
                    >
                      ...see more
                    </button>
                  )}
                </>
              )}
            </div>

            {isAboutExpanded && aboutFold.exceedsFold && (
              <button
                type="button"
                onClick={() => setIsAboutExpanded(false)}
                className="text-[11px] text-[#0A66C2] dark:text-[#60A5FA] font-semibold hover:underline cursor-pointer pt-1"
              >
                see less
              </button>
            )}
          </div>

          {/* Featured Section */}
          {(audit.optimizations?.featuredSuggestions || []).length > 0 && (
            <div className="border-t border-[#E2E5E9] dark:border-[#252A33] p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#1A1D23] dark:text-[#F0F2F5]">
                Featured
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {audit.optimizations.featuredSuggestions.map((feat, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128]/50 p-3 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#1A1D23] dark:text-[#F0F2F5] truncate">
                        {feat.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0A66C2]/10 text-[#0A66C2] dark:text-[#60A5FA]">
                        {feat.itemType}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A6270] dark:text-[#9EA7B4] line-clamp-2">
                      {feat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience Section */}
          {(audit.optimizations?.experienceOptimizations || []).length > 0 && (
            <div className="border-t border-[#E2E5E9] dark:border-[#252A33] p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#1A1D23] dark:text-[#F0F2F5]">
                Experience
              </h3>
              <div className="space-y-4">
                {audit.optimizations.experienceOptimizations.map((exp, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md bg-[#F1F3F5] dark:bg-[#1D2128] border border-[#E2E5E9] dark:border-[#252A33] flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-[#5A6270]" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1 text-xs">
                      <div className="font-bold text-[#1A1D23] dark:text-[#F0F2F5]">
                        {exp.title}
                      </div>
                      <div className="text-[11px] text-[#5A6270] dark:text-[#9EA7B4]">
                        {exp.company} · Full-time
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-[#1A1D23] dark:text-[#F0F2F5] pt-1">
                        {exp.optimizedBullets.map((b, bIdx) => (
                          <li key={bIdx} className="leading-snug">
                            {b.optimized}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          <div className="border-t border-[#E2E5E9] dark:border-[#252A33] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1A1D23] dark:text-[#F0F2F5] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#0A66C2]" />
                Skills ({allSkills.length})
              </h3>
              <span className="text-[11px] text-[#848D9A]">
                Top 3 pinned on Recruiter Cards
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-[#5A6270] dark:text-[#9EA7B4]">
                Top 3 Pinned Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {pinnedSkills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#0A66C2] text-white shadow-2xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    {sk}
                  </span>
                ))}
              </div>

              {allSkills.length > 3 && (
                <>
                  <div className="text-[11px] font-semibold text-[#5A6270] dark:text-[#9EA7B4] pt-2">
                    Additional Indexed Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {allSkills.slice(3).map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
