# Paid Advertising Strategy — HyperResume / HypeResume

> **Last Updated:** November 12, 2026  
> **Active Launch Budget Constraint:** **Max `₹200/day` (`~₹6,000/month`, `~$2.35/day`)** — bootstrap validation budget aimed strictly at getting the **first 5 paying customers profitably** before doubling to `₹400/day`.  
> **Code & Tracking Readiness:** `CODE COMPLETE (2026-11-12)` — Pixel (`NEXT_PUBLIC_FACEBOOK_PIXEL_ID` set), server CAPI v21.0 (`META_CONVERSIONS_API_TOKEN` + IP/UA set), real INR/USD checkout (`₹149/$3`, `₹399/$9`, `₹1,200/$29`, `₹999/$19`), and Hero/Workflow `/register` CTAs verified (`tsc 0`, `bun test 85/85`, `next build 47/47`).  
> **Remaining Ops Switch:** Toggle Dodo `/admin/payments` from `test_mode` -> `live_mode` (currently `DODO_MODE` unset/defaults `test_mode`) and verify 1 live `₹149` settlement before turning ads ON!  
> **Note on Benchmarks:** Regional CPM/CPC estimates below cite external 2025–2026 SaaS Meta Ad benchmarks (`search_web`); conversion rates and CAC targets remain **launch hypotheses** until verified by live ad spend.

---

## 1. Where Should We Target at `₹200/day`? (Country & Math Analysis)

At `₹200/day` (`~$2.35/day`), **CPM and CPC determine whether Meta's algorithm can even function**. Buying `1 click/day` in the US destroys budget before you learn anything.

| Region / Market | Typical B2C Meta CPM (2025–2026 Benchmark) | Typical CPC | What `₹200/day` (`~$2.35`) Buys Daily | Conversion Reality for HypeResume | Verdict at `₹200/day` |
| :--- | :---: | :---: | :--- | :--- | :--- |
| **US / UK / CA / AU** | `$16 – $24+` (~₹1,360–₹2,040) | `$2.20 – $4.50` (~₹187–₹385) | `~100–150` imps · **`0.5–1` click/day** | Highest LTV (`$9–$29`), **zero statistical learning** on ₹200/day; `Resume.io`/`Enhancv` bid $30–$50/mo LTV against you | **WAIT** (Unlock at `₹1,000+/day` once India validates) |
| **Western Europe** (`IT`, `FR`, `ES`, `PL` — where Enhancv `934395276322344` got 2.67M reach) | `$6 – $12` (~₹510–₹1,020) | `$0.80 – $1.80` (~₹68–₹153) | `~200–390` imps · **`1–3` clicks/day** | Prefers headshot + 2-column native-language CVs; local copy/currencies unlocalized today | **SKIP** for MVP |
| **UAE & Singapore** (Global USD expat hubs) | `$7 – $12` (~₹595–₹1,020) | `$1.10 – $2.80` (~₹94–₹238) | `~200–335` imps · **`1–2` clicks/day** | High English WTP (`$3/$19`), low total reach at ₹200/day; **ideal Phase 2 global test** | **PHASE 2** (Launch when budget hits `₹500–₹800/day`) |
| **All India (Unfiltered)** | `$1.50 – $4.00` (~₹125–₹340) | `$0.15 – $0.50` (~₹13–₹43) | `~600–1,500` imps · `5–15` clicks/day | **TRAP:** Meta optimizes for cheapest Tier-3 non-English / WhatsApp-biodata clicks with **~0% card/UPI SaaS willingness-to-pay** | **DO NOT RUN BROAD** |
| **Metro India Tech Hubs (English Only, Age 21–32)** | `$2.00 – $4.50` (~₹170–₹385) | `$0.20 – $0.65` (~₹17–₹55) | **`~500–1,200` imps · `~4–12` qualified clicks/day (`120–350+/mo`)** | **PROVEN LIVE:** Chiku AI runs `₹1,199` one-time ads for **176 days**; `Resume.io`/`Rezi`/`Resumod` have **0 active ads** in `country=IN`! High UPI + IT fresher/switchers WTP | **#1 LAUNCH TARGET** |

