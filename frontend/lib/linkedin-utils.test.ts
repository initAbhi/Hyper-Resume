import { describe, expect, it } from 'bun:test';
import {
  calculateLiveRecruiterScore,
  evaluateHeadlineBudget,
  formatCompleteProfileKit,
  formatLinkedInRoleCopyBlock,
  generateLinkedInPostTemplates,
  generateNetworkingTemplates,
  LINKEDIN_ABOUT_FOLD_CHARS,
  LINKEDIN_CONNECTION_NOTE_LIMIT,
  LINKEDIN_HEADLINE_LIMIT,
  splitAboutFold,
} from './linkedin-utils';
import type { LinkedInAudit } from './api-client';

describe('linkedin-utils', () => {
  it('classifies headline budgets as short, optimal, or over LinkedIn 220-char limit', () => {
    expect(evaluateHeadlineBudget('Backend Engineer').status).toBe('short');

    const ideal =
      'Staff Backend Engineer @ FinEdge Payments | Go, Kubernetes, Apache Kafka, PostgreSQL | Distributed Ledger Systems & 99.99% Availability';
    const optimal = evaluateHeadlineBudget(ideal);
    expect(optimal.status).toBe('optimal');
    expect(optimal.limit).toBe(LINKEDIN_HEADLINE_LIMIT);

    const overflow = 'A'.repeat(235);
    expect(evaluateHeadlineBudget(overflow).status).toBe('over');
  });

  it('splits About narratives cleanly at LinkedIn 265-char fold threshold', () => {
    const shortAbout = 'Short narrative under fold.';
    const resShort = splitAboutFold(shortAbout);
    expect(resShort.exceedsFold).toBe(false);
    expect(resShort.afterFold).toBe('');

    const longAbout = `${'Lead distributed systems engineer building fault-tolerant payment infrastructure. '.repeat(4)}More career impact follows.`;
    const resLong = splitAboutFold(longAbout);
    expect(resLong.exceedsFold).toBe(true);
    expect(resLong.beforeFold.length).toBeLessThanOrEqual(LINKEDIN_ABOUT_FOLD_CHARS);
    expect(resLong.afterFold.length).toBeGreaterThan(0);
  });

  it('formats recruiter-ready LinkedIn experience copy blocks cleanly', () => {
    const formatted = formatLinkedInRoleCopyBlock({
      company: 'FinEdge Payments',
      title: 'Staff Backend Engineer',
      recruiterSearchHeadline: 'Staff Backend Engineer | Go · Kubernetes · Kafka',
      roleKeywords: ['Go', 'Kubernetes'],
      optimizedBullets: [
        {
          original: 'Built settlement service',
          optimized: 'Engineered Go settlement service cutting p99 latency to 38ms.',
          matchedKeywords: ['Go'],
        },
      ],
    });

    expect(formatted).toContain('Staff Backend Engineer | Go · Kubernetes · Kafka');
    expect(formatted).toContain('Engineered Go settlement service cutting p99 latency to 38ms.');
  });

  it('generates high-converting networking templates strictly under LinkedIn 300-char limits', () => {
    const templates = generateNetworkingTemplates({
      candidateName: 'Priya Patel',
      targetRole: 'Staff FullStack Engineer',
      industry: 'FinTech & Payments',
      topSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      latestCompany: 'Stripe',
    });

    expect(templates.length).toBeGreaterThanOrEqual(5);

    const connectionRequests = templates.filter((t) => t.category === 'connection_request');
    for (const req of connectionRequests) {
      expect(req.body.length).toBeLessThanOrEqual(LINKEDIN_CONNECTION_NOTE_LIMIT);
      expect(req.body).toContain('Staff FullStack Engineer');
    }

    const recRequest = templates.find((t) => t.id === 'rec-request');
    expect(recRequest).toBeDefined();
    expect(recRequest?.body).toContain('recommendation');
  });

  it('generates thought leadership and OpenToWork post templates with hashtags', () => {
    const posts = generateLinkedInPostTemplates({
      candidateName: 'Priya Patel',
      targetRole: 'Senior Frontend Engineer',
      industry: 'Developer Tools',
      topSkills: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Performance'],
    });

    expect(posts.length).toBe(2);
    expect(posts[0].id).toBe('post-open-to-work');
    expect(posts[0].body).toContain('#OpenToWork');
    expect(posts[0].hashtags.length).toBeGreaterThan(0);

    expect(posts[1].id).toBe('post-project-deep-dive');
    expect(posts[1].body).toContain('biggest technical lesson');
  });

  it('calculates live recruiter score dynamically based on user edits', () => {
    const poorScore = calculateLiveRecruiterScore({
      headline: 'Engineer',
      about: 'Looking for jobs',
      skillsCount: 2,
      experienceCount: 0,
      targetRole: 'FullStack Developer',
    });

    const strongScore = calculateLiveRecruiterScore({
      headline: 'FullStack Developer | React, Node.js, TypeScript | Scaled systems to 1M+ MAU',
      about:
        'FullStack Developer with 6+ years designing cloud applications and web platforms. Architected high-scale microservices, reducing latencies by 35% and improving developer deployment velocity.\n\nCore Competencies: React, TypeScript, Node.js, GraphQL, PostgreSQL.\n\nReach out at contact@example.com for collaboration.',
      skillsCount: 16,
      experienceCount: 3,
      targetRole: 'FullStack Developer',
      hasCustomSlug: true,
    });

    expect(poorScore.overallScore).toBeLessThan(50);
    expect(strongScore.overallScore).toBeGreaterThanOrEqual(85);
    expect(strongScore.headlineScore).toBeGreaterThanOrEqual(18);
    expect(strongScore.aboutScore).toBeGreaterThanOrEqual(20);
  });

  it('formats complete profile kit for single-click export', () => {
    const mockAudit: LinkedInAudit = {
      id: 'audit-1',
      userId: 'user-1',
      title: 'FullStack Developer · LinkedIn Audit',
      targetRole: 'FullStack Developer',
      tone: 'Impact & Metrics',
      sourceType: 'resume',
      overallScore: 92,
      profileSnapshot: {
        contact: { fullName: 'Alex Mercer', email: 'alex@example.com' },
        headline: 'FullStack Developer',
        summary: 'FullStack engineer summary',
        skills: [{ name: 'React' }, { name: 'TypeScript' }],
        experience: [],
        education: [],
      },
      scoreReport: {
        overallScore: 92,
        gradeLabel: 'All-Star Recruiter Ready',
        subScores: { headline: 20, about: 25, experience: 24, skills: 15, completeness: 8, contactFeatured: 0 },
        headlineCharCount: 140,
        aboutCharCount: 450,
        aboutFoldPreview: 'Hook text',
        skillsCount: 18,
        experienceCount: 3,
        evidencedKeywordCoveragePct: 90,
        urlHealth: { url: '', slug: '', hasCustomSlug: true, suggestedSlug: '', note: 'Clean' },
        diagnostics: [],
        checklist: [{ id: 'c1', title: 'Banner', impact: 'Medium', completed: true, detail: 'Banner added' }],
      },
      optimizations: {
        headlineSuggestions: [{ id: 'h1', style: 'SEO', headline: 'FullStack Developer | React | Node', charCount: 35, keywordsIncluded: ['React'], whyItWorks: 'Works' }],
        aboutOptions: [{ id: 'a1', tone: 'Impact', about: 'About me text', previewHook: 'About me', charCount: 20, keywordsIncluded: [] }],
        experienceOptimizations: [{
          company: 'Tech Corp',
          title: 'Senior Engineer',
          recruiterSearchHeadline: 'Senior Engineer | React',
          roleKeywords: ['React'],
          optimizedBullets: [{ original: 'dev', optimized: 'Engineered web app', matchedKeywords: ['React'] }],
        }],
        skillsStrategy: {
          top3PinnedSkills: ['React', 'TypeScript', 'Node.js'],
          evidencedSkillsToAdd: [],
          targetRoleKeywordsToConfirm: [],
        },
        featuredSuggestions: [{ title: 'Portfolio', itemType: 'Link', description: 'Live portfolio' }],
        factualVerificationNotes: 'Verified',
      },
      appliedState: {},
      createdAt: '2026-11-15T00:00:00Z',
      updatedAt: '2026-11-15T00:00:00Z',
    };

    const kit = formatCompleteProfileKit(mockAudit);
    expect(kit).toContain('# LinkedIn Profile Optimization Kit — FullStack Developer');
    expect(kit).toContain('## 1. LINKEDIN HEADLINE');
    expect(kit).toContain('## 2. ABOUT / SUMMARY');
    expect(kit).toContain('## 3. TOP PINNED SKILLS');
    expect(kit).toContain('## 4. OPTIMIZED EXPERIENCE BULLETS');
  });
});
