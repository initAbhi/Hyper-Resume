import type {
  ParsedLinkedInMeta,
  ParsedProfileDraft,
} from '../ai/interfaces/ai-provider.interface.js';
import type {
  ProfileCertification,
  ProfileEducation,
  ProfileExperience,
  ProfileProject,
  ProfileSkill,
} from '../profiles/entities/candidate-profile.entity.js';
import {
  extractSkillsFromCorpus,
  normalizeExtractedText,
} from '../ai/utils/ats-taxonomy.js';

export interface LinkedInDetectionResult {
  isLinkedInPdf: boolean;
  linkedinUrl?: string;
  linkedinSlug?: string;
  hasCustomSlug?: boolean;
  detectedSections: string[];
}

const LINKEDIN_SIDEBAR_HEADERS = new Set([
  'contact',
  'top skills',
  'skills',
  'languages',
  'certifications',
  'licenses & certifications',
  'honors-awards',
  'honors & awards',
  'publications',
  'patents',
]);

const LINKEDIN_BODY_HEADERS = new Set([
  'summary',
  'about',
  'experience',
  'education',
]);

const KNOWN_SPOKEN_LANGUAGES = new Set([
  'english',
  'hindi',
  'spanish',
  'french',
  'german',
  'mandarin',
  'chinese',
  'japanese',
  'korean',
  'portuguese',
  'arabic',
  'italian',
  'dutch',
  'russian',
  'bengali',
  'tamil',
  'telugu',
  'marathi',
  'gujarati',
  'kannada',
  'malayalam',
  'punjabi',
  'urdu',
]);

const MONTH_DATE_RANGE_REGEX =
  /^(?:(?:[A-Za-z]+\.?|\d{1,2}\/)?\s*\d{4}|\d{1,2}\/\d{2,4})\s*[-–—to~]\s*(?:(?:[A-Za-z]+\.?|\d{1,2}\/)?\s*\d{4}|\d{1,2}\/\d{2,4}|Present|Current|Ongoing)(?:\s*\([^)]+\))?$/i;

const MONTH_TOKEN = String.raw`(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)`;

/** Title + date on one line after space-collapse: "Full Stack developer June 2024 - Present" */
const INLINE_TITLE_DATE_REGEX = new RegExp(
  String.raw`^(.+?)\s+((?:${MONTH_TOKEN}\.?\s+)?\d{4}|\d{1,2}\/\d{2,4})\s*[-–—to~]\s*((?:${MONTH_TOKEN}\.?\s+)?\d{4}|\d{1,2}\/\d{2,4}|Present|Current|Ongoing)(?:\s*\([^)]+\))?$`,
  'i',
);

const TOTAL_DURATION_REGEX =
  /^\d+\s+years?(?:\s+\d+\s+months?)?$|^\d+\s+months?$/i;

const BULLET_LINE_REGEX = /^(?:[•\-*▪●]|\u2013|\u2014)\s*/;

const TECH_STACK_LINE_REGEX =
  /^(?:tech(?:nical)?\s*(?:stack)?|stack|technologies)\s*[:\-–—]/i;

const CONTACT_OR_URL_LINE_REGEX =
  /linkedin\.com|github\.com|gitlab\.com|portfolio|behance\.net|dribbble\.com|@[\w.-]+\.\w+|https?:\/\/|www\./i;

const VIEW_PROJECT_REGEX = /\bview\s+project\b/i;

const SENTINEL_COMPANIES = new Set([
  'work experience',
  'experience',
  'professional experience',
  'company',
  'organization',
  'employer',
]);

function isBulletLine(line: string): boolean {
  return BULLET_LINE_REGEX.test(line);
}

function stripBullet(line: string): string {
  return line.replace(BULLET_LINE_REGEX, '').trim();
}

function isTechStackLine(line: string): boolean {
  const cleaned = line.trim();
  if (!cleaned || cleaned.length > 160) return false;
  if (TECH_STACK_LINE_REGEX.test(cleaned)) return true;
  // Pipe-heavy short lines like "Next.js | NestJS | PostgreSQL"
  const pipes = (cleaned.match(/\|/g) || []).length;
  if (pipes >= 2 && cleaned.length <= 120 && !isBulletLine(cleaned)) return true;
  return false;
}

function parseDateRangeParts(cleanedDate: string): {
  startDate: string;
  endDate?: string;
  current: boolean;
} {
  const parts = cleanedDate.replace(/\s*\([^)]+\)\s*$/, '').trim().split(/\s*[-–—]\s*/);
  const startDate = parts[0]?.trim() || '';
  const rawEnd = parts[1]?.trim() || '';
  const isCurrent = /present|current|ongoing/i.test(rawEnd);
  return {
    startDate,
    endDate: isCurrent ? 'Present' : rawEnd || undefined,
    current: isCurrent,
  };
}

