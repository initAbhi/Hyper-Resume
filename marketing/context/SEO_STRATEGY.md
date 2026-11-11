# SEO & Programmatic Content Strategy — HyperResume / HypeResume

> **Last Updated:** November 11, 2026  
> **Baseline Verified in Codebase:** `hype-resume.com` is already indexed by Google (`search_web` verified Nov 11, 2026). Existing site contains 4 public `/tools/*` routes, `/examples`, 6 static `/examples/[role]` guides, 82 structured company benchmark resumes (`data/sample-resumes.ts`), `sitemap.ts`, `robots.ts`, and `next.config.ts` legacy redirects.

---

## 1. Technical SEO Audit & Immediate Quick Wins

Inspecting `frontend/lib/seo.ts`, `frontend/app/layout.tsx`, `frontend/app/sitemap.ts`, `frontend/app/robots.ts`, and `frontend/app/tools/*` revealed high-impact fixes that cost <1 day of engineering:

| # | Verified Technical SEO Bug / Gap | Exact File Location | Fix Required |
| :--- | :--- | :--- | :--- |
| 1 | **`SITE_URL` defaults to `http://localhost:3000`** if `NEXT_PUBLIC_APP_URL` is unset | `frontend/lib/seo.ts:5` | Default safely to `'https://hype-resume.com'` (matching `app/layout.tsx:26` `metadataBase`) AND ensure `NEXT_PUBLIC_APP_URL=https://hype-resume.com` is set in production PM2 env |
| 2 | **Missing `/public/og-image.png` & `/public/icon.png`** | `frontend/lib/seo.ts:21`, `app/layout.tsx:42` | Create crisp `1200x630` dark-obsidian OpenGraph social preview card (`/og-image.png`) and `/icon.png` so every shared LinkedIn/X/WhatsApp link renders a rich preview instead of a 404 image |
| 3 | **Client `/tools/*` Pages Lack Route Metadata** | `app/tools/resume-checker/page.tsx`, `job-match/page.tsx`, `bullet-improver/page.tsx` (`'use client'`) | Wrap interactive client components inside thin Server Component `page.tsx` files (matching `/tools/resume-score/page.tsx`) exporting unique `<title>`, `<meta description>`, canonical URL, JSON-LD `SoftwareApplication`/`FAQPage` schema! |
| 4 | **`/admin` Not Disallowed in `robots.ts`** | `frontend/app/robots.ts` | Add `'/admin/'` and `'/app/settings'` to `disallow` |
| 5 | **Broken `?discipline=` Deep-Links** | `SampleLibraryView.tsx:38` ignores `?discipline=` from homepage cards | Initialize `selectedCategory` from `useSearchParams()` and support SEO-friendly slug routes |
| 6 | **Thin JSON-LD Schema (`seo.ts`)** | `frontend/lib/seo.ts` | Add `FAQPage` JSON-LD on `/tools/*` and `/examples/[role]`, and `HowTo` schema on resume-check / Jake-template guides to capture Google Rich Snippets |

---

## 2. How Competitors Win SEO — And Where HyperResume Can Outrank Them in India

Competitor analysis (`COMPETITOR_ANALYSIS.md`) confirms that Zety, Enhancv, Teal, and Kickresume capture millions of visits via three pillars:
1. **Free Interactive Tools** (high backlinks + immediate product trial) — **HyperResume ALREADY has 4 stronger tools (`resume-checker`, `job-match`, `bullet-improver`, `resume-score`)!**
2. **Programmatic Company/Role Examples** — **HyperResume ALREADY has 82 curated samples across 78 companies (`Google`, `Stripe`, `Meta`, `OpenAI`, `India`), but currently bundles all 82 into ONE single `/examples` JS SPA page instead of 82+ indexable URLs!**
3. **BoFU "Alternative / Comparison" Pages** — Untapped opportunity to intercept users actively frustrated by Zety/Resume.io/Jobscan paywalls.

**Winning Strategic Wedge:** Instead of fighting Zety globally on head keyword `"resume builder"` (KD 90+), dominate **India + Developer + Anti-Paywall Long-Tail Intent** first!

---

## 3. Priority Keyword Clusters & Content Architecture

### Cluster A: Product-Led Utility Tools (`Highest Conversion Intent`)
| Target URL | Primary Keywords (India + Developer Focus) | Conversion CTA |
| :--- | :--- | :--- |
| `/tools/resume-checker` | `free ats resume checker india`, `check resume ats score free no signup`, `canva resume ats test` | Free 5-dim scan -> `"Fix Issues & Export Clean Jake's PDF"` (`/register`) |
| `/tools/job-match` | `resume job description match checker free`, `ats keyword gap scanner free`, `check resume against jd` | Evidence-quoted gap analysis -> `"Tailor This Resume in 1 Click"` (`/register`) |
| `/tools/bullet-improver` | `ai resume bullet point improver`, `xyz star resume bullet generator software engineer` | Live bullet rewrite -> `"Check Full Resume Metrics"` (`/register`) |
| **NEW `/tools/linkedin-headline-checker`** *(Phase 2)* | `linkedin headline generator software engineer india`, `linkedin about fold preview 265 chars` | Expose existing deterministic `evaluateLinkedInProfileScore` fold & headline checker publicly -> `/app/linkedin` |
| **NEW `/tools/resume-pdf-compressor`** *(Phase 2)* | `compress resume pdf under 2mb 10mb keep text selectable` | Expose existing `PdfCompressionService` cleanly (once `/compress` binary download bug is fixed!) — high utility in Indian portals (`Naukri`/`Superset` upload limits!) |

