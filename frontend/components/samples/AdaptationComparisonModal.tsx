'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, ResumeAdaptation, BulletDiff, ResumeContent } from '@/lib/api-client';
import {
  X,
  Check,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Loader2,
  Edit2,
  Plus,
} from 'lucide-react';

interface AdaptationComparisonModalProps {
  adaptation: ResumeAdaptation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AdaptationComparisonModal({
  adaptation,
  isOpen,
  onClose,
}: AdaptationComparisonModalProps) {
  const router = useRouter();

  // State for decisions
  const [summaryDecision, setSummaryDecision] = useState<'accept' | 'reject'>('accept');
  const [bulletDecisions, setBulletDecisions] = useState<Record<string, Record<string, 'accept' | 'reject'>>>({});
  const [editedBullets, setEditedBullets] = useState<Record<string, Record<string, string>>>({});
  const [editingBulletKey, setEditingBulletKey] = useState<string | null>(null);
  const [acceptedSkills, setAcceptedSkills] = useState<string[]>(
    adaptation?.recommendedBenchmarkSkills || []
  );
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    setAcceptedSkills(adaptation?.recommendedBenchmarkSkills || []);
    setEditedBullets({});
    setEditingBulletKey(null);
    setSummaryDecision('accept');
    setBulletDecisions({});
    setApplyError(null);
  }, [adaptation?.id, adaptation?.recommendedBenchmarkSkills]);

  if (!isOpen || !adaptation || !adaptation.sectionChanges) return null;

  const { sectionChanges, unsupportedWarnings } = adaptation;
  const experiences = sectionChanges.experience || [];
  const recommendedSkills = adaptation.recommendedBenchmarkSkills || [];

  const handleToggleBullet = (companyIdx: number, bulletIdx: number) => {
    const cKey = String(companyIdx);
    const bKey = String(bulletIdx);
    const current = bulletDecisions[cKey]?.[bKey] || 'accept';
    const next = current === 'accept' ? 'reject' : 'accept';

    setBulletDecisions((prev) => ({
      ...prev,
      [cKey]: {
        ...(prev[cKey] || {}),
        [bKey]: next,
      },
    }));
  };

  const handleAcceptAll = () => {
    setSummaryDecision('accept');
    const allDecisions: Record<string, Record<string, 'accept' | 'reject'>> = {};
    experiences.forEach((exp, cIdx) => {
      allDecisions[String(cIdx)] = {};
      exp.bullets.forEach((_, bIdx) => {
        allDecisions[String(cIdx)][String(bIdx)] = 'accept';
      });
    });
    setBulletDecisions(allDecisions);
  };

  const handleRejectAll = () => {
    setSummaryDecision('reject');
    const allDecisions: Record<string, Record<string, 'accept' | 'reject'>> = {};
    experiences.forEach((exp, cIdx) => {
      allDecisions[String(cIdx)] = {};
      exp.bullets.forEach((_, bIdx) => {
        allDecisions[String(cIdx)][String(bIdx)] = 'reject';
      });
    });
    setBulletDecisions(allDecisions);
  };

  const handleToggleSkill = (skill: string) => {
    setAcceptedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleEditBullet = (companyIdx: number, bulletIdx: number, value: string) => {
    const cKey = String(companyIdx);
    const bKey = String(bulletIdx);
    setEditedBullets((prev) => ({
      ...prev,
      [cKey]: {
        ...(prev[cKey] || {}),
        [bKey]: value,
      },
    }));
  };

  const handleApplyAdaptation = async () => {
    setIsApplying(true);
    setApplyError(null);

    try {
      const hasBulletEdits = Object.values(editedBullets).some((group) =>
        Object.values(group || {}).some((val) => typeof val === 'string'),
      );

      let customFinalContent: ResumeContent | undefined;
      const baseProposed = (adaptation as ResumeAdaptation & { proposedContent?: ResumeContent }).proposedContent;

      if (hasBulletEdits && baseProposed) {
        const mergedSkills = [
          ...(baseProposed.skills || []),
          ...acceptedSkills
            .filter(
              (s) =>
                !(baseProposed.skills || []).some(
                  (existing) => existing.name.toLowerCase() === s.toLowerCase(),
                ),
            )
            .map((name) => ({ name, category: 'Benchmark Skills' })),
        ];

        customFinalContent = {
          ...baseProposed,
          summary:
            summaryDecision === 'accept'
              ? sectionChanges.summary?.adapted || baseProposed.summary
              : sectionChanges.summary?.original || baseProposed.summary,
          skills: mergedSkills,
          experience: (baseProposed.experience || []).map((exp, cIdx) => {
            const diffExp = experiences[cIdx];
            if (!diffExp) return exp;
            const cKey = String(cIdx);
            return {
              ...exp,
              bullets: diffExp.bullets.map((b, bIdx) => {
                const bKey = String(bIdx);
                const edited = editedBullets[cKey]?.[bKey];
                if (typeof edited === 'string' && edited.trim().length > 0) {
                  return edited.trim();
                }
                const accepted = (bulletDecisions[cKey]?.[bKey] ?? 'accept') === 'accept';
                return accepted ? b.adapted : b.original;
              }),
            };
          }),
        };
      }

      const newResume = await apiClient.applyAdaptation(adaptation.id, {
        summaryDecision,
        bulletDecisions,
        acceptedBenchmarkSkills: acceptedSkills,
        ...(customFinalContent ? { customFinalContent } : {}),
      });

      onClose();
      router.push(`/app/resumes/${newResume.id}`);
    } catch (err: any) {
      setApplyError(err?.message || 'Failed to apply adaptation changes.');
      setIsApplying(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5"
    >
      <div
        className="relative w-full max-w-5xl bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] rounded-2xl shadow-2xl flex flex-col h-[94vh] max-h-[960px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="py-3 px-5 border-b border-[#E2E5E9] dark:border-[#252A33] bg-white/95 dark:bg-[#14171C]/95 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1A1D23] dark:text-[#F0F2F5]">
                  AI Profile Adaptation Proposal
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  3 Credits Applied
                </span>
              </div>
              <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4]">
                Target Role: <span className="font-semibold">{adaptation.targetRole || 'Benchmark Standard'}</span> &bull; Source resume preserved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept All</span>
            </button>
            <button
              type="button"
              onClick={handleRejectAll}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Keep All Original</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Comparison Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Factual Integrity Alert Banner */}
          {unsupportedWarnings && unsupportedWarnings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Zero-Hallucination Guard Engaged</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Unverified metrics or benchmark company names were quarantined and replaced with <code>[Confirm measurable impact]</code> placeholders so your resume remains 100% truthful to recruiters.
              </p>
            </div>
          )}

          {/* Section 1: Summary Comparison */}
          {sectionChanges.summary && (
            <div className="border border-[#E2E5E9] dark:border-[#252A33] rounded-2xl overflow-hidden bg-white dark:bg-[#14171C]">
              <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-[#E2E5E9] dark:border-[#252A33] flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Professional Summary
                </span>
                <button
                  type="button"
                  onClick={() => setSummaryDecision((d) => (d === 'accept' ? 'reject' : 'accept'))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    summaryDecision === 'accept'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {summaryDecision === 'accept' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Adapted</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Keeping Original</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Original</span>
                  <p className="text-zinc-700 dark:text-zinc-300">{sectionChanges.summary.original || 'No original summary provided.'}</p>
                </div>
                <div className={`p-3 rounded-xl border space-y-1 ${
                  summaryDecision === 'accept'
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-60'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Adapted (Benchmark Phrasing)</span>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium">{sectionChanges.summary.adapted}</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Experience Bullets Selective Acceptance */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Experience Bullets & High-Impact Phrasing
              </h4>
              <span className="text-[11px] text-zinc-500">
                Click check/undo to toggle individual bullets
              </span>
            </div>

            {experiences.map((exp, cIdx) => (
              <div
                key={cIdx}
                className="border border-[#E2E5E9] dark:border-[#252A33] rounded-2xl overflow-hidden bg-white dark:bg-[#14171C]"
              >
                <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-[#E2E5E9] dark:border-[#252A33] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{exp.company}</span>
                    <span className="text-xs text-zinc-500 ml-2">&bull; {exp.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-medium">Locked Facts</span>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {exp.bullets.map((bullet: BulletDiff, bIdx: number) => {
                    const cKey = String(cIdx);
                    const bKey = String(bIdx);
                    const editKey = `${cKey}:${bKey}`;
                    const isEditing = editingBulletKey === editKey;
                    const isAccepted = (bulletDecisions[cKey]?.[bKey] ?? 'accept') === 'accept';
                    const displayedAdapted = editedBullets[cKey]?.[bKey] ?? bullet.adapted;
                    const hasPlaceholder = displayedAdapted.includes('[Confirm measurable impact');

                    return (
                      <div
                        key={bIdx}
                        className={`p-4 transition-colors ${
                          isAccepted ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : 'bg-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2 text-xs">
                            {/* Original bullet */}
                            <div className="text-zinc-500 line-clamp-2">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1.5">Original:</span>
                              {bullet.original}
                            </div>

                            {/* Adapted bullet / inline editor */}
                            {isEditing ? (
                              <div className="space-y-1.5">
                                <textarea
                                  rows={2}
                                  value={displayedAdapted}
                                  onChange={(e) => handleEditBullet(cIdx, bIdx, e.target.value)}
                                  className="w-full p-2 rounded-lg border border-blue-400 dark:border-blue-600 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditingBulletKey(null)}
                                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                >
                                  Done editing
                                </button>
                              </div>
                            ) : (
                              <div className={`text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed ${
                                !isAccepted ? 'opacity-50' : ''
                              }`}>
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mr-1.5">Adapted:</span>
                                {displayedAdapted}
                              </div>
                            )}

                            {/* Placeholder warning badge if unverified metric quarantined */}
                            {hasPlaceholder && isAccepted && (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>Action required: Replace placeholder with your real metric before applying.</span>
                              </div>
                            )}
                          </div>

                          {/* Edit + Toggle decision buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setEditingBulletKey(isEditing ? null : editKey)}
                              className={`p-2 rounded-xl transition-all cursor-pointer ${
                                isEditing
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                              }`}
                              title="Edit adapted bullet text"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleBullet(cIdx, bIdx)}
                              className={`p-2 rounded-xl transition-all cursor-pointer ${
                                isAccepted
                                  ? 'bg-emerald-500 text-white shadow-xs hover:bg-emerald-600'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                              }`}
                              title={isAccepted ? 'Accepted. Click to keep original bullet.' : 'Rejected. Click to accept adapted bullet.'}
                            >
                              {isAccepted ? <Check className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Section 3: Recommended Benchmark Skills */}
          {recommendedSkills.length > 0 && (
            <div className="border border-[#E2E5E9] dark:border-[#252A33] rounded-2xl p-4 bg-white dark:bg-[#14171C] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    Recommended Benchmark Skills
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Discovered in the benchmark sample. Select skills you possess to add to your new resume:
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#285FEA]">
                  {acceptedSkills.length} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {recommendedSkills.map((skill) => {
                  const isChecked = acceptedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isChecked
                          ? 'bg-[#285FEA] text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                      }`}
                    >
                      {isChecked ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Message if apply fails */}
          {applyError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-700 dark:text-red-300 text-xs">
              {applyError}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="py-3.5 px-6 border-t border-[#E2E5E9] dark:border-[#252A33] bg-zinc-50/90 dark:bg-zinc-900/80 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Discard
          </button>

          <button
            type="button"
            onClick={handleApplyAdaptation}
            disabled={isApplying}
            className="px-5 py-2.5 rounded-xl bg-[#285FEA] hover:bg-[#1E4BC8] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isApplying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Adapted Resume...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>Create Adapted Resume Draft</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
