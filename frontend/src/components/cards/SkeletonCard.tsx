import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonCardProps {
  variant?: 'movie' | 'song' | 'song-row';
  index?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = 'movie',
  index = 0,
}) => {
  // Stagger entrance by 35ms per card
  const delay = Math.min(index * 0.035, 0.4);

  if (variant === 'song-row') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay, ease: 'easeOut' }}
        className="flex items-center gap-4 p-3 rounded-xl bg-[#14141E]/60 border border-white/5 overflow-hidden relative"
      >
        <div className="w-12 h-12 rounded-lg bg-white/5 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-44 rounded bg-white/10 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          <div className="h-3 w-28 rounded bg-white/5 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
        <div className="w-12 h-3 rounded bg-white/5 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl bg-[#14141F]/80 border border-white/5 ${
        variant === 'movie' ? 'w-48 sm:w-56 aspect-[2/3]' : 'w-44 sm:w-52 aspect-square p-3'
      }`}
    >
      {/* Shimmer sweep */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 pointer-events-none" />

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
          <div className="w-full aspect-square rounded-xl bg-white/10" />
          <div className="space-y-1.5 mt-2">
            <div className="h-3.5 w-4/5 rounded bg-white/15" />
            <div className="h-3 w-1/2 rounded bg-white/10" />
          </div>
        </div>
      )}
    </motion.div>
  );
};
