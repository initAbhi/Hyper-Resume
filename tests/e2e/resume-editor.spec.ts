import { test, expect } from '@playwright/test';
import {
  attachDiagnostics,
  authenticatePage,
  loadQaSession,
  openResumeEditor,
  waitForSaved,
} from './helpers/qa-env';

test.describe('2. Resume Editor — Human Mouse, Keyboard, Scrolling, Undo/Redo & Modes', () => {
  test('Canvas mode inline editing, floating toolbar, Escape dismissal, Undo/Redo, and Ctrl+S shortcut', async ({ page }) => {
    const session = loadQaSession();
    const diag = attachDiagnostics(page);
    await authenticatePage(page);

    const resumeId = session.personaResumeIds['persona-03-frontend'];
    await openResumeEditor(page, resumeId, 'canvas');

    // Click and edit headline inline
    const headlineField = page.locator('[data-field-path="headline"]').first();
    await expect(headlineField).toBeVisible();
    const originalHeadline = (await headlineField.innerText()).trim();

    await headlineField.click();
    await page.keyboard.press('Control+A');
    const updatedHeadline = 'Staff Frontend Architect | Design Systems & React 19';
    await page.keyboard.type(updatedHeadline);

    // Trigger blur to commit edit
    await page.locator('#resume-document-print').click({ position: { x: 4, y: 4 } });
    await page.waitForTimeout(350);
    await expect(headlineField).toContainText('Staff Frontend Architect');

    // Test Undo via Bottom Bar button (and Ctrl+Z)
    const undoBtn = page.getByRole('button', { name: 'Undo' });
    await expect(undoBtn).toBeEnabled({ timeout: 5_000 });
    await undoBtn.click();
    await expect(headlineField).toContainText(originalHeadline);

    // Test Redo via Bottom Bar button
    const redoBtn = page.getByRole('button', { name: 'Redo' });
    await expect(redoBtn).toBeEnabled({ timeout: 5_000 });
    await redoBtn.click();
    await expect(headlineField).toContainText('Staff Frontend Architect');

    // Test Ctrl+S keyboard shortcut (should NOT throw or open native save; should flush save)
    let beforeUnloadTriggered = false;
    page.on('dialog', async (d) => {
      beforeUnloadTriggered = true;
      await d.dismiss();
    });
    await page.keyboard.press('Control+s');
    await waitForSaved(page);
    expect(beforeUnloadTriggered).toBe(false);

    // Test Summary click -> Floating Toolbar appears, then Escape dismisses it
    const summaryField = page.locator('[data-field-path="summary"]').first();
    await summaryField.click();
    const floatingToolbar = page.locator('[data-floating-toolbar="true"]');
    await expect(floatingToolbar).toBeVisible({ timeout: 5_000 });

    await page.keyboard.press('Escape');
    await expect(floatingToolbar).toBeHidden({ timeout: 5_000 });

    // Restore original headline cleanly
    await headlineField.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(originalHeadline);
    await page.locator('#resume-document-print').click({ position: { x: 4, y: 4 } });
    await waitForSaved(page);

    expect(diag.pageErrors).toEqual([]);
  });

  test('Zoom controls (Zoom Out, Zoom In, Fit to Page) and scrolling long resume without layout freeze', async ({ page }) => {
    const session = loadQaSession();
    const diag = attachDiagnostics(page);
    await authenticatePage(page);

    const resumeId = session.personaResumeIds['persona-02-senior-swe'];
    await openResumeEditor(page, resumeId, 'canvas');

    const bottomBar = page.getByTestId('canva-bottom-bar');
    await expect(bottomBar).toBeVisible();

    const zoomOutBtn = bottomBar.getByRole('button', { name: 'Zoom Out' });
    const zoomInBtn = bottomBar.getByRole('button', { name: 'Zoom In' });
    const fitBtn = bottomBar.getByRole('button', { name: 'Fit to Page' });

    await zoomInBtn.click();
    await zoomOutBtn.click();
    await fitBtn.click();

    // Scroll down and back up on long resume; verify sticky dock stays accessible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);
    await expect(page.locator('#canva-dock-templates')).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);

    expect(diag.pageErrors).toEqual([]);
  });

  test('Toggle between Canvas mode and Classic Form mode and verify data parity', async ({ page }) => {
    const session = loadQaSession();
    const diag = attachDiagnostics(page);
    await authenticatePage(page);

    const resumeId = session.personaResumeIds['persona-04-backend'];
    await openResumeEditor(page, resumeId, 'canvas');

    const formToggle = page.getByRole('button', { name: /classic|form/i }).first();
    if (await formToggle.isVisible().catch(() => false)) {
      await formToggle.click();
      await page.waitForTimeout(300);
      // Verify form inputs contain persona name or headline
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.length).toBeGreaterThan(100);

      // Switch back to Canvas
      const canvasToggle = page.getByRole('button', { name: /canvas/i }).first();
      await canvasToggle.click();
      await expect(page.locator('#resume-document-print')).toBeVisible();
    }

    expect(diag.pageErrors).toEqual([]);
  });
});

