'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  apiClient,
  type CuratedAtsBoard,
  type DiscoveredJobItem,
  type DiscoveredSourceStatus,
  type JobMatch,
  type Resume,
} from '@/lib/api-client';
import {
  classifyMatchTier,
  formatRelativePostedDate,
  normalizeBoardSlugInput,
} from '@/lib/job-discovery-utils';

type SourceOption = 'all' | 'greenhouse' | 'ashby' | 'lever' | 'remotive' | 'arbeitnow';
type WorkplaceOption = 'all' | 'remote' | 'hybrid' | 'onsite';
type SortOption = 'match' | 'recent';

interface ActiveMatchBanner {
  jobTitle: string;
  company: string;
  match: JobMatch;
}

export default function LiveJobDiscoveryClient() {
  const uid = useId();
  const initializedRef = useRef(false);

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [boards, setBoards] = useState<CuratedAtsBoard[]>([]);
  const [jobs, setJobs] = useState<DiscoveredJobItem[]>([]);
  const [sourcesStatus, setSourcesStatus] = useState<DiscoveredSourceStatus[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [liveCount, setLiveCount] = useState(0);
  const [feedMode, setFeedMode] = useState<'live' | 'offline_fallback'>('live');
  const [fetchedAt, setFetchedAt] = useState<string>('');
  const [scoredResumeName, setScoredResumeName] = useState<string>('');

  // Controlled Search & Filter Inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceOption>('all');
  const [workplaceFilter, setWorkplaceFilter] = useState<WorkplaceOption>('all');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [boardTokenInput, setBoardTokenInput] = useState('');
  const [boardProviderInput, setBoardProviderInput] = useState<'greenhouse' | 'ashby' | 'lever'>('greenhouse');

  // Async action states
  const [isLoading, setIsLoading] = useState(true);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [matchingJobId, setMatchingJobId] = useState<string | null>(null);
  const [recentMatchBanner, setRecentMatchBanner] = useState<ActiveMatchBanner | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const executeSearch = useCallback(
    async (overrides?: {
      q?: string;
      source?: SourceOption;
      workplace?: WorkplaceOption;
      resumeId?: string;
      sort?: SortOption;
      boardToken?: string;
      boardProvider?: 'greenhouse' | 'ashby' | 'lever';
      refresh?: boolean;
    }) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const nextSource = overrides?.source ?? sourceFilter;
        const nextWorkplace = overrides?.workplace ?? workplaceFilter;
        const nextResumeId = overrides?.resumeId ?? selectedResumeId;
        const nextSort = overrides?.sort ?? sortBy;
        const nextQ = overrides?.q ?? searchQuery;
        const rawBoard = overrides?.boardToken ?? boardTokenInput;
        const cleanBoard = rawBoard ? normalizeBoardSlugInput(rawBoard) : '';
        const nextProvider = overrides?.boardProvider ?? boardProviderInput;

        const data = await apiClient.searchDiscoveredJobs({
          q: nextQ || undefined,
          source: nextSource,
          workplace: nextWorkplace,
          resumeId: nextResumeId || undefined,
          sort: nextSort,
          boardToken: cleanBoard || undefined,
          boardProvider: cleanBoard ? nextProvider : undefined,
          refresh: overrides?.refresh,
        });

        setJobs(data.jobs);
        setTotalMatches(data.total);
        setLiveCount(data.liveCount);
        setSourcesStatus(data.sourcesStatus);
        setFeedMode(data.feedMode);
        setFetchedAt(data.fetchedAt);
        setScoredResumeName(data.scoredAgainstResumeName || '');

        const activeLiveSources = data.sourcesStatus
          .filter((s) => s.ok && s.count > 0)
          .map((s) => s.source);

        setStatusMessage(
          data.feedMode === 'live'
            ? `Showing ${data.jobs.length} of ${data.total} matching openings from ${activeLiveSources.length} live ATS feeds.`
            : `Showing offline snapshot jobs because external ATS feeds are unreachable.`,
        );
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Unable to fetch live ATS job feeds right now.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      boardProviderInput,
      boardTokenInput,
      searchQuery,
      selectedResumeId,
      sortBy,
      sourceFilter,
      workplaceFilter,
    ],
  );

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function bootstrap() {
      setIsLoading(true);
      try {
        const [resumesData, boardsData] = await Promise.all([
          apiClient.listResumes().catch(() => [] as Resume[]),
          apiClient.listDiscoveredBoards().catch(() => [] as CuratedAtsBoard[]),
        ]);
        setResumes(resumesData);
        setBoards(boardsData);
        const primaryResume =
          resumesData.find((r) => r.isMaster) || resumesData[0] || null;
        if (primaryResume) {
          setSelectedResumeId(primaryResume.id);
        }
        await executeSearch({ resumeId: primaryResume?.id || '' });
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to initialize Job Discovery.',
        );
        setIsLoading(false);
      }
    }

    void bootstrap();
  }, [executeSearch]);

  const handleSearchFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSearch();
  };

  const handleQuickCompanyBoard = async (board: CuratedAtsBoard) => {
    setBoardTokenInput(board.token);
    setBoardProviderInput(board.provider);
    setSourceFilter(board.provider);
    await executeSearch({
      boardToken: board.token,
      boardProvider: board.provider,
      source: board.provider,
    });
  };

  const handleClearBoardFilter = async () => {
    setBoardTokenInput('');
    setSourceFilter('all');
    await executeSearch({
      boardToken: '',
      source: 'all',
    });
  };

  const handleSaveToTracker = async (job: DiscoveredJobItem) => {
    setSavingJobId(job.id);
    setErrorMessage(null);
    try {
      const res = await apiClient.saveDiscoveredJobToTracker({
        title: job.title,
        company: job.company,
        location: job.location,
        applyUrl: job.applyUrl,
        source: job.source,
        descriptionText: job.descriptionText || job.snippet,
        resumeId: selectedResumeId || undefined,
      });

      setJobs((prev) =>
        prev.map((item) =>
          item.id === job.id
            ? {
                ...item,
                isSavedInTracker: true,
                trackedApplicationId: res.application.id,
              }
            : item,
        ),
      );
      setStatusMessage(
        res.alreadyTracked
          ? `${job.title} at ${job.company} is already bookmarked in your Application Tracker.`
          : `Saved ${job.title} at ${job.company} to your Application Tracker.`,
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to save job to Application Tracker.',
      );
    } finally {
      setSavingJobId(null);
    }
  };

  const handleQuickMatch = async (job: DiscoveredJobItem) => {
    if (!selectedResumeId) {
      setErrorMessage('Create or select a resume first to run a grounded job match.');
      return;
    }

    setMatchingJobId(job.id);
    setErrorMessage(null);
    try {
      const res = await apiClient.runDiscoveredJobMatch({
        title: job.title,
        company: job.company,
        applyUrl: job.applyUrl,
        descriptionText: job.descriptionText || job.snippet,
        resumeId: selectedResumeId,
      });
      setRecentMatchBanner({
        jobTitle: job.title,
        company: job.company,
        match: res.match,
      });
      setStatusMessage(
        `Completed verified match analysis for ${job.title} at ${job.company}: ${res.match.score}% overall fit.`,
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to evaluate resume match.',
      );
    } finally {
      setMatchingJobId(null);
    }
  };

  const healthySources = sourcesStatus.filter((s) => s.ok && s.count > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2E5E9] dark:border-[#252A33]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1A1D23] dark:text-[#F0F2F5]">
              Live Job Board Discovery
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                feedMode === 'live'
                  ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46] dark:bg-[#064E3B]/40 dark:border-[#047857]/60 dark:text-[#6EE7B7]'
                  : 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E] dark:bg-[#78350F]/30 dark:border-[#92400E] dark:text-[#FDE68A]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  feedMode === 'live' ? 'bg-[#059669]' : 'bg-[#D97706]'
                }`}
              />
              {feedMode === 'live'
                ? `Live ATS Feeds (${liveCount} indexed)`
                : 'Offline Fallback Feed'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5A6270] dark:text-[#9EA7B4] mt-1">
            Query live public openings from Ashby, Greenhouse, Remotive &amp; Arbeitnow, score overlap against your verified resume without fabrication, and bookmark straight into Applications.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void executeSearch({ refresh: true })}
            disabled={isLoading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Live Feeds</span>
          </Button>
          <Link href="/app/applications">
            <Button variant="primary" size="sm" className="gap-1.5 text-xs">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Application Tracker</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Live Network Source Telemetry Pills */}
      {healthySources.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          <span className="font-semibold text-[#5A6270] dark:text-[#9EA7B4]">Active Boards:</span>
          {healthySources.map((src) => (
            <span
              key={src.source}
              className="px-2 py-0.5 rounded-md bg-white dark:bg-[#14171C] border border-[#E2E5E9] dark:border-[#252A33] text-[#1A1D23] dark:text-[#F0F2F5] font-mono"
            >
              {src.source} ({src.count})
            </span>
          ))}
          {fetchedAt && (
            <span className="text-[#848D9A] ml-auto">
              Synced {new Date(fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      )}

      {/* Search Landmark & Accessible Filter Form */}
      <search>
        <form
          onSubmit={handleSearchFormSubmit}
          aria-labelledby={`${uid}-search-heading`}
          className="rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] p-4 sm:p-5 space-y-4 shadow-xs"
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2
              id={`${uid}-search-heading`}
              className="text-xs font-bold uppercase tracking-wider text-[#5A6270] dark:text-[#9EA7B4]"
            >
              Search &amp; Filter Live ATS Boards
            </h2>
            {scoredResumeName && (
              <span className="text-[11px] text-[#5A6270] dark:text-[#9EA7B4]">
                Scoring fit against: <strong className="text-[#1A1D23] dark:text-[#F0F2F5]">{scoredResumeName}</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label
                htmlFor={`${uid}-job-query`}
                className="text-xs font-medium text-[#1A1D23] dark:text-[#F0F2F5]"
              >
                Role, Skill, or Company Keywords
              </label>
              <input
                id={`${uid}-job-query`}
                name="q"
                type="search"
                enterKeyHint="search"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="e.g. Engineer, TypeScript, Backend, React..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 px-3 text-xs rounded-md border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor={`${uid}-source-select`}
                className="text-xs font-medium text-[#1A1D23] dark:text-[#F0F2F5]"
              >
                ATS / Job Board Feed
              </label>
              <select
                id={`${uid}-source-select`}
                name="source"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as SourceOption)}
                className="h-9 px-2.5 text-xs rounded-md border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
              >
                <option value="all">All Live Feeds</option>
                <option value="ashby">Ashby (Linear, Notion)</option>
                <option value="greenhouse">Greenhouse (Stripe, Figma)</option>
                <option value="remotive">Remotive Remote Tech</option>
                <option value="arbeitnow">Arbeitnow Global</option>
                <option value="lever">Lever Boards</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor={`${uid}-workplace-select`}
                className="text-xs font-medium text-[#1A1D23] dark:text-[#F0F2F5]"
              >
                Workplace Mode
              </label>
              <select
                id={`${uid}-workplace-select`}
                name="workplace"
                value={workplaceFilter}
                onChange={(e) => setWorkplaceFilter(e.target.value as WorkplaceOption)}
                className="h-9 px-2.5 text-xs rounded-md border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
              >
                <option value="all">All Workplaces</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="flex flex-col gap-1">
              <label
                htmlFor={`${uid}-resume-select`}
                className="text-xs font-medium text-[#1A1D23] dark:text-[#F0F2F5]"
              >
                Compare Resume Fit
              </label>
              <select
                id={`${uid}-resume-select`}
                name="resumeId"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="h-9 px-2.5 text-xs rounded-md border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
              >
                {resumes.length === 0 ? (
                  <option value="">No resumes in workspace yet</option>
                ) : (
                  resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                      {r.isMaster ? ' (Master)' : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor={`${uid}-sort-select`}
                className="text-xs font-medium text-[#1A1D23] dark:text-[#F0F2F5]"
              >
                Sort Order
              </label>
              <select
                id={`${uid}-sort-select`}
                name="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-9 px-2.5 text-xs rounded-md border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
              >
                <option value="match">Best Verified Resume Match</option>
                <option value="recent">Most Recently Updated</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor={`${uid}-board-token`}
                className="text-xs font-medium text-[#1A1D23] dark:text-[#F0F2F5]"
              >
                Custom Company ATS Board (Optional)
              </label>
              <div className="flex gap-1.5">
                <select
                  aria-label="Custom ATS board provider"
                  value={boardProviderInput}
                  onChange={(e) =>
                    setBoardProviderInput(e.target.value as 'greenhouse' | 'ashby' | 'lever')
                  }
                  className="h-9 px-2 text-xs rounded-md border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5]"
                >
                  <option value="greenhouse">Greenhouse</option>
                  <option value="ashby">Ashby</option>
                  <option value="lever">Lever</option>
                </select>
                <input
                  id={`${uid}-board-token`}
                  name="boardToken"
                  type="text"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="e.g. stripe, linear"
                  value={boardTokenInput}
                  onChange={(e) => setBoardTokenInput(e.target.value)}
                  className="flex-1 min-w-0 h-9 px-2.5 text-xs rounded-md border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] focus:outline-none focus:ring-2 focus:ring-[#285FEA]"
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button
                id="search-live-jobs-btn"
                type="submit"
                variant="primary"
                size="sm"
                className="flex-1 h-9 gap-1.5 text-xs"
                disabled={isLoading}
              >
                <Search className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Search Live Jobs</span>
              </Button>
              {boardTokenInput && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handleClearBoardFilter()}
                  className="h-9 text-xs"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Quick Direct ATS Board Chips */}
          {boards.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#F1F3F5] dark:border-[#252A33]">
              <span className="text-[11px] font-medium text-[#848D9A] mr-1">
                Direct ATS Lookup:
              </span>
              {boards.map((board) => {
                const isSelected = boardTokenInput === board.token;
                return (
                  <button
                    key={`${board.provider}-${board.token}`}
                    type="button"
                    onClick={() => void handleQuickCompanyBoard(board)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#285FEA] text-white border-[#285FEA]'
                        : 'bg-[#F7F8FA] dark:bg-[#1D2128] text-[#5A6270] dark:text-[#9EA7B4] border-[#E2E5E9] dark:border-[#252A33] hover:border-[#285FEA] hover:text-[#285FEA]'
                    }`}
                  >
                    {board.name} · {board.provider}
                  </button>
                );
              })}
            </div>
          )}
        </form>
      </search>

      {/* Polite Status Announcement + Indeterminate Spinner */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 text-xs text-[#5A6270] dark:text-[#9EA7B4]"
        >
          {isLoading ? (
            <>
              <progress
                aria-label="Fetching live ATS job boards"
                className="hr-loading-spinner shrink-0"
              />
              <span>Querying live Greenhouse, Ashby, Remotive &amp; Arbeitnow boards...</span>
            </>
          ) : (
            <span>{statusMessage || `Indexed ${totalMatches} matching openings`}</span>
          )}
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="px-3.5 py-2.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] dark:border-[#7F1D1D] dark:bg-[#7F1D1D]/20 text-xs text-[#991B1B] dark:text-[#FCA5A5] flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grounded Match Result Banner */}
      {recentMatchBanner && (
        <div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] dark:border-[#047857]/60 dark:bg-[#064E3B]/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs text-[#065F46] dark:text-[#A7F3D0] space-y-0.5">
              <div className="font-bold">
                Verified Match Complete: {recentMatchBanner.jobTitle} at{' '}
                {recentMatchBanner.company} — {recentMatchBanner.match.score}% Overall Fit
              </div>
              <p>
                Saved to Job Matching history cleanly using only evidenced skills and resume bullets.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Link
              href={`/app/match?matchId=${recentMatchBanner.match.id}&resumeId=${selectedResumeId}`}
            >
              <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>View Evidence Report</span>
              </Button>
            </Link>
            <Link
              href={`/app/cover-letters?matchId=${recentMatchBanner.match.id}&resumeId=${selectedResumeId}`}
            >
              <Button variant="outline" size="sm" className="gap-1.5 text-xs bg-white dark:bg-[#14171C]">
                <Mail className="w-3.5 h-3.5" />
                <span>Write Cover Letter</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Jobs Result List */}
      <div className="space-y-3">
        {!isLoading && jobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#CBD0D7] dark:border-[#333945] bg-white dark:bg-[#14171C] p-10 text-center space-y-2.5">
            <p className="text-sm font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
              No openings matched your current filters
            </p>
            <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4]">
              Try clearing your keyword query or switching back to All Live Feeds.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setWorkplaceFilter('all');
                void handleClearBoardFilter();
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          jobs.map((job) => {
            const fit = classifyMatchTier(job.matchScore);
            const matchedSet = new Set(
              (job.matchedSkills || []).map((s) => s.toLowerCase()),
            );
            const isSaving = savingJobId === job.id;
            const isMatching = matchingJobId === job.id;

            return (
              <article
                key={job.id}
                className="rounded-xl border border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] p-4 sm:p-5 space-y-3 hover:border-[#CBD0D7] dark:hover:border-[#333945] transition-colors shadow-2xs"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Heading placed outside <summary> per HTML accessibility best practices */}
                      <h3 className="text-sm sm:text-base font-bold text-[#1A1D23] dark:text-[#F0F2F5]">
                        {job.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F1F3F5] dark:bg-[#1D2128] text-[#5A6270] dark:text-[#9EA7B4] border border-[#E2E5E9] dark:border-[#252A33]">
                        {job.source}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#EDF3FD] dark:bg-[#13203D] text-[#285FEA] dark:text-[#60A5FA]">
                        {job.workplaceType}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#5A6270] dark:text-[#9EA7B4] flex-wrap">
                      <span className="font-semibold text-[#1A1D23] dark:text-[#F0F2F5] inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#848D9A]" aria-hidden="true" />
                        {job.company}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#848D9A]" aria-hidden="true" />
                        {job.location}
                      </span>
                      <span>&middot; {formatRelativePostedDate(job.postedAt)}</span>
                      {job.salaryRange && (
                        <span className="font-mono text-[11px] font-medium text-[#059669] dark:text-[#6EE7B7]">
                          &middot; {job.salaryRange}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4] leading-relaxed">
                      {job.snippet}
                    </p>

                    {job.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {job.tags.map((tag) => {
                          const isMatched = matchedSet.has(tag.toLowerCase());
                          return (
                            <span
                              key={tag}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                                isMatched
                                  ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46] dark:bg-[#064E3B]/40 dark:border-[#047857]/60 dark:text-[#6EE7B7] font-semibold'
                                  : 'bg-[#F7F8FA] dark:bg-[#1D2128] border-[#E2E5E9] dark:border-[#252A33] text-[#5A6270] dark:text-[#9EA7B4]'
                              }`}
                            >
                              {isMatched ? `✓ ${tag}` : tag}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Compatibility & Action Bar */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#F1F3F5] dark:border-[#252A33]">
                    {selectedResumeId && (
                      <div className="flex items-center gap-2 lg:text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            fit.tier === 'strong'
                              ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46] dark:bg-[#064E3B]/40 dark:border-[#047857]/60 dark:text-[#6EE7B7]'
                              : fit.tier === 'moderate'
                                ? 'bg-[#EDF3FD] border-[#C7DBF9] text-[#285FEA] dark:bg-[#13203D] dark:border-[#1E3A78] dark:text-[#60A5FA]'
                                : 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E] dark:bg-[#78350F]/30 dark:border-[#92400E] dark:text-[#FDE68A]'
                          }`}
                        >
                          {job.matchScore ?? 0}% · {fit.label}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      {job.isSavedInTracker ? (
                        <Link href="/app/applications">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1 border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46] dark:border-[#047857] dark:bg-[#064E3B]/30 dark:text-[#6EE7B7]"
                          >
                            <BookmarkCheck className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Saved in Tracker</span>
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          isLoading={isSaving}
                          onClick={() => void handleSaveToTracker(job)}
                          className="h-8 text-xs gap-1"
                        >
                          <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Save to Tracker</span>
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        isLoading={isMatching}
                        onClick={() => void handleQuickMatch(job)}
                        className="h-8 text-xs gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#285FEA]" aria-hidden="true" />
                        <span>Match CV</span>
                      </Button>

                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 h-8 px-3 rounded-md bg-[#285FEA] hover:bg-[#1E4BC8] text-white text-xs font-medium transition-colors"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Native Semantic Disclosure Details for Full Job Description */}
                <details className="hr-job-details pt-1 text-xs">
                  <summary className="text-[11px] font-semibold text-[#285FEA] hover:text-[#1E4BC8] select-none py-1">
                    View Full Job Description
                  </summary>
                  <div className="mt-2 p-3.5 rounded-lg border border-[#E2E5E9] dark:border-[#252A33] bg-[#F7F8FA] dark:bg-[#1D2128]/60 text-xs text-[#1A1D23] dark:text-[#F0F2F5] whitespace-pre-line leading-relaxed max-h-72 overflow-y-auto">
                    {job.descriptionText}
                    <div className="mt-3 pt-2 border-t border-[#E2E5E9] dark:border-[#252A33] flex items-center justify-between gap-2 text-[11px] text-[#5A6270] dark:text-[#9EA7B4]">
                      <span>
                        Missing vs Resume:{' '}
                        {(job.missingKeywords?.length || 0) > 0
                          ? job.missingKeywords?.join(', ')
                          : 'Strong baseline coverage'}
                      </span>
                      <Link
                        href={`/app/match`}
                        className="inline-flex items-center gap-1 text-[#285FEA] font-medium hover:underline"
                      >
                        <span>Open Match Workspace</span>
                        <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </details>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
