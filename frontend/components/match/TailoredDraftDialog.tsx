'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  apiClient,
  type JobMatch,
  type JobTailorSuggestionsResponse,
  type Resume,
} from '@/lib/api-client';

interface TailoredDraftDialogProps {
  isOpen: boolean;
  match: JobMatch | null;
  sourceResume?: Resume;
  jobTitle: string;
  companyName: string;
  suggestions: JobTailorSuggestionsResponse | null;
  isLoadingSuggestions: boolean;
  suggestionsError: string | null;
  onRetrySuggestions: () => void;
  onClose: () => void;
  onCreated: (newResumeId: string) => void;
}

export function TailoredDraftDialog({
  isOpen,
  match,
  sourceResume,
  jobTitle,
  companyName,
  suggestions,
  isLoadingSuggestions,
  suggestionsError,
  onRetrySuggestions,
  onClose,
  onCreated,
}: TailoredDraftDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();
  const nameInputId = useId();

  const defaultName = `${(jobTitle || suggestions?.jobTitle || 'Tailored').trim()}${
    companyName.trim() ? ` (${companyName.trim()})` : ''
  }`;

  const [draftName, setDraftName] = useState(defaultName);
  const [applyHeadline, setApplyHeadline] = useState(true);
  const [applySummary, setApplySummary] = useState(true);
  const [selectedBulletIndices, setSelectedBulletIndices] = useState<
    Record<number, boolean>
  >({});
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Progressive fallback for browsers lacking <dialog closedby="any">
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    const outside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      );
    };
    let downOutside = false;
    const onDown = (e: PointerEvent) => {
      downOutside = outside(e);
    };
    const onUp = (e: PointerEvent) => {
      if (downOutside && outside(e) && dialog.open) {
        dialog.close();
      }
      downOutside = false;
    };
    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);
    return () => {
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, []);

  const handleClose = () => {
    const dialog = dialogRef.current;
    if (dialog) dialog.returnValue = '';
    setCreateError(null);
    onClose();
  };

  const isBulletSelected = (idx: number): boolean => {
    if (idx in selectedBulletIndices) {
      return Boolean(selectedBulletIndices[idx]);
    }
    return true;
  };

  const toggleBullet = (idx: number) => {
    setSelectedBulletIndices((prev) => ({
      ...prev,
      [idx]: !isBulletSelected(idx),
    }));
  };

  const handleCreate = async () => {
    if (!match || isCreating) return;
    setCreateError(null);
    setIsCreating(true);

    try {
      const selectedBullets = (suggestions?.bulletImprovements || []).filter(
        (_, idx) => isBulletSelected(idx),
      );
      const res = await apiClient.createTailoredResumeFromMatch(match.id, {
        name: draftName.trim() || defaultName,
        applyHeadline:
          applyHeadline && suggestions?.suggestedHeadline?.trim()
            ? suggestions.suggestedHeadline.trim()
            : undefined,
        applySummary:
          applySummary && suggestions?.suggestedSummary?.trim()
            ? suggestions.suggestedSummary.trim()
            : undefined,
        bulletUpdates: selectedBullets.map((b) => ({
          company: b.company,
          originalBullet: b.originalBullet,
          tailoredBullet: b.tailoredBullet,
        })),
      });

      dialogRef.current?.close();
      onCreated(res.resume.id);
    } catch (err: unknown) {
      setCreateError(
        err instanceof Error
          ? err.message
          : 'Failed to create AI-tailored draft. Please try again.',
      );
    } finally {
      setIsCreating(false);
    }
  };

  const bulletsCount = (suggestions?.bulletImprovements || []).filter((_, i) =>
    isBulletSelected(i),
  ).length;

  return (
    <dialog
      ref={dialogRef}
      data-testid="tailored-draft-dialog"
      aria-labelledby={titleId}
      onClose={handleClose}
      {...({ closedby: 'any' } as Record<string, string>)}
      className="hr-native-dialog w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xl p-0 max-h-[86vh] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate"
            >
              Create AI-Tailored Resume Draft
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              Review grounded headline, summary, and bullet adaptations before cloning into your workspace.
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close Tailored Draft Dialog"
          onClick={() => dialogRef.current?.close()}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5 text-xs">
        <div className="space-y-1.5">
          <label
            htmlFor={nameInputId}
            className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
          >
            New Tailored Resume Title
          </label>
          <input
            id={nameInputId}
            type="text"
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder={defaultName}
            className="w-full h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isLoadingSuggestions && (
          <div
            data-testid="tailor-suggestions-loading"
            className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 flex flex-col items-center justify-center text-center gap-3"
          >
            <progress
              aria-label="Generating AI tailored resume suggestions"
              className="hr-loading-spinner"
            />
            <div className="space-y-1">
              <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                Synthesizing verified role adaptations...
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Comparing {sourceResume?.name || 'your resume'} against {jobTitle || 'target'} requirements with zero fabrication.
              </p>
            </div>
          </div>
        )}

        {suggestionsError && !isLoadingSuggestions && (
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{suggestionsError}</span>
            </div>
            <p className="text-[11px]">
              You can retry generating AI adaptations or create a clean cloned draft directly into the Check &amp; Tailor drawer.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetrySuggestions}
              className="h-7 text-[11px]"
            >
              Retry AI Suggestions
            </Button>
          </div>
        )}

        {suggestions && !isLoadingSuggestions && (
          <div className="space-y-4" data-testid="tailor-suggestions-list">
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div className="space-y-0.5">
                <div className="font-bold text-[11px]">
                  Verified Non-Hallucinating Tailoring Ready
                </div>
                <div className="text-[10.5px] opacity-90">
                  {suggestions.factualVerificationNotes}
                </div>
              </div>
            </div>

            {suggestions.suggestedHeadline && (
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 space-y-2">
                <label className="hr-checkbox-label text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <input
                    type="checkbox"
                    className="hr-checkbox-native"
                    checked={applyHeadline}
                    onChange={(e) => setApplyHeadline(e.target.checked)}
                  />
                  <span>Update Headline for Target Role</span>
                </label>
                {sourceResume?.content?.headline && (
                  <p className="text-[10.5px] text-zinc-500 line-through">
                    {sourceResume.content.headline}
                  </p>
                )}
                <p className="text-[11.5px] font-medium text-blue-700 dark:text-blue-300">
                  → {suggestions.suggestedHeadline}
                </p>
              </div>
            )}

            {suggestions.suggestedSummary && (
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 space-y-2">
                <label className="hr-checkbox-label text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <input
                    type="checkbox"
                    className="hr-checkbox-native"
                    checked={applySummary}
                    onChange={(e) => setApplySummary(e.target.checked)}
                  />
                  <span>Tailor Professional Summary</span>
                </label>
                {sourceResume?.content?.summary && (
                  <p className="text-[10.5px] text-zinc-500 line-through">
                    {sourceResume.content.summary}
                  </p>
                )}
                <p className="text-[11.5px] font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  → {suggestions.suggestedSummary}
                </p>
              </div>
            )}

            {(suggestions.bulletImprovements || []).length > 0 && (
              <div className="space-y-2.5">
                <div className="font-bold uppercase tracking-wider text-[10.5px] text-zinc-500 dark:text-zinc-400">
                  Grounded Experience Bullet Refinements ({bulletsCount}/
                  {suggestions.bulletImprovements.length} selected)
                </div>
                {suggestions.bulletImprovements.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 space-y-2"
                  >
                    <label className="hr-checkbox-label w-full justify-between">
                      <span className="inline-flex items-center gap-2.5 font-bold text-[11px] text-zinc-900 dark:text-zinc-100">
                        <input
                          type="checkbox"
                          className="hr-checkbox-native"
                          checked={isBulletSelected(idx)}
                          onChange={() => toggleBullet(idx)}
                        />
                        <span>{item.company || 'Experience Entry'}</span>
                      </span>
                      {item.matchedKeywords?.length > 0 && (
                        <span className="inline-flex flex-wrap gap-1">
                          {item.matchedKeywords.slice(0, 3).map((kw) => (
                            <span
                              key={kw}
                              className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-mono"
                            >
                              {kw}
                            </span>
                          ))}
                        </span>
                      )}
                    </label>
                    <p className="text-[10.5px] text-zinc-500 line-through">
                      {item.originalBullet}
                    </p>
                    <p className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                      → {item.tailoredBullet}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {createError && (
          <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{createError}</span>
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
          data-testid="confirm-create-tailored-resume-btn"
          disabled={isLoadingSuggestions || isCreating}
          onClick={handleCreate}
          className="gap-1.5"
        >
          {isCreating ? (
            <>
              <progress aria-label="Saving tailored draft" className="hr-loading-spinner" />
              <span>Saving Tailored Resume...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Create &amp; Open Tailored Resume</span>
            </>
          )}
        </Button>
      </form>
    </dialog>
  );
}
