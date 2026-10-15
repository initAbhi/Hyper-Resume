'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FileText,
  Briefcase,
  LayoutDashboard,
  Settings,
  LogOut,
  Shield,
  Sparkles,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, creditBalance, isAuthenticated, isLoading, logout } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Authentication protection
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 animate-spin flex items-center justify-center text-white font-bold text-sm">
            H
          </div>
          <p className="text-sm text-zinc-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const navItems = [
    { label: 'Overview', href: '/app', icon: LayoutDashboard },
    { label: 'My Resumes', href: '/app/resumes', icon: FileText },
    { label: 'Match a Job', href: '/app/match', icon: Sparkles },
    { label: 'Applications', href: '/app/applications', icon: Briefcase },
    { label: 'Settings', href: '/app/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Sidebar Navigation for Desktop */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Workspace Brand Header */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <Link href="/app" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                H
              </div>
              <span className="font-extrabold text-lg tracking-tight">
                Hyper<span className="text-blue-600">Resume</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1" aria-label="Workspace Sidebar">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive =
                item.href === '/app'
                  ? pathname === '/app'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Workspace Info & Logout */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          {/* Candidate Profile Snippet */}
          <div className="px-2 py-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-zinc-900 dark:text-zinc-100">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-[11px] truncate text-zinc-500">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-500" />
                Credits
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400 text-xs">
                {creditBalance}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500 px-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <span className="flex items-center gap-1.5 font-medium text-[11px]">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Zero-Training AI
            </span>
            <Badge variant="neutral" className="text-[10px]">Active</Badge>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Workspace Top Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Nav Toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-label="Toggle navigation"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden sm:inline">
              Workspace
            </span>
            <span className="text-xs text-zinc-300 dark:text-zinc-700 hidden sm:inline">/</span>
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {navItems.find((item) =>
                item.href === '/app' ? pathname === '/app' : pathname.startsWith(item.href)
              )?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/app/settings"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{creditBalance} Credits</span>
            </Link>

            <Link href="/tools/resume-checker">
              <Badge variant="neutral" className="hidden sm:inline-flex cursor-pointer hover:opacity-80 transition-opacity">
                Quick ATS Audit
              </Badge>
            </Link>

            <Link
              href="/app/settings"
              className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              title="Settings"
            >
              <UserIcon className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive =
                item.href === '/app'
                  ? pathname === '/app'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Child Pages */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="text-sm text-zinc-500 animate-pulse">Loading workspace...</div>
        </div>
      }
    >
      <AppLayoutInner>{children}</AppLayoutInner>
    </Suspense>
  );
}
