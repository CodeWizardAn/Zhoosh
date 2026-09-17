import React, { useEffect } from 'react';
import { Heart, Film, Music2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { MediaCard } from '../cards/MediaCard';
import { EmptyState } from '../common/EmptyState';
import type { Movie, Song } from '@/types';

export const LikesView: React.FC = () => {
  const { likedItems, likedIds, setActiveNav, mode, playTrack } = useAppStore();
  const isMusicMode = mode === 'music';

  const allItems = Object.values(likedItems);

  // Cinema watchlist vs Music saved tracks
  const likedMovies = allItems.filter(
    (item): item is Movie =>
      ('genres' in item || 'release_date' in item || 'director' in item || 'overview' in item) &&
      !!likedIds[String(item.id)]
  );

  const likedSongs = allItems.filter(
    (item): item is Song =>
      ('artist' in item && 'album_art' in item) &&
      !!likedIds[String(item.id)]
  );

  const activeCount = isMusicMode ? likedSongs.length : likedMovies.length;

  return (
    <div className={`relative min-h-screen pb-28 ${isMusicMode ? 'bg-[#05070E]' : 'bg-[#07070b]'} overflow-x-hidden`}>
      {/* ── Black & Red / Black & Blue Faded Grid Background Layer ── */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <div
          className={`absolute inset-0 opacity-90 ${
            isMusicMode ? 'music-grid-pattern' : 'dashboard-grid-pattern'
          }`}
        />
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-[1200px] h-[500px] rounded-full blur-[120px] ${
            isMusicMode ? 'bg-[#0070F3]/16' : 'bg-[#E50914]/15'
          }`}
        />
        <div
          className={`absolute top-[40%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[140px] ${
            isMusicMode ? 'bg-[#00D2FF]/12' : 'bg-[#B81D24]/12'
          }`}
        />
        <div
          className={`absolute top-[70%] left-[-5%] w-[600px] h-[600px] rounded-full blur-[140px] ${
            isMusicMode ? 'bg-[#1D4ED8]/12' : 'bg-[#E50914]/10'
          }`}
        />
        <div
          className="absolute inset-0"
          style={{
            background: isMusicMode
              ? 'radial-gradient(ellipse at 50% 20%, transparent 40%, rgba(5,7,14,0.85) 85%)'
              : 'radial-gradient(ellipse at 50% 20%, transparent 40%, rgba(5,5,8,0.75) 85%)'
          }}
        />
      </div>

      <div className="relative z-10 px-6 sm:px-10 py-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 backdrop-blur-xs">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-lg ${
                isMusicMode
                  ? 'bg-[#0070F3]/15 border-[#0070F3]/40 text-[#0070F3] shadow-blue-500/20'
                  : 'bg-[#E50914]/15 border-[#E50914]/30 text-[#E50914] shadow-[#E50914]/10'
              }`}
            >
              <Heart
                className={`w-6 h-6 ${
                  isMusicMode ? 'fill-[#0070F3]' : 'fill-[#E50914]'
                }`}
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isMusicMode ? 'Liked Songs' : 'My Watchlist'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                {isMusicMode
                  ? 'All your favorite tracks, melodies, and saved music in one place'
                  : 'Your personalized cinema watchlist and saved movies'}
              </p>
            </div>
          </div>

          {/* Actions & Count Badge */}
          <div className="flex items-center gap-3">
            {isMusicMode && likedSongs.length > 0 && (
              <button
                onClick={() => {
                  playTrack(likedSongs[0], likedSongs);
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#0070F3] hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-500/30 transition-all cursor-pointer hover:scale-105"
              >
                <Music2 className="w-3.5 h-3.5" />
                <span>Play All ({likedSongs.length})</span>
              </button>
            )}

            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300">
              {isMusicMode ? (
                <Music2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <Film className="w-4 h-4 text-[#E50914]" />
              )}
              <span>
                {activeCount} Saved {isMusicMode ? (activeCount === 1 ? 'Track' : 'Tracks') : (activeCount === 1 ? 'Movie' : 'Movies')}
              </span>
            </span>
          </div>
        </div>

        {/* Content Grid or Empty State */}
        {isMusicMode ? (
          likedSongs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {likedSongs.map((song, idx) => (
                <MediaCard
                  key={song.id}
                  item={song}
                  variant="song"
                  index={idx}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              type="likes"
              title="No saved tracks yet"
              description="Click the heart icon on any song card to save it to your personal music library."
              actionText="Browse Music"
              onAction={() => setActiveNav('discover')}
            />
          )
        ) : (
          likedMovies.length > 0 ? (
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
          )
        )}
      </div>
    </div>
  );
};

export default LikesView;
