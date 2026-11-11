# HyperResume — Decisions Log

**Last Updated:** 2026-11-12  
Every decision separates **Observed Facts**, **Recommendation / Decision**, and **Pending Founder Approvals**.

---

## Decision #001 — Canonical Brand Name Standardization (`HypeResume` vs `HyperResume`)
- **Date:** 2026-11-11 (UI code synced 2026-11-12)
- **Status:** **Implemented in App UI (`HypeResume`); Social Asset Re-export Pending**
- **Observed Facts:**
  - Live production domain (`https://hype-resume.com`), API domain (`https://api.hype-resume.com`), root HTML metadata (`frontend/app/layout.tsx`), `Navbar`, `Footer`, `Logo`, Twitter handle (`@HypeResumeAI`), and app modals/admin headers now consistently use **`HypeResume`**.
  - Older internal `/docs/` and draft carousel images in `assets/social-media-assets/first-post/` retain `HyperResume` strings until re-exported.
- **Outcome:** App codebase & SEO assets (`/public/og-image.png`, `/public/icon.png`) standardized on **`HypeResume` (`hype-resume.com`)**.

---

## Decision #002 — Canonical Pricing Architecture: Unified Single Plan ("HypeResume Pro") in INR & USD
- **Date:** 2026-11-11 -> **Superseding Founder Decision Applied 2026-11-12**
- **Status:** **IMPLEMENTED & VERIFIED IN CODE + DODO TEST & LIVE PRODUCTS**
- **Founder Input:** Old `₹299/₹699` and `₹399 (30 cr)/₹899 (100 cr)` packs were dummy pricing. Founder locked real single-plan launch pricing: **1 Week Pass (`₹149` / `$3`)**, **Monthly (`₹399` / `$9`)**, **6 Months (`₹1,200` / `$29`)**, plus a **Founding Lifetime Launch Offer (`₹999` / `$19`)**.
- **Implemented Architecture (`pricing-plans.ts`, `PricingSection.tsx`, `PricingClient.tsx`, `DodoPaymentProvider`):**
  - **Free Starter (`₹0` / `$0`):** `5` welcome AI credits, all `10` templates, unlimited unwatermarked PDF & OOXML DOCX exports.
  - **`pro_weekly` (1 Week Pass):** `₹149` (`14900` INR) / `$3` (`300` USD) — `7` days full Pro AI access.
  - **`pro_monthly` (Monthly Plan):** `₹399` (`39900` INR) / `$9` (`900` USD) — `30` days full Pro AI access.
  - **`pro_6month` (6 Months Plan):** `₹1,200` (`120000` INR) / `$29` (`2900` USD) — `180` days full Pro AI access (`₹200/mo` effective).
  - **`pro_lifetime` (Founding Lifetime Offer):** `₹999` (`99900` INR) / `$19` (`1900` USD) — permanent lifetime Pro access (`isLifetimePro: true`), **one-time payment, zero auto-renewal**, configured across Dodo `test_mode` and `live_mode` with multi-currency INR + USD billing enabled.

---

## Decision #003 — Lift Paid Acquisition Code Block Following P0 Engineering Remediation
- **Date:** 2026-11-11 -> **Updated 2026-11-12**
- **Status:** **Code Gate PASSED (Pre-Launch Production Webhook + Ad-Library Check Pending)**
- **Resolved in Codebase (2026-11-12):**
  - Fixed `POST /payments/verify` fail-closed Dodo gateway verification, removed hardcoded fallback keys & test signature bypasses, wired multi-currency `INR`/`USD` checkout in `test_mode` & `live_mode`.
  - Enforced server-side credit/Pro gating (`CreditsService.consumeFeatureAccess` + atomic refund on provider failure across AI endpoints, Cover Letters, LinkedIn Studio, Job Match/Tailor, Mock Interview, and 10MB PDF compressor).
  - Wired `MetaPixel.tsx` + first-party `AnalyticsModule` (`POST /analytics/event`, replacing synthetic `/admin` stats) + server webhook `Purchase` CAPI with IP/UA context.
  - Fixed `/app/resumes/new` 404, `?redirect=` & `?plan=` preservation on `/register` & `/login`, Hero/Navbar CTA routing to `/register`, light-mode `Navbar` contrast, `DoubleColumn`/`Sidebar` watermarks removed, `/tools/og-image.png` & `/icon.png` created, `robots.ts` & `/r/[slug]` `noindex` configured, and self-serve account deletion added to `/app/settings`.
