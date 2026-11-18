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
  SKILL_ALIASES,
} from './ats-taxonomy.js';

export interface AtsAuditEvaluation {
  score: number;
  atsScore: number;
  matchScore?: number;
  compositeScore?: number;
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
 * Accurately ignores bare tenure durations like "Worked for 3 years" or "in 6 months".
 */
const METRIC_PATTERNS = [
  // 1. Currency ($120K, ₹50L, INR 10M, €50,000)
  /(?:[\$€£₹]|Rs\.?|INR|EUR|GBP|USD)\s*\d+(?:[.,]\d+)?(?:\s*(?:k|m|b|cr|crores?|lakhs?|lac|l)\b|\+)?/i,
  // 2. Percentages (35%, 99.98%, 20 percentage points)
  /\d+(?:[.,]\d+)?\s*(?:%|percentage points(?:\b|$))/i,
  // 3. Multipliers (2x, 10-fold)
  /\b\d+(?:[.,]\d+)?\s*(?:x|fold)\b/i,
  // 4. Formatted thousands (25,000+, 1,200,000)
  /\b\d{1,3}(?:,\d{3})+\+?/,
  // 5. Volume with scale suffix (1.2M daily transactions, 180K active merchants)
  /\b\d+(?:\.\d+)?\s*(?:k|m|b|cr|crores?|lakhs?)\b(?:\s+(?:daily|monthly|weekly|annual|annually|active|concurrent|registered))?\s+(?:users?|clients?|customers?|merchants?|events?|requests?|queries?|endpoints?|records?|transactions?|visits?|downloads?|visitors?|subscribers?|members?|accounts?|sessions?)\b/i,
  // 6. Direct technical metrics (50,000 QPS, 50 microservices, 120 endpoints, 10 teams)
  /\b\d+(?:\.\d+)?\s*(?:users?|clients?|customers?|merchants?|events?|requests?|queries?|endpoints?|records?|transactions?|microservices?|pipelines?|qps|rps|tps|req\/s|gb|tb|pb|mb)\b/i,
  // 7. Latency (sub-10ms, 450ms, 250 milliseconds)
  /\b\d+(?:\.\d+)?\s*(?:ms|milliseconds?|microseconds?|µs)\b/i,
  // 8. Quantified speedups / time reduction (shrinking build duration from 14 to 4 minutes)
  /\b(?:slashed|cut|decreased|reduced|shrunk|shrinking|shortened|accelerated|improved)\b[^\n.]{0,60}\b\d+(?:\.\d+)?\s*(?:mins?|minutes?|hrs?|hours?|days?|weeks?|seconds?|s)\b/i,
  // 9. Quantified impact verbs with numbers (increased by 25, saved 100K)
  /\b(?:slashed|cut|decreased|increased|boosted|amplified|grew|scaled|saved|eliminated|automated|optimized)\s+by\s+\d+(?:[.,]\d+)?/i,
];

export const METRIC_REGEX = new RegExp(METRIC_PATTERNS.map((p) => p.source).join('|'), 'i');

const NON_ASCII_DECORATIVE_GLYPH_REGEX = /[★✦❖➜✔✓❌☑⭐●◆◇■□▲▼]/g;

export const DATE_SPAN_REGEX =
  /((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{2,4}|\d{4}-\d{1,2}|\b(?:19|20)\d{2}\b))\s*(?:[-–—to~]+)\s*(Present|Current|Ongoing|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}\/\d{2,4}|\d{4}-\d{1,2}|\b(?:19|20)\d{2}\b))/i;

export const TITLE_KEYWORDS_REGEX =
  /\b(?:engineer|developer|manager|lead|architect|analyst|designer|consultant|director|intern|specialist|associate|officer|executive|head|vp|vice\s+president|coordinator|technician|administrator|scientist|programmer|qa|tester|devops|sre|founder|co-founder|cto|ceo|cpo|trainee)\b/i;

