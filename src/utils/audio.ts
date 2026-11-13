class ZeloraAudioEngine {
  private ctx: AudioContext | null = null;
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

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainLevel = 0.08,
    delay = 0,
    endFreq?: number,
  ) {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playTap() {
    this.tone(420, 0.07, 'triangle', 0.05, 0, 320);
  }

  public playRevealNormal() {
    this.tone(523.25, 0.16, 'sine', 0.07, 0);
    this.tone(659.25, 0.22, 'sine', 0.06, 0.07);
  }

  public playRevealImposter() {
    this.tone(185, 0.26, 'sawtooth', 0.05, 0, 130);
    this.tone(138.59, 0.34, 'triangle', 0.07, 0.09);
  }

  public playDone() {
    this.tone(587.33, 0.1, 'triangle', 0.05, 0, 783.99);
  }

  public playVoteLock() {
    this.tone(440, 0.09, 'triangle', 0.06, 0);
    this.tone(554.37, 0.14, 'triangle', 0.06, 0.07);
  }

  public playTimerTick() {
    this.tone(880, 0.05, 'sine', 0.035, 0);
  }

  public playTimerEnd() {
    this.tone(659.25, 0.14, 'triangle', 0.07, 0);
    this.tone(659.25, 0.18, 'triangle', 0.07, 0.18);
  }

  public playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.tone(n, 0.36, 'triangle', 0.08, idx * 0.08);
    });
  }

  public playDefeat() {
    this.tone(246.94, 0.28, 'sawtooth', 0.05, 0, 196);
    this.tone(185.0, 0.42, 'triangle', 0.07, 0.16, 138.59);
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
