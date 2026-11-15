import type {
  LinkedInAudit,
  LinkedInExperienceOptimization,
} from '@/lib/api-client';

export const LINKEDIN_HEADLINE_LIMIT = 220;
export const LINKEDIN_ABOUT_LIMIT = 2600;
export const LINKEDIN_ABOUT_FOLD_CHARS = 265;
export const LINKEDIN_CONNECTION_NOTE_LIMIT = 300;

export interface HeadlineBudgetStatus {
  length: number;
  limit: number;
  status: 'optimal' | 'short' | 'over';
  label: string;
}

export function evaluateHeadlineBudget(headline: string): HeadlineBudgetStatus {
  const length = headline.trim().length;
  if (length > LINKEDIN_HEADLINE_LIMIT) {
    return {
      length,
      limit: LINKEDIN_HEADLINE_LIMIT,
      status: 'over',
      label: `${length}/${LINKEDIN_HEADLINE_LIMIT} chars (${length - LINKEDIN_HEADLINE_LIMIT} over LinkedIn limit)`,
    };
  }
  if (length >= 90) {
    return {
      length,
      limit: LINKEDIN_HEADLINE_LIMIT,
      status: 'optimal',
      label: `${length}/${LINKEDIN_HEADLINE_LIMIT} chars (Optimal search length)`,
    };
  }
  return {
    length,
    limit: LINKEDIN_HEADLINE_LIMIT,
    status: 'short',
    label: `${length}/${LINKEDIN_HEADLINE_LIMIT} chars (Add stack/domain keywords)`,
  };
}

export function splitAboutFold(about: string): {
  beforeFold: string;
  afterFold: string;
  exceedsFold: boolean;
  exceedsLimit: boolean;
} {
  const clean = about.trim();
  const exceedsFold = clean.length > LINKEDIN_ABOUT_FOLD_CHARS;
  const exceedsLimit = clean.length > LINKEDIN_ABOUT_LIMIT;
  if (!exceedsFold) {
    return {
      beforeFold: clean,
      afterFold: '',
      exceedsFold: false,
      exceedsLimit,
    };
  }
  const rawSlice = clean.slice(0, LINKEDIN_ABOUT_FOLD_CHARS);
  const lastSpace = rawSlice.lastIndexOf(' ');
  const splitIdx =
    lastSpace > LINKEDIN_ABOUT_FOLD_CHARS - 25 ? lastSpace : LINKEDIN_ABOUT_FOLD_CHARS;
  return {
    beforeFold: clean.slice(0, splitIdx).trimEnd(),
    afterFold: clean.slice(splitIdx).trimStart(),
    exceedsFold: true,
    exceedsLimit,
  };
}

export function formatLinkedInRoleCopyBlock(exp: LinkedInExperienceOptimization): string {
  const header = `${exp.recruiterSearchHeadline}`;
  const bullets = exp.optimizedBullets.map((b) => `• ${b.optimized}`).join('\n');
  return [header, '', bullets].filter(Boolean).join('\n').trim();
}

export function legacyExecCommandCopy(text: string): boolean {
  if (typeof document === 'undefined') return false;
  const field = Object.assign(document.createElement('textarea'), { value: text });
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;inset-block-start:0;opacity:0';
  document.body.append(field);
  field.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    field.remove();
  }
}

export async function copyToClipboardSafely(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to execCommand below
  }
  return legacyExecCommandCopy(text);
}

// ---------------------------------------------------------------------------
// Networking & Outreach Templates
// ---------------------------------------------------------------------------

export interface NetworkingTemplate {
  id: string;
  title: string;
  category: 'connection_request' | 'inmail' | 'recommendation';
  charLimit?: number;
  body: string;
  subject?: string;
  description: string;
}

