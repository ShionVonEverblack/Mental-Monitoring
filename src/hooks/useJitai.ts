import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMoodStore } from '../stores/moodStore';
import { getSleepHistory } from '../services/sleepService';
import { getBaActivities } from '../services/behavioralActivationService';
import {
  getJitaiState,
  dismissNudgeToday,
  recordNudgeImpression,
  JITAI_STORAGE_KEY,
} from '../services/jitaiPersistence';
import { evaluateJitai } from '../services/jitaiEngine';
import type {
  JitaiNudge,
  JitaiNudgeType,
  JitaiPersistedState,
  JitaiHookResult,
  JitaiContext,
} from '../types/jitai';
import type { SleepDiaryEntry, BaActivity } from '../types';

const SLEEP_STORAGE_KEY = 'rima-sleep-diary';
const BA_STORAGE_KEY = 'rima-ba-activities';

/**
 * React hook that integrates local mood trajectories, CBT-I sleep records,
 * and behavioral activation engagement into deterministic, privacy-first JITAI micro-nudges.
 */
export function useJitai(): JitaiHookResult {
  const moods = useMoodStore((s) => s.moods);
  const [sleepHistory, setSleepHistory] = useState<SleepDiaryEntry[]>(() => getSleepHistory());
  const [activities, setActivities] = useState<BaActivity[]>(() => getBaActivities());
  const [persistedState, setPersistedState] = useState<JitaiPersistedState>(() => getJitaiState());

  const refresh = useCallback(() => {
    setPersistedState(getJitaiState());
    setSleepHistory(getSleepHistory());
    setActivities(getBaActivities());
  }, []);

  // Listen to storage events for cross-component synchronisation
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | Event) => {
      let changedKey: string | null = null;

      if (e instanceof StorageEvent) {
        changedKey = e.key;
      } else if (e instanceof CustomEvent && e.detail?.key) {
        changedKey = e.detail.key;
      }

      if (!changedKey || changedKey === JITAI_STORAGE_KEY) {
        setPersistedState(getJitaiState());
      }
      if (!changedKey || changedKey === SLEEP_STORAGE_KEY) {
        setSleepHistory(getSleepHistory());
      }
      if (!changedKey || changedKey === BA_STORAGE_KEY) {
        setActivities(getBaActivities());
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('local-storage', handleStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('local-storage', handleStorageChange);
      };
    }
  }, []);

  // Evaluate candidate nudge reactively
  const nudge: JitaiNudge | null = useMemo(() => {
    const context: JitaiContext = {
      currentTime: new Date(),
      moods,
      sleepHistory,
      activities,
      persistedState,
    };
    return evaluateJitai(context);
  }, [moods, sleepHistory, activities, persistedState]);

  const dismissNudge = useCallback(() => {
    if (nudge) {
      dismissNudgeToday(nudge.type);
      setPersistedState(getJitaiState());
    }
  }, [nudge]);

  const acceptNudge = useCallback(() => {
    if (nudge) {
      recordNudgeImpression(nudge.type);
      dismissNudgeToday(nudge.type);
      setPersistedState(getJitaiState());
    }
  }, [nudge]);

  const recordImpression = useCallback((type: JitaiNudgeType) => {
    recordNudgeImpression(type);
    setPersistedState(getJitaiState());
  }, []);

  return {
    nudge,
    dismissNudge,
    acceptNudge,
    recordImpression,
    state: persistedState,
    refresh,
  };
}
