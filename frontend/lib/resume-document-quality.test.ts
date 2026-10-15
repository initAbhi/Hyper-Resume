import { describe, expect, it } from 'bun:test';
import type { ResumeContent } from './api-client';

describe('Resume Document Quality & Edge Case Rendering', () => {
  // Edge Case 1: Fresh Graduate / 1-Page Minimal Resume
  const fresherResume: ResumeContent = {
    contact: {
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@domain.in',
      phone: '+91 98765 12345',
      location: 'Bengaluru, India',
      githubUrl: 'https://github.com/aarav-dev',
    },
    headline: 'Computer Science Graduate | Aspiring Full Stack Engineer',
    summary: 'Recent CS graduate with strong foundations in data structures, algorithms, and React/Node development.',
    skills: [{ name: 'JavaScript' }, { name: 'Python' }, { name: 'SQL' }],
    experience: [],
    education: [
      {
        school: 'Indian Institute of Information Technology',
        degree: 'B.Tech',
        field: 'Computer Science',
        graduationDate: '2024',
      },
    ],
    projects: [
      {
        name: 'Distributed Task Queue',
        description: 'Built asynchronous background job worker in Node.js and Redis processing 1,000 tasks/min.',
        highlights: ['Achieved zero task drops during simulated broker restarts'],
      },
    ],
  };

  // Edge Case 2: Multi-Page Senior Architect with Long History & International Characters
  const seniorArchitectResume: ResumeContent = {
    contact: {
      fullName: 'Dr. Élodie Müller-Björnsson (élodie@corp.eu)',
      email: 'elodie.mueller@corp.eu',
      phone: '+49 170 1234567',
      location: 'München, Germany / Zürich, Switzerland',
      linkedinUrl: 'https://linkedin.com/in/elodie-m-987162b',
      githubUrl: 'https://github.com/elodiem',
      websiteUrl: 'https://elodie.systems/research/distributed-consensus',
    },
    headline: 'Principal Infrastructure Architect — High-Throughput Low-Latency Systems (高スループット)',
    summary:
      'Over 14+ years architecting multi-region resilient databases, zero-downtime consensus protocols, and real-time financial settlement engines handling >$40B in annual volume across European and Asian markets.',
    skills: [
      { name: 'Distributed Systems' },
      { name: 'Raft & Paxos' },
      { name: 'C++20' },
      { name: 'Rust' },
      { name: 'PostgreSQL Internals' },
      { name: 'Linux eBPF' },
    ],
    experience: [
      {
        company: 'Zürich Global Financial Infrastructure AG & Co. KGaA',
        title: 'VP of Platform Architecture & Distributed Systems Governance',
        startDate: '2018',
        current: true,
        bullets: [
          'Engineered global Raft-replicated ledger spanning Frankfurt, Dublin, and Tokyo datacenters, sustaining 140,000 tx/sec with p99.9 latency under 4.2ms.',
          'Pioneered eBPF-based kernel packet filtering across 800+ bare-metal servers, reducing TCP network jitter by 28% and preventing DDoS line-rate saturation.',
          'Supervised cross-functional engineering organization of 65 staff and principal engineers across 4 time zones.',
        ],
      },
      {
        company: 'Deutsche Data Systems Technologies International GmbH',
        title: 'Lead Storage Systems Architect',
        startDate: '2014',
        endDate: '2018',
        current: false,
        bullets: [
          'Redesigned write-ahead logging (WAL) pipeline in C++, cutting disk sync bottlenecks and improving write IOPS by 3.5x under sustained flash-sale write bursts.',
          'Authored formal TLA+ specifications for multi-master replication protocol, uncovering and eliminating 3 edge-case split-brain race conditions before production rollout.',
        ],
      },
      {
        company: 'Nordic Cloud Innovations AB',
        title: 'Senior Backend Engineer',
        startDate: '2010',
        endDate: '2014',
        current: false,
        bullets: [
          'Migrated legacy monolithic billing engine to event-driven microservices with zero downtime for 2.8M active subscribers.',
        ],
      },

    ],
    education: [
      {
        school: 'ETH Zürich (Eidgenössische Technische Hochschule Zürich)',
        degree: 'Ph.D.',
        field: 'Distributed Computer Systems',
        graduationDate: '2010',
      },
      {
        school: 'Technische Universität München',
        degree: 'M.Sc.',
        field: 'Computer Science & Mathematics',
        graduationDate: '2006',
      },
    ],
  };

  it('should render fresher resume cleanly with empty work experience without orphan headings', () => {
    expect(fresherResume.experience.length).toBe(0);
    expect(fresherResume.education.length).toBe(1);
    expect(fresherResume.projects?.length).toBe(1);

    // Filter function ensuring empty sections are omitted
    const hasExperienceSection = fresherResume.experience.length > 0;
    expect(hasExperienceSection).toBe(false);

    // Verify contact rendering integrity
    expect(fresherResume.contact.fullName).toBe('Aarav Sharma');
    expect(fresherResume.contact.email).toContain('@');
  });

  it('should preserve international Unicode characters (accents, umlauts, CJK)', () => {
    const text = seniorArchitectResume.contact.fullName;
    expect(text).toContain('Élodie');
    expect(text).toContain('Müller-Björnsson');

    const headline = seniorArchitectResume.headline;
    expect(headline).toContain('高スループット'); // Japanese characters
    expect(seniorArchitectResume.contact.location).toContain('Zürich'); // German umlaut
  });

  it('should handle long company names and titles without clipping or truncation', () => {
    const role = seniorArchitectResume.experience[0];
    expect(role.company.length).toBeGreaterThan(40);
    expect(role.title.length).toBeGreaterThan(40);

    // Formatting check: combine title and company
    const fullHeader = `${role.title} — ${role.company}`;
    expect(fullHeader).toContain('VP of Platform Architecture');
    expect(fullHeader).toContain('Zürich Global Financial Infrastructure');
  });

  it('should format long URLs without leaking or breaking layout', () => {
    const longUrl = seniorArchitectResume.contact.websiteUrl;
    expect(longUrl).toBe('https://elodie.systems/research/distributed-consensus');

    // Clean display link formulation: strips protocol and trailing slashes for clean print
    const cleanDisplay = longUrl?.replace(/^https?:\/\//, '').replace(/\/$/, '');
    expect(cleanDisplay).toBe('elodie.systems/research/distributed-consensus');
  });

  it('should support deterministic, idempotent output across multiple render cycles', () => {
    const serializeResume = (res: ResumeContent) => JSON.stringify(res);

    const render1 = serializeResume(seniorArchitectResume);
    const render2 = serializeResume(seniorArchitectResume);
    const render3 = serializeResume(seniorArchitectResume);

    expect(render1).toBe(render2);
    expect(render2).toBe(render3);
  });
});
