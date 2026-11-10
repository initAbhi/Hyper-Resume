import { describe, expect, it } from 'bun:test';
import {
  evaluateHeadlineBudget,
  formatLinkedInRoleCopyBlock,
  LINKEDIN_ABOUT_FOLD_CHARS,
  LINKEDIN_HEADLINE_LIMIT,
  splitAboutFold,
} from './linkedin-utils';

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
    expect(formatted).toContain('• Engineered Go settlement service');
  });
});
