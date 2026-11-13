import { BadRequestException } from '@nestjs/common';
import type { ResumeContent } from '../resumes/entities/resume.types.js';

export type JobBoardSource =
  | 'Greenhouse'
  | 'Ashby'
  | 'Lever'
  | 'Remotive'
  | 'Arbeitnow'
  | 'Snapshot';

export type WorkplaceType = 'Remote' | 'Hybrid' | 'Onsite';

export interface CuratedAtsBoard {
  token: string;
  name: string;
  provider: 'greenhouse' | 'ashby' | 'lever';
  category: string;
}

export interface DiscoveredJobItem {
  id: string;
  externalId: string;
  title: string;
  company: string;
  location: string;
  workplaceType: WorkplaceType;
  employmentType: string;
  source: JobBoardSource;
  boardToken?: string;
  applyUrl: string;
  postedAt: string;
  salaryRange?: string;
  tags: string[];
  snippet: string;
  descriptionText: string;
  isLive: boolean;
  // Enriched per-request against candidate resume & tracker
  matchScore?: number;
  matchedSkills?: string[];
  missingKeywords?: string[];
  isSavedInTracker?: boolean;
  trackedApplicationId?: string;
}

export interface SourceFetchStatus {
  source: string;
  ok: boolean;
  count: number;
  cached: boolean;
  error?: string;
}

export const DEFAULT_ATS_BOARDS: CuratedAtsBoard[] = [
  { token: 'linear', name: 'Linear', provider: 'ashby', category: 'Product Engineering' },
  { token: 'notion', name: 'Notion', provider: 'ashby', category: 'Collaboration & AI' },
  { token: 'vercel', name: 'Vercel', provider: 'greenhouse', category: 'Cloud Infrastructure' },
  { token: 'stripe', name: 'Stripe', provider: 'greenhouse', category: 'FinTech Payments' },
  { token: 'figma', name: 'Figma', provider: 'greenhouse', category: 'Design Systems' },
  { token: 'datadog', name: 'Datadog', provider: 'greenhouse', category: 'Observability' },
];

const TECH_TAG_CATALOG: Array<{ pattern: RegExp; tag: string }> = [
  { pattern: /\btypescript\b/i, tag: 'TypeScript' },
  { pattern: /\bjavascript\b/i, tag: 'JavaScript' },
  { pattern: /\breact(?:\.js)?\b/i, tag: 'React' },
  { pattern: /\bnext\.?js\b/i, tag: 'Next.js' },
  { pattern: /\bnode\.?js\b/i, tag: 'Node.js' },
  { pattern: /\bnest\.?js\b/i, tag: 'NestJS' },
  { pattern: /\bgo(?:lang)?\b/i, tag: 'Go' },
  { pattern: /\bpython\b/i, tag: 'Python' },
  { pattern: /\brust\b/i, tag: 'Rust' },
  { pattern: /\bjava\b/i, tag: 'Java' },
  { pattern: /\bpostgresql|postgres\b/i, tag: 'PostgreSQL' },
  { pattern: /\bredis\b/i, tag: 'Redis' },
  { pattern: /\bkafka\b/i, tag: 'Kafka' },
  { pattern: /\bkubernetes|k8s\b/i, tag: 'Kubernetes' },
  { pattern: /\bdocker\b/i, tag: 'Docker' },
  { pattern: /\bterraform\b/i, tag: 'Terraform' },
  { pattern: /\baws\b/i, tag: 'AWS' },
  { pattern: /\bgcp|google cloud\b/i, tag: 'Google Cloud' },
  { pattern: /\bgraphql\b/i, tag: 'GraphQL' },
  { pattern: /\bsql\b/i, tag: 'SQL' },
  { pattern: /\bai|llm|machine learning\b/i, tag: 'AI / LLM' },
  { pattern: /\bdistributed systems\b/i, tag: 'Distributed Systems' },
];

export const CACHE_TTL_MS = 15 * 60 * 1000; // 15-minute TTL cache
const FETCH_TIMEOUT_MS = 15000;
const sourceCache = new Map<string, { items: DiscoveredJobItem[]; fetchedAt: number }>();

