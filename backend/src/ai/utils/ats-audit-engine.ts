import type { WritingCheckResult } from '../interfaces/ai-provider.interface.js';
import type { ResumeContent } from '../../resumes/entities/resume.types.js';
import type {
  AtsActionVerbAnalysis,
  AtsAuditDimension,
  AtsBulletQualityItem,
  AtsJobDescriptionMatch,
  AtsParsedPreview,
  AtsParserRisk,
  AtsStackAlignment,
  AtsSystemSimulations,
  ResumeAuditFindings,
} from '../../resumes/entities/resume-analysis.entity.js';
import { runDeterministicWritingCheck } from './writing-quality-rules.js';
import {
  ACTION_VERB_ALTERNATIVES,
  ACTION_VERBS_BY_CATEGORY,
  ALL_ACTION_VERBS,
  analyzeJobDescriptionMatch,
  extractSkillsFromCorpus,
  normalizeExtractedText,
  simulateAtsPlatforms,
} from './ats-taxonomy.js';

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
  rawNormalizedText?: string;
}

// 250+ Action Verbs Pattern built from comprehensive taxonomy
const ACTION_VERB_REGEX = new RegExp(
  `^(?:[-•*●▪◦➤→*►■]\\s*)?(${Array.from(ALL_ACTION_VERBS).join('|')})\\b`,
  'i',
);

const PASSIVE_OPENER_REGEX =
  /^(?:[-•*●▪◦➤→*►■]\s*)?(?:responsible for|assisted with|helped with|worked on|duties included|tasked with|participated in|involved in|handled|supported with)\b/i;

/**
 * Matches measurable impact across global currencies, Indian numbering (Lakhs, Crores),
 * percentages, throughput, latency, multipliers, thousands formatting, and technical KPIs.
 */
const METRIC_REGEX =
  /(?:[\$€£₹]|Rs\.?|INR|EUR|GBP|USD)\s*\d+(?:[.,]\d+)?(?:\s*(?:k|m|b|cr|crores?|lakhs?|lac|l)\b|\+)?|\d+(?:[.,]\d+)?\s*(?:%|percentage points)|\b\d+(?:[.,]\d+)?\s*(?:x|fold)\b|\b\d{1,3}(?:,\d{3})+\+?|\b\d+(?:\.\d+)?\s*(?:ms|s|sec|seconds?|mins?|minutes?|hrs?|hours?|days?|weeks?|mos?|months?|yrs?|years?|users?|clients?|customers?|merchants?|events?|requests?|queries?|endpoints?|teams?|engineers?|developers?|microservices?|pipelines?|qps|rps|tps|req\/s|gb|tb|pb|mb)\+?|\b(?:slashed|cut|decreased|increased|boosted|amplified|grew|scaled|saved)\s+by\s+\d+/i;

const NON_ASCII_DECORATIVE_GLYPH_REGEX = /[★✦❖➜✔✓❌☑⭐●◆◇■□▲▼]/g;

