'use client';

import { logger } from '@/lib/logger';
import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Search,
  Key,
  Webhook,
  Layers,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import {
  apiClient,
  AdminPaymentSettings,
  AdminPaymentOrder,
} from '@/lib/api-client';

export default function AdminPaymentsPage() {
  const [settings, setSettings] = useState<AdminPaymentSettings | null>(null);
  const [payments, setPayments] = useState<AdminPaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingMode, setUpdatingMode] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [generatingLink, setGeneratingLink] = useState(false);
  const [testCheckoutUrl, setTestCheckoutUrl] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsData, paymentsData] = await Promise.all([
        apiClient.getAdminPaymentSettings(),
        apiClient.getAdminPayments(search, statusFilter, modeFilter, 50),
      ]);
      setSettings(settingsData);
      setPayments(paymentsData);
    } catch (err) {
      logger.error('Failed to load payments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, modeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleMode = async (targetMode: 'test_mode' | 'live_mode') => {
    if (!settings || settings.mode === targetMode || updatingMode) return;
    if (targetMode === 'live_mode') {
      const confirmed = window.confirm(
        '⚠️ Switch Payment Gateway to LIVE PRODUCTION?\n\nReal customer credit cards and UPI accounts will be charged real money.',
      );
      if (!confirmed) return;
    }

    setUpdatingMode(true);
    try {
      const updated = await apiClient.updateAdminPaymentMode(targetMode);
      setSettings(updated);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to switch payment mode');
    } finally {
      setUpdatingMode(false);
    }
  };

  const handleTestCheckout = async (planId = 'job_hunt_pack') => {
    setGeneratingLink(true);
    setTestCheckoutUrl(null);
    try {
      const res = await apiClient.testAdminCheckout(planId);
      setTestCheckoutUrl(res.checkoutUrl);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to generate checkout link');
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isLive = settings?.mode === 'live_mode';

  // Derived metrics
  const totalVolume = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((acc, curr) => acc + (curr.amountMinor || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payments & Gateway Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Dodo Payments environments, toggle live/test modes, and inspect customer transactions.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-2xs self-start"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* GATEWAY CONTROLLER CARD */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  isLive
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {isLive ? '🟢 LIVE PRODUCTION ACTIVE' : '🧪 TEST / SANDBOX ACTIVE'}
              </span>
              <span className="text-xs text-slate-400">Gateway: Dodo Payments</span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">
              {isLive ? 'Real Money Transactions Enabled' : 'Sandbox Simulated Transactions Enabled'}
            </h3>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              {isLive
                ? 'Your website is actively processing real customer payments via Dodo Payments. Webhooks and Meta Conversions API events are verified against live credentials.'
                : 'Checkouts are routed to Dodo test environment. Test card numbers are accepted and no real bank deductions take place.'}
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex flex-col items-start lg:items-end gap-2">
            <span className="text-xs font-medium text-slate-500">Switch Environment:</span>
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => handleToggleMode('test_mode')}
                disabled={updatingMode}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
                  !isLive
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                Test Mode
              </button>

              <button
                type="button"
                onClick={() => handleToggleMode('live_mode')}
                disabled={updatingMode}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
                  isLive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Live Mode
              </button>
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Key className="h-3.5 w-3.5 text-blue-600" />
              <span>Active API Key</span>
            </div>
            <div className="font-mono text-xs font-semibold text-slate-800">
              {isLive ? settings?.liveApiKeyMasked : settings?.testApiKeyMasked}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Webhook className="h-3.5 w-3.5 text-purple-600" />
              <span>Active Webhook Key</span>
            </div>
            <div className="font-mono text-xs font-semibold text-slate-800">
              {isLive ? settings?.liveWebhookKeyMasked : settings?.testWebhookKeyMasked}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Layers className="h-3.5 w-3.5 text-emerald-600" />
              <span>Job Hunt Pack (₹399)</span>
            </div>
            <div className="font-mono text-xs font-semibold text-slate-800 truncate">
              {isLive ? settings?.liveProducts?.job_hunt_pack : settings?.testProducts?.job_hunt_pack}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Layers className="h-3.5 w-3.5 text-amber-600" />
              <span>Job Hunt Pro (₹899)</span>
            </div>
            <div className="font-mono text-xs font-semibold text-slate-800 truncate">
              {isLive ? settings?.liveProducts?.job_hunt_pro : settings?.testProducts?.job_hunt_pro}
            </div>
          </div>
        </div>

        {/* Verification Check Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500">
            Generate an instant checkout session to verify Dodo responds with 200 OK.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTestCheckout('job_hunt_pack')}
              disabled={generatingLink}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              Verify Pack (₹399)
            </button>
            <button
              onClick={() => handleTestCheckout('job_hunt_pro')}
              disabled={generatingLink}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              Verify Pro (₹899)
            </button>
          </div>
        </div>

        {testCheckoutUrl && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-xs">
            <div className="font-mono text-slate-800 truncate max-w-xl">
              {testCheckoutUrl}
            </div>
            <a
              href={testCheckoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-[#285FEA] px-3 py-1.5 font-bold text-white hover:bg-blue-600 transition shrink-0"
            >
              <span>Open Checkout</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>

      {/* 4 SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Total Orders</div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">{payments.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Succeeded</div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600">
            {payments.filter((p) => p.status === 'succeeded').length}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Pending</div>
          <div className="mt-1 text-2xl font-extrabold text-amber-600">
            {payments.filter((p) => p.status === 'pending').length}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="text-xs text-slate-400 font-medium">Settled Volume</div>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">
            ₹{(totalVolume / 100).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order ID or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#285FEA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="succeeded">Succeeded</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Modes</option>
              <option value="test_mode">Test Mode</option>
              <option value="live_mode">Live Mode</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-[#285FEA] px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 transition shadow-xs"
            >
              Filter
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
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Plan</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Mode</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    No payment orders matched your query.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5 font-mono text-slate-800 font-semibold flex items-center gap-1.5">
                      <span>{p.orderId}</span>
                      <button
                        onClick={() => copyToClipboard(p.orderId)}
                        className="text-slate-400 hover:text-slate-600"
                        title="Copy Order ID"
                      >
                        {copiedId === p.orderId ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{p.userEmail}</div>
                      <div className="text-[11px] text-slate-400">User ID: {p.userId.slice(0, 8)}...</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-800 font-medium">
                      {p.planName}
                    </td>
                    <td className="px-5 py-3.5 text-slate-900 font-bold">
                      {p.amountFormatted}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          p.environmentMode === 'live_mode'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {p.environmentMode === 'live_mode' ? 'LIVE' : 'TEST'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          p.status === 'succeeded'
                            ? 'bg-emerald-50 text-emerald-700'
                            : p.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            p.status === 'succeeded'
                              ? 'bg-emerald-500'
                              : p.status === 'pending'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(p.createdAt).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {p.checkoutUrl ? (
                        <a
                          href={p.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <span>Checkout</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-slate-300 text-[11px]">—</span>
                      )}
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

