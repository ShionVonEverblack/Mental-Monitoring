import { useState, useEffect } from 'react';
import {
  initKeyboardAvoidance,
  getSensoryScrollBehavior,
  scrollElementIntoSafeView,
  getVirtualKeyboardState,
  type VirtualKeyboardState,
} from '../utils/keyboardAvoidance';

export interface UseVirtualKeyboardReturn extends VirtualKeyboardState {
  scrollBehavior: ScrollBehavior;
  scrollIntoSafeView: (element: HTMLElement) => void;
}

/**
 * React hook to reactively track mobile virtual keyboard status,
 * heights, and safe viewport dimensions.
 */
export const useVirtualKeyboard = (): UseVirtualKeyboardReturn => {
  const [state, setState] = useState<VirtualKeyboardState>(getVirtualKeyboardState);

  useEffect(() => {
    // Ensure global keyboard avoidance is active
    const cleanupAvoidance = initKeyboardAvoidance();

    const handleKeyboardChange = (e: Event) => {
      const customEvent = e as CustomEvent<VirtualKeyboardState>;
      if (customEvent.detail) {
        setState(customEvent.detail);
      }
    };

    window.addEventListener('virtualkeyboardchange', handleKeyboardChange);

    // Synchronize immediately in case initKeyboardAvoidance recalibrated metrics during setup
    setState(getVirtualKeyboardState());

    return () => {
      window.removeEventListener('virtualkeyboardchange', handleKeyboardChange);
      cleanupAvoidance();
    };
  }, []);

  return {
    ...state,
    scrollBehavior: getSensoryScrollBehavior(),
    scrollIntoSafeView: (el: HTMLElement) => scrollElementIntoSafeView(el),
  };
};
