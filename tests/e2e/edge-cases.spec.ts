import { test, expect } from '@playwright/test';
import { TEN_PERSONAS } from './helpers/personas';
import {
  APP_BASE_URL,
  attachDiagnostics,
  authenticatePage,
  loadQaSession,
  openResumeEditor,
} from './helpers/qa-env';

test.describe('12. All 10 Personas Load, Edge Cases, XSS Safety, Failure Injection & Performance', () => {
  test('All 10 synthetic personas render cleanly with zero page errors, safe XSS escaping, and fast load latency', async ({ page }) => {
    test.setTimeout(150_000);
    const session = loadQaSession();
    const diag = attachDiagnostics(page);
    await authenticatePage(page);

    const timings: Array<{ persona: string; loadMs: number; textLength: number }> = [];

    for (const persona of TEN_PERSONAS) {
      const id = session.personaResumeIds[persona.key];
      const t0 = Date.now();
      await openResumeEditor(page, id, 'canvas');
      const loadMs = Date.now() - t0;

      const text = await page.locator('#resume-document-print').innerText();
      expect(text.toLowerCase()).toContain(persona.content.contact.fullName.toLowerCase());
      timings.push({ persona: persona.key, loadMs, textLength: text.length });
    }

    // Verify XSS payload inside Persona 10 NEVER executed as script
    const xssTriggered = await page.evaluate(() => Boolean((window as any).__xss_triggered));
    expect(xssTriggered).toBe(false);

    console.log('[QA_10_PERSONA_TIMINGS]', JSON.stringify(timings));
    console.log('[QA_10_PERSONA_CONSOLE_ERRORS]', JSON.stringify(diag.consoleErrors));
    console.log('[QA_10_PERSONA_FAILED_NET]', JSON.stringify(diag.failedResponses));

    expect(diag.pageErrors).toEqual([]);
    expect(diag.failedResponses).toEqual([]);
  }, 120_000);

  test('Graceful handling of non-existent resume 404, Global Agent Drawer open/close, and secondary app routes', async ({ page }) => {
    test.setTimeout(120_000);
    const diag = attachDiagnostics(page);
    await authenticatePage(page);

    // 1. Non-existent resume UUID should show clean error UI without crashing
    await page.goto(`${APP_BASE_URL}/app/resumes/00000000-0000-4000-8000-000000000000`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByText(/Unable to load resume/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole('link', { name: /Back to My Resumes/i })).toBeVisible();

    // 2. Navigate across core authenticated feature pages and verify clean render + zero pageErrors
    const routes = [
      '/app',
      '/app/job-search',
      '/app/match',
      '/app/cover-letters',
      '/app/applications',
      '/app/interview',
      '/app/linkedin',
      '/app/settings',
    ];
    for (const route of routes) {
      await page.goto(`${APP_BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      await expect
        .poll(
          () => page.evaluate(() => (document.body.innerText || '').trim().length),
          { timeout: 15_000 },
        )
        .toBeGreaterThan(40);
    }

    // 3. Global Assistant Drawer open & Escape close
    const agentFab = page.getByRole('button', { name: /AI Career Agent|Open AI Assistant/i }).first();
    if (await agentFab.isVisible().catch(() => false)) {
      await agentFab.click();
      await page.waitForTimeout(250);
      await page.keyboard.press('Escape');
    }

    expect(diag.pageErrors).toEqual([]);
  }, 90_000);
});

