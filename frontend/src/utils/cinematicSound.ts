// Cinematic "Ta-Dum" / "Zhoosh" Audio Synthesizer
// Created using Web Audio API for zero-dependency, zero-latency cinematic playback

class ZhooshAudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted = true; // Sound disabled as requested

  private getContext(): AudioContext | null {
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
   * Plays the signature Netflix-style "Ta-Dum" / "Zhoosh" cinematic sound:
   * 1. "Ta": Quick mid-frequency percussion strike (80ms)
   * 2. "DUMMM": Deep subterranean bass chord (45Hz - 90Hz) with 2.4s decay
   * 3. "Zhoooosh": Bandpass filtered noise whoosh sweeping through the spectrum
   * 4. Shimmer: Harmonically rich crystalline overtone chime
   */
  playZhooshIntroSound() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Master compressor to give that Hollywood punch & prevent clipping
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-12, now);
      compressor.knee.setValueAtTime(30, now);
      compressor.ratio.setValueAtTime(12, now);
      compressor.attack.setValueAtTime(0.003, now);
      compressor.release.setValueAtTime(0.25, now);
      compressor.connect(ctx.destination);

      // --- 1. THE "TA" (Initial Perceptual Impact Transient at 0.0s) ---
      const taOsc = ctx.createOscillator();
      const taGain = ctx.createGain();
      taOsc.type = 'triangle';
      taOsc.frequency.setValueAtTime(130, now);
      taOsc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

      taGain.gain.setValueAtTime(0.35, now);
      taGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      taOsc.connect(taGain);
      taGain.connect(compressor);
      taOsc.start(now);
      taOsc.stop(now + 0.15);

      // --- 2. THE "DUMMM" (Main Subterranean Sub-Bass Chord at 0.14s) ---
      const dumTime = now + 0.13;

      // Sub bass fundamental (48Hz)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(75, dumTime);
      subOsc.frequency.exponentialRampToValueAtTime(46, dumTime + 0.35);

      subGain.gain.setValueAtTime(0.001, dumTime);
      subGain.gain.linearRampToValueAtTime(0.7, dumTime + 0.04);
      subGain.gain.exponentialRampToValueAtTime(0.001, dumTime + 2.2);

      subOsc.connect(subGain);
      subGain.connect(compressor);
      subOsc.start(dumTime);
      subOsc.stop(dumTime + 2.3);

      // Detuned Brass/Saw Unison for cinematic thickness (D2 = 73.4Hz + A2 = 110Hz)
      [73.4, 73.9, 110.0].forEach((freq, idx) => {
        const brassOsc = ctx.createOscillator();
        const brassGain = ctx.createGain();
        const brassFilter = ctx.createBiquadFilter();

        brassOsc.type = 'sawtooth';
        brassOsc.frequency.setValueAtTime(freq, dumTime);

        // Low-pass filter sweep for that authentic analog brass growl
        brassFilter.type = 'lowpass';
        brassFilter.frequency.setValueAtTime(320, dumTime);
        brassFilter.frequency.exponentialRampToValueAtTime(80, dumTime + 1.8);
        brassFilter.Q.setValueAtTime(4, dumTime);

        const volume = idx === 2 ? 0.15 : 0.22;
        brassGain.gain.setValueAtTime(0.001, dumTime);
        brassGain.gain.linearRampToValueAtTime(volume, dumTime + 0.06);
        brassGain.gain.exponentialRampToValueAtTime(0.001, dumTime + 2.1);

        brassOsc.connect(brassFilter);
        brassFilter.connect(brassGain);
        brassGain.connect(compressor);

        brassOsc.start(dumTime);
        brassOsc.stop(dumTime + 2.2);
      });

      // --- 3. THE "ZHOOOOSH" (Airy Frequency Sweep Whoosh) ---
      // White noise buffer for rushing texture
      const bufferSize = ctx.sampleRate * 1.5;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(250, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(2400, now + 0.25);
      noiseFilter.frequency.exponentialRampToValueAtTime(400, now + 1.2);
      noiseFilter.Q.setValueAtTime(3.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.28, now + 0.16);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(compressor);

      whiteNoise.start(now);
      whiteNoise.stop(now + 1.4);

      // --- 4. THE METALLIC CRYSTALLINE OVERTONE (Anvil / Chime Reverb tail) ---
      [1760, 2637, 3520].forEach((freq) => {
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();

        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(freq, dumTime + 0.02);

        chimeGain.gain.setValueAtTime(0.001, dumTime + 0.02);
        chimeGain.gain.linearRampToValueAtTime(0.04, dumTime + 0.05);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, dumTime + 1.8);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(compressor);

        chimeOsc.start(dumTime + 0.02);
        chimeOsc.stop(dumTime + 1.9);
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