const CANONICAL_HEADINGS: Array<{
  key: 'summary' | 'experience' | 'skills' | 'education' | 'projects' | 'certifications';
  regex: RegExp;
}> = [
  {
    key: 'summary',
    regex:
      /^(?:#+\s*)?(?:professional\s+|career\s+|executive\s+)?(?:summary|profile|objective|about(?:\s+me)?|overview)$/i,
  },
  {
    key: 'experience',
    regex:
      /^(?:#+\s*)?(?:work\s+|professional\s+|relevant\s+|industry\s+|career\s+)?(?:experience|history|employment(?:\s+history)?)$/i,
  },
  {
    key: 'skills',
    regex:
      /^(?:#+\s*)?(?:technical\s+|core\s+|key\s+|professional\s+)?(?:skills|competencies|technologies|tech\s+stack|expertise|tools\s+(&|and)\s+technologies)$/i,
  },
  {
    key: 'education',
    regex: /^(?:#+\s*)?(?:education|academic\s+background|academic\s+qualifications|qualifications|degrees?)$/i,
  },
  {
    key: 'projects',
    regex: /^(?:#+\s*)?(?:selected\s+|key\s+|personal\s+|technical\s+|academic\s+)?projects$/i,
  },
  {
    key: 'certifications',
    regex: /^(?:#+\s*)?(?:certifications?|licenses?(\s+(&|and)\s+certifications?)?|credentials)$/i,
  },
];

function stripBulletPrefix(text: string): string {
  return text.replace(/^[•●▪◦\-*➤→►■]+\s*/, '').trim();
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
  if (!trimmed || /^present|current|ongoing$/i.test(trimmed)) return null;
  if (/^\d{4}-\d{1,2}(?:-\d{1,2})?$/.test(trimmed)) return 'iso';
  if (/^\d{1,2}\/\d{2,4}$/.test(trimmed)) return 'slash';
  if (/^[a-z]{3,9}\.?\s+\d{4}$/i.test(trimmed)) return 'month_name';
  if (/^\d{4}$/.test(trimmed)) return 'year';
  return null;
}

function escapeRegexLiteral(token: string): string {
  return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if a bullet complies with the Google XYZ formula:
 * Accomplished [X], as measured by [Y], by doing [Z]
 */
function evaluateXyzFormula(bullet: string): {
  isMet: boolean;
  actionVerb: string | null;
  metric: string | null;
  scope: boolean;
  feedback?: string;
  suggestedRewrite?: string;
} {
  const clean = stripBulletPrefix(bullet);
  const verbMatch = clean.match(ACTION_VERB_REGEX);
  const actionVerb = verbMatch ? verbMatch[1] : null;

  const metricMatch = clean.match(METRIC_REGEX);
  const metric = metricMatch ? metricMatch[0] : null;

  const words = countWords(clean);
  const hasScope = words >= 10;
  const isMet = Boolean(actionVerb && metric && hasScope);

  let feedback: string | undefined;
  let suggestedRewrite: string | undefined;

  if (!actionVerb && !metric) {
    feedback = 'Missing both an opening action verb and a quantifiable result.';
    suggestedRewrite = `Engineered [specific system/feature], improving performance by 25% through [methodology/tool].`;
  } else if (!actionVerb) {
    feedback = 'Start with a strong action verb (e.g., Architected, Optimized, Shipped).';
    suggestedRewrite = `Spearheaded ${clean.replace(/^[a-z]/, (c) => c.toLowerCase())}`;
  } else if (!metric) {
    feedback = 'Quantify the outcome (add %, $, latency reduction, or scale metrics).';
    suggestedRewrite = `${clean}, delivering 20%+ improvement in throughput.`;
  } else if (!hasScope) {
    feedback = 'Expand with technical scope or tool context (aim for 12–30 words).';
  }

  return { isMet, actionVerb, metric, scope: hasScope, feedback, suggestedRewrite };
}

function categorizeActionVerb(verb: string): string {
  const lower = verb.toLowerCase();
  for (const [cat, list] of Object.entries(ACTION_VERBS_BY_CATEGORY)) {
    if (list.includes(lower)) return cat;
  }
  return 'execution';
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
 * Extracts structured ResumeContent from raw text (supports plain text, PDF extraction, DOCX)
 * with robust multi-section parsing, date detection, skill tokenization, and contact extraction.
 */
export function extractStructuredContentFromText(
  rawText: string,
  targetRole?: string,
): { content: ResumeContent; rawDiagnostics: RawTextDiagnostics } {
  const normalized = normalizeExtractedText(rawText);
  const lines = normalized.split('\n');
  const nonEmptyLines = lines.map((l) => l.trim()).filter(Boolean);

  // 1. Comprehensive Contact Extraction
  const emailMatch = normalized.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = normalized.match(
    /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{1,3}[-.\s]?\d{5}[-.\s]?\d{5}|\+?\d{9,13}/,
  );
  const linkedinMatch = normalized.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9_-]+)/i);
  const githubMatch = normalized.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_-]+)/i);

  const websiteMatches = normalized.match(/https?:\/\/[^\s),]+/gi) || [];
  const portfolioMatch = websiteMatches.find(
    (u) => !/linkedin\.com/i.test(u) && !/github\.com/i.test(u),
  );

  // Location heuristics (City, State / Country or Remote)
  const locationLine = nonEmptyLines.slice(0, 6).find((l) =>
    /(?:bengaluru|bangalore|hyderabad|pune|mumbai|delhi|noida|gurugram|chennai|san francisco|seattle|new york|austin|chicago|london|berlin|toronto|vancouver|remote|california|ca|ny|tx|wa|india|usa|uk|germany|canada)/i.test(
      l,
    ),
  );
  let parsedLocation: string | undefined;
  if (locationLine) {
    const locMatch = locationLine.match(
      /(?:[A-Z][a-zA-Z\s]+,\s*(?:[A-Z]{2}|[A-Za-z\s]+)|Remote)/i,
    );
    parsedLocation = locMatch ? locMatch[0].trim() : locationLine.slice(0, 50).trim();
  }

  // Name extraction (first valid non-metadata header line)
  let detectedName = '';
  for (const candidate of nonEmptyLines.slice(0, 4)) {
    if (
      candidate.length >= 2 &&
      candidate.length <= 60 &&
      !candidate.includes('@') &&
      !/^(resume|curriculum\s+vitae|cv|contact|profile|portfolio)$/i.test(candidate) &&
      !/^(https?:|www\.)/i.test(candidate) &&
      !/\.(com|org|net|in|io)/i.test(candidate) &&
      !/^(?:professional\s+)?(?:summary|experience|skills|education)$/i.test(candidate)
    ) {
      detectedName = candidate.replace(/[|,•·].*$/, '').trim();
      break;
    }
  }

  // Layout hazards detection
  let pipeTableLines = 0;
  for (let idx = 2; idx < lines.length; idx++) {
    const line = lines[idx];
    if (!line) continue;
    const pipeCount = (line.match(/\|/g) || []).length;
    if (pipeCount >= 2 || /\t{2,}/.test(line)) {
      pipeTableLines += 1;
    }
  }

  const fancyGlyphMatches = normalized.match(NON_ASCII_DECORATIVE_GLYPH_REGEX) || [];
  const dateFamilies = new Set<string>();
  const rawDateMatches =
    normalized.match(
      /\b(?:\d{4}-\d{1,2}|\d{1,2}\/\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\b(?:19|20)\d{2}\b)\b/gi,
    ) || [];
  for (const dt of rawDateMatches) {
    const fam = detectDateFormatFamily(dt);
    if (fam) dateFamilies.add(fam);
  }

  // 2. Section Segmentation
  type SectionKey = 'header' | 'summary' | 'experience' | 'skills' | 'education' | 'projects' | 'certifications';
  const buckets: Record<SectionKey, string[]> = {
    header: [],
    summary: [],
    experience: [],
    skills: [],
    education: [],
    projects: [],
    certifications: [],
  };

  let currentSection: SectionKey = 'header';

  for (const line of nonEmptyLines) {
    const cleanHeaderLine = line.replace(/[:\-–—_=]+$/g, '').trim();
    const matchedHeading = CANONICAL_HEADINGS.find((h) => h.regex.test(cleanHeaderLine));

    if (matchedHeading) {
      currentSection = matchedHeading.key;
      continue;
    }
    buckets[currentSection].push(line);
  }

  // Fallback: If experience section was empty but text contains bullet points
  const allBulletLines = nonEmptyLines.filter((l) => /^[•●▪◦\-*➤→►■]\s+/.test(l));
  if (buckets.experience.length === 0 && allBulletLines.length > 0) {
    buckets.experience = allBulletLines;
  }

  // Parse Summary (multi-line)
  const summaryText = buckets.summary.join(' ').trim();

  // 3. Parse Experience Entries
  const experienceBlocks: ResumeContent['experience'] = [];
  let currentExp: ResumeContent['experience'][number] | null = null;

  const dateSpanRegex =
    /((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{2,4}|\d{4}-\d{1,2}|\b(?:19|20)\d{2}\b))\s*(?:[-–—to~]+)\s*(Present|Current|Ongoing|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{2,4}|\d{4}-\d{1,2}|\b(?:19|20)\d{2}\b))/i;

  for (let i = 0; i < buckets.experience.length; i++) {
    const line = buckets.experience[i];
    const isBullet = /^[•●▪◦\-*➤→►■]\s+/.test(line);
    const cleaned = stripBulletPrefix(line);
    if (!cleaned) continue;

    if (isBullet) {
      if (!currentExp) {
        currentExp = {
          company: 'Work Experience',
          title: targetRole || 'Role',
          startDate: rawDateMatches[0] || '',
          current: true,
          bullets: [],
        };
        experienceBlocks.push(currentExp);
      }
      currentExp.bullets.push(cleaned);
    } else {
      const matchDateSpan = line.match(dateSpanRegex);
      const hasDateOrSeparator = matchDateSpan || /[—–|-]/.test(line) || /(?:20\d{2}|19\d{2}|present)/i.test(line);

      if (hasDateOrSeparator && line.length <= 140) {
        const startDate = matchDateSpan ? matchDateSpan[1].trim() : '';
        const endDate = matchDateSpan && !/present|current/i.test(matchDateSpan[2]) ? matchDateSpan[2].trim() : undefined;
        const isCurrent = Boolean(matchDateSpan && /present|current/i.test(matchDateSpan[2]));

        const textWithoutDates = line.replace(dateSpanRegex, '').replace(/\([^)]*\)/g, '').trim();
        const parts = textWithoutDates.split(/\s*[-–—|,]\s*/).map((p) => p.trim()).filter(Boolean);

        let company = parts[0] || 'Organization';
        let title = parts[1] || targetRole || 'Specialist';

        if (parts.length >= 2 && /(?:engineer|developer|manager|lead|architect|analyst|designer|consultant|director|intern)\b/i.test(parts[0])) {
          title = parts[0];
          company = parts[1];
        }

        currentExp = {
          company,
          title,
          startDate,
          endDate,
          current: isCurrent,
          bullets: [],
        };
        experienceBlocks.push(currentExp);
      } else if (currentExp) {
        if (currentExp.bullets.length > 0 && !/^[A-Z]/.test(cleaned)) {
          const lastIdx = currentExp.bullets.length - 1;
          currentExp.bullets[lastIdx] = `${currentExp.bullets[lastIdx]} ${cleaned}`.trim();
        } else {
          currentExp.bullets.push(cleaned);
        }
      } else {
        currentExp = {
          company: cleaned.slice(0, 60),
          title: targetRole || 'Role',
          startDate: '',
          current: true,
          bullets: [],
        };
        experienceBlocks.push(currentExp);
      }
    }
  }

  // 4. Parse Skills (explicit block + corpus enrichment)
  const skillsSet = new Set<string>();

  // Extract from explicit skills section
  for (const line of buckets.skills) {
    // Strip categories like "Languages:", "Cloud & DevOps:", "Frameworks:"
    const strippedCategory = line.replace(/^[A-Za-z0-9\s&/()\-–—]+:\s*/, '');
    const tokens = strippedCategory
      .split(/[,|•·/;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 2 && s.length <= 45 && !/^(skills|technologies|tools)$/i.test(s));

    for (const token of tokens) {
      skillsSet.add(token);
    }
  }

  // Augment from full text using the 1,200+ taxonomy
  const corpusSkills = extractSkillsFromCorpus(normalized);
  for (const cs of corpusSkills.slice(0, 30)) {
    skillsSet.add(cs.name);
  }

  const uniqueSkills = Array.from(skillsSet).map((name) => ({ name }));

  // 5. Parse Education
  const educationBlocks: ResumeContent['education'] = buckets.education
    .filter((l) => l.length > 3)
    .slice(0, 5)
    .map((l) => {
      const gradYear = /(?:19|20)\d{2}/.exec(l)?.[0];
      const degreeMatch = /(?:b\.?tech|b\.?e\.?|b\.?s\.?|m\.?s\.?|m\.?tech|mba|bachelor|master|ph\.?d|diploma)/i.exec(l)?.[0] || 'Degree';
      return {
        school: l.replace(/\([^)]*\)/g, '').replace(/\b(?:19|20)\d{2}\b/g, '').trim() || l,
        degree: degreeMatch,
        field: '',
        graduationDate: gradYear,
      };
    });

  // 6. Parse Projects
  const projectsBlocks: NonNullable<ResumeContent['projects']> = [];
  let currentProj: NonNullable<ResumeContent['projects']>[number] | null = null;

  for (const line of buckets.projects) {
    const isBullet = /^[•●▪◦\-*➤→►■]\s+/.test(line);
    const cleaned = stripBulletPrefix(line);
    if (!cleaned) continue;

    if (!isBullet && line.length <= 100) {
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
        name: 'Technical Project',
        description: cleaned,
        highlights: [cleaned],
      };
      projectsBlocks.push(currentProj);
    }
  }

  const content: ResumeContent = {
    contact: {
      fullName: detectedName,
      email: emailMatch?.[0] || '',
      phone: phoneMatch?.[0]?.trim(),
      linkedinUrl: linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : undefined,
      githubUrl: githubMatch ? `https://github.com/${githubMatch[1]}` : undefined,
      websiteUrl: portfolioMatch,
    },
    headline: targetRole || (detectedName && nonEmptyLines[1] && !nonEmptyLines[1].includes('@') ? nonEmptyLines[1] : ''),
    summary: summaryText,
    skills: uniqueSkills,
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
      wordCountOverride: countWords(normalized),
      rawNormalizedText: normalized,
    },
  };
}

