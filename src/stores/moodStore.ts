import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MoodEntry } from '../types';
import { generateId, getMoodTrend, calculateGraceStreak } from '../utils/helpers';

export interface MoodStats {
  average: number;
  trend: 'improving' | 'declining' | 'stable';
  streak: number;
  totalEntries: number;
  isGrace: boolean;
}

export interface MoodState {
  moods: MoodEntry[];
  addMood: (entry: Omit<MoodEntry, 'id' | 'createdAt'>) => void;
  deleteMood: (id: string) => void;
  getMoods: () => MoodEntry[];
  getMoodsByDateRange: (start: Date, end: Date) => MoodEntry[];
  getTodayMood: () => MoodEntry | null;
  getWeeklyMoods: () => MoodEntry[];
  getMonthlyMoods: () => MoodEntry[];
  getMoodStats: () => MoodStats;
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      moods: [],

      addMood: (entry) => {
        const newMood: MoodEntry = {
          ...entry,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ moods: [newMood, ...state.moods] }));
      },

      deleteMood: (id) => {
        set((state) => ({ moods: state.moods.filter((m) => m.id !== id) }));
      },

      getMoods: () => get().moods,

      getMoodsByDateRange: (start, end) => {
        return get().moods.filter((m) => {
          const d = new Date(m.createdAt);
          return d >= start && d <= end;
        });
      },

      getTodayMood: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayMoods = get().getMoodsByDateRange(today, tomorrow);
        return todayMoods.length > 0 ? todayMoods[0] : null;
      },

      getWeeklyMoods: () => {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return get().getMoodsByDateRange(weekAgo, now);
      },

      getMonthlyMoods: () => {
        const now = new Date();
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return get().getMoodsByDateRange(monthAgo, now);
      },

      getMoodStats: () => {
        const moods = get().moods;
        const recent = moods.slice(0, 30);
        const average = recent.length > 0 ? recent.reduce((sum, m) => sum + m.score, 0) / recent.length : 0;
        const streakData = calculateGraceStreak(moods);

        return {
          average: Math.round(average * 10) / 10,
          trend: getMoodTrend(moods),
          streak: streakData.streak,
          isGrace: streakData.isGrace,
          totalEntries: moods.length,
        };
      },
    }),
    {
      name: 'rima-moods',
    }
  )
);