function normalizeProjectName(name: string): string {
  return name
    .replace(VIEW_PROJECT_REGEX, '')
    .replace(/\s*[|·•]\s*$/, '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function looksLikeContinuation(line: string): boolean {
  const cleaned = stripBullet(line);
  if (!cleaned) return false;
  if (/^[a-z]/.test(cleaned)) return true;
  if (/\|/.test(cleaned) && cleaned.length > 40) return false;
  // Trailing year alone or mid-sentence wrap fragments
  if (/^\d{4}$/.test(cleaned)) return true;
  if (
    cleaned.length <= 70 &&
    !/^[A-Z][\w .&'+-]+(?:\s+[–—-]\s+|\s+\|\s+)/.test(cleaned) &&
    !INLINE_TITLE_DATE_REGEX.test(cleaned)
  ) {
    return (
      /^(and|or|with|for|to|of|in|on|the|a|an|using|via|from|including)\b/i.test(cleaned) ||
      /[,;:]$/.test(cleaned) ||
      /\.$/.test(cleaned) ||
      !/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4}$/.test(cleaned)
    );
  }
  return false;
}

function collapseSpacedCaps(line: string): string {
  return line.replace(/\b([A-Z])\s([A-Z][A-Z]+)\b/g, '$1$2');
}

function splitProjectTitleLine(raw: string): { name: string; description: string } {
  let line = raw.replace(VIEW_PROJECT_REGEX, '').trim();
  line = line.replace(/\s+(https?:\/\/\S+|www\.\S+)$/i, '').trim();
  // Strip trailing year: "... EC2 2025"
  line = line.replace(/\s+(19|20)\d{2}$/, '').trim();
  const pipeIdx = line.indexOf('|');
  if (pipeIdx > 0) {
    return {
      name: line.slice(0, pipeIdx).trim(),
      description: line.slice(pipeIdx + 1).trim(),
    };
  }
  return { name: line, description: '' };
}

const PAGE_FOOTER_REGEX = /^Page\s+\d+\s+of\s+\d+$/i;

const CUSTOM_SLUG_RANDOM_SUFFIX = /-[0-9a-f]{5,}$|-\d{4,}$/i;

function normalizeSkillDisplay(raw: string): string {
  return raw
    .replace(/\s*\(Programming Language\)\s*$/i, '')
    .replace(/\s*\(Software\)\s*$/i, '')
    .trim();
}

export function isSpokenLanguageEntry(entry: string): boolean {
  const cleaned = entry
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .trim()
    .toLowerCase();
  return KNOWN_SPOKEN_LANGUAGES.has(cleaned);
}

export function hasCleanCustomLinkedInSlug(slug?: string): boolean {
  if (!slug) return false;
  return !CUSTOM_SLUG_RANDOM_SUFFIX.test(slug.trim());
}

function preprocessLines(rawText: string): string[] {
  // Rejoin line-wrapped linkedin.com/in/ URLs common in narrow LinkedIn PDF sidebars
  const mergedUrls = rawText
    .replace(/(linkedin\.com\/in\/)\s*\r?\n\s*([a-zA-Z0-9-_%]+)/gi, '$1$2')
    .replace(/\r\n/g, '\n');

  return mergedUrls
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line) => line.length > 0 && !PAGE_FOOTER_REGEX.test(line));
}

function extractUrlsAndContact(text: string): {
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  linkedinSlug?: string;
  githubUrl?: string;
  websiteUrl?: string;
} {
  const email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0];
  const phone = text.match(/(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3,5}\)?[\s.-]?)?\d{4,5}[\s.-]?\d{4,5}/)?.[0]?.trim();

  const linkedinMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-_%]+)/i,
  );
  const linkedinSlug = linkedinMatch?.[1]?.replace(/\/+$/, '');
  const linkedinUrl = linkedinSlug
    ? `https://linkedin.com/in/${linkedinSlug}`
    : undefined;

  const githubMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-_]+)/i,
  );
  const githubUrl = githubMatch ? `https://github.com/${githubMatch[1]}` : undefined;

  const urlMatches = text.match(/https?:\/\/[^\s)]+/gi) || [];
  const websiteUrl = urlMatches.find(
    (u) => !/linkedin\.com/i.test(u) && !/github\.com/i.test(u),
  );

  return { email, phone, linkedinUrl, linkedinSlug, githubUrl, websiteUrl };
}

export function detectLinkedInProfilePdf(rawText: string): LinkedInDetectionResult {
  const lines = preprocessLines(rawText);
  const lowerLines = lines.map((l) => l.toLowerCase());
  const detectedSections: string[] = [];

  for (const label of [
    'Contact',
    'Top Skills',
    'Languages',
    'Certifications',
    'Honors-Awards',
    'Summary',
    'Experience',
    'Education',
  ]) {
    const key = label.toLowerCase();
    if (lowerLines.some((l) => l === key || l.startsWith(`${key}:`))) {
      detectedSections.push(label);
    }
  }

  const contact = extractUrlsAndContact(lines.join('\n'));
  const hasPageMarker = /Page\s+\d+\s+of\s+\d+/i.test(rawText);
  const hasLinkedInTag = /\(LinkedIn\)/i.test(rawText);
  const hasTopSkills = lowerLines.includes('top skills');
  const hasLinkedInStructure =
    hasTopSkills ||
    hasLinkedInTag ||
    (Boolean(contact.linkedinUrl) &&
      (hasPageMarker ||
        (lowerLines.includes('summary') && lowerLines.includes('experience')) ||
        detectedSections.length >= 4));

  return {
    isLinkedInPdf: hasLinkedInStructure,
    linkedinUrl: contact.linkedinUrl,
    linkedinSlug: contact.linkedinSlug,
    hasCustomSlug: hasCleanCustomLinkedInSlug(contact.linkedinSlug),
    detectedSections,
  };
}