- **Remaining Operational Check Before Paid Spend:** Rotate any older Dodo keys committed prior to 2026-11-12, verify `live_mode` webhook delivery on production HTTPS, and optionally run live Meta Ads Library scrape.

---

## Decision #004 — Core Positioning Wedge: Evidence-Grounded + Anti-Dark-Pattern (`India Software Devs & Freshers` First, Global USD Unlocked)
- **Date:** 2026-11-11 (Multi-currency USD unlocked 2026-11-12)
- **Status:** **Decided (Phase 5)**
- **Rationale:**
  - Competitors split between expensive recurring `$24–$50/mo` SaaS (`Enhancv`, `Jobscan`, `Teal`, `Resume Worded`), dark-pattern `.txt`/auto-renewal traps (`Zety`, `Resume.io`), or free manual design-only editors (`FlowCV`, `Reactive Resume`, `Overleaf`).
  - HypeResume pairs deterministic metric anti-hallucination (`validateAndSanitizeMetrics`), quote-backed requirement proof, free Puppeteer UTF-8 vector PDF & `.docx` exports, `Jake's Resume` layout, >10 MB compression, Live Ashby/Greenhouse/Lever boards, and Mock Interviews with accessible **`₹149` 1-week trial & `₹999` (`$19`) Founding Lifetime validation** — no sneaky auto-renewals.

---

## Decision #005 — Live Meta Ad Library Intelligence Unblocked & Completed
- **Date:** 2026-11-11 -> **Resolved 2026-11-11/12**
- **Status:** **COMPLETE (`META_ADS_INTELLIGENCE.md`)**
- **Outcome:** Founder enabled Chrome remote debugging (`127.0.0.1:9222`), and `browser` subagent `8fea4456-a4db-4613-ac73-77df6f5ad2dc` extracted live Meta Ads Library evidence across `Enhancv` (`IN ~15`, `US ~120`, `ALL ~420`), `Resume.io` (`~32 ALL`, `0 IN`), `Rezi.ai` (`~29 ALL`, `0 IN/US`), `Teal` (`948704620831791`), and India-active advertisers (`Chiku AI` 176d `₹1,199` one-time, `JobPrep India` 126d, `GoResume.io`, `Naukri360`, `Squarelay`, `doredojon0`, `Prepfree`, `resumod` `0`).

---

## Decision #006 — Real PostgreSQL-Backed Founding Lifetime Promo Cap (Replacing Synthetic Auto-Incrementing Counters)
- **Date:** 2026-11-12
- **Status:** **Implemented in Code (`FoundingSalesBanner.tsx`, `GET /payments/promo-status`, `/admin/settings`)**
- **Context:** Founder explored showing `"100 seats total with 55 already bought, incrementing automatically over 1–2 days"` on the Founding Lifetime (`₹999` / `$19`) banner to drive urgency.
- **CMO & Engineering Decision:** Implemented an **authentic PostgreSQL-backed seat counter** (`claimedSeats` = real succeeded `pro_lifetime` orders vs admin-configurable `totalCap`, defaulting to `10` seats and editable anytime via `/admin/settings`) instead of fabricated/simulated urgency counters.
- **Rationale:**
  1. Fake countdowns/invented scarcity counters trigger Meta Ads policy disapprovals ("Unrealistic Outcomes / Misleading Claims") and violate India CCPA / ASCI Guidelines for Dark Patterns (2023).
  2. HypeResume's entire brand equity (`Anti-Dark-Pattern`, `anti-hallucination`, `developer-trusted`) collapses instantly if a developer opens DevTools and discovers a fake counter.
  3. Admin controls in `/admin/settings` still give the founder full operational control (`enabled`, `totalCap` e.g. `10` or `25` or `100`, custom `bannerText`) powered strictly by real settled purchases.

