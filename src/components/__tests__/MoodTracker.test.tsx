import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
    render(
      <MemoryRouter>
        <MoodTracker />
      </MemoryRouter>
    );

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

  it('switches to Yale Mood Meter 2D mode and logs nuanced mood with quadrant badge', () => {
    render(
      <MemoryRouter>
        <MoodTracker />
      </MemoryRouter>
    );

    // Switch to Yale Mood Meter 2D
    const meterTab = screen.getByRole('button', { name: /Yale Mood Meter 2D/i });
    fireEvent.click(meterTab);

    // 2D Canvas should be visible
    expect(screen.getByRole('slider')).toBeInTheDocument();

    // Save button should be visible since initial position produces a valid score
    const saveBtn = screen.getByRole('button', { name: /Simpan/i });
    fireEvent.click(saveBtn);

    // Check store
    const stored = useMoodStore.getState().moods;
    expect(stored.length).toBe(1);
    expect(stored[0].quadrant).toBeDefined();
    expect(stored[0].valence).toBeDefined();
    expect(stored[0].arousal).toBeDefined();
  });
});

