export function formatRelativePostedDate(
  isoInput: string,
  nowMs: number = Date.now(),
): string {
  const ts = new Date(isoInput).getTime();
  if (Number.isNaN(ts)) return 'Recent';

  const diffMs = Math.max(0, nowMs - ts);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 14) return `${days}d ago`;

  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function classifyMatchTier(score?: number): {
  tier: 'strong' | 'moderate' | 'explore';
  label: string;
} {
  const safe = typeof score === 'number' && !Number.isNaN(score) ? score : 0;
  if (safe >= 72) return { tier: 'strong', label: 'Strong Fit' };
  if (safe >= 45) return { tier: 'moderate', label: 'Partial Overlap' };
  return { tier: 'explore', label: 'Review Gaps' };
}

export function normalizeBoardSlugInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(?:boards\.greenhouse\.io|jobs\.ashbyhq\.com|jobs\.lever\.co)\//i, '')
    .split('/')[0]
    .replace(/[^a-z0-9_-]/g, '');
}

