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
    backdropUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1400&auto=format&fit=crop&q=80',
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
    backdropUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1400&auto=format&fit=crop&q=80',
    coverArtUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/54/f4/92/54f49210-e260-b519-ebbd-f4f40ee710cd/054391342751.jpg/600x600bb.jpg',
    genreVibe: 'Explosive Arena Rock',
    audioPreviewGenre: 'Rock',
    badgeLabel: 'Global Sensation'
  },
  {
    id: 'hero-darmiyaan',
    title: 'Darmiyaan',
    artist: 'Shafqat Amanat Ali, Clinton Cerejo',
    album: 'Jodi Breakers',
    genres: ['Romantic', 'Sufi Rock', 'Bollywood'],
    year: 2012,
    durationStr: '5m 49s',
    streamsStr: '142 Million Streams',
    tagline: 'KUCH TOH THA TERE MERE DARMIYAAN',
    overview: 'A timeless romantic gem. Shafqat Amanat Ali\'s soaring classical Sufi vocals intertwined with tender acoustic guitars and deep emotional yearning.',
    backdropUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1400&auto=format&fit=crop&q=80',
    coverArtUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music18/v4/dc/53/46/dc534631-17ba-6932-250f-84dd558fc78e/8902894698481_cover.jpg/600x600bb.jpg',
    genreVibe: 'Soulful Romantic Ballad',
    audioPreviewGenre: 'Romantic',
    badgeLabel: 'All-Time Romantic Classic'
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
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&auto=format&fit=crop&q=80',
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
    backdropUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1400&auto=format&fit=crop&q=80',
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
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1400&auto=format&fit=crop&q=80',
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
    <div className="w-full px-4 sm:px-6 md:px-8 pt-4 pb-6">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full h-[72vh] sm:h-[78vh] min-h-[480px] max-h-[720px] rounded-2xl sm:rounded-3xl overflow-hidden border border-blue-500/20 shadow-[0_0_50px_rgba(0,112,243,0.2)] select-none bg-[#05070E]"
      >
        {/* Background Image Carousel with Cross-Fade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <img
              src={current.backdropUrl}
              alt={current.title}
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Electric Blue Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070E] via-[#05070E]/75 via-45% to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070E] via-[#05070E]/40 via-30% to-transparent pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#05070E]/60 to-transparent pointer-events-none" />

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

        {/* Left/Right Carousel Chevrons on Hover */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 border border-blue-400/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
          title="Previous Track"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 border border-blue-400/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
          title="Next Track"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Content Container (Bottom-Left) */}
        <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-12 max-w-2xl z-20">
          {/* Big Stylized Music Typography */}
          <h1 className="font-sans font-black text-3xl sm:text-5xl md:text-6xl tracking-tight text-white uppercase drop-shadow-[0_4px_30px_rgba(0,112,243,0.5)] leading-tight select-none">
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

          {/* Action Buttons: Play Pill, Add to Playlist, Like */}
          <div className="flex items-center gap-3">
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
          </div>
        </div>

        {/* BOTTOM-RIGHT BADGES */}
        <div className="absolute right-5 sm:right-8 bottom-6 sm:bottom-10 z-20 hidden sm:flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-blue-400/20 text-xs font-semibold text-white shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dolby Atmos Spatial Audio</span>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-blue-400/20 text-xs font-semibold text-white shadow-lg">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{current.badgeLabel || 'Trending Worldwide'}</span>
          </div>
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
      <div className="w-16 sm:w-24 flex items-center justify-center flex-shrink-0 z-0 select-none pt-3 sm:pt-6">
        <span className="text-7xl sm:text-9xl font-black music-rank-number tracking-tighter">
          {rank}
        </span>
      </div>

      {/* Album Art Card + Visible Song Name and Artist */}
      <div className="-ml-7 sm:-ml-10 relative flex flex-col w-[150px] sm:w-[175px] md:w-[195px] z-10">
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
          className="absolute left-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-r from-[#05070E] to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto no-scrollbar px-6 sm:px-12 pb-2 scroll-smooth"
        >
          {top10List.map((song, idx) => (
            <Top10SongCard key={song.id} song={song} rank={idx + 1} />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-l from-[#05070E] to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
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
      className="relative flex-shrink-0 w-[170px] sm:w-[190px] md:w-[210px] cursor-pointer group/card select-none"
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
          className="absolute left-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-r from-[#05070E] via-[#05070E]/80 to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar px-6 sm:px-12 pb-2 scroll-smooth"
        >
          {songs.map((song) => (
            <CategorySongCard key={song.id} song={song} />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-l from-[#05070E] via-[#05070E]/80 to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

// ─── MAIN MUSIC DASHBOARD VIEW ──────────────────────────────────────────────
export const MusicView: React.FC = () => {
  const { data: songs = [], isLoading } = useMusic();

  // Categorize songs into distinct genre shelves
  const trendingSongs = useMemo(
    () =>
      songs.filter(
        (s) =>
          s.genre.toLowerCase().includes('trending') ||
          s.genre.toLowerCase().includes('pop') ||
          (s.match_score || 0) >= 97
      ),
    [songs]
  );

  const romanticSongs = useMemo(
    () =>
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
    [songs]
  );

  const rockSongs = useMemo(
    () =>
      songs.filter(
        (s) =>
          s.genre.toLowerCase().includes('rock') ||
          s.title.toLowerCase().includes('beautiful things') ||
          s.title.toLowerCase().includes('in the end') ||
          s.title.toLowerCase().includes('bohemian') ||
          s.title.toLowerCase().includes('believer') ||
          s.title.toLowerCase().includes('sweet child')
      ),
    [songs]
  );

  const popSongs = useMemo(
    () =>
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
    [songs]
  );

  const hipHopSongs = useMemo(
    () =>
      songs.filter(
        (s) =>
          s.genre.toLowerCase().includes('hip-hop') ||
          s.title.toLowerCase().includes('humble') ||
          s.title.toLowerCase().includes('sicko mode') ||
          s.title.toLowerCase().includes('god\'s plan') ||
          s.title.toLowerCase().includes('goosebumps')
      ),
    [songs]
  );

  const soundtrackSongs = useMemo(
    () =>
      songs.filter(
        (s) =>
          s.genre.toLowerCase().includes('soundtrack') ||
          s.genre.toLowerCase().includes('classical') ||
          s.title.toLowerCase().includes('cornfield') ||
          s.title.toLowerCase().includes('time') ||
          s.title.toLowerCase().includes('oppenheimer') ||
          s.title.toLowerCase().includes('can you hear')
      ),
    [songs]
  );

  const loFiSongs = useMemo(
    () =>
      songs.filter(
        (s) =>
          s.genre.toLowerCase().includes('lo-fi') ||
          s.genre.toLowerCase().includes('ambient') ||
          s.genre.toLowerCase().includes('chillwave') ||
          s.title.toLowerCase().includes('resonance') ||
          s.title.toLowerCase().includes('nightcall') ||
          s.title.toLowerCase().includes('a walk')
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
