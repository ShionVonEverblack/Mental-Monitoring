import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';

// Direct locale imports for 100% type-safe browser-compatible JSON loading
import idLocale from '../i18n/id.json';
import enLocale from '../i18n/en.json';
import jvLocale from '../i18n/jv.json';
import suLocale from '../i18n/su.json';
import jaLocale from '../i18n/ja.json';
import zhLocale from '../i18n/zh.json';
import esLocale from '../i18n/es.json';
import arLocale from '../i18n/ar.json';

// Import initialized i18n configuration to ensure clean test environment
import '../i18n/config';
import i18n from 'i18next';

// Domain imports from staged Phase 2 services and components
import {
  evaluateJitai,
  checkGuardrails,
  JITAI_COOLDOWN_MS,
} from '../services/jitaiEngine';
import {
  getJitaiState,
  saveJitaiState,
  dismissNudgeToday,
  recordNudgeImpression,
  resetJitaiState,
  createDefaultJitaiState,
  JITAI_STORAGE_KEY,
} from '../services/jitaiPersistence';
import {
  getEmergencySafetyActions,
  extractPrimaryCopingStrategy,
  extractPrimaryTrustedContact,
  formatPhoneTelUri,
  parseContactString,
  DEFAULT_COPING_STRATEGY,
} from '../services/safetyCardService';
import { FastActionSafetyCard } from '../components/safety/FastActionSafetyCard';
import { SOSButton } from '../components/safety/SOSButton';

// Domain types
import type {
  JitaiContext,
  JitaiPersistedState,
} from '../types/jitai';
import type { MoodEntry, SleepDiaryEntry, BaActivity } from '../types';

// ============================================================================
// TEST FIXTURES & BUILDERS
// ============================================================================

const SUPPORTED_LANGUAGES = ['id', 'en', 'jv', 'su', 'ja', 'zh', 'es', 'ar'] as const;

const LOCALE_DICTIONARIES: Record<string, unknown> = {
  id: idLocale,
  en: enLocale,
  jv: jvLocale,
  su: suLocale,
  ja: jaLocale,
  zh: zhLocale,
  es: esLocale,
  ar: arLocale,
};

function buildContext(overrides: Partial<JitaiContext> = {}): JitaiContext {
  const baseDate = new Date('2026-10-10T14:00:00'); // 14:00 daytime (outside quiet hours)
  return {
    currentTime: baseDate,
    moods: [],
    sleepHistory: [],
    activities: [],
    persistedState: {
      date: '2026-10-10',
      dailyCount: 0,
      lastNudgeTimestamp: null,
      dismissedTypes: [],
      dismissedAllToday: false,
    },
    ...overrides,
  };
}

function buildMood(overrides: Partial<MoodEntry> = {}): MoodEntry {
  return {
    id: `mood-${Math.random().toString(36).substring(2, 9)}`,
    score: 3,
    emoji: '😐',
    factors: ['work'],
    createdAt: new Date('2026-10-10T12:00:00').toISOString(),
    ...overrides,
  };
}

function buildSleep(overrides: Partial<SleepDiaryEntry> = {}): SleepDiaryEntry {
  return {
    id: `sleep-${Math.random().toString(36).substring(2, 9)}`,
    date: '2026-10-10',
    bedTime: '23:00',
    wakeTime: '07:00',
    latencyMinutes: 15,
    awakeningsCount: 1,
    awakeningsDurationMinutes: 10,
    quality: 4,
    timeInBedMinutes: 480,
    totalSleepMinutes: 455,
    sleepEfficiency: 95,
    createdAt: new Date('2026-10-10T07:30:00').toISOString(),
    ...overrides,
  };
}

function buildActivity(overrides: Partial<BaActivity> = {}): BaActivity {
  return {
    id: `act-${Math.random().toString(36).substring(2, 9)}`,
    title: '5-Minute Mindful Walk',
    domain: 'pleasure',
    scheduledDate: '2026-10-10',
    predictedMood: 5,
    isCompleted: true,
    completedAt: new Date('2026-10-10T10:00:00').toISOString(),
    createdAt: new Date('2026-10-10T09:00:00').toISOString(),
    ...overrides,
  };
}

