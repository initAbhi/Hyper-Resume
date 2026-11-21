'use client';

import React from 'react';
import {
  ArrowRight,
  Briefcase,
  Link2,
  Sparkles,
  Bot,
} from 'lucide-react';

export interface OnboardingCardItem {
  id: 'boost_ats' | 'tailor_jd' | 'find_jobs' | 'interview_me';
  stepNumber: string;
  badge: string;
  badgeTheme: 'emerald' | 'blue' | 'purple' | 'amber';
  title: string;
  description: string;
  actionText: string;
  prompt?: string;
  intent: 'prompt' | 'open_jd_url';
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

export const ONBOARDING_CARDS: OnboardingCardItem[] = [
  {
    id: 'boost_ats',
    stepNumber: '1',
    badge: 'ATS Audit + Fix',
    badgeTheme: 'emerald',
    title: 'Boost ATS Score to 95+',
    description:
      'Audit headline, summary, experience, and skills, then propose live diffs to maximize recruiter scoring.',
    actionText: 'Audit & Boost ATS',
    prompt:
      'Audit my resume for ATS compliance and propose edits across headline, summary, bullets, and skills to push my score above 95.',
    intent: 'prompt',
    icon: Sparkles,
  },
  {
    id: 'tailor_jd',
    stepNumber: '2',
    badge: '1-Click Tailor',
    badgeTheme: 'blue',
    title: 'Tailor to a Job Link',
    description:
      'Paste an Ashby, Greenhouse, Lever, or career page URL to extract keywords, compare alignment, and tailor bullets.',
    actionText: 'Paste Job Link',
    intent: 'open_jd_url',
    icon: Link2,
  },
  {
    id: 'find_jobs',
    stepNumber: '3',
    badge: 'Live Discovery',
    badgeTheme: 'purple',
    title: 'Find & Apply to Jobs',
    description:
      'Search live remote roles matching your background, check match scores, and save to your pipeline.',
    actionText: 'Find Matches',
    prompt:
      'Find me remote engineering jobs matching my resume, check match scores, and rank them by fit.',
    intent: 'prompt',
    icon: Briefcase,
  },
  {
    id: 'interview_me',
    stepNumber: '4',
    badge: 'Zero to Resume',
    badgeTheme: 'amber',
    title: 'Build from Scratch (Interview Me)',
    description:
      'Starting with an empty resume? The AI assistant will interview you step-by-step and draft a full ATS resume.',
    actionText: 'Start Interview',
    prompt:
      'I am starting from scratch and need to build a new resume. Please interview me step-by-step: ask me about my background, target role, education, top projects, and technical skills, and draft a high-scoring resume on my canvas.',
    intent: 'prompt',
    icon: Bot,
  },
];

export interface AgentOnboardingCardsProps {
  onSelectAction: (card: OnboardingCardItem) => void;
  disabled?: boolean;
  className?: string;
}

export function AgentOnboardingCards({
  onSelectAction,
  disabled = false,
  className = '',
}: AgentOnboardingCardsProps) {
  return (
    <section
      aria-label="First-time guided onboarding"
      data-testid="agent-onboarding-cards"
      className={`space-y-2.5 ${className}`}
    >
      <div className="space-y-0.5">
        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <span>Quick Start Workflows</span>
        </p>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Pick a guided workflow below to start without typing a prompt:
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {ONBOARDING_CARDS.map((card) => {
          const Icon = card.icon;
          const badgeClasses =
            card.badgeTheme === 'emerald'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : card.badgeTheme === 'blue'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : card.badgeTheme === 'amber'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';

          const iconContainerClasses =
            card.badgeTheme === 'emerald'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/80'
              : card.badgeTheme === 'blue'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-800/80'
                : card.badgeTheme === 'amber'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/80'
                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/80 dark:border-purple-800/80';

          return (
            <article
              key={card.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-[border-color,box-shadow] duration-150 ease-out group relative overflow-hidden"
            >
              <button
                type="button"
                disabled={disabled}
                data-testid={`onboarding-card-${card.id}`}
                onClick={() => onSelectAction(card)}
                className="w-full p-3 text-left flex items-start gap-3 cursor-pointer active:scale-[0.985] motion-reduce:active:scale-100 transition-transform duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-150 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100 ${iconContainerClasses}`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {`${card.stepNumber}. ${card.title}`}
                    </h3>
                    <span
                      className={`text-[9.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0 ${badgeClasses}`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {card.description}
                  </p>

                  <div className="pt-1 flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none">
                    <span>{card.actionText}</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </div>
                </div>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
