'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  GitCompare,
  History,
  Loader2,
  RotateCcw,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ResumeContent, ResumeVersion } from '@/lib/api-client';
import { getTemplateComponent } from '@/components/resumes/templates';
import { computeVersionDiff } from '@/lib/version-diff';

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  versions: ResumeVersion[];
  isLoadingVersions?: boolean;
  currentContent: ResumeContent;
  templateKey: string;
  accentColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  showPhoto: boolean;
  photoUrl?: string;
  versionNote: string;
  onVersionNoteChange: (val: string) => void;
  isSavingVersion: boolean;
  onCreateSnapshot: () => Promise<void> | void;
  onRestoreVersion: (version: ResumeVersion) => Promise<void>;
}

function formatSnapshotTimestamp(iso: string): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function countWords(text?: string): number {
  return (text ?? '').trim().split(/\s+/).filter(Boolean).length;
}

export default function VersionHistoryDrawer({
  isOpen,
  onClose,
  versions,
  isLoadingVersions = false,
  currentContent,
  templateKey,
  accentColor,
  fontFamily,
  showPhoto,
  photoUrl,
  versionNote,
  onVersionNoteChange,
  isSavingVersion,
  onCreateSnapshot,
  onRestoreVersion,
}: VersionHistoryDrawerProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null,
  );
  const [inspectionTab, setInspectionTab] = useState<'diff' | 'preview'>(
    'diff',
  );
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [banner, setBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const selectedVersion = useMemo(() => {
    if (versions.length === 0) return null;
    if (selectedVersionId) {
      const match = versions.find((v) => v.id === selectedVersionId);
      if (match) return match;
    }
    // Prefer the most recent version that differs from current if one exists, otherwise latest
    return versions[0];
  }, [versions, selectedVersionId]);

  const diffMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeVersionDiff>>();
    for (const ver of versions) {
      map.set(
        ver.id,
        computeVersionDiff(currentContent, ver.contentSnapshot),
      );
    }
    return map;
  }, [versions, currentContent]);

  const selectedDiff = selectedVersion
    ? diffMap.get(selectedVersion.id) ?? null
    : null;

  if (!isOpen) return null;

  const handleSnapshotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionNote.trim() || isSavingVersion) return;
    setBanner(null);
    try {
      await onCreateSnapshot();
      setBanner({
        type: 'success',
        message: 'Saved new resume snapshot from current editor state.',
      });
    } catch (err) {
      setBanner({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Unable to save snapshot right now.',
      });
    }
  };

  const handleConfirmRestore = async (ver: ResumeVersion) => {
    setIsRestoring(true);
    setBanner(null);
    try {
      await onRestoreVersion(ver);
      setPendingRestoreId(null);
      setBanner({
        type: 'success',
        message: `Rolled back live resume to Version ${ver.versionNumber}. Pre-restore backup saved automatically.`,
      });
    } catch (err) {
      setBanner({
        type: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Failed to restore selected version.',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Version History & Rollback"
    >
      <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 h-full flex flex-col shadow-2xl border-l border-zinc-200 dark:border-zinc-800">
        {/* Top Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
              <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Version History &amp; Rollback
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {versions.length} snapshot{versions.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Inspect changes, preview any snapshot visually, or roll back safely without losing edits.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close Version History"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Banner */}
        {banner && (
          <div
            data-testid="version-status-banner"
            className={`mx-6 mt-3 px-3.5 py-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 shrink-0 ${
              banner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {banner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{banner.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="text-current opacity-70 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Split-Pane Body */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12">
          {/* Left Pane: Create Snapshot + Timeline List */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-col min-h-0">
            <form
              onSubmit={handleSnapshotSubmit}
              className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-2 shrink-0 bg-zinc-50/70 dark:bg-zinc-900/60"
            >
              <label
                htmlFor="version-snapshot-note"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Create State Snapshot
              </label>
              <div className="flex gap-2">
                <input
                  id="version-snapshot-note"
                  type="text"
                  placeholder="e.g. Tailored for Senior Role at Stripe"
                  value={versionNote}
                  onChange={(e) => onVersionNoteChange(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Button
                  id="save-version-snapshot-btn"
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSavingVersion}
                  disabled={!versionNote.trim()}
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  Save
                </Button>
              </div>
            </form>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="px-1 flex items-center justify-between text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <span>Saved Snapshots ({versions.length})</span>
              </div>

              {isLoadingVersions ? (
                <div className="py-8 flex items-center justify-center gap-2 text-xs text-zinc-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading snapshots...
                </div>
              ) : versions.length === 0 ? (
                <p className="text-xs text-zinc-400 px-1 py-4">
                  No version snapshots created yet.
                </p>
              ) : (
                versions.map((ver) => {
                  const isSelected = selectedVersion?.id === ver.id;
                  const diff = diffMap.get(ver.id);
                  const isLiveMatch = (diff?.totalChanges ?? 0) === 0;
                  const rolesCount = ver.contentSnapshot?.experience?.length ?? 0;
                  const skillsCount = ver.contentSnapshot?.skills?.length ?? 0;

                  return (
                    <button
                      key={ver.id}
                      type="button"
                      data-testid={`version-item-${ver.versionNumber}`}
                      onClick={() => {
                        setSelectedVersionId(ver.id);
                        setPendingRestoreId(null);
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-xs space-y-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/70 dark:border-blue-600 dark:bg-blue-950/30 ring-1 ring-blue-500/20'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            Version {ver.versionNumber}
                          </span>
                          {isLiveMatch ? (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              Live Match
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              {diff?.totalChanges} diff
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatSnapshotTimestamp(ver.createdAt)}
                        </span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-300 line-clamp-2">
                        {ver.changeSummary}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {rolesCount} role{rolesCount === 1 ? '' : 's'} &middot;{' '}
                        {skillsCount} skill{skillsCount === 1 ? '' : 's'}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane: Diff Comparison + Live Document Preview + Restore */}
          <div className="md:col-span-8 flex flex-col min-h-0 bg-zinc-50/60 dark:bg-zinc-950/40">
            {!selectedVersion || !selectedDiff ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
                <History className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm font-medium">
                  Select a snapshot on the left to inspect or restore.
                </p>
              </div>
            ) : (
              <>
                {/* Selected Snapshot Header & Controls */}
                <div className="px-5 py-3.5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        Version {selectedVersion.versionNumber}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {formatSnapshotTimestamp(selectedVersion.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                      {selectedVersion.changeSummary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs">
                      <button
                        type="button"
                        data-testid="version-tab-diff"
                        onClick={() => setInspectionTab('diff')}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                          inspectionTab === 'diff'
                            ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        Changes vs Current
                      </button>
                      <button
                        type="button"
                        data-testid="version-tab-preview"
                        onClick={() => setInspectionTab('preview')}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                          inspectionTab === 'preview'
                            ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                            : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Visual Preview
                      </button>
                    </div>

                    <button
                      type="button"
                      data-testid="restore-version-btn"
                      disabled={selectedDiff.totalChanges === 0 || isRestoring}
                      onClick={() => setPendingRestoreId(selectedVersion.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore This Version
                    </button>
                  </div>
                </div>

                {/* Inline Restore Confirmation Banner */}
                {pendingRestoreId === selectedVersion.id && (
                  <div className="mx-5 mt-3 p-3.5 rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <div className="text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
                      <p className="font-bold">
                        Confirm rollback to Version{' '}
                        {selectedVersion.versionNumber}?
                      </p>
                      <p className="text-[11px] opacity-90">
                        Your current resume state is preserved automatically via a pre-restore backup snapshot before rolling back.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        data-testid="cancel-restore-version-btn"
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isRestoring}
                        onClick={() => setPendingRestoreId(null)}
                      >
                        Cancel
                      </Button>
                      <button
                        type="button"
                        data-testid="confirm-restore-version-btn"
                        disabled={isRestoring}
                        onClick={() => handleConfirmRestore(selectedVersion)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
                      >
                        {isRestoring ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        Confirm Rollback
                      </button>
                    </div>
                  </div>
                )}

                {/* Inspection Content Area */}
                <div className="flex-1 overflow-y-auto p-5">
                  {inspectionTab === 'diff' ? (
                    <div className="space-y-4">
                      {selectedDiff.totalChanges === 0 ? (
                        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 p-5 text-center space-y-2">
                          <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 mx-auto" />
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            Matches Current Live Resume
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            Version {selectedVersion.versionNumber} has the exact same headline, summary, skills, experience, projects, and education as your live editor.
                          </p>
                          <button
                            type="button"
                            onClick={() => setInspectionTab('preview')}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Open Visual Preview
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* KPI Overview */}
                          <div className="grid grid-cols-3 gap-2.5">
                            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                                Section Differences
                              </span>
                              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                                {selectedDiff.totalChanges}
                              </p>
                            </div>
                            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                                Roles (Snapshot / Live)
                              </span>
                              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                                {selectedDiff.counts.snapshotExperience} /{' '}
                                {selectedDiff.counts.currentExperience}
                              </p>
                            </div>
                            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                                Skills (Snapshot / Live)
                              </span>
                              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                                {selectedDiff.counts.snapshotSkills} /{' '}
                                {selectedDiff.counts.currentSkills}
                              </p>
                            </div>
                          </div>

                          {/* Headline Diff */}
                          {selectedDiff.headlineChanged && (
                            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                Headline Change
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                <div className="rounded-lg border border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/25 p-2.5">
                                  <span className="block text-[10px] font-semibold uppercase text-amber-700 dark:text-amber-300 mb-1">
                                    Current Live Resume
                                  </span>
                                  <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                                    {currentContent.headline || '(Empty)'}
                                  </p>
                                </div>
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/25 p-2.5">
                                  <span className="block text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-300 mb-1">
                                    Snapshot v{selectedVersion.versionNumber}{' '}
                                    (On Restore)
                                  </span>
                                  <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                                    {selectedVersion.contentSnapshot
                                      .headline || '(Empty)'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Summary Diff */}
                          {selectedDiff.summaryChanged && (
                            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                Professional Summary Change
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                <div className="rounded-lg border border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/25 p-2.5 space-y-1">
                                  <span className="block text-[10px] font-semibold uppercase text-amber-700 dark:text-amber-300">
                                    Current Live ({countWords(currentContent.summary)} words)
                                  </span>
                                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                    {currentContent.summary || '(Empty)'}
                                  </p>
                                </div>
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/25 p-2.5 space-y-1">
                                  <span className="block text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                                    Snapshot v{selectedVersion.versionNumber} (
                                    {countWords(
                                      selectedVersion.contentSnapshot.summary,
                                    )}{' '}
                                    words)
                                  </span>
                                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                    {selectedVersion.contentSnapshot
                                      .summary || '(Empty)'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Skills Diff */}
                          {(selectedDiff.skillsAddedOnRestore.length > 0 ||
                            selectedDiff.skillsRemovedOnRestore.length > 0) && (
                            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2.5">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                Skills Delta
                              </h4>
                              {selectedDiff.skillsAddedOnRestore.length > 0 && (
                                <div className="space-y-1">
                                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                                    Restored from Version{' '}
                                    {selectedVersion.versionNumber}:
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {selectedDiff.skillsAddedOnRestore.map(
                                      (sk) => (
                                        <span
                                          key={`add-${sk}`}
                                          className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300 text-[11px] font-medium"
                                        >
                                          + {sk}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                              {selectedDiff.skillsRemovedOnRestore.length >
                                0 && (
                                <div className="space-y-1">
                                  <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                                    Only in current live draft (not in v
                                    {selectedVersion.versionNumber}):
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {selectedDiff.skillsRemovedOnRestore.map(
                                      (sk) => (
                                        <span
                                          key={`rem-${sk}`}
                                          className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300 text-[11px] font-medium"
                                        >
                                          - {sk}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Experience Roles Diff */}
                          {selectedDiff.changedRoles.length > 0 && (
                            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2.5">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                Experience Differences
                              </h4>
                              <div className="space-y-2">
                                {selectedDiff.changedRoles.map((item, i) => (
                                  <div
                                    key={`${item.label}-${i}`}
                                    className="flex items-start justify-between gap-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-2.5 text-xs"
                                  >
                                    <div>
                                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                        {item.label}
                                      </p>
                                      <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5">
                                        {item.detail}
                                      </p>
                                    </div>
                                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                      <ArrowRight className="w-3 h-3" />
                                      {item.status.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {(selectedDiff.contactChanged ||
                            selectedDiff.projectsChanged ||
                            selectedDiff.educationChanged) && (
                            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 text-xs text-zinc-600 dark:text-zinc-300 flex flex-wrap gap-2">
                              <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                                Other modified sections:
                              </span>
                              {selectedDiff.contactChanged && (
                                <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                                  Contact info
                                </span>
                              )}
                              {selectedDiff.projectsChanged && (
                                <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                                  Projects ({selectedDiff.counts.snapshotProjects}{' '}
                                  vs {selectedDiff.counts.currentProjects})
                                </span>
                              )}
                              {selectedDiff.educationChanged && (
                                <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                                  Education ({selectedDiff.counts.snapshotEducation}{' '}
                                  vs {selectedDiff.counts.currentEducation})
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    /* Visual Document Preview Tab */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>
                          Rendering Version {selectedVersion.versionNumber} using{' '}
                          <strong className="text-zinc-700 dark:text-zinc-200">
                            {templateKey}
                          </strong>{' '}
                          template
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                          Read-only Snapshot Preview
                        </span>
                      </div>
                      <div
                        data-testid="version-visual-preview-canvas"
                        className="max-w-[740px] mx-auto bg-white text-zinc-900 rounded-lg border border-zinc-200 shadow-lg p-8"
                      >
                        {React.createElement(getTemplateComponent(templateKey), {
                          content: selectedVersion.contentSnapshot,
                          accentColor,
                          fontFamily,
                          showPhoto,
                          photoUrl,
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

