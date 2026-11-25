import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { ArrowLeft, Calendar, ChevronRight, Clock, Tag } from 'lucide-react';
import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/blog';
import {
  constructMetadata,
  getBlogPostingJsonLd,
  getBreadcrumbJsonLd,
  getFaqJsonLd,
} from '@/lib/seo';
import { ReadingProgress } from '@/components/blog/ReadingProgress';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { StickyToolSidebar } from '@/components/blog/StickyToolSidebar';
import { AuthorBox } from '@/components/blog/AuthorBox';
import { BlogCard, formatBlogDate } from '@/components/blog/BlogCard';
import { ToolCtaCard } from '@/components/blog/mdx/ToolCtaCard';
import { BeforeAfterBullet } from '@/components/blog/mdx/BeforeAfterBullet';
import { Callout } from '@/components/blog/mdx/Callout';
import { FaqAccordion } from '@/components/blog/mdx/FaqAccordion';

const MDX_COMPONENTS = {
  ToolCtaCard,
  BeforeAfterBullet,
  Callout,
};

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return constructMetadata({ title: 'Article Not Found', path: `/blog/${slug}`, noIndex: true });
  }

  return constructMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    image: post.coverImage ?? '/og-image.png',
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: [post.author.name],
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = getRelatedPosts(post.slug, post.category, 3);

  const blogPostingJsonLd = getBlogPostingJsonLd({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    authorName: post.author.name,
    authorRole: post.author.role,
    image: post.coverImage ?? '/og-image.png',
  });

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  const faqJsonLd = post.faqs.length > 0 ? getFaqJsonLd(post.faqs) : null;

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-20 dark:bg-[#0D0F12]">
      <ReadingProgress />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-[#868C98] dark:text-[#6B7280]"
        >
          <Link href="/" className="hover:text-[#1A1D23] dark:hover:text-[#F0F2F5]">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/blog" className="hover:text-[#1A1D23] dark:hover:text-[#F0F2F5]">
            Blog
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate max-w-[260px] sm:max-w-md font-medium text-[#1A1D23] dark:text-[#F0F2F5]">
            {post.title}
          </span>
        </nav>

        {/* 3-Column Reading Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Sticky ToC (Desktop) */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-24 space-y-6">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#525866] hover:text-[#285FEA] dark:text-[#9CA3AF] dark:hover:text-[#60A5FA]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                All Articles
              </Link>
              <TableOfContents headings={post.headings} />
            </div>
          </aside>

          {/* Center Article Body */}
          <article className="lg:col-span-6">
            <div className="rounded-2xl border border-[#E4E7EC] bg-white p-6 shadow-xs sm:p-10 dark:border-[#22262E] dark:bg-[#14171C]">
              {/* Article Header */}
              <header className="mb-8 border-b border-[#E4E7EC] pb-8 dark:border-[#22262E]">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center rounded-full bg-[#285FEA]/10 px-3 py-1 text-xs font-semibold text-[#285FEA] dark:bg-[#3B82F6]/15 dark:text-[#60A5FA]">
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-[#868C98] dark:text-[#6B7280]">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readingTime}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-[#868C98] dark:text-[#6B7280]">
                    <Calendar className="h-3.5 w-3.5" />
                    Updated {formatBlogDate(post.updatedAt)}
                  </span>
                </div>

                <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#1A1D23] sm:text-4xl dark:text-[#F0F2F5]">
                  {post.title}
                </h1>

                <p className="mt-4 text-base leading-relaxed text-[#525866] dark:text-[#9CA3AF]">
                  {post.description}
                </p>

                <div className="mt-5 flex items-center gap-3 text-xs text-[#525866] dark:text-[#9CA3AF]">
                  <span className="font-semibold text-[#1A1D23] dark:text-[#F0F2F5]">
                    By {post.author.name}
                  </span>
                  <span>·</span>
                  <span>{post.author.role}</span>
                </div>
              </header>

              {/* MDX Content */}
              <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#285FEA] dark:prose-a:text-[#60A5FA] prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[13px] prose-code:before:content-none prose-code:after:content-none dark:prose-code:bg-zinc-800 prose-table:text-sm">
                <MDXRemote
                  source={post.content}
                  components={MDX_COMPONENTS}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                      rehypePlugins: [
                        rehypeSlug,
                        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                      ],
                    },
                  }}
                />
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-[#E4E7EC] pt-6 dark:border-[#22262E]">
                  <Tag className="h-3.5 w-3.5 text-[#868C98]" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-[#E4E7EC] bg-[#F7F8FA] px-2.5 py-1 text-xs font-medium text-[#525866] dark:border-[#22262E] dark:bg-[#0D0F12] dark:text-[#9CA3AF]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* FAQ Accordion */}
              <FaqAccordion items={post.faqs} />

              {/* Author E-E-A-T Box */}
              <AuthorBox author={post.author} />
            </div>
          </article>

          {/* Right Sticky Conversion Sidebar (Desktop) */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <StickyToolSidebar primaryTool={post.primaryTool} />
            </div>
          </aside>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 border-t border-[#E4E7EC] pt-12 dark:border-[#22262E]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-[#1A1D23] dark:text-[#F0F2F5]">
                Keep Reading
              </h2>
              <Link
                href="/blog"
                className="text-sm font-semibold text-[#285FEA] hover:underline dark:text-[#60A5FA]"
              >
                View all guides →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <BlogCard key={related.slug} post={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
