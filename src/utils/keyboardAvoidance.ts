/**
 * Keyboard Avoidance & Viewport Ergonomics Utility
 * Provides cross-platform virtual keyboard detection (Android/iOS) via window.visualViewport,
 * dynamic CSS variable injection, sensory-aware scroll behaviors, and safe-view alignment
 * for form inputs, modals, wizards, and interactive drawers.
 */

export interface VirtualKeyboardState {
  isKeyboardOpen: boolean;
  keyboardHeight: number;
  visualViewportHeight: number;
}

const VIRTUAL_KEYBOARD_THRESHOLD_PX = 150;
const DEFAULT_SCROLL_PADDING_BOTTOM = 84;

/**
 * Determines whether scroll behavior should be instant ('auto') or animated ('smooth')
 * based on user sensory preference and prefers-reduced-motion settings.
 */
export const getSensoryScrollBehavior = (): ScrollBehavior => {
  if (typeof window === 'undefined') return 'auto';

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sensoryAttribute = document.documentElement.getAttribute('data-sensory');
  const isLowStimulation = sensoryAttribute === 'low-stimulation' || sensoryAttribute === 'calm';

  return prefersReducedMotion || isLowStimulation ? 'auto' : 'smooth';
};

/**
 * Checks whether the targeted HTML element is an interactive text input or textarea.
 */
export const isTextInputElement = (element: Element | null): element is HTMLInputElement | HTMLTextAreaElement => {
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();

  if (tagName === 'textarea') {
    const textareaEl = element as HTMLTextAreaElement;
    return !textareaEl.readOnly && !textareaEl.disabled;
  }

  if (tagName === 'input') {
    const inputEl = element as HTMLInputElement;
    if (inputEl.readOnly || inputEl.disabled) return false;
    const nonTextTypes = new Set(['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit']);
    return !nonTextTypes.has(inputEl.type?.toLowerCase());
  }

  const htmlEl = element as HTMLElement;
  if (htmlEl.isContentEditable || element.getAttribute('contenteditable') === 'true' || element.getAttribute('contenteditable') === '') {
    return true;
  }

  return false;
};

let pendingScrollTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Programmatically scrolls an element into the safe visible area above the virtual keyboard and bottom dock.
 * Debounces rapid focus switching so screen doesn't jitter when moving between form fields.
 */
export const scrollElementIntoSafeView = (
  element: HTMLElement,
  options?: { offsetBottom?: number; block?: ScrollLogicalPosition; delayMs?: number; force?: boolean }
): void => {
  if (typeof window === 'undefined' || !element) return;

  if (pendingScrollTimer !== null) {
    clearTimeout(pendingScrollTimer);
    pendingScrollTimer = null;
  }

  const behavior = getSensoryScrollBehavior();
  const delay = options?.delayMs ?? 100;

  // Defer slightly to allow mobile keyboard appearance and layout recalculation
  pendingScrollTimer = setTimeout(() => {
    pendingScrollTimer = null;
    if (!document.contains(element)) return;

    // Fast-focus switching guard: do not scroll an element that already lost focus to another interactive element or button
    const isAnotherElementActive =
      document.activeElement &&
      document.activeElement !== document.body &&
      document.activeElement !== document.documentElement &&
      document.activeElement !== element &&
      !element.contains(document.activeElement);

    if (!options?.force && isAnotherElementActive) {
      return;
    }

    try {
      element.scrollIntoView({
        behavior,
        block: options?.block || 'nearest',
        inline: 'nearest',
      });
    } catch {
      element.scrollIntoView();
    }

    // Support explicit bottom offset clearance if requested
    if (options?.offsetBottom && options.offsetBottom > 0 && typeof window.scrollBy === 'function') {
      try {
        const rect = element.getBoundingClientRect?.();
        const currentVv = window.visualViewport;
        const currentHeight = currentVv ? currentVv.height : window.innerHeight;
        const safeBottom = currentHeight - options.offsetBottom;
        if (rect && rect.bottom > safeBottom) {
          window.scrollBy({ top: Math.round(rect.bottom - safeBottom), behavior });
        }
      } catch {
        // Safe fallback in minimal/mock test environments
      }
    }
  }, delay);
};

let refCount = 0;
let teardownListeners: (() => void) | null = null;
let baselineHeight = 0;
let lastWidth = 0;
let orientationTimer: ReturnType<typeof setTimeout> | null = null;

let currentKeyboardState: VirtualKeyboardState = {
  isKeyboardOpen: false,
  keyboardHeight: 0,
  visualViewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
};