### Cluster B: Programmatic Company & Role Pages (`Turning 82 Samples into 82+ Searchable Pages`)
Right now, all 82 resumes in `frontend/data/sample-resumes.ts` sit behind a modal on `/examples`. Converting them into static/ISR SEO pages multiplies indexable surface cleanly without thin AI spam:
* **Route Pattern 1 (Role Guides — Expand existing 6 to 20):** Add `/examples/data-engineer`, `/examples/data-scientist`, `/examples/ml-ai-engineer`, `/examples/product-manager`, `/examples/qa-automation-engineer`, `/examples/java-spring-boot-developer`, `/examples/mern-stack-developer`, `/examples/cloud-engineer-aws`, `/examples/cybersecurity-analyst`, `/examples/python-developer`, `/examples/react-developer`, `/examples/sde-intern`, `/examples/business-analyst`, `/examples/ui-ux-designer`.
* **Route Pattern 2 (Programmatic Sample Pages — 82 High-Quality Pages):** `/examples/sample/[slug]` (e.g., `/examples/sample/google-senior-software-engineer-resume`, `/examples/sample/stripe-backend-engineer-resume`, `/examples/sample/india-sde-fresher-resume`). Each page renders:
  * Real ATS-annotated HTML preview (fully indexable text, NOT images!)
  * Why those bullets score high (`Metrics`, `Action Verbs`, `Tech Stack Alignment`)
  * Primary button: **`"Adapt This Benchmark to My Real Experience"`** -> `/app/samples?adapt=<id>`
* **Route Pattern 3 (India Developer Template Pages):**
  * `/templates/jakes-resume-online` -> `"Jake's Resume Overleaf Alternative (No LaTeX Needed + Live JD Match)"`
  * `/templates/deedy-cv-online` -> `"Deedy Resume Builder Online — Free PDF & DOCX Export"`
  * `/templates/awesome-cv-builder` -> `"Awesome CV Template Online — Clean Export"`

### Cluster C: Bottom-of-Funnel (BoFU) Competitor Comparison Pages (`/compare/*` or `/blog/*`)
Target buyers literally searching for alternatives after hitting competitor paywalls or high prices:
1. `/compare/zety-and-resume-io-alternative-india` — *"Tired of `.txt`-Only Exports & Auto-Renew Trials? A Truly Free PDF/DOCX Resume Builder"*
2. `/compare/jobscan-alternative-evidence-based` — *"Jobscan vs HyperResume: Why Evidence Quotes Beat Keyword-Stuffing Scores (at 1/10th the Cost)"*
3. `/compare/overleaf-jakes-resume-vs-hyperresume` — *"Overleaf Jake's Resume vs HyperResume: Keep the Exact Recruiter Format, Skip LaTeX Syntax Errors"*
4. `/compare/flowcv-and-reactive-resume-alternative` — *"Love FlowCV/Reactive Resume? Here's When You Need JD Matching, LinkedIn Audit & Mock Interviews"*
5. `/compare/chatgpt-prompts-vs-evidence-grounded-ai` — *"Why Copy-Pasting From ChatGPT Gets Developers Caught in Interviews (Hallucinated Metrics vs Verified Bullets)"*

### Cluster D: High-Intent India Editorial Blog Silo (`/blog/*`)
Publish 2 deeply researched, code-backed engineering/career articles per week for 4 weeks (first 3 articles drafted/outlined in [`CONTENT_STRATEGY.md`](./CONTENT_STRATEGY.md)):
1. *"Workday vs Greenhouse vs Lever: How Actual ATS Parsers Read Your Resume (2026 Engineering Breakdown)"*
2. *"Notice Period, Legacy Stack, No Metrics: How Indian Service-Company Developers Switch to Product/GCC Roles Without Lying on Their CV"*
3. *"Stop Listing React & AWS in Skills Only: Why Recruiters Reject Uncorroborated Resumes"*
4. *"How to Convert Your LinkedIn Export PDF into an ATS-Safe Resume + Fix Your 265-Character Fold Hook"*
5. *"Canva Resumes vs Jake's Resume: We Ran Both Through Raw PDF Text Extraction (`pdf-parse`) — Here Is What Broke"*

---

## 4. Internal Linking Blueprint (`Hub & Spoke`)

* Every `/blog/*`, `/compare/*`, and `/examples/[role]` article embeds an inline contextual **Widget CTA Box**:
  * Writing quality article -> embeds `"Paste 1 bullet to test our Anti-Hallucination Rewriter"` (`/tools/bullet-improver`)
  * ATS parsing article -> embeds `"Check if Workday/Greenhouse can extract text from your PDF cleanly"` (`/tools/resume-checker`)
  * JD tailoring article -> embeds `"Compare your resume against any JD cleanly"` (`/tools/job-match`)
* All `/tools/*` result screens include two seamless next steps:
  1. Primary: `"Save & Fix Issues in Free Editor (5 Welcome Credits)"` -> `/register?from=checker`
  2. Secondary: `"Run Job Match on This Resume"` -> `/tools/job-match`

---

## 5. Backlink & Authority Plan (Zero Spam)

1. **Free Interactive Tool Sharing on Developer/Placement Communities:** Tools without login gates naturally earn bookmarks and citations in Notion placement trackers, GitHub `awesome-fresher-jobs` repos, and college placement WhatsApp/Telegram wikis.
2. **Original Data Study (Month 2):** Publish an anonymized aggregated study using `/tools/resume-checker` patterns: *"We Audited 1,000+ Indian Tech Fresher Resumes: The Top 5 Formatting & Unreferenced Skill Mistakes"* — pitch to Indian tech newsletters, Substack engineering writers, and LinkedIn career creators for organic backlinks.
3. **Engineering Deep-Dive Posts:** Cross-post abridged versions on **Dev.to, Hashnode, Medium** with canonical URL pointed cleanly back to `https://hype-resume.com/blog/...`.
