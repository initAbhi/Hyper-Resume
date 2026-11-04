import { logger } from '@/lib/logger';
'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Coins,
  FileText,
  Shield,
  UserCheck,
  PlusCircle,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { apiClient, AdminUserItem } from '@/lib/api-client';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Grant Credits Modal state
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [grantAmount, setGrantAmount] = useState<number>(30);
  const [grantReason, setGrantReason] = useState('Customer Support Courtesy Grant');
  const [granting, setGranting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAdminUsers(search, roleFilter, 100);
      setUsers(data);
    } catch (err) {
      logger.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleGrantCredits = async () => {
    if (!selectedUser || grantAmount <= 0) return;
    setGranting(true);
    try {
      const res = await apiClient.grantUserCredits(selectedUser.id, grantAmount, grantReason);
      setToastMessage(`Granted ${grantAmount} credits to ${selectedUser.email}. New balance: ${res.newBalance}`);
      setSelectedUser(null);
      await loadUsers();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to grant credits');
    } finally {
      setGranting(false);
    }
  };

  const totalCreditsAllocated = users.reduce((acc, u) => acc + (u.creditBalance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Users & Account Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View registered candidates, inspect resume counts, and manage AI credit allowances.
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-2xs self-start"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Total Registered</div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">{users.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Active Accounts</div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600">
            {users.filter((u) => u.isActive).length}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Administrators</div>
          <div className="mt-1 text-2xl font-extrabold text-indigo-600">
            {users.filter((u) => u.role === 'admin').length}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Total Credits In Circulation</div>
          <div className="mt-1 text-2xl font-extrabold text-amber-600">
            {totalCreditsAllocated.toLocaleString()}
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS TOOLBAR */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#285FEA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="user">Candidate (User)</option>
              <option value="admin">Administrator</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-[#285FEA] px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 transition shadow-xs"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* DATA TABLE */}
      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Credit Balance</th>
                <th className="px-5 py-3.5">Resumes</th>
                <th className="px-5 py-3.5">Registered</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No users matched your query.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const initials = u.fullName
                    ? u.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'U';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 border border-slate-200">
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.fullName}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.isActive ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200/80 rounded-md px-2 py-0.5">
                          <Coins className="h-3 w-3 text-amber-600" />
                          {u.creditBalance} credits
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-700">
                        {u.resumesCount}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <PlusCircle className="h-3 w-3 text-blue-600" />
                          <span>Grant Credits</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRANT CREDITS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Coins className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Grant Bonus Credits</h3>
                  <p className="text-[11px] text-slate-400">Recipient: {selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Credit Amount
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[10, 30, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setGrantAmount(amt)}
                      className={`rounded-lg py-1.5 text-xs font-bold transition border ${
                        grantAmount === amt
                          ? 'bg-[#285FEA] text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason / Internal Note
                </label>
                <input
                  type="text"
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g. Courtesy test grant"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGrantCredits}
                disabled={granting}
                className="rounded-xl bg-[#285FEA] px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 transition shadow-xs disabled:opacity-50"
              >
                {granting ? 'Granting...' : `Confirm Grant (+${grantAmount})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

