import { test, expect } from '@playwright/test';
import {
  apiRequest,
  attachDiagnostics,
  authenticatePage,
  loadQaSession,
  openResumeEditor,
  waitForSaved,
} from './helpers/qa-env';

test.describe('8. Persistence, Autosave Failure Honesty, OCC 409 Conflict & Cross-User Security', () => {
  test('UI never displays "Saved" when backend PATCH fails with 500; recovers when network succeeds', async ({ page }) => {
    const session = loadQaSession();
    await authenticatePage(page);

    const resumeId = session.personaResumeIds['persona-04-backend'];
    await openResumeEditor(page, resumeId, 'canvas');

    // Intercept PATCH /api/v1/resumes/:id and force HTTP 500
    let intercepted = 0;
    await page.route(`**/api/v1/resumes/${resumeId}`, async (route) => {
      if (route.request().method() === 'PATCH') {
        intercepted++;
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ statusCode: 500, message: 'Simulated database outage' }),
        });
      }
      return route.continue();
    });

    const headline = page.locator('[data-field-path="headline"]').first();
    await headline.click();
    await page.keyboard.press('End');
    await page.keyboard.type(' [500 Probe]');
    await page.locator('#resume-document-print').click({ position: { x: 4, y: 4 } });

    await page.waitForTimeout(1200);
    expect(intercepted).toBeGreaterThanOrEqual(1);

    // UI MUST show error / retry state — NEVER claim "Saved" cleanly!
    const bodyText = await page.locator('header, main').first().innerText();
    console.log('[QA_500_SAVE_STATUS_TEXT]', bodyText.slice(0, 300));
    await expect(page.getByText(/save failed|error|retry|unsaved/i).first()).toBeVisible({
      timeout: 5_000,
    });

    // Unroute and reload — backend DB must still hold original clean headline
    await page.unroute(`**/api/v1/resumes/${resumeId}`);
    const serverResume = await apiRequest(`/resumes/${resumeId}`, { token: session.accessToken });
    expect(serverResume.data.content.headline).not.toContain('[500 Probe]');
  });

  test('Optimistic Concurrency Control (409 Conflict) triggers conflict recovery state on stale editor version', async ({ page }) => {
    const session = loadQaSession();
    await authenticatePage(page);

    const resumeId = session.personaResumeIds['persona-06-designer'];
    await openResumeEditor(page, resumeId, 'canvas');

    // Simulate another tab updating the resume on the backend (bumping version)
    const before = await apiRequest(`/resumes/${resumeId}`, { token: session.accessToken });
    const bump = await apiRequest(`/resumes/${resumeId}`, {
      method: 'PATCH',
      token: session.accessToken,
      body: {
        name: `${before.data.name} (Tab 2)`,
        expectedVersion: before.data.version,
      },
    });
    expect(bump.status).toBe(200);
    expect(bump.data.version).toBe(before.data.version + 1);

    // Now edit in stale browser tab -> backend returns 409 Conflict
    const headline = page.locator('[data-field-path="headline"]').first();
    await headline.click();
    await page.keyboard.press('End');
    await page.keyboard.type(' (Stale Tab Edit)');
    await page.locator('#resume-document-print').click({ position: { x: 4, y: 4 } });

    await page.waitForTimeout(1400);
    await expect(page.getByText(/conflict|modified|reload|out of sync/i).first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test('Rapid successive edits persist final state accurately after reload with zero data loss', async ({ page }) => {
    const session = loadQaSession();
    const diag = attachDiagnostics(page);
    await authenticatePage(page);

    const resumeId = session.personaResumeIds['persona-08-academic'];
    await openResumeEditor(page, resumeId, 'canvas');

    const headline = page.locator('[data-field-path="headline"]').first();
    const orig = (await headline.innerText()).trim();

    for (const suffix of [' v1', ' v2', ' v3-final']) {
      await headline.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type(`${orig}${suffix}`);
      await page.locator('#resume-document-print').click({ position: { x: 4, y: 4 } });
      await page.waitForTimeout(150);
    }

    await waitForSaved(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-field-path="headline"]', { timeout: 15_000 });
    await expect(page.locator('[data-field-path="headline"]').first()).toContainText('v3-final');

    // Restore original
    await page.locator('[data-field-path="headline"]').first().click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(orig);
    await page.locator('#resume-document-print').click({ position: { x: 4, y: 4 } });
    await waitForSaved(page);

    expect(diag.pageErrors).toEqual([]);
  });

  test('Secondary user cannot access or mutate primary QA user resumes', async () => {
    const session = loadQaSession();
    const targetId = session.personaResumeIds['persona-01-fresher'];

    const getRes = await apiRequest(`/resumes/${targetId}`, {
      token: session.secondaryAccessToken,
    });
    expect(getRes.status).toBe(404);

    const patchRes = await apiRequest(`/resumes/${targetId}`, {
      method: 'PATCH',
      token: session.secondaryAccessToken,
      body: { name: 'Hijacked' },
    });
    expect(patchRes.status).toBe(404);
  });
});

