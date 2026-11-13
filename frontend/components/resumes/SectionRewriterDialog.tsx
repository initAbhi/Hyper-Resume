'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  Loader2,
  ShieldCheck,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  apiClient,
  type ResumeContent,
  type SectionRewriteResponse,
  type SectionRewriteSectionType,
  type SectionRewriteTone,
} from '@/lib/api-client';

export interface SectionRewriterTarget {
  sectionType: SectionRewriteSectionType;
  sectionLabel: string;
  experienceIndex?: number;
  customSectionId?: string;
}

interface SectionRewriterDialogProps {
  target: SectionRewriterTarget | null;
  content: ResumeContent;
  targetRole?: string;
  onClose: () => void;
  onApply: (updater: (prev: ResumeContent) => ResumeContent) => void;
}

const TONE_OPTIONS: Array<{
  value: SectionRewriteTone;
  label: string;
  hint: string;
}> = [
    {
      value: 'executive',
      label: 'Executive',
      hint: 'Strategic leadership & ownership framing',
    },
    {
      value: 'impact',
      label: 'Impact & XYZ',
      hint: 'Outcome-first action verbs without invented metrics',
    },
    {
      value: 'concise',
      label: 'Concise',
      hint: 'Tight ATS scannability with filler stripped',
    },
    {
      value: 'technical',
      label: 'Technical',
      hint: 'Emphasizes verified stack & system craft',
    },
    {
      value: 'expand',
      label: 'Expand',
      hint: 'Adds factual execution clarity from verified context',
    },
  ];