export function clearJobDiscoveryCache(): void {
  sourceCache.clear();
}

export function sanitizeBoardToken(raw: string): string {
  const cleaned = raw.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{0,62}$/.test(cleaned)) {
    throw new BadRequestException(
      'Invalid ATS board token. Use alphanumeric company slugs only (e.g. "stripe", "linear", "figma").',
    );
  }
  return cleaned;
}

export function stripHtmlToText(htmlOrText: string): string {
  if (!htmlOrText) return '';
  return htmlOrText
    .replace(/<script\b[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<(?:br|hr)\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function detectWorkplaceType(
  location: string,
  title: string,
  isRemoteFlag?: boolean,
): WorkplaceType {
  if (isRemoteFlag) return 'Remote';
  const corpus = `${location} ${title}`.toLowerCase();
  if (/\bhybrid\b/.test(corpus)) return 'Hybrid';
  if (/\bremote\b|\banywhere\b|\bworldwide\b|\bdistributed\b/.test(corpus)) {
    return 'Remote';
  }
  return 'Onsite';
}

export function extractTagsFromJobText(
  text: string,
  providedTags: string[] = [],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const t of providedTags) {
    const clean = t.trim();
    if (clean && clean.length <= 28 && !seen.has(clean.toLowerCase())) {
      seen.add(clean.toLowerCase());
      out.push(clean);
    }
  }

  for (const item of TECH_TAG_CATALOG) {
    if (item.pattern.test(text) && !seen.has(item.tag.toLowerCase())) {
      seen.add(item.tag.toLowerCase());
      out.push(item.tag);
    }
  }

  return out.slice(0, 7);
}

function buildSnippet(text: string): string {
  const singleLine = text.replace(/\s+/g, ' ').trim();
  if (singleLine.length <= 220) return singleLine;
  const sliced = singleLine.slice(0, 218);
  const lastSpace = sliced.lastIndexOf(' ');
  return `${(lastSpace > 140 ? sliced.slice(0, lastSpace) : sliced).trim()}...`;
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'HyperResume-JobDiscovery/1.0',
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchGreenhouseBoard(
  boardToken: string,
  companyLabel?: string,
  refresh = false,
): Promise<{ items: DiscoveredJobItem[]; cached: boolean }> {
  const token = sanitizeBoardToken(boardToken);
  const cacheKey = `greenhouse:${token}`;
  const now = Date.now();
  const cached = sourceCache.get(cacheKey);
  if (!refresh && cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return { items: cached.items, cached: true };
  }

  // Omit ?content=true on the full board index (which exceeds 6MB for large boards like Stripe)
  // and fetch rich descriptions only for the top 15 slice when missing.
  const data = await fetchJsonWithTimeout<{ jobs?: Array<any> }>(
    `https://boards-api.greenhouse.io/v1/boards/${token}/jobs`,
  );

  const label = companyLabel || token.charAt(0).toUpperCase() + token.slice(1);
  const rawJobs = Array.isArray(data?.jobs) ? data.jobs.slice(0, 15) : [];
  const enrichedContents = await Promise.all(
    rawJobs.map(async (j) => {
      if (j.content || !j.id) return j.content as string | undefined;
      try {
        const detail = await fetchJsonWithTimeout<{ content?: string }>(
          `https://boards-api.greenhouse.io/v1/boards/${token}/jobs/${j.id}`,
          8000,
        );
        return detail?.content;
      } catch {
        return undefined;
      }
    }),
  );

  const items: DiscoveredJobItem[] = rawJobs.map((j, idx) => {
    const descriptionText = stripHtmlToText(enrichedContents[idx] || j.content || j.title || '');
    const loc = j.location?.name || 'Multiple Locations';
    return {
      id: `gh-${token}-${j.id}`,
      externalId: String(j.id),
      title: String(j.title || 'Open Role').trim(),
      company: j.company_name || label,
      location: loc,
      workplaceType: detectWorkplaceType(loc, j.title || ''),
      employmentType: 'Full-time',
      source: 'Greenhouse',
      boardToken: token,
      applyUrl: j.absolute_url || `https://boards.greenhouse.io/${token}/jobs/${j.id}`,
      postedAt: j.updated_at || new Date().toISOString(),
      tags: extractTagsFromJobText(`${j.title} ${descriptionText}`),
      snippet: buildSnippet(descriptionText),
      descriptionText: descriptionText || `${j.title} at ${label} (${loc})`,
      isLive: true,
    };
  });

  sourceCache.set(cacheKey, { items, fetchedAt: now });
  return { items, cached: false };
}

export async function fetchAshbyBoard(
  boardToken: string,
  companyLabel?: string,
  refresh = false,
): Promise<{ items: DiscoveredJobItem[]; cached: boolean }> {
  const token = sanitizeBoardToken(boardToken);
  const cacheKey = `ashby:${token}`;
  const now = Date.now();
  const cached = sourceCache.get(cacheKey);
  if (!refresh && cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return { items: cached.items, cached: true };
  }

  const data = await fetchJsonWithTimeout<{ jobs?: Array<any> }>(
    `https://api.ashbyhq.com/posting-api/job-board/${token}?includeCompensation=true`,
  );

  const label = companyLabel || token.charAt(0).toUpperCase() + token.slice(1);
  const rawJobs = Array.isArray(data?.jobs) ? data.jobs.slice(0, 25) : [];
  const items: DiscoveredJobItem[] = rawJobs.map((j) => {
    const descriptionText = stripHtmlToText(
      j.descriptionPlain || j.descriptionHtml || j.title || '',
    );
    const loc = j.location || 'Remote / Hybrid';
    const comp = j.compensationTierSummary || undefined;
    return {
      id: `ashby-${token}-${j.id || j.title}`,
      externalId: String(j.id || j.jobUrl || j.title),
      title: String(j.title || 'Open Role').trim(),
      company: label,
      location: loc,
      workplaceType: detectWorkplaceType(loc, j.title || '', Boolean(j.isRemote)),
      employmentType: j.employmentType || 'Full-time',
      source: 'Ashby',
      boardToken: token,
      applyUrl: j.jobUrl || j.applyUrl || `https://jobs.ashbyhq.com/${token}`,
      postedAt: j.publishedAt || new Date().toISOString(),
      salaryRange: typeof comp === 'string' && comp.trim() ? comp.trim() : undefined,
      tags: extractTagsFromJobText(`${j.title} ${descriptionText}`),
      snippet: buildSnippet(descriptionText),
      descriptionText: descriptionText || `${j.title} at ${label} (${loc})`,
      isLive: true,
    };
  });

  sourceCache.set(cacheKey, { items, fetchedAt: now });
  return { items, cached: false };
}

export async function fetchLeverBoard(
  boardToken: string,
  companyLabel?: string,
  refresh = false,
): Promise<{ items: DiscoveredJobItem[]; cached: boolean }> {
  const token = sanitizeBoardToken(boardToken);
  const cacheKey = `lever:${token}`;
  const now = Date.now();
  const cached = sourceCache.get(cacheKey);
  if (!refresh && cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return { items: cached.items, cached: true };
  }

  const data = await fetchJsonWithTimeout<Array<any>>(
    `https://api.lever.co/v0/postings/${token}?mode=json`,
  );

  const label = companyLabel || token.charAt(0).toUpperCase() + token.slice(1);
  const rawJobs = Array.isArray(data) ? data.slice(0, 25) : [];
  const items: DiscoveredJobItem[] = rawJobs.map((j) => {
    const descriptionText = stripHtmlToText(j.descriptionPlain || j.description || j.text || '');
    const loc = j.categories?.location || 'Remote / Onsite';
    return {
      id: `lever-${token}-${j.id}`,
      externalId: String(j.id),
      title: String(j.text || 'Open Role').trim(),
      company: label,
      location: loc,
      workplaceType: detectWorkplaceType(
        `${loc} ${j.workplaceType || ''}`,
        j.text || '',
        j.workplaceType === 'remote',
      ),
      employmentType: j.categories?.commitment || 'Full-time',
      source: 'Lever',
      boardToken: token,
      applyUrl: j.hostedUrl || j.applyUrl || `https://jobs.lever.co/${token}`,
      postedAt: j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString(),
      tags: extractTagsFromJobText(`${j.text} ${descriptionText}`),
      snippet: buildSnippet(descriptionText),
      descriptionText: descriptionText || `${j.text} at ${label} (${loc})`,
      isLive: true,
    };
  });

  sourceCache.set(cacheKey, { items, fetchedAt: now });
  return { items, cached: false };
}

export async function fetchRemotiveJobs(
  refresh = false,
): Promise<{ items: DiscoveredJobItem[]; cached: boolean }> {
  const cacheKey = 'remotive:default';
  const now = Date.now();
  const cached = sourceCache.get(cacheKey);
  if (!refresh && cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return { items: cached.items, cached: true };
  }

  const data = await fetchJsonWithTimeout<{ jobs?: Array<any> }>(
    'https://remotive.com/api/remote-jobs?limit=35',
  );

  const rawJobs = Array.isArray(data?.jobs) ? data.jobs : [];
  const items: DiscoveredJobItem[] = rawJobs.map((j) => {
    const descriptionText = stripHtmlToText(j.description || j.title || '');
    const loc = j.candidate_required_location || 'Remote (Worldwide)';
    return {
      id: `remotive-${j.id}`,
      externalId: String(j.id),
      title: String(j.title || 'Remote Role').trim(),
      company: String(j.company_name || 'Remote Company').trim(),
      location: `${loc} (Remote)`,
      workplaceType: 'Remote',
      employmentType: j.job_type ? String(j.job_type).replace(/_/g, ' ') : 'Full-time',
      source: 'Remotive',
      applyUrl: j.url || 'https://remotive.com',
      postedAt: j.publication_date || new Date().toISOString(),
      salaryRange: j.salary && String(j.salary).trim() ? String(j.salary).trim() : undefined,
      tags: extractTagsFromJobText(
        `${j.title} ${descriptionText}`,
        Array.isArray(j.tags) ? j.tags.slice(0, 4) : [],
      ),
      snippet: buildSnippet(descriptionText),
      descriptionText: descriptionText || `${j.title} at ${j.company_name}`,
      isLive: true,
    };
  });

  sourceCache.set(cacheKey, { items, fetchedAt: now });
  return { items, cached: false };
}

export async function fetchArbeitnowJobs(
  refresh = false,
): Promise<{ items: DiscoveredJobItem[]; cached: boolean }> {
  const cacheKey = 'arbeitnow:default';
  const now = Date.now();
  const cached = sourceCache.get(cacheKey);
  if (!refresh && cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return { items: cached.items, cached: true };
  }

  const data = await fetchJsonWithTimeout<{ data?: Array<any> }>(
    'https://www.arbeitnow.com/api/job-board-api',
  );

  const rawJobs = Array.isArray(data?.data) ? data.data.slice(0, 35) : [];
  const items: DiscoveredJobItem[] = rawJobs.map((j) => {
    const descriptionText = stripHtmlToText(j.description || j.title || '');
    const loc = j.location || (j.remote ? 'Remote' : 'Europe / Global');
    return {
      id: `arbeitnow-${j.slug}`,
      externalId: String(j.slug),
      title: String(j.title || 'Open Position').trim(),
      company: String(j.company_name || 'Tech Company').trim(),
      location: j.remote && !/remote/i.test(loc) ? `${loc} (Remote)` : loc,
      workplaceType: detectWorkplaceType(loc, j.title || '', Boolean(j.remote)),
      employmentType: Array.isArray(j.job_types) && j.job_types[0] ? String(j.job_types[0]) : 'Full-time',
      source: 'Arbeitnow',
      applyUrl: j.url || 'https://www.arbeitnow.com',
      postedAt: j.created_at
        ? new Date(Number(j.created_at) * 1000).toISOString()
        : new Date().toISOString(),
      tags: extractTagsFromJobText(
        `${j.title} ${descriptionText}`,
        Array.isArray(j.tags) ? j.tags.slice(0, 4) : [],
      ),
      snippet: buildSnippet(descriptionText),
      descriptionText: descriptionText || `${j.title} at ${j.company_name}`,
      isLive: true,
    };
  });

  sourceCache.set(cacheKey, { items, fetchedAt: now });
  return { items, cached: false };
}

export function getOfflineFallbackJobs(): DiscoveredJobItem[] {
  const nowIso = new Date().toISOString();
  return [
    {
      id: 'snapshot-linear-fullstack',
      externalId: 'snapshot-linear-fullstack',
      title: 'Senior Full-Stack Engineer',
      company: 'Linear',
      location: 'Remote (US/EU)',
      workplaceType: 'Remote',
      employmentType: 'Full-time',
      source: 'Snapshot',
      boardToken: 'linear',
      applyUrl: 'https://linear.app/careers',
      postedAt: nowIso,
      tags: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
      snippet: 'Build high-performance collaborative issue tracking interfaces and real-time sync infrastructure.',
      descriptionText:
        'We are looking for a Senior Full-Stack Engineer experienced in TypeScript, React, Node.js, and PostgreSQL to build low-latency product infrastructure.',
      isLive: false,
    },
    {
      id: 'snapshot-stripe-infra',
      externalId: 'snapshot-stripe-infra',
      title: 'Staff Backend & Payments Infrastructure Engineer',
      company: 'Stripe',
      location: 'Bengaluru / Seattle (Hybrid)',
      workplaceType: 'Hybrid',
      employmentType: 'Full-time',
      source: 'Snapshot',
      boardToken: 'stripe',
      applyUrl: 'https://stripe.com/jobs',
      postedAt: nowIso,
      tags: ['Go', 'Distributed Systems', 'Kafka', 'PostgreSQL', 'AWS'],
      snippet: 'Design fault-tolerant global financial ledger services and idempotent API gateways at scale.',
      descriptionText:
        'Lead reliability engineering for global settlement pipelines using Go, Kafka, PostgreSQL, AWS, and Distributed Systems best practices.',
      isLive: false,
    },
  ];
}

export function computeResumeJobFit(
  job: DiscoveredJobItem,
  resumeContent?: ResumeContent | null,
): {
  matchScore: number;
  matchedSkills: string[];
  missingKeywords: string[];
} {
  if (!resumeContent) {
    return {
      matchScore: 0,
      matchedSkills: [],
      missingKeywords: job.tags.slice(0, 5),
    };
  }

  const candidateCorpus = [
    resumeContent.headline || '',
    resumeContent.summary || '',
    ...(resumeContent.skills || []).map((s) => s.name),
    ...(resumeContent.experience || []).flatMap((e) => [e.title, e.company, ...(e.bullets || [])]),
    ...(resumeContent.projects || []).flatMap((p) => [p.name, p.description, ...(p.highlights || [])]),
  ]
    .join('\n')
    .toLowerCase();

  const jobKeywords = extractTagsFromJobText(
    `${job.title}\n${job.descriptionText}`,
    job.tags,
  );

  const titleTokens = job.title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !['with', 'team', 'lead', 'engineer', 'senior', 'staff'].includes(w));

  const matchedSkills: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of jobKeywords) {
    const cleanLower = kw.toLowerCase();
    const escaped = cleanLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
    if (regex.test(candidateCorpus)) {
      matchedSkills.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  // Title role keyword overlap score
  const matchedTitleTokens = titleTokens.filter((t) => candidateCorpus.includes(t));
  const skillCoverage =
    jobKeywords.length > 0 ? matchedSkills.length / jobKeywords.length : 0.45;
  const titleCoverage =
    titleTokens.length > 0 ? matchedTitleTokens.length / titleTokens.length : 0.5;

  const hasExpSignals = (resumeContent.experience?.length || 0) >= 1 ? 15 : 5;
  const rawScore = Math.round(skillCoverage * 65 + titleCoverage * 20 + hasExpSignals);
  const matchScore = Math.max(12, Math.min(98, rawScore));

  return {
    matchScore,
    matchedSkills,
    missingKeywords: missingKeywords.slice(0, 5),
  };
}

