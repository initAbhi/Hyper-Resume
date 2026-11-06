import { describe, it, expect } from 'vitest';
import {
  validateAndSanitizeMetrics,
  validateAndReconstructAdaptation,
  type RawAiAdaptationPayload,
} from './factual-integrity-validator.js';
import type { ResumeContent } from '../../resumes/entities/resume.types.js';

describe('Factual Integrity Validator & Server Skeleton Reconstruction (Safeguards 2 & 6)', () => {
  const dummySource: ResumeContent = {
    contact: {
      fullName: 'Alice Developer',
      email: 'alice@example.com',
      phone: '+1 555-0100',
      location: 'New York, NY',
    },
    headline: 'Senior Full Stack Engineer',
    summary: 'Experienced engineer with 6 years building distributed backend APIs and React applications.',
    skills: [
      { name: 'TypeScript', category: 'Languages' },
      { name: 'PostgreSQL', category: 'Databases' },
    ],
    experience: [
      {
        company: 'Stripe',
        title: 'Software Engineer',
        startDate: '2021-01',
        endDate: 'Present',
        current: true,
        bullets: [
          'Maintained payment webhook processing infrastructure.',
          'Migrated legacy database tables to partitioned PostgreSQL schema.',
        ],
      },
    ],
    education: [
      {
        school: 'Columbia University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        graduationDate: '2020-05',
      },
    ],
    certifications: [
      {
        name: 'AWS Solutions Architect Associate',
        issuer: 'Amazon Web Services',
        issueDate: '2022-03',
      },
    ],
    projects: [
      {
        name: 'OpenMetrics',
        description: 'An open source telemetry aggregation service.',
        highlights: ['Built in Go with Prometheus exporter support.'],
        url: 'https://github.com/alice/openmetrics',
      },
    ],
  };

  const dummyBenchmark: ResumeContent = {
    contact: {
      fullName: 'Benchmark Candidate',
      email: 'bench@benchmark.com',
    },
    headline: 'Staff Infrastructure Engineer',
    summary: 'Planetary scale storage architect at Google.',
    skills: [
      { name: 'Go', category: 'Languages' },
      { name: 'Kubernetes', category: 'DevOps' },
    ],
    experience: [
      {
        company: 'Google',
        title: 'Staff Distributed Systems Engineer',
        startDate: '2019-01',
        current: true,
        bullets: [
          'Engineered Spanner replica layers serving 10M+ QPS with 99.999% uptime.',
        ],
      },
    ],
    education: [],
    projects: [
      {
        name: 'ConsensusCore',
        description: 'High-throughput Raft engine in C++20.',
        highlights: ['Achieved 420,000 committed ops/sec.'],
      },
    ],
  };

  it('safeguard 2: detects numeric and semantic claims and injects confirmation placeholder', () => {
    const original = 'Maintained payment webhook processing infrastructure.';
    const adapted = 'Architected payment webhook infrastructure, doubling throughput by 45% and saving $2M in server costs.';

    const result = validateAndSanitizeMetrics(original, adapted, 'test bullet');
    expect(result.metricFlag).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.sanitizedText).toContain('[Confirm measurable impact: e.g. latency reduction or scale]');
    expect(result.sanitizedText).not.toContain('45%');
    expect(result.sanitizedText).not.toContain('$2M');
    expect(result.sanitizedText).not.toContain('doubling throughput by');
  });

  it('safeguard 2: preserves verified metrics that existed in the original text', () => {
    const original = 'Reduced p99 query latency by 35% across 4 PostgreSQL clusters.';
    const adapted = 'Optimized PostgreSQL execution plans, cutting p99 query latency by 35% across 4 production clusters.';

    const result = validateAndSanitizeMetrics(original, adapted, 'test bullet');
    expect(result.metricFlag).toBe(false);
    expect(result.warnings.length).toBe(0);
    expect(result.sanitizedText).toContain('35%');
    expect(result.sanitizedText).toContain('4');
  });

  it('locks contact, education, certifications and employer metadata server-side', () => {
    const aiPayload: RawAiAdaptationPayload = {
      headline: 'Staff Distributed Systems Engineer',
      summary: 'Architect specialized in distributed cloud systems.',
      experienceBullets: [
        {
          company: 'AI Fabricated Corp', // AI should not overwrite 'Stripe'
          title: 'AI Fabricated Title', // AI should not overwrite 'Software Engineer'
          bullets: [
            'Spearheaded payment webhook infrastructure delivering high resilience.',
            'Executed PostgreSQL schema migration with zero downtime.',
          ],
        },
      ],
      recommendedBenchmarkSkills: ['Go', 'Kubernetes'],
    };

    const { validatedContent } = validateAndReconstructAdaptation(dummySource, dummyBenchmark, aiPayload);

    // Locked contact details
    expect(validatedContent.contact.fullName).toBe('Alice Developer');
    expect(validatedContent.contact.email).toBe('alice@example.com');
    // Locked education details
    expect(validatedContent.education[0].school).toBe('Columbia University');
    // Locked certifications
    expect(validatedContent.certifications?.[0].name).toBe('AWS Solutions Architect Associate');
    // Locked experience metadata
    expect(validatedContent.experience[0].company).toBe('Stripe');
    expect(validatedContent.experience[0].title).toBe('Software Engineer');
    expect(validatedContent.experience[0].startDate).toBe('2021-01');
    // Adapted bullets applied
    expect(validatedContent.experience[0].bullets[0]).toBe(
      'Spearheaded payment webhook infrastructure delivering high resilience.',
    );
  });

  it('safeguard 6: quarantines benchmark skills into recommendedBenchmarkSkills and does not mutate source skills', () => {
    const aiPayload: RawAiAdaptationPayload = {
      summary: 'Adapted summary text.',
      recommendedBenchmarkSkills: ['Go', 'Kubernetes', 'TypeScript'], // TypeScript already exists in source
    };

    const { validatedContent, recommendedBenchmarkSkills } = validateAndReconstructAdaptation(
      dummySource,
      dummyBenchmark,
      aiPayload,
    );

    // Original skills untouched
    expect(validatedContent.skills).toEqual(dummySource.skills);
    // TypeScript filtered out since already in source, new skills isolated
    expect(recommendedBenchmarkSkills).toEqual(['Go', 'Kubernetes']);
  });

  it('quarantines benchmark entity contamination', () => {
    const aiPayload: RawAiAdaptationPayload = {
      headline: 'Google Infrastructure Engineer',
      summary: 'Engineer working with ConsensusCore Raft engine at Google.',
      experienceBullets: [
        {
          bullets: [
            'Led Google infrastructure team to deploy ConsensusCore across datacenters.',
          ],
        },
      ],
      projects: [
        {
          name: 'ConsensusCore',
          highlights: ['Built Raft engine at Google.'],
        },
      ],
    };

    const { validatedContent, unsupportedWarnings } = validateAndReconstructAdaptation(
      dummySource,
      dummyBenchmark,
      aiPayload,
    );

    expect(unsupportedWarnings.some((w) => w.includes('Sample contamination'))).toBe(true);
    // Preserves original summary because AI injected benchmark company "Google"
    expect(validatedContent.summary).toBe(dummySource.summary);
    // Preserves original bullet because AI injected benchmark entities
    expect(validatedContent.experience[0].bullets[0]).toBe(dummySource.experience[0].bullets[0]);
  });
});