export function generateNetworkingTemplates(params: {
  candidateName?: string;
  targetRole: string;
  industry?: string;
  topSkills: string[];
  latestCompany?: string;
}): NetworkingTemplate[] {
  const name = params.candidateName || 'Candidate';
  const role = params.targetRole || 'Software Engineer';
  const skillsList = params.topSkills.slice(0, 3).join(', ') || 'TypeScript, Cloud Architecture, APIs';
  const industry = params.industry || 'Tech & Product Engineering';

  const noteRecruiter = `Hi [Name], noticed your focus recruiting for ${role} roles. As an experienced ${role} specializing in ${skillsList}, I'd value connecting to follow openings on your radar. Thanks!`.slice(0, LINKEDIN_CONNECTION_NOTE_LIMIT);

  const noteHiringManager = `Hi [Name], huge fan of your team's engineering work in ${industry}. I specialize in ${skillsList} as a ${role} and would love to connect and follow your team's updates.`.slice(0, LINKEDIN_CONNECTION_NOTE_LIMIT);

  const noteAlumni = `Hi [Name], noticed we both share a background in [School/Prior Company]. As a fellow ${role} working across ${skillsList}, would love to connect and exchange engineering notes!`.slice(0, LINKEDIN_CONNECTION_NOTE_LIMIT);

  const inmailRecruiter = `Subject: Quick Inquiry: ${role} Profile (${skillsList})

Hi [Name],

I've been following [Company]'s recent developments in ${industry} and noticed your team is actively scaling talent.

I am a ${role} with deep experience in ${skillsList}. In my recent work${params.latestCompany ? ` at ${params.latestCompany}` : ''}, I focused on delivering scalable architecture, high uptime, and metric-proven impact.

I would love to learn if there's an opening on your radar where my background could create immediate leverage for your team.

You can view my full interactive portfolio & verified resume here: [Insert Link]

Best regards,
${name}
LinkedIn: [Your LinkedIn Profile]`;

  const inmailHiringManager = `Subject: Value proposition for [Company]'s ${role} team

Hi [Name],

I recently reviewed [Company]'s product roadmap and engineering initiatives. Given your leadership of the team, I wanted to reach out directly.

I specialize as a ${role} with hands-on depth across ${skillsList}. Some highlights of what I deliver:
• High-reliability system design and fast deployment cycles
• Metric-proven performance improvements and code quality
• Collaborative cross-functional execution from spec to release

If your team is considering new talent for ${role} roles this quarter, I'd welcome a brief 10-minute introductory conversation.

Warmly,
${name}`;

  const recommendationRequest = `Hi [Name],

Hope you're having a great week! I really enjoyed our time collaborating together${params.latestCompany ? ` at ${params.latestCompany}` : ''}, especially on our joint milestones and system launches.

I am currently refreshing my LinkedIn profile for upcoming ${role} opportunities in ${industry}. Would you be open to writing a short 2-3 sentence recommendation highlighting our work together?

To make it as effortless as possible for you, here is a quick draft you are completely free to edit, tweak, or use as inspiration:

"[Name] is a standout ${role} who brought rigorous technical depth across ${skillsList}. They consistently delivered complex deliverables with high quality, communicated clearly across stakeholders, and elevated team standards. I would gladly work with them again on any engineering initiative."

No pressure at all, and please let me know if I can ever reciprocate!

Best,
${name}`;

  return [
    {
      id: 'conn-recruiter',
      title: 'Recruiter Connection Request (<300 chars)',
      category: 'connection_request',
      charLimit: LINKEDIN_CONNECTION_NOTE_LIMIT,
      body: noteRecruiter,
      description: 'Concise connection invite designed to pass LinkedIn’s 300-char note limit without fluff.',
    },
    {
      id: 'conn-hiring-manager',
      title: 'Hiring Manager Connection Request (<300 chars)',
      category: 'connection_request',
      charLimit: LINKEDIN_CONNECTION_NOTE_LIMIT,
      body: noteHiringManager,
      description: 'Professional note emphasizing domain enthusiasm and relevant core stack expertise.',
    },
    {
      id: 'conn-alumni',
      title: 'Alumni / Peer Connection Request (<300 chars)',
      category: 'connection_request',
      charLimit: LINKEDIN_CONNECTION_NOTE_LIMIT,
      body: noteAlumni,
      description: 'Warm networking invite based on shared alma mater, company, or open-source community.',
    },
    {
      id: 'inmail-recruiter',
      title: 'Recruiter InMail / Follow-Up Pitch',
      category: 'inmail',
      subject: `Quick Inquiry: ${role} Profile (${skillsList})`,
      body: inmailRecruiter,
      description: 'High-converting direct message with strong hook, proof of competence, and clear portfolio CTA.',
    },
    {
      id: 'inmail-manager',
      title: 'Hiring Manager Value Proposition Pitch',
      category: 'inmail',
      subject: `Value proposition for [Company]'s ${role} team`,
      body: inmailHiringManager,
      description: 'Tailored message demonstrating immediate business and engineering leverage for their specific team.',
    },
    {
      id: 'rec-request',
      title: 'Recommendation Request + Pre-Written Blurb',
      category: 'recommendation',
      body: recommendationRequest,
      description: 'Eliminates friction for past managers/colleagues by providing a ready-to-approve testimonial template.',
    },
  ];
}

// ---------------------------------------------------------------------------
// LinkedIn Content / Post Templates (Social Selling Index Booster)
// ---------------------------------------------------------------------------

export interface LinkedInPostTemplate {
  id: string;
  title: string;
  topic: string;
  hook: string;
  body: string;
  hashtags: string[];
}

