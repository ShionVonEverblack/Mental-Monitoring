import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns initial value when key does not exist', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'));
    expect(result.current[0]).toBe('default-value');
  });

  it('updates value in state and localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(window.localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
  });

  it('removes value from state and localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('saved');
    });
    expect(result.current[0]).toBe('saved');

    act(() => {
      result.current[2](); // removeValue
    });

    expect(result.current[0]).toBe('initial');
    expect(window.localStorage.getItem('test-key')).toBeNull();
  });

  it('falls back to initialValue if localStorage parses to null when initialValue is non-null', () => {
    window.localStorage.setItem('test-null-key', 'null');
    const { result } = renderHook(() => useLocalStorage('test-null-key', { defaultProp: true }));
    expect(result.current[0]).toEqual({ defaultProp: true });
  });

  it('falls back to initialValue if localStorage is not an array when initialValue is an array', () => {
    window.localStorage.setItem('test-array-key', '{"notAnArray": 123}');
    const { result } = renderHook(() => useLocalStorage<string[]>('test-array-key', ['item1']));
    expect(result.current[0]).toEqual(['item1']);
  });
});
