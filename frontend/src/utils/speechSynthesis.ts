/**
 * Web Speech Synthesis (TTS) utility for Nova / Zhoosh AI Voice Responses.
 */

let keepAliveTimer: ReturnType<typeof setInterval> | null = null;

const cleanTextForSpeech = (rawText: string): string => {
  if (!rawText) return '';

  return (
    rawText
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove markdown links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown bold / italic
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // Remove headers (#, ##, etc.)
      .replace(/^#+\s+/gm, '')
      // Remove blockquotes (> )
      .replace(/^>\s+/gm, '')
      // Remove bullet dashes / list markers
      .replace(/^[\s*•-]+\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      // Remove common decorative emojis to keep speech pronunciation natural
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      // Normalize whitespace and newlines
      .replace(/\s+/g, ' ')
      .trim()
  );
};

export const isSpeechSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

export const stopSpeech = (): void => {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
};

export const speakResponse = (
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
  }
): void => {
  if (!isSpeechSupported()) return;

  const clean = cleanTextForSpeech(text);
  if (!clean) {
    options?.onEnd?.();
    return;
  }

  // Cancel any ongoing utterance before starting a new one
  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = 1.02;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Select the best natural-sounding English voice available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Jenny') ||
          v.name.includes('Aria') ||
          v.name.includes('Zira') ||
          v.name.includes('Victoria'))
    ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => {
    options?.onStart?.();

    // Chromium speech synthesis bug workaround:
    // Chromium may pause long utterances after ~14 seconds unless briefly paused/resumed
    if (keepAliveTimer) clearInterval(keepAliveTimer);
    keepAliveTimer = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        if (keepAliveTimer) {
          clearInterval(keepAliveTimer);
          keepAliveTimer = null;
        }
      }
    }, 10000);
  };

  const handleFinish = () => {
    if (keepAliveTimer) {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
    }
    options?.onEnd?.();
  };

  utterance.onend = handleFinish;
  utterance.onerror = handleFinish;

  try {
    window.speechSynthesis.speak(utterance);
  } catch {
    handleFinish();
  }
};
