import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../../i18n/config';
import { MoodMeterCanvas } from '../ui/MoodMeterCanvas';
import {
  getQuadrantFromCoordinates,
  mapCoordinatesToMoodScore,
} from '../../data/emotionTaxonomy';

describe('MoodMeter Taxonomy & Coordinate Math', () => {
  it('correctly classifies valence-arousal into 4 quadrants', () => {
    // Red: valence < 0, arousal >= 0
    expect(getQuadrantFromCoordinates(-0.5, 0.5)).toBe('red');
    expect(getQuadrantFromCoordinates(-0.1, 0.0)).toBe('red');

    // Yellow: valence >= 0, arousal >= 0
    expect(getQuadrantFromCoordinates(0.6, 0.6)).toBe('yellow');
    expect(getQuadrantFromCoordinates(0.0, 0.2)).toBe('yellow');

    // Blue: valence < 0, arousal < 0
    expect(getQuadrantFromCoordinates(-0.7, -0.4)).toBe('blue');

    // Green: valence >= 0, arousal < 0
    expect(getQuadrantFromCoordinates(0.5, -0.5)).toBe('green');
  });

  it('maps valence coordinates to discrete 1-5 scores and emojis', () => {
    expect(mapCoordinatesToMoodScore(-0.8)).toEqual({ score: 1, emoji: '😢' });
    expect(mapCoordinatesToMoodScore(-0.4)).toEqual({ score: 2, emoji: '😟' });
    expect(mapCoordinatesToMoodScore(0.0)).toEqual({ score: 3, emoji: '😐' });
    expect(mapCoordinatesToMoodScore(0.5)).toEqual({ score: 4, emoji: '🙂' });
    expect(mapCoordinatesToMoodScore(0.9)).toEqual({ score: 5, emoji: '😊' });
  });
});

describe('MoodMeterCanvas Component', () => {
  const onChangeMock = vi.fn();

  beforeEach(async () => {
    onChangeMock.mockClear();
    await i18n.changeLanguage('id');
  });

  it('renders canvas with 4 quadrants, axis labels, and calls onChange on mount', () => {
    render(
      <MemoryRouter>
        <MoodMeterCanvas
          initialValence={-0.6}
          initialArousal={0.7}
          onChange={onChangeMock}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByText(/Tinggi Energi/i)).toBeInTheDocument();
    expect(screen.getByText(/Rendah Energi/i)).toBeInTheDocument();
    expect(screen.getByText(/Tidak Enak/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Menyenangkan/i).length).toBeGreaterThanOrEqual(1);

    // Quadrant watermarks
    expect(screen.getByText(/🔴 Merah/i)).toBeInTheDocument();
    expect(screen.getByText(/🟡 Kuning/i)).toBeInTheDocument();
    expect(screen.getByText(/🔵 Biru/i)).toBeInTheDocument();
    expect(screen.getByText(/🟢 Hijau/i)).toBeInTheDocument();

    expect(onChangeMock).toHaveBeenCalledWith(
      -0.6,
      0.7,
      'red',
      [],
      1,
      '😢'
    );
  });

  it('renders red quadrant nuances and regulation recommendation', () => {
    render(
      <MemoryRouter>
        <MoodMeterCanvas
          initialValence={-0.6}
          initialArousal={0.7}
          onChange={onChangeMock}
        />
      </MemoryRouter>
    );

    // Red quadrant emotions
    expect(screen.getByRole('button', { name: 'Cemas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Panik' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Frustrasi' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kewalahan' })).toBeInTheDocument();

    // Recommendation banner
    expect(screen.getByText(/Rekomendasi Regulasi Cepat/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Latihan Napas/i })).toBeInTheDocument();
  });

  it('allows toggling emotion nuances on and off', () => {
    render(
      <MemoryRouter>
        <MoodMeterCanvas
          initialValence={-0.6}
          initialArousal={0.7}
          onChange={onChangeMock}
        />
      </MemoryRouter>
    );

    const anxiousChip = screen.getByRole('button', { name: 'Cemas' });
    fireEvent.click(anxiousChip);

    expect(onChangeMock).toHaveBeenLastCalledWith(
      -0.6,
      0.7,
      'red',
      ['anxious'],
      1,
      '😢'
    );

    // Toggle off
    fireEvent.click(anxiousChip);
    expect(onChangeMock).toHaveBeenLastCalledWith(
      -0.6,
      0.7,
      'red',
      [],
      1,
      '😢'
    );
  });
});
