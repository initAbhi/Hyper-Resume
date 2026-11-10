'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
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
  Pin,
  Mic,
  Search,
  BookOpen,
  ShieldCheck,
  Mail,
} from 'lucide-react';
import { LinkedInIcon } from '@/components/linkedin/LinkedInIcon';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth-context';

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, creditBalance, isAuthenticated, isLoading, logout } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasHoverSupport, setHasHoverSupport] = useState(true);

  const hoverEnterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverLeaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Derived expanded state based on state priority:
  // isPinned = true -> Always expanded
  // isPinned = false + isHovered = true -> Expanded
  // isPinned = false + isHovered = false -> Collapsed
  const isExpanded = isPinned || isHovered;
  const isCollapsed = !isExpanded;

  // Detect whether device supports hover + fine pointer (desktop vs mobile/tablet touch)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
      setHasHoverSupport(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => {
        setHasHoverSupport(e.matches);
        if (!e.matches) {
          setIsHovered(false);
        }
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Load saved pin preference (default: unpinned)
  useEffect(() => {
    try {
      const savedPin = localStorage.getItem('hyperresume-sidebar-pinned');
      if (savedPin === 'true') {
        setIsPinned(true);
      }
    } catch {}
  }, []);

  // Pin / Unpin toggle handler
  const togglePin = () => {
    if (hoverEnterTimeoutRef.current) {
      clearTimeout(hoverEnterTimeoutRef.current);
      hoverEnterTimeoutRef.current = null;
    }
    if (hoverLeaveTimeoutRef.current) {
      clearTimeout(hoverLeaveTimeoutRef.current);
      hoverLeaveTimeoutRef.current = null;
    }

    setIsPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('hyperresume-sidebar-pinned', String(next));
      } catch {}
      // If unpinning on desktop while hovering over the pin control, retain hover expansion
      if (!next && hasHoverSupport) {
        setIsHovered(true);
      }
      return next;
    });
  };

  // Hover handlers with debounce delays to prevent accidental triggers and flickering
  const handleMouseEnter = () => {
    if (!hasHoverSupport) return;

    if (hoverLeaveTimeoutRef.current) {
      clearTimeout(hoverLeaveTimeoutRef.current);
      hoverLeaveTimeoutRef.current = null;
    }

    if (isPinned) return;

    if (!hoverEnterTimeoutRef.current) {
      hoverEnterTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
        hoverEnterTimeoutRef.current = null;
      }, 120);
    }
  };

  const handleMouseLeave = () => {
    if (hoverEnterTimeoutRef.current) {
      clearTimeout(hoverEnterTimeoutRef.current);
      hoverEnterTimeoutRef.current = null;
    }

    if (isPinned) return;

    if (!hoverLeaveTimeoutRef.current) {
      hoverLeaveTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
        hoverLeaveTimeoutRef.current = null;
      }, 150);
    }
  };

  // Accessibility focus handlers
  const handleFocus = () => {
    if (isPinned || !hasHoverSupport) return;
    setIsHovered(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (isPinned) return;
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsHovered(false);
    }
  };

  // Cleanup timeout timers on unmount
  useEffect(() => {
    return () => {
      if (hoverEnterTimeoutRef.current) clearTimeout(hoverEnterTimeoutRef.current);
      if (hoverLeaveTimeoutRef.current) clearTimeout(hoverLeaveTimeoutRef.current);
    };
  }, []);

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
    { label: 'LinkedIn Studio', href: '/app/linkedin', icon: LinkedInIcon, badge: 'New' },
    { label: 'Cover Letters', href: '/app/cover-letters', icon: Mail, badge: 'New' },
    { label: 'Applications', href: '/app/applications', icon: Briefcase },
    { label: 'AI Interview', href: '/app/interview', icon: Mic, badge: 'New' },
    { label: 'Job Search', href: '/app/job-search', icon: Search, badge: 'Live' },
    ...(user?.role === 'admin'
      ? [{ label: 'Admin Center', href: '/admin', icon: ShieldCheck, badge: 'Admin' }]
      : []),
  ];

  const currentNav = navItems.find((item) =>
    item.href === '/app' ? pathname === '/app' : pathname.startsWith(item.href)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA] dark:bg-[#0D0F12] text-[#1A1D23] dark:text-[#F0F2F5] print:h-auto print:overflow-visible print:bg-white print:block">
      {/* Desktop Sidebar Layout Placeholder (Preserves space in flex layout, preventing layout jumps) */}
      <div
        className={`print:hidden shrink-0 hidden md:block transition-all duration-200 ease-in-out ${
          isPinned ? 'w-[288px]' : 'w-[76px]'
        }`}
        aria-hidden="true"
      />

      {/* Sidebar Navigation for Desktop (Fixed height, hybrid hover + pin) */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`print:hidden fixed top-0 bottom-0 left-0 h-screen ${
          isExpanded ? 'w-[288px]' : 'w-[76px]'
        } border-r border-[#E2E5E9] dark:border-[#252A33] bg-white dark:bg-[#14171C] flex flex-col justify-between shrink-0 hidden md:flex transition-all duration-200 ease-in-out z-30 select-none ${
          !isPinned && isExpanded ? 'shadow-xl dark:shadow-2xl dark:shadow-black/60' : ''
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Workspace Brand Header */}
          <div
            className={`px-4 border-b border-[#E2E5E9] dark:border-[#252A33] flex items-center ${
              isExpanded ? 'justify-between' : 'justify-center'
            } h-14 shrink-0 transition-colors`}
          >
            <Link href="/app" className="flex items-center gap-2 min-w-0" title="HypeResume Workspace">
              {isExpanded ? (
                <Logo variant="full" size="md" priority />
              ) : (
                <Logo variant="icon" size="md" priority />
              )}
            </Link>

            {isExpanded && (
              <button
                type="button"
                onClick={togglePin}
                className={`p-1.5 rounded-md transition-colors ${
                  isPinned
                    ? 'text-[#285FEA] bg-[#285FEA]/10 hover:bg-[#285FEA]/20 dark:bg-[#285FEA]/20 dark:text-[#3B75F2]'
                    : 'text-[#848D9A] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5] hover:bg-[#F1F3F5] dark:hover:bg-[#1D2128]'
                }`}
                title={isPinned ? 'Unpin sidebar (enable hover-to-expand)' : 'Pin sidebar (keep expanded)'}
                aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                aria-pressed={isPinned}
              >
                <Pin
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isPinned ? 'fill-current rotate-0' : '-rotate-45'
                  }`}
                />
              </button>
            )}
          </div>

          {!isExpanded && (
            <div className="p-2 flex justify-center border-b border-[#E2E5E9] dark:border-[#252A33] shrink-0">
              <button
                type="button"
                onClick={togglePin}
                className="p-1.5 rounded-md text-[#848D9A] hover:text-[#1A1D23] dark:hover:text-[#F0F2F5] hover:bg-[#F1F3F5] dark:hover:bg-[#1D2128] transition-colors"
                title="Pin sidebar (keep expanded)"
                aria-label="Pin sidebar"
              >
                <Pin className="w-4 h-4 -rotate-45" />
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
                    className={`flex items-center ${
                      isExpanded ? 'gap-2.5 px-2.5' : 'justify-center px-0'
                    } py-2 rounded-md text-xs font-medium transition-colors ${
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
                    {isExpanded && <span className="truncate whitespace-nowrap">{item.label}</span>}
                    {isExpanded && item.badge && (
                      <span className="ml-auto text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#F1F3F5] dark:bg-[#1D2128] text-[#848D9A] dark:text-[#6C7584] border border-[#E2E5E9] dark:border-[#252A33] shrink-0">
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
        <div
          className={`p-2.5 border-t border-[#E2E5E9] dark:border-[#252A33] shrink-0 ${
            isExpanded ? 'space-y-1' : 'space-y-1.5'
          }`}
        >
          {isExpanded ? (
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
                <Settings className="w-3.5 h-3.5 text-[#848D9A] shrink-0" />
                <span className="truncate">Settings</span>
              </Link>

              {/* Sign Out Button */}
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[#5A6270] dark:text-[#9EA7B4] hover:text-[#DC2626] dark:hover:text-[#EF4444] rounded-md hover:bg-[#F7F8FA] dark:hover:bg-[#1D2128] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-[#848D9A] shrink-0" />
                <span className="truncate">Sign Out</span>
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
