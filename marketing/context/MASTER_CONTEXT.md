# HyperResume — Master Marketing Context (Single Source of Truth)

**Last Updated:** 2026-11-12  
**Workspace Root:** `/home/abhi-singh/Workarea/Business/Resume-builder`  
**Marketing Context Root:** `/home/abhi-singh/Workarea/Business/Resume-builder/marketing/context`  
**Founding Rules:** Read this file first before every marketing task. Distinguish verified codebase/web facts from unverified hypotheses. Never store API keys, DB credentials, or private infrastructure details here.

---

## 1. Current Project Snapshot & Progress Matrix

| Phase | Scope | Status | Key Deliverable(s) |
| --- | --- | --- | --- |
| **Phase 1: Deep Product Understanding** | Full audit of `frontend/`, `backend/src/`, `docs/`, `assets/` | **COMPLETE & SYNCED (2026-11-12)** | [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md), [`PRODUCT_ANALYSIS.md`](./PRODUCT_ANALYSIS.md) |
| **Phase 2: Competitor Intelligence** | 7 core rivals + 10 India/emerging AI tools + ChatGPT DIY | **COMPLETE (2026-11-11)** | [`COMPETITOR_ANALYSIS.md`](./COMPETITOR_ANALYSIS.md) |
| **Phase 3: Meta Ads Library Intelligence** | `https://www.facebook.com/ads/library/` live creative research (`IN`, `US`, `ALL`) | **COMPLETE (2026-11-12 Live)** | [`META_ADS_INTELLIGENCE.md`](./META_ADS_INTELLIGENCE.md) |
| **Phase 4: Market & Customer Research** | India fresher/dev job market, ATS reality, reviews, WTP, 4 Personas | **COMPLETE (2026-11-11)** | [`MARKET_RESEARCH.md`](./MARKET_RESEARCH.md), [`CUSTOMER_PERSONAS.md`](./CUSTOMER_PERSONAS.md) |
| **Phase 5: Brand Positioning & Messaging** | Canonical brand resolution, USP, 4 pillars, voice, homepage rewrites | **COMPLETE & SYNCED (2026-11-12)** | [`BRAND_POSITIONING.md`](./BRAND_POSITIONING.md) |
| **Phase 6: Growth, Content, Paid, SEO, Creatives, Metrics** | Integrated acquisition strategy + ready-to-publish copy/briefs | **COMPLETE & SYNCED (2026-11-12)** | [`MARKETING_STRATEGY.md`](./MARKETING_STRATEGY.md), [`CONTENT_STRATEGY.md`](./CONTENT_STRATEGY.md), [`PAID_ADVERTISING.md`](./PAID_ADVERTISING.md), [`SEO_STRATEGY.md`](./SEO_STRATEGY.md), [`CREATIVE_LIBRARY.md`](./CREATIVE_LIBRARY.md), [`METRICS_AND_KPIS.md`](./METRICS_AND_KPIS.md) |
| **Phase 7: Tracking, Governance & Execution Plan** | Experiment queue, decisions log, sources, 30/60/90-day roadmap | **COMPLETE & SYNCED (2026-11-12)** | [`EXPERIMENT_LOG.md`](./EXPERIMENT_LOG.md), [`DECISIONS_LOG.md`](./DECISIONS_LOG.md), [`SOURCES.md`](./SOURCES.md), [`ROADMAP.md`](./ROADMAP.md) |

---

## 2. TL;DR Executive Strategic Takeaways

