'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../ui/Logo';

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/app') || pathname?.startsWith('/admin')) return null;
  const productLinks = [
    { label: 'AI Resume Builder', href: '/login' },
    { label: 'Resume Checker', href: '/tools/resume-checker' },
    { label: 'Job Matcher', href: '/tools/job-match' },
    { label: 'Bullet Improver', href: '/tools/bullet-improver' },
    { label: 'Resume Score', href: '/tools/resume-score' },
  ];

  const templateLinks = [
    { label: 'Software Engineer', href: '/examples/software-engineer' },
    { label: 'Backend Developer', href: '/examples/backend-developer' },
    { label: 'Frontend Developer', href: '/examples/frontend-developer' },
    { label: 'Full Stack Developer', href: '/examples/full-stack-developer' },
    { label: 'DevOps / SRE', href: '/examples/devops-engineer' },
    { label: 'Tech Fresher', href: '/examples/fresher' },
  ];

  const companyLinks = [
    { label: 'Pricing', href: '/pricing' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Security', href: '/security' },
  ];

  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#07080E] text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4" aria-label="HypeResume Home">
              <Logo variant="full" size="md" theme="dark" />
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xs">
              Build ATS-optimized resumes backed by your real experience. No fabricated skills, no fake metrics.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Templates */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono mb-4">
              Templates
            </h4>
            <ul className="space-y-2.5">
              {templateLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 font-mono">
            © 2026 HypeResume. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-zinc-400 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-zinc-400 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/security" className="text-xs text-zinc-400 hover:text-white transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
