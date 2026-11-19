'use client';

import React from 'react';
import {
  BarChart3,
  Briefcase,
  Lightbulb,
  Link2,
  Mail,
  Mic,
  Search,
  Sparkles,
  Target,
  Wand2,
} from 'lucide-react';

export type QuickActionIcon =
  | 'sparkles'
  | 'target'
  | 'chart'
  | 'mail'
  | 'mic'
  | 'wand'
  | 'briefcase'
  | 'search'
  | 'lightbulb'
  | 'link';

export type QuickActionIntent = 'send_prompt' | 'open_jd_url';

export interface ContextualQuickActionChip {
  id: string;
  label: string;
  prompt?: string;
  intent: QuickActionIntent;
  icon: QuickActionIcon;
  variant?: 'primary' | 'secondary';
}

export interface ContextualReplyInput {
  lastAssistantMessageId?: string;
  lastAssistantContent: string;
  hasActiveResume: boolean;
  activeJob?: {
    title?: string;
    companyName?: string;
  } | null;
  artifacts?: {
    atsScore?: number;
    matchScore?: number;
    discoveredJobsCount?: number;
    hasCoverLetter?: boolean;
    hasInterviewSession?: boolean;
  };
  route?: string;
}

export interface ScreenStarterInput {
  route?: string;
  resumeName?: string;
  hasActiveResume?: boolean;
  activeJob?: {
    title?: string;
    companyName?: string;
  } | null;
}

/**
 * Resolves 2-3 high-signal contextual 1-click chips tailored to the exact
 * last assistant reply, workflow artifacts, and active resume/job context.
 */
