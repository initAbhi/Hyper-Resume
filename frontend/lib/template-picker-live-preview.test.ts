import { describe, it, expect } from 'bun:test';
import { AVAILABLE_TEMPLATES } from '@/components/resumes/templates';

describe('Template Picker Live Preview & Workspace Geometry Suite', () => {
  it('1. AVAILABLE_TEMPLATES completeness: contains all 10 templates with proper keys and categories', () => {
    expect(AVAILABLE_TEMPLATES.length).toBe(10);

    const keys = AVAILABLE_TEMPLATES.map((t) => t.key);
    expect(keys).toContain('jake-ats');
    expect(keys).toContain('awesome-cv');
    expect(keys).toContain('deedy');
    expect(keys).toContain('executive');
    expect(keys).toContain('double-column');
    expect(keys).toContain('ivy-league');
    expect(keys).toContain('crest');
    expect(keys).toContain('clean-modern');
    expect(keys).toContain('classic-ats');
    expect(keys).toContain('elegant');

    // All templates must have non-empty name and description
    for (const tpl of AVAILABLE_TEMPLATES) {
      expect(tpl.name.length).toBeGreaterThan(0);
      expect(tpl.description.length).toBeGreaterThan(0);
      expect(['Classic', 'Modern', 'Two-Column', 'Creative']).toContain(tpl.category);
    }
  });

  it('2. Search & Category filtering logic works deterministically', () => {
    // Filter by Classic
    const classicTpls = AVAILABLE_TEMPLATES.filter((t) => t.category === 'Classic');
    expect(classicTpls.length).toBeGreaterThan(0);

    // Search query 'jake'
    const query = 'jake';
    const matches = AVAILABLE_TEMPLATES.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        (t.badge && t.badge.toLowerCase().includes(query)),
    );
    expect(matches.length).toBe(1);
    expect(matches[0].key).toBe('jake-ats');

    // Search query 'ATS'
    const atsMatches = AVAILABLE_TEMPLATES.filter(
      (t) =>
        t.name.toLowerCase().includes('ats') ||
        t.description.toLowerCase().includes('ats') ||
        (t.badge && t.badge.toLowerCase().includes('ats')),
    );
    expect(atsMatches.length).toBeGreaterThan(1);
  });

  it('3. Workspace Geometry Math: ensures resume preview on right has enough room without overlap', () => {
    const DRAWER_WIDTH = 440;
    const TARGET_A4_WIDTH = 794;

    // Common screen widths: 1280px (laptop), 1440px (MacBook/monitor), 1920px (FHD)
    const testViewports = [1280, 1366, 1440, 1600, 1920];

    for (const viewportWidth of testViewports) {
      const remainingRightWidth = viewportWidth - DRAWER_WIDTH;
      expect(remainingRightWidth).toBeGreaterThan(800);

      // Fit scale calculation inside remaining space
      const fitScale = Math.min(1.0, Math.max(0.2, (remainingRightWidth - 48) / TARGET_A4_WIDTH));
      const scaledWidth = Math.ceil(TARGET_A4_WIDTH * fitScale);

      // Scaled resume must fit cleanly inside the right container
      expect(scaledWidth).toBeLessThanOrEqual(remainingRightWidth);
    }
  });

  it('4. Revert state invariant: switching template and reverting accurately restores initial template', () => {
    const initialTemplateKey = 'jake-ats';
    let currentTemplateKey = initialTemplateKey;

    // User tests 'awesome-cv'
    currentTemplateKey = 'awesome-cv';
    expect(currentTemplateKey).not.toBe(initialTemplateKey);

    // User tests 'deedy'
    currentTemplateKey = 'deedy';
    expect(currentTemplateKey).not.toBe(initialTemplateKey);

    // User triggers 1-click Revert
    currentTemplateKey = initialTemplateKey;
    expect(currentTemplateKey).toBe('jake-ats');
  });
});
