import React from 'react';
import { BookOpen } from 'lucide-react';
import { getAllPosts } from '@/lib/blog';
import { constructMetadata, getBreadcrumbJsonLd } from '@/lib/seo';
import { BlogIndexClient } from '@/components/blog/BlogIndexClient';

export const metadata = constructMetadata({
  title: 'Career & ATS Engineering Blog',
  description:
    'Code-backed guides on ATS resume parsing (Workday, Greenhouse, Lever), anti-hallucination AI bullet writing, and honest resume builder comparisons.',
  path: '/blog',
});

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
  ]);

  return (
    <main className="min-h-screen bg-[#F7F8FA] pt-10 pb-20 dark:bg-[#0D0F12]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E7EC] bg-white px-3 py-1 text-xs font-semibold text-[#285FEA] shadow-2xs dark:border-[#22262E] dark:bg-[#14171C] dark:text-[#60A5FA]">
            <BookOpen className="h-3.5 w-3.5" />
            HypeResume Engineering &amp; Career Guides
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1D23] sm:text-5xl dark:text-[#F0F2F5]">
            Proof Over Hype. Real ATS Mechanics &amp; Career Guides.
          </h1>

          <p className="text-base leading-relaxed text-[#525866] sm:text-lg dark:text-[#9CA3AF]">
            No generic fluff or inflated 95% match scores. Deep technical breakdowns on how Workday, Greenhouse, and Lever parse resumes — plus honest comparisons and actionable bullet rewrites.
          </p>
        </header>

        <BlogIndexClient posts={posts} />
      </div>
    </main>
  );
}