export const DEGREE_REGEX =
  /\b(?:B\.?Tech|B\.?E\.?|B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?Tech|M\.?E\.?|MBA|MCA|BCA|BBA|Bachelor(?:'s)?(?:\s+of\s+[A-Za-z\s&]+)?|Master(?:'s)?(?:\s+of\s+[A-Za-z\s&]+)?|Ph\.?D|Doctorate|Diploma|Associate(?:'s)?)\b/i;

export const GRAD_YEAR_REGEX = /\b(?:19|20)\d{2}(?:\s*[-–—to~]+\s*(?:(?:19|20)\d{2}|present))?\b/i;

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

export function isBulletLine(text: string): boolean {
  const trimmed = text.trim();
  if (/^[•●▪◦\-*➤→►■]\s*/.test(trimmed)) return true;
  if (/^\d+[\.)]\s+/.test(trimmed)) return true;
  return false;
}

export function stripBulletPrefix(text: string): string {
  return text.replace(/^(?:[•●▪◦\-*➤→►■]|\d+[\.)])\s*/, '').trim();
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
  isPassiveOpener?: boolean;
  feedback?: string;
  suggestedRewrite?: string;
} {
  const clean = stripBulletPrefix(bullet);
  const verbMatch = clean.match(ACTION_VERB_REGEX);
  const actionVerb = verbMatch ? verbMatch[1] : null;

  const isPassive = PASSIVE_OPENER_REGEX.test(clean);

  const metricMatch = clean.match(METRIC_REGEX);
  const metric = metricMatch ? metricMatch[0] : null;

  const words = countWords(clean);
  const hasScope = words >= 7;
  const isMet = Boolean(actionVerb && metric && hasScope);

  let feedback: string | undefined;
  let suggestedRewrite: string | undefined;

  if (isPassive) {
    feedback = 'Passive or weak opener detected. Replace with a decisive power action verb.';
    suggestedRewrite = `Spearheaded ${clean.replace(/^(?:responsible for|assisted with|helped with|worked on|duties included|tasked with|participated in|handled)\s*/i, '')}`;
  } else if (!actionVerb && !metric) {
    feedback = 'Missing both an opening action verb and a quantifiable result.';
    suggestedRewrite = `Engineered [specific system/feature], improving performance by 25% through [methodology/tool].`;
  } else if (!actionVerb) {
    feedback = 'Start with a strong action verb (e.g., Architected, Optimized, Shipped).';
    suggestedRewrite = `Spearheaded ${clean.replace(/^[a-z]/, (c) => c.toLowerCase())}`;
  } else if (!metric) {
    feedback = 'Quantify the outcome (add %, $, latency reduction, or scale metrics).';
    suggestedRewrite = `${clean}, delivering 20%+ improvement in throughput.`;
  } else if (!hasScope) {
    feedback = 'Expand with technical scope or tool context (aim for 8–30 words).';
  }

  return { isMet, actionVerb, metric, scope: hasScope, isPassiveOpener: isPassive, feedback, suggestedRewrite };
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
 * Robustly parses work history entries from unstructured line sequences,
 * handling 1-line, 2-line, and 3-line role headers (Title, Company, DateSpan, Location),
 * and accurately grouping bullets without creating phantom jobs.
 */
export function parseExperienceSection(
  lines: string[],
  targetRole?: string,
): ResumeContent['experience'] {
  const experienceBlocks: ResumeContent['experience'] = [];
  let currentExp: ResumeContent['experience'][number] | null = null;
  let pendingHeaderLines: string[] = [];

  const flushPendingHeader = () => {
    if (pendingHeaderLines.length === 0) return;

    let detectedCompany = '';
    let detectedTitle = '';
    let detectedStartDate = '';
    let detectedEndDate: string | undefined = undefined;
    let detectedCurrent = false;
    let detectedLocation: string | undefined = undefined;

    // 1. Search for date span across pending header lines
    for (let i = 0; i < pendingHeaderLines.length; i++) {
      const line = pendingHeaderLines[i];
      const match = line.match(DATE_SPAN_REGEX);
      if (match) {
        detectedStartDate = match[1].trim();
        const endRaw = match[2].trim();
        if (/present|current|ongoing/i.test(endRaw)) {
          detectedCurrent = true;
        } else {
          detectedEndDate = endRaw;
        }
        pendingHeaderLines[i] = line.replace(DATE_SPAN_REGEX, '').replace(/\([^)]*\)/g, '').trim();
        break;
      }
    }

    // 2. Search for explicit Location (must NOT contain title keywords or company indicators)
    for (let i = 0; i < pendingHeaderLines.length; i++) {
      const line = pendingHeaderLines[i];
      if (/\bremote\b/i.test(line)) {
        detectedLocation = 'Remote';
        pendingHeaderLines[i] = line.replace(/\bremote\b/gi, '').trim();
      } else {
        const locMatch = line.match(
          /\b([A-Z][a-zA-Z\s]{1,20},\s*(?:[A-Z]{2}|[A-Z][a-zA-Z\s]{2,15}))\b/,
        );
        if (
          locMatch &&
          !TITLE_KEYWORDS_REGEX.test(locMatch[0]) &&
          !/(?:corp|inc|ltd|technologies|solutions|labs|systems)/i.test(locMatch[0])
        ) {
          detectedLocation = locMatch[0].trim();
          pendingHeaderLines[i] = line.replace(locMatch[0], '').trim();
        }
      }
    }

    // 3. Clean remaining text fragments
    const cleanedFragments = pendingHeaderLines
      .flatMap((l) => l.split(/\s*[-–—|]\s*/))
      .map((p) => p.replace(/^[–—\-,|:]+|[–—\-,|:]+$/g, '').trim())
      .filter((p) => Boolean(p) && p.length >= 2);

    if (cleanedFragments.length >= 2) {
      const firstHasTitle = TITLE_KEYWORDS_REGEX.test(cleanedFragments[0]);
      const secondHasTitle = TITLE_KEYWORDS_REGEX.test(cleanedFragments[1]);

      if (firstHasTitle && !secondHasTitle) {
        detectedTitle = cleanedFragments[0];
        detectedCompany = cleanedFragments[1];
      } else if (secondHasTitle && !firstHasTitle) {
        detectedCompany = cleanedFragments[0];
        detectedTitle = cleanedFragments[1];
      } else {
        const fullLine = pendingHeaderLines.join(' ');
        const atMatch = fullLine.match(/(.*?)\s+at\s+(.*)/i);
        if (atMatch) {
          detectedTitle = atMatch[1].trim();
          detectedCompany = atMatch[2].trim();
        } else {
          detectedCompany = cleanedFragments[0];
          detectedTitle = cleanedFragments[1];
        }
      }
    } else if (cleanedFragments.length === 1) {
      const frag = cleanedFragments[0];
      const atMatch = frag.match(/(.*?)\s+at\s+(.*)/i);
      const commaMatch = frag.match(/(.*?)\s*,\s*(.*)/);
      if (atMatch) {
        detectedTitle = atMatch[1].trim();
        detectedCompany = atMatch[2].trim();
      } else if (
        commaMatch &&
        (TITLE_KEYWORDS_REGEX.test(commaMatch[1]) || TITLE_KEYWORDS_REGEX.test(commaMatch[2]))
      ) {
        if (TITLE_KEYWORDS_REGEX.test(commaMatch[1])) {
          detectedTitle = commaMatch[1].trim();
          detectedCompany = commaMatch[2].trim();
        } else {
          detectedCompany = commaMatch[1].trim();
          detectedTitle = commaMatch[2].trim();
        }
      } else if (TITLE_KEYWORDS_REGEX.test(frag)) {
        detectedTitle = frag;
        detectedCompany = 'Organization';
      } else {
        detectedCompany = frag;
        detectedTitle = targetRole || 'Role';
      }
    } else {
      detectedCompany = 'Work Experience';
      detectedTitle = targetRole || 'Role';
    }

    currentExp = {
      company: detectedCompany || 'Work Experience',
      title: detectedTitle || targetRole || 'Role',
      startDate: detectedStartDate,
      endDate: detectedEndDate,
      current: detectedCurrent,
      location: detectedLocation,
      bullets: [],
    };
    experienceBlocks.push(currentExp);
    pendingHeaderLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const cleaned = stripBulletPrefix(rawLine);
    if (!cleaned) continue;

    const isBullet = isBulletLine(rawLine);

    if (isBullet) {
      if (pendingHeaderLines.length > 0) {
        flushPendingHeader();
      }
      if (!currentExp) {
        currentExp = {
          company: 'Work Experience',
          title: targetRole || 'Role',
          startDate: '',
          current: true,
          bullets: [],
        };
        experienceBlocks.push(currentExp);
      }
      currentExp.bullets.push(cleaned);
    } else {
      // Check if line is continuation of existing bullet
      if (
        currentExp &&
        pendingHeaderLines.length === 0 &&
        currentExp.bullets.length > 0 &&
        !rawLine.match(DATE_SPAN_REGEX) &&
        !TITLE_KEYWORDS_REGEX.test(rawLine) &&
        !/\bat\b/i.test(rawLine) &&
        !/^[A-Z][a-zA-Z0-9\s&—–|-]{3,50}$/.test(rawLine)
      ) {
        const lastIdx = currentExp.bullets.length - 1;
        currentExp.bullets[lastIdx] = `${currentExp.bullets[lastIdx]} ${cleaned}`.trim();
        continue;
      }

      // If we already had bullets in currentExp, this non-bullet line starts a NEW role header
      if (currentExp && currentExp.bullets.length > 0) {
        currentExp = null;
      }

      pendingHeaderLines.push(rawLine.trim());

      const hasDate = pendingHeaderLines.some((l) => DATE_SPAN_REGEX.test(l));
      if (hasDate && pendingHeaderLines.length >= 2) {
        flushPendingHeader();
      }
    }
  }

  if (pendingHeaderLines.length > 0) {
    flushPendingHeader();
  }

  return experienceBlocks;
}

