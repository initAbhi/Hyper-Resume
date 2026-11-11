# Master Marketing & Growth Strategy — HyperResume / HypeResume

> **Last Updated:** November 12, 2026  
> **Stage:** Pre-Launch Ready (All Week-1 P0 security, pricing, watermark, attribution & USD checkout blockers shipped in code; pre-spend ops check & live webhook test remaining).  
> **Primary Initial Market:** India Software Engineers, Tech Freshers & Active Career Switchers + Immediate USD Global Self-Serve Unlocked.

---

## 1. Strategic Diagnosis: Where We Stand Today

HypeResume now pairs **10 integrated career modules with clean monetization, real attribution, and zero-dark-pattern positioning** (`Free Starter: 5 welcome credits + unwatermarked exports` -> `HypeResume Pro: ₹149/$3 1-Week Pass, ₹399/$9 Monthly, ₹1,200/$29 6-Month, ₹999/$19 Founding Lifetime`).

**Core Principle:** **Code & checkout leaks are repaired (Phase 0 complete); now ignite organic PLG & Founding Lifetime cohort outreach (`first 10 ₹999 / $19 seats`, Phase 1: Days 1–21), then launch tightly gated Meta CAPI + Google Search tests (Phase 2: Days 22–60) and Global Product Hunt + Campus B2B2C scale (Phase 3: Days 61–90).**

---

## 2. Phase 0: Engineering & Funnel Foundations — COMPLETED IN CODE (2026-11-12)

All P0 & P1 blockers from the Nov 11 audit have been remediated and verified in code:

### P0 — Security & Revenue Protection (`DONE`)
1. **`POST /api/v1/payments/verify` Hardened:** Enforces authoritative Dodo gateway status verification before granting Pro access; Razorpay fails closed; webhook HMAC verification strips static test bypasses and embedded fallback keys. *(Founder task: rotate older git-history keys before public push.)*
2. **Unified Global + India Entitlements (`CreditsService.hasActivePro` / `consumeFeatureAccess`):** Supports active Pro expiry (`pro_weekly` 7d, `pro_monthly` 30d, `pro_6month` 180d, `pro_lifetime` permanent) + atomic refunds across AI tailoring, Cover Letters, LinkedIn Studio, Job Match, PDF compression, and Mock Interviews.
3. **`ApplicationsService` IDOR Fixed & `PricingClient.tsx` Return Receipts Verified:** Reports actual settled plan, amount (`INR`/`USD`), and fires Meta Pixel `Purchase` (`eventID = orderId`) + server CAPI (`clientIp`/`clientUserAgent`).

### P1 — Conversion, Unified Pricing & Trust Fixes (`DONE`)
1. **Brand, SEO & UI Cleanups:** Standardized UI/modals/admin on `HypeResume`, shipped `/public/icon.png` & `/og-image.png`, fixed `SITE_URL` (`https://hype-resume.com`), disallowed `/admin` & `/r/` in `robots.ts` (`noindex` on `/r/[slug]`), fixed light-mode Navbar contrast, added GDPR Delete Account + Change Password in `/app/settings`.
2. **Conversion Routing & Watermark Removal:** Routed Hero & Navbar `"Get Started"` to `/register`; preserved `?redirect=`, `?plan=`, `?currency=`, `?template=`; fixed `/app/resumes/new` 404; removed footer watermarks from `DoubleColumnTemplate.tsx` & `SidebarTemplate.tsx`; exposed all 10 templates + `certifications` tab in editor.
3. **Unified Single-Plan Pro Model + Real DB Promo Banner (`pricing-plans.ts`, `PricingSection.tsx`, `PricingClient.tsx`, `FoundingSalesBanner.tsx`):**
   * **Free Starter (`₹0` / `$0`):** `5` Welcome AI Credits, all `10` templates, unlimited unwatermarked PDF & OOXML DOCX export, unlimited public `/tools/*` checks, Job Tracker, Job Discovery, `/r/[slug]` share links.
   * **1 Week Pass (`pro_weekly` — `₹149` / `$3`):** Low-friction 7-day unlimited Pro sprint for immediate interview weeks or fresher application pushes.
   * **Monthly (`pro_monthly` — `₹399` / `$9`):** Full 30-day unlimited Pro switch companion.
   * **6 Months (`pro_6month` — `₹1,200` / `$29`):** Full 180-day campaign (`₹200/mo` effective) with zero auto-renewal.
   * **Founding Lifetime Launch Offer (`pro_lifetime` — `₹999` / `$19`):** Limited launch validation offer backed by real PostgreSQL `claimedSeats` vs admin-editable `totalCap` (`default: 10`, `/admin/settings`).

---

## 3. Channel Strategy & Allocation (Zero-Waste SaaS Growth Model)

