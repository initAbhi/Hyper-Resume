# Job Application Tracker & Career CRM — Feature Specification

**Route**: `/app/applications` (`frontend/app/app/applications/page.tsx`)  
**Core Components**: `frontend/components/applications/*`  
* `ApplicationKanbanView.tsx` (Kanban board layout)
* `ApplicationTableView.tsx` (Tabular view with sorting and filters)
* `ApplicationDeepWorkspace.tsx` (Deep application drawer & interview notes — 66 KB)
* `AddApplicationModal.tsx` (Fast application creation modal)
* `ChevronMetricBanner.tsx` (Pipeline conversion metrics)
**Backend Module**: `backend/src/applications/*`  
**Status**: 🟢 Production Live (`https://resume.fourth-coffee.shop/app/applications`)  

---

## 1. Overview & Vision

Job hunting at senior and staff levels often involves tracking 20-50 simultaneous applications, multiple tailored resume versions, recruiter screening dates, take-home assignments, and compensation negotiations.

The **Job Application Tracker** acts as a personal Career CRM: it links each application directly to the exact resume version submitted, tracks interview milestones, logs preparation notes, and measures pipeline conversion rates.

---

## 2. Pipeline Stages & Lifecycle

Applications advance through 6 standard hiring stages:

| Stage | Stage ID | Visual Color | Description |
| :--- | :--- | :--- | :--- |
| **1. Wishlist** | `wishlist` | Slate / Gray | Roles identified but not yet formally submitted |
| **2. Applied** | `applied` | Blue (`#285FEA`) | Application submitted via ATS portal or referral |
| **3. Screening** | `screening` | Amber (`#F59E0B`) | Recruiter phone screen or hiring manager chat scheduled |
| **4. Technical** | `technical` | Indigo (`#6366F1`)| Technical phone screen, live coding, or architecture onsite |
| **5. Offer** | `offer` | Emerald (`#10B981`)| Formal job offer received with compensation details |
| **6. Rejected / Archived** | `rejected` | Rose / Muted | Position closed or candidate withdrew |

---

## 3. Dual Workspace Views

### 3.1 Kanban Board View (`ApplicationKanbanView.tsx`)
* 6 horizontal columns corresponding to the lifecycle stages.
* Draggable / selectable application cards displaying:
  * Company brand badge (with dark/light adaptive styling).
  * Role title and target level.
  * Applied date and days in stage counter.
  * Match score badge (e.g., `88% Match`).
  * Quick-action stage advance button.

### 3.2 High-Density Table View (`ApplicationTableView.tsx`)
* Enterprise tabular layout suited for managing large application volumes:
  * Columns: Company, Role, Stage, Target Salary, Date Applied, Linked Resume, Actions.
  * Instant search across company and role.
  * Multi-column sorting (by applied date, salary, or stage).

---

## 4. Pipeline Conversion Metrics (`ChevronMetricBanner.tsx`)

A prominent metric banner across the top of the tracker displays high-level career health:
* **Total Active Applications**: Count of applications in `Applied`, `Screening`, or `Technical`.
* **Interview Conversion Rate**: Percentage of applications that progressed to `Screening` or beyond (Benchmark: 15-25%).
* **Active Offers Count**: Number of pending offers.
* **Average Response Velocity**: Median business days between `Applied` and first recruiter outreach.

---

## 5. Deep Application Drawer (`ApplicationDeepWorkspace.tsx`)

Clicking any application card slides open a deep workspace drawer (66 KB component) with 4 dedicated tabs:

1. **Overview & Job Spec**: Full captured job description, compensation range, remote policy, recruiter contact info, and application URL.
2. **Linked Resume**: Embedded view of the exact resume snapshot submitted for this role.
3. **Interview Logs & Notes**: Rich markdown notebook for capturing:
   * Recruiter notes and company pain points.
   * System design questions asked during interviews.
   * Behavioral interview questions (STAR stories prepared).
4. **Compensation & Offer Tracker**: Base salary, annual bonus percentage, equity grant (RSUs/Options over 4-year vesting), sign-on bonus, and benefits comparison.