### Path to First 5 Customers & Doubling Budget (`₹200/day` -> `₹400/day`)
- **Monthly Spend Cap:** `₹200/day × 30 days = ₹6,000` (14-day Phase 1 validation test = `₹2,800`).
- **Expected Volume (India Metro Tech Hubs):** `~150–300` high-intent clicks/month -> `~35–80` tool scans/registrations.
- **Break-Even Math to Validate & Double:**
  - Just **5 Founding Lifetime buyers (`5 × ₹999 = ₹4,995`)** OR **3 Lifetime + 3 Monthly + 4 Weekly (`₹2,997 + ₹1,197 + ₹596 = ₹4,790`)** across Days 1–25 recovers ~80–100%+ of ad spend on **Day-1 cash**, proving willingness-to-pay with near-zero burn!
  - Even hitting **3+ paying buyers by Day 14 (`₹2,800` spent)** at positive/near-breakeven ROAS proves the offer and unlocks doubling daily budget to **`₹400/day` (`₹12,000/mo`)** -> adding a **Campaign #2 Global USD (`UAE + Singapore`)** ad set at `pricing?currency=USD`.

---

## 2. Beginner-Proof Meta Ads Manager Blueprint (`₹200/day`)

> **CRITICAL BEGINNER RULE:** Never click the Instagram **"Boost Post"** button (optimizes for cheap vanity likes). Build inside **Meta Ads Manager** (`adsmanager.facebook.com`).

### Exact Campaign Hierarchy: `1 Campaign -> 1 Ad Set -> 3 Ads`
Do **not** split `₹200/day` across multiple ad sets (Meta will starve both). Let all 3 distinct ads compete inside **one Ad Set**.

| Level | Exact Setting in Meta Ads Manager | Why (Plain English) |
| :--- | :--- | :--- |
| **Campaign Objective** | **`Leads`** *(or **`Sales`** once >15 Purchases exist)* | Our verified Pixel (`analytics.ts`) automatically sends **`Lead`** when someone finishes scanning on `/tools/resume-checker` and **`CompleteRegistration`** on `/register` (plus **`Purchase`** via both Pixel & CAPI). |
| **Budget Level** | Turn **OFF** Advantage Campaign Budget (CBO); set **Ad Set Daily Budget = `₹200`** | Clean control with 1 Ad Set (`~₹6,000/mo` hard ceiling). |
| **Conversion Location** | **Website** | Never use Instant Forms or WhatsApp (adds manual chatting/low SaaS intent). |
| **Performance Goal / Event** | **Maximize number of conversions** -> Pixel Event: **`CompleteRegistration`** *(Test `Lead` ONLY if Cost/Reg exceeds `₹80` after 4 days)* | `CompleteRegistration` ensures Meta finds people who actually sign in and enter `/app` with 5 welcome credits (where upsells happen), at ~`3–8` events/day (`20–50/wk` enough for algorithm learning). |
| **Audience Controls** | **Switch to Original Audience** *(Do NOT leave wide Advantage+ Audience uncontrolled)*:<br>• **Locations:** `People living in or recently in`: **Bengaluru, Hyderabad, Pune, Mumbai, New Delhi, Gurugram, Noida, Chennai** (`+25 km` radius each)<br>• **Age:** `21 – 32`<br>• **Gender:** `All`<br>• **Language:** `English (All)`<br>• **Detailed Targeting:** Leave **Blank** (geo + language + ad hook already pre-qualify!) | Keeps your `₹200/day` locked on employed tech workers, engineering freshers, and career switchers with UPI/card buying power, avoiding ₹2 non-English junk clicks. |
| **Placements** | **Manual Placements:**<br>• ✅ Check **Instagram Feed, Instagram Reels, Instagram Stories**<br>• ✅ Check **Facebook Feed, Facebook Reels, Facebook Stories**<br>• ❌ **UNCHECK Audience Network, Messenger Inbox, Right Column, Search Results** | Audience Network wastes ~30–60% of tiny `₹200/day` budgets on accidental gaming-app banner taps. |

