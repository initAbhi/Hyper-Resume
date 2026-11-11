import React from 'react';
import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
  title: 'Terms of Service',
  description: 'Terms of service for HypeResume. Clear rules on usage, one-time Pro passes, and truthful resume creation.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-zinc-800 dark:text-zinc-200">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-zinc-900 dark:text-zinc-50">
        Terms of Service
      </h1>
      <p className="text-xs text-zinc-500 mb-8 font-mono">Last updated: November 2026</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            1. Truthful Application Invariant
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            HypeResume is designed to highlight and structure your genuine professional experience. You agree that all credentials, employment histories, degrees, and project claims entered into the platform are accurate to the best of your knowledge.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            2. No Guarantees of Employment or ATS Passage
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            HypeResume provides optimization tools, formatting checks, and compatibility indicators based on common recruitment standards. We make no guarantee that using the platform will result in job offers, interview invitations, or passage through third-party ATS algorithms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            3. One-Time Pro Passes & Founding Lifetime Access
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            All HypeResume Pro passes (1-Week Pass, Monthly Pass, 6-Month Pass, and the limited Founding Lifetime Offer) are processed as transparent one-time purchases via Dodo Payments. They do not auto-renew or trigger surprise recurring rebills. Once a timed pass expires, your resumes and clean PDF export capabilities remain accessible on the Free Starter tier.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            4. Prohibited Activities
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            You may not scrape, reverse engineer, or abuse our backend APIs, bypass rate limits, or upload malicious files or automated prompts intended to manipulate AI systems.
          </p>
        </section>
      </div>
    </div>
  );
}
