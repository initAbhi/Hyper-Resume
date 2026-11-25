import { scenario, test } from "../kit.ts";
import * as steps from "../steps/index.ts";

test(
  "feature_powerhouse_showcase",
  scenario({
    title: "Hyper-Resume — Complete Feature Powerhouse",
    captions: true,
    showTransition: "slide",
    intro: {
      title: "Hyper-Resume",
      subtitle: "The All-in-One AI Resume & ATS Studio",
      durationMs: 2000,
    },
    outro: {
      title: "100% ATS Safe. Zero Hallucinations.",
      subtitle: "Design, audit, fix & export at hyper-resume.com",
      durationMs: 2500,
    },
    require: ["APP_USERNAME", "APP_PASSWORD"],
    steps: [
      steps.login({
        offCamera: true,
      }),
      {
        id: "open_canvas",
        title: "Live Visual Canvas",
        note: "Production split-screen resume studio with real-time vector preview",
        run: async ({ page, rec }) => {
          await page.goto("http://localhost:3000/app/resumes/4dd82d3f-abbd-42cf-86c2-e969d8af519d");
          await page.waitForLoadState("networkidle");
          await page.locator('#resume-document-print').waitFor({ state: "visible", timeout: 15_000 });
          await rec.watch(1000);
        },
      },
      {
        id: "live_design_palette",
        title: "Live Palette & Styling",
        note: "Instant real-time accent colors and branding customizer",
        transition: "slide",
        run: async ({ page, rec }) => {
          // Open Design Drawer from dock
          const designDockBtn = page.locator('#canva-dock-design');
          await rec.click(designDockBtn);
          await rec.watch(800);

          // Click Teal Swatch
          const tealSwatch = page.locator('button[data-preview-value="#0d9488"]').first();
          if (await tealSwatch.isVisible()) {
            await rec.click(tealSwatch);
            await rec.watch(700);
          }

          // Click Purple Swatch
          const purpleSwatch = page.locator('button[data-preview-value="#7c3aed"]').first();
          if (await purpleSwatch.isVisible()) {
            await rec.click(purpleSwatch);
            await rec.watch(800);
          }
        },
      },
      {
        id: "switch_templates",
        title: "10 Battle-Tested Templates",
        note: "1-Click layout switching: Harvard Jake's ATS to Modern Tech",
        transition: "slide",
        run: async ({ page, rec }) => {
          // Open Templates Drawer from dock
          const tplDockBtn = page.locator('#canva-dock-templates');
          await rec.click(tplDockBtn);
          await rec.watch(800);

          // Switch to Jake's ATS
          const jakeTpl = page.locator('button[data-template-key="jake-ats"]').first();
          if (await jakeTpl.isVisible()) {
            await rec.click(jakeTpl);
            await rec.watch(900);
          }

          // Switch to Clean Modern
          const modernTpl = page.locator('button[data-template-key="clean-modern"]').first();
          if (await modernTpl.isVisible()) {
            await rec.click(modernTpl);
            await rec.watch(900);
          }
        },
      },
      {
        id: "ats_scorecard",
        title: "5-Dimension ATS Audit",
        note: "Deterministic mathematical scoring: Formatting, metrics, verbs & depth",
        transition: "slide",
        run: async ({ page, rec }) => {
          // Open ATS Audit Drawer from dock
          const atsDockBtn = page.locator('#canva-dock-ats');
          await rec.click(atsDockBtn);
          await rec.watch(800);

          const scorecard = page.locator('[data-testid="ats-five-dimension-scorecard"]').first();
          if (await scorecard.isVisible()) {
            await rec.show(scorecard, { transition: "slide" });
          }
          await rec.watch(1200);
        },
      },
      {
        id: "fix_mistakes",
        title: "Anti-Hallucination Fixer",
        note: "1-Click automated remediation of weak verbs and passive phrasing",
        transition: "slide",
        run: async ({ page, rec }) => {
          // Open Fix Mistakes Drawer from dock
          const mistakesDockBtn = page.locator('#canva-dock-mistakes');
          await rec.click(mistakesDockBtn);
          await rec.watch(800);

          const fixAllBtn = page.locator('#fix-all-mistakes-btn');
          if (await fixAllBtn.isVisible() && (await fixAllBtn.isEnabled())) {
            await rec.hover(fixAllBtn);
            await rec.watch(400);
            await rec.click(fixAllBtn);
            await rec.watch(1000);
          }
        },
      },
      {
        id: "ai_resume_agent",
        title: "AI Resume Copilot",
        note: "Interactive chat & guided prompt workflows in split-screen",
        transition: "slide",
        run: async ({ page, rec }) => {
          // Open AI Agent Drawer from dock
          const agentDockBtn = page.locator('#canva-dock-agent');
          await rec.click(agentDockBtn);
          await rec.watch(800);

          const boostBtn = page.locator('button:has-text("Boost ATS Score"), button:has-text("Audit & Boost ATS")').first();
          if (await boostBtn.isVisible()) {
            await rec.hover(boostBtn);
            await rec.watch(800);
          }
        },
      },
      {
        id: "vector_export",
        title: "Selectable Vector PDF & LaTeX",
        note: "100% extractable text audit badge, Overleaf LaTeX & Word export",
        transition: "slide",
        run: async ({ page, rec }) => {
          // Click top-bar Download PDF button
          const exportBtn = page.locator('button:has-text("Download PDF")').first();
          await rec.hover(exportBtn);
          await rec.watch(500);
          await rec.click(exportBtn);
          await rec.watch(800);

          // Wait for verification complete
          await page.locator('text=Vector ATS PDF Ready').waitFor({ state: "visible", timeout: 15_000 });
          await page.locator('text=ATS Text Verified').waitFor({ state: "visible", timeout: 5000 });

          const modalBody = page.locator('#export-pdf-modal div.rounded-2xl').first();
          await rec.show(modalBody, { transition: "slide" });
          await rec.watch(1000);

          // Hover on LaTeX export button
          const latexBtn = modalBody.locator('button[data-testid="modal-export-latex-btn"]');
          if (await latexBtn.isVisible()) {
            await rec.hover(latexBtn);
            await rec.watch(700);
          }

          // Hover on Word .docx export button
          const docxBtn = modalBody.locator('button[data-testid="modal-export-docx-btn"]');
          if (await docxBtn.isVisible()) {
            await rec.hover(docxBtn);
            await rec.watch(600);
          }

          // Hover on Job Match card
          const matchCard = modalBody.locator('a[href*="/app/match"]').first();
          if (await matchCard.isVisible()) {
            await rec.hover(matchCard);
            await rec.watch(700);
          }

          const downloadBtn = modalBody.locator('button:has-text("Download PDF")').first();
          await rec.hover(downloadBtn);
          await rec.watch(1200);
        },
      },
    ],
  }),
);

