import { test, expect } from '@playwright/test';
import {
  API_BASE_URL,
  attachDiagnostics,
  authenticatePage,
  loadQaSession,
  openResumeEditor,
} from './helpers/qa-env';

test.describe('9. Vector PDF & DOCX Export Quality Audit', () => {
  test('Export vector PDF via UI modal for International Unicode persona & verify ATS text layer, page count & non-corrupt bytes', async ({ page }) => {
    const session = loadQaSession();
    const diag = attachDiagnostics(page);
    await authenticatePage(page);

    const unicodeId = session.personaResumeIds['persona-09-international'];
    await openResumeEditor(page, unicodeId, 'canvas');

    // Capture export response headers & payload directly during UI modal flow
    const exportPromise = page.waitForResponse(
      (res) => res.url().includes(`/resumes/${unicodeId}/export/pdf`) && res.request().method() === 'POST',
      { timeout: 30_000 },
    );

    await page.locator('#canva-dock-export').click();
    await expect(page.locator('#export-pdf-modal')).toBeVisible({ timeout: 5_000 });

    const exportRes = await exportPromise;
    expect(exportRes.status()).toBe(200);

    const headers = exportRes.headers();
    const buf = await exportRes.body();
    expect(buf.byteLength).toBeGreaterThan(5_000);
    // Verify genuine PDF magic bytes (%PDF-)
    expect(buf.subarray(0, 5).toString('ascii')).toBe('%PDF-');

    const atsVerified = headers['x-ats-text-verified'];
    const extractableWords = Number(headers['x-ats-extractable-words'] || 0);
    const pageCount = Number(headers['x-pdf-page-count'] || 0);

    console.log(
      `[QA_PDF_UNICODE] bytes=${buf.byteLength} pages=${pageCount} atsVerified=${atsVerified} words=${extractableWords}`,
    );
    expect(atsVerified).toBe('true');
    expect(extractableWords).toBeGreaterThan(40);
    expect(pageCount).toBeGreaterThanOrEqual(1);

    // Modal should show completion state
    await expect(page.getByText(/Vector ATS PDF Ready|100% Complete/i).first()).toBeVisible({
      timeout: 15_000,
    });

    // Press Escape to close modal
    await page.keyboard.press('Escape');
    await expect(page.locator('#export-pdf-modal')).toBeHidden({ timeout: 5_000 });
    expect(diag.pageErrors).toEqual([]);
  });

  test('Export vector PDF for Extreme Edge-Case persona (22 bullets) and Minimal Fresher persona (1 page) + DOCX export', async ({ page }) => {
    const session = loadQaSession();
    await authenticatePage(page);

    // 1. Minimal Fresher -> should export cleanly as 1 page
    const fresherId = session.personaResumeIds['persona-01-fresher'];
    await openResumeEditor(page, fresherId, 'canvas');
    const fresherPdfPromise = page.waitForResponse(
      (res) => res.url().includes(`/resumes/${fresherId}/export/pdf`),
      { timeout: 30_000 },
    );
    await page.locator('#canva-dock-export').click();
    const fresherPdf = await fresherPdfPromise;
    expect(fresherPdf.status()).toBe(200);
    expect(Number(fresherPdf.headers()['x-pdf-page-count'])).toBe(1);
    await page.keyboard.press('Escape');

    // 2. Extreme Edge-Case -> multi-page valid PDF with high word count
    const extremeId = session.personaResumeIds['persona-10-extreme'];
    await openResumeEditor(page, extremeId, 'canvas');
    const extremePdfPromise = page.waitForResponse(
      (res) => res.url().includes(`/resumes/${extremeId}/export/pdf`),
      { timeout: 30_000 },
    );
    await page.locator('#canva-dock-export').click();
    const extremePdf = await extremePdfPromise;
    expect(extremePdf.status()).toBe(200);
    const extremeBytes = (await extremePdf.body()).byteLength;
    const extremePages = Number(extremePdf.headers()['x-pdf-page-count'] || 0);
    const extremeWords = Number(extremePdf.headers()['x-ats-extractable-words'] || 0);
    console.log(
      `[QA_PDF_EXTREME] bytes=${extremeBytes} pages=${extremePages} words=${extremeWords}`,
    );
    expect(extremeBytes).toBeGreaterThan(10_000);
    expect(extremeWords).toBeGreaterThan(200);
    await page.keyboard.press('Escape');

    // 3. Verify DOCX export endpoint returns valid ZIP/DOCX magic bytes (PK..)
    const docxRes = await fetch(`${API_BASE_URL}/resumes/${fresherId}/export/docx`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    expect(docxRes.status).toBe(200);
    const docxBuf = Buffer.from(await docxRes.arrayBuffer());
    expect(docxBuf.subarray(0, 2).toString('ascii')).toBe('PK');
  }, 90_000);
});

