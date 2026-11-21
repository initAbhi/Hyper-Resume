import { describe, it, expect } from 'bun:test';
import { escapeLatex, generateLatexFromResume } from './latex-generator';
import type { ResumeContent } from '@/lib/api-client';

describe('Phase 5 Developer Virality: LaTeX Generator', () => {
  it('escapes reserved LaTeX special characters accurately', () => {
    expect(escapeLatex('100% scaled & tested with $500 #1 item_name {foo} ~bar ^car\\path')).toBe(
      '100\\% scaled \\& tested with \\$500 \\#1 item\\_name \\{foo\\} \\textasciitilde{}bar \\textasciicircum{}car\\textbackslash{}path',
    );
    expect(escapeLatex(null)).toBe('');
    expect(escapeLatex(undefined)).toBe('');
  });

  it('generates valid Jake Resume ATS LaTeX document structure from complete resume', () => {
    const mockContent: ResumeContent = {
      contact: {
        fullName: 'Alex Vance',
        email: 'alex@example.com',
        phone: '+1 555-0199',
        location: 'San Francisco, CA',
        linkedinUrl: 'https://linkedin.com/in/alexvance',
        githubUrl: 'https://github.com/alexvance',
      },
      headline: 'Senior Backend Engineer',
      summary: 'Experienced backend systems engineer with 5+ years scaling distributed systems.',
      skills: [
        { name: 'TypeScript', category: 'Languages' },
        { name: 'Go', category: 'Languages' },
        { name: 'PostgreSQL', category: 'Databases' },
      ],
      experience: [
        {
          title: 'Staff Engineer',
          company: 'HyperScale Inc.',
          location: 'San Francisco, CA',
          startDate: '2023',
          endDate: 'Present',
          current: true,
          bullets: [
            'Architected event streaming pipeline processing 10k events/sec with 99.99% uptime.',
            'Reduced p95 API latency from 420ms to 95ms via redis caching and indexing.',
          ],
        },
      ],
      projects: [
        {
          name: 'HyperResume ATS Engine',
          description: 'High-performance ATS scoring engine.',
          url: 'https://hype-resume.com',
          highlights: ['Built deterministic ATS compliance checker scoring 84 rules.'],
        },
      ],
      education: [
        {
          school: 'UC Berkeley',
          degree: 'B.S.',
          field: 'Computer Science',
          location: 'Berkeley, CA',
          graduationDate: '2020',
        },
      ],
      certifications: [
        {
          name: 'AWS Solutions Architect Professional',
          issuer: 'Amazon Web Services',
          issueDate: '2024',
        },
      ],
    };

    const latex = generateLatexFromResume(mockContent);

    // Verify document header & Jake's structure
    expect(latex).toContain('\\documentclass[letterpaper,11pt]{article}');
    expect(latex).toContain('\\textbf{\\Huge \\scshape Alex Vance}');
    expect(latex).toContain('alex@example.com');
    expect(latex).toContain('HyperScale Inc.');
    expect(latex).toContain('Architected event streaming pipeline processing 10k events/sec with 99.99\\% uptime.');
    expect(latex).toContain('HyperResume ATS Engine');
    expect(latex).toContain('UC Berkeley');
    expect(latex).toContain('AWS Solutions Architect Professional');
    expect(latex).toContain('\\end{document}');
  });
});
