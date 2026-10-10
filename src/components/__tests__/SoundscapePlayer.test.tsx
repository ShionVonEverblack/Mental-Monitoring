import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SoundscapePlayer } from '../somatics/SoundscapePlayer';
import { audioSomatics } from '../../services/audioSomaticsService';

describe('SoundscapePlayer Component', () => {
  beforeEach(() => {
    audioSomatics.stop();
  });

  it('renders player title, presets, and play button', () => {
    render(<SoundscapePlayer />);
    expect(screen.getByText(/Generator Audio Somatik Offline/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Play audio/i })).toBeDefined();
  });

  it('toggles play/stop state when clicked', async () => {
    const playSpy = vi.spyOn(audioSomatics, 'play');
    const stopSpy = vi.spyOn(audioSomatics, 'stop');

    render(<SoundscapePlayer />);
    const playBtn = screen.getByRole('button', { name: /Play audio/i });

    fireEvent.click(playBtn);
    expect(playSpy).toHaveBeenCalled();

    const stopBtn = await screen.findByRole('button', { name: /Stop audio/i });
    fireEvent.click(stopBtn);
    expect(stopSpy).toHaveBeenCalled();
  });

  it('allows changing preset and adjusts volume slider', () => {
    const setVolSpy = vi.spyOn(audioSomatics, 'setVolume');
    render(<SoundscapePlayer />);

    // Click Theta binaural preset button
    const thetaBtn = screen.getByText(/Theta/i);
    fireEvent.click(thetaBtn);

    // Adjust volume slider
    const slider = screen.getByLabelText(/Soundscape volume slider/i);
    fireEvent.change(slider, { target: { value: '0.8' } });
    expect(setVolSpy).toHaveBeenCalledWith(0.8);
  });
});
