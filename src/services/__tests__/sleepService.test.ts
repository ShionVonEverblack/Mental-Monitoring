import { describe, it, expect, beforeEach } from 'vitest';
import {
  timeStringToMinutes,
  calculateTimeInBedMinutes,
  calculateSleepMetrics,
  saveSleepEntry,
  getSleepHistory,
  deleteSleepEntry,
  calculateSleepStats,
  CBT_I_TIPS,
} from '../sleepService';
import type { SleepDiaryEntry } from '../../types';

describe('sleepService (CBT-I)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Time & Duration Calculations', () => {
    it('converts HH:mm to minutes from midnight', () => {
      expect(timeStringToMinutes('00:00')).toBe(0);
      expect(timeStringToMinutes('01:30')).toBe(90);
      expect(timeStringToMinutes('23:45')).toBe(1425);
    });

    it('calculates duration in bed with midnight rollover correctly', () => {
      // 23:00 to 07:00 = 8 hours = 480 minutes
      expect(calculateTimeInBedMinutes('23:00', '07:00')).toBe(480);
      // Same day (e.g. nap or early bedtime 01:00 to 09:00 = 8 hours = 480 minutes)
      expect(calculateTimeInBedMinutes('01:00', '09:00')).toBe(480);
    });

    it('calculates sleep efficiency accurately per CBT-I standards', () => {
      // 23:00 to 07:00 = 480 min in bed.
      // Latency: 30 min, Awakenings: 10 min.
      // Total sleep time = 480 - 40 = 440 min.
      // Efficiency = (440 / 480) * 100 = 91.66% -> 92%
      const metrics = calculateSleepMetrics('23:00', '07:00', 30, 10);
      expect(metrics.timeInBedMinutes).toBe(480);
      expect(metrics.totalSleepMinutes).toBe(440);
      expect(metrics.sleepEfficiency).toBe(92);
    });

    it('handles high sleep latency and low efficiency properly', () => {
      // 23:00 to 07:00 = 480 min.
      // Latency: 120 min, Awakenings: 60 min.
      // Total sleep time = 300 min.
      // Efficiency = (300 / 480) * 100 = 62.5% -> 63%
      const metrics = calculateSleepMetrics('23:00', '07:00', 120, 60);
      expect(metrics.sleepEfficiency).toBe(63);
    });
  });

  describe('Sleep Diary Local Storage & CRUD', () => {
    it('saves sleep diary entry and reads it back', () => {
      const entry: SleepDiaryEntry = {
        id: 'sleep-1',
        date: '2026-10-10',
        bedTime: '23:00',
        wakeTime: '06:30',
        latencyMinutes: 20,
        awakeningsCount: 1,
        awakeningsDurationMinutes: 10,
        quality: 4,
        totalSleepMinutes: 420,
        timeInBedMinutes: 450,
        sleepEfficiency: 93,
        createdAt: new Date().toISOString(),
      };

      saveSleepEntry(entry);
      const history = getSleepHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('sleep-1');
      expect(history[0].sleepEfficiency).toBe(93);
    });

    it('deletes sleep diary entry by ID', () => {
      const entry1: SleepDiaryEntry = {
        id: 'sleep-1',
        date: '2026-10-09',
        bedTime: '23:00',
        wakeTime: '07:00',
        latencyMinutes: 15,
        awakeningsCount: 0,
        awakeningsDurationMinutes: 0,
        quality: 5,
        totalSleepMinutes: 465,
        timeInBedMinutes: 480,
        sleepEfficiency: 97,
        createdAt: '2026-10-09T07:00:00Z',
      };
      const entry2: SleepDiaryEntry = {
        ...entry1,
        id: 'sleep-2',
        date: '2026-10-10',
      };

      saveSleepEntry(entry1);
      saveSleepEntry(entry2);
      expect(getSleepHistory()).toHaveLength(2);

      deleteSleepEntry('sleep-1');
      const updated = getSleepHistory();
      expect(updated).toHaveLength(1);
      expect(updated[0].id).toBe('sleep-2');
    });
  });

  describe('Aggregate Sleep Statistics', () => {
    it('returns zeroes when history is empty', () => {
      const stats = calculateSleepStats([]);
      expect(stats.totalEntries).toBe(0);
      expect(stats.avgEfficiency).toBe(0);
    });

    it('computes average efficiency and categorizes optimal efficiency (>= 85%)', () => {
      const history: SleepDiaryEntry[] = [
        {
          id: '1',
          date: '2026-10-09',
          bedTime: '23:00',
          wakeTime: '07:00',
          latencyMinutes: 20,
          awakeningsCount: 0,
          awakeningsDurationMinutes: 0,
          quality: 4,
          totalSleepMinutes: 460,
          timeInBedMinutes: 480,
          sleepEfficiency: 96,
          createdAt: '2026-10-09T07:00:00Z',
        },
        {
          id: '2',
          date: '2026-10-10',
          bedTime: '23:30',
          wakeTime: '07:00',
          latencyMinutes: 30,
          awakeningsCount: 1,
          awakeningsDurationMinutes: 10,
          quality: 3,
          totalSleepMinutes: 410,
          timeInBedMinutes: 450,
          sleepEfficiency: 91,
          createdAt: '2026-10-10T07:00:00Z',
        },
      ];

      const stats = calculateSleepStats(history);
      expect(stats.totalEntries).toBe(2);
      expect(stats.avgEfficiency).toBe(94);
      expect(stats.efficiencyStatus).toBe('optimal');
      expect(stats.avgQuality).toBe(3.5);
    });

    it('categorizes poor sleep efficiency (< 75%) as needs_improvement', () => {
      const history: SleepDiaryEntry[] = [
        {
          id: '1',
          date: '2026-10-09',
          bedTime: '23:00',
          wakeTime: '07:00',
          latencyMinutes: 90,
          awakeningsCount: 3,
          awakeningsDurationMinutes: 60,
          quality: 2,
          totalSleepMinutes: 330,
          timeInBedMinutes: 480,
          sleepEfficiency: 69,
          createdAt: '2026-10-09T07:00:00Z',
        },
      ];

      const stats = calculateSleepStats(history);
      expect(stats.efficiencyStatus).toBe('needs_improvement');
    });
  });

  describe('CBT-I Psychoeducation Tips', () => {
    it('provides structured CBT-I tips including 20-minute stimulus control', () => {
      expect(CBT_I_TIPS.length).toBeGreaterThanOrEqual(4);
      const ids = CBT_I_TIPS.map(t => t.id);
      expect(ids).toContain('stimulus_control');
      expect(ids).toContain('consistent_wake');
      expect(ids).toContain('digital_sunset');
      expect(ids).toContain('caffeine_cutoff');
    });
  });
});
