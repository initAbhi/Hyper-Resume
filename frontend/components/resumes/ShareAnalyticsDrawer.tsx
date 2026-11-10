'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Activity,
  BarChart3,
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Globe,
  RefreshCw,
  RotateCcw,
  Share2,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  apiClient,
  type ResumeShareWithAnalytics,
} from '@/lib/api-client';
import {
  buildPublicShareUrl,
  computeExpiryIso,
  formatRelativeTime,
  formatShareEventLabel,
  inferExpiryPreset,
  normalizeShareSlugDraft,
  type ShareExpiryPreset,
} from '@/lib/share-analytics';

interface ShareAnalyticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  resumeTitle: string;
  shareState: ResumeShareWithAnalytics | null;
  onShareStateChange: (nextState: ResumeShareWithAnalytics) => void;
}

function legacyCopyText(text: string): boolean {
  const field = Object.assign(document.createElement('textarea'), {
    value: text,
  });
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;inset-block-start:0;opacity:0';
  document.body.append(field);
  field.select();
  try {
    return document.execCommand('copy');
  } finally {
    field.remove();
  }
}

export function ShareAnalyticsDrawer({
  isOpen,
  onClose,
  resumeId,
  resumeTitle,
  shareState,
  onShareStateChange,
}: ShareAnalyticsDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const pointerDownOutsideRef = useRef(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCopyMessageRef = useRef('');

  const titleId = useId();
  const shareUrlFieldId = useId();
  const tableCaptionId = useId();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isResettingAnalytics, setIsResettingAnalytics] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Local controlled form draft synced with server share settings
  const [isActive, setIsActive] = useState(true);
  const [slugDraft, setSlugDraft] = useState('');
  const [allowPdfDownload, setAllowPdfDownload] = useState(true);
  const [allowDocxDownload, setAllowDocxDownload] = useState(true);
  const [hideContactDetails, setHideContactDetails] = useState(false);
  const [recruiterNote, setRecruiterNote] = useState('');
  const [expiryPreset, setExpiryPreset] = useState<ShareExpiryPreset>('never');

  // Copy button accessible status state (copy-button pattern)
  const [copyOutcome, setCopyOutcome] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  );
  const [copyStatusText, setCopyStatusText] = useState('');

  const syncDraftFromShare = (state: ResumeShareWithAnalytics) => {
    if (state.share) {
      setIsActive(state.share.isActive);
      setSlugDraft(state.share.slug);
      setAllowPdfDownload(state.share.allowPdfDownload);
      setAllowDocxDownload(state.share.allowDocxDownload);
      setHideContactDetails(state.share.hideContactDetails);
      setRecruiterNote(state.share.recruiterNote || '');
      setExpiryPreset(inferExpiryPreset(state.share.expiresAt));
    }
  };

  // Sync native <dialog> top-layer modal visibility
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

  // Load share & live analytics on drawer open (auto-initializing link cleanly on first share!)
  useEffect(() => {
    if (!isOpen || !resumeId) return;
    let mounted = true;

    async function loadShare() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        let fetched = await apiClient.getResumeShareAnalytics(resumeId);
        if (!fetched.share) {
          // Auto-create an active public recruiter link on first Share click
          fetched = await apiClient.upsertResumeShare(resumeId, {
            isActive: true,
            allowPdfDownload: true,
            allowDocxDownload: true,
            hideContactDetails: false,
          });
        }
        if (!mounted) return;
        onShareStateChange(fetched);
        syncDraftFromShare(fetched);
      } catch (err: unknown) {
        if (!mounted) return;
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Unable to load share link and analytics.',
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadShare();
    return () => {
      mounted = false;
    };
    // Intentionally fetch fresh telemetry whenever drawer opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, resumeId]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const publicUrl = useMemo(() => {
    const effectiveSlug = shareState?.share?.slug || slugDraft;
    return effectiveSlug ? buildPublicShareUrl(effectiveSlug) : '';
  }, [shareState?.share?.slug, slugDraft]);

  const handleSaveSettings = async (
    overridePartial?: Partial<{
      isActive: boolean;
      allowPdfDownload: boolean;
      allowDocxDownload: boolean;
      hideContactDetails: boolean;
    }>,
  ) => {
    if (!resumeId) return;
    setIsSaving(true);
    setErrorMessage(null);

    const nextActive = overridePartial?.isActive ?? isActive;
    const nextPdf = overridePartial?.allowPdfDownload ?? allowPdfDownload;
    const nextDocx = overridePartial?.allowDocxDownload ?? allowDocxDownload;
    const nextHideContact =
      overridePartial?.hideContactDetails ?? hideContactDetails;
    const cleanSlug = slugDraft ? normalizeShareSlugDraft(slugDraft) : undefined;

    try {
      const updated = await apiClient.upsertResumeShare(resumeId, {
        isActive: nextActive,
        slug: cleanSlug,
        allowPdfDownload: nextPdf,
        allowDocxDownload: nextDocx,
        hideContactDetails: nextHideContact,
        recruiterNote: recruiterNote.trim() || null,
        expiresAt: computeExpiryIso(expiryPreset),
      });
      onShareStateChange(updated);
      syncDraftFromShare(updated);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to update share settings.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateSlug = async () => {
    setIsRegenerating(true);
    setErrorMessage(null);
    try {
      const updated = await apiClient.regenerateResumeShareSlug(resumeId);
      onShareStateChange(updated);
      syncDraftFromShare(updated);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to rotate public link.',
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRefreshAnalytics = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const updated = await apiClient.getResumeShareAnalytics(resumeId);
      onShareStateChange(updated);
      syncDraftFromShare(updated);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to refresh analytics.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAnalytics = async () => {
    setIsResettingAnalytics(true);
    setErrorMessage(null);
    try {
      const updated = await apiClient.resetResumeShareAnalytics(resumeId);
      onShareStateChange(updated);
      syncDraftFromShare(updated);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to clear view logs.',
      );
    } finally {
      setIsResettingAnalytics(false);
    }
  };

  const triggerCopyPublicUrl = async () => {
    if (!publicUrl) return;
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);

    let ok = false;
    try {
      await navigator.clipboard.writeText(publicUrl);
      ok = true;
    } catch {
      ok = legacyCopyText(publicUrl);
    }

    let message = ok ? 'Copied' : 'Copy failed';
    if (message === lastCopyMessageRef.current) {
      message += '\u00A0';
    }
    lastCopyMessageRef.current = message;

    setCopyOutcome(ok ? 'copied' : 'failed');
    setCopyStatusText(message);

    copyTimerRef.current = setTimeout(() => {
      setCopyOutcome('idle');
      setCopyStatusText('');
    }, 2200);
  };

  const isPointerOutsideDialog = (e: React.PointerEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return false;
    const r = dialog.getBoundingClientRect();
    return (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    );
  };

  const analytics = shareState?.analytics;
  const maxDailyCount = useMemo(() => {
    const trend = analytics?.dailyTrend || [];
    const maxVal = Math.max(
      1,
      ...trend.map((d) => Math.max(d.views, d.downloads)),
    );
    return maxVal;
  }, [analytics?.dailyTrend]);

  return (
    <dialog
      ref={dialogRef}
      id="share-analytics-drawer"
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onPointerDown={(e) => {
        pointerDownOutsideRef.current = isPointerOutsideDialog(e);
      }}
      onPointerUp={(e) => {
        if (pointerDownOutsideRef.current && isPointerOutsideDialog(e)) {
          onClose();
        }
        pointerDownOutsideRef.current = false;
      }}
      className="m-0 ml-auto h-full max-h-none w-full max-w-[500px] p-0 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xl [overscroll-behavior:contain] backdrop:bg-black/45 backdrop:backdrop-blur-xs backdrop:overflow-hidden backdrop:[overscroll-behavior:contain]"
    >
      <div className="flex flex-col h-full w-full">
        {/* Drawer Header */}
        <header className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <h2
                id={titleId}
                className="text-sm font-bold text-zinc-900 dark:text-zinc-100"
              >
                Recruiter Share Link &amp; Analytics
              </h2>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {isActive ? 'Live Public Link' : 'Paused'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {resumeTitle || 'Resume Draft'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Recruiter Share & Analytics"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs"
            >
              {errorMessage}
            </div>
          )}

          {/* 1. Public Recruiter Link & Copy Controls */}
          <section className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="share-active-switch"
                className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Enable Public Recruiter View</span>
              </label>
              <input
                id="share-active-switch"
                type="checkbox"
                {...({ switch: '' } as Record<string, string>)}
                checked={isActive}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsActive(checked);
                  void handleSaveSettings({ isActive: checked });
                }}
                className="appearance-none w-10 h-5 rounded-full bg-zinc-300 dark:bg-zinc-700 checked:bg-emerald-600 relative transition-colors before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-4 before:h-4 before:rounded-full before:bg-white checked:before:translate-x-5 before:transition-transform cursor-pointer focus-visible:outline-3 focus-visible:outline-amber-500 focus-visible:outline-offset-2 shrink-0 accent-emerald-600"
              />
            </div>

            {/* Public URL Copy Row */}
            <div className="space-y-1.5">
              <label
                htmlFor={shareUrlFieldId}
                className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400"
              >
                Shareable Recruiter URL (No login required)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id={shareUrlFieldId}
                  type="text"
                  readOnly
                  value={publicUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />

                {/* Copy button + outside role=status confirmation pill per copy-button guidance */}
                <span className="relative inline-flex items-center shrink-0">
                  <button
                    id="copy-public-share-url-btn"
                    type="button"
                    onClick={() => void triggerCopyPublicUrl()}
                    aria-label="Copy public recruiter share link"
                    data-copied={copyOutcome === 'copied' ? '' : undefined}
                    data-failed={copyOutcome === 'failed' ? '' : undefined}
                    className="min-w-[32px] min-h-[32px] px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copyOutcome === 'copied' ? (
                      <Check
                        className="w-3.5 h-3.5 text-emerald-600"
                        aria-hidden="true"
                      />
                    ) : (
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    <span>{copyOutcome === 'copied' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <span
                    role="status"
                    aria-live="polite"
                    className={`pointer-events-none absolute -top-7 right-0 px-2 py-0.5 rounded bg-zinc-900 text-white text-[10px] font-medium whitespace-nowrap transition-opacity duration-150 ${
                      copyStatusText ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {copyStatusText}
                  </span>
                </span>

                {publicUrl && isActive && (
                  <a
                    id="open-recruiter-view-link"
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-[32px] min-h-[32px] px-2 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-semibold inline-flex items-center gap-1 transition-colors shrink-0"
                    title="Open Public Recruiter View"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </a>
                )}
              </div>
            </div>

            {/* Custom Slug & Regenerate */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end pt-1">
              <div className="sm:col-span-7 space-y-1">
                <label
                  htmlFor="custom-share-slug-input"
                  className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400"
                >
                  Custom Link Handle
                </label>
                <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
                  <span className="px-2 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-zinc-500 border-r border-zinc-200 dark:border-zinc-700">
                    /r/
                  </span>
                  <input
                    id="custom-share-slug-input"
                    type="text"
                    value={slugDraft}
                    onChange={(e) => setSlugDraft(e.target.value)}
                    placeholder="your-name-role"
                    className="flex-1 min-w-0 px-2 py-1.5 text-[11px] font-mono bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-5 space-y-1">
                <label
                  htmlFor="share-expiry-select"
                  className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400"
                >
                  Expiration
                </label>
                <select
                  id="share-expiry-select"
                  value={expiryPreset}
                  onChange={(e) =>
                    setExpiryPreset(e.target.value as ShareExpiryPreset)
                  }
                  className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                >
                  <option value="never">No expiration</option>
                  <option value="7d">Expires in 7 days</option>
                  <option value="30d">Expires in 30 days</option>
                  <option value="90d">Expires in 90 days</option>
                </select>
              </div>
            </div>

            {/* Recruiter Greeting Note */}
            <div className="space-y-1">
              <label
                htmlFor="recruiter-note-input"
                className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400"
              >
                Optional Note for Recruiters / Hiring Managers
              </label>
              <input
                id="recruiter-note-input"
                type="text"
                maxLength={280}
                value={recruiterNote}
                onChange={(e) => setRecruiterNote(e.target.value)}
                placeholder="e.g. Open to Staff Backend / Fintech roles; US work authorized."
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
              />
            </div>

            {/* Permissions & Privacy Switches */}
            <div className="space-y-2 pt-1 border-t border-zinc-200/70 dark:border-zinc-800">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="allow-pdf-switch"
                  className="text-[11px] text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  Allow Recruiter PDF Download
                </label>
                <input
                  id="allow-pdf-switch"
                  type="checkbox"
                  {...({ switch: '' } as Record<string, string>)}
                  checked={allowPdfDownload}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAllowPdfDownload(checked);
                    void handleSaveSettings({ allowPdfDownload: checked });
                  }}
                  className="appearance-none w-9 h-4.5 rounded-full bg-zinc-300 dark:bg-zinc-700 checked:bg-blue-600 relative transition-colors before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-3.5 before:h-3.5 before:rounded-full before:bg-white checked:before:translate-x-4.5 before:transition-transform cursor-pointer focus-visible:outline-3 focus-visible:outline-amber-500 focus-visible:outline-offset-2 accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="allow-docx-switch"
                  className="text-[11px] text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  Allow Word (.docx) Export
                </label>
                <input
                  id="allow-docx-switch"
                  type="checkbox"
                  {...({ switch: '' } as Record<string, string>)}
                  checked={allowDocxDownload}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAllowDocxDownload(checked);
                    void handleSaveSettings({ allowDocxDownload: checked });
                  }}
                  className="appearance-none w-9 h-4.5 rounded-full bg-zinc-300 dark:bg-zinc-700 checked:bg-blue-600 relative transition-colors before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-3.5 before:h-3.5 before:rounded-full before:bg-white checked:before:translate-x-4.5 before:transition-transform cursor-pointer focus-visible:outline-3 focus-visible:outline-amber-500 focus-visible:outline-offset-2 accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="privacy-mask-switch"
                  className="text-[11px] text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>Privacy Mode (Mask Email &amp; Phone)</span>
                </label>
                <input
                  id="privacy-mask-switch"
                  type="checkbox"
                  {...({ switch: '' } as Record<string, string>)}
                  checked={hideContactDetails}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHideContactDetails(checked);
                    void handleSaveSettings({ hideContactDetails: checked });
                  }}
                  className="appearance-none w-9 h-4.5 rounded-full bg-zinc-300 dark:bg-zinc-700 checked:bg-amber-600 relative transition-colors before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-3.5 before:h-3.5 before:rounded-full before:bg-white checked:before:translate-x-4.5 before:transition-transform cursor-pointer focus-visible:outline-3 focus-visible:outline-amber-500 focus-visible:outline-offset-2 accent-amber-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                isLoading={isRegenerating}
                onClick={() => void handleRegenerateSlug()}
                className="text-[11px] gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Rotate Link</span>
              </Button>
              <Button
                id="save-share-settings-btn"
                type="button"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                onClick={() => void handleSaveSettings()}
                className="text-xs"
              >
                Save Share Settings
              </Button>
            </div>
          </section>

          {/* 2. Real-Time Recruiter Engagement Metrics */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Real-Time Engagement Analytics</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  id="refresh-share-analytics-btn"
                  type="button"
                  onClick={() => void handleRefreshAnalytics()}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  <span>Refresh</span>
                </button>
                {(analytics?.totalViews ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => void handleResetAnalytics()}
                    disabled={isResettingAnalytics}
                    className="text-[11px] font-medium text-zinc-500 hover:text-rose-600 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* 4 KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500 uppercase">
                  <span>Views</span>
                  <Eye className="w-3 h-3 text-blue-600" />
                </div>
                <div
                  id="analytics-total-views"
                  className="text-xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100 mt-1"
                >
                  {analytics?.totalViews ?? 0}
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500 uppercase">
                  <span>Unique</span>
                  <Users className="w-3 h-3 text-indigo-600" />
                </div>
                <div
                  id="analytics-unique-visitors"
                  className="text-xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100 mt-1"
                >
                  {analytics?.uniqueVisitors ?? 0}
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500 uppercase">
                  <span>Downloads</span>
                  <Download className="w-3 h-3 text-emerald-600" />
                </div>
                <div
                  id="analytics-total-downloads"
                  className="text-xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100 mt-1"
                >
                  {analytics?.totalDownloads ?? 0}
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-500 uppercase">
                  <span>Last Seen</span>
                  <Activity className="w-3 h-3 text-amber-600" />
                </div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-2 truncate">
                  {formatRelativeTime(analytics?.lastViewedAt)}
                </div>
              </div>
            </div>

            {/* 14-Day Engagement Bar Trend */}
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  14-Day View &amp; Download Trend
                </span>
                <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-blue-600 inline-block" />
                    Views
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block" />
                    Downloads
                  </span>
                </div>
              </div>

              <div className="h-24 flex items-end gap-1 pt-2 border-b border-zinc-100 dark:border-zinc-800">
                {(analytics?.dailyTrend || []).map((day) => {
                  const viewPct = Math.round((day.views / maxDailyCount) * 100);
                  const dlPct = Math.round(
                    (day.downloads / maxDailyCount) * 100,
                  );
                  return (
                    <div
                      key={day.date}
                      title={`${day.label}: ${day.views} views, ${day.downloads} downloads`}
                      className="flex-1 h-full flex items-end justify-center gap-0.5 group"
                    >
                      <div
                        className="w-2 rounded-t bg-blue-600/85 group-hover:bg-blue-500 transition-all"
                        style={{
                          height: `${day.views > 0 ? Math.max(12, viewPct) : 4}%`,
                          opacity: day.views > 0 ? 1 : 0.2,
                        }}
                      />
                      <div
                        className="w-1.5 rounded-t bg-emerald-500/90 group-hover:bg-emerald-400 transition-all"
                        style={{
                          height: `${day.downloads > 0 ? Math.max(12, dlPct) : 0}%`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[9.5px] font-mono text-zinc-400">
                <span>{analytics?.dailyTrend?.[0]?.label || '14d ago'}</span>
                <span>Today</span>
              </div>
            </div>

            {/* Devices & Referrer Sources */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1.5">
                <h4 className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Devices
                </h4>
                {analytics?.deviceBreakdown &&
                analytics.deviceBreakdown.length > 0 ? (
                  <ul className="space-y-1 text-[11px]">
                    {analytics.deviceBreakdown.map((item) => (
                      <li
                        key={item.device}
                        className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 capitalize"
                      >
                        <span>{item.device}</span>
                        <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-200">
                          {item.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-zinc-400">No visits yet</p>
                )}
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1.5">
                <h4 className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Top Referrers
                </h4>
                {analytics?.referrerBreakdown &&
                analytics.referrerBreakdown.length > 0 ? (
                  <ul className="space-y-1 text-[11px]">
                    {analytics.referrerBreakdown.slice(0, 4).map((item) => (
                      <li
                        key={item.referrer}
                        className="flex items-center justify-between gap-2 text-zinc-600 dark:text-zinc-400"
                      >
                        <span className="truncate">{item.referrer}</span>
                        <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-200 shrink-0">
                          {item.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-zinc-400">Direct link visits</p>
                )}
              </div>
            </div>

            {/* Responsive Accessible Activity Table (responsive-table pattern) */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              <div
                tabIndex={0}
                role="region"
                aria-labelledby={tableCaptionId}
                className="overflow-auto max-h-56 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <table className="w-full text-left text-[11px] border-separate border-spacing-0">
                  <caption
                    id={tableCaptionId}
                    className="text-left px-3 py-2 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-800"
                  >
                    Recent Recruiter Activity Log
                  </caption>
                  <thead className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-800/95 text-zinc-500 dark:text-zinc-400 uppercase text-[10px]">
                    <tr>
                      <th scope="col" className="px-3 py-1.5 font-semibold">
                        Action
                      </th>
                      <th scope="col" className="px-3 py-1.5 font-semibold">
                        Client
                      </th>
                      <th scope="col" className="px-3 py-1.5 font-semibold">
                        When
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {analytics?.recentEvents &&
                    analytics.recentEvents.length > 0 ? (
                      analytics.recentEvents.map((ev) => (
                        <tr key={ev.id}>
                          <th
                            scope="row"
                            className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap"
                          >
                            {formatShareEventLabel(ev.eventType)}
                          </th>
                          <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                            {ev.browser} · {ev.os} ({ev.referrer})
                          </td>
                          <td className="px-3 py-2 text-zinc-500 font-mono whitespace-nowrap">
                            {formatRelativeTime(ev.createdAt)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-5 text-center text-zinc-400"
                        >
                          Share your public link to begin capturing real-time views &amp; downloads.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </dialog>
  );
}

