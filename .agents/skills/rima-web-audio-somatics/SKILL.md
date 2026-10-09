---
name: rima-web-audio-somatics
description: >-
  Architectural guide for synthesizing acoustic somatic bio-regulation, binaural beats,
  harmonic vagal tones, and colored noise via the Web Audio API without asset overhead in RIMA.
  Use when building audio breath-pacers, sleep soundscapes, or ADHD-friendly noise generators.
---

# RIMA Web Audio Somatics & Acoustic Bio-Regulation

## 1. Neuroacoustic Rationale

Auditory stimulation directly interfaces with the autonomic nervous system via the vestibulocochlear nerve (Cranial Nerve VIII) and the vagus nerve (Cranial Nerve X):
1. **Binaural Beats (Oster, 1973)**: When two slightly different frequencies ($f_1$ and $f_2$) are presented separately to each ear via stereo headphones, the superior olivary complex perceives a rhythmic beat equal to $|f_1 - f_2|$.
   - **Theta ($4\text{--}7\text{ Hz}$)**: Induces deep parasympathetic relaxation, meditative absorption, and reduced anxiety (*Garcia-Argibay et al., 2019*).
   - **Alpha ($8\text{--}12\text{ Hz}$)**: Enhances calm alertness and reduces sensory rumination.
   - **Delta ($0.5\text{--}3.5\text{ Hz}$)**: Encourages slow-wave sleep onset in CBT-I protocols.
2. **Harmonic Resonance**: 432 Hz and 528 Hz tuning creates gentle sinusoidal interference that lacks high-frequency harsh harmonics.
3. **Brownian/Pink Noise**: $1/f$ spectral density mimics natural rainfall, dampening sudden acoustic transients that trigger startle reflexes in PTSD, panic, and ADHD.

---

## 2. Audio Engineering Principles for Calm Tech

- **Zero Asset Downloads**: Synthesize audio programmatically using oscillators and white-noise buffers. This saves $10\text{--}50\text{ MB}$ of bandwidth on low-cost Indonesian mobile data plans.
- **Anti-Pop Gain Ramping**: Sudden start/stop of audio creates acoustic DC pops/clicks that shock the nervous system. Always apply linear or exponential ramps:
  ```typescript
  gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(targetVol, audioCtx.currentTime + fadeInSeconds);
  ```
- **Mobile WebKit Autoplay Policy**: `AudioContext` is locked in `suspended` state until the first explicit user touch/click. Always verify and resume:
  ```typescript
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  ```

---

## 3. Binaural Beat Synthesizer Implementation

```typescript
export class BinauralBeatSynthesizer {
  private ctx: AudioContext | null = null;
  private oscLeft: OscillatorNode | null = null;
  private oscRight: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  /**
   * Starts a binaural beat session.
   * @param carrierHz Base carrier frequency (e.g. 216 Hz)
   * @param beatHz Desired brainwave entrainment (e.g. 6 Hz for Theta)
   * @param volume Master gain (0.0 to 1.0)
   */
  async start(carrierHz = 216, beatHz = 6, volume = 0.15): Promise<void> {
    this.stop();

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    // Master volume with smooth 2-second fade-in
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(volume, this.ctx.currentTime + 2.0);
    this.gainNode.connect(this.ctx.destination);

    // Stereo Channel Splitter / Merger
    const merger = this.ctx.createChannelMerger(2);
    merger.connect(this.gainNode);

    // Left Channel: Carrier Frequency
    this.oscLeft = this.ctx.createOscillator();
    this.oscLeft.type = 'sine';
    this.oscLeft.frequency.setValueAtTime(carrierHz, this.ctx.currentTime);
    this.oscLeft.connect(merger, 0, 0); // Out to Left (Channel 0)

    // Right Channel: Carrier + Beat Delta
    this.oscRight = this.ctx.createOscillator();
    this.oscRight.type = 'sine';
    this.oscRight.frequency.setValueAtTime(carrierHz + beatHz, this.ctx.currentTime);
    this.oscRight.connect(merger, 0, 1); // Out to Right (Channel 1)

    this.oscLeft.start();
    this.oscRight.start();
  }

  stop(fadeOutSeconds = 1.0): void {
    if (!this.ctx || !this.gainNode) return;

    const stopTime = this.ctx.currentTime + fadeOutSeconds;
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime);

    setTimeout(() => {
      this.oscLeft?.stop();
      this.oscRight?.stop();
      this.oscLeft?.disconnect();
      this.oscRight?.disconnect();
      this.ctx?.close();
      this.ctx = null;
    }, fadeOutSeconds * 1000);
  }
}
```

---

## 4. Colored Brownian Noise Generator (Rain / Deep Rest)

```typescript
/**
 * Creates a 5-second seamless loop buffer of Brownian (Brown) Noise.
 * Power drops by 6dB per octave (1/f^2) creating a rich soothing rumble.
 */
export function createBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 5; // 5 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    // Integration filter creates 1/f^2 slope
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5; // Gain compensation
  }

  return buffer;
}
```

---

## 5. Mobile Resource Conservation Checklist

- Always call `ctx.close()` when component unmounts; mobile per-process AudioContext count is capped (typically 6 instances on iOS).
- When device enters background or user turns off screen, do not keep oscillators running unless explicit background audio mode is active.
- Stereo headphone detection: Binaural beats require headphones to produce the central neural beat. When headphones are absent, fall back to monaural isochronic pulse amplitude modulation.
