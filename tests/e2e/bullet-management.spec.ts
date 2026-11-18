import { test, expect } from '@playwright/test';
import {
  attachDiagnostics,
  authenticatePage,
  loadQaSession,
  openResumeEditor,
  waitForSaved,
} from './helpers/qa-env';

test.describe('4. Bullet & List Management (Enter, Add Below, Move Up/Down, Backspace, Reload)', () => {
  test('Add bullet with Enter, edit, move up/down, delete empty bullet with Backspace, and persist across reload', async ({ page }) => {
    const session = loadQaSession();
    const diag = attachDiagnostics(page);
    await authenticatePage(page);

    const resumeId = session.personaResumeIds['persona-03-frontend'];
    await openResumeEditor(page, resumeId, 'canvas');

    const bullet0 = page.locator('#exp-0-bullet-0');
    await expect(bullet0).toBeVisible();

    const initialBulletCount = await page.locator('[id^="exp-0-bullet-"]').count();
    expect(initialBulletCount).toBeGreaterThanOrEqual(2);

    // Focus first bullet -> floating toolbar should appear
    await bullet0.click();
    const toolbar = page.locator('[data-floating-toolbar="true"]');
    await expect(toolbar).toBeVisible({ timeout: 5_000 });

    // Press Enter inside bullet 0 -> inserts new bullet at index 1 and focuses it
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
    const afterEnterCount = await page.locator('[id^="exp-0-bullet-"]').count();
    expect(afterEnterCount).toBe(initialBulletCount + 1);

    // Type text in new bullet 1
    const bullet1 = page.locator('#exp-0-bullet-1');
    await bullet1.click();
    const qaBulletText = 'Automated E2E bullet verification reducing escaped regressions by 62%.';
    await page.keyboard.type(qaBulletText);
    await page.locator('#resume-document-print').click({ position: { x: 4, y: 4 } });
    await waitForSaved(page);

    // Reload and verify new bullet persisted!
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#exp-0-bullet-1', { timeout: 15_000 });
    await expect(page.locator('#exp-0-bullet-1')).toContainText('Automated E2E bullet verification');

    // Move bullet 1 UP to index 0 using floating toolbar Move Up button
    await page.locator('#exp-0-bullet-1').click();
    await expect(toolbar).toBeVisible({ timeout: 5_000 });
    await page.locator('#fab-move-bullet-up-btn').click();
    await page.waitForTimeout(250);
    await expect(page.locator('#exp-0-bullet-0')).toContainText('Automated E2E bullet verification');

    // Move it back DOWN to index 1
    await page.locator('#exp-0-bullet-0').click();
    await page.locator('#fab-move-bullet-down-btn').click();
    await page.waitForTimeout(250);
    await expect(page.locator('#exp-0-bullet-1')).toContainText('Automated E2E bullet verification');

    // Delete the synthetic bullet via Floating Toolbar Trash button
    await page.locator('#exp-0-bullet-1').click();
    await page.locator('#fab-delete-bullet-btn').click();
    await page.waitForTimeout(300);
    expect(await page.locator('[id^="exp-0-bullet-"]').count()).toBe(initialBulletCount);

    // Verify Backspace on an empty bullet deletes it cleanly
    await page.locator('#exp-0-bullet-0').click();
    await page.locator('#fab-add-bullet-btn').click();
    await page.waitForTimeout(250);
    expect(await page.locator('[id^="exp-0-bullet-"]').count()).toBe(initialBulletCount + 1);

    await page.locator('#exp-0-bullet-1').click();
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(300);
    expect(await page.locator('[id^="exp-0-bullet-"]').count()).toBe(initialBulletCount);

    await waitForSaved(page);
    expect(diag.pageErrors).toEqual([]);
  });
});

