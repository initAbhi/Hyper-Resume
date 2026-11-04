import { logger } from '@/lib/logger';
'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Search,
  Layers,
  Sparkles,
  Calendar,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { apiClient, AdminResumeItem } from '@/lib/api-client';

export default function AdminResumesPage() {
  const [resumes, setResumes] = useState<AdminResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadResumes = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAdminResumes(search, 100);
      setResumes(data);
    } catch (err) {
      logger.error('Failed to load resumes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadResumes();
  };

  const masterCount = resumes.filter((r) => r.isMaster).length;
  const variantCount = resumes.length - masterCount;

  return (
    <div className="space-y-6">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Resumes & Content Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit candidate resumes, tailored job variants, and template distribution across the platform.
          </p>
        </div>

        <button
          onClick={loadResumes}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-2xs self-start"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Total Resumes</div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">{resumes.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Master Profiles</div>
          <div className="mt-1 text-2xl font-extrabold text-[#285FEA]">{masterCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Tailored Variants</div>
          <div className="mt-1 text-2xl font-extrabold text-indigo-600">{variantCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Active Templates</div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600">3 Types</div>
        </div>
      </div>

      {/* SEARCH TOOLBAR */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search resumes by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#285FEA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-[#285FEA] px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 transition shadow-xs"
          >
            Search
          </button>
        </form>
      </div>

      {/* DATA TABLE */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Resume Title</th>
                <th className="px-5 py-3.5">Candidate / User</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Template</th>
                <th className="px-5 py-3.5">Version</th>
                <th className="px-5 py-3.5">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resumes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No resumes found matching criteria.
                  </td>
                </tr>
              ) : (
                resumes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#285FEA]" />
                      <span>{r.name}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                      {r.userEmail}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          r.isMaster
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.isMaster ? 'MASTER' : 'VARIANT'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {r.templateKey}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      v{r.version}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(r.updatedAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

