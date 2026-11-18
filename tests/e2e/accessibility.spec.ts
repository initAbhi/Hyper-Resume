import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  APP_BASE_URL,
  authenticatePage,
  loadQaSession,
  openResumeEditor,
} from './helpers/qa-env';

interface AxeFinding {
  surface: string;
  id: string;
  impact: string | null | undefined;
  help: string;
  nodesCount: number;
  sampleTargets: string[];
}

async function runAxe(page: any, surface: string): Promise<AxeFinding[]> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  return results.violations.map((v) => ({
    surface,
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodesCount: v.nodes.length,
    sampleTargets: v.nodes.slice(0, 25).map((n) => `${n.target.join(' ')} :: ${n.html.slice(0, 140)}`),
  }));
}

test.describe('11. WCAG 2.1 A/AA Accessibility Audit (axe-core)', () => {
  test('Audit Landing, Login, Register, Dashboard, Resume Editor & Interactive Drawers for critical/serious WCAG violations', async ({ page }) => {
    test.setTimeout(150_000);
    const session = loadQaSession();
    const allFindings: AxeFinding[] = [];

    // 1. Public pages
    await page.goto(`${APP_BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    allFindings.push(...(await runAxe(page, 'Landing (/)')));

    await page.goto(`${APP_BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    allFindings.push(...(await runAxe(page, 'Login (/login)')));

    await page.goto(`${APP_BASE_URL}/register`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    allFindings.push(...(await runAxe(page, 'Register (/register)')));

    // 2. Authenticated surfaces
    await authenticatePage(page);
    await page.goto(`${APP_BASE_URL}/app/resumes`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=P01 Minimal Fresher Resume', { timeout: 15_000 });
    allFindings.push(...(await runAxe(page, 'My Resumes (/app/resumes)')));

    const resumeId = session.personaResumeIds['persona-03-frontend'];
    await openResumeEditor(page, resumeId, 'canvas');
    allFindings.push(...(await runAxe(page, 'Resume Editor Canvas')));

    // Design Panel
    await page.locator('#canva-dock-design').click();
    await expect(page.getByText('Design & Typography')).toBeVisible();
    allFindings.push(...(await runAxe(page, 'DesignPanel')));
    await page.keyboard.press('Escape');

    // Add Content Drawer
    await page.locator('#canva-dock-add-content').click();
    await page.waitForTimeout(250);
    allFindings.push(...(await runAxe(page, 'AddContentDrawer')));
    await page.keyboard.press('Escape');

    // Section Rearrange Drawer
    await page.locator('#canva-dock-sections').click();
    await page.waitForTimeout(250);
    allFindings.push(...(await runAxe(page, 'SectionRearrangeDrawer')));
    await page.keyboard.press('Escape');

    // Template Picker
    await page.locator('#canva-dock-templates').click();
    await page.waitForTimeout(350);
    allFindings.push(...(await runAxe(page, 'TemplatePicker')));
    await page.keyboard.press('Escape');

    console.log('[QA_AXE_VIOLATIONS]', JSON.stringify(allFindings, null, 2));

    const criticalOrSerious = allFindings.filter(
      (f) => f.impact === 'critical' || f.impact === 'serious',
    );
    expect(criticalOrSerious).toEqual([]);
  }, 120_000);
});

