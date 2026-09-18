import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Plus,
  Check,
  Heart,
  Volume2,
  Sparkles,
  Film,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useMovieRecommendations, useLikeMutation } from '@/api/hooks';
import { triggerLikeBurst } from '@/utils/confetti';
import { synthEngine } from '@/utils/audioSynth';
import type { Movie } from '@/types';

export const MovieDetailsModal: React.FC = () => {
  const { selectedMovie, closeMovieModal, openMovieModal, likedIds, addToast } = useAppStore();
  const likeMutation = useLikeMutation();
  const modalContentRef = useRef<HTMLDivElement>(null);

  const movieId = selectedMovie ? String(selectedMovie.id) : null;
  const { data: recommendations = [], isLoading: isRecsLoading } = useMovieRecommendations(
    selectedMovie?.id,
    9
  );

  const isLiked = selectedMovie ? !!likedIds[String(selectedMovie.id)] : false;

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMovieModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeMovieModal]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedMovie) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedMovie]);

  if (!selectedMovie) return null;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerLikeBurst(e.clientX, e.clientY, 'movies');
    likeMutation.mutate({ item: selectedMovie, mode: 'movies' });
  };

  const handlePlay = () => {
    synthEngine.playAmbientDrone();
    addToast({
      title: `Starting "${selectedMovie.title}"`,
      description: 'Ultra HD 4K streaming initialized with Dolby Atmos audio.',
      type: 'success'
    });
  };

  const handleSelectRecommendation = (recMovie: Movie) => {
    // Smoothly scroll modal content to top and transition to new movie
    if (modalContentRef.current) {
      modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    openMovieModal(recMovie);
  };

  const backdropImage =
    selectedMovie.backdrop_path || selectedMovie.poster_path || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80';
  const releaseYear = selectedMovie.year || selectedMovie.release_date?.split('-')[0] || 2024;
  const ratingScore = selectedMovie.vote_average ? selectedMovie.vote_average.toFixed(1) : '8.5';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
        {/* Dark Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeMovieModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window / Mobile Bottom Sheet */}
        <motion.div
          ref={modalContentRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#181818] text-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-white/10 z-10 custom-scrollbar mt-auto sm:my-8"
        >
          {/* Mobile Sheet Drag Indicator */}
          <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto sm:hidden mt-3 -mb-1" />

          {/* Close Button */}
          <button
            onClick={closeMovieModal}
            className="absolute top-4 right-4 z-30 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all hover:scale-105 cursor-pointer"
            title="Close"
          >
            <X className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>

          {/* Hero Banner with Backdrop */}
          <div className="relative w-full h-[260px] sm:h-[400px] md:h-[440px] overflow-hidden bg-black select-none">
            <img
              src={backdropImage}
              alt={selectedMovie.title}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.currentTarget.src = selectedMovie.poster_path;
              }}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

            {/* Banner Floating Metadata & Play Controls */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-20 flex flex-col justify-end space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-[#E50914] text-white text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded">
                  ZHOOSH ORIGINAL
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg leading-tight">
                {selectedMovie.title}
              </h2>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-1 sm:pt-2">
                <button
                  onClick={handlePlay}
                  className="flex-1 sm:flex-initial justify-center px-6 py-2.5 rounded-md bg-white hover:bg-white/90 text-black font-bold text-sm sm:text-base flex items-center gap-2 transition-transform active:scale-95 shadow-xl cursor-pointer"
                >
                  <Play className="w-4 sm:w-5 h-4 sm:h-5 fill-black" />
                  <span>Play</span>
                </button>

                <button
                  onClick={handleLike}
                  className={`w-9 sm:w-10 h-9 sm:h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                    isLiked
                      ? 'border-[#E50914] bg-[#E50914] text-white'
                      : 'border-white/40 hover:border-white text-white bg-black/60 hover:bg-black/90'
                  }`}
                  title={isLiked ? 'Unlike' : 'Like'}
                >
                  <Heart className={`w-4 sm:w-5 h-4 sm:h-5 ${isLiked ? 'fill-white' : ''}`} />
                </button>

                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-300 ml-auto bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Spatial Audio · Dolby Atmos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Overview Body */}
          <div className="p-6 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Left Column: Specs & Synopsis */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                  <span>{releaseYear}</span>
                  <span className="border border-white/40 text-[10px] font-bold px-1.5 py-0.5 rounded text-gray-200">
                    U/A 16+
                  </span>
                  <span className="border border-white/40 text-[10px] font-bold px-1.5 py-0.5 rounded text-gray-200">
                    Ultra HD 4K
                  </span>
                  <span className="text-amber-400 font-bold">
                    ★ {ratingScore} Zmdb
                  </span>
                </div>

                <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
                  {selectedMovie.overview ||
                    'An extraordinary cinematic production exploring gripping storylines, state-of-the-art visual mastery, and poignant character arcs.'}
                </p>
              </div>

              {/* Right Column: Cast, Director, Genres */}
              <div className="space-y-4 text-xs sm:text-sm border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 text-gray-400">
                {selectedMovie.director && (
                  <div>
                    <span className="text-gray-500 block text-[11px] uppercase tracking-wider font-semibold mb-1">
                      Director
                    </span>
                    <span className="text-white font-medium">{selectedMovie.director}</span>
                  </div>
                )}

                {selectedMovie.cast && selectedMovie.cast.length > 0 && (
                  <div>
                    <span className="text-gray-500 block text-[11px] uppercase tracking-wider font-semibold mb-1">
                      Starring
                    </span>
                    <span className="text-white leading-relaxed">
                      {selectedMovie.cast.slice(0, 5).join(', ')}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-gray-500 block text-[11px] uppercase tracking-wider font-semibold mb-1.5">
                    Genres
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMovie.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-2 py-0.5 rounded bg-white/10 text-gray-200 text-xs hover:bg-white/20 transition-colors"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 block text-[11px] uppercase tracking-wider font-semibold mb-1">
                    Audio & Subtitles
                  </span>
                  <p className="text-gray-300 text-xs">English [Original], Hindi, Spanish, French</p>
                </div>
              </div>
            </div>

            {/* ─── "MORE LIKE THIS" RECOMMENDATION SECTION ──────────────── */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <span>More Like This</span>
                  <span className="text-xs text-gray-400 font-mono bg-white/10 px-2 py-0.5 rounded-full">
                    Recommended Films
                  </span>
                </h3>
                <span className="text-xs text-gray-400">
                  Click any film to explore its recommendations
                </span>
              </div>

              {isRecsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[16/10] rounded-lg bg-white/5 animate-pulse border border-white/5"
                    />
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 italic">
                  No additional recommendations available for this title right now.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {recommendations.map((rec) => {
                    const recYear = rec.year || rec.release_date?.split('-')[0] || 2024;
                    const cardImg = rec.backdrop_path || rec.poster_path;

                    return (
                      <div
                        key={rec.id}
                        onClick={() => handleSelectRecommendation(rec)}
                        className="group relative rounded-lg overflow-hidden bg-[#242424] hover:bg-[#2e2e2e] transition-all cursor-pointer border border-white/5 hover:border-white/25 flex flex-col shadow-md hover:shadow-xl hover:-translate-y-1"
                      >
                        {/* Recommendation Backdrop / Poster */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                          <img
                            src={cardImg}
                            alt={rec.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = rec.poster_path;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#242424] via-transparent to-transparent" />
                        </div>

                        {/* Card Info */}
                        <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="flex items-center justify-between gap-1 text-[11px] text-gray-400 mb-1">
                              <span>{recYear}</span>
                              <span className="border border-white/30 text-[9px] px-1 rounded">
                                HD
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                              {rec.title}
                            </h4>
                            <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-snug">
                              {rec.overview || 'Explore themes and parallel visual journeys.'}
                            </p>
                          </div>

                          <div className="pt-2 flex items-center justify-between border-t border-white/5">
                            <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                              {rec.genres.slice(0, 2).join(' • ')}
                            </span>
                            <span className="text-[10px] text-red-400 font-semibold group-hover:underline flex items-center">
                              Details <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