export function generateLinkedInPostTemplates(params: {
  candidateName?: string;
  targetRole: string;
  industry?: string;
  topSkills: string[];
}): LinkedInPostTemplate[] {
  const role = params.targetRole || 'Software Engineer';
  const skills = params.topSkills.slice(0, 4);
  const stackTag = skills.join(' · ') || 'System Design · TypeScript · Cloud';
  const roleTag = role.replace(/\s+/g, '');

  const openToWorkPost = `I'm excited to share that I'm officially #OpenToWork and looking for my next chapter as a ${role}! 🚀

Over the past few years, I've focused on building resilient systems and high-impact products with a strong focus on:
✅ ${skills[0] || 'Modern Full-Stack Architecture'}
✅ ${skills[1] || 'Reliable Backend Infrastructure & APIs'}
✅ ${skills[2] || 'Performance Optimization & Developer Velocity'}
✅ ${skills[3] || 'Delivering Measurable Business Value'}

What I'm looking for in my next role:
🎯 Roles: ${role} / Tech Lead
🌍 Workplace: Remote / Hybrid
💡 Domains: ${params.industry || 'High-Growth Tech, FinTech, Developer Tools, AI Platforms'}

If your team (or someone in your network) is looking for an engineer who thrives at the intersection of craftsmanship and speed, I'd love to chat.

Feel free to send a DM or reach out directly at [Your Email].
Check out my portfolio & verified resume in the comments below! 👇`;

  const projectPost = `The biggest technical lesson from my recent project: Keep it simple before scaling. 💡

While engineering a recent system involving ${skills[0] || 'distributed services'} and ${skills[1] || 'event-driven architecture'}, our team faced a classic challenge:
⚡ High latency and bottlenecks during traffic spikes.

Here is how we solved it:
1️⃣ Measured before guessing: Ran deep telemetry to find the real 99th-percentile bottlenecks.
2️⃣ Pruned unnecessary queries and introduced targeted caching.
3️⃣ Streamlined the pipeline with ${skills[2] || 'clean data contracts'}.

Result: Noticeable reduction in latency and a simpler codebase for every engineer on the team.

What is one architectural decision you made recently that paid off tenfold? I'd love to hear your thoughts in the comments! 👇`;

  return [
    {
      id: 'post-open-to-work',
      title: '#OpenToWork Launch Announcement',
      topic: 'Career Transition / Availability',
      hook: "I'm excited to share that I'm officially #OpenToWork and looking for my next chapter as a...",
      body: openToWorkPost,
      hashtags: [`#OpenToWork`, `#${roleTag}`, `#Hiring`, `#TechJobs`, `#SoftwareEngineering`],
    },
    {
      id: 'post-project-deep-dive',
      title: 'Technical Win / Architecture Case Study',
      topic: 'Engineering Authority & Thought Leadership',
      hook: 'The biggest technical lesson from my recent project: Keep it simple before scaling. 💡',
      body: projectPost,
      hashtags: [`#Engineering`, `#SoftwareArchitecture`, `#${roleTag}`, `#TechLeadership`, `#CleanCode`],
    },
  ];
}

// ---------------------------------------------------------------------------
// Real-time Recruiter Score Calculator (for live workbench tuning)
// ---------------------------------------------------------------------------

