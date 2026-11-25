import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import type { BlogPostMeta } from '@/lib/blog';

export function formatBlogDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BlogCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col justify-between rounded-2xl border border-[#E4E7EC] bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#285FEA]/40 hover:shadow-md dark:border-[#22262E] dark:bg-[#14171C] dark:hover:border-[#3B82F6]/50"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-[#285FEA]/10 px-2.5 py-1 text-[11px] font-semibold text-[#285FEA] dark:bg-[#3B82F6]/15 dark:text-[#60A5FA]">
            {post.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-[#868C98] dark:text-[#6B7280]">
            <Clock className="h-3 w-3" />
            {post.readingTime}
          </span>
        </div>

        <h3 className="mt-4 text-lg font-bold leading-snug tracking-tight text-[#1A1D23] transition-colors group-hover:text-[#285FEA] dark:text-[#F0F2F5] dark:group-hover:text-[#60A5FA]">
          {post.title}
        </h3>

        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-[#525866] dark:text-[#9CA3AF]">
          {post.description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-[#E4E7EC] pt-4 text-xs text-[#868C98] dark:border-[#22262E] dark:text-[#6B7280]">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {formatBlogDate(post.updatedAt)}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-[#285FEA] dark:text-[#60A5FA]">
          Read guide
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
