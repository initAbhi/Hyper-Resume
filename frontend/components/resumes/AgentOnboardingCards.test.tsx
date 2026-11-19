import { describe, expect, it } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AgentOnboardingCards, ONBOARDING_CARDS } from './AgentOnboardingCards';

describe('First-Time Guided Onboarding Cards inside Agent Panel', () => {
  it('defines the 3 guided workflows with clear intents and non-empty prompts', () => {
    expect(ONBOARDING_CARDS).toHaveLength(3);
    expect(ONBOARDING_CARDS.map((c) => c.title)).toEqual([
      'Boost ATS Score to 95+',
      'Tailor to a Job Link',
      'Find & Apply to Jobs',
    ]);
    expect(ONBOARDING_CARDS[0].intent).toBe('prompt');
    expect(ONBOARDING_CARDS[0].prompt).toContain('95');
    expect(ONBOARDING_CARDS[1].intent).toBe('open_jd_url');
    expect(ONBOARDING_CARDS[2].intent).toBe('prompt');
    expect(ONBOARDING_CARDS[2].prompt).toContain('remote');
  });

  it('renders semantic <article> + <h3> + <button> onboarding cards with accessible labels', () => {
    const html = renderToString(<AgentOnboardingCards onSelectAction={() => {}} />);

    expect(html).toContain('data-testid="agent-onboarding-cards"');
    expect(html).toContain('aria-label="First-time guided onboarding"');
    expect(html).toContain('<article');
    expect(html).toContain('<h3');
    expect(html).toContain('data-testid="onboarding-card-boost_ats"');
    expect(html).toContain('data-testid="onboarding-card-tailor_jd"');
    expect(html).toContain('data-testid="onboarding-card-find_jobs"');
    expect(html).toContain('1. Boost ATS Score to 95+');
    expect(html).toContain('2. Tailor to a Job Link');
    expect(html).toContain('3. Find &amp; Apply to Jobs');
    expect(html).toContain('focus-visible:outline-2');
    expect(html).toContain('active:scale-[0.985]');
  });

  it('disables all 3 onboarding cards cleanly while a task is active or submitting', () => {
    const html = renderToString(<AgentOnboardingCards onSelectAction={() => {}} disabled />);
    const disabledCount = (html.match(/disabled=""/g) || []).length;
    expect(disabledCount).toBe(3);
  });
});

