// Cinematic Audio Synthesizer (Disabled as requested)

class ZhooshAudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted = true; // Sound completely disabled as requested

  public getContext(): AudioContext | null {
    return null;
  }

  public async resumeContext(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Sound disabled - completely silent
   */
  public playZhooshIntroSound(_force = false) {
    return;
  }

  public playSubImpact() {
    return;
  }

  public playSuccessFanfare() {
    return;
  }
}

export const zhooshAudio = new ZhooshAudioEngine();
