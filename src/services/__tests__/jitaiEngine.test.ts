import { describe, it, expect } from 'vitest';
import {
  evaluateJitai,
  checkGuardrails,
  isTypeDismissed,
  JITAI_COOLDOWN_MS,
  JITAI_DAILY_CAP,
} from '../jitaiEngine';
import type {
  JitaiContext,
  JitaiPersistedState,
} from '../../types/jitai';
import type { MoodEntry, SleepDiaryEntry, BaActivity } from '../../types';

function createMockPersistedState(overrides: Partial<JitaiPersistedState> = {}): JitaiPersistedState {
  return {
    date: '2026-10-10',
    dailyCount: 0,
    lastNudgeTimestamp: null,
    dismissedTypes: [],
    dismissedAllToday: false,
    ...overrides,
  };
}

describe('jitaiEngine (Deterministic Rule Engine & Guardrails)', () => {
  const afternoonTime = new Date('2026-10-10T14:00:00Z');

  describe('Anti-Habituation Guardrails', () => {
    it('suppresses nudges during quiet hours (22:00 to 07:00)', () => {
      const state = createMockPersistedState();

      // Inside quiet hours: 22:00, 23:30, 00:00, 04:15, 06:59
      const nightTimes = [
        new Date('2026-10-10T22:00:00'),
        new Date('2026-10-10T23:30:00'),
        new Date('2026-10-10T00:00:00'),
        new Date('2026-10-10T04:15:00'),
        new Date('2026-10-10T06:59:59'),
      ];

      for (const time of nightTimes) {
        const check = checkGuardrails(time, state);
        expect(check.allowed).toBe(false);
        expect(check.reason).toBe('quiet_hours');
      }

      // Outside quiet hours: 07:00, 10:00, 15:30, 21:59
      const daytimeTimes = [
        new Date('2026-10-10T07:00:00'),
        new Date('2026-10-10T10:00:00'),
        new Date('2026-10-10T15:30:00'),
        new Date('2026-10-10T21:59:59'),
      ];

      for (const time of daytimeTimes) {
        const check = checkGuardrails(time, state);
        expect(check.allowed).toBe(true);
      }
    });

    it('enforces daily cap of 3 nudges', () => {
      const daytime = new Date('2026-10-10T10:00:00');

      expect(checkGuardrails(daytime, createMockPersistedState({ dailyCount: 0 })).allowed).toBe(true);
      expect(checkGuardrails(daytime, createMockPersistedState({ dailyCount: 1 })).allowed).toBe(true);
      expect(checkGuardrails(daytime, createMockPersistedState({ dailyCount: 2 })).allowed).toBe(true);

      const capped = checkGuardrails(daytime, createMockPersistedState({ dailyCount: JITAI_DAILY_CAP }));
      expect(capped.allowed).toBe(false);
      expect(capped.reason).toBe('daily_cap_reached');

      const overCapped = checkGuardrails(daytime, createMockPersistedState({ dailyCount: 4 }));
      expect(overCapped.allowed).toBe(false);
      expect(overCapped.reason).toBe('daily_cap_reached');
    });

    it('enforces 4-hour cooldown between nudges', () => {
      const current = new Date('2026-10-10T14:00:00');

      // 2 hours ago -> cooldown active
      const twoHoursAgo = new Date(current.getTime() - 2 * 60 * 60 * 1000).toISOString();
      const inCooldown = checkGuardrails(current, createMockPersistedState({ lastNudgeTimestamp: twoHoursAgo }));
      expect(inCooldown.allowed).toBe(false);
      expect(inCooldown.reason).toBe('cooldown_active');

      // 3 hours 59 minutes ago -> cooldown active
      const justUnder4h = new Date(current.getTime() - (JITAI_COOLDOWN_MS - 60000)).toISOString();
      expect(checkGuardrails(current, createMockPersistedState({ lastNudgeTimestamp: justUnder4h })).allowed).toBe(false);

      // 4 hours 1 minute ago -> cooldown expired, allowed
      const past4h = new Date(current.getTime() - (JITAI_COOLDOWN_MS + 60000)).toISOString();
      expect(checkGuardrails(current, createMockPersistedState({ lastNudgeTimestamp: past4h })).allowed).toBe(true);

      // null timestamp -> allowed
      expect(checkGuardrails(current, createMockPersistedState({ lastNudgeTimestamp: null })).allowed).toBe(true);
    });

    it('suppresses all nudges when dismissedAllToday is true', () => {
      const daytime = new Date('2026-10-10T12:00:00');
      const state = createMockPersistedState({ dismissedAllToday: true });
      const check = checkGuardrails(daytime, state);
      expect(check.allowed).toBe(false);
      expect(check.reason).toBe('dismissed_all');
    });

    it('checks whether specific nudge types are dismissed', () => {
      const state = createMockPersistedState({
        dismissedTypes: ['mood_red_vagal_reset', 'sleep_efficiency_stimulus_control'],
      });
      expect(isTypeDismissed('mood_red_vagal_reset', state)).toBe(true);
      expect(isTypeDismissed('sleep_efficiency_stimulus_control', state)).toBe(true);
      expect(isTypeDismissed('mood_blue_activation_spark', state)).toBe(false);
    });
  });

  describe('Priority 1: Yale Mood Meter 2D - Red Quadrant (Vagal Reset)', () => {
    it('triggers Cyclic Sighing nudge for Red quadrant mood', () => {
      const redMood: MoodEntry = {
        id: 'mood-red-1',
        score: 1,
        emoji: '😢',
        factors: ['anxiety', 'panic'],
        createdAt: '2026-10-10T13:30:00Z',
        valence: -0.7,
        arousal: 0.8,
        quadrant: 'red',
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [redMood],
        sleepHistory: [],
        activities: [],
        persistedState: createMockPersistedState(),
      };

      const nudge = evaluateJitai(context);
      expect(nudge).not.toBeNull();
      expect(nudge?.type).toBe('mood_red_vagal_reset');
      expect(nudge?.category).toBe('mood');
      expect(nudge?.urgency).toBe('high');
      expect(nudge?.targetRoute).toBe('/breathe');
      expect(nudge?.iconName).toBe('Wind');
      expect(nudge?.titleKey).toBe('jitai.red_vagal_title');
    });

    it('bypasses Red quadrant if dismissed and evaluates next priority', () => {
      const redMood: MoodEntry = {
        id: 'mood-red-1',
        score: 1,
        emoji: '😢',
        factors: ['work'],
        createdAt: '2026-10-10T13:30:00Z',
        quadrant: 'red',
      };

      const poorSleep: SleepDiaryEntry = {
        id: 'sleep-1',
        date: '2026-10-10',
        bedTime: '23:00',
        wakeTime: '06:00',
        latencyMinutes: 15,
        awakeningsCount: 3,
        awakeningsDurationMinutes: 60,
        quality: 2,
        totalSleepMinutes: 345,
        timeInBedMinutes: 420,
        sleepEfficiency: 82, // < 85%
        createdAt: '2026-10-10T07:00:00Z',
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [redMood],
        sleepHistory: [poorSleep],
        activities: [],
        persistedState: createMockPersistedState({
          dismissedTypes: ['mood_red_vagal_reset'],
        }),
      };

      const nudge = evaluateJitai(context);
      expect(nudge).not.toBeNull();
      // Should fall through to sleep efficiency
      expect(nudge?.type).toBe('sleep_efficiency_stimulus_control');
    });
  });

  describe('Priority 2: Steep Negative Slope Recovery (Mood Drop)', () => {
    it('triggers Compassion-Focused recovery nudge when score drops by >= 2 within 48h', () => {
      const previousMood: MoodEntry = {
        id: 'mood-1',
        score: 4,
        emoji: '🙂',
        factors: ['social'],
        createdAt: '2026-10-09T10:00:00Z',
        valence: 0.5,
        arousal: 0.2,
        quadrant: 'yellow',
      };

      const currentMood: MoodEntry = {
        id: 'mood-2',
        score: 2, // drop of 2
        emoji: '😟',
        factors: ['overwhelmed'],
        createdAt: '2026-10-10T11:00:00Z',
        valence: -0.3,
        arousal: 0.1,
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [currentMood, previousMood],
        sleepHistory: [],
        activities: [],
        persistedState: createMockPersistedState(),
      };

      const nudge = evaluateJitai(context);
      expect(nudge).not.toBeNull();
      expect(nudge?.type).toBe('mood_drop_recovery');
      expect(nudge?.category).toBe('mood');
      expect(nudge?.urgency).toBe('medium');
      expect(nudge?.targetRoute).toBe('/journal');
      expect(nudge?.iconName).toBe('HeartHandshake');
    });

    it('triggers recovery nudge on consecutive low scores (both <= 2)', () => {
      const prevMood: MoodEntry = {
        id: 'mood-1',
        score: 2,
        emoji: '😟',
        factors: ['tired'],
        createdAt: '2026-10-09T20:00:00Z',
      };

      const latestMood: MoodEntry = {
        id: 'mood-2',
        score: 1,
        emoji: '😢',
        factors: ['hopeless'],
        createdAt: '2026-10-10T10:00:00Z',
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [latestMood, prevMood],
        sleepHistory: [],
        activities: [],
        persistedState: createMockPersistedState(),
      };

      const nudge = evaluateJitai(context);
      expect(nudge).not.toBeNull();
      expect(nudge?.type).toBe('mood_drop_recovery');
    });
  });

  describe('Priority 3: Yale Mood Meter 2D - Blue Quadrant (Micro BA Spark)', () => {
    it('triggers Behavioral Activation spark nudge for Blue quadrant hypo-arousal', () => {
      const blueMood: MoodEntry = {
        id: 'mood-blue-1',
        score: 2,
        emoji: '😟',
        factors: ['lonely', 'lethargic'],
        createdAt: '2026-10-10T12:00:00Z',
        valence: -0.6,
        arousal: -0.5,
        quadrant: 'blue',
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [blueMood],
        sleepHistory: [],
        activities: [],
        persistedState: createMockPersistedState(),
      };

      const nudge = evaluateJitai(context);
      expect(nudge).not.toBeNull();
      expect(nudge?.type).toBe('mood_blue_activation_spark');
      expect(nudge?.category).toBe('mood');
      expect(nudge?.urgency).toBe('medium');
      expect(nudge?.targetRoute).toBe('/activation');
      expect(nudge?.iconName).toBe('Sparkles');
      expect(nudge?.titleKey).toBe('jitai.blue_spark_title');
    });
  });

  describe('Priority 4: CBT-I Sleep Efficiency & Fragmentation', () => {
    it('triggers stimulus control when sleep efficiency < 85%', () => {
      const sleepEntry: SleepDiaryEntry = {
        id: 'sleep-eff-low',
        date: '2026-10-10',
        bedTime: '23:30',
        wakeTime: '07:00',
        latencyMinutes: 20,
        awakeningsCount: 2,
        awakeningsDurationMinutes: 50,
        quality: 2,
        totalSleepMinutes: 380,
        timeInBedMinutes: 450,
        sleepEfficiency: 84, // < 85%
        createdAt: '2026-10-10T07:15:00Z',
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [],
        sleepHistory: [sleepEntry],
        activities: [],
        persistedState: createMockPersistedState(),
      };

      const nudge = evaluateJitai(context);
      expect(nudge).not.toBeNull();
      expect(nudge?.type).toBe('sleep_efficiency_stimulus_control');
      expect(nudge?.category).toBe('sleep');
      expect(nudge?.targetRoute).toBe('/sleep');
      expect(nudge?.iconName).toBe('MoonStar');
      expect(nudge?.titleKey).toBe('jitai.sleep_efficiency_title');
    });

    it('triggers sleep onset latency winddown when SOL > 30 minutes', () => {
      const sleepEntry: SleepDiaryEntry = {
        id: 'sleep-sol-high',
        date: '2026-10-10',
        bedTime: '23:00',
        wakeTime: '07:00',
        latencyMinutes: 45, // > 30 min
        awakeningsCount: 0,
        awakeningsDurationMinutes: 0,
        quality: 3,
        totalSleepMinutes: 435,
        timeInBedMinutes: 480,
        sleepEfficiency: 90, // >= 85%
        createdAt: '2026-10-10T07:30:00Z',
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [],
        sleepHistory: [sleepEntry],
        activities: [],
        persistedState: createMockPersistedState(),
      };

      const nudge = evaluateJitai(context);
      expect(nudge).not.toBeNull();
      expect(nudge?.type).toBe('sleep_latency_winddown');
      expect(nudge?.targetRoute).toBe('/sleep');
      expect(nudge?.iconName).toBe('Clock');
    });

    it('triggers WASO relaxation when awakenings duration > 30 minutes', () => {
      const sleepEntry: SleepDiaryEntry = {
        id: 'sleep-waso-high',
        date: '2026-10-10',
        bedTime: '23:00',
        wakeTime: '07:30',
        latencyMinutes: 15,
        awakeningsCount: 3,
        awakeningsDurationMinutes: 45, // > 30 min
        quality: 3,
        totalSleepMinutes: 450,
        timeInBedMinutes: 510,
        sleepEfficiency: 88, // >= 85%
        createdAt: '2026-10-10T08:00:00Z',
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [],
        sleepHistory: [sleepEntry],
        activities: [],
        persistedState: createMockPersistedState(),
      };

      const nudge = evaluateJitai(context);
      expect(nudge).not.toBeNull();
      expect(nudge?.type).toBe('sleep_waso_relaxation');
      expect(nudge?.targetRoute).toBe('/sleep');
    });

    it('does not trigger sleep nudges when sleep metrics are optimal', () => {
      const optimalSleep: SleepDiaryEntry = {
        id: 'sleep-optimal',
        date: '2026-10-10',
        bedTime: '23:00',
        wakeTime: '07:00',
        latencyMinutes: 15,
        awakeningsCount: 1,
        awakeningsDurationMinutes: 10,
        quality: 5,
        totalSleepMinutes: 455,
        timeInBedMinutes: 480,
        sleepEfficiency: 95,
        createdAt: '2026-10-10T07:10:00Z',
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [],
        sleepHistory: [optimalSleep],
        activities: [],
        persistedState: createMockPersistedState(),
      };

      const nudge = evaluateJitai(context);
      expect(nudge).toBeNull();
    });
  });

  describe('Priority 5: Behavioral Inactivity (>48h no BA activity with stagnant mood)', () => {
    it('triggers inactivity spark when no BA activity in 48h and mood is stagnant', () => {
      const stagnantMood: MoodEntry = {
        id: 'mood-stagnant',
        score: 3,
        emoji: '😐',
        factors: ['routine'],
        createdAt: '2026-10-10T11:00:00Z',
        valence: 0,
        arousal: 0,
      };

      const oldActivity: BaActivity = {
        id: 'ba-old',
        title: 'Jalan santai',
        domain: 'pleasure',
        scheduledDate: '2026-10-07',
        isCompleted: true,
        completedAt: '2026-10-07T10:00:00Z', // >48h ago
        predictedMood: 6,
        createdAt: '2026-10-07T09:00:00Z',
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [stagnantMood],
        sleepHistory: [],
        activities: [oldActivity],
        persistedState: createMockPersistedState(),
      };

      const nudge = evaluateJitai(context);
      expect(nudge).not.toBeNull();
      expect(nudge?.type).toBe('activity_inactivity_spark');
      expect(nudge?.category).toBe('activity');
      expect(nudge?.targetRoute).toBe('/activation');
      expect(nudge?.iconName).toBe('Activity');
    });

    it('suppresses inactivity spark if an activity was completed within the last 48h', () => {
      const stagnantMood: MoodEntry = {
        id: 'mood-stagnant',
        score: 3,
        emoji: '😐',
        factors: [],
        createdAt: '2026-10-10T11:00:00Z',
      };

      const recentActivity: BaActivity = {
        id: 'ba-recent',
        title: 'Mendengarkan musik',
        domain: 'pleasure',
        scheduledDate: '2026-10-10',
        isCompleted: true,
        completedAt: '2026-10-10T09:00:00Z', // 5h ago
        predictedMood: 7,
        createdAt: '2026-10-10T08:00:00Z',
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [stagnantMood],
        sleepHistory: [],
        activities: [recentActivity],
        persistedState: createMockPersistedState(),
      };

      const nudge = evaluateJitai(context);
      expect(nudge).toBeNull();
    });

    it('suppresses inactivity spark if mood is positive (score >= 4)', () => {
      const happyMood: MoodEntry = {
        id: 'mood-happy',
        score: 4,
        emoji: '🙂',
        factors: ['family'],
        createdAt: '2026-10-10T11:00:00Z',
        valence: 0.5,
        arousal: 0.3,
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [happyMood],
        sleepHistory: [],
        activities: [],
        persistedState: createMockPersistedState(),
      };

      const nudge = evaluateJitai(context);
      expect(nudge).toBeNull();
    });
  });

  describe('Priority 6: Scheduled Activity Reminder for Today', () => {
    it('triggers activity reminder when user has scheduled activity for today that is uncompleted', () => {
      const todayActivity: BaActivity = {
        id: 'ba-today-plan',
        title: 'Membaca buku 10 menit',
        domain: 'mastery',
        scheduledDate: '2026-10-10',
        isCompleted: false,
        predictedMood: 7,
        createdAt: '2026-10-10T08:00:00Z',
      };

      const neutralMood: MoodEntry = {
        id: 'mood-good',
        score: 4,
        emoji: '🙂',
        factors: [],
        createdAt: '2026-10-10T09:00:00Z',
        valence: 0.4,
        arousal: 0.1,
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [neutralMood],
        sleepHistory: [],
        activities: [todayActivity],
        persistedState: createMockPersistedState(),
      };

      const nudge = evaluateJitai(context);
      expect(nudge).not.toBeNull();
      expect(nudge?.type).toBe('activity_scheduled_reminder');
      expect(nudge?.category).toBe('activity');
      expect(nudge?.targetRoute).toBe('/activation');
      expect(nudge?.messageFallback).toContain('Membaca buku 10 menit');
    });
  });

  describe('Edge cases & Robustness', () => {
    it('returns null on completely empty history without throwing', () => {
      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [],
        sleepHistory: [],
        activities: [],
        persistedState: createMockPersistedState(),
      };

      expect(evaluateJitai(context)).toBeNull();
    });

    it('correctly sorts entries by timestamp if given out of order', () => {
      const oldRedMood: MoodEntry = {
        id: 'mood-old',
        score: 1,
        emoji: '😢',
        factors: [],
        createdAt: '2026-10-08T10:00:00Z',
        quadrant: 'red',
      };

      const recentCalmMood: MoodEntry = {
        id: 'mood-new',
        score: 5,
        emoji: '😊',
        factors: [],
        createdAt: '2026-10-10T12:00:00Z',
        quadrant: 'green',
        valence: 0.8,
        arousal: 0.1,
      };

      // Passed in reverse chronological order: [oldRedMood, recentCalmMood]
      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [oldRedMood, recentCalmMood],
        sleepHistory: [],
        activities: [],
        persistedState: createMockPersistedState(),
      };

      // Latest is recentCalmMood (green), so no red vagal reset should trigger
      expect(evaluateJitai(context)).toBeNull();
    });
  });
});
