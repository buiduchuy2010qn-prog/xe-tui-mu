class SoundEngine {
  constructor() {
    this.enabled = true;
    this.ctx = null;
    this.noiseBuffer = null;
    this.lastStretchAt = 0;
    this.activeStretchGain = null;
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
    if (!this.enabled) this.stopStretch();
  }

  getAudioContext() {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      this.ctx = new AudioContextClass();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  getNoiseBuffer(ctx, seconds = 2) {
    const requiredLength = Math.ceil(ctx.sampleRate * seconds);
    if (this.noiseBuffer && this.noiseBuffer.length >= requiredLength) return this.noiseBuffer;

    const buffer = ctx.createBuffer(1, requiredLength, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let previous = 0;

    for (let index = 0; index < requiredLength; index += 1) {
      const white = Math.random() * 2 - 1;
      previous = previous * 0.58 + white * 0.42;
      data[index] = previous;
    }

    this.noiseBuffer = buffer;
    return buffer;
  }

  createNoiseSource(ctx, duration, offset = 0) {
    const source = ctx.createBufferSource();
    source.buffer = this.getNoiseBuffer(ctx, Math.max(2, duration + offset + 0.1));
    source.loop = false;
    return source;
  }

  connectWithPan(ctx, node, pan = 0) {
    if (typeof ctx.createStereoPanner !== 'function') {
      node.connect(ctx.destination);
      return;
    }

    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    node.connect(panner);
    panner.connect(ctx.destination);
  }

  playNoiseBurst({ duration = 0.08, gainValue = 0.12, frequency = 1800, q = 1.4, pan = 0, type = 'bandpass' } = {}) {
    if (!this.enabled) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const source = this.createNoiseSource(ctx, duration);
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      filter.type = type;
      filter.frequency.setValueAtTime(frequency, now);
      filter.Q.setValueAtTime(q, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gainValue, now + Math.min(0.012, duration * 0.22));
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      source.connect(filter);
      filter.connect(gain);
      this.connectWithPan(ctx, gain, pan);
      source.start(now, Math.random() * 0.35, duration + 0.02);
      source.stop(now + duration + 0.04);
    } catch (error) {
      console.warn('Audio noise burst error', error);
    }
  }

  playGrab() {
    if (!this.enabled) return;
    this.playNoiseBurst({ duration: 0.055, gainValue: 0.095, frequency: 1250, q: 0.7, pan: -0.12 });
    window.setTimeout(() => {
      this.playNoiseBurst({ duration: 0.045, gainValue: 0.07, frequency: 2400, q: 1.2, pan: 0.12 });
    }, 34);
  }

  playStretch(progress = 0) {
    if (!this.enabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastStretchAt < 72) return;
    this.lastStretchAt = nowMs;

    const normalized = Math.max(0, Math.min(1, progress));
    this.playNoiseBurst({
      duration: 0.05 + normalized * 0.035,
      gainValue: 0.035 + normalized * 0.085,
      frequency: 900 + normalized * 2600,
      q: 0.65 + normalized * 1.8,
      pan: -0.3 + normalized * 0.6
    });

    if (normalized > 0.48 && Math.random() > 0.55) {
      this.playNoiseBurst({
        duration: 0.024,
        gainValue: 0.035 + normalized * 0.035,
        frequency: 3600 + Math.random() * 1800,
        q: 2.8,
        pan: Math.random() * 0.7 - 0.35,
        type: 'highpass'
      });
    }
  }

  stopStretch() {
    if (!this.activeStretchGain || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.activeStretchGain.gain.cancelScheduledValues(now);
      this.activeStretchGain.gain.setTargetAtTime(0.0001, now, 0.018);
    } catch (_) {
      // Ignore already-disconnected nodes.
    }
    this.activeStretchGain = null;
  }

  playRip() {
    if (!this.enabled) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const duration = 0.68;

      const body = this.createNoiseSource(ctx, duration + 0.08);
      const bodyFilter = ctx.createBiquadFilter();
      const bodyGain = ctx.createGain();
      bodyFilter.type = 'bandpass';
      bodyFilter.frequency.setValueAtTime(1050, now);
      bodyFilter.frequency.exponentialRampToValueAtTime(3950, now + duration * 0.72);
      bodyFilter.frequency.exponentialRampToValueAtTime(1700, now + duration);
      bodyFilter.Q.setValueAtTime(0.72, now);
      bodyGain.gain.setValueAtTime(0.0001, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.22, now + 0.025);
      bodyGain.gain.setValueAtTime(0.18, now + 0.18);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      body.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      this.connectWithPan(ctx, bodyGain, -0.05);
      body.start(now, Math.random() * 0.4, duration + 0.03);
      body.stop(now + duration + 0.05);

      const crisp = this.createNoiseSource(ctx, duration * 0.62);
      const crispFilter = ctx.createBiquadFilter();
      const crispGain = ctx.createGain();
      crispFilter.type = 'highpass';
      crispFilter.frequency.setValueAtTime(2850, now);
      crispFilter.frequency.exponentialRampToValueAtTime(7600, now + duration * 0.48);
      crispGain.gain.setValueAtTime(0.0001, now);
      crispGain.gain.exponentialRampToValueAtTime(0.115, now + 0.012);
      crispGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.62);
      crisp.connect(crispFilter);
      crispFilter.connect(crispGain);
      this.connectWithPan(ctx, crispGain, 0.16);
      crisp.start(now + 0.01, Math.random() * 0.5, duration * 0.62);
      crisp.stop(now + duration * 0.68);

      const crackCount = 13;
      for (let index = 0; index < crackCount; index += 1) {
        const at = 0.04 + (index / crackCount) * 0.48 + Math.random() * 0.045;
        window.setTimeout(() => {
          this.playNoiseBurst({
            duration: 0.018 + Math.random() * 0.028,
            gainValue: 0.045 + Math.random() * 0.07,
            frequency: 2600 + Math.random() * 4200,
            q: 1.5 + Math.random() * 2.6,
            pan: -0.62 + (index / crackCount) * 1.24,
            type: Math.random() > 0.45 ? 'highpass' : 'bandpass'
          });
        }, at * 1000);
      }

      const thump = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(105, now + 0.42);
      thump.frequency.exponentialRampToValueAtTime(48, now + 0.58);
      thumpGain.gain.setValueAtTime(0.0001, now + 0.4);
      thumpGain.gain.exponentialRampToValueAtTime(0.13, now + 0.43);
      thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
      thump.connect(thumpGain);
      thumpGain.connect(ctx.destination);
      thump.start(now + 0.4);
      thump.stop(now + 0.64);
    } catch (error) {
      console.warn('Audio playRip error', error);
    }
  }

  playWhoosh() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const source = this.createNoiseSource(ctx, 0.7);
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(420, now);
      filter.frequency.exponentialRampToValueAtTime(4600, now + 0.34);
      filter.frequency.exponentialRampToValueAtTime(1100, now + 0.68);
      filter.Q.value = 0.8;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.13, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start(now, Math.random() * 0.4, 0.72);
      source.stop(now + 0.74);
    } catch (error) {
      console.warn('Audio playWhoosh error', error);
    }
  }

  playToneSequence(notes, { type = 'sine', volume = 0.22, spacing = 0.08, length = 0.28 } = {}) {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      notes.forEach((frequency, index) => {
        const start = ctx.currentTime + index * spacing;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(start);
        oscillator.stop(start + length + 0.03);
      });
    } catch (error) {
      console.warn('Audio tone sequence error', error);
    }
  }

  playPop() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(260, now);
      oscillator.frequency.exponentialRampToValueAtTime(920, now + 0.14);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } catch (error) {
      console.warn('Audio playPop error', error);
    }
  }

  playRare() {
    this.playToneSequence([440, 554.37, 659.25, 880], {
      type: 'triangle',
      volume: 0.2,
      spacing: 0.075,
      length: 0.32
    });
  }

  playLegendary() {
    this.playToneSequence([523.25, 659.25, 783.99, 1046.5, 1318.51], {
      type: 'sine',
      volume: 0.24,
      spacing: 0.09,
      length: 0.42
    });
    window.setTimeout(() => this.playWhoosh(), 80);
  }

  playCoin() {
    this.playToneSequence([987.77, 1318.51], {
      type: 'sine',
      volume: 0.18,
      spacing: 0.07,
      length: 0.24
    });
  }
}

export const soundManager = new SoundEngine();
