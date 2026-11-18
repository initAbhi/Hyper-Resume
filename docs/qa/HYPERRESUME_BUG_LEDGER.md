# HyperResume — Master Bug Ledger (Final Verified State)

> **Mission:** Full-Scale Human Simulation, UI/UX, Functional QA & Autonomous Bug Elimination
> **Target Environment:** Next.js 16.4.6 (`http://localhost:3000`) + NestJS (`http://localhost:3001`) + PostgreSQL (`hyper_resume_db`)
> **Test Coverage:** 10 Synthetic Personas × 10 Templates × 10 Viewports + 12 Playwright E2E/axe-core Specs (23 tests) + 216 Frontend Unit Tests + 299 Backend Unit/Integration Tests
> **Final Bug Tally:** **17 Confirmed Bugs Logged → 17 FIXED & VERIFIED (0 Open P0/P1/P2/P3 Defects)**

---

## Summary Table

| Bug ID | Title | Category | Severity | Priority | Status | Verification Spec / Suite |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | Auth context checked wrong `localStorage` key (`hyper_resume_token` vs `hr_access_token`) | Auth / Session | High | P1 | **FIXED & VERIFIED** | `resume-creation.spec.ts`, `frontend/lib/auth-context.tsx` |
| **BUG-002** | Infinite loading spinner on 404 / deleted / unauthorized resume URL | Functional / UX | High | P1 | **FIXED & VERIFIED** | `edge-cases.spec.ts` #2 (`Unable to load resume` + `Back to My Resumes`) |
| **BUG-003** | `CrestTemplate` horizontal overflow (+46px) on Extreme Edge-Case persona | Layout / Visual | High | P1 | **FIXED & VERIFIED** | `template-switching.spec.ts` (`[QA_TEMPLATE_OVERFLOW_AUDIT] []`) |
| **BUG-004** | Inline skill delete chip (`CanvasEntryDeleteButton`) unfocusable (`tabIndex=-1`), hidden on touch, & obscured by floating `CanvaBottomBar` | Functional / A11y / UX | High | P1 | **FIXED & VERIFIED** | `skills-management.spec.ts` |
| **BUG-005** | `ExportPdfModal` failed to close on `Escape` and lacked native `<dialog>` top-layer/focus containment | Functional / A11y | High | P1 | **FIXED & VERIFIED** | `pdf-export.spec.ts` #1 & #2 |
| **BUG-006** | Hidden resume sections (`[data-hr-hidden="true"]`) were NOT stripped from exported PDF HTML and lacked semantic `hidden`/`aria-hidden` | PDF Export / A11y | High | P1 | **FIXED & VERIFIED** | `section-management.spec.ts`, `pdf-html-serializer.ts`, `resume-layout.ts` |
| **BUG-007** | `flushPendingSave` stale closure on active `contentEditable`, missing `Ctrl/Cmd+S` save shortcut, Undo/Redo layout desync, & stale `hasConflict` ref in `performSave` | Persistence / State | High | P1 | **FIXED & VERIFIED** | `resume-editor.spec.ts`, `resume-persistence.spec.ts` (4/4) |
| **BUG-008** | DesignPanel `showPhoto`, `showHighlights`, and `pageSize` reset to defaults on page reload | Persistence / Design | High | P1 | **FIXED & VERIFIED** | `text-formatting.spec.ts` #1 |
| **BUG-009** | Critical WCAG `select-name` violations on Editor Header template `<select>` and `TemplatePicker` language `<select>` | Accessibility (WCAG A) | Critical | P1 | **FIXED & VERIFIED** | `accessibility.spec.ts` (`[QA_AXE_VIOLATIONS] []`) |
| **BUG-010** | Critical WCAG `button-name` violations on both `DesignPanel` toggle switches + unlinked Photo URL `<label>` | Accessibility (WCAG A) | Critical | P1 | **FIXED & VERIFIED** | `accessibility.spec.ts`, `text-formatting.spec.ts` |
| **BUG-011** | Serious WCAG `link-name` violations on all 9 collapsed sidebar links across every authenticated page | Accessibility (WCAG A) | Serious | P1 | **FIXED & VERIFIED** | `accessibility.spec.ts` (`[QA_AXE_VIOLATIONS] []`) |
| **BUG-012** | Serious WCAG `nested-interactive` violations on all 10 template preview cards in `TemplatePicker` | Accessibility (WCAG A) | Serious | P1 | **FIXED & VERIFIED** | `accessibility.spec.ts` (`[QA_AXE_VIOLATIONS] []`) |
| **BUG-013** | Serious WCAG 2.5.3 `label-content-name-mismatch` on `#global-agent-floating-btn` | Accessibility (WCAG A) | Serious | P2 | **FIXED & VERIFIED** | `accessibility.spec.ts`, `GlobalAgentDrawer.test.tsx` |
| **BUG-014** | Serious WCAG AA `color-contrast` violations across Landing (`/`), Register (`/register`), My Resumes (`/app/resumes`), App Shell, Resume Editor, CanvaDock, AddContentDrawer, SectionRearrangeDrawer, & TemplatePicker | Accessibility (WCAG AA) | Serious | P2 | **FIXED & VERIFIED** | `accessibility.spec.ts` (`[QA_AXE_VIOLATIONS] []` across all 9 surfaces) |
| **BUG-015** | `JakeTemplate` rendered 3 dangling empty pipe separators (`\| \| \|`) in contact header when optional URLs were blank in edit mode | Visual / Typography | Medium | P2 | **FIXED & VERIFIED** | `template-switching.spec.ts`, `resume-creation.spec.ts` #3 |
| **BUG-016** | `responsive.spec.ts` Landing viewport loop exceeded 90s timeout in dev mode due to 10 redundant full navigations | QA Harness / Test | Low | P3 | **FIXED & VERIFIED** | `responsive.spec.ts` (`[QA_RESPONSIVE_OVERFLOWS_PUBLIC] []` & `AUTH []`) |
| **BUG-017** | React StrictMode unmount cleanup calling `dialog.close()` triggered native `<dialog onClose>` and immediately closed `ExportPdfModal` on mount | Functional / React 19 | High | P1 | **FIXED & VERIFIED** | `pdf-export.spec.ts` #1 & #2 (82.3 KB Unicode PDF + 110.7 KB 2-page PDF) |

