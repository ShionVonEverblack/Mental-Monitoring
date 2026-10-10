import { describe, it, expect, beforeEach } from 'vitest';
import { audioSomatics, SOUNDSCAPE_PRESETS } from '../audioSomaticsService';

describe('audioSomaticsService', () => {
  beforeEach(() => {
    audioSomatics.stop();
  });

  it('provides all 4 evidence-based soundscape presets', () => {
    expect(SOUNDSCAPE_PRESETS).toHaveLength(4);
    const ids = SOUNDSCAPE_PRESETS.map((p) => p.id);
    expect(ids).toContain('brown_noise');
    expect(ids).toContain('theta_binaural');
    expect(ids).toContain('alpha_binaural');
    expect(ids).toContain('pink_noise');
  });

  it('clamps and updates volume within [0, 1] range', () => {
    audioSomatics.setVolume(0.75);
    expect(audioSomatics.getVolume()).toBe(0.75);

    audioSomatics.setVolume(-0.5);
    expect(audioSomatics.getVolume()).toBe(0);

    audioSomatics.setVolume(1.5);
    expect(audioSomatics.getVolume()).toBe(1);
  });

  it('starts and stops playback, updating state flags', async () => {
    expect(audioSomatics.getIsPlaying()).toBe(false);

    await audioSomatics.play('brown_noise');
    expect(audioSomatics.getIsPlaying()).toBe(true);
    expect(audioSomatics.getCurrentPreset()).toBe('brown_noise');

    await audioSomatics.play('theta_binaural');
    expect(audioSomatics.getIsPlaying()).toBe(true);
    expect(audioSomatics.getCurrentPreset()).toBe('theta_binaural');

    audioSomatics.stop();
    expect(audioSomatics.getIsPlaying()).toBe(false);
  });

  it('handles rapid toggle without cutting off newly initiated audio playback', async () => {
    await audioSomatics.play('pink_noise');
    expect(audioSomatics.getIsPlaying()).toBe(true);

    audioSomatics.stop();
    expect(audioSomatics.getIsPlaying()).toBe(false);

    // Immediately play again before any stop timer fires
    await audioSomatics.play('pink_noise');
    expect(audioSomatics.getIsPlaying()).toBe(true);

    // Wait past the fade-out timer threshold (850ms)
    await new Promise((resolve) => setTimeout(resolve, 900));

    // Must still be playing because the stop timeout was cleared!
    expect(audioSomatics.getIsPlaying()).toBe(true);
  });

  it('cleans up and tears down audio nodes immediately when stopped multiple times in rapid succession', async () => {
    await audioSomatics.play('brown_noise');
    expect(audioSomatics.getIsPlaying()).toBe(true);

    // First stop schedules fade out timer
    audioSomatics.stop();
    expect(audioSomatics.getIsPlaying()).toBe(false);

    // Second stop while fade-out in progress must immediately finalize without error or dangling timer
    audioSomatics.stop();
    expect(audioSomatics.getIsPlaying()).toBe(false);

    // Third stop when completely stopped is safe no-op
    audioSomatics.stop();
    expect(audioSomatics.getIsPlaying()).toBe(false);
  });
});