function parseExperienceBlock(lines: string[]): ProfileExperience[] {
  const items: ProfileExperience[] = [];
  if (lines.length === 0) return items;

  let currentCompany = '';
  let current: ProfileExperience | null = null;
  let pendingTitleCandidate: string | null = null;

  const pushCurrent = () => {
    if (current && (current.company || current.title)) {
      items.push({
        company: current.company || currentCompany || 'Company',
        title: current.title || 'Role',
        location: current.location,
        startDate: current.startDate || '',
        endDate: current.endDate,
        current: current.current,
        bullets: current.bullets,
      });
    }
    current = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || '';

    // Company + total tenure header (e.g. "FinEdge Payments" followed by "3 years 8 months")
    if (TOTAL_DURATION_REGEX.test(nextLine)) {
      pushCurrent();
      currentCompany = line;
      pendingTitleCandidate = null;
      i += 1; // skip duration summary line
      continue;
    }

    // Bullet point
    if (isBulletLine(line)) {
      const cleanBullet = stripBullet(line);
      if (current && cleanBullet) {
        current.bullets.push(cleanBullet);
      }
      continue;
    }

    // "Company | Location" (or "Company · Location") sitting between title and dates
    if (/^[A-Za-z0-9][^|]{1,60}\s*[|·•]\s*.+$/.test(line) && MONTH_DATE_RANGE_REGEX.test(nextLine)) {
      const [companyPart, locationPart] = line.split(/\s*[|·•]\s*/);
      currentCompany = (companyPart || '').trim() || currentCompany;
      if (current) {
        current.company = currentCompany;
        if (locationPart) current.location = locationPart.trim();
      } else if (pendingTitleCandidate) {
        // Title already buffered; wait for date line below
      } else {
        pendingTitleCandidate = null;
      }
      continue;
    }

    // Pure date line first (must beat inline title+date — "April 2024 - Present" is not a title)
    if (MONTH_DATE_RANGE_REGEX.test(line)) {
      const dateParts = parseDateRangeParts(line);

      // Look back one line for "Company | Location" if company still generic
      const prev = lines[i - 1] || '';
      let locationFromPrev: string | undefined;
      if (/^[A-Za-z0-9][^|]{1,60}\s*[|·•]\s*.+$/.test(prev)) {
        const [companyPart, locationPart] = prev.split(/\s*[|·•]\s*/);
        currentCompany = (companyPart || '').trim() || currentCompany;
        locationFromPrev = locationPart?.trim();
      }

      const title: string = pendingTitleCandidate || current?.title || 'Role';
      // If pending title looks like a company (and currentCompany empty), swap
      let company = currentCompany || 'Company';
      let roleTitle = title;
      if (
        company === 'Company' &&
        pendingTitleCandidate &&
        /\|/.test(pendingTitleCandidate) === false &&
        !/engineer|developer|manager|intern|analyst|architect|designer|consultant|lead|director/i.test(
          pendingTitleCandidate,
        )
      ) {
        company = pendingTitleCandidate;
        roleTitle = current?.title || 'Role';
      }

      pushCurrent();
      current = {
        company,
        title: roleTitle,
        location: locationFromPrev,
        startDate: dateParts.startDate,
        endDate: dateParts.endDate,
        current: dateParts.current,
        bullets: [],
      };
      pendingTitleCandidate = null;
      continue;
    }

    // Same-line title + date (common after space-collapse from ATS / Google Docs PDFs)
    const inlineTitleDate = INLINE_TITLE_DATE_REGEX.exec(line);
    if (inlineTitleDate) {
      const roleTitle = inlineTitleDate[1].trim();
      // Reject if "title" is only a month token (should have been caught as pure date)
      if (!new RegExp(`^${MONTH_TOKEN}\\.?$`, 'i').test(roleTitle) && roleTitle.length >= 3) {
        const dateParts = parseDateRangeParts(
          `${inlineTitleDate[2].trim()} - ${inlineTitleDate[3].trim()}`,
        );
        let locationFromNext: string | undefined;
        let companyFromNext = currentCompany;
        // Next line often "Algoocean | Mumbai" or "Algo Ocean   Next.js, NestJS, AWS"
        if (nextLine && !isBulletLine(nextLine) && !MONTH_DATE_RANGE_REGEX.test(nextLine)) {
          if (/^[A-Za-z0-9][^|]{0,60}\s*[|·•]\s*.+$/.test(nextLine)) {
            const [companyPart, locationPart] = nextLine.split(/\s*[|·•]\s*/);
            companyFromNext = (companyPart || '').trim() || companyFromNext;
            locationFromNext = locationPart?.trim();
            i += 1;
          } else if (
            nextLine.length <= 120 &&
            !/^(developed|built|designed|implemented|managed|created|led|architected)\b/i.test(nextLine)
          ) {
            // Company (+ optional trailing tech list without pipes)
            const techSplit = nextLine.match(
              /^([A-Za-z0-9][\w .&'/-]{1,40}?)\s+((?:Next\.js|React|Node|Nest|AWS|TypeScript|Python|Mongo|Postgres|Redis|Docker|Java).+)$/i,
            );
            if (techSplit) {
              companyFromNext = techSplit[1].trim();
              locationFromNext = techSplit[2].trim(); // stash stack in location for Jake-style right column
            } else {
              companyFromNext = nextLine.split(',')[0].trim().slice(0, 60) || companyFromNext;
            }
            i += 1;
          }
        }
        pushCurrent();
        current = {
          company: companyFromNext || 'Company',
          title: roleTitle,
          location: locationFromNext,
          startDate: dateParts.startDate,
          endDate: dateParts.endDate,
          current: dateParts.current,
          bullets: [],
        };
        currentCompany = companyFromNext || currentCompany;
        pendingTitleCandidate = null;
        continue;
      }
    }

    // Title -> Company|Location -> Date  (common ATS / Word export order)
    if (
      /^[A-Za-z0-9][^|]{1,60}\s*[|·•]\s*.+$/.test(nextLine) &&
      MONTH_DATE_RANGE_REGEX.test(lines[i + 2] || '')
    ) {
      pushCurrent();
      pendingTitleCandidate = line;
      continue;
    }

    // Standard single-role lookahead: Company line -> Title line -> Date Range line
    if (MONTH_DATE_RANGE_REGEX.test(lines[i + 2] || '')) {
      pushCurrent();
      currentCompany = line;
      pendingTitleCandidate = nextLine;
      continue;
    }

    // Multi-role / existing company lookahead: Title line -> Date Range line
    if (MONTH_DATE_RANGE_REGEX.test(nextLine)) {
      pendingTitleCandidate = line;
      continue;
    }

    // Location line immediately after date range (e.g., "Bengaluru, Karnataka, India")
    if (
      current &&
      current.bullets.length === 0 &&
      !current.location &&
      /,/.test(line) &&
      line.length <= 65 &&
      !line.endsWith('.')
    ) {
      current.location = line;
      continue;
    }

    // Continuation paragraph / sentence inside role description
    if (current) {
      if (current.bullets.length > 0 && !/^[A-Z]/.test(line)) {
        const lastIdx = current.bullets.length - 1;
        current.bullets[lastIdx] = `${current.bullets[lastIdx]} ${line}`.trim();
      } else if (line.length > 20) {
        current.bullets.push(line);
      }
    } else if (!currentCompany) {
      currentCompany = line;
    }
  }

  pushCurrent();
  return items;
}

function parseEducationBlock(lines: string[]): ProfileEducation[] {
  const education: ProfileEducation[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1] || '';

    // LinkedIn pattern: School \n Degree, Field · (2015 - 2019)
    if (
      /bachelor|master|b\.?tech|m\.?tech|b\.?s\.?|m\.?s\.?|ph\.?d|mba|associate|diploma|degree|\(\d{4}\s*[-–—]\s*\d{4}\)/i.test(
        next,
      )
    ) {
      const gradMatch = next.match(/\(?\s*((?:[A-Za-z]+\s+)?\d{4}\s*[-–—]\s*(?:\d{4}|Present))\s*\)?/i);
      const degField = next
        .replace(/·\s*\([^)]+\)/, '')
        .replace(/\(\s*\d{4}\s*[-–—]\s*(?:\d{4}|Present)\s*\)/, '')
        .trim();
      const [degreePart, ...fieldParts] = degField.split(',');

      education.push({
        school: line,
        degree: degreePart?.trim() || 'Degree',
        field: fieldParts.join(',').trim() || '',
        graduationDate: gradMatch?.[1]?.trim(),
      });
      i += 1;
    } else if (education.length === 0 && line.length > 3) {
      education.push({
        school: line,
        degree: '',
        field: '',
      });
    }
  }
  return education;
}

