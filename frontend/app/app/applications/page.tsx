'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import {
  Briefcase,
  Plus,
  Trash2,
  Search,
  List,
  Kanban,
  Building2,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import {
  apiClient,
  JobApplication,
  JobApplicationStatus,
  Resume,
  parseApplicationMetadata,
  serializeApplicationMetadata,
  ApplicationRichMetadata,
} from '@/lib/api-client';
import { ChevronMetricBanner } from '@/components/applications/ChevronMetricBanner';
import { ApplicationTableView } from '@/components/applications/ApplicationTableView';
import { ApplicationKanbanView } from '@/components/applications/ApplicationKanbanView';
import { ApplicationDeepWorkspace } from '@/components/applications/ApplicationDeepWorkspace';
import { AddApplicationModal } from '@/components/applications/AddApplicationModal';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // View state: 'table' (spreadsheet) vs 'board' (kanban)
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');

  // Stage filter from the top chevron ribbon: 'all' or specific stage
  const [stageFilter, setStageFilter] = useState<JobApplicationStatus | 'all'>('all');

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Selected applications for batch actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Active job for Deep Workspace drilldown (Images 2-5)
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Modal for adding a job
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    let isMounted = true;
    Promise.all([apiClient.listApplications(), apiClient.listResumes()])
      .then(([appsData, resumesData]) => {
        if (!isMounted) return;
        setApplications(appsData);
        setResumes(resumesData);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load applications pipeline.',
        );
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute stage counts for the Chevron ribbon
  const stageCounts = useMemo(() => {
    const counts: Record<JobApplicationStatus | 'all', number> = {
      all: applications.length,
      bookmarked: 0,
      applying: 0,
      applied: 0,
      interviewing: 0,
      negotiating: 0,
      offer: 0,
      accepted: 0,
      withdrawn: 0,
      rejected: 0,
      ghosted: 0,
      archived: 0,
      draft: 0,
    };

    applications.forEach((app) => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });

    return counts;
  }, [applications]);

  // Filtered applications based on ribbon filter & search query
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Stage ribbon filter
      if (stageFilter !== 'all' && app.status !== stageFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const meta = parseApplicationMetadata(app.notes);
        const matchTitle = app.jobTitle.toLowerCase().includes(q);
        const matchCompany = app.companyName.toLowerCase().includes(q);
        const matchLocation = (meta.location || '').toLowerCase().includes(q);
        const matchSalary = (meta.salary || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCompany && !matchLocation && !matchSalary) {
          return false;
        }
      }

      return true;
    });
  }, [applications, stageFilter, searchQuery]);

  // Handle Selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredApplications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplications.map((a) => a.id));
    }
  };

  // Status inline update
  const handleUpdateStatus = async (appId: string, newStatus: JobApplicationStatus) => {
    try {
      const updated = await apiClient.updateApplication(appId, { status: newStatus });
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: updated.status } : app)),
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update application status');
    }
  };

  // Excitement inline update
  const handleUpdateExcitement = async (appId: string, stars: number) => {
    const target = applications.find((a) => a.id === appId);
    if (!target) return;

    const currentMeta = parseApplicationMetadata(target.notes);
    const updatedMeta: ApplicationRichMetadata = {
      ...currentMeta,
      excitement: stars,
    };

    const serialized = serializeApplicationMetadata(updatedMeta);
    try {
      await apiClient.updateApplication(appId, { notes: serialized });
      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, notes: serialized, metadata: updatedMeta } : app,
        ),
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update excitement rating');
    }
  };

  // Delete application
  const handleDeleteApplication = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this job application?')) return;
    try {
      await apiClient.deleteApplication(appId);
      setApplications((prev) => prev.filter((app) => app.id !== appId));
      setSelectedIds((prev) => prev.filter((id) => id !== appId));
      if (activeJobId === appId) {
        setActiveJobId(null);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete application');
    }
  };

  // Batch delete
  const handleBatchDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.length} selected application(s)?`,
      )
    ) {
      return;
    }

    try {
      for (const id of selectedIds) {
        await apiClient.deleteApplication(id);
      }
      setApplications((prev) => prev.filter((app) => !selectedIds.includes(app.id)));
      if (activeJobId && selectedIds.includes(activeJobId)) {
        setActiveJobId(null);
      }
      setSelectedIds([]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete selected applications');
    }
  };

  // Batch stage update
  const handleBatchMoveStage = async (newStatus: JobApplicationStatus) => {
    try {
      for (const id of selectedIds) {
        await apiClient.updateApplication(id, { status: newStatus });
      }
      setApplications((prev) =>
        prev.map((app) =>
          selectedIds.includes(app.id) ? { ...app, status: newStatus } : app,
        ),
      );
      setSelectedIds([]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to move selected applications');
    }
  };

  // Save changes from Deep Workspace
  const handleSaveFromWorkspace = async (updatedApp: JobApplication) => {
    try {
      const saved = await apiClient.updateApplication(updatedApp.id, {
        companyName: updatedApp.companyName,
        jobTitle: updatedApp.jobTitle,
        status: updatedApp.status,
        resumeId: updatedApp.resumeId,
        appliedDate: updatedApp.appliedDate,
        notes: updatedApp.notes,
      });

      setApplications((prev) =>
        prev.map((app) => (app.id === updatedApp.id ? { ...app, ...updatedApp, status: saved.status } : app)),
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save application changes');
    }
  };

  // Add new job
  const handleCreateApplication = async (data: {
    companyName: string;
    jobTitle: string;
    resumeId?: string;
    status: JobApplicationStatus;
    applicationUrl?: string;
    appliedDate?: string;
    notes?: string;
  }) => {
    try {
      const created = await apiClient.createApplication(data);
      const withParsedMeta: JobApplication = {
        ...created,
        notes: data.notes,
        metadata: parseApplicationMetadata(data.notes),
      };
      setApplications((prev) => [withParsedMeta, ...prev]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create application');
    }
  };

  // Load sample pipeline data (matching Teal reference images 1-4)
  const handleLoadSampleData = async () => {
    const sampleJobs = [
      {
        companyName: 'Acme Corp',
        jobTitle: 'Operations Manager - Sample Job',
        status: 'applying' as JobApplicationStatus,
        notes: serializeApplicationMetadata({
          salary: '$145,000 - $175,000',
          location: 'remote',
          excitement: 4,
          savedDate: new Date().toISOString().slice(0, 10),
          deadline: '2026-11-15',
          followUpDate: '2026-10-24',
          jobDescription: `Job Responsibilities:
