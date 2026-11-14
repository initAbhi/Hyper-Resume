'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { Logo } from '../ui/Logo';
import { Menu, X, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { FoundingSalesBanner } from '@/components/marketing/FoundingSalesBanner';
import { LandingResizableNavbar } from '@/components/home/LandingResizableNavbar';

function NavbarInner() {
  const { isAuthenticated, creditBalance, hasActivePro } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
    setIsProductOpen(false);
  }

  // Track scroll position to subtly frost navbar only after leaving the hero
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
          menuButtonRef.current?.focus();
        }
        setIsProductOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProductOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  if (pathname?.startsWith('/app') || pathname?.startsWith('/admin') || pathname?.startsWith('/r/')) {
    return null;
  }

  const productLinks = [
    { label: 'AI Resume Builder', desc: 'Create ATS-optimized resumes', href: isAuthenticated ? '/app' : '/register' },
    { label: 'Sample Resume Library', desc: '80+ verified company ATS resumes', href: '/examples' },
    { label: 'Resume Checker', desc: 'Get instant ATS feedback', href: '/tools/resume-checker' },
    { label: 'Job Matcher', desc: 'Match resume to any job', href: '/tools/job-match' },
    { label: 'Bullet Improver', desc: 'Strengthen weak bullets', href: '/tools/bullet-improver' },
  ];

  const isLightSurface = !isHomePage;

  if (isHomePage) {
    return <LandingResizableNavbar />;
  }

  return (
    <>
      <FoundingSalesBanner />
      <header
        className={`sticky top-0 left-0 right-0 z-50 w-full transition-[background-color,box-shadow] duration-300 ${
          isLightSurface
            ? 'bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-white/[0.08] shadow-xs'
            : isScrolled
              ? '-mb-16 bg-[#0a0a0a]/80 backdrop-blur-md border-b shadow-sm'
              : '-mb-16 bg-transparent border-0 shadow-none'
        }`}
        style={
          !isLightSurface
            ? { borderColor: isScrolled ? 'rgba(255, 255, 255, 0.08)' : 'transparent' }
            : undefined
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
          {/* Left: Brand */}
          <div className="flex items-center">
            <Link
              href="/"
              className={`flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5525F5] rounded-lg ${
                !isLightSurface ? 'drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]' : ''
              }`}
              aria-label="HypeResume Home"
            >
              <Logo variant="full" size="md" theme={isLightSurface ? 'auto' : 'dark'} priority />
            </Link>
          </div>

          {/* Center: Clean borderless navigation links */}
          <nav
            className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            aria-label="Main Navigation"
          >
            {/* Product Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className={`flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5525F5] rounded-md ${
                  isLightSurface
                    ? 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white'
                    : 'text-white/90 hover:text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]'
                }`}
                onClick={() => setIsProductOpen(!isProductOpen)}
                aria-expanded={isProductOpen}
              >
                <span>Product</span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-80 transition-transform duration-200 ${isProductOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProductOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-[#0E101A]/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-2 ring-1 ring-white/[0.08] animate-slide-up z-50">
                  {productLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="flex flex-col gap-0.5 px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors"
                      onClick={() => setIsProductOpen(false)}
                    >
                      <span className="text-xs font-semibold text-white">{link.label}</span>
                      <span className="text-[11px] text-zinc-400">{link.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/examples"
              className={`text-sm font-medium transition-colors ${
                isLightSurface
                  ? pathname.startsWith('/examples')
                    ? 'text-zinc-950 dark:text-white font-semibold'
                    : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white'
                  : pathname.startsWith('/examples')
                    ? 'text-white font-semibold [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]'
                    : 'text-white/90 hover:text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]'
              }`}
            >
              Sample Library
            </Link>

            <Link
              href="/pricing"
              className={`text-sm font-medium transition-colors ${
                isLightSurface
                  ? pathname.startsWith('/pricing')
                    ? 'text-zinc-950 dark:text-white font-semibold'
                    : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white'
                  : pathname.startsWith('/pricing')
                    ? 'text-white font-semibold [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]'
                    : 'text-white/90 hover:text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]'
              }`}
            >
              Pricing
            </Link>
          </nav>

          {/* Right: Desktop Actions */}
          <div className="hidden md:flex items-center gap-3.5">
            {isAuthenticated ? (
              <>
                {hasActivePro ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1.5 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    Pro Active
                  </span>
                ) : (
                  <span
                    className={`text-xs font-medium px-3 py-1.5 rounded-full font-mono ${
                      isLightSurface
                        ? 'text-zinc-700 bg-zinc-100 border border-zinc-200 dark:text-zinc-300 dark:bg-white/[0.06] dark:border-transparent'
                        : 'text-white/85 bg-white/[0.1] backdrop-blur-sm'
                    }`}
                  >
                    {creditBalance} credits
                  </span>
                )}
                <Link href="/app">
                  <button
                    type="button"
                    className={`text-xs sm:text-[13px] font-semibold h-9 px-4 rounded-lg shadow-sm cursor-pointer transition-colors ${
                      isLightSurface
                        ? 'bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950'
                        : 'bg-white hover:bg-zinc-100 text-zinc-950'
                    }`}
                  >
                    Dashboard
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm font-medium transition-colors px-2 py-1.5 ${
                    isLightSurface
                      ? 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white'
                      : 'text-white/90 hover:text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]'
                  }`}
                >
                  Log in
                </Link>
                <Link href="/register">
                  <button
                    type="button"
                    className={`text-xs sm:text-[13px] font-semibold h-9 px-4 rounded-lg shadow-sm cursor-pointer transition-colors flex items-center gap-1.5 ${
                      isLightSurface
                        ? 'bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950'
                        : 'bg-white hover:bg-zinc-100 text-zinc-950'
                    }`}
                  >
                    <span>Get Started</span>
                  </button>
                </Link>
              </>
            )}
          </div>

        {/* Mobile Header Right */}
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated ? (
            <Link href="/app">
              <button
                type="button"
                className={`rounded-lg font-semibold text-xs px-3.5 py-1.5 h-8 shadow-xs cursor-pointer ${
                  isLightSurface
                    ? 'bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950'
                    : 'bg-white hover:bg-zinc-100 text-zinc-950'
                }`}
              >
                Dashboard
              </button>
            </Link>
          ) : (
            <Link href="/register">
              <button
                type="button"
                className={`rounded-lg font-semibold text-xs px-3.5 py-1.5 h-8 shadow-xs cursor-pointer ${
                  isLightSurface
                    ? 'bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950'
                    : 'bg-white hover:bg-zinc-100 text-zinc-950'
                }`}
              >
                Get Started
              </button>
            </Link>
          )}
          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            type="button"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLightSurface
                ? 'text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white'
                : 'text-white/90 hover:text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]'
            }`}
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="md:hidden absolute top-full left-0 right-0 h-screen bg-black/60 backdrop-blur-md z-40"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div
              id="mobile-menu"
              ref={mobileMenuRef}
              className="md:hidden absolute top-full left-0 right-0 bg-[#090A10]/95 backdrop-blur-2xl shadow-2xl z-50 animate-slide-up max-h-[calc(100vh-4rem)] overflow-y-auto border-b"
              style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
            >
              <div className="px-4 py-4 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-3 py-2 font-mono">Product</p>
                {productLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-200 hover:bg-white/[0.06] transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                    <span className="block text-xs text-zinc-400 font-normal mt-0.5">{link.desc}</span>
                  </Link>
                ))}

                <div className="h-px bg-white/[0.04] my-3" />

                <Link
                  href="/examples"
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-200 hover:bg-white/[0.06] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sample Library
                </Link>
                <Link
                  href="/pricing"
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-200 hover:bg-white/[0.06] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>

                <div className="h-px bg-white/[0.04] my-3" />

                <div className="flex flex-col gap-2 px-3 pt-1 pb-2">
                  <Link href="/register" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold h-10 px-4 bg-white text-zinc-950 hover:bg-zinc-100 transition-all cursor-pointer"
                    >
                      Get Started
                    </button>
                  </Link>
                  <Link href="/login" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold h-10 px-4 bg-white/[0.06] hover:bg-white/[0.12] text-white transition-all cursor-pointer"
                    >
                      Log in
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}

export function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="fixed top-0 z-50 w-full bg-transparent h-16" />
      }
    >
      <NavbarInner />
    </Suspense>
  );
}
