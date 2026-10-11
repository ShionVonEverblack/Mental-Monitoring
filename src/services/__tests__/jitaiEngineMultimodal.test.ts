import { describe, it, expect } from 'vitest';
import { evaluateJitai } from '../jitaiEngine';
import type { JitaiContext, JitaiPersistedState } from '../../types/jitai';
import type { MoodEntry, SleepDiaryEntry } from '../../types';

describe('JITAI Multimodal Correlator (Sleep & Mood Trajectory)', () => {
  const baseTime = new Date('2026-10-11T14:00:00Z'); // 14:00 (outside quiet hours)

  const emptyState: JitaiPersistedState = {
    date: '2026-10-11',
    dailyCount: 0,
    lastNudgeTimestamp: null,
    dismissedTypes: [],
    dismissedAllToday: false,
  };

  it('triggers multimodal ACT nudge when sleep efficiency is <70% AND high arousal negative mood is detected', () => {
    const poorSleep: SleepDiaryEntry = {
      id: 'sleep-1',
      date: '2026-10-11',
      bedTime: '23:00',
      wakeTime: '07:00',
      latencyMinutes: 60,
      awakeningsCount: 4,
      awakeningsDurationMinutes: 120,
      quality: 1,
      totalSleepMinutes: 300,
      timeInBedMinutes: 480,
      sleepEfficiency: 62, // < 70%
      createdAt: '2026-10-11T07:00:00Z',
    };

    const redMood: MoodEntry = {
      id: 'mood-red-1',
      score: 1,
      emoji: '😢',
      factors: ['sleep', 'work'],
      valence: -0.6,
      arousal: 0.7,
      quadrant: 'red',
      createdAt: '2026-10-11T13:30:00Z',
    };

    const context: JitaiContext = {
      currentTime: baseTime,
      moods: [redMood],
      sleepHistory: [poorSleep],
      activities: [],
      persistedState: emptyState,
    };

    const nudge = evaluateJitai(context);

    expect(nudge).not.toBeNull();
    expect(nudge?.type).toBe('multimodal_sleep_mood_correlator');
    expect(nudge?.targetRoute).toBe('/act');
    expect(nudge?.iconName).toBe('Compass');
    expect(nudge?.urgency).toBe('high');
    expect(nudge?.titleKey).toBe('jitai.multimodal_title');
    expect(nudge?.actionLabelKey).toBe('jitai.action_act');
  });

  it('does NOT trigger multimodal nudge if sleep efficiency is >=70%, falling back to vagal reset or standard priority', () => {
    const goodSleep: SleepDiaryEntry = {
      id: 'sleep-2',
      date: '2026-10-11',
      bedTime: '23:00',
      wakeTime: '07:00',
      latencyMinutes: 15,
      awakeningsCount: 1,
      awakeningsDurationMinutes: 15,
      quality: 4,
      totalSleepMinutes: 450,
      timeInBedMinutes: 480,
      sleepEfficiency: 93, // >= 70%
      createdAt: '2026-10-11T07:00:00Z',
    };

    const redMood: MoodEntry = {
      id: 'mood-red-2',
      score: 1,
      emoji: '😢',
      factors: ['work'],
      valence: -0.6,
      arousal: 0.7,
      quadrant: 'red',
      createdAt: '2026-10-11T13:30:00Z',
    };

    const context: JitaiContext = {
      currentTime: baseTime,
      moods: [redMood],
      sleepHistory: [goodSleep],
      activities: [],
      persistedState: emptyState,
    };

    const nudge = evaluateJitai(context);

    // Should fall through to Priority 2: pure red vagal reset (breathing)
    expect(nudge).not.toBeNull();
    expect(nudge?.type).toBe('mood_red_vagal_reset');
    expect(nudge?.targetRoute).toBe('/breathe');
  });

  it('does NOT trigger multimodal nudge if mood is low arousal (blue quadrant), falling through to blue spark or sleep stimulus', () => {
    const poorSleep: SleepDiaryEntry = {
      id: 'sleep-3',
      date: '2026-10-11',
      bedTime: '23:00',
      wakeTime: '07:00',
      latencyMinutes: 40,
      awakeningsCount: 3,
      awakeningsDurationMinutes: 110,
      quality: 2,
      totalSleepMinutes: 330,
      timeInBedMinutes: 480,
      sleepEfficiency: 68, // < 70%
      createdAt: '2026-10-11T07:00:00Z',
    };

    const blueMood: MoodEntry = {
      id: 'mood-blue-1',
      score: 2,
      emoji: '😟',
      factors: ['energy'],
      valence: -0.5,
      arousal: -0.6,
      quadrant: 'blue',
      createdAt: '2026-10-11T13:30:00Z',
    };

    const context: JitaiContext = {
      currentTime: baseTime,
      moods: [blueMood],
      sleepHistory: [poorSleep],
      activities: [],
      persistedState: emptyState,
    };

    const nudge = evaluateJitai(context);

    // High arousal is NOT present, so it shouldn't be multimodal ACT nudge
    expect(nudge?.type).not.toBe('multimodal_sleep_mood_correlator');
  });

  it('respects guardrail dismissal when user dismissed multimodal_sleep_mood_correlator today', () => {
    const poorSleep: SleepDiaryEntry = {
      id: 'sleep-4',
      date: '2026-10-11',
      bedTime: '23:00',
      wakeTime: '07:00',
      latencyMinutes: 60,
      awakeningsCount: 4,
      awakeningsDurationMinutes: 120,
      quality: 1,
      totalSleepMinutes: 300,
      timeInBedMinutes: 480,
      sleepEfficiency: 62,
      createdAt: '2026-10-11T07:00:00Z',
    };

    const redMood: MoodEntry = {
      id: 'mood-red-4',
      score: 1,
      emoji: '😢',
      factors: ['sleep'],
      valence: -0.6,
      arousal: 0.7,
      quadrant: 'red',
      createdAt: '2026-10-11T13:30:00Z',
    };

    const dismissedState: JitaiPersistedState = {
      ...emptyState,
      dismissedTypes: ['multimodal_sleep_mood_correlator'],
    };

    const context: JitaiContext = {
      currentTime: baseTime,
      moods: [redMood],
      sleepHistory: [poorSleep],
      activities: [],
      persistedState: dismissedState,
    };

    const nudge = evaluateJitai(context);

    // Multimodal is dismissed, falls through to red vagal reset
    expect(nudge?.type).toBe('mood_red_vagal_reset');
  });

  it('does NOT trigger multimodal ACT nudge if low sleep efficiency occurred more than 48 hours ago', () => {
    // Stale sleep entry from 5 days ago
    const stalePoorSleep: SleepDiaryEntry = {
      id: 'sleep-stale',
      date: '2026-10-06',
      bedTime: '23:00',
      wakeTime: '07:00',
      latencyMinutes: 60,
      awakeningsCount: 4,
      awakeningsDurationMinutes: 120,
      quality: 1,
      totalSleepMinutes: 300,
      timeInBedMinutes: 480,
      sleepEfficiency: 62, // < 70% but stale
      createdAt: '2026-10-06T07:00:00Z',
    };

    const redMood: MoodEntry = {
      id: 'mood-red-stale',
      score: 1,
      emoji: '😢',
      factors: ['work'],
      valence: -0.6,
      arousal: 0.7,
      quadrant: 'red',
      createdAt: '2026-10-11T13:30:00Z',
    };

    const context: JitaiContext = {
      currentTime: baseTime,
      moods: [redMood],
      sleepHistory: [stalePoorSleep],
      activities: [],
      persistedState: emptyState,
    };

    const nudge = evaluateJitai(context);

    // Stale sleep cannot be correlated with today's circadian state; falls through to vagal reset
    expect(nudge?.type).not.toBe('multimodal_sleep_mood_correlator');
    expect(nudge?.type).toBe('mood_red_vagal_reset');
  });
});
