import { describe, expect, it } from 'bun:test';
import {
  buildPublicShareUrl,
  computeExpiryIso,
  formatShareEventLabel,
  inferExpiryPreset,
  normalizeShareSlugDraft,
} from './share-analytics';

describe('share-analytics utilities', () => {
  it('builds canonical public recruiter URLs cleanly without trailing slashes', () => {
    expect(buildPublicShareUrl('alexander-sharma-a1b2c3', 'https://app.hyperresume.com')).toBe(
      'https://app.hyperresume.com/r/alexander-sharma-a1b2c3',
    );
    expect(buildPublicShareUrl('/my-resume/', 'http://localhost:3000')).toBe(
      'http://localhost:3000/r/my-resume',
    );
  });

  it('normalizes user-typed custom slugs into URL-safe lowercase hyphenated identifiers', () => {
    expect(normalizeShareSlugDraft('  Alex Sharma — Staff 2026!  ')).toBe(
      'alex-sharma-staff-2026',
    );
    expect(normalizeShareSlugDraft('---backend_lead---')).toBe('backend-lead');
  });

  it('computes and infers link expiration presets accurately', () => {
    const base = new Date('2026-11-10T10:00:00.000Z');
    expect(computeExpiryIso('never', base)).toBeNull();
    expect(computeExpiryIso('7d', base)).toBe('2026-11-17T10:00:00.000Z');
    expect(computeExpiryIso('30d', base)).toBe('2026-12-10T10:00:00.000Z');

    const inThreeDays = new Date(Date.now() + 3 * 86_400_000).toISOString();
    expect(inferExpiryPreset(inThreeDays)).toBe('7d');
    expect(inferExpiryPreset(null)).toBe('never');
  });

  it('formats share event telemetry labels', () => {
    expect(formatShareEventLabel('view')).toBe('Viewed Resume');
    expect(formatShareEventLabel('download_pdf')).toBe('Downloaded PDF');
    expect(formatShareEventLabel('download_docx')).toBe('Downloaded DOCX');
  });
});