let lastReportedMetrics: {
  isKeyboardOpen: boolean;
  keyboardHeight: number;
  visualViewportHeight: number;
  keyboardOffsetBottom: number;
  scrollPaddingBottom: number;
} | null = null;

/**
 * Synchronous snapshot getter for current virtual keyboard status.
 */
export const getVirtualKeyboardState = (): VirtualKeyboardState => {
  return {
    isKeyboardOpen: currentKeyboardState.isKeyboardOpen,
    keyboardHeight: currentKeyboardState.keyboardHeight,
    visualViewportHeight: currentKeyboardState.visualViewportHeight,
  };
};

/**
 * Test helper to reset reference counter and teardown global listeners.
 */
export const resetKeyboardAvoidanceForTesting = (): void => {
  if (orientationTimer !== null) {
    clearTimeout(orientationTimer);
    orientationTimer = null;
  }
  if (pendingScrollTimer !== null) {
    clearTimeout(pendingScrollTimer);
    pendingScrollTimer = null;
  }
  if (teardownListeners) {
    teardownListeners();
    teardownListeners = null;
  }
  refCount = 0;
  baselineHeight = 0;
  lastWidth = 0;
  lastReportedMetrics = null;
  currentKeyboardState = {
    isKeyboardOpen: false,
    keyboardHeight: 0,
    visualViewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
  };
};

