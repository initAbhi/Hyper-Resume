import type { ResumeContent } from './api-client';

/**
 * 250+ Industry-Standard Action Verbs categorized across Leadership, Engineering,
 * Optimization, Innovation, and Execution.
 */
export const ACTION_VERBS_SET = new Set([
  // Leadership & Strategy
  'spearheaded', 'orchestrated', 'championed', 'directed', 'navigated', 'steered',
  'mobilized', 'mentored', 'empowered', 'scaled', 'governed', 'established',
  'founded', 'co-founded', 'captained', 'marshaled', 'presided', 'mentored',
  'coached', 'guided', 'recruited', 'built', 'led', 'headed', 'advised',
  // Engineering & Architecture
  'architected', 'engineered', 'developed', 'designed', 'built', 'constructed',
  'implemented', 'deployed', 'programmed', 'coded', 'refactored', 'containerized',
  'modeled', 'configured', 'integrated', 'prototyped', 'authored', 'commissioned',
  'migrated', 'modularized', 'decoupled', 'consolidated', 'provisioned', 'automated',
  // Optimization & Performance
  'optimized', 'slashed', 'accelerated', 'streamlined', 'maximized', 'boosted',
  'amplified', 'surpassed', 'outperformed', 'reduced', 'curtailed', 'trimmed',
  'minimized', 'diminished', 'cut', 'shrunk', 'condensed', 'expedited',
  'enhanced', 'upgraded', 'strengthened', 'hardened', 'refined', 'tuned',
  // Innovation & Problem Solving
  'pioneered', 'invented', 'conceived', 'formulated', 'devised', 'devised',
  'modernized', 'revamped', 'overhauled', 'transformed', 'revolutionized',
  'reengineered', 'rebuilt', 'debugged', 'diagnosed', 'troubleshot', 'resolved',
  // Execution & Delivery
  'delivered', 'shipped', 'executed', 'launched', 'produced', 'published',
  'finalized', 'administered', 'maintained', 'operated', 'facilitated',
  'coordinated', 'negotiated', 'collaborated', 'partnered', 'achieved',
]);

const ACTION_VERB_REGEX = new RegExp(
  `^(?:[-•*●▪◦➤→*►■]\\s*)?(${Array.from(ACTION_VERBS_SET).join('|')})\\b`,
  'i',
);

const PASSIVE_OPENER_REGEX =
  /^(?:[-•*●▪◦➤→*►■]\s*)?(?:responsible for|assisted with|helped with|worked on|duties included|tasked with|participated in|handled)\b/i;

const METRIC_PATTERNS = [
  /(?:[\$€£₹]|Rs\.?|INR|EUR|GBP|USD)\s*\d+(?:[.,]\d+)?(?:\s*(?:k|m|b|cr|crores?|lakhs?|lac|l)\b|\+)?/i,
  /\d+(?:[.,]\d+)?\s*(?:%|percentage points(?:\b|$))/i,
  /\b\d+(?:[.,]\d+)?\s*(?:x|fold)\b/i,
  /\b\d{1,3}(?:,\d{3})+\+?/,
  /\b\d+(?:\.\d+)?\s*(?:k|m|b|cr|crores?|lakhs?)\b(?:\s+(?:daily|monthly|weekly|annual|annually|active|concurrent|registered))?\s+(?:users?|clients?|customers?|merchants?|events?|requests?|queries?|endpoints?|records?|transactions?)\b/i,
  /\b\d+(?:\.\d+)?\s*(?:users?|clients?|customers?|merchants?|events?|requests?|queries?|endpoints?|records?|transactions?|microservices?|pipelines?|qps|rps|tps|req\/s|gb|tb|pb|mb)\b/i,
  /\b\d+(?:\.\d+)?\s*(?:ms|milliseconds?|microseconds?|µs)\b/i,
  /\b(?:slashed|cut|decreased|reduced|shrunk|shrinking|shortened|accelerated|improved)\b[^\n.]{0,60}\b\d+(?:\.\d+)?\s*(?:mins?|minutes?|hrs?|hours?|days?|weeks?|seconds?|s)\b/i,
  /\b(?:slashed|cut|decreased|increased|boosted|amplified|grew|scaled|saved|eliminated|automated|optimized)\s+by\s+\d+(?:[.,]\d+)?/i,
];