### Where Should Clicks Land? (URL & UTM Hygiene)
- **For Ad 1 & Ad 2 (Free Check / POV Discovery Hooks):** Send to **`https://hype-resume.com/tools/resume-checker?utm_source=meta&utm_medium=paid_social&utm_campaign=launch_200_in&utm_content={{ad.name}}`** -> zero-login instant scan fires Meta **`Lead`**, shows ATS parsing score, and links smoothly to **`/register`** (`CompleteRegistration`) -> 5 credits + `FoundingSalesBanner` (`₹999` Lifetime) / `/pricing` (`₹149` 1-Week Pass).
- **For Ad 3 (Direct Anti-Paywall Offer Hook):** Send to **`https://hype-resume.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=launch_200_in&utm_content={{ad.name}}#pricing`** (Hero + verified `"Build My Resume"` `/register` CTA + interactive ATS studio + transparent `₹149 / ₹399 / ₹999` cards!). *(Test `/` vs `/tools/resume-checker` cleanly by tagging `utm_content`.)*

---

## 3. Ready-to-Paste Launch Ad Set Copy (3 Distinct Angles Competing Inside 1 Ad Set)

*Visual creatives staged in `creative_specs.json` (ready to generate with `bytedance-seed/seedream-5-0-flash` once OpenRouter inference key is supplied in `marketing/generations/.env`):*

### Ad 1 (`CR-POV-ATS`): Enhancv-Inspired Native Desk POV — Upgraded for ATS & Free Exports
- **Creative:** `ad01_pov_desk_ats_4x5.png` (Feed) + `ad01_pov_desk_ats_story_9x16.png` (Reels/Stories) — marble desk overhead photo showing a **headshot-free single-column developer resume** (`POV: you finally fixed your resume for ATS`).
- **Primary Text (Line 1 hooks above fold):**
  > Stop sending 2-column Canva resumes that ATS bots scramble.
  >
  > Paste your PDF into our free 5-part ATS checker (no login needed) — see every parsing & metric flaw in 10 seconds, switch to Jake's single-column engineering format, and export clean PDF & DOCX for ₹0.
  >
  > Need unlimited AI JD tailoring & mock interviews? Try a 1-Week Pass for ₹149 or grab one of the remaining Founding Lifetime seats (₹999 once — zero subscriptions).
- **Headline (<= 40 chars):** `Free ATS Check & Clean PDF Export`
- **Description:** `Zero watermarks • Starting ₹149/wk`
- **CTA Button:** `Try now` *(or `Learn more`)*
- **URL:** `https://hype-resume.com/tools/resume-checker?utm_source=meta&utm_medium=paid_social&utm_campaign=launch_200_in&utm_content=ad01_pov_desk`

### Ad 2 (`CR-LAPTOP-EVIDENCE`): Laptop Check POV — Anti-ChatGPT Evidence Angle
- **Creative:** `ad02_laptop_evidence_check_4x5.png` — cafe/desk laptop showing HypeResume's dark UI `94/100 ATS Match` check (`Check what ChatGPT misses before you apply`).
- **Primary Text:**
  > ChatGPT invents fake numbers on your resume — recruiters catch it in 10 seconds.
  >
  > HypeResume checks your resume against any Job Description with strict evidence proof: exact quotes supporting matched skills, zero hallucinated metrics, plus AI Mock Interviews built on your real projects.
  >
  > Test your resume free in 15 seconds (5 AI credits free, no card required). Full Pro access from ₹149/week or ₹999 Founding Lifetime.
- **Headline:** `Check Your Real Job Match Score`
- **Description:** `5 free credits • Built for tech roles`
- **CTA Button:** `Learn more`
- **URL:** `https://hype-resume.com/tools/resume-checker?utm_source=meta&utm_medium=paid_social&utm_campaign=launch_200_in&utm_content=ad02_laptop_evidence`

