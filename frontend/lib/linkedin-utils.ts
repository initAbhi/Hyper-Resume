import type { LinkedInExperienceOptimization } from '@/lib/api-client';

export const LINKEDIN_HEADLINE_LIMIT = 220;
export const LINKEDIN_ABOUT_LIMIT = 2600;
export const LINKEDIN_ABOUT_FOLD_CHARS = 265;

export interface HeadlineBudgetStatus {
  length: number;
  limit: number;
  status: 'optimal' | 'short' | 'over';
  label: string;
}

export function evaluateHeadlineBudget(headline: string): HeadlineBudgetStatus {
  const length = headline.trim().length;
  if (length > LINKEDIN_HEADLINE_LIMIT) {
    return {
      length,
      limit: LINKEDIN_HEADLINE_LIMIT,
      status: 'over',
      label: `${length}/${LINKEDIN_HEADLINE_LIMIT} chars (${length - LINKEDIN_HEADLINE_LIMIT} over LinkedIn limit)`,
    };
  }
  if (length >= 90) {
    return {
      length,
      limit: LINKEDIN_HEADLINE_LIMIT,
      status: 'optimal',
      label: `${length}/${LINKEDIN_HEADLINE_LIMIT} chars (Optimal search length)`,
    };
  }
  return {
    length,
    limit: LINKEDIN_HEADLINE_LIMIT,
    status: 'short',
    label: `${length}/${LINKEDIN_HEADLINE_LIMIT} chars (Add stack/domain keywords)`,
  };
}

export function splitAboutFold(about: string): {
  beforeFold: string;
  afterFold: string;
  exceedsFold: boolean;
  exceedsLimit: boolean;
} {
  const clean = about.trim();
  const exceedsFold = clean.length > LINKEDIN_ABOUT_FOLD_CHARS;
  const exceedsLimit = clean.length > LINKEDIN_ABOUT_LIMIT;
  if (!exceedsFold) {
    return {
      beforeFold: clean,
      afterFold: '',
      exceedsFold: false,
      exceedsLimit,
    };
  }
  const rawSlice = clean.slice(0, LINKEDIN_ABOUT_FOLD_CHARS);
  const lastSpace = rawSlice.lastIndexOf(' ');
  const splitIdx =
    lastSpace > LINKEDIN_ABOUT_FOLD_CHARS - 25 ? lastSpace : LINKEDIN_ABOUT_FOLD_CHARS;
  return {
    beforeFold: clean.slice(0, splitIdx).trimEnd(),
    afterFold: clean.slice(splitIdx).trimStart(),
    exceedsFold: true,
    exceedsLimit,
  };
}

export function formatLinkedInRoleCopyBlock(exp: LinkedInExperienceOptimization): string {
  const header = `${exp.recruiterSearchHeadline}`;
  const bullets = exp.optimizedBullets.map((b) => `• ${b.optimized}`).join('\n');
  return [header, '', bullets].filter(Boolean).join('\n').trim();
}

export function legacyExecCommandCopy(text: string): boolean {
  if (typeof document === 'undefined') return false;
  const field = Object.assign(document.createElement('textarea'), { value: text });
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;inset-block-start:0;opacity:0';
  document.body.append(field);
  field.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    field.remove();
  }
}

export async function copyToClipboardSafely(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to execCommand below
  }
  return legacyExecCommandCopy(text);
}

