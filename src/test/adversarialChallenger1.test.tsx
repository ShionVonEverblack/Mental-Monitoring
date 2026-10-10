import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Domain services and functions under test
import {
  checkGuardrails,
  evaluateJitai,
  JITAI_COOLDOWN_MS,
} from '../services/jitaiEngine';

import {
  getJitaiState,
  saveJitaiState,
  createDefaultJitaiState,
  JITAI_STORAGE_KEY,
} from '../services/jitaiPersistence';

import {
  formatPhoneTelUri,
  parseContactString,
  extractPrimaryCopingStrategy,
  extractPrimaryTrustedContact,
  HOTLINE_119,
  HOTLINE_112,
  DEFAULT_COPING_STRATEGY,
} from '../services/safetyCardService';

import { FastActionSafetyCard } from '../components/safety/FastActionSafetyCard';
import type { JitaiContext, JitaiPersistedState } from '../types/jitai';
import type { MoodEntry, SleepDiaryEntry, BaActivity } from '../types';

// Mock translation to avoid external dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string | Record<string, unknown>) => {
      if (typeof fallback === 'string') return fallback;
      if (typeof fallback === 'object' && fallback !== null && 'defaultValue' in fallback) {
        return (fallback as { defaultValue: string }).defaultValue;
      }
      return key;
    },
    i18n: { language: 'id' },
  }),
}));

