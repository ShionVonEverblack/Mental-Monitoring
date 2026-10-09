import { useEffect } from 'react';
import type { Theme } from '../types';
import { useLocalStorage } from './useLocalStorage';

export function useTheme() {
  const [theme, setThemeState] = useLocalStorage<Theme>('rima-theme', 'dark');
  const [lowStimulation, setLowStimulationState] = useLocalStorage<boolean>('rima-low-stimulation', false);

  useEffect(() => {
    // If no theme is in local storage, check system preference
    if (!localStorage.getItem('rima-theme') && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      setThemeState(prefersLight ? 'light' : 'dark');
    }

    // Check system preference for reduced motion
    if (!localStorage.getItem('rima-low-stimulation') && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        setLowStimulationState(true);
      }
    }
  }, [setThemeState, setLowStimulationState]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (lowStimulation) {
      document.documentElement.setAttribute('data-sensory', 'calm');
    } else {
      document.documentElement.removeAttribute('data-sensory');
    }
  }, [lowStimulation]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setLowStimulation = (enabled: boolean) => {
    setLowStimulationState(enabled);
  };

  const toggleLowStimulation = () => {
    setLowStimulationState((prev) => !prev);
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    lowStimulation,
    setLowStimulation,
    toggleLowStimulation,
  };
}
