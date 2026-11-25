import { scenario, test } from "../kit.ts";
import * as steps from "../steps/index.ts";

test(
  "master_product_launch",
  scenario({
    title: "Hyper-Resume — The Autonomous Career Engine",
    captions: true,
    showTransition: "slide",
    intro: {
      title: "The Autonomous AI Career Engine",
      subtitle: "Beat the ATS with verified evidence · Built for high-growth tech careers",
      durationMs: 3200,
    },
    outro: {
      title: "Stop Getting Filtered Out By Bots.",
      subtitle: "Build your verified ATS resume at hyper-resume.com",
      durationMs: 3800,
    },
    require: ["APP_USERNAME", "APP_PASSWORD"],
    steps: [
      steps.login({
        offCamera: true,
      }),
      {
        id: "open_canvas",
        title: "Pixel-Perfect Visual Canvas",
        note: "Live A4 vector layout engine with deterministic styling",
        run: async ({ page, rec }) => {
          // Navigate directly to the verified Staff Engineer resume
          await page.goto("http://localhost:3000/app/resumes/4dd82d3f-abbd-42cf-86c2-e969d8af519d");
          await page.waitForLoadState("networkidle");
          await page.locator('#resume-document-print').waitFor({ state: "visible", timeout: 15_000 });
          await rec.watch(1500);

          // Focus on candidate headline & profile
          const titleHeading = page.locator('#resume-document-print h1').first();
          if (await titleHeading.isVisible()) {
            await rec.show(titleHeading, { transition: "slide" });
            await rec.watch(1200);
          }

          // Hover on the ATS score dock item showing live score badge (88)
          const atsDockBtn = page.locator('#canva-dock-ats');
          await rec.hover(atsDockBtn);
          await rec.watch(1500);
        },
      },
      {
        id: "open_ats_scorecard",
        title: "5-Dimension Deterministic Audit",
        note: "Mathematical scoring across formatting, metrics, verbs, depth and brevity",
        transition: "slide",
        run: async ({ page, rec }) => {
          const atsDockBtn = page.locator('#canva-dock-ats');
          await rec.click(atsDockBtn);
          await rec.watch(1000);

          const scorecard = page.locator('[data-testid="ats-five-dimension-scorecard"]').first();
          if (await scorecard.isVisible()) {
            await rec.show(scorecard, { transition: "slide" });
          }
          await rec.watch(2500);
        },
      },
      {
        id: "fix_mistakes",
        title: "Anti-Hallucination & Grammar Remediation",
        note: "1-Click automated upgrades preserving factual career integrity",
        transition: "cube",
        run: async ({ page, rec }) => {
          const mistakesDockBtn = page.locator('#canva-dock-mistakes');
          await rec.click(mistakesDockBtn);
          await rec.watch(1200);

          const mistakesDrawer = page.locator('#fix-mistakes-drawer').first();
          if (await mistakesDrawer.isVisible()) {
            await rec.show(mistakesDrawer, { transition: "slide" });
          }
          await rec.watch(1000);

          const fixAllBtn = page.locator('#fix-all-mistakes-btn');
          if (await fixAllBtn.isVisible() && (await fixAllBtn.isEnabled())) {
            await rec.hover(fixAllBtn);
            await rec.watch(800);
            await rec.click(fixAllBtn);
            await rec.watch(1800);
          } else {
            const firstMark = page.locator('#fix-mistakes-drawer mark').first();
            if (await firstMark.isVisible()) {
              await rec.show(firstMark);
              await rec.watch(1200);
            }
          }
        },
      },
      {
        id: "trigger_export",
        title: "True Vector ATS Verification & Jake's LaTeX",
        note: "Guaranteed selectable text layer with Overleaf-ready LaTeX source",
        transition: "cube",
        run: async ({ page, rec }) => {
          const exportBtn = page.locator('button:has-text("Download PDF")').first();
          await rec.hover(exportBtn);
          await rec.watch(800);
          await rec.click(exportBtn);
          await rec.watch(1200);

          // Wait for verification
          await page.locator('text=Vector ATS PDF Ready').waitFor({ state: "visible", timeout: 15_000 });
          await page.locator('text=ATS Text Verified').waitFor({ state: "visible", timeout: 5000 });

          const modalBody = page.locator('#export-pdf-modal div.rounded-2xl').first();
          await rec.show(modalBody, { transition: "slide" });
          await rec.watch(1800);

          // Hover on LaTeX source download button
          const latexBtn = modalBody.locator('button[data-testid="modal-export-latex-btn"]');
          if (await latexBtn.isVisible()) {
            await rec.hover(latexBtn);
            await rec.watch(1200);
          }

          // Hover on Word .docx export button
          const docxBtn = modalBody.locator('button[data-testid="modal-export-docx-btn"]');
          if (await docxBtn.isVisible()) {
            await rec.hover(docxBtn);
            await rec.watch(1000);
          }
        },
      },
      {
        id: "career_launch",
        title: "End-to-End Interview Readiness",
        note: "Seamless transition into AI job matching and STAR mock interviews",
        transition: "slide",
        run: async ({ page, rec }) => {
          const modalBody = page.locator('#export-pdf-modal div.rounded-2xl').first();
          const matchCard = modalBody.locator('a[href*="/app/match"]').first();
          if (await matchCard.isVisible()) {
            await rec.hover(matchCard);
            await rec.watch(1000);
          }

          const interviewCard = modalBody.locator('a[href*="/app/interview"]').first();
          if (await interviewCard.isVisible()) {
            await rec.hover(interviewCard);
            await rec.watch(1200);
          }

          const downloadBtn = modalBody.locator('button:has-text("Download PDF")').first();
          await rec.hover(downloadBtn);
          await rec.watch(2200);
        },
      },
    ],
  }),
);

