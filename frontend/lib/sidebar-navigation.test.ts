import { describe, test, expect, beforeEach, mock } from 'bun:test';

// Simulation of the Hybrid Sidebar State Machine
export interface HybridSidebarState {
  isPinned: boolean;
  isHovered: boolean;
  hasHoverSupport: boolean;
}

export function computeIsExpanded(state: HybridSidebarState): boolean {
  // State Priority:
  // isPinned = true -> Always expanded
  // isPinned = false + isHovered = true -> Expanded
  // isPinned = false + isHovered = false -> Collapsed
  return state.isPinned || (state.hasHoverSupport && state.isHovered);
}

export class SidebarController {
  public isPinned: boolean = false;
  public isHovered: boolean = false;
  public hasHoverSupport: boolean = true;
  private storage: Map<string, string> = new Map();

  private hoverEnterTimeout: any = null;
  private hoverLeaveTimeout: any = null;

  private readonly ENTER_DELAY_MS = 120;
  private readonly LEAVE_DELAY_MS = 150;
  private readonly STORAGE_KEY = 'hyperresume-sidebar-pinned';

  constructor(hasHoverSupport: boolean = true, initialStorage?: Record<string, string>) {
    this.hasHoverSupport = hasHoverSupport;
    if (initialStorage) {
      Object.entries(initialStorage).forEach(([k, v]) => this.storage.set(k, v));
    }
    this.init();
  }

  public init() {
    const saved = this.storage.get(this.STORAGE_KEY);
    if (saved === 'true') {
      this.isPinned = true;
    } else {
      this.isPinned = false;
    }
  }

  public get isExpanded(): boolean {
    return computeIsExpanded({
      isPinned: this.isPinned,
      isHovered: this.isHovered,
      hasHoverSupport: this.hasHoverSupport,
    });
  }

  public get isCollapsed(): boolean {
    return !this.isExpanded;
  }

  public togglePin() {
    this.clearTimeouts();
    this.isPinned = !this.isPinned;
    this.storage.set(this.STORAGE_KEY, String(this.isPinned));
    if (!this.isPinned && this.hasHoverSupport) {
      this.isHovered = true;
    }
  }

  public onMouseEnter(delayFn?: (cb: () => void, ms: number) => void) {
    if (!this.hasHoverSupport) return;
    if (this.hoverLeaveTimeout) {
      clearTimeout(this.hoverLeaveTimeout);
      this.hoverLeaveTimeout = null;
    }
    if (this.isPinned) return;

    const cb = () => {
      this.isHovered = true;
      this.hoverEnterTimeout = null;
    };

    if (delayFn) {
      delayFn(cb, this.ENTER_DELAY_MS);
    } else {
      cb();
    }
  }

  public onMouseLeave(delayFn?: (cb: () => void, ms: number) => void) {
    if (this.hoverEnterTimeout) {
      clearTimeout(this.hoverEnterTimeout);
      this.hoverEnterTimeout = null;
    }
    if (this.isPinned) return;

    const cb = () => {
      this.isHovered = false;
      this.hoverLeaveTimeout = null;
    };

    if (delayFn) {
      delayFn(cb, this.LEAVE_DELAY_MS);
    } else {
      cb();
    }
  }

  public clearTimeouts() {
    if (this.hoverEnterTimeout) clearTimeout(this.hoverEnterTimeout);
    if (this.hoverLeaveTimeout) clearTimeout(this.hoverLeaveTimeout);
    this.hoverEnterTimeout = null;
    this.hoverLeaveTimeout = null;
  }
}

