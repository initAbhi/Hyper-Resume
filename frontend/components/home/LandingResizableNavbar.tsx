'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarButton,
} from '@/components/ui/resizable-navbar';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth-context';

const NAV_ITEMS = [
  { name: 'Product', link: '#product-workspace' },
  { name: 'Templates', link: '#templates' },
  { name: 'Samples', link: '/examples' },
  { name: 'Pricing', link: '/pricing' },
];

/**
 * Landing navbar — dark theme on desktop + mobile, stays sticky while scrolling.
 */
export function LandingResizableNavbar() {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative w-full">
      <Navbar className="-mb-16">
        <NavBody>
          <Link href="/" className="relative z-20 flex items-center" aria-label="HypeResume Home">
            <Logo variant="full" size="md" theme="dark" priority />
          </Link>
          <NavItems
            items={NAV_ITEMS}
            className="text-zinc-200"
            onItemClick={() => setMobileOpen(false)}
          />
          <div className="relative z-20 flex items-center gap-3">
            {isAuthenticated ? (
              <NavbarButton href="/app" variant="primary">
                Dashboard
              </NavbarButton>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden text-sm font-medium text-zinc-400 transition-colors hover:text-white lg:inline-flex"
                >
                  Log in
                </Link>
                <NavbarButton href="/register" variant="primary" className="relative z-20">
                  Get Started
                </NavbarButton>
              </>
            )}
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <Link href="/" aria-label="HypeResume Home">
              <Logo variant="full" size="md" theme="dark" priority />
            </Link>
            <MobileNavToggle isOpen={mobileOpen} onClick={() => setMobileOpen((v) => !v)} />
          </MobileNavHeader>
          <MobileNavMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.link}
                onClick={() => setMobileOpen(false)}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.06] hover:text-white"
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-3 flex w-full flex-col gap-2 border-t border-white/10 pt-3">
              {isAuthenticated ? (
                <NavbarButton href="/app" variant="primary" className="w-full">
                  Dashboard
                </NavbarButton>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full rounded-full bg-white/[0.06] px-4 py-2.5 text-center text-sm font-medium text-zinc-200 transition hover:bg-white/[0.1]"
                  >
                    Log in
                  </Link>
                  <NavbarButton href="/register" variant="primary" className="w-full">
                    Get Started
                  </NavbarButton>
                </>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