1. **Product Reality & Engineering Readiness (Upgraded 2026-11-12):** HypeResume (`hype-resume.com`) ships 10 integrated modules with deterministic metric anti-hallucination (`validateAndSanitizeMetrics`), quote-backed JD matching, free Chromium vector PDF & OOXML DOCX export across all 10 templates, >10 MB lossless-text PDF compression, live **Ashby/Greenhouse/Lever** job discovery, trackable `/r/[slug]` share links, LinkedIn PDF parsing, 82 benchmark resumes, and AI Mock Interviews. **All P0–P2 security, pricing, watermark, attribution, and `/login` CTA funnel defects identified on 2026-11-11/12 have been remediated and verified (`tsc 0`, `bun test 85/85`, `next build 47/47`).**
2. **Real Unified Pricing & Global Checkout (Live in Backend + Frontend + Dodo Test & Live Modes):**
   - **Free Starter (`₹0` / `$0`):** `5` welcome AI credits, all `10` ATS templates, unlimited unwatermarked PDF/DOCX exports, and 4 no-login public `/tools/*` utilities.
   - **HypeResume Pro — 1 Plan, 4 Flexible One-Time Options (INR + USD via Dodo Payments):**
     - **1 Week Pass (`pro_weekly`):** `₹149` / `$3` (`7 days` full Pro access)
     - **Monthly (`pro_monthly`):** `₹399` / `$9` (`30 days` full Pro access)
     - **6 Months (`pro_6month`):** `₹1,200` / `$29` (`180 days` full Pro access — `₹200/mo`)
     - **Founding Lifetime Launch Offer (`pro_lifetime`):** `₹999` / `$19` (permanent Pro lifetime access, gated by real PostgreSQL-backed seat cap in `GET /api/v1/payments/promo-status`, default `10` seats configurable in `/admin/settings`).
3. **Live Meta Ad Library & Bootstrap `₹200/day` Launch Wedge (`META_ADS_INTELLIGENCE.md`, `PAID_ADVERTISING.md`):**
   - Live Ad Library inspection (`2026-11-11`) proved global SaaS rivals (`Resume.io`, `Rezi`, `Resumod`) run **0 active India ads**, while India's **`Chiku AI` (`₹1,199` one-time)** has run **176 days** on static anti-subscription creatives and Enhancv's `156-day` ad (`934395276322344`) generated **`2.67M` EU reach** using native desk-POV realism (`5427053274186551` in India).
   - **Initial Paid Blueprint:** Start at **`₹200/day`** targeting **English-speaking Metro India Tech Hubs (Age 21–32)** (`1 Campaign -> 1 Ad Set -> 3 Ads`, `CompleteRegistration` optimization) to win our **first 5 paying customers** profitably before doubling to `₹400/day` and expanding to `UAE + Singapore` (`USD`).
4. **Pending Pre-Spend Actions:** Swap OpenRouter Provisioning Key in `marketing/generations/.env` for an Inference API Key to render our 4 staged `bytedance-seed/seedream-5-0-flash` ad creatives (`generate_creatives.py`), rotate old Dodo keys, and toggle `/admin/payments` to `live_mode`.

---

## 3. Exact Next Actions to Pick Up From Here

1. **Generate Staged Seedream 5.0 Flash Ad Creatives (`CREATIVE_LIBRARY.md`):**
   - Replace Provisioning Key in `marketing/generations/.env` with an OpenRouter Inference API Key (or authorize child key creation) and execute `generate_creatives.py` for `ad01_feed`, `ad01_story`, `ad02_laptop`, `ad03_antipaywall`.
2. **Pre-Launch Payment Ops (`DECISIONS_LOG.md`):**
   - Rotate older Dodo Payments keys previously present in prior git commits, flip `/admin/payments` to `live_mode`, and verify 1 live `₹149` checkout + webhook + CAPI delivery on production.
3. **Launch `₹200/day` Metro India Meta Campaign + Founding Outreach (`PAID_ADVERTISING.md`, `ROADMAP.md`):**
   - Deploy `1 Campaign -> 1 Ad Set -> 3 Ads` inside Meta Ads Manager (no Instagram Boost, no Audience Network), monitor 72h CTR/CPC & Day-7 `CompleteRegistration`, and convert initial buyers toward the 5-customer validation milestone alongside LinkedIn/X founder posts and `/tools/*` SEO upgrades.
