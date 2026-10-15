'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Menu, X, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function NavbarInner() {
  const { isAuthenticated, creditBalance } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  // Handle ESC key to close mobile menu
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { label: 'Resume Checker', href: '/tools/resume-checker' },
    { label: 'Job Match', href: '/tools/job-match' },
    { label: 'Examples', href: '/examples' },
    { label: 'Pricing', href: '/pricing' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1"
            aria-label="HyperResume Home"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-sm tracking-tight">
              H
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                Hyper<span className="text-blue-600">Resume</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase mt-0.5">
                Truthful AI
              </span>
            </div>
          </Link>

          <Badge variant="info" className="hidden lg:inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            No Hallucinated Skills
          </Badge>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600 dark:text-zinc-400"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-zinc-950 dark:hover:text-zinc-100 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : ''
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/app/settings" className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>{creditBalance} Credits</span>
              </Link>
              <Link href="/app">
                <Button variant="primary" size="sm" className="shadow-sm">
                  Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/tools/resume-checker">
                <Button variant="primary" size="sm" className="shadow-sm group">
                  <span>Check My Resume</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Hamburger Button */}
        <div className="flex md:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            className="p-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-3 pb-6 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2.5 rounded-lg text-base font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2.5">
              <Link href="/tools/resume-checker" className="w-full">
                <Button variant="primary" size="md" className="w-full justify-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Check My Resume
                </Button>
              </Link>
              <Link href="/login" className="w-full">
                <Button variant="outline" size="md" className="w-full justify-center">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md h-16" />
      }
    >
      <NavbarInner />
    </Suspense>
  );
}
