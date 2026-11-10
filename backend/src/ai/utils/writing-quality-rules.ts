import type {
  WritingCheckRequest,
  WritingCheckResult,
  WritingIssueItem,
} from '../interfaces/ai-provider.interface.js';

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

const BUZZWORD_REPLACEMENTS: Array<{
  pattern: RegExp;
  replacement: string;
  reason: string;
}> = [
  {
    pattern: /\bhard[- ]?working\b/gi,
    replacement: 'high-output',
    reason: 'Subjective self-praise adds fluff; show execution velocity or measurable outcomes instead.',
  },
  {
    pattern: /\bteam[- ]player\b/gi,
    replacement: 'cross-functional collaborator',
    reason: 'Generic cliché overused across resumes; name concrete cross-team delivery instead.',
  },
  {
    pattern: /\bself[- ]starter\b/gi,
    replacement: 'autonomous owner',
    reason: 'Cliché trait phrase; demonstrate ownership with shipped initiatives.',
  },
  {
    pattern: /\bgo[- ]getter\b/gi,
    replacement: 'proactive builder',
    reason: 'Informal cliché flagged as filler by recruiters and ATS writing scorers.',
  },
  {
    pattern: /\bdetail[- ]oriented\b/gi,
    replacement: 'quality-focused',
    reason: 'Overused résumé filler; prove precision with reliability, testing, or SLA metrics.',
  },
  {
    pattern: /\bsynergy\b/gi,
    replacement: 'cross-team alignment',
    reason: 'Corporate buzzword; use concrete plain language.',
  },
  {
    pattern: /\bthink(?:ing)? outside the box\b/gi,
    replacement: 'creative problem-solving',
    reason: 'Cliché idiom; describe the concrete engineering approach instead.',
  },
  {
    pattern: /\bthought leader\b/gi,
    replacement: 'technical advisor',
    reason: 'Self-proclaimed buzzword; cite talks, RFCs, or mentoring outcomes.',
  },
  {
    pattern: /\b(?:rockstar|ninja|guru|wizard)\b/gi,
    replacement: 'specialist',
    reason: 'Informal hype title that undermines senior credibility.',
  },
  {
    pattern: /\bproven track record(?: of)?\b/gi,
    replacement: 'demonstrated',
    reason: 'Verbose filler cliché; jump directly to verified outcomes.',
  },
  {
    pattern: /\bresults[- ]?(?:driven|oriented)\b/gi,
    replacement: 'outcome-focused',
    reason: 'Common resume cliché; let quantified metrics prove results directly.',
  },
  {
    pattern: /\bpassionate about\b/gi,
    replacement: 'focused on',
    reason: 'Subjective filler phrase; emphasize domain specialization.',
  },
  {
    pattern: /\bin order to\b/gi,
    replacement: 'to',
    reason: 'Wordy filler phrase that can be tightened without losing meaning.',
  },
  {
    pattern: /\butilize(?:d|s|ing)?\b/gi,
    replacement: 'use',
    reason: 'Unnecessarily complex synonym for "use" / "used" / "using".',
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

const AN_EXCEPTIONS = new Set([
  'user', 'users', 'usage', 'use', 'used', 'useful', 'unit', 'units',
  'unique', 'unified', 'uniform', 'universal', 'university', 'one', 'once',
  'euro', 'european', 'utility', 'utilities', 'ui', 'ux', 'url', 'uri',
]);

const A_SILENT_H_EXCEPTIONS = new Set([
  'hour', 'hours', 'hourly', 'honest', 'honestly', 'honor', 'honorable', 'heir',
]);

const LOWERCASE_TECH_EXCEPTIONS = /^(eBPF|iOS|iPadOS|macOS|watchOS|gRPC|tRPC|npm|pnpm|yarn|vitest|p95|p99|p50|k8s|v\d)/;

function matchCase(source: string, target: string): string {
  if (!source) return target;
  if (target[0] && target[0] === target[0].toUpperCase() && target[0] !== target[0].toLowerCase()) {
    // Proper tech brand capitalization like Kubernetes, TypeScript, PostgreSQL
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

interface ScanTarget {
  text: string;
  locationType: 'headline' | 'summary' | 'experience_bullet' | 'project_description';
  locationLabel: string;
  expIdx?: number;
  bulletIdx?: number;
  projIdx?: number;
  isPastRole?: boolean;
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
        reason: `Spelling typo: replace "${raw}" with "${rep}".`,
      });
    }
  }

  // 2. Duplicate consecutive words (e.g. "the the")
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
      reason: `Repeated consecutive word "${full}" detected.`,
    });
  }

  // 3. Indefinite article ("a" vs "an")
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
        reason: `Grammar article: use "${fixed}" before vowel sound.`,
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
        reason: `Grammar article: use "${fixed}" before consonant sound.`,
      });
    }
  }

  // 4. Double spaces or space before punctuation
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
      reason: 'Remove extra consecutive whitespace characters.',
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
      reason: 'Remove stray whitespace before punctuation mark.',
    });
  }

  // 5. Lowercase bullet opener (ignoring lowercase tech tokens like eBPF / iOS / gRPC / p95)
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
      reason: 'Capitalize the opening word of experience bullet points.',
    });
  }

  // 6. Past-role present tense check
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
          reason: `Completed past role should use past-tense verb "${pastForm}" instead of present tense "${opener}".`,
        });
      }
    }
  }

  // 7. Weak openers ("Responsible for", "Helped with", "Worked on", "Tasked with")
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
      reason: `Replace passive opener "${phrase}" with direct action verb "${replacement}".`,
    });
  }

  // 8. First-person pronouns ("I", "my", "our", "we", "myself") excluding "I/O"
  const pronounRegex = /(?:^|[\s(])(I|me|my|mine|myself|we|our|ours)(?=$|[\s.,;:!?])/g;
  while ((match = pronounRegex.exec(text)) !== null) {
    const pron = match[1];
    if (pron === 'I' && text.slice(match.index).includes('I/O')) continue;
    const rewritten =
      pron === 'I'
        ? text.replace(/\bI\s+/g, '').replace(/^[a-z]/, (c) => c.toUpperCase())
        : replaceFirstOccurrence(text, pron, pron.toLowerCase().startsWith('o') || pron.toLowerCase().startsWith('m') ? 'the' : '').replace(/ {2,}/g, ' ').trim();
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
      reason: `Avoid first-person pronoun "${pron}" on resumes; write in implied-subject telegraphic style.`,
    });
  }

  // 9. Buzzwords & clichés
  for (const rule of BUZZWORD_REPLACEMENTS) {
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

  return issues;
}

