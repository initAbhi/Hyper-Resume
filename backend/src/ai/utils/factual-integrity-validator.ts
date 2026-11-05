import type { ResumeContent } from '../../resumes/entities/resume.types.js';
import type {
  BulletDiff,
  ExperienceDiff,
  SectionChanges,
} from '../../resumes/entities/resume-adaptation.entity.js';

export interface RawAiAdaptationPayload {
  headline?: string;
  summary?: string;
  experienceBullets?: Array<{
    company?: string;
    title?: string;
    bullets: string[];
  }>;
  recommendedBenchmarkSkills?: string[];
  projects?: Array<{
    name?: string;
    description?: string;
    highlights?: string[];
  }>;
}

export interface FactualValidationResult {
  validatedContent: ResumeContent;
  sectionChanges: SectionChanges;
  unsupportedWarnings: string[];
  recommendedBenchmarkSkills: string[];
}

const METRIC_NUMERIC_REGEX = /\b(?:\$\d+[\d,]*(?:\.\d+)?(?:k|m|b)?|\d+(?:\.\d+)?%|\d+x|\d+[\d,]*(?:\+)?\s*(?:ms|second|min|hour|day|user|client|customer|request|event|qps|tps|rps|pb|tb|gb|mb|k|m|b)\b)/gi;

const SEMANTIC_CLAIMS_REGEX = /\b(?:doubled|tripled|quadrupled|halved|millions?\s+of|billions?\s+of|thousands?\s+of|10x|5x|2x|3x|cut\s+(?:latency|costs?|time|spend)\s+by|reduced\s+(?:latency|costs?|time|spend)\s+by|increased\s+(?:revenue|performance|throughput|traffic)\s+by)\b/gi;

const CONFIRMATION_PLACEHOLDER = '[Confirm measurable impact: e.g. latency reduction or scale]';

/**
 * Extracts normalized tokens of numbers and semantic claims from a text string.
 */
function extractMetricFingerprints(text: string): Set<string> {
  const set = new Set<string>();
  if (!text) return set;

  // Numeric tokens
  const numericMatches = text.match(METRIC_NUMERIC_REGEX);
  if (numericMatches) {
    for (const m of numericMatches) {
      set.add(m.trim().toLowerCase());
    }
  }

  // Any standalone digits sequence
  const digitsMatches = text.match(/\b\d+[\d,]*\b/g);
  if (digitsMatches) {
    for (const d of digitsMatches) {
      set.add(d.replace(/,/g, '').trim());
    }
  }

  // Semantic claim tokens
  const semanticMatches = text.match(SEMANTIC_CLAIMS_REGEX);
  if (semanticMatches) {
    for (const s of semanticMatches) {
      set.add(s.trim().toLowerCase());
    }
  }

  return set;
}

/**
 * Checks if candidateText introduces unsupported metrics or semantic claims not present in sourceText.
 * If unsupported metrics/claims are detected, neutral placeholder is injected and warnings returned.
 */
export function validateAndSanitizeMetrics(
  originalText: string,
  adaptedText: string,
  fieldLabel: string,
): { sanitizedText: string; metricFlag: boolean; warnings: string[] } {
  if (!adaptedText) {
    return { sanitizedText: originalText || '', metricFlag: false, warnings: [] };
  }

  const originalFingerprints = extractMetricFingerprints(originalText);
  const adaptedFingerprints = extractMetricFingerprints(adaptedText);

  const unsupportedTokens: string[] = [];
  for (const token of adaptedFingerprints) {
    if (!originalFingerprints.has(token)) {
      unsupportedTokens.push(token);
    }
  }

  if (unsupportedTokens.length === 0) {
    return { sanitizedText: adaptedText, metricFlag: false, warnings: [] };
  }

  // Sanitize by replacing unsupported metrics with placeholder
  let sanitized = adaptedText;
  for (const token of unsupportedTokens) {
    // Avoid escaping errors for special chars
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    sanitized = sanitized.replace(regex, CONFIRMATION_PLACEHOLDER);
  }

  // Collapse consecutive duplicate placeholders if any
  sanitized = sanitized.replace(
    new RegExp(`(?:${CONFIRMATION_PLACEHOLDER}\\s*){2,}`, 'g'),
    `${CONFIRMATION_PLACEHOLDER} `,
  ).trim();

  const warnings = [
    `Unverified metric or scale claim detected in ${fieldLabel} (${unsupportedTokens.slice(0, 3).join(', ')}). Replaced with confirmation placeholder.`,
  ];

  return {
    sanitizedText: sanitized,
    metricFlag: true,
    warnings,
  };
}

