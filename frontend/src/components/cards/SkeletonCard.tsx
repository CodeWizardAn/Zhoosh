import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonCardProps {
  variant?: 'movie' | 'song' | 'song-row' | 'song-card';
  theme?: 'red' | 'blue';
  index?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = 'movie',
  theme,
  index = 0,
}) => {
  // Stagger entrance by 35ms per card
  const delay = Math.min(index * 0.035, 0.4);
  const isBlue = theme === 'blue' || variant === 'song' || variant === 'song-row' || variant === 'song-card';

  if (variant === 'song-row') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay, ease: 'easeOut' }}
        className="flex items-center gap-4 p-3 rounded-xl bg-[#060C1B]/70 border border-blue-500/15 overflow-hidden relative"
      >
        <div className="w-12 h-12 rounded-lg bg-blue-950/40 relative overflow-hidden shrink-0 border border-blue-500/20">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-44 rounded bg-blue-900/30 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
          </div>
          <div className="h-3 w-28 rounded bg-blue-950/30 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
          </div>
        </div>
        {/* Pulsing Equalizer Bars for Music Theme */}
        <div className="flex items-end gap-1 h-5 pr-2">
          <span className="w-1 h-3 bg-cyan-400/40 rounded-full animate-pulse" />
          <span className="w-1 h-5 bg-blue-500/60 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-2.5 bg-cyan-400/40 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
        <div className="w-12 h-3 rounded bg-blue-950/40 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
        </div>
      </motion.div>
    );
  }

  if (variant === 'song-card') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay, ease: 'easeOut' }}
        className="relative flex-shrink-0 w-[175px] sm:w-[195px] md:w-[210px] select-none"
      >
        <div className="relative rounded-xl overflow-hidden aspect-square bg-[#060C1B]/80 border border-blue-500/20 shadow-lg">
          {/* Electric Blue Shimmer Sweep */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent z-10 pointer-events-none" />

          {/* Equalizer Icon Center Badge */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div className="flex items-end gap-1.5 h-8">
              <span className="w-1.5 h-4 bg-cyan-400 rounded-full animate-pulse" />
              <span className="w-1.5 h-8 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              <span className="w-1.5 h-7 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
            </div>
          </div>
        </div>

        {/* Text placeholders */}
        <div className="space-y-1.5 mt-2.5 px-1">
          <div className="h-4 w-4/5 rounded bg-blue-900/30 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
          </div>
          <div className="h-3 w-1/2 rounded bg-blue-950/40 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl ${
        isBlue
          ? 'bg-[#060C1B]/80 border border-blue-500/20'
          : 'bg-[#14141F]/80 border border-white/5'
      } ${
        variant === 'movie' ? 'w-48 sm:w-56 aspect-[2/3]' : 'w-44 sm:w-52 aspect-square p-3'
      }`}
    >
      {/* Shimmer sweep */}
      <div
        className={`absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] z-10 pointer-events-none ${
          isBlue
            ? 'bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent'
            : 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
        }`}
      />

      {/* Content placeholders */}
      {variant === 'movie' ? (
        <div className="absolute bottom-0 inset-x-0 p-4 space-y-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <div className="h-4 w-3/4 rounded bg-white/15" />
          <div className="flex gap-2">
            <div className="h-3 w-12 rounded bg-white/10" />
            <div className="h-3 w-16 rounded bg-white/10" />
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col justify-between">
          <div className={`w-full aspect-square rounded-xl ${isBlue ? 'bg-blue-950/40' : 'bg-white/10'}`} />
          <div className="space-y-1.5 mt-2">
            <div className={`h-3.5 w-4/5 rounded ${isBlue ? 'bg-blue-900/40' : 'bg-white/15'}`} />
            <div className={`h-3 w-1/2 rounded ${isBlue ? 'bg-blue-950/30' : 'bg-white/10'}`} />
          </div>
        </div>
      )}
    </motion.div>
  );
};