/**
 * Runs deterministic grammar, spelling, buzzword, and phrasing checks across
 * resume prose without mutating facts or making external network calls.
 */
export function runDeterministicWritingCheck(
  input: WritingCheckRequest,
): WritingCheckResult {
  const targets: ScanTarget[] = [];

  if (input.headline?.trim()) {
    targets.push({
      text: input.headline,
      locationType: 'headline',
      locationLabel: 'Headline',
    });
  }
  if (input.summary?.trim()) {
    targets.push({
      text: input.summary,
      locationType: 'summary',
      locationLabel: 'Professional Summary',
    });
  }

  (input.experience || []).forEach((exp, expIdx) => {
    const isPastRole =
      exp.current === false &&
      Boolean(exp.endDate?.trim()) &&
      !/present|current/i.test(exp.endDate || '');
    const companyOrTitle = exp.company?.trim() || exp.title?.trim() || `Role ${expIdx + 1}`;
    (exp.bullets || []).forEach((bullet, bulletIdx) => {
      if (bullet?.trim()) {
        targets.push({
          text: bullet,
          locationType: 'experience_bullet',
          locationLabel: `${companyOrTitle} · Bullet ${bulletIdx + 1}`,
          expIdx,
          bulletIdx,
          isPastRole,
        });
      }
    });
  });

  (input.projects || []).forEach((proj, projIdx) => {
    if (proj.description?.trim()) {
      targets.push({
        text: proj.description,
        locationType: 'project_description',
        locationLabel: `${proj.name?.trim() || `Project ${projIdx + 1}`}`,
        projIdx,
      });
    }
  });

  const issues = targets.flatMap(scanTargetText);

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const suggestionCount = issues.filter((i) => i.severity === 'suggestion').length;

  const rawScore = 100 - errorCount * 10 - warningCount * 6 - suggestionCount * 4;
  const overallWritingScore = Math.max(25, Math.min(100, rawScore));

  return {
    overallWritingScore,
    summaryNote:
      issues.length === 0
        ? 'No spelling errors, grammar defects, clichés, or weak openers detected.'
        : `Detected ${issues.length} writing improvement(s): ${errorCount} error(s), ${warningCount} warning(s), ${suggestionCount} clarity suggestion(s).`,
    issues,
    factualVerificationNotes:
      'All corrections preserve existing metrics, dates, companies, and verified technologies.',
    provider: 'mock',
  };
}
