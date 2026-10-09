import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

describe('useTheme & Sensory Mode Hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-sensory');
  });

  it('initializes with default dark theme and applies data-theme attribute', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggles theme between dark and light', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('defaults lowStimulation to false without data-sensory attribute', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.lowStimulation).toBe(false);
    expect(document.documentElement.hasAttribute('data-sensory')).toBe(false);
  });

  it('toggles lowStimulation and dynamically applies/removes data-sensory attribute', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleLowStimulation();
    });

    expect(result.current.lowStimulation).toBe(true);
    expect(document.documentElement.getAttribute('data-sensory')).toBe('calm');

    act(() => {
      result.current.setLowStimulation(false);
    });

    expect(result.current.lowStimulation).toBe(false);
    expect(document.documentElement.hasAttribute('data-sensory')).toBe(false);
  });
});
