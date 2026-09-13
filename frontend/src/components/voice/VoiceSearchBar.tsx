import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Search, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useVoiceSearchMutation } from '@/api/hooks';
import { MediaCard } from '../cards/MediaCard';
import { SkeletonCard } from '../cards/SkeletonCard';
import { Movie, Song } from '@/types';

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: unknown) => void;
  onend: () => void;
}

export const VoiceSearchBar: React.FC = () => {
  const {
    voiceSearch,
    closeVoiceSearch,
    setVoiceListening,
    setVoiceTranscript,
    mode
  } = useAppStore();

  const voiceMutation = useVoiceSearchMutation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const [simulatedBars, setSimulatedBars] = useState<number[]>(
    Array.from({ length: 24 }, () => 10)
  );

  const { isOpen, isListening, transcript, isProcessing } = voiceSearch;
  const [searchResults, setSearchResults] = useState<Array<Movie | Song>>([]);

  useEffect(() => {
    if (!isOpen) {
      stopAudioCapture();
      return;
    }
    startVoiceSession();
    return () => stopAudioCapture();
  }, [isOpen]);

  const startVoiceSession = async () => {
    setVoiceTranscript('');
    setSearchResults([]);
    setVoiceListening(true);

    // Try real SpeechRecognition
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: { new(): SpeechRecognitionInstance } }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: { new(): SpeechRecognitionInstance } }).webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event: SpeechRecognitionEvent) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            interim += event.results[i][0].transcript;
          }
          setVoiceTranscript(interim);
        };

        rec.onend = () => {
          setVoiceListening(false);
          triggerSearchWithQuery();
        };

        rec.onerror = () => startSyntheticTranscript();
        rec.start();
        recognitionRef.current = rec;
      } catch {
        startSyntheticTranscript();
      }
    } else {
      startSyntheticTranscript();
    }

    // Try real mic stream for waveform
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        renderLiveWaveform();
      } else {
        startSyntheticWaveform();
      }
    } catch {
      startSyntheticWaveform();
    }
  };

  const startSyntheticTranscript = () => {
    const samplePhrases = [
      'Sci fi soundtracks with Hans Zimmer synth',
      'Atmospheric movies like Blade Runner',
      'The Weeknd and Daft Punk electronic beats'
    ];
    const phrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
    const words = phrase.split(' ');
    let currentText = '';
    let i = 0;

    const interval = setInterval(() => {
      if (i < words.length) {
        currentText += (i === 0 ? '' : ' ') + words[i];
        setVoiceTranscript(currentText);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setVoiceListening(false);
          triggerSearchWithQuery(phrase);
        }, 400);
      }
    }, 240);
  };

  const startSyntheticWaveform = () => {
    const update = () => {
      const simulated = Array.from({ length: 24 }, (_, idx) => {
        const wave = Math.sin(Date.now() * 0.009 + idx * 0.35);
        return Math.max(10, Math.min(80, Math.abs(wave) * 65 + Math.random() * 20));
      });
      setSimulatedBars(simulated);
      animationFrameRef.current = requestAnimationFrame(update);
    };
    animationFrameRef.current = requestAnimationFrame(update);
  };

  const renderLiveWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) {
      startSyntheticWaveform();
      return;
    }
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = Math.max(4, (dataArray[i] / 255) * canvas.height * 0.85);
        ctx.fillStyle = mode === 'movies' ? '#FF1E56' : '#A855F7';
        const y = (canvas.height - barHeight) / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - 2, barHeight, 3);
        ctx.fill();
        x += barWidth + 2;
      }
    };
    draw();
  };

  const stopAudioCapture = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  const triggerSearchWithQuery = (overrideText?: string) => {
    const textToSearch = overrideText || transcript || 'Hans Zimmer soundtracks';
    voiceMutation.mutate(textToSearch, {
      onSuccess: (res) => {
        setSearchResults(res.results);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-xl rounded-2xl bg-[#181818] border border-[#282828] shadow-2xl p-6 text-white"
        >
          {/* Close button */}
          <button
            onClick={closeVoiceSearch}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#A7A7A7] hover:text-white hover:bg-[#282828] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Voice Search
            </h3>

            {/* Waveform Box */}
            <div className="h-16 flex items-center justify-center">
              {isListening ? (
                <div className="flex items-center gap-1.5 h-12">
                  <canvas
                    ref={canvasRef}
                    width={360}
                    height={50}
                    className="hidden sm:block"
                  />
                  <div className="flex sm:hidden items-center gap-1 h-10">
                    {simulatedBars.slice(0, 16).map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`w-1 rounded-full ${
                          mode === 'movies' ? 'bg-[#FF1E56]' : 'bg-[#A855F7]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : isProcessing ? (
                <div className="flex items-center gap-2 text-xs text-[#A7A7A7] font-medium animate-pulse">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Searching library...</span>
                </div>
              ) : (
                <span className="text-xs text-[#727272]">Tap below to speak</span>
              )}
            </div>

            {/* Live Transcript */}
            <div className="min-h-[48px] px-4 py-2 rounded-xl bg-[#121212] border border-[#282828] flex items-center justify-center text-sm font-medium">
              {transcript ? (
                <span className="text-white">“{transcript}”</span>
              ) : (
                <span className="text-[#727272]">Listening for title, genre, or mood...</span>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={isListening ? () => {
                  setVoiceListening(false);
                  triggerSearchWithQuery();
                } : startVoiceSession}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-transform hover:scale-105 shadow-md ${
                  mode === 'movies'
                    ? 'bg-[#FF1E56] text-white shadow-[#FF1E56]/30'
                    : 'bg-[#A855F7] text-white shadow-[#A855F7]/30'
                }`}
              >
                {isListening ? 'Done Speaking' : 'Try Again'}
              </button>
            </div>

            {/* Instant Results */}
            {searchResults.length > 0 && (
              <div className="pt-4 border-t border-[#282828] text-left">
                <h4 className="text-xs font-bold text-[#A7A7A7] uppercase tracking-wider mb-3">
                  Matching Results
                </h4>
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                  {searchResults.slice(0, 4).map((item, idx) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      variant={'overview' in item ? 'movie' : 'song'}
                      index={idx}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
