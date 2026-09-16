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
  Check
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAgentStore } from '@/store/useAgentStore';
import { api } from '@/api/client';
import { Movie, Song } from '@/types';
import { FadedGridBackdrop } from '../common/FadedGridBackdrop';
import { triggerLikeBurst } from '@/utils/confetti';

// Fallback high-res poster image for movies if image URL fails
const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80';

export const AIChatView: React.FC = () => {
  const {
    mode,
    setMode,
    openMovieModal,
    playTrack,
    likedIds,
    toggleLike,
    openVoiceSearch,
    addToast
  } = useAppStore();

  const {
    profile,
    messages,
    isThinking,
    addMessage,
    updateLastAgentMessage,
    attachMoviesToLastMessage,
    attachSongsToLastMessage,
    setThinking,
    clearHistory,
    loadFromStorage
  } = useAgentStore();

  const shouldReduceMotion = useReducedMotion();
  const [input, setInput] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<boolean>(false);

  const isMovieMode = mode === 'movies';
  const botName = profile?.name || (isMovieMode ? 'Nova' : 'SonicBot');
  const botAvatar = profile?.avatarUrl || '/agent-avatar.jpg';

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Lock window/body scroll on mount so top navbar never hides or overlaps
  useEffect(() => {
    window.scrollTo(0, 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

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

    // Add user message
    addMessage({ role: 'user', content: query });

    // Add placeholder streaming agent message
    addMessage({ role: 'agent', content: '', isStreaming: true });

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
          updateLastAgentMessage(accumulated, false);
        },
        (_intent) => {
          if (abortRef.current) return;
          updateLastAgentMessage(accumulated, true);
          setThinking(false);
        },
        () => {
          updateLastAgentMessage('Sorry, I ran into an issue connecting. Please try again.', true);
          setThinking(false);
        },
        (movies) => {
          if (abortRef.current) return;
          attachMoviesToLastMessage(movies);
        },
        (songs) => {
          if (abortRef.current) return;
          attachSongsToLastMessage(songs);
        }
      );
    } catch {
      updateLastAgentMessage('I had a brief glitch retrieving that recommendation. Please try asking again!', true);
      setThinking(false);
    }
  }, [addMessage, botName, isThinking, messages, setThinking, updateLastAgentMessage, attachMoviesToLastMessage, attachSongsToLastMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const handleClear = () => {
    clearHistory();
    setShowClearConfirm(false);
    addToast({
      title: 'Chat History Cleared',
      description: 'Conversation context reset for a fresh start.',
      type: 'info'
    });
  };

  return (
    <div className="relative h-full flex-1 w-full flex flex-col justify-between overflow-hidden bg-[#07070b]">
      {/* ── 1. Signature Black & Red Faded Grid Layer (Matching MoviesView & Other Pages) ── */}
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
                  linear-gradient(to right, rgba(16, 185, 129, 0.14) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(16, 185, 129, 0.14) 1px, transparent 1px)
                `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Ambient Aura Glows (Matching MoviesView) */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-[1200px] h-[450px] rounded-full blur-[120px] pointer-events-none ${
            isMovieMode ? 'bg-[#E50914]/15' : 'bg-[#10B981]/15'
          }`}
        />
        <div
          className={`absolute top-[35%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none ${
            isMovieMode ? 'bg-[#B81D24]/12' : 'bg-[#0D9488]/12'
          }`}
        />
        <div
          className={`absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none ${
            isMovieMode ? 'bg-[#E50914]/10' : 'bg-[#10B981]/10'
          }`}
        />

        {/* Soft Radial Vignette Framing */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 20%, transparent 40%, rgba(5,5,8,0.75) 85%)'
          }}
        />
      </div>

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
                className={`w-20 h-20 rounded-2xl overflow-hidden shadow-2xl relative border-2 transition-transform duration-300 group-hover:scale-105 bg-[#120D1A] ${
                  isMovieMode
                    ? 'border-red-500/50 shadow-red-950/60 ring-2 ring-red-500/20'
                    : 'border-emerald-500/50 shadow-emerald-950/60 ring-2 ring-emerald-500/20'
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
                  isMovieMode ? 'bg-[#E50914]/40' : 'bg-emerald-500/40'
                }`}
              />
            </div>

            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isMovieMode ? 'What movie are you craving today?' : 'What soundtrack fits your mood?'}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                {isMovieMode
                  ? `I'm ${botName}, with direct real-time intelligence over thousands of movies. Ask me to suggest horror, comedy, films like Inception, or what was predicted for your taste.`
                  : `I'm ${botName}, connected to thousands of studio tracks and cinematic scores. Ask for genres, artist recommendations, or songs like your favorites.`}
              </p>
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
              <div className={`max-w-full sm:max-w-4xl flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div
                    className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-md mt-1 border ${
                      isMovieMode
                        ? 'border-red-500/40 shadow-red-950/50'
                        : 'border-emerald-500/40 shadow-emerald-950/50'
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
                        : 'bg-[#060D0C]/90 border border-emerald-500/25 text-gray-100 rounded-tl-xs backdrop-blur-md shadow-black/80'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                      {renderFormattedMessage(message.content)}
                      {message.isStreaming && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className={`inline-block w-1.5 h-4 ml-1 rounded-sm align-middle ${
                            isMovieMode ? 'bg-[#E50914]' : 'bg-emerald-400'
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  {/* ══════════════════════════════════════════
                      ENTIRE SCREEN FULL MOVIE RECOMMENDATION CARDS
                      Name, Poster, Description, Watch/Redirect Link
                      ══════════════════════════════════════════ */}
                  {message.movies && message.movies.length > 0 && (
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
                      ══════════════════════════════════════════ */}
                  {message.songs && message.songs.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full pt-3"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                          Recommended Tracks ({message.songs.length})
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                        {message.songs.map((song: Song) => (
                          <div
                            key={song.id}
                            onClick={() => playTrack(song)}
                            className="group flex items-center gap-3 p-2.5 rounded-xl bg-[#091412]/95 border border-emerald-500/25 hover:border-emerald-500 hover:bg-emerald-950/20 transition-all cursor-pointer shadow-lg"
                          >
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-black/60">
                              <img
                                src={song.album_art}
                                alt={song.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="w-4 h-4 text-white fill-current" />
                              </div>
                            </div>

                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-xs font-bold text-white truncate group-hover:text-emerald-300">
                                {song.title}
                              </span>
                              <span className="text-[11px] text-gray-400 truncate">
                                {song.artist}
                              </span>
                              <span className="text-[10px] text-emerald-400/80 mt-0.5">
                                {song.genre}
                              </span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playTrack(song);
                              }}
                              className="p-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white transition-all cursor-pointer"
                              title="Play Track"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
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
                isMovieMode ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
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
      <div className="shrink-0 z-30 w-full px-4 sm:px-8 py-3 bg-[#07070b]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Main Input Pill */}
          <div
            className={`relative flex items-center gap-2 p-2 rounded-2xl bg-[#0C0814]/90 border transition-all duration-200 shadow-inner ${
              isMovieMode
                ? 'border-white/15 focus-within:border-red-500/70 focus-within:shadow-[0_0_25px_rgba(229,9,20,0.25)]'
                : 'border-white/15 focus-within:border-emerald-500/70 focus-within:shadow-[0_0_25px_rgba(16,185,129,0.25)]'
            }`}
          >
            {/* Voice Search Integration */}
            <button
              onClick={() => openVoiceSearch()}
              className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer shrink-0"
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
                  ? "Ask anything... 'Suggest horror movies', 'movies like Inception', 'who directed Interstellar'..."
                  : "Ask anything... 'Suggest chill songs', 'tracks like Blinding Lights', 'synthwave vibes'..."
              }
              className="w-full bg-transparent text-sm text-white placeholder-gray-500 resize-none focus:outline-none max-h-32 py-1 leading-relaxed"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || isThinking}
              className={`p-2.5 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                input.trim() && !isThinking
                  ? isMovieMode
                    ? 'bg-[#E50914] text-white shadow-lg shadow-red-950/60 hover:bg-[#FF1E56]'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-950/60 hover:brightness-110'
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
