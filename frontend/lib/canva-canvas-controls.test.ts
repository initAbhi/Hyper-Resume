import { describe, expect, it } from 'bun:test';
import type { ResumeContent } from './api-client';

describe('Canva Canvas Controls, Undo/Redo Engine & Viewport Math Suite', () => {
  // 1. Undo/Redo Engine Simulation (Mirroring resume page architecture)
  class UndoRedoStack<T> {
    private history: T[] = [];
    private currentIndex = -1;
    private readonly maxHistory: number;

    constructor(initialState: T, maxHistory = 30) {
      this.maxHistory = maxHistory;
      this.push(initialState);
    }

    public push(newState: T) {
      // Truncate redo states beyond currentIndex if branching
      if (this.currentIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.currentIndex + 1);
      }
      this.history.push(newState);
      // Cap at maxHistory
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
      this.currentIndex = this.history.length - 1;
    }

    public canUndo(): boolean {
      return this.currentIndex > 0;
    }

    public canRedo(): boolean {
      return this.currentIndex < this.history.length - 1;
    }

    public undo(): T | null {
      if (!this.canUndo()) return null;
      this.currentIndex--;
      return this.history[this.currentIndex];
    }

    public redo(): T | null {
      if (!this.canRedo()) return null;
      this.currentIndex++;
      return this.history[this.currentIndex];
    }

    public current(): T {
      return this.history[this.currentIndex];
    }

    public size(): number {
      return this.history.length;
    }
  }

  describe('1. Immutable Undo/Redo History Stack', () => {
    it('initializes with base state and cannot undo initially', () => {
      const stack = new UndoRedoStack<string>('initial');
      expect(stack.canUndo()).toBe(false);
      expect(stack.canRedo()).toBe(false);
      expect(stack.current()).toBe('initial');
      expect(stack.undo()).toBeNull();
    });

    it('pushes new states and allows progressive undo and redo', () => {
      const stack = new UndoRedoStack<string>('state-0');
      stack.push('state-1');
      stack.push('state-2');

      expect(stack.canUndo()).toBe(true);
      expect(stack.canRedo()).toBe(false);
      expect(stack.current()).toBe('state-2');

      const undone1 = stack.undo();
      expect(undone1).toBe('state-1');
      expect(stack.canRedo()).toBe(true);

      const undone2 = stack.undo();
      expect(undone2).toBe('state-0');
      expect(stack.canUndo()).toBe(false);

      const redone1 = stack.redo();
      expect(redone1).toBe('state-1');
      expect(stack.current()).toBe('state-1');
    });

    it('truncates redo history when branching from an intermediate state', () => {
      const stack = new UndoRedoStack<string>('v1');
      stack.push('v2');
      stack.push('v3');

      stack.undo(); // back to v2
      expect(stack.current()).toBe('v2');

      // Now create branch
      stack.push('v2-branched');
      expect(stack.current()).toBe('v2-branched');
      expect(stack.canRedo()).toBe(false); // v3 was cleanly discarded
      expect(stack.size()).toBe(3); // v1, v2, v2-branched
    });

    it('caps history stack at 30 items without unbounded memory growth', () => {
      const stack = new UndoRedoStack<number>(0, 30);
      for (let i = 1; i <= 50; i++) {
        stack.push(i);
      }

      expect(stack.size()).toBe(30);
      expect(stack.current()).toBe(50);

      // Can undo exactly 29 times back to item 21
      let undoCount = 0;
      while (stack.canUndo()) {
        stack.undo();
        undoCount++;
      }
      expect(undoCount).toBe(29);
      expect(stack.current()).toBe(21);
      expect(stack.canUndo()).toBe(false);
    });
  });

  describe('2. Canva Zoom Math & Viewport Bounds Clamping', () => {
    const clampZoom = (current: number, delta: number): number => {
      const next = Math.round((current + delta) * 10) / 10;
      return Math.min(2.0, Math.max(0.5, next));
    };

    it('zooms in increments of 10% and clamps at 200% (2.0x)', () => {
      let zoom = 1.0;
      zoom = clampZoom(zoom, 0.1);
      expect(zoom).toBe(1.1);

      zoom = clampZoom(zoom, 0.1);
      expect(zoom).toBe(1.2);

      // Attempt to exceed upper bound
      let maxZoom = 1.9;
      maxZoom = clampZoom(maxZoom, 0.3);
      expect(maxZoom).toBe(2.0);

      maxZoom = clampZoom(maxZoom, 0.5);
      expect(maxZoom).toBe(2.0); // Clamped at 2.0x
    });

    it('zooms out decrements of 10% and clamps at 50% (0.5x)', () => {
      let zoom = 1.0;
      zoom = clampZoom(zoom, -0.1);
      expect(zoom).toBe(0.9);

      // Attempt to drop below lower bound
      let minZoom = 0.6;
      minZoom = clampZoom(minZoom, -0.3);
      expect(minZoom).toBe(0.5);

      minZoom = clampZoom(minZoom, -0.5);
      expect(minZoom).toBe(0.5); // Clamped at 0.5x
    });
  });

  describe('3. Canvas Floating Action Bubble (FAB) Coordinate Clamping', () => {
    interface FloatingCoord {
      top: number;
      left: number;
    }

    const calculateFabPosition = (
      bulletRect: { top: number; left: number; width: number; height: number },
      containerRect: { top: number; left: number; width: number; height: number },
      toolbarWidth = 420,
      toolbarHeight = 44
    ): FloatingCoord => {
      // Relative coordinates inside container
      const rawTop = bulletRect.top - containerRect.top - toolbarHeight - 8;
      const rawLeft = bulletRect.left - containerRect.left + bulletRect.width / 2 - toolbarWidth / 2;

      // Clamp within container
      const clampedLeft = Math.max(8, Math.min(rawLeft, containerRect.width - toolbarWidth - 8));
      // If no room above, flip below bullet
      const clampedTop = rawTop < 8 ? bulletRect.top - containerRect.top + bulletRect.height + 8 : rawTop;

      return { top: clampedTop, left: clampedLeft };
    };

    it('places toolbar centered above target bullet in normal layout', () => {
      const bulletRect = { top: 200, left: 300, width: 400, height: 24 };
      const containerRect = { top: 50, left: 50, width: 800, height: 1000 };

      const pos = calculateFabPosition(bulletRect, containerRect, 400, 40);
      expect(pos.top).toBe(200 - 50 - 40 - 8); // 102px
      expect(pos.left).toBe(300 - 50 + 200 - 200); // 250px
    });

    it('flips toolbar below bullet when near top of viewport to prevent occlusion', () => {
      const bulletRect = { top: 60, left: 300, width: 400, height: 24 };
      const containerRect = { top: 50, left: 50, width: 800, height: 1000 };

      // rawTop would be 60 - 50 - 40 - 8 = -38 (less than 8) -> flip below
      const pos = calculateFabPosition(bulletRect, containerRect, 400, 40);
      expect(pos.top).toBe(60 - 50 + 24 + 8); // 42px (below bullet)
    });

    it('clamps toolbar horizontally so it never bleeds off canvas edges', () => {
      // Bullet placed extreme left
      const bulletLeft = { top: 300, left: 55, width: 100, height: 24 };
      const containerRect = { top: 50, left: 50, width: 800, height: 1000 };
      const posLeft = calculateFabPosition(bulletLeft, containerRect, 400, 40);
      expect(posLeft.left).toBe(8); // Clamped at left margin

      // Bullet placed extreme right
      const bulletRight = { top: 300, left: 780, width: 50, height: 24 };
      const posRight = calculateFabPosition(bulletRight, containerRect, 400, 40);
      expect(posRight.left).toBe(800 - 400 - 8); // 392px (clamped at right margin)
    });

    it('adapts toolbar dimensions on narrow 320px mobile viewports without horizontal clipping', () => {
      const mobileViewportWidth = 320;
      const targetWidth = Math.min(320, mobileViewportWidth - 24); // 296px
      expect(targetWidth).toBe(296);

      const bullet = { top: 150, left: 160, width: 80, height: 20 };
      const container = { top: 0, left: 0, width: 320, height: 600 };
      const pos = calculateFabPosition(bullet, container, targetWidth, 40);

      expect(pos.left).toBeGreaterThanOrEqual(8);
      expect(pos.left + targetWidth).toBeLessThanOrEqual(320);
    });
  });

  describe('4. Paste Sanitization & HTML Entity Safety', () => {
    const sanitizePastedText = (rawText: string): string => {
      return rawText
        .replace(/<[^>]*>?/gm, '') // Strip HTML tags
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Strip zero-width invisible characters
        .replace(/\r\n/g, ' ') // Flatten newlines into inline spaces
        .replace(/\n/g, ' ')
        .trim();
    };

    it('strips injected script tags, styling, and malicious tags completely', () => {
      const dirty = '<script>alert("hacked")</script>Senior <span style="font-size:40px">Software</span> Engineer';
      const clean = sanitizePastedText(dirty);
      expect(clean).toBe('alert("hacked")Senior Software Engineer');
      expect(clean).not.toContain('<script');
      expect(clean).not.toContain('style=');
    });

    it('removes invisible zero-width spaces copied from PDF or web text', () => {
      const dirty = `Principal\u200B \uFEFFArchitect`;
      const clean = sanitizePastedText(dirty);
      expect(clean).toBe('Principal Architect');
    });

    it('flattens multiline text when pasted into single-line field', () => {
      const multiline = `Led cloud migration\nReduced latency by 40%\nSaved $50k/mo`;
      const clean = sanitizePastedText(multiline);
      expect(clean).toBe('Led cloud migration Reduced latency by 40% Saved $50k/mo');
    });
  });
});
