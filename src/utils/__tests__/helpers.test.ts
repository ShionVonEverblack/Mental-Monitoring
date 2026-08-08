import { describe, it, expect } from 'vitest';
import {
  getGreeting,
  generateAnonymousName,
  formatDate,
  getMoodColor,
  getMoodTrend,
  calculateStreak,
  clamp,
  generateId
} from '../helpers';
import type { MoodEntry } from '../../types';

describe('Helper Utilities', () => {
  it('getGreeting returns localized time-appropriate greetings', () => {
    const greetingId = getGreeting('id');
    const greetingEn = getGreeting('en');
    expect(typeof greetingId).toBe('string');
    expect(typeof greetingEn).toBe('string');
    expect(greetingId.length).toBeGreaterThan(0);
    expect(greetingEn.length).toBeGreaterThan(0);
  });

  it('generateAnonymousName generates 2-word name', () => {
    const name = generateAnonymousName();
    expect(name.split(' ').length).toBe(2);
  });

  it('formatDate formats date correctly for ID and EN', () => {
    const dateStr = '2026-08-08T12:00:00.000Z';
    const formattedId = formatDate(dateStr, 'id');
    const formattedEn = formatDate(dateStr, 'en');
    expect(formattedId).toContain('2026');
    expect(formattedEn).toContain('2026');
  });

  it('getMoodColor returns appropriate CSS color variables', () => {
    expect(getMoodColor(1)).toBe('var(--color-danger)');
    expect(getMoodColor(3)).toBe('var(--color-secondary)');
    expect(getMoodColor(5)).toBe('var(--color-accent)');
  });

  it('getMoodTrend calculates trend correctly', () => {
    expect(getMoodTrend([])).toBe('stable');

    const improvingMoods: MoodEntry[] = [
      { id: '1', score: 5, emoji: '😊', factors: [], createdAt: new Date().toISOString() },
      { id: '2', score: 4, emoji: '🙂', factors: [], createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: '3', score: 2, emoji: '😟', factors: [], createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: '4', score: 1, emoji: '😢', factors: [], createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    ];
    expect(getMoodTrend(improvingMoods)).toBe('improving');
  });

  it('calculateStreak calculates consecutive streak days', () => {
    expect(calculateStreak([])).toBe(0);

    const todayStr = new Date().toISOString();
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString();

    const moods: MoodEntry[] = [
      { id: '1', score: 4, emoji: '🙂', factors: [], createdAt: todayStr },
      { id: '2', score: 3, emoji: '😐', factors: [], createdAt: yesterdayStr }
    ];
    expect(calculateStreak(moods)).toBe(2);
  });

  it('clamp restricts value within range', () => {
    expect(clamp(10, 1, 5)).toBe(5);
    expect(clamp(-2, 1, 5)).toBe(1);
    expect(clamp(3, 1, 5)).toBe(3);
  });

  it('generateId returns unique non-empty string', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(5);
  });
});
