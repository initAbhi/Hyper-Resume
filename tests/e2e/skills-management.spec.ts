import { test, expect } from '@playwright/test';
import {
  attachDiagnostics,
  authenticatePage,
  loadQaSession,
  openResumeEditor,
  waitForSaved,
} from './helpers/qa-env';

test.describe('5. Skills Management (Add, Duplicate Check, Special Chars, Delete & Persistence)', () => {
  test('Add skill, block case-insensitive duplicate, add special-char skill, delete skill, and persist on reload', async ({ page }) => {
    const session = loadQaSession();
    const diag = attachDiagnostics(page);
    await authenticatePage(page);

    const resumeId = session.personaResumeIds['persona-03-frontend'];
    await openResumeEditor(page, resumeId, 'canvas');

    // Open Add Content drawer
    await page.locator('#canva-dock-add-content').click();
    await expect(page.locator('#canva-add-content-drawer')).toBeVisible({ timeout: 10_000 });

    const skillInput = page.locator('input[placeholder*="skill" i], input[placeholder*="Kubernetes" i], input[placeholder*="TypeScript" i]').first();
    await expect(skillInput).toBeVisible();

    // 1. Add empty/whitespace skill -> should NOT add anything
    const canvasBefore = await page.locator('#resume-document-print').innerText();
    await skillInput.fill('   ');
    await skillInput.press('Enter');
    await page.waitForTimeout(150);

    // 2. Add duplicate with different capitalization ("react" already exists as "React")
    await skillInput.fill('react');
    await skillInput.press('Enter');
    await expect(page.getByText(/already in your skills/i)).toBeVisible({ timeout: 3_000 });

    // 3. Add special-character skill "C++ / WebAssembly"
    const specialSkill = 'C++ / WebAssembly';
    await skillInput.fill(specialSkill);
    await skillInput.press('Enter');
    await expect(page.locator('#resume-document-print')).toContainText(specialSkill);

    // 4. Add long skill name
    const longSkill = 'Distributed-Systems-Observability-OpenTelemetry';
    await skillInput.fill(longSkill);
    await skillInput.press('Enter');
    await expect(page.locator('#resume-document-print')).toContainText(longSkill);

    // Close drawer, save, and reload
    await page.keyboard.press('Escape');
    await waitForSaved(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#resume-document-print', { timeout: 15_000 });

    await expect(page.locator('#resume-document-print')).toContainText(specialSkill);
    await expect(page.locator('#resume-document-print')).toContainText(longSkill);

    // 5. Delete the added skills via inline chip delete button
    const deleteButtons = page.locator('#resume-document-print [data-entry-delete="skill"]');
    const delCount = await deleteButtons.count();
    expect(delCount).toBeGreaterThan(0);

    // Scroll skill section cleanly to center of viewport (above floating bottom bar) and remove last two skills
    await deleteButtons.last().evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(150);
    await deleteButtons.last().click();
    await page.waitForTimeout(250);
    await page.locator('#resume-document-print [data-entry-delete="skill"]').last().evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.locator('#resume-document-print [data-entry-delete="skill"]').last().click();
    await waitForSaved(page);

    expect(await page.locator('#resume-document-print').innerText()).not.toContain(longSkill);
    expect(await page.locator('#resume-document-print').innerText()).not.toContain(specialSkill);
    expect(canvasBefore.length).toBeGreaterThan(50);
    expect(diag.pageErrors).toEqual([]);
  });
});