/**
 * Robustly parses education entries, grouping degree lines, school lines, and graduation dates
 * into coherent unified blocks.
 */
export function parseEducationSection(lines: string[]): ResumeContent['education'] {
  const educationBlocks: ResumeContent['education'] = [];
  const cleanLines = lines.map((l) => l.trim()).filter((l) => l.length > 2);

  let currentGroup: string[] = [];

  for (const line of cleanLines) {
    const hasDegree = DEGREE_REGEX.test(line);
    const hasYear = GRAD_YEAR_REGEX.test(line);
    const hasSchool = /(?:university|college|institute|school|academy|polytechnic|campus|iit|nit|bits|vtu|mit|stanford|harvard|berkeley)/i.test(
      line,
    );

    if (currentGroup.length > 0 && hasDegree && currentGroup.some((l) => DEGREE_REGEX.test(l))) {
      flushEducationGroup(currentGroup, educationBlocks);
      currentGroup = [line];
    } else {
      currentGroup.push(line);
      if (currentGroup.length >= 2 && currentGroup.some((l) => hasYear || hasSchool)) {
        flushEducationGroup(currentGroup, educationBlocks);
        currentGroup = [];
      }
    }
  }

  if (currentGroup.length > 0) {
    flushEducationGroup(currentGroup, educationBlocks);
  }

  return educationBlocks;
}