export function SectionRewriterDialog({
  target,
  content,
  targetRole,
  onClose,
  onApply,
}: SectionRewriterDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();

  const [tone, setTone] = useState<SectionRewriteTone>('executive');
  const [instruction, setInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<SectionRewriteResponse | null>(null);

  // Manage native modal lifecycle via showModal() / close() per Modern Web Guidance
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (target) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [target]);

  // Progressive fallback for browsers without native <dialog closedby="any">
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      );
    };

    let pressedOutside = false;
    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e) && dialog.open) {
        dialog.close();
      }
      pressedOutside = false;
    };

    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);
    return () => {
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  const handleDialogClose = () => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.returnValue = '';
    }
    setErrorMessage(null);
    setResult(null);
    onClose();
  };

  const handleGenerate = async () => {
    if (!target) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const candidateSkills = (content.skills || [])
        .map((s) => (typeof s === 'string' ? s : s.name))
        .filter(Boolean);

      const resolvedRole =
        targetRole?.trim() ||
        content.headline?.split('|')[0]?.trim() ||
        content.experience?.[0]?.title?.trim() ||
        undefined;

      if (target.sectionType === 'summary') {
        const res = await apiClient.rewriteSection({
          sectionType: 'summary',
          sectionTitle: target.sectionLabel,
          tone,
          targetRole: resolvedRole,
          instruction: instruction.trim() || undefined,
          candidateSkills,
          summaryText: content.summary || '',
        });
        setResult(res);
      } else if (target.sectionType === 'experience') {
        const sourceEntries =
          typeof target.experienceIndex === 'number' &&
            content.experience?.[target.experienceIndex]
            ? [content.experience[target.experienceIndex]]
            : content.experience || [];

        const res = await apiClient.rewriteSection({
          sectionType: 'experience',
          sectionTitle: target.sectionLabel,
          tone,
          targetRole: resolvedRole,
          instruction: instruction.trim() || undefined,
          candidateSkills,
          experienceEntries: sourceEntries.map((exp) => ({
            title: exp.title || 'Role',
            company: exp.company || '',
            bullets: (exp.bullets || []).filter(Boolean),
          })),
        });
        setResult(res);
      } else if (target.sectionType === 'projects') {
        const res = await apiClient.rewriteSection({
          sectionType: 'projects',
          sectionTitle: target.sectionLabel,
          tone,
          targetRole: resolvedRole,
          instruction: instruction.trim() || undefined,
          candidateSkills,
          projectEntries: (content.projects || []).map((proj) => ({
            name: proj.name || 'Project',
            description: proj.description || '',
            highlights: (proj.highlights || []).filter(Boolean),
          })),
        });
        setResult(res);
      } else {
        const customSec = (content.customSections || []).find(
          (s) => s.id === target.customSectionId,
        );
        const res = await apiClient.rewriteSection({
          sectionType: 'custom',
          sectionTitle: customSec?.title || target.sectionLabel,
          tone,
          targetRole: resolvedRole,
          instruction: instruction.trim() || undefined,
          candidateSkills,
          customEntries: (customSec?.entries || []).map((entry) => ({
            heading: entry.heading || 'Entry',
            subtitle: entry.subtitle || undefined,
            bullets: (entry.bullets || []).filter(Boolean),
          })),
        });
        setResult(res);
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to rewrite section. Please ensure this section has content first.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyRewrite = () => {
    if (!target || !result) return;

    onApply((prev) => {
      if (result.sectionType === 'summary' && result.summaryRewrite) {
        return {
          ...prev,
          summary: result.summaryRewrite.rewritten,
        };
      }

      if (
        result.sectionType === 'experience' &&
        result.experienceRewrites?.length
      ) {
        const nextExp = [...(prev.experience || [])];
        if (typeof target.experienceIndex === 'number') {
          const single = result.experienceRewrites[0];
          if (single && nextExp[target.experienceIndex]) {
            nextExp[target.experienceIndex] = {
              ...nextExp[target.experienceIndex],
              bullets: single.rewrittenBullets,
            };
          }
        } else {
          result.experienceRewrites.forEach((rw, idx) => {
            if (nextExp[idx]) {
              nextExp[idx] = {
                ...nextExp[idx],
                bullets: rw.rewrittenBullets,
              };
            }
          });
        }
        return {
          ...prev,
          experience: nextExp,
        };
      }

      if (result.sectionType === 'projects' && result.projectRewrites?.length) {
        const nextProjs = [...(prev.projects || [])];
        result.projectRewrites.forEach((rw, idx) => {
          if (nextProjs[idx]) {
            nextProjs[idx] = {
              ...nextProjs[idx],
              description: rw.rewrittenDescription,
              highlights:
                rw.rewrittenHighlights.length > 0
                  ? rw.rewrittenHighlights
                  : nextProjs[idx].highlights,
            };
          }
        });
        return {
          ...prev,
          projects: nextProjs,
        };
      }

      if (
        result.sectionType === 'custom' &&
        result.customRewrites?.length &&
        target.customSectionId
      ) {
        const nextCustom = (prev.customSections || []).map((sec) => {
          if (sec.id !== target.customSectionId) return sec;
          const nextEntries = sec.entries.map((entry, idx) => {
            const rw = result.customRewrites?.find((r) => r.index === idx);
            return rw
              ? {
                ...entry,
                bullets: rw.rewrittenBullets,
              }
              : entry;
          });
          return {
            ...sec,
            entries: nextEntries,
          };
        });
        return {
          ...prev,
          customSections: nextCustom,
        };
      }

      return prev;
    });

    dialogRef.current?.close();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={handleDialogClose}
      {...({ closedby: 'any' } as Record<string, string>)}
      className="hr-native-dialog w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xl p-0 max-h-[88vh] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
            <Wand2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate"
            >
              AI Section Rewriter — {target?.sectionLabel || 'Section'}
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Switch tone or sharpen phrasing across entries while locking verified facts and metrics.
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close AI Section Rewriter"
          onClick={() => dialogRef.current?.close()}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
        {/* Tone Selector */}
        <div className="space-y-2">
          <span className="font-bold uppercase tracking-wider text-[10.5px] text-zinc-500 dark:text-zinc-400">
            Select Rewrite Style
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {TONE_OPTIONS.map((opt, idx) => {
              const selected = tone === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  autoFocus={idx === 0}
                  data-testid={`rewrite-tone-${opt.value}`}
                  onClick={() => setTone(opt.value)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${selected
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-600'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                >
                  <div className="font-bold text-[11px]">{opt.label}</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                    {opt.hint}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Instruction */}
        <div className="space-y-1.5">
          <label
            htmlFor="section-rewrite-direction"
            className="block font-semibold text-[11px] text-zinc-700 dark:text-zinc-300"
          >
            Optional Guidance (Target Focus or Emphasis)
          </label>
          <div className="flex gap-2">
            <input
              id="section-rewrite-direction"
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Emphasize distributed systems scale and mentoring impact..."
              className="flex-1 h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              data-testid="generate-section-rewrite-btn"
              onClick={handleGenerate}
              disabled={isLoading}
              className="gap-1.5 shrink-0 h-9 px-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Rewriting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{result ? 'Regenerate' : 'Generate Rewrite'}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Diff Preview Area */}
        {result && (
          <div className="space-y-4" data-testid="section-rewrite-diff">
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div className="space-y-0.5">
                <div className="font-bold text-[11px]">
                  {result.changesSummary}
                </div>
                <div className="text-[10.5px] opacity-90">
                  {result.factualVerificationNotes}
                </div>
              </div>
            </div>

            {result.summaryRewrite && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-1">
                  <div className="font-bold uppercase tracking-wider text-[10px] text-zinc-500">
                    Current Draft
                  </div>
                  <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {result.summaryRewrite.original}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 space-y-1">
                  <div className="font-bold uppercase tracking-wider text-[10px] text-blue-600 dark:text-blue-400">
                    Rewritten ({tone})
                  </div>
                  <p className="text-[11.5px] text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed">
                    {result.summaryRewrite.rewritten}
                  </p>
                </div>
              </div>
            )}

            {result.experienceRewrites?.map((exp) => (
              <div
                key={exp.index}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2.5"
              >
                <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  {exp.title}
                  {exp.company ? (
                    <span className="font-medium text-zinc-500">
                      {' '}
                      · {exp.company}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-2">
                  {exp.rewrittenBullets.map((nextB, bIdx) => (
                    <div
                      key={bIdx}
                      className="grid grid-cols-1 gap-1.5 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40"
                    >
                      <div className="text-[10.5px] text-zinc-500 line-through">
                        {exp.originalBullets[bIdx]}
                      </div>
                      <div className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100 flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold shrink-0">
                          →
                        </span>
                        <span>{nextB}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {result.projectRewrites?.map((proj) => (
              <div
                key={proj.index}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2"
              >
                <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  {proj.name}
                </div>
                <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 space-y-1">
                  <div className="text-[10.5px] text-zinc-500 line-through">
                    {proj.originalDescription}
                  </div>
                  <div className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100">
                    → {proj.rewrittenDescription}
                  </div>
                </div>
                {proj.rewrittenHighlights.map((nextH, hIdx) => (
                  <div
                    key={hIdx}
                    className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 space-y-1"
                  >
                    <div className="text-[10.5px] text-zinc-500 line-through">
                      {proj.originalHighlights[hIdx]}
                    </div>
                    <div className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100">
                      → {nextH}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {result.customRewrites?.map((custom) => (
              <div
                key={custom.index}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2"
              >
                <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  {custom.heading}
                </div>
                {custom.rewrittenBullets.map((nextB, bIdx) => (
                  <div
                    key={bIdx}
                    className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 space-y-1"
                  >
                    <div className="text-[10.5px] text-zinc-500 line-through">
                      {custom.originalBullets[bIdx]}
                    </div>
                    <div className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100">
                      → {nextB}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <form
        method="dialog"
        className="px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-end gap-2 shrink-0"
      >
        <Button type="submit" variant="outline" size="sm">
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          data-testid="apply-section-rewrite-btn"
          disabled={!result || isLoading}
          onClick={handleApplyRewrite}
          className="gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply to Section</span>
        </Button>
      </form>
    </dialog>
  );
}

