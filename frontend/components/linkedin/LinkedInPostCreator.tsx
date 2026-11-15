'use client';

import React, { useMemo, useState } from 'react';
import {
  FileText,
  Hash,
  MessageSquare,
  Share2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { AccessibleCopyButton } from './AccessibleCopyButton';
import {
  generateLinkedInPostTemplates,
  type LinkedInPostTemplate,
} from '@/lib/linkedin-utils';
import type { LinkedInAudit } from '@/lib/api-client';

interface LinkedInPostCreatorProps {
  audit: LinkedInAudit;
  candidateName?: string;
}

export function LinkedInPostCreator({
  audit,
  candidateName = 'Alex Mercer',
}: LinkedInPostCreatorProps) {
  const topSkills = useMemo(() => {
    return [
      ...(audit.optimizations.skillsStrategy.top3PinnedSkills || []),
      ...(audit.appliedState?.appliedSkills || []),
      ...(audit.profileSnapshot?.skills || []).map((s) => s.name).filter(Boolean),
    ].slice(0, 5) as string[];
  }, [audit]);

  const posts = useMemo(() => {
    return generateLinkedInPostTemplates({
      candidateName,
      targetRole: audit.targetRole,
      industry: audit.industry || 'Modern Tech & Scalable Cloud Platforms',
      topSkills,
    });
  }, [candidateName, audit.targetRole, audit.industry, topSkills]);

  const [activePostId, setActivePostId] = useState(posts[0]?.id || '');
  const [editedPosts, setEditedPosts] = useState<Record<string, string>>({});

  const activePost = posts.find((p) => p.id === activePostId) || posts[0];
  const currentText = editedPosts[activePost?.id] ?? activePost?.body ?? '';

  const handleTextChange = (text: string) => {
    if (!activePost) return;
    setEditedPosts((prev) => ({ ...prev, [activePost.id]: text }));
  };

  return (
    <div className="space-y-4">
      {/* Header Info Banner */}
      <div className="rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] p-4 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-md bg-[#0A66C2]/10 text-[#0A66C2] dark:bg-[#0A66C2]/20 dark:text-[#60A5FA]">
            <TrendingUp className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-bold text-[#1A1D23] dark:text-[#F0F2F5]">
            LinkedIn Content &amp; Inbound Magnet Posts
          </h3>
        </div>
        <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4] leading-relaxed">
          Posting on LinkedIn triggers LinkedIn&apos;s Social Selling algorithm to rank your profile higher in Recruiter Search feeds. Use these proven high-engagement posts to announce your job search or showcase a recent architectural win.
        </p>
      </div>

      {/* Post Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {posts.map((post) => (
          <button
            key={post.id}
            type="button"
            onClick={() => setActivePostId(post.id)}
            className={`px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activePostId === post.id
                ? 'bg-[#0A66C2] text-white shadow-2xs'
                : 'border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] text-[#5A6270] dark:text-[#9EA7B4] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5]'
            }`}
          >
            {post.title}
          </button>
        ))}
      </div>

      {/* Post Editor & Preview */}
      {activePost && (
        <div className="rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A66C2] dark:text-[#60A5FA]">
                {activePost.topic}
              </span>
              <h4 className="text-sm font-bold text-[#1A1D23] dark:text-[#F0F2F5]">
                {activePost.title}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#848D9A]">
                {currentText.length} chars
              </span>
              <AccessibleCopyButton
                text={`${currentText}\n\n${activePost.hashtags.join(' ')}`}
                label="Copy Full Post"
                ariaLabel="Copy LinkedIn Post"
              />
            </div>
          </div>

          {/* Editable Post Box */}
          <div>
            <label className="block text-[11px] font-semibold text-[#5A6270] dark:text-[#9EA7B4] mb-1">
              Live Post Draft (Editable)
            </label>
            <textarea
              rows={10}
              value={currentText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128]/50 text-[#1A1D23] dark:text-[#F0F2F5] focus:outline-none focus:ring-2 focus:ring-[#0A66C2] leading-relaxed font-sans"
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-1 pt-1">
            <span className="text-[11px] font-semibold text-[#5A6270] dark:text-[#9EA7B4] flex items-center gap-1">
              <Hash className="w-3 h-3 text-[#0A66C2]" />
              Recommended LinkedIn Hashtags for Recruiter Feeds
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activePost.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#0A66C2] dark:text-[#93C5FD] border border-[#BFDBFE] dark:border-[#1E3A8A]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
