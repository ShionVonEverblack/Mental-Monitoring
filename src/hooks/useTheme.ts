import { useEffect } from 'react';
import type { Theme } from '../types';
import { useLocalStorage } from './useLocalStorage';

export function useTheme() {
  const [theme, setThemeState] = useLocalStorage<Theme>('rima-theme', 'dark');

  useEffect(() => {
    // If no theme is in local storage, check system preference
    if (!localStorage.getItem('rima-theme')) {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      setThemeState(prefersLight ? 'light' : 'dark');
    }
  }, [setThemeState]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, setTheme, toggleTheme };
}
