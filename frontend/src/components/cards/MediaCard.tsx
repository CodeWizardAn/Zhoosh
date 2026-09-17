import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Heart, Plus, Volume2, Check } from 'lucide-react';
import { Movie, Song } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { useLikeMutation } from '@/api/hooks';
import { triggerLikeBurst } from '@/utils/confetti';
import { synthEngine } from '@/utils/audioSynth';

interface MediaCardProps {
  item: Movie | Song;
  variant?: 'movie' | 'song';
  index?: number;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  variant = 'movie',
  index = 0,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const { mode, likedIds, openPopover, playTrack, currentTrack, isPlaying, openMovieModal } = useAppStore();
  const likeMutation = useLikeMutation();
  const [isHovered, setIsHovered] = useState(false);
  const [likeBouncing, setLikeBouncing] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const isMovie = variant === 'movie';
  const movie = isMovie ? (item as Movie) : null;
  const song = !isMovie ? (item as Song) : null;

  const isLiked = !!likedIds[String(item.id)];
  const isCurrentSongPlaying = song && currentTrack?.id === song.id && isPlaying;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shouldReduceMotion) {
      setLikeBouncing(true);
      setTimeout(() => setLikeBouncing(false), 300);
      triggerLikeBurst(e.clientX, e.clientY, mode);
    }
    likeMutation.mutate({ item, mode });
  };

  const handleOpenPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (addBtnRef.current) {
      const rect = addBtnRef.current.getBoundingClientRect();
      openPopover(item, rect);
    }
  };

  const handleCardClick = () => {
    if (movie) {
      openMovieModal(movie);
    } else if (song) {
      playTrack(song);
      synthEngine.playTrackPreview(song.genre);
    }
  };

  const posterImage = movie ? movie.poster_path : song?.album_art;
  const title = item.title;
  const subtitle = movie ? movie.genres.slice(0, 2).join(' • ') : song?.artist;

  if (isMovie) {
    // NETFLIX-STYLE MOVIE CARD
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.25,
          delay: Math.min(index * 0.035, 0.35),
          ease: [0.22, 1, 0.36, 1],
        }}
        whileHover={
          shouldReduceMotion
            ? {}
            : {
                scale: 1.05,
                y: -4,
                transition: { duration: 0.15, ease: 'easeOut' },
              }
        }
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        className="group relative rounded-md overflow-hidden cursor-pointer select-none bg-[#181818] shadow-md hover:shadow-2xl transition-all w-[160px] sm:w-[185px] md:w-[205px] aspect-[2/3] shrink-0"
      >
        <img
          src={posterImage}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover object-top"
        />

        {/* Hover Action Drawer */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/70 to-transparent p-3 flex flex-col justify-end transition-opacity duration-150 z-20 ${
            isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Quick Buttons */}
          <div className="flex items-center gap-2 mb-2">
            <button
              className="w-8 h-8 rounded-full bg-white hover:bg-white/90 text-black flex items-center justify-center shadow-md transition-transform hover:scale-105"
              title="Play"
            >
              <Play className="w-4 h-4 fill-black ml-0.5" />
            </button>

            <motion.button
              onClick={handleLike}
              animate={likeBouncing ? { scale: [1, 1.35, 0.95, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                isLiked
                  ? 'border-[#E50914] bg-[#E50914] text-white'
                  : 'border-white/40 hover:border-white text-white bg-[#2A2A2A]/80'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
            </motion.button>
          </div>

          <h4 className="font-bold text-sm text-white leading-snug line-clamp-1">{title}</h4>

          <div className="flex items-center gap-2 text-[11px] text-gray-300 mt-1">
            <span className="text-[#46D369] font-bold">{movie?.vote_average.toFixed(1)} ★</span>
            <span>{movie?.release_date.split('-')[0]}</span>
            <span className="border border-white/30 text-[9px] px-1 rounded uppercase font-semibold">
              HD
            </span>
          </div>

          <p className="text-[11px] text-[#A7A7A7] truncate mt-1">{subtitle}</p>
        </div>
      </motion.div>
    );
  }

  // ELECTRIC BLUE MUSIC CARD
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.25,
        delay: Math.min(index * 0.035, 0.35),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={shouldReduceMotion ? {} : { y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      className="group p-3 rounded-xl bg-[#080D1A]/90 hover:bg-[#0E162B] border border-blue-500/15 hover:border-blue-400/40 transition-all cursor-pointer select-none w-full flex flex-col shadow-lg"
    >
      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3 shadow-md border border-white/10">
        <img
          src={posterImage}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover"
        />

        {/* Floating Electric Blue Play Button on Hover */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={
            isHovered || isCurrentSongPlaying
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 8 }
          }
          transition={{ duration: 0.15 }}
          className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-[#0070F3] hover:bg-blue-600 hover:scale-110 text-white flex items-center justify-center shadow-xl shadow-blue-600/40 transition-transform"
        >
          {isCurrentSongPlaying ? (
            <Volume2 className="w-5 h-5 text-white animate-pulse" />
          ) : (
            <Play className="w-4 h-4 fill-white ml-0.5 text-white" />
          )}
        </motion.button>
      </div>

      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-sm text-white truncate hover:text-cyan-300 transition-colors">{title}</h4>
          <p className="text-xs text-gray-400 truncate mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            ref={addBtnRef}
            onClick={handleOpenPlaylist}
            className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity"
            title="Add to Playlist"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <motion.button
            onClick={handleLike}
            animate={likeBouncing ? { scale: [1, 1.35, 0.95, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`p-1 transition-opacity ${
              isLiked ? 'opacity-100 text-[#0070F3]' : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white'
            }`}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
