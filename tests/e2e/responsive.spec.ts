import path from 'node:path';
import { test, expect } from '@playwright/test';
import {
  APP_BASE_URL,
  attachDiagnostics,
  authenticatePage,
  loadQaSession,
  openResumeEditor,
  SCREENSHOT_DIR,
} from './helpers/qa-env';

const REQUIRED_VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '430x932', width: 430, height: 932 },
  { name: '390x844', width: 390, height: 844 },
  { name: '375x667', width: 375, height: 667 },
  { name: '320x568', width: 320, height: 568 },
] as const;

test.describe('10. Responsive & Device Matrix Audit (All 10 Viewports)', () => {
  test('zero horizontal viewport overflow across all 10 viewports on Landing page', async ({ page }) => {
    test.setTimeout(90_000);
    const diag = attachDiagnostics(page);
    const overflows: Array<{ route: string; viewport: string; scrollWidth: number; innerWidth: number }> = [];

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${APP_BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    for (const vp of REQUIRED_VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(200);

      const m = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      if (m.scrollWidth > m.innerWidth + 2) {
        overflows.push({ route: '/', viewport: vp.name, ...m });
      }
    }

    console.log('[QA_RESPONSIVE_OVERFLOWS_PUBLIC]', JSON.stringify(overflows));
    expect(overflows).toEqual([]);
    expect(diag.pageErrors).toEqual([]);
  });

  test('zero horizontal viewport overflow across all 10 viewports on Dashboard and Resume Editor', async ({ page }) => {
    test.setTimeout(180_000);
    const session = loadQaSession();
    const diag = attachDiagnostics(page);
    const resumeId = session.personaResumeIds['persona-02-senior-swe'];

    const overflows: Array<{ route: string; viewport: string; scrollWidth: number; innerWidth: number }> = [];

    await authenticatePage(page);
    for (const vp of REQUIRED_VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Dashboard / My Resumes
      await page.goto(`${APP_BASE_URL}/app/resumes`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(300);
      const listM = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      if (listM.scrollWidth > listM.innerWidth + 2) {
        overflows.push({ route: '/app/resumes', viewport: vp.name, ...listM });
      }

      // Resume Editor
      await openResumeEditor(page, resumeId, 'canvas');
      await page.waitForTimeout(300);
      const edM = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      if (edM.scrollWidth > edM.innerWidth + 2) {
        overflows.push({ route: '/app/resumes/[id]', viewport: vp.name, ...edM });
      }

      if (vp.name === '320x568' || vp.name === '390x844' || vp.name === '768x1024' || vp.name === '1440x900') {
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `editor-responsive-${vp.name}.png`),
        }).catch(() => undefined);
      }
    }

    // Verify mobile DesignPanel fits cleanly within 320px viewport
    await page.setViewportSize({ width: 320, height: 568 });
    await page.locator('#canva-dock-design').click();
    await expect(page.getByText('Design & Typography')).toBeVisible();
    const drawerOverflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    if (drawerOverflow.scrollWidth > drawerOverflow.innerWidth + 2) {
      overflows.push({ route: 'DesignPanel@320', viewport: '320x568', ...drawerOverflow });
    }
    await page.keyboard.press('Escape');

    console.log('[QA_RESPONSIVE_OVERFLOWS_AUTH]', JSON.stringify(overflows));
    expect(overflows).toEqual([]);
    expect(diag.pageErrors).toEqual([]);
  });
});

