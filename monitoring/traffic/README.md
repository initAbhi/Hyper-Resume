# HypeResume Traffic Monitoring

How we measure **anonymous website traffic** (landing visitors, sources, regions, on-page behavior) — not signed-in product analytics.

## Short answer

| Question | Reliable? | Where to look |
|---|---|---|
| How much traffic hit the site / landing page? | **Yes** | Admin → Overview (Page Views, Landing counts, Last 7d) |
| Where did traffic come from (UTM / referrer)? | **Yes** | Admin → Top Sources + campaign UTMs on ads |
| Which countries / regions? | **Yes (coarse)** | Admin → Top Countries (IP→country, no raw IP stored) |
| What are people doing on pages (clicks, scroll, rage)? | **Yes** | [Microsoft Clarity](https://clarity.microsoft.com/projects/view/zhrwdxdio6/dashboard) |
| Exact city / ISP / device fingerprint for ads? | No — not needed for product decisions | Use Meta Ads / optional GA4 later |

**Clarity alone is not enough for “traffic by region.”**  
We use a two-layer stack:

1. **First-party analytics** (our DB + Admin) → volume, sources, countries, paths  
2. **Microsoft Clarity** (`zhrwdxdio6`) → session replay + heatmaps  

Meta Pixel stays for **ad optimization only**, not as your primary traffic dashboard.

---

## Stack

### 1. First-party (owned, durable)

- Client: `frontend/lib/analytics.ts`  
- Ingest: `POST /api/v1/analytics/event`  
- Table: `analytics_events`  
- Admin API: `GET /api/v1/admin/analytics/overview`  
- UI: `/admin` Overview  

**Page views** are `landing_view` events fired on every public route change (including `/`).

**Attribution** is first-touch per browser session:

- Captures `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, and `document.referrer` once  
- Sticky in `sessionStorage` so SPA navigations keep the acquisition channel  

**Geo**: server resolves country (+ region code) from request IP via GeoLite, stores only:

```json
{ "countryCode": "IN", "country": "India", "region": "KA" }
```

Raw IP / user-agent are **not** written to analytics rows. DNT (`navigator.doNotTrack === 1`) disables client tracking.

### 2. Microsoft Clarity (behavior)

- Project: **HypeResume**  
- ID: `zhrwdxdio6`  
- Env: `NEXT_PUBLIC_CLARITY_PROJECT_ID`  
- Injected in `frontend/app/layout.tsx` `<head>`  

Use Clarity for:

- Session recordings  
- Heatmaps  
- Dead / rage clicks  
- Scroll depth  

Expect up to ~2 hours before the first Clarity dashboard data appears after install.

### 3. Meta Pixel / CAPI (ads)

- Dataset: **HypeResume Web working** (`1117348281146781`)  
- Purpose: optimize / attribute **paid Meta** campaigns  
- Do **not** use Events Manager as your only “how much traffic” report  

---

## How to use day-to-day

### A. Volume & landing traffic (Admin)

1. Open https://hype-resume.com/admin (admin account)  
2. Read:
   - **Unique Visitors** — distinct anonymous sessions  
   - **Page Views** — all route hits (`landing_view`)  
   - **Landing** (under Page Views) — hits on `/`  
   - **Last 7d** — recent volume  
3. Scroll to:
   - **Top Sources** — UTMs / referrers / Direct  
   - **Top Countries** — India, US, …  
   - **Top Pages** — `/`, `/pricing`, `/tools/...`, etc.  

### B. Behavior (Clarity)

1. Open [Clarity Dashboard](https://clarity.microsoft.com/projects/view/zhrwdxdio6/dashboard)  
2. **Recordings** — watch real sessions (filters by URL, country, device)  
3. **Heatmaps** — where people click on landing / pricing  
4. Filter to `hype-resume.com/` when diagnosing landing UX  

### C. Paid Meta campaigns

Always tag ads with UTMs, e.g.:

```text
https://hype-resume.com/?utm_source=meta&utm_medium=paid&utm_campaign=india_resume_match&utm_content=static_v1
```

Then:

- **Admin Top Sources** → `meta` (or your `utm_source`)  
- **Meta Ads Manager** → spend / CPA  
- **Clarity** → did those visitors bounce or engage?  

---

## Verifying the install

### Clarity on the live site

1. Hard-refresh https://hype-resume.com/  
2. View source / DevTools → Network → `clarity.ms/tag/zhrwdxdio6`  
3. Or run in console: `typeof clarity` → should be `"function"` after load  

### First-party event

1. Open landing in a private window  
2. Admin Overview page views / landing counts should tick up within seconds  
3. Optional API check (from browser session): Network → `POST .../analytics/event` → `202`  

### Country attribution

1. Visit from a real public IP (not localhost-only)  
2. New events get `metadata.countryCode`  
3. Admin → **Top Countries** populates after those visits  

> Localhost / private IPs intentionally skip geo (no fake “Unknown” spam).

---

## Ops / env

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Frontend `.env` | Clarity project (`zhrwdxdio6`) |
| `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` | Frontend `.env` | Meta Pixel |
| `META_PIXEL_ID` | Backend `.env` | Meta CAPI dataset ID |
| `META_CONVERSIONS_API_TOKEN` | Backend `.env` | Server Purchase / InitiateCheckout |

After changing `NEXT_PUBLIC_*`, **rebuild + redeploy frontend** (values are baked at build time).

---

## Reliability notes (founder-grade)

1. **Ad blockers** undercount browser pixel/Clarity (~5–30% depending on audience). First-party `POST /analytics/event` is more resilient but not immune.  
2. **Geo is country/region grade**, not street-level. Good enough for “India vs US vs other.”  
3. **Bot traffic** can inflate page views; watch Clarity recordings for obviously non-human sessions.  
4. **Do not** treat Meta “Test Events” as production traffic truth.  
5. If you later need Search Console–style SEO geo or Google Ads attribution, add **GA4** as a third layer — it does not replace this stack.

---

## Code map

| Concern | Path |
|---|---|
| Clarity + Meta head tags | `frontend/app/layout.tsx` |
| Route page views | `frontend/components/analytics/MetaPixel.tsx` |
| Client tracker + sticky UTMs | `frontend/lib/analytics.ts` |
| Ingest + geo enrich | `backend/src/analytics/analytics.service.ts`, `geo-from-ip.util.ts` |
| Admin aggregates | `backend/src/admin/admin.service.ts` → `getAnalyticsOverview` |
| Admin UI | `frontend/app/admin/page.tsx` |
