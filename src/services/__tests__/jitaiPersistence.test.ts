import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getJitaiState,
  saveJitaiState,
  dismissNudgeToday,
  dismissAllNudgesToday,
  recordNudgeImpression,
  resetJitaiState,
  formatCalendarDate,
  createDefaultJitaiState,
  JITAI_STORAGE_KEY,
} from '../jitaiPersistence';
import type { JitaiPersistedState } from '../../types/jitai';

describe('jitaiPersistence (Local Storage & Calendar-Day Rollover)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('formatCalendarDate & default state', () => {
    it('formats dates consistently to YYYY-MM-DD', () => {
      const date = new Date(2026, 9, 10); // Note: month index 9 is October
      expect(formatCalendarDate(date)).toBe('2026-10-10');
    });

    it('creates default state with zero counts and empty dismissals', () => {
      const state = createDefaultJitaiState('2026-10-10');
      expect(state.date).toBe('2026-10-10');
      expect(state.dailyCount).toBe(0);
      expect(state.lastNudgeTimestamp).toBeNull();
      expect(state.dismissedTypes).toEqual([]);
      expect(state.dismissedAllToday).toBe(false);
    });
  });

  describe('Initial State & Basic CRUD', () => {
    it('returns and persists default state when storage is initially empty', () => {
      const state = getJitaiState('2026-10-10');
      expect(state.date).toBe('2026-10-10');
      expect(state.dailyCount).toBe(0);

      const storedRaw = localStorage.getItem(JITAI_STORAGE_KEY);
      expect(storedRaw).not.toBeNull();
      const parsed = JSON.parse(storedRaw!);
      expect(parsed.date).toBe('2026-10-10');
    });

    it('saves updated state and triggers local-storage event', () => {
      const listener = vi.fn();
      window.addEventListener('local-storage', listener);

      const customState: JitaiPersistedState = {
        date: '2026-10-10',
        dailyCount: 2,
        lastNudgeTimestamp: '2026-10-10T12:00:00Z',
        dismissedTypes: ['mood_blue_activation_spark'],
        dismissedAllToday: false,
      };

      saveJitaiState(customState);

      const retrieved = getJitaiState('2026-10-10');
      expect(retrieved.dailyCount).toBe(2);
      expect(retrieved.dismissedTypes).toContain('mood_blue_activation_spark');
      expect(listener).toHaveBeenCalled();

      window.removeEventListener('local-storage', listener);
    });

    it('gracefully handles malformed JSON in localStorage', () => {
      localStorage.setItem(JITAI_STORAGE_KEY, 'invalid-json{{{');
      const state = getJitaiState('2026-10-10');
      expect(state.date).toBe('2026-10-10');
      expect(state.dailyCount).toBe(0);
      expect(state.dismissedTypes).toEqual([]);
    });
  });

  describe('Calendar-Day Auto-Rollover', () => {
    it('automatically resets counts and dismissals when date changes to a new calendar day', () => {
      // Simulate yesterday's state with full cap and dismissals
      const yesterdayState: JitaiPersistedState = {
        date: '2026-10-09',
        dailyCount: 3,
        lastNudgeTimestamp: '2026-10-09T20:00:00Z',
        dismissedTypes: ['mood_red_vagal_reset', 'sleep_efficiency_stimulus_control'],
        dismissedAllToday: true,
      };
      localStorage.setItem(JITAI_STORAGE_KEY, JSON.stringify(yesterdayState));

      // User opens app on next calendar day ('2026-10-10')
      const todayState = getJitaiState('2026-10-10');

      expect(todayState.date).toBe('2026-10-10');
      expect(todayState.dailyCount).toBe(0);
      expect(todayState.lastNudgeTimestamp).toBeNull();
      expect(todayState.dismissedTypes).toEqual([]);
      expect(todayState.dismissedAllToday).toBe(false);

      // Verify localStorage was updated with the rollover state
      const persistedNow = JSON.parse(localStorage.getItem(JITAI_STORAGE_KEY)!);
      expect(persistedNow.date).toBe('2026-10-10');
      expect(persistedNow.dailyCount).toBe(0);
    });

    it('preserves state when accessed repeatedly on the same calendar day', () => {
      const todayState: JitaiPersistedState = {
        date: '2026-10-10',
        dailyCount: 1,
        lastNudgeTimestamp: '2026-10-10T09:00:00Z',
        dismissedTypes: ['mood_blue_activation_spark'],
        dismissedAllToday: false,
      };
      localStorage.setItem(JITAI_STORAGE_KEY, JSON.stringify(todayState));

      const retrieved = getJitaiState('2026-10-10');
      expect(retrieved.dailyCount).toBe(1);
      expect(retrieved.dismissedTypes).toEqual(['mood_blue_activation_spark']);
    });
  });

  describe('Dismissal Operations', () => {
    it('dismissNudgeToday adds type to dismissed list for today', () => {
      dismissNudgeToday('mood_red_vagal_reset', '2026-10-10');

      const state = getJitaiState('2026-10-10');
      expect(state.dismissedTypes).toContain('mood_red_vagal_reset');
    });

    it('dismissNudgeToday avoids adding duplicate entries', () => {
      dismissNudgeToday('mood_red_vagal_reset', '2026-10-10');
      dismissNudgeToday('mood_red_vagal_reset', '2026-10-10');

      const state = getJitaiState('2026-10-10');
      expect(state.dismissedTypes.filter((t) => t === 'mood_red_vagal_reset')).toHaveLength(1);
    });

    it('dismissAllNudgesToday mutes all nudges for the rest of today', () => {
      dismissAllNudgesToday('2026-10-10');

      const state = getJitaiState('2026-10-10');
      expect(state.dismissedAllToday).toBe(true);
    });
  });

  describe('Impression Recording & Cooldown', () => {
    it('recordNudgeImpression increments daily count and updates cooldown timestamp', () => {
      const impressionTime = new Date(2026, 9, 10, 14, 30, 0);
      recordNudgeImpression('mood_red_vagal_reset', impressionTime, '2026-10-10');

      const state = getJitaiState('2026-10-10');
      expect(state.dailyCount).toBe(1);
      expect(state.lastNudgeTimestamp).toBe(impressionTime.toISOString());

      const secondTime = new Date(2026, 9, 10, 19, 0, 0);
      recordNudgeImpression('sleep_efficiency_stimulus_control', secondTime, '2026-10-10');

      const state2 = getJitaiState('2026-10-10');
      expect(state2.dailyCount).toBe(2);
      expect(state2.lastNudgeTimestamp).toBe(secondTime.toISOString());
    });
  });

  describe('Reset', () => {
    it('resetJitaiState cleans storage and emits local-storage event', () => {
      const listener = vi.fn();
      window.addEventListener('local-storage', listener);

      dismissNudgeToday('mood_drop_recovery', '2026-10-10');
      expect(localStorage.getItem(JITAI_STORAGE_KEY)).not.toBeNull();

      resetJitaiState();
      expect(localStorage.getItem(JITAI_STORAGE_KEY)).toBeNull();
      expect(listener).toHaveBeenCalled();

      window.removeEventListener('local-storage', listener);
    });
  });
});