---

## Decision #007 — ₹200/Day Bootstrap Paid Launch: Metro India Tech Hubs First, Adapted POV Creatives Over Blind Copying
- **Date:** 2026-11-12
- **Status:** **Decided (`PAID_ADVERTISING.md`, `CREATIVE_LIBRARY.md`)**
- **Founder Constraint:** Max initial paid budget **`₹200/day` (~`₹6,000/mo`)** aimed at securing **5 initial paying customers ASAP** before doubling budget.
- **Decision:**
  1. **Target Geography:** Run Campaign #1 strictly in **English-speaking Metro India Tech Hubs (Bengaluru, Hyderabad, Pune, Mumbai, New Delhi/Gurugram/Noida, Chennai, +25 km, Age 21–32, Language English)** — NOT `All India` (zero-WTP non-buyer drift) and NOT `US/UAE/SG` yet (`$7–$24+` CPMs starve `₹200/day` down to `0–2 clicks/day`). Live Meta Ad Library proved `Chiku AI` sells `₹1,199` one-time in India (`176 days`) while `Resume.io`/`Rezi`/`Resumod` spend ₹0 in India.
  2. **Creative Strategy:** Steal the native desk/laptop POV visual realism from Enhancv `934395276322344` (`2.67M` EU reach) / `5427053274186551` (`149d` IN), **but reject** its EU headshot 2-column layout and vague slogan; run `1 Campaign -> 1 Ad Set -> 3 Ads` (`CompleteRegistration` optimization) featuring headshot-free single-column ATS formatting, anti-ChatGPT evidence proof, and explicit `₹0 PDF / ₹149 1-Wk / ₹999 Lifetime` pricing.
  3. **Homepage Conversion Repair Shipped:** Fixed 7 remaining `/login` conversion dead-ends in `app/page.tsx` Hero, `InteractiveHeroStudio.tsx`, `ProductWorkflowStorytelling.tsx`, `ApplicationPipelineWorkspace.tsx`, & `FaqAndFinalCta.tsx` -> routed to `/register` & `/tools/resume-checker` (`tsc 0`, `bun test 85/85`, `next build 47/47`).

---

## Decision #008 — OpenRouter `bytedance-seed/seedream-5-0-flash` Generation Key Separation
- **Date:** 2026-11-12
- **Status:** **Blocked Awaiting Standard OpenRouter Inference Key (`marketing/generations/.env`)**
- **Observed Fact:** Key in `marketing/generations/.env` tested cleanly via `GET /api/v1/auth/key` (`is_management_key: true, is_provisioning_key: true`) and returns `HTTP 401: {"error":{"message":"User not found.","code":401}}` on `POST https://openrouter.ai/api/v1/images`. Batch script `generate_creatives.py` & `creative_specs.json` are staged; waiting for founder to swap in a standard OpenRouter Inference API Key (or authorize provisioning a budgeted child key) rather than unilaterally minting credentials.

---

## Open Decisions & Actions Requiring Founder Input
1. **Supply a regular OpenRouter Inference API Key** in `marketing/generations/.env` (or authorize provisioning a budgeted child key / using built-in `image-generator`) so we generate all 4 Seedream 5.0 Flash creatives (`ads/ad01–ad03`) immediately.
2. **Switch Dodo Payments `/admin/payments` from `test_mode` -> `live_mode`** (and verify 1 live `₹149` webhook settlement + rotate older historical git-history Dodo keys) before launching `₹200/day` Meta Ads.
3. **Optionally test `META_TEST_EVENT_CODE`** in `backend/.env` once to verify browser `Lead`/`CompleteRegistration`/`Purchase` + CAPI deduplication inside Meta Events Manager before turning on ad spend.
