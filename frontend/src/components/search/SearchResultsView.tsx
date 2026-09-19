import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Sparkles,
  Film,
  Music2,
  Play,
  Pause,
  Info,
  Heart,
  Plus,
  Flame,
  Award,
  ChevronRight,
  Disc3,
  User,
  Volume2,
  X
} from 'lucide-react';
import { useSearch, useLikeMutation } from '@/api/hooks';
import { useAppStore } from '@/store/useAppStore';
import { MediaCard } from '../cards/MediaCard';
import { SkeletonCard } from '../cards/SkeletonCard';
import { EmptyState } from '../common/EmptyState';
import { synthEngine } from '@/utils/audioSynth';
import { triggerLikeBurst } from '@/utils/confetti';
import type { Movie, Song } from '@/types';

interface SearchResultsViewProps {
  query: string;
  onClear?: () => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({ query, onClear }) => {
  const {
    mode,
    openMovieModal,
    addToast,
    playTrack,
    currentTrack,
    isPlaying,
    likedIds,
    openPopover
  } = useAppStore();
  const isMusicMode = mode === 'music';
  const { data, isLoading } = useSearch(query, mode);
  const likeMutation = useLikeMutation();
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const movies = data?.movies || [];
  const music = data?.music || [];
  const primaryMovie = data?.primary_movie;
  const similarMovies = data?.similar_movies || [];
  const genreTopMovies = data?.genre_top_movies || [];
  const matchedGenre = data?.genre;

  const primarySong = data?.primary_song;
  const artistName = data?.artist_name;
  const artistSongs = data?.artist_songs || [];
  const similarSongs = data?.similar_songs || [];
  const similarRomanticSongs = data?.similar_romantic_songs || [];

  const hasResults = isMusicMode
    ? !!primarySong ||
      artistSongs.length > 0 ||
      similarRomanticSongs.length > 0 ||
      similarSongs.length > 0 ||
      music.length > 0
    : !!primaryMovie ||
      similarMovies.length > 0 ||
      genreTopMovies.length > 0 ||
      movies.length > 0;


  const handlePlayMovie = (movie: Movie) => {
    synthEngine.playAmbientDrone();
    addToast({
      title: `Starting "${movie.title}"`,
      description: 'Streaming in 4K Ultra HD with Dolby Atmos.',
      type: 'success',
    });
  };

  const handlePlaySong = (song: Song) => {
    playTrack(song);
    synthEngine.playTrackPreview(song.genre);
    addToast({
      title: `Now Playing: "${song.title}"`,
      description: `${song.artist} • Lossless Audio`,
      type: 'info',
    });
  };

  const isPrimarySongPlaying =
    primarySong && currentTrack?.id === primarySong.id && isPlaying;
  const isPrimarySongLiked = primarySong && !!likedIds[String(primarySong.id)];

  const handleLikeSong = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerLikeBurst(e.clientX, e.clientY, 'music');
    likeMutation.mutate({ item: song, mode: 'music' });
  };

