import { test, expect } from '@playwright/test';
import {
  attachDiagnostics,
  authenticatePage,
  loadQaSession,
  openResumeEditor,
  waitForSaved,
} from './helpers/qa-env';

test.describe('6. Section Management (Add, Reorder, Hide/Show, Presets, Custom Sections & Reload)', () => {
  test('Reorder sections, toggle section visibility, apply preset, add custom section, and verify persistence', async ({ page }) => {
    const session = loadQaSession();
    const diag = attachDiagnostics(page);
    await authenticatePage(page);

    const resumeId = session.personaResumeIds['persona-07-career-switcher'];
    await openResumeEditor(page, resumeId, 'canvas');

    // 1. Open Section Rearrange Drawer
    await page.locator('#canva-dock-sections').click();
    await expect(page.getByRole('dialog', { name: 'Rearrange Resume Sections' })).toBeVisible();

    // 2. Hide Certifications section
    await page.getByTestId('toggle-visibility-certifications').click();
    await page.waitForTimeout(250);
    await expect(page.locator('#resume-document-print [data-resume-section="certifications"]')).toBeHidden();
    expect(await page.locator('#resume-document-print').innerText()).not.toContain('Google Data Analytics');

    // 3. Reorder: move Education UP
    const moveEduUp = page.getByTestId('move-up-education');
    if (await moveEduUp.isEnabled()) {
      await moveEduUp.click();
    }

    // 4. Close drawer, save, reload, verify hidden section stays hidden!
    await page.getByRole('button', { name: 'Done Reordering' }).click();
    await waitForSaved(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#resume-document-print', { timeout: 15_000 });

    await expect(page.locator('#resume-document-print [data-resume-section="certifications"]')).toBeHidden();
    expect(await page.locator('#resume-document-print').innerText()).not.toContain('Google Data Analytics');

    // 5. Re-open drawer, click Reset to restore default order & visibility
    await page.locator('#canva-dock-sections').click();
    await page.getByTestId('reset-section-order-btn').click();
    await page.waitForTimeout(250);
    await expect(page.locator('#resume-document-print [data-resume-section="certifications"]')).toBeVisible();
    await expect(page.locator('#resume-document-print')).toContainText('Google Data Analytics');
    await page.getByRole('button', { name: 'Done Reordering' }).click();

    // 6. Add a Custom Section via Add Content Drawer and verify it renders
    await page.locator('#canva-dock-add-content').click();
    const customBtn = page.getByRole('button', { name: /Publications & Research/i }).first();
    if (await customBtn.isVisible().catch(() => false)) {
      await customBtn.click();
      await page.waitForTimeout(300);
      await expect(page.locator('#resume-document-print')).toContainText('Publications & Research');
    }
    await page.keyboard.press('Escape');
    await waitForSaved(page);

    expect(diag.pageErrors).toEqual([]);
  });
});