const METRIC_REGEX = new RegExp(METRIC_PATTERNS.map((p) => p.source).join('|'), 'i');

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function countMeaningfulExperienceEntries(
  experience: Array<{ title?: string; company?: string; bullets?: string[] }> | undefined,
): number {
  return (experience || []).filter((entry) => {
    const bullets = (entry.bullets || []).filter((b) => b.trim().length >= 20);
    if (bullets.length > 0) return true;
    const title = (entry.title || '').trim();
    const company = (entry.company || '').trim();
    if (title.length < 3 || company.length < 2) return false;
    if (/^(df|asdf|sadf|test|xxx|n\/a)$/i.test(title) || /^(df|asdf|sadf|test|xxx|n\/a)$/i.test(company)) {
      return false;
    }
    return title.length >= 4 && company.length >= 3;
  }).length;
}

/** Mirrors backend computeResumeEvidenceDensity — caps empty drafts. */
export function computeClientEvidenceDensity(input: {
  wordCount: number;
  totalBullets: number;
  metricsCount: number;
  declaredSkillCount: number;
  corroboratedSkillCount: number;
  missingEssentialSections: number;
  hasEmail: boolean;
  hasName: boolean;
  meaningfulExperienceCount: number;
}): number {
  let points = 0;

  if (input.wordCount >= 450) points += 24;
  else if (input.wordCount >= 280) points += 20;
  else if (input.wordCount >= 180) points += 15;
  else if (input.wordCount >= 110) points += 10;
  else if (input.wordCount >= 60) points += 4;
  else if (input.wordCount >= 25) points += 1;

  if (input.totalBullets >= 10) points += 26;
  else if (input.totalBullets >= 8) points += 22;
  else if (input.totalBullets >= 6) points += 18;
  else if (input.totalBullets >= 3) points += 10;
  else if (input.totalBullets === 2) points += 5;
  else if (input.totalBullets === 1) points += 2;

  if (input.metricsCount >= 7) points += 28;
  else if (input.metricsCount >= 5) points += 24;
  else if (input.metricsCount >= 3) points += 16;
  else if (input.metricsCount === 2) points += 9;
  else if (input.metricsCount === 1) points += 4;

  if (input.metricsCount >= 5 && input.totalBullets >= 8) points += 14;
  else if (input.metricsCount >= 3 && input.totalBullets >= 6) points += 6;

  if (input.corroboratedSkillCount >= 6) points += 14;
  else if (input.corroboratedSkillCount >= 3) points += 9;
  else if (input.corroboratedSkillCount >= 1) points += 4;
  else if (input.declaredSkillCount >= 4) points += 2;

  const sectionScore = Math.max(0, 5 - input.missingEssentialSections);
  points += sectionScore;
  if (input.hasEmail) points += 1;
  if (input.hasName) points += 1;
  if (input.meaningfulExperienceCount >= 2) points += 1;

  return Math.max(0, Math.min(1, points / 100));
}

export interface ClientAtsAuditResult {
  score: number;
  formattingScore: number;
  metricsScore: number;
  verbsScore: number;
  depthScore: number;
  brevityScore: number;
  metricsCount: number;
  totalBullets: number;
  actionVerbsCount: number;
  xyzCount: number;
  wordCount: number;
}

/**
 * Computes calibrated 5-dimension ATS Resume Score matching the backend engine in real-time.
 */
