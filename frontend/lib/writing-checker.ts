import type {
  ResumeContent,
  WritingCheckResponse,
  WritingIssueItem,
} from './api-client';

const SPELLING_TYPOS: Record<string, string> = {
  experince: 'experience',
  experiance: 'experience',
  expereince: 'experience',
  managment: 'management',
  mangement: 'management',
  developement: 'development',
  devlopment: 'development',
  develpment: 'development',
  architetcure: 'architecture',
  architechture: 'architecture',
  achitecture: 'architecture',
  microserivces: 'microservices',
  microservcies: 'microservices',
  implmented: 'implemented',
  implementd: 'implemented',
  impelemented: 'implemented',
  optmized: 'optimized',
  optimzed: 'optimized',
  opimized: 'optimized',
  depoyed: 'deployed',
  delpoyed: 'deployed',
  refactord: 'refactored',
  refactred: 'refactored',
  responsbile: 'responsible',
  reponsible: 'responsible',
  responsable: 'responsible',
  collaboraton: 'collaboration',
  colaboration: 'collaboration',
  enviroment: 'environment',
  environemnt: 'environment',
  performace: 'performance',
  perfomance: 'performance',
  preformance: 'performance',
  sucessful: 'successful',
  succesful: 'successful',
  successfuly: 'successfully',
  succesfully: 'successfully',
  recieve: 'receive',
  recieved: 'received',
  acheive: 'achieve',
  acheived: 'achieved',
  achived: 'achieved',
  seperate: 'separate',
  seperated: 'separated',
  independant: 'independent',
  independatly: 'independently',
  maintainance: 'maintenance',
  maintenence: 'maintenance',
  improvment: 'improvement',
  occured: 'occurred',
  occurence: 'occurrence',
  untill: 'until',
  teh: 'the',
  adn: 'and',
  wiht: 'with',
  thier: 'their',
  whcih: 'which',
  definately: 'definitely',
  accomodate: 'accommodate',
  kuberentes: 'Kubernetes',
  kubernets: 'Kubernetes',
  postgress: 'PostgreSQL',
  typescipt: 'TypeScript',
  typscript: 'TypeScript',
  javascipt: 'JavaScript',
  javscript: 'JavaScript',
  analitics: 'analytics',
  anylisis: 'analysis',
  scalabilty: 'scalability',
  scability: 'scalability',
  avaliable: 'available',
  availble: 'available',
  relevent: 'relevant',
  bussiness: 'business',
  busines: 'business',
  comunication: 'communication',
  communcation: 'communication',
  infrastrucutre: 'infrastructure',
  infrastucture: 'infrastructure',
  orchestatred: 'orchestrated',
  spearheded: 'spearheaded',
  automatization: 'automation',
  alot: 'extensively',
};

