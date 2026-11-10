import type { ResumeContent } from '../resumes/entities/resume.types.js';
import type {
  LinkedInChecklistItem,
  LinkedInScoreReport,
  LinkedInSectionDiagnostic,
} from './entities/linkedin-audit.entity.js';
import {
  extractFoldPreview,
  extractKeywordsFromText,
} from '../ai/utils/linkedin-optimizer.util.js';
import { hasCleanCustomLinkedInSlug } from '../resume-parsing/linkedin-pdf-parser.util.js';

function slugifyName(name?: string): string {
  const cleaned = (name || 'candidate')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return cleaned || 'candidate';
}

export function evaluateLinkedInProfileScore(params: {
  profile: ResumeContent;
  targetRole: string;
  targetJobDescription?: string;
  hasPublicShareUrl?: boolean;
}): LinkedInScoreReport {
  const { profile, targetRole, targetJobDescription, hasPublicShareUrl } = params;
  const headline = (profile.headline || '').trim();
  const summary = (profile.summary || '').trim();
  const skills = (profile.skills || []).map((s) => s.name?.trim()).filter(Boolean) as string[];
  const experience = profile.experience || [];
  const allBullets = experience.flatMap((e) => e.bullets || []).filter(Boolean);

  // 1. Headline SEO Score (/20)
  const roleTokens = targetRole
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 3);
  const headlineLower = headline.toLowerCase();
  const matchesRoleToken = roleTokens.some((t) => headlineLower.includes(t));
  const hasSpecialtyDelimiter = /[|•·/]/.test(headline);

  let headlineScore = 0;
  if (headline.length >= 10) headlineScore += 6;
  if (headline.length >= 60 && headline.length <= 220) headlineScore += 6;
  else if (headline.length >= 30) headlineScore += 3;
  if (matchesRoleToken) headlineScore += 5;
  if (hasSpecialtyDelimiter) headlineScore += 3;
  headlineScore = Math.min(20, headlineScore);

  // 2. About / Summary Score (/25)
  const hook = extractFoldPreview(summary);
  const hasHookMetricOrValue =
    /\d+[%+xXMKBk]|\$\d+|\d+\+?\s*years/i.test(summary) || summary.length >= 260;
  const hasStructuredParagraphs = summary.includes('\n') || summary.split('. ').length >= 3;

  let aboutScore = 0;
  if (summary.length >= 80) aboutScore += 7;
  if (summary.length >= 260 && summary.length <= 2600) aboutScore += 7;
  if (hook.length >= 120) aboutScore += 5;
  if (hasHookMetricOrValue) aboutScore += 3;
  if (hasStructuredParagraphs) aboutScore += 3;
  aboutScore = Math.min(25, aboutScore);

  // 3. Experience Impact & Searchability (/25)
  const metricBulletsCount = allBullets.filter((b) =>
    /\d+[%+xXMKBk]|\$\d+|\d+ms/i.test(b),
  ).length;
  const metricRatio = allBullets.length > 0 ? metricBulletsCount / allBullets.length : 0;

  let experienceScore = 0;
  if (experience.length >= 1) experienceScore += 8;
  if (experience.length >= 2) experienceScore += 4;
  if (allBullets.length >= 3) experienceScore += 5;
  experienceScore += Math.min(8, Math.round(metricRatio * 10));
  experienceScore = Math.min(25, experienceScore);

  // 4. Skills Taxonomy & Keyword Coverage (/15)
  const jdCorpus = `${targetRole} ${targetJobDescription || ''}`;
  const jdKeywords = extractKeywordsFromText(jdCorpus);
  const profileCorpus = `${headline}\n${summary}\n${skills.join(' ')}\n${allBullets.join('\n')}`.toLowerCase();
  const matchedKeywordsCount =
    jdKeywords.length > 0
      ? jdKeywords.filter((k) => profileCorpus.includes(k.toLowerCase())).length
      : Math.min(skills.length, 6);
  const evidencedKeywordCoveragePct =
    jdKeywords.length > 0
      ? Math.round((matchedKeywordsCount / jdKeywords.length) * 100)
      : skills.length >= 6
        ? 85
        : Math.round((skills.length / 6) * 85);

  let skillsScore = 0;
  if (skills.length >= 5) skillsScore += 5;
  if (skills.length >= 10) skillsScore += 5;
  else if (skills.length >= 7) skillsScore += 3;
  skillsScore += Math.min(5, Math.round((evidencedKeywordCoveragePct / 100) * 5));
  skillsScore = Math.min(15, skillsScore);

  // 5. Completeness & URL Hygiene (/10)
  const rawLinkedInUrl = (profile.contact?.linkedinUrl || '').trim();
  const slugMatch = rawLinkedInUrl.match(/linkedin\.com\/in\/([a-zA-Z0-9-_%]+)/i);
  const currentSlug = slugMatch?.[1] || '';
  const hasCustomSlug = Boolean(currentSlug) && hasCleanCustomLinkedInSlug(currentSlug);
  const suggestedSlug = slugifyName(profile.contact?.fullName);

  let completenessScore = 0;
  if ((profile.contact?.location || '').trim().length >= 2) completenessScore += 3;
  if ((profile.education || []).length >= 1) completenessScore += 3;
  if ((profile.certifications || []).length >= 1 || (profile.projects || []).length >= 1) {
    completenessScore += 2;
  }
  if (hasCustomSlug) completenessScore += 2;
  completenessScore = Math.min(10, completenessScore);

  // 6. Contact & Featured Link Conversion (/5)
  let contactFeaturedScore = 0;
  if (profile.contact?.email || profile.contact?.githubUrl || profile.contact?.websiteUrl) {
    contactFeaturedScore += 3;
  }
  if (hasPublicShareUrl || profile.contact?.githubUrl || profile.contact?.websiteUrl) {
    contactFeaturedScore += 2;
  }
  contactFeaturedScore = Math.min(5, contactFeaturedScore);

  const overallScore = Math.min(
    100,
    headlineScore +
      aboutScore +
      experienceScore +
      skillsScore +
      completenessScore +
      contactFeaturedScore,
  );

  const gradeLabel =
    overallScore >= 85
      ? 'All-Star Recruiter Ready'
      : overallScore >= 68
        ? 'Competitive — High Upside'
        : overallScore >= 45
          ? 'Under-Indexed in Search'
          : 'Needs Foundation Rebuild';

  const diagnostics: LinkedInSectionDiagnostic[] = [
    {
      id: 'headline',
      label: 'Headline SEO (220 chars)',
      score: headlineScore,
      maxScore: 20,
      status: headlineScore >= 16 ? 'strong' : headlineScore >= 10 ? 'needs_work' : 'critical',
      finding:
        headline.length < 45
          ? `Headline is only ${headline.length}/220 chars — missing valuable recruiter search keywords.`
          : !hasSpecialtyDelimiter
            ? 'Headline reads passively and lacks scannable stack delimiters.'
            : `Strong ${headline.length}/220 char utilization aligned with ${targetRole}.`,
      recommendation:
        'Use structured `Target Role | Core Stack • Specialization | Scope` formatting within 110–210 chars.',
    },
    {
      id: 'about',
      label: 'About Narrative & 265-Char Fold Hook',
      score: aboutScore,
      maxScore: 25,
      status: aboutScore >= 19 ? 'strong' : aboutScore >= 12 ? 'needs_work' : 'critical',
      finding:
        summary.length < 180
          ? `About section has ${summary.length} chars; LinkedIn gives up to 2,600 chars for keyword indexing.`
          : 'Good baseline narrative — sharpen the opening 265 chars visible before "...see more".',
      recommendation:
        'Open with role identity + scale proof in the first 265 characters, followed by bulleted wins and Specialties.',
    },
    {
      id: 'experience',
      label: 'Experience Bullets & Metrics',
      score: experienceScore,
      maxScore: 25,
      status: experienceScore >= 19 ? 'strong' : experienceScore >= 13 ? 'needs_work' : 'critical',
      finding: `${metricBulletsCount} of ${allBullets.length} experience bullets contain quantifiable metrics.`,
      recommendation:
        'Keep 2–4 punchy bullets per recent role and pair tools directly inside impact statements.',
    },
    {
      id: 'skills',
      label: 'Skills Taxonomy & Endorsements',
      score: skillsScore,
      maxScore: 15,
      status: skillsScore >= 12 ? 'strong' : skillsScore >= 8 ? 'needs_work' : 'critical',
      finding: `${skills.length} skill(s) listed (${evidencedKeywordCoveragePct}% target keyword coverage).`,
      recommendation:
        'Pin your top 3 verified role skills so LinkedIn surfaces them directly on recruiter search cards.',
    },
  ];

  const checklist: LinkedInChecklistItem[] = [
    {
      id: 'custom-url',
      title: 'Clean custom linkedin.com/in/ slug',
      impact: 'High',
      completed: hasCustomSlug,
      detail: hasCustomSlug
        ? `Clean slug active: /in/${currentSlug}`
        : currentSlug
          ? `Remove trailing random characters from "/in/${currentSlug}" — set to "/in/${suggestedSlug}" in Public Profile Settings.`
          : `Set a memorable custom URL like linkedin.com/in/${suggestedSlug}.`,
    },
    {
      id: 'headline-seo',
      title: 'Headline includes target role + 3 core skills',
      impact: 'High',
      completed: headlineScore >= 16,
      detail: `${headline.length}/220 characters currently used.`,
    },
    {
      id: 'about-hook',
      title: 'First 265 characters pass the "See more" hook test',
      impact: 'High',
      completed: aboutScore >= 18,
      detail: 'Recruiters scan the first 2 lines before expanding your About narrative.',
    },
    {
      id: 'featured-link',
      title: 'Pin live Verified Resume or portfolio in Featured',
      impact: 'Medium',
      completed: Boolean(hasPublicShareUrl || profile.contact?.websiteUrl || profile.contact?.githubUrl),
      detail:
        'Attach your HyperResume live Recruiter View URL or GitHub architecture repo directly in Featured.',
    },
    {
      id: 'skills-top-10',
      title: 'At least 10 verified domain skills indexed',
      impact: 'Medium',
      completed: skills.length >= 10,
      detail: `Currently ${skills.length} skills indexed (LinkedIn allows up to 50).`,
    },
  ];

  return {
    overallScore,
    gradeLabel,
    subScores: {
      headline: headlineScore,
      about: aboutScore,
      experience: experienceScore,
      skills: skillsScore,
      completeness: completenessScore,
      contactFeatured: contactFeaturedScore,
    },
    headlineCharCount: headline.length,
    aboutCharCount: summary.length,
    aboutFoldPreview: hook,
    skillsCount: skills.length,
    experienceCount: experience.length,
    evidencedKeywordCoveragePct,
    urlHealth: {
      url: rawLinkedInUrl || `https://linkedin.com/in/${suggestedSlug}`,
      slug: currentSlug || '',
      hasCustomSlug,
      suggestedSlug,
      note: hasCustomSlug
        ? 'Your LinkedIn profile URL is clean and recruiter-friendly.'
        : currentSlug
          ? `Slug "${currentSlug}" appears to contain an auto-generated suffix; customize it to /in/${suggestedSlug}.`
          : 'Add your LinkedIn URL so recruiters and applicant tracking systems link your profile seamlessly.',
    },
    diagnostics,
    checklist,
  };
}

