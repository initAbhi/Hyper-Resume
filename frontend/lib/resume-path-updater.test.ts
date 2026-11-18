import { describe, expect, it } from 'bun:test';
import { updateResumeContentByPath, insertBulletBelow, removeBulletAt } from './resume-path-updater';
import type { ResumeContent } from './api-client';

describe('resume-path-updater utility', () => {
  const mockContent: ResumeContent = {
    contact: {
      fullName: 'Alice Developer',
      email: 'alice@example.com',
      phone: '123-456-7890',
    },
    headline: 'Senior Cloud Architect',
    summary: 'Experienced builder',
    experience: [
      {
        company: 'Alpha Corp',
        title: 'Lead Engineer',
        startDate: '2020',
        endDate: 'Present',
        current: false,
        bullets: ['Led migration to AWS', 'Reduced cost by 20%'],
      },
    ],
    education: [
      {
        school: 'Tech Institute',
        degree: 'B.S.',
        field: 'CS',
      },
    ],
    skills: [{ name: 'React' }],
  };

  it('updates top-level and nested contact fields immutably', () => {
    const next = updateResumeContentByPath(mockContent, 'contact.fullName', 'Alice Wonder');
    expect(next.contact.fullName).toBe('Alice Wonder');
    expect(mockContent.contact.fullName).toBe('Alice Developer'); // Immutable
  });

  it('updates bullet in experience array cleanly', () => {
    const next = updateResumeContentByPath(
      mockContent,
      'experience[0].bullets[1]',
      'Optimized AWS cost by 35% through spot instances'
    );
    expect(next.experience[0].bullets[1]).toBe(
      'Optimized AWS cost by 35% through spot instances'
    );
    expect(mockContent.experience[0].bullets[1]).toBe('Reduced cost by 20%');
  });

  it('inserts bullet below target index correctly', () => {
    const next = insertBulletBelow(mockContent, 'experience', 0, 0);
    expect(next.experience[0].bullets.length).toBe(3);
    expect(next.experience[0].bullets[1]).toBe('');
    expect(next.experience[0].bullets[2]).toBe('Reduced cost by 20%');
  });

  it('removes bullet cleanly', () => {
    const next = removeBulletAt(mockContent, 'experience', 0, 1);
    expect(next.experience[0].bullets.length).toBe(1);
    expect(next.experience[0].bullets[0]).toBe('Led migration to AWS');
  });
});