/**
 * Extracts proprietary benchmark entities to guard against sample contamination.
 */
function extractBenchmarkContaminationEntities(benchmark: ResumeContent, source: ResumeContent): Set<string> {
  const sourceText = JSON.stringify(source).toLowerCase();
  const contaminationEntities = new Set<string>();

  for (const exp of benchmark.experience || []) {
    if (exp.company && exp.company.length > 2 && !sourceText.includes(exp.company.toLowerCase())) {
      contaminationEntities.add(exp.company.toLowerCase());
    }
  }

  for (const proj of benchmark.projects || []) {
    if (proj.name && proj.name.length > 2 && !sourceText.includes(proj.name.toLowerCase())) {
      contaminationEntities.add(proj.name.toLowerCase());
    }
  }

  return contaminationEntities;
}

/**
 * Full Multi-Layer Factual Integrity Validation and Server-Side Skeleton Reconstruction.
 * Enforces Safeguards 2 and 6.
 */
export function validateAndReconstructAdaptation(
  source: ResumeContent,
  benchmark: ResumeContent,
  aiPayload: RawAiAdaptationPayload,
): FactualValidationResult {
  const unsupportedWarnings: string[] = [];
  const contaminationEntities = extractBenchmarkContaminationEntities(benchmark, source);

  // Helper to check contamination
  const checkContamination = (text: string, label: string): boolean => {
    const lower = text.toLowerCase();
    for (const entity of contaminationEntities) {
      if (lower.includes(entity)) {
        unsupportedWarnings.push(
          `Sample contamination quarantined in ${label}: detected benchmark entity "${entity}". Reverted to source content.`,
        );
        return true;
      }
    }
    return false;
  };

  // 1. Headline Validation
  let adaptedHeadline = source.headline;
  if (aiPayload.headline && !checkContamination(aiPayload.headline, 'headline')) {
    adaptedHeadline = aiPayload.headline.trim();
  }

  // 2. Summary Validation (Safeguard 2)
  let adaptedSummary = source.summary;
  let summaryMetricFlag = false;
  let summaryWarnings: string[] = [];

  if (aiPayload.summary) {
    if (checkContamination(aiPayload.summary, 'summary')) {
      adaptedSummary = source.summary;
    } else {
      const metricCheck = validateAndSanitizeMetrics(source.summary, aiPayload.summary, 'summary');
      adaptedSummary = metricCheck.sanitizedText;
      summaryMetricFlag = metricCheck.metricFlag;
      summaryWarnings = metricCheck.warnings;
      unsupportedWarnings.push(...metricCheck.warnings);
    }
  }

  // 3. Experience Bullets Validation & Server-Side Skeleton Reconstruction
  const experienceDiffs: ExperienceDiff[] = [];
  const validatedExperience = (source.experience || []).map((origExp, expIdx) => {
    // Immutable locked fields from source resume
    const lockedExp = {
      id: origExp.id,
      company: origExp.company,
      title: origExp.title,
      location: origExp.location,
      startDate: origExp.startDate,
      endDate: origExp.endDate,
      current: origExp.current,
      bullets: [] as string[],
    };

    const aiExpBullets = aiPayload.experienceBullets?.[expIdx]?.bullets || [];
    const bulletDiffs: BulletDiff[] = [];

    origExp.bullets.forEach((origBullet, bIdx) => {
      const candidateAiBullet = aiExpBullets[bIdx];

      if (!candidateAiBullet) {
        // No AI rewrite provided: retain original bullet
        lockedExp.bullets.push(origBullet);
        bulletDiffs.push({
          original: origBullet,
          adapted: origBullet,
          metricFlag: false,
        });
        return;
      }

      // Check contamination against benchmark entities
      if (checkContamination(candidateAiBullet, `experience [${origExp.company}] bullet ${bIdx + 1}`)) {
        lockedExp.bullets.push(origBullet);
        bulletDiffs.push({
          original: origBullet,
          adapted: origBullet,
          metricFlag: false,
          warnings: ['Benchmark contamination prevented. Original bullet preserved.'],
        });
        return;
      }

      // Check metrics & semantic claims (Safeguard 2)
      const metricCheck = validateAndSanitizeMetrics(
        origBullet,
        candidateAiBullet,
        `experience [${origExp.company}] bullet ${bIdx + 1}`,
      );

      lockedExp.bullets.push(metricCheck.sanitizedText);
      bulletDiffs.push({
        original: origBullet,
        adapted: metricCheck.sanitizedText,
        metricFlag: metricCheck.metricFlag,
        warnings: metricCheck.warnings.length > 0 ? metricCheck.warnings : undefined,
      });

      unsupportedWarnings.push(...metricCheck.warnings);
    });

    experienceDiffs.push({
      company: origExp.company,
      title: origExp.title,
      bullets: bulletDiffs,
    });

    return lockedExp;
  });

  // 4. Skills Separation
  // Recommended benchmark skills are kept completely separate from ResumeContent.skills
  const existingSkillNames = new Set((source.skills || []).map((s) => s.name.toLowerCase()));
  const recommendedBenchmarkSkills = (aiPayload.recommendedBenchmarkSkills || [])
    .filter((skill) => typeof skill === 'string' && skill.trim().length > 0)
    .filter((skill) => !existingSkillNames.has(skill.trim().toLowerCase()))
    .slice(0, 15);

  // 5. Projects Validation (Safeguard 2 & Safeguard 6)
  const projectDiffs: SectionChanges['projects'] = [];
  const validatedProjects = (source.projects || []).map((origProj, projIdx) => {
    const aiProj = aiPayload.projects?.[projIdx];

    const lockedProj = {
      id: origProj.id,
      name: origProj.name,
      url: origProj.url,
      description: origProj.description,
      highlights: [] as string[],
    };

    let adaptedDesc = origProj.description;
    if (aiProj?.description && !checkContamination(aiProj.description, `project [${origProj.name}] description`)) {
      const metricCheck = validateAndSanitizeMetrics(
        origProj.description,
        aiProj.description,
        `project [${origProj.name}] description`,
      );
      adaptedDesc = metricCheck.sanitizedText;
      unsupportedWarnings.push(...metricCheck.warnings);
    }
    lockedProj.description = adaptedDesc;

    const highlightDiffs: BulletDiff[] = [];
    const aiHighlights = aiProj?.highlights || [];

    origProj.highlights.forEach((origHighlight, hIdx) => {
      const candidateAiHighlight = aiHighlights[hIdx];

      if (!candidateAiHighlight) {
        lockedProj.highlights.push(origHighlight);
        highlightDiffs.push({
          original: origHighlight,
          adapted: origHighlight,
          metricFlag: false,
        });
        return;
      }

      if (checkContamination(candidateAiHighlight, `project [${origProj.name}] highlight ${hIdx + 1}`)) {
        lockedProj.highlights.push(origHighlight);
        highlightDiffs.push({
          original: origHighlight,
          adapted: origHighlight,
          metricFlag: false,
          warnings: ['Benchmark contamination prevented. Original highlight preserved.'],
        });
        return;
      }

      const metricCheck = validateAndSanitizeMetrics(
        origHighlight,
        candidateAiHighlight,
        `project [${origProj.name}] highlight ${hIdx + 1}`,
      );

      lockedProj.highlights.push(metricCheck.sanitizedText);
      highlightDiffs.push({
        original: origHighlight,
        adapted: metricCheck.sanitizedText,
        metricFlag: metricCheck.metricFlag,
        warnings: metricCheck.warnings.length > 0 ? metricCheck.warnings : undefined,
      });

      unsupportedWarnings.push(...metricCheck.warnings);
    });

    projectDiffs.push({
      name: origProj.name,
      description: {
        original: origProj.description,
        adapted: adaptedDesc,
      },
      highlights: highlightDiffs,
    });

    return lockedProj;
  });

  // 6. Complete Reconstructed ResumeContent
  const validatedContent: ResumeContent = {
    // 100% strictly preserved contact, education, certifications
    contact: { ...source.contact },
    education: source.education ? source.education.map((edu) => ({ ...edu })) : [],
    certifications: source.certifications ? source.certifications.map((c) => ({ ...c })) : [],
    // Original skills preserved until explicit user acceptance
    skills: source.skills ? source.skills.map((s) => ({ ...s })) : [],
    // Validated adapted sections
    headline: adaptedHeadline,
    summary: adaptedSummary,
    experience: validatedExperience,
    projects: validatedProjects,
  };

  const sectionChanges: SectionChanges = {
    headline: {
      original: source.headline,
      adapted: adaptedHeadline,
    },
    summary: {
      original: source.summary,
      adapted: adaptedSummary,
      metricFlag: summaryMetricFlag,
      warnings: summaryWarnings.length > 0 ? summaryWarnings : undefined,
    },
    experience: experienceDiffs,
    skills: {
      original: source.skills || [],
      recommendedBenchmarkSkills,
    },
    projects: projectDiffs,
  };

  return {
    validatedContent,
    sectionChanges,
    unsupportedWarnings,
    recommendedBenchmarkSkills,
  };
}

