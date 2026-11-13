class ZeloraAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private soundEnabled = true;
  private musicEnabled = false;
  private musicInterval: number | null = null;
  private musicGain: GainNode | null = null;
  private chordIndex = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = null;
    }
    if (!this.masterGain) {
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      compressor.knee.setValueAtTime(18, this.ctx.currentTime);
      compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
      compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
      compressor.release.setValueAtTime(0.18, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      gain.connect(compressor);
      compressor.connect(this.ctx.destination);
      this.masterGain = gain;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public configure(soundEnabled: boolean, musicEnabled: boolean) {
    this.soundEnabled = soundEnabled;
    if (musicEnabled !== this.musicEnabled) {
      this.musicEnabled = musicEnabled;
      if (musicEnabled) {
        this.startMusic();
      } else {
        this.stopMusic();
      }
    }
  }

  public unlock() {
    this.ensureContext();
    if (this.musicEnabled && this.musicInterval === null) {
      this.startMusic();
    }
  }

  private vibrate(pattern: number | number[]) {
    try {
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.vibrate === 'function'
      ) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore vibration errors on unsupported browsers
    }
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainLevel = 0.14,
    delay = 0,
    endFreq?: number,
    filterHz?: number,
  ) {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const scheduleTone = () => {
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(20, endFreq),
          now + duration,
        );
      }

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      if (filterHz !== undefined) {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterHz, now);
        osc.connect(filter);
        filter.connect(gain);
      } else {
        osc.connect(gain);
      }

      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + duration + 0.03);
    };

    if (ctx.state === 'suspended') {
      ctx
        .resume()
        .then(scheduleTone)
        .catch(() => {});
    } else {
      scheduleTone();
    }
  }

  public playTap() {
    this.tone(420, 0.07, 'triangle', 0.09, 0, 320);
  }

  public playRevealNormal() {
    this.tone(523.25, 0.16, 'sine', 0.12, 0);
    this.tone(659.25, 0.24, 'sine', 0.11, 0.07);
  }

  public playRevealImposter() {
    this.tone(185, 0.26, 'sawtooth', 0.09, 0, 130, 900);
    this.tone(138.59, 0.36, 'triangle', 0.13, 0.09);
  }

  public playDone() {
    this.tone(587.33, 0.1, 'triangle', 0.09, 0, 783.99);
  }

  public playVoteLock() {
    this.tone(440, 0.09, 'triangle', 0.11, 0);
    this.tone(554.37, 0.16, 'triangle', 0.11, 0.07);
  }

  public playTimerTick() {
    this.tone(880, 0.05, 'sine', 0.06, 0);
  }

  public playTimerEnd() {
    this.tone(659.25, 0.14, 'triangle', 0.12, 0);
    this.tone(659.25, 0.22, 'triangle', 0.12, 0.18);
  }

  /**
   * Celebratory multi-layered victory fanfare when innocent players catch the imposter.
   */
  public playVictory() {
    if (!this.soundEnabled) return;
    this.vibrate([40, 45, 95]);

    // Warm root + fifth foundation
    this.tone(261.63, 0.55, 'triangle', 0.14, 0.0); // C4
    this.tone(392.0, 0.65, 'triangle', 0.12, 0.24); // G4

    // Bright ascending fanfare arpeggio: C5 -> E5 -> G5 -> C6
    this.tone(523.25, 0.2, 'triangle', 0.18, 0.0);
    this.tone(659.25, 0.2, 'triangle', 0.18, 0.09);
    this.tone(783.99, 0.22, 'triangle', 0.19, 0.18);
    this.tone(1046.5, 0.68, 'triangle', 0.22, 0.27);

    // Shimmering bell harmonics on final hit
    this.tone(1046.5, 0.62, 'sine', 0.14, 0.27);
    this.tone(1318.51, 0.58, 'sine', 0.1, 0.34); // E6
    this.tone(1567.98, 0.52, 'sine', 0.08, 0.4); // G6
  }

  /**
   * Dramatic descending defeat sting when the group votes wrong and the imposter escapes.
   */
  public playDefeat() {
    if (!this.soundEnabled) return;
    this.vibrate([120, 60, 180]);

    // Classic descending chromatic "wah-wah-wah-waaah" defeat motif
    this.tone(311.13, 0.22, 'sawtooth', 0.11, 0.0, 293.66, 1200); // Eb4 -> D4
    this.tone(293.66, 0.22, 'sawtooth', 0.11, 0.22, 277.18, 1100); // D4 -> C#4
    this.tone(277.18, 0.22, 'sawtooth', 0.11, 0.44, 261.63, 1000); // C#4 -> C4
    this.tone(261.63, 0.72, 'sawtooth', 0.13, 0.66, 174.61, 850); // C4 bend down to F3

    // Deep sub-bass drop reinforcement
    this.tone(130.81, 0.35, 'triangle', 0.15, 0.0, 110.0);
    this.tone(98.0, 0.75, 'triangle', 0.18, 0.66, 65.41);
  }

  public startMusic() {
    if (typeof window === 'undefined') return;
    if (this.musicInterval !== null) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const chords = [
      [146.83, 220.0, 261.63], // Dm7 feel
      [130.81, 196.0, 246.94], // Cmaj7 feel
      [116.54, 174.61, 220.0], // Bbmaj7 feel
      [130.81, 196.0, 220.0], // Am/C feel
    ];

    const playPad = () => {
      if (!this.musicEnabled || !this.ctx) return;
      if (this.ctx.state === 'suspended') return;
      const now = this.ctx.currentTime;
      const chord = chords[this.chordIndex % chords.length];
      this.chordIndex++;

      if (!this.musicGain) {
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.03;
        this.musicGain.connect(this.ctx.destination);
      }

      chord.forEach((freq) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const env = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        env.gain.setValueAtTime(0.0001, now);
        env.gain.linearRampToValueAtTime(0.35, now + 1.2);
        env.gain.linearRampToValueAtTime(0.0001, now + 4.2);
        osc.connect(env);
        env.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + 4.3);
      });
    };

    playPad();
    this.musicInterval = window.setInterval(playPad, 4000);
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audioEngine = new ZeloraAudioEngine();
