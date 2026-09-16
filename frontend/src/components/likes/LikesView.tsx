import React from 'react';
import { Heart, Film } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { MediaCard } from '../cards/MediaCard';
import { EmptyState } from '../common/EmptyState';
import type { Movie } from '@/types';

export const LikesView: React.FC = () => {
  const { likedItems, likedIds, setActiveNav } = useAppStore();

  const allItems = Object.values(likedItems);
  // Pure cinema watchlist: only include movies
  const likedMovies = allItems.filter(
    (item): item is Movie =>
      ('genres' in item || 'release_date' in item || 'director' in item || 'overview' in item) &&
      !!likedIds[String(item.id)]
  );

  return (
    <div className="relative min-h-screen pb-28 bg-[#07070b] overflow-x-hidden">
      {/* Black & Red Faded Grid Design Background Layer */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <div className="absolute inset-0 dashboard-grid-pattern opacity-90" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-[1200px] h-[500px] rounded-full bg-[#E50914]/15 blur-[120px]" />
        <div className="absolute top-[40%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#B81D24]/12 blur-[140px]" />
        <div className="absolute top-[70%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[#E50914]/10 blur-[140px]" />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 20%, transparent 40%, rgba(5,5,8,0.75) 85%)'
          }}
        />
      </div>

      <div className="relative z-10 px-6 sm:px-10 py-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 backdrop-blur-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] shadow-lg shadow-[#E50914]/10">
              <Heart className="w-6 h-6 fill-[#E50914]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                My Zhoosh
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Your personalized cinema watchlist and saved movies
              </p>
            </div>
          </div>

          {/* Cinema Count Badge */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141414] border border-white/10 text-xs font-bold text-gray-300">
              <Film className="w-4 h-4 text-[#E50914]" />
              <span>{likedMovies.length} Saved {likedMovies.length === 1 ? 'Movie' : 'Movies'}</span>
            </span>
          </div>
        </div>

        {/* Movie Grid or Empty State */}
        {likedMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {likedMovies.map((movie, idx) => (
              <MediaCard
                key={movie.id}
                item={movie}
                variant="movie"
                index={idx}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            type="likes"
            title="No saved movies yet"
            description="Click the heart icon on any movie poster or in the movie details modal to add it to your personal watchlist."
            actionText="Browse Cinema"
            onAction={() => setActiveNav('discover')}
          />
        )}
      </div>
    </div>
  );
};
