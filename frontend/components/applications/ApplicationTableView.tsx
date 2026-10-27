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
  DollarSign,
  MapPin,
  ExternalLink,
  Trash2,
  FileText,
  Star,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ApplicationTableViewProps {
  applications: JobApplication[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onSelectJob: (app: JobApplication) => void;
  onUpdateStatus: (id: string, newStatus: JobApplicationStatus) => void;
  onUpdateExcitement: (id: string, stars: number) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<
  JobApplicationStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  bookmarked: {
    label: 'Bookmarked',
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-700 dark:text-zinc-300',
    border: 'border-zinc-200 dark:border-zinc-700',
  },
  applying: {
    label: 'Applying',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
  },
  applied: {
    label: 'Applied',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  interviewing: {
    label: 'Interviewing',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  negotiating: {
    label: 'Negotiating',
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-800 dark:text-zinc-200',
    border: 'border-zinc-300 dark:border-zinc-700',
  },
  offer: {
    label: 'Offer',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  accepted: {
    label: 'Accepted',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  withdrawn: {
    label: 'Withdrawn',
    bg: 'bg-zinc-100 dark:bg-zinc-800/60',
    text: 'text-zinc-500 dark:text-zinc-400',
    border: 'border-zinc-200 dark:border-zinc-700',
  },
  rejected: {
    label: 'Not Selected',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
  },
  ghosted: {
    label: 'No Response',
    bg: 'bg-zinc-100 dark:bg-zinc-800/40',
    text: 'text-zinc-600 dark:text-zinc-400',
    border: 'border-zinc-200 dark:border-zinc-700',
  },
  archived: {
    label: 'Archived',
    bg: 'bg-zinc-100 dark:bg-zinc-800/40',
    text: 'text-zinc-500 dark:text-zinc-400',
    border: 'border-zinc-200 dark:border-zinc-700',
  },
  draft: {
    label: 'Draft',
    bg: 'bg-zinc-100 dark:bg-zinc-800',
    text: 'text-zinc-600 dark:text-zinc-400',
    border: 'border-zinc-200 dark:border-zinc-700',
  },
};

export function ApplicationTableView({
  applications,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onSelectJob,
  onUpdateStatus,
  onUpdateExcitement,
  onDelete,
}: ApplicationTableViewProps) {
  const isAllSelected =
    applications.length > 0 && selectedIds.length === applications.length;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 font-semibold tracking-wider uppercase text-[11px]">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  aria-label="Select all applications"
                  className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 min-w-[200px]">Job Position</th>
              <th className="py-3 px-3 min-w-[140px]">Company</th>
              <th className="py-3 px-3 min-w-[110px]">Max. Salary</th>
              <th className="py-3 px-3 min-w-[110px]">Location</th>
              <th className="py-3 px-3 min-w-[130px]">Status</th>
              <th className="py-3 px-3 min-w-[95px]">Date Saved</th>
              <th className="py-3 px-3 min-w-[95px]">Deadline</th>
              <th className="py-3 px-3 min-w-[95px]">Date Applied</th>
              <th className="py-3 px-3 min-w-[95px]">Follow Up</th>
              <th className="py-3 px-3 min-w-[110px]">Excitement</th>
              <th className="py-3 px-3 w-16 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
            {applications.map((app) => {
              const meta: ApplicationRichMetadata =
                app.metadata || parseApplicationMetadata(app.notes);
              const isSelected = selectedIds.includes(app.id);
              const statusCfg =
                STATUS_CONFIG[app.status] || STATUS_CONFIG['applied'];
              const excitementStars = Math.max(0, Math.min(5, meta.excitement ?? 0));

              return (
                <tr
                  key={app.id}
                  className={`group transition-colors hover:bg-zinc-50/90 dark:hover:bg-zinc-800/40 ${
                    isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(app.id)}
                      aria-label={`Select ${app.jobTitle}`}
                      className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>

                  {/* Job Position */}
                  <td className="py-3.5 px-3">
                    <button
                      type="button"
                      onClick={() => onSelectJob(app)}
                      className="text-left font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 group-hover:underline flex items-center gap-1.5 cursor-pointer max-w-[280px] truncate"
                    >
                      <span className="truncate">{app.jobTitle}</span>
                      {meta.jobDescription && (
                        <span
                          title="Has job description and ATS keywords"
                          className="shrink-0 text-emerald-500"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                    {app.applicationUrl && (
                      <a
                        href={app.applicationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-zinc-400 hover:text-blue-500 inline-flex items-center gap-0.5 mt-0.5"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Job post</span>
                      </a>
                    )}
                  </td>

                  {/* Company */}
                  <td className="py-3.5 px-3">
                    <button
                      type="button"
                      onClick={() => onSelectJob(app)}
                      className="text-left font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer flex items-center gap-1.5 truncate max-w-[160px]"
                    >
                      <span className="w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300 shrink-0">
                        {app.companyName.charAt(0).toUpperCase()}
                      </span>
                      <span className="truncate">{app.companyName}</span>
                    </button>
                  </td>

                  {/* Max Salary */}
                  <td className="py-3.5 px-3 text-zinc-600 dark:text-zinc-300 font-mono text-[11px]">
                    {meta.salary || 'US$0'}
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400 max-w-[120px] truncate">
                    {meta.location || 'remote'}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-3">
                    <select
                      value={app.status}
                      onChange={(e) =>
                        onUpdateStatus(app.id, e.target.value as JobApplicationStatus)
                      }
                      className={`text-xs font-medium py-1 px-2 rounded-md border cursor-pointer transition-colors ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    >
                      <option value="bookmarked">Bookmarked</option>
                      <option value="applying">Applying</option>
                      <option value="applied">Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="negotiating">Negotiating</option>
                      <option value="offer">Offer</option>
                      <option value="accepted">Accepted</option>
                      <option value="withdrawn">I Withdrew</option>
                      <option value="rejected">Not Selected</option>
                      <option value="ghosted">No Response</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>

                  {/* Date Saved */}
                  <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400">
                    {formatDate(meta.savedDate || app.createdAt)}
                  </td>

                  {/* Deadline */}
                  <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400">
                    {meta.deadline ? (
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {formatDate(meta.deadline)}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>

                  {/* Date Applied */}
                  <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400">
                    {formatDate(app.appliedDate)}
                  </td>

                  {/* Follow Up */}
                  <td className="py-3.5 px-3">
                    {meta.followUpDate ? (
                      <span className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300 font-medium">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {formatDate(meta.followUpDate)}
                      </span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>

                  {/* Excitement Rating (1-5 clickable stars) */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <button
                          key={starIdx}
                          type="button"
                          onClick={() => onUpdateExcitement(app.id, starIdx)}
                          title={`Rate ${starIdx} star${starIdx > 1 ? 's' : ''}`}
                          className="text-zinc-300 dark:text-zinc-700 hover:text-amber-400 transition-colors cursor-pointer p-0.5"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              starIdx <= excitementStars
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-300 dark:text-zinc-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectJob(app)}
                        title="Open Deep Workspace"
                        className="p-1 rounded-md text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(app.id)}
                        title="Delete application"
                        className="p-1 rounded-md text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
