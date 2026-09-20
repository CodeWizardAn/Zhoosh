// Cinematic "ZHOOOOSH" / Netflix-Style Intro Audio Synthesizer
// Created using Web Audio API for zero-dependency, zero-latency cinematic sound design

class ZhooshAudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted = false; // Enabled for signature Zhoosh cinematic intro sound

  public getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Resumes the AudioContext on user interaction if the browser suspended autoplay
   */
  public resumeContext(): Promise<void> {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      return ctx.resume();
    }
    return Promise.resolve();
  }

  /**
   * Signature Netflix-style "ZHOOOOOOSH" Cinematic Sound:
   * 1. "Zzz": Initial high-energy stereo sizzle and FM sweep (0.0s - 0.25s)
   * 2. "OOOO": Subterranean cinema sub-bass chord + detuned brass impact (0.12s - 2.2s)
   * 3. "SHHH": Giant resonant pink noise whoosh sweeping through the spectrum ("ZHOOO-SSHHH")
   * 4. "Shimmer": Crystalline celestial overtones and reverberant chime tail (0.25s - 2.5s)
   */
  playZhooshIntroSound() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;

      // Master Compressor for Hollywood-grade loudness & zero distortion
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, now);
      compressor.knee.setValueAtTime(24, now);
      compressor.ratio.setValueAtTime(10, now);
      compressor.attack.setValueAtTime(0.002, now);
      compressor.release.setValueAtTime(0.28, now);
      compressor.connect(ctx.destination);

      // --- 1. THE "Z" (Initial Electric Spark Transient at 0.0s) ---
      const zOsc = ctx.createOscillator();
      const zGain = ctx.createGain();
      const zFilter = ctx.createBiquadFilter();

      zOsc.type = 'sawtooth';
      zOsc.frequency.setValueAtTime(85, now);
      zOsc.frequency.exponentialRampToValueAtTime(190, now + 0.22);

      zFilter.type = 'bandpass';
      zFilter.frequency.setValueAtTime(500, now);
      zFilter.frequency.exponentialRampToValueAtTime(1400, now + 0.24);
      zFilter.Q.setValueAtTime(4.5, now);

      zGain.gain.setValueAtTime(0.001, now);
      zGain.gain.linearRampToValueAtTime(0.28, now + 0.07);
      zGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      zOsc.connect(zFilter);
      zFilter.connect(zGain);
      zGain.connect(compressor);
      zOsc.start(now);
      zOsc.stop(now + 0.26);

      // --- 2. THE "OOOO" (Subterranean Sub-Bass Chord + Analog Brass) ---
      const boomTime = now + 0.12;

      // Sub Bass Fundamental (44Hz deep rumble)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(72, boomTime);
      subOsc.frequency.exponentialRampToValueAtTime(42, boomTime + 0.42);

      subGain.gain.setValueAtTime(0.001, boomTime);
      subGain.gain.linearRampToValueAtTime(0.9, boomTime + 0.05);
      subGain.gain.exponentialRampToValueAtTime(0.001, boomTime + 2.2);

      subOsc.connect(subGain);
      subGain.connect(compressor);
      subOsc.start(boomTime);
      subOsc.stop(boomTime + 2.3);

      // Cinematic Detuned Brass Unison (D2 = 73.4Hz, A2 = 110Hz, D3 = 146.8Hz)
      [73.4, 74.1, 110.0, 146.8].forEach((freq, idx) => {
        const brassOsc = ctx.createOscillator();
        const brassGain = ctx.createGain();
        const brassFilter = ctx.createBiquadFilter();

        brassOsc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
        brassOsc.frequency.setValueAtTime(freq, boomTime);

        brassFilter.type = 'lowpass';
        brassFilter.frequency.setValueAtTime(380, boomTime);
        brassFilter.frequency.exponentialRampToValueAtTime(75, boomTime + 1.9);
        brassFilter.Q.setValueAtTime(3.2, boomTime);

        const vol = 0.2 / (idx + 1);
        brassGain.gain.setValueAtTime(0.001, boomTime);
        brassGain.gain.linearRampToValueAtTime(vol, boomTime + 0.06);
        brassGain.gain.exponentialRampToValueAtTime(0.001, boomTime + 2.0);

        brassOsc.connect(brassFilter);
        brassFilter.connect(brassGain);
        brassGain.connect(compressor);

        brassOsc.start(boomTime);
        brassOsc.stop(boomTime + 2.1);
      });

      // --- 3. THE "SHHHHH" (Massive Resonant Acoustic Whoosh "ZHOOO-SSHHH") ---
      const noiseDuration = 2.2;
      const bufferSize = ctx.sampleRate * noiseDuration;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.025 * white) / 1.025;
        lastOut = output[i];
        output[i] *= 3.8;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const sweepFilter = ctx.createBiquadFilter();
      sweepFilter.type = 'bandpass';
      sweepFilter.frequency.setValueAtTime(200, now);
      // Sweep dynamically up through the "ZHOOO" into the wide "SHHHH"
      sweepFilter.frequency.exponentialRampToValueAtTime(3200, now + 0.38);
      sweepFilter.frequency.exponentialRampToValueAtTime(380, now + 1.7);
      sweepFilter.Q.setValueAtTime(2.6, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.55, now + 0.3);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

      noiseSource.connect(sweepFilter);
      sweepFilter.connect(noiseGain);
      noiseGain.connect(compressor);

      noiseSource.start(now);
      noiseSource.stop(now + 2.0);

      // --- 4. THE CRYSTALLINE CINEMATIC SHIMMER (Bells & Star Dust) ---
      [1318.51, 1661.22, 1975.53, 2637.02].forEach((freq, idx) => {
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();

        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(freq, boomTime + idx * 0.04);

        chimeGain.gain.setValueAtTime(0.001, boomTime + idx * 0.04);
        chimeGain.gain.linearRampToValueAtTime(0.07, boomTime + idx * 0.04 + 0.03);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, boomTime + idx * 0.04 + 2.2);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(compressor);

        chimeOsc.start(boomTime + idx * 0.04);
        chimeOsc.stop(boomTime + idx * 0.04 + 2.3);
      });
    } catch (e) {
      console.warn('AudioContext playback error (user interaction may be required):', e);
    }
  }

  /**
   * Subtle sub-bass transient impact for clicks/button navigation
   */
  playSubImpact() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.09);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      // ignore
    }
  }

  /**
   * Uplifting harmonic chord for account created or milestone reached
   */
  playSuccessFanfare() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio chord

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.06 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.65);
      });
    } catch {
      // ignore
    }
  }
}

export const zhooshAudio = new ZhooshAudioEngine();