const BUZZWORD_RULES: Array<{
  pattern: RegExp;
  replacement: string;
  reason: string;
}> = [
  {
    pattern: /\bhard[- ]?working\b/gi,
    replacement: 'high-output',
    reason: 'Subjective self-praise adds fluff; highlight delivery velocity or measurable impact instead.',
  },
  {
    pattern: /\bteam[- ]player\b/gi,
    replacement: 'cross-functional collaborator',
    reason: 'Generic résumé cliché; show cross-functional coordination through concrete shipped work.',
  },
  {
    pattern: /\bself[- ]starter\b/gi,
    replacement: 'autonomous owner',
    reason: 'Cliché trait phrase; demonstrate ownership with concrete initiatives.',
  },
  {
    pattern: /\bgo[- ]getter\b/gi,
    replacement: 'proactive builder',
    reason: 'Informal cliché flagged as filler by recruiters and ATS readability scorers.',
  },
  {
    pattern: /\bdetail[- ]oriented\b/gi,
    replacement: 'quality-focused',
    reason: 'Overused filler phrase; back up precision with test coverage, reliability, or SLA numbers.',
  },
  {
    pattern: /\bsynergy\b/gi,
    replacement: 'cross-team alignment',
    reason: 'Overused corporate buzzword; replace with specific engineering or business language.',
  },
  {
    pattern: /\bthink(?:ing)? outside the box\b/gi,
    replacement: 'creative problem-solving',
    reason: 'Cliché idiom; describe the concrete architectural or operational approach.',
  },
  {
    pattern: /\bthought leader\b/gi,
    replacement: 'technical advisor',
    reason: 'Self-proclaimed buzzword; cite architecture RFCs, reviews, or mentoring instead.',
  },
  {
    pattern: /\b(?:rockstar|ninja|guru|wizard)\b/gi,
    replacement: 'specialist',
    reason: 'Informal hype title that weakens executive credibility in recruiter reviews.',
  },
  {
    pattern: /\bproven track record(?: of)?\b/gi,
    replacement: 'demonstrated',
    reason: 'Verbose cliché opener; lead directly with verified delivery metrics.',
  },
  {
    pattern: /\bresults[- ]?(?:driven|oriented)\b/gi,
    replacement: 'outcome-focused',
    reason: 'Common resume buzzword; let concrete metrics demonstrate results.',
  },
  {
    pattern: /\bpassionate about\b/gi,
    replacement: 'focused on',
    reason: 'Subjective filler; replace with direct technical specialization.',
  },
  {
    pattern: /\bin order to\b/gi,
    replacement: 'to',
    reason: 'Wordy filler phrase that can be tightened for scannability.',
  },
  {
    pattern: /\butilize(?:d|s|ing)?\b/gi,
    replacement: 'use',
    reason: 'Inflated synonym for plain "use" / "used" / "using".',
  },
];

const GERUND_PAST_MAP: Record<string, string> = {
  building: 'Built',
  developing: 'Developed',
  designing: 'Designed',
  managing: 'Managed',
  leading: 'Led',
  maintaining: 'Maintained',
  creating: 'Created',
  testing: 'Tested',
  optimizing: 'Optimized',
  implementing: 'Implemented',
  deploying: 'Deployed',
  supporting: 'Supported',
  writing: 'Wrote',
  monitoring: 'Monitored',
  operating: 'Operated',
  analyzing: 'Analyzed',
  reviewing: 'Reviewed',
  coordinating: 'Coordinated',
  delivering: 'Delivered',
  architecting: 'Architected',
  automating: 'Automated',
  scaling: 'Scaled',
  migrating: 'Migrated',
  refactoring: 'Refactored',
};

const PRESENT_TO_PAST_OPENERS: Record<string, string> = {
  lead: 'Led',
  build: 'Built',
  manage: 'Managed',
  develop: 'Developed',
  create: 'Created',
  design: 'Designed',
  write: 'Wrote',
  optimize: 'Optimized',
  maintain: 'Maintained',
  implement: 'Implemented',
  deploy: 'Deployed',
  automate: 'Automated',
  architect: 'Architected',
  deliver: 'Delivered',
  scale: 'Scaled',
  handle: 'Handled',
  work: 'Worked',
};

const VERB_SYNONYMS: Record<string, string> = {
  built: 'Engineered',
  engineered: 'Architected',
  developed: 'Implemented',
  managed: 'Orchestrated',
  led: 'Spearheaded',
  created: 'Designed',
  worked: 'Delivered',
  helped: 'Supported',
  optimized: 'Streamlined',
};

const AN_EXCEPTIONS = new Set([
  'user', 'users', 'usage', 'use', 'used', 'useful', 'unit', 'units',
  'unique', 'unified', 'uniform', 'universal', 'university', 'one', 'once',
  'euro', 'european', 'utility', 'utilities', 'ui', 'ux', 'url', 'uri',
]);

const A_SILENT_H_EXCEPTIONS = new Set([
  'hour', 'hours', 'hourly', 'honest', 'honestly', 'honor', 'honorable', 'heir',
]);

const LOWERCASE_TECH_EXCEPTIONS = /^(eBPF|iOS|iPadOS|macOS|watchOS|gRPC|tRPC|npm|pnpm|yarn|vitest|p95|p99|p50|k8s|v\d)/;

interface ScanTarget {
  text: string;
  locationType: WritingIssueItem['locationType'];
  locationLabel: string;
  expIdx?: number;
  bulletIdx?: number;
  projIdx?: number;
  isPastRole?: boolean;
}

