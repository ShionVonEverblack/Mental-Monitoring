import { describe, it, expect, beforeEach } from 'vitest';
import { useMoodStore } from '../moodStore';

describe('Zustand Mood Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMoodStore.setState({ moods: [] });
  });

  it('initializes with an empty list of moods', () => {
    const state = useMoodStore.getState();
    expect(state.moods).toEqual([]);
    expect(state.getMoodStats().totalEntries).toBe(0);
  });

  it('adds new mood entry with generated ID and timestamp', () => {
    const store = useMoodStore.getState();
    store.addMood({
      score: 4,
      emoji: '🙂',
      factors: ['olahraga', 'tidur'],
      note: 'Merasa cukup berenergi'
    });

    const updated = useMoodStore.getState();
    expect(updated.moods.length).toBe(1);
    expect(updated.moods[0].score).toBe(4);
    expect(updated.moods[0].emoji).toBe('🙂');
    expect(updated.moods[0].id).toBeDefined();
    expect(updated.moods[0].createdAt).toBeDefined();
  });

  it('deletes a mood entry by ID', () => {
    const store = useMoodStore.getState();
    store.addMood({ score: 5, emoji: '😊', factors: [] });
    store.addMood({ score: 2, emoji: '😟', factors: [] });

    const state = useMoodStore.getState();
    const idToDelete = state.moods[0].id;

    state.deleteMood(idToDelete);
    const afterDelete = useMoodStore.getState();
    expect(afterDelete.moods.length).toBe(1);
    expect(afterDelete.moods.find(m => m.id === idToDelete)).toBeUndefined();
  });

  it('retrieves today mood correctly', () => {
    const store = useMoodStore.getState();
    expect(store.getTodayMood()).toBeNull();

    store.addMood({ score: 4, emoji: '🙂', factors: [] });
    const todayMood = useMoodStore.getState().getTodayMood();
    expect(todayMood).not.toBeNull();
    expect(todayMood?.score).toBe(4);
  });

  it('computes mood statistics including average and streak', () => {
    const store = useMoodStore.getState();
    store.addMood({ score: 4, emoji: '🙂', factors: [] });
    store.addMood({ score: 2, emoji: '😟', factors: [] });

    const stats = useMoodStore.getState().getMoodStats();
    expect(stats.totalEntries).toBe(2);
    expect(stats.average).toBe(3);
    expect(stats.streak).toBeGreaterThanOrEqual(1);
    expect(typeof stats.isGrace).toBe('boolean');
  });
});
