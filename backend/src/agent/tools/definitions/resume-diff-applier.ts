import type { ResumeContent, ResumeLayoutSettings } from '../../../resumes/entities/resume.types.js';

export interface AppliedResumeDiffResult {
  content: ResumeContent;
  templateKey?: string;
}

export function normalizeFieldPathMatcher(acceptedFieldPaths?: string[]) {
  const acceptedSet =
    Array.isArray(acceptedFieldPaths) && acceptedFieldPaths.length > 0
      ? new Set(acceptedFieldPaths)
      : null;

  return (fieldPath: string): boolean => {
    if (!acceptedSet) return true;
    if (acceptedSet.has(fieldPath)) return true;
    const normalizedDot = fieldPath.replace(/\[(\d+)\]/g, '.$1');
    const normalizedBracket = normalizedDot.replace(/\.(\d+)/g, '[$1]');
    return acceptedSet.has(normalizedDot) || acceptedSet.has(normalizedBracket);
  };
}

/**
 * Deterministically applies structured `sectionDiffs` onto a cloned ResumeContent (and optional templateKey).
 * Used both for pre-approval ATS score simulation in ProposeEditsTool and authoritative commit on approval.
 */
export function applySectionDiffsToResumeContent(
  sourceContent: ResumeContent,
  sectionDiffs: Record<string, any> | undefined,
  options?: {
    acceptedFieldPaths?: string[];
    currentTemplateKey?: string;
  },
): AppliedResumeDiffResult {
  const cloned = JSON.parse(JSON.stringify(sourceContent || {})) as ResumeContent;
  let nextTemplateKey = options?.currentTemplateKey;

  if (!sectionDiffs || typeof sectionDiffs !== 'object') {
    return { content: cloned, templateKey: nextTemplateKey };
  }

  const shouldApply = normalizeFieldPathMatcher(options?.acceptedFieldPaths);

  // 1. Headline
  if (typeof sectionDiffs.headline?.proposed === 'string' && shouldApply('headline')) {
    cloned.headline = sectionDiffs.headline.proposed;
  }

  // 2. Summary
  if (typeof sectionDiffs.summary?.proposed === 'string' && shouldApply('summary')) {
    cloned.summary = sectionDiffs.summary.proposed;
  }

  // 3. Contact (partial safe merge)
  if (
    sectionDiffs.contact?.proposed &&
    typeof sectionDiffs.contact.proposed === 'object' &&
    shouldApply('contact')
  ) {
    cloned.contact = {
      ...(cloned.contact || { fullName: '', email: '' }),
      ...sectionDiffs.contact.proposed,
    };
  }

  // 4. Experience bullets (in-place edits + optional added bullets)
  if (Array.isArray(sectionDiffs.experience) && Array.isArray(cloned.experience)) {
    for (let i = 0; i < sectionDiffs.experience.length; i++) {
      const expDiff = sectionDiffs.experience[i];
      const expIdx =
        typeof expDiff?.experienceIndex === 'number' ? expDiff.experienceIndex : i;
      const targetExp = cloned.experience[expIdx];
      if (!targetExp) continue;
      if (!Array.isArray(targetExp.bullets)) targetExp.bullets = [];

      if (Array.isArray(expDiff?.bulletDiffs)) {
        for (const bDiff of expDiff.bulletDiffs) {
          const fieldPath = `experience.${expIdx}.bullets.${bDiff?.bulletIndex}`;
          if (
            typeof bDiff?.bulletIndex === 'number' &&
            typeof bDiff?.proposed === 'string' &&
            bDiff.bulletIndex >= 0 &&
            bDiff.bulletIndex < targetExp.bullets.length &&
            shouldApply(fieldPath)
          ) {
            targetExp.bullets[bDiff.bulletIndex] = bDiff.proposed;
          }
        }
      }

      if (
        Array.isArray(expDiff?.addedBullets) &&
        expDiff.addedBullets.length > 0 &&
        shouldApply(`experience.${expIdx}.addedBullets`)
      ) {
        for (const added of expDiff.addedBullets) {
          if (typeof added === 'string' && added.trim()) {
            targetExp.bullets.push(added.trim());
          }
        }
      }
    }
  }

  // 5. Projects (supports full proposed array OR per-project description & highlight diffs)
  if (sectionDiffs.projects) {
    if (Array.isArray(sectionDiffs.projects.proposed) && shouldApply('projects')) {
      cloned.projects = sectionDiffs.projects.proposed;
    } else if (Array.isArray(sectionDiffs.projects) && Array.isArray(cloned.projects)) {
      for (let i = 0; i < sectionDiffs.projects.length; i++) {
        const projDiff = sectionDiffs.projects[i];
        const projIdx =
          typeof projDiff?.projectIndex === 'number' ? projDiff.projectIndex : i;
        const targetProj = cloned.projects[projIdx];
        if (!targetProj) continue;

        if (
          typeof projDiff?.description?.proposed === 'string' &&
          (shouldApply(`projects.${projIdx}.description`) || shouldApply('projects'))
        ) {
          targetProj.description = projDiff.description.proposed;
        }

        if (!Array.isArray(targetProj.highlights)) targetProj.highlights = [];
        if (Array.isArray(projDiff?.highlightDiffs)) {
          for (const hDiff of projDiff.highlightDiffs) {
            const hPath = `projects.${projIdx}.highlights.${hDiff?.highlightIndex}`;
            if (
              typeof hDiff?.highlightIndex === 'number' &&
              typeof hDiff?.proposed === 'string' &&
              hDiff.highlightIndex >= 0 &&
              hDiff.highlightIndex < targetProj.highlights.length &&
              (shouldApply(hPath) || shouldApply('projects'))
            ) {
              targetProj.highlights[hDiff.highlightIndex] = hDiff.proposed;
            }
          }
        }

        if (
          Array.isArray(projDiff?.addedHighlights) &&
          projDiff.addedHighlights.length > 0 &&
          (shouldApply(`projects.${projIdx}.addedHighlights`) || shouldApply('projects'))
        ) {
          for (const h of projDiff.addedHighlights) {
            if (typeof h === 'string' && h.trim()) {
              targetProj.highlights.push(h.trim());
            }
          }
        }
      }
    }
  }

  // 6. Skills (full replacement list: supports additions, removals, recategorizations)
  if (Array.isArray(sectionDiffs.skills?.proposed) && shouldApply('skills')) {
    cloned.skills = sectionDiffs.skills.proposed
      .filter((s: any) => s && typeof s.name === 'string' && s.name.trim())
      .map((s: any) => ({
        name: s.name.trim(),
        category: typeof s.category === 'string' && s.category.trim() ? s.category.trim() : 'Other',
      }));
  }

  // 7. Education
  if (Array.isArray(sectionDiffs.education?.proposed) && shouldApply('education')) {
    cloned.education = sectionDiffs.education.proposed;
  }

  // 8. Certifications
  if (Array.isArray(sectionDiffs.certifications?.proposed) && shouldApply('certifications')) {
    cloned.certifications = sectionDiffs.certifications.proposed;
  }

  // 9. Custom Sections
  if (Array.isArray(sectionDiffs.customSections?.proposed) && shouldApply('customSections')) {
    cloned.customSections = sectionDiffs.customSections.proposed;
  }

  // 10. Layout settings (accentColor, fontFamily, pageMode, density sliders, sectionOrder)
  if (
    sectionDiffs.layout?.proposed &&
    typeof sectionDiffs.layout.proposed === 'object' &&
    shouldApply('layout')
  ) {
    cloned.layout = {
      ...(cloned.layout || {}),
      ...(sectionDiffs.layout.proposed as ResumeLayoutSettings),
    };
  }

  // 11. Template Key
  if (
    typeof sectionDiffs.templateKey?.proposed === 'string' &&
    sectionDiffs.templateKey.proposed.trim() &&
    shouldApply('templateKey')
  ) {
    nextTemplateKey = sectionDiffs.templateKey.proposed.trim();
  }

  return { content: cloned, templateKey: nextTemplateKey };
}

