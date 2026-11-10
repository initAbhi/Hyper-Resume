import { describe, expect, it } from 'bun:test';
import {
  DEFAULT_SECTION_ORDER,
  detectSectionKeyFromHeading,
  moveSectionKey,
  normalizeLayoutSettings,
  reorderSectionKeys,
} from '@/lib/resume-layout';

describe('resume-layout', () => {
  it('normalizes missing section keys, clamps bounds, and preserves canonical completeness', () => {
    const normalized = normalizeLayoutSettings({
      sectionOrder: ['education', 'skills'],
      hiddenSections: ['certifications', 'certifications'],
      fontSizeScale: 1.8, // over max 1.15
      lineHeight: 0.9,    // below min 1.2
      sectionSpacing: 50, // over max 28
      pageMargin: 4,      // below min 16
    });

    expect(normalized.sectionOrder).toEqual([
      'education',
      'skills',
      'summary',
      'experience',
      'projects',
      'certifications',
    ]);
    expect(normalized.hiddenSections).toEqual(['certifications']);
    expect(normalized.fontSizeScale).toBe(1.15);
    expect(normalized.lineHeight).toBe(1.2);
    expect(normalized.sectionSpacing).toBe(28);
    expect(normalized.pageMargin).toBe(16);
  });

  it('reorders sections deterministically via drag index swap or move up/down', () => {
    const moved = moveSectionKey(DEFAULT_SECTION_ORDER, 'projects', 'up');
    expect(moved).toEqual([
      'summary',
      'projects',
      'experience',
      'skills',
      'education',
      'certifications',
    ]);

    const dragged = reorderSectionKeys(moved, 4, 0); // move education to top
    expect(dragged[0]).toBe('education');
    expect(dragged).toHaveLength(6);
  });

  it('detects section keys accurately across template heading names', () => {
    expect(detectSectionKeyFromHeading('Professional Summary')).toBe('summary');
    expect(detectSectionKeyFromHeading('Work Experience')).toBe('experience');
    expect(detectSectionKeyFromHeading('Technical & Core Competencies')).toBe('skills');
    expect(detectSectionKeyFromHeading('Education')).toBe('education');
    expect(detectSectionKeyFromHeading('Projects')).toBe('projects');
    expect(detectSectionKeyFromHeading('Certifications')).toBe('certifications');
  });

  it('preserves, appends, and reorders custom section keys alongside built-in sections', () => {
    const customSections = [
      { id: 'awards-1', title: 'Awards & Honors', kind: 'awards' as const, entries: [] },
      { id: 'pub-1', title: 'Publications', kind: 'publications' as const, entries: [] },
    ];
    const normalized = normalizeLayoutSettings(
      {
        sectionOrder: ['summary', 'custom:pub-1', 'experience', 'custom:deleted-sec'],
        hiddenSections: ['custom:pub-1'],
      },
      customSections,
    );

    expect(normalized.sectionOrder).toEqual([
      'summary',
      'custom:pub-1',
      'experience',
      'projects',
      'skills',
      'education',
      'certifications',
      'custom:awards-1',
    ]);
    expect(normalized.hiddenSections).toEqual(['custom:pub-1']);

    const moved = moveSectionKey(
      normalized.sectionOrder,
      'custom:awards-1',
      'up',
      customSections,
    );
    expect(moved[6]).toBe('custom:awards-1');
  });
});