export function parseLinkedInProfileText(rawText: string): ParsedProfileDraft {
  const detection = detectLinkedInProfilePdf(rawText);
  const lines = preprocessLines(rawText);
  const fullText = lines.join('\n');
  const contact = extractUrlsAndContact(fullText);

  const buckets = new Map<string, string[]>();
  const preambleLines: string[] = [];
  let activeSection: string | null = null;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (LINKEDIN_SIDEBAR_HEADERS.has(lower) || LINKEDIN_BODY_HEADERS.has(lower)) {
      if (lower === 'licenses & certifications') activeSection = 'certifications';
      else if (lower === 'about') activeSection = 'summary';
      else activeSection = lower;
      if (!buckets.has(activeSection)) buckets.set(activeSection, []);
      continue;
    }

    if (activeSection) {
      buckets.get(activeSection)!.push(line);
    } else {
      preambleLines.push(line);
    }
  }

  // Note: LinkedIn PDF sidebar sections sometimes precede main column Name/Headline!
  // Detect Candidate Name + Headline from either preamble OR trailing lines of sidebar sections before Summary
  let candidateLines = [...preambleLines];
  if (candidateLines.length === 0) {
    const preSummaryOrder = ['certifications', 'honors-awards', 'languages', 'top skills', 'contact'];
    for (const secKey of preSummaryOrder) {
      const secLines = buckets.get(secKey);
      if (!secLines || secLines.length < 3) continue;
      // If a trailing triplet has a Location line (City, Region, Country), lines before it are Name + Headline!
      for (let idx = secLines.length - 1; idx >= 2; idx--) {
        if (/^[A-Za-z\s.-]+,\s*[A-Za-z\s.-]+(?:,\s*[A-Za-z\s.-]+)?$/.test(secLines[idx])) {
          const maybeLocation = secLines[idx];
          const maybeHeadline = secLines[idx - 1];
          const maybeName = secLines[idx - 2];
          if (
            maybeName &&
            maybeHeadline &&
            !/certif|award|english|hindi|skill|linkedin\.com|@/i.test(maybeName)
          ) {
            candidateLines = [maybeName, maybeHeadline, maybeLocation];
            secLines.splice(idx - 2, 3);
            break;
          }
        }
      }
      if (candidateLines.length > 0) break;
    }
  }

  const cleanCandidateLines = candidateLines.filter(
    (l) => !/@|http|www\.|\+\d{1,3}\s/i.test(l),
  );
  const fullName = cleanCandidateLines[0] || '';
  const headline = cleanCandidateLines[1] || '';
  const location = cleanCandidateLines[2] || '';

  const summary = (buckets.get('summary') || []).join(' ').trim();

  const rawTopSkills = [
    ...(buckets.get('top skills') || []),
    ...(buckets.get('skills') || []),
  ];
  const languages = (buckets.get('languages') || []).filter(Boolean);

  const skillSeen = new Set<string>();
  const skills: ProfileSkill[] = [];
  for (const s of rawTopSkills) {
    if (isSpokenLanguageEntry(s)) continue;
    const normalized = normalizeSkillDisplay(s);
    if (normalized && !skillSeen.has(normalized.toLowerCase())) {
      skillSeen.add(normalized.toLowerCase());
      skills.push({ name: normalized, category: 'Top Skills' });
    }
  }

  const experience = parseExperienceBlock(buckets.get('experience') || []);
  const education = parseEducationBlock(buckets.get('education') || []);
  const certifications: ProfileCertification[] = (buckets.get('certifications') || [])
    .filter((c) => c.length > 2)
    .map((c) => {
      const dashParts = c.split(/\s+-\s+/);
      return {
        name: c,
        issuer: dashParts.length > 1 ? dashParts[0].trim() : 'LinkedIn Certified',
      };
    });

  const resolvedHeadline =
    headline ||
    (experience[0]
      ? `${experience[0].title}${experience[0].company ? ` at ${experience[0].company}` : ''}`
      : 'Professional');

  const resolvedSummary =
    summary ||
    experience
      .flatMap((e) => e.bullets)
      .slice(0, 2)
      .join(' ');

  const meta: ParsedLinkedInMeta = {
    isLinkedInPdf: detection.isLinkedInPdf,
    linkedinSlug: detection.linkedinSlug,
    hasCustomSlug: detection.hasCustomSlug,
    detectedSections: detection.detectedSections,
    headlineCharCount: resolvedHeadline.length,
    summaryCharCount: resolvedSummary.length,
  };

  return {
    contact: {
      fullName: fullName || undefined,
      email: contact.email,
      phone: contact.phone,
      location: location || undefined,
      linkedinUrl: contact.linkedinUrl,
      githubUrl: contact.githubUrl,
      websiteUrl: contact.websiteUrl,
    },
    headline: resolvedHeadline,
    summary: resolvedSummary,
    location: location || '',
    skills,
    experience,
    education,
    projects: [],
    certifications,
    languages,
    sourceType: detection.isLinkedInPdf ? 'linkedin_pdf' : 'standard_resume',
    linkedinMeta: meta,
    confidenceScore: detection.isLinkedInPdf ? 95 : 85,
  };
}