/**
 * Evaluates a structured ResumeContent payload across the 5 objective ATS dimensions
 * with Google XYZ scoring, 250+ action verbs, Jobscan-style JD matching, and ATS platform simulations.
 */
export function evaluateStructuredResumeAts(
  content: ResumeContent,
  rawDiagnostics?: RawTextDiagnostics,
  targetRole?: string,
  jobDescriptionText?: string,
): AtsAuditEvaluation {
  const missingSections: string[] = [];
  const detectedSections: string[] = [];
  const formattingFlags: string[] = [];
  const parserRisks: AtsParserRisk[] = [];

  // 1. Essential Sections Audit
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
      fixHint: 'Add canonical section titles (Summary, Experience, Skills, Education) so Taleo and Workday parsers route your content accurately.',
    });
  } else {
    parserRisks.push({
      id: 'sections-complete',
      severity: 'pass',
      category: 'sections',
      message: 'All 4 essential ATS section blocks (Summary, Experience, Skills, Education) are present.',
    });
  }

  // 2. Contact Extractability Audit
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
      fixHint: 'Place your full name and plain-text email at the very top of page 1 outside images or headers/footers.',
    });
  } else if (!hasPhone || !hasProfileLink) {
    parserRisks.push({
      id: 'contact-partial',
      severity: 'warning',
      category: 'contact',
      message: `Recommended contact fields missing: ${[!hasPhone ? 'phone number' : '', !hasProfileLink ? 'LinkedIn/GitHub URL' : ''].filter(Boolean).join(', ')}.`,
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

  // 3. Date & Layout Consistency Audit
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
      fixHint: 'Use explicit Month Year or YYYY-MM dates on every role.',
    });
  } else if (effectiveDateStyleCount > 1) {
    parserRisks.push({
      id: 'dates-mixed',
      severity: 'warning',
      category: 'dates',
      message: 'Inconsistent date formats detected across roles (e.g., mixing YYYY-MM with Month Year or MM/YYYY).',
      fixHint: 'Standardize all work history dates to one consistent format (e.g. "Jun 2022 - Present").',
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
      message: `Detected ${rawDiagnostics.pipeTableLines} multi-column pipe/tab separator row(s) and ${rawDiagnostics.fancyGlyphCount} decorative glyph symbol(s) that older ATS parsers (Workday, Taleo) may scramble.`,
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

  // 4. Bullet Impact, Action Verbs, and Google XYZ Formula Audit
  let actionVerbsCount = 0;
  let metricsCount = 0;
  let xyzFormulaBulletsCount = 0;
  let shortBulletsCount = 0;
  let longBulletsCount = 0;
  let idealBulletCount = 0;
  const verbFrequency: Record<string, number> = {};
  const bulletQuality: AtsBulletQualityItem[] = [];

  const analyzeBullet = (
    rawBullet: string,
    section: 'Experience' | 'Projects',
    contextLabel: string,
  ) => {
    const clean = stripBulletPrefix(rawBullet);
    if (!clean) return;

    const words = countWords(clean);
    const xyz = evaluateXyzFormula(clean);

    if (xyz.actionVerb) {
      actionVerbsCount += 1;
      const lowerV = xyz.actionVerb.toLowerCase();
      verbFrequency[lowerV] = (verbFrequency[lowerV] || 0) + 1;
    }

    if (xyz.metric) {
      metricsCount += 1;
    }

    if (xyz.isMet) {
      xyzFormulaBulletsCount += 1;
    }

    const lengthStatus: 'short' | 'ideal' | 'long' =
      words < 10 ? 'short' : words > 38 ? 'long' : 'ideal';

    if (lengthStatus === 'short') shortBulletsCount += 1;
    else if (lengthStatus === 'long') longBulletsCount += 1;
    else idealBulletCount += 1;

    bulletQuality.push({
      bullet: clean,
      section,
      contextLabel,
      wordCount: words,
      hasActionVerb: Boolean(xyz.actionVerb),
      hasMetric: Boolean(xyz.metric),
      xyzFormulaMet: xyz.isMet,
      actionVerbCategory: xyz.actionVerb ? categorizeActionVerb(xyz.actionVerb) : undefined,
      lengthStatus,
      feedback:
        xyz.feedback ||
        'Strong action verb, quantified metric, and Google XYZ formula structure verified.',
      suggestedRewrite: xyz.suggestedRewrite,
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

  // Action Verbs Repetition & Categorization
  const repeatedVerbs = Object.entries(verbFrequency)
    .filter(([_, count]) => count >= 3)
    .map(([verb, count]) => ({
      verb,
      count,
      suggestedAlternatives:
        ACTION_VERB_ALTERNATIVES[verb] || ['Architected', 'Spearheaded', 'Optimized', 'Engineered'],
    }));

  const actionVerbAnalysis: AtsActionVerbAnalysis = {
    totalVerbs: actionVerbsCount,
    distinctVerbs: Object.keys(verbFrequency).length,
    repeatedVerbs,
    verbsByCategory: {
      leadership: Object.keys(verbFrequency).filter((v) =>
        ACTION_VERBS_BY_CATEGORY.leadership.includes(v),
      ),
      engineering: Object.keys(verbFrequency).filter((v) =>
        ACTION_VERBS_BY_CATEGORY.engineering.includes(v),
      ),
      optimization: Object.keys(verbFrequency).filter((v) =>
        ACTION_VERBS_BY_CATEGORY.optimization.includes(v),
      ),
      innovation: Object.keys(verbFrequency).filter((v) =>
        ACTION_VERBS_BY_CATEGORY.innovation.includes(v),
      ),
      execution: Object.keys(verbFrequency).filter((v) =>
        ACTION_VERBS_BY_CATEGORY.execution.includes(v),
      ),
    },
  };

  // 5. Technical Depth & Stack Alignment
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
    const pattern = new RegExp(
      `(?:^|[^a-z0-9+#])${escapeRegexLiteral(skill.toLowerCase())}(?:$|[^a-z0-9+#])`,
      'i',
    );
    if (pattern.test(evidenceCorpus) || evidenceCorpus.includes(skill.toLowerCase())) {
      corroboratedSkills.push(skill);
    } else {
      unreferencedSkills.push(skill);
    }
  }

  // Detect unlisted skills demonstrated in bullets from our 1,200+ taxonomy
  const corpusSkills = extractSkillsFromCorpus(evidenceCorpus);
  const unlistedSkills = corpusSkills
    .map((s) => s.name)
    .filter(
      (name) =>
        !declaredSkills.some((ds) => ds.toLowerCase() === name.toLowerCase()),
    )
    .slice(0, 8);

  const hardSkillsList = declaredSkills.filter((s) => {
    const lower = s.toLowerCase();
    const hit = extractSkillsFromCorpus(lower)[0];
    return hit ? hit.isHardSkill : true;
  });
  const softSkillsList = declaredSkills.filter((s) => !hardSkillsList.includes(s));

  const stackAlignment: AtsStackAlignment = {
    totalSkills: declaredSkills.length,
    corroboratedSkills,
    unreferencedSkills,
    unlistedSkills,
    hardSkills: hardSkillsList,
    softSkills: softSkillsList,
  };

  // 6. Writing, Grammar & Pronouns Audit
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

  const pronounsCount = writingAudit.issues.filter((i) => i.id.startsWith('pronoun')).length;

  const wordCount = rawDiagnostics?.wordCountOverride ?? computeTotalWordsFromContent(content);
  if (wordCount < 180) {
    parserRisks.push({
      id: 'wordcount-thin',
      severity: 'warning',
      category: 'length',
      message: `Low content density (${wordCount} words). Competitive technical resumes typically range between 350 and 800 words.`,
      fixHint: 'Expand your key achievements with concrete technical scope, architecture scale, and quantified metrics.',
    });
  } else if (wordCount > 1000) {
    parserRisks.push({
      id: 'wordcount-long',
      severity: 'warning',
      category: 'length',
      message: `High word count (${wordCount} words) risks spilling past 1–2 pages or burying priority keywords in recruiter scans.`,
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

  // 7. Compute the 5 Objective Dimension Scores
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
  const xyzRatio = totalBullets > 0 ? xyzFormulaBulletsCount / totalBullets : 0;
  const metricsDimScore =
    totalBullets === 0
      ? 15
      : clampScore(
          metricRatio >= 0.5
            ? 85 + Math.min(15, metricsCount * 2 + xyzRatio * 10)
            : metricRatio >= 0.3
              ? 70 + (metricRatio - 0.3) * 75
              : 30 + metricRatio * 130,
        );

  // Dimension 3: Action Verb Dominance (20%)
  const verbRatio = totalBullets > 0 ? actionVerbsCount / totalBullets : 0;
  let verbsDimScore =
    totalBullets === 0
      ? 20
      : clampScore(verbRatio * 96 + (verbRatio >= 0.75 ? 4 : 0) - repeatedVerbs.length * 5 - pronounsCount * 3);
  verbsDimScore = clampScore(verbsDimScore);

  // Dimension 4: Technical Depth & Stack Alignment (15%)
  let depthDimScore = 30;
  if (declaredSkills.length > 0) {
    const breadthScore = Math.min(40, declaredSkills.length * 5); // >= 8 skills gets full 40
    const alignmentRatio = corroboratedSkills.length / declaredSkills.length;
    const alignmentPoints = Math.round(alignmentRatio * 60);
    depthDimScore = clampScore(breadthScore + alignmentPoints);
  }

  // Dimension 5: Brevity & Information Density (15%)
  let brevityDimScore = writingAudit.overallWritingScore;
  if (wordCount < 180) brevityDimScore -= 20;
  else if (wordCount > 1000) brevityDimScore -= 12;
  if (totalBullets > 0) {
    const outlierRatio = (shortBulletsCount + longBulletsCount) / totalBullets;
    brevityDimScore -= Math.round(outlierRatio * 22);
  } else {
    brevityDimScore -= 20;
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
      summary: `${metricsCount} metrics · ${xyzFormulaBulletsCount} XYZ formula bullets across ${totalBullets || 0} items`,
    },
    {
      key: 'action_verbs',
      label: 'Action Verb Dominance',
      weight: 20,
      score: verbsDimScore,
      status: classifyScoreStatus(verbsDimScore),
      summary: `${actionVerbsCount}/${totalBullets || 0} bullets start with decisive action verbs · ${repeatedVerbs.length} repeated verb(s)`,
    },
    {
      key: 'technical_depth',
      label: 'Technical Depth & Stack Alignment',
      weight: 15,
      score: depthDimScore,
      status: classifyScoreStatus(depthDimScore),
      summary:
        declaredSkills.length > 0
          ? `${corroboratedSkills.length}/${declaredSkills.length} listed skills evidenced in work history`
          : 'No structured Core Skills block detected',
    },
    {
      key: 'brevity',
      label: 'Brevity & Information Density',
      weight: 15,
      score: brevityDimScore,
      status: classifyScoreStatus(brevityDimScore),
      summary: `${wordCount} words · ${idealBulletCount} ideal-length bullets · Writing ${writingAudit.overallWritingScore}/100`,
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
      `Quantify at least 50% of your bullets with measurable outcomes (currently ${metricsCount}/${totalBullets} have metrics).`,
    );
  }
  if (totalBullets > 0 && actionVerbsCount < totalBullets * 0.75) {
    recommendations.push(
      `Start every bullet with a strong action verb (currently ${actionVerbsCount}/${totalBullets}).`,
    );
  }
  if (repeatedVerbs.length > 0) {
    recommendations.push(
      `Vary your action verbs: "${repeatedVerbs[0].verb}" is used ${repeatedVerbs[0].count} times. Try alternatives: ${repeatedVerbs[0].suggestedAlternatives.slice(0, 3).join(', ')}.`,
    );
  }
  if (pronounsCount > 0) {
    recommendations.push(
      `Remove ${pronounsCount} first-person pronoun(s) (I, my, we) — resumes should always use omitted-subject telegraphic phrasing.`,
    );
  }
  if (unreferencedSkills.length > 0) {
    recommendations.push(
      `Back up ${unreferencedSkills.length} listed skill(s) (${unreferencedSkills.slice(0, 4).join(', ')}) in your Experience bullets so ATS semantic rankers see proof.`,
    );
  }
  if (shortBulletsCount > 0 || longBulletsCount > 0) {
    recommendations.push(
      `Rebalance bullet length: ${shortBulletsCount} bullet(s) are under 10 words and ${longBulletsCount} exceed 38 words.`,
    );
  }
  if (formattingFlags.length > 0) {
    recommendations.push(`Address contact formatting alerts: ${formattingFlags.join(', ')}.`);
  }
  if (writingAudit.issues.length > 0) {
    recommendations.push(
      `Detected ${writingAudit.issues.length} grammar, spelling, buzzword, or phrasing issue(s) — clean these up for maximum polish.`,
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      'Strong ATS single-column structure, verified skill-to-evidence alignment, and quantified impact density.',
    );
  }

  // 9. Job Description Matching (Jobscan-style simulation)
  let jobDescriptionMatch: AtsJobDescriptionMatch | undefined;
  if (jobDescriptionText && jobDescriptionText.trim().length >= 25) {
    jobDescriptionMatch = analyzeJobDescriptionMatch(
      rawDiagnostics?.rawNormalizedText || computeCorpusFromContent(content),
      jobDescriptionText,
    );
  }

  // 10. ATS System Simulations (Workday, Taleo, Greenhouse)
  const atsSystemSimulations: AtsSystemSimulations = simulateAtsPlatforms({
    hasStandardHeadings: missingSections.length === 0,
    hasMultiColumnRisk: (rawDiagnostics?.pipeTableLines || 0) > 0,
    hasConsistentDates: effectiveDateStyleCount <= 1 && missingDateEntries === 0,
    hasCompleteContact: hasName && hasEmail && hasPhone,
    wordCount,
  });

  // 11. Parsed Preview Generation ("How ATS Parsers See Your Resume")
  const parsedPreview: AtsParsedPreview = {
    contact: {
      fullName: content.contact?.fullName,
      email: content.contact?.email,
      phone: content.contact?.phone,
      location: content.contact?.location || (content as any).location,
      linkedinUrl: content.contact?.linkedinUrl,
      githubUrl: content.contact?.githubUrl,
      websiteUrl: content.contact?.websiteUrl,
    },
    headline: content.headline,
    summary: content.summary,
    experience: (content.experience || []).map((exp) => ({
      company: exp.company,
      title: exp.title,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      durationText: exp.startDate ? `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || ''}` : undefined,
      bulletCount: (exp.bullets || []).length,
    })),
    education: (content.education || []).map((edu) => ({
      school: edu.school,
      degree: edu.degree,
      field: edu.field,
      graduationDate: edu.graduationDate,
    })),
    skillsByCategory: {
      hardSkills: hardSkillsList,
      softSkills: softSkillsList,
      toolsAndCloud: declaredSkills.filter((s) => {
        const item = extractSkillsFromCorpus(s.toLowerCase())[0];
        return item && (item.category === 'cloud_devops' || item.category === 'databases');
      }),
      other: declaredSkills.filter((s) => !hardSkillsList.includes(s) && !softSkillsList.includes(s)),
    },
    projects: (content.projects || []).map((p) => ({
      name: p.name,
      highlightsCount: (p.highlights || []).length,
    })),
    rawNormalizedText: rawDiagnostics?.rawNormalizedText || computeCorpusFromContent(content),
  };

  const findings: ResumeAuditFindings = {
    actionVerbsCount,
    metricsCount,
    xyzFormulaBulletsCount,
    repeatedVerbsCount: repeatedVerbs.length,
    pronounsCount,
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
    actionVerbAnalysis,
    jobDescriptionMatch,
    atsSystemSimulations,
    parsedPreview,
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

function computeCorpusFromContent(content: ResumeContent): string {
  const parts: string[] = [
    content.contact?.fullName || '',
    content.contact?.email || '',
    content.contact?.phone || '',
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
  return parts.join('\n');
}

/**
 * Evaluates raw pasted or extracted plain-text resume copy using the 5-dimension
 * Rezi/Jobscan-style ATS & Parser Risk engine with optional Job Description matching.
 */
export function analyzePlainResumeTextAts(
  rawText: string,
  targetRole?: string,
  jobDescriptionText?: string,
): AtsAuditEvaluation {
  const { content, rawDiagnostics } = extractStructuredContentFromText(rawText, targetRole);
  return evaluateStructuredResumeAts(content, rawDiagnostics, targetRole, jobDescriptionText);
}