function matchCase(source: string, target: string): string {
  if (!source) return target;
  if (
    target[0] &&
    target[0] === target[0].toUpperCase() &&
    target[0] !== target[0].toLowerCase()
  ) {
    return target;
  }
  if (source === source.toUpperCase()) return target.toUpperCase();
  if (source[0] === source[0].toUpperCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target.toLowerCase();
}

function replaceFirstOccurrence(text: string, matched: string, replacement: string): string {
  const idx = text.indexOf(matched);
  if (idx === -1) return text;
  return `${text.slice(0, idx)}${replacement}${text.slice(idx + matched.length)}`;
}

function conjugateUtilize(matched: string): string {
  const lower = matched.toLowerCase();
  if (lower.endsWith('d')) return matchCase(matched, 'used');
  if (lower.endsWith('ing')) return matchCase(matched, 'using');
  if (lower.endsWith('s')) return matchCase(matched, 'uses');
  return matchCase(matched, 'use');
}

function scanTargetText(target: ScanTarget): WritingIssueItem[] {
  const issues: WritingIssueItem[] = [];
  const { text, locationType, locationLabel, expIdx, bulletIdx, projIdx, isPastRole } = target;
  if (!text || !text.trim()) return issues;

  let seq = 0;
  const nextId = (prefix: string) =>
    `${prefix}-${locationType}-${expIdx ?? 'x'}-${bulletIdx ?? 'x'}-${projIdx ?? 'x'}-${++seq}`;

  // 1. Spelling typos
  const wordRegex = /\b([A-Za-z]+)\b/g;
  let match: RegExpExecArray | null;
  while ((match = wordRegex.exec(text)) !== null) {
    const raw = match[1];
    const correction = SPELLING_TYPOS[raw.toLowerCase()];
    if (correction && correction.toLowerCase() !== raw.toLowerCase()) {
      const rep = matchCase(raw, correction);
      issues.push({
        id: nextId('spell'),
        category: 'spelling',
        severity: 'error',
        locationType,
        locationLabel,
        expIdx,
        bulletIdx,
        projIdx,
        matchedText: raw,
        suggestedReplacement: rep,
        originalText: text,
        rewrittenText: replaceFirstOccurrence(text, raw, rep),
        reason: `Spelling mistake: replace "${raw}" with "${rep}".`,
      });
    }
  }

  // 2. Repeated duplicate words
  const dupRegex = /\b([A-Za-z]{2,})\s+\1\b/gi;
  while ((match = dupRegex.exec(text)) !== null) {
    const full = match[0];
    const single = match[1];
    issues.push({
      id: nextId('dup'),
      category: 'grammar',
      severity: 'error',
      locationType,
      locationLabel,
      expIdx,
      bulletIdx,
      projIdx,
      matchedText: full,
      suggestedReplacement: single,
      originalText: text,
      rewrittenText: replaceFirstOccurrence(text, full, single),
      reason: `Repeated word "${full}" creates a typo; collapse to "${single}".`,
    });
  }

  // 3. Article mismatch ("a" / "an")
  const articleRegex = /\b(a|an)\s+([a-z][a-z]{2,})\b/g;
  while ((match = articleRegex.exec(text)) !== null) {
    const full = match[0];
    const art = match[1];
    const nextWord = match[2];
    const nextLower = nextWord.toLowerCase();
    const startsWithVowel = /^[aeiou]/i.test(nextLower);

    if (art === 'a' && startsWithVowel && !AN_EXCEPTIONS.has(nextLower)) {
      const fixed = `an ${nextWord}`;
      issues.push({
        id: nextId('art'),
        category: 'grammar',
        severity: 'warning',
        locationType,
        locationLabel,
        expIdx,
        bulletIdx,
        projIdx,
        matchedText: full,
        suggestedReplacement: fixed,
        originalText: text,
        rewrittenText: replaceFirstOccurrence(text, full, fixed),
        reason: `Grammar article: use "${fixed}" before a vowel sound.`,
      });
    } else if (art === 'an' && !startsWithVowel && !A_SILENT_H_EXCEPTIONS.has(nextLower)) {
      const fixed = `a ${nextWord}`;
      issues.push({
        id: nextId('art'),
        category: 'grammar',
        severity: 'warning',
        locationType,
        locationLabel,
        expIdx,
        bulletIdx,
        projIdx,
        matchedText: full,
        suggestedReplacement: fixed,
        originalText: text,
        rewrittenText: replaceFirstOccurrence(text, full, fixed),
        reason: `Grammar article: use "${fixed}" before a consonant sound.`,
      });
    }
  }

  // 4. Extra spacing & punctuation spacing
  const multiSpace = / {2,}/.exec(text);
  if (multiSpace) {
    issues.push({
      id: nextId('space'),
      category: 'grammar',
      severity: 'warning',
      locationType,
      locationLabel,
      expIdx,
      bulletIdx,
      projIdx,
      matchedText: multiSpace[0],
      suggestedReplacement: ' ',
      originalText: text,
      rewrittenText: text.replace(/ {2,}/g, ' ').trim(),
      reason: 'Remove extra consecutive spacing for clean ATS parsing.',
    });
  }

  const spaceBeforePunct = /([A-Za-z0-9)])\s+([,;:.!?])(?=\s|$)/.exec(text);
  if (spaceBeforePunct) {
    const fixed = `${spaceBeforePunct[1]}${spaceBeforePunct[2]}`;
    issues.push({
      id: nextId('punct'),
      category: 'grammar',
      severity: 'warning',
      locationType,
      locationLabel,
      expIdx,
      bulletIdx,
      projIdx,
      matchedText: spaceBeforePunct[0],
      suggestedReplacement: fixed,
      originalText: text,
      rewrittenText: replaceFirstOccurrence(text, spaceBeforePunct[0], fixed),
      reason: 'Remove stray space before punctuation mark.',
    });
  }

  // 5. Lowercase start on bullet points
  if (
    locationType === 'experience_bullet' &&
    /^[a-z]/.test(text.trim()) &&
    !LOWERCASE_TECH_EXCEPTIONS.test(text.trim())
  ) {
    const trimmed = text.trim();
    const firstWordMatch = /^([a-z][a-zA-Z0-9-]*)/.exec(trimmed);
    const firstWord = firstWordMatch?.[1] || trimmed.charAt(0);
    const capitalized = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
    issues.push({
      id: nextId('cap'),
      category: 'grammar',
      severity: 'warning',
      locationType,
      locationLabel,
      expIdx,
      bulletIdx,
      projIdx,
      matchedText: firstWord,
      suggestedReplacement: capitalized,
      originalText: text,
      rewrittenText: replaceFirstOccurrence(text, firstWord, capitalized),
      reason: 'Capitalize the first word of experience bullet points.',
    });
  }

  // 6. Present-tense verb on completed past role
  if (locationType === 'experience_bullet' && isPastRole) {
    const openerMatch = /^([A-Za-z]+)\b/.exec(text.trim());
    if (openerMatch) {
      const opener = openerMatch[1];
      const pastForm = PRESENT_TO_PAST_OPENERS[opener.toLowerCase()];
      if (pastForm) {
        issues.push({
          id: nextId('tense'),
          category: 'grammar',
          severity: 'warning',
          locationType,
          locationLabel,
          expIdx,
          bulletIdx,
          projIdx,
          matchedText: opener,
          suggestedReplacement: pastForm,
          originalText: text,
          rewrittenText: replaceFirstOccurrence(text, opener, pastForm),
          reason: `Completed past role should use past-tense verb "${pastForm}" rather than "${opener}".`,
        });
      }
    }
  }

  // 7. Weak / passive openers
  const weakOpenerRegex =
    /\b(responsible for|tasked with|helped with|worked on|assisted with|involved in|duties included)\s+([a-z]+ing\b)?/gi;
  while ((match = weakOpenerRegex.exec(text)) !== null) {
    const phrase = match[0].trim();
    const gerund = match[2]?.toLowerCase();
    const mappedPast = gerund ? GERUND_PAST_MAP[gerund] : undefined;
    const replacement =
      mappedPast ||
      (match[1].toLowerCase().includes('helped') || match[1].toLowerCase().includes('assisted')
        ? 'Contributed to'
        : 'Led');
    issues.push({
      id: nextId('weak'),
      category: 'weak_phrasing',
      severity: 'warning',
      locationType,
      locationLabel,
      expIdx,
      bulletIdx,
      projIdx,
      matchedText: phrase,
      suggestedReplacement: replacement,
      originalText: text,
      rewrittenText: replaceFirstOccurrence(text, phrase, replacement),
      reason: `Replace passive filler "${phrase}" with active ownership verb "${replacement}".`,
    });
  }

  // 8. First-person pronouns
  const pronounRegex = /(?:^|[\s(])(I|me|my|mine|myself|we|our|ours)(?=$|[\s.,;:!?])/g;
  while ((match = pronounRegex.exec(text)) !== null) {
    const pron = match[1];
    if (pron === 'I' && text.slice(match.index).includes('I/O')) continue;
    const rewritten =
      pron === 'I'
        ? text.replace(/\bI\s+/g, '').replace(/^[a-z]/, (c) => c.toUpperCase())
        : replaceFirstOccurrence(
            text,
            pron,
            pron.toLowerCase().startsWith('o') || pron.toLowerCase().startsWith('m')
              ? 'the'
              : '',
          )
            .replace(/ {2,}/g, ' ')
            .trim();
    issues.push({
      id: nextId('pronoun'),
      category: 'weak_phrasing',
      severity: 'warning',
      locationType,
      locationLabel,
      expIdx,
      bulletIdx,
      projIdx,
      matchedText: pron,
      suggestedReplacement: pron === 'I' ? '(omit pronoun)' : 'the',
      originalText: text,
      rewrittenText: rewritten,
      reason: `Avoid first-person pronoun "${pron}" on resumes; keep telegraphic action-verb phrasing.`,
    });
  }

  // 9. Buzzwords & clichés
  for (const rule of BUZZWORD_RULES) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    while ((match = regex.exec(text)) !== null) {
      const matched = match[0];
      const replacement = matched.toLowerCase().startsWith('utiliz')
        ? conjugateUtilize(matched)
        : matchCase(matched, rule.replacement);
      issues.push({
        id: nextId('buzz'),
        category: 'buzzword',
        severity: 'suggestion',
        locationType,
        locationLabel,
        expIdx,
        bulletIdx,
        projIdx,
        matchedText: matched,
        suggestedReplacement: replacement,
        originalText: text,
        rewrittenText: replaceFirstOccurrence(text, matched, replacement),
        reason: rule.reason,
      });
    }
  }

  // 10. Overlong bullet alert (clarity tip)
  if (locationType === 'experience_bullet') {
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length > 42) {
      issues.push({
        id: nextId('len'),
        category: 'weak_phrasing',
        severity: 'suggestion',
        locationType,
        locationLabel,
        expIdx,
        bulletIdx,
        projIdx,
        matchedText: `${words.length} words`,
        suggestedReplacement: 'Trim to ≤ 35 words',
        originalText: text,
        rewrittenText: text,
        reason: `Bullet is ${words.length} words long; concise bullets (15–35 words) scan faster for recruiters.`,
      });
    }
  }

  return issues;
}

