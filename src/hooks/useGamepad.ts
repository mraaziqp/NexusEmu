import { useEffect, useCallback, useRef } from 'react';

export type GPAction =
  | 'confirm' | 'cancel'
  | 'up' | 'down' | 'left' | 'right'
  | 'lb' | 'rb' | 'menu';

type GPHandler = (action: GPAction) => void;

// ─── Singleton polling loop (shared across all hook instances) ────────────────
let rafId: number | null = null;
const handlers = new Set<GPHandler>();
const prevPressed: boolean[] = [];
let lastStickDir: GPAction | null = null;
let lastStickTime = 0;

const BTN_MAP: Record<number, GPAction> = {
  0:  'confirm',  // A / Cross
  1:  'cancel',   // B / Circle
  4:  'lb',       // L1 / LB
  5:  'rb',       // R1 / RB
  8:  'menu',     // Select / Share
  12: 'up',
  13: 'down',
  14: 'left',
  15: 'right',
};

function poll() {
  const pads = navigator.getGamepads?.() ?? [];
  for (const pad of pads) {
    if (!pad) continue;

    // Rising-edge button detection
    pad.buttons.forEach((btn, i) => {
      if (btn.pressed && !prevPressed[i]) {
        const action = BTN_MAP[i];
        if (action) handlers.forEach(h => h(action));
      }
      prevPressed[i] = btn.pressed;
    });

    // Left analog stick with repeat throttle (160 ms)
    const ax = pad.axes[0] ?? 0;
    const ay = pad.axes[1] ?? 0;
    const DEAD = 0.45;
    const now = Date.now();
    let dir: GPAction | null = null;
    if (Math.abs(ax) > DEAD || Math.abs(ay) > DEAD) {
      dir = Math.abs(ax) > Math.abs(ay)
        ? (ax > 0 ? 'right' : 'left')
        : (ay > 0 ? 'down' : 'up');
    }
    if (dir) {
      if (dir !== lastStickDir || now - lastStickTime > 160) {
        handlers.forEach(h => h(dir!));
        lastStickDir = dir;
        lastStickTime = now;
      }
    } else {
      lastStickDir = null;
    }
  }
  rafId = requestAnimationFrame(poll);
}

/**
 * Subscribe a handler to gamepad events.
 * The loop auto-starts when the first subscriber registers.
 */
export function useGamepad(handler: GPHandler, active = true) {
  const ref = useRef(handler);
  ref.current = handler;
  const stable = useCallback<GPHandler>((a) => ref.current(a), []);

  useEffect(() => {
    if (!active) return;
    handlers.add(stable);
    if (handlers.size === 1 && rafId === null) rafId = requestAnimationFrame(poll);
    return () => {
      handlers.delete(stable);
      if (handlers.size === 0 && rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
  }, [stable, active]);
}

// ─── DOM spatial navigation helpers ──────────────────────────────────────────

/** Return all elements marked with data-gpnav within a given root. */
export function getNavItems(root: Element | Document = document): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-gpnav]'));
}

/** Move the controller focus highlight to a specific index in items[]. */
export function setNavFocus(items: HTMLElement[], index: number): void {
  const clamped = Math.max(0, Math.min(items.length - 1, index));
  items.forEach((el, i) => {
    if (i === clamped) el.setAttribute('data-gpfocus', '');
    else el.removeAttribute('data-gpfocus');
  });
  items[clamped]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

/** Remove controller focus from all elements. */
export function clearNavFocus(): void {
  document.querySelectorAll('[data-gpfocus]').forEach(el => el.removeAttribute('data-gpfocus'));
}

/** Click the currently focused element. */
export function clickFocused(): void {
  (document.querySelector('[data-gpfocus]') as HTMLElement | null)?.click();
}
