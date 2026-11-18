'use client';

import React, { useId } from 'react';
import {
  AlertTriangle,
  Check,
  Eye,
  FileDiff,
  Quote,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { AgentApprovalProposal } from '@/lib/agent-client';

export interface MetricConfirmationItem {
  id: string;
  fieldPath: string;
  sectionLabel: string;
  addedMetrics: string[];
  originalEvidenceQuote?: string;
  confirmationPrompt: string;
}

export interface ProposalSummaryStats {
  affectedSections: number;
  totalChanges: number;
  metricConfirmations: MetricConfirmationItem[];
}

export function analyzeProposalChanges(
  proposal: AgentApprovalProposal,
): ProposalSummaryStats {
  const {
    headline,
    summary,
    contact,
    experience,
    projects,
    skills,
    education,
    certifications,
    customSections,
    templateKey,
    layout,
  } = proposal.sectionDiffs || {};
  let affectedSections = 0;
  let totalChanges = 0;
  const metricConfirmations: MetricConfirmationItem[] = [];

  if (
    headline &&
    typeof headline.proposed === 'string' &&
    headline.proposed.trim() !== (headline.original || '').trim()
  ) {
    affectedSections += 1;
    totalChanges += 1;
  }

  if (
    summary &&
    typeof summary.proposed === 'string' &&
    summary.proposed.trim() !== (summary.original || '').trim()
  ) {
    affectedSections += 1;
    totalChanges += 1;
  }

  if (contact?.changedFields && contact.changedFields.length > 0) {
    affectedSections += 1;
    totalChanges += contact.changedFields.length;
  }

  if (skills && Array.isArray(skills.proposed)) {
    const origSet = new Set(
      (skills.original || []).map((s) => (s?.name || '').trim().toLowerCase()),
    );
    const propSet = new Set(
      skills.proposed.map((s) => (s?.name || '').trim().toLowerCase()),
    );
    const addedCount = skills.proposed.filter(
      (s) => s?.name && !origSet.has(s.name.trim().toLowerCase()),
    ).length;
    const removedCount = (skills.original || []).filter(
      (s) => s?.name && !propSet.has(s.name.trim().toLowerCase()),
    ).length;
    if (addedCount > 0 || removedCount > 0 || skills.proposed.length !== (skills.original || []).length) {
      affectedSections += 1;
      totalChanges += Math.max(1, addedCount + removedCount);
    }
  }

  if (Array.isArray(projects) && projects.length > 0) {
    let projChanges = 0;
    for (const p of projects) {
      if (p.description && p.description.proposed.trim() !== (p.description.original || '').trim()) {
        projChanges += 1;
      }
      projChanges += (p.highlightDiffs || []).length + (p.addedHighlights || []).length;
    }
    if (projChanges > 0) {
      affectedSections += 1;
      totalChanges += projChanges;
    }
  }

  if (education?.proposed) {
    affectedSections += 1;
    totalChanges += 1;
  }
  if (certifications?.proposed) {
    affectedSections += 1;
    totalChanges += 1;
  }
  if (customSections?.proposed) {
    affectedSections += 1;
    totalChanges += 1;
  }
  if (templateKey?.proposed && templateKey.proposed !== templateKey.original) {
    affectedSections += 1;
    totalChanges += 1;
  }
  if (layout?.changedFields && layout.changedFields.length > 0) {
    affectedSections += 1;
    totalChanges += layout.changedFields.length;
  }

  if (Array.isArray(experience)) {
    let expHasChange = false;
    experience.forEach((exp, expIdx) => {
      if (!Array.isArray(exp?.bulletDiffs)) return;
      exp.bulletDiffs.forEach((bDiff) => {
        const orig = (bDiff.original || '').trim();
        const prop = (bDiff.proposed || '').trim();
        const provenance = bDiff.evidenceProvenance;
        const addedMetrics = Array.isArray(provenance?.addedMetrics)
          ? provenance.addedMetrics.filter(Boolean)
          : [];
        const needsConfirmation = Boolean(
          provenance?.candidateConfirmationRequired || addedMetrics.length > 0,
        );

        if (prop !== orig) {
          expHasChange = true;
          totalChanges += 1;
        }

        if (needsConfirmation) {
          const fieldPath = `experience[${expIdx}].bullets[${bDiff.bulletIndex}]`;
          metricConfirmations.push({
            id: `${proposal.executionId}:${fieldPath}`,
            fieldPath,
            sectionLabel: `${exp.title || 'Role'} at ${exp.company || 'Company'}`,
            addedMetrics,
            originalEvidenceQuote: provenance?.originalEvidenceQuote,
            confirmationPrompt:
              provenance?.confirmationPrompt ||
              (addedMetrics.length > 0
                ? `Confirm that you achieved: ${addedMetrics.join(', ')}`
                : 'Confirm that this proposed claim accurately reflects your experience.'),
          });
        }
      });
    });
    if (expHasChange) {
      affectedSections += 1;
    }
  }

  return {
    affectedSections,
    totalChanges,
    metricConfirmations,
  };
}

export interface AgentDiffCardProps {
  proposal: AgentApprovalProposal;
  confirmedMetricIds: Record<string, boolean>;
  onToggleMetricConfirm: (metricId: string, checked: boolean) => void;
  selectedFieldPaths?: Record<string, boolean>;
  onToggleFieldSelect?: (fieldPath: string, checked: boolean) => void;
  onFocusField?: (fieldPath: string) => void;
  focusedFieldPath?: string | null;
  onOpenApprovalModal: () => void;
  onReject: () => void;
  isSubmitting?: boolean;
}

export function AgentDiffCard({
  proposal,
  confirmedMetricIds,
  onToggleMetricConfirm,
  selectedFieldPaths,
  onToggleFieldSelect,
  onFocusField,
  focusedFieldPath,
  onOpenApprovalModal,
  onReject,
  isSubmitting = false,
}: AgentDiffCardProps) {
  const idPrefix = useId();
  const stats = analyzeProposalChanges(proposal);
  const {
    headline,
    summary,
    contact,
    experience,
    projects,
    skills,
    education,
    certifications,
    customSections,
    templateKey,
    layout,
  } = proposal.sectionDiffs || {};
  const isFieldSelected = (path: string) =>
    !selectedFieldPaths || selectedFieldPaths[path] !== false;

  const addedSkillsList = React.useMemo(() => {
    if (!skills || !Array.isArray(skills.proposed)) return [];
    if (Array.isArray(skills.addedSkills) && skills.addedSkills.length > 0) {
      return skills.addedSkills;
    }
    const origSet = new Set(
      (skills.original || []).map((s) => (s?.name || '').trim().toLowerCase()),
    );
    return skills.proposed
      .filter((s) => s?.name && !origSet.has(s.name.trim().toLowerCase()))
      .map((s) => s.name);
  }, [skills]);
  const removedSkillsList = React.useMemo(() => {
    if (!skills || !Array.isArray(skills.proposed)) return [];
    if (Array.isArray(skills.removedSkills) && skills.removedSkills.length > 0) {
      return skills.removedSkills;
    }
    const propSet = new Set(
      skills.proposed.map((s) => (s?.name || '').trim().toLowerCase()),
    );
    return (skills.original || [])
      .filter((s) => s?.name && !propSet.has(s.name.trim().toLowerCase()))
      .map((s) => s.name);
  }, [skills]);
  const hasSkillsChange = addedSkillsList.length > 0 || removedSkillsList.length > 0;
  const hasAtsProjection =
    typeof proposal.beforeAtsScore === 'number' &&
    typeof proposal.projectedAtsScore === 'number';
  const atsDelta = hasAtsProjection
    ? (proposal.projectedAtsScore as number) - (proposal.beforeAtsScore as number)
    : 0;

  const hasHeadlineChange = Boolean(
    headline &&
    typeof headline.proposed === 'string' &&
    headline.proposed.trim() !== (headline.original || '').trim(),
  );
  const hasSummaryChange = Boolean(
    summary &&
    typeof summary.proposed === 'string' &&
    summary.proposed.trim() !== (summary.original || '').trim(),
  );

  const allRequiredMetricsConfirmed = stats.metricConfirmations.every(
    (item) => Boolean(confirmedMetricIds[item.id]),
  );

  const unconfirmedCount = stats.metricConfirmations.filter(
    (item) => !confirmedMetricIds[item.id],
  ).length;

  return (
    <section
      data-testid="agent-diff-card"
      aria-label="Proposed resume changes"
      className="rounded-xl border border-blue-200/90 dark:border-blue-900/70 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-3.5 py-2.5 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileDiff
            className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {proposal.changeSummary || 'Proposed Resume Improvements'}
            </h3>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
              {stats.totalChanges} change{stats.totalChanges === 1 ? '' : 's'} across{' '}
              {stats.affectedSections} section{stats.affectedSections === 1 ? '' : 's'} · Target v
              {proposal.expectedResumeVersion}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasAtsProjection && (
            <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              ATS {proposal.beforeAtsScore} → {proposal.projectedAtsScore}
              {atsDelta > 0 ? ` (+${atsDelta})` : ''}
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950/70 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Pending Review
          </span>
        </div>
      </div>

      {/* Diff Body */}
      <div className="p-3.5 space-y-3 max-h-[360px] overflow-y-auto">
        {hasHeadlineChange && headline && (
          <div
            data-diff-section="headline"
            className={`rounded-lg border p-2.5 space-y-1.5 transition-colors ${focusedFieldPath === 'headline'
                ? 'border-blue-400 bg-blue-50/30 dark:bg-blue-950/20'
                : 'border-zinc-200/80 dark:border-zinc-800'
              }`}
          >
            <div className="flex items-center justify-between gap-2">
              <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 cursor-pointer">
                {onToggleFieldSelect && (
                  <input
                    type="checkbox"
                    checked={isFieldSelected('headline')}
                    onChange={(e) => onToggleFieldSelect('headline', e.target.checked)}
                    aria-label="Include headline change"
                    className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                )}
                Headline
              </label>
              {onFocusField && (
                <button
                  type="button"
                  onClick={() => onFocusField('headline')}
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <Eye className="w-3 h-3" aria-hidden="true" />
                  Locate in canvas
                </button>
              )}
            </div>
            {headline.original && (
              <div className="rounded bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/60 px-2 py-1 text-xs text-rose-900 dark:text-rose-200">
                <span className="inline-block text-[9.5px] font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300 mr-1.5">
                  Original
                </span>
                <del className="decoration-rose-500/70">{headline.original}</del>
              </div>
            )}
            <div className="rounded bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 px-2 py-1 text-xs text-emerald-950 dark:text-emerald-200">
              <span className="inline-block text-[9.5px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 mr-1.5">
                Proposed
              </span>
              <ins className="no-underline font-medium">{headline.proposed}</ins>
            </div>
          </div>
        )}

        {hasSummaryChange && summary && (
          <div
            data-diff-section="summary"
            className={`rounded-lg border p-2.5 space-y-1.5 transition-colors ${focusedFieldPath === 'summary'
                ? 'border-blue-400 bg-blue-50/30 dark:bg-blue-950/20'
                : 'border-zinc-200/80 dark:border-zinc-800'
              }`}
          >
            <div className="flex items-center justify-between gap-2">
              <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 cursor-pointer">
                {onToggleFieldSelect && (
                  <input
                    type="checkbox"
                    checked={isFieldSelected('summary')}
                    onChange={(e) => onToggleFieldSelect('summary', e.target.checked)}
                    aria-label="Include summary change"
                    className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                )}
                Summary
              </label>
              {onFocusField && (
                <button
                  type="button"
                  onClick={() => onFocusField('summary')}
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <Eye className="w-3 h-3" aria-hidden="true" />
                  Locate in canvas
                </button>
              )}
            </div>
            {summary.original && (
              <div className="rounded bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/60 px-2 py-1.5 text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                <span className="inline-block text-[9.5px] font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300 mr-1.5">
                  Original
                </span>
                <del className="decoration-rose-500/70">{summary.original}</del>
              </div>
            )}
            <div className="rounded bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 px-2 py-1.5 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
              <span className="inline-block text-[9.5px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 mr-1.5">
                Proposed
              </span>
              <ins className="no-underline font-medium">{summary.proposed}</ins>
            </div>
          </div>
        )}

        {Array.isArray(experience) &&
          experience.map((exp, expIdx) => {
            const changedBullets = (exp.bulletDiffs || []).filter((b) => {
              const changed = (b.proposed || '').trim() !== (b.original || '').trim();
              const needsVerify = Boolean(
                b.evidenceProvenance?.candidateConfirmationRequired ||
                (b.evidenceProvenance?.addedMetrics?.length ?? 0) > 0,
              );
              return changed || needsVerify;
            });

            if (changedBullets.length === 0) return null;

            return (
              <div
                key={`${exp.company}-${exp.title}-${expIdx}`}
                data-diff-section="experience"
                className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 p-2.5 space-y-2.5"
              >
                <div className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                  {exp.title || 'Role'}{' '}
                  <span className="font-normal text-zinc-500 dark:text-zinc-400">
                    at {exp.company || 'Company'}
                  </span>
                </div>

                {changedBullets.map((bDiff) => {
                  const fieldPath = `experience[${expIdx}].bullets[${bDiff.bulletIndex}]`;
                  const metricId = `${proposal.executionId}:${fieldPath}`;
                  const provenance = bDiff.evidenceProvenance;
                  const addedMetrics = Array.isArray(provenance?.addedMetrics)
                    ? provenance.addedMetrics.filter(Boolean)
                    : [];
                  const needsConfirmation = Boolean(
                    provenance?.candidateConfirmationRequired || addedMetrics.length > 0,
                  );
                  const checkboxId = `${idPrefix}-metric-${expIdx}-${bDiff.bulletIndex}`;
                  const isChecked = Boolean(confirmedMetricIds[metricId]);

                  return (
                    <div
                      key={fieldPath}
                      data-diff-bullet={fieldPath}
                      className={`rounded-md border p-2 space-y-1.5 ${focusedFieldPath === fieldPath
                          ? 'border-blue-400 bg-blue-50/30 dark:bg-blue-950/20'
                          : 'border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/30'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <label className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 cursor-pointer">
                          {onToggleFieldSelect && (
                            <input
                              type="checkbox"
                              checked={isFieldSelected(`experience.${expIdx}.bullets.${bDiff.bulletIndex}`)}
                              onChange={(e) =>
                                onToggleFieldSelect(
                                  `experience.${expIdx}.bullets.${bDiff.bulletIndex}`,
                                  e.target.checked,
                                )
                              }
                              aria-label={`Include bullet ${bDiff.bulletIndex + 1} change`}
                              className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          )}
                          Bullet #{bDiff.bulletIndex + 1}
                        </label>
                        {onFocusField && (
                          <button
                            type="button"
                            onClick={() => onFocusField(fieldPath)}
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            <Eye className="w-3 h-3" aria-hidden="true" />
                            Locate in canvas
                          </button>
                        )}
                      </div>

                      {bDiff.original && (
                        <div className="rounded bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/60 px-2 py-1 text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                          <span className="inline-block text-[9.5px] font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300 mr-1.5">
                            Original
                          </span>
                          <del className="decoration-rose-500/70">{bDiff.original}</del>
                        </div>
                      )}

                      {bDiff.proposed && (
                        <div className="rounded bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 px-2 py-1 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                          <span className="inline-block text-[9.5px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 mr-1.5">
                            Proposed
                          </span>
                          <ins className="no-underline font-medium">{bDiff.proposed}</ins>
                        </div>
                      )}

                      {/* Evidence Provenance */}
                      {provenance?.originalEvidenceQuote && (
                        <p className="flex items-start gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5">
                          <Quote className="w-3 h-3 mt-0.5 shrink-0" aria-hidden="true" />
                          <span>
                            <strong className="font-medium text-zinc-600 dark:text-zinc-300">
                              Source evidence:
                            </strong>{' '}
                            “{provenance.originalEvidenceQuote}”
                          </span>
                        </p>
                      )}

                      {/* Unverified Metric Confirmation */}
                      {needsConfirmation && (
                        <div
                          data-testid="metric-verification-box"
                          className="rounded-md border border-amber-200 dark:border-amber-800/80 bg-amber-50/80 dark:bg-amber-950/30 p-2 space-y-1.5"
                        >
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>Unverified claim — candidate confirmation required</span>
                          </div>
                          {addedMetrics.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {addedMetrics.map((metric) => (
                                <span
                                  key={metric}
                                  className="inline-flex items-center rounded bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 dark:text-amber-200 border border-amber-300/70 dark:border-amber-700"
                                >
                                  {metric}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-start gap-2 pt-0.5">
                            <input
                              id={checkboxId}
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => onToggleMetricConfirm(metricId, e.target.checked)}
                              className="mt-0.5 h-4 w-4 rounded border-amber-400 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer shrink-0"
                            />
                            <label
                              htmlFor={checkboxId}
                              className="text-[11px] text-amber-950 dark:text-amber-100 leading-snug cursor-pointer select-none"
                            >
                              {provenance?.confirmationPrompt ||
                                `I confirm that I achieved ${addedMetrics.join(', ') || 'this metric'}.`}
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

        {hasSkillsChange && (
          <div
            data-diff-section="skills"
            className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 p-2.5 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 cursor-pointer">
                {onToggleFieldSelect && (
                  <input
                    type="checkbox"
                    checked={isFieldSelected('skills')}
                    onChange={(e) => onToggleFieldSelect('skills', e.target.checked)}
                    aria-label="Include skills changes"
                    className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                )}
                Skills (
                {[
                  addedSkillsList.length > 0 ? `+${addedSkillsList.length} added` : '',
                  removedSkillsList.length > 0 ? `-${removedSkillsList.length} removed` : '',
                ]
                  .filter(Boolean)
                  .join(', ')}
                )
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {addedSkillsList.map((skillName) => (
                <span
                  key={`add-${skillName}`}
                  className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200"
                >
                  + {skillName}
                </span>
              ))}
              {removedSkillsList.map((skillName) => (
                <span
                  key={`rm-${skillName}`}
                  className="inline-flex items-center rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-2 py-0.5 text-[11px] font-medium text-rose-800 dark:text-rose-200 line-through"
                >
                  - {skillName}
                </span>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(projects) && projects.length > 0 && (
          <div
            data-diff-section="projects"
            className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 p-2.5 space-y-2"
          >
            <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 cursor-pointer">
              {onToggleFieldSelect && (
                <input
                  type="checkbox"
                  checked={isFieldSelected('projects')}
                  onChange={(e) => onToggleFieldSelect('projects', e.target.checked)}
                  aria-label="Include project changes"
                  className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              )}
              Projects ({projects.length} updated)
            </label>
            {projects.map((proj) => (
              <div key={proj.projectIndex} className="space-y-1.5 pl-1 border-l-2 border-blue-200 dark:border-blue-800">
                <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">{proj.name}</p>
                {proj.description && (
                  <div className="space-y-1">
                    {proj.description.original && (
                      <div className="rounded bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200/70 px-2 py-1 text-xs text-rose-900 dark:text-rose-200">
                        <del>{proj.description.original}</del>
                      </div>
                    )}
                    <div className="rounded bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/80 px-2 py-1 text-xs text-emerald-950 dark:text-emerald-200">
                      <ins className="no-underline font-medium">{proj.description.proposed}</ins>
                    </div>
                  </div>
                )}
                {(proj.highlightDiffs || []).map((h) => (
                  <div key={h.highlightIndex} className="space-y-1">
                    <div className="rounded bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200/70 px-2 py-1 text-xs text-rose-900 dark:text-rose-200">
                      <del>{h.original}</del>
                    </div>
                    <div className="rounded bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/80 px-2 py-1 text-xs text-emerald-950 dark:text-emerald-200">
                      <ins className="no-underline font-medium">{h.proposed}</ins>
                    </div>
                  </div>
                ))}
                {(proj.addedHighlights || []).map((added, aIdx) => (
                  <div
                    key={`add-h-${aIdx}`}
                    className="rounded bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/80 px-2 py-1 text-xs text-emerald-950 dark:text-emerald-200"
                  >
                    <span className="text-[9.5px] font-bold uppercase text-emerald-700 mr-1.5">Added</span>
                    <ins className="no-underline font-medium">{added}</ins>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {contact?.changedFields && contact.changedFields.length > 0 && (
          <div
            data-diff-section="contact"
            className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 p-2.5 space-y-1.5"
          >
            <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400 cursor-pointer">
              {onToggleFieldSelect && (
                <input
                  type="checkbox"
                  checked={isFieldSelected('contact')}
                  onChange={(e) => onToggleFieldSelect('contact', e.target.checked)}
                  aria-label="Include contact changes"
                  className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              )}
              Contact ({contact.changedFields.join(', ')})
            </label>
            <div className="space-y-1 text-xs">
              {contact.changedFields.map((field) => (
                <div key={field} className="rounded bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/80 px-2 py-1 text-emerald-950 dark:text-emerald-200">
                  <span className="font-semibold capitalize">{field}:</span> {String(contact.proposed[field] || '')}
                </div>
              ))}
            </div>
          </div>
        )}

        {(templateKey?.proposed || (layout?.changedFields && layout.changedFields.length > 0)) && (
          <div
            data-diff-section="design"
            className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 p-2.5 space-y-1.5 text-xs"
          >
            {templateKey?.proposed && (
              <label className="flex items-center gap-2 cursor-pointer text-zinc-800 dark:text-zinc-200">
                {onToggleFieldSelect && (
                  <input
                    type="checkbox"
                    checked={isFieldSelected('templateKey')}
                    onChange={(e) => onToggleFieldSelect('templateKey', e.target.checked)}
                    aria-label="Include template switch"
                    className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 cursor-pointer"
                  />
                )}
                <span>
                  Switch Template: <del className="text-rose-700 dark:text-rose-300">{templateKey.original}</del> →{' '}
                  <strong className="text-emerald-700 dark:text-emerald-300">{templateKey.proposed}</strong>
                </span>
              </label>
            )}
            {layout?.changedFields && layout.changedFields.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer text-zinc-800 dark:text-zinc-200">
                {onToggleFieldSelect && (
                  <input
                    type="checkbox"
                    checked={isFieldSelected('layout')}
                    onChange={(e) => onToggleFieldSelect('layout', e.target.checked)}
                    aria-label="Include layout changes"
                    className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 cursor-pointer"
                  />
                )}
                <span>
                  Update Layout: <strong className="text-emerald-700 dark:text-emerald-300">{layout.changedFields.join(', ')}</strong>
                </span>
              </label>
            )}
          </div>
        )}

        {(certifications?.proposed || education?.proposed || customSections?.proposed) && (
          <div className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 p-2.5 space-y-1.5 text-xs text-zinc-800 dark:text-zinc-200">
            {certifications?.proposed && (
              <label className="flex items-center gap-2 cursor-pointer">
                {onToggleFieldSelect && (
                  <input
                    type="checkbox"
                    checked={isFieldSelected('certifications')}
                    onChange={(e) => onToggleFieldSelect('certifications', e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 cursor-pointer"
                  />
                )}
                <span>Update Certifications ({certifications.proposed.length} entries)</span>
              </label>
            )}
            {education?.proposed && (
              <label className="flex items-center gap-2 cursor-pointer">
                {onToggleFieldSelect && (
                  <input
                    type="checkbox"
                    checked={isFieldSelected('education')}
                    onChange={(e) => onToggleFieldSelect('education', e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 cursor-pointer"
                  />
                )}
                <span>Update Education ({education.proposed.length} entries)</span>
              </label>
            )}
            {customSections?.proposed && (
              <label className="flex items-center gap-2 cursor-pointer">
                {onToggleFieldSelect && (
                  <input
                    type="checkbox"
                    checked={isFieldSelected('customSections')}
                    onChange={(e) => onToggleFieldSelect('customSections', e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-zinc-300 text-blue-600 cursor-pointer"
                  />
                )}
                <span>Update Custom Sections ({customSections.proposed.length} sections)</span>
              </label>
            )}
          </div>
        )}

        {stats.totalChanges === 0 && stats.metricConfirmations.length === 0 && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            No textual differences were detected in this proposal.
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-3.5 py-2.5 bg-zinc-50/90 dark:bg-zinc-900/90 border-t border-zinc-200/80 dark:border-zinc-800 space-y-2">
        {!allRequiredMetricsConfirmed && (
          <p className="text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>
              Confirm {unconfirmedCount} unverified metric
              {unconfirmedCount === 1 ? '' : 's'} above before approving.
            </span>
          </p>
        )}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onReject}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            Reject
          </button>
          <button
            type="button"
            onClick={onOpenApprovalModal}
            disabled={isSubmitting || !allRequiredMetricsConfirmed}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
          >
            {allRequiredMetricsConfirmed ? (
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            Review &amp; Approve
          </button>
        </div>
      </div>
    </section>
  );
}

