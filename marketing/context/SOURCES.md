# HyperResume — Verified Sources & Limitations Index

**Last Updated:** 2026-11-12  
**Policy:** Strict separation between directly verified internal code/web sources and unverified/blocked items. No secrets, API keys, database dumps, or private server details are cited.

---

## 1. Internal Codebase & Verification Sources (Updated 2026-11-12)

- **Foundational Project & Strategy Docs:**
  - `README.md`, `package.json`
  - `docs/HYPERRESUME_CONTEXT.md`, `docs/HYPERRESUME_PRODUCT_STRATEGY.md`, `docs/AI_MOCK_INTERVIEW_STUDIO.md`
  - `assets/logos/*`, `assets/social-media-assets/*`
- **Backend (`backend/src/`, verified 2026-11-12 via `npm run typecheck`, `npm run build`, `vitest run` — 29 files / 166 tests passing, plus Dodo `test_mode` smoke check):**
  - `main.ts`, `app.module.ts`, `config/env.validation.ts`, database migration `AddProEntitlementsAndAnalytics1728864000007`
  - `auth/auth.controller.ts`, `auth.service.ts`, `dto/google-auth.dto.ts`; `users/entities/user.entity.ts`, `users.service.ts`
  - `ai/ai.service.ts`, `ai.controller.ts`, `config/ai-model-pricing.ts`, `providers/gemini-ai.provider.ts`, `providers/mock-ai.provider.ts`, `utils/factual-integrity-validator.ts`, `utils/ats-audit-engine.ts`, `utils/writing-quality-rules.ts`, `utils/context-dossier-builder.ts`, `utils/prompt-sanitizer.ts`, `utils/linkedin-optimizer.util.ts`, `utils/section-rewriter.util.ts`
  - `analytics/analytics.module.ts`, `analytics.controller.ts`, `analytics.service.ts`, `entities/analytics-event.entity.ts`
  - `resumes/resumes.controller.ts`, `resumes.service.ts`, `pdf-export.service.ts`, `docx-export.service.ts`, `resume-shares.service.ts`, `public-resume-shares.controller.ts`
  - `resume-parsing/resume-parsing.controller.ts`, `resume-parser.service.ts`, `pdf-compression.service.ts`, `linkedin-pdf-parser.util.ts`
  - `jobs/jobs.controller.ts`; `job-matching/job-matching.controller.ts`, `job-matching.service.ts`
  - `job-discovery/job-discovery.controller.ts`, `job-discovery.service.ts`, `job-discovery-providers.util.ts`
  - `applications/applications.controller.ts`, `applications.service.ts`
  - `interviews/interviews.controller.ts`, `interviews.service.ts`, `ai/providers/gemini-interview.provider.ts`
  - `cover-letters/cover-letters.controller.ts`, `cover-letters.service.ts`
  - `linkedin/linkedin.controller.ts`, `linkedin.service.ts`, `linkedin-scoring.util.ts`
  - `credits/credits.service.ts`, `entities/credit-ledger.entity.ts`
  - `payments/pricing-plans.ts`, `payments.controller.ts`, `payments.service.ts`, `meta-conversions.service.ts`, `providers/dodo-payment.provider.ts`, `providers/razorpay-payment.provider.ts`, `providers/sandbox-payment.provider.ts`
  - `admin/admin.controller.ts`, `admin.service.ts`, `guards/admin.guard.ts`, `entities/system-setting.entity.ts`
- **Frontend (`frontend/`, verified 2026-11-12 via `bun test` — 17 files / 85 tests passing, `tsc --noEmit`, `next build` — 47/47 static routes):**
  - `app/layout.tsx`, `app/page.tsx`, `app/sitemap.ts`, `app/robots.ts`, `next.config.ts`, `lib/seo.ts`, `lib/analytics.ts`, `lib/api-client.ts`, `lib/auth-context.tsx`
  - `public/icon.png`, `public/og-image.png`
  - `components/layout/Navbar.tsx`, `Footer.tsx`, `components/ui/Logo.tsx`, `components/analytics/MetaPixel.tsx`, `components/marketing/FoundingSalesBanner.tsx`
  - `components/home/*` (`InteractiveHeroStudio.tsx`, `CompanyLogoCloud.tsx`, `AtsCompatibilityCloud.tsx`, `AtsCompatibilitySection.tsx`, `ProductWorkflowStorytelling.tsx`, `InteractiveTemplateShowcase.tsx`, `SampleLibraryShowcase.tsx`, `ApplicationPipelineWorkspace.tsx`, `CredibilityAndTrustSection.tsx`, `PricingSection.tsx`, `FaqAndFinalCta.tsx`)
  - `app/pricing/PricingClient.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/security/page.tsx`
  - `app/(auth)/login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`
  - `app/tools/resume-checker/page.tsx`, `resume-score/*`, `job-match/page.tsx`, `bullet-improver/page.tsx`
  - `app/examples/*`, `data/sample-resumes.ts`, `components/samples/*`
  - `app/app/layout.tsx`, `app/app/page.tsx`, `resumes/*`, `components/resumes/*`, `app/r/[slug]/page.tsx`, `app/r/[slug]/layout.tsx`
  - `app/app/match/page.tsx`, `applications/page.tsx`, `cover-letters/page.tsx`, `linkedin/page.tsx`, `job-search/page.tsx`, `interview/*`, `settings/page.tsx`, `app/admin/*`

