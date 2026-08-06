class SoundEngine {
  constructor() {
    this.enabled = true;
    this.ctx = null;
    this.noiseBuffer = null;
    this.stretch = null;
    this.lastCrackle = 0;
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
    if (!this.enabled) this.stopStretch();
  }

  getContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  getNoise(ctx) {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) return this.noiseBuffer;
    const seconds = 3;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let brown = 0;
    for (let index = 0; index < data.length; index += 1) {
      const white = Math.random() * 2 - 1;
      brown = brown * 0.72 + white * 0.28;
      data[index] = brown * 0.9 + white * 0.1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  connectOutput(ctx, node, pan = 0) {
    if (typeof ctx.createStereoPanner !== 'function') {
      node.connect(ctx.destination);
      return;
    }
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    node.connect(panner);
    panner.connect(ctx.destination);
  }

  noiseBurst({ at = 0, duration = 0.06, gain = 0.08, frequency = 2200, q = 1, type = 'bandpass', pan = 0 } = {}) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const start = ctx.currentTime + at;
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const volume = ctx.createGain();
    source.buffer = this.getNoise(ctx);
    filter.type = type;
    filter.frequency.setValueAtTime(frequency, start);
    filter.Q.setValueAtTime(q, start);
    volume.gain.setValueAtTime(0.0001, start);
    volume.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), start + Math.min(0.012, duration * 0.25));
    volume.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(volume);
    this.connectOutput(ctx, volume, pan);
    source.start(start, Math.random() * 1.4, duration + 0.03);
    source.stop(start + duration + 0.04);
  }

  playGrab() {
    if (!this.enabled) return;
    this.noiseBurst({ duration: 0.045, gain: 0.09, frequency: 980, q: 0.7, pan: -0.15 });
    this.noiseBurst({ at: 0.032, duration: 0.038, gain: 0.065, frequency: 3200, q: 1.7, pan: 0.1, type: 'highpass' });
  }

  playStretch(progress = 0) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const value = Math.max(0, Math.min(1, progress));
    const now = ctx.currentTime;

    if (!this.stretch) {
      const source = ctx.createBufferSource();
      const highpass = ctx.createBiquadFilter();
      const bandpass = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      source.buffer = this.getNoise(ctx);
      source.loop = true;
      highpass.type = 'highpass';
      highpass.frequency.value = 350;
      bandpass.type = 'bandpass';
      bandpass.Q.value = 1.1;
      gain.gain.value = 0.0001;
      source.connect(highpass);
      highpass.connect(bandpass);
      bandpass.connect(gain);
      this.connectOutput(ctx, gain, 0);
      source.start();
      this.stretch = { source, highpass, bandpass, gain };
    }

    const { bandpass, highpass, gain } = this.stretch;
    bandpass.frequency.setTargetAtTime(650 + value * 3600, now, 0.025);
    bandpass.Q.setTargetAtTime(0.7 + value * 2.2, now, 0.035);
    highpass.frequency.setTargetAtTime(250 + value * 1100, now, 0.03);
    gain.gain.setTargetAtTime(0.012 + value * 0.055, now, 0.018);

    const nowMs = performance.now();
    if (nowMs - this.lastCrackle > 95 - value * 42) {
      this.lastCrackle = nowMs;
      this.noiseBurst({
        duration: 0.018 + Math.random() * 0.025,
        gain: 0.02 + value * 0.07,
        frequency: 2200 + value * 4700 + Math.random() * 800,
        q: 1.8 + value * 2.6,
        pan: -0.45 + value * 0.9,
        type: value > 0.48 ? 'highpass' : 'bandpass'
      });
    }
  }

  stopStretch() {
    if (!this.stretch || !this.ctx) return;
    const current = this.stretch;
    this.stretch = null;
    const now = this.ctx.currentTime;
    try {
      current.gain.gain.cancelScheduledValues(now);
      current.gain.gain.setTargetAtTime(0.0001, now, 0.022);
      current.source.stop(now + 0.16);
    } catch (_) {
      // Nodes may already be stopped after tab suspension.
    }
  }

  playRip(material = 'plastic') {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const presets = {
      'thin-plastic': { low: 1500, high: 7200, gain: 0.22, duration: 0.72, cracks: 17 },
      plastic: { low: 1050, high: 5900, gain: 0.24, duration: 0.76, cracks: 15 },
      foil: { low: 2100, high: 8800, gain: 0.2, duration: 0.68, cracks: 22 },
      paper: { low: 720, high: 4100, gain: 0.25, duration: 0.82, cracks: 13 }
    };
    const preset = presets[material] || presets.plastic;
    const now = ctx.currentTime;

    const body = ctx.createBufferSource();
    const bodyFilter = ctx.createBiquadFilter();
    const bodyGain = ctx.createGain();
    body.buffer = this.getNoise(ctx);
    bodyFilter.type = 'bandpass';
    bodyFilter.frequency.setValueAtTime(preset.low, now);
    bodyFilter.frequency.exponentialRampToValueAtTime(preset.high, now + preset.duration * 0.68);
    bodyFilter.frequency.exponentialRampToValueAtTime(preset.low * 1.25, now + preset.duration);
    bodyFilter.Q.setValueAtTime(material === 'foil' ? 1.8 : 0.78, now);
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.exponentialRampToValueAtTime(preset.gain, now + 0.018);
    bodyGain.gain.setValueAtTime(preset.gain * 0.76, now + preset.duration * 0.28);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration);
    body.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    this.connectOutput(ctx, bodyGain, -0.08);
    body.start(now, Math.random() * 1.1, preset.duration + 0.03);
    body.stop(now + preset.duration + 0.05);

    const crisp = ctx.createBufferSource();
    const crispFilter = ctx.createBiquadFilter();
    const crispGain = ctx.createGain();
    crisp.buffer = this.getNoise(ctx);
    crispFilter.type = 'highpass';
    crispFilter.frequency.setValueAtTime(preset.high * 0.55, now);
    crispFilter.frequency.exponentialRampToValueAtTime(Math.min(11000, preset.high * 1.35), now + preset.duration * 0.5);
    crispGain.gain.setValueAtTime(0.0001, now);
    crispGain.gain.exponentialRampToValueAtTime(preset.gain * 0.52, now + 0.012);
    crispGain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration * 0.72);
    crisp.connect(crispFilter);
    crispFilter.connect(crispGain);
    this.connectOutput(ctx, crispGain, 0.16);
    crisp.start(now + 0.006, Math.random() * 1.2, preset.duration * 0.75);
    crisp.stop(now + preset.duration * 0.78);

    for (let index = 0; index < preset.cracks; index += 1) {
      const ratio = index / Math.max(1, preset.cracks - 1);
      this.noiseBurst({
        at: 0.025 + ratio * preset.duration * 0.66 + Math.random() * 0.025,
        duration: 0.012 + Math.random() * 0.03,
        gain: 0.035 + Math.random() * 0.08,
        frequency: preset.low * 1.4 + ratio * preset.high + Math.random() * 1300,
        q: 1.6 + Math.random() * 3,
        pan: -0.7 + ratio * 1.4,
        type: Math.random() > 0.38 ? 'highpass' : 'bandpass'
      });
    }

    const snap = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snap.type = 'sine';
    snap.frequency.setValueAtTime(material === 'paper' ? 118 : 145, now + preset.duration * 0.58);
    snap.frequency.exponentialRampToValueAtTime(42, now + preset.duration * 0.82);
    snapGain.gain.setValueAtTime(0.0001, now + preset.duration * 0.56);
    snapGain.gain.exponentialRampToValueAtTime(0.12, now + preset.duration * 0.59);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration * 0.86);
    snap.connect(snapGain);
    snapGain.connect(ctx.destination);
    snap.start(now + preset.duration * 0.56);
    snap.stop(now + preset.duration * 0.9);
  }

  playWhoosh() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    source.buffer = this.getNoise(ctx);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(260, now);
    filter.frequency.exponentialRampToValueAtTime(4800, now + 0.42);
    filter.Q.value = 0.6;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.17, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now, Math.random(), 0.58);
    source.stop(now + 0.6);
  }

  tone(frequency, at, duration, gainValue = 0.12, type = 'sine') {
    const ctx = this.getContext();
    if (!ctx || !this.enabled) return;
    const start = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  playPop() {
    this.tone(330, 0, 0.17, 0.1, 'sine');
    this.tone(760, 0.04, 0.2, 0.09, 'triangle');
  }

  playRare() {
    [440, 554.37, 659.25, 880].forEach((frequency, index) => this.tone(frequency, index * 0.075, 0.32, 0.09, 'triangle'));
    this.noiseBurst({ at: 0.12, duration: 0.32, gain: 0.035, frequency: 5200, q: 2.2, type: 'highpass' });
  }

  playLegendary() {
    [392, 523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((frequency, index) => this.tone(frequency, index * 0.09, 0.52, 0.105, index < 2 ? 'triangle' : 'sine'));
    this.noiseBurst({ at: 0.08, duration: 0.7, gain: 0.055, frequency: 6200, q: 2.4, type: 'highpass' });
  }

  playCoin() {
    this.tone(987.77, 0, 0.2, 0.1, 'sine');
    this.tone(1318.51, 0.08, 0.26, 0.11, 'sine');
  }
}

export const soundManager = new SoundEngine();
