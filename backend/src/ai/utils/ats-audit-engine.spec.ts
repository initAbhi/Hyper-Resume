import { describe, expect, it } from 'vitest';
import {
  METRIC_REGEX,
  analyzePlainResumeTextAts,
  evaluateStructuredResumeAts,
  parseEducationSection,
  parseExperienceSection,
} from './ats-audit-engine.js';
import type { ResumeContent } from '../../resumes/entities/resume.types.js';

describe('5-Dimension Rezi-Style ATS & Parser Audit Engine', () => {
  it('computes 5 weighted dimensions, stack alignment, and bullet bounds on structured resumes', () => {
    const content: ResumeContent = {
      contact: {
        fullName: 'Abhinav Sharma',
        email: 'abhinav@example.com',
        phone: '+91 9876543210',
        linkedinUrl: 'linkedin.com/in/abhinavsharma',
      },
      headline: 'Senior Backend Engineer',
      summary:
        'Distributed systems engineer architecting low-latency NestJS and PostgreSQL payment pipelines.',
      skills: [
        { name: 'NestJS' },
        { name: 'PostgreSQL' },
        { name: 'Redis' },
        { name: 'Rust' },
      ],
      experience: [
        {
          company: 'CloudScale',
          title: 'Senior Backend Engineer',
          startDate: '2022-01',
          current: true,
          bullets: [
            'Architected event-driven NestJS and PostgreSQL ledger pipeline processing 25,000 req/s with 99.98% uptime.',
            'Spearheaded Redis read-through cache tier reducing p99 API latency by 42% across 180K active merchants.',
            'Worked on internal tooling.',
          ],
        },
      ],
      education: [
        {
          school: 'IIT Bombay',
          degree: 'B.Tech',
          field: 'Computer Science',
          graduationDate: '2020',
        },
      ],
    };

    const result = evaluateStructuredResumeAts(content);

    expect(result.findings.dimensions).toHaveLength(5);
    const weightSum = result.findings.dimensions!.reduce((s, d) => s + d.weight, 0);
    expect(weightSum).toBe(100);

    expect(result.findings.actionVerbsCount).toBe(2);
    expect(result.findings.metricsCount).toBe(2);
    expect(result.findings.shortBulletsCount).toBe(1);
    expect(result.findings.stackAlignment?.corroboratedSkills).toEqual([
      'NestJS',
      'PostgreSQL',
      'Redis',
    ]);
    expect(result.findings.stackAlignment?.unreferencedSkills).toEqual(['Rust']);
    // Mid-tier quantified draft — evidence density should keep this out of the 90s
    expect(result.score).toBeGreaterThanOrEqual(35);
    expect(result.score).toBeLessThanOrEqual(85);
    expect(result.findings.parserRisks?.some((r) => r.id === 'contact-pass')).toBe(true);
  });

  it('scores near-empty placeholder resumes under 20', () => {
    const content: ResumeContent = {
      contact: { fullName: 'Abhi Singh', email: 'abhi@example.com' },
      headline: 'backend engineer',
      summary: 'Experienced professional with a proven track record.',
      experience: [
        {
          company: 'sadf',
          title: 'df',
          startDate: '2022',
          current: true,
          bullets: ['df'],
        },
      ],
      education: [{ school: 'University of Technology', degree: 'B.S.', graduationDate: '2021' }],
      skills: [{ name: 'TypeScript' }],
    };

    const result = evaluateStructuredResumeAts(content);
    expect(result.score).toBeLessThanOrEqual(15);
  });

  it('extracts plain-text sections cleanly without flagging header emails as bullets and catches table/glyph parser risks', () => {
    const rawResume = `Abhishek Singh
abhishek@example.com | +91 98765 43210 | linkedin.com/in/abhishek-dev

PROFESSIONAL SUMMARY
Results-driven Backend Engineer with 4 years experience building distributed APIs in TypeScript and PostgreSQL.

EXPERIENCE
FinTech Corp — Backend Engineer (2022-01 – Present)
• Architected payment ingestion service handling 1.2M daily transactions, cutting latency by 35%.
• ★ Deployed ★ multi-region failover cluster saving $120K annually across cloud infrastructure.
TypeScript | Node.js | AWS | Docker

EDUCATION
B.Tech Computer Science — 2021

SKILLS
TypeScript, Node.js, PostgreSQL, AWS, Docker`;

    const result = analyzePlainResumeTextAts(rawResume);

    expect(result.findings.missingSections).toHaveLength(0);
    expect(result.findings.metricsCount).toBe(2);
    // Email header line must NOT be audited as a lowercase experience bullet typo
    expect(
      result.writingAudit.issues.some((i) =>
        i.matchedText.toLowerCase().includes('abhishek'),
      ),
    ).toBe(false);
    // Multi-column pipe line in experience body is caught as a formatting risk
    expect(
      result.findings.parserRisks?.some(
        (r) => r.id === 'layout-table-risk' && r.severity === 'warning',
      ),
    ).toBe(true);

    // Verify parsed preview exists
    expect(result.findings.parsedPreview).toBeDefined();
    expect(result.findings.parsedPreview?.contact.fullName).toBe('Abhishek Singh');
    expect(result.findings.parsedPreview?.skillsByCategory.hardSkills.length).toBeGreaterThan(0);
  });

  it('performs Jobscan-style Job Description keyword matching and simulation', () => {
    const rawResume = `Priya Patel
priya@example.com | +1 555-019-2834 | San Francisco, CA | linkedin.com/in/priya-patel

SUMMARY
Senior Software Engineer specializing in distributed backend architecture with Go, Kubernetes, and PostgreSQL.

EXPERIENCE
FinTech Labs — Senior Backend Engineer (2021 - Present)
• Architected payment streaming pipelines in Go and Kafka processing 50,000 QPS with sub-10ms latency.
• Engineered Kubernetes automated deployments with Docker and Terraform across AWS cloud regions.
• Optimized PostgreSQL indexing strategy, reducing query wait times by 40%.

SKILLS
Go, Python, Kubernetes, Docker, AWS, PostgreSQL, Kafka, Terraform, Redis

EDUCATION
B.S. in Computer Science — UC Berkeley (2020)`;

    const targetJd = `We are looking for a Senior Backend Engineer to build resilient distributed services.
Required Skills:
- 4+ years of professional experience with Go or Python
- Deep expertise in Kubernetes, Docker, and AWS
- Strong relational database experience with PostgreSQL and Redis
- Event streaming with Kafka is required
- Experience with GraphQL is a plus`;

    const result = analyzePlainResumeTextAts(rawResume, 'Senior Backend Engineer', targetJd);

    expect(result.findings.jobDescriptionMatch).toBeDefined();
    const jdMatch = result.findings.jobDescriptionMatch!;
    expect(jdMatch.matchRate).toBeGreaterThanOrEqual(75);

    const matchedNames = jdMatch.matchedKeywords.map((k) => k.keyword.toLowerCase());
    expect(matchedNames).toContain('go');
    expect(matchedNames).toContain('kubernetes');
    expect(matchedNames).toContain('postgresql');
    expect(matchedNames).toContain('kafka');

    // Missing preferred skill
    const missingNames = jdMatch.missingKeywords.map((k) => k.keyword.toLowerCase());
    expect(missingNames).toContain('graphql');

    // Recruiter boolean search simulation
    expect(jdMatch.recruiterSearchSimulation.passedQueries.length).toBeGreaterThan(0);

    // Dual-score architecture verifications (composite is evidence-capped)
    expect(result.atsScore).toBeGreaterThanOrEqual(40);
    expect(result.matchScore).toBe(jdMatch.matchRate);
    expect(result.compositeScore).toBeDefined();
    expect(result.compositeScore!).toBeLessThanOrEqual(
      Math.round(result.atsScore * 0.4 + (result.matchScore || 0) * 0.6),
    );
    expect(result.score).toBe(result.compositeScore);

    // Hard/Soft skills & Title alignment
    expect(jdMatch.hardSkillsMatch).toBeDefined();
    expect(jdMatch.hardSkillsMatch!.percentage).toBeGreaterThanOrEqual(70);
    expect(jdMatch.titleAlignment).toBeDefined();
    expect(jdMatch.titleAlignment!.score).toBeGreaterThanOrEqual(80);
    expect(jdMatch.titleAlignment!.status).toBe('strong');
  });

  it('matches skills through aliases in JD matching (Postgres <-> PostgreSQL, K8s <-> Kubernetes, AWS <-> Amazon Web Services)', () => {
    const rawResumeWithAliases = `Alex Chen
alex@example.com | 555-0199 | San Francisco, CA | linkedin.com/in/alex

SUMMARY
Full stack engineer specializing in cloud architectures and relational databases.

EXPERIENCE
CloudScale — Software Engineer (2022 - Present)
• Built data ingestion pipelines using PostgreSQL, handling 40,000 requests per second.
• Deployed microservices on Kubernetes across Amazon Web Services with 99.99% uptime.
• Developed REST APIs with Node.js reducing endpoint latency by 28%.

SKILLS
PostgreSQL, Kubernetes, Amazon Web Services, Node.js, TypeScript`;

    const jdWithAliases = `Looking for an Engineer with:
- Postgres database design
- K8s cluster management
- AWS cloud infrastructure
- Node backend development`;

    const result = analyzePlainResumeTextAts(rawResumeWithAliases, 'Software Engineer', jdWithAliases);
    const jdMatch = result.findings.jobDescriptionMatch;
    expect(jdMatch).toBeDefined();

    const matched = jdMatch!.matchedKeywords.map((k) => k.keyword.toLowerCase());
    expect(matched).toContain('postgresql');
    expect(matched).toContain('kubernetes');
    expect(matched).toContain('aws');
    expect(matched).toContain('node.js');

    // Should have zero missing skills because all 4 aliases matched!
    expect(jdMatch!.missingKeywords.length).toBe(0);
    expect(jdMatch!.matchRate).toBe(100);
  });

  it('provides clean single ATS score when no Job Description is attached', () => {
    const rawResume = `Alex Chen
alex@example.com | 555-0199 | San Francisco, CA | linkedin.com/in/alex

EXPERIENCE
CloudScale — Software Engineer (2022 - Present)
• Built data ingestion pipelines using PostgreSQL, handling 40,000 requests per second.

SKILLS
PostgreSQL, TypeScript`;

    const result = analyzePlainResumeTextAts(rawResume);
    expect(result.atsScore).toBeDefined();
    expect(result.score).toBe(result.atsScore);
    expect(result.matchScore).toBeUndefined();
    expect(result.compositeScore).toBeUndefined();
    expect(result.findings.jobDescriptionMatch).toBeUndefined();
  });

  it('evaluates Google XYZ formula, action verb repetition, and ATS platform readiness', () => {
    const rawResume = `Rahul Verma
rahul@example.com | +91 9988776655 | Bengaluru, India | linkedin.com/in/rahul-dev

SUMMARY
Full-Stack Engineer with 3+ years experience building web applications.

EXPERIENCE
NextGen Tech — Software Engineer (2022 - Present)
• Developed responsive user interfaces in React lifting client conversion by 22%.
• Developed billing microservice in Node.js slashing checkout latency by 35%.
• Developed automated CI/CD pipeline in GitHub Actions cutting build times from 20 to 5 minutes.
• Helped with database backups.

SKILLS
React, Node.js, Next.js, TypeScript, PostgreSQL, GitHub Actions, Redis

EDUCATION
B.Tech in Information Technology (2022)`;

    const result = analyzePlainResumeTextAts(rawResume);

    // Google XYZ formula
    expect(result.findings.xyzFormulaBulletsCount).toBeGreaterThanOrEqual(2);

    // Verb repetition: "Developed" is used 3 times
    expect(result.findings.repeatedVerbsCount).toBeGreaterThanOrEqual(1);
    expect(
      result.findings.actionVerbAnalysis?.repeatedVerbs.some((v) => v.verb.toLowerCase() === 'developed'),
    ).toBe(true);

    // ATS platform simulations
    expect(result.findings.atsSystemSimulations).toBeDefined();
    expect(result.findings.atsSystemSimulations?.workdayReadiness.status).toBe('pass');
    expect(result.findings.atsSystemSimulations?.greenhouseReadiness.status).toBe('pass');
    expect(result.findings.atsSystemSimulations?.taleoReadiness.status).toBe('pass');
  });

  it('accurately identifies quantifiable impact in METRIC_REGEX while rejecting bare tenure durations', () => {
    // True impact metrics:
    expect(METRIC_REGEX.test('Architected pipeline handling 1.2M daily transactions')).toBe(true);
    expect(METRIC_REGEX.test('Reduced p99 latency by 35% across all endpoints')).toBe(true);
    expect(METRIC_REGEX.test('Spearheaded Redis tier across 180K merchants')).toBe(true);
    expect(METRIC_REGEX.test('Slashing checkout latency to sub-10ms')).toBe(true);
    expect(METRIC_REGEX.test('Shrinking build duration from 14 to 4 minutes')).toBe(true);
    expect(METRIC_REGEX.test('Processing 25,000 req/s with 99.98% uptime')).toBe(true);
    expect(METRIC_REGEX.test('Increased annual recurring revenue by $120K')).toBe(true);
    expect(METRIC_REGEX.test('Scaled backend microservices 3x')).toBe(true);

    // Bare tenure / durations (should NOT be considered accomplishment metrics):
    expect(METRIC_REGEX.test('Worked for 3 years on backend services')).toBe(false);
    expect(METRIC_REGEX.test('Completed internship in 6 months')).toBe(false);
    expect(METRIC_REGEX.test('Supported development team over 4 weeks')).toBe(false);
  });

  it('correctly parses multi-line role headers without creating phantom jobs or missing date warnings', () => {
    const rawResumeWithMultiLineHeaders = `Rahul Verma
rahul.verma@gmail.com
+91 9123456789
Bengaluru, India

Summary
Frontend developer with modern web experience.

Work Experience
Frontend Developer at Alpha Tech Solutions
June 2022 to Present
- Developed new features for customer facing web portal using React.
- Collaborated with UX designers to implement responsive layouts.

Junior Web Developer at Beta Infotech
July 2021 to May 2022
- Maintained company websites using HTML, CSS, and jQuery.
- Helped with database queries and API integration.

Education
Bachelor of Engineering in Information Technology
VTU University, 2017 - 2021

Skills
JavaScript, React, HTML5, CSS3, Redux, Git`;

    const result = analyzePlainResumeTextAts(rawResumeWithMultiLineHeaders);

    // Should have exactly 2 experience blocks, no phantom "Organization" or "Specialist"
    const exp = result.findings.parsedPreview?.experience || [];
    expect(exp).toHaveLength(2);

    expect(exp[0].company).toBe('Alpha Tech Solutions');
    expect(exp[0].title).toBe('Frontend Developer');
    expect(exp[0].startDate).toBe('June 2022');
    expect(exp[0].current).toBe(true);
    expect(exp[0].bulletCount).toBe(2);

    expect(exp[1].company).toBe('Beta Infotech');
    expect(exp[1].title).toBe('Junior Web Developer');
    expect(exp[1].startDate).toBe('July 2021');
    expect(exp[1].endDate).toBe('May 2022');
    expect(exp[1].current).toBe(false);
    expect(exp[1].bulletCount).toBe(2);

    // Dates should pass without false "dates-missing" or "dates-mixed" warning
    const dateRisks = result.findings.parserRisks?.filter((r) => r.category === 'dates') || [];
    expect(dateRisks.some((r) => r.id === 'dates-missing')).toBe(false);
    expect(dateRisks.some((r) => r.id === 'dates-mixed')).toBe(false);
    expect(dateRisks.some((r) => r.id === 'dates-consistent' && r.severity === 'pass')).toBe(true);

    // Education should be merged into 1 clean degree entry, not split into 2
    const edu = result.findings.parsedPreview?.education || [];
    expect(edu).toHaveLength(1);
    expect(edu[0].school).toBe('VTU University');
    expect(edu[0].degree).toContain('Bachelor of Engineering');
    expect(edu[0].graduationDate).toBe('2017 - 2021');

    // Contact location extracted
    expect(result.findings.parsedPreview?.contact.location).toBe('Bengaluru, India');
  });

  it('parseEducationSection cleanly unifies multi-line degree, school, and graduation dates', () => {
    const lines = [
      'Master of Science in Distributed Systems',
      'Stanford University, 2021 - 2023',
      'Bachelor of Technology in Computer Science',
      'IIT Delhi, 2017 - 2021',
    ];

    const parsed = parseEducationSection(lines);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].school).toBe('Stanford University');
    expect(parsed[0].degree).toContain('Master of Science');
    expect(parsed[0].graduationDate).toBe('2021 - 2023');

    expect(parsed[1].school).toBe('IIT Delhi');
    expect(parsed[1].degree).toContain('Bachelor of Technology');
    expect(parsed[1].graduationDate).toBe('2017 - 2021');
  });

  it('evaluates calibrated scoring curves, skill aliases, and tiered action verbs accurately', () => {
    const unquantifiedResume = `Neha Sharma
neha.sharma@example.com
+91 98765 12345
Bengaluru, India | linkedin.com/in/neha-dev

Summary
Full stack software engineer with 2 years of professional web development experience.

Experience
Alpha Tech — Software Engineer (2022-01 - Present)
• Responsible for developing responsive user interfaces using React and JavaScript.
• Collaborated with product designers to implement accessibility standards.
• Assisted with database migration to PostgreSQL.
• Worked on writing unit tests using Jest.

Education
B.Tech in Computer Science — IIT Bombay (2021)

Skills
JavaScript, React, PostgreSQL, Jest, Redux`;

    const baselineResult = analyzePlainResumeTextAts(unquantifiedResume);

    // Baseline unquantified resume: constructive mid band — not inflated into the 70s/80s
    expect(baselineResult.score).toBeGreaterThanOrEqual(25);
    expect(baselineResult.score).toBeLessThanOrEqual(60);

    // Corroborated skills check
    expect(baselineResult.findings.stackAlignment?.corroboratedSkills).toContain('React');
    expect(baselineResult.findings.stackAlignment?.corroboratedSkills).toContain('JavaScript');
    expect(baselineResult.findings.stackAlignment?.corroboratedSkills).toContain('PostgreSQL');
    expect(baselineResult.findings.stackAlignment?.corroboratedSkills).toContain('Jest');

    // Bullet count check: 1 short bullet (6 words: Assisted with database migration to PostgreSQL)
    expect(baselineResult.findings.shortBulletsCount).toBe(1);
    expect(baselineResult.findings.idealBulletCount).toBe(3);

    // Recommendations advise adding metrics and replacing passive openers
    expect(baselineResult.recommendations.some((r) => r.includes('passive opener'))).toBe(true);
    expect(baselineResult.recommendations.some((r) => r.includes('Quantify'))).toBe(true);
  });
});

