import type { WritingCheckResult } from '../interfaces/ai-provider.interface.js';
import type { ResumeContent } from '../../resumes/entities/resume.types.js';
import type {
  AtsAuditDimension,
  AtsBulletQualityItem,
  AtsParserRisk,
  AtsStackAlignment,
  ResumeAuditFindings,
} from '../../resumes/entities/resume-analysis.entity.js';
import { runDeterministicWritingCheck } from './writing-quality-rules.js';

export interface AtsAuditEvaluation {
  score: number;
  findings: ResumeAuditFindings;
  recommendations: string[];
  writingAudit: WritingCheckResult;
}

interface RawTextDiagnostics {
  pipeTableLines: number;
  fancyGlyphCount: number;
  dateStylesCount: number;
  wordCountOverride?: number;
}

const ACTION_VERB_REGEX =
  /^(?:[-•*●▪◦➤→]\s*)?(architected|spearheaded|engineered|orchestrated|designed|developed|built|led|optimized|streamlined|delivered|deployed|migrated|scaled|automated|refactored|accelerated|pioneered|launched|reduced|increased|eliminated|mentored|consolidated|established|implemented|integrated|transformed|improved|drove|authored|owned|shipped|directed|partnered|created|resolved|modernized|secured|rewrote)\b/i;

const PASSIVE_OPENER_REGEX =
  /^(?:[-•*●▪◦➤→]\s*)?(?:responsible for|assisted with|helped with|worked on|duties included|tasked with|participated in|involved in)\b/i;

/**
 * Matches measurable impact: currencies, percentages, multipliers, thousands-formatted
 * counts, or numeric KPIs paired with units — explicitly excluding 4-digit calendar years
 * or phone digits.
 */
const METRIC_REGEX =
  /\$\s*\d+(?:[.,]\d+)?(?:\s*[kmb]\b|\+)?|\d+(?:[.,]\d+)?\s*%|\b\d+(?:[.,]\d+)?\s*(?:x|k|m|b)\b|\b\d{1,3}(?:,\d{3})+\+?|\b\d+(?:\.\d+)?\s*(?:ms|s|sec|seconds?|mins?|minutes?|hrs?|hours?|days?|weeks?|mos?|months?|yrs?|years?|users?|clients?|customers?|merchants?|events?|requests?|queries?|endpoints?|teams?|engineers?|microservices?|pipelines?|qps|rps|tps|req\/s|gb|tb|pb|mb)\+?/i;

const NON_ASCII_DECORATIVE_GLYPH_REGEX = /[★✦❖➜✔✓❌☑⭐●◆◇■□]/g;

const CANONICAL_HEADINGS: Array<{
  key: 'summary' | 'experience' | 'skills' | 'education' | 'projects';
  regex: RegExp;
}> = [
  {
    key: 'summary',
    regex:
      /^(?:professional\s+)?(?:summary|profile|objective|about(?:\s+me)?|executive\s+summary)$/i,
  },
  {
    key: 'experience',
    regex:
      /^(?:work\s+|professional\s+|relevant\s+)?(?:experience|employment(?:\s+history)?|career\s+history)$/i,
  },
  {
    key: 'skills',
    regex:
      /^(?:technical\s+|core\s+|key\s+)?(?:skills|competencies|technologies|tech\s+stack|expertise)$/i,
  },
  {
    key: 'education',
    regex: /^(?:education|academic\s+background|qualifications|degrees?)$/i,
  },
  {
    key: 'projects',
    regex: /^(?:selected\s+|key\s+|personal\s+|technical\s+)?projects$/i,
  },
];

