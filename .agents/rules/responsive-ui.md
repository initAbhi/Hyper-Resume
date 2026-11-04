# Hyper-Resume Responsive UI/UX Guidelines

These rules ensure all frontend components and pages render smoothly across mobile (320px–480px), tablet (640px–1023px), laptop (1024px–1279px), and desktop (1280px+).

---

## 1. Mobile-First Layout Rules
- **Default classes must target mobile first**, scaling up with `sm:`, `md:`, `lg:`, `xl:`.
- **Flex Direction:** When grouping elements that could be wide, start with `flex flex-col sm:flex-row`.
- **Grid Definitions:** Multi-column grids must start with single or 2 columns on mobile:
  - Cards: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
  - Stat counters: `grid grid-cols-2 sm:grid-cols-4`

## 2. Preventing Viewport & Horizontal Overflow
- **No hardcoded large pixel widths:** Never use fixed `w-[...px]` >= 300px without `max-w-full`. Always prefer `w-full max-w-[...px]`.
- **Flex child clipping:** Always apply `min-w-0` to flex child containers that contain text with `truncate`, avoiding pushing neighboring icons or buttons off-screen.
- **Tables:** Every data table must be wrapped inside `<div className="overflow-x-auto">` with `min-w-[...]` on the table to ensure smooth horizontal scroll on narrow mobile viewports.
- **Modals:** Must fit on small mobile screens with `max-h-[92vh] flex flex-col overflow-hidden` and inner scrollable body `flex-1 overflow-y-auto p-3 sm:p-6`.

## 3. Responsive Touch Targets & Spacing
- **Touch targets:** Interactive buttons and touch icons must have a minimum touch area of 40×40px.
- **Header Action Clusters:** In headers or modal action bars with multiple buttons:
  - Keep primary action visible, but abbreviate label on mobile (e.g. `<span className="hidden sm:inline">Use This Template</span><span className="sm:hidden">Use</span>`).
  - Collapse secondary buttons to icons with `title` attributes on extra small screens.
- **Container Padding:** Use progressive padding: `p-3 sm:p-6 lg:p-8` rather than flat `p-8` or `px-12`.

## 4. Carousels & Mobile Sliders
- Avoid fixed-percentage CSS translation math that assumes desktop column counts.
- Use `overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar` containers with `snap-start` cards (`w-[84vw] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]`) to support native mobile swipe gestures alongside desktop navigation buttons.

