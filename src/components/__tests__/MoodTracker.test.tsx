import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import i18n from '../../i18n/config';
import { MoodTracker } from '../../pages/MoodTracker';
import { useMoodStore } from '../../stores/moodStore';

const EMPTY_RANGE_TEXT = /Belum ada data mood pada rentang waktu ini/i;

beforeEach(async () => {
  localStorage.clear();
  useMoodStore.setState({ moods: [] });
  await i18n.changeLanguage('id');
});

describe('MoodTracker chart reactivity', () => {
  it('updates the chart immediately when a mood is added and deleted', () => {
    render(<MoodTracker />);

    // Initially empty
    expect(screen.getByText(EMPTY_RANGE_TEXT)).toBeInTheDocument();

    // Add a mood → chart must leave empty state without changing time range
    act(() => {
      useMoodStore.getState().addMood({ score: 4, emoji: '🙂', factors: [], note: '' });
    });
    expect(screen.queryByText(EMPTY_RANGE_TEXT)).not.toBeInTheDocument();

    // Delete it → chart must return to empty state
    const [entry] = useMoodStore.getState().moods;
    act(() => {
      useMoodStore.getState().deleteMood(entry.id);
    });
    expect(screen.getByText(EMPTY_RANGE_TEXT)).toBeInTheDocument();
  });
});
