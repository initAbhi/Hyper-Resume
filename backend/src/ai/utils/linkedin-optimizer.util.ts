import type {
  LinkedInAboutOption,
  LinkedInExperienceOptimization,
  LinkedInFeaturedPrompt,
  LinkedInHeadlineOption,
  LinkedInOptimizeRequest,
  LinkedInOptimizeResult,
} from '../interfaces/ai-provider.interface.js';
import type { ResumeContent } from '../../resumes/entities/resume.types.js';

export const LINKEDIN_HEADLINE_MAX_CHARS = 220;
export const LINKEDIN_ABOUT_MAX_CHARS = 2600;
export const LINKEDIN_ABOUT_FOLD_CHARS = 265;

const ROLE_SKILL_CATALOG: Array<{ pattern: RegExp; canonical: string }> = [
  { pattern: /\btypescript\b/i, canonical: 'TypeScript' },
  { pattern: /\bjavascript\b/i, canonical: 'JavaScript' },
  { pattern: /\bgo(?:lang)?\b/i, canonical: 'Go' },
  { pattern: /\bpython\b/i, canonical: 'Python' },
  { pattern: /\bjava\b/i, canonical: 'Java' },
  { pattern: /\brust\b/i, canonical: 'Rust' },
  { pattern: /\breact(?:\.js)?\b/i, canonical: 'React' },
  { pattern: /\bnext\.?js\b/i, canonical: 'Next.js' },
  { pattern: /\bnode\.?js\b/i, canonical: 'Node.js' },
  { pattern: /\bnest\.?js\b/i, canonical: 'NestJS' },
  { pattern: /\bpostgresql|postgres\b/i, canonical: 'PostgreSQL' },
  { pattern: /\bredis\b/i, canonical: 'Redis' },
  { pattern: /\bkafka\b/i, canonical: 'Apache Kafka' },
  { pattern: /\bkubernetes|k8s\b/i, canonical: 'Kubernetes' },
  { pattern: /\bdocker\b/i, canonical: 'Docker' },
  { pattern: /\bterraform\b/i, canonical: 'Terraform' },
  { pattern: /\baws\b/i, canonical: 'AWS' },
  { pattern: /\bgcp|google cloud\b/i, canonical: 'Google Cloud' },
  { pattern: /\bazure\b/i, canonical: 'Microsoft Azure' },
  { pattern: /\bprometheus\b/i, canonical: 'Prometheus' },
  { pattern: /\bopentelemetry\b/i, canonical: 'OpenTelemetry' },
  { pattern: /\bgraphql\b/i, canonical: 'GraphQL' },
  { pattern: /\bdistributed systems\b/i, canonical: 'Distributed Systems' },
  { pattern: /\bmicroservices\b/i, canonical: 'Microservices' },
  { pattern: /\bsystem design\b/i, canonical: 'System Design' },
  { pattern: /\bci\/?cd\b/i, canonical: 'CI/CD' },
  { pattern: /\bproduct management\b/i, canonical: 'Product Management' },
  { pattern: /\bsql\b/i, canonical: 'SQL' },
];

export function clampHeadline(raw: string, maxChars = LINKEDIN_HEADLINE_MAX_CHARS): string {
  const clean = raw.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxChars) return clean;
  const sliced = clean.slice(0, maxChars - 1);
  const lastSep = Math.max(sliced.lastIndexOf(' | '), sliced.lastIndexOf(' · '), sliced.lastIndexOf(' '));
  return (lastSep > maxChars * 0.5 ? sliced.slice(0, lastSep) : sliced).trim();
}

export function extractFoldPreview(about: string): string {
  const clean = about.replace(/\r\n/g, '\n').trim();
  if (clean.length <= LINKEDIN_ABOUT_FOLD_CHARS) return clean;
  return clean.slice(0, LINKEDIN_ABOUT_FOLD_CHARS).trimEnd();
}

export function extractKeywordsFromText(text: string): string[] {
  if (!text) return [];
  const hits: string[] = [];
  for (const item of ROLE_SKILL_CATALOG) {
    if (item.pattern.test(text)) {
      hits.push(item.canonical);
    }
  }
  return hits;
}

