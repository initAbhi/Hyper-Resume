# HyperResume — Bug Fix Summary

> **Total Bugs Resolved:** 17 / 17 confirmed defects (`100%`)
> **Regression Result:** 23/23 Playwright E2E tests PASS, 216/216 Frontend unit tests PASS, 299/299 Backend Vitest tests PASS, Backend `typecheck` / `lint` / `build` PASS.

---

## Fixes by Engineering Area

### 1. Authentication & Error Resilience
- **BUG-001** — [auth-context.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/lib/auth-context.tsx#L60-L67): Replaced stale `'hyper_resume_token'` lookup with `'hr_access_token'` and `'hr_refresh_token'` matching `ApiClient` storage keys.
- **BUG-002** — [page.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/app/app/resumes/[resumeId]/page.tsx#L1537-L1578): Added dedicated `if (!content && errorMessage)` `role="alert"` error screen with **Back to My Resumes** link and **Retry** button so 404/deleted/unauthorized resume URLs never spin infinitely.

### 2. Editor Persistence, Undo/Redo & Concurrency Hardening
- **BUG-007** — [page.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/app/app/resumes/[resumeId]/page.tsx#L588-L745):
  - Introduced `hasConflictRef` so a `409 Conflict` immediately halts queued saves in `performSave`'s `finally` block instead of reading stale React state.
  - Added `latestContentRef` and awaited blur microtask in `flushPendingSave` so active `contentEditable` edits are never dropped before saving or exporting.
  - Added `syncVisualStateFromContent` on Undo/Redo and Version Restore/Conflict Reload so `accentColor`, `fontFamily`, `photoUrl`, `showPhoto`, `showHighlights`, and `pageSize` stay synchronized with history snapshots.
  - Added global `Ctrl+S` / `Cmd+S` save shortcut that prevents the browser's Save Webpage dialog and flushes pending edits immediately.
- **BUG-008** — [api-client.ts](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/lib/api-client.ts#L108-L121), [resume-layout.ts](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/lib/resume-layout.ts#L45-L58), [page.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/app/app/resumes/[resumeId]/page.tsx#L497-L525): Persisted `showPhoto`, `showHighlights`, and `pageSize` in `ResumeContent.layout` and hydrated them reliably on load.

### 3. Template Rendering, Canvas Interaction & PDF Export Fidelity
- **BUG-003** — [CrestTemplate.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/components/resumes/templates/CrestTemplate.tsx#L55-L360): Added `min-w-0`, `max-w-full`, `break-words`, `break-all`, and `[overflow-wrap:anywhere]` across header, contact ribbon, 2-column grid, project headers, and skill chips, eliminating the +46px horizontal overflow on Persona 10.
- **BUG-004** — [CanvasEditContext.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/components/resumes/templates/CanvasEditContext.tsx#L284-L328) & [globals.css](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/app/globals.css#L1223-L1228): Removed `tabIndex={-1}` on `CanvasEntryDeleteButton`, improved touch/focus visibility, and added `scroll-margin-top: 96px; scroll-margin-bottom: 120px` so scrolled canvas elements always clear the floating `CanvaBottomBar`.
- **BUG-005 & BUG-017** — [ExportPdfModal.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/components/resumes/ExportPdfModal.tsx#L56-L220): Migrated `ExportPdfModal` to a semantic native `<dialog>` opened via `.showModal()` with `aria-labelledby`, reliable `Escape` (`onCancel`) and backdrop dismissal, scroll containment (`dialog:modal { overscroll-behavior: contain }`), and React StrictMode-safe unmount cleanup.
- **BUG-006** — [pdf-html-serializer.ts](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/lib/pdf-html-serializer.ts#L41-L43) & [resume-layout.ts](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/lib/resume-layout.ts#L365-L374): Stripped `[data-hr-hidden="true"]` from exported vector PDF HTML and added semantic `section.hidden = true` + `aria-hidden="true"` when sections are hidden.
- **BUG-015** — [JakeTemplate.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/components/resumes/templates/JakeTemplate.tsx#L79-L87): Prevented dangling `| | |` empty separators when optional social/portfolio URLs are empty in edit mode.

### 4. WCAG 2.1 A/AA Accessibility & Contrast Compliance (0 Remaining Violations)
- **BUG-009** — [page.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/app/app/resumes/[resumeId]/page.tsx#L1698-L1706) & [TemplatePicker.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/components/resumes/TemplatePicker.tsx#L525-L539): Linked `<label htmlFor>` and `aria-label` on both `<select>` elements.
- **BUG-010** — [DesignPanel.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/components/resumes/DesignPanel.tsx#L392-L462): Replaced unlabeled empty toggle `<button>`s with accessible `<input type="checkbox" role="switch">` controls paired with `<label htmlFor>` and `aria-describedby`, plus linked `<label htmlFor="design-photo-url">` for the Photo URL input.
- **BUG-011** — [layout.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/app/app/layout.tsx#L279-L305): Added `aria-label`, `aria-current="page"`, and decorative `aria-hidden="true"` icons across all 9 collapsed sidebar links.
- **BUG-012** — [TemplatePicker.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/components/resumes/TemplatePicker.tsx#L416-L433): Marked `TemplateThumbnail` preview wrapper `aria-hidden="true" inert={true}`, removing all 10 `nested-interactive` violations.
- **BUG-013** — [GlobalAgentButton.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/components/layout/GlobalAgentButton.tsx#L31-L34): Aligned `aria-label` with visible `"AI Career Agent"` label to satisfy WCAG 2.5.3 Label in Name.
- **BUG-014** — Raised WCAG AA contrast >= 4.5:1 across:
  - Landing page components (`AtsCompatibilityCloud.tsx`, `CompanyLogoCloud.tsx`, `AtsScoreShowcase.tsx`, `ProductFeaturesTabs.tsx`, `InteractiveTemplateShowcase.tsx`, `CareerLoopSection.tsx`, `DifferentiatorSection.tsx`, `CredibilityAndTrustSection.tsx`, `PricingSection.tsx`, `FaqAndFinalCta.tsx`, `ApplicationPipelineWorkspace.tsx`, `ProductWorkflowStorytelling.tsx`, `SampleLibraryShowcase.tsx`)
  - Auth & App Shell ([register/page.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/app/(auth)/register/page.tsx#L238), [app/layout.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/app/app/layout.tsx), [app/resumes/page.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/app/app/resumes/page.tsx))
  - Editor & Drawers ([page.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/app/app/resumes/[resumeId]/page.tsx), [CanvaDock.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/components/resumes/CanvaDock.tsx), [AddContentDrawer.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/components/resumes/AddContentDrawer.tsx), [SectionRearrangeDrawer.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/components/resumes/SectionRearrangeDrawer.tsx), [TemplatePicker.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/components/resumes/TemplatePicker.tsx), [CanvasEditContext.tsx](file:///c:/Users/addme/Desktop/Hyper-Resume/frontend/components/resumes/templates/CanvasEditContext.tsx))

### 5. QA Test Suite Reliability
- **BUG-016** — [responsive.spec.ts](file:///c:/Users/addme/Desktop/Hyper-Resume/tests/e2e/responsive.spec.ts#L26-L48): Replaced 10 redundant dev-mode navigations with single load + 10-viewport resize sweep.