function stripBulletPrefix(text: string): string {
  return text.replace(/^[•●▪◦\-*➤→]+\s*/, '').trim();
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function classifyScoreStatus(score: number): 'strong' | 'moderate' | 'needs_work' {
  if (score >= 80) return 'strong';
  if (score >= 55) return 'moderate';
  return 'needs_work';
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function detectDateFormatFamily(dateValue?: string): 'iso' | 'slash' | 'month_name' | 'year' | null {
  if (!dateValue) return null;
  const trimmed = dateValue.trim();
  if (!trimmed || /^present$/i.test(trimmed)) return null;
  if (/^\d{4}-\d{1,2}(?:-\d{1,2})?$/.test(trimmed)) return 'iso';
  if (/^\d{1,2}\/\d{2,4}$/.test(trimmed)) return 'slash';
  if (/^[a-z]{3,9}\.?\s+\d{4}$/i.test(trimmed)) return 'month_name';
  if (/^\d{4}$/.test(trimmed)) return 'year';
  return null;
}

function escapeRegexLiteral(token: string): string {
  return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function computeTotalWordsFromContent(content: ResumeContent): number {
  const parts: string[] = [
    content.contact?.fullName || '',
    content.headline || '',
    content.summary || '',
    ...(content.skills || []).map((s) => s.name),
  ];

  for (const exp of content.experience || []) {
    parts.push(exp.title || '', exp.company || '', ...(exp.bullets || []));
  }
  for (const edu of content.education || []) {
    parts.push(edu.school || '', edu.degree || '', edu.field || '');
  }
  for (const proj of content.projects || []) {
    parts.push(proj.name || '', proj.description || '', ...(proj.highlights || []));
  }
  for (const sec of content.customSections || []) {
    parts.push(sec.title || '');
    for (const entry of sec.entries || []) {
      parts.push(entry.heading || '', entry.subtitle || '', ...(entry.bullets || []));
    }
  }

  return countWords(parts.join(' '));
}

/**
 * Extracts a structured `ResumeContent` representation from raw resume plain text
 * (e.g. free-tool paste or extracted PDF/DOCX text) so plain-text audits share
 * the exact same 5-dimension evaluation pipeline as saved structured resumes.
 */
export function extractStructuredContentFromText(
  rawText: string,
  targetRole?: string,
): { content: ResumeContent; rawDiagnostics: RawTextDiagnostics } {
  const lines = rawText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim());
  const nonEmptyLines = lines.filter(Boolean);

  const emailMatch = rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = rawText.match(/(?:\+?\d[\d\s().-]{7,}\d)/);
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/i);
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+/i);

  const firstHeaderCandidate = nonEmptyLines[0] || '';
  const looksLikeName =
    firstHeaderCandidate.length >= 3 &&
    firstHeaderCandidate.length <= 60 &&
    !firstHeaderCandidate.includes('@') &&
    !/^(summary|experience|skills|education|projects)$/i.test(firstHeaderCandidate);

  // Detect raw formatting parser risks across body lines (skip contact header row 0-2)
  let pipeTableLines = 0;
  for (let idx = 2; idx < lines.length; idx++) {
    const line = lines[idx];
    if (!line) continue;
    const pipeCount = (line.match(/\|/g) || []).length;
    if (pipeCount >= 2 || /\t{2,}/.test(line)) {
      pipeTableLines += 1;
    }
  }

  const fancyGlyphMatches = rawText.match(NON_ASCII_DECORATIVE_GLYPH_REGEX) || [];
  const dateFamilies = new Set<string>();
  const rawDateMatches =
    rawText.match(
      /\b(?:\d{4}-\d{1,2}|\d{1,2}\/\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})\b/gi,
    ) || [];
  for (const dt of rawDateMatches) {
    const fam = detectDateFormatFamily(dt);
    if (fam) dateFamilies.add(fam);
  }

  // Segment lines into canonical sections
  const buckets: Record<'header' | 'summary' | 'experience' | 'skills' | 'education' | 'projects', string[]> = {
    header: [],
    summary: [],
    experience: [],
    skills: [],
    education: [],
    projects: [],
  };

  let currentSection: keyof typeof buckets = 'header';

  for (const line of nonEmptyLines) {
    const normalizedHeading = line.replace(/[:\-–—_]+$/g, '').trim();
    const matchedHeading = CANONICAL_HEADINGS.find((h) => h.regex.test(normalizedHeading));
    if (matchedHeading) {
      currentSection = matchedHeading.key;
      continue;
    }
    buckets[currentSection].push(line);
  }

  // Fallback heuristics if resume text omitted explicit headings
  const allBulletLines = nonEmptyLines.filter((l) => /^[•●▪◦\-*➤→]\s+/.test(l));
  if (buckets.experience.length === 0 && allBulletLines.length > 0) {
    buckets.experience = allBulletLines;
  }

  const summaryText = buckets.summary.join(' ').trim();

  // Build Experience blocks
  const experienceBlocks: ResumeContent['experience'] = [];
  let currentExp: ResumeContent['experience'][number] | null = null;

  for (const line of buckets.experience) {
    const isBullet = /^[•●▪◦\-*➤→]\s+/.test(line);
    const cleaned = stripBulletPrefix(line);
    if (!cleaned) continue;

    if (isBullet) {
      if (!currentExp) {
        currentExp = {
          company: 'Experience Entry',
          title: targetRole || 'Role',
          startDate: rawDateMatches[0] || '',
          current: true,
          bullets: [],
        };
        experienceBlocks.push(currentExp);
      }
      currentExp.bullets.push(cleaned);
    } else if (
      line.length <= 120 &&
      (/(?:20\d{2}|19\d{2}|present)/i.test(line) || /[—–|-]/.test(line))
    ) {
      const dateSpanMatch = line.match(
        /((?:19|20)\d{2}(?:[-/]\d{1,2})?|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})\s*(?:[-–—to]+)\s*(Present|(?:19|20)\d{2}(?:[-/]\d{1,2})?|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})/i,
      );
      const headerClean = line.replace(/\([^)]*\)/g, '').trim();
      const [partA, partB] = headerClean.split(/\s*[—–|-]\s*/);
      currentExp = {
        company: (partA || 'Organization').trim(),
        title: (partB || targetRole || 'Specialist').trim(),
        startDate: dateSpanMatch?.[1] || '',
        endDate: dateSpanMatch?.[2] && !/present/i.test(dateSpanMatch[2]) ? dateSpanMatch[2] : undefined,
        current: Boolean(dateSpanMatch?.[2] && /present/i.test(dateSpanMatch[2])),
        bullets: [],
      };
      experienceBlocks.push(currentExp);
    } else {
      if (!currentExp) {
        currentExp = {
          company: 'Experience Entry',
          title: targetRole || 'Role',
          startDate: '',
          current: false,
          bullets: [],
        };
        experienceBlocks.push(currentExp);
      }
      currentExp.bullets.push(cleaned);
    }
  }

  // Build Skills tokens
  const skillsText = buckets.skills.join(', ');
  const rawSkills = skillsText
    .split(/[,|•·/\n]+/)
    .map((s) => s.replace(/^[A-Za-z\s]+:\s*/, '').trim())
    .filter((s) => s.length >= 2 && s.length <= 45);
  const uniqueSkills = Array.from(new Set(rawSkills));

  // Build Education
  const educationBlocks: ResumeContent['education'] = buckets.education
    .filter((l) => l.length > 3)
    .slice(0, 4)
    .map((l) => ({
      school: l,
      degree: /(?:b\.?tech|b\.?s\.?|m\.?s\.?|mba|bachelor|master|ph\.?d)/i.exec(l)?.[0] || 'Degree',
      field: '',
      graduationDate: /(?:19|20)\d{2}/.exec(l)?.[0],
    }));

  // Build Projects
  const projectsBlocks: NonNullable<ResumeContent['projects']> = [];
  let currentProj: NonNullable<ResumeContent['projects']>[number] | null = null;
  for (const line of buckets.projects) {
    const isBullet = /^[•●▪◦\-*➤→]\s+/.test(line);
    const cleaned = stripBulletPrefix(line);
    if (!cleaned) continue;
    if (!isBullet && line.length <= 90) {
      currentProj = {
        name: cleaned,
        description: cleaned,
        highlights: [],
      };
      projectsBlocks.push(currentProj);
    } else if (currentProj) {
      currentProj.highlights.push(cleaned);
    } else {
      currentProj = {
        name: 'Project',
        description: cleaned,
        highlights: [cleaned],
      };
      projectsBlocks.push(currentProj);
    }
  }

  const content: ResumeContent = {
    contact: {
      fullName: looksLikeName ? firstHeaderCandidate : '',
      email: emailMatch?.[0] || '',
      phone: phoneMatch?.[0]?.trim() || undefined,
      linkedinUrl: linkedinMatch?.[0] || undefined,
      githubUrl: githubMatch?.[0] || undefined,
    },
    headline: targetRole || (looksLikeName && nonEmptyLines[1] && !nonEmptyLines[1].includes('@') ? nonEmptyLines[1] : ''),
    summary: summaryText,
    skills: uniqueSkills.map((name) => ({ name })),
    experience: experienceBlocks,
    education: educationBlocks,
    projects: projectsBlocks,
  };

  return {
    content,
    rawDiagnostics: {
      pipeTableLines,
      fancyGlyphCount: fancyGlyphMatches.length,
      dateStylesCount: dateFamilies.size,
      wordCountOverride: countWords(rawText),
    },
  };
}

