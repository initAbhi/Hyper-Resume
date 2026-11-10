import type {
  ParsedLinkedInMeta,
  ParsedProfileDraft,
} from '../ai/interfaces/ai-provider.interface.js';
import type {
  ProfileCertification,
  ProfileEducation,
  ProfileExperience,
  ProfileSkill,
} from '../profiles/entities/candidate-profile.entity.js';

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
  /^(?:[A-Z][a-z]+\s+)?\d{4}\s*[-–—]\s*(?:(?:[A-Z][a-z]+\s+)?\d{4}|Present|Current)(?:\s*\([^)]+\))?$/i;

const TOTAL_DURATION_REGEX =
  /^\d+\s+years?(?:\s+\d+\s+months?)?$|^\d+\s+months?$/i;

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
    if (/^[•\-*▪]\s+/.test(line)) {
      const cleanBullet = line.replace(/^[•\-*▪]\s+/, '').trim();
      if (current && cleanBullet) {
        current.bullets.push(cleanBullet);
      }
      continue;
    }

    // Date range belongs to role on previous line (or Title after Company)
    if (MONTH_DATE_RANGE_REGEX.test(line)) {
      const cleanedDate = line.replace(/\s*\([^)]+\)\s*$/, '').trim();
      const parts = cleanedDate.split(/\s*[-–—]\s*/);
      const startDate = parts[0]?.trim() || '';
      const rawEnd = parts[1]?.trim() || '';
      const isCurrent = /present|current/i.test(rawEnd);

      const title: string = pendingTitleCandidate || current?.title || 'Role';
      pushCurrent();
      current = {
        company: currentCompany || 'Company',
        title,
        startDate,
        endDate: isCurrent ? 'Present' : rawEnd || undefined,
        current: isCurrent,
        bullets: [],
      };
      pendingTitleCandidate = null;
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
  const lines = preprocessLines(rawText);
  const fullText = lines.join('\n');
  const contact = extractUrlsAndContact(fullText);

  const skillCatalog = [
    'TypeScript', 'JavaScript', 'Node.js', 'NestJS', 'React', 'Next.js',
    'Python', 'Go', 'Java', 'Rust', 'C++', 'Docker', 'Kubernetes',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Kafka', 'Terraform',
    'AWS', 'GCP', 'Azure', 'GraphQL', 'Prometheus', 'OpenTelemetry', 'SQL',
  ];

  const foundSkills: ProfileSkill[] = skillCatalog
    .filter((skill) => {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i').test(fullText);
    })
    .map((name) => ({ name, category: 'Technical Skills' }));

  const firstLines = lines.filter((l) => !/@|https?:|www\./i.test(l));
  const fullName = firstLines[0]?.slice(0, 80);
  const headline = firstLines[1]?.slice(0, 150) || firstLines[0]?.slice(0, 150) || 'Candidate Profile';

  // Extract bullet points genuinely present in uploaded resume text
  const bullets = lines
    .filter((l) => /^[•\-*▪]\s+/.test(l))
    .map((l) => l.replace(/^[•\-*▪]\s+/, '').trim());

  const expIdx = lines.findIndex((l) => /^(?:experience|work history|employment)/i.test(l));
  const eduIdx = lines.findIndex((l) => /^education/i.test(l));

  const experienceLines =
    expIdx >= 0
      ? lines.slice(expIdx + 1, eduIdx > expIdx ? eduIdx : undefined)
      : [];
  const parsedExperience = parseExperienceBlock(experienceLines);

  const experience: ProfileExperience[] =
    parsedExperience.length > 0
      ? parsedExperience
      : bullets.length > 0
        ? [
            {
              company: 'Extracted Work History',
              title: headline,
              startDate: '',
              current: true,
              bullets: bullets.slice(0, 6),
            },
          ]
        : [];

  const educationLines = eduIdx >= 0 ? lines.slice(eduIdx + 1) : [];
  const education = parseEducationBlock(educationLines);

  const summaryIdx = lines.findIndex((l) => /^(?:summary|profile|objective)/i.test(l));
  const summary =
    summaryIdx >= 0 && lines[summaryIdx + 1]
      ? lines[summaryIdx + 1].slice(0, 600)
      : firstLines.slice(2, 4).join(' ').slice(0, 500);

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
    location:
      lines.find((l) => /,/.test(l) && /india|usa|uk|canada|germany|remote|bengaluru|seattle|san francisco|hyderabad/i.test(l)) ||
      '',
    skills: foundSkills,
    experience,
    education,
    projects: [],
    certifications: [],
    sourceType: 'standard_resume',
    confidenceScore: 92,
  };
}

export function normalizeParsedProfileDraft(
  draft: ParsedProfileDraft,
  rawText: string,
): ParsedProfileDraft {
  const detection = detectLinkedInProfilePdf(rawText);
  const deterministic = detection.isLinkedInPdf
    ? parseLinkedInProfileText(rawText)
    : null;

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
  const mergedExperience =
    (draft.experience?.length ? draft.experience : deterministic?.experience) || [];
  const mergedEducation =
    (draft.education?.length ? draft.education : deterministic?.education) || [];
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
    projects: draft.projects || [],
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
