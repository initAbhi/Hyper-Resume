# Metrics, KPIs & Analytics Instrumentation — HyperResume / HypeResume

> **Last Updated:** November 12, 2026  
> **Current Instrumentation Status:** `CODE WIRED (ZERO HISTORICAL TRAFFIC YET)` — Synthetic Admin Overview fallbacks removed; replaced with PostgreSQL `AnalyticsModule` (`POST /analytics/event`) + env-driven Meta Pixel + CAPI v21.0 (`clientIp`/`clientUserAgent`).

---

## 1. Telemetry Implementation Status (Updated 2026-11-12)

The critical telemetry defects from the Nov 11 audit have been fixed in code:

| Telemetry Area | Remediation Shipped (2026-11-12) | Current Status |
| :--- | :--- | :--- |
| **Admin Overview Telemetry** (`backend/src/analytics/`, `admin.service.ts`, `app/admin/page.tsx`) | Removed hardcoded `45,687` visitors, `128,450` views, fake percentages, and synthetic fallbacks; queries real PostgreSQL `analytics_events` + real Dodo/user DB counts. | **LIVE IN CODE** |
| **Meta Pixel Client Events** (`components/analytics/MetaPixel.tsx`, `lib/analytics.ts`) | Replaced hardcoded Pixel ID with `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`; wired `PageView`, `Lead` (`analysis_completed`), `CompleteRegistration` (`signup_completed`), `InitiateCheckout` (`checkout_started`), and deduplicated `Purchase` (`eventID = orderId`) + dual first-party `POST /analytics/event`. | **LIVE IN CODE** |
| **Meta CAPI Enrichment** (`meta-conversions.service.ts`, `PricingClient.tsx`) | Passes real request `clientIp` & `clientUserAgent` to CAPI v21.0; `PricingClient.tsx` reports real verified `amountMinor / 100` & currency (`INR` or `USD`). | **LIVE IN CODE** |
| **Founding Lifetime Promo Telemetry** (`payments.service.ts`) | `GET /api/v1/payments/promo-status` reports real succeeded `pro_lifetime` order counts vs admin-configurable `totalCap`. | **LIVE IN CODE** |

---

## 2. True North Star & AARRR Funnel KPIs

**North Star Metric (Product Value Delivered):**  
**Weekly Evidence-Verified Resumes Tailored or Mock Interviews Completed** *(Measures real job-search progress, not vanity signups or empty exports.)*

### Full Funnel KPI Framework

| Stage | Metric | Definition / Formula | Initial Benchmark Target *(Hypothesis — Validate in Month 1)* |
| :--- | :--- | :--- | :--- |
| **Acquisition** | Qualified Organic + Social Visitors / Week | Unique visitors to `/`, `/tools/*`, `/examples/*` | `1,500+ / wk` by Day 30 (organic-led) |
| **Acquisition** | Free Tool Engagement Rate | `% of /tools/* visitors submitting a real audit, JD match, or bullet rewrite` | `>= 35%` |
| **Activation** | Tool-to-Signup Conversion (`CTA Fix Required First`) | `Registered Users / Unique Free Tool + Homepage Visitors` | `>= 8–12%` from `/tools/*`; `>= 5%` overall |
| **Activation** | Time-to-First-Value (TTFV) & Resume Export Rate | `% of new signups creating/importing a resume + exporting PDF/DOCX within 24h` | `>= 50%` |
| **Engagement** | Core Feature Depth | `% of active users using >=2 modules (e.g., Builder + Job Match OR Mock Interview)` | `>= 30%` |
| **Revenue** | Free-to-Paid Pro Conversion (`India & Global`) | `Unique Paying Buyers / New Signups (14-day cohort)` | `4% – 8%` *(aided by low-friction `₹149/$3` 1-Week Pass & `₹999/$19` Founding Lifetime anchor)* |
| **Revenue** | ARPPU & Tier Mix | `Gross Verified Revenue / Paying Users` | `₹450 – ₹650` India blended (`$9–$19` global blend) across 1-Wk / Monthly / 6-Mo / Lifetime |
| **Unit Economics** | Blended & Paid CAC (`India`) | `Total Paid Ad Spend / New Paid Buyers` | `< ₹300` (Payback on Day 1 from ₹399/₹999/₹1,200 plans; rapid LTV uplift from 1-Wk -> Monthly/6-Mo upgraders) |
| **Unit Economics** | AI Token Gross Margin per Pro Pass | `(Net Revenue - Gateway Fee - Actual Gemini Token Cost) / Net Revenue` | `>= 85%` (using Gemini 3.1/3.5 Flash-Lite `$0.25–$0.30` in / `$2.00–$2.50` out per 1M tokens) |
| **Retention / Referral** | 30-Day Active Switch Return + Share Link K-Factor | `% returning for 2nd JD match/interview + signups via `/r/[slug]` or referral links` | `>= 25%` 30-day job-hunt return; `>= 10%` referred signups |

---

## 3. AI Unit Economics Verification (Grounded in `ai-model-pricing.ts`)

Using verified `AI_MODEL_PRICING_REGISTRY` rates (`gemini-3.1-flash-lite`: `$0.25` input / `$2.00` output per 1M tokens; `gemini-3.5-flash-lite`: `$0.30` / `$2.50`; ₹85/USD):
* **Approximate Token Cost per Heavy Tailoring/Adaptation (`3,000 in / 1,500 out`):**
  * Input `0.003 * $0.25 = $0.00075`; Output `0.0015 * $2.00 = $0.0030` -> **~`$0.00375` (~`₹0.32` per AI action!)**
* **Approximate Cost per 5-Turn Full Mock Interview (`gemini-3.5-flash-lite`, ~10 turns/scoring calls total):**
  * ~`₹1.5 – ₹3.5` total LLM cost! Even under **unlimited HypeResume Pro**, an active `pro_weekly` (`₹149`) or `pro_monthly` (`₹399`) job seeker running 20–30 AI tailorings + 3–4 full mock interviews costs ~`₹15–₹25` in tokens (>80–90% software gross margin).
* **Fair Metering Protection (Enforced 2026-11-12):** Free users (`5` welcome credits) can no longer bypass credit charges on zero-balance `job-matches`, `cover-letters`, `linkedin`, or `/ai/*` endpoints (`CreditsService.consumeFeatureAccess`), preserving clean upgrade motivation toward `₹149` (1-Week) or `₹999` (Founding Lifetime).

---

## 4. Reporting Cadence (Live Ready)
* **Daily Automated Sanity Check:** New signups, `/tools/*` scans, `Dodo` verified purchases across `INR` & `USD`, `FoundingSalesBanner` remaining seats (`GET /payments/promo-status`), Gemini 4xx/5xx fallback rate (`AiService`).
* **Weekly Growth Review (Every Monday):** Cohort Funnel (`Visit -> Tool Scan -> Register -> First Export -> Welcome Credits Exhausted -> Pro Upgrade`), Channel CAC vs Paid Signups (`pro_weekly` vs `pro_monthly` vs `pro_6month` vs `pro_lifetime`), SEO impressions/clicks in Google Search Console, Creative CTR/CPA leaderboard.
