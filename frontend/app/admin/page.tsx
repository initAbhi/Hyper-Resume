'use client';

import { logger } from '@/lib/logger';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Eye,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  DollarSign,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  apiClient,
  AdminStats,
  AdminAnalyticsOverview,
  AdminPaymentOrder,
  AdminPaymentSettings,
} from '@/lib/api-client';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalyticsOverview | null>(null);
  const [recentPayments, setRecentPayments] = useState<AdminPaymentOrder[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<AdminPaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingMode, setUpdatingMode] = useState(false);
  const [confirmLive, setConfirmLive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [statsData, analyticsData, paymentsData, settingsData] = await Promise.all([
        apiClient.getAdminStats(),
        apiClient.getAdminAnalytics().catch(() => null),
        apiClient.getAdminPayments(undefined, undefined, undefined, 5).catch(() => []),
        apiClient.getAdminPaymentSettings().catch(() => null),
      ]);
      setStats(statsData);
      if (analyticsData) setAnalytics(analyticsData);
      setRecentPayments(paymentsData);
      setPaymentSettings(settingsData);
    } catch (err: unknown) {
      logger.error('Failed to load dashboard data', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const executeToggleMode = async (targetMode: 'test_mode' | 'live_mode') => {
    if (!paymentSettings || paymentSettings.mode === targetMode || updatingMode) return;
    setUpdatingMode(true);
    setConfirmLive(false);
    setErrorMessage(null);
    try {
      const updated = await apiClient.updateAdminPaymentMode(targetMode);
      setPaymentSettings(updated);
      const newStats = await apiClient.getAdminStats().catch(() => null);
      if (newStats) setStats(newStats);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to switch payment mode');
    } finally {
      setUpdatingMode(false);
    }
  };

  const handleToggleMode = (targetMode: 'test_mode' | 'live_mode') => {
    if (!paymentSettings || paymentSettings.mode === targetMode || updatingMode) return;
    if (targetMode === 'live_mode') {
      setConfirmLive(true);
      return;
    }
    void executeToggleMode(targetMode);
  };

  const isLive = paymentSettings?.mode === 'live_mode';

  // Use real analytics chartData only (no fabricated fallback traffic numbers — FN-42)
  const chartPoints = analytics?.chartData || [];

  // Dynamic Y-axis scaling instead of hardcoded 1600 (FN-42)
  const maxVal = Math.max(
    10,
    ...chartPoints.flatMap((p) => [p.visitors || 0, p.pageViews || 0]),
  ) * 1.15;
  const svgWidth = 900;
  const svgHeight = 240;
  const stepX = chartPoints.length > 1 ? svgWidth / (chartPoints.length - 1) : svgWidth;

  const visitorPoints = chartPoints
    .map((p, i) => `${i * stepX},${svgHeight - (p.visitors / maxVal) * svgHeight}`)
    .join(' ');

  const pageViewPoints = chartPoints
    .map((p, i) => `${i * stepX},${svgHeight - (p.pageViews / maxVal) * svgHeight}`)
    .join(' ');

  const visitorArea = chartPoints.length > 0 ? `0,${svgHeight} ${visitorPoints} ${(chartPoints.length - 1) * stepX},${svgHeight}` : '';
  const pageViewArea = chartPoints.length > 0 ? `0,${svgHeight} ${pageViewPoints} ${(chartPoints.length - 1) * stepX},${svgHeight}` : '';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight">Admin Overview</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Live platform telemetry, payment conversions, and gateway control.</p>
        </div>

        <button
          type="button"
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {errorMessage && (
        <div role="alert" className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-200">
          {errorMessage}
        </div>
      )}

      {confirmLive && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-amber-900 dark:text-amber-200">
            Switch Payment Gateway to LIVE PRODUCTION? Real customer cards and UPI accounts will be charged.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void executeToggleMode('live_mode')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
            >
              Confirm Live Mode
            </button>
            <button
              type="button"
              onClick={() => setConfirmLive(false)}
              className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 4 TOP KPI METRIC CARDS matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Unique Visitors */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="text-xs font-medium text-slate-500">Unique Visitors</div>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {(analytics?.overview.uniqueVisitors ?? 0).toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">First-party tracked sessions</p>
        </div>

        {/* Card 2: Page Views */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="text-xs font-medium text-slate-500">Page Views</div>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {(analytics?.overview.pageViews ?? 0).toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Last 7d: {(analytics?.overview.last7DayPageViews ?? 0).toLocaleString()} · Landing:{' '}
            {(analytics?.overview.landingPageViews ?? 0).toLocaleString()}
          </p>
        </div>

        {/* Card 3: Paid Orders */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="text-xs font-medium text-slate-500">Paid Conversions</div>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats?.successfulPayments ?? 0}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-bold text-[#285FEA]">
              CR: {stats?.conversionRate ?? '0.0'}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">From {stats?.totalPayments ?? 0} total checkouts</p>
        </div>

        {/* Card 4: Captured Revenue */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="text-xs font-medium text-slate-500">Captured Revenue</div>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats?.totalRevenueFormatted || '₹0'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Net settled gateway total</p>
        </div>
      </div>

      {/* QUICK GATEWAY CONTROLLER BANNER */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                isLive
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-amber-100 text-amber-700 border border-amber-300'
              }`}
            >
              {isLive ? '🟢 LIVE PRODUCTION GATEWAY' : '🧪 TEST MODE (SANDBOX)'}
            </span>
            <span className="text-xs text-slate-500">Provider: Dodo Payments</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {isLive
              ? 'Real customer credit card / UPI payments are active'
              : 'Test mode is active — checkouts use dummy cards without actual charges'}
          </h3>
        </div>

        {/* Segmented Mode Button Toggle */}
        <div className="flex items-center rounded-xl bg-white p-1 border border-slate-200 shadow-inner shrink-0">
          <button
            type="button"
            onClick={() => handleToggleMode('test_mode')}
            disabled={updatingMode}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              !isLive
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Test Mode
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode('live_mode')}
            disabled={updatingMode}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              isLive
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Live Mode
          </button>
        </div>
      </div>

      {/* ANALYTICS CHART CARD matching screenshot */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Analysis</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Analyze user engagement, visitor conversion and checkout events with real-time analytics.
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#818CF8]" />
                Page View
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#285FEA]" />
                Unique Visitor
              </span>
            </div>

            {/* Monthly Telemetry Badge */}
            <span className="rounded-xl bg-slate-100 dark:bg-zinc-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-zinc-300">
              Monthly View
            </span>
          </div>
        </div>

        {/* SVG Interactive Smooth Wave Chart */}
        {chartPoints.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-zinc-400">
            {loading ? 'Loading real-time traffic telemetry...' : 'No traffic telemetry recorded yet.'}
          </div>
        ) : (
        <div className="relative pt-4">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-56 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="pageViewGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818CF8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#818CF8" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#285FEA" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#285FEA" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1="0" y1="40" x2={svgWidth} y2="40" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="0" y1="100" x2={svgWidth} y2="100" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="0" y1="160" x2={svgWidth} y2="160" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="0" y1="220" x2={svgWidth} y2="220" stroke="#F1F5F9" strokeWidth="1" />

            {/* Page View Area & Stroke */}
            <polygon points={pageViewArea} fill="url(#pageViewGradient)" />
            <polyline
              fill="none"
              stroke="#818CF8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pageViewPoints}
            />

            {/* Visitor Area & Stroke */}
            <polygon points={visitorArea} fill="url(#visitorGradient)" />
            <polyline
              fill="none"
              stroke="#285FEA"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={visitorPoints}
            />
          </svg>

          {/* Month labels along X axis */}
          <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-3 px-1">
            {chartPoints.map((p) => (
              <span key={p.month}>{p.month}</span>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Traffic breakdown: sources / countries / paths */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#14171C] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Top Sources</h4>
          </div>
          <div className="space-y-3 pt-1">
            {(analytics?.topReferrers?.length ?? 0) > 0 ? (
              analytics!.topReferrers.map((ref, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 truncate pr-2">{ref.source}</span>
                    <span className="text-slate-900 shrink-0">
                      {ref.visits.toLocaleString()} ({ref.share})
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      style={{ width: ref.share }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No source data yet — open the landing page once.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#14171C] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Top Countries</h4>
          </div>
          <div className="space-y-3 pt-1">
            {(analytics?.topCountries?.length ?? 0) > 0 ? (
              analytics!.topCountries!.map((row, idx) => (
                <div key={row.countryCode || idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 truncate pr-2">
                      {row.country}{' '}
                      <span className="font-mono text-[10px] text-slate-400">{row.countryCode}</span>
                    </span>
                    <span className="text-slate-900 shrink-0">
                      {row.visits.toLocaleString()} ({row.share})
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                      style={{ width: row.share }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">
                Regions appear after new visits (IP→country, no raw IP stored).
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#14171C] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Top Pages</h4>
          </div>
          <div className="space-y-3 pt-1">
            {(analytics?.topPaths?.length ?? 0) > 0 ? (
              analytics!.topPaths!.map((row, idx) => (
                <div key={row.path || idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 truncate pr-2 font-mono text-[11px]">{row.path}</span>
                    <span className="text-slate-900 shrink-0">
                      {row.visits.toLocaleString()} ({row.share})
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-600"
                      style={{ width: row.share }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No page hits recorded yet.</p>
            )}
          </div>
          <a
            href="https://clarity.microsoft.com/projects/view/zhrwdxdio6/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#285FEA] hover:underline"
          >
            Open Clarity replays
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* BOTTOM SECTION: Recent Payments */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Transactions Table snippet */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Recent Payment Transactions</h4>
              <p className="text-[11px] text-slate-400">Latest Dodo checkouts across environments</p>
            </div>
            <Link
              href="/admin/payments"
              className="text-xs font-bold text-[#285FEA] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5">Order ID</th>
                  <th className="px-4 py-2.5">Customer</th>
                  <th className="px-4 py-2.5">Plan</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Mode</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                      No payment orders found.
                    </td>
                  </tr>
                ) : (
                  recentPayments.slice(0, 4).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-mono font-medium text-slate-800">
                        {p.orderId.slice(0, 16)}...
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {p.userEmail}
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-semibold">
                        {p.planName}
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-zinc-100 font-bold">
                        {p.currency === 'USD' ? `$${(p.amountMinor / 100).toFixed(2)}` : `₹${(p.amountMinor / 100).toFixed(0)}`}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                            p.environmentMode === 'live_mode'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {p.environmentMode === 'live_mode' ? 'LIVE' : 'TEST'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            p.status === 'succeeded'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              p.status === 'succeeded' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
