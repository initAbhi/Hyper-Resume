import { scenario, test } from "../kit.ts";
import * as steps from "../steps/index.ts";

test(
  "feature_visual_canvas",
  scenario({
    title: "Live Visual Canvas & 10 ATS Templates",
    captions: true,
    require: ["APP_USERNAME", "APP_PASSWORD"],
    steps: [
      steps.login({
        offCamera: true, // Login happens off-camera for clean ad intro!
      }),
      {
        id: "open_editor",
        title: "Visual Canvas Editor",
        note: "Real-time split-screen resume workspace",
        run: async ({ page, rec }) => {
          await page.goto("http://localhost:3000/app/resumes/4dd82d3f-abbd-42cf-86c2-e969d8af519d");
          await page.waitForLoadState("networkidle");
          // Ensure the canvas is loaded
          await page.locator('#resume-document-print').waitFor({ state: "visible", timeout: 15_000 });
          // Give the viewer a calm 2 seconds to absorb the split-screen UI
          await rec.watch(2000);
        },
      },
      {
        id: "browse_templates",
        title: "10 Battle-Tested ATS Templates",
        note: "Instant layout switches with zero formatting breaks",
        run: async ({ page, rec }) => {
          // Open Templates drawer from dock
          const tplDockBtn = page.locator('#canva-dock-templates');
          await rec.click(tplDockBtn);
          await rec.watch(1200);

          // Select Jake's Resume (Top ATS Gold Standard)
          const jakeTpl = page.locator('button[data-template-key="jake-ats"]').first();
          if (await jakeTpl.isVisible()) {
            await rec.hover(jakeTpl);
            await rec.watch(600);
            await rec.click(jakeTpl);
            await rec.watch(1500);
          }

          // Select Clean Modern Template
          const modernTpl = page.locator('button[data-template-key="clean-modern"]').first();
          if (await modernTpl.isVisible()) {
            await rec.hover(modernTpl);
            await rec.watch(600);
            await rec.click(modernTpl);
            await rec.watch(1800);
          }
        },
      },
      {
        id: "customize_design",
        title: "Dynamic Accent Styling",
        note: "Real-time brand color & typography presets",
        run: async ({ page, rec }) => {
          // Open Design Panel
          const designDockBtn = page.locator('#canva-dock-design');
          await rec.click(designDockBtn);
          await rec.watch(1000);

          // Click Teal swatch
          const tealSwatch = page.locator('button[data-preview-value="#0d9488"]').first();
          if (await tealSwatch.isVisible()) {
            await rec.click(tealSwatch);
            await rec.watch(1200);
          }

          // Click Purple swatch
          const purpleSwatch = page.locator('button[data-preview-value="#7c3aed"]').first();
          if (await purpleSwatch.isVisible()) {
            await rec.click(purpleSwatch);
            await rec.watch(1500);
          }
        },
      },
      {
        id: "focus_layout_detail",
        title: "Pixel-Perfect ATS Typography",
        note: "Single-column hierarchy & recruiter-scannable metrics",
        run: async ({ page, rec }) => {
          // Purposeful, calm zoom on the top experience & title of the transformed resume
          const resumeHeader = page.locator('#resume-document-print header, #resume-document-print h1').first();
          if (await resumeHeader.isVisible()) {
            await rec.show(resumeHeader, { transition: "pan" });
            await rec.watch(3000);
          }
        },
      },
      {
        id: "outro",
        title: "HyperResume Visual Canvas",
        note: "Create your ATS-optimized resume at hyper-resume.com",
        run: async ({ rec }) => {
          await rec.watch(2500);
        },
      },
    ],
  }),
);

