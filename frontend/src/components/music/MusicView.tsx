import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Plus,
  ChevronLeft,
  ChevronRight,
  Disc3,
  Flame,
  Radio,
  Clock,
  Sparkles,
  Music2,
  Check,
  X
} from 'lucide-react';
import { useMusic, useLikeMutation } from '@/api/hooks';
import { useAppStore } from '@/store/useAppStore';
import { triggerLikeBurst } from '@/utils/confetti';
import { synthEngine } from '@/utils/audioSynth';
import { SkeletonCard } from '../cards/SkeletonCard';
import type { Song } from '@/types';

// ─── HERO SHOWCASE TRACKS ──────────────────────────────────────────────────
interface HeroMusicShowcaseItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  genres: string[];
  year: number;
  durationStr: string;
  streamsStr: string;
  tagline: string;
  overview: string;
  backdropUrl: string;
  coverArtUrl: string;
  genreVibe: string;
  audioPreviewGenre: string;
  badgeLabel?: string;
}

const HERO_MUSIC_SHOWCASE: HeroMusicShowcaseItem[] = [
  {
    id: 'hero-blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    genres: ['Synthpop', 'Trending', 'Electronic'],
    year: 2020,
    durationStr: '3m 20s',
    streamsStr: '4.1 Billion Streams',
    tagline: 'CAN\'T SLEEP UNTIL I FEEL YOUR TOUCH',
    overview: 'The all-time greatest Billboard Hot 100 hit in history. Fueled by intoxicating 1980s analog synthesizers and heart-racing synthwave drums.',
    backdropUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/6f/bc/e6/6fbce6c4-c38c-72d8-4fd0-66cfff32f679/20UMGIM12176.rgb.jpg/600x600bb.jpg',
    coverArtUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/6f/bc/e6/6fbce6c4-c38c-72d8-4fd0-66cfff32f679/20UMGIM12176.rgb.jpg/600x600bb.jpg',
    genreVibe: 'Neo-Noir Synthwave',
    audioPreviewGenre: 'Electronic',
    badgeLabel: '#1 All-Time Streaming Giant'
  },
  {
    id: 'hero-beautiful-things',
    title: 'Beautiful Things',
    artist: 'Benson Boone',
    album: 'Fireworks & Rollerblades',
    genres: ['Alternative Rock', 'Pop Rock', 'Trending'],
    year: 2024,
    durationStr: '3m 00s',
    streamsStr: '1.4 Billion Streams',
    tagline: 'PLEASE STAY, I WANT YOU, I NEED YOU, OH GOD',
    overview: 'A volcanic explosive rock ballad. Starting as an intimate acoustic confession before detonating into raw arena-sized vocal power.',
    backdropUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/54/f4/92/54f49210-e260-b519-ebbd-f4f40ee710cd/054391342751.jpg/600x600bb.jpg',
    coverArtUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/54/f4/92/54f49210-e260-b519-ebbd-f4f40ee710cd/054391342751.jpg/600x600bb.jpg',
    genreVibe: 'Explosive Arena Rock',
    audioPreviewGenre: 'Rock',
    badgeLabel: 'Global Sensation'
  },
  {
    id: 'hero-perfect',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    genres: ['Romantic', 'Pop', 'Acoustic'],
    year: 2017,
    durationStr: '4m 23s',
    streamsStr: '2.9 Billion Streams',
    tagline: 'DARLING, YOU LOOK PERFECT TONIGHT',
    overview: 'A timeless acoustic waltz masterpiece written for his wife Cherry Seaborn. Celebrating unconditional love with soaring orchestral strings and tender vocals.',
    backdropUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg',
    coverArtUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg',
    genreVibe: 'Timeless Romantic Waltz',
    audioPreviewGenre: 'Romantic',
    badgeLabel: '#1 Global Wedding Anthem'
  },
  {
    id: 'hero-cornfield',
    title: 'Cornfield Chase',
    artist: 'Hans Zimmer',
    album: 'Interstellar (Original Motion Picture Soundtrack)',
    genres: ['Soundtrack', 'Classical', 'Epic Cinema'],
    year: 2014,
    durationStr: '2m 07s',
    streamsStr: '284 Million Streams',
    tagline: 'LOVE IS THE ONE THING THAT TRANSCENDS TIME AND SPACE',
    overview: 'Recorded on the 1926 Harrison & Harrison pipe organ at Temple Church in London. A sweeping, celestial crescendo of cosmic wonder.',
    backdropUrl: 'https://image.tmdb.org/t/p/original/rAiYTsqJiOuvnRzr5kpXy63WlHn.jpg',
    coverArtUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f4/5b/73/f45b735a-8d7a-9713-b217-0f8e1593c28b/794043201943.jpg/600x600bb.jpg',
    genreVibe: 'Cinematic Pipe Organ Masterpiece',
    audioPreviewGenre: 'Classical',
    badgeLabel: 'Oscar Nominated Score'
  },
  {
    id: 'hero-starboy',
    title: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    album: 'Starboy',
    genres: ['Synthpop', 'R&B', 'Electropop'],
    year: 2016,
    durationStr: '3m 50s',
    streamsStr: '2.9 Billion Streams',
    tagline: 'LOOK WHAT YOU\'VE DONE, I\'M A MOTHERF***IN\' STARBOY',
    overview: 'The iconic collision of French electronic royalty Daft Punk and Abel Tesfaye\'s razor-sharp pop sensibilities. Punchy kicks and vocoder harmonies.',
    backdropUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/600x600bb.jpg',
    coverArtUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/600x600bb.jpg',
    genreVibe: 'Electro Funk & R&B',
    audioPreviewGenre: 'Electronic',
    badgeLabel: 'Diamond Certified'
  },
  {
    id: 'hero-lover',
    title: 'Lover',
    artist: 'Diljit Dosanjh',
    album: 'MoonChild Era',
    genres: ['Punjabi Pop', 'Dance', 'Trending'],
    year: 2021,
    durationStr: '3m 18s',
    streamsStr: '310 Million Streams',
    tagline: 'TERA NI TERA LOVER',
    overview: 'The unstoppable Punjabi pop anthem that crossed all borders. Featuring infectious upbeat synth lines, modern bass kicks, and Diljit\'s vibrant vocals.',
    backdropUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8a/89/e4/8a89e445-d2c6-f8ac-a828-27818b0c1afe/859749638209_cover.jpg/600x600bb.jpg',
    coverArtUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8a/89/e4/8a89e445-d2c6-f8ac-a828-27818b0c1afe/859749638209_cover.jpg/600x600bb.jpg',
    genreVibe: 'Modern Punjabi Pop',
    audioPreviewGenre: 'Pop',
    badgeLabel: 'Global Punjabi Hit'
  }
];

