import { describe, expect, it } from 'bun:test';
import { calculateClientAtsScore } from './ats-score-calculator';
import type { ResumeContent } from './api-client';

describe('Client-Side Calibrated ATS Score Calculator', () => {
  it('returns 0 for empty or null resume content', () => {
    const res = calculateClientAtsScore(null);
    expect(res.score).toBe(0);
    expect(res.metricsCount).toBe(0);
  });

  it('keeps near-empty placeholder resumes in the single digits', () => {
    const content: ResumeContent = {
      contact: {
        fullName: 'Abhi Singh',
        email: 'abhi@example.com',
      },
      headline: 'backend engineer',
      summary: 'Experienced professional with a proven track record.',
      experience: [
        {
          company: 'sadf',
          title: 'df',
          startDate: '2022',
          current: true,
          bullets: ['Architected core services handling 100k+ daily transactions with 99.9% uptime.'],
        },
      ],
      education: [
        {
          school: 'University of Technology',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          graduationDate: '2021',
        },
      ],
      skills: [{ name: 'TypeScript' }, { name: 'PostgreSQL' }],
    };

    const res = calculateClientAtsScore(content);
    expect(res.score).toBeLessThanOrEqual(35);
  });

  it('scores a thin unquantified resume in the mid band, not 70+', () => {
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
    expect(res.score).toBeGreaterThanOrEqual(20);
    expect(res.score).toBeLessThanOrEqual(55);
    expect(res.metricsCount).toBe(0);
    expect(res.totalBullets).toBe(3);
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
      summary:
        'Staff engineer with 8+ years designing high-throughput payment pipelines across multi-region Kubernetes clusters.',
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
            'Engineered Go microservices handling 2M daily active merchants with sub-15ms p99.',
            'Deployed observability stack cutting incident MTTR from 90 to 22 minutes.',
            'Mentored 8 engineers shipping 3 platform releases with zero Sev-1 regressions.',
          ],
        },
        {
          company: 'CloudScale',
          title: 'Senior Backend Engineer',
          startDate: '2018-01',
          endDate: '2021-02',
          current: false,
          bullets: [
            'Built event-driven billing services processing $120M annual GMV.',
            'Optimized PostgreSQL queries reducing p95 from 400ms to 45ms.',
            'Implemented CI/CD pipelines cutting deploy time from 45 to 8 minutes.',
            'Designed Redis caching layer serving 50K QPS for session tokens.',
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
        { name: 'PostgreSQL' },
        { name: 'Distributed Systems' },
        { name: 'CI/CD' },
      ],
    };

    const res = calculateClientAtsScore(content);
    expect(res.score).toBeGreaterThanOrEqual(88);
    expect(res.metricsCount).toBeGreaterThanOrEqual(6);
    expect(res.metricsScore).toBeGreaterThanOrEqual(85);
    expect(res.verbsScore).toBeGreaterThanOrEqual(85);
  });
});