export function resolveContextualQuickActions(
  input: ContextualReplyInput,
): ContextualQuickActionChip[] {
  const text = (input.lastAssistantContent || '').trim();
  const msgId = input.lastAssistantMessageId || '';
  const hasResume = input.hasActiveResume;
  const jobLabel =
    input.activeJob?.title && input.activeJob?.companyName
      ? `${input.activeJob.title} at ${input.activeJob.companyName}`
      : input.activeJob?.companyName || input.activeJob?.title || '';

  // 1. Post-Approval (Proposal just applied to live resume!)
  const isPostApproval =
    msgId.startsWith('applied-') ||
    /\b(approved changes have been applied|applied to your resume|backup snapshot was saved|version v\d+)\b/i.test(
      text,
    );
  if (isPostApproval) {
    return [
      {
        id: 'post-approve-recheck-ats',
        label: 'Re-check ATS Score',
        prompt: 'Run a fresh ATS audit on my updated resume and verify my new score.',
        intent: 'send_prompt',
        icon: 'chart',
        variant: 'primary',
      },
      {
        id: 'post-approve-cover-letter',
        label: 'Write Cover Letter',
        prompt: jobLabel
          ? `Draft a tailored cover letter using my updated resume for ${jobLabel}.`
          : 'Draft a tailored cover letter using my updated resume for my target role.',
        intent: 'send_prompt',
        icon: 'mail',
        variant: 'secondary',
      },
      {
        id: 'post-approve-interview',
        label: 'Practice Interview',
        prompt: jobLabel
          ? `Start a mock interview session based on my updated resume for ${jobLabel}.`
          : 'Start a mock technical and behavioral interview session based on my updated resume.',
        intent: 'send_prompt',
        icon: 'mic',
        variant: 'secondary',
      },
    ];
  }

  // 2. Post-ATS Audit (Score / weaknesses / recommendations reported)
  const isPostAudit =
    typeof input.artifacts?.atsScore === 'number' ||
    /\b(ats\s+(audit|score|compliance)|overused\s+verbs?|unbacked\s+skills?|score:\s*\*?\*?\d+\/100)\b/i.test(
      text,
    );
  if (isPostAudit && hasResume) {
    return [
      {
        id: 'post-audit-apply-95',
        label: 'Apply fixes for ATS 95+',
        prompt:
          'Apply all suggested fixes across my headline, summary, experience bullets, and skills to push my ATS score to 95+.',
        intent: 'send_prompt',
        icon: 'sparkles',
        variant: 'primary',
      },
      jobLabel
        ? {
            id: 'post-audit-tailor-jd',
            label: `Tailor for ${input.activeJob?.companyName || 'JD'}`,
            prompt: `Match and tailor my resume specifically for ${jobLabel} and propose edits.`,
            intent: 'send_prompt',
            icon: 'target',
            variant: 'secondary',
          }
        : {
            id: 'post-audit-target-jd',
            label: 'Target a specific JD',
            intent: 'open_jd_url',
            icon: 'target',
            variant: 'secondary',
          },
      {
        id: 'post-audit-bullets',
        label: 'Strengthen weak bullets',
        prompt:
          'Rewrite my weakest experience bullets with diverse strong action verbs and clear impact without fabricating metrics.',
        intent: 'send_prompt',
        icon: 'wand',
        variant: 'secondary',
      },
    ];
  }

  // 3. Post-Job Match / Keyword Gap Analysis
  const isPostMatch =
    typeof input.artifacts?.matchScore === 'number' ||
    /\b(resume\s+match\s+score|missing\s+(keywords|hard\s+skills)|alignment\s+score)\b/i.test(text);
  if (isPostMatch && hasResume) {
    return [
      {
        id: 'post-match-tailor',
        label: 'Tailor Resume to JD',
        prompt: jobLabel
          ? `Tailor my resume for ${jobLabel} to close the missing keyword gaps and propose edits.`
          : 'Tailor my resume to close the missing keyword gaps from this job match and propose edits.',
        intent: 'send_prompt',
        icon: 'sparkles',
        variant: 'primary',
      },
      {
        id: 'post-match-cover-letter',
        label: 'Write Cover Letter',
        prompt: jobLabel
          ? `Draft a tailored cover letter for ${jobLabel} highlighting my matching achievements.`
          : 'Draft a tailored cover letter addressing the top priorities of this job.',
        intent: 'send_prompt',
        icon: 'mail',
        variant: 'secondary',
      },
      {
        id: 'post-match-interview',
        label: 'Practice Interview',
        prompt: jobLabel
          ? `Start a mock interview for ${jobLabel} focusing on key requirements and skill gaps.`
          : 'Start a mock interview focusing on the hardest requirements from this job match.',
        intent: 'send_prompt',
        icon: 'mic',
        variant: 'secondary',
      },
    ];
  }

  // 4. Post-Cover Letter Drafted
  const isPostCoverLetter =
    Boolean(input.artifacts?.hasCoverLetter) ||
    /\b(cover\s+letter\s+studio|drafted\s+cover\s+letter)\b/i.test(text);
  if (isPostCoverLetter) {
    return [
      {
        id: 'post-cl-interview',
        label: 'Practice Interview',
        prompt: jobLabel
          ? `Start a mock interview session for ${jobLabel} and ask the first question.`
          : 'Start a mock interview session for this role and ask the first question.',
        intent: 'send_prompt',
        icon: 'mic',
        variant: 'primary',
      },
      {
        id: 'post-cl-concise',
        label: 'Make Cover Letter Concise',
        prompt: 'Tighten the cover letter into a crisp, executive 200-word version.',
        intent: 'send_prompt',
        icon: 'wand',
        variant: 'secondary',
      },
      ...(hasResume
        ? [
            {
              id: 'post-cl-ats',
              label: 'Re-check ATS Score',
              prompt: 'Run a quick ATS audit on my resume before I submit this application.',
              intent: 'send_prompt' as const,
              icon: 'chart' as const,
              variant: 'secondary' as const,
            },
          ]
        : []),
    ];
  }

  // 5. Post-Interview Session Started
  const isPostInterview =
    Boolean(input.artifacts?.hasInterviewSession) ||
    /\b(interview\s+session\s+ready|first\s+question:|mock\s+interview)\b/i.test(text);
  if (isPostInterview) {
    return [
      {
        id: 'post-iv-star-hint',
        label: 'STAR Answer Outline',
        prompt:
          'Give me a concise STAR outline hint for this interview question grounded in my real resume experience.',
        intent: 'send_prompt',
        icon: 'lightbulb',
        variant: 'primary',
      },
      {
        id: 'post-iv-followup',
        label: 'Harder Follow-up',
        prompt: 'Ask me a tougher technical follow-up question based on my resume projects.',
        intent: 'send_prompt',
        icon: 'mic',
        variant: 'secondary',
      },
    ];
  }

  // 6. Post-Job Discovery
  const isPostJobs =
    (input.artifacts?.discoveredJobsCount ?? 0) > 0 ||
    /\b(live\s+matches|discovered\s+jobs|found\s+\d+\s+.*roles)\b/i.test(text);
  if (isPostJobs) {
    return [
      ...(hasResume
        ? [
            {
              id: 'post-jobs-match',
              label: 'Match Top Role',
              prompt: 'Match my active resume against the top role above and show skill gaps.',
              intent: 'send_prompt' as const,
              icon: 'target' as const,
              variant: 'primary' as const,
            },
          ]
        : []),
      {
        id: 'post-jobs-save',
        label: 'Save to Tracker',
        prompt: 'Save the best matching role above to my Application Tracker.',
        intent: 'send_prompt',
        icon: 'briefcase',
        variant: hasResume ? 'secondary' : 'primary',
      },
      ...(hasResume
        ? [
            {
              id: 'post-jobs-tailor',
              label: 'Tailor Resume',
              prompt: 'Tailor my resume for the top role above and propose live diffs.',
              intent: 'send_prompt' as const,
              icon: 'sparkles' as const,
              variant: 'secondary' as const,
            },
          ]
        : []),
    ];
  }

  // 7. General Coaching / Improvement Suggestions
  if (
    hasResume &&
    /\b(apply these changes|propose|implement|rewrite|improve|suggest|recommend|action plan)\b/i.test(
      text,
    )
  ) {
    return [
      {
        id: 'post-advice-apply',
        label: 'Apply these changes',
        prompt: 'Apply all the changes you just suggested to my resume',
        intent: 'send_prompt',
        icon: 'sparkles',
        variant: 'primary',
      },
      {
        id: 'post-advice-audit',
        label: 'Run ATS Audit',
        prompt: 'Run a full 5-dimension ATS audit on my resume and show my score.',
        intent: 'send_prompt',
        icon: 'chart',
        variant: 'secondary',
      },
      {
        id: 'post-advice-jd',
        label: 'Target a specific JD',
        intent: 'open_jd_url',
        icon: 'target',
        variant: 'secondary',
      },
    ];
  }

  return [];
}

