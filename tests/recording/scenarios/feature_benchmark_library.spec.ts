import { scenario, test, expect } from "../kit.ts";
import * as steps from "../steps/index.ts";

test(
  "feature_benchmark_library",
  scenario({
    title: "82+ FAANG Benchmark Resume Library",
    captions: true,
    showTransition: "slide",
    intro: {
      title: "82+ FAANG Benchmark Resumes",
      subtitle: "Verified ATS-Optimized Profiles from Google, Meta, Stripe & Netflix",
      durationMs: 2500,
    },
    outro: {
      title: "Model Your Resume on Proven Hires",
      subtitle: "Explore 82+ Verified Benchmarks at hyper-resume.com",
      durationMs: 3000,
    },
    require: ["APP_USERNAME", "APP_PASSWORD"],
    steps: [
      steps.login({
        offCamera: true,
      }),
      {
        id: "browse_library",
        title: "Curated Benchmark Library",
        note: "Filter 82+ verified resumes by company, discipline and seniority",
        run: async ({ page, rec }) => {
          // Wait for any post-login client redirects to finish
          await page.waitForLoadState("domcontentloaded");
          await page.waitForTimeout(1500);

          await page.goto("http://localhost:3000/app/samples");
          await page.waitForURL("**/app/samples", { timeout: 15_000 });
          await expect(page.locator('h1:has-text("Sample Resume Library")')).toBeVisible({ timeout: 15_000 });
          await rec.watch(1500);

          // Find search bar
          const searchInput = page.locator('input[placeholder*="Search by role, company, skill, candidate"]').first();
          if (await searchInput.isVisible()) {
            await rec.hover(searchInput);
            await searchInput.fill("Google");
            await rec.watch(1500);
          }
        },
      },
      {
        id: "inspect_benchmark_card",
        title: "Real-World ATS Caliber",
        note: "Evaluating verified 98/100 ATS scores and target company formatting",
        transition: "slide",
        run: async ({ page, rec }) => {
          // Find first Google card
          const card = page.locator('div.group.relative.flex.flex-col.rounded-xl').first();
          await expect(card).toBeVisible({ timeout: 8000 });

          await rec.hover(card);
          await rec.watch(1000);

          // Hover on the Preview Resume button that appears on card hover
          const previewBtn = card.locator('button:has-text("Preview Resume")').first();
          if (await previewBtn.isVisible()) {
            await rec.hover(previewBtn);
            await rec.watch(600);
            await rec.click(previewBtn);
          } else {
            await rec.click(card);
          }

          // Wait for sample modal to open
          await expect(page.locator('#sample-resume-modal-wrapper')).toBeVisible({ timeout: 10_000 });
          await rec.watch(2000);
        },
      },
      {
        id: "evaluate_resume_structure",
        title: "Full-Fidelity Template Inspection",
        note: "Interactive inspection of executive metrics, skills taxonomy and clean typography",
        transition: "cube",
        run: async ({ page, rec }) => {
          const modalHeader = page.locator('#sample-resume-modal-wrapper h3').first();
          if (await modalHeader.isVisible()) {
            await rec.show(modalHeader, { transition: "slide" });
          }
          await rec.watch(1500);

          const copyBtn = page.locator('#sample-resume-modal-wrapper button[aria-label="Copy resume text"]').first();
          if (await copyBtn.isVisible()) {
            await rec.hover(copyBtn);
            await rec.watch(800);
          }

          const starterBtn = page.locator('#sample-resume-modal-wrapper button:has-text("Starter")').first();
          if (await starterBtn.isVisible()) {
            await rec.hover(starterBtn);
            await rec.watch(1000);
          }
        },
      },
      {
        id: "adapt_with_profile_modal",
        title: "AI Profile Adaptation Engine",
        note: "Transfer your genuine career facts into this FAANG benchmark standard",
        transition: "slide",
        run: async ({ page, rec }) => {
          const adaptBtn = page.locator('#sample-resume-modal-wrapper button:has-text("Adapt")').first();
          if (await adaptBtn.isVisible()) {
            await rec.hover(adaptBtn);
            await rec.watch(1000);
            await rec.click(adaptBtn);
            await rec.watch(2000);

            // Verify source resume selector dialog opened
            const resumeRadio = page.locator('input[type="radio"], [role="radio"]').first();
            if (await resumeRadio.isVisible()) {
              await rec.hover(resumeRadio);
              await rec.watch(1200);
            }
          }
        },
      },
      {
        id: "benchmark_outro_confidence",
        title: "Ready to Adapt & Apply",
        note: "Instant clone to private workspace with zero ATS rejection risk",
        transition: "cube",
        run: async ({ page, rec }) => {
          const adaptActionBtn = page.locator('button:has-text("Adapt"), button:has-text("Adaptation")').last();
          if (await adaptActionBtn.isVisible()) {
            await rec.hover(adaptActionBtn);
            await rec.watch(2000);
          }
        },
      },
    ],
  }),
);