/**
 * Checks whether an issue carries a concrete non-identical replacement string
 * that can be auto-applied safely in one click.
 */
export function isAutoFixableIssue(issue: WritingIssueItem): boolean {
  return (
    typeof issue.rewrittenText === 'string' &&
    issue.rewrittenText.trim().length > 0 &&
    issue.rewrittenText !== issue.originalText
  );
}

/**
 * Runs instant client-side grammar, spelling, buzzword, pronoun, passive-voice,
 * verb repetition, and conciseness diagnostics on a structured resume draft.
 */
export function analyzeResumeWriting(content: ResumeContent): WritingCheckResponse {
  const targets: ScanTarget[] = [];

  if (content.headline?.trim()) {
    targets.push({
      text: content.headline,
      locationType: 'headline',
      locationLabel: 'Headline',
    });
  }

  if (content.summary?.trim()) {
    targets.push({
      text: content.summary,
      locationType: 'summary',
      locationLabel: 'Professional Summary',
    });
  }

  const openerCounts = new Map<string, number>();

  (content.experience || []).forEach((exp, expIdx) => {
    const isPastRole =
      exp.current === false &&
      Boolean(exp.endDate?.trim()) &&
      !/present|current/i.test(exp.endDate || '');
    const labelPrefix = exp.company?.trim() || exp.title?.trim() || `Role ${expIdx + 1}`;
    (exp.bullets || []).forEach((bullet, bulletIdx) => {
      if (!bullet?.trim()) return;
      targets.push({
        text: bullet,
        locationType: 'experience_bullet',
        locationLabel: `${labelPrefix} · Bullet ${bulletIdx + 1}`,
        expIdx,
        bulletIdx,
        isPastRole,
      });
    });
  });

  (content.projects || []).forEach((proj, projIdx) => {
    if (proj.description?.trim()) {
      targets.push({
        text: proj.description,
        locationType: 'project_description',
        locationLabel: proj.name?.trim() || `Project ${projIdx + 1}`,
        projIdx,
      });
    }
  });

  const issues = targets.flatMap(scanTargetText);

  // Flag repetitive bullet opening verbs on 3rd+ occurrence
  (content.experience || []).forEach((exp, expIdx) => {
    const labelPrefix = exp.company?.trim() || exp.title?.trim() || `Role ${expIdx + 1}`;
    (exp.bullets || []).forEach((bullet, bulletIdx) => {
      const opener = /^([A-Za-z]+)\b/.exec(bullet?.trim() || '')?.[1];
      if (!opener) return;
      const lower = opener.toLowerCase();
      const synonym = VERB_SYNONYMS[lower];
      if (!synonym) return;
      const nextCount = (openerCounts.get(lower) || 0) + 1;
      openerCounts.set(lower, nextCount);
      if (nextCount >= 3) {
        issues.push({
          id: `repverb-${expIdx}-${bulletIdx}`,
          category: 'weak_phrasing',
          severity: 'suggestion',
          locationType: 'experience_bullet',
          locationLabel: `${labelPrefix} · Bullet ${bulletIdx + 1}`,
          expIdx,
          bulletIdx,
          matchedText: opener,
          suggestedReplacement: synonym,
          originalText: bullet,
          rewrittenText: replaceFirstOccurrence(bullet, opener, synonym),
          reason: `Repetitive opening verb "${opener}" (${nextCount}x); vary with "${synonym}".`,
        });
      }
    });
  });

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const suggestionCount = issues.filter((i) => i.severity === 'suggestion').length;

  const rawScore = 100 - errorCount * 10 - warningCount * 6 - suggestionCount * 4;
  const overallWritingScore = Math.max(25, Math.min(100, rawScore));

  return {
    overallWritingScore,
    summaryNote:
      issues.length === 0
        ? 'No spelling errors, grammar issues, buzzwords, or weak phrasing detected.'
        : `Detected ${issues.length} writing improvement(s) across your resume.`,
    issues,
    factualVerificationNotes:
      'All corrections preserve existing metrics, employers, dates, and technical keywords.',
    provider: 'local',
  };
}