---

## Detailed Defect Traceability

### BUG-001 — Auth Context Checked Wrong `localStorage` Key
- **Root Cause:** `frontend/lib/auth-context.tsx:63` read `localStorage.getItem('hyper_resume_token')` instead of `'hr_access_token'` / `'hr_refresh_token'` written by `frontend/lib/api-client.ts:1544`.
- **Fix Applied:** Updated `auth-context.tsx` to check `hr_access_token` and `hr_refresh_token` alongside cookies.
- **Verification:** Confirmed via `resume-creation.spec.ts` and full 23-test authenticated E2E run.

### BUG-002 — Infinite Loading Spinner on 404 / Deleted / Unauthorized Resume URL
- **Root Cause:** `frontend/app/app/resumes/[resumeId]/page.tsx` rendered `if (!content)` spinner before checking `errorMessage`, permanently trapping users on a deleted or invalid resume route.
- **Fix Applied:** Added an accessible `role="alert"` error card before the loading fallback with clear error copy, **Back to My Resumes** link, and **Retry** button.
- **Verification:** Confirmed via `edge-cases.spec.ts` test #2 navigating to non-existent UUID `00000000-0000-4000-8000-000000000000`.

### BUG-003 — `CrestTemplate` Horizontal Overflow (+46px) on Extreme Edge-Case Persona
- **Root Cause:** `CrestTemplate.tsx` lacked `min-w-0` on flex/grid containers (`md:col-span-8`, `md:col-span-4`, header, project header) and lacked `break-all`/`[overflow-wrap:anywhere]` on unbroken URLs/emails/skill chips.
- **Fix Applied:** Added `min-w-0`, `max-w-full`, `break-words`, `break-all`, and `[overflow-wrap:anywhere]` across header, contact ribbon, 2-column grid, project headers, and skill pills.
- **Verification:** `template-switching.spec.ts` audited all 10 templates on Persona 10 (150-char URLs, 22 bullets, 28 skills) → `[QA_TEMPLATE_OVERFLOW_AUDIT] []` (0px overflow on all 10 templates).

### BUG-004 — Inline Skill Delete Button Unfocusable, Hidden on Touch & Obscured by Floating `CanvaBottomBar`
- **Root Cause:** `CanvasEntryDeleteButton` had `tabIndex={-1}` and `opacity-0`, and `#resume-document-print` elements lacked `scroll-margin-bottom` clearance for the fixed `CanvaBottomBar`.
- **Fix Applied:** Removed `tabIndex={-1}` for keyboard accessibility, made delete chips visible on touch/focus/hover (`opacity-65 sm:opacity-0 group-hover/skill:opacity-100 group-focus-within/skill:opacity-100 focus-visible:opacity-100`), and added `scroll-margin-top: 96px; scroll-margin-bottom: 120px` in `frontend/app/globals.css`.
- **Verification:** `skills-management.spec.ts` passed completely (add, duplicate guard, special chars, long skill, reload persistence, inline delete & save).

### BUG-005 & BUG-017 — `ExportPdfModal` Native `<dialog>`, Escape Dismissal & StrictMode Mount Safety
- **Root Cause:** Custom `<div className="fixed inset-0">` failed to dismiss on `Escape` and lacked native top-layer focus containment; initial `<dialog>` migration hit React StrictMode cleanup firing `<dialog onClose>`.
- **Fix Applied:** Upgraded `ExportPdfModal.tsx` to native `<dialog>` opened via `.showModal()` with `aria-labelledby`, `onCancel` Escape handling, backdrop dismissal, close button, and `dialog:modal { overscroll-behavior: contain }` in `globals.css`, without binding unmount `dialog.close()` to React `onClose`.
- **Verification:** `pdf-export.spec.ts` #1 & #2 passed completely (82,328-byte 1-page Unicode PDF with `atsVerified=true`, 154 words, Escape dismissal verified; 110,700-byte 2-page Extreme PDF with 720 words + 1-page Minimal Fresher PDF + valid DOCX zip).

