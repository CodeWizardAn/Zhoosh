import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Info, Heart, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMovies, useLikeMutation } from '@/api/hooks';
import { useAppStore } from '@/store/useAppStore';
import { triggerLikeBurst } from '@/utils/confetti';
import type { Movie } from '@/types';

// ─── Horizontal Shelf (scrollable row) ────────────────────────────────────────
interface ShelfProps {
  title: string;
  movies: Movie[];
  isLoading?: boolean;
}

const MovieCard: React.FC<{ movie: Movie }> = ({ movie }) => {
  const { openPopover, likedIds } = useAppStore();
  const isLiked = !!likedIds[String(movie.id)];
  const likeMutation = useLikeMutation();

  return (
    <motion.div
      whileHover={{ scale: 1.06, zIndex: 10 }}
      transition={{ duration: 0.2 }}
      className="relative flex-shrink-0 w-[160px] sm:w-[180px] cursor-pointer group"
    >
      <div className="relative rounded-md overflow-hidden bg-[#141414] aspect-[2/3]">
        <img
          src={movie.poster_path}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-end p-2 opacity-0 group-hover:opacity-100">
          <div className="flex gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); openPopover(movie, e.currentTarget.getBoundingClientRect()); }}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-white/90 transition-colors"
              title="Play"
            >
              <Play className="w-4 h-4 fill-black text-black translate-x-px" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); triggerLikeBurst(e.clientX, e.clientY, 'movies'); likeMutation.mutate({ item: movie, mode: 'movies' }); }}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                isLiked ? 'bg-[#FF1E56] border-[#FF1E56]' : 'border-white/60 bg-black/40 hover:border-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
            </button>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-300 mt-1.5 truncate font-medium">{movie.title}</p>
    </motion.div>
  );
};

const Shelf: React.FC<ShelfProps> = ({ title, movies, isLoading }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 500 : -500, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-36 bg-white/10 rounded animate-pulse" />
        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[160px] aspect-[2/3] rounded-md bg-white/8 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!movies.length) return null;

  return (
    <div className="group/shelf">
      <h2 className="text-base sm:text-lg font-bold text-white mb-3 px-6 sm:px-10">{title}</h2>
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center bg-gradient-to-r from-[#050508] to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto no-scrollbar px-6 sm:px-10 pb-2"
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center bg-gradient-to-l from-[#050508] to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

// ─── Main MoviesView ──────────────────────────────────────────────────────────
export const MoviesView: React.FC = () => {
  const { data: movies = [], isLoading } = useMovies();
  const { likedIds, openPopover } = useAppStore();
  const likeMutation = useLikeMutation();

  const heroMovie = movies[0];
  const isHeroLiked = heroMovie ? !!likedIds[String(heroMovie.id)] : false;

  const handleHeroLike = (e: React.MouseEvent) => {
    if (!heroMovie) return;
    triggerLikeBurst(e.clientX, e.clientY, 'movies');
    likeMutation.mutate({ item: heroMovie, mode: 'movies' });
  };

  const continueWatching = useMemo(() => movies.slice(3, 9), [movies]);
  const nextWatch = useMemo(() => movies.slice(0, 8), [movies]);
  const thrillerMovies = useMemo(() =>
    movies.filter((m) => m.genres.some((g) => g.toLowerCase().includes('thriller'))),
    [movies]);
  const actionMovies = useMemo(() =>
    movies.filter((m) => m.genres.some((g) => g.toLowerCase().includes('action'))),
    [movies]);
  const dramaMovies = useMemo(() =>
    movies.filter((m) => m.genres.some((g) => g.toLowerCase().includes('drama'))),
    [movies]);
  const becauseYouWatched = useMemo(() => movies.slice(5, 13), [movies]);

  return (
    <div className="pb-24 bg-transparent">

      {/* ── HERO BILLBOARD ──────────────────────────────────────────────────── */}
      {heroMovie && (
        <div className="relative w-full h-[80vh] min-h-[520px] max-h-[800px] overflow-hidden">
          {/* Background image */}
          <img
            src={heroMovie.backdrop_path || heroMovie.poster_path}
            alt={heroMovie.title}
            className="w-full h-full object-cover object-top"
          />

          {/* Gradients — left-to-right + bottom-up like Netflix */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />

          {/* Hero Content */}
          <div className="absolute bottom-16 left-6 sm:left-10 max-w-xl z-10">
            {/* Genre tags */}
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 mb-3">
              {heroMovie.genres.slice(0, 3).map((g, i) => (
                <React.Fragment key={g}>
                  {i > 0 && <span className="text-gray-500">•</span>}
                  <span>{g}</span>
                </React.Fragment>
              ))}
              <span className="text-gray-500">•</span>
              <span>{heroMovie.release_date?.split('-')[0]}</span>
              {heroMovie.runtime && (
                <>
                  <span className="text-gray-500">•</span>
                  <span>{Math.floor(heroMovie.runtime / 60)}h {heroMovie.runtime % 60}m</span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight mb-4 drop-shadow-lg">
              {heroMovie.title}
            </h1>

            {/* Match + description */}
            <p className="text-sm text-gray-300 leading-relaxed line-clamp-2 mb-6 max-w-md">
              {heroMovie.overview}
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-7 py-2.5 rounded bg-white hover:bg-white/85 text-black font-bold text-sm transition-colors">
                <Play className="w-5 h-5 fill-black" />
                Play
              </button>
              <button
                onClick={(e) => openPopover(heroMovie, e.currentTarget.getBoundingClientRect())}
                className="flex items-center gap-2 px-6 py-2.5 rounded bg-[#6D6D6E]/70 hover:bg-[#6D6D6E]/50 text-white font-bold text-sm transition-colors"
              >
                <Info className="w-5 h-5" />
                More Info
              </button>
              <button
                onClick={handleHeroLike}
                className={`p-2.5 rounded-full border-2 transition-all ${
                  isHeroLiked
                    ? 'border-[#FF1E56] bg-[#FF1E56]/20 text-[#FF1E56]'
                    : 'border-white/50 hover:border-white text-white'
                }`}
              >
                {isHeroLiked
                  ? <Heart className="w-5 h-5 fill-[#FF1E56]" />
                  : <Plus className="w-5 h-5" />
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SHELVES ─────────────────────────────────────────────────────────── */}
      <div className="space-y-10 mt-6">
        <Shelf title="Continue Watching" movies={continueWatching} isLoading={isLoading} />
        <Shelf title="Your Next Watch" movies={nextWatch} isLoading={isLoading} />
        {thrillerMovies.length > 0 && (
          <Shelf title="Thriller Movies" movies={thrillerMovies} isLoading={isLoading} />
        )}
        <Shelf
          title={`Because You Watched ${heroMovie?.title || 'This'}`}
          movies={becauseYouWatched}
          isLoading={isLoading}
        />
        {actionMovies.length > 0 && (
          <Shelf title="Action & High-Octane" movies={actionMovies} isLoading={isLoading} />
        )}
        {dramaMovies.length > 0 && (
          <Shelf title="Award-Winning Dramas" movies={dramaMovies} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};
