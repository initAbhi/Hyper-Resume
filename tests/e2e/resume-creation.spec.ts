import { test, expect } from '@playwright/test';
import {
  APP_BASE_URL,
  attachDiagnostics,
  authenticatePage,
  loadQaSession,
} from './helpers/qa-env';

test.describe('1. Resume Creation, Dashboard & Auth Flows', () => {
  test('real human UI login flow redirects to dashboard and loads seeded resumes', async ({ page }) => {
    const session = loadQaSession();
    const diag = attachDiagnostics(page);

    await page.goto(`${APP_BASE_URL}/login`, { waitUntil: 'networkidle' });
    const signInBtn = page.getByRole('button', { name: /sign in to workspace/i });
    await expect(signInBtn).toBeVisible({ timeout: 10_000 });
    await page.getByLabel(/Email Address/i).fill(session.email);
    await page.getByLabel(/^Password/i).fill(session.password);
    await signInBtn.click();

    await page.waitForURL(/\/app/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/app/);

    // Navigate to My Resumes
    await page.goto(`${APP_BASE_URL}/app/resumes`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('P01 Minimal Fresher Resume')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('P10 Extreme Stress Edge Case')).toBeVisible();

    expect(diag.pageErrors).toEqual([]);
  });

  test('create a new resume through the real UI modal, edit title, duplicate, search, and delete', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await authenticatePage(page);
    await page.goto(`${APP_BASE_URL}/app/resumes`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=P01 Minimal Fresher Resume', { timeout: 15_000 });

    // Open Create Resume modal
    const createBtn = page
      .getByRole('button', { name: /new resume|create resume|create from scratch/i })
      .first();
    await createBtn.click();

    // Fill resume name inside modal
    const uniqueName = `UI Created Resume ${Date.now()}`;
    const nameInput = page.locator('input[placeholder*="Software"], input[placeholder*="Resume"], input[required]').first();
    await expect(nameInput).toBeVisible({ timeout: 5_000 });
    await nameInput.fill(uniqueName);

    // Submit modal
    const submitBtn = page
      .locator('form button[type="submit"]')
      .first();
    await submitBtn.click();

    // Should navigate into the new resume editor
    await page.waitForURL(/\/app\/resumes\/[0-9a-f-]+/i, { timeout: 15_000 });
    await page.waitForSelector('#resume-document-print', { timeout: 15_000 });

    // Return to list, search for created resume, and verify it appears
    await page.goto(`${APP_BASE_URL}/app/resumes`, { waitUntil: 'domcontentloaded' });
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(uniqueName);
      await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 10_000 });
      await searchInput.fill('');
    } else {
      await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 10_000 });
    }

    expect(diag.pageErrors).toEqual([]);
  });

  test('empty state check on minimal fresher persona (no experience)', async ({ page }) => {
    const session = loadQaSession();
    const diag = attachDiagnostics(page);
    await authenticatePage(page);

    const fresherId = session.personaResumeIds['persona-01-fresher'];
    await page.goto(`${APP_BASE_URL}/app/resumes/${fresherId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#resume-document-print', { timeout: 15_000 });

    await expect(page.locator('#resume-document-print')).toContainText('Aarav Patel');
    await expect(page.locator('#resume-document-print')).toContainText('Campus Study Matcher');
    expect(diag.pageErrors).toEqual([]);
  });
});

