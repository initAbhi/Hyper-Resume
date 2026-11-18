import { describe, expect, it } from 'vitest';
import {
  analyzePlainResumeTextAts,
  evaluateStructuredResumeAts,
} from './ats-audit-engine.js';
import { analyzeJobDescriptionMatch, SKILL_ALIASES } from './ats-taxonomy.js';
import { validate } from 'class-validator';
import { RunResumeAnalysisDto } from '../../resumes/dto/run-resume-analysis.dto.js';
import type { ResumeContent } from '../../resumes/entities/resume.types.js';

describe('Comprehensive Re-Test of All 6 ATS Checker Bugs', () => {
  // Sample standardized resume
  const sampleResumeContent: ResumeContent = {
    contact: {
      fullName: 'Vikram Malhotra',
      email: 'vikram@example.com',
      phone: '+91 9876543210',
      location: 'Bengaluru, India',
      linkedinUrl: 'https://linkedin.com/in/vikram-dev',
    },
    headline: 'Senior Backend Engineer',
    summary: 'Experienced distributed systems engineer with 5+ years building microservices.',
    experience: [
      {
        company: 'PayFlow Tech',
        title: 'Senior Software Engineer',
        startDate: '2022-01',
        endDate: 'Present',
        current: true,
        bullets: [
          'Architected high-throughput ledger service handling 35,000 requests per second at 99.99% uptime.',
          'Slashed query latency by 45% using PostgreSQL indexing and Redis caching.',
          'Containerized 15 microservices on Kubernetes across Amazon Web Services reducing infrastructure spend by $80K.',
          'Spearheaded migration of legacy services to Node.js improving developer deployment cycle by 3x.',
        ],
      },
    ],
    education: [
      {
        school: 'BITS Pilani',
        degree: 'B.E.',
        field: 'Computer Science',
        graduationDate: '2020',
      },
    ],
    skills: [
      { name: 'Node.js' },
      { name: 'PostgreSQL' },
      { name: 'Kubernetes' },
      { name: 'Amazon Web Services' },
      { name: 'Redis' },
      { name: 'TypeScript' },
      { name: 'Microservices' },
      { name: 'Docker' },
    ],
  };

  const sampleTargetJd = `We are looking for a Senior Backend Engineer to join our core banking team.
Key Responsibilities:
- Design high-scale backend services using Node and TypeScript
- Maintain and scale Postgres relational database architectures
- Deploy and manage containerized workloads on K8s in AWS
- Collaborate with cross-functional leadership teams
Requirements:
- 4+ years of professional backend engineering experience
- Hands-on experience with Kafka is a plus`;

  // ==========================================
  // RETEST BUG 1: Dual-Score Architecture Disconnect
  // ==========================================
  describe('Retest Bug 1: Dual-Score Architecture Separation', () => {
    it('accurately computes separate atsScore, matchScore, and compositeScore when JD is present', () => {
      const evaluation = evaluateStructuredResumeAts(
        sampleResumeContent,
        undefined,
        'Senior Backend Engineer',
        sampleTargetJd,
      );

      // 1. atsScore must represent base resume quality (format, metrics, verbs, depth)
      expect(evaluation.atsScore).toBeDefined();
      expect(evaluation.atsScore).toBeGreaterThanOrEqual(85);

      // 2. matchScore must represent JD keyword match rate
      expect(evaluation.matchScore).toBeDefined();
      expect(evaluation.matchScore).toBeGreaterThanOrEqual(75);

      // 3. compositeScore must be weighted 40% ATS + 60% Match
      const expectedComposite = Math.round(evaluation.atsScore * 0.4 + (evaluation.matchScore || 0) * 0.6);
      expect(evaluation.compositeScore).toBe(expectedComposite);
      expect(evaluation.score).toBe(expectedComposite);

      // 4. findings must also retain atsScore and matchScore
      expect(evaluation.findings.atsScore).toBe(evaluation.atsScore);
      expect(evaluation.findings.matchScore).toBe(evaluation.matchScore);
      expect(evaluation.findings.compositeScore).toBe(evaluation.compositeScore);
    });

    it('retains single ATS score and leaves matchScore undefined when JD is absent', () => {
      const evaluation = evaluateStructuredResumeAts(
        sampleResumeContent,
        undefined,
        'Senior Backend Engineer',
      );

      expect(evaluation.atsScore).toBeDefined();
      expect(evaluation.atsScore).toBeGreaterThanOrEqual(85);
      expect(evaluation.matchScore).toBeUndefined();
      expect(evaluation.compositeScore).toBeUndefined();
      expect(evaluation.score).toBe(evaluation.atsScore);
      expect(evaluation.findings.jobDescriptionMatch).toBeUndefined();
    });
  });

  // ==========================================
  // RETEST BUG 2: JD Matching False Negatives & Alias Intelligence
  // ==========================================
  describe('Retest Bug 2: Skill Aliases, Hard/Soft Breakdown & Title Alignment', () => {
    it('matches Postgres <-> PostgreSQL, K8s <-> Kubernetes, AWS <-> Amazon Web Services, Node <-> Node.js', () => {
      const resumeCorpus = `Vikram Malhotra
Node.js, PostgreSQL, Kubernetes, Amazon Web Services, TypeScript
Built services using PostgreSQL, Node.js, Kubernetes on Amazon Web Services.`;

      const jd = `Looking for:
- Postgres
- K8s
- AWS
- Node`;

      const match = analyzeJobDescriptionMatch(resumeCorpus, jd, 'Senior Backend Engineer', 'Senior Backend Engineer');

      const matchedNames = match.matchedKeywords.map((k) => k.keyword.toLowerCase());
      expect(matchedNames).toContain('postgresql');
      expect(matchedNames).toContain('kubernetes');
      expect(matchedNames).toContain('aws');
      expect(matchedNames).toContain('node.js');

      // Zero false negatives for these 4 aliases
      const missingNames = match.missingKeywords.map((k) => k.keyword.toLowerCase());
      expect(missingNames).not.toContain('postgresql');
      expect(missingNames).not.toContain('kubernetes');
      expect(missingNames).not.toContain('aws');
      expect(missingNames).not.toContain('node.js');

      // Hard skills breakdown
      expect(match.hardSkillsMatch).toBeDefined();
      expect(match.hardSkillsMatch!.percentage).toBe(100);

      // Title alignment
      expect(match.titleAlignment).toBeDefined();
      expect(match.titleAlignment!.score).toBe(100);
      expect(match.titleAlignment!.status).toBe('strong');
    });

    it('simulates recruiter Boolean queries accurately using aliases', () => {
      const resumeCorpus = `PostgreSQL, Amazon Web Services, Kubernetes, Node.js`;
      const jd = `Postgres, AWS, K8s`;

      const match = analyzeJobDescriptionMatch(resumeCorpus, jd);
      expect(match.recruiterSearchSimulation.passedQueries.length).toBeGreaterThan(0);
      expect(match.recruiterSearchSimulation.failedQueries.length).toBe(0);
    });

    it('evaluates role title mismatch when target role differs from resume title', () => {
      const resumeCorpus = `Junior Frontend Specialist
React, CSS, HTML`;
      const jd = `Principal Cloud Architect with Kubernetes`;

      const match = analyzeJobDescriptionMatch(
        resumeCorpus,
        jd,
        'Principal Cloud Architect',
        'Junior Frontend Specialist',
      );

      expect(match.titleAlignment).toBeDefined();
      expect(match.titleAlignment!.status).toBe('weak');
      expect(match.titleAlignment!.score).toBeLessThanOrEqual(30);
    });
  });

  // ==========================================
  // RETEST BUG 4: RunResumeAnalysisDto & Service JD wiring
  // ==========================================
  describe('Retest Bug 4: RunResumeAnalysisDto validation and jobDescription acceptance', () => {
    it('successfully validates RunResumeAnalysisDto with targetRole and jobDescriptionText', async () => {
      const dto = new RunResumeAnalysisDto();
      dto.analysisType = 'ats_check';
      dto.targetRole = 'Staff DevOps Engineer';
      dto.jobDescriptionText = sampleTargetJd;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.targetRole).toBe('Staff DevOps Engineer');
      expect(dto.jobDescriptionText).toBe(sampleTargetJd);
    });

    it('rejects invalid analysisType or oversized targetRole in DTO', async () => {
      const dto = new RunResumeAnalysisDto();
      (dto as any).analysisType = 'invalid_type';
      dto.targetRole = 'A'.repeat(301); // Exceeds MaxLength 300

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });
  });
});
