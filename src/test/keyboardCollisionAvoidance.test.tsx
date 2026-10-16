import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import indexHtmlRaw from '../../index.html?raw';
import {
  initKeyboardAvoidance,
  resetKeyboardAvoidanceForTesting,
  getSensoryScrollBehavior,
  getVirtualKeyboardState,
  isTextInputElement,
  scrollElementIntoSafeView,
} from '../utils/keyboardAvoidance';
import { useVirtualKeyboard } from '../hooks/useVirtualKeyboard';
import { Modal } from '../components/ui/Modal';
import { ChatbotDrawer } from '../components/chatbot/ChatbotDrawer';

describe('RIMA Mobile Touch Ergonomics & Virtual Keyboard Collision Avoidance', () => {
  let originalVisualViewport: VisualViewport | null | undefined;
  let mockVisualViewport: {
    width: number;
    height: number;
    offsetTop: number;
    pageTop: number;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
    dispatchEvent: ReturnType<typeof vi.fn>;
  };
  let listeners: Record<string, ((e?: Event) => void)[]> = {};

  beforeEach(() => {
    vi.useFakeTimers();
    listeners = {};
    resetKeyboardAvoidanceForTesting();

    originalVisualViewport = window.visualViewport;

    mockVisualViewport = {
      width: 390,
      height: 844,
      offsetTop: 0,
      pageTop: 0,
      addEventListener: vi.fn((event: string, cb: (e?: Event) => void) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(cb);
      }),
      removeEventListener: vi.fn((event: string, cb: (e?: Event) => void) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter(l => l !== cb);
        }
      }),
      dispatchEvent: vi.fn(),
    };

    Object.defineProperty(window, 'visualViewport', {
      value: mockVisualViewport,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, 'innerWidth', {
      value: 390,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, 'innerHeight', {
      value: 844,
      writable: true,
      configurable: true,
    });

    document.documentElement.removeAttribute('data-sensory');
    document.documentElement.removeAttribute('data-keyboard-open');
    document.documentElement.style.removeProperty('--keyboard-height');
    document.documentElement.style.removeProperty('--visual-viewport-height');
    document.documentElement.style.removeProperty('--keyboard-offset-bottom');
    document.documentElement.style.removeProperty('--scroll-padding-bottom');
  });

  afterEach(() => {
    resetKeyboardAvoidanceForTesting();
    vi.useRealTimers();
    Object.defineProperty(window, 'visualViewport', {
      value: originalVisualViewport,
      writable: true,
      configurable: true,
    });
  });

  describe('R1. Viewport & VisualViewport Detection Mechanism', () => {
    it('verifies index.html specifies interactive-widget=resizes-content in meta viewport', () => {
      expect(indexHtmlRaw).toMatch(/<meta\s+name=["']viewport["']\s+content=["'][^"']*interactive-widget=resizes-content[^"']*["']/i);
    });

    it('initializes default CSS variables and listeners on mount', () => {
      const cleanup = initKeyboardAvoidance();

      expect(mockVisualViewport.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function), { passive: true });
      expect(mockVisualViewport.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });

      expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('0px');
      expect(document.documentElement.style.getPropertyValue('--visual-viewport-height')).toBe('844px');
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('false');

      cleanup();
    });

    it('detects virtual keyboard opening when visualViewport height shrinks by > 150px', () => {
      const cleanup = initKeyboardAvoidance();
      const keyboardChangeSpy = vi.fn();
      window.addEventListener('virtualkeyboardchange', keyboardChangeSpy);

      // Simulate keyboard open: height shrinks from 844 to 500 (344px keyboard)
      mockVisualViewport.height = 500;
      listeners['resize']?.forEach(cb => cb());

      expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('344px');
      expect(document.documentElement.style.getPropertyValue('--visual-viewport-height')).toBe('500px');
      expect(document.documentElement.style.getPropertyValue('--keyboard-offset-bottom')).toBe('344px');
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('true');

      expect(keyboardChangeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: {
            isKeyboardOpen: true,
            keyboardHeight: 344,
            visualViewportHeight: 500,
          },
        })
      );

      window.removeEventListener('virtualkeyboardchange', keyboardChangeSpy);
      cleanup();
    });

    it('detects virtual keyboard closing when visualViewport restores to full height', () => {
      const cleanup = initKeyboardAvoidance();

      // Open keyboard
      mockVisualViewport.height = 500;
      listeners['resize']?.forEach(cb => cb());
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('true');

      // Close keyboard
      mockVisualViewport.height = 844;
      listeners['resize']?.forEach(cb => cb());

      expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('0px');
      expect(document.documentElement.style.getPropertyValue('--visual-viewport-height')).toBe('844px');
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('false');

      cleanup();
    });

    it('ignores small address bar collapse/expand variations (< 150px difference)', () => {
      const cleanup = initKeyboardAvoidance();

      // Simulate address bar shrinking by 50px (e.g. scrolling on mobile browser)
      mockVisualViewport.height = 794;
      listeners['resize']?.forEach(cb => cb());

      expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('0px');
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('false');

      cleanup();
    });

    it('cleans up all registered listeners and resets CSS properties when unmounted', () => {
      const cleanup = initKeyboardAvoidance();

      // Simulate keyboard open
      mockVisualViewport.height = 500;
      listeners['resize']?.forEach(cb => cb());
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('true');

      cleanup();

      expect(mockVisualViewport.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(mockVisualViewport.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('');
      expect(document.documentElement.style.getPropertyValue('--visual-viewport-height')).toBe('');
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBeNull();
    });

    it('supports multiple subscribers with reference counting without premature teardown', () => {
      const cleanup1 = initKeyboardAvoidance();
      const cleanup2 = initKeyboardAvoidance();

      // Open keyboard
      mockVisualViewport.height = 500;
      listeners['resize']?.forEach(cb => cb());
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('true');

      // First subscriber unmounts (e.g. child component unmounting)
      cleanup1();

      // Keyboard avoidance should still remain active because cleanup2 is still alive!
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('true');
      expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('344px');

      // Resize event still works
      mockVisualViewport.height = 844;
      listeners['resize']?.forEach(cb => cb());
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('false');

      // Final subscriber unmounts -> now full teardown occurs
      cleanup2();
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBeNull();
      expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('');
    });

    it('detects virtual keyboard on Android Chrome where interactive-widget=resizes-content shrinks window.innerHeight', () => {
      // Set initial un-obscured baseline
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true, configurable: true });
      mockVisualViewport.height = 800;

      const cleanup = initKeyboardAvoidance();

      // Android Chrome resizes layout viewport: BOTH innerHeight and visualViewport shrink to 500
      Object.defineProperty(window, 'innerHeight', { value: 500, writable: true, configurable: true });
      mockVisualViewport.height = 500;
      listeners['resize']?.forEach(cb => cb());

      // Must be detected as open with 300px keyboard
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('true');
      expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('300px');
      expect(document.documentElement.style.getPropertyValue('--visual-viewport-height')).toBe('500px');
      // Fixed element offset must be 0px on Android because layout viewport already shrank!
      expect(document.documentElement.style.getPropertyValue('--keyboard-offset-bottom')).toBe('0px');
      // Scroll padding is safely bounded
      expect(document.documentElement.style.getPropertyValue('--scroll-padding-bottom')).toBe('32px');

      // Closing keyboard restores both to 800
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true, configurable: true });
      mockVisualViewport.height = 800;
      listeners['resize']?.forEach(cb => cb());

      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('false');
      expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('0px');
      expect(document.documentElement.style.getPropertyValue('--keyboard-offset-bottom')).toBe('0px');

      cleanup();
    });

    it('handles orientation change without false keyboard detection', () => {
      Object.defineProperty(window, 'innerWidth', { value: 390, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 844, writable: true, configurable: true });
      mockVisualViewport.width = 390;
      mockVisualViewport.height = 844;

      const cleanup = initKeyboardAvoidance();

      // Rotate to landscape: width becomes 844, height becomes 390
      Object.defineProperty(window, 'innerWidth', { value: 844, writable: true, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 390, writable: true, configurable: true });
      mockVisualViewport.width = 844;
      mockVisualViewport.height = 390;

      listeners['resize']?.forEach(cb => cb());
      window.dispatchEvent(new Event('orientationchange'));
      vi.advanceTimersByTime(150);

      // Should NOT be detected as keyboard open
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('false');
      expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('0px');

      cleanup();
    });
  });

  describe('R2. Accessibility & Sensory-Aware Motion Scroll Behavior', () => {
    it('returns "auto" when data-sensory="low-stimulation" is active', () => {
      document.documentElement.setAttribute('data-sensory', 'low-stimulation');
      expect(getSensoryScrollBehavior()).toBe('auto');
    });

    it('returns "auto" when data-sensory="calm" is active', () => {
      document.documentElement.setAttribute('data-sensory', 'calm');
      expect(getSensoryScrollBehavior()).toBe('auto');
    });

    it('returns "auto" when prefers-reduced-motion media query matches', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(getSensoryScrollBehavior()).toBe('auto');
    });

    it('returns "smooth" by default when neither low-stimulation nor reduced-motion is requested', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: false });
      document.documentElement.removeAttribute('data-sensory');
      expect(getSensoryScrollBehavior()).toBe('smooth');
    });
  });

  describe('R2. Input Detection & Safe-View Alignment', () => {
    it('accurately identifies text inputs and textareas as text input elements', () => {
      const textInput = document.createElement('input');
      textInput.type = 'text';
      expect(isTextInputElement(textInput)).toBe(true);

      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      expect(isTextInputElement(emailInput)).toBe(true);

      const textarea = document.createElement('textarea');
      expect(isTextInputElement(textarea)).toBe(true);

      const contentEditable = document.createElement('div');
      contentEditable.setAttribute('contenteditable', 'true');
      expect(isTextInputElement(contentEditable)).toBe(true);
    });

    it('rejects non-text inputs such as checkbox, radio, button, and hidden fields', () => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      expect(isTextInputElement(checkbox)).toBe(false);

      const radio = document.createElement('input');
      radio.type = 'radio';
      expect(isTextInputElement(radio)).toBe(false);

      const submitBtn = document.createElement('input');
      submitBtn.type = 'submit';
      expect(isTextInputElement(submitBtn)).toBe(false);

      const nullEl = null;
      expect(isTextInputElement(nullEl)).toBe(false);
    });

    it('rejects readonly and disabled inputs from triggering keyboard avoidance', () => {
      const readonlyInput = document.createElement('input');
      readonlyInput.type = 'text';
      readonlyInput.readOnly = true;
      expect(isTextInputElement(readonlyInput)).toBe(false);

      const disabledInput = document.createElement('input');
      disabledInput.type = 'text';
      disabledInput.disabled = true;
      expect(isTextInputElement(disabledInput)).toBe(false);

      const readonlyTextarea = document.createElement('textarea');
      readonlyTextarea.readOnly = true;
      expect(isTextInputElement(readonlyTextarea)).toBe(false);

      const disabledTextarea = document.createElement('textarea');
      disabledTextarea.disabled = true;
      expect(isTextInputElement(disabledTextarea)).toBe(false);
    });

    it('delegates focusin events and triggers scrollIntoView on focused text input', () => {
      const cleanup = initKeyboardAvoidance();

      const container = document.createElement('div');
      const input = document.createElement('input');
      input.type = 'text';
      input.scrollIntoView = vi.fn();
      container.appendChild(input);
      document.body.appendChild(container);

      // Trigger focusin
      fireEvent.focusIn(input);

      // Advance timers to trigger deferred scroll
      vi.advanceTimersByTime(120);

      expect(input.scrollIntoView).toHaveBeenCalledWith(
        expect.objectContaining({
          behavior: expect.stringMatching(/smooth|auto/),
          block: 'nearest',
        })
      );

      cleanup();
      document.body.removeChild(container);
    });

    it('respects instant scroll behavior when low-stimulation mode is active during input focus', () => {
      document.documentElement.setAttribute('data-sensory', 'low-stimulation');
      const cleanup = initKeyboardAvoidance();

      const input = document.createElement('input');
      input.type = 'text';
      input.scrollIntoView = vi.fn();
      document.body.appendChild(input);

      scrollElementIntoSafeView(input, { delayMs: 50 });
      vi.advanceTimersByTime(60);

      expect(input.scrollIntoView).toHaveBeenCalledWith(
        expect.objectContaining({
          behavior: 'auto',
        })
      );

      cleanup();
      document.body.removeChild(input);
    });
  });

  describe('R2. Modal & Dialog Touch Ergonomics Integration', () => {
    it('renders modal dialog with accessible attributes and retains action accessibility', () => {
      const onCloseSpy = vi.fn();
      const onSaveSpy = vi.fn();

      render(
        <Modal isOpen={true} onClose={onCloseSpy} title="CBT Restructuring Dialog">
          <div>
            <label htmlFor="test-modal-input">Pikiran Otomatis</label>
            <input id="test-modal-input" type="text" defaultValue="Pikiran cemas" />
            <div className="modal-footer">
              <button type="button" onClick={onCloseSpy}>Batal</button>
              <button type="button" onClick={onSaveSpy}>Simpan</button>
            </div>
          </div>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('CBT Restructuring Dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Simpan/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Batal/i })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Simpan/i }));
      expect(onSaveSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('useVirtualKeyboard React Hook', () => {
    it('returns current keyboard metrics and reactive state updates', () => {
      const { result } = renderHook(() => useVirtualKeyboard());

      expect(result.current.isKeyboardOpen).toBe(false);
      expect(result.current.keyboardHeight).toBe(0);
      expect(result.current.visualViewportHeight).toBe(844);
      expect(typeof result.current.scrollIntoSafeView).toBe('function');

      // Dispatch custom keyboard event
      act(() => {
        window.dispatchEvent(
          new CustomEvent('virtualkeyboardchange', {
            detail: {
              isKeyboardOpen: true,
              keyboardHeight: 320,
              visualViewportHeight: 524,
            },
          })
        );
      });

      expect(result.current.isKeyboardOpen).toBe(true);
      expect(result.current.keyboardHeight).toBe(320);
      expect(result.current.visualViewportHeight).toBe(524);
    });

    it('unmounting a hook consumer does not tear down global avoidance when another subscriber is active', () => {
      const globalCleanup = initKeyboardAvoidance();

      const { unmount } = renderHook(() => useVirtualKeyboard());

      // Open keyboard
      act(() => {
        mockVisualViewport.height = 500;
        listeners['resize']?.forEach(cb => cb());
      });
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('true');

      // Unmount the component hook
      unmount();

      // Global avoidance must still be intact because globalCleanup is active!
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('true');
      expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('344px');

      globalCleanup();
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBeNull();
    });

    it('initializes useVirtualKeyboard with active state if mounted when keyboard is already open', () => {
      const globalCleanup = initKeyboardAvoidance();

      // Keyboard opens before hook mounts
      act(() => {
        mockVisualViewport.height = 500;
        listeners['resize']?.forEach(cb => cb());
      });

      expect(getVirtualKeyboardState().isKeyboardOpen).toBe(true);
      expect(getVirtualKeyboardState().keyboardHeight).toBe(344);

      const { result } = renderHook(() => useVirtualKeyboard());

      expect(result.current.isKeyboardOpen).toBe(true);
      expect(result.current.keyboardHeight).toBe(344);
      expect(result.current.visualViewportHeight).toBe(500);

      globalCleanup();
    });
  });

  describe('Adversarial Stress Cases: Split-Screen, Scroll Frame Debounce, & Drawer Scroll Lock', () => {
    it('handles gradual split-screen vertical resizing without false positive keyboard detection, and detects keyboard inside split-screen', () => {
      Object.defineProperty(window, 'innerHeight', { value: 800, writable: true, configurable: true });
      mockVisualViewport.height = 800;

      const cleanup = initKeyboardAvoidance();

      // Step 1: Drag split-screen divider down gradually in steps <= 150px
      Object.defineProperty(window, 'innerHeight', { value: 720, writable: true, configurable: true });
      mockVisualViewport.height = 720;
      listeners['resize']?.forEach(cb => cb());
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('false');

      Object.defineProperty(window, 'innerHeight', { value: 620, writable: true, configurable: true });
      mockVisualViewport.height = 620;
      listeners['resize']?.forEach(cb => cb());
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('false');

      Object.defineProperty(window, 'innerHeight', { value: 500, writable: true, configurable: true });
      mockVisualViewport.height = 500;
      listeners['resize']?.forEach(cb => cb());
      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('false');
      expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('0px');

      // Step 2: Now in the 500px split-screen view, user focuses input and keyboard opens (height drops from 500 to 280)
      Object.defineProperty(window, 'innerHeight', { value: 280, writable: true, configurable: true });
      mockVisualViewport.height = 280;
      listeners['resize']?.forEach(cb => cb());

      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('true');
      expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('220px');
      expect(document.documentElement.style.getPropertyValue('--visual-viewport-height')).toBe('280px');

      // Step 3: Keyboard closes in split-screen, restores to 500px
      Object.defineProperty(window, 'innerHeight', { value: 500, writable: true, configurable: true });
      mockVisualViewport.height = 500;
      listeners['resize']?.forEach(cb => cb());

      expect(document.documentElement.getAttribute('data-keyboard-open')).toBe('false');
      expect(document.documentElement.style.getPropertyValue('--keyboard-height')).toBe('0px');

      cleanup();
    });

    it('memoizes metrics and suppresses redundant events on visualViewport scroll ticks', () => {
      const cleanup = initKeyboardAvoidance();
      const keyboardChangeSpy = vi.fn();
      window.addEventListener('virtualkeyboardchange', keyboardChangeSpy);

      // Open keyboard
      mockVisualViewport.height = 500;
      listeners['resize']?.forEach(cb => cb());
      expect(keyboardChangeSpy).toHaveBeenCalledTimes(1);

      // Subsequent scroll ticks at 60/120fps with same height should NOT re-dispatch or re-mutate
      listeners['scroll']?.forEach(cb => cb());
      listeners['scroll']?.forEach(cb => cb());
      listeners['scroll']?.forEach(cb => cb());

      expect(keyboardChangeSpy).toHaveBeenCalledTimes(1);

      window.removeEventListener('virtualkeyboardchange', keyboardChangeSpy);
      cleanup();
    });

    it('debounces rapid focus switching so only the active element scrolls into view', () => {
      const cleanup = initKeyboardAvoidance();

      const inputA = document.createElement('input');
      inputA.type = 'text';
      inputA.scrollIntoView = vi.fn();

      const inputB = document.createElement('input');
      inputB.type = 'text';
      inputB.scrollIntoView = vi.fn();

      document.body.appendChild(inputA);
      document.body.appendChild(inputB);

      // Focus inputA
      inputA.focus();
      fireEvent.focusIn(inputA);

      // Advance by 40ms, then focus moves quickly to inputB before 100ms delay expires
      vi.advanceTimersByTime(40);
      inputB.focus();
      fireEvent.focusIn(inputB);

      // Complete all timers
      vi.advanceTimersByTime(120);

      // inputA scroll should have been cancelled or suppressed; only inputB should scroll
      expect(inputA.scrollIntoView).not.toHaveBeenCalled();
      expect(inputB.scrollIntoView).toHaveBeenCalledTimes(1);

      cleanup();
      document.body.removeChild(inputA);
      document.body.removeChild(inputB);
    });

    it('accurately identifies contenteditable elements in isTextInputElement', () => {
      const contentEditableTrue = document.createElement('div');
      contentEditableTrue.setAttribute('contenteditable', 'true');
      expect(isTextInputElement(contentEditableTrue)).toBe(true);

      const contentEditableEmpty = document.createElement('div');
      contentEditableEmpty.setAttribute('contenteditable', '');
      expect(isTextInputElement(contentEditableEmpty)).toBe(true);

      const nonEditable = document.createElement('div');
      expect(isTextInputElement(nonEditable)).toBe(false);
    });

    it('locks body scroll when ChatbotDrawer is open and restores upon close', () => {
      document.body.style.overflow = 'auto';

      const { unmount } = render(
        <MemoryRouter>
          <ChatbotDrawer isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      );

      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('auto');
    });

    it('synchronizes useVirtualKeyboard state immediately when mounted alone with shrunken visualViewport without prior global setup', () => {
      // Simulate visualViewport already shrunk BEFORE hook mounts, with no pre-existing avoidance setup
      mockVisualViewport.height = 480;

      const { result } = renderHook(() => useVirtualKeyboard());

      expect(result.current.isKeyboardOpen).toBe(true);
      expect(result.current.keyboardHeight).toBe(364);
      expect(result.current.visualViewportHeight).toBe(480);
    });

    it('suppresses deferred scroll on input when focus moves quickly to a button before delay expires', () => {
      const cleanup = initKeyboardAvoidance();

      const input = document.createElement('input');
      input.type = 'text';
      input.scrollIntoView = vi.fn();

      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Batal';

      document.body.appendChild(input);
      document.body.appendChild(button);

      // Focus input
      input.focus();
      fireEvent.focusIn(input);

      // Within 50ms, user clicks "Batal" button
      vi.advanceTimersByTime(50);
      button.focus();

      // Complete all timers
      vi.advanceTimersByTime(100);

      // Input scroll must be suppressed because activeElement is now the button
      expect(input.scrollIntoView).not.toHaveBeenCalled();

      cleanup();
      document.body.removeChild(input);
      document.body.removeChild(button);
    });

    it('handles explicit offsetBottom in scrollElementIntoSafeView using window.scrollBy when element extends into offset margin', () => {
      const scrollBySpy = vi.fn();
      window.scrollBy = scrollBySpy;

      const input = document.createElement('input');
      input.type = 'text';
      input.scrollIntoView = vi.fn();
      // Mock getBoundingClientRect so input bottom is at 780px in an 844px viewport with 100px offset
      input.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 740,
        bottom: 780,
        height: 40,
        left: 0,
        right: 300,
        width: 300,
      });
      document.body.appendChild(input);

      // Safe area bottom is 844 - 100 = 744px. Rect bottom is 780px -> needs 36px additional scroll
      scrollElementIntoSafeView(input, { delayMs: 10, offsetBottom: 100, force: true });
      vi.advanceTimersByTime(20);

      expect(input.scrollIntoView).toHaveBeenCalled();
      expect(scrollBySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          top: 36,
        })
      );

      document.body.removeChild(input);
    });

    it('honors force: true in scrollElementIntoSafeView even when another element has focus', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.scrollIntoView = vi.fn();

      const otherInput = document.createElement('input');
      otherInput.type = 'text';

      document.body.appendChild(input);
      document.body.appendChild(otherInput);

      otherInput.focus();

      scrollElementIntoSafeView(input, { delayMs: 10, force: true });
      vi.advanceTimersByTime(20);

      expect(input.scrollIntoView).toHaveBeenCalled();

      document.body.removeChild(input);
      document.body.removeChild(otherInput);
    });
  });
});
