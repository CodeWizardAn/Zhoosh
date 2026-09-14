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
    <div className="relative min-h-screen pb-24 bg-[#07070b] overflow-x-hidden">
      {/* Black & Red Faded Grid Design Background Layer */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        {/* Geometric Red Grid Mesh */}
        <div className="absolute inset-0 dashboard-grid-pattern opacity-90" />

        {/* Ambient Red Aura Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-[1200px] h-[500px] rounded-full bg-[#E50914]/15 blur-[120px]" />
        <div className="absolute top-[40%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#B81D24]/12 blur-[140px]" />
        <div className="absolute top-[70%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[#E50914]/10 blur-[140px]" />

        {/* Radial vignette fade from center */}
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
              Your personalized watchlist and bookmarks queue
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
    </div>
  );
};