function sharpenBulletWithoutInventing(bullet: string): string {
  return bullet
    .trim()
    .replace(/^(?:was\s+)?responsible\s+for\s+/i, 'Owned ')
    .replace(/^(?:i\s+|we\s+)?worked\s+on\s+/i, 'Engineered ')
    .replace(/^(?:i\s+|we\s+)?helped\s+(?:with\s+)?/i, 'Contributed directly to ')
    .replace(/^(?:i\s+|we\s+)?assisted\s+(?:with\s+)?/i, 'Supported delivery of ');
}

export function buildDeterministicLinkedInOptimization(
  input: LinkedInOptimizeRequest,
  providerName = 'mock',
): LinkedInOptimizeResult {
  const profile: ResumeContent = input.profile;
  const targetRole =
    input.targetRole?.trim() ||
    profile.experience?.[0]?.title?.trim() ||
    profile.headline?.split('|')[0]?.trim() ||
    'Software Engineer';

  const declaredSkills = (profile.skills || [])
    .map((s) => s.name?.trim())
    .filter((s): s is string => Boolean(s));

  const evidencedInText = extractKeywordsFromText(experience_corpus_text(profile));
  const declaredSet = new Set(declaredSkills.map((s) => s.toLowerCase()));

  const evidencedSkillsToAdd = evidencedInText.filter(
    (kw) => !declaredSet.has(kw.toLowerCase()),
  );

  const allVerifiedSkills = [
    ...declaredSkills,
    ...evidencedSkillsToAdd,
  ];

  const jdText = `${input.targetRole || ''} ${input.industry || ''} ${input.targetJobDescription || ''}`;
  const targetRoleTerms = extractKeywordsFromText(jdText);
  const allVerifiedLower = new Set(allVerifiedSkills.map((s) => s.toLowerCase()));
  const targetRoleKeywordsToConfirm = targetRoleTerms.filter(
    (kw) => !allVerifiedLower.has(kw.toLowerCase()),
  );

  // Order verified skills giving priority to JD / target role matches
  const jdSet = new Set(targetRoleTerms.map((k) => k.toLowerCase()));
  const prioritizedSkills = [
    ...allVerifiedSkills.filter((s) => jdSet.has(s.toLowerCase())),
    ...allVerifiedSkills.filter((s) => !jdSet.has(s.toLowerCase())),
  ].filter((v, i, arr) => arr.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i);

  const top3 = prioritizedSkills.slice(0, 3);
  const top5 = prioritizedSkills.slice(0, 5);

  const latestExp = profile.experience?.[0];
  const allBullets = (profile.experience || [])
    .flatMap((e) => e.bullets || [])
    .map((b) => b.trim())
    .filter(Boolean);

  const metricBullet =
    allBullets.find((b) => /\d+[%+xXMKBk]|\$\d+|\d+ms/i.test(b)) || allBullets[0] || '';
  const compactMetricPhrase = metricBullet
    ? metricBullet
        .replace(/\.$/, '')
        .split(',')[0]
        .slice(0, 82)
        .trim()
    : '';

  const industryTag = input.industry?.trim() || 'High-Reliability Cloud & Product Systems';
  const currentCompanyTag = latestExp?.company?.trim();

  const rawHeadlines: Array<{
    id: string;
    style: string;
    text: string;
    whyItWorks: string;
  }> = [
    {
      id: 'seo-search',
      style: 'Search-First SEO',
      text: `${targetRole} | ${top5.join(' • ') || 'System Architecture & Delivery'} | ${industryTag}`,
      whyItWorks:
        'Front-loads exact recruiter search title and top 5 indexed skills within the 220-character headline budget.',
    },
    {
      id: 'impact-proof',
      style: 'Impact & Scale Proof',
      text: `${targetRole}${currentCompanyTag ? ` @ ${currentCompanyTag}` : ''} | ${top3.join(', ') || 'Core Engineering'}${compactMetricPhrase ? ` — ${compactMetricPhrase}` : ''}`,
      whyItWorks:
        'Pairs verified employer pedigree with a concrete, sourced achievement in search result previews.',
    },
    {
      id: 'exec-authority',
      style: 'Executive Authority',
      text: `${targetRole} | Architecting Resilient ${top3.slice(0, 2).join(' & ') || 'Platform'} Systems | ${top3[2] || industryTag}`,
      whyItWorks:
        'Positions you as a strategic owner rather than just an individual contributor.',
    },
    {
      id: 'niche-specialist',
      style: 'Stack Specialist',
      text: `${targetRole} specializing in ${top5.slice(0, 4).join(', ') || 'Distributed Architecture'}`,
      whyItWorks:
        'Crisp, noise-free phrasing ideal for technical founders and engineering hiring managers.',
    },
    {
      id: 'recruiter-clarity',
      style: 'Candidate Value Prop',
      text: `${targetRole} · Helping engineering orgs scale reliability & speed (${top3.join(' / ') || 'Systems'})`,
      whyItWorks:
        'Connects technical stack directly to business outcomes like reliability, latency, and release velocity.',
    },
  ];

  const headlineSuggestions: LinkedInHeadlineOption[] = rawHeadlines.map((item) => {
    const clamped = clampHeadline(item.text);
    const included = prioritizedSkills.filter((s) =>
      clamped.toLowerCase().includes(s.toLowerCase()),
    );
    return {
      id: item.id,
      style: item.style,
      headline: clamped,
      charCount: clamped.length,
      keywordsIncluded: included,
      whyItWorks: item.whyItWorks,
    };
  });

  const proofPoints = allBullets.slice(0, 3).map((b) => `• ${sharpenBulletWithoutInventing(b)}`);
  const contactEmail = profile.contact?.email?.trim();
  const stackLine =
    prioritizedSkills.slice(0, 10).join(' · ') || 'Full-stack & Distributed Architecture';
  const companyList = (profile.experience || [])
    .map((e) => e.company?.trim())
    .filter(Boolean)
    .slice(0, 3);

  const aboutTemplates: Array<{ id: string; tone: string; body: string }> = [
    {
      id: 'about-impact',
      tone: 'Impact & Metrics',
      body: [
        `I build and scale production ${top3.slice(0, 2).join(' & ') || 'backend'} systems as a ${targetRole} focused on reliability, low latency, and measurable business execution.`,
        '',
        companyList.length > 0
          ? `Across roles at ${companyList.join(', ')}, my work has centered on turning complex operational bottlenecks into resilient software:`
          : 'Recent verified engineering deliverables include:',
        ...(proofPoints.length > 0
          ? proofPoints
          : ['• Delivered end-to-end production systems aligned with reliability and performance SLAs.']),
        '',
        `Core Stack & Specialties: ${stackLine}`,
        '',
        `Open to ${targetRole} conversations${input.industry?.trim() ? ` in ${input.industry.trim()}` : ''}.${contactEmail ? ` Reach out via LinkedIn DM or ${contactEmail}.` : ' Feel free to connect via LinkedIn DM.'}`,
      ]
        .join('\n')
        .slice(0, LINKEDIN_ABOUT_MAX_CHARS),
    },
    {
      id: 'about-executive',
      tone: 'Executive',
      body: [
        `Strategic ${targetRole} with a proven track record architecting mission-critical systems at ${currentCompanyTag || 'high-growth technology teams'}.`,
        '',
        profile.summary?.trim() ||
          `Hands-on technical leader bridging system design discipline with cross-functional delivery in ${top3.join(', ') || 'cloud engineering'}.`,
        '',
        'Selected Highlights:',
        ...(proofPoints.length > 0
          ? proofPoints.slice(0, 2)
          : ['• Led architecture modernization improving system uptime and team delivery speed.']),
        '',
        `Domains: ${top5.join(' | ') || 'System Architecture | Platform Reliability'}`,
        `Connect: Happy to compare notes with engineering leaders hiring for ${targetRole} impact.`,
      ]
        .join('\n')
        .slice(0, LINKEDIN_ABOUT_MAX_CHARS),
    },
    {
      id: 'about-story',
      tone: 'Storytelling',
      body: [
        `Most reliability problems don't start cleanly in production—they start in architecture decisions made six months earlier. That insight drives how I approach ${targetRole} work.`,
        '',
        companyList.length > 0
          ? `Over my career at ${companyList.join(' and ')}, I've paired hands-on execution in ${top3.join(', ') || 'core systems'} with clear ownership of measurable outcomes:`
          : `I specialize in ${top5.join(', ') || 'cloud systems'} with direct accountability for reliability and execution:`,
        ...(proofPoints.length > 0
          ? proofPoints
          : ['• Partnered across product and infrastructure teams to deliver predictable releases.']),
        '',
        `Always glad to connect with peers working on ${industryTag} or teams hiring a ${targetRole}.`,
      ]
        .join('\n')
        .slice(0, LINKEDIN_ABOUT_MAX_CHARS),
    },
  ];

  const aboutOptions: LinkedInAboutOption[] = aboutTemplates.map((item) => {
    const cleanBody = item.body.trim();
    const keywordsIncluded = prioritizedSkills.filter((s) =>
      cleanBody.toLowerCase().includes(s.toLowerCase()),
    );
    return {
      id: item.id,
      tone: item.tone,
      about: cleanBody,
      previewHook: extractFoldPreview(cleanBody),
      charCount: cleanBody.length,
      keywordsIncluded,
    };
  });

  const experienceOptimizations: LinkedInExperienceOptimization[] = (
    profile.experience || []
  ).map((exp) => {
    const roleText = `${exp.title} ${(exp.bullets || []).join(' ')}`;
    const matched = prioritizedSkills
      .filter((s) => roleText.toLowerCase().includes(s.toLowerCase()))
      .slice(0, 5);
    const headlineTags = matched.length > 0 ? matched.slice(0, 3) : top3.slice(0, 2);

    return {
      company: exp.company,
      title: exp.title,
      recruiterSearchHeadline: `${exp.title}${headlineTags.length ? ` | ${headlineTags.join(' · ')}` : ''}`,
      roleKeywords: matched,
      optimizedBullets: (exp.bullets || []).map((orig) => {
        const optimized = sharpenBulletWithoutInventing(orig);
        const bulletKws = prioritizedSkills.filter((s) =>
          optimized.toLowerCase().includes(s.toLowerCase()),
        );
        return {
          original: orig,
          optimized,
          matchedKeywords: bulletKws,
        };
      }),
    };
  });

  const featuredSuggestions: LinkedInFeaturedPrompt[] = [
    ...(input.publicShareUrl
      ? [
          {
            title: `Live Verified Resume — ${targetRole}`,
            itemType: 'Link' as const,
            suggestedUrl: input.publicShareUrl,
            description:
              'Pin your live HyperResume Recruiter View link in Featured so hiring managers view your tailored, interactive resume in 1 click.',
          },
        ]
      : [
          {
            title: `ATS-Ready Portfolio & Resume (${targetRole})`,
            itemType: 'Document' as const,
            description:
              'Enable Share & Analytics in HyperResume to generate a clean /r/your-name Recruiter View URL to pin directly to your Featured section.',
          },
        ]),
    ...(profile.contact?.githubUrl
      ? [
          {
            title: 'Engineering Architecture & Repositories',
            itemType: 'Link' as const,
            suggestedUrl: profile.contact.githubUrl,
            description:
              'Showcase pinned production repositories, benchmarks, or technical RFCs demonstrating your core stack.',
          },
        ]
      : []),
    {
      title: `${top3[0] || targetRole} Case Study Post`,
      itemType: 'Project' as const,
      description: `Turn your top impact bullet (${compactMetricPhrase || 'architecture win'}) into a 3-paragraph technical post and pin it to Featured.`,
    },
  ];

  return {
    headlineSuggestions,
    aboutOptions,
    experienceOptimizations,
    skillsStrategy: {
      top3PinnedSkills: top3,
      evidencedSkillsToAdd,
      targetRoleKeywordsToConfirm,
    },
    featuredSuggestions,
    factualVerificationNotes: `Synthesized strictly from ${profile.experience?.length || 0} verified role(s) and ${allVerifiedSkills.length} evidenced skill(s). Target-role gaps are flagged separately and never auto-injected.`,
    provider: providerName,
  };
}

function experience_corpus_text(profile: ResumeContent): string {
  return [
    profile.summary || '',
    ...(profile.experience || []).flatMap((e) => [e.title, e.company, ...(e.bullets || [])]),
    ...(profile.projects || []).flatMap((p) => [p.name, p.description, ...(p.highlights || [])]),
  ].join('\n');
}
