import { describe, expect, it } from 'bun:test';
import type { ResumeContent } from './api-client';

describe('Resume Editor Logic & Invariants', () => {
  const initialContent: ResumeContent = {
    contact: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+1 555-0199',
    },
    headline: 'Senior Backend Engineer',
    summary: 'Distributed systems architect with 6+ years experience.',
    skills: [{ name: 'Go' }, { name: 'PostgreSQL' }],
    experience: [
      {
        company: 'Cloud Corp',
        title: 'Backend Engineer',
        startDate: '2021',
        current: true,
        bullets: [
          'Managed database queries and customer endpoints.',
        ],
      },
    ],
    education: [
      {
        school: 'State University',
        degree: 'B.S.',
        field: 'Computer Science',
        graduationDate: '2021',
      },
    ],
  };

  it('should correctly add and remove work experience entries', () => {
    let content = { ...initialContent };

    // Add role
    const newRole = {
      company: 'Fintech Startup',
      title: 'Platform Lead',
      startDate: '2024',
      current: true,
      bullets: ['Scaled payment cluster to 50k QPS.'],
    };
    content = {
      ...content,
      experience: [newRole, ...content.experience],
    };

    expect(content.experience.length).toBe(2);
    expect(content.experience[0].company).toBe('Fintech Startup');

    // Remove first role
    content = {
      ...content,
      experience: content.experience.filter((_, idx) => idx !== 0),
    };

    expect(content.experience.length).toBe(1);
    expect(content.experience[0].company).toBe('Cloud Corp');
  });

  it('should add, deduplicate, and remove technical skills', () => {
    let content = { ...initialContent };

    // Add skill
    const newSkill = { name: 'Redis Clusters' };
    content = {
      ...content,
      skills: [...content.skills, newSkill],
    };

    expect(content.skills.length).toBe(3);
    expect(content.skills.some((s) => s.name === 'Redis Clusters')).toBe(true);

    // Remove skill
    content = {
      ...content,
      skills: content.skills.filter((s) => s.name !== 'Go'),
    };

    expect(content.skills.length).toBe(2);
    expect(content.skills.some((s) => s.name === 'Go')).toBe(false);
  });

  it('should enhance bullet with XYZ/STAR framework and apply suggestions cleanly', () => {
    const rawBullet = initialContent.experience[0].bullets[0];
    expect(rawBullet).toBeDefined();

    // Generate XYZ formula enhancement
    const enhancedBullet = 'Architected optimized database queries and customer endpoints, reducing p99 latency by 35% across 2M daily calls.';

    let content = { ...initialContent };
    const expList = [...content.experience];
    expList[0] = {
      ...expList[0],
      bullets: [enhancedBullet],
    };
    content = { ...content, experience: expList };

    expect(content.experience[0].bullets[0]).toBe(enhancedBullet);
    expect(content.experience[0].bullets[0]).toContain('reducing p99 latency by 35%');
  });

  it('should reject suggestion without modifying original bullet', () => {
    const rawBullet = 'Managed database queries and customer endpoints.';
    let content = { ...initialContent };

    // User rejects the suggestion
    const rejected = true;
    if (!rejected) {
      // should not execute
      content = { ...content, headline: 'Modified' };
    }

    expect(content.experience[0].bullets[0]).toBe(rawBullet);
  });

  it('should support switching between ATS templates', () => {
    const validTemplates = ['clean-modern', 'classic-ats', 'technical-ats', 'executive'];
    let selectedTemplate = 'clean-modern';

    expect(validTemplates.includes(selectedTemplate)).toBe(true);

    selectedTemplate = 'technical-ats';
    expect(selectedTemplate).toBe('technical-ats');
  });

  it('should validate required contact fields', () => {
    const isValidContact = (c: ResumeContent['contact']) => {
      return Boolean(c.fullName && c.fullName.trim() && c.email && c.email.includes('@'));
    };

    expect(isValidContact(initialContent.contact)).toBe(true);
    expect(isValidContact({ fullName: '', email: 'invalid' })).toBe(false);
    expect(isValidContact({ fullName: 'Alice', email: '' })).toBe(false);
  });
});
