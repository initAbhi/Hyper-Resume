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
  Sparkles,
  Menu,
  X,
  User as UserIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Mic,
  Search,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth-context';

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, creditBalance, isAuthenticated, isLoading, logout } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load saved collapse preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hyperresume-sidebar-collapsed');
      if (saved === 'true') setIsCollapsed(true);
    } catch {}
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('hyperresume-sidebar-collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Authentication protection
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] dark:bg-[#0D0F12]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 rounded-md bg-[#285FEA] animate-pulse flex items-center justify-center text-white font-bold text-xs">
            H
          </div>
          <p className="text-xs text-[#5A6270] dark:text-[#9EA7B4] font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { label: 'Overview', href: '/app', icon: LayoutDashboard },
    { label: 'My Resumes', href: '/app/resumes', icon: FileText },
    { label: 'Sample Library', href: '/app/samples', icon: BookOpen },
    { label: 'Match a Job', href: '/app/match', icon: Sparkles },
    { label: 'Applications', href: '/app/applications', icon: Briefcase },
    { label: 'AI Interview', href: '/app/interview', icon: Mic, badge: 'Soon' },
    { label: 'AI Job Search', href: '/app/job-search', icon: Search, badge: 'Soon' },
  ];

  const currentNav = navItems.find((item) =>
    item.href === '/app' ? pathname === '/app' : pathname.startsWith(item.href)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA] dark:bg-[#0D0F12] text-[#1A1D23] dark:text-[#F0F2F5] print:h-auto print:overflow-visible print:bg-white print:block">
      {/* Sidebar Navigation for Desktop (Fixed height, independent scroll, collapsible) */}
      <aside
        className={`print:hidden ${
          isCollapsed ? 'w-16' : 'w-60'
        } h-screen border-r border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] flex flex-col justify-between shrink-0 hidden md:flex transition-all duration-200 ease-in-out z-30 select-none`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Workspace Brand Header */}
          <div className={`px-4 border-b border-[#E2E5E9] dark:border-[#252A33] flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-14 shrink-0`}>
            <Link href="/app" className="flex items-center gap-2 min-w-0" title="HyperResume Workspace">
              {isCollapsed ? (
                <Logo variant="icon" size="md" priority />
              ) : (
                <Logo variant="full" size="md" priority />
              )}
            </Link>

            {!isCollapsed && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="p-1 rounded text-[#848D9A] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5] hover:bg-[#F1F3F5] dark:hover:bg-[#1D2128] transition-colors"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {isCollapsed && (
            <div className="p-2 flex justify-center border-b border-[#E2E5E9] dark:border-[#252A33] shrink-0">
              <button
                type="button"
                onClick={toggleSidebar}
                className="p-1 rounded text-[#848D9A] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5] hover:bg-[#F1F3F5] dark:hover:bg-[#1D2128] transition-colors"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-2 space-y-0.5 overflow-y-auto flex-1" aria-label="Workspace Sidebar">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive =
                item.href === '/app'
                  ? pathname === '/app'
                  : pathname.startsWith(item.href);

              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5'} py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#F1F3F5] dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] font-semibold'
                        : 'text-[#5A6270] dark:text-[#9EA7B4] hover:bg-[#F7F8FA] dark:hover:bg-[#1D2128]/60 hover:text-[#1A1D23] dark:hover:text-[#F0F2F5]'
                    }`}
                  >
                    <IconComp
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-[#285FEA]'
                          : 'text-[#848D9A] dark:text-[#6C7584] group-hover:text-[#5A6270] dark:group-hover:text-[#9EA7B4]'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {!isCollapsed && item.badge && (
                      <span className="ml-auto text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#F1F3F5] dark:bg-[#1D2128] text-[#848D9A] dark:text-[#6C7584] border border-[#E2E5E9] dark:border-[#252A33]">
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded bg-[#1A1D23] text-white dark:bg-[#F0F2F5] dark:text-[#1A1D23] text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-sm z-50">
                      {item.label} {item.badge && `(${item.badge})`}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Workspace Info, Settings & Logout */}
        <div className={`p-2.5 border-t border-[#E2E5E9] dark:border-[#252A33] shrink-0 ${isCollapsed ? 'space-y-1.5' : 'space-y-1'}`}>
          {!isCollapsed ? (
            <>
              {/* Candidate Profile Snippet */}
              <div className="px-2 py-1.5 rounded-md bg-[#F7F8FA] dark:bg-[#1D2128]/50 border border-[#E2E5E9] dark:border-[#252A33] mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#E2E5E9] dark:bg-[#252A33] text-[#1A1D23] dark:text-[#F0F2F5] flex items-center justify-center text-[11px] font-semibold shrink-0">
                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-[#1A1D23] dark:text-[#F0F2F5]">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-[10px] truncate text-[#848D9A]">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="mt-1.5 pt-1.5 border-t border-[#E2E5E9]/60 dark:border-[#252A33] flex items-center justify-between text-[11px]">
                  <span className="text-[#5A6270] dark:text-[#9EA7B4]">Credits</span>
                  <Link href="/pricing" className="font-semibold text-[#285FEA] hover:underline">
                    {creditBalance}
                  </Link>
                </div>
              </div>

              {/* Settings Link */}
              <Link
                href="/app/settings"
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  pathname === '/app/settings'
                    ? 'bg-[#F1F3F5] dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] font-semibold'
                    : 'text-[#5A6270] dark:text-[#9EA7B4] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5] hover:bg-[#F7F8FA] dark:hover:bg-[#1D2128]'
                }`}
                title="Workspace Settings"
              >
                <Settings className="w-3.5 h-3.5 text-[#848D9A]" />
                <span>Settings</span>
              </Link>

              {/* Sign Out Button */}
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[#5A6270] dark:text-[#9EA7B4] hover:text-[#DC2626] dark:hover:text-[#EF4444] rounded-md hover:bg-[#F7F8FA] dark:hover:bg-[#1D2128] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-[#848D9A]" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-1">
              <div
                className="w-7 h-7 rounded bg-[#E2E5E9] dark:bg-[#252A33] text-[#1A1D23] dark:text-[#F0F2F5] flex items-center justify-center text-xs font-semibold cursor-pointer"
                title={`${user?.fullName} (${creditBalance} credits)`}
              >
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <Link
                href="/app/settings"
                className={`p-1.5 rounded transition-colors ${
                  pathname === '/app/settings'
                    ? 'text-[#285FEA] bg-[#F1F3F5] dark:bg-[#1D2128]'
                    : 'text-[#848D9A] hover:text-[#1A1D23] hover:bg-[#F1F3F5] dark:hover:bg-[#1D2128]'
                }`}
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
              <button
                onClick={() => logout()}
                className="p-1.5 rounded text-[#848D9A] hover:text-[#DC2626] hover:bg-[#F1F3F5] dark:hover:bg-[#1D2128] transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Workspace Area (Fixed header, scrollable page viewport) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden print:h-auto print:overflow-visible print:block">
        {/* Workspace Top Header */}
        <header className="print:hidden h-14 border-b border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Mobile Nav Toggle */}
            <button
              type="button"
              className="md:hidden p-1.5 rounded text-[#5A6270] dark:text-[#9EA7B4] hover:bg-[#F1F3F5] dark:hover:bg-[#1D2128]"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-label="Toggle navigation"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb Path */}
            <span className="text-xs font-medium text-[#848D9A] hidden sm:inline">
              Workspace
            </span>
            <span className="text-xs text-[#CBD0D7] dark:text-[#333945] hidden sm:inline">/</span>
            <span className="text-sm font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
              {pathname === '/app/settings' ? 'Settings' : currentNav?.label || 'Overview'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#F1F3F5] dark:bg-[#1D2128] text-[#5A6270] dark:text-[#9EA7B4] border border-[#E2E5E9] dark:border-[#252A33] hover:border-[#CBD0D7] dark:hover:border-[#333945] transition-colors"
            >
              <span>{creditBalance} Credits</span>
            </Link>

            <ThemeToggle id="workspace-theme-toggle" />

            <Link
              href="/app/settings"
              className="p-1.5 rounded hover:bg-[#F1F3F5] dark:hover:bg-[#1D2128] text-[#5A6270] dark:text-[#9EA7B4]"
              title="Settings"
            >
              <UserIcon className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer with Backdrop */}
        {isMobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-[#0D0F12]/40 transition-opacity"
              onClick={() => setIsMobileNavOpen(false)}
            />

            <div className="relative w-4/5 max-w-xs bg-white dark:bg-[#14171C] border-r border-[#E2E5E9] dark:border-[#252A33] p-4 flex flex-col justify-between shadow-lg z-10 animate-fade-in">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E9] dark:border-[#252A33] mb-3">
                  <div className="flex items-center gap-2">
                    <Logo variant="full" size="md" priority />
                  </div>
                  <button
                    onClick={() => setIsMobileNavOpen(false)}
                    className="p-1 rounded text-[#848D9A] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
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
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-[#F1F3F5] dark:bg-[#1D2128] text-[#1A1D23] dark:text-[#F0F2F5] font-semibold'
                            : 'text-[#5A6270] dark:text-[#9EA7B4] hover:bg-[#F7F8FA] dark:hover:bg-[#1D2128]'
                        }`}
                      >
                        <IconComp className="w-4 h-4 shrink-0 text-[#848D9A]" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-3 border-t border-[#E2E5E9] dark:border-[#252A33] space-y-2">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-[#848D9A]">Credits</span>
                  <span className="font-semibold text-[#285FEA]">{creditBalance}</span>
                </div>
                <Link
                  href="/app/settings"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[#5A6270] dark:text-[#9EA7B4] hover:bg-[#F7F8FA] dark:hover:bg-[#1D2128] rounded-md transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#7F1D1D]/30 rounded-md transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Page Viewport (Scrollable container with clean padding) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:p-0 print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] dark:bg-[#0D0F12]">
          <div className="h-7 w-7 rounded-md bg-[#285FEA] animate-pulse" />
        </div>
      }
    >
      <AppLayoutInner>{children}</AppLayoutInner>
    </Suspense>
  );
}