• Ensure all operations are carried on in an appropriate, cost-effective way
• Purchase materials, plan inventory and oversee warehouse efficiency
• Formulate strategic and operational objectives
• Creating and analyzing budgets and forecasts
• Perform quality controls and monitor production KPIs

Requirements:
• Experience creating and presenting annual forecasts
• Experience overseeing a budget of over $1M annually`,
          checklist: [
            { id: '1', text: 'Tailor resume with job description keywords', completed: true, category: 'applying' },
            { id: '2', text: 'Connect with hiring manager on LinkedIn', completed: false, category: 'applying' },
            { id: '3', text: 'Prepare operations KPI metrics portfolio', completed: false, category: 'interviewing' },
          ],
        }),
      },
      {
        companyName: 'Acme Corp',
        jobTitle: 'Product Designer - Sample Job',
        status: 'bookmarked' as JobApplicationStatus,
        notes: serializeApplicationMetadata({
          salary: '$130,000 - $160,000',
          location: 'Anywhere, USA',
          excitement: 3,
          savedDate: new Date().toISOString().slice(0, 10),
          deadline: '2026-11-20',
          followUpDate: '2026-10-25',
          jobDescription: `Job Responsibilities:
• Lead end-to-end user experience and interface design for core web application
• Conduct user interviews, usability testing, and prototype iterative designs in Figma
• Partner closely with engineering to ensure design system consistency`,
        }),
      },
      {
        companyName: 'Acme Corp',
        jobTitle: 'Marketing Manager - Sample Job',
        status: 'bookmarked' as JobApplicationStatus,
        notes: serializeApplicationMetadata({
          salary: '$120,000 - $150,000',
          location: 'Anywhere, USA',
          excitement: 3,
          savedDate: new Date().toISOString().slice(0, 10),
          deadline: '2026-11-25',
          followUpDate: '2026-10-26',
        }),
      },
    ];

    try {
      for (const sample of sampleJobs) {
        await apiClient.createApplication(sample);
      }
      const refreshed = await apiClient.listApplications();
      setApplications(refreshed);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to load sample applications');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <span>Job Application Pipeline</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Track applications, pipeline velocity, interview rounds, and tailored resume variants in one unified workspace.
          </p>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          {/* View Mode Switcher (List vs Kanban) */}
          <div className="flex items-center p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => {
                setViewMode('table');
                setActiveJobId(null);
              }}
              title="Table view"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' && !activeJobId
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('board');
                setActiveJobId(null);
              }}
              title="Kanban Board view"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'board' && !activeJobId
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Job</span>
          </Button>
        </div>
      </div>

      {errorMessage && <Alert variant="destructive">{errorMessage}</Alert>}

      {/* 2. Top Chevron Metric Ribbon (Images 1-4) */}
      <ChevronMetricBanner
        activeFilter={stageFilter}
        onSelectFilter={(filter) => {
          setStageFilter(filter);
          setActiveJobId(null);
        }}
        counts={stageCounts}
      />

      {/* 3. Deep Workspace Drilldown View (Images 2-5) */}
      {activeJobId ? (
        <ApplicationDeepWorkspace
          applications={applications}
          activeAppId={activeJobId}
          resumes={resumes}
          onSelectApp={(id) => setActiveJobId(id)}
          onCloseWorkspace={() => setActiveJobId(null)}
          onSaveApplication={handleSaveFromWorkspace}
          onDeleteApplication={handleDeleteApplication}
        />
      ) : (
        <>
          {/* 4. Search and Batch Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by role, company, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Batch Controls (when rows are selected) */}
            {selectedIds.length > 0 ? (
              <div className="flex items-center gap-2 p-1 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs animate-in fade-in">
                <span className="font-semibold text-blue-700 dark:text-blue-300">
                  {selectedIds.length} selected
                </span>

                <div className="h-4 w-px bg-blue-200 dark:bg-blue-800 mx-1" />

                {/* Move to stage */}
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBatchMoveStage(e.target.value as JobApplicationStatus);
                      e.target.value = '';
                    }
                  }}
                  className="text-xs p-1 rounded border border-blue-200 dark:border-blue-800 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                >
                  <option value="" disabled>
                    Move to Stage...
                  </option>
                  <option value="bookmarked">Bookmarked</option>
                  <option value="applying">Applying</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="accepted">Accepted</option>
                </select>

                {/* Delete selected */}
                <button
                  type="button"
                  onClick={handleBatchDelete}
                  className="text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                {/* Deselect all */}
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-[11px] ml-1"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="text-xs text-zinc-500 flex items-center gap-2">
                <span>
                  Showing {filteredApplications.length} of {applications.length} jobs
                </span>
              </div>
            )}
          </div>

          {/* 5. Main Views (Table or Kanban) */}
          {isLoading ? (
            <div className="p-16 text-center text-xs text-zinc-400 animate-pulse border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
              Loading pipeline data...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mb-4">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Your Job Pipeline is Empty
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mt-1.5 mb-6 leading-relaxed">
                Track positions, salary targets, dates, interview rounds, and tailored resume variants in one high-velocity tracker.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  className="gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Track First Job</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadSampleData}
                  className="gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Load Sample Pipeline</span>
                </Button>
              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-12 text-center border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-xs text-zinc-500">
              No applications match the current filter.
              <button
                type="button"
                onClick={() => {
                  setStageFilter('all');
                  setSearchQuery('');
                }}
                className="text-blue-600 dark:text-blue-400 font-semibold ml-2 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <ApplicationTableView
              applications={filteredApplications}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
              onSelectJob={(app) => setActiveJobId(app.id)}
              onUpdateStatus={handleUpdateStatus}
              onUpdateExcitement={handleUpdateExcitement}
              onDelete={handleDeleteApplication}
            />
          ) : (
            <ApplicationKanbanView
              applications={filteredApplications}
              onSelectJob={(app) => setActiveJobId(app.id)}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </>
      )}

      {/* 6. Add Job Modal */}
      <AddApplicationModal
        isOpen={isAddModalOpen}
        resumes={resumes}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateApplication}
      />
    </div>
  );
}
