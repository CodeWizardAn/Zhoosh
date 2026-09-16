import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Film, Play, Info, Flame, Award, ChevronRight } from 'lucide-react';
import { useSearch } from '@/api/hooks';
import { useAppStore } from '@/store/useAppStore';
import { MediaCard } from '../cards/MediaCard';
import { SkeletonCard } from '../cards/SkeletonCard';
import { EmptyState } from '../common/EmptyState';
import { synthEngine } from '@/utils/audioSynth';
import type { Movie } from '@/types';

interface SearchResultsViewProps {
  query: string;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({ query }) => {
  const { mode, openMovieModal, addToast } = useAppStore();
  const { data, isLoading } = useSearch(query, mode);

  const movies = data?.movies || [];
  const music = data?.music || [];
  const primaryMovie = data?.primary_movie;
  const similarMovies = data?.similar_movies || [];
  const genreTopMovies = data?.genre_top_movies || [];
  const matchedGenre = data?.genre;
  const searchType = data?.search_type || 'general';

  const hasResults =
    !!primaryMovie ||
    similarMovies.length > 0 ||
    genreTopMovies.length > 0 ||
    movies.length > 0 ||
    music.length > 0;

  const handlePlayPrimary = (movie: Movie) => {
    synthEngine.playAmbientDrone();
    addToast({
      title: `Starting "${movie.title}"`,
      description: 'Stream in 4K Ultra HD with Dolby Atmos.',
      type: 'success'
    });
  };

  return (
    <div className="px-4 sm:px-8 md:px-10 py-6 max-w-7xl mx-auto space-y-10 pb-28">
      {/* Search Header Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-400 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-[#FF1E56]" />
          <span>
            Showing results for <span className="text-white font-bold">"{query}"</span>
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonCard key={idx} variant={mode === 'movies' ? 'movie' : 'song'} index={idx} />
          ))}
        </div>
      ) : !hasResults ? (
        <EmptyState
          type="search"
          title="No exact matches found"
          description="Try broadening your keywords or use the Voice Search button to describe the mood or plot."
        />
      ) : (
        <div className="space-y-12">
          {/* ─── 1. TITLE MATCH HERO (e.g. User searched "Interstellar") ─────────────── */}
          {primaryMovie && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1c1c1c] via-[#161616] to-[#0f0f0f] border border-white/15 p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start md:items-center">
                {/* Poster Card */}
                <div
                  onClick={() => openMovieModal(primaryMovie)}
                  className="relative w-36 sm:w-44 shrink-0 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer group border border-white/20"
                >
                  <img
                    src={primaryMovie.poster_path}
                    alt={primaryMovie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Info className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Primary Movie Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#E50914] text-white text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded">
                      FEATURED
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
                      onClick={() => handlePlayPrimary(primaryMovie)}
                      className="px-5 py-2 rounded-full bg-white hover:bg-white/90 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      Watch Now
                    </button>

                    <button
                      onClick={() => openMovieModal(primaryMovie)}
                      className="px-5 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors flex items-center gap-1.5"
                    >
                      <Info className="w-4 h-4" />
                      Explore Details & Recs
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── 2. "MOVIES SIMILAR TO [TITLE]" (e.g. Fans of Interstellar also love) ── */}
          {similarMovies.length > 0 && (
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
                {similarMovies.map((movie, idx) => (
                  <div
                    key={movie.id}
                    onClick={() => openMovieModal(movie)}
                    className="group relative rounded-xl overflow-hidden bg-[#1e1e1e] hover:bg-[#262626] border border-white/10 hover:border-white/30 transition-all cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1.5 flex flex-col"
                  >
                    {/* Poster / Backdrop */}
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

                    {/* Metadata */}
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

          {/* ─── 3. GENRE MATCH TOP RECOMMENDATIONS (e.g. User searched "thriller") ─── */}
          {genreTopMovies.length > 0 && (
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

          {/* ─── 4. GENERAL MATCHING FILMS ─────────────────────────────────────────── */}
          {movies.length > 0 && !primaryMovie && genreTopMovies.length === 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
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

          {/* ─── 5. MATCHING SOUNDTRACKS & MUSIC ──────────────────────────────────── */}
          {music.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Soundtracks & Audio</span>
                <span className="text-xs text-gray-500 font-mono">({music.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
