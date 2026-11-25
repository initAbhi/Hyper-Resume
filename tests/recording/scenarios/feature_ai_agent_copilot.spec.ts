import { scenario, test } from "../kit.ts";
import * as steps from "../steps/index.ts";

test(
  "feature_ai_agent_copilot",
  scenario({
    title: "Hyper-Resume — AI Resume Agent & Copilot Studio",
    captions: true,
    showTransition: "slide",
    intro: {
      title: "AI Resume Copilot",
      subtitle: "Autonomous Auditing, Section Mentions & 1-Click Tailoring",
      durationMs: 2000,
    },
    outro: {
      title: "100% Verified. Zero Hallucinations.",
      subtitle: "Supercharge your career at hyper-resume.com",
      durationMs: 2500,
    },
    require: ["APP_USERNAME", "APP_PASSWORD"],
    steps: [
      steps.login({
        offCamera: true,
      }),
      {
        id: "open_canvas",
        title: "Live Visual Studio",
        note: "Production split-screen resume studio with real-time vector preview",
        run: async ({ page, rec }) => {
          await page.goto("http://localhost:3000/app/resumes/4dd82d3f-abbd-42cf-86c2-e969d8af519d");
          await page.waitForLoadState("networkidle");
          await page.locator('#resume-document-print').waitFor({ state: "visible", timeout: 15_000 });
          await rec.watch(1000);
        },
      },
      {
        id: "dock_ai_agent",
        title: "Split-Screen AI Career Agent",
        note: "Dedicated assistant panel alongside the live vector A4 canvas",
        transition: "slide",
        run: async ({ page, rec }) => {
          const agentDockBtn = page.locator('#canva-dock-agent');
          await rec.hover(agentDockBtn);
          await rec.watch(600);

          const agentPane = page.locator('#desktop-agent-pane');
          if (!(await agentPane.isVisible())) {
            await rec.click(agentDockBtn);
            await rec.watch(600);
          }

          await rec.show(agentPane, { transition: "slide" });
          await rec.watch(900);
        },
      },
      {
        id: "guided_career_goals",
        title: "4 Strategic Career Frameworks",
        note: "Curated workflows: ATS 95+ Boost, Job Link Tailoring, Live Search & Zero-to-Resume",
        transition: "slide",
        run: async ({ page, rec }) => {
          const agentPane = page.locator('#desktop-agent-pane');

          // Hover across 4 strategic onboarding cards scoped to the desktop agent pane
          const cardBoost = agentPane.locator('[data-testid="onboarding-card-boost_ats"]');
          if (await cardBoost.isVisible()) {
            await rec.hover(cardBoost);
            await rec.watch(700);
          }

          const cardTailor = agentPane.locator('[data-testid="onboarding-card-tailor_jd"]');
          if (await cardTailor.isVisible()) {
            await rec.hover(cardTailor);
            await rec.watch(700);
          }

          const cardFind = agentPane.locator('[data-testid="onboarding-card-find_jobs"]');
          if (await cardFind.isVisible()) {
            await rec.hover(cardFind);
            await rec.watch(700);
          }

          const cardInterview = agentPane.locator('[data-testid="onboarding-card-interview_me"]');
          if (await cardInterview.isVisible()) {
            await rec.hover(cardInterview);
            await rec.watch(800);
          }
        },
      },
      {
        id: "contextual_quick_actions",
        title: "1-Click Contextual Quick Actions",
        note: "Instant triggers dynamically resolved from the current resume state",
        transition: "slide",
        run: async ({ page, rec }) => {
          const agentPane = page.locator('#desktop-agent-pane');
          const quickChips = agentPane.locator('[data-testid^="quick-action-chip-"]');
          const chipCount = await quickChips.count();
          if (chipCount > 0) {
            await rec.hover(quickChips.first());
            await rec.watch(600);
            if (chipCount > 1) {
              await rec.hover(quickChips.nth(1));
              await rec.watch(600);
            }
          }

          // Also highlight quick prompt buttons
          const quickPromptBtn = agentPane.locator('button:has-text("Audit my resume for ATS compliance")').first();
          if (await quickPromptBtn.isVisible()) {
            await rec.hover(quickPromptBtn);
            await rec.watch(800);
          }
        },
      },
      {
        id: "section_mentions_engine",
        title: "Deep @Section Mentions Engine",
        note: "Pin specific sections to isolate and scope AI improvements surgically",
        transition: "slide",
        run: async ({ page, rec }) => {
          const agentPane = page.locator('#desktop-agent-pane');

          // Click mention trigger button
          const mentionBtn = agentPane.locator('[data-testid="agent-mention-trigger-btn"]');
          if (await mentionBtn.isVisible()) {
            await rec.hover(mentionBtn);
            await rec.watch(400);
            await rec.click(mentionBtn);
            await rec.watch(800);

            // Select @Experience from mention popover
            const expOption = agentPane.locator('[data-testid="mention-option-section:experience"]');
            if (await expOption.isVisible()) {
              await rec.hover(expOption);
              await rec.watch(500);
              await rec.click(expOption);
              await rec.watch(800);
            }

            // Click mention trigger button again to add @Skills
            if (await mentionBtn.isVisible()) {
              await rec.click(mentionBtn);
              await rec.watch(600);
              const skillsOption = agentPane.locator('[data-testid="mention-option-section:skills"]');
              if (await skillsOption.isVisible()) {
                await rec.hover(skillsOption);
                await rec.watch(500);
                await rec.click(skillsOption);
                await rec.watch(800);
              }
            }

            // Highlight pinned chips bar
            const pinnedChips = agentPane.locator('[data-testid="agent-pinned-chips-bar"]');
            if (await pinnedChips.isVisible()) {
              await rec.show(pinnedChips, { transition: "slide" });
              await rec.watch(900);
            }
          }
        },
      },
      {
        id: "job_spec_url_parser",
        title: "Instant Job Spec URL Parser",
        note: "1-Click import from Greenhouse, Lever, Ashby, or corporate career portals",
        transition: "slide",
        run: async ({ page, rec }) => {
          const agentPane = page.locator('#desktop-agent-pane');

          // Click attach URL button
          const attachUrlBtn = agentPane.locator('[data-testid="agent-attach-url-btn"]');
          if (await attachUrlBtn.isVisible()) {
            await rec.hover(attachUrlBtn);
            await rec.watch(400);
            await rec.click(attachUrlBtn);
            await rec.watch(700);

            // Fill sample job posting URL
            const urlInput = agentPane.locator('[data-testid="agent-jd-url-bar"] input');
            if (await urlInput.isVisible()) {
              await urlInput.fill("https://jobs.lever.co/stripe/staff-distributed-systems");
              await rec.watch(900);

              // Dismiss URL bar to clean up
              const closeUrlBtn = agentPane.locator('button[aria-label="Close job URL bar"]');
              if (await closeUrlBtn.isVisible()) {
                await rec.click(closeUrlBtn);
                await rec.watch(500);
              }
            }
          }
        },
      },
      {
        id: "targeted_prompt_composer",
        title: "Autonomous Prompt & Scoped Execution",
        note: "Scoped prompt targeting pinned sections for metric-backed bullet rewrites",
        transition: "slide",
        run: async ({ page, rec }) => {
          const agentPane = page.locator('#desktop-agent-pane');
          const textarea = agentPane.locator('textarea[placeholder*="Type @ to pin"]');
          if (await textarea.isVisible()) {
            await rec.hover(textarea);
            await rec.watch(400);
            await textarea.fill("Rewrite @Experience bullets to emphasize 99.999% availability, Raft consensus, and sub-millisecond p99 latency.");
            await rec.watch(900);

            // Hover on Send Button
            const sendBtn = agentPane.locator('button[aria-label="Send instruction to AI Agent"]');
            if (await sendBtn.isVisible()) {
              await rec.hover(sendBtn);
              await rec.watch(1000);
            }
          }
        },
      },
      {
        id: "anti_hallucination_safeguards",
        title: "Anti-Hallucination Diff Safeguards",
        note: "Every AI modification requires explicit human review and metric confirmation",
        transition: "slide",
        run: async ({ page, rec }) => {
          // Focus back on the live canvas verifying vector synchronization
          const canvasDoc = page.locator('#resume-document-print');
          await rec.show(canvasDoc, { transition: "slide" });
          await rec.watch(1200);
        },
      },
    ],
  }),
);
