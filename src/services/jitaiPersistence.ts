import type { JitaiPersistedState, JitaiNudgeType } from '../types/jitai';

export const JITAI_STORAGE_KEY = 'rima-jitai-state';

/**
 * Formats a Date object to YYYY-MM-DD local calendar date string.
 */
export function formatCalendarDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Creates a clean default JITAI state for a specified calendar date.
 */
export function createDefaultJitaiState(dateStr: string = formatCalendarDate()): JitaiPersistedState {
  return {
    date: dateStr,
    dailyCount: 0,
    lastNudgeTimestamp: null,
    dismissedTypes: [],
    dismissedAllToday: false,
  };
}

/**
 * Dispatches a custom local-storage event to notify cross-component listeners.
 */
function emitStorageEvent(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('local-storage', { detail: { key: JITAI_STORAGE_KEY } })
    );
  }
}

/**
 * Retrieves the current persisted JITAI state with automatic calendar-day rollover.
 * If the stored state is from a previous calendar day, it is automatically reset.
 */
export function getJitaiState(currentDate?: string): JitaiPersistedState {
  const todayStr = currentDate || formatCalendarDate();

  if (typeof window === 'undefined') {
    return createDefaultJitaiState(todayStr);
  }

  try {
    const raw = localStorage.getItem(JITAI_STORAGE_KEY);
    if (!raw) {
      const defaultState = createDefaultJitaiState(todayStr);
      saveJitaiState(defaultState);
      return defaultState;
    }

    const parsed = JSON.parse(raw) as Partial<JitaiPersistedState>;

    // Calendar day rollover check
    if (parsed.date !== todayStr) {
      const rolledOverState = createDefaultJitaiState(todayStr);
      saveJitaiState(rolledOverState);
      return rolledOverState;
    }

    return {
      date: todayStr,
      dailyCount: typeof parsed.dailyCount === 'number' ? parsed.dailyCount : 0,
      lastNudgeTimestamp: parsed.lastNudgeTimestamp || null,
      dismissedTypes: Array.isArray(parsed.dismissedTypes) ? parsed.dismissedTypes : [],
      dismissedAllToday: Boolean(parsed.dismissedAllToday),
    };
  } catch (error) {
    console.warn('[JITAI Persistence] Failed to parse stored state, resetting to default:', error);
    const fallback = createDefaultJitaiState(todayStr);
    saveJitaiState(fallback);
    return fallback;
  }
}

/**
 * Saves the JITAI state to local storage and emits synchronization events.
 */
export function saveJitaiState(state: JitaiPersistedState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(JITAI_STORAGE_KEY, JSON.stringify(state));
    emitStorageEvent();
  } catch (error) {
    console.error('[JITAI Persistence] Failed to save state to localStorage:', error);
  }
}

/**
 * Dismisses a specific nudge type for the remainder of the calendar day.
 */
export function dismissNudgeToday(type: JitaiNudgeType, currentDate?: string): void {
  const state = getJitaiState(currentDate);
  if (!state.dismissedTypes.includes(type)) {
    state.dismissedTypes.push(type);
    saveJitaiState(state);
  }
}

/**
 * Dismisses all nudges for the remainder of the calendar day (mute day).
 */
export function dismissAllNudgesToday(currentDate?: string): void {
  const state = getJitaiState(currentDate);
  state.dismissedAllToday = true;
  saveJitaiState(state);
}

/**
 * Records a nudge impression, incrementing the daily nudge count and setting the cooldown timestamp.
 */
export function recordNudgeImpression(
  _type: JitaiNudgeType,
  timestamp: Date = new Date(),
  currentDate?: string
): void {
  void _type;
  const dateStr = currentDate || formatCalendarDate(timestamp);
  const state = getJitaiState(dateStr);
  state.dailyCount += 1;
  state.lastNudgeTimestamp = timestamp.toISOString();
  saveJitaiState(state);
}

/**
 * Resets JITAI persistence to an empty default state.
 */
export function resetJitaiState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(JITAI_STORAGE_KEY);
    emitStorageEvent();
  } catch (error) {
    console.error('[JITAI Persistence] Failed to remove state from localStorage:', error);
  }
}