/**
 * Resolves 3 route-aware starter chips for empty conversations across screens
 * (Resume Editor, Job Discovery, Cover Letters, Mock Interviews, Dashboard).
 */
export function resolveScreenStarterChips(
  input: ScreenStarterInput,
): ContextualQuickActionChip[] {
  const route = (input.route || '').toLowerCase();
  const jobLabel =
    input.activeJob?.title && input.activeJob?.companyName
      ? `${input.activeJob.title} at ${input.activeJob.companyName}`
      : '';

  if (route.includes('/jobs')) {
    return [
      {
        id: 'starter-jobs-search',
        label: 'Find Remote Roles',
        prompt: 'Find me remote engineering jobs and match them against my resume',
        intent: 'send_prompt',
        icon: 'search',
        variant: 'primary',
      },
      {
        id: 'starter-jobs-tailor',
        label: jobLabel ? `Tailor for ${input.activeJob?.companyName}` : 'Tailor & Cover Letter',
        prompt: jobLabel
          ? `Tailor my resume for ${jobLabel} and draft a cover letter`
          : 'Tailor my resume for the selected job and draft a cover letter',
        intent: 'send_prompt',
        icon: 'sparkles',
        variant: 'secondary',
      },
      {
        id: 'starter-jobs-url',
        label: 'Paste JD URL',
        intent: 'open_jd_url',
        icon: 'link',
        variant: 'secondary',
      },
    ];
  }

  if (route.includes('/cover-letter')) {
    return [
      {
        id: 'starter-cl-draft',
        label: 'Draft Executive Letter',
        prompt: jobLabel
          ? `Draft a concise, high-impact executive cover letter for ${jobLabel}.`
          : 'Draft a tailored executive cover letter grounded in my active resume.',
        intent: 'send_prompt',
        icon: 'mail',
        variant: 'primary',
      },
      {
        id: 'starter-cl-jd',
        label: 'Target a specific JD',
        intent: 'open_jd_url',
        icon: 'target',
        variant: 'secondary',
      },
      {
        id: 'starter-cl-interview',
        label: 'Practice Interview',
        prompt: 'Prepare me for a technical interview for this role and ask the first question',
        intent: 'send_prompt',
        icon: 'mic',
        variant: 'secondary',
      },
    ];
  }

  if (route.includes('/interview')) {
    return [
      {
        id: 'starter-iv-tech',
        label: 'Start Technical Mock',
        prompt: 'Prepare me for a technical interview for this role and ask the first question',
        intent: 'send_prompt',
        icon: 'mic',
        variant: 'primary',
      },
      {
        id: 'starter-iv-star',
        label: 'Behavioral STAR Drill',
        prompt: 'Start a behavioral mock interview using my resume projects and evaluate with STAR.',
        intent: 'send_prompt',
        icon: 'lightbulb',
        variant: 'secondary',
      },
      {
        id: 'starter-iv-ats',
        label: 'Audit My Resume',
        prompt: 'Audit my active resume for weak bullets interviewers might challenge.',
        intent: 'send_prompt',
        icon: 'chart',
        variant: 'secondary',
      },
    ];
  }

  // Default / Resume Editor screen
  return [
    {
      id: 'starter-editor-audit',
      label: 'Audit ATS Score',
      prompt: 'Audit my resume for ATS compliance and score weak areas',
      intent: 'send_prompt',
      icon: 'chart',
      variant: 'primary',
    },
    {
      id: 'starter-editor-95',
      label: 'Apply fixes for ATS 95+',
      prompt:
        'Audit my resume and propose edits across headline, summary, bullets, and skills to reach ATS 95+.',
      intent: 'send_prompt',
      icon: 'sparkles',
      variant: 'secondary',
    },
    {
      id: 'starter-editor-jd',
      label: 'Target a specific JD',
      intent: 'open_jd_url',
      icon: 'target',
      variant: 'secondary',
    },
  ];
}