| Rank | Channel | Role in Funnel | Why Right for HyperResume Now | Target Personas |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Product-Led SEO (`/tools/*`, `/examples/*`, `/compare/*`)** | Bottom/Mid-funnel compounding acquisition | Already has 4 zero-login live tools & 82 company resumes; captures active intent (`"ATS resume checker free India"`, `"Jake's resume builder"`) with zero ongoing ad spend | Aarav (P1), Rohan (P2), Ananya (P4) |
| **2** | **LinkedIn Organic (Founder + Carousel Teardowns + Micro-Creators)** | High-trust awareness + Mid-level SWE demand | Indian tech switchers (`Rohan`) & career switchers (`Ananya`) live on LinkedIn during job searches; visual Before/After resume teardowns & `265`-char LinkedIn fold audits earn organic reposts | Rohan (P2), Ananya (P4), Aarav (P1) |
| **3** | **Developer Communities & X (`r/developersIndia`, X Tech, Discord/Telegram)** | Credibility & word-of-mouth referrals | Honest build-in-public + anti-dark-pattern positioning + real Greenhouse/Ashby parser benchmarks resonate deeply when delivered without spam | Aarav (P1), Rohan (P2) |
| **4** | **Short-Form Video & Student Tech Creators (Instagram Reels / YT Shorts)** | Top-of-funnel scale & creator affiliate loop | `15–30s` "Overleaf LaTeX vs Instant Jake's Resume + Mock Interview" demos convert off-campus CS freshers cheaply via creator affiliate codes (Rezi Creator playbook localized to India!) | Aarav (P1), Ananya (P4) |
| **5** | **Gated Google Search & Meta Ads (Post Key-Rotation & Live Webhook Check)** | Predictable paid scale once unit economics work | High-intent Search captures immediate buyers; Meta Retargeting recovers `/tools/*` visitors (`ViewContent` / `Lead` -> `₹149` 1-Week Pass or `₹999` Founding Lifetime), across both India (`INR`) & Global (`USD`) | All India & Global Personas |
| **6** | **Recruiter Share Link Viral Loop (`/r/[slug]`) + Referral Credits** | Zero-CAC organic K-factor | Subtle optional footer attribution on *public shared web links `/r/[slug]`* (never inside PDF downloads!) + *"Give 3 Credits, Get 3 Credits"* post-export share card | All Personas |

---

## 4. Growth Loops Designed Around Actual Product Features

1. **Loop 1 — Free Tool -> Diagnosis -> Evidence Gap -> Account (`PLG Loop`):**
   * User discovers `/tools/resume-checker` or `/tools/job-match` via Google or Reels -> gets real 5-dimension audit + unreferenced skill warning -> clicks `"Auto-Rewrite & Export Clean Jake's PDF (5 Free Credits)"` -> lands directly inside editor with parsed resume pre-loaded (`?redirect=` works smoothly!).
2. **Loop 2 — LinkedIn Studio Viral Hook:**
   * Developers export their LinkedIn PDF -> paste into HypeResume LinkedIn Studio -> see their exact **`265`-character About preview before `...see more`** and `/100` fold score -> upgrade headline & share side-by-side transformation on LinkedIn tagging the tool.
3. **Loop 3 — Live ATS Board + Track -> Mock Interview Upgrade Loop:**
   * User discovers real `Stripe` / `Linear` / `Figma` opening in `/app/job-search` -> matches resume -> hits `"Prepare for This Role (Mock Interview)"` -> exhausts 5 welcome credits -> unlocks unlimited Pro Mock Interviews + Cover Letters + Tailoring via **`₹149` 1-Week Pass**, **`₹399` Monthly**, **`₹1,200` 6-Month**, or **`₹999` Founding Lifetime**.
4. **Loop 4 — "Give 5, Get 5" Placement Cohort Referral *(Phase 2 Product Enhancement)*:**
   * Final-year CS students prepare together in hostel/Discord placement groups -> referral reward lets them earn mock interview credits without friction while halving blended CAC.

---

## 5. Phased 90-Day Expansion Roadmap Summary

* **Days 1–30 (Pre-Launch Ops Check, Founding 10 Lifetime Cohort & Organic Ignition):** Rotate git-history Dodo keys + switch live webhook on, upgrade `/examples` & `/tools` SEO metadata, launch Founder LinkedIn + X build-in-public cadence, fill first 10 Founding Lifetime seats (`₹999 / $19`), onboard 5 Indian tech micro-creators, launch 2 BoFU comparison pages. *(Detailed in [`ROADMAP.md`](./ROADMAP.md).)*
* **Days 31–60 (Paid Validation & Conversion Optimization):** Run `₹500–₹1,000/day` Google Search exact-match + Meta retargeting/cold creative tests comparing **`₹149` 1-Week Pass vs `₹999` Founding Lifetime** CPA, add `/tools/linkedin-pdf-to-resume` free lead magnet, launch `Referral Give 3 / Get 3` loop.
* **Days 61–90 (Global USD Scale, Product Hunt & Campus B2B2C):** Leverage live global USD Dodo billing (`$3` 1-wk / `$9` monthly / `$29` 6-mo / `$19` Founding Lifetime) for **Product Hunt Launch**, complete Kickresume-style verified `.edu`/student campus pack, and expand creator affiliate program (`20–25%` commission via built-in promo codes).