export function parseGenericResumeText(rawText: string): ParsedProfileDraft {
  const normalized = normalizeExtractedText(rawText);
  const lines = preprocessLines(normalized);
  const fullText = lines.join('\n');
  const contact = extractUrlsAndContact(fullText);

  // Extract skills from explicit skills block & augment with 1,200+ taxonomy
  const skillSet = new Map<string, ProfileSkill>();

  // Extract all from corpus taxonomy first
  const corpusSkills = extractSkillsFromCorpus(fullText);
  for (const cs of corpusSkills) {
    skillSet.set(cs.name.toLowerCase(), {
      name: cs.name,
      category: cs.isHardSkill ? 'Technical Skills' : 'Soft Skills',
    });
  }

  // Segment into canonical sections
  type SecName = 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications';
  const sectionBuckets: Record<SecName, string[]> = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  };

  const sectionHeadings: Array<{ key: SecName; regex: RegExp }> = [
    { key: 'summary', regex: /^(?:#+\s*)?(?:professional\s+|career\s+)?(?:summary|profile|objective|about(?:\s+me)?)$/i },
    { key: 'experience', regex: /^(?:#+\s*)?(?:work\s+|professional\s+|relevant\s+)?(?:experience|employment(?:\s+history)?|work history)$/i },
    { key: 'education', regex: /^(?:#+\s*)?(?:education|academic\s+background|qualifications|degrees?)$/i },
    { key: 'skills', regex: /^(?:#+\s*)?(?:technical\s+|core\s+|key\s+)?(?:skills|competencies|technologies|tech\s+stack|expertise)$/i },
    { key: 'projects', regex: /^(?:#+\s*)?(?:selected\s+|key\s+|personal\s+|technical\s+)?projects$/i },
    { key: 'certifications', regex: /^(?:#+\s*)?(?:certifications?|licenses?(\s+(&|and)\s+certifications?)?)$/i },
  ];

  let currentSec: SecName = 'header';
  for (const line of lines) {
    // Collapse letter-spacing artifacts from PDFs ("W ORK E XPERIENCE" → "WORK EXPERIENCE")
    const cleanHeading = collapseSpacedCaps(line.replace(/[:\-–—_=]+$/g, '').trim());
    const matched = sectionHeadings.find((h) => h.regex.test(cleanHeading));
    if (matched) {
      currentSec = matched.key;
      continue;
    }
    sectionBuckets[currentSec].push(line);
  }

  // Parse candidate name & headline from header (never treat URL/contact pipes as headline)
  const nonContactHeaderLines = sectionBuckets.header.filter(
    (l) =>
      !CONTACT_OR_URL_LINE_REGEX.test(l) &&
      !/^(resume|curriculum\s+vitae|cv)$/i.test(l) &&
      !/^\+?\d[\d\s().-]{7,}$/.test(l),
  );
  const fullName =
    collapseSpacedCaps(nonContactHeaderLines[0] || lines[0] || 'Candidate').slice(0, 80);
  const headlineCandidate = nonContactHeaderLines.find(
    (l, idx) => idx > 0 && l.length <= 80 && !/[,|]/.test(l) && /[A-Za-z]/.test(l),
  );
  const headline =
    collapseSpacedCaps(headlineCandidate || '').slice(0, 150) || 'Software Engineer';

  // Extract explicit skills tokens from skills bucket
  for (const skillLine of sectionBuckets.skills) {
    const stripped = skillLine
      .replace(/^[A-Za-z0-9\s&/()\-–—]+:\s*/, '')
      .replace(/^[A-Za-z0-9\s&/()\-–—]+\s+[–—-]\s*/, '');
    const tokens = stripped
      .split(/[,|•·/;\n]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2 && t.length <= 40 && !/^(skills|technologies|tools)$/i.test(t));
    for (const token of tokens) {
      const lower = token.toLowerCase();
      if (!skillSet.has(lower)) {
        skillSet.set(lower, { name: token, category: 'Technical Skills' });
      }
    }
  }

  // Parse Experience — never invent a sentinel "Work Experience" role
  const experience: ProfileExperience[] = parseExperienceBlock(sectionBuckets.experience).filter(
    (e) => !SENTINEL_COMPANIES.has((e.company || '').trim().toLowerCase()),
  );

  // Parse Education
  const education = parseEducationBlock(sectionBuckets.education);

  // Parse Projects — title / optional tech line / bullets (never mirror name→description)
  const projects: ProfileProject[] = [];
  let currentProj: ProfileProject | null = null;
  for (const rawLine of sectionBuckets.projects) {
    const line = rawLine.trim();
    if (!line) continue;

    if (isBulletLine(line) || (currentProj && looksLikeContinuation(line))) {
      const cleaned = stripBullet(line);
      if (!cleaned || VIEW_PROJECT_REGEX.test(cleaned)) continue;
      if (!currentProj) {
        currentProj = { name: 'Technical Project', description: '', highlights: [cleaned] };
        projects.push(currentProj);
      } else if (
        currentProj.highlights.length > 0 &&
        looksLikeContinuation(line) &&
        !isBulletLine(line)
      ) {
        const last = currentProj.highlights.length - 1;
        currentProj.highlights[last] = `${currentProj.highlights[last]} ${cleaned}`.trim();
      } else {
        currentProj.highlights.push(cleaned);
      }
      continue;
    }

    // Tech stack belongs to the current project, not a new one
    if (currentProj && isTechStackLine(line)) {
      const tech = line.replace(TECH_STACK_LINE_REGEX, '').trim();
      if (tech && !currentProj.description) {
        currentProj.description = tech;
      } else if (tech && currentProj.description && currentProj.description !== tech) {
        // Keep primary description; stash tech only if empty
      }
      continue;
    }

    const { name: titleLine, description: titleDesc } = splitProjectTitleLine(line);
    if (!titleLine || VIEW_PROJECT_REGEX.test(titleLine) || titleLine.length > 120) {
      continue;
    }
    if (isTechStackLine(titleLine)) {
      if (currentProj && !currentProj.description) {
        currentProj.description = titleLine.replace(TECH_STACK_LINE_REGEX, '').trim();
      }
      continue;
    }

    currentProj = {
      name: titleLine,
      description: titleDesc,
      highlights: [],
    };
    projects.push(currentProj);
  }

  // Drop empty title stubs / tech-only ghosts
  const cleanedProjects = projects.filter((p) => {
    const name = (p.name || '').trim();
    if (!name || VIEW_PROJECT_REGEX.test(name)) return false;
    if (isTechStackLine(name) && p.highlights.length === 0) return false;
    if (name.length < 3) return false;
    return p.highlights.length > 0 || Boolean(p.description?.trim()) || name.length >= 4;
  });
  projects.length = 0;
  projects.push(...cleanedProjects);

  // Parse Summary (multi-line)
  let summary = sectionBuckets.summary.join(' ').slice(0, 800).trim();
  if (!summary && nonContactHeaderLines.length >= 3) {
    summary = nonContactHeaderLines.slice(2, 5).join(' ').slice(0, 600).trim();
  }

  // Location heuristics
  const locationLine = lines.slice(0, 8).find((l) =>
    /(?:bengaluru|bangalore|hyderabad|pune|mumbai|delhi|noida|gurugram|chennai|san francisco|seattle|new york|austin|chicago|london|berlin|toronto|vancouver|remote|california|ca|ny|tx|wa|india|usa|uk|germany|canada)/i.test(
      l,
    ),
  );

  return {
    contact: {
      fullName,
      email: contact.email,
      phone: contact.phone,
      linkedinUrl: contact.linkedinUrl,
      githubUrl: contact.githubUrl,
      websiteUrl: contact.websiteUrl,
    },
    headline,
    summary,
    location: locationLine ? locationLine.slice(0, 60).trim() : '',
    skills: Array.from(skillSet.values()),
    experience,
    education,
    projects,
    certifications: sectionBuckets.certifications.map((c) => ({
      name: c.replace(/^[•\-*▪]\s+/, '').trim(),
      issuer: 'Certification Authority',
    })),
    sourceType: 'standard_resume',
    confidenceScore: 92,
  };
}

function experienceKey(exp: { company?: string; title?: string; startDate?: string }) {
  return `${(exp.company || '').trim().toLowerCase()}|${(exp.title || '').trim().toLowerCase()}|${(exp.startDate || '').trim().toLowerCase()}`;
}

function isSentinelExperience(exp: { company?: string; title?: string }): boolean {
  const company = (exp.company || '').trim().toLowerCase();
  const title = (exp.title || '').trim();
  if (SENTINEL_COMPANIES.has(company)) return true;
  if (CONTACT_OR_URL_LINE_REGEX.test(title)) return true;
  return false;
}

/** Prefer the richer list; union/dedupe when both have data so AI can't wipe real jobs. */
function mergeExperienceLists<T extends { company?: string; title?: string; startDate?: string; bullets?: string[] }>(
  aiList: T[] | undefined,
  deterministicList: T[] | undefined,
): T[] {
  const ai = (aiList || []).filter((e) => !isSentinelExperience(e));
  const det = (deterministicList || []).filter((e) => !isSentinelExperience(e));
  if (!ai.length) return det;
  if (!det.length) return ai;

  const score = (list: T[]) =>
    list.reduce((sum, e) => sum + 1 + (e.bullets?.length || 0), 0);

  // If deterministic found clearly more roles, trust it as primary
  if (det.length > ai.length) {
    const seen = new Set(det.map(experienceKey));
    const extras = ai.filter((e) => !seen.has(experienceKey(e)));
    return [...det, ...extras];
  }

  // Same or more AI roles — still union so we don't lose deterministic companies
  const seen = new Set<string>();
  const merged: T[] = [];
  const primary = score(det) > score(ai) ? det : ai;
  const secondary = primary === det ? ai : det;
  for (const e of [...primary, ...secondary]) {
    const key = experienceKey(e);
    if (!key.replace(/\|/g, '') || seen.has(key)) continue;
    seen.add(key);
    merged.push(e);
  }
  return merged.length ? merged : primary;
}

function projectQuality<T extends { name?: string; description?: string; highlights?: string[] }>(p: T): number {
  return 1 + (p.highlights?.length || 0) * 2 + (p.description?.trim() ? 1 : 0);
}

function mergeProjectLists<
  T extends { name?: string; description?: string; highlights?: string[] },
>(aiList: T[] | undefined, deterministicList: T[] | undefined): T[] {
  const ai = aiList || [];
  const det = deterministicList || [];
  if (!ai.length) return dedupeProjects(det);
  if (!det.length) return dedupeProjects(ai);

  // Prefer AI when it has coherent named projects with highlights; otherwise pick richer side
  const aiScore = ai.reduce((s, p) => s + projectQuality(p), 0);
  const detScore = det.reduce((s, p) => s + projectQuality(p), 0);
  const primary = aiScore >= detScore ? ai : det;
  const secondary = primary === ai ? det : ai;

  const byName = new Map<string, T>();
  for (const p of [...primary, ...secondary]) {
    const key = normalizeProjectName(p.name || '');
    if (!key || VIEW_PROJECT_REGEX.test(p.name || '') || isTechStackLine(p.name || '')) continue;
    const existing = byName.get(key);
    if (!existing || projectQuality(p) > projectQuality(existing)) {
      byName.set(key, {
        ...p,
        description:
          p.description && p.description.trim().toLowerCase() === (p.name || '').trim().toLowerCase()
            ? ''
            : p.description,
      });
    }
  }
  return Array.from(byName.values());
}

function dedupeProjects<T extends { name?: string; description?: string; highlights?: string[] }>(
  list: T[],
): T[] {
  const byName = new Map<string, T>();
  for (const p of list) {
    const key = normalizeProjectName(p.name || '');
    if (!key || VIEW_PROJECT_REGEX.test(p.name || '') || isTechStackLine(p.name || '')) continue;
    const existing = byName.get(key);
    if (!existing || projectQuality(p) > projectQuality(existing)) {
      byName.set(key, {
        ...p,
        description:
          p.description && p.description.trim().toLowerCase() === (p.name || '').trim().toLowerCase()
            ? ''
            : p.description,
      });
    }
  }
  return Array.from(byName.values());
}

export function normalizeParsedProfileDraft(
  draft: ParsedProfileDraft,
  rawText: string,
): ParsedProfileDraft {
  const detection = detectLinkedInProfilePdf(rawText);
  // Always run a deterministic parse — LinkedIn-tuned or generic — so AI can't
  // replace a full resume with a single hallucinated employer.
  const deterministic = detection.isLinkedInPdf
    ? parseLinkedInProfileText(rawText)
    : parseGenericResumeText(rawText);

  const detectedLanguageSet = new Set(
    (deterministic?.languages || []).map((l) =>
      l.replace(/\s*\([^)]*\)\s*/g, ' ').trim().toLowerCase(),
    ),
  );

  const cleanSkills: ProfileSkill[] = [];
  const seenSkill = new Set<string>();
  const sourceSkills =
    (draft.skills && draft.skills.length > 0 ? draft.skills : deterministic?.skills) || [];

  for (const s of sourceSkills) {
    const rawName = (s?.name || '').trim();
    if (!rawName) continue;
    const baseLower = rawName.replace(/\s*\([^)]*\)\s*/g, ' ').trim().toLowerCase();
    if (
      detection.isLinkedInPdf &&
      (detectedLanguageSet.has(baseLower) || isSpokenLanguageEntry(rawName))
    ) {
      continue;
    }
    const cleanName = normalizeSkillDisplay(rawName);
    if (cleanName && !seenSkill.has(cleanName.toLowerCase())) {
      seenSkill.add(cleanName.toLowerCase());
      cleanSkills.push({ name: cleanName, category: s.category || 'Technical Skills' });
    }
  }

  // Merge any deterministic Top Skills that Gemini dropped
  for (const detSkill of deterministic?.skills || []) {
    if (!seenSkill.has(detSkill.name.toLowerCase())) {
      seenSkill.add(detSkill.name.toLowerCase());
      cleanSkills.push(detSkill);
    }
  }

  const mergedHeadline = draft.headline?.trim() || deterministic?.headline || 'Professional';
  const mergedSummary = draft.summary?.trim() || deterministic?.summary || '';
  const mergedExperience = mergeExperienceLists(draft.experience, deterministic?.experience);
  const mergedEducation =
    (deterministic?.education?.length || 0) > (draft.education?.length || 0)
      ? deterministic!.education!
      : (draft.education?.length ? draft.education : deterministic?.education) || [];
  const mergedProjects = mergeProjectLists(draft.projects, deterministic?.projects);
  const mergedCerts =
    (draft.certifications?.length ? draft.certifications : deterministic?.certifications) || [];

  return {
    ...draft,
    contact: {
      fullName: draft.contact?.fullName?.trim() || deterministic?.contact?.fullName,
      email: draft.contact?.email?.trim() || deterministic?.contact?.email,
      phone: draft.contact?.phone?.trim() || deterministic?.contact?.phone,
      location:
        draft.contact?.location?.trim() ||
        deterministic?.contact?.location ||
        draft.location,
      linkedinUrl:
        draft.contact?.linkedinUrl?.trim() ||
        deterministic?.contact?.linkedinUrl ||
        detection.linkedinUrl,
      githubUrl: draft.contact?.githubUrl?.trim() || deterministic?.contact?.githubUrl,
      websiteUrl: draft.contact?.websiteUrl?.trim() || deterministic?.contact?.websiteUrl,
    },
    headline: mergedHeadline,
    summary: mergedSummary,
    location: draft.location?.trim() || deterministic?.location || '',
    skills: cleanSkills,
    experience: mergedExperience,
    education: mergedEducation,
    projects: mergedProjects,
    certifications: mergedCerts,
    languages: draft.languages?.length ? draft.languages : deterministic?.languages || [],
    sourceType: detection.isLinkedInPdf ? 'linkedin_pdf' : 'standard_resume',
    linkedinMeta: detection.isLinkedInPdf
      ? {
          isLinkedInPdf: true,
          linkedinSlug: detection.linkedinSlug,
          hasCustomSlug: detection.hasCustomSlug,
          detectedSections: detection.detectedSections,
          headlineCharCount: mergedHeadline.length,
          summaryCharCount: mergedSummary.length,
        }
      : undefined,
  };
}
