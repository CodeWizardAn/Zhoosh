import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '@/types';
import { MediaCard } from '../cards/MediaCard';
import { SkeletonCard } from '../cards/SkeletonCard';

interface ShelfRowProps {
  title: string;
  subtitle?: string;
  badge?: string;
  movies?: Movie[];
  isLoading?: boolean;
  shelfIndex?: number;
}

export const ShelfRow: React.FC<ShelfRowProps> = ({
  title,
  subtitle,
  movies = [],
  isLoading = false,
  shelfIndex = 0,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.1 + shelfIndex * 0.05, // First 100ms, +50ms per shelf
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="relative group/shelf py-2"
    >
      {/* Shelf Header */}
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight hover:underline cursor-pointer">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-[#A7A7A7] mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Explore indicator */}
        <div className="hidden sm:flex items-center gap-1.5 opacity-0 group-hover/shelf:opacity-100 transition-opacity">
          <button
            onClick={() => scroll('left')}
            className="w-7 h-7 rounded-full bg-[#181818] border border-[#333333] hover:border-white flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-7 h-7 rounded-full bg-[#181818] border border-[#333333] hover:border-white flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={rowRef}
        className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 scroll-smooth"
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} variant="movie" index={idx} />
            ))
          : movies.map((movie, idx) => (
              <MediaCard
                key={movie.id}
                item={movie}
                variant="movie"
                index={idx}
              />
            ))}
      </div>
    </motion.div>
  );
};
