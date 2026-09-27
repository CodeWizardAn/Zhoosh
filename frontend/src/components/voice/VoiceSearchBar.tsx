import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  X,
  Search,
  Sparkles,
  Radio,
  Disc3,
  Play,
  Pause,
  Heart,
  RotateCw,
  Upload,
  Music2,
  Film
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/api/client';
import { triggerLikeBurst } from '@/utils/confetti';
import { Song, AppMode } from '@/types';

type SearchAudioMode = 'voice' | 'identify';
type IdentifyState = 'idle' | 'listening' | 'identifying' | 'found' | 'not_found' | 'error';

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
    mode,
    setMode,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    toggleLike,
    likedIds
  } = useAppStore();

  const [searchDomain, setSearchDomain] = useState<'movies' | 'music'>(mode);
  const isCinema = searchDomain === 'movies';
  const [activeTab, setActiveTab] = useState<SearchAudioMode>('voice');

  // Synchronize searchDomain when modal opens
  useEffect(() => {
    if (voiceSearch.isOpen) {
      setSearchDomain(mode);
    }
  }, [voiceSearch.isOpen, mode]);

  // Voice Search states
  const { isOpen, isListening, transcript, isProcessing } = voiceSearch;

  // Song Identification (Shazam) states
  const [identifyState, setIdentifyState] = useState<IdentifyState>('idle');
  const [countdown, setCountdown] = useState<number>(6);
  const [identifiedTrack, setIdentifiedTrack] = useState<(Song & { share_url?: string }) | null>(null);
  const [identifyError, setIdentifyError] = useState<string>('');
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);

  // Audio capture refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const countdownTimerRef = useRef<any>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [simulatedBars, setSimulatedBars] = useState<number[]>(
    Array.from({ length: 32 }, () => 14)
  );

  // If in Cinema mode, Shazam tab is never active
  useEffect(() => {
    if (isCinema && activeTab === 'identify') {
      setActiveTab('voice');
    }
  }, [isCinema, activeTab]);

  useEffect(() => {
    if (!isOpen) {
      stopAllAudio();
      setActiveTab('voice');
      setIdentifyState('idle');
      setIdentifiedTrack(null);
      setIsPreviewPlaying(false);
      return;
    }

    if (activeTab === 'voice') {
      startVoiceSession();
    } else if (!isCinema) {
      startIdentifySession();
    }

    return () => stopAllAudio();
  }, [isOpen, activeTab]);

  const stopAllAudio = () => {
    if (previewAudioRef.current) {
      try {
        previewAudioRef.current.pause();
      } catch {}
      setIsPreviewPlaying(false);
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
  };

  // ── VOICE SPEECH RECOGNITION ───────────────────────────────────────────────
  const startVoiceSession = async () => {
    stopAllAudio();
    setVoiceTranscript('');
    setVoiceListening(true);

    const SpeechRec =
      (window as unknown as { SpeechRecognition?: { new(): SpeechRecognitionInstance } }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: { new(): SpeechRecognitionInstance } }).webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event: SpeechRecognitionEvent) => {
          let text = '';
          for (let i = 0; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          if (text) {
            setVoiceTranscript(text);
            const lower = text.toLowerCase();
            const isSongOrMusic = ['song', 'songs', 'track', 'tracks', 'music', 'singer', 'listen', 'play', 'sing', 'kesariya', 'arijit', 'diljit', 'coldplay', 'album'].some(k => lower.includes(k));
            if (isSongOrMusic && searchDomain !== 'music') {
              setSearchDomain('music');
            }
          }
        };

        rec.onend = () => {
          // Do NOT auto-trigger search if empty or auto-close modal!
          setVoiceListening(false);
        };

        rec.onerror = (e) => {
          console.warn('Voice recognition notice:', e);
          setVoiceListening(false);
        };

        rec.start();
        recognitionRef.current = rec;
      } catch {
        setVoiceListening(false);
      }
    } else {
      setVoiceListening(false);
    }

    setupMicrophoneWaveform();
  };

  const triggerSearchWithQuery = (overrideText?: string) => {
    const textToSearch = (overrideText !== undefined ? overrideText : transcript).trim();
    if (!textToSearch) return;

    const lower = textToSearch.toLowerCase();
    const isSongOrMusic = searchDomain === 'music' || ['song', 'songs', 'track', 'tracks', 'music', 'singer', 'listen', 'play', 'sing', 'kesariya', 'arijit', 'diljit', 'coldplay', 'album'].some(k => lower.includes(k));
    const targetMode: AppMode = isSongOrMusic ? 'music' : 'movies';

    if (mode !== targetMode) {
      setMode(targetMode);
    }

    setVoiceTranscript(textToSearch);
    window.dispatchEvent(new CustomEvent('zhoosh:voice-query', { detail: { query: textToSearch, mode: targetMode } }));
    setTimeout(() => {
      closeVoiceSearch();
    }, 350);
  };

  // ── SHAZAM SONG IDENTIFICATION ─────────────────────────────────────────────
  const startIdentifySession = async () => {
    stopAllAudio();
    setIdentifyState('listening');
    setCountdown(6);
    setIdentifiedTrack(null);
    setIdentifyError('');
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true }
      });
      mediaStreamRef.current = stream;

      setupWaveformFromStream(stream);

      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          handleShazamIdentify(audioBlob);
        } else {
          setIdentifyState('error');
          setIdentifyError('No audio recorded. Please try again.');
        }
      };

      recorder.start(400);

      let timeLeft = 6;
      countdownTimerRef.current = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(countdownTimerRef.current);
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }
      }, 1000);

    } catch (err: any) {
      console.error('Mic access error for identification:', err);
      setIdentifyState('error');
      setIdentifyError('Microphone access unavailable or denied. You can also upload an audio file below.');
    }
  };

  const stopAndIdentifyNow = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopAllAudio();
      handleShazamIdentify(file);
    }
  };

  const handleShazamIdentify = async (audioBlob: Blob) => {
    setIdentifyState('identifying');
    setIdentifyError('');
    try {
      const res = await api.identifyAudio(audioBlob);
      if (res.found && res.track) {
        setIdentifiedTrack(res.track);
        setIdentifyState('found');
      } else {
        setIdentifyState('not_found');
        setIdentifyError(res.message || 'No track recognized. Hold your device closer to the music speaker.');
      }
    } catch (err: any) {
      setIdentifyState('error');
      setIdentifyError(err.message || 'Failed to connect to recognition service.');
    }
  };

  const togglePreviewAudio = () => {
    if (!identifiedTrack) return;

    if (isPreviewPlaying) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setIsPreviewPlaying(false);
      if (isPlaying) togglePlay();
    } else {
      if (identifiedTrack.audio_url) {
        if (!previewAudioRef.current) {
          previewAudioRef.current = new Audio(identifiedTrack.audio_url);
          previewAudioRef.current.onended = () => setIsPreviewPlaying(false);
        } else {
          previewAudioRef.current.src = identifiedTrack.audio_url;
        }
        previewAudioRef.current.play().catch(() => {});
        setIsPreviewPlaying(true);
      }
      playTrack(identifiedTrack);
    }
  };

  // ── WAVEFORM DRAWING ───────────────────────────────────────────────────────
  const setupMicrophoneWaveform = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setupWaveformFromStream(stream);
      } else {
        startSyntheticWaveform();
      }
    } catch {
      startSyntheticWaveform();
    }
  };

  const setupWaveformFromStream = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      renderLiveWaveform();
    } catch {
      startSyntheticWaveform();
    }
  };

  const startSyntheticWaveform = () => {
    const update = () => {
      const simulated = Array.from({ length: 32 }, (_, idx) => {
        const wave = Math.sin(Date.now() * 0.009 + idx * 0.35);
        return Math.max(10, Math.min(85, Math.abs(wave) * 70 + Math.random() * 20));
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
      const barWidth = (canvas.width / bufferLength) * 1.6;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = Math.max(6, (dataArray[i] / 255) * canvas.height * 0.88);
        
        if (activeTab === 'identify') {
          const grad = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          grad.addColorStop(0, '#06b6d4');
          grad.addColorStop(0.5, '#a855f7');
          grad.addColorStop(1, '#ec4899');
          ctx.fillStyle = grad;
        } else if (isCinema) {
          const grad = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          grad.addColorStop(0, '#ff1e56');
          grad.addColorStop(1, '#f97316');
          ctx.fillStyle = grad;
        } else {
          const grad = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          grad.addColorStop(0, '#38bdf8');
          grad.addColorStop(1, '#6366f1');
          ctx.fillStyle = grad;
        }

        const y = (canvas.height - barHeight) / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - 2.5, barHeight, 4);
        ctx.fill();
        x += barWidth + 2;
      }
    };
    draw();
  };

  if (!isOpen) return null;

  const isLiked = identifiedTrack ? !!likedIds[String(identifiedTrack.id)] : false;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-[#06060c]/85 backdrop-blur-2xl flex items-center justify-center p-4">
        {/* Ambient atmospheric backdrop light */}
        <div
          className={`absolute pointer-events-none w-96 h-96 rounded-full blur-[140px] opacity-25 ${
            activeTab === 'identify' ? 'bg-cyan-500' : isCinema ? 'bg-[#FF1E56]' : 'bg-blue-600'
          }`}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl rounded-[28px] bg-[#0c0c14]/95 border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] p-6 sm:p-7 text-white overflow-hidden max-h-[90vh] flex flex-col z-10"
        >
          {/* Header: Segmented Tabs & Domain Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/[0.08] shrink-0">
            {/* Mode Switcher Pill (Cinema vs Music) */}
            <div className="flex items-center bg-black/60 p-1 rounded-2xl border border-white/10 shadow-inner">
              <button
                onClick={() => setSearchDomain('movies')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  searchDomain === 'movies'
                    ? 'bg-gradient-to-r from-[#FF1E56] to-rose-600 text-white shadow-md shadow-[#FF1E56]/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Search Cinema Catalog"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Cinema</span>
              </button>

              <button
                onClick={() => setSearchDomain('music')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  searchDomain === 'music'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Search Music Catalog"
              >
                <Music2 className="w-3.5 h-3.5" />
                <span>Music</span>
              </button>
            </div>

            {/* Audio Modes (Voice Search vs Shazam) */}
            <div className="flex items-center bg-black/50 p-1 rounded-2xl border border-white/10 shadow-inner">
              <button
                onClick={() => setActiveTab('voice')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'voice'
                    ? searchDomain === 'movies'
                      ? 'bg-gradient-to-r from-[#FF1E56] to-rose-600 text-white shadow-md shadow-[#FF1E56]/30'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{searchDomain === 'movies' ? 'Voice Search' : 'Voice Search'}</span>
              </button>

              {searchDomain === 'music' && (
                <button
                  onClick={() => setActiveTab('identify')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'identify'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                      : 'text-zinc-400 hover:text-cyan-300'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                  <span className="text-cyan-300 font-extrabold">Shazam</span>
                </button>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={closeVoiceSearch}
              className="p-2 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-auto"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar pt-6 text-center space-y-5">
            {/* ══════════════ TAB 1: VOICE SEARCH ══════════════ */}
            {activeTab === 'voice' && (
              <div className="space-y-5">
                {/* Visualizer Orb Container */}
                <div className="relative flex flex-col items-center justify-center py-2">
                  {isListening && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <motion.div
                        animate={{ scale: [1, 1.4, 1.8], opacity: [0.5, 0.2, 0] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }}
                        className={`w-32 h-32 rounded-full border ${
                          isCinema ? 'border-[#FF1E56]/40' : 'border-blue-500/40'
                        }`}
                      />
                    </div>
                  )}

                  {/* Tactile Microphone Orb */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isListening ? () => setVoiceListening(false) : startVoiceSession}
                    className={`relative z-10 w-20 h-20 rounded-3xl p-0.5 transition-all duration-300 shadow-2xl cursor-pointer ${
                      isCinema
                        ? 'bg-gradient-to-tr from-[#FF1E56] to-amber-500 shadow-[#FF1E56]/30'
                        : 'bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-blue-500/30'
                    }`}
                  >
                    <div className="w-full h-full rounded-[22px] bg-[#0c0c14] flex items-center justify-center border border-white/20">
                      {isListening ? (
                        <Mic className={`w-8 h-8 animate-pulse ${isCinema ? 'text-[#FF1E56]' : 'text-blue-400'}`} />
                      ) : (
                        <MicOff className="w-8 h-8 text-zinc-400" />
                      )}
                    </div>
                  </motion.button>
                </div>

                {/* Waveform Equalizer Canvas */}
                <div className="h-12 flex items-center justify-center bg-black/40 rounded-2xl border border-white/[0.06] px-4 overflow-hidden">
                  {isListening ? (
                    <div className="w-full flex items-center justify-center h-10">
                      <canvas ref={canvasRef} width={380} height={40} className="hidden sm:block" />
                      <div className="flex sm:hidden items-center justify-center gap-1 h-8 w-full">
                        {simulatedBars.slice(0, 18).map((h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className={`w-1 rounded-full ${
                              isCinema ? 'bg-[#FF1E56]' : 'bg-blue-400'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : isProcessing ? (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-semibold animate-pulse">
                      <Sparkles className={`w-4 h-4 ${isCinema ? 'text-[#FF1E56]' : 'text-blue-400'}`} />
                      <span>{isCinema ? 'Scanning film archives...' : 'Searching music catalog...'}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400 font-medium">
                      {transcript ? 'Tap "Search" or click microphone to speak again' : 'Tap microphone orb above to begin speaking'}
                    </span>
                  )}
                </div>

                {/* Live Transcript Display Box */}
                <div className="min-h-[58px] px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-sm font-medium transition-all shadow-inner">
                  {transcript ? (
                    <p className="text-white font-semibold tracking-wide">
                      “{transcript}”
                    </p>
                  ) : (
                    <p className="text-zinc-500 text-xs italic">
                      {isCinema
                        ? 'Try saying: "Inception Christopher Nolan" or "Mind-bending sci-fi movies"'
                        : 'Try saying: "Arijit Singh love songs" or "Upbeat electronic gym music"'}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  {transcript.trim() ? (
                    <button
                      onClick={() => triggerSearchWithQuery()}
                      className={`px-7 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-xl cursor-pointer flex items-center gap-1.5 ${
                        isCinema
                          ? 'bg-gradient-to-r from-[#FF1E56] to-rose-600 text-white shadow-[#FF1E56]/30'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
                      }`}
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search &quot;{transcript.slice(0, 24)}{transcript.length > 24 ? '...' : ''}&quot;</span>
                    </button>
                  ) : (
                    <button
                      onClick={isListening ? () => setVoiceListening(false) : startVoiceSession}
                      className={`px-7 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-xl cursor-pointer ${
                        isCinema
                          ? 'bg-gradient-to-r from-[#FF1E56] to-rose-600 text-white shadow-[#FF1E56]/30'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
                      }`}
                    >
                      {isListening ? 'Stop Listening' : 'Start Speaking'}
                    </button>
                  )}

                  {!isCinema && (
                    <button
                      onClick={() => setActiveTab('identify')}
                      className="px-5 py-2.5 rounded-full text-xs font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
                    >
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>Identify Song</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════ TAB 2: SHAZAM SONG IDENTIFICATION (MUSIC ONLY) ══════════════ */}
            {!isCinema && activeTab === 'identify' && (
              <div className="space-y-5">
                {/* ── Sub-State: Listening ── */}
                {identifyState === 'listening' && (
                  <div className="py-4 flex flex-col items-center">
                    {/* Pulsing Concentric Radar Waves */}
                    <div className="relative flex items-center justify-center w-40 h-40 mb-4">
                      <motion.div
                        animate={{ scale: [1, 1.5, 2.0], opacity: [0.6, 0.3, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-full border-2 border-cyan-400/50"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1.7], opacity: [0.8, 0.4, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeOut', delay: 0.6 }}
                        className="absolute inset-0 rounded-full border border-purple-500/50"
                      />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                        className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-[0_0_40px_rgba(6,182,212,0.4)] flex items-center justify-center"
                      >
                        <div className="w-full h-full rounded-full bg-[#0c0d16] flex flex-col items-center justify-center">
                          <Disc3 className="w-9 h-9 text-cyan-400 animate-spin" />
                          <span className="text-[11px] font-mono font-bold text-white mt-0.5">
                            {countdown}s
                          </span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Radar Equalizer Canvas */}
                    <div className="w-64 h-11 mb-3 bg-black/40 rounded-2xl p-1 border border-white/10 flex items-center justify-center overflow-hidden">
                      <canvas ref={canvasRef} width={240} height={38} className="w-full h-full" />
                    </div>

                    <h4 className="text-base font-bold text-white">
                      Listening to playing music...
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-xs mt-1">
                      Hold device near the music speaker. Identifies any song, genre, or language via Shazam.
                    </p>

                    <div className="flex items-center gap-3 mt-4">
                      {countdown < 5 && (
                        <button
                          onClick={stopAndIdentifyNow}
                          className="px-5 py-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          Identify Now
                        </button>
                      )}

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Upload audio file (MP3, WAV, WebM)"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Choose Audio File
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Sub-State: Identifying ── */}
                {identifyState === 'identifying' && (
                  <div className="py-12 flex flex-col items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                      className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                    />
                    <h4 className="text-base font-bold text-white">
                      Analyzing Acoustic Constellation...
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                      Matching live sound fingerprints against Shazam&apos;s 100M+ music library...
                    </p>
                  </div>
                )}

                {/* ── Sub-State: Found (Clean Identified Song Card with ZERO Recommended Strips) ── */}
                {identifyState === 'found' && identifiedTrack && (
                  <div className="space-y-4 text-left">
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-cyan-500/30 flex items-center gap-4 relative overflow-hidden shadow-xl">
                      <div className="relative shrink-0">
                        <img
                          src={identifiedTrack.album_art}
                          alt={identifiedTrack.title}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-2xl border border-white/20"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold mb-1 border border-cyan-500/30">
                          <Sparkles className="w-3 h-3" />
                          {identifiedTrack.match_score || 98}% Acoustic Resonance
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white truncate leading-tight">
                          {identifiedTrack.title}
                        </h3>
                        <p className="text-sm text-cyan-200 font-semibold truncate mt-0.5">
                          {identifiedTrack.artist}
                        </p>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {identifiedTrack.album} • {identifiedTrack.genre}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <button
                            onClick={togglePreviewAudio}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-cyan-500/25"
                          >
                            {isPreviewPlaying || (currentTrack?.title === identifiedTrack.title && isPlaying) ? (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-white" />
                                Pause Preview
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-white" />
                                Play Preview
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              toggleLike(identifiedTrack);
                              if (!isLiked) triggerLikeBurst();
                            }}
                            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                              isLiked
                                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                                : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white'
                            }`}
                            title="Save to Library"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>

                          <button
                            onClick={() => {
                              window.dispatchEvent(
                                new CustomEvent('zhoosh:voice-query', {
                                  detail: `${identifiedTrack.title} ${identifiedTrack.artist}`
                                })
                              );
                              closeVoiceSearch();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                            title="Search catalog for this song"
                          >
                            <Search className="w-3 h-3" />
                            Search Title
                          </button>

                          <button
                            onClick={startIdentifySession}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <RotateCw className="w-3 h-3" />
                            Scan Again
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Sub-State: Not Found / Error ── */}
                {(identifyState === 'not_found' || identifyState === 'error') && (
                  <div className="py-8 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-white/10 flex items-center justify-center mb-3">
                      <Music2 className="w-6 h-6 text-zinc-400" />
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">
                      {identifyState === 'not_found' ? 'No Track Recognized' : 'Recognition Error'}
                    </p>
                    <p className="text-xs text-zinc-400 max-w-xs mb-4">
                      {identifyError || 'Could not match audio. Hold your microphone closer to the speaker or upload an audio file.'}
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={startIdentifySession}
                        className="px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        Try Again
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload File
                      </button>
                    </div>
                  </div>
                )}

                {/* Hidden File Input for uploading song clips */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
