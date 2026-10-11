import { describe, it, expect } from 'vitest';
import { calculateMindfulMomentum } from '../streakService';
import type { MoodEntry } from '../../types';

describe('calculateMindfulMomentum (Welas Asih Momentum)', () => {
  it('returns compassionate rest encouragement for empty history without punitive guilt', () => {
    const result = calculateMindfulMomentum([]);

    expect(result.streak).toBe(0);
    expect(result.presenceCountWeekly).toBe(0);
    expect(result.isGrace).toBe(false);
    expect(result.isRestCelebrated).toBe(true);
    expect(result.compassionMessageKey).toBe('streak.gentleEncouragement');
    expect(result.compassionDefaultText).toContain('Setiap hembusan napas dan jeda berharga');
  });

  it('celebrates active mindful presence when user checks in consistently', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const moods: MoodEntry[] = [
      { id: '1', score: 4, emoji: '🙂', factors: [], note: '', createdAt: today.toISOString() },
      { id: '2', score: 4, emoji: '🙂', factors: [], note: '', createdAt: yesterday.toISOString() },
    ];

    const result = calculateMindfulMomentum(moods);

    expect(result.streak).toBe(2);
    expect(result.presenceCountWeekly).toBe(2);
    expect(result.isGrace).toBe(false);
    expect(result.compassionMessageKey).toBe('streak.compassionPresence');
    expect(result.compassionDefaultText).toContain('Hadir penuh welas asih');
  });

  it('embraces grace period as recovery when a day is skipped without breaking spirit', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const moods: MoodEntry[] = [
      { id: '1', score: 3, emoji: '😐', factors: [], note: '', createdAt: twoDaysAgo.toISOString() },
    ];

    const result = calculateMindfulMomentum(moods);

    expect(result.isGrace).toBe(true);
    expect(result.isRestCelebrated).toBe(true);
    expect(result.compassionMessageKey).toBe('streak.restIsRecovery');
    expect(result.compassionDefaultText).toContain('Istirahat juga bagian dari pemulihan');
  });

  it('counts weekly unique days of presence correctly even with multiple entries in one day', () => {
    const today = new Date();
    const earlierToday = new Date(today.getTime() - 3600000);

    const moods: MoodEntry[] = [
      { id: '1', score: 4, emoji: '🙂', factors: [], note: '', createdAt: today.toISOString() },
      { id: '2', score: 5, emoji: '😊', factors: [], note: '', createdAt: earlierToday.toISOString() },
    ];

    const result = calculateMindfulMomentum(moods);
    expect(result.presenceCountWeekly).toBe(1);
  });

  it('handles malformed or invalid dates without throwing or crashing', () => {
    const invalidMoods = [
      { id: '1', score: 4, emoji: '🙂', factors: [], note: '', createdAt: 'invalid-date' },
      null as unknown,
      { id: '2', score: 3, emoji: '😐', factors: [], note: '', createdAt: '' },
    ] as unknown as MoodEntry[];

    const result = calculateMindfulMomentum(invalidMoods);
    expect(result.streak).toBe(0);
    expect(result.presenceCountWeekly).toBe(0);
    expect(result.isRestCelebrated).toBe(true);
  });

  it('tolerates moderate future clock skew up to 24 hours seamlessly', () => {
    const futureTime = new Date(Date.now() + 3600000); // 1 hour ahead
    const moods: MoodEntry[] = [
      { id: '1', score: 5, emoji: '😊', factors: [], note: '', createdAt: futureTime.toISOString() },
    ];

    const result = calculateMindfulMomentum(moods);
    expect(result.presenceCountWeekly).toBe(1);
  });

  it('correctly sorts non-chronological entries when calculating momentum', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Passed in reverse chronological order
    const moods: MoodEntry[] = [
      { id: 'old', score: 3, emoji: '😐', factors: [], note: '', createdAt: yesterday.toISOString() },
      { id: 'new', score: 4, emoji: '🙂', factors: [], note: '', createdAt: today.toISOString() },
    ];

    const result = calculateMindfulMomentum(moods);
    expect(result.streak).toBe(2);
    expect(result.presenceCountWeekly).toBe(2);
  });
});
