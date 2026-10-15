import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-12 text-sm text-zinc-500 dark:text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="font-semibold text-zinc-900 dark:text-zinc-200">HyperResume</p>
          <p className="text-xs">
            Truthful AI job-application optimization platform.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/security" className="hover:underline">
            Security
          </Link>
        </div>

        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          © 2026 HyperResume. Built for real career growth.
        </p>
      </div>
    </footer>
  );
}
