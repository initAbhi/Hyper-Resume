'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Logo } from '../ui/Logo';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function NavbarInner() {
  const { isAuthenticated, creditBalance } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
    setIsProductOpen(false);
  }

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

  if (pathname?.startsWith('/app') || pathname?.startsWith('/admin')) {
    return null;
  }

  const productLinks = [
    { label: 'AI Resume Builder', desc: 'Create ATS-optimized resumes', href: '/login' },
    { label: 'Sample Resume Library', desc: 'Top 20 company ATS resumes', href: '/examples' },
    { label: 'Resume Checker', desc: 'Get instant ATS feedback', href: '/tools/resume-checker' },
    { label: 'Job Matcher', desc: 'Match resume to any job', href: '/tools/job-match' },
    { label: 'Bullet Improver', desc: 'Strengthen weak bullets', href: '/tools/bullet-improver' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090A10]/80 backdrop-blur-xl border-b border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5525F5] rounded-lg"
            aria-label="HypeResume Home"
          >
            <Logo variant="full" size="md" theme="dark" priority />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-xs" aria-label="Main Navigation">
            {/* Product Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors font-medium cursor-pointer"
                onClick={() => setIsProductOpen(!isProductOpen)}
                aria-expanded={isProductOpen}
              >
                Product
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isProductOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isProductOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#0E101A]/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/[0.1] p-2 animate-slide-up z-50">
                  {productLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex flex-col gap-0.5 px-3 py-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                      onClick={() => setIsProductOpen(false)}
                    >
                      <span className="text-xs font-semibold text-white">{link.label}</span>
                      <span className="text-[11px] text-zinc-400">{link.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {[
              { label: 'Sample Library', href: '/examples' },
              { label: 'Pricing', href: '/pricing' },
            ].map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-white/[0.1] font-semibold border border-white/[0.1]'
                      : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle id="desktop-theme-toggle" />
          {isAuthenticated ? (
            <>
              <span className="text-xs font-medium text-zinc-300 bg-white/[0.06] border border-white/[0.08] px-3 py-1.5 rounded-full font-mono">
                {creditBalance} credits
              </span>
              <Link href="/app">
                <Button variant="primary" size="sm" className="bg-[#5525F5] hover:bg-[#4318D8] text-white text-xs h-8 px-3.5 shadow-sm border border-violet-400/30">
                  Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs h-8 text-zinc-300 hover:text-white hover:bg-white/[0.08]">
                  Log in
                </Button>
              </Link>
              <Link href="/tools/resume-checker">
                <Button size="sm" className="bg-[#5525F5] hover:bg-[#4318D8] text-white text-xs font-semibold h-8 px-3.5 shadow-md shadow-violet-500/20 border border-violet-400/30 group">
                  <span>Try for free</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Header Right */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
          {isAuthenticated ? (
            <Link href="/app">
              <Button size="sm" className="rounded-full bg-[#5525F5] hover:bg-[#4318D8] text-white font-semibold text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1 sm:py-1.5 h-8 shadow-xs">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login" className="hidden xs:inline-flex">
              <Button size="sm" className="rounded-full bg-[#5525F5] hover:bg-[#4318D8] text-white font-semibold text-xs px-3 sm:px-3.5 py-1.5 h-8 shadow-xs">
                Try for free
              </Button>
            </Link>
          )}
          <ThemeToggle id="mobile-theme-toggle" />
          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            type="button"
            className="p-1.5 text-zinc-300 hover:text-white rounded-lg transition-colors"
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-white" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5 text-zinc-300" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-14 bg-black/60 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            ref={mobileMenuRef}
            className="lg:hidden fixed top-14 left-0 right-0 bg-[#090A10]/95 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl z-50 animate-slide-up max-h-[calc(100vh-4rem)] overflow-y-auto"
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

              <div className="h-px bg-white/[0.08] my-3" />

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

              <div className="h-px bg-white/[0.08] my-3" />

              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] mb-2">
                <span className="text-xs font-medium text-zinc-400">Appearance</span>
                <ThemeToggle id="drawer-theme-toggle" showLabel />
              </div>

              <div className="flex flex-col gap-2 px-3 pt-1 pb-2">
                <Link href="/tools/resume-checker" className="w-full">
                  <Button variant="primary" size="md" className="w-full justify-center bg-[#5525F5] text-white">
                    Try for free
                  </Button>
                </Link>
                <Link href="/login" className="w-full">
                  <button 
                    type="button"
                    className="w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold h-10 px-4 border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-white transition-all cursor-pointer"
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
  );
}

export function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl h-16" />
      }
    >
      <NavbarInner />
    </Suspense>
  );
}
