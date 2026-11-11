'use client';

import React from 'react';
import {
  JobApplication,
  JobApplicationStatus,
  ApplicationRichMetadata,
  parseApplicationMetadata,
} from '@/lib/api-client';
import {
  Building2,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface ApplicationKanbanViewProps {
  applications: JobApplication[];
  onSelectJob: (app: JobApplication) => void;
  onUpdateStatus: (id: string, newStatus: JobApplicationStatus) => void;
}

const KANBAN_COLUMNS: {
  key: JobApplicationStatus;
  label: string;
  dotColor: string;
}[] = [
  { key: 'bookmarked', label: 'Bookmarked', dotColor: 'bg-zinc-400' },
  { key: 'applying', label: 'Applying', dotColor: 'bg-amber-400' },
  { key: 'applied', label: 'Applied', dotColor: 'bg-blue-500' },
  { key: 'interviewing', label: 'Interviewing', dotColor: 'bg-purple-500' },
  { key: 'offer', label: 'Offer Received', dotColor: 'bg-teal-500' },
  { key: 'negotiating', label: 'Negotiating', dotColor: 'bg-indigo-500' },
  { key: 'accepted', label: 'Accepted', dotColor: 'bg-emerald-500' },
];

export function ApplicationKanbanView({
  applications,
  onSelectJob,
  onUpdateStatus,
}: ApplicationKanbanViewProps) {
  const moveStage = (
    appId: string,
    currentStatus: JobApplicationStatus,
    direction: 'next' | 'prev',
  ) => {
    const keys = KANBAN_COLUMNS.map((c) => c.key);
    const currentIndex = keys.indexOf(currentStatus);
    if (currentIndex === -1) return;

    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < keys.length) {
      onUpdateStatus(appId, keys[newIndex]);
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4 no-scrollbar">
      <div className="flex gap-4 min-w-[1260px] items-start">
        {KANBAN_COLUMNS.map((col, colIdx) => {
          const colApps = applications.filter((a) => a.status === col.key);

          return (
            <div
              key={col.key}
              className="flex-1 min-w-[220px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    {col.label}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {colApps.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 min-h-[350px]">
                {colApps.length === 0 ? (
                  <div className="h-32 border border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-lg flex items-center justify-center text-[11px] text-zinc-400">
                    No jobs in this stage
                  </div>
                ) : (
                  colApps.map((app) => {
                    const meta: ApplicationRichMetadata =
                      app.metadata || parseApplicationMetadata(app.notes);
                    const stars = Math.max(0, Math.min(5, meta.excitement ?? 0));

                    return (
                      <div
                        key={app.id}
                        className="group relative p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-sm transition-all"
                      >
                        {/* Title and Company */}
                        <div
                          onClick={() => onSelectJob(app)}
                          className="cursor-pointer"
                        >
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                            {app.jobTitle}
                          </h4>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1 line-clamp-1">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span>{app.companyName}</span>
                          </p>
                        </div>

                        {/* Salary and Location */}
                        <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          <span className="font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                            {meta.salary || 'US$0'}
                          </span>
                          <span className="truncate max-w-[90px]">
                            {meta.location || 'remote'}
                          </span>
                        </div>

                        {/* Excitement and Next Action */}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-2.5 h-2.5 ${
                                  s <= stars
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-zinc-300 dark:text-zinc-700'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Quick Stage Shifters */}
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {colIdx > 0 && (
                              <button
                                type="button"
                                title="Move to previous stage"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveStage(app.id, app.status, 'prev');
                                }}
                                className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                            )}
                            {colIdx < KANBAN_COLUMNS.length - 1 && (
                              <button
                                type="button"
                                title="Advance to next stage"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveStage(app.id, app.status, 'next');
                                }}
                                className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
