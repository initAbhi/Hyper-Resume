'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Search, Sparkles } from 'lucide-react';
import type { BlogPostMeta } from '@/lib/blog';
import { BlogCard, formatBlogDate } from './BlogCard';

const CATEGORIES = [
  'All',
  'ATS & Parsing',
  'Comparisons',
  'Resume Writing',
  'India Tech',
  'Interview Prep',
] as const;

export function BlogIndexClient({ posts }: { posts: BlogPostMeta[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [query, setQuery] = useState('');

  const featuredPost = useMemo(
    () => posts.find((p) => p.featured) ?? posts[0] ?? null,
    [posts],
  );

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCat =
        selectedCategory === 'All' || post.category === selectedCategory;
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [posts, selectedCategory, query]);

  const showFeaturedHero =
    Boolean(featuredPost) && selectedCategory === 'All' && query.trim() === '';

  const gridPosts = showFeaturedHero
    ? filteredPosts.filter((p) => p.slug !== featuredPost?.slug)
    : filteredPosts;

  return (
    <div className="space-y-10">
      {/* Search + Category Pills */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'border-[#1A1D23] bg-[#1A1D23] text-white shadow-xs dark:border-[#285FEA] dark:bg-[#285FEA]'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-[#14171C] dark:text-zinc-400 dark:hover:border-zinc-700'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#868C98]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ATS, Workday, Zety..."
            aria-label="Search blog articles"
            className="w-full rounded-xl border border-[#E4E7EC] bg-white py-2 pl-10 pr-4 text-sm text-[#1A1D23] placeholder:text-[#868C98] focus:border-[#285FEA] focus:outline-none dark:border-[#22262E] dark:bg-[#14171C] dark:text-[#F0F2F5] dark:focus:border-[#3B82F6]"
          />
        </div>
      </div>

      {/* Featured Pillar Article */}
      {showFeaturedHero && featuredPost && (
        <Link
          href={`/blog/${featuredPost.slug}`}
          className="group block rounded-2xl border border-[#E4E7EC] bg-white p-6 shadow-xs transition-all duration-200 hover:border-[#285FEA]/40 hover:shadow-md sm:p-8 dark:border-[#22262E] dark:bg-[#14171C] dark:hover:border-[#3B82F6]/50"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#285FEA] px-3 py-1 text-[11px] font-semibold text-white dark:bg-[#3B82F6]">
              <Sparkles className="h-3 w-3" />
              Featured Guide
            </span>
            <span className="inline-flex items-center rounded-full bg-[#285FEA]/10 px-2.5 py-1 text-[11px] font-semibold text-[#285FEA] dark:bg-[#3B82F6]/15 dark:text-[#60A5FA]">
              {featuredPost.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-[#868C98] dark:text-[#6B7280]">
              <Clock className="h-3.5 w-3.5" />
              {featuredPost.readingTime}
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#1A1D23] transition-colors group-hover:text-[#285FEA] sm:text-3xl dark:text-[#F0F2F5] dark:group-hover:text-[#60A5FA]">
            {featuredPost.title}
          </h2>

          <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#525866] dark:text-[#9CA3AF]">
            {featuredPost.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#E4E7EC] pt-4 text-xs text-[#868C98] dark:border-[#22262E] dark:text-[#6B7280]">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
                {featuredPost.author.name}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Updated {formatBlogDate(featuredPost.updatedAt)}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#285FEA] dark:text-[#60A5FA]">
              Read full breakdown
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      )}

      {/* Article Grid */}
      {gridPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gridPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        !showFeaturedHero && (
          <div className="rounded-2xl border border-[#E4E7EC] bg-white p-10 text-center dark:border-[#22262E] dark:bg-[#14171C]">
            <p className="text-sm font-medium text-[#525866] dark:text-[#9CA3AF]">
              No articles matched your filter. Try clearing the search or switching categories.
            </p>
          </div>
        )
      )}

      {/* Mid/Bottom Free ATS Tool Strip */}
      <div className="rounded-2xl border border-[#285FEA]/25 bg-gradient-to-r from-[#285FEA]/[0.08] via-white to-[#10B981]/[0.06] p-6 sm:p-8 dark:border-[#3B82F6]/30 dark:from-[#3B82F6]/[0.15] dark:via-[#14171C] dark:to-[#10B981]/[0.08]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#285FEA] dark:text-[#60A5FA]">
              Free Utility · Zero Login Wall
            </p>
            <h3 className="text-xl font-bold text-[#1A1D23] dark:text-[#F0F2F5]">
              Want to know what Workday &amp; Greenhouse actually extract from your PDF?
            </h3>
            <p className="text-sm text-[#525866] dark:text-[#9CA3AF]">
              Run our free 5-dimension ATS parser audit, 84-rule typo check, and lossless PDF compressor in 5 seconds.
            </p>
          </div>
          <Link
            href="/tools/resume-checker"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#285FEA] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1E4ECC] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB]"
          >
            <span>Test Resume Free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
