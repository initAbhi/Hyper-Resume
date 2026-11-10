import type { ResumeShareEventType } from './api-client';

export type ShareExpiryPreset = 'never' | '7d' | '30d' | '90d';

/**
 * Builds the canonical public Recruiter View URL for a shared resume slug.
 */
export function buildPublicShareUrl(slug: string, origin?: string): string {
  const cleanSlug = slug.trim().replace(/^\/+|\/+$/g, '');
  const resolvedOrigin =
    origin ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://hype-resume.com');
  return `${resolvedOrigin}/r/${cleanSlug}`;
}

/**
 * Computes an ISO expiration timestamp from a user-selected duration preset.
 */
export function computeExpiryIso(
  preset: ShareExpiryPreset,
  now: Date = new Date(),
): string | null {
  if (preset === 'never') return null;
  const daysMap: Record<Exclude<ShareExpiryPreset, 'never'>, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };
  const target = new Date(now.getTime());
  target.setUTCDate(target.getUTCDate() + daysMap[preset]);
  return target.toISOString();
}

/**
 * Infers the nearest UI expiry preset from a persisted expiresAt timestamp.
 */
export function inferExpiryPreset(expiresAt?: string | null): ShareExpiryPreset {
  if (!expiresAt) return 'never';
  const targetMs = new Date(expiresAt).getTime();
  if (Number.isNaN(targetMs)) return 'never';
  const diffDays = (targetMs - Date.now()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 10) return '7d';
  if (diffDays <= 45) return '30d';
  return '90d';
}

/**
 * Sanitizes custom user input into a URL-safe lowercase hyphenated slug.
 */
export function normalizeShareSlugDraft(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

/**
 * Formats an ISO timestamp into a concise relative age label.
 */
export function formatRelativeTime(iso?: string | null): string {
  if (!iso) return 'Never';
  const dateMs = new Date(iso).getTime();
  if (Number.isNaN(dateMs)) return 'Recently';
  const diffSec = Math.max(0, Math.floor((Date.now() - dateMs) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(dateMs).toLocaleDateString();
}

export function formatShareEventLabel(eventType: ResumeShareEventType): string {
  switch (eventType) {
    case 'view':
      return 'Viewed Resume';
    case 'download_pdf':
      return 'Downloaded PDF';
    case 'download_docx':
      return 'Downloaded DOCX';
    case 'print':
      return 'Printed Resume';
    case 'contact_click':
      return 'Clicked Contact';
    default:
      return eventType;
  }
}

