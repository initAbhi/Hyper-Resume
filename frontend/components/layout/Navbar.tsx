'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { Logo } from '../ui/Logo';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function NavbarInner() {
  const { isAuthenticated, creditBalance } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
    { label: 'AI Resume Builder', desc: 'Create ATS-optimized resumes', href: '/login' },
    { label: 'Sample Resume Library', desc: 'Top 20 company ATS resumes', href: '/examples' },
    { label: 'Resume Checker', desc: 'Get instant ATS feedback', href: '/tools/resume-checker' },
    { label: 'Job Matcher', desc: 'Match resume to any job', href: '/tools/job-match' },
    { label: 'Bullet Improver', desc: 'Strengthen weak bullets', href: '/tools/bullet-improver' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0a0a0a]/85 backdrop-blur-md border-b border-white/[0.04] shadow-sm'
          : 'bg-transparent border-none shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
        {/* Left: Brand */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5525F5] rounded-lg"
            aria-label="HypeResume Home"
          >
            <Logo variant="full" size="md" theme="dark" priority />
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (Centered vertically & horizontally, crystal clear contrast) */}
        <nav
          className="hidden md:flex items-center gap-1 sm:gap-1.5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/[0.07] shadow-sm"
          aria-label="Main Navigation"
        >
          {/* Product Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white/90 hover:text-white hover:bg-white/[0.1] transition-colors cursor-pointer drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              onClick={() => setIsProductOpen(!isProductOpen)}
              aria-expanded={isProductOpen}
            >
              <span>Product</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isProductOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProductOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-[#0E101A]/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-2 border border-white/[0.08] animate-slide-up z-50">
                {productLinks.map((link) => (
                  <Link
                    key={link.href}
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
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${
              pathname.startsWith('/examples')
                ? 'text-white bg-white/[0.14]'
                : 'text-white/90 hover:text-white hover:bg-white/[0.1]'
            }`}
          >
            Sample Library
          </Link>

          <Link
            href="/pricing"
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${
              pathname.startsWith('/pricing')
                ? 'text-white bg-white/[0.14]'
                : 'text-white/90 hover:text-white hover:bg-white/[0.1]'
            }`}
          >
            Pricing
          </Link>
        </nav>

        {/* Right: Desktop Actions (Vertically aligned, crisp contrast) */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-xs font-medium text-zinc-300 bg-white/[0.06] px-3 py-1.5 rounded-full font-mono">
                {creditBalance} credits
              </span>
              <Link href="/app">
                <button
                  type="button"
                  className="bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-semibold h-9 px-4.5 rounded-lg shadow-md cursor-pointer transition-colors"
                >
                  Dashboard
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-semibold text-white/90 hover:text-white transition-colors px-2.5 py-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              >
                Log in
              </Link>
              <Link href="/login">
                <button
                  type="button"
                  className="bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-semibold h-9 px-4.5 rounded-lg shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Header Right (No theme toggle!) */}
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated ? (
            <Link href="/app">
              <button
                type="button"
                className="rounded-lg bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-xs px-3.5 py-1.5 h-8 shadow-xs cursor-pointer"
              >
                Dashboard
              </button>
            </Link>
          ) : (
            <Link href="/login">
              <button
                type="button"
                className="rounded-lg bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-xs px-3.5 py-1.5 h-8 shadow-xs cursor-pointer"
              >
                Get Started
              </button>
            </Link>
          )}
          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            type="button"
            className="p-1.5 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
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
            className="fixed inset-0 top-16 bg-black/60 backdrop-blur-md z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            ref={mobileMenuRef}
            className="md:hidden fixed top-16 left-0 right-0 bg-[#090A10]/95 backdrop-blur-2xl shadow-2xl z-50 animate-slide-up max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-white/[0.04]"
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
                <Link href="/login" className="w-full">
                  <button 
                    type="button"
                    className="w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold h-10 px-4 bg-white text-zinc-950 hover:bg-zinc-100 transition-all cursor-pointer"
                  >
                    Get Started
                  </button>
                </Link>
                <Link href="/login" className="w-full">
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