  const handleOpenSongPlaylist = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    if (addBtnRef.current) {
      const rect = addBtnRef.current.getBoundingClientRect();
      openPopover(song, rect);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="px-3 sm:px-8 md:px-10 py-4 sm:py-6 max-w-7xl mx-auto space-y-8 sm:space-y-10 pb-28">
      {/* Search Header Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-400 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          {isMusicMode ? (
            <Music2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <Search className="w-4 h-4 text-[#FF1E56]" />
          )}
          <span>
            Showing results for <span className="text-white font-bold">"{query}"</span>
          </span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer"
            title="Clear current search query"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Search</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonCard
              key={idx}
              variant={isMusicMode ? 'song' : 'movie'}
              index={idx}
            />
          ))}
        </div>
      ) : !hasResults ? (
        <EmptyState
          type="search"
          title="No exact matches found"
          description={
            isMusicMode
              ? 'Try searching for romantic songs like "Kesariya", "Perfect", or artists like "Arijit Singh", "Coldplay", "The Weeknd".'
              : 'Try broadening your keywords or use the Voice Search button to describe the mood or plot.'
          }
          actionText={onClear ? 'Clear Search' : undefined}
          onAction={onClear}
        />
      ) : (
        <div className="space-y-12">
          {/* ═══════════════════════════════════════════════════════════════════════════
              1. PRIMARY SONG MATCH HERO (e.g. User searched "Kesariya", "Darmiyaan")
              ═══════════════════════════════════════════════════════════════════════════ */}
          {isMusicMode && primarySong && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#091124] via-[#080d1a] to-[#04060d] border border-blue-500/30 p-6 sm:p-8 shadow-2xl shadow-blue-950/40"
            >
              {/* Background ambient decorative glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start md:items-center relative z-10">
                {/* Song Album Art Poster */}
                <div
                  onClick={() => handlePlaySong(primarySong)}
                  className="relative w-36 sm:w-44 shrink-0 aspect-square rounded-2xl overflow-hidden shadow-2xl cursor-pointer group border border-blue-400/30"
                >
                  <img
                    src={primarySong.album_art}
                    alt={primarySong.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-10 h-10 text-white fill-white drop-shadow-md" />
                  </div>
                </div>

                {/* Primary Song Metadata */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-cyan-300 font-mono">
                      {primarySong.artist}
                    </span>
                    <span className="text-gray-500 text-xs">•</span>
                    <span className="text-xs text-gray-400">
                      {primarySong.album}
                    </span>
                  </div>

                  <h2
                    onClick={() => handlePlaySong(primarySong)}
                    className="text-2xl sm:text-4xl font-black text-white hover:text-cyan-400 cursor-pointer transition-colors"
                  >
                    {primarySong.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold">
                      {primarySong.genre}
                    </span>
                    <span className="border border-white/20 text-[10px] px-2 py-0.5 rounded uppercase text-gray-300">
                      {formatDuration(primarySong.duration_sec)}
                    </span>
                  </div>

                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
                    {primarySong.agent_rationale}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => handlePlaySong(primarySong)}
                      className="px-6 py-2.5 rounded-full bg-[#0070F3] hover:bg-blue-600 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/40 transition-transform hover:scale-105 cursor-pointer"
                    >
                      {isPrimarySongPlaying ? (
                        <>
                          <Volume2 className="w-4 h-4 text-white animate-pulse" />
                          Now Playing
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                          Play Track
                        </>
                      )}
                    </button>

                    <button
                      ref={addBtnRef}
                      onClick={(e) => handleOpenSongPlaylist(primarySong, e)}
                      className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Playlist
                    </button>

                    <button
                      onClick={(e) => handleLikeSong(primarySong, e)}
                      className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                        isPrimarySongLiked
                          ? 'bg-[#0070F3]/20 border-blue-500/50 text-[#0070F3]'
                          : 'bg-white/10 border-white/20 text-gray-300 hover:text-white'
                      }`}
                      title={isPrimarySongLiked ? 'Saved' : 'Save Track'}
                    >
                      <Heart
                        className={`w-4 h-4 ${isPrimarySongLiked ? 'fill-current' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════════
              2. SIMILAR ROMANTIC SONGS (e.g. User searched romantic track or "romantic")
              ═══════════════════════════════════════════════════════════════════════════ */}
          {isMusicMode && similarRomanticSongs.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500/30" />
                  <span>
                    Similar Romantic Songs
                    {primarySong && (
                      <span className="text-rose-400 font-extrabold ml-1.5">
                        to "{primarySong.title}"
                      </span>
                    )}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {similarRomanticSongs.map((song, idx) => (
                  <MediaCard
                    key={`rom-${song.id}`}
                    item={song}
                    variant="song"
                    index={idx}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════════
              3. SONGS BY THE SAME SINGER / BAND / COMPOSER (e.g. Arijit Singh, Weeknd)
              ═══════════════════════════════════════════════════════════════════════════ */}
          {isMusicMode && artistSongs.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                  <Disc3 className="w-5 h-5 text-cyan-400" />
                  <span>
                    Songs by{' '}
                    <span className="text-cyan-400 font-extrabold">
                      {artistName || primarySong?.artist || query}
                    </span>
                  </span>
                  <span className="text-xs text-cyan-300 font-mono bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                    {artistSongs.length} tracks
                  </span>
                </h3>
                <span className="hidden sm:inline text-xs text-gray-400">
                  Featured Discography & Compositions
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {artistSongs.map((song, idx) => (
                  <MediaCard
                    key={`art-${song.id}`}
                    item={song}
                    variant="song"
                    index={idx}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════════
              4. SIMILAR ACOUSTIC & AUDIO-FEATURE MATCHES (General feature cosine)
              ═══════════════════════════════════════════════════════════════════════════ */}
          {isMusicMode && similarSongs.length > 0 && similarRomanticSongs.length === 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <span>
                    Tracks Similar to{' '}
                    <span className="text-blue-400 font-extrabold">
                      {primarySong?.title || query}
                    </span>
                  </span>
                  <span className="text-xs text-gray-400 font-mono bg-white/10 px-2 py-0.5 rounded-full">
                    {similarSongs.length} matches
                  </span>
                </h3>
                <span className="hidden sm:inline text-xs text-gray-400">
                  Tempo, valence & danceability calibrated
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {similarSongs.map((song, idx) => (
                  <MediaCard
                    key={`sim-${song.id}`}
                    item={song}
                    variant="song"
                    index={idx}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════════
              5. PRIMARY MOVIE MATCH HERO (e.g. User searched "Interstellar")
              ═══════════════════════════════════════════════════════════════════════════ */}
          {!isMusicMode && primaryMovie && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1c1c1c] via-[#161616] to-[#0f0f0f] border border-white/15 p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start md:items-center">
                {/* Movie Poster Card */}
                <div
                  onClick={() => openMovieModal(primaryMovie)}
                  className="relative w-36 sm:w-44 shrink-0 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer group border border-white/20"
                >
                  <img
                    src={primaryMovie.poster_path}
                    alt={primaryMovie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      if (primaryMovie.backdrop_path && e.currentTarget.src !== primaryMovie.backdrop_path) {
                        e.currentTarget.src = primaryMovie.backdrop_path;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Info className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Primary Movie Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#E50914] text-white text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded">
                      FEATURED FILM
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      Directed by {primaryMovie.director || 'Visionary Director'}
                    </span>
                  </div>

                  <h2
                    onClick={() => openMovieModal(primaryMovie)}
                    className="text-2xl sm:text-4xl font-black text-white hover:text-red-400 cursor-pointer transition-colors"
                  >
                    {primaryMovie.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-300">
                    <span>{primaryMovie.year || primaryMovie.release_date?.split('-')[0]}</span>
                    <span className="border border-white/30 text-[10px] px-1.5 py-0.5 rounded uppercase">
                      Ultra HD 4K
                    </span>
                    <span className="text-amber-400 font-semibold">
                      ★ {primaryMovie.vote_average.toFixed(1)} Zmdb
                    </span>
                    <span>{primaryMovie.genres.join(' • ')}</span>
                  </div>

                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-3 max-w-3xl">
                    {primaryMovie.overview}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => handlePlayMovie(primaryMovie)}
                      className="px-5 py-2 rounded-full bg-white hover:bg-white/90 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      Watch Now
                    </button>

                    <button
                      onClick={() => openMovieModal(primaryMovie)}
                      className="px-5 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Info className="w-4 h-4" />
                      Explore Details & Recs
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════════
              6. MOVIES SIMILAR TO [TITLE]
              ═══════════════════════════════════════════════════════════════════════════ */}
          {!isMusicMode && similarMovies.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FF1E56]" />
                  <span>
                    Movies Similar to <span className="text-red-400 font-extrabold">{primaryMovie?.title || query}</span>
                  </span>
                  <span className="text-xs text-gray-400 font-mono bg-white/10 px-2 py-0.5 rounded-full">
                    {similarMovies.length} recommendations
                  </span>
                </h3>
                <span className="hidden sm:inline text-xs text-gray-400">
                  Curated based on theme, cast & genre
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {similarMovies.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => openMovieModal(movie)}
                    className="group relative rounded-xl overflow-hidden bg-[#1e1e1e] hover:bg-[#262626] border border-white/10 hover:border-white/30 transition-all cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1.5 flex flex-col"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                      <img
                        src={movie.backdrop_path || movie.poster_path}
                        alt={movie.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = movie.poster_path;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] via-transparent to-transparent" />
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                          <span>{movie.year || movie.release_date?.split('-')[0]}</span>
                          <span className="border border-white/20 px-1 text-[9px] rounded">HD</span>
                        </div>
                        <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                          {movie.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-snug">
                          {movie.overview}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-white/5 text-[11px]">
                        <span className="text-gray-400 truncate max-w-[130px]">
                          {movie.genres.slice(0, 2).join(' • ')}
                        </span>
                        <span className="text-red-400 font-semibold group-hover:underline flex items-center">
                          Explore <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════════
              7. GENRE MATCH TOP RECOMMENDATIONS (e.g. "thriller")
              ═══════════════════════════════════════════════════════════════════════════ */}
          {!isMusicMode && genreTopMovies.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>
                    Top Recommended <span className="text-amber-400">{matchedGenre || query}</span> Movies
                  </span>
                  <span className="text-xs text-gray-400 font-mono bg-white/10 px-2 py-0.5 rounded-full">
                    {genreTopMovies.length} critically acclaimed
                  </span>
                </h3>
                <span className="hidden sm:inline text-xs text-gray-400">
                  Ranked by Audience Consensus
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {genreTopMovies.map((movie, idx) => (
                  <MediaCard key={movie.id} item={movie} variant="movie" index={idx} />
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════════
              8. GENERAL MATCHING FILMS
              ═══════════════════════════════════════════════════════════════════════════ */}
          {!isMusicMode && movies.length > 0 && !primaryMovie && genreTopMovies.length === 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-red-500" />
                <span>Films</span>
                <span className="text-xs text-gray-500 font-mono">({movies.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {movies.map((movie, idx) => (
                  <MediaCard key={movie.id} item={movie} variant="movie" index={idx} />
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════════
              9. GENERAL MATCHING AUDIO & SOUNDTRACKS
              ═══════════════════════════════════════════════════════════════════════════ */}
          {isMusicMode &&
            music.length > 0 &&
            !primarySong &&
            artistSongs.length === 0 &&
            similarRomanticSongs.length === 0 && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Music2 className="w-5 h-5 text-cyan-400" />
                  <span>Soundtracks & Audio Tracks</span>
                  <span className="text-xs text-gray-500 font-mono">({music.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {music.map((song, idx) => (
                    <MediaCard key={song.id} item={song} variant="song" index={idx} />
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsView;
