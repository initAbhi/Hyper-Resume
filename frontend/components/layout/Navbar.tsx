'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/ThemeToggle';
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

  if (pathname?.startsWith('/app')) {
    return null;
  }

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

  const productLinks = [
    { label: 'AI Resume Builder', desc: 'Create ATS-optimized resumes', href: '/login' },
    { label: 'Resume Checker', desc: 'Get instant ATS feedback', href: '/tools/resume-checker' },
    { label: 'Job Matcher', desc: 'Match resume to any job', href: '/tools/job-match' },
    { label: 'Bullet Improver', desc: 'Strengthen weak bullets', href: '/tools/bullet-improver' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
            aria-label="HyperResume Home"
          >
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              H
            </div>
            <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
              HyperResume
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-sm" aria-label="Main Navigation">
            {/* Product Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors font-medium"
                onClick={() => setIsProductOpen(!isProductOpen)}
                aria-expanded={isProductOpen}
              >
                Product
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isProductOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isProductOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-2 animate-slide-up z-50">
                  {productLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() => setIsProductOpen(false)}
                    >
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">{link.label}</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{link.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {[
              { label: 'Templates', href: '/examples' },
              { label: 'Pricing', href: '/pricing' },
            ].map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
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
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                {creditBalance} credits
              </span>
              <Link href="/app">
                <Button variant="primary" size="sm">
                  Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-zinc-600 dark:text-zinc-400">
                  Log in
                </Button>
              </Link>
              <Link href="/tools/resume-checker">
                <Button variant="primary" size="sm" className="shadow-sm group">
                  Try for free
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Header Right */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle id="mobile-theme-toggle" />
          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            type="button"
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors"
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
            className="fixed inset-0 top-16 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            ref={mobileMenuRef}
            className="lg:hidden fixed top-16 left-0 right-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-xl z-50 animate-slide-up max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <div className="px-4 py-4 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-3 py-2">Product</p>
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                  <span className="block text-xs text-zinc-500 font-normal mt-0.5">{link.desc}</span>
                </Link>
              ))}

              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-3" />

              <Link
                href="/examples"
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Templates
              </Link>
              <Link
                href="/pricing"
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>

              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-3" />

              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-2">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Appearance</span>
                <ThemeToggle id="drawer-theme-toggle" showLabel />
              </div>

              <div className="flex flex-col gap-2 px-3 pt-1 pb-2">
                <Link href="/tools/resume-checker" className="w-full">
                  <Button variant="primary" size="md" className="w-full justify-center">
                    Try for free
                  </Button>
                </Link>
                <Link href="/login" className="w-full">
                  <Button variant="outline" size="md" className="w-full justify-center">
                    Log in
                  </Button>
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