export function calculateClientAtsScore(
  content: ResumeContent | null | undefined,
): ClientAtsAuditResult {
  if (!content) {
    return {
      score: 0,
      formattingScore: 0,
      metricsScore: 0,
      verbsScore: 0,
      depthScore: 0,
      brevityScore: 0,
      metricsCount: 0,
      totalBullets: 0,
      actionVerbsCount: 0,
      xyzCount: 0,
      wordCount: 0,
    };
  }

  // 1. Formatting & Hierarchy (25%)
  let formattingScore = 100;
  const hasExp = Boolean(content.experience && content.experience.length > 0);
  const hasEdu = Boolean(content.education && content.education.length > 0);
  const hasSkills = Boolean(content.skills && content.skills.length > 0);
  const hasSummary = Boolean(content.summary?.trim() || content.headline?.trim());

  let missingEssentialSections = 0;
  if (!hasExp) {
    formattingScore -= 18;
    missingEssentialSections += 1;
  }
  if (!hasEdu) {
    formattingScore -= 18;
    missingEssentialSections += 1;
  }
  if (!hasSkills) {
    formattingScore -= 18;
    missingEssentialSections += 1;
  }
  if (!hasSummary) {
    formattingScore -= 18;
    missingEssentialSections += 1;
  }

  if (!content.contact?.email) formattingScore -= 14;
  if (!content.contact?.fullName) formattingScore -= 12;
  if (!content.contact?.phone) formattingScore -= 5;
  if (
    !content.contact?.linkedinUrl &&
    !content.contact?.githubUrl &&
    !content.contact?.websiteUrl
  ) {
    formattingScore -= 5;
  }
  formattingScore = clampScore(formattingScore);

  // Collect bullets
  const allBullets: string[] = [];
  for (const exp of content.experience || []) {
    for (const b of exp.bullets || []) {
      if (b.trim()) allBullets.push(b.trim());
    }
  }
  for (const proj of content.projects || []) {
    for (const h of proj.highlights || []) {
      if (h.trim()) allBullets.push(h.trim());
    }
  }
  for (const sec of content.customSections || []) {
    for (const entry of sec.entries || []) {
      for (const b of entry.bullets || []) {
        if (b.trim()) allBullets.push(b.trim());
      }
    }
  }

  // 2. Metrics & Google XYZ formula (25%)
  let metricsCount = 0;
  let actionVerbsCount = 0;
  let xyzCount = 0;
  let totalVerbPoints = 0;
  let shortBullets = 0;
  let longBullets = 0;

  for (const b of allBullets) {
    const clean = b.replace(/^(?:[•●▪◦\-*➤→►■]|\d+[\.)])\s*/, '').trim();
    const words = countWords(clean);
    const hasMetric = METRIC_REGEX.test(clean);
    const hasVerb = ACTION_VERB_REGEX.test(clean);
    const isPassive = PASSIVE_OPENER_REGEX.test(clean);

    if (hasMetric) metricsCount += 1;
    if (hasVerb) {
      actionVerbsCount += 1;
      totalVerbPoints += 1.0;
    } else if (isPassive) {
      totalVerbPoints += 0.4;
    } else {
      totalVerbPoints += 0.15;
    }

    if (hasMetric && hasVerb && words >= 7) {
      xyzCount += 1;
    }

    if (words < 7) shortBullets += 1;
    else if (words > 38) longBullets += 1;
  }

  const totalBullets = allBullets.length;
  const metricRatio = totalBullets > 0 ? metricsCount / totalBullets : 0;
  const xyzRatio = totalBullets > 0 ? xyzCount / totalBullets : 0;

  let metricsScore: number;
  if (totalBullets === 0) {
    metricsScore = 0;
  } else if (metricRatio >= 0.5) {
    metricsScore = 88 + Math.min(12, metricsCount * 2 + xyzRatio * 8);
  } else if (metricRatio >= 0.25) {
    metricsScore = 72 + (metricRatio - 0.25) * 60 + xyzRatio * 6;
  } else if (metricRatio > 0) {
    metricsScore = 48 + (metricRatio / 0.25) * 20 + xyzRatio * 4;
  } else {
    metricsScore = Math.min(38, 18 + totalBullets * 2);
  }
  metricsScore = clampScore(metricsScore);

  // 3. Action Verb Dominance (20%)
  const verbIndex = totalBullets > 0 ? totalVerbPoints / totalBullets : 0;
  let verbsScore =
    totalBullets === 0
      ? 0
      : clampScore(
        verbIndex >= 0.8
          ? 88 + Math.min(12, (verbIndex - 0.8) * 60)
          : verbIndex >= 0.5
            ? 70 + (verbIndex - 0.5) * 60
            : 35 + verbIndex * 70,
      );
  verbsScore = clampScore(verbsScore);

  // 4. Technical Depth & Stack Alignment (15%)
  const declaredSkills = (content.skills || [])
    .map((s) => s.name?.trim())
    .filter(Boolean) as string[];

  let depthScore = 0;
  let corroboratedCount = 0;
  if (declaredSkills.length > 0) {
    const breadthScore = Math.min(40, declaredSkills.length * 5);
    const corpus = allBullets.join(' ').toLowerCase();
    const corroborated = declaredSkills.filter((s) => {
      const escaped = s.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const startB = /^\w/.test(s) ? '\\b' : '';
      const endB = /\w$/.test(s) ? '\\b' : '';
      return new RegExp(`${startB}${escaped}${endB}`, 'i').test(corpus);
    });
    corroboratedCount = corroborated.length;
    const alignmentRatio = corroborated.length / declaredSkills.length;
    depthScore = clampScore(breadthScore + Math.round(alignmentRatio * 60));
  }

  // 5. Brevity & Word Count (15%)
  const allText = [
    content.contact?.fullName || '',
    content.headline || '',
    content.summary || '',
    ...declaredSkills,
    ...allBullets,
  ].join(' ');
  const wordCount = countWords(allText);

  const denseQuantified = metricsCount >= 4 && totalBullets >= 6;
  const hasSomeMetrics = metricsCount >= 1 && totalBullets >= 3;
  let brevityScore =
    wordCount < 40
      ? 8
      : wordCount < 100
        ? denseQuantified
          ? 72
          : hasSomeMetrics
            ? 48
            : 28
        : 85;
  if (wordCount < 140) brevityScore -= denseQuantified ? 4 : hasSomeMetrics ? 10 : 22;
  else if (wordCount < 200) brevityScore -= denseQuantified ? 2 : 10;
  else if (wordCount > 1000) brevityScore -= 10;
  else if (wordCount > 1300) brevityScore -= 18;

  if (totalBullets > 0) {
    const outlierRatio = (shortBullets + longBullets) / totalBullets;
    brevityScore -= Math.round(outlierRatio * 15);
  } else {
    brevityScore = Math.min(brevityScore, 12);
  }
  brevityScore = clampScore(brevityScore);

  const evidenceDensity = computeClientEvidenceDensity({
    wordCount,
    totalBullets,
    metricsCount,
    declaredSkillCount: declaredSkills.length,
    corroboratedSkillCount: corroboratedCount,
    missingEssentialSections,
    hasEmail: Boolean(content.contact?.email),
    hasName: Boolean(content.contact?.fullName),
    meaningfulExperienceCount: countMeaningfulExperienceEntries(content.experience),
  });
  const evidenceCap = clampScore(4 + evidenceDensity * 96);

  if (evidenceDensity < 0.35) {
    const dimCap = clampScore(8 + evidenceDensity * 90);
    formattingScore = Math.min(formattingScore, dimCap + 12);
    metricsScore = Math.min(metricsScore, dimCap);
    verbsScore = Math.min(verbsScore, dimCap);
    depthScore = Math.min(depthScore, dimCap);
    brevityScore = Math.min(brevityScore, dimCap);
  }

  // Overall Calibrated 5-Dimension Score (evidence-capped)
  const score = Math.min(
    clampScore(
      formattingScore * 0.25 +
      metricsScore * 0.25 +
      verbsScore * 0.2 +
      depthScore * 0.15 +
      brevityScore * 0.15,
    ),
    evidenceCap,
  );

  return {
    score,
    formattingScore,
    metricsScore,
    verbsScore,
    depthScore,
    brevityScore,
    metricsCount,
    totalBullets,
    actionVerbsCount,
    xyzCount,
    wordCount,
  };
}
