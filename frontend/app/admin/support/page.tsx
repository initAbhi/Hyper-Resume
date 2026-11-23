'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Headphones,
  Mail,
  RefreshCw,
  Search,
  Inbox,
} from 'lucide-react';
import {
  apiClient,
  type AdminContactStatus,
  type AdminContactSubmission,
} from '@/lib/api-client';

const STATUS_OPTIONS: Array<{ value: AdminContactStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'spam', label: 'Spam' },
];

const STATUS_PILL: Record<AdminContactStatus, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-800 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  spam: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function AdminSupportPage() {
  const [items, setItems] = useState<AdminContactSubmission[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AdminContactStatus | 'all'>('all');
  const [selected, setSelected] = useState<AdminContactSubmission | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAdminContactSubmissions(search, status, 100);
      setItems(data.items || []);
      setUnreadCount(data.unreadCount || 0);
      setSelected((prev) => {
        if (!prev) return null;
        const refreshed = (data.items || []).find((i) => i.id === prev.id) || null;
        if (refreshed) setNotes(refreshed.adminNotes || '');
        return refreshed;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load support inbox');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    void load();
  }, [status, load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void load();
  };

  const openItem = (item: AdminContactSubmission) => {
    setSelected(item);
    setNotes(item.adminNotes || '');
  };

  const updateStatus = async (next: AdminContactStatus) => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await apiClient.updateAdminContactSubmission(selected.id, {
        status: next,
        adminNotes: notes,
      });
      setSelected(updated);
      setToast(`Marked as ${next.replace('_', ' ')}`);
      setTimeout(() => setToast(null), 2500);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submission');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-50 flex items-center gap-2">
            <Headphones className="h-5 w-5 text-[#285FEA]" />
            Support Inbox
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#285FEA] px-2 py-0.5 text-[11px] font-bold text-white">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Messages from the public Contact page and support@hype-resume.com form submissions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, subject…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#285FEA] focus:ring-2 focus:ring-[#285FEA]/15 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </form>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold border transition ${
                status === opt.value
                  ? 'border-[#285FEA] bg-[#285FEA]/10 text-[#285FEA]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {toast}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.05fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#14171C]">
          {loading && items.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-500">Loading inbox…</div>
          ) : items.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-slate-500">
              <Inbox className="h-8 w-8 text-slate-300" />
              No messages yet
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-[70vh] overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className={`w-full px-4 py-3.5 text-left transition hover:bg-slate-50 dark:hover:bg-zinc-900/60 ${
                      selected?.id === item.id ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-zinc-50">
                          {item.subject}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {item.fullName} · {item.email}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_PILL[item.status]}`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-600 dark:text-zinc-400">
                      {item.message}
                    </p>
                    <p className="mt-1.5 text-[10px] font-mono text-slate-400">
                      {new Date(item.createdAt).toLocaleString()} · {item.topic}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#14171C]">
          {!selected ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center text-sm text-slate-500">
              <Mail className="mb-2 h-8 w-8 text-slate-300" />
              Select a message to read and update its status
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_PILL[selected.status]}`}
                  >
                    {selected.status.replace('_', ' ')}
                  </span>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {selected.topic}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-zinc-50">
                  {selected.subject}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
                  From{' '}
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                    className="font-semibold text-[#285FEA] hover:underline"
                  >
                    {selected.fullName} &lt;{selected.email}&gt;
                  </a>
                </p>
                <p className="mt-0.5 text-[11px] font-mono text-slate-400">
                  {new Date(selected.createdAt).toLocaleString()} · ID {selected.id}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200">
                {selected.message}
              </div>

              <label className="block space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Admin notes
                </span>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#285FEA] dark:border-zinc-700 dark:bg-zinc-900"
                  placeholder="Internal notes (not visible to the user)"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {(['new', 'in_progress', 'resolved', 'spam'] as AdminContactStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={saving}
                    onClick={() => void updateStatus(s)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold border transition disabled:opacity-50 ${
                      selected.status === s
                        ? 'border-[#285FEA] bg-[#285FEA] text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Reply in email
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
