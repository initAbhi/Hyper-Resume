import { describe, expect, it } from 'bun:test';
import { calculateClientAtsScore } from './ats-score-calculator';
import type { ResumeContent } from './api-client';

describe('Client-Side Calibrated ATS Score Calculator', () => {
  it('returns 0 for empty or null resume content', () => {
    const res = calculateClientAtsScore(null);
    expect(res.score).toBe(0);
    expect(res.metricsCount).toBe(0);
  });

  it('calculates realistic score on baseline unquantified resume without cliff drop', () => {
    const content: ResumeContent = {
      contact: {
        fullName: 'Aarav Patel',
        email: 'aarav@example.com',
        phone: '+91 9876543210',
        location: 'Mumbai, India',
        linkedinUrl: 'https://linkedin.com/in/aarav',
      },
      headline: 'Full Stack Developer',
      summary: 'Experienced developer building web solutions with modern frameworks.',
      experience: [
        {
          company: 'Acme Corp',
          title: 'Software Developer',
          startDate: '2022-01',
          endDate: 'Present',
          current: true,
          bullets: [
            'Developed user dashboard and customer onboarding portal.',
            'Collaborated with design team to implement responsive layouts.',
            'Assisted with database migration to PostgreSQL.',
          ],
        },
      ],
      education: [
        {
          school: 'IIT Bombay',
          degree: 'B.Tech',
          field: 'Computer Science',
          graduationDate: '2021',
        },
      ],
      skills: [
        { name: 'JavaScript' },
        { name: 'React' },
        { name: 'Node.js' },
        { name: 'PostgreSQL' },
      ],
    };

    const res = calculateClientAtsScore(content);
    // Baseline unquantified resume should score around 65-75 (not 35-45)
    expect(res.score).toBeGreaterThanOrEqual(65);
    expect(res.score).toBeLessThanOrEqual(80);
    expect(res.metricsCount).toBe(0);
    expect(res.totalBullets).toBe(3);
    expect(res.formattingScore).toBeGreaterThanOrEqual(90);
  });

  it('awards high score on metric-rich, Google XYZ compliant resume', () => {
    const content: ResumeContent = {
      contact: {
        fullName: 'Alexander Sharma',
        email: 'alex@example.com',
        phone: '555-0199',
        location: 'San Francisco, CA',
        linkedinUrl: 'https://linkedin.com/in/alex',
      },
      headline: 'Senior Distributed Systems Architect',
      summary: 'Staff engineer with 8+ years designing high-throughput payment pipelines.',
      experience: [
        {
          company: 'FinTech Global',
          title: 'Lead Architect',
          startDate: '2021-03',
          endDate: 'Present',
          current: true,
          bullets: [
            'Architected distributed ledger pipeline processing 45,000 TPS at 99.99% uptime.',
            'Slashed checkout latency by 42% through Redis clustering and query optimization.',
            'Spearheaded cloud migration to Kubernetes, reducing annual infrastructure costs by $350K.',
          ],
        },
      ],
      education: [
        {
          school: 'Stanford University',
          degree: 'M.S.',
          field: 'Computer Science',
          graduationDate: '2019',
        },
      ],
      skills: [
        { name: 'Go' },
        { name: 'Kubernetes' },
        { name: 'Redis' },
        { name: 'Distributed Systems' },
      ],
    };

    const res = calculateClientAtsScore(content);
    expect(res.score).toBeGreaterThanOrEqual(88);
    expect(res.metricsCount).toBe(3);
    expect(res.xyzCount).toBe(3);
    expect(res.metricsScore).toBeGreaterThanOrEqual(90);
    expect(res.verbsScore).toBeGreaterThanOrEqual(85);
  });
});
