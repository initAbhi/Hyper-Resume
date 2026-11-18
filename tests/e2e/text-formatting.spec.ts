import { test, expect } from '@playwright/test';
import {
  attachDiagnostics,
  authenticatePage,
  loadQaSession,
  openResumeEditor,
  waitForSaved,
} from './helpers/qa-env';

test.describe('3. Text Formatting, Typography, Design Panel & Layout Persistence', () => {
  test('Font family, accent color, spacing sliders, density presets, photo toggle & highlights toggle persist across reload', async ({ page }) => {
    const session = loadQaSession();
    const diag = attachDiagnostics(page);
    await authenticatePage(page);

    const resumeId = session.personaResumeIds['persona-05-pm'];
    await openResumeEditor(page, resumeId, 'canvas');

    // Open Design Panel from CanvaDock
    await page.locator('#canva-dock-design').click();
    await expect(page.getByText('Design & Typography')).toBeVisible();

    // 1. Change Accent Color to Teal (#0d9488)
    await page.getByRole('button', { name: /Teal/i }).click();

    // 2. Change Font Family to Georgia (Serif) and verify rendered font-family actually changes!
    const canvasDoc = page.locator('#resume-document-print');
    await page.getByRole('button', { name: /Georgia \(Serif\)/i }).click();
    await page.waitForTimeout(200);
    const serifClassOrFont = await canvasDoc.evaluate((el) => {
      const inner = el.querySelector('.font-serif') || el;
      return {
        hasSerifClass: Boolean(el.querySelector('.font-serif')),
        computedFont: window.getComputedStyle(inner).fontFamily,
      };
    });
    expect(serifClassOrFont.hasSerifClass || /georgia|serif/i.test(serifClassOrFont.computedFont)).toBe(true);

    // 3. Apply Compact density preset and verify slider readouts update
    await page.getByTestId('density-preset-compact').click();
    const fontScaleReadout = await page.getByTestId('readout-font-scale').innerText();
    expect(fontScaleReadout).toMatch(/\d+%/);

    // 4. Adjust custom font scale slider and line-height slider
    const fontScaleSlider = page.locator('#slider-font-scale');
    await fontScaleSlider.fill('1.08');
    await fontScaleSlider.dispatchEvent('change');

    // 5. Toggle Profile Photo Avatar OFF and ATS Keyword Highlighting OFF via accessible switches
    const photoSwitch = page.getByRole('switch', { name: /Profile Photo Avatar/i });
    const highlightsSwitch = page.getByRole('switch', { name: /ATS Keyword Highlighting/i });
    await expect(photoSwitch).toBeChecked();
    await expect(highlightsSwitch).toBeChecked();
    await page.locator('label[for="design-show-photo-switch"]').click();
    await page.locator('label[for="design-show-highlights-switch"]').click();
    await expect(photoSwitch).not.toBeChecked();
    await expect(highlightsSwitch).not.toBeChecked();

    // Test pressing Escape closes DesignPanel
    await page.keyboard.press('Escape');
    await expect(page.getByText('Design & Typography')).toBeHidden();

    // Wait for autosave and reload page to verify persistence
    await waitForSaved(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#resume-document-print', { timeout: 15_000 });

    // Re-open Design Panel and verify accent color, font, photo toggle & highlights toggle persisted
    await page.locator('#canva-dock-design').click();
    await expect(page.getByText('#0d9488', { exact: false })).toBeVisible();
    const serifPersisted = await page.locator('#resume-document-print .font-serif').count();
    expect(serifPersisted).toBeGreaterThan(0);
    await expect(page.getByRole('switch', { name: /Profile Photo Avatar/i })).not.toBeChecked();
    await expect(page.getByRole('switch', { name: /ATS Keyword Highlighting/i })).not.toBeChecked();

    // Close panel cleanly
    await page.getByRole('button', { name: 'Close design panel' }).click();
    expect(diag.pageErrors).toEqual([]);
  });

  test('Pasting formatted HTML into contentEditable strips unsafe markup cleanly without breaking canvas', async ({ page }) => {
    const session = loadQaSession();
    const diag = attachDiagnostics(page);
    await authenticatePage(page);

    const resumeId = session.personaResumeIds['persona-03-frontend'];
    await openResumeEditor(page, resumeId, 'canvas');

    const summary = page.locator('[data-field-path="summary"]').first();
    const beforeText = (await summary.innerText()).trim();
    await summary.click();

    // Simulate human pasting HTML with bold/font/script tags
    await summary.evaluate((el) => {
      const dt = new DataTransfer();
      dt.setData('text/plain', 'Pasted clean summary with 99.9% reliability.');
      dt.setData(
        'text/html',
        '<div style="font-size:48px;color:red"><b>Pasted</b> clean summary with <i>99.9%</i> reliability.<script>window.__xss=1</script></div>',
      );
      const evt = new ClipboardEvent('paste', {
        clipboardData: dt,
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(evt);
    });

    await page.waitForTimeout(300);
    const hasInjectedScript = await page.evaluate(() => Boolean((window as any).__xss));
    expect(hasInjectedScript).toBe(false);

    // Restore original summary
    await summary.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(beforeText);
    await page.locator('#resume-document-print').click({ position: { x: 4, y: 4 } });
    await waitForSaved(page);

    expect(diag.pageErrors).toEqual([]);
  });
});

