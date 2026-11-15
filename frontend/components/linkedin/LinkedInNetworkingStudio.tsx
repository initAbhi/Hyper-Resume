'use client';

import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Mail,
  MessageSquare,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import { AccessibleCopyButton } from './AccessibleCopyButton';
import {
  generateNetworkingTemplates,
  LINKEDIN_CONNECTION_NOTE_LIMIT,
  type NetworkingTemplate,
} from '@/lib/linkedin-utils';
import type { LinkedInAudit } from '@/lib/api-client';

interface LinkedInNetworkingStudioProps {
  audit: LinkedInAudit;
  candidateName?: string;
}

export function LinkedInNetworkingStudio({
  audit,
  candidateName = 'Alex Mercer',
}: LinkedInNetworkingStudioProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'connection_request' | 'inmail' | 'recommendation'
  >('all');
  const [recipientName, setRecipientName] = useState('');
  const [targetCompany, setTargetCompany] = useState('');

  const topSkills = useMemo(() => {
    return [
      ...(audit.optimizations.skillsStrategy.top3PinnedSkills || []),
      ...(audit.appliedState?.appliedSkills || []),
      ...(audit.profileSnapshot?.skills || []).map((s) => s.name).filter(Boolean),
    ].slice(0, 5) as string[];
  }, [audit]);

  const latestCompany = audit.profileSnapshot?.experience?.[0]?.company;

  const rawTemplates = useMemo(() => {
    return generateNetworkingTemplates({
      candidateName,
      targetRole: audit.targetRole,
      industry: audit.industry || 'Tech & Product Systems',
      topSkills,
      latestCompany,
    });
  }, [candidateName, audit.targetRole, audit.industry, topSkills, latestCompany]);

  const customizedTemplates = useMemo(() => {
    return rawTemplates.map((t) => {
      let body = t.body;
      let subject = t.subject;
      if (recipientName.trim()) {
        body = body.replace(/\[Name\]/g, recipientName.trim());
        if (subject) subject = subject.replace(/\[Name\]/g, recipientName.trim());
      }
      if (targetCompany.trim()) {
        body = body.replace(/\[Company\]/g, targetCompany.trim());
        if (subject) subject = subject.replace(/\[Company\]/g, targetCompany.trim());
      }
      return { ...t, body, subject };
    });
  }, [rawTemplates, recipientName, targetCompany]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'all') return customizedTemplates;
    return customizedTemplates.filter((t) => t.category === selectedCategory);
  }, [customizedTemplates, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] dark:border-[#1E3A8A] dark:bg-[#0F172A]/70 p-4 space-y-2 text-xs text-[#075985] dark:text-[#BAE6FD]">
        <div className="flex items-center gap-2 font-bold text-sm">
          <MessageSquare className="w-4 h-4 text-[#0A66C2]" />
          Recruiter Outreach &amp; Recommendation Kit
        </div>
        <p className="leading-relaxed">
          Industry research shows customized connection notes increase acceptance rates by <strong>2.8&times;</strong>. Use these pre-calibrated outreach templates and pre-drafted recommendation scripts tailored to your target role.
        </p>

        {/* Quick Personalization Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-semibold text-[#1A1D23] dark:text-[#F0F2F5] mb-1">
              Recipient First Name (Optional auto-fill)
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full h-8 px-2.5 text-xs rounded-md border border-[#CBD0D7] dark:border-[#333945] bg-white dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#1A1D23] dark:text-[#F0F2F5] mb-1">
              Target Company Name (Optional auto-fill)
            </label>
            <input
              type="text"
              placeholder="e.g. Stripe, Linear, Vercel"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              className="w-full h-8 px-2.5 text-xs rounded-md border border-[#CBD0D7] dark:border-[#333945] bg-white dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5]"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'all', label: 'All Templates' },
          { key: 'connection_request', label: 'Connection Notes (<300 chars)' },
          { key: 'inmail', label: 'InMail & Pitches' },
          { key: 'recommendation', label: 'Recommendation Request' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedCategory(tab.key as typeof selectedCategory)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === tab.key
                ? 'bg-[#0A66C2] text-white shadow-2xs'
                : 'border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] text-[#5A6270] dark:text-[#9EA7B4] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Templates List */}
      <div className="space-y-3.5">
        {filtered.map((item) => {
          const charCount = item.body.length;
          const isOverLimit = item.charLimit && charCount > item.charLimit;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] p-4 space-y-2.5 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h4 className="text-xs font-bold text-[#1A1D23] dark:text-[#F0F2F5] flex items-center gap-1.5">
                    {item.category === 'connection_request' ? (
                      <UserPlus className="w-3.5 h-3.5 text-[#0A66C2]" />
                    ) : item.category === 'inmail' ? (
                      <Mail className="w-3.5 h-3.5 text-[#0A66C2]" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
                    )}
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#5A6270] dark:text-[#9EA7B4] mt-0.5">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {item.charLimit && (
                    <span
                      className={`text-[11px] font-mono ${
                        isOverLimit ? 'text-[#DC2626] font-bold' : 'text-[#848D9A]'
                      }`}
                    >
                      {charCount}/{item.charLimit} chars
                    </span>
                  )}
                  <AccessibleCopyButton
                    text={item.body}
                    label="Copy Note"
                    ariaLabel={`Copy ${item.title}`}
                  />
                </div>
              </div>

              {item.subject && (
                <div className="text-xs font-semibold text-[#0A66C2] dark:text-[#60A5FA] bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 px-2.5 py-1 rounded">
                  {item.subject}
                </div>
              )}

              <div className="rounded-lg border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128]/50 p-3 text-xs text-[#1A1D23] dark:text-[#F0F2F5] leading-relaxed whitespace-pre-line font-sans">
                {item.body}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
