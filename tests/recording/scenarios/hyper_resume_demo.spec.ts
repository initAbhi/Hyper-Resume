import { scenario, test } from "../kit.ts";
import * as steps from "../steps/index.ts";

test(
  "hyper_resume_demo",
  scenario({
    title: "HyperResume Product Showcase",
    captions: true,
    require: ["APP_USERNAME", "APP_PASSWORD"],
    steps: [
      steps.login({
        title: "Sign In",
        note: "Accessing verified workspace",
      }),
      {
        id: "open_resumes",
        title: "Workspace Dashboard",
        note: "Select from benchmark resumes & active profiles",
        run: async ({ page, rec }) => {
          await page.goto("http://localhost:3000/app/resumes");
          await page.waitForLoadState("networkidle");
          const googleCard = page
            .locator('a[href*="/app/resumes/4dd82d3f-abbd-42cf-86c2-e969d8af519d"]')
            .first();
          await rec.show(googleCard);
          await rec.click(googleCard);
          await page.waitForURL("**/app/resumes/**", { timeout: 15_000 });
          await page.waitForLoadState("networkidle");
          await rec.watch(1000);
        },
      },
      {
        id: "switch_template",
        title: "10 Battle-Tested ATS Templates",
        note: "Instant 1-click layout updates on the live canvas",
        run: async ({ page, rec }) => {
          const tplDockBtn = page.locator('#canva-dock-templates');
          await rec.show(tplDockBtn);
          await rec.click(tplDockBtn);
          await rec.watch(800);

          const modernTpl = page.locator('button[data-template-key="clean-modern"]').first();
          if (await modernTpl.isVisible()) {
            await rec.show(modernTpl);
            await rec.click(modernTpl);
          }

          const resumeHeader = page.locator('#resume-document-print h1').first();
          if (await resumeHeader.isVisible()) {
            await rec.show(resumeHeader);
          }
          await rec.watch(1500);
        },
      },
      {
        id: "change_color",
        title: "Dynamic Visual Styling",
        note: "Customize brand accent colors & typography live",
        run: async ({ page, rec }) => {
          const designDockBtn = page.locator('#canva-dock-design');
          await rec.show(designDockBtn);
          await rec.click(designDockBtn);
          await rec.watch(800);

          const purpleSwatch = page.locator('button[data-preview-value="#7c3aed"]').first();
          if (await purpleSwatch.isVisible()) {
            await rec.show(purpleSwatch);
            await rec.click(purpleSwatch);
          }

          const resumeHeader = page.locator('#resume-document-print h1').first();
          if (await resumeHeader.isVisible()) {
            await rec.show(resumeHeader);
          }
          await rec.watch(1500);
        },
      },
      {
        id: "ats_audit",
        title: "Deterministic ATS Audit",
        note: "5-dimension scoring & proof of experience alignment",
        run: async ({ page, rec }) => {
          const atsDockBtn = page.locator('#canva-dock-ats');
          await rec.show(atsDockBtn);
          await rec.click(atsDockBtn);
          await rec.watch(1000);

          const auditHeader = page.locator('text=ATS Alignment').first();
          if (await auditHeader.isVisible()) {
            await rec.show(auditHeader);
          }
          await rec.watch(2000);
        },
      },
      {
        id: "export_verified_pdf",
        title: "Verified Vector PDF & LaTeX",
        note: "True selectable vector text for ATS parsers",
        run: async ({ page, rec }) => {
          const exportBtn = page.locator('button:has-text("Download PDF")').first();
          await rec.show(exportBtn);
          await rec.click(exportBtn);
          await rec.watch(1200);

          const latexBtn = page.locator('button[data-testid="modal-export-latex-btn"]').first();
          if (await latexBtn.isVisible()) {
            await rec.show(latexBtn);
          }
          await rec.watch(2500);
        },
      },
      {
        id: "closing",
        title: "HyperResume",
        note: "Build your ATS-optimized resume at hyper-resume.com",
        run: async ({ rec }) => {
          await rec.watch(2000);
        },
      },
    ],
  }),
);
