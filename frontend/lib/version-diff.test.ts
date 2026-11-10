import { describe, expect, it } from 'bun:test';
import type { ResumeContent } from '@/lib/api-client';
import { computeVersionDiff } from '@/lib/version-diff';

const baseContent: ResumeContent = {
  contact: {
    fullName: 'Alexander Sharma',
    email: 'alex@example.com',
  },
  headline: 'Senior Full Stack Engineer | NestJS & React',
  summary: 'Built scalable distributed fintech APIs serving 2M users.',
  skills: [{ name: 'TypeScript' }, { name: 'PostgreSQL' }, { name: 'Redis' }],
  experience: [
    {
      company: 'CloudScale Payments',
      title: 'Senior Full Stack Engineer',
      startDate: '2023-01',
      current: true,
      bullets: ['Architected ledger microservices handling 25,000+ RPS.'],
    },
  ],
  education: [
    {
      school: 'University of Washington',
      degree: 'B.S.',
      field: 'Computer Science',
    },
  ],
  projects: [],
};

describe('computeVersionDiff', () => {
  it('reports zero changes when live resume matches snapshot content', () => {
    const cloned = JSON.parse(JSON.stringify(baseContent)) as ResumeContent;
    const diff = computeVersionDiff(baseContent, cloned);
    expect(diff.totalChanges).toBe(0);
    expect(diff.headlineChanged).toBe(false);
    expect(diff.skillsAddedOnRestore).toEqual([]);
    expect(diff.skillsRemovedOnRestore).toEqual([]);
    expect(diff.changedRoles).toEqual([]);
  });

  it('detects headline, summary, skills, and bullet differences accurately', () => {
    const current: ResumeContent = {
      ...baseContent,
      headline: 'Staff Backend Architect | FinTech & Rust',
      summary: 'Updated summary emphasizing staff architectural scope.',
      skills: [{ name: 'TypeScript' }, { name: 'Rust' }],
      experience: [
        {
          ...baseContent.experience[0],
          bullets: [
            'Architected ledger microservices handling 25,000+ RPS.',
            'Led multi-region failover automation.',
          ],
        },
      ],
    };

    const diff = computeVersionDiff(current, baseContent);

    expect(diff.headlineChanged).toBe(true);
    expect(diff.summaryChanged).toBe(true);
    expect(diff.skillsAddedOnRestore).toEqual(['PostgreSQL', 'Redis']);
    expect(diff.skillsRemovedOnRestore).toEqual(['Rust']);
    expect(diff.changedRoles).toHaveLength(1);
    expect(diff.changedRoles[0].status).toBe('modified_bullets');
    expect(diff.totalChanges).toBeGreaterThanOrEqual(4);
  });
});
