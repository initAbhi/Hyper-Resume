import { scenario, test } from "../kit.ts";
import * as steps from "../steps/index.ts";

test(
  "feature_export_latex",
  scenario({
    title: "Vector PDF & Jake's Resume LaTeX Export",
    captions: true,
    showTransition: "slide",
    intro: {
      title: "1-Click Vector PDF & LaTeX Export",
      subtitle: "Verified Selectable Text · Overleaf & GitHub-Ready .tex Source",
      durationMs: 2500,
    },
    outro: {
      title: "Zero Parse Failures. 100% ATS Safe.",
      subtitle: "True Vector PDF, Word & LaTeX at hyper-resume.com",
      durationMs: 3000,
    },
    require: ["APP_USERNAME", "APP_PASSWORD"],
    steps: [
      steps.login({
        offCamera: true,
      }),
      {
        id: "open_editor",
        title: "Production Resume Workspace",
        note: "Verified executive resume loaded in live vector canvas",
        run: async ({ page, rec }) => {
          await page.goto("http://localhost:3000/app/resumes/4dd82d3f-abbd-42cf-86c2-e969d8af519d");
          await page.waitForLoadState("networkidle");
          await page.locator('#resume-document-print').waitFor({ state: "visible", timeout: 15_000 });
          await rec.watch(1500);

          const exportBtn = page.locator('button:has-text("Download PDF")').first();
          if (await exportBtn.isVisible()) {
            await rec.hover(exportBtn);
            await rec.watch(1000);
          }
        },
      },
      {
        id: "trigger_export_modal",
        title: "1-Click Direct Vector Export",
        note: "Serializing live DOM to true vector ATS format",
        transition: "slide",
        run: async ({ page, rec }) => {
          const exportBtn = page.locator('button:has-text("Download PDF")').first();
          await rec.click(exportBtn);
          await rec.watch(1200);

          const modal = page.locator('#export-pdf-modal');
          await modal.waitFor({ state: "visible", timeout: 5000 });
        },
      },
      {
        id: "ats_vector_verification",
        title: "Deterministic ATS Verification",
        note: "Real-time selectable text audit and layout validation",
        transition: "cube",
        run: async ({ page, rec }) => {
          await page.locator('text=Vector ATS PDF Ready').waitFor({ state: "visible", timeout: 15_000 });
          await page.locator('text=ATS Text Verified').waitFor({ state: "visible", timeout: 5000 });

          const modalBody = page.locator('#export-pdf-modal div.rounded-2xl').first();
          await rec.show(modalBody, { transition: "slide" });
          await rec.watch(2500);
        },
      },
      {
        id: "export_latex_source",
        title: "Jake's Resume LaTeX (.tex) Source",
        note: "Production-grade Overleaf and GitHub LaTeX code generation",
        transition: "slide",
        run: async ({ page, rec }) => {
          const modal = page.locator('#export-pdf-modal');
          const latexBtn = modal.locator('button[data-testid="modal-export-latex-btn"]');
          await latexBtn.waitFor({ state: "visible", timeout: 5000 });
          await rec.hover(latexBtn);
          await rec.watch(1000);

          // Trigger download event safely
          const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 6000 }).catch(() => null),
            rec.click(latexBtn),
          ]);
          await rec.watch(1500);
        },
      },
      {
        id: "export_docx_and_actions",
        title: "Multi-Format & Career Workflows",
        note: "Editable Word (.docx) & AI mock interview integration",
        transition: "cube",
        run: async ({ page, rec }) => {
          const modal = page.locator('#export-pdf-modal');
          const docxBtn = modal.locator('button[data-testid="modal-export-docx-btn"]');
          if (await docxBtn.isVisible()) {
            await rec.hover(docxBtn);
            await rec.watch(1000);
          }

          const matchCard = modal.locator('a[href*="/app/match"]').first();
          if (await matchCard.isVisible()) {
            await rec.hover(matchCard);
            await rec.watch(1200);
          }

          const downloadBtn = modal.locator('button:has-text("Download PDF")').first();
          await rec.hover(downloadBtn);
          await rec.watch(2000);
        },
      },
    ],
  }),
);