// ─── HERO MUSIC BILLBOARD COMPONENT ─────────────────────────────────────────
const HeroMusicBillboard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const { currentTrack, isPlaying, playTrack, togglePlay, likedIds, openPopover, addToast } = useAppStore();
  const likeMutation = useLikeMutation();

  const current = HERO_MUSIC_SHOWCASE[currentIndex];
  const isLiked = !!likedIds[String(current.id)];

  // Auto-advance every 8 seconds when not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_MUSIC_SHOWCASE.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % HERO_MUSIC_SHOWCASE.length);
  const handlePrev = () =>
    setCurrentIndex((prev) => (prev - 1 + HERO_MUSIC_SHOWCASE.length) % HERO_MUSIC_SHOWCASE.length);

  const toggleSound = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (!next) {
        synthEngine.playTrackPreview(current.audioPreviewGenre);
      } else {
        synthEngine.stop();
      }
      return next;
    });
  };

  const handlePlayHero = () => {
    const songObj: Song = {
      id: current.id,
      title: current.title,
      artist: current.artist,
      album: current.album,
      album_art: current.coverArtUrl,
      duration_sec: 210,
      genre: current.genres[0],
      language: 'English',
      plays: current.streamsStr,
      match_score: 99
    };
    playTrack(songObj);
    synthEngine.playTrackPreview(current.audioPreviewGenre);
    addToast({
      title: `Playing "${current.title}"`,
      description: `${current.artist} · Spatial Audio with Dolby Atmos`,
      type: 'info'
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerLikeBurst(e.clientX, e.clientY, 'music');
    const songObj: Song = {
      id: current.id,
      title: current.title,
      artist: current.artist,
      album: current.album,
      album_art: current.coverArtUrl,
      duration_sec: 210,
      genre: current.genres[0],
      language: 'English',
      plays: current.streamsStr,
      match_score: 99
    };
    likeMutation.mutate({ item: songObj, mode: 'music' });
  };

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const songObj: Song = {
      id: current.id,
      title: current.title,
      artist: current.artist,
      album: current.album,
      album_art: current.coverArtUrl,
      duration_sec: 210,
      genre: current.genres[0],
      language: 'English',
      plays: current.streamsStr,
      match_score: 99
    };
    openPopover(songObj, e.currentTarget.getBoundingClientRect());
  };

  return (
    <div className="w-full px-2 sm:px-6 md:px-8 pt-2 sm:pt-4 pb-4 sm:pb-6">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full h-[62vh] sm:h-[78vh] min-h-[440px] max-h-[720px] rounded-2xl sm:rounded-3xl overflow-hidden border border-blue-500/20 shadow-[0_0_50px_rgba(0,112,243,0.2)] select-none bg-[#05070E]"
      >
        {/* Background Image Carousel with Cross-Fade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0 overflow-hidden"
          >
            {/* Ambient Blurred Colored Halo from the Song's Real Album Art */}
            <img
              src={current.coverArtUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover filter blur-3xl scale-125 opacity-40 select-none pointer-events-none"
            />
            {/* Main Authentic Atmospheric Layer */}
            <img
              src={current.backdropUrl || current.coverArtUrl}
              alt={current.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = current.coverArtUrl;
              }}
              className="w-full h-full object-cover object-center opacity-85"
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Electric Blue Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070E] via-[#05070E]/65 via-35% to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070E] via-[#05070E]/30 via-25% to-transparent pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#05070E]/50 to-transparent pointer-events-none" />

        {/* Ambient Electric Blue Aura Flare */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#0070F3]/25 blur-[120px] pointer-events-none" />

        {/* TOP-RIGHT: Speaker Audio Toggle Button */}
        <button
          onClick={toggleSound}
          className="absolute right-5 sm:right-7 top-5 sm:top-7 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 border border-blue-400/30 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg cursor-pointer"
          title={isMuted ? 'Unmute preview audio' : 'Mute preview audio'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-gray-300" />
          ) : (
            <Volume2 className="w-5 h-5 text-cyan-400 animate-pulse" />
          )}
        </button>

        {/* Left/Right Carousel Chevrons on Hover (Desktop only) */}
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 border border-blue-400/30 text-white items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
          title="Previous Track"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 border border-blue-400/30 text-white items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
          title="Next Track"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Content Container (Bottom-Left) */}
        <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-12 max-w-[90%] sm:max-w-[55%] md:max-w-[52%] lg:max-w-[56%] z-20">
          {/* Mobile Album Art Preview Badge */}
          <div className="flex sm:hidden items-center gap-3.5 mb-3">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl shrink-0 bg-black/60 aspect-square">
              <img src={current.coverArtUrl} alt={current.title} className="w-full h-full object-cover aspect-square" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{current.title}</h3>
              <p className="text-xs text-gray-300 truncate font-semibold mt-0.5">{current.album}</p>
            </div>
          </div>

          {/* Big Stylized Music Typography */}
          <h1 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-white uppercase drop-shadow-[0_4px_30px_rgba(0,112,243,0.5)] leading-tight select-none">
            {current.title}
          </h1>

          {/* Artist & Tagline */}
          <div className="flex items-center gap-2 mt-1 mb-2">
            <span className="text-base sm:text-xl font-bold text-cyan-300 drop-shadow">
              {current.artist}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-xs sm:text-sm text-gray-300 italic truncate">
              "{current.tagline}"
            </span>
          </div>

          {/* Metadata Line */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-gray-300 mb-4 drop-shadow">
            <span>{current.album}</span>
            <span className="text-gray-500">•</span>
            <span>{current.year}</span>
            <span className="text-gray-500">•</span>
            <span>{current.durationStr}</span>
            <span className="text-gray-500">•</span>
            <span className="text-cyan-400 font-mono">{current.streamsStr}</span>
          </div>

          {/* Action Buttons & Badges */}
          <div className="flex items-center flex-wrap gap-3">
            {/* Play Pill */}
            <button
              onClick={handlePlayHero}
              className="flex items-center gap-2 px-6 sm:px-8 py-2.5 rounded-full bg-white hover:bg-white/90 text-black font-extrabold text-sm sm:text-base shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer shadow-blue-500/20"
            >
              <Play className="w-4 h-4 fill-black ml-0.5" />
              Play
            </button>

            {/* Add to Playlist Pill */}
            <button
              onClick={handleAddToPlaylist}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600/25 hover:bg-blue-600/40 text-white font-bold text-sm sm:text-base backdrop-blur-md transition-all duration-200 border border-blue-400/40 cursor-pointer hover:border-blue-400"
            >
              <Plus className="w-4 h-4 text-cyan-300" />
              Playlist
            </button>

            {/* Like Toggle */}
            <button
              onClick={handleLike}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isLiked
                  ? 'border-[#0070F3] bg-[#0070F3] text-white shadow-lg shadow-blue-500/50 scale-105'
                  : 'border-white/30 hover:border-blue-400 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md'
              }`}
              title={isLiked ? 'Remove from Liked Songs' : 'Like Track'}
            >
              {isLiked ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : (
                <Heart className="w-4 h-4 hover:fill-current transition-colors" />
              )}
            </button>

            {/* Badges beside buttons on medium screens */}
            <div className="hidden lg:flex items-center gap-2 ml-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-blue-400/20 text-xs font-semibold text-white shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Dolby Atmos</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-blue-400/20 text-xs font-semibold text-white shadow-lg">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{current.badgeLabel || 'Global Hit'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Authentic Floating 3D Official Album Art Poster with Vinyl - Fully Visible & Unclipped */}
        <div className="absolute right-6 sm:right-10 md:right-14 lg:right-16 top-1/2 -translate-y-1/2 hidden sm:flex items-center select-none z-20 pointer-events-none">
          <motion.div
            key={`album-showcase-${current.id}`}
            initial={{ opacity: 0, scale: 0.92, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative flex items-center justify-center group pointer-events-auto"
          >
            {/* Spinning Vinyl Record Disc peeking out behind sleeve */}
            <motion.div
              animate={{ rotate: isPlaying && currentTrack?.id === current.id ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
              className="absolute -right-6 md:-right-8 lg:-right-10 w-36 h-36 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full bg-[#111] border-4 border-[#222] shadow-2xl items-center justify-center -z-10 hidden md:flex select-none"
            >
              {/* Vinyl Grooves rings */}
              <div className="w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full border border-white/10 flex items-center justify-center">
                <div className="w-18 h-18 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full border border-white/10 flex items-center justify-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full border-2 border-white/20 bg-[#0070F3]/30 overflow-hidden">
                    <img src={current.coverArtUrl} alt="" className="w-full h-full object-cover opacity-80" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Ambient Aura matching the track's color */}
            <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-70 bg-gradient-to-tr from-blue-600/40 via-cyan-500/25 to-purple-600/30 -z-10" />

            {/* Official Album Art Poster Card - 100% Fully Visible, Square, Unclipped */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 lg:w-72 lg:h-72 aspect-square rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(0,112,243,0.35)] bg-[#0d0f18] transition-transform duration-300 hover:scale-[1.03]">
              <img
                src={current.coverArtUrl}
                alt={current.title}
                className="w-full h-full object-cover aspect-square"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = current.coverArtUrl;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none" />
            </div>
          </motion.div>
        </div>

        {/* Carousel Slide Indicators */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {HERO_MUSIC_SHOWCASE.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? 'w-7 h-1.5 bg-[#0070F3] shadow-[0_0_8px_#0070F3]'
                  : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
              }`}
              title={item.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── TOP 10 SONGS TODAY (Signature Numbered Shelf with Song Titles & Blue Glows) ───
const Top10SongCard: React.FC<{ song: Song; rank: number }> = ({ song, rank }) => {
  const { currentTrack, isPlaying, playTrack, likedIds, openPopover } = useAppStore();
  const isLiked = !!likedIds[String(song.id)];
  const isThisCurrent = currentTrack?.id === song.id;
  const likeMutation = useLikeMutation();

  const handlePlay = () => {
    playTrack(song);
    synthEngine.playTrackPreview(song.genre);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerLikeBurst(e.clientX, e.clientY, 'music');
    likeMutation.mutate({ item: song, mode: 'music' });
  };

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPopover(song, e.currentTarget.getBoundingClientRect());
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, zIndex: 30 }}
      transition={{ duration: 0.2 }}
      className="relative flex-shrink-0 flex items-start cursor-pointer group/card select-none"
    >
      {/* Signature Giant Rank Number */}
      <div className="w-12 sm:w-24 flex items-center justify-center flex-shrink-0 z-0 select-none pt-2 sm:pt-6">
        <span className="text-6xl sm:text-9xl font-black music-rank-number tracking-tighter">
          {rank}
        </span>
      </div>

      {/* Album Art Card + Visible Song Name and Artist */}
      <div className="-ml-5 sm:-ml-10 relative flex flex-col w-[125px] sm:w-[175px] md:w-[195px] z-10">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-[#0A1020] shadow-2xl border border-blue-500/20 group-hover/card:border-blue-400 group-hover/card:shadow-[0_0_20px_rgba(0,112,243,0.35)] transition-all">
          <img
            src={song.album_art}
            alt={song.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Live Audio Equalizer Indicator */}
          {isThisCurrent && isPlaying && (
            <div className="absolute top-2 left-2 z-20 flex items-end gap-1 p-1 rounded bg-black/70 backdrop-blur-md border border-cyan-400/50">
              <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" />
              <span className="w-1 h-5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          {/* Hover Overlay with Action Buttons */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070E] via-[#05070E]/50 to-transparent p-3 flex flex-col justify-end opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlay}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow hover:scale-105 transition-transform cursor-pointer"
                title="Play"
              >
                <Play className="w-4 h-4 fill-black ml-0.5" />
              </button>
              <button
                onClick={handleAddToPlaylist}
                className="w-8 h-8 rounded-full bg-black/60 border border-white/50 text-white flex items-center justify-center hover:border-blue-400 transition-colors cursor-pointer"
                title="Add to Playlist"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={handleLike}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                  isLiked
                    ? 'bg-[#0070F3] border-[#0070F3] text-white'
                    : 'border-white/50 bg-black/60 text-white hover:border-white'
                }`}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Visible Song Name & Artist */}
        <div className="mt-2.5 px-0.5 space-y-0.5" onClick={handlePlay}>
          <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover/card:text-cyan-300 transition-colors">
            {song.title}
          </h4>
          <p className="text-[11px] sm:text-xs text-gray-400 truncate group-hover/card:text-gray-300 transition-colors">
            {song.artist}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const Top10MusicShelf: React.FC<{ songs: Song[] }> = ({ songs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 800 : -800, behavior: 'smooth' });
  };

  const top10List = useMemo(() => songs.slice(0, 10), [songs]);
  if (!top10List.length) return null;

  return (
    <div className="group/shelf mb-10">
      <div className="flex items-center gap-2.5 px-6 sm:px-12 mb-3">
        <Flame className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Top 10 Tracks Today
        </h2>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-0 bottom-0 z-20 w-12 items-center justify-center bg-gradient-to-r from-[#05070E] to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto no-scrollbar px-3 sm:px-12 pb-2 scroll-smooth"
        >
          {top10List.map((song, idx) => (
            <Top10SongCard key={song.id} song={song} rank={idx + 1} />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-0 bottom-0 z-20 w-12 items-center justify-center bg-gradient-to-l from-[#05070E] to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
};

// ─── STANDARD HORIZONTAL CATEGORY SONG SHELF ────────────────────────────────
interface CategoryShelfProps {
  title: string;
  songs: Song[];
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const CategorySongCard: React.FC<{ song: Song }> = ({ song }) => {
  const { currentTrack, isPlaying, playTrack, likedIds, openPopover } = useAppStore();
  const isLiked = !!likedIds[String(song.id)];
  const isThisCurrent = currentTrack?.id === song.id;
  const likeMutation = useLikeMutation();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTrack(song);
    synthEngine.playTrackPreview(song.genre);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerLikeBurst(e.clientX, e.clientY, 'music');
    likeMutation.mutate({ item: song, mode: 'music' });
  };

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPopover(song, e.currentTarget.getBoundingClientRect());
  };

  return (
    <motion.div
      whileHover={{ scale: 1.06, y: -5, zIndex: 20 }}
      transition={{ duration: 0.2 }}
      onClick={handlePlay}
      className="relative flex-shrink-0 w-[135px] sm:w-[190px] md:w-[210px] cursor-pointer group/card select-none"
    >
      <div className="relative rounded-xl overflow-hidden bg-[#0A1020] aspect-square shadow-lg border border-blue-500/15 group-hover:border-blue-400/50 transition-colors">
        <img
          src={song.album_art}
          alt={song.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Live Audio Equalizer Indicator */}
        {isThisCurrent && isPlaying && (
          <div className="absolute top-2 left-2 z-20 flex items-end gap-1 p-1 rounded bg-black/70 backdrop-blur-md border border-cyan-400/50">
            <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" />
            <span className="w-1 h-5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070E] via-[#05070E]/50 to-transparent p-3 flex flex-col justify-end opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handlePlay}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              title="Play"
            >
              <Play className="w-4 h-4 fill-black ml-0.5" />
            </button>
            <button
              onClick={handleAddToPlaylist}
              className="w-9 h-9 rounded-full bg-black/60 border border-white/50 text-white flex items-center justify-center hover:border-blue-400 transition-colors"
              title="Add to Playlist"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleLike}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                isLiked
                  ? 'bg-[#0070F3] border-[#0070F3] text-white shadow-md shadow-blue-500/40'
                  : 'border-white/50 bg-black/60 text-white hover:border-white'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
            </button>
          </div>

          <h4 className="text-sm font-bold text-white truncate">{song.title}</h4>
          <p className="text-xs text-cyan-300 truncate">{song.artist}</p>

          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
            <span className="truncate max-w-[100px]">{song.album}</span>
            <span className="font-mono">
              {Math.floor(song.duration_sec / 60)}:
              {(song.duration_sec % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-card Title & Artist */}
      <div className="mt-2 px-0.5">
        <p className="text-sm font-semibold text-white truncate">{song.title}</p>
        <p className="text-xs text-gray-400 truncate">{song.artist}</p>
      </div>
    </motion.div>
  );
};

const CategoryShelf: React.FC<CategoryShelfProps> = ({
  title,
  songs,
  icon,
  isLoading
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 800 : -800, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="space-y-3 px-6 sm:px-12 mb-8">
        <div className="h-5 w-48 bg-blue-900/20 rounded animate-pulse" />
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} variant="song-card" theme="blue" index={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!songs.length) return null;

  return (
    <div className="group/shelf mb-9">
      {/* Shelf Header */}
      <div className="flex items-center gap-2 px-6 sm:px-12 mb-3">
        {icon}
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight hover:text-cyan-300 cursor-pointer transition-colors">
          {title}
        </h2>
      </div>

      {/* Track & Chevron Controls */}
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-0 bottom-0 z-20 w-12 items-center justify-center bg-gradient-to-r from-[#05070E] via-[#05070E]/80 to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar px-3 sm:px-12 pb-2 scroll-smooth"
        >
          {songs.map((song) => (
            <CategorySongCard key={song.id} song={song} />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-0 bottom-0 z-20 w-12 items-center justify-center bg-gradient-to-l from-[#05070E] via-[#05070E]/80 to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

// ─── DEDICATED LIKED SONGS SHELF FOR MUSIC SECTION ──────────────────────────
const LikedSongsShelf: React.FC = () => {
  const { likedItems, likedIds, setActiveNav, playTrack, addToast } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const likedSongs = useMemo(() => {
    return Object.values(likedItems).filter(
      (item): item is Song => 'artist' in item && 'album_art' in item && !!likedIds[String(item.id)]
    );
  }, [likedItems, likedIds]);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 700 : -700, behavior: 'smooth' });
  };

  const handlePlayAllLiked = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!likedSongs.length) return;
    playTrack(likedSongs[0], likedSongs);
    synthEngine.playTrackPreview(likedSongs[0].genre);
    addToast({
      title: 'Playing Liked Songs',
      description: `Starting playback of ${likedSongs.length} saved tracks`,
      type: 'info'
    });
  };

  return (
    <div className="group/shelf mb-10">
      {/* Header with quick 'Visit Liked Songs' action */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 sm:px-12 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0070F3] to-[#00D2FF] flex items-center justify-center shadow-md shadow-blue-500/30 text-white">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Your Liked Songs
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-cyan-300 border border-blue-400/30">
                Collection
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {likedSongs.length > 0
                ? `${likedSongs.length} favorite ${likedSongs.length === 1 ? 'track' : 'tracks'} saved to your personal library`
                : 'Save songs with the heart icon to build your personal library'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {likedSongs.length > 0 && (
            <button
              onClick={handlePlayAllLiked}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-white/90 text-black font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
              <span>Play All</span>
            </button>
          )}

          <button
            onClick={() => setActiveNav('likes')}
            className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-blue-600/20 hover:bg-blue-600/35 text-cyan-300 hover:text-white border border-blue-500/30 hover:border-blue-400 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105"
            title="Visit full Liked Songs library"
          >
            <span>Visit Liked Songs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Shelf Body */}
      <div className="relative">
        {/* Left Arrow (Desktop only) */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-0 bottom-0 z-20 w-12 items-center justify-center bg-gradient-to-r from-[#05070E] via-[#05070E]/80 to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 text-white drop-shadow" />
        </button>

        {/* Scroll Track */}
        <div
          ref={scrollRef}
          className="flex gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar px-3 sm:px-12 pb-2 scroll-smooth"
        >
          {/* Card 1: Featured 'Liked Songs' Hero Tile */}
          <motion.div
            whileHover={{ scale: 1.04, y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActiveNav('likes')}
            className="relative flex-shrink-0 w-[190px] sm:w-[210px] md:w-[230px] aspect-square rounded-2xl p-5 flex flex-col justify-between cursor-pointer select-none bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500 shadow-xl shadow-blue-950/50 border border-white/20 group/tile overflow-hidden"
          >
            {/* Ambient Lighting & Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/20 blur-2xl pointer-events-none group-hover/tile:scale-125 transition-transform" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-md">
                <Heart className="w-5 h-5 fill-white" />
              </div>

              {likedSongs.length > 0 && (
                <button
                  onClick={handlePlayAllLiked}
                  className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-xl opacity-90 group-hover/tile:opacity-100 group-hover/tile:scale-110 transition-all cursor-pointer"
                  title="Play all liked tracks"
                >
                  <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                </button>
              )}
            </div>

            <div className="relative z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-200">
                FAVORITES
              </span>
              <h3 className="text-xl font-black text-white tracking-tight leading-tight mt-0.5">
                Liked Songs
              </h3>
              <p className="text-xs font-medium text-blue-100 mt-1">
                {likedSongs.length} {likedSongs.length === 1 ? 'track saved' : 'tracks saved'}
              </p>

              <div className="mt-3 pt-2 border-t border-white/15 flex items-center gap-1 text-[11px] font-bold text-white group-hover/tile:text-cyan-200 transition-colors">
                <span>Visit Collection</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover/tile:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>

          {/* User's Liked Song Cards */}
          {likedSongs.map((song) => (
            <CategorySongCard key={song.id} song={song} />
          ))}

          {/* Empty state invitation card if user has 0 liked songs */}
          {likedSongs.length === 0 && (
            <div className="flex-shrink-0 w-[240px] sm:w-[280px] aspect-square rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-[#0A1020]/80 border border-blue-500/20 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-cyan-400 flex items-center justify-center mb-3 border border-blue-400/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Your Liked Songs Hub</h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Click the heart icon on any track across Zhoosh to save it here.
              </p>
              <button
                onClick={() => setActiveNav('likes')}
                className="px-4 py-1.5 rounded-full bg-[#0070F3] hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Open Liked Library
              </button>
            </div>
          )}
        </div>

        {/* Right Arrow (Desktop only) */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-0 bottom-0 z-20 w-12 items-center justify-center bg-gradient-to-l from-[#05070E] via-[#05070E]/80 to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity cursor-pointer"
        >
          <ChevronRight className="w-6 h-6 text-white drop-shadow" />
        </button>
      </div>
    </div>
  );
};

// ─── MAIN MUSIC DASHBOARD VIEW ──────────────────────────────────────────────
export const MusicView: React.FC = () => {
  const { data: songs = [], isLoading } = useMusic();

  // Categorize songs into distinct genre shelves
  // Helper to ensure each music shelf is always populated with at least 8-10 tracks
  const ensureSongShelfMin = (filteredList: Song[], fallbackPool: Song[], minCount = 8) => {
    if (filteredList.length >= minCount) return filteredList;
    const existingIds = new Set(filteredList.map((s) => String(s.id)));
    const padding = fallbackPool.filter((s) => !existingIds.has(String(s.id)));
    return [...filteredList, ...padding].slice(0, 16);
  };

  const trendingSongs = useMemo(
    () =>
      ensureSongShelfMin(
        songs.filter(
          (s) =>
            s.genre.toLowerCase().includes('trending') ||
            s.genre.toLowerCase().includes('pop') ||
            (s.match_score || 0) >= 97
        ),
        songs
      ),
    [songs]
  );

  const romanticSongs = useMemo(
    () =>
      ensureSongShelfMin(
        songs.filter(
          (s) =>
            s.genre.toLowerCase().includes('romantic') ||
            s.title.toLowerCase().includes('darmiyaan') ||
            s.title.toLowerCase().includes('kesariya') ||
            s.title.toLowerCase().includes('until i found you') ||
            s.title.toLowerCase().includes('golden hour') ||
            s.title.toLowerCase().includes('tum hi ho') ||
            s.title.toLowerCase().includes('perfect')
        ),
        songs
      ),
    [songs]
  );

  const rockSongs = useMemo(
    () =>
      ensureSongShelfMin(
        songs.filter(
          (s) =>
            s.genre.toLowerCase().includes('rock') ||
            s.title.toLowerCase().includes('beautiful things') ||
            s.title.toLowerCase().includes('in the end') ||
            s.title.toLowerCase().includes('bohemian') ||
            s.title.toLowerCase().includes('believer') ||
            s.title.toLowerCase().includes('sweet child')
        ),
        songs
      ),
    [songs]
  );

  const popSongs = useMemo(
    () =>
      ensureSongShelfMin(
        songs.filter(
          (s) =>
            s.genre.toLowerCase().includes('pop') ||
            s.genre.toLowerCase().includes('synthpop') ||
            s.title.toLowerCase().includes('senorita') ||
            s.title.toLowerCase().includes('lover') ||
            s.title.toLowerCase().includes('levitating') ||
            s.title.toLowerCase().includes('cruel summer') ||
            s.title.toLowerCase().includes('bad guy')
        ),
        songs
      ),
    [songs]
  );

  const hipHopSongs = useMemo(
    () =>
      ensureSongShelfMin(
        songs.filter(
          (s) =>
            s.genre.toLowerCase().includes('hip-hop') ||
            s.title.toLowerCase().includes('humble') ||
            s.title.toLowerCase().includes('sicko mode') ||
            s.title.toLowerCase().includes('god\'s plan') ||
            s.title.toLowerCase().includes('goosebumps')
        ),
        songs
      ),
    [songs]
  );

  const soundtrackSongs = useMemo(
    () =>
      ensureSongShelfMin(
        songs.filter(
          (s) =>
            s.genre.toLowerCase().includes('soundtrack') ||
            s.genre.toLowerCase().includes('classical') ||
            s.title.toLowerCase().includes('cornfield') ||
            s.title.toLowerCase().includes('time') ||
            s.title.toLowerCase().includes('oppenheimer') ||
            s.title.toLowerCase().includes('can you hear')
        ),
        songs
      ),
    [songs]
  );

  const loFiSongs = useMemo(
    () =>
      ensureSongShelfMin(
        songs.filter(
          (s) =>
            s.genre.toLowerCase().includes('lo-fi') ||
            s.genre.toLowerCase().includes('ambient') ||
            s.genre.toLowerCase().includes('chillwave') ||
            s.title.toLowerCase().includes('resonance') ||
            s.title.toLowerCase().includes('nightcall') ||
            s.title.toLowerCase().includes('a walk')
        ),
        songs
      ),
    [songs]
  );

  return (
    <div className="relative pb-28 bg-[#05070E] min-h-screen overflow-x-hidden">
      {/* ── Black & Blue Faded Grid Background Layer ── */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        {/* Geometric Electric Blue Grid Mesh */}
        <div className="absolute inset-0 music-grid-pattern opacity-90" />

        {/* Ambient Electric Blue & Cyan Aura Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-[1200px] h-[500px] rounded-full bg-[#0070F3]/16 blur-[130px]" />
        <div className="absolute top-[35%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#00D2FF]/12 blur-[140px]" />
        <div className="absolute top-[65%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[#1D4ED8]/12 blur-[140px]" />

        {/* Radial vignette fade from center */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 20%, transparent 35%, rgba(5,7,14,0.8) 85%)'
          }}
        />
      </div>

      {/* 1. CINEMATIC HERO MUSIC BILLBOARD */}
      <div className="relative z-10">
        <HeroMusicBillboard />
      </div>

      {/* 2. DASHBOARD CATEGORY ROWS */}
      <div className="relative z-10 mt-3 sm:mt-6 space-y-6">
        {/* Dedicated Liked Songs Hub Shelf */}
        <LikedSongsShelf />

        {/* Top 10 Tracks Today (Giant typography #1 to #10 with visible track names & electric blue outline) */}
        <Top10MusicShelf songs={songs} />

        {/* Trending Now & Global Hits */}
        <CategoryShelf
          title="Trending Now & Viral Chartbusters"
          songs={trendingSongs.length > 0 ? trendingSongs : songs.slice(0, 10)}
          icon={<Flame className="w-5 h-5 text-amber-400" />}
          isLoading={isLoading}
        />

        {/* Romantic Melodies & Soulful Ballads */}
        {romanticSongs.length > 0 && (
          <CategoryShelf
            title="Romantic Melodies & Late Night Ballads"
            songs={romanticSongs}
            icon={<Heart className="w-5 h-5 text-rose-400 fill-rose-400/20" />}
            isLoading={isLoading}
          />
        )}

        {/* High-Voltage Rock & Alternative Anthems */}
        {rockSongs.length > 0 && (
          <CategoryShelf
            title="High-Voltage Rock & Alternative Anthems"
            songs={rockSongs}
            icon={<Radio className="w-5 h-5 text-cyan-400" />}
            isLoading={isLoading}
          />
        )}

        {/* Pop Sensations & Worldwide Grooves */}
        {popSongs.length > 0 && (
          <CategoryShelf
            title="Global Pop Sensations & Irresistible Grooves"
            songs={popSongs}
            icon={<Sparkles className="w-5 h-5 text-purple-400" />}
            isLoading={isLoading}
          />
        )}

        {/* Hip-Hop & Urban 808s */}
        {hipHopSongs.length > 0 && (
          <CategoryShelf
            title="Hip-Hop, Trap & Urban 808s"
            songs={hipHopSongs}
            icon={<Music2 className="w-5 h-5 text-emerald-400" />}
            isLoading={isLoading}
          />
        )}

        {/* Cinematic Scores & Soundtracks */}
        {soundtrackSongs.length > 0 && (
          <CategoryShelf
            title="Cinematic Scores & Epic Soundtracks"
            songs={soundtrackSongs}
            icon={<Disc3 className="w-5 h-5 text-blue-400" />}
            isLoading={isLoading}
          />
        )}

        {/* Lo-Fi Chill & Focus Jams */}
        {loFiSongs.length > 0 && (
          <CategoryShelf
            title="Deep Focus Lo-Fi & Midnight Chillwave"
            songs={loFiSongs}
            icon={<Clock className="w-5 h-5 text-teal-300" />}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default MusicView;
