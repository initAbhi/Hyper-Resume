import { scenario, test } from "../kit.ts";
import * as steps from "../steps/index.ts";

test(
  "feature_ats_audit",
  scenario({
    title: "ATS Audit & Anti-Hallucination Engine",
    captions: true,
    showTransition: "slide",
    intro: {
      title: "Deterministic ATS Audit",
      subtitle: "5-Dimension Scoring & Anti-Hallucination Engine",
      durationMs: 2500,
    },
    outro: {
      title: "Beat the ATS with Verified Evidence",
      subtitle: "Built for High-Growth Tech Careers · hyper-resume.com",
      durationMs: 3000,
    },
    require: ["APP_USERNAME", "APP_PASSWORD"],
    steps: [
      steps.login({
        offCamera: true,
      }),
      {
        id: "open_editor",
        title: "Resume Workspace",
        note: "Auditing live candidate experience against ATS standards",
        run: async ({ page, rec }) => {
          await page.goto("http://localhost:3000/app/resumes/4dd82d3f-abbd-42cf-86c2-e969d8af519d");
          await page.waitForLoadState("networkidle");
          await page.locator('#resume-document-print').waitFor({ state: "visible", timeout: 15_000 });
          await rec.watch(1500);
        },
      },
      {
        id: "open_ats_scorecard",
        title: "5-Dimension ATS Breakdown",
        note: "Formatting, metrics, verbs, tech depth & brevity analysis",
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
        id: "switch_to_mistakes",
        title: "Anti-Hallucination & Grammar Scan",
        note: "Eliminating passive voice, typos & unevidenced buzzwords",
        transition: "cube",
        run: async ({ page, rec }) => {
          const mistakesDockBtn = page.locator('#canva-dock-mistakes');
          await rec.click(mistakesDockBtn);
          await rec.watch(1200);

          const mistakesDrawer = page.locator('#fix-mistakes-drawer').first();
          if (await mistakesDrawer.isVisible()) {
            await rec.show(mistakesDrawer, { transition: "slide" });
          }
          await rec.watch(2000);
        },
      },
      {
        id: "apply_safe_fixes",
        title: "1-Click Safe Remediation",
        note: "Instant action verb upgrades & quantified metrics polish",
        run: async ({ page, rec }) => {
          const fixAllBtn = page.locator('#fix-all-mistakes-btn');
          if (await fixAllBtn.isVisible() && (await fixAllBtn.isEnabled())) {
            await rec.hover(fixAllBtn);
            await rec.watch(600);
            await rec.click(fixAllBtn);
            await rec.watch(1800);
          } else {
            const firstIssue = page.locator('#fix-mistakes-drawer mark').first();
            if (await firstIssue.isVisible()) {
              await rec.show(firstIssue);
              await rec.watch(1500);
            }
          }
        },
      },
      {
        id: "verify_audit_score",
        title: "Verified ATS Alignment",
        note: "Evidence-backed resume ready for elite applications",
        run: async ({ page, rec }) => {
          const atsDockBtn = page.locator('#canva-dock-ats');
          await rec.click(atsDockBtn);
          await rec.watch(1000);

          const atsHeader = page.locator('text=ATS Alignment').first();
          if (await atsHeader.isVisible()) {
            await rec.show(atsHeader, { transition: "pan" });
          }
          await rec.watch(2500);
        },
      },
    ],
  }),
);

