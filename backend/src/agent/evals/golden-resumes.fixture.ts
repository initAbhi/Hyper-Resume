import type { ResumeContent } from '../../resumes/entities/resume.types.js';

export interface GoldenResumeEvalCase {
  id: string;
  label: string;
  targetRole: string;
  customInstruction: string;
  targetJobDescription?: string;
  resumeName: string;
  templateKey: string;
  content: ResumeContent;
}

/**
 * 10 diverse, realistic resumes spanning seniority levels, domains, and common ATS weaknesses.
 * Used by the Zero-Mock Golden Eval Regression Gate to measure ATS score delta,
 * action-verb diversity, zero fabricated metrics, strict responseSchema JSON, and latency p95.
 */
export const GOLDEN_EVAL_CASES: GoldenResumeEvalCase[] = [
  {
    id: 'golden-01-junior-fullstack',
    label: 'Junior Full-Stack Dev (Passive Verbs)',
    targetRole: 'Full-Stack Software Engineer',
    customInstruction:
      'Audit and optimize my headline, summary, and experience bullets to eliminate passive openers and improve ATS score.',
    resumeName: 'Rohan Mehta Full-Stack',
    templateKey: 'clean-modern',
    content: {
      contact: {
        fullName: 'Rohan Mehta',
        email: 'rohan.mehta@example.com',
        phone: '+1-415-555-0101',
        location: 'San Jose, CA',
        githubUrl: 'github.com/rohanmehta',
      },
      headline: 'Developer',
      summary: 'Worked on web development projects using React and Node.js. Looking for a software role.',
      skills: [
        { name: 'TypeScript', category: 'Languages' },
        { name: 'React', category: 'Frontend' },
        { name: 'Node.js', category: 'Backend' },
        { name: 'PostgreSQL', category: 'Databases' },
        { name: 'Docker', category: 'DevOps' },
      ],
      experience: [
        {
          company: 'BrightCart Labs',
          title: 'Junior Software Engineer',
          startDate: '2023-06',
          current: true,
          bullets: [
            'Worked on React product catalog pages and fixed frontend UI bugs.',
            'Helped with Node.js REST endpoints and PostgreSQL queries for order checkout.',
            'Responsible for writing unit tests and maintaining Docker containers.',
          ],
        },
      ],
      projects: [
        {
          name: 'TaskPulse',
          description: 'Team task board built with React and PostgreSQL.',
          highlights: ['Built real-time kanban board using TypeScript and Node.js WebSockets.'],
        },
      ],
      education: [{ school: 'San Jose State University', degree: 'B.S.', field: 'Computer Science', graduationDate: '2023' }],
    },
  },
  {
    id: 'golden-02-senior-backend',
    label: 'Senior Backend (Repeated Verbs + Unbacked Skills)',
    targetRole: 'Senior Backend Engineer',
    customInstruction:
      'Fix repeated action verbs across my bullets, align skills with my actual experience, and push my ATS score higher without inventing metrics.',
    resumeName: 'Elena Vance Backend',
    templateKey: 'jake-classic',
    content: {
      contact: {
        fullName: 'Elena Vance',
        email: 'elena.vance@example.com',
        phone: '+1-206-555-0144',
        location: 'Seattle, WA',
        linkedinUrl: 'linkedin.com/in/elenavance',
      },
      headline: 'Backend Software Engineer',
      summary: 'Backend engineer with 7 years building microservices in Go, TypeScript, and PostgreSQL.',
      skills: [
        { name: 'Go', category: 'Languages' },
        { name: 'TypeScript', category: 'Languages' },
        { name: 'PostgreSQL', category: 'Data' },
        { name: 'Redis', category: 'Data' },
        { name: 'Kafka', category: 'Messaging' },
        { name: 'Rust', category: 'Languages' },
        { name: 'Terraform', category: 'Infra' },
      ],
      experience: [
        {
          company: 'StreamGrid Systems',
          title: 'Senior Backend Engineer',
          startDate: '2021-03',
          current: true,
          bullets: [
            'Built distributed billing APIs in Go and PostgreSQL processing 35,000 requests per minute.',
            'Built Redis caching layer that reduced p95 read latency by 44% across core endpoints.',
            'Built Kafka event consumers handling 2M daily ledger events with zero data loss.',
          ],
        },
        {
          company: 'DataHarbor',
          title: 'Software Engineer',
          startDate: '2018-07',
          endDate: '2021-02',
          current: false,
          bullets: [
            'Built TypeScript webhook ingestion workers supporting 400 enterprise integrations.',
            'Built automated PostgreSQL migration checks preventing schema regressions in CI.',
          ],
        },
      ],
      education: [{ school: 'University of Washington', degree: 'B.S.', field: 'Computer Science', graduationDate: '2018' }],
    },
  },
  {
    id: 'golden-03-frontend-metrics',
    label: 'Frontend Engineer (Preserve Strong Metrics)',
    targetRole: 'Staff Frontend Engineer',
    customInstruction:
      'Polish my summary and bullets for Staff Frontend Engineer while strictly preserving every existing metric.',
    resumeName: 'Maya Lin Frontend',
    templateKey: 'clean-modern',
    content: {
      contact: {
        fullName: 'Maya Lin',
        email: 'maya.lin@example.com',
        location: 'New York, NY',
        githubUrl: 'github.com/mayalin',
      },
      headline: 'Frontend Engineer',
      summary: 'Frontend engineer specializing in React, Next.js, TypeScript, and design systems.',
      skills: [
        { name: 'React', category: 'Frontend' },
        { name: 'Next.js', category: 'Frontend' },
        { name: 'TypeScript', category: 'Languages' },
        { name: 'Tailwind CSS', category: 'Styling' },
        { name: 'Playwright', category: 'Testing' },
      ],
      experience: [
        {
          company: 'Velvet Commerce',
          title: 'Senior Frontend Engineer',
          startDate: '2021-01',
          current: true,
          bullets: [
            'Led Next.js App Router migration reducing LCP from 3.4s to 1.2s across 180k monthly shoppers.',
            'Created accessible React component library adopted by 14 product squads with 0 WCAG AA regressions.',
            'Cut JavaScript bundle size by 38% via dynamic imports and Playwright visual regression gating.',
          ],
        },
      ],
      education: [{ school: 'NYU', degree: 'B.A.', field: 'Computer Science', graduationDate: '2019' }],
    },
  },
  {
    id: 'golden-04-ml-engineer',
    label: 'ML Engineer (Academic Phrasing)',
    targetRole: 'Machine Learning Engineer',
    customInstruction:
      'Rewrite my academic-sounding bullets into crisp production impact statements for ML Engineer ATS screening.',
    resumeName: 'Dr. Kenji Sato ML',
    templateKey: 'awesome-cv',
    content: {
      contact: {
        fullName: 'Kenji Sato',
        email: 'kenji.sato@example.com',
        location: 'Boston, MA',
      },
      headline: 'ML Researcher',
      summary: 'Did research in natural language processing and deep learning models using Python and PyTorch.',
      skills: [
        { name: 'Python', category: 'Languages' },
        { name: 'PyTorch', category: 'ML' },
        { name: 'FastAPI', category: 'Backend' },
        { name: 'PostgreSQL', category: 'Data' },
        { name: 'Docker', category: 'MLOps' },
      ],
      experience: [
        {
          company: 'MedInsight AI',
          title: 'Machine Learning Engineer',
          startDate: '2022-05',
          current: true,
          bullets: [
            'Worked on fine-tuning PyTorch clinical text classification models improving F1 score from 0.78 to 0.91.',
            'Helped deploy FastAPI model inference containers on Docker serving 12,000 daily predictions.',
            'Responsible for building Python evaluation pipelines backed by PostgreSQL experiment logs.',
          ],
        },
      ],
      education: [{ school: 'MIT', degree: 'M.S.', field: 'Machine Learning', graduationDate: '2022' }],
    },
  },
  {
    id: 'golden-05-devops-sre',
    label: 'DevOps / SRE Engineer (Cloud Infra)',
    targetRole: 'Senior Site Reliability Engineer',
    customInstruction:
      'Strengthen my SRE headline, summary, and bullet action verbs for Kubernetes and AWS ATS roles.',
    resumeName: 'Carlos Mendez SRE',
    templateKey: 'minimalist',
    content: {
      contact: {
        fullName: 'Carlos Mendez',
        email: 'carlos.mendez@example.com',
        location: 'Austin, TX',
      },
      headline: 'DevOps Guy',
      summary: 'Managed AWS servers, Kubernetes clusters, and CI/CD pipelines.',
      skills: [
        { name: 'AWS', category: 'Cloud' },
        { name: 'Kubernetes', category: 'Orchestration' },
        { name: 'Terraform', category: 'IaC' },
        { name: 'Docker', category: 'Containers' },
        { name: 'Prometheus', category: 'Observability' },
        { name: 'GitHub Actions', category: 'CI/CD' },
      ],
      experience: [
        {
          company: 'SkyBridge Cloud',
          title: 'Site Reliability Engineer',
          startDate: '2020-09',
          current: true,
          bullets: [
            'Managed multi-region AWS EKS Kubernetes clusters sustaining 99.97% uptime across 45 microservices.',
            'Managed Terraform infrastructure modules cutting environment provisioning time from 4 hours to 18 minutes.',
            'Managed Prometheus alerting and GitHub Actions rollbacks reducing MTTR by 52%.',
          ],
        },
      ],
      certifications: [{ name: 'AWS Certified Solutions Architect', issuer: 'AWS', issueDate: '2023' }],
      education: [{ school: 'UT Austin', degree: 'B.S.', field: 'Information Systems', graduationDate: '2020' }],
    },
  },
  {
    id: 'golden-06-product-manager',
    label: 'B2B SaaS Product Manager (Non-Eng Domain)',
    targetRole: 'Senior Product Manager',
    customInstruction:
      'Optimize my B2B SaaS Product Manager resume for ATS clarity and strong leadership verbs without inventing metrics.',
    resumeName: 'Hannah Brooks PM',
    templateKey: 'executive',
    content: {
      contact: {
        fullName: 'Hannah Brooks',
        email: 'hannah.brooks@example.com',
        location: 'Chicago, IL',
        linkedinUrl: 'linkedin.com/in/hannahbrooks',
      },
      headline: 'Product Manager',
      summary: 'Product manager focused on B2B SaaS onboarding, pricing experiments, and cross-functional roadmaps.',
      skills: [
        { name: 'Product Strategy', category: 'Core' },
        { name: 'Roadmapping', category: 'Core' },
        { name: 'SQL', category: 'Analytics' },
        { name: 'A/B Testing', category: 'Analytics' },
        { name: 'Jira', category: 'Tools' },
      ],
      experience: [
        {
          company: 'PulseCRM',
          title: 'Product Manager',
          startDate: '2021-04',
          current: true,
          bullets: [
            'Worked on self-serve B2B onboarding redesign lifting trial-to-paid conversion from 8% to 13%.',
            'Helped prioritize quarterly Jira roadmaps across 2 engineering squads and design partners.',
            'Responsible for SQL cohort analysis and A/B testing on enterprise billing tiers generating $1.8M ARR.',
          ],
        },
      ],
      education: [{ school: 'Northwestern University', degree: 'B.A.', field: 'Economics', graduationDate: '2018' }],
    },
  },
  {
    id: 'golden-07-appsec-engineer',
    label: 'Cybersecurity / AppSec Engineer',
    targetRole: 'Application Security Engineer',
    customInstruction:
      'Upgrade my headline, summary, and security bullets for ATS compliance while keeping all facts strictly accurate.',
    resumeName: 'Nadia Al-Mansoor AppSec',
    templateKey: 'jake-classic',
    content: {
      contact: {
        fullName: 'Nadia Al-Mansoor',
        email: 'nadia.security@example.com',
        location: 'Toronto, Canada',
      },
      headline: 'Security Analyst',
      summary: 'Security professional doing penetration testing, OWASP code reviews, and cloud hardening.',
      skills: [
        { name: 'OWASP Top 10', category: 'Security' },
        { name: 'Burp Suite', category: 'Tools' },
        { name: 'Python', category: 'Scripting' },
        { name: 'AWS IAM', category: 'Cloud Security' },
        { name: 'OAuth 2.0', category: 'Auth' },
      ],
      experience: [
        {
          company: 'VaultPay Financial',
          title: 'Application Security Engineer',
          startDate: '2021-08',
          current: true,
          bullets: [
            'Did threat modeling and OWASP Top 10 reviews across 18 payment APIs prior to SOC 2 audits.',
            'Used Burp Suite and Python scripts to remediate 27 critical/high SSRF and OAuth 2.0 findings.',
            'Worked on AWS IAM least-privilege policies across production accounts.',
          ],
        },
      ],
      certifications: [{ name: 'OSCP', issuer: 'OffSec', issueDate: '2022' }],
      education: [{ school: 'University of Waterloo', degree: 'B.C.S.', field: 'Computer Science', graduationDate: '2020' }],
    },
  },
  {
    id: 'golden-08-mobile-engineer',
    label: 'Mobile Engineer (Project-Heavy)',
    targetRole: 'React Native Mobile Engineer',
    customInstruction:
      'Optimize both my experience bullets and projects highlights for a React Native Mobile Engineer role.',
    resumeName: 'Lucas Silva Mobile',
    templateKey: 'clean-modern',
    content: {
      contact: {
        fullName: 'Lucas Silva',
        email: 'lucas.silva@example.com',
        location: 'Remote',
        githubUrl: 'github.com/lucassilva',
      },
      headline: 'App Developer',
      summary: 'Mobile developer making iOS and Android apps with React Native and TypeScript.',
      skills: [
        { name: 'React Native', category: 'Mobile' },
        { name: 'TypeScript', category: 'Languages' },
        { name: 'Swift', category: 'Mobile' },
        { name: 'GraphQL', category: 'APIs' },
        { name: 'Firebase', category: 'Backend' },
      ],
      experience: [
        {
          company: 'FitTrack Mobile',
          title: 'Mobile Software Engineer',
          startDate: '2022-01',
          current: true,
          bullets: [
            'Worked on React Native offline workout sync serving 65,000 active iOS and Android users.',
            'Fixed Swift native bridge crash issues lifting crash-free sessions from 97.1% to 99.6%.',
          ],
        },
      ],
      projects: [
        {
          name: 'SplitBill Go',
          description: 'Offline-first expense sharing app built in React Native and GraphQL.',
          highlights: [
            'Made receipt scanning flow with Firebase authentication and TypeScript state sync.',
          ],
        },
      ],
      education: [{ school: 'USP', degree: 'B.S.', field: 'Software Engineering', graduationDate: '2021' }],
    },
  },
  {
    id: 'golden-09-eng-manager',
    label: 'Engineering Manager (Org Metrics)',
    targetRole: 'Engineering Manager',
    customInstruction:
      'Refine my Engineering Manager resume for executive ATS impact while preserving exact team size and budget figures.',
    resumeName: 'David Okafor EM',
    templateKey: 'executive',
    content: {
      contact: {
        fullName: 'David Okafor',
        email: 'david.okafor@example.com',
        location: 'London, UK',
        linkedinUrl: 'linkedin.com/in/davidokafor',
      },
      headline: 'Manager',
      summary: 'Managed engineering teams delivering SaaS backend platforms and hiring plans.',
      skills: [
        { name: 'Engineering Leadership', category: 'Management' },
        { name: 'System Design', category: 'Architecture' },
        { name: 'TypeScript', category: 'Languages' },
        { name: 'PostgreSQL', category: 'Data' },
        { name: 'Agile Delivery', category: 'Process' },
      ],
      experience: [
        {
          company: 'FinLedger UK',
          title: 'Engineering Manager',
          startDate: '2020-02',
          current: true,
          bullets: [
            'Managed 3 cross-functional squads (18 engineers) delivering TypeScript and PostgreSQL core banking services.',
            'Managed annual $3.2M engineering budget and reduced cloud infrastructure spend by 24%.',
            'Managed hiring rubric and mentorship tracks maintaining 94% annual engineer retention.',
          ],
        },
      ],
      education: [{ school: 'Imperial College London', degree: 'M.Eng.', field: 'Computing', graduationDate: '2015' }],
    },
  },
  {
    id: 'golden-10-sdet-jd-tailor',
    label: 'SDET / QA Automation (JD Tailoring)',
    targetRole: 'Senior QA Automation Engineer (SDET)',
    targetJobDescription:
      'Senior SDET role: Design Playwright and TypeScript E2E test frameworks, CI/CD quality gates in GitHub Actions, REST API contract testing, and performance regression suites for SaaS web apps.',
    customInstruction:
      'Tailor my headline, summary, bullets, and skills to match the Senior SDET job description using only my real experience.',
    resumeName: 'Ananya Verma SDET',
    templateKey: 'clean-modern',
    content: {
      contact: {
        fullName: 'Ananya Verma',
        email: 'ananya.verma@example.com',
        location: 'Pune, India',
      },
      headline: 'QA Tester',
      summary: 'QA engineer testing web applications manually and with automated scripts.',
      skills: [
        { name: 'Playwright', category: 'Automation' },
        { name: 'TypeScript', category: 'Languages' },
        { name: 'REST APIs', category: 'Testing' },
        { name: 'GitHub Actions', category: 'CI/CD' },
        { name: 'SQL', category: 'Data' },
      ],
      experience: [
        {
          company: 'CloudDocs Suite',
          title: 'QA Automation Engineer',
          startDate: '2021-07',
          current: true,
          bullets: [
            'Worked on Playwright and TypeScript end-to-end tests covering 140 critical checkout and editor flows.',
            'Helped integrate automated REST API regression suites into GitHub Actions cutting release QA from 2 days to 45 minutes.',
            'Responsible for SQL database validation checks catching 30+ pre-release defects per quarter.',
          ],
        },
      ],
      education: [{ school: 'COEP Pune', degree: 'B.E.', field: 'Computer Engineering', graduationDate: '2021' }],
    },
  },
];

