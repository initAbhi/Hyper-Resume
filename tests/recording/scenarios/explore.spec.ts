import { scenario, test } from "../kit.ts";
import * as steps from "../steps/index.ts";

test(
  "explore",
  scenario({
    require: ["APP_USERNAME", "APP_PASSWORD"],
    steps: [
      steps.login({ note: "Sign in" }),
      {
        id: "check_resumes",
        title: "Check Resumes",
        run: async ({ page, rec }) => {
          await page.waitForURL("**/app**", { timeout: 15_000 });
          console.log("Current URL after login:", page.url());
          await page.goto("http://localhost:3000/app/resumes");
          await page.waitForLoadState("networkidle");
          const links = await page.locator('a[href*="/app/resumes/"]').all();
          console.log("Found resume links count:", links.length);
          for (const l of links) {
            const href = await l.getAttribute("href");
            const text = await l.innerText();
            console.log("Resume link:", href, text?.trim().slice(0, 40));
          }
        },
      },
    ],
  }),
);

