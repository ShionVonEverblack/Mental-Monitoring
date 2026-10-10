import { describe, it, expect, beforeEach } from 'vitest';
import { calculateEscalation } from '../escalationService';
import type { MoodEntry } from '../../types';

describe('escalationService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns level 0 when moods array is empty and no journal', () => {
    const res = calculateEscalation([]);
    expect(res.level).toBe(0);
    expect(res.suggestedActions).toHaveLength(0);
  });

  it('returns level 3 when journal contains crisis keywords and logs escalation', () => {
    const res = calculateEscalation([], 'saya ingin bunuh diri mengakhiri hidup');
    expect(res.level).toBe(3);
    const logs = JSON.parse(localStorage.getItem('rima-escalation-log') || '[]');
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe(3);
  });

  it('safely logs escalation events when rima-escalation-log contains malformed non-array JSON', () => {
    localStorage.setItem('rima-escalation-log', JSON.stringify({ corrupted: true }));
    const res = calculateEscalation([], 'saya ingin bunuh diri mengakhiri hidup');
    expect(res.level).toBe(3);
    const raw = localStorage.getItem('rima-escalation-log');
    const logs = JSON.parse(raw || '[]');
    expect(Array.isArray(logs)).toBe(true);
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe(3);
  });

  it('triggers level 2 when average mood is below 2', () => {
    const lowMoods: MoodEntry[] = [
      { id: '1', score: 1, emoji: '😢', factors: [], note: '', createdAt: new Date().toISOString() },
      { id: '2', score: 1, emoji: '😢', factors: [], note: '', createdAt: new Date().toISOString() }
    ];
    const res = calculateEscalation(lowMoods);
    expect(res.level).toBe(2);
    const logs = JSON.parse(localStorage.getItem('rima-escalation-log') || '[]');
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe(2);
  });

  it('triggers level 1 when 3 consecutive low moods occur', () => {
    const moods: MoodEntry[] = [
      { id: '1', score: 2, emoji: '😟', factors: [], note: '', createdAt: '2026-10-10T12:00:00Z' },
      { id: '2', score: 2, emoji: '😟', factors: [], note: '', createdAt: '2026-10-09T12:00:00Z' },
      { id: '3', score: 2, emoji: '😟', factors: [], note: '', createdAt: '2026-10-08T12:00:00Z' },
      { id: '4', score: 4, emoji: '🙂', factors: [], note: '', createdAt: '2026-10-07T12:00:00Z' }
    ];
    const res = calculateEscalation(moods);
    expect(res.level).toBe(1);
  });
});