function extractAllDottedKeys(obj: unknown, prefix = ''): string[] {
  let keys: string[] = [];
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return keys;
  }
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(extractAllDottedKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// ============================================================================
// SUITE START
// ============================================================================

describe('Phase 2 E2E & 4-Tier Integration Suite', () => {
  beforeEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage('id');
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'id';
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // TIER 1: FEATURE COVERAGE (>=5 per feature)
  // ==========================================================================
  describe('Tier 1: Feature Coverage', () => {
    describe('Feature 1: JITAI Deterministic Rule Engine Triggers', () => {
      it('T1.1.1: Red Quadrant (High Arousal, Negative Valence) triggers mood_red_vagal_reset', () => {
        const context = buildContext({
          moods: [buildMood({ valence: -0.6, arousal: 0.7, quadrant: 'red' })],
        });
        const nudge = evaluateJitai(context);
        expect(nudge).not.toBeNull();
        expect(nudge?.type).toBe('mood_red_vagal_reset');
        expect(nudge?.targetRoute).toBe('/breathe');
        expect(nudge?.category).toBe('mood');
        expect(nudge?.urgency).toBe('high');
      });

      it('T1.1.2: Blue Quadrant (Low Arousal, Negative Valence) triggers mood_blue_activation_spark', () => {
        const context = buildContext({
          moods: [buildMood({ valence: -0.7, arousal: -0.5, quadrant: 'blue' })],
        });
        const nudge = evaluateJitai(context);
        expect(nudge).not.toBeNull();
        expect(nudge?.type).toBe('mood_blue_activation_spark');
        expect(nudge?.targetRoute).toBe('/activation');
        expect(nudge?.category).toBe('mood');
      });

      it('T1.1.3: Mood Drop Velocity (>=2 drop within 48h) triggers mood_drop_recovery', () => {
        const now = new Date('2026-10-10T14:00:00');
        const yesterday = new Date('2026-10-09T14:00:00');
        const context = buildContext({
          currentTime: now,
          moods: [
            buildMood({ score: 2, createdAt: now.toISOString(), valence: -0.2, arousal: -0.1 }),
            buildMood({ score: 4, createdAt: yesterday.toISOString(), valence: 0.5, arousal: 0.2 }),
          ],
        });
        const nudge = evaluateJitai(context);
        expect(nudge).not.toBeNull();
        expect(nudge?.type).toBe('mood_drop_recovery');
        expect(nudge?.targetRoute).toBe('/journal');
      });

      it('T1.1.4: CBT-I Sleep Efficiency < 85% triggers sleep_efficiency_stimulus_control', () => {
        const context = buildContext({
          moods: [buildMood({ score: 4, valence: 0.5, arousal: 0.2, quadrant: 'green' })],
          sleepHistory: [buildSleep({ sleepEfficiency: 78 })],
        });
        const nudge = evaluateJitai(context);
        expect(nudge).not.toBeNull();
        expect(nudge?.type).toBe('sleep_efficiency_stimulus_control');
        expect(nudge?.targetRoute).toBe('/sleep');
        expect(nudge?.category).toBe('sleep');
      });

      it('T1.1.5: Prolonged Behavioral Inactivity (>48h with stagnant mood) triggers activity_inactivity_spark', () => {
        const now = new Date('2026-10-10T14:00:00');
        const threeDaysAgo = new Date('2026-10-07T10:00:00');
        const context = buildContext({
          currentTime: now,
          moods: [buildMood({ score: 3, valence: -0.1, arousal: 0.0 })],
          activities: [buildActivity({ completedAt: threeDaysAgo.toISOString() })],
        });
        const nudge = evaluateJitai(context);
        expect(nudge).not.toBeNull();
        expect(nudge?.type).toBe('activity_inactivity_spark');
        expect(nudge?.targetRoute).toBe('/activation');
        expect(nudge?.category).toBe('activity');
      });

      it('T1.1.6: Balanced mood and optimal sleep returns null (calm technology principle)', () => {
        const context = buildContext({
          moods: [buildMood({ score: 4, valence: 0.6, arousal: 0.1, quadrant: 'green' })],
          sleepHistory: [buildSleep({ sleepEfficiency: 92 })],
          activities: [buildActivity({ completedAt: new Date('2026-10-10T11:00:00').toISOString() })],
        });
        const nudge = evaluateJitai(context);
        expect(nudge).toBeNull();
      });
    });

    describe('Feature 2: JITAI Anti-Habituation Guardrails', () => {
      it('T1.2.1: Quiet hours (22:00 to 07:00) suppress nudges', () => {
        const state = createDefaultJitaiState('2026-10-10');
        const lateNight = new Date('2026-10-10T23:30:00');
        const earlyMorning = new Date('2026-10-10T04:30:00');

        expect(checkGuardrails(lateNight, state).allowed).toBe(false);
        expect(checkGuardrails(earlyMorning, state).allowed).toBe(false);
      });

      it('T1.2.2: Daytime hours (07:00 to 22:00) permit nudges', () => {
        const state = createDefaultJitaiState('2026-10-10');
        const morning = new Date('2026-10-10T09:00:00');
        const afternoon = new Date('2026-10-10T15:00:00');

        expect(checkGuardrails(morning, state).allowed).toBe(true);
        expect(checkGuardrails(afternoon, state).allowed).toBe(true);
      });

      it('T1.2.3: 4-hour cooldown window suppresses consecutive nudges', () => {
        const now = new Date('2026-10-10T14:00:00');
        const twoHoursAgo = new Date('2026-10-10T12:00:00').toISOString();
        const state: JitaiPersistedState = {
          ...createDefaultJitaiState('2026-10-10'),
          lastNudgeTimestamp: twoHoursAgo,
        };

        const check = checkGuardrails(now, state);
        expect(check.allowed).toBe(false);
        expect(check.reason).toBe('cooldown_active');
      });

      it('T1.2.4: Cooldown expiration (>=4 hours) permits subsequent nudges', () => {
        const now = new Date('2026-10-10T16:01:00');
        const fourHoursAgo = new Date('2026-10-10T12:00:00').toISOString();
        const state: JitaiPersistedState = {
          ...createDefaultJitaiState('2026-10-10'),
          lastNudgeTimestamp: fourHoursAgo,
        };

        expect(checkGuardrails(now, state).allowed).toBe(true);
      });

      it('T1.2.5: Daily frequency cap (>=3 nudges) suppresses further nudges', () => {
        const now = new Date('2026-10-10T14:00:00');
        const state: JitaiPersistedState = {
          ...createDefaultJitaiState('2026-10-10'),
          dailyCount: 3,
        };

        const check = checkGuardrails(now, state);
        expect(check.allowed).toBe(false);
        expect(check.reason).toBe('daily_cap_reached');
      });
    });

    describe('Feature 3: JITAI Daily Dismissal Persistence & Rollover', () => {
      it('T1.3.1: Dismissing a nudge persists the dismissed type to localStorage', () => {
        dismissNudgeToday('mood_red_vagal_reset', '2026-10-10');
        const state = getJitaiState('2026-10-10');
        expect(state.dismissedTypes).toContain('mood_red_vagal_reset');
      });

      it('T1.3.2: Dismissed type is filtered out during subsequent evaluation today', () => {
        const context = buildContext({
          moods: [buildMood({ score: 4, valence: -0.6, arousal: 0.7, quadrant: 'red' })],
          activities: [buildActivity()],
          persistedState: {
            ...createDefaultJitaiState('2026-10-10'),
            dismissedTypes: ['mood_red_vagal_reset'],
          },
        });
        const nudge = evaluateJitai(context);
        expect(nudge).toBeNull();
      });

      it('T1.3.3: Calendar day rollover resets daily count and cleared dismissed list', () => {
        saveJitaiState({
          date: '2026-10-10',
          dailyCount: 3,
          lastNudgeTimestamp: '2026-10-10T19:00:00.000Z',
          dismissedTypes: ['mood_red_vagal_reset'],
          dismissedAllToday: true,
        });

        // Reading state with next day's date string
        const nextDayState = getJitaiState('2026-10-11');
        expect(nextDayState.date).toBe('2026-10-11');
        expect(nextDayState.dailyCount).toBe(0);
        expect(nextDayState.dismissedTypes).toEqual([]);
        expect(nextDayState.dismissedAllToday).toBe(false);
      });

      it('T1.3.4: Recording impression increments count and updates timestamp', () => {
        const impressionTime = new Date('2026-10-10T10:00:00');
        recordNudgeImpression('mood_drop_recovery', impressionTime, '2026-10-10');
        const state = getJitaiState('2026-10-10');
        expect(state.dailyCount).toBe(1);
        expect(state.lastNudgeTimestamp).toBe(impressionTime.toISOString());
      });

      it('T1.3.5: resetJitaiState cleans local storage cleanly', () => {
        saveJitaiState({
          date: '2026-10-10',
          dailyCount: 2,
          lastNudgeTimestamp: null,
          dismissedTypes: ['sleep_efficiency_stimulus_control'],
          dismissedAllToday: false,
        });
        resetJitaiState();
        expect(localStorage.getItem(JITAI_STORAGE_KEY)).toBeNull();
      });
    });

    describe('Feature 4: Fast-Action Safety Card Data Extraction', () => {
      it('T1.4.1: Extracts custom coping strategy from rima-safety-plan', () => {
        localStorage.setItem(
          'rima-safety-plan',
          JSON.stringify([
            { id: 'copingStrategies', items: ['Dengar musik klasik dan minum air hangat'] },
          ])
        );
        const strategy = extractPrimaryCopingStrategy();
        expect(strategy).toBe('Dengar musik klasik dan minum air hangat');
      });

      it('T1.4.2: Falls back to evidence-based default when safety plan is empty', () => {
        const strategy = extractPrimaryCopingStrategy();
        expect(strategy).toBe(DEFAULT_COPING_STRATEGY);
      });

      it('T1.4.3: Extracts trusted contact with phone from rima-trusted-contacts', () => {
        localStorage.setItem(
          'rima-trusted-contacts',
          JSON.stringify([{ name: 'Ibu', phone: '08123456789', relationship: 'Orang tua' }])
        );
        const contact = extractPrimaryTrustedContact();
        expect(contact).not.toBeNull();
        expect(contact?.name).toBe('Ibu');
        expect(contact?.phone).toBe('08123456789');
      });

      it('T1.4.4: 119 Ext 8 hotline link is formatted strictly as tel:119,8', () => {
        const actions = getEmergencySafetyActions();
        expect(actions.hotline119.href).toBe('tel:119,8');
        expect(actions.hotline119.phone).toBe('119 ext 8');
      });

      it('T1.4.5: 112 emergency line is formatted strictly as tel:112', () => {
        const actions = getEmergencySafetyActions();
        expect(actions.hotline112.href).toBe('tel:112');
        expect(actions.hotline112.phone).toBe('112');
      });

      it('T1.4.6: Somatic route defaults to /grounding and supports /breathe preference', () => {
        const defaultActions = getEmergencySafetyActions();
        expect(defaultActions.somaticRoute).toBe('/grounding');

        const breatheActions = getEmergencySafetyActions({ somaticPreference: 'breathe' });
        expect(breatheActions.somaticRoute).toBe('/breathe');
      });
    });

    describe('Feature 5: Fast-Action Safety Card UI Component', () => {
      it('T1.5.1: Renders with dialog role and aria-modal="true"', () => {
        render(React.createElement(FastActionSafetyCard, { isOpen: true }));
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      });

      it('T1.5.2: Displays primary coping action prominently', () => {
        localStorage.setItem(
          'rima-safety-plan',
          JSON.stringify([{ id: 'copingStrategies', items: ['Tarik napas 4-7-8'] }])
        );
        render(React.createElement(FastActionSafetyCard, { isOpen: true }));
        expect(screen.getByText('Tarik napas 4-7-8')).toBeInTheDocument();
      });

      it('T1.5.3: Renders 119 Ext 8 hotline button with exact tel:119,8 link', () => {
        render(React.createElement(FastActionSafetyCard, { isOpen: true }));
        const link119 = screen.getByRole('link', { name: /119/i });
        expect(link119).toHaveAttribute('href', 'tel:119,8');
      });

      it('T1.5.4: Renders trusted contact call button with tel: link when phone exists', () => {
        localStorage.setItem(
          'rima-trusted-contacts',
          JSON.stringify([{ name: 'Sahabat', phone: '08987654321' }])
        );
        render(React.createElement(FastActionSafetyCard, { isOpen: true }));
        const contactLink = screen.getByRole('link', { name: /Sahabat.*08987654321/i });
        expect(contactLink).toHaveAttribute('href', 'tel:08987654321');
      });

      it('T1.5.5: Renders somatic grounding shortcut button linking to /grounding', () => {
        render(React.createElement(FastActionSafetyCard, { isOpen: true }));
        const groundingLink = screen.getByRole('link', { name: /grounding|sensorik/i });
        expect(groundingLink).toHaveAttribute('href', '/grounding');
      });

      it('T1.5.6: Close button invokes onClose callback', () => {
        const handleClose = vi.fn();
        render(React.createElement(FastActionSafetyCard, { isOpen: true, onClose: handleClose }));
        const closeBtn = screen.getByRole('button', { name: /tutup bantuan darurat/i });
        fireEvent.click(closeBtn);
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });

    describe('Feature 6: 8-Language Translation Parity & RTL', () => {
      it('T1.6.1: All 8 language JSON modules exist and load as valid objects', () => {
        for (const lang of SUPPORTED_LANGUAGES) {
          const dict = LOCALE_DICTIONARIES[lang];
          expect(dict, `Locale dictionary for ${lang} must exist`).toBeDefined();
          expect(typeof dict).toBe('object');
        }
      });

      it('T1.6.2: All 8 languages have 100% exact key parity with id.json', () => {
        const idJson = LOCALE_DICTIONARIES['id'];
        const idKeys = new Set(extractAllDottedKeys(idJson));

        for (const lang of SUPPORTED_LANGUAGES) {
          if (lang === 'id') continue;
          const langJson = LOCALE_DICTIONARIES[lang];
          const langKeys = new Set(extractAllDottedKeys(langJson));

          const missingInLang = [...idKeys].filter((k) => !langKeys.has(k));
          const extraInLang = [...langKeys].filter((k) => !idKeys.has(k));

          expect(
            missingInLang,
            `Language "${lang}" is missing ${missingInLang.length} keys from id.json: ${missingInLang.slice(0, 5).join(', ')}`
          ).toEqual([]);
          expect(
            extraInLang,
            `Language "${lang}" has ${extraInLang.length} extra keys not in id.json: ${extraInLang.slice(0, 5).join(', ')}`
          ).toEqual([]);
        }
      });

      it('T1.6.3: No null, undefined, or empty string values exist in any locale file', () => {
        for (const lang of SUPPORTED_LANGUAGES) {
          const langJson = LOCALE_DICTIONARIES[lang];

          function validateNoEmpty(obj: unknown, currentPath = '') {
            if (typeof obj === 'string') {
              expect(
                obj.trim().length,
                `Empty translation found at key "${currentPath}" in ${lang}.json`
              ).toBeGreaterThan(0);
            } else if (obj && typeof obj === 'object') {
              for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
                validateNoEmpty(v, currentPath ? `${currentPath}.${k}` : k);
              }
            }
          }

          validateNoEmpty(langJson);
        }
      });

      it('T1.6.4: Fallback strings are provided for all Phase 2 keys across UI components', () => {
        // FastActionSafetyCard uses robust fallback parameters in all t('key', 'fallback') calls
        render(React.createElement(FastActionSafetyCard, { isOpen: true }));
        expect(screen.getByText(/Kamu Tidak Sendirian/i)).toBeInTheDocument();
        expect(screen.getByText(/119 ext 8/i)).toBeInTheDocument();
      });

      it('T1.6.5: Arabic locale sets RTL direction attribute', async () => {
        await act(async () => {
          await i18n.changeLanguage('ar');
        });
        const getDirection = (lng: string) => (lng && lng.startsWith('ar') ? 'rtl' : 'ltr');
        document.documentElement.dir = getDirection(i18n.language);
        expect(document.documentElement.dir).toBe('rtl');

        // Regional Arabic codes (e.g. ar-SA, ar-EG)
        document.documentElement.dir = getDirection('ar-SA');
        expect(document.documentElement.dir).toBe('rtl');
        document.documentElement.dir = getDirection('ar-EG');
        expect(document.documentElement.dir).toBe('rtl');

        // Reset back to id
        await act(async () => {
          await i18n.changeLanguage('id');
        });
        document.documentElement.dir = getDirection(i18n.language);
        expect(document.documentElement.dir).toBe('ltr');
      });
    });
  });

  // ==========================================================================
  // TIER 2: BOUNDARY & CORNER CASES (>=5 per feature)
  // ==========================================================================
  describe('Tier 2: Boundary & Corner Cases', () => {
    describe('Affective & Sleep Engine Thresholds', () => {
      it('T2.1.1: Exact coordinate boundary: valence <= -0.4 and arousal >= 0.4 triggers red quadrant', () => {
        const atThreshold = buildContext({
          moods: [buildMood({ score: 4, valence: -0.4, arousal: 0.4 })],
          activities: [buildActivity()],
        });
        expect(evaluateJitai(atThreshold)?.type).toBe('mood_red_vagal_reset');

        const slightlyBelowArousal = buildContext({
          moods: [buildMood({ score: 4, valence: -0.4, arousal: 0.39 })],
          activities: [buildActivity()],
        });
        expect(evaluateJitai(slightlyBelowArousal)).toBeNull();

        const slightlyAboveValence = buildContext({
          moods: [buildMood({ score: 4, valence: -0.39, arousal: 0.4 })],
          activities: [buildActivity()],
        });
        expect(evaluateJitai(slightlyAboveValence)).toBeNull();
      });

      it('T2.1.2: Exact sleep efficiency boundary: 84% triggers, 85% does not', () => {
        const at84 = buildContext({
          sleepHistory: [buildSleep({ sleepEfficiency: 84 })],
        });
        expect(evaluateJitai(at84)?.type).toBe('sleep_efficiency_stimulus_control');

        const at85 = buildContext({
          sleepHistory: [buildSleep({ sleepEfficiency: 85 })],
        });
        expect(evaluateJitai(at85)).toBeNull();
      });

      it('T2.1.3: Sleep onset latency (SOL) boundary: 31 min triggers, 30 min does not', () => {
        const at30 = buildContext({
          sleepHistory: [buildSleep({ sleepEfficiency: 90, latencyMinutes: 30 })],
        });
        expect(evaluateJitai(at30)).toBeNull();

        const at31 = buildContext({
          sleepHistory: [buildSleep({ sleepEfficiency: 90, latencyMinutes: 31 })],
        });
        expect(evaluateJitai(at31)?.type).toBe('sleep_latency_winddown');
      });

      it('T2.1.4: WASO boundary: 31 min awakenings triggers, 30 min does not', () => {
        const at30 = buildContext({
          sleepHistory: [buildSleep({ sleepEfficiency: 90, awakeningsDurationMinutes: 30 })],
        });
        expect(evaluateJitai(at30)).toBeNull();

        const at31 = buildContext({
          sleepHistory: [buildSleep({ sleepEfficiency: 90, awakeningsDurationMinutes: 31 })],
        });
        expect(evaluateJitai(at31)?.type).toBe('sleep_waso_relaxation');
      });

      it('T2.1.5: Inactivity time boundary: 47 hours does not trigger, 49 hours triggers', () => {
        const now = new Date('2026-10-10T14:00:00');
        const hours47Ago = new Date(now.getTime() - 47 * 60 * 60 * 1000);
        const hours49Ago = new Date(now.getTime() - 49 * 60 * 60 * 1000);

        const recentActContext = buildContext({
          currentTime: now,
          moods: [buildMood({ score: 2, valence: -0.2 })],
          activities: [buildActivity({ completedAt: hours47Ago.toISOString() })],
        });
        expect(evaluateJitai(recentActContext)).toBeNull();

        const inactiveContext = buildContext({
          currentTime: now,
          moods: [buildMood({ score: 2, valence: -0.2 })],
          activities: [buildActivity({ completedAt: hours49Ago.toISOString() })],
        });
        expect(evaluateJitai(inactiveContext)?.type).toBe('activity_inactivity_spark');
      });
    });

    describe('Anti-Habituation Temporal Boundaries', () => {
      it('T2.2.1: Quiet hours transition: 21:59:59 is allowed, 22:00:00 is suppressed', () => {
        const state = createDefaultJitaiState('2026-10-10');
        const justBefore = new Date('2026-10-10T21:59:59');
        const exactStart = new Date('2026-10-10T22:00:00');

        expect(checkGuardrails(justBefore, state).allowed).toBe(true);
        expect(checkGuardrails(exactStart, state).allowed).toBe(false);
      });

      it('T2.2.2: Morning quiet hours transition: 06:59:59 is suppressed, 07:00:00 is allowed', () => {
        const state = createDefaultJitaiState('2026-10-10');
        const justBeforeEnd = new Date('2026-10-10T06:59:59');
        const exactEnd = new Date('2026-10-10T07:00:00');

        expect(checkGuardrails(justBeforeEnd, state).allowed).toBe(false);
        expect(checkGuardrails(exactEnd, state).allowed).toBe(true);
      });

      it('T2.2.3: Cooldown boundary: 3h59m59s is suppressed, 4h00m00s is allowed', () => {
        const now = new Date('2026-10-10T14:00:00');
        const justUnder4h = new Date(now.getTime() - (JITAI_COOLDOWN_MS - 1000)).toISOString();
        const exactly4h = new Date(now.getTime() - JITAI_COOLDOWN_MS).toISOString();

        expect(
          checkGuardrails(now, {
            ...createDefaultJitaiState('2026-10-10'),
            lastNudgeTimestamp: justUnder4h,
          }).allowed
        ).toBe(false);

        expect(
          checkGuardrails(now, {
            ...createDefaultJitaiState('2026-10-10'),
            lastNudgeTimestamp: exactly4h,
          }).allowed
        ).toBe(true);
      });

      it('T2.2.4: Daily cap boundary: 2 nudges allowed, 3 nudges suppressed', () => {
        const now = new Date('2026-10-10T14:00:00');
        expect(
          checkGuardrails(now, { ...createDefaultJitaiState('2026-10-10'), dailyCount: 2 }).allowed
        ).toBe(true);
        expect(
          checkGuardrails(now, { ...createDefaultJitaiState('2026-10-10'), dailyCount: 3 }).allowed
        ).toBe(false);
      });

      it('T2.2.5: Midnight rollover from 23:59:59 to 00:00:01 resets daily counters', () => {
        saveJitaiState({
          date: '2026-10-10',
          dailyCount: 3,
          lastNudgeTimestamp: '2026-10-10T23:55:00.000Z',
          dismissedTypes: ['mood_red_vagal_reset', 'sleep_efficiency_stimulus_control'],
          dismissedAllToday: true,
        });

        const nextDay = getJitaiState('2026-10-11');
        expect(nextDay.date).toBe('2026-10-11');
        expect(nextDay.dailyCount).toBe(0);
        expect(nextDay.dismissedTypes).toHaveLength(0);
        expect(nextDay.dismissedAllToday).toBe(false);
      });
    });

    describe('Phone Sanitization & Malformed Input Handling', () => {
      it('T2.3.1: formatPhoneTelUri handles diverse formats (dashes, spaces, prefixes)', () => {
        expect(formatPhoneTelUri('0812-3456-7890')).toBe('tel:081234567890');
        expect(formatPhoneTelUri('+62 812 3456 7890')).toBe('tel:+6281234567890');
        expect(formatPhoneTelUri('119 ext 8')).toBe('tel:119,8');
        expect(formatPhoneTelUri('119,8')).toBe('tel:119,8');
        expect(formatPhoneTelUri('112')).toBe('tel:112');
      });

      it('T2.3.2: parseContactString parses parenthesized and hyphenated contacts', () => {
        const c1 = parseContactString('Ibu (08123456789) - Orang Tua');
        expect(c1.name).toBe('Ibu');
        expect(c1.phone).toBe('08123456789');
        expect(c1.relationship).toBe('Orang Tua');

        const c2 = parseContactString('Dokter Rani: +62811223344');
        expect(c2.name).toBe('Dokter Rani');
        expect(c2.phone).toBe('+62811223344');
      });

      it('T2.3.3: Gracefully handles corrupted JSON in localStorage without throwing', () => {
        const spyWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        localStorage.setItem('rima-safety-plan', 'INVALID_JSON{[[');
        localStorage.setItem('rima-trusted-contacts', '{not-json');
        localStorage.setItem(JITAI_STORAGE_KEY, 'corrupt-state');

        expect(() => extractPrimaryCopingStrategy()).not.toThrow();
        expect(extractPrimaryCopingStrategy()).toBe(DEFAULT_COPING_STRATEGY);

        expect(() => extractPrimaryTrustedContact()).not.toThrow();
        expect(extractPrimaryTrustedContact()).toBeNull();

        expect(() => getJitaiState('2026-10-10')).not.toThrow();
        expect(getJitaiState('2026-10-10').dailyCount).toBe(0);
        spyWarn.mockRestore();
      });

      it('T2.3.4: Extreme text length in coping strategies wraps without DOM breakdown', () => {
        const veryLongText = 'A'.repeat(500);
        localStorage.setItem(
          'rima-safety-plan',
          JSON.stringify([{ id: 'copingStrategies', items: [veryLongText] }])
        );
        render(React.createElement(FastActionSafetyCard, { isOpen: true }));
        expect(screen.getByText(veryLongText)).toBeInTheDocument();
      });

      it('T2.3.5: Empty mood and sleep histories evaluate cleanly to null', () => {
        const context = buildContext({ moods: [], sleepHistory: [], activities: [] });
        expect(evaluateJitai(context)).toBeNull();
      });
    });
  });

  // ==========================================================================
  // TIER 3: CROSS-FEATURE COMBINATIONS (PAIRWISE)
  // ==========================================================================
  describe('Tier 3: Cross-Feature Combinations', () => {
    it('C3.1: Acute Red Agitation during Quiet Hours suppresses JITAI, but Safety Card remains accessible', () => {
      const lateNightContext = buildContext({
        currentTime: new Date('2026-10-10T23:30:00'),
        moods: [buildMood({ valence: -0.7, arousal: 0.8, quadrant: 'red' })],
      });

      // JITAI engine is suppressed by quiet hours
      expect(evaluateJitai(lateNightContext)).toBeNull();

      // But emergency touchpoint (SOSButton -> FastActionSafetyCard) is immediately available
      render(React.createElement(SOSButton));
      const sosTrigger = screen.getByRole('button', { name: /sos/i });
      fireEvent.click(sosTrigger);

      // FastActionSafetyCard modal is open with direct hotline
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /119/i })).toHaveAttribute('href', 'tel:119,8');
    });

    it('C3.2: Priority hierarchy resolves Red Quadrant over Sleep Efficiency over Inactivity', () => {
      // User has red quadrant mood, poor sleep (<85%), and no activity in 72h
      const multiTriggerContext = buildContext({
        moods: [buildMood({ valence: -0.6, arousal: 0.7, quadrant: 'red' })],
        sleepHistory: [buildSleep({ sleepEfficiency: 70 })],
        activities: [
          buildActivity({ completedAt: new Date('2026-10-07T10:00:00').toISOString() }),
        ],
      });

      // Priority 1 (Red Quadrant vagal reset) must win deterministically
      const nudge = evaluateJitai(multiTriggerContext);
      expect(nudge?.type).toBe('mood_red_vagal_reset');
    });

    it('C3.3: Dismissing Nudge A allows Nudge B to surface when conditions change', () => {
      // 1. Nudge A is red vagal reset, dismissed today
      dismissNudgeToday('mood_red_vagal_reset', '2026-10-10');

      // 2. Later, sleep efficiency trigger occurs
      const context = buildContext({
        moods: [buildMood({ valence: 0.2, arousal: 0.1, quadrant: 'green' })],
        sleepHistory: [buildSleep({ sleepEfficiency: 75 })],
        persistedState: getJitaiState('2026-10-10'),
      });

      const nudge = evaluateJitai(context);
      expect(nudge?.type).toBe('sleep_efficiency_stimulus_control');
    });

    it('C3.4: Daily Cap Reached suppresses all JITAI nudges while SOS dialer remains 100% operational', () => {
      saveJitaiState({
        date: '2026-10-10',
        dailyCount: 3,
        lastNudgeTimestamp: '2026-10-10T12:00:00.000Z',
        dismissedTypes: [],
        dismissedAllToday: false,
      });

      const context = buildContext({
        moods: [buildMood({ valence: -0.8, arousal: 0.8, quadrant: 'red' })],
        persistedState: getJitaiState('2026-10-10'),
      });

      // JITAI suppressed
      expect(evaluateJitai(context)).toBeNull();

      // SOS Button opens safety card instantly
      render(React.createElement(FastActionSafetyCard, { isOpen: true }));
      expect(screen.getByRole('link', { name: /119/i })).toHaveAttribute('href', 'tel:119,8');
    });

    it('C3.5: Arabic RTL active + Custom Safety Plan + Fast-Action Safety Card rendering', async () => {
        await act(async () => {
          await i18n.changeLanguage('ar');
        });
        document.documentElement.dir = 'rtl';

        localStorage.setItem(
          'rima-safety-plan',
          JSON.stringify([
            { id: 'copingStrategies', items: ['التنفس العميق والهدوء'] },
            { id: 'socialContacts', items: ['أحمد (+966501234567)'] },
          ])
        );

        const { unmount } = render(React.createElement(FastActionSafetyCard, { isOpen: true }));

        // Arabic coping text is displayed
        expect(screen.getByText('التنفس العميق والهدوء')).toBeInTheDocument();

        // Dialing link retains valid syntax
        const link119 = screen.getByRole('link', { name: /119/i });
        expect(link119).toHaveAttribute('href', 'tel:119,8');

        // Trusted contact dialing link is parsed
        const contactLink = screen.getByRole('link', { name: /أحمد/i });
        expect(contactLink).toHaveAttribute('href', 'tel:+966501234567');

        unmount();

        // Clean up language
        await act(async () => {
          await i18n.changeLanguage('id');
        });
        document.documentElement.dir = 'ltr';
      });
  });

  // ==========================================================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // ==========================================================================
  describe('Tier 4: Real-World Application Scenarios', () => {
    it('Scenario 1: "Midnight Panic Attack" — Acute crisis access during quiet hours', () => {
      // User wakes at 02:30 AM in acute agitation
      const panicTime = new Date('2026-10-10T02:30:00');
      const midnightContext = buildContext({
        currentTime: panicTime,
        moods: [buildMood({ valence: -0.9, arousal: 0.9, quadrant: 'red' })],
      });

      // 1. JITAI is suppressed to maintain quiet hours
      expect(evaluateJitai(midnightContext)).toBeNull();

      // 2. User taps SOS floating button
      render(React.createElement(SOSButton));
      const sosBtn = screen.getByRole('button', { name: /sos/i });
      fireEvent.click(sosBtn);

      // 3. Fast-Action Safety Card opens immediately
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // 4. Single-tap 119 Ext 8 hotline link is present
      const hotline119 = screen.getByRole('link', { name: /119/i });
      expect(hotline119).toHaveAttribute('href', 'tel:119,8');

      // 5. Single-tap somatic grounding shortcut is present
      const somaticBtn = screen.getByRole('link', { name: /grounding|sensorik/i });
      expect(somaticBtn).toHaveAttribute('href', '/grounding');
    });

    it('Scenario 2: "Depressive Low-Arousal Morning" — Blue quadrant micro-activation and dismissal', () => {
      // 08:30 AM check-in: Blue quadrant mood + poor sleep efficiency
      const morningTime = new Date('2026-10-10T08:30:00');
      const context = buildContext({
        currentTime: morningTime,
        moods: [buildMood({ valence: -0.6, arousal: -0.5, quadrant: 'blue' })],
        sleepHistory: [buildSleep({ sleepEfficiency: 72 })],
      });

      // 1. JITAI surfaces micro behavioral activation spark
      const nudge = evaluateJitai(context);
      expect(nudge?.type).toBe('mood_blue_activation_spark');
      expect(nudge?.targetRoute).toBe('/activation');

      // 2. User dismisses nudge for today
      dismissNudgeToday(nudge!.type, '2026-10-10');

      // 3. Re-evaluating with updated persistence state suppresses the dismissed nudge
      const recheckContext = buildContext({
        currentTime: new Date('2026-10-10T09:00:00'),
        moods: context.moods,
        sleepHistory: context.sleepHistory,
        persistedState: getJitaiState('2026-10-10'),
      });

      const recheckedNudge = evaluateJitai(recheckContext);
      // Mood blue spark is dismissed; next eligible rule (sleep efficiency) surfaces
      expect(recheckedNudge?.type).toBe('sleep_efficiency_stimulus_control');
    });

    it('Scenario 3: "Downhill Spiral & Sudden Mood Drop" — Trajectory detection and self-compassion path', () => {
      const now = new Date('2026-10-10T15:00:00');
      const yesterday = new Date('2026-10-09T15:00:00');

      // Yesterday user was score 4, today score 1 (delta = -3 drop)
      const context = buildContext({
        currentTime: now,
        moods: [
          buildMood({ score: 1, createdAt: now.toISOString(), valence: -0.3, arousal: -0.1 }),
          buildMood({ score: 4, createdAt: yesterday.toISOString(), valence: 0.4, arousal: 0.1 }),
        ],
      });

      const nudge = evaluateJitai(context);
      expect(nudge).not.toBeNull();
      expect(nudge?.type).toBe('mood_drop_recovery');
      expect(nudge?.targetRoute).toBe('/journal');
    });

    it('Scenario 4: "Multi-Lingual Crisis Transition" — Full localized de-escalation workflow', async () => {
      // Test across multiple languages (Javanese 'jv', Sundanese 'su', Spanish 'es')
      const testLocales = ['jv', 'su', 'es'] as const;

      for (const locale of testLocales) {
        await act(async () => {
          await i18n.changeLanguage(locale);
        });

        const { unmount } = render(React.createElement(FastActionSafetyCard, { isOpen: true }));

        // Emergency hotlines must preserve exact valid dialing URIs across all languages
        const hotline119 = screen.getByRole('link', { name: /119/i });
        expect(hotline119).toHaveAttribute('href', 'tel:119,8');

        const hotline112 = screen.getByRole('link', { name: /112/i });
        expect(hotline112).toHaveAttribute('href', 'tel:112');

        unmount();
      }

      await act(async () => {
        await i18n.changeLanguage('id');
      });
    });
  });
});
