import { describe, expect, it } from 'vitest';
import {
  estimateTokens,
  pruneConversationHistory,
  pruneWorkflowStateForSynthesis,
  serializeCompactResumeForCache,
} from './context-pruner.util.js';

describe('ContextPruner Utility (Prompt Caching & Token Pruning)', () => {
  it('strips base64 photoUrl and empty fields from Resume JSON while keeping all career facts', () => {
    const fakePhoto = `data:image/png;base64,${'A'.repeat(40000)}`;
    const fullResume = {
      id: 'res-1',
      name: 'Principal Engineer CV',
      version: 3,
      templateKey: 'jake-classic',
      content: {
        contact: {
          fullName: 'Aarav Patel',
          email: 'aarav@example.com',
          phone: '',
          location: 'Austin, TX',
          photoUrl: fakePhoto,
        },
        headline: 'Principal Backend Engineer',
        summary: '10+ years designing distributed PostgreSQL and TypeScript platforms.',
        skills: [{ name: 'TypeScript', category: 'Core' }, { name: 'PostgreSQL', category: 'Data' }],
        experience: [
          {
            company: 'CloudScale',
            title: 'Principal Engineer',
            startDate: '2021',
            current: true,
            bullets: ['Scaled NestJS services to 60k RPS with 99.99% uptime.'],
          },
        ],
        education: [{ school: 'UT Austin', degree: 'B.S.', field: 'CS' }],
        projects: [],
        certifications: [],
      },
    };

    const rawTokens = estimateTokens(fullResume);
    const compact = serializeCompactResumeForCache(fullResume);
    const compactTokens = estimateTokens(compact);

    expect(compact).not.toContain('data:image/png');
    expect(compact).toContain('Aarav Patel');
    expect(compact).toContain('Scaled NestJS services to 60k RPS');
    expect(compact).not.toContain('"projects"');
    expect(compact).not.toContain('"certifications"');
    expect(compactTokens).toBeLessThan(rawTokens * 0.1);
  });

  it('keeps recent turns verbatim, compacts older turns into a digest, and saves tokens on long chats', () => {
    const messages = Array.from({ length: 16 }, (_, idx) => ({
      role: idx % 2 === 0 ? 'user' : 'assistant',
      content:
        idx % 2 === 0
          ? `Turn ${idx + 1}: Please review section ${idx + 1} of my resume and suggest stronger metrics and keywords for backend architecture roles. ${'Details about microservices and latency. '.repeat(8)}`
          : `Turn ${idx + 1}: Here is my detailed review for section ${idx + 1} with concrete STAR rewrites and ATS optimization tips. ${'Actionable recommendation details here. '.repeat(10)}`,
    }));

    const pruned = pruneConversationHistory(messages, {
      verbatimCount: 6,
      maxMessageChars: 400,
      maxTokenBudget: 900,
      maxDigestChars: 500,
    });

    expect(pruned.stats.originalMessages).toBe(16);
    expect(pruned.stats.compactedCount).toBeGreaterThan(0);
    expect(pruned.stats.keptVerbatim).toBeGreaterThanOrEqual(2);
    expect(pruned.stats.keptVerbatim).toBeLessThanOrEqual(6);
    expect(pruned.stats.savedTokens).toBeGreaterThan(500);
    expect(pruned.contents[0].parts[0].text).toContain('Earlier conversation summary');
    // Most recent message must always be preserved verbatim
    const lastContent = pruned.contents[pruned.contents.length - 1].parts[0].text || '';
    expect(lastContent).toContain('Turn 16');
  });

  it('structurally prunes workflowState into valid JSON without mid-object corruption', () => {
    const hugeState = {
      selectedJob: {
        title: 'Staff Engineer',
        company: 'Stripe',
        descriptionText: 'Requirements: TypeScript, Go, PostgreSQL. '.repeat(300),
      },
      atsAudit: {
        overallScore: 84,
        issues: ['Add metrics to role 2'],
      },
    };

    const serialized = pruneWorkflowStateForSynthesis(hugeState, 4000);
    expect(serialized.length).toBeLessThanOrEqual(4000);
    const parsed = JSON.parse(serialized);
    expect(parsed.atsAudit.overallScore).toBe(84);
    expect(parsed.selectedJob.company).toBe('Stripe');
    expect(parsed.selectedJob.descriptionText.length).toBeLessThanOrEqual(1820);
  });
});

