import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Film, Music2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { MOCK_MOVIES, MOCK_SONGS } from '@/api/mockData';
import { MediaCard } from '../cards/MediaCard';
import { EmptyState } from '../common/EmptyState';

export const LikesView: React.FC = () => {
  const { likedIds, mode, setActiveNav } = useAppStore();

  const likedMovies = MOCK_MOVIES.filter((m) => !!likedIds[String(m.id)]);
  const likedSongs = MOCK_SONGS.filter((s) => !!likedIds[String(s.id)]);

  const itemsToShow = mode === 'movies' ? likedMovies : likedSongs;

  return (
    <div className="px-6 sm:px-10 py-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Heart className="w-6 h-6 fill-rose-500/50" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Your Liked Library
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Personalized bookmark queue that feeds continuous training to your AI recommendation model
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
            {likedMovies.length} Movies • {likedSongs.length} Songs
          </span>
        </div>
      </div>

      {/* Grid or Empty State */}
      {itemsToShow.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {itemsToShow.map((item, idx) => (
            <MediaCard
              key={item.id}
              item={item}
              variant={mode === 'movies' ? 'movie' : 'song'}
              index={idx}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          type="likes"
          title={`No liked ${mode} yet`}
          description={`Click the heart icon on any ${mode === 'movies' ? 'movie poster' : 'song card'} to save it to your library.`}
          actionText={`Browse ${mode === 'movies' ? 'Movies' : 'Music'}`}
          onAction={() => setActiveNav('discover')}
        />
      )}
    </div>
  );
};
