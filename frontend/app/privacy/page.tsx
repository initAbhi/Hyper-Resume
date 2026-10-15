import React from 'react';
import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
  title: 'Privacy Policy & Data Protection',
  description: 'How HyperResume protects your personal career data. Zero model training on resumes, strict access controls, and transparent retention rules.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-zinc-800 dark:text-zinc-200">
      <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-zinc-900 dark:text-zinc-50">
        Privacy Policy
      </h1>
      <p className="text-xs text-zinc-500 mb-8 font-mono">Last updated: October 2026</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            1. Core Principle: Your Experience Remains Yours
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Resumes contain deeply personal career and contact information. We collect only what is strictly required to parse your experience, compare it with job descriptions, and generate tailored applications.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            2. Zero AI Training on Candidate Resumes
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            HyperResume does <strong>not</strong> use your resumes, cover letters, or job descriptions to train underlying foundation models. Any AI-based structuring and bullet suggestions are executed via secure enterprise APIs with strict zero-data-retention agreements.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            3. Information We Collect
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
            <li><strong>Account Data:</strong> Full name, email address, and encrypted authentication tokens.</li>
            <li><strong>Resume Content:</strong> Education, work history, projects, and skills you provide or upload.</li>
            <li><strong>Job Targets:</strong> Job descriptions pasted into the matching engine.</li>
            <li><strong>Analytical Telemetry:</strong> Aggregated, non-PII operational metrics (e.g. page views, export success rates).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            4. Data Retention & User Deletion Rights
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            You maintain full ownership of your data. You can export your data or delete your account and associated resumes at any time from your settings panel. Upon account deletion, all database records and uploaded files are permanently purged.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            5. Security & Encryption
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            All data in transit is encrypted using TLS 1.3. Stored database records and files are protected with AES-256 encryption. Access to user resources is strictly gated by tenant authorization checks.
          </p>
        </section>
      </div>
    </div>
  );
}
