import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

export type BlogCategory =
  | 'ATS & Parsing'
  | 'Comparisons'
  | 'Resume Writing'
  | 'India Tech'
  | 'Interview Prep';

export type PrimaryToolKey = 'resume-checker' | 'job-match' | 'bullet-improver';

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface BlogAuthor {
  name: string;
  role: string;
  bio?: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  category: BlogCategory;
  tags: string[];
  readingTime: string;
  author: BlogAuthor;
  featured: boolean;
  primaryTool: PrimaryToolKey;
  coverImage?: string;
  faqs: BlogFaq[];
}

export interface BlogPost extends BlogPostMeta {
  content: string;
  headings: BlogHeading[];
}

function getBlogDir(): string {
  const localDir = path.join(process.cwd(), 'content', 'blog');
  if (fs.existsSync(localDir)) {
    return localDir;
  }
  const monorepoDir = path.join(process.cwd(), 'frontend', 'content', 'blog');
  if (fs.existsSync(monorepoDir)) {
    return monorepoDir;
  }
  return localDir;
}

/**
 * Matches github-slugger / rehype-slug heading ID generation for H2/H3 Table of Contents.
 */
function slugifyHeading(text: string, seen: Map<string, number>): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[`*_~[\]()]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

function extractHeadings(markdown: string): BlogHeading[] {
  const headings: BlogHeading[] = [];
  const seen = new Map<string, number>();
  let inCodeFence = false;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith('```')) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;

    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const text = match[2].replace(/[`*_~]/g, '').trim();
    if (!text) continue;

    headings.push({
      id: slugifyHeading(text, seen),
      text,
      level,
    });
  }

  return headings;
}

function parsePostFile(filePath: string): BlogPost {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const fileSlug = path.basename(filePath, path.extname(filePath));
  const stats = readingTime(content);

  const authorRaw = (data.author ?? {}) as Partial<BlogAuthor>;
  const faqsRaw = Array.isArray(data.faqs) ? (data.faqs as BlogFaq[]) : [];

  return {
    slug: typeof data.slug === 'string' && data.slug ? data.slug : fileSlug,
    title: String(data.title ?? fileSlug),
    description: String(data.description ?? ''),
    publishedAt: String(data.publishedAt ?? '2026-11-25'),
    updatedAt: String(data.updatedAt ?? data.publishedAt ?? '2026-11-25'),
    category: (data.category as BlogCategory) || 'ATS & Parsing',
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingTime: stats.text,
    author: {
      name: authorRaw.name ?? 'HypeResume Engineering',
      role: authorRaw.role ?? 'Staff Engineer & Founder',
      bio: authorRaw.bio,
    },
    featured: Boolean(data.featured),
    primaryTool: (data.primaryTool as PrimaryToolKey) || 'resume-checker',
    coverImage: typeof data.coverImage === 'string' ? data.coverImage : undefined,
    faqs: faqsRaw.filter((f) => f && typeof f.question === 'string' && typeof f.answer === 'string'),
    content,
    headings: extractHeadings(content),
  };
}

export function getAllPosts(): BlogPostMeta[] {
  const dir = getBlogDir();
  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.mdx') || file.endsWith('.md'));

  return files
    .map((file) => {
      const post = parsePostFile(path.join(dir, file));
      return {
        slug: post.slug,
        title: post.title,
        description: post.description,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        category: post.category,
        tags: post.tags,
        readingTime: post.readingTime,
        author: post.author,
        featured: post.featured,
        primaryTool: post.primaryTool,
        coverImage: post.coverImage,
        faqs: post.faqs,
      };
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const dir = getBlogDir();
  if (!fs.existsSync(dir)) return null;

  const directMdx = path.join(dir, `${slug}.mdx`);
  if (fs.existsSync(directMdx)) {
    return parsePostFile(directMdx);
  }

  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.mdx') || file.endsWith('.md'));

  for (const file of files) {
    const post = parsePostFile(path.join(dir, file));
    if (post.slug === slug) return post;
  }

  return null;
}

export function getRelatedPosts(
  currentSlug: string,
  category: BlogCategory,
  limit = 3,
): BlogPostMeta[] {
  const all = getAllPosts().filter((p) => p.slug !== currentSlug);
  const sameCategory = all.filter((p) => p.category === category);
  const others = all.filter((p) => p.category !== category);
  return [...sameCategory, ...others].slice(0, limit);
}