/**
 * Applies a single writing fix back into its exact ResumeContent target field.
 */
export function applyWritingIssueFix(
  content: ResumeContent,
  issue: WritingIssueItem,
): ResumeContent {
  if (!isAutoFixableIssue(issue)) return content;

  const applyPatchToField = (currentVal: string | undefined): string | null => {
    const val = currentVal ?? '';
    if (val === issue.originalText) return issue.rewrittenText;
    if (issue.matchedText && val.includes(issue.matchedText) && issue.suggestedReplacement && !issue.suggestedReplacement.startsWith('(')) {
      return replaceFirstOccurrence(val, issue.matchedText, issue.suggestedReplacement);
    }
    return null;
  };

  if (issue.locationType === 'headline') {
    const patched = applyPatchToField(content.headline);
    if (patched === null) return content;
    return { ...content, headline: patched };
  }

  if (issue.locationType === 'summary') {
    const patched = applyPatchToField(content.summary);
    if (patched === null) return content;
    return { ...content, summary: patched };
  }

  if (
    issue.locationType === 'experience_bullet' &&
    typeof issue.expIdx === 'number' &&
    typeof issue.bulletIdx === 'number'
  ) {
    const expList = [...(content.experience || [])];
    const targetExp = expList[issue.expIdx];
    if (!targetExp) return content;
    const bullets = [...(targetExp.bullets || [])];
    const patched = applyPatchToField(bullets[issue.bulletIdx]);
    if (patched === null) return content;
    bullets[issue.bulletIdx] = patched;
    expList[issue.expIdx] = { ...targetExp, bullets };
    return { ...content, experience: expList };
  }

  if (
    issue.locationType === 'project_description' &&
    typeof issue.projIdx === 'number'
  ) {
    const projects = [...(content.projects || [])];
    const targetProj = projects[issue.projIdx];
    if (!targetProj) return content;
    const patched = applyPatchToField(targetProj.description);
    if (patched === null) return content;
    projects[issue.projIdx] = { ...targetProj, description: patched };
    return { ...content, projects };
  }

  return content;
}

