import { describe, it, expect } from 'vitest';
import {
  analyzeWeeklyMoods,
  generateInsights,
  getFactorCorrelation
} from '../moodAnalysisService';
import type { MoodEntry } from '../../types';

describe('Mood Analysis Service', () => {
  const sampleMoods: MoodEntry[] = [
    {
      id: '1',
      score: 5,
      emoji: '😊',
      factors: ['olahraga', 'tidur'],
      createdAt: '2026-08-30T10:00:00.000Z'
    },
    {
      id: '2',
      score: 4,
      emoji: '🙂',
      factors: ['olahraga', 'sosial'],
      createdAt: '2026-08-29T10:00:00.000Z'
    },
    {
      id: '3',
      score: 2,
      emoji: '😟',
      factors: ['pekerjaan'],
      createdAt: '2026-08-28T10:00:00.000Z'
    },
    {
      id: '4',
      score: 1,
      emoji: '😢',
      factors: ['pekerjaan', 'tidur_kurang'],
      createdAt: '2026-08-27T10:00:00.000Z'
    }
  ];

  it('handles empty mood array gracefully', () => {
    const summary = analyzeWeeklyMoods([]);
    expect(summary.totalEntries).toBe(0);
    expect(summary.averageScore).toBe(0);
    expect(summary.bestDay).toBeNull();
    expect(summary.worstDay).toBeNull();

    const insights = generateInsights([]);
    expect(insights.length).toBe(0);

    const correlations = getFactorCorrelation([]);
    expect(correlations.length).toBe(0);
  });

  it('calculates weekly summary accurately', () => {
    const summary = analyzeWeeklyMoods(sampleMoods);
    expect(summary.totalEntries).toBe(4);
    // (5 + 4 + 2 + 1) / 4 = 3.0
    expect(summary.averageScore).toBe(3);
    expect(typeof summary.bestDay).toBe('number');
    expect(typeof summary.worstDay).toBe('number');
  });

  it('calculates factor correlation scores properly', () => {
    const correlations = getFactorCorrelation(sampleMoods);
    expect(correlations.length).toBeGreaterThan(0);

    const olahraga = correlations.find(c => c.factor === 'olahraga');
    expect(olahraga).toBeDefined();
    // (5 + 4) / 2 = 4.5
    expect(olahraga?.avgScore).toBe(4.5);
    expect(olahraga?.count).toBe(2);

    const pekerjaan = correlations.find(c => c.factor === 'pekerjaan');
    expect(pekerjaan).toBeDefined();
    // (2 + 1) / 2 = 1.5
    expect(pekerjaan?.avgScore).toBe(1.5);
  });

  it('generates meaningful insights from mood entries', () => {
    const insights = generateInsights(sampleMoods);
    expect(insights.length).toBeGreaterThan(0);
    insights.forEach(insight => {
      expect(insight.titleKey).toBeDefined();
      expect(insight.descriptionKey).toBeDefined();
      expect(['positive', 'neutral', 'negative']).toContain(insight.severity);
    });
  });
});
