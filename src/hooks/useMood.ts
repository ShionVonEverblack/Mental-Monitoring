import { useCallback } from 'react';
import type { MoodEntry } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { generateId, getMoodTrend, calculateStreak } from '../utils/helpers';

export function useMood() {
  const [moods, setMoods] = useLocalStorage<MoodEntry[]>('rima-moods', []);

  const addMood = useCallback((entry: Omit<MoodEntry, 'id' | 'createdAt'>) => {
    const newMood: MoodEntry = {
      ...entry,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setMoods(prev => [newMood, ...prev]);
  }, [setMoods]);

  const getMoods = useCallback(() => {
    return moods;
  }, [moods]);

  const getMoodsByDateRange = useCallback((start: Date, end: Date) => {
    return moods.filter(m => {
      const d = new Date(m.createdAt);
      return d >= start && d <= end;
    });
  }, [moods]);

  const getTodayMood = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayMoods = getMoodsByDateRange(today, tomorrow);
    return todayMoods.length > 0 ? todayMoods[0] : null;
  }, [getMoodsByDateRange]);

  const getWeeklyMoods = useCallback(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return getMoodsByDateRange(weekAgo, now);
  }, [getMoodsByDateRange]);

  const getMonthlyMoods = useCallback(() => {
    const now = new Date();
    const monthAgo = new Date(now);
    monthAgo.setMonth(now.getMonth() - 1);
    return getMoodsByDateRange(monthAgo, now);
  }, [getMoodsByDateRange]);

  const getMoodStats = useCallback(() => {
    const recent = moods.slice(0, 30); // Consider last 30 days for general stats
    const average = recent.length > 0 ? recent.reduce((sum, m) => sum + m.score, 0) / recent.length : 0;
    
    return {
      average: Math.round(average * 10) / 10,
      trend: getMoodTrend(moods),
      streak: calculateStreak(moods),
      totalEntries: moods.length
    };
  }, [moods]);

  const deleteMood = useCallback((id: string) => {
    setMoods(prev => prev.filter(m => m.id !== id));
  }, [setMoods]);

  return {
    moods,
    addMood,
    getMoods,
    getMoodsByDateRange,
    getTodayMood,
    getWeeklyMoods,
    getMonthlyMoods,
    getMoodStats,
    deleteMood
  };
}
