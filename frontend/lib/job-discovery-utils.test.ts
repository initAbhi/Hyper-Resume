import { describe, expect, it } from 'bun:test';
import {
  classifyMatchTier,
  formatRelativePostedDate,
  normalizeBoardSlugInput,
} from './job-discovery-utils';

describe('job-discovery-utils', () => {
  it('formats posted timestamps cleanly across hours, days, and older dates', () => {
    const base = new Date('2026-11-10T12:00:00.000Z').getTime();
    expect(formatRelativePostedDate('2026-11-10T11:35:00.000Z', base)).toBe('Just now');
    expect(formatRelativePostedDate('2026-11-10T07:00:00.000Z', base)).toBe('5h ago');
    expect(formatRelativePostedDate('2026-11-09T10:00:00.000Z', base)).toBe('Yesterday');
    expect(formatRelativePostedDate('2026-11-04T12:00:00.000Z', base)).toBe('6d ago');
  });

  it('classifies honest match tiers with accessible non-color labels', () => {
    expect(classifyMatchTier(85)).toEqual({ tier: 'strong', label: 'Strong Fit' });
    expect(classifyMatchTier(58)).toEqual({ tier: 'moderate', label: 'Partial Overlap' });
    expect(classifyMatchTier(25)).toEqual({ tier: 'explore', label: 'Review Gaps' });
  });

  it('normalizes pasted ATS URLs or mixed-case slugs into clean company board tokens', () => {
    expect(normalizeBoardSlugInput('https://boards.greenhouse.io/Stripe/jobs/123')).toBe('stripe');
    expect(normalizeBoardSlugInput('https://jobs.ashbyhq.com/Linear')).toBe('linear');
    expect(normalizeBoardSlugInput(' Figma ')).toBe('figma');
  });
});