/**
 * Applies all auto-fixable issues sequentially across a ResumeContent draft.
 */
export function applyAllSafeFixes(
  content: ResumeContent,
  issues: WritingIssueItem[],
): { updated: ResumeContent; appliedCount: number } {
  let working = { ...content };
  let appliedCount = 0;

  for (const issue of issues) {
    if (!isAutoFixableIssue(issue)) continue;
    const next = applyWritingIssueFix(working, issue);
    if (next !== working) {
      working = next;
      appliedCount += 1;
    }
  }

  return { updated: working, appliedCount };
}

/**
 * Merges instant client-side checks with deeper AI Gemini audit findings
 * without duplicating identical phrase flags on the same field.
 */
export function mergeWritingIssues(
  localReport: WritingCheckResponse,
  aiReport: WritingCheckResponse,
): WritingCheckResponse {
  const dedupKey = (i: WritingIssueItem) =>
    `${i.locationType}:${i.expIdx ?? ''}:${i.bulletIdx ?? ''}:${i.projIdx ?? ''}:${i.matchedText.toLowerCase()}`;

  const merged: WritingIssueItem[] = [];
  const seen = new Set<string>();

  for (const issue of aiReport.issues || []) {
    const k = dedupKey(issue);
    if (!seen.has(k)) {
      seen.add(k);
      merged.push(issue);
    }
  }

  for (const issue of localReport.issues || []) {
    const k = dedupKey(issue);
    if (!seen.has(k)) {
      seen.add(k);
      merged.push(issue);
    }
  }

  const errorCount = merged.filter((i) => i.severity === 'error').length;
  const warningCount = merged.filter((i) => i.severity === 'warning').length;
  const suggestionCount = merged.filter((i) => i.severity === 'suggestion').length;
  const score =
    merged.length === 0
      ? 100
      : Math.max(25, Math.min(100, 100 - errorCount * 10 - warningCount * 6 - suggestionCount * 4));

  return {
    overallWritingScore: score,
    summaryNote: aiReport.summaryNote || localReport.summaryNote,
    issues: merged,
    factualVerificationNotes:
      aiReport.factualVerificationNotes || localReport.factualVerificationNotes,
    provider: aiReport.provider || localReport.provider,
  };
}

/**
 * Analyzes unstructured plain resume text (e.g. from /tools/resume-checker).
 */
export function analyzePlainResumeText(text: string): WritingCheckResponse {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[•\-*]\s*/, '').trim())
    .filter((l) => l.length >= 6);

  return analyzeResumeWriting({
    contact: { fullName: '', email: '' },
    headline: '',
    summary: '',
    skills: [],
    education: [],
    experience: [
      {
        company: 'Resume Line',
        title: '',
        startDate: '',
        current: true,
        bullets: lines,
      },
    ],
  });
}