function flushEducationGroup(groupLines: string[], outBlocks: ResumeContent['education']) {
  if (groupLines.length === 0) return;
  const fullText = groupLines.join(' — ');

  const yearMatch = fullText.match(GRAD_YEAR_REGEX);
  const gradYear = yearMatch ? yearMatch[0].trim() : undefined;

  const degreeMatch = fullText.match(DEGREE_REGEX);
  const degree = degreeMatch ? degreeMatch[0].trim() : 'Degree';

  let field = '';
  const fieldMatch = fullText.match(/(?:in|of)\s+([A-Za-z\s&]{3,35}?)(?:[-–—|,(\n]|$)/i);
  if (
    fieldMatch &&
    !/(?:arts|science|engineering|business|technology|applied)/i.test(fieldMatch[1].trim())
  ) {
    field = fieldMatch[1].trim();
  }

  let school = '';
  for (const line of groupLines) {
    const withoutDates = line.replace(GRAD_YEAR_REGEX, '').replace(/\([^)]*\)/g, '').trim();
    if (
      /(?:university|college|institute|school|academy|polytechnic|campus|iit|nit|bits|vtu|mit|stanford|harvard|berkeley)/i.test(
        withoutDates,
      ) ||
      (!DEGREE_REGEX.test(withoutDates) && withoutDates.length >= 3)
    ) {
      school = withoutDates.replace(/^[–—\-,|:]+|[–—\-,|:]+$/g, '').trim();
      break;
    }
  }

  if (!school) {
    school = fullText
      .replace(DEGREE_REGEX, '')
      .replace(GRAD_YEAR_REGEX, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/^[–—\-,|:]+|[–—\-,|:]+$/g, '')
      .trim();
  }

  outBlocks.push({
    school: school || 'Institution',
    degree,
    field,
    graduationDate: gradYear,
  });
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
  let parsedLocation: string | undefined;
  for (const line of nonEmptyLines.slice(0, 8)) {
    if (/\bremote\b/i.test(line)) {
      parsedLocation = 'Remote';
      break;
    }
    const locMatch = line.match(
      /\b([A-Z][a-zA-Z\s]{1,25},\s*(?:[A-Z]{2}|[A-Z][a-zA-Z\s]{1,20}))\b/,
    );
    if (
      locMatch &&
      !/@|https?:|\.com|\.in|\.org/i.test(locMatch[0]) &&
      !TITLE_KEYWORDS_REGEX.test(locMatch[0]) &&
      !/(?:resume|curriculum|cv|summary|experience|developer|engineer|analyst)/i.test(locMatch[0])
    ) {
      parsedLocation = locMatch[0].trim();
      break;
    }
    if (
      /(?:bengaluru|bangalore|hyderabad|pune|mumbai|delhi|noida|gurugram|chennai|kolkata|jaipur|chandigarh|san francisco|seattle|new york|austin|chicago|boston|london|berlin|toronto|vancouver|singapore|sydney|dubai|tokyo|paris|india|usa|uk|germany|canada)/i.test(
        line,
      )
    ) {
      const match = line.match(/(?:[A-Z][a-zA-Z\s]+,\s*(?:[A-Z]{2}|[A-Za-z\s]+)|[A-Za-z\s]{3,30})/i);
      if (match && !/@|https?:/i.test(match[0])) {
        parsedLocation = match[0].replace(/^[|,•·\s]+|[|,•·\s]+$/g, '').trim();
        break;
      }
    }
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
  const experienceBlocks: ResumeContent['experience'] = parseExperienceSection(
    buckets.experience,
    targetRole,
  );

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
  const educationBlocks: ResumeContent['education'] = parseEducationSection(buckets.education);

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

  // 3. Experience date format styles (scoped strictly to work history)
  const experienceDateFamilies = new Set<string>();
  for (const exp of experienceBlocks) {
    if (exp.startDate) {
      const fam = detectDateFormatFamily(exp.startDate);
      if (fam) experienceDateFamilies.add(fam);
    }
    if (exp.endDate) {
      const fam = detectDateFormatFamily(exp.endDate);
      if (fam) experienceDateFamilies.add(fam);
    }
  }

  const content: ResumeContent = {
    contact: {
      fullName: detectedName,
      email: emailMatch?.[0] || '',
      phone: phoneMatch?.[0]?.trim(),
      location: parsedLocation,
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
      dateStylesCount: experienceDateFamilies.size,
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

  const effectiveDateStyleCount =
    dateFamilies.size > 0 ? dateFamilies.size : rawDiagnostics?.dateStylesCount || 0;
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
  let passiveOpenersCount = 0;
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

    if (xyz.isPassiveOpener) {
      passiveOpenersCount += 1;
    }

    if (xyz.metric) {
      metricsCount += 1;
    }

    if (xyz.isMet) {
      xyzFormulaBulletsCount += 1;
    }

    const lengthStatus: 'short' | 'ideal' | 'long' =
      words < 7 ? 'short' : words > 38 ? 'long' : 'ideal';

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
    const sLower = skill.toLowerCase();
    const aliases = SKILL_ALIASES[sLower] || [sLower];
    const isCorroborated = aliases.some((token) => {
      const pattern = new RegExp(
        `(?:^|[^a-z0-9+#])${escapeRegexLiteral(token)}(?:$|[^a-z0-9+#])`,
        'i',
      );
      return pattern.test(evidenceCorpus) || evidenceCorpus.includes(token);
    });

    if (isCorroborated) {
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

  let metricsDimScore: number;
  if (totalBullets === 0) {
    metricsDimScore = 35;
  } else if (metricRatio >= 0.5) {
    // High density (50%+ bullets quantified): 88 to 100
    metricsDimScore = 88 + Math.min(12, metricsCount * 2 + xyzRatio * 8);
  } else if (metricRatio >= 0.25) {
    // Moderate density (25% - 49% bullets quantified): 72 to 87
    metricsDimScore = 72 + (metricRatio - 0.25) * 60 + xyzRatio * 6;
  } else if (metricRatio > 0) {
    // Emerging metrics (1% - 24% bullets quantified): 55 to 71
    metricsDimScore = 55 + (metricRatio / 0.25) * 16 + xyzRatio * 4;
  } else {
    // Unquantified (pure responsibilities / tasks): 42
    metricsDimScore = 42;
  }
  metricsDimScore = clampScore(metricsDimScore);

  // Dimension 3: Action Verb Dominance (20%)
  // Graded on power verbs (1.0), standard execution verbs (0.8), and passive openers (0.4)
  let totalVerbPoints = 0;
  for (const b of bulletQuality) {
    if (b.actionVerbCategory && b.actionVerbCategory !== 'execution') {
      totalVerbPoints += 1.0;
    } else if (b.hasActionVerb) {
      totalVerbPoints += 0.8;
    } else if (PASSIVE_OPENER_REGEX.test(b.bullet)) {
      totalVerbPoints += 0.4;
    } else {
      totalVerbPoints += 0.15;
    }
  }

  const verbIndex = totalBullets > 0 ? totalVerbPoints / totalBullets : 0;
  let verbsDimScore =
    totalBullets === 0
      ? 30
      : clampScore(
          verbIndex >= 0.8
            ? 88 + Math.min(12, (verbIndex - 0.8) * 60)
            : verbIndex >= 0.5
              ? 70 + (verbIndex - 0.5) * 60
              : 35 + verbIndex * 70,
        );
  verbsDimScore -= repeatedVerbs.length * 4;
  verbsDimScore -= pronounsCount * 3;
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
  if (wordCount < 140) brevityDimScore -= 18;
  else if (wordCount < 200) brevityDimScore -= 8;
  else if (wordCount > 1000) brevityDimScore -= 10;
  else if (wordCount > 1300) brevityDimScore -= 18;

  if (totalBullets > 0) {
    const outlierRatio = (shortBulletsCount + longBulletsCount) / totalBullets;
    brevityDimScore -= Math.round(outlierRatio * 15);
  } else {
    brevityDimScore -= 15;
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

  const overallAtsScore = clampScore(
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
  if (passiveOpenersCount > 0) {
    recommendations.push(
      `Replace ${passiveOpenersCount} passive opener(s) (e.g. "Responsible for", "Worked on") with decisive power verbs (e.g. Spearheaded, Engineered, Optimized) to boost recruiter impression.`,
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
      `Rebalance bullet length: ${shortBulletsCount} bullet(s) are under 7 words and ${longBulletsCount} exceed 38 words.`,
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
    const detectedResumeTitle = content.headline || content.experience?.[0]?.title;
    jobDescriptionMatch = analyzeJobDescriptionMatch(
      rawDiagnostics?.rawNormalizedText || computeCorpusFromContent(content),
      jobDescriptionText,
      targetRole,
      detectedResumeTitle,
    );
  }

  const atsScore = overallAtsScore;
  const matchScore = jobDescriptionMatch ? jobDescriptionMatch.matchRate : undefined;
  const compositeScore =
    matchScore !== undefined
      ? clampScore(atsScore * 0.4 + matchScore * 0.6)
      : undefined;
  const overallScore = compositeScore !== undefined ? compositeScore : atsScore;

  if (jobDescriptionMatch) {
    if (jobDescriptionMatch.missingKeywords.length > 0) {
      const topMissing = jobDescriptionMatch.missingKeywords
        .slice(0, 4)
        .map((k) => k.keyword)
        .join(', ');
      recommendations.unshift(
        `Job Match: Back up missing target skill(s) (${topMissing}) in your experience bullets to increase recruiter keyword matching.`,
      );
    }
    if (
      jobDescriptionMatch.titleAlignment &&
      jobDescriptionMatch.titleAlignment.status === 'weak'
    ) {
      recommendations.unshift(
        `Align your resume headline ("${jobDescriptionMatch.titleAlignment.detectedTitle || 'Current'}") closer to target role "${jobDescriptionMatch.titleAlignment.targetTitle}" to pass initial recruiter screening.`,
      );
    }
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
    atsScore,
    matchScore,
    compositeScore,
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
    atsScore,
    matchScore,
    compositeScore,
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