function renderActionIcon(icon: QuickActionIcon) {
  const cls = 'w-3 h-3 shrink-0';
  switch (icon) {
    case 'sparkles':
      return <Sparkles className={cls} aria-hidden="true" />;
    case 'target':
      return <Target className={cls} aria-hidden="true" />;
    case 'chart':
      return <BarChart3 className={cls} aria-hidden="true" />;
    case 'mail':
      return <Mail className={cls} aria-hidden="true" />;
    case 'mic':
      return <Mic className={cls} aria-hidden="true" />;
    case 'wand':
      return <Wand2 className={cls} aria-hidden="true" />;
    case 'briefcase':
      return <Briefcase className={cls} aria-hidden="true" />;
    case 'search':
      return <Search className={cls} aria-hidden="true" />;
    case 'lightbulb':
      return <Lightbulb className={cls} aria-hidden="true" />;
    case 'link':
      return <Link2 className={cls} aria-hidden="true" />;
  }
}

export interface AgentContextualQuickActionsProps {
  chips: ContextualQuickActionChip[];
  onSelectChip: (chip: ContextualQuickActionChip) => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function AgentContextualQuickActions({
  chips,
  onSelectChip,
  disabled = false,
  className = '',
  ariaLabel = 'Suggested next actions',
}: AgentContextualQuickActionsProps) {
  if (!chips || chips.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      data-testid="agent-contextual-quick-actions"
      className={`flex flex-wrap items-center gap-1.5 ${className}`}
    >
      {chips.map((chip) => {
        const isPrimary = chip.variant === 'primary';
        return (
          <button
            key={chip.id}
            type="button"
            disabled={disabled}
            data-testid={`quick-action-chip-${chip.id}`}
            onClick={() => onSelectChip(chip)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 min-h-[28px] text-[11px] font-semibold transition-[box-shadow,transform,background-color,border-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer ${
              isPrimary
                ? 'bg-[#285FEA] hover:bg-[#1E4BC8] hover:shadow-sm text-white shadow-2xs'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 hover:shadow-xs'
            }`}
          >
            {renderActionIcon(chip.icon)}
            <span>{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
}

