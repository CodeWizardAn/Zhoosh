// Web Audio API Synthesizer for live audio playback
class AudioSynthEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timer: number | null = null;
  private currentStep = 0;
  public isMuted = true;

  private initCtx() {
    if (this.isMuted) return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTrackPreview(genre: string = 'synthwave') {
    if (this.isMuted) return;
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.currentStep = 0;

    // Pentatonic scale frequencies for musical soothing ambient loop
    const scale = genre.toLowerCase().includes('lofi')
      ? [220, 261.63, 293.66, 329.63, 392.0] // A minor pentatonic
      : [130.81, 164.81, 196.0, 246.94, 293.66, 392.0]; // C maj / synthwave

    const bpm = 110;
    const stepDurationMs = (60 / bpm / 2) * 1000;

    this.timer = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      
      const freq = scale[this.currentStep % scale.length];
      this.triggerTone(freq, 0.4);
      
      // Secondary chord note on every 2nd step
      if (this.currentStep % 2 === 0) {
        this.triggerTone(scale[(this.currentStep + 2) % scale.length] * 0.5, 0.6, 'sawtooth');
      }

      this.currentStep = (this.currentStep + 1) % 16;
    }, stepDurationMs);
  }

  private triggerTone(freq: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Low pass filter for warm analog feel
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio context policy safe handling
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  playAmbientDrone() {
    this.isMuted = false;
    this.initCtx();
    if (!this.ctx) return;
    try {
      this.triggerTone(55, 1.2, 'sine'); // Deep sub-bass A1
      this.triggerTone(110, 1.0, 'triangle'); // Low A2
      this.triggerTone(164.81, 0.8, 'sine'); // E3
    } catch {
      // Audio context safe fallback
    }
  }

  getAudioContext() {
    this.initCtx();
    return this.ctx;
  }
}

export const synthEngine = new AudioSynthEngine();