### BUG-006 — Hidden Resume Sections Leaked Into PDF HTML & Lacked Semantic `hidden`/`aria-hidden`
- **Root Cause:** `serializeCleanResumeHtml` omitted `[data-hr-hidden="true"]` from its strip selector; `applyResumeLayoutToDom` only toggled `style.display = 'none'`.
- **Fix Applied:** Updated `pdf-html-serializer.ts:42` to remove `[data-hr-hidden="true"]` and updated `resume-layout.ts:365-374` to set `section.hidden = true` and `aria-hidden="true"`.
- **Verification:** `section-management.spec.ts` confirmed Certifications stays hidden before & after reload, restores on Reset, and is cleanly excluded from visible canvas & PDF HTML.

### BUG-007 — `flushPendingSave`, `Ctrl/Cmd+S`, Undo/Redo Visual Desync & 409 `hasConflictRef`
- **Root Cause:** Async `finally` in `performSave` read stale `hasConflict` React closure; `flushPendingSave` read stale `content` closure right after `blur()`; Undo/Redo didn't restore `accentColor`/`fontFamily`/`photoUrl`/`showPhoto`/`showHighlights`/`pageSize`; `Ctrl/Cmd+S` wasn't intercepted.
- **Fix Applied:** Added `hasConflictRef`, `latestContentRef`, `syncVisualStateFromContent`, `Ctrl/Cmd+S` save handler, and awaited blur commit in `flushPendingSave`.
- **Verification:** `resume-editor.spec.ts` (3/3) and `resume-persistence.spec.ts` (4/4 — including 500 error honesty, 409 OCC conflict UI, rapid edits parity, cross-user 404).

### BUG-008 — DesignPanel `showPhoto`, `showHighlights`, and `pageSize` Reset on Reload
- **Root Cause:** Settings lived only in local `useState` and were omitted from `ResumeLayoutSettings`.
- **Fix Applied:** Extended `ResumeLayoutSettings` & `NormalizedLayoutSettings` with `showPhoto`, `showHighlights`, and `pageSize`, persisted all three via `handleUpdateLayout` / `updateContent`, and hydrated them in `loadResume()`.
- **Verification:** `text-formatting.spec.ts` toggled both switches OFF, reloaded, and verified both remained unchecked alongside teal accent color and Georgia serif font.

### BUG-009 through BUG-014 — WCAG 2.1 A/AA Accessibility & Color Contrast Sweep
- **Root Cause:** Missing accessible names on 2 `<select>` elements (`BUG-009`), 2 `DesignPanel` switches & photo input (`BUG-010`), 9 collapsed sidebar links (`BUG-011`); nested `<a>` tags inside template picker cards (`BUG-012`); WCAG 2.5.3 `aria-label` mismatch on Global Agent FAB (`BUG-013`); sub-4.5:1 contrast grays/emeralds/dark-card accents across Landing, Register, My Resumes, App Shell, Editor, and Drawers (`BUG-014`).
- **Fix Applied:** Added explicit `<label htmlFor>`/`aria-label` associations, native `<input type="checkbox" role="switch">` controls, `aria-label`/`aria-current`/`aria-hidden` on collapsed sidebar links, `aria-hidden="true" inert={true}` on `TemplateThumbnail` previews, aligned `GlobalAgentButton` `aria-label` with visible `"AI Career Agent"` label, and raised all failing text/badge contrast ratios above WCAG AA 4.5:1.
- **Verification:** `accessibility.spec.ts` (`axe-core` with `wcag2a, wcag2aa, wcag21a, wcag21aa`) reported **`[QA_AXE_VIOLATIONS] []` — 0 critical/serious violations across all 9 audited surfaces**.

### BUG-015 — `JakeTemplate` Dangling Empty Contact Separators (`| | |`)
- **Root Cause:** `JakeTemplate.tsx` rendered all 6 contact fields with static `|` separators in edit mode even when optional LinkedIn/GitHub/Website fields were empty.
- **Fix Applied:** Filtered empty optional URL items out of `visibleContactItems` until populated while keeping core phone/email/location slots immediately editable.
- **Verification:** Verified on Persona 01 (Minimal Fresher) and all 10 templates in `template-switching.spec.ts`.

### BUG-016 — `responsive.spec.ts` Dev-Mode Landing Loop Timeout
- **Root Cause:** Calling `page.goto('/')` 10 consecutive times in Next.js dev mode exceeded 90s.
- **Fix Applied:** Loaded `/` once and resized through all 10 required viewports (`1920×1080` down to `320×568`), matching real responsive viewport evaluation.
- **Verification:** `responsive.spec.ts` passed both public and authenticated 10-viewport matrices with **0 horizontal overflows** (`[]`).
