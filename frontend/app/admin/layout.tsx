'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  FileText,
  Settings,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Search,
  Bell,
  RefreshCw,
  Zap,
  ArrowUpRight,
  ChevronRight,
  Coins,
  Activity,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient, AdminPaymentSettings } from '@/lib/api-client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  const [paymentSettings, setPaymentSettings] = useState<AdminPaymentSettings | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [switchingMode, setSwitchingMode] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch gateway settings for the top indicator
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      apiClient.getAdminPaymentSettings()
        .then((data) => setPaymentSettings(data))
        .catch(() => null);
    }
  }, [isAuthenticated, user]);

  const handleQuickToggleMode = async () => {
    if (!paymentSettings || switchingMode) return;
    const nextMode = paymentSettings.mode === 'test_mode' ? 'live_mode' : 'test_mode';
    if (nextMode === 'live_mode') {
      const confirmed = window.confirm(
        '⚠️ Switch Payment Gateway to LIVE PRODUCTION?\n\nReal customer credit cards and UPI accounts will be charged real money.',
      );
      if (!confirmed) return;
    }

    setSwitchingMode(true);
    try {
      const updated = await apiClient.updateAdminPaymentMode(nextMode);
      setPaymentSettings(updated);
      window.location.reload();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to switch payment mode');
    } finally {
      setSwitchingMode(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-[#285FEA] animate-pulse flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
            H
          </div>
          <p className="text-xs text-slate-500 font-medium">Loading HypeResume Admin Suite...</p>
        </div>
      </div>
    );
  }

  // Unauthorized view
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">403 - Administrator Access Required</h1>
          <p className="mt-2 text-sm text-slate-600">
            This administrative console is restricted to system administrators. Your account ({user?.email || 'Guest'}) does not have permission.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-xl bg-[#285FEA] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-[#1E4FD0] transition"
            >
              Return to User Workspace
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Sign in with Admin Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLive = paymentSettings?.mode === 'live_mode';

  const navGroups = [
    {
      group: 'Manage',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Payments & Billing', href: '/admin/payments', icon: CreditCard },
      ],
    },
    {
      group: 'Manage Accounts',
      items: [
        { label: 'Users & Candidates', href: '/admin/users', icon: Users },
      ],
    },
    {
      group: 'Content & System',
      items: [
        { label: 'Resumes & Content', href: '/admin/resumes', icon: FileText },
        { label: 'Settings & Gateways', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  // Helper for active route check
  const isRouteActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  // Determine current breadcrumb
  const getBreadcrumb = () => {
    if (pathname === '/admin/payments') return 'Payments & Billing';
    if (pathname === '/admin/users') return 'Users & Accounts';
    if (pathname === '/admin/resumes') return 'Resumes Management';
    if (pathname === '/admin/settings') return 'Settings & Gateways';
    return 'Overview';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (Clean white SaaS style matching screenshot) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-100'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#285FEA] to-[#4F46E5] text-white shadow-md shadow-blue-500/20 font-bold text-sm">
                HR
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  HypeResume
                  <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-[#285FEA] border border-blue-100">
                    Admin
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium -mt-0.5">Management Suite</span>
              </div>
            </Link>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <div className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  const active = isRouteActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 ${
                        active
                          ? 'bg-[#EEF2FF] text-[#285FEA] shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? 'text-[#285FEA]' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}

            {/* Quick Gateway Mode Switcher Card in Sidebar */}
            <div className="pt-2">
              <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    Payment Mode
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isLive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isLive ? 'LIVE' : 'TEST'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug mb-3">
                  {isLive
                    ? 'Processing real transactions via Dodo live mode.'
                    : 'Simulated sandbox checkouts. Dummy cards accepted.'}
                </p>
                <button
                  type="button"
                  onClick={handleQuickToggleMode}
                  disabled={switchingMode}
                  className={`w-full rounded-xl py-2 text-xs font-bold text-center transition shadow-xs ${
                    isLive
                      ? 'bg-slate-800 text-white hover:bg-slate-700'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {switchingMode
                    ? 'Switching...'
                    : isLive
                    ? 'Switch to Test Mode'
                    : 'Switch to Live Mode'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
                SA
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">System Administrator</div>
                <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <Link
              href="/app"
              className="text-[#285FEA] hover:underline font-semibold flex items-center gap-1"
            >
              <span>User Workspace</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <span className="text-slate-400">v2.4.0</span>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT CONTAINER */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Navbar Header (Clean white with search, breadcrumb, live mode indicator) */}
        <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb matching reference image */}
            <nav className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
              <Link href="/admin" className="hover:text-slate-700 transition">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="text-slate-500">Admin</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="font-semibold text-slate-800">{getBreadcrumb()}</span>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search here... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#285FEA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
              />
            </div>

            {/* Live Gateway Pill Badge */}
            <button
              onClick={handleQuickToggleMode}
              title="Click to toggle gateway mode"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition border shadow-xs ${
                isLive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>{isLive ? 'LIVE PRODUCTION' : 'TEST MODE'}</span>
            </button>

            {/* Notifications Icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition cursor-pointer">
              <Bell className="h-4 w-4" />
            </div>

            {/* Profile Avatar Chip */}
            <div className="flex items-center gap-2 pl-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                A
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">Abhi Singh</div>
                <div className="text-[10px] text-slate-400">Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