const setupKeyboardAvoidance = (): (() => void) => {
  const root = document.documentElement;
  const vv = window.visualViewport;

  lastWidth = window.innerWidth;
  baselineHeight = Math.max(window.innerHeight, currentVvHeight(vv));

  const updateKeyboardMetrics = () => {
    const currentVv = window.visualViewport;
    const currentWindowHeight = window.innerHeight;
    const currentWidth = window.innerWidth;

    // Detect orientation flip / desktop window resize
    if (Math.abs(currentWidth - lastWidth) > 50) {
      lastWidth = currentWidth;
      baselineHeight = Math.max(currentWindowHeight, currentVv ? Math.round(currentVv.height) : 0);
    }

    let keyboardHeight = 0;
    let visualViewportHeight = currentWindowHeight;

    if (currentVv) {
      visualViewportHeight = Math.round(currentVv.height);
    }

    // iOS style: window.innerHeight stays large, currentVv.height shrinks
    const diffFromVisual = currentVv ? currentWindowHeight - currentVv.height : 0;

    // Android interactive-widget=resizes-content style:
    // window.innerHeight shrinks alongside visualViewport.height relative to baseline un-obscured height
    const currentEffectiveHeight = currentVv ? currentVv.height : currentWindowHeight;
    const diffFromBaseline = baselineHeight - currentEffectiveHeight;

    const heightDifference = Math.max(diffFromVisual, diffFromBaseline);

    if (heightDifference > VIRTUAL_KEYBOARD_THRESHOLD_PX) {
      keyboardHeight = Math.round(heightDifference);
    }

    const isKeyboardOpen = keyboardHeight > 0;

    // Calibrate baseline when keyboard is not open:
    // Follow smooth resizing (split-screen divider, browser chrome expand/collapse) without false positives
    if (!isKeyboardOpen) {
      if (currentEffectiveHeight > baselineHeight || heightDifference <= VIRTUAL_KEYBOARD_THRESHOLD_PX) {
        baselineHeight = Math.round(currentEffectiveHeight);
      }
    }

    // Determine if layout viewport itself shrank (Android Chrome with interactive-widget=resizes-content)
    const layoutViewportResized = (baselineHeight - currentWindowHeight) > VIRTUAL_KEYBOARD_THRESHOLD_PX;

    // Position: fixed elements need offset if layout viewport did NOT shrink (iOS Safari),
    // but need 0 offset if layout viewport already shrunk (Android Chrome) to prevent double offset!
    const keyboardOffsetBottom = (isKeyboardOpen && !layoutViewportResized) ? keyboardHeight : 0;

    // Scroll padding bottom for safe input clearance without double-addition
    const scrollPaddingBottom = isKeyboardOpen
      ? (layoutViewportResized ? 32 : keyboardHeight + 24)
      : DEFAULT_SCROLL_PADDING_BOTTOM;

    // Memoization check: avoid redundant DOM attribute mutations and CustomEvent dispatches
    // during 60fps/120fps visualViewport.scroll events
    if (
      lastReportedMetrics &&
      lastReportedMetrics.isKeyboardOpen === isKeyboardOpen &&
      lastReportedMetrics.keyboardHeight === keyboardHeight &&
      lastReportedMetrics.visualViewportHeight === visualViewportHeight &&
      lastReportedMetrics.keyboardOffsetBottom === keyboardOffsetBottom &&
      lastReportedMetrics.scrollPaddingBottom === scrollPaddingBottom
    ) {
      return;
    }

    lastReportedMetrics = {
      isKeyboardOpen,
      keyboardHeight,
      visualViewportHeight,
      keyboardOffsetBottom,
      scrollPaddingBottom,
    };

    currentKeyboardState = {
      isKeyboardOpen,
      keyboardHeight,
      visualViewportHeight,
    };

    root.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
    root.style.setProperty('--visual-viewport-height', `${visualViewportHeight}px`);
    root.style.setProperty('--keyboard-offset-bottom', `${keyboardOffsetBottom}px`);
    root.style.setProperty('--scroll-padding-bottom', `${scrollPaddingBottom}px`);
    root.setAttribute('data-keyboard-open', isKeyboardOpen ? 'true' : 'false');

    const detail: VirtualKeyboardState = {
      isKeyboardOpen,
      keyboardHeight,
      visualViewportHeight,
    };

    window.dispatchEvent(new CustomEvent('virtualkeyboardchange', { detail }));
  };

  const handleOrientationChange = () => {
    if (orientationTimer !== null) {
      clearTimeout(orientationTimer);
    }
    orientationTimer = setTimeout(() => {
      orientationTimer = null;
      lastWidth = window.innerWidth;
      const currentVv = window.visualViewport;
      baselineHeight = Math.max(window.innerHeight, currentVv ? Math.round(currentVv.height) : 0);
      updateKeyboardMetrics();
    }, 100);
  };

  const handleFocusIn = (e: FocusEvent) => {
    const target = e.target as HTMLElement | null;
    if (isTextInputElement(target)) {
      scrollElementIntoSafeView(target);
    }
  };

  updateKeyboardMetrics();

  if (vv) {
    vv.addEventListener('resize', updateKeyboardMetrics, { passive: true });
    vv.addEventListener('scroll', updateKeyboardMetrics, { passive: true });
  }

  window.addEventListener('resize', updateKeyboardMetrics, { passive: true });
  window.addEventListener('orientationchange', handleOrientationChange, { passive: true });
  if (window.screen?.orientation) {
    window.screen.orientation.addEventListener('change', handleOrientationChange);
  }
  document.addEventListener('focusin', handleFocusIn, { passive: true });

  return () => {
    if (orientationTimer !== null) {
      clearTimeout(orientationTimer);
      orientationTimer = null;
    }
    if (pendingScrollTimer !== null) {
      clearTimeout(pendingScrollTimer);
      pendingScrollTimer = null;
    }
    if (vv) {
      vv.removeEventListener('resize', updateKeyboardMetrics);
      vv.removeEventListener('scroll', updateKeyboardMetrics);
    }
    window.removeEventListener('resize', updateKeyboardMetrics);
    window.removeEventListener('orientationchange', handleOrientationChange);
    if (window.screen?.orientation) {
      window.screen.orientation.removeEventListener('change', handleOrientationChange);
    }
    document.removeEventListener('focusin', handleFocusIn);

    root.style.removeProperty('--keyboard-height');
    root.style.removeProperty('--visual-viewport-height');
    root.style.removeProperty('--keyboard-offset-bottom');
    root.style.removeProperty('--scroll-padding-bottom');
    root.removeAttribute('data-keyboard-open');
    lastReportedMetrics = null;
    currentKeyboardState = {
      isKeyboardOpen: false,
      keyboardHeight: 0,
      visualViewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    };
  };
};

function currentVvHeight(vv: VisualViewport | null | undefined): number {
  return vv ? Math.round(vv.height) : 0;
}

/**
 * Initializes global virtual keyboard avoidance listeners and CSS token synchronization.
 * Uses reference counting so multiple mounting components do not prematurely tear down
 * active listeners when one component unmounts.
 * Returns an unsubscription callback.
 */
export const initKeyboardAvoidance = (): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  refCount++;
  if (refCount === 1) {
    teardownListeners = setupKeyboardAvoidance();
  }

  let cleanedUp = false;
  return () => {
    if (cleanedUp) return;
    cleanedUp = true;
    refCount--;
    if (refCount <= 0) {
      refCount = 0;
      if (teardownListeners) {
        teardownListeners();
        teardownListeners = null;
      }
    }
  };
};
