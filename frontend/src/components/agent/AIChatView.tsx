import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Send,
  Trash2,
  Sparkles,
  Film,
  Music2,
  Play,
  Heart,
  Info,
  Mic,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Check,
  Plus
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAgentStore } from '@/store/useAgentStore';
import { api } from '@/api/client';
import { Movie, Song } from '@/types';
import { FadedGridBackdrop } from '../common/FadedGridBackdrop';
import { triggerLikeBurst } from '@/utils/confetti';
import { synthEngine } from '@/utils/audioSynth';

// Fallback high-res poster image for movies if image URL fails
const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80';

const SAFE_ALBUM_ARTS = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80'
];

const getSafeAlbumArt = (id: string | number) => {
  const hash = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return SAFE_ALBUM_ARTS[hash % SAFE_ALBUM_ARTS.length];
};

const AgentRecommendedSongCard: React.FC<{ song: Song }> = ({ song }) => {
  const { playTrack, currentTrack, isPlaying, likedIds, toggleLike, openPopover } = useAppStore();
  const isThisCurrent = currentTrack?.id === song.id;
  const isLiked = !!likedIds[String(song.id)];
  const [imgSrc, setImgSrc] = useState(song.album_art || getSafeAlbumArt(song.id));

  useEffect(() => {
    setImgSrc(song.album_art || getSafeAlbumArt(song.id));
  }, [song.album_art, song.id]);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTrack(song);
    synthEngine.playTrackPreview(song.genre);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerLikeBurst(e.clientX, e.clientY, 'music');
    toggleLike(song);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPopover(song, e.currentTarget.getBoundingClientRect());
  };

  return (
    <div
      onClick={handlePlay}
      className="group relative flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-[#0B1120]/95 via-[#0D1528]/95 to-[#080B14]/95 hover:from-[#111A30] hover:to-[#0F1626] border border-blue-500/20 hover:border-cyan-400/50 transition-all duration-200 cursor-pointer shadow-xl hover:shadow-cyan-500/10 select-none overflow-hidden"
    >
      {/* Background soft glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Album Art with play overlay & live equalizer */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-[#060A14] shadow-md border border-white/10">
        <img
          src={imgSrc}
          alt={song.title}
          onError={() => setImgSrc(getSafeAlbumArt(song.id))}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Live Equalizer if playing */}
        {isThisCurrent && isPlaying ? (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1">
            <span className="w-1 h-3.5 bg-cyan-400 rounded-full animate-pulse" />
            <span className="w-1 h-5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-3 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="flex flex-col min-w-0 flex-1 justify-center space-y-1">
        <h4 className="text-sm sm:text-base font-extrabold text-white truncate group-hover:text-cyan-300 transition-colors">
          {song.title}
        </h4>
        <p className="text-xs text-gray-300 font-medium truncate">
          {song.artist}
        </p>

        <div className="flex items-center gap-2 pt-0.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-cyan-300 border border-blue-400/30 truncate max-w-[120px]">
            {song.genre || 'Music'}
          </span>
          {song.duration_sec && (
            <span className="text-[11px] text-gray-400 font-mono">
              {Math.floor(song.duration_sec / 60)}:{(song.duration_sec % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      {/* Interactive Actions */}
      <div className="flex items-center gap-1.5 shrink-0 z-10">
        <button
          onClick={handleLike}
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            isLiked ? 'text-rose-500 hover:text-rose-400' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={handleAdd}
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Add to Playlist"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={handlePlay}
          className="w-8 h-8 rounded-full bg-blue-600 hover:bg-cyan-400 text-white hover:text-black flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer ml-0.5"
          title="Play Track"
        >
          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
        </button>
      </div>
    </div>
  );
};

export const AIChatView: React.FC = () => {
  const {
    mode,
    setMode,
    openMovieModal,
    playTrack,
    likedIds,
    likedItems,
    toggleLike,
    openVoiceSearch,
    addToast
  } = useAppStore();

  const {
    profile,
    messagesByMode,
    memoryByMode,
    isThinking,
    addMessage,
    updateLastAgentMessage,
    attachMoviesToLastMessage,
    attachSongsToLastMessage,
    setThinking,
    clearChatScreen,
    loadFromStorage
  } = useAgentStore();

  const isMovieMode = mode === 'movies';
  const activeMode: 'movies' | 'music' = isMovieMode ? 'movies' : 'music';
  const messages = messagesByMode?.[activeMode] || [];
  const currentMemory = memoryByMode?.[activeMode];

  const shouldReduceMotion = useReducedMotion();
  const [input, setInput] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<boolean>(false);

  const botName = profile?.name || (isMovieMode ? 'Nova' : 'SonicBot');
  const botAvatar = profile?.avatarUrl || '/agent-avatar.jpg';

  useEffect(() => {
    loadFromStorage();
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);
    return () => clearTimeout(timer);
  }, [loadFromStorage]);


  // Container-isolated auto-scroll: strictly scrolls the chat container, NEVER window
  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: smooth && !shouldReduceMotion ? 'smooth' : 'auto'
      });
    }
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (messages.length > 0 || isThinking) {
      scrollToBottom(true);
    }
  }, [messages.length, isThinking, scrollToBottom]);

  const handleSendMessage = useCallback(async (text: string) => {
    const query = text.trim();
    if (!query || isThinking) return;

    setInput('');
    abortRef.current = false;

    // Add user message to active mode
    addMessage({ role: 'user', content: query }, activeMode);

    // Add placeholder streaming agent message to active mode
    addMessage({ role: 'agent', content: '', isStreaming: true }, activeMode);

    setThinking(true);
    let accumulated = '';

    try {
      await api.agentChat(
        query,
        messages.map((m) => ({
          role: m.role === 'agent' ? 'assistant' : 'user',
          content: m.content
        })),
        botName,
        (token) => {
          if (abortRef.current) return;
          accumulated += token;
          updateLastAgentMessage(accumulated, false, activeMode);
        },
        (_intent) => {
          if (abortRef.current) return;
          updateLastAgentMessage(accumulated, true, activeMode);
          setThinking(false);
        },
        () => {
          updateLastAgentMessage('Sorry, I ran into an issue connecting. Please try again.', true, activeMode);
          setThinking(false);
        },
        (movies) => {
          if (abortRef.current) return;
          if (activeMode === 'movies') {
            attachMoviesToLastMessage(movies, 'movies');
          }
        },
        (songs) => {
          if (abortRef.current) return;
          if (activeMode === 'music') {
            attachSongsToLastMessage(songs, 'music');
          }
        },
        activeMode,
        Object.values(likedItems)
          .map((item) => ('title' in item ? item.title : (item as any).track_name || ''))
          .filter(Boolean),
        currentMemory
      );
    } catch {
      updateLastAgentMessage('I had a brief glitch retrieving that recommendation. Please try asking again!', true, activeMode);
      setThinking(false);
    }
  }, [activeMode, addMessage, botName, currentMemory, isThinking, likedItems, messages, setThinking, updateLastAgentMessage, attachMoviesToLastMessage, attachSongsToLastMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const handleClear = () => {
    clearChatScreen(activeMode);
    addToast({
      title: 'Chat cleared',
      description: 'Screen refreshed · Memory and taste profile preserved',
      type: 'info'
    });
  };

  return (
    <div className="relative h-full flex-1 w-full flex flex-col justify-between overflow-hidden bg-[#07070b]">
      {/* ── 1. Signature Black & Red / Black & Blue Faded Grid Layer ── */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        {/* Geometric Grid Mesh */}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage: isMovieMode
              ? `
                  linear-gradient(to right, rgba(229, 9, 20, 0.14) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(229, 9, 20, 0.14) 1px, transparent 1px)
                `
              : `
                  linear-gradient(to right, rgba(0, 140, 255, 0.14) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0, 140, 255, 0.14) 1px, transparent 1px)
                `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Ambient Aura Glows (Matching MoviesView & MusicView) */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-[1200px] h-[450px] rounded-full blur-[120px] pointer-events-none ${
            isMovieMode ? 'bg-[#E50914]/15' : 'bg-[#0070F3]/16'
          }`}
        />
        <div
          className={`absolute top-[35%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none ${
            isMovieMode ? 'bg-[#B81D24]/12' : 'bg-[#00D2FF]/12'
          }`}
        />
        <div
          className={`absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none ${
            isMovieMode ? 'bg-[#E50914]/10' : 'bg-[#1D4ED8]/12'
          }`}
        />

        {/* Soft Radial Vignette Framing */}
        <div
          className="absolute inset-0"
          style={{
            background: isMovieMode
              ? 'radial-gradient(ellipse at 50% 20%, transparent 40%, rgba(5,5,8,0.75) 85%)'
              : 'radial-gradient(ellipse at 50% 20%, transparent 40%, rgba(5,7,14,0.85) 85%)'
          }}
        />
      </div>

      {/* ── 2. Minimalist Clear Chat Bar (Subtle, blends seamlessly with dark theme) ── */}
      {messages.length > 0 && (
        <div className="shrink-0 z-20 w-full max-w-5xl mx-auto px-4 sm:px-8 pt-3 pb-1 flex justify-end">
          <button
            onClick={handleClear}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/40 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/15 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            title={`Clear ${isMovieMode ? 'cinema' : 'music'} chat (taste memory remains preserved)`}
          >
            <Trash2 className="w-3.5 h-3.5 text-white/30 group-hover:text-red-400 transition-colors" />
            <span>Clear chat</span>
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          CHAT MESSAGES SCROLL VIEW
          ══════════════════════════════════════════ */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 w-full max-w-5xl mx-auto px-4 sm:px-8 py-4 space-y-6 overflow-y-auto z-10 flex flex-col"
      >
        {/* Welcome Empty State */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center justify-center text-center py-4 space-y-5 my-auto"
          >
            {/* Assistant Hero Avatar */}
            <div className="relative group">
              <div
                className={`w-20 h-20 rounded-2xl overflow-hidden shadow-2xl relative border-2 transition-transform duration-300 group-hover:scale-105 ${
                  isMovieMode
                    ? 'border-red-500/50 shadow-red-950/60 ring-2 ring-red-500/20 bg-[#120D1A]'
                    : 'border-blue-500/50 shadow-blue-950/60 ring-2 ring-blue-500/20 bg-[#060C1B]'
                }`}
              >
                <img
                  src={botAvatar}
                  alt={botName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/agent-avatar.jpg';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={`absolute -inset-1.5 rounded-2xl blur-md -z-10 opacity-50 ${
                  isMovieMode ? 'bg-[#E50914]/40' : 'bg-[#0070F3]/40'
                }`}
              />
            </div>

            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isMovieMode ? 'What movie are you craving today?' : 'What soundtrack fits your mood?'}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                {isMovieMode
                  ? `I'm ${botName}, with direct real-time intelligence over thousands of movies. Ask me to suggest romance, horror, comedy, films like Inception, or what was predicted for your taste.`
                  : `I'm ${botName}, connected to thousands of studio tracks and cinematic scores. Ask for genres, artist recommendations, or songs like your favorites.`}
              </p>
            </div>

            {/* Quick Starter Suggestion Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 max-w-lg">
              {(isMovieMode
                ? [
                    'Suggest romantic movies',
                    'Movies like Inception',
                    'Top rated thrillers',
                    'Who directed Interstellar?'
                  ]
                : [
                    'Suggest romantic songs',
                    'Top trending global hits',
                    'Chill lo-fi study beats',
                    'Songs by Arijit Singh'
                  ]
              ).map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSendMessage(chip)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer font-medium ${
                    isMovieMode
                      ? 'border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/25 hover:border-red-400 shadow-sm'
                      : 'border-blue-500/30 bg-blue-500/10 text-cyan-200 hover:bg-blue-500/25 hover:border-cyan-400 shadow-sm'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Conversation Message Feed */}
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          return (
            <motion.div
              key={message.id || index}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}
            >
              {/* Message Bubble Container */}
              <div className={`max-w-[95%] sm:max-w-4xl flex gap-2 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div
                    className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-md mt-1 border ${
                      isMovieMode
                        ? 'border-red-500/40 shadow-red-950/50'
                        : 'border-blue-500/40 shadow-blue-950/50'
                    }`}
                  >
                    <img
                      src={botAvatar}
                      alt={botName}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/agent-avatar.jpg';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-col space-y-2 min-w-0">
                  {/* Sender Header */}
                  <div className={`flex items-center gap-2 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span className="font-semibold text-gray-300">
                      {isUser ? 'You' : botName}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Bubble Content */}
                  <div
                    className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-lg ${
                      isUser
                        ? 'bg-gradient-to-r from-[#1C162E] to-[#251A3A] border border-purple-500/20 text-white self-end rounded-tr-xs'
                        : isMovieMode
                        ? 'bg-[#0B060C]/90 border border-red-500/25 text-gray-100 rounded-tl-xs backdrop-blur-md shadow-black/80'
                        : 'bg-[#060B18]/90 border border-blue-500/25 text-gray-100 rounded-tl-xs backdrop-blur-md shadow-black/80'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                      {renderFormattedMessage(message.content)}
                      {message.isStreaming && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className={`inline-block w-1.5 h-4 ml-1 rounded-sm align-middle ${
                            isMovieMode ? 'bg-[#E50914]' : 'bg-cyan-400'
                          }`}
                        />
                      )}

                      {/* Quick Interactive Switcher when user asks about the other medium */}
                      {!isUser && message.content.includes('switch to **Music mode**') && (
                        <div className="pt-2">
                          <button
                            onClick={() => setMode('music')}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-900/50 transition-all hover:scale-105 cursor-pointer"
                          >
                            <Music2 className="w-4 h-4" />
                            <span>Switch to Music Mode</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                          </button>
                        </div>
                      )}

                      {!isUser && message.content.includes('switch to **Cinema mode**') && (
                        <div className="pt-2">
                          <button
                            onClick={() => setMode('movies')}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E50914] to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/60 transition-all hover:scale-105 cursor-pointer"
                          >
                            <Film className="w-4 h-4" />
                            <span>Switch to Cinema Mode</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ══════════════════════════════════════════
                      ENTIRE SCREEN FULL MOVIE RECOMMENDATION CARDS
                      Name, Poster, Description, Watch/Redirect Link
                      (STRICTLY CINEMA MODE ONLY)
                      ══════════════════════════════════════════ */}
                  {isMovieMode && message.movies && message.movies.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full pt-3"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-[#E50914]" />
                        <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                          Recommended Cinema Titles ({message.movies.length})
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                        {message.movies.map((movie: Movie) => {
                          const isLiked = !!likedIds[String(movie.id)];
                          const posterSrc = movie.poster_path || FALLBACK_POSTER;

                          return (
                            <div
                              key={movie.id}
                              className="group relative flex flex-col rounded-2xl bg-[#0F0814]/95 border border-red-500/25 hover:border-[#E50914] transition-all duration-300 overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(229,9,20,0.25)] flex-1"
                            >
                              {/* 1. MOVIE POSTER & TOP BADGES */}
                              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-black/60">
                                <img
                                  src={posterSrc}
                                  alt={movie.title}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = FALLBACK_POSTER;
                                  }}
                                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0814] via-transparent to-black/40" />

                                {/* Rating & Year Pill */}
                                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                                  <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-bold text-yellow-400 flex items-center gap-1">
                                    ★ {movie.vote_average ? movie.vote_average.toFixed(1) : '8.2'}
                                  </span>
                                  {movie.year && (
                                    <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-gray-300">
                                      {movie.year}
                                    </span>
                                  )}
                                </div>

                                {/* Like Bookmark Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    triggerLikeBurst(e.clientX, e.clientY, 'movies');
                                    toggleLike(movie);
                                  }}
                                  className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 cursor-pointer ${
                                    isLiked
                                      ? 'bg-[#E50914] text-white shadow-lg shadow-red-900/60'
                                      : 'bg-black/60 text-gray-300 hover:text-white hover:bg-black/80 border border-white/20'
                                  }`}
                                  title={isLiked ? 'Saved to My Zhoosh' : 'Add to My Zhoosh'}
                                >
                                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                                </button>
                              </div>

                              {/* 2. MOVIE DETAILS: Name, Director, Genres, Description */}
                              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                <div className="space-y-1.5">
                                  {/* Title / Name */}
                                  <h4 className="text-base font-extrabold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                                    {movie.title}
                                  </h4>

                                  {/* Director & Genres */}
                                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
                                    {movie.director && (
                                      <span className="text-gray-300 font-medium truncate">
                                        Dir: {movie.director}
                                      </span>
                                    )}
                                    {movie.genres && movie.genres.length > 0 && (
                                      <span className="text-red-400/90 font-medium">
                                        • {movie.genres.slice(0, 2).join(', ')}
                                      </span>
                                    )}
                                  </div>

                                  {/* Description / Synopsis */}
                                  <p className="text-xs text-gray-300/90 line-clamp-3 leading-relaxed pt-1">
                                    {movie.overview || 'A captivating cinematic journey with breathtaking performances and stunning visuals.'}
                                  </p>
                                </div>

                                {/* 3. REDIRECT / WATCH LINK BUTTON */}
                                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                                  <button
                                    onClick={() => openMovieModal(movie)}
                                    className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#B80010] hover:from-[#FF1E56] hover:to-[#D1001A] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-red-950/60 hover:shadow-red-800/40 transition-all cursor-pointer group/btn"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    <span>Watch / View Movie</span>
                                    <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                  </button>

                                  <button
                                    onClick={() => openMovieModal(movie)}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                                    title="More Information & Trailer"
                                  >
                                    <Info className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* ══════════════════════════════════════════
                      MUSIC MODE TRACK RECOMMENDATION CARDS
                      (STRICTLY MUSIC MODE ONLY)
                      ══════════════════════════════════════════ */}
                  {!isMovieMode && message.songs && message.songs.length > 0 && (() => {
                    const seen = new Set<string>();
                    const uniqueSongs = message.songs.filter((s: Song) => {
                      const key = s.title.toLowerCase().trim();
                      if (seen.has(key)) return false;
                      seen.add(key);
                      return true;
                    });

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full pt-4"
                      >
                        <div className="flex items-center justify-between gap-2 mb-3.5 px-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center border border-blue-400/30">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wider uppercase">
                              Recommended Tracks ({uniqueSongs.length})
                            </h3>
                          </div>
                          <span className="text-[11px] text-cyan-400/70 font-medium tracking-wide">
                            Lossless Hi-Fi Audio
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                          {uniqueSongs.map((song: Song) => (
                            <AgentRecommendedSongCard key={song.id} song={song} />
                          ))}
                        </div>
                      </motion.div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs animate-pulse ${
                isMovieMode ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-cyan-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>{botName} is scouring catalog for the best recommendations...</span>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* ══════════════════════════════════════════
          DOCKED BOTTOM INPUT BAR
          ══════════════════════════════════════════ */}
      <div className="shrink-0 z-30 w-full px-3 sm:px-8 py-2.5 sm:py-3 bg-[#07070b]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Main Input Pill */}
          <div
            className={`relative flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#0F0B18] border-2 transition-all duration-200 shadow-xl ${
              isMovieMode
                ? 'border-white/20 focus-within:border-[#E50914] focus-within:shadow-[0_0_25px_rgba(229,9,20,0.35)] ring-1 ring-white/5'
                : 'border-white/20 focus-within:border-[#0070F3] focus-within:shadow-[0_0_25px_rgba(0,112,243,0.35)] ring-1 ring-white/5'
            }`}
          >
            {/* Voice Search Integration */}
            <button
              onClick={() => openVoiceSearch()}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Speak with Voice"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Input Field */}
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isMovieMode
                  ? "Type your message to Nova here... e.g. 'Recommend dark thrillers', 'films like Inception'..."
                  : "Type your message to SonicBot here... e.g. 'Chill lo-fi study tracks', 'songs like Blinding Lights'..."
              }
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-gray-400 resize-none focus:outline-none max-h-32 py-1 leading-relaxed"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || isThinking}
              className={`p-2.5 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                input.trim() && !isThinking
                  ? isMovieMode
                    ? 'bg-[#E50914] text-white shadow-lg shadow-red-950/60 hover:bg-[#FF1E56] scale-105'
                    : 'bg-[#0070F3] hover:bg-blue-600 text-white shadow-lg shadow-blue-600/50 hover:brightness-110 scale-105'
                  : 'bg-white/5 text-gray-600 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to format bold markdown and numbered lists cleanly
function renderFormattedMessage(text: string) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (!line.trim()) return <br key={idx} />;

    // Numbered item
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={idx} className="flex items-start gap-2 my-1">
          <span className="text-[#E50914] font-bold text-xs shrink-0 mt-0.5">{numMatch[1]}.</span>
          <div>{renderInline(numMatch[2])}</div>
        </div>
      );
    }

    // Bullet item
    const bulletMatch = line.match(/^[•·-]\s+(.*)/);
    if (bulletMatch) {
      return (
        <div key={idx} className="flex items-start gap-2 my-0.5">
          <span className="text-red-400 font-bold shrink-0">•</span>
          <div>{renderInline(bulletMatch[1])}</div>
        </div>
      );
    }

    return <p key={idx}>{renderInline(line)}</p>;
  });
}

function renderInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-extrabold text-white">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