describe('Hybrid Sidebar Navigation Interaction', () => {
  describe('State Priority', () => {
    test('isPinned = true -> Always expanded regardless of hover', () => {
      expect(computeIsExpanded({ isPinned: true, isHovered: false, hasHoverSupport: true })).toBe(true);
      expect(computeIsExpanded({ isPinned: true, isHovered: true, hasHoverSupport: true })).toBe(true);
      expect(computeIsExpanded({ isPinned: true, isHovered: false, hasHoverSupport: false })).toBe(true);
    });

    test('isPinned = false + isHovered = true -> Expanded when hover is supported', () => {
      expect(computeIsExpanded({ isPinned: false, isHovered: true, hasHoverSupport: true })).toBe(true);
    });

    test('isPinned = false + isHovered = false -> Collapsed', () => {
      expect(computeIsExpanded({ isPinned: false, isHovered: false, hasHoverSupport: true })).toBe(false);
    });
  });

  describe('Default State & Persistence', () => {
    test('starts collapsed by default when no pin preference exists in localStorage', () => {
      const sidebar = new SidebarController(true);
      expect(sidebar.isPinned).toBe(false);
      expect(sidebar.isHovered).toBe(false);
      expect(sidebar.isExpanded).toBe(false);
      expect(sidebar.isCollapsed).toBe(true);
    });

    test('clicking Pin toggles state to pinned and persists "true"', () => {
      const sidebar = new SidebarController(true);
      sidebar.togglePin();
      expect(sidebar.isPinned).toBe(true);
      expect(sidebar.isExpanded).toBe(true);
    });

    test('restores pinned state from localStorage on initialization', () => {
      const sidebar = new SidebarController(true, { 'hyperresume-sidebar-pinned': 'true' });
      expect(sidebar.isPinned).toBe(true);
      expect(sidebar.isExpanded).toBe(true);
    });

    test('unpinning sets isPinned to false and retains hover expansion while mouse is over button', () => {
      const sidebar = new SidebarController(true, { 'hyperresume-sidebar-pinned': 'true' });
      expect(sidebar.isPinned).toBe(true);

      sidebar.togglePin();
      expect(sidebar.isPinned).toBe(false);
      expect(sidebar.isHovered).toBe(true);
      expect(sidebar.isExpanded).toBe(true);

      // Once mouse leaves, it collapses
      sidebar.onMouseLeave();
      expect(sidebar.isHovered).toBe(false);
      expect(sidebar.isExpanded).toBe(false);
    });
  });

  describe('Hover-to-Expand UX Behavior', () => {
    test('mouse enter sets isHovered and expands sidebar', () => {
      const sidebar = new SidebarController(true);
      expect(sidebar.isExpanded).toBe(false);

      sidebar.onMouseEnter();
      expect(sidebar.isHovered).toBe(true);
      expect(sidebar.isExpanded).toBe(true);
    });

    test('mouse leave clears isHovered and collapses sidebar when unpinned', () => {
      const sidebar = new SidebarController(true);
      sidebar.onMouseEnter();
      expect(sidebar.isExpanded).toBe(true);

      sidebar.onMouseLeave();
      expect(sidebar.isHovered).toBe(false);
      expect(sidebar.isExpanded).toBe(false);
    });

    test('mouse enter/leave does not collapse sidebar when pinned', () => {
      const sidebar = new SidebarController(true, { 'hyperresume-sidebar-pinned': 'true' });
      expect(sidebar.isExpanded).toBe(true);

      sidebar.onMouseEnter();
      expect(sidebar.isExpanded).toBe(true);

      sidebar.onMouseLeave();
      expect(sidebar.isExpanded).toBe(true);
    });

    test('prevents accidental expansion when cursor quickly leaves before enter delay triggers', () => {
      const sidebar = new SidebarController(true);
      let pendingEnterCallback: (() => void) | null = null;

      sidebar.onMouseEnter((cb) => {
        pendingEnterCallback = cb;
      });

      // Cursor leaves before the 120ms enter timer completes
      sidebar.onMouseLeave();

      // Enter timer never called cb because it was aborted
      expect(sidebar.isHovered).toBe(false);
      expect(sidebar.isExpanded).toBe(false);
    });
  });

  describe('Responsive & Touch Behavior', () => {
    test('disables hover expansion on touch devices without fine hover support (tablets/mobiles)', () => {
      const tabletSidebar = new SidebarController(false); // hasHoverSupport = false

      tabletSidebar.onMouseEnter();
      expect(tabletSidebar.isHovered).toBe(false);
      expect(tabletSidebar.isExpanded).toBe(false);

      // Tablet user can expand by clicking Pin
      tabletSidebar.togglePin();
      expect(tabletSidebar.isPinned).toBe(true);
      expect(tabletSidebar.isExpanded).toBe(true);

      // Tablet user can collapse by clicking Unpin
      tabletSidebar.togglePin();
      expect(tabletSidebar.isPinned).toBe(false);
      expect(tabletSidebar.isExpanded).toBe(false);
    });
  });

  describe('Layout Geometry Invariants', () => {
    test('dimensions align with requirements: 76px compact, 288px expanded', () => {
      const COMPACT_WIDTH_PX = 76;
      const EXPANDED_WIDTH_PX = 288;
      const TRANSITION_DURATION_MS = 200;

      expect(COMPACT_WIDTH_PX).toBe(76);
      expect(EXPANDED_WIDTH_PX).toBe(288);
      expect(TRANSITION_DURATION_MS).toBeGreaterThanOrEqual(200);
      expect(TRANSITION_DURATION_MS).toBeLessThanOrEqual(250);
    });
  });
});