---

## 2. External Competitor & Market Research Sources (`search_web` 2026-11-11)

Note: Google Search grounding returns summary citations across official competitor pages, software review aggregators, and community threads. Direct checkout promos vary by geo/date.

- **Competitor Pricing, Features & Positioning:**
  - Official domains: `enhancv.com` (`/pricing`), `rezi.ai` (`/pricing`, Creator & Affiliate docs), `tealhq.com` (`/pricing`), `resume.io`, `kickresume.com` (`/en/pricing`), `jobscan.co` (`/pricing`, Match Rate, Affiliate), `zety.com`, `resumod.co`, `hiration.com`, `resumeworded.com`, `flowcv.com`, `rxresu.me` (Reactive Resume), `careerflow.ai`, `jobright.ai`, `simplify.jobs`, `naukri.com` (FastForward).
  - Independent pricing/feature teardowns referenced via search grounding: `fastapply.co`, `loopcv.pro`, `resumegenius.com`, `careerkit.me`, `jobsaicopilot.com`, `owlapply.com`, `resufit.com`, `scale.jobs`, `hrlens.io`, `bossed.ai`, `finalroundai.com`.
- **User Reviews & Sentiment:**
  - `trustpilot.com` (Enhancv ~4.5–4.6/5 across >1,000 reviews; Rezi ~4.5/5 across ~270+; Teal ~4.2/5 across ~120; Resume.io ~4.0–4.2/5 across >55,000; Kickresume ~4.6–4.7/5 across ~3,600+; Jobscan ~4.3–4.5/5 across ~340+; Zety ~4.2–4.3/5 across >12,000+; Hiration ~4.6/5; Resume Worded ~4.8/5; Jobright ~4.8/5).
  - `g2.com`, `producthunt.com`, `reddit.com` (`r/developersIndia`, `r/IndianWorkplace`, `r/FresherTechJobsIndia`, `r/resumes`, `r/jobs`, `r/jobsearchhacks`, `r/ResumeTips`), `quora.com`, `linkedin.com`.
- **India Hiring & Market Sizing:**
  - Market valuation & user mix: `wiseguyreports.com`, `coherentmarketinsights.com`, `researchandmarkets.com`, `businessresearchinsights.com`, `virtuemarketresearch.com`.
  - India 2025–2026 fresher/GCC/employability tracking: `indiatoday.in`, `prepnplaced.com`, `businesstoday.in`, `getwork.org`, `acengage.com`, `hiredoor.in` (citing PrepNPlaced, Xpheno, India Skills Report, Mercer-Mettl).
- **ATS Parsing & Myths:**
  - `simplify.jobs`, `atsverification.com`, `stylingcv.com`, `profileops.com`, `reddit.com` discussions on Workday/Greenhouse/Lever/Taleo parsing.
- **Ad Creative Literature (Secondary / Non-Ad-Library):**
  - `neilpatel.com`, `sprites.ai`, `cameldigital.co`, `ridgemarketing.com`, `influee.co`, `adenslab.com`, `cropink.com`, `adlibrary.com`, `appsumo.com`, `adds`/`get-ryze.ai`.

---

## 3. Live Meta Ads Library & Ad Benchmark Sources (Updated 2026-11-12)

1. **Meta Ads Library Live Chrome Inspection (`https://www.facebook.com/ads/library/`, 2026-11-11 via `browser` subagent `8fea4456` + founder screenshots):**
   - Direct observation of `Enhancv` (`view_all_page_id=714646511930591`: `IN ~15`, `US ~120`, `ALL ~420`, EU transparency reach `2,676,918` on `934395276322344`), `Resume.io` (`~32 ALL`, `0 IN`), `Rezi.ai` (`~29 ALL`, `0 IN/US`), `Teal` (`948704620831791`), `Chiku AI` (`IN` `176d`), `JobPrep India` (`IN` `126d`), `GoResume.io`, `Naukri360`, `Squarelay`, `doredojon0`, `Prepfree`, `Cv Maker`, `resumod` (`0 IN`).
   - Verified `search_web` 2025–2026 regional B2C Meta CPM/CPC benchmark sources (India `$1.50–$4.00` CPM / `$0.20–$0.65` CPC; UAE `$7–$12` CPM; Singapore `$7–$10.50` CPM; US `$16–$24+` CPM) used as pre-spend directional guardrails alongside OpenRouter Models API (`https://openrouter.ai/api/v1/images/models` for `bytedance-seed/seedream-5-0-flash`).
2. **Current Unblocked/Open Gaps:**
   - Official Facebook Page ID lookups for `Jobscan (@jobscanco)`, `Kickresume`, `Zety`, and `TealHQ` were deferred at session wrap and remain open if deeper US-creative teardown is needed later.
   - OpenRouter image rendering in `marketing/generations/` awaits swapping the `.env` Provisioning Key (`is_provisioning_key: true`) with an Inference API Key.
   - Real Analytics & Dodo Live Settlement: Synthetic `/admin` stats were replaced with `AnalyticsModule` + Meta Pixel/CAPI on 2026-11-12; conversion rate and CPA KPIs remain launch hypotheses until production `₹200/day` traffic accumulates.
