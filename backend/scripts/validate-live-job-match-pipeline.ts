/**
 * Live end-to-end job match via AiService.matchRequirements + our calibrated scorer.
 * Run: cd backend && npx tsx scripts/validate-live-job-match-pipeline.ts
 */
import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { GeminiAiProvider } from '../src/ai/providers/gemini-ai.provider.js';
import { JobMatchingService } from '../src/job-matching/job-matching.service.js';
import type { ResumeContent } from '../src/resumes/entities/resume.types.js';

loadEnv({ path: resolve(process.cwd(), '.env') });

class MiniAi {
  constructor(private readonly gemini: GeminiAiProvider) {}
  get name() {
    return this.gemini.name;
  }
  parseJobDescription(text: string) {
    return this.gemini.parseJobDescription(text);
  }
  parseResumeText(text: string) {
    return this.gemini.parseResumeText(text);
  }
  matchRequirements(content: ResumeContent, reqs: any[]) {
    return this.gemini.matchRequirements(content, reqs);
  }
}

const CASES: Array<{
  id: string;
  resume: ResumeContent;
  jd: string;
  maxScore: number;
  minScore?: number;
}> = [
  {
    id: 'empty-vs-sde',
    maxScore: 15,
    resume: {
      contact: { fullName: 'Abhi Singh', email: 'a@b.com' },
      headline: 'backend engineer',
      summary: 'Experienced professional with a proven track record.',
      experience: [
        { company: 'sadf', title: 'df', startDate: '2022', current: true, bullets: ['asdf'] },
      ],
      skills: [{ name: 'TypeScript' }],
      education: [],
    },
    jd: `SDE role requiring React, Node.js, AWS, Docker, CI/CD, SOLID principles, DSA, 2+ years.`,
  },
  {
    id: 'near-empty-one-metric-vs-sde',
    maxScore: 28,
    resume: {
      contact: { fullName: 'Abhi Singh', email: 'a@b.com' },
      headline: 'backend engineer',
      summary: 'Experienced professional with a proven track record.',
      experience: [
        {
          company: 'sadf',
          title: 'df',
          startDate: '2022',
          current: true,
          bullets: [
            'Architected core services handling 100k+ daily transactions with 99.9% uptime.',
          ],
        },
      ],
      skills: [{ name: 'TypeScript' }, { name: 'PostgreSQL' }],
      education: [
        { school: 'University of Technology', degree: 'B.S.', graduationDate: '2021' },
      ],
    },
    jd: `SDE: React, Node.js, AWS, Docker, CI/CD, SOLID, DSA, 2-3 years experience.`,
  },
  {
    id: 'elite-vs-staff-backend',
    minScore: 55,
    maxScore: 100,
    resume: {
      contact: {
        fullName: 'Alexander Sharma',
        email: 'alex@ex.com',
        phone: '555',
        linkedinUrl: 'https://linkedin.com/in/alex',
      },
      headline: 'Staff Distributed Systems Architect',
      summary:
        'Staff engineer with 8+ years designing high-throughput payment pipelines across multi-region Kubernetes clusters.',
      experience: [
        {
          company: 'FinTech Global',
          title: 'Lead Architect',
          startDate: '2021-03',
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
      ],
      skills: [
        { name: 'Go' },
        { name: 'Kubernetes' },
        { name: 'Redis' },
        { name: 'PostgreSQL' },
        { name: 'AWS' },
      ],
      education: [
        { school: 'Stanford', degree: 'M.S.', field: 'CS', graduationDate: '2019' },
      ],
    },
    jd: `Staff backend: Go, Kubernetes, Redis, PostgreSQL, distributed systems, high TPS payments, mentoring.`,
  },
];

async function main() {
  const config = new ConfigService({
    AI_API_KEY: process.env.AI_API_KEY || process.env.GEMINI_API_KEY,
    AI_MODEL: process.env.AI_MODEL || 'gemini-3.1-flash-lite',
  });
  const gemini = new GeminiAiProvider(config as any);
  const ai = new MiniAi(gemini) as any;
  const service = new JobMatchingService(
    { create: () => ({}), save: async (x: any) => x } as any,
    {} as any,
    {} as any,
    { create: () => ({}), save: async (x: any) => x } as any,
    ai,
  );

  let fails = 0;
  for (const c of CASES) {
    const plain = [
      c.resume.contact?.fullName,
      c.resume.headline,
      c.resume.summary,
      ...(c.resume.experience || []).flatMap((e) => [
        `${e.title} @ ${e.company}`,
        ...(e.bullets || []),
      ]),
      'Skills: ' + (c.resume.skills || []).map((s) => s.name).join(', '),
    ]
      .filter(Boolean)
      .join('\n');

    const result = await service.analyzePublicJobMatch({
      resumeText: plain,
      jobDescriptionText: c.jd,
      targetRole: c.resume.headline,
    });

    const score = result.overallScore;
    const okMax = score <= c.maxScore;
    const okMin = c.minScore == null || score >= c.minScore;
    const ok = okMax && okMin;
    if (!ok) fails += 1;
    console.log(
      `${ok ? 'PASS' : 'FAIL'} ${c.id.padEnd(32)} score=${String(score).padStart(3)} range=${c.minScore ?? 0}-${c.maxScore} supported=${result.requirementsAnalysis.filter((r) => r.status === 'supported').length}/${result.requirementsAnalysis.length}`,
    );
  }

  if (fails > 0) {
    console.error(`\nLIVE PIPELINE FAILED (${fails})`);
    process.exit(1);
  }
  console.log('\nLIVE PIPELINE PASSED');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