export function calculateLiveRecruiterScore(params: {
  headline: string;
  about: string;
  skillsCount: number;
  experienceCount: number;
  targetRole: string;
  hasCustomSlug?: boolean;
}): {
  overallScore: number;
  headlineScore: number;
  aboutScore: number;
  experienceScore: number;
  skillsScore: number;
  completenessScore: number;
  contactScore: number;
} {
  const headline = (params.headline || '').trim();
  const about = (params.about || '').trim();
  const targetRole = (params.targetRole || '').trim().toLowerCase();

  // 1. Headline Score (/20)
  let headlineScore = 0;
  if (headline.length >= 15) headlineScore += 6;
  if (headline.length >= 70 && headline.length <= 220) headlineScore += 7;
  else if (headline.length >= 35) headlineScore += 4;
  const roleTokens = targetRole.split(/\s+/).filter((t) => t.length >= 3);
  const headlineLower = headline.toLowerCase();
  if (roleTokens.some((t) => headlineLower.includes(t))) headlineScore += 4;
  if (/[|•·/]/.test(headline)) headlineScore += 3;
  headlineScore = Math.min(20, headlineScore);

  // 2. About Score (/25)
  let aboutScore = 0;
  if (about.length >= 100) aboutScore += 7;
  if (about.length >= 265 && about.length <= 2600) aboutScore += 7;
  else if (about.length >= 150) aboutScore += 4;
  if (/\d+[%+xXMKBk]|\$\d+|\d+\+?\s*years/i.test(about)) aboutScore += 5;
  if (about.includes('\n') || about.split('. ').length >= 3) aboutScore += 4;
  if (about.length <= LINKEDIN_ABOUT_LIMIT) aboutScore += 2;
  aboutScore = Math.min(25, aboutScore);

  // 3. Experience Score (/25)
  let experienceScore = 0;
  if (params.experienceCount >= 1) experienceScore += 10;
  if (params.experienceCount >= 2) experienceScore += 7;
  experienceScore += 8; // baseline quality
  experienceScore = Math.min(25, experienceScore);

  // 4. Skills Score (/15)
  let skillsScore = 0;
  if (params.skillsCount >= 5) skillsScore += 5;
  if (params.skillsCount >= 10) skillsScore += 5;
  if (params.skillsCount >= 15) skillsScore += 5;
  else if (params.skillsCount >= 7) skillsScore += 3;
  skillsScore = Math.min(15, skillsScore);

  // 5. Completeness (/10)
  let completenessScore = 6;
  if (params.hasCustomSlug) completenessScore += 4;
  completenessScore = Math.min(10, completenessScore);

  // 6. Contact (/5)
  const contactScore = 5;

  const overallScore = Math.min(
    100,
    headlineScore + aboutScore + experienceScore + skillsScore + completenessScore + contactScore,
  );

  return {
    overallScore,
    headlineScore,
    aboutScore,
    experienceScore,
    skillsScore,
    completenessScore,
    contactScore,
  };
}

// ---------------------------------------------------------------------------
// Complete Profile Kit Formatter (for One-Click Full Export)
// ---------------------------------------------------------------------------

export function formatCompleteProfileKit(
  audit: LinkedInAudit,
  appliedHeadline?: string,
  appliedAbout?: string,
  appliedSkills?: string[],
): string {
  const headline =
    appliedHeadline ||
    audit.appliedState?.appliedHeadline ||
    audit.optimizations?.headlineSuggestions?.[0]?.headline ||
    audit.profileSnapshot?.headline ||
    '';

  const about =
    appliedAbout ||
    audit.appliedState?.appliedAbout ||
    audit.optimizations?.aboutOptions?.[0]?.about ||
    audit.profileSnapshot?.summary ||
    '';

  const skills =
    appliedSkills ||
    audit.appliedState?.appliedSkills ||
    audit.optimizations?.skillsStrategy?.top3PinnedSkills ||
    [];

  const pinned = audit.optimizations?.skillsStrategy?.top3PinnedSkills || [];

  const roles = (audit.optimizations?.experienceOptimizations || []).map((exp) => {
    return [
      `### ${exp.title} | ${exp.company}`,
      `*Suggested Recruiter Headline: ${exp.recruiterSearchHeadline}*`,
      '',
      ...exp.optimizedBullets.map((b) => `• ${b.optimized}`),
    ].join('\n');
  });

  return [
    `# LinkedIn Profile Optimization Kit — ${audit.targetRole}`,
    `Generated via HyperResume · Recruiter Readiness Score: ${audit.overallScore}/100`,
    '',
    '---',
    '## 1. LINKEDIN HEADLINE (Max 220 chars)',
    headline,
    `*(Length: ${headline.length} / 220 chars)*`,
    '',
    '---',
    '## 2. ABOUT / SUMMARY (Max 2,600 chars)',
    about,
    '',
    '---',
    '## 3. TOP PINNED SKILLS (Recruiter Priority Cards)',
    pinned.map((s, i) => `${i + 1}. ${s}`).join('\n') || 'None pinned yet',
    '',
    '## COMPLETE SKILLS CHECKLIST',
    skills.map((s) => `[x] ${s}`).join('\n') || 'None queued',
    '',
    '---',
    '## 4. OPTIMIZED EXPERIENCE BULLETS (XYZ Formula)',
    roles.length > 0 ? roles.join('\n\n') : 'No work experience snapshot available',
    '',
    '---',
    '## 5. RECOMMENDED FEATURED LINKS',
    (audit.optimizations?.featuredSuggestions || [])
      .map((f) => `• **${f.title}** (${f.itemType}): ${f.description}${f.suggestedUrl ? ` - ${f.suggestedUrl}` : ''}`)
      .join('\n'),
    '',
    '---',
    '## 6. ALL-STAR CHECKLIST STATUS',
    (audit.scoreReport?.checklist || [])
      .map((c) => `- [${c.completed ? 'x' : ' '}] ${c.title} (${c.impact} Impact): ${c.detail}`)
      .join('\n'),
  ].join('\n');
}
