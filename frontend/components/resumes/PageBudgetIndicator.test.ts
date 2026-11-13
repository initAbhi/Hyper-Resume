import { describe, it, expect } from 'bun:test';
import { calculatePageBudget } from './PageBudgetIndicator';
import type { ResumeContent } from '@/lib/api-client';

describe('calculatePageBudget', () => {
  it('should return empty draft metrics for null or empty content', () => {
    const emptyResult = calculatePageBudget(null);
    expect(emptyResult.estimatedLines).toBe(0);
    expect(emptyResult.pageCount).toBe(1);
    expect(emptyResult.spillsToSecondPage).toBe(false);
    expect(emptyResult.statusLabel).toBe('Empty Draft');
  });

  it('should estimate single page for a concise junior resume', () => {
    const juniorResume: ResumeContent = {
      contact: { fullName: 'Alex Smith', email: 'alex@test.com' },
      headline: 'Frontend Engineer',
      summary: 'Passionate frontend developer specializing in React and Next.js applications.',
      skills: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'Tailwind CSS' }],
      experience: [
        {
          company: 'Acme Corp',
          title: 'Junior Developer',
          startDate: '2023',
          current: true,
          bullets: [
            'Built responsive UI dashboards using React 19 and Tailwind CSS.',
            'Collaborated with designers to deliver accessible component design system.',
          ],
        },
      ],
      education: [
        { school: 'Tech University', degree: 'B.S.', field: 'Computer Science', graduationDate: '2023' },
      ],
    };

    const budget = calculatePageBudget(juniorResume);
    expect(budget.spillsToSecondPage).toBe(false);
    expect(budget.pageCount).toBe(1);
    expect(budget.percentageFirstPage).toBeGreaterThan(0);
    expect(budget.percentageFirstPage).toBeLessThanOrEqual(100);
    expect(budget.statusLabel).toContain('1 Page');
  });

  it('should detect spillover to page 2 for an extensive executive resume', () => {
    const seniorResume: ResumeContent = {
      contact: { fullName: 'Staff Engineer', email: 'staff@test.com' },
      headline: 'VP of Platform Engineering & Distributed Systems',
      summary: 'Experienced executive engineer leading global infrastructure teams. '.repeat(5),
      skills: Array.from({ length: 30 }, (_, i) => ({ name: `Skill-${i}` })),
      experience: Array.from({ length: 5 }, (_, i) => ({
        company: `Company ${i}`,
        title: `Principal Architect ${i}`,
        startDate: '2015',
        endDate: '2020',
        current: false,
        bullets: [
          'Directed architecture and database reliability scaling across multi-region clusters. '.repeat(2),
          'Spearheaded transition to Kubernetes saving 40% in monthly infrastructure spending.',
          'Mentored 25 senior engineers and authored organizational RFC standards.',
          'Designed high-throughput Kafka streaming pipelines delivering 50,000 msg/sec.',
        ],
      })),
      education: [
        { school: 'MIT', degree: 'M.S.', field: 'Computer Science', graduationDate: '2012' },
        { school: 'UC Berkeley', degree: 'B.S.', field: 'EECS', graduationDate: '2010' },
      ],
    };

    const budget = calculatePageBudget(seniorResume);
    expect(budget.spillsToSecondPage).toBe(true);
    expect(budget.pageCount).toBeGreaterThanOrEqual(2);
    expect(budget.statusLabel).toContain('Spills to Page 2');
  });
});
