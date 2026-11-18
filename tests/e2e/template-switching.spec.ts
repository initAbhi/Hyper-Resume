import path from 'node:path';
import { test, expect } from '@playwright/test';
import { ALL_TEMPLATE_KEYS } from './helpers/personas';
import {
  apiRequest,
  attachDiagnostics,
  authenticatePage,
  loadQaSession,
  openResumeEditor,
  SCREENSHOT_DIR,
  waitForSaved,
} from './helpers/qa-env';

test.describe('7. Template-Wise Visual & Functional Audit (All 10 Templates)', () => {
  test('switch templates via TemplatePicker UI, verify persistence on reload, and verify all 10 templates render cleanly without horizontal overflow', async ({ page }) => {
    test.setTimeout(180_000);
    const session = loadQaSession();
    const diag = attachDiagnostics(page);
    await authenticatePage(page);

    const resumeId = session.personaResumeIds['persona-09-international'];
    await openResumeEditor(page, resumeId, 'canvas');

    // Open TemplatePicker UI and switch template
    await page.locator('#canva-dock-templates').click();
    const ivyCard = page.locator('[data-template-key="ivy-league"]').first();
    await expect(ivyCard).toBeVisible({ timeout: 10_000 });
    await ivyCard.click();
    await page.waitForTimeout(300);

    // Apply/Close template picker
    const applyBtn = page.getByRole('button', { name: /Continue Editing|Done/i }).first();
    if (await applyBtn.isVisible().catch(() => false)) {
      await applyBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }

    await waitForSaved(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#resume-document-print', { timeout: 15_000 });
    await expect(page.locator('#resume-document-print')).toContainText('François-Xavier Müller-Sørensen');

    // Dynamically inspect EVERY ONE of the 10 templates using Persona 10 (Extreme Edge-Case)
    const extremeId = session.personaResumeIds['persona-10-extreme'];
    const overflowFindings: Array<{ template: string; scrollWidth: number; clientWidth: number; diff: number }> = [];

    for (const tplKey of ALL_TEMPLATE_KEYS) {
      // Update templateKey via real API so we test every single template deterministically
      const current = await apiRequest(`/resumes/${extremeId}`, { token: session.accessToken });
      await apiRequest(`/resumes/${extremeId}`, {
        method: 'PATCH',
        token: session.accessToken,
        body: {
          templateKey: tplKey,
          expectedVersion: current.data.version,
        },
      });

      await openResumeEditor(page, extremeId, 'canvas');
      await page.waitForTimeout(250);

      const metrics = await page.locator('#resume-document-print').evaluate((el) => {
        const textLen = (el.innerText || '').trim().length;
        const rect = el.getBoundingClientRect();
        return {
          textLen,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          scrollHeight: el.scrollHeight,
          width: Math.round(rect.width),
        };
      });

      expect(metrics.textLen).toBeGreaterThan(200);
      if (metrics.scrollWidth > metrics.clientWidth + 4) {
        overflowFindings.push({
          template: tplKey,
          scrollWidth: metrics.scrollWidth,
          clientWidth: metrics.clientWidth,
          diff: metrics.scrollWidth - metrics.clientWidth,
        });
      }

      // Capture representative screenshots for top templates
      if (['jake-ats', 'deedy', 'double-column', 'elegant', 'executive'].includes(tplKey)) {
        await page.locator('#resume-document-print').screenshot({
          path: path.join(SCREENSHOT_DIR, `template-${tplKey}-extreme.png`),
        }).catch(() => undefined);
      }
    }

    console.log('[QA_TEMPLATE_OVERFLOW_AUDIT]', JSON.stringify(overflowFindings));
    expect(overflowFindings).toEqual([]);
    expect(diag.pageErrors).toEqual([]);
  }, 120_000);
});

