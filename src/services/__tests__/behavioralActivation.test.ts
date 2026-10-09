import { describe, it, expect, beforeEach } from 'vitest';
import {
  BA_CATALOG,
  BA_STORAGE_KEY,
  getBaActivities,
  saveBaActivity,
  completeBaActivity,
  deleteBaActivity,
  getBaStatistics,
  getTodayActivities,
  getTodayDateString,
} from '../behavioralActivationService';

describe('behavioralActivationService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('BA_CATALOG', () => {
    it('defines 16 catalog activities with all 4 domains balanced', () => {
      expect(BA_CATALOG).toHaveLength(16);
      const pleasure = BA_CATALOG.filter(c => c.domain === 'pleasure');
      const mastery = BA_CATALOG.filter(c => c.domain === 'mastery');
      const spiritual = BA_CATALOG.filter(c => c.domain === 'spiritual');
      const social = BA_CATALOG.filter(c => c.domain === 'social');

      expect(pleasure).toHaveLength(4);
      expect(mastery).toHaveLength(4);
      expect(spiritual).toHaveLength(4);
      expect(social).toHaveLength(4);
    });
  });

  describe('CRUD operations', () => {
    it('saves a new scheduled activity with default pending state', () => {
      const today = getTodayDateString();
      const activity = saveBaActivity({
        title: 'Jalan santai',
        domain: 'pleasure',
        scheduledDate: today,
        scheduledTime: '08:00',
        predictedMood: 6,
      });

      expect(activity.id).toMatch(/^ba-/);
      expect(activity.isCompleted).toBe(false);
      expect(activity.predictedMood).toBe(6);

      const all = getBaActivities();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(activity.id);

      const todayList = getTodayActivities();
      expect(todayList).toHaveLength(1);
    });

    it('completes an activity with actual mood and reflection', () => {
      const today = getTodayDateString();
      const saved = saveBaActivity({
        title: 'Merapikan tempat tidur',
        domain: 'mastery',
        scheduledDate: today,
        predictedMood: 4,
      });

      const completed = completeBaActivity(saved.id, 8, 'Merasa jauh lebih segar!');
      expect(completed).not.toBeNull();
      expect(completed?.isCompleted).toBe(true);
      expect(completed?.actualMood).toBe(8);
      expect(completed?.reflection).toBe('Merasa jauh lebih segar!');
      expect(completed?.completedAt).toBeDefined();

      const all = getBaActivities();
      expect(all[0].isCompleted).toBe(true);
      expect(all[0].actualMood).toBe(8);
    });

    it('deletes an activity by id', () => {
      const activity = saveBaActivity({
        title: 'Baca komik',
        domain: 'pleasure',
        scheduledDate: getTodayDateString(),
        predictedMood: 5,
      });

      expect(getBaActivities()).toHaveLength(1);
      const removed = deleteBaActivity(activity.id);
      expect(removed).toBe(true);
      expect(getBaActivities()).toHaveLength(0);
    });

    it('handles non-existent id gracefully on complete and delete', () => {
      expect(completeBaActivity('non-existent', 7)).toBeNull();
      expect(deleteBaActivity('non-existent')).toBe(false);
    });
  });

  describe('Statistics calculation', () => {
    it('calculates completion rate, domain distribution, and mood delta', () => {
      const today = getTodayDateString();

      // Empty stats
      const initialStats = getBaStatistics();
      expect(initialStats.totalScheduled).toBe(0);
      expect(initialStats.completionRate).toBe(0);
      expect(initialStats.averageMoodDelta).toBe(0);

      // Add 2 activities: 1 completed with delta (+3), 1 pending
      const a1 = saveBaActivity({
        title: 'Aktivitas 1',
        domain: 'pleasure',
        scheduledDate: today,
        predictedMood: 5,
      });

      saveBaActivity({
        title: 'Aktivitas 2',
        domain: 'social',
        scheduledDate: today,
        predictedMood: 6,
      });

      // Complete a1 with actualMood 8 (delta = +3)
      completeBaActivity(a1.id, 8);

      const stats = getBaStatistics();
      expect(stats.totalScheduled).toBe(2);
      expect(stats.totalCompleted).toBe(1);
      expect(stats.completionRate).toBe(50);
      expect(stats.averagePredictedMood).toBe(5);
      expect(stats.averageActualMood).toBe(8);
      expect(stats.averageMoodDelta).toBe(3);
      expect(stats.domainCounts.pleasure).toBe(1);
      expect(stats.domainCounts.social).toBe(1);
    });

    it('recovers gracefully from corrupted localStorage', () => {
      localStorage.setItem(BA_STORAGE_KEY, 'invalid-json');
      expect(getBaActivities()).toEqual([]);
      expect(getBaStatistics().totalScheduled).toBe(0);
    });
  });
});
