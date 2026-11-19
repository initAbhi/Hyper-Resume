import { describe, expect, it } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  AgentContextualQuickActions,
  resolveContextualQuickActions,
  resolveScreenStarterChips,
} from './AgentContextualQuickActions';

describe('Smart Contextual Quick-Action Chips', () => {
  it('shows post-audit chips (Apply fixes for ATS 95+, Target a specific JD, Strengthen weak bullets) after ATS audit', () => {
    const chips = resolveContextualQuickActions({
      lastAssistantContent: '### ATS Audit Complete — Score: **74/100**\nOverused verbs detected.',
      hasActiveResume: true,
      artifacts: { atsScore: 74 },
    });

    expect(chips.map((c) => c.label)).toEqual([
      'Apply fixes for ATS 95+',
      'Target a specific JD',
      'Strengthen weak bullets',
    ]);
    expect(chips[0].variant).toBe('primary');
    expect(chips[1].intent).toBe('open_jd_url');
  });

  it('shows post-approval chips (Re-check ATS Score, Write Cover Letter, Practice Interview) after proposal approval', () => {
    const chips = resolveContextualQuickActions({
      lastAssistantMessageId: 'applied-prop-123',
      lastAssistantContent:
        'Approved changes have been applied to your resume (version v4). A backup snapshot was saved.',
      hasActiveResume: true,
      activeJob: { title: 'Staff Engineer', companyName: 'Stripe' },
    });

    expect(chips.map((c) => c.label)).toEqual([
      'Re-check ATS Score',
      'Write Cover Letter',
      'Practice Interview',
    ]);
    expect(chips[1].prompt).toContain('Stripe');
    expect(chips[2].prompt).toContain('Staff Engineer');
  });

  it('shows post-match, post-cover-letter, post-interview, and post-jobs contextual chips accurately', () => {
    const matchChips = resolveContextualQuickActions({
      lastAssistantContent: '**Resume Match Score:** 78% — Missing keywords: GraphQL, Redis',
      hasActiveResume: true,
      artifacts: { matchScore: 78 },
    });
    expect(matchChips.map((c) => c.label)).toEqual([
      'Tailor Resume to JD',
      'Write Cover Letter',
      'Practice Interview',
    ]);

    const clChips = resolveContextualQuickActions({
      lastAssistantContent: 'Drafted cover letter — ready to review in Cover Letter Studio.',
      hasActiveResume: true,
      artifacts: { hasCoverLetter: true },
    });
    expect(clChips.map((c) => c.label)).toEqual([
      'Practice Interview',
      'Make Cover Letter Concise',
      'Re-check ATS Score',
    ]);

    const ivChips = resolveContextualQuickActions({
      lastAssistantContent: '**Interview Session Ready.** First question: Tell me about a system you scaled.',
      hasActiveResume: true,
      artifacts: { hasInterviewSession: true },
    });
    expect(ivChips.map((c) => c.label)).toEqual(['STAR Answer Outline', 'Harder Follow-up']);

    const jobChips = resolveContextualQuickActions({
      lastAssistantContent: 'Found 6 live matches for Remote Backend Engineer.',
      hasActiveResume: true,
      artifacts: { discoveredJobsCount: 6 },
    });
    expect(jobChips.map((c) => c.label)).toEqual([
      'Match Top Role',
      'Save to Tracker',
      'Tailor Resume',
    ]);
  });

  it('resolves distinct screen-aware starter chips for Resume Editor, Jobs, Cover Letters, and Interviews', () => {
    expect(resolveScreenStarterChips({ route: '/app/resumes/123' }).map((c) => c.label)).toEqual([
      'Audit ATS Score',
      'Apply fixes for ATS 95+',
      'Target a specific JD',
    ]);
    expect(resolveScreenStarterChips({ route: '/app/jobs' }).map((c) => c.label)).toEqual([
      'Find Remote Roles',
      'Tailor & Cover Letter',
      'Paste JD URL',
    ]);
    expect(resolveScreenStarterChips({ route: '/app/cover-letters' }).map((c) => c.label)).toEqual([
      'Draft Executive Letter',
      'Target a specific JD',
      'Practice Interview',
    ]);
    expect(resolveScreenStarterChips({ route: '/app/interview' }).map((c) => c.label)).toEqual([
      'Start Technical Mock',
      'Behavioral STAR Drill',
      'Audit My Resume',
    ]);
  });

  it('renders accessible keyboard-reachable chip buttons with focus-visible and press feedback', () => {
    const chips = resolveContextualQuickActions({
      lastAssistantMessageId: 'applied-1',
      lastAssistantContent: 'Approved changes have been applied to your resume (version v2).',
      hasActiveResume: true,
    });
    const html = renderToString(
      <AgentContextualQuickActions chips={chips} onSelectChip={() => {}} />,
    );
    expect(html).toContain('role="group"');
    expect(html).toContain('data-testid="agent-contextual-quick-actions"');
    expect(html).toContain('Re-check ATS Score');
    expect(html).toContain('Write Cover Letter');
    expect(html).toContain('Practice Interview');
    expect(html).toContain('focus-visible:outline-2');
    expect(html).toContain('active:scale-[0.97]');
    expect(html).toContain('motion-reduce:transition-none');
  });
});

