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
  const [activeTab, setActiveTab] = useState<'overview' | 'behavior' | 'performance'>('overview');
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [updatingMode, setUpdatingMode] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggleMode = async (targetMode: 'test_mode' | 'live_mode') => {
    if (!paymentSettings || paymentSettings.mode === targetMode || updatingMode) return;
    if (targetMode === 'live_mode') {
      const confirmed = window.confirm(
        '⚠️ Switch Payment Gateway to LIVE PRODUCTION?\n\nReal customer cards and UPI will be charged real money.',
      );
      if (!confirmed) return;
    }

    setUpdatingMode(true);
    try {
      const updated = await apiClient.updateAdminPaymentMode(targetMode);
      setPaymentSettings(updated);
      const newStats = await apiClient.getAdminStats().catch(() => null);
      if (newStats) setStats(newStats);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to switch payment mode');
    } finally {
      setUpdatingMode(false);
    }
  };

  const isLive = paymentSettings?.mode === 'live_mode';

  // SVG Chart rendering helper based on monthly data
  const chartPoints = analytics?.chartData || [
    { month: 'Jan', visitors: 280, pageViews: 650 },
    { month: 'Feb', visitors: 340, pageViews: 780 },
    { month: 'Mar', visitors: 410, pageViews: 820 },
    { month: 'Apr', visitors: 480, pageViews: 900 },
    { month: 'May', visitors: 520, pageViews: 950 },
    { month: 'Jun', visitors: 490, pageViews: 880 },
    { month: 'Jul', visitors: 530, pageViews: 920 },
    { month: 'Aug', visitors: 610, pageViews: 1050 },
    { month: 'Sep', visitors: 580, pageViews: 980 },
    { month: 'Oct', visitors: 720, pageViews: 1180 },
    { month: 'Nov', visitors: 890, pageViews: 1350 },
    { month: 'Dec', visitors: 940, pageViews: 1420 },
  ];

  // Compute SVG polyline coords (width: 900, height: 260)
  const maxVal = 1600;
  const svgWidth = 900;
  const svgHeight = 240;
  const stepX = svgWidth / (chartPoints.length - 1);

  const visitorPoints = chartPoints
    .map((p, i) => `${i * stepX},${svgHeight - (p.visitors / maxVal) * svgHeight}`)
    .join(' ');

  const pageViewPoints = chartPoints
    .map((p, i) => `${i * stepX},${svgHeight - (p.pageViews / maxVal) * svgHeight}`)
    .join(' ');

  const visitorArea = `0,${svgHeight} ${visitorPoints} ${(chartPoints.length - 1) * stepX},${svgHeight}`;
  const pageViewArea = `0,${svgHeight} ${pageViewPoints} ${(chartPoints.length - 1) * stepX},${svgHeight}`;

  return (
    <div className="space-y-6">
      {/* Top Tabs Bar matching screenshot */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-8 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`relative pb-3 transition ${
              activeTab === 'overview'
                ? 'text-[#285FEA] font-bold after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-[#285FEA]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('behavior')}
            className={`relative pb-3 transition ${
              activeTab === 'behavior'
                ? 'text-[#285FEA] font-bold after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-[#285FEA]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            User Behavior
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`relative pb-3 transition ${
              activeTab === 'performance'
                ? 'text-[#285FEA] font-bold after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-[#285FEA]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Performance & CAPI
          </button>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-2xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

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
          <p className="mt-1 text-[11px] text-slate-400">Verified client route hits</p>
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

            {/* Timeframe Selector */}
            <div className="flex items-center rounded-xl bg-slate-100/80 p-1 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setChartPeriod('daily')}
                className={`rounded-lg px-2.5 py-1 transition ${
                  chartPeriod === 'daily' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setChartPeriod('monthly')}
                className={`rounded-lg px-2.5 py-1 transition ${
                  chartPeriod === 'monthly' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setChartPeriod('yearly')}
                className={`rounded-lg px-2.5 py-1 transition ${
                  chartPeriod === 'yearly' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>

        {/* SVG Interactive Smooth Wave Chart */}
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
      </div>

      {/* BOTTOM SECTION: Referrers & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Traffic & Sources Breakdown */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Top Sources</h4>
            <span className="text-[11px] font-semibold text-[#285FEA] hover:underline cursor-pointer">
              View Analytics
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {analytics?.topReferrers.map((ref, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">{ref.source}</span>
                  <span className="text-slate-900">{ref.visits.toLocaleString()} ({ref.share})</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    style={{ width: ref.share }}
                  />
                </div>
              </div>
            )) || (
              <p className="text-xs text-slate-400">Loading sources...</p>
            )}
          </div>
        </div>

        {/* Recent Transactions Table snippet */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
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
                      <td className="px-4 py-3 text-slate-900 font-bold">
                        ₹{(p.amountMinor / 100).toFixed(0)}
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