/**
 * Evaluates a structured `ResumeContent` payload across 5 objective ATS dimensions:
 * Formatting & Hierarchy (25%), Quantified Metrics & Impact (25%), Action Verb Dominance (20%),
 * Technical Depth & Stack Alignment (15%), and Brevity & Information Density (15%).
 */
export function evaluateStructuredResumeAts(
  content: ResumeContent,
  rawDiagnostics?: RawTextDiagnostics,
  targetRole?: string,
): AtsAuditEvaluation {
  const missingSections: string[] = [];
  const detectedSections: string[] = [];
  const formattingFlags: string[] = [];
  const parserRisks: AtsParserRisk[] = [];

  // 1. Essential Sections
  if (content.summary?.trim()) detectedSections.push('Summary');
  else missingSections.push('Professional Summary');

  if ((content.experience || []).length > 0) detectedSections.push('Experience');
  else missingSections.push('Work Experience');

  if ((content.skills || []).length > 0) detectedSections.push('Skills');
  else missingSections.push('Core Skills');

  if ((content.education || []).length > 0) detectedSections.push('Education');
  else missingSections.push('Education');

  if ((content.projects || []).length > 0) detectedSections.push('Projects');

  if (missingSections.length > 0) {
    parserRisks.push({
      id: 'missing-sections',
      severity: 'critical',
      category: 'sections',
      message: `Missing essential ATS section headers: ${missingSections.join(', ')}.`,
      fixHint: 'Add canonical section titles (Summary, Experience, Skills, Education) so parsers index every block accurately.',
    });
  } else {
    parserRisks.push({
      id: 'sections-complete',
      severity: 'pass',
      category: 'sections',
      message: 'All 4 essential ATS section blocks (Summary, Experience, Skills, Education) are present.',
    });
  }

  // 2. Contact Extractability
  const hasEmail = Boolean(content.contact?.email && content.contact.email.includes('@'));
  const hasName = Boolean(content.contact?.fullName?.trim());
  const hasPhone = Boolean(content.contact?.phone?.trim());
  const hasProfileLink = Boolean(
    content.contact?.linkedinUrl?.trim() ||
      content.contact?.githubUrl?.trim() ||
      content.contact?.websiteUrl?.trim(),
  );

  if (!hasEmail) formattingFlags.push('Missing or invalid email address');
  if (!hasName) formattingFlags.push('Missing candidate full name');
  if (!hasPhone) formattingFlags.push('Missing phone number');
  if (!hasProfileLink) formattingFlags.push('Missing LinkedIn, GitHub, or portfolio URL');

  if (!hasEmail || !hasName) {
    parserRisks.push({
      id: 'contact-critical',
      severity: 'critical',
      category: 'contact',
      message: `Header lacks extractable ${[!hasName ? 'full name' : '', !hasEmail ? 'valid email' : ''].filter(Boolean).join(' and ')}.`,
      fixHint: 'Place your full name and plain-text email at the top of the document outside images or headers/footers.',
    });
  } else if (!hasPhone || !hasProfileLink) {
    parserRisks.push({
      id: 'contact-partial',
      severity: 'warning',
      category: 'contact',
      message: `Recommended contact fields missing: ${[!hasPhone ? 'phone' : '', !hasProfileLink ? 'LinkedIn/GitHub URL' : ''].filter(Boolean).join(', ')}.`,
      fixHint: 'Include both a direct phone number and a clickable profile link for recruiter outreach.',
    });
  } else {
    parserRisks.push({
      id: 'contact-pass',
      severity: 'pass',
      category: 'contact',
      message: 'Name, email, phone, and profile URL are cleanly extractable.',
    });
  }

  // 3. Date & Layout Consistency
  const dateFamilies = new Set<string>();
  let missingDateEntries = 0;
  for (const exp of content.experience || []) {
    if (!exp.startDate?.trim()) {
      missingDateEntries += 1;
    } else {
      const fam = detectDateFormatFamily(exp.startDate);
      if (fam) dateFamilies.add(fam);
    }
    if (exp.endDate?.trim()) {
      const fam = detectDateFormatFamily(exp.endDate);
      if (fam) dateFamilies.add(fam);
    }
  }

  const effectiveDateStyleCount = Math.max(dateFamilies.size, rawDiagnostics?.dateStylesCount || 0);
  if (missingDateEntries > 0) {
    parserRisks.push({
      id: 'dates-missing',
      severity: 'warning',
      category: 'dates',
      message: `${missingDateEntries} experience role(s) are missing a start date, making tenure calculation fail in ATS timelines.`,
      fixHint: 'Use explicit YYYY-MM or Mon YYYY dates on every role.',
    });
  } else if (effectiveDateStyleCount > 1) {
    parserRisks.push({
      id: 'dates-mixed',
      severity: 'warning',
      category: 'dates',
      message: 'Inconsistent date formats detected across roles (e.g., mixing YYYY-MM with Month Year or MM/YYYY).',
      fixHint: 'Standardize all work history dates to one consistent format.',
    });
  } else if ((content.experience || []).length > 0) {
    parserRisks.push({
      id: 'dates-consistent',
      severity: 'pass',
      category: 'dates',
      message: 'Work experience dates follow a uniform, ATS-timeline-safe format.',
    });
  }

  if (rawDiagnostics && (rawDiagnostics.pipeTableLines > 0 || rawDiagnostics.fancyGlyphCount > 2)) {
    parserRisks.push({
      id: 'layout-table-risk',
      severity: 'warning',
      category: 'formatting',
      message: `Detected ${rawDiagnostics.pipeTableLines} multi-column pipe/tab separator row(s) and ${rawDiagnostics.fancyGlyphCount} decorative glyph symbol(s) that older ATS parsers may scramble.`,
      fixHint: 'Use standard round bullets (•) and single-column sections without ASCII tables.',
    });
  } else {
    parserRisks.push({
      id: 'layout-single-column',
      severity: 'pass',
      category: 'formatting',
      message: 'Single-column reading order and standard text glyphs verified.',
    });
  }

  // 4. Bullet Audit (Action Verbs, Metrics, Word-Length Bounds)
  let actionVerbsCount = 0;
  let metricsCount = 0;
  let passiveOpenerCount = 0;
  let shortBulletsCount = 0;
  let longBulletsCount = 0;
  let idealBulletCount = 0;
  const bulletQuality: AtsBulletQualityItem[] = [];

  const analyzeBullet = (
    rawBullet: string,
    section: 'Experience' | 'Projects',
    contextLabel: string,
  ) => {
    const clean = stripBulletPrefix(rawBullet);
    if (!clean) return;
    const words = countWords(clean);
    const hasActionVerb = ACTION_VERB_REGEX.test(clean);
    const hasPassiveOpener = PASSIVE_OPENER_REGEX.test(clean);
    const hasMetric = METRIC_REGEX.test(clean);

    if (hasActionVerb) actionVerbsCount += 1;
    if (hasPassiveOpener) passiveOpenerCount += 1;
    if (hasMetric) metricsCount += 1;

    const lengthStatus: 'short' | 'ideal' | 'long' =
      words < 10 ? 'short' : words > 35 ? 'long' : 'ideal';

    if (lengthStatus === 'short') shortBulletsCount += 1;
    else if (lengthStatus === 'long') longBulletsCount += 1;
    else idealBulletCount += 1;

    const issues: string[] = [];
    if (!hasActionVerb) {
      issues.push('start with a strong action verb');
    }
    if (!hasMetric) {
      issues.push('add a quantified outcome (%, $, ms, scale)');
    }
    if (lengthStatus === 'short') {
      issues.push(`too brief (${words} words — aim for 12–30 words with XYZ context)`);
    } else if (lengthStatus === 'long') {
      issues.push(`too long (${words} words — tighten under 35 words for scanability)`);
    }

    bulletQuality.push({
      bullet: clean,
      section,
      contextLabel,
      wordCount: words,
      hasActionVerb,
      hasMetric,
      lengthStatus,
      feedback:
        issues.length === 0
          ? 'Strong action verb, quantified metric, and ideal scannable length.'
          : `Improve by: ${issues.join('; ')}.`,
    });
  };

  for (const exp of content.experience || []) {
    const label = [exp.title, exp.company].filter(Boolean).join(' @ ') || 'Experience';
    for (const b of exp.bullets || []) {
      analyzeBullet(b, 'Experience', label);
    }
  }

  for (const proj of content.projects || []) {
    const label = proj.name || 'Project';
    for (const h of proj.highlights || []) {
      analyzeBullet(h, 'Projects', label);
    }
  }

  // 5. Stack & Evidence Alignment (Dimension 4)
  const declaredSkills = Array.from(
    new Set((content.skills || []).map((s) => s.name?.trim()).filter(Boolean) as string[]),
  );
  const evidenceCorpus = [
    content.headline || '',
    content.summary || '',
    ...(content.experience || []).flatMap((e) => [e.title || '', ...(e.bullets || [])]),
    ...(content.projects || []).flatMap((p) => [
      p.name || '',
      p.description || '',
      ...(p.highlights || []),
    ]),
  ]
    .join('\n')
    .toLowerCase();

  const corroboratedSkills: string[] = [];
  const unreferencedSkills: string[] = [];
  for (const skill of declaredSkills) {
    const pattern = new RegExp(`(?:^|[^a-z0-9])${escapeRegexLiteral(skill.toLowerCase())}(?:$|[^a-z0-9])`, 'i');
    if (pattern.test(evidenceCorpus) || evidenceCorpus.includes(skill.toLowerCase())) {
      corroboratedSkills.push(skill);
    } else {
      unreferencedSkills.push(skill);
    }
  }

  const stackAlignment: AtsStackAlignment = {
    totalSkills: declaredSkills.length,
    corroboratedSkills,
    unreferencedSkills,
  };

  // 6. Writing & Grammar Health (shared rules)
  const writingAudit = runDeterministicWritingCheck({
    headline: content.headline,
    summary: content.summary,
    targetRole,
    experience: (content.experience || []).map((e) => ({
      title: e.title,
      company: e.company,
      current: e.current,
      endDate: e.endDate,
      bullets: e.bullets,
    })),
    projects: (content.projects || []).map((p) => ({
      name: p.name,
      description: p.description,
    })),
  });

  const wordCount = rawDiagnostics?.wordCountOverride ?? computeTotalWordsFromContent(content);
  if (wordCount < 160) {
    parserRisks.push({
      id: 'wordcount-thin',
      severity: 'warning',
      category: 'length',
      message: `Low content density (${wordCount} words). Competitive technical resumes typically range between 300 and 700 words.`,
      fixHint: 'Expand your key achievements with concrete systems scope and quantified outcomes.',
    });
  } else if (wordCount > 900) {
    parserRisks.push({
      id: 'wordcount-long',
      severity: 'warning',
      category: 'length',
      message: `High word count (${wordCount} words) risks spilling past 1–2 pages or burying priority keywords.`,
      fixHint: 'Trim older or redundant bullets to keep each bullet under 35 words.',
    });
  } else {
    parserRisks.push({
      id: 'wordcount-pass',
      severity: 'pass',
      category: 'length',
      message: `Balanced overall length (${wordCount} words) within optimal 1–2 page ATS density.`,
    });
  }

  // 7. Compute the 5 Objective Dimensions (matching /tools/resume-score weights)
  // Dimension 1: Formatting & Hierarchy (25%)
  let formattingDimScore = 100;
  formattingDimScore -= missingSections.length * 18;
  if (!hasEmail) formattingDimScore -= 14;
  if (!hasName) formattingDimScore -= 12;
  if (!hasPhone) formattingDimScore -= 5;
  if (!hasProfileLink) formattingDimScore -= 5;
  if (missingDateEntries > 0) formattingDimScore -= Math.min(12, missingDateEntries * 6);
  else if (effectiveDateStyleCount > 1) formattingDimScore -= 8;
  if (rawDiagnostics && (rawDiagnostics.pipeTableLines > 0 || rawDiagnostics.fancyGlyphCount > 2)) {
    formattingDimScore -= 10;
  }
  formattingDimScore = clampScore(formattingDimScore);

  // Dimension 2: Quantified Metrics & Impact (25%)
  const totalBullets = bulletQuality.length;
  const metricRatio = totalBullets > 0 ? metricsCount / totalBullets : 0;
  const metricsDimScore =
    totalBullets === 0
      ? 15
      : clampScore(
          metricRatio >= 0.6
            ? 90 + Math.min(10, metricsCount * 2)
            : metricRatio >= 0.4
              ? 76 + (metricRatio - 0.4) * 70
              : 32 + metricRatio * 110,
        );

  // Dimension 3: Action Verb Dominance (20%)
  const verbRatio = totalBullets > 0 ? actionVerbsCount / totalBullets : 0;
  const verbsDimScore =
    totalBullets === 0
      ? 20
      : clampScore(verbRatio * 96 + (verbRatio >= 0.75 ? 4 : 0) - passiveOpenerCount * 10);

  // Dimension 4: Technical Depth & Stack Alignment (15%)
  let depthDimScore = 30;
  if (declaredSkills.length > 0) {
    const breadthScore = Math.min(40, declaredSkills.length * 6); // >= 7 skills gets full 40
    const alignmentRatio = corroboratedSkills.length / declaredSkills.length;
    const alignmentPoints = Math.round(alignmentRatio * 60);
    depthDimScore = clampScore(breadthScore + alignmentPoints);
  }

  // Dimension 5: Brevity & Information Density (15%)
  let brevityDimScore = writingAudit.overallWritingScore;
  if (wordCount < 160) brevityDimScore -= 22;
  else if (wordCount > 900) brevityDimScore -= 15;
  if (totalBullets > 0) {
    const outlierRatio = (shortBulletsCount + longBulletsCount) / totalBullets;
    brevityDimScore -= Math.round(outlierRatio * 25);
  } else {
    brevityDimScore -= 25;
  }
  brevityDimScore = clampScore(brevityDimScore);

  const dimensions: AtsAuditDimension[] = [
    {
      key: 'formatting',
      label: 'ATS Formatting & Hierarchy',
      weight: 25,
      score: formattingDimScore,
      status: classifyScoreStatus(formattingDimScore),
      summary: `${detectedSections.length} sections detected · ${parserRisks.filter((r) => r.severity !== 'pass').length} parser alert(s)`,
    },
    {
      key: 'metrics',
      label: 'Quantified Metrics & Impact',
      weight: 25,
      score: metricsDimScore,
      status: classifyScoreStatus(metricsDimScore),
      summary: `${metricsCount} metrics across ${totalBullets || 0} achievement bullets`,
    },
    {
      key: 'action_verbs',
      label: 'Action Verb Dominance',
      weight: 20,
      score: verbsDimScore,
      status: classifyScoreStatus(verbsDimScore),
      summary: `${actionVerbsCount}/${totalBullets || 0} bullets start with strong leadership verbs`,
    },
    {
      key: 'technical_depth',
      label: 'Technical Depth & Stack Alignment',
      weight: 15,
      score: depthDimScore,
      status: classifyScoreStatus(depthDimScore),
      summary:
        declaredSkills.length > 0
          ? `${corroboratedSkills.length}/${declaredSkills.length} listed skills evidenced in bullets`
          : 'No structured Core Skills block detected',
    },
    {
      key: 'brevity',
      label: 'Brevity & Information Density',
      weight: 15,
      score: brevityDimScore,
      status: classifyScoreStatus(brevityDimScore),
      summary: `${wordCount} total words · ${idealBulletCount} ideal-length bullets · Writing ${writingAudit.overallWritingScore}/100`,
    },
  ];

  const overallScore = clampScore(
    formattingDimScore * 0.25 +
      metricsDimScore * 0.25 +
      verbsDimScore * 0.2 +
      depthDimScore * 0.15 +
      brevityDimScore * 0.15,
  );

  // 8. Actionable Recommendations
  const recommendations: string[] = [];
  if (missingSections.length > 0) {
    recommendations.push(`Add missing essential sections: ${missingSections.join(', ')}.`);
  }
  if (totalBullets > 0 && metricsCount < totalBullets * 0.5) {
    recommendations.push(
      `Quantify at least 50% of your bullets with measurable impact (currently ${metricsCount}/${totalBullets}).`,
    );
  }
  if (totalBullets > 0 && actionVerbsCount < totalBullets * 0.7) {
    recommendations.push(
      `Start every bullet with a decisive action verb (currently ${actionVerbsCount}/${totalBullets}).`,
    );
  }
  if (unreferencedSkills.length > 0) {
    recommendations.push(
      `Back up ${unreferencedSkills.length} listed skill(s) (${unreferencedSkills.slice(0, 4).join(', ')}) inside Experience or Project bullets so ATS semantic rankers see proof.`,
    );
  }
  if (shortBulletsCount > 0 || longBulletsCount > 0) {
    recommendations.push(
      `Rebalance bullet length: ${shortBulletsCount} bullet(s) are under 10 words and ${longBulletsCount} exceed 35 words.`,
    );
  }
  if (formattingFlags.length > 0) {
    recommendations.push(`Address contact formatting alerts: ${formattingFlags.join(', ')}.`);
  }
  if (writingAudit.issues.length > 0) {
    recommendations.push(
      `Detected ${writingAudit.issues.length} grammar, spelling, buzzword, or weak-phrasing issue(s) — fix these for maximum readability.`,
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      'Strong ATS single-column structure, verified skill-to-evidence alignment, and quantified impact density.',
    );
  }

  const findings: ResumeAuditFindings = {
    actionVerbsCount,
    metricsCount,
    missingSections,
    detectedSections,
    formattingFlags,
    wordCount,
    idealBulletCount,
    shortBulletsCount,
    longBulletsCount,
    dimensions,
    parserRisks,
    stackAlignment,
    bulletQuality,
    writingQuality: {
      score: writingAudit.overallWritingScore,
      issueCount: writingAudit.issues.length,
      spellingCount: writingAudit.issues.filter((i) => i.category === 'spelling').length,
      grammarCount: writingAudit.issues.filter((i) => i.category === 'grammar').length,
      buzzwordCount: writingAudit.issues.filter((i) => i.category === 'buzzword').length,
      weakPhrasingCount: writingAudit.issues.filter((i) => i.category === 'weak_phrasing').length,
    },
  };

  return {
    score: overallScore,
    findings,
    recommendations,
    writingAudit,
  };
}

/**
 * Evaluates raw pasted or extracted plain-text resume copy using the shared
 * 5-dimension Rezi-style ATS & Parser Risk engine.
 */
export function analyzePlainResumeTextAts(
  rawText: string,
  targetRole?: string,
): AtsAuditEvaluation {
  const { content, rawDiagnostics } = extractStructuredContentFromText(rawText, targetRole);
  return evaluateStructuredResumeAts(content, rawDiagnostics, targetRole);
}