### Ad 3 (`CR-ANTI-PAYWALL`): Direct Offer & Anti-Subscription Contrast (Beats Zety / Chiku AI)
- **Creative:** `ad03_zero_paywall_comparison_4x5.png` — dark `#090A10` side-by-side (`Other Builders: TXT only + $29.95 auto-renewal` vs `HypeResume: Free PDF & DOCX + No Subscription Traps`).
- **Primary Text:**
  > Spent 45 minutes building a resume, only to hit a ₹2,500 monthly subscription paywall at download?
  >
  > HypeResume lets you build on 10 ATS templates (including Jake's Resume) and export unlimited unwatermarked PDF & DOCX files for ₹0.
  >
  > Unlock unlimited AI tailoring, cover letters & AI mock interviews with 1 transparent payment:
  > ✅ 1-Week Pro Pass: ₹149
  > ✅ Monthly: ₹399
  > ✅ Founding Lifetime Launch Offer: ₹999 once (limited seats — zero auto-renewal ever)
- **Headline:** `Free PDF Export • Pro From ₹149`
- **Description:** `Founding Lifetime seats at ₹999`
- **CTA Button:** `Sign up`
- **URL:** `https://hype-resume.com/?utm_source=meta&utm_medium=paid_social&utm_campaign=launch_200_in&utm_content=ad03_antipaywall#pricing`

---

## 4. Day-by-Day Kill, Fix & Scale Playbook (Strict Protection for `₹200/day`)

**Rule Zero:** **DO NOT touch or edit anything in the first 48–72 hours** (`₹400–₹600` spent). Editing ads resets Meta's learning phase immediately.

| Check Window | Metrics to Inspect in Ads Manager | Good Signal (Keep Running) | Red Flag -> Exact Action to Take |
| :--- | :--- | :--- | :--- |
| **Day 3 (`₹600` spent)** | **CTR (Link Click-Through Rate)** & **CPC (Link Click)** | Link CTR **`>= 1.2%`** AND CPC **`<= ₹35`** | If an individual ad has `₹250+` spend with **CTR `< 0.7%`**, turn OFF ONLY that weak ad so `₹200/day` flows to the remaining 2 ads. |
| **Day 7 (`₹1,400` spent)** | **Cost per `CompleteRegistration`** & **Funnel Drop-Off** (`/admin`) | **Cost per Signup `<= ₹65`** (`>= 20` signups) AND users running scans/resumes | • If CPC is cheap (`<= ₹25`) but **`CompleteRegistration` = 0–2**: check `/register` friction & test sending clicks straight to `/` instead of `/tools/resume-checker` (or vice versa).<br>• If CPM `> ₹400`: creative hook is too niche — record 1 genuine 25s vertical selfie/screen Loom comparing HypeResume vs Zety/ChatGPT (`Enhancv` uses 93% video in India!). |
| **Day 14 (`₹2,800` spent)** | **Verified `Purchase` Count & Cash Collected** (Dodo + `/admin/payments`) | **`>= 3` paying buyers** (`₹149` / `₹399` / `₹999`) or **`>= ₹2,000` revenue** | • **If 0 purchases despite 40+ signups:** add a **₹100/day Retargeting Campaign (`Sales -> Purchase`)** targeting 14-day website visitors/signups pushing the **scarcity/low-risk hook (`₹149 1-Week Pass` or remaining `₹999` Lifetime seats)** + check `/pricing` checkout completion drop-offs! |
| **Milestone: 5 Customers Closed** | Positive cash / validated offer fit | **`>= 5` verified Dodo buyers** | **Scale Safely:** Increase winning campaign budget from **`₹200/day` -> `₹300/day` -> `₹400/day`** (+30–50% max every 3 days, never 5x overnight) AND test Campaign #2 targeting **UAE + Singapore** (`$3` / `$19` `USD` checkout). |

---

## 5. Future Channels (Post-5-Customer Validation)

Once Meta proves initial buyer WTP and `₹400–₹800/day` profitability:
1. **Google Search Exact/Phrase Ads (`₹400/day`):** Capture urgent buyers searching `[ats resume checker free]`, `"jakes resume builder"`, `"zety free alternative pdf"`, `"jobscan alternative india"` with negative keyword guardrails (`biodata`, `govt job`, `ms word download`, `canva`, `naukri login`, `cv maker apk mod`).
2. **Creator Whitelisting / Micro-Affiliates (Stealing Enhancv's `10/15` India Playbook):** Offer 5 Indian coding/placement YouTube Shorts & IG creators (`10k–75k` followers) **`30%` affiliate commission or ₹80–₹150 per paid buyer** + clean demo script -> zero upfront media risk, and winning reels can be whitelisted as Meta Partnership Ads just like Enhancv (`Maxtalkstech`, `Rexcodes`, `Morgan`).