describe('Adversarial Challenger 1: JITAI & Safety Stress Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // SECTION 1: EXACT BOUNDARY CONDITIONS STRESS TESTING
  // ==========================================================================
  describe('Boundary Conditions: Quiet Hours Exact Boundaries', () => {
    const baseState: JitaiPersistedState = {
      date: '2026-10-10',
      dailyCount: 0,
      lastNudgeTimestamp: null,
      dismissedTypes: [],
      dismissedAllToday: false,
    };

    it('permits nudges at exactly 21:59:00 and 21:59:59.999 (1 ms before quiet hours)', () => {
      const t1 = new Date(2026, 9, 10, 21, 59, 0, 0);
      const res1 = checkGuardrails(t1, baseState);
      expect(res1.allowed).toBe(true);

      const t2 = new Date(2026, 9, 10, 21, 59, 59, 999);
      const res2 = checkGuardrails(t2, baseState);
      expect(res2.allowed).toBe(true);
    });

    it('strictly suppresses nudges at exactly 22:00:00.000 (start boundary)', () => {
      const t = new Date(2026, 9, 10, 22, 0, 0, 0);
      const res = checkGuardrails(t, baseState);
      expect(res.allowed).toBe(false);
      expect(res.reason).toBe('quiet_hours');
    });

    it('strictly suppresses nudges at exactly 22:00:01 and throughout midnight up to 06:59:59.999', () => {
      const sampleNightMoments = [
        new Date(2026, 9, 10, 22, 0, 1, 0),
        new Date(2026, 9, 10, 23, 59, 59, 999),
        new Date(2026, 9, 11, 0, 0, 0, 0),
        new Date(2026, 9, 11, 3, 30, 0, 0),
        new Date(2026, 9, 11, 6, 59, 59, 999),
      ];

      for (const moment of sampleNightMoments) {
        const res = checkGuardrails(moment, baseState);
        expect(res.allowed).toBe(false);
        expect(res.reason).toBe('quiet_hours');
      }
    });

    it('permits nudges at exactly 07:00:00.000 (end boundary)', () => {
      const t = new Date(2026, 9, 11, 7, 0, 0, 0);
      const res = checkGuardrails(t, baseState);
      expect(res.allowed).toBe(true);
    });

    it('permits nudges at 07:00:01 and throughout daytime until 21:59:59', () => {
      const daytimeMoments = [
        new Date(2026, 9, 11, 7, 0, 1, 0),
        new Date(2026, 9, 11, 12, 0, 0, 0),
        new Date(2026, 9, 11, 17, 45, 0, 0),
        new Date(2026, 9, 11, 21, 59, 59, 0),
      ];

      for (const moment of daytimeMoments) {
        const res = checkGuardrails(moment, baseState);
        expect(res.allowed).toBe(true);
      }
    });
  });

  describe('Boundary Conditions: Daily Impression Cap (3-Nudge Cap)', () => {
    const daytime = new Date(2026, 9, 10, 14, 0, 0);

    it('allows impressions at dailyCount = 0, 1, 2', () => {
      expect(checkGuardrails(daytime, { ...createDefaultJitaiState(), dailyCount: 0 }).allowed).toBe(true);
      expect(checkGuardrails(daytime, { ...createDefaultJitaiState(), dailyCount: 1 }).allowed).toBe(true);
      expect(checkGuardrails(daytime, { ...createDefaultJitaiState(), dailyCount: 2 }).allowed).toBe(true);
    });

    it('blocks impressions precisely when dailyCount reaches 3 (JITAI_DAILY_CAP)', () => {
      const atCap = checkGuardrails(daytime, { ...createDefaultJitaiState(), dailyCount: 3 });
      expect(atCap.allowed).toBe(false);
      expect(atCap.reason).toBe('daily_cap_reached');
    });

    it('blocks impressions when dailyCount exceeds cap (> 3, up to extreme values)', () => {
      const extremeCounts = [4, 5, 10, 100, Number.MAX_SAFE_INTEGER];
      for (const count of extremeCounts) {
        const res = checkGuardrails(daytime, { ...createDefaultJitaiState(), dailyCount: count });
        expect(res.allowed).toBe(false);
        expect(res.reason).toBe('daily_cap_reached');
      }
    });

    it('handles negative dailyCount safely (e.g. -1 is allowed)', () => {
      const res = checkGuardrails(daytime, { ...createDefaultJitaiState(), dailyCount: -1 });
      expect(res.allowed).toBe(true);
    });
  });

  describe('Boundary Conditions: Cooldown Window (4 Hours / 14,400,000 ms)', () => {
    const current = new Date(2026, 9, 10, 15, 0, 0, 0);

    it('blocks when elapsed is 0 ms (identical timestamp)', () => {
      const lastNudge = current.toISOString();
      const res = checkGuardrails(current, {
        ...createDefaultJitaiState(),
        lastNudgeTimestamp: lastNudge,
      });
      expect(res.allowed).toBe(false);
      expect(res.reason).toBe('cooldown_active');
    });

    it('blocks at 3h 59m 59s 999ms (1 ms before 4-hour cooldown expires)', () => {
      const elapsedMs = JITAI_COOLDOWN_MS - 1; // 14,399,999 ms
      const lastNudge = new Date(current.getTime() - elapsedMs).toISOString();
      const res = checkGuardrails(current, {
        ...createDefaultJitaiState(),
        lastNudgeTimestamp: lastNudge,
      });
      expect(res.allowed).toBe(false);
      expect(res.reason).toBe('cooldown_active');
    });

    it('allows at EXACTLY 4h 00m 00s 000ms (14,400,000 ms)', () => {
      const elapsedMs = JITAI_COOLDOWN_MS; // Exactly 14,400,000 ms
      const lastNudge = new Date(current.getTime() - elapsedMs).toISOString();
      const res = checkGuardrails(current, {
        ...createDefaultJitaiState(),
        lastNudgeTimestamp: lastNudge,
      });
      expect(res.allowed).toBe(true);
    });

    it('allows at 4h 00m 00s 001ms (1 ms past cooldown)', () => {
      const elapsedMs = JITAI_COOLDOWN_MS + 1;
      const lastNudge = new Date(current.getTime() - elapsedMs).toISOString();
      const res = checkGuardrails(current, {
        ...createDefaultJitaiState(),
        lastNudgeTimestamp: lastNudge,
      });
      expect(res.allowed).toBe(true);
    });

    it('gracefully handles future timestamp or negative elapsed time without infinite crash', () => {
      const futureNudge = new Date(current.getTime() + 60 * 60 * 1000).toISOString();
      const res = checkGuardrails(current, {
        ...createDefaultJitaiState(),
        lastNudgeTimestamp: futureNudge,
      });
      expect(res.allowed).toBe(true);
    });

    it('handles unparseable or corrupted lastNudgeTimestamp string gracefully', () => {
      const invalidTimestamps = ['invalid-date', '2026-99-99T99:99:99', 'NaN', 'null', ''];
      for (const badTs of invalidTimestamps) {
        const res = checkGuardrails(current, {
          ...createDefaultJitaiState(),
          lastNudgeTimestamp: badTs,
        });
        expect(res.allowed).toBe(true);
      }
    });
  });

  describe('Boundary Conditions: Calendar Day Rollover (23:59 vs 00:01 next day)', () => {
    it('maintains state within same calendar day and resets immediately at midnight rollover', () => {
      saveJitaiState({
        date: '2026-10-10',
        dailyCount: 3,
        lastNudgeTimestamp: '2026-10-10T18:00:00.000Z',
        dismissedTypes: ['mood_red_vagal_reset', 'sleep_efficiency_stimulus_control'],
        dismissedAllToday: true,
      });

      const sameDayState = getJitaiState('2026-10-10');
      expect(sameDayState.date).toBe('2026-10-10');
      expect(sameDayState.dailyCount).toBe(3);
      expect(sameDayState.dismissedAllToday).toBe(true);
      expect(sameDayState.dismissedTypes).toHaveLength(2);

      const nextDayState = getJitaiState('2026-10-11');
      expect(nextDayState.date).toBe('2026-10-11');
      expect(nextDayState.dailyCount).toBe(0);
      expect(nextDayState.dismissedAllToday).toBe(false);
      expect(nextDayState.dismissedTypes).toEqual([]);
      expect(nextDayState.lastNudgeTimestamp).toBeNull();

      const persistedRaw = JSON.parse(localStorage.getItem(JITAI_STORAGE_KEY)!);
      expect(persistedRaw.date).toBe('2026-10-11');
      expect(persistedRaw.dailyCount).toBe(0);
    });

    it('handles month-end and year-end rollover seamlessly', () => {
      saveJitaiState({
        date: '2026-10-31',
        dailyCount: 3,
        lastNudgeTimestamp: '2026-10-31T20:00:00Z',
        dismissedTypes: ['activity_inactivity_spark'],
        dismissedAllToday: true,
      });
      const novState = getJitaiState('2026-11-01');
      expect(novState.date).toBe('2026-11-01');
      expect(novState.dailyCount).toBe(0);

      saveJitaiState({
        date: '2026-12-31',
        dailyCount: 3,
        lastNudgeTimestamp: '2026-12-31T21:00:00Z',
        dismissedTypes: ['mood_drop_recovery'],
        dismissedAllToday: true,
      });
      const newYearState = getJitaiState('2027-01-01');
      expect(newYearState.date).toBe('2027-01-01');
      expect(newYearState.dailyCount).toBe(0);
    });
  });

  // ==========================================================================
  // SECTION 2: UNUSUAL / CORRUPTED STORAGE STATES STRESS TESTING
  // ==========================================================================
  describe('Storage Resilience: JITAI Persistence Fault Injection', () => {
    it('handles localStorage returning null (first run or clean clear)', () => {
      localStorage.removeItem(JITAI_STORAGE_KEY);
      const state = getJitaiState('2026-10-10');
      expect(state).toEqual({
        date: '2026-10-10',
        dailyCount: 0,
        lastNudgeTimestamp: null,
        dismissedTypes: [],
        dismissedAllToday: false,
      });
    });

    it('handles corrupted and truncated JSON without crashing', () => {
      const corruptedPayloads = [
        '{',
        '{"date": "2026-10-10", "dailyCount":',
        'undefined',
        'null',
        '<html><body>error</body></html>',
        '{"date": 12345}',
      ];

      for (const payload of corruptedPayloads) {
        localStorage.setItem(JITAI_STORAGE_KEY, payload);
        const state = getJitaiState('2026-10-10');
        expect(state.date).toBe('2026-10-10');
        expect(state.dailyCount).toBe(0);
        expect(Array.isArray(state.dismissedTypes)).toBe(true);
      }
    });

    it('handles schema mismatch / wrong field types in stored state', () => {
      localStorage.setItem(
        JITAI_STORAGE_KEY,
        JSON.stringify({
          date: '2026-10-10',
          dailyCount: 'not-a-number',
          dismissedTypes: null,
          dismissedAllToday: 'truthy-string',
          lastNudgeTimestamp: 12345678,
        })
      );

      const state = getJitaiState('2026-10-10');
      expect(state.dailyCount).toBe(0);
      expect(state.dismissedTypes).toEqual([]);
      expect(state.dismissedAllToday).toBe(true);
      expect(state.lastNudgeTimestamp).toBe(12345678);
    });

    it('handles array stored instead of object', () => {
      localStorage.setItem(JITAI_STORAGE_KEY, JSON.stringify([1, 2, 3]));
      const state = getJitaiState('2026-10-10');
      expect(state.date).toBe('2026-10-10');
      expect(state.dailyCount).toBe(0);
      expect(state.dismissedTypes).toEqual([]);
    });
  });

  describe('Storage Resilience: Safety Plan & Trusted Contact Fault Injection', () => {
    it('handles completely missing or null safety plan and contacts storage', () => {
      const strategy = extractPrimaryCopingStrategy(null);
      expect(strategy).toBe(DEFAULT_COPING_STRATEGY);

      const contact = extractPrimaryTrustedContact(null, null);
      expect(contact).toBeNull();
    });

    it('handles malformed JSON in rima-safety-plan gracefully', () => {
      const strategy = extractPrimaryCopingStrategy('invalid json syntax {{{');
      expect(strategy).toBe(DEFAULT_COPING_STRATEGY);
    });

    it('handles empty arrays and empty strings in safety plan coping items', () => {
      const emptyItems = JSON.stringify([{ id: 'copingStrategies', items: [] }]);
      expect(extractPrimaryCopingStrategy(emptyItems)).toBe(DEFAULT_COPING_STRATEGY);

      const whitespaceItems = JSON.stringify([{ id: 'copingStrategies', items: ['', '   ', '   \n  '] }]);
      expect(extractPrimaryCopingStrategy(whitespaceItems)).toBe(DEFAULT_COPING_STRATEGY);

      const validAfterEmpty = JSON.stringify([{ id: 'copingStrategies', items: ['', '  Breathe deeply  '] }]);
      expect(extractPrimaryCopingStrategy(validAfterEmpty)).toBe('Breathe deeply');
    });

    it('demonstrates that non-JSON text in rima-trusted-contacts falls back to name string', () => {
      const contact = extractPrimaryTrustedContact('corrupted json text', null);
      expect(contact).toEqual({ name: 'corrupted json text' });
    });

    it('returns null and falls back to safety plan when rima-trusted-contacts starts with { or [ but is invalid JSON', () => {
      const contact = extractPrimaryTrustedContact('{ invalid json syntax', null);
      expect(contact).toBeNull();
    });

    it('handles raw non-JSON text in rima-trusted-contacts gracefully', () => {
      const contact = extractPrimaryTrustedContact('Ibu (08123456789)', null);
      expect(contact).toEqual({
        name: 'Ibu',
        phone: '08123456789',
        relationship: undefined,
      });
    });

    it('handles contact array with null, non-objects, and missing names/phones', () => {
      const dirtyArray = JSON.stringify([
        null,
        {},
        { unrelated: 'field' },
        { name: '', phone: '' },
        { name: 'Dr. Sarah', phone: '0812-3456-7890', relationship: 'Psikiater' },
      ]);
      const contact = extractPrimaryTrustedContact(dirtyArray, null);
      expect(contact).toEqual({
        name: 'Dr. Sarah',
        phone: '0812-3456-7890',
        relationship: 'Psikiater',
      });
    });
  });

  // ==========================================================================
  // SECTION 3: PHONE NUMBER FORMATTING & TELEPHONY STANDARDIZATION
  // ==========================================================================
  describe('Phone Formatting: formatPhoneTelUri Adversarial Cases', () => {
    it('standardizes 119 ext 8 across all case variations and spacings into tel:119,8', () => {
      const variants = [
        '119 ext 8',
        '119 Ext 8',
        '119 EXT 8',
        '119   ext   8',
        '119ext8',
        '119 ext. 8',
        '119 Ext. 8',
        '119,8',
        '119, 8',
        '  119 ext 8  ',
      ];

      for (const variant of variants) {
        expect(formatPhoneTelUri(variant)).toBe('tel:119,8');
      }
    });

    it('standardizes emergency 112 line into tel:112', () => {
      expect(formatPhoneTelUri('112')).toBe('tel:112');
      expect(formatPhoneTelUri('  112  ')).toBe('tel:112');
    });

    it('strips non-dialable symbols while preserving plus (+) and digits', () => {
      const cases = [
        { input: '+62 812-3456-7890', expected: 'tel:+6281234567890' },
        { input: '(021) 1234567', expected: 'tel:0211234567' },
        { input: '+62 (21) 500-119', expected: 'tel:+6221500119' },
        { input: '0812.3456.7890', expected: 'tel:081234567890' },
        { input: '  0812-3456-7890  ', expected: 'tel:081234567890' },
        { input: '+1-800-273-8255', expected: 'tel:+18002738255' },
        { input: '0812 3456 7890', expected: 'tel:081234567890' },
      ];

      for (const { input, expected } of cases) {
        expect(formatPhoneTelUri(input)).toBe(expected);
      }
    });

    it('handles empty, whitespace, null, undefined, or string with no digits', () => {
      expect(formatPhoneTelUri('')).toBe('');
      expect(formatPhoneTelUri('   ')).toBe('');
      expect(formatPhoneTelUri(undefined)).toBe('');
      expect(formatPhoneTelUri(null as any)).toBe('');
      expect(formatPhoneTelUri('no phone here')).toBe('');
      expect(formatPhoneTelUri('---...()')).toBe('');
    });

    it('verifies static HOTLINE constants adhere strictly to telephone contracts', () => {
      expect(HOTLINE_119.href).toBe('tel:119,8');
      expect(HOTLINE_119.phone).toBe('119 ext 8');
      expect(HOTLINE_112.href).toBe('tel:112');
      expect(HOTLINE_112.phone).toBe('112');
    });
  });

  describe('Contact Parsing: parseContactString Adversarial Cases', () => {
    it('correctly parses parenthesized contact phone formats', () => {
      const res1 = parseContactString('Ibu (08123456789)');
      expect(res1).toEqual({ name: 'Ibu', phone: '08123456789' });

      const res2 = parseContactString('Ayah (+62 812-3456-7890) - Orang Tua');
      expect(res2).toEqual({
        name: 'Ayah',
        phone: '+62 812-3456-7890',
        relationship: 'Orang Tua',
      });
    });

    it('does NOT treat non-numeric parenthesized notes as phone numbers', () => {
      const res = parseContactString('Ayah (Rumah)');
      expect(res.name).toBe('Ayah (Rumah)');
      expect(res.phone).toBeUndefined();
    });

    it('correctly parses delimiter-separated contacts', () => {
      const res = parseContactString('Dr. Sarah - +62 811-2233-4455 - Psikiater');
      expect(res.name).toBe('Dr. Sarah');
      expect(res.phone).toBe('+62 811-2233-4455');
      expect(res.relationship).toBe('Psikiater');

      const resColon = parseContactString('Budi: 08123456789');
      expect(resColon.name).toBe('Budi');
      expect(resColon.phone).toBe('08123456789');
    });

    it('correctly parses pure continuous phone numbers as both name and phone', () => {
      const res1 = parseContactString('+6281234567890');
      expect(res1).toEqual({ name: '+6281234567890', phone: '+6281234567890' });

      const res2 = parseContactString('081234567890');
      expect(res2).toEqual({ name: '081234567890', phone: '081234567890' });
    });

    it('correctly handles pure hyphenated phone numbers without splitting on dash', () => {
      // Refined behavior: When an unlabelled phone number has a hyphen (e.g. '0812-3456-7890'),
      // Pattern 0 treats the entire string as the phone number.
      const res = parseContactString('0812-3456-7890');
      expect(res.name).toBe('0812-3456-7890');
      expect(res.phone).toBe('0812-3456-7890');
      // When dialed via formatPhoneTelUri, it dials the complete number
      expect(formatPhoneTelUri(res.phone)).toBe('tel:081234567890');
    });

    it('returns text name only when no valid phone number exists', () => {
      const res = parseContactString('Sahabat Dekat Kampus');
      expect(res).toEqual({ name: 'Sahabat Dekat Kampus' });
    });
  });

  // ==========================================================================
  // SECTION 4: CLINICAL INTERVENTION LOGIC & PRIORITY HIERARCHY
  // ==========================================================================
  describe('Clinical Priority Hierarchy & Competing Triggers', () => {
    const afternoonTime = new Date('2026-10-10T14:00:00');
    const freshState: JitaiPersistedState = {
      date: '2026-10-10',
      dailyCount: 0,
      lastNudgeTimestamp: null,
      dismissedTypes: [],
      dismissedAllToday: false,
    };

    it('strictly prioritizes Priority 1 (Red Quadrant) over severe sleep issues and prolonged inactivity', () => {
      const acuteMood: MoodEntry = {
        id: 'mood-red',
        score: 1,
        quadrant: 'red',
        valence: -0.8,
        arousal: 0.9,
        emoji: '😟',
        factors: ['panic'],
        createdAt: new Date('2026-10-10T13:30:00').toISOString(),
      };

      const poorSleep: SleepDiaryEntry = {
        id: 'sleep-bad',
        date: '2026-10-10',
        bedTime: '23:00',
        wakeTime: '07:00',
        latencyMinutes: 60,
        awakeningsCount: 5,
        awakeningsDurationMinutes: 90,
        quality: 1,
        timeInBedMinutes: 480,
        totalSleepMinutes: 240,
        sleepEfficiency: 50,
        createdAt: new Date('2026-10-10T08:00:00').toISOString(),
      };

      const staleActivity: BaActivity = {
        id: 'act-stale',
        title: 'Walk',
        domain: 'pleasure',
        scheduledDate: '2026-10-05',
        predictedMood: 4,
        isCompleted: true,
        completedAt: new Date('2026-10-05T10:00:00').toISOString(),
        createdAt: new Date('2026-10-05T09:00:00').toISOString(),
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [acuteMood],
        sleepHistory: [poorSleep],
        activities: [staleActivity],
        persistedState: freshState,
      };

      const nudge = evaluateJitai(context);
      expect(nudge).not.toBeNull();
      expect(nudge?.type).toBe('mood_red_vagal_reset');
      expect(nudge?.targetRoute).toBe('/breathe');
      expect(nudge?.urgency).toBe('high');
    });

    it('cascades to Priority 4 (Sleep Efficiency) when Red Quadrant nudge is dismissed', () => {
      const acuteMood: MoodEntry = {
        id: 'mood-red',
        score: 1,
        quadrant: 'red',
        valence: -0.8,
        arousal: 0.9,
        emoji: '😟',
        factors: ['panic'],
        createdAt: new Date('2026-10-10T13:30:00').toISOString(),
      };

      const poorSleep: SleepDiaryEntry = {
        id: 'sleep-bad',
        date: '2026-10-10',
        bedTime: '23:00',
        wakeTime: '07:00',
        latencyMinutes: 15,
        awakeningsCount: 1,
        awakeningsDurationMinutes: 10,
        quality: 2,
        timeInBedMinutes: 480,
        totalSleepMinutes: 380,
        sleepEfficiency: 79,
        createdAt: new Date('2026-10-10T08:00:00').toISOString(),
      };

      const stateWithDismissal: JitaiPersistedState = {
        ...freshState,
        dismissedTypes: ['mood_red_vagal_reset'],
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [acuteMood],
        sleepHistory: [poorSleep],
        activities: [],
        persistedState: stateWithDismissal,
      };

      const nudge = evaluateJitai(context);
      expect(nudge).not.toBeNull();
      expect(nudge?.type).toBe('sleep_efficiency_stimulus_control');
      expect(nudge?.targetRoute).toBe('/sleep');
    });

    it('correctly prioritizes Priority 2 (Mood Drop) over Priority 3 (Blue Quadrant)', () => {
      const latestMood: MoodEntry = {
        id: 'mood-latest',
        score: 2,
        quadrant: 'blue',
        valence: -0.6,
        arousal: -0.5,
        emoji: '😢',
        factors: ['exhaustion'],
        createdAt: new Date('2026-10-10T13:00:00').toISOString(),
      };

      const prevMood: MoodEntry = {
        id: 'mood-prev',
        score: 5,
        quadrant: 'yellow',
        valence: 0.5,
        arousal: 0.5,
        emoji: '😊',
        factors: ['work'],
        createdAt: new Date('2026-10-10T01:00:00').toISOString(),
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [latestMood, prevMood],
        sleepHistory: [],
        activities: [],
        persistedState: freshState,
      };

      const nudge = evaluateJitai(context);
      expect(nudge).not.toBeNull();
      expect(nudge?.type).toBe('mood_drop_recovery');
      expect(nudge?.targetRoute).toBe('/journal');
    });

    it('suppresses nudges in calm/balanced green/yellow states (calm-tech principle)', () => {
      const happyMood: MoodEntry = {
        id: 'mood-green',
        score: 5,
        quadrant: 'green',
        valence: 0.6,
        arousal: -0.2,
        emoji: '🙂',
        factors: ['nature'],
        createdAt: new Date('2026-10-10T12:00:00').toISOString(),
      };

      const goodSleep: SleepDiaryEntry = {
        id: 'sleep-good',
        date: '2026-10-10',
        bedTime: '23:00',
        wakeTime: '07:00',
        latencyMinutes: 10,
        awakeningsCount: 0,
        awakeningsDurationMinutes: 0,
        quality: 5,
        timeInBedMinutes: 480,
        totalSleepMinutes: 470,
        sleepEfficiency: 98,
        createdAt: new Date('2026-10-10T07:30:00').toISOString(),
      };

      const context: JitaiContext = {
        currentTime: afternoonTime,
        moods: [happyMood],
        sleepHistory: [goodSleep],
        activities: [
          {
            id: 'act-done',
            title: 'Mindful Tea',
            domain: 'pleasure',
            scheduledDate: '2026-10-10',
            predictedMood: 5,
            isCompleted: true,
            completedAt: new Date('2026-10-10T11:00:00').toISOString(),
            createdAt: new Date('2026-10-10T10:00:00').toISOString(),
          },
        ],
        persistedState: freshState,
      };

      expect(evaluateJitai(context)).toBeNull();
    });
  });

  // ==========================================================================
  // SECTION 5: FAST-ACTION SAFETY CARD COMPONENT ADVERSARIAL STRESS TESTING
  // ==========================================================================
  describe('FastActionSafetyCard UI Adversarial Dialing Verification', () => {
    it('renders trusted contact button with sanitized tel: link even when raw contact has spaces and dashes', () => {
      render(
        <FastActionSafetyCard
          isOpen={true}
          customActions={{
            primaryCopingStrategy: 'Breathe slowly',
            trustedContact: {
              name: 'Dr. Hendra (Sp.KJ)',
              phone: '+62 (21) 500-119',
              relationship: 'Psikiater Utama',
            },
            hotline119: HOTLINE_119,
            hotline112: HOTLINE_112,
            somaticRoute: '/grounding',
          }}
        />
      );

      const contactLink = screen.getByRole('link', { name: /Dr\. Hendra/i });
      expect(contactLink).toBeDefined();
      expect(contactLink.getAttribute('href')).toBe('tel:+6221500119');

      const hotline119Link = screen.getByRole('link', { name: /SEJIWA/i });
      expect(hotline119Link.getAttribute('href')).toBe('tel:119,8');

      const hotline112Link = screen.getByRole('link', { name: /112/i });
      expect(hotline112Link.getAttribute('href')).toBe('tel:112');
    });

    it('renders setup guidance link when trustedContact is null without throwing errors', () => {
      render(
        <FastActionSafetyCard
          isOpen={true}
          customActions={{
            primaryCopingStrategy: DEFAULT_COPING_STRATEGY,
            trustedContact: null,
            hotline119: HOTLINE_119,
            hotline112: HOTLINE_112,
            somaticRoute: '/grounding',
          }}
        />
      );

      const setupLink = screen.getByRole('link', { name: /Atur Kontak Tepercaya/i });
      expect(setupLink).toBeDefined();
      expect(setupLink.getAttribute('href')).toBe('/safety-plan');
    });

    it('renders safely when trustedContact has name but empty/undefined phone number', () => {
      render(
        <FastActionSafetyCard
          isOpen={true}
          customActions={{
            primaryCopingStrategy: 'Grounding',
            trustedContact: {
              name: 'Teman Curhat',
              phone: undefined,
            },
            hotline119: HOTLINE_119,
            hotline112: HOTLINE_112,
            somaticRoute: '/grounding',
          }}
        />
      );

      const contactElement = document.querySelector('.fast-action-call-contact');
      expect(contactElement).toBeDefined();
      expect(contactElement?.tagName).toBe('DIV');
      expect(contactElement?.textContent).toContain('Teman Curhat');
      expect(contactElement?.textContent).toContain('Belum ada nomor telepon');
    });
  });
});
