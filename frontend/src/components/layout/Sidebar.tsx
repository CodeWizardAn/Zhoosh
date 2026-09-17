import React from 'react';
import { motion } from 'framer-motion';
import {
  Film,
  Music,
  Home,
  Sparkles,
  TrendingUp,
  Heart,
  Plus,
  Compass,
  Bookmark,
  Disc,
  Library,
  Trash2
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { AppMode } from '@/types';

import { ZhooshLogo } from '../common/ZhooshLogo';
import { zhooshAudio } from '@/utils/cinematicSound';

export const Sidebar: React.FC = () => {
  const {
    mode,
    setMode,
    activeNav,
    setActiveNav,
    likedIds,
    likedItems,
    playlists,
    createPlaylist,
    deletePlaylist,
    addToast,
    openOnboarding
  } = useAppStore();

  const likedSongsCount = Object.values(likedItems).filter((i) => 'artist' in i && !!likedIds[String(i.id)]).length;
  const likedMoviesCount = Object.values(likedItems).filter((i) => !('artist' in i) && !!likedIds[String(i.id)]).length;
  const activeLikesCount = mode === 'music' ? likedSongsCount : likedMoviesCount;

  const handleCreateNewPlaylist = () => {
    const pl = createPlaylist(
      mode === 'movies' ? 'Watchlist Collection' : 'My New Playlist',
      'Curated mix',
      mode
    );
    setActiveNav('playlists');
    addToast({ title: `Created "${pl.title}"`, type: 'success' });
  };

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-[#07070B] border-r border-purple-950/30 flex flex-col justify-between p-3 select-none z-30 font-sans shadow-2xl">
      <div className="space-y-4">
        {/* Zhoosh Brand Header (Name only in Dashboard) */}
        <div
          onClick={() => {
            try {
              zhooshAudio.playZhooshIntroSound();
            } catch {}
          }}
          className="flex items-center px-2.5 py-2 cursor-pointer hover:opacity-95 transition-opacity"
          title="Click to play Zhoosh signature sound"
        >
          <ZhooshLogo size="sm" variant="wordmark" />
        </div>

        {/* Mode Switcher Segmented Control: Red (Movies) vs Purple (Music) */}
        <div className="p-1 rounded-xl bg-[#12121A] border border-purple-500/20 flex relative shadow-inner">
          <button
            onClick={() => {
              setMode('movies');
              try { zhooshAudio.playZhooshIntroSound(); } catch {}
            }}
            className={`relative flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 z-10 ${
              mode === 'movies' ? 'text-white' : 'text-[#A0A0B0] hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Movies</span>
            {mode === 'movies' && (
              <motion.div
                layoutId="activeModePill"
                className="absolute inset-0 bg-gradient-to-r from-[#FF1E56] to-[#E50914] rounded-lg -z-10 shadow-[0_0_12px_rgba(255,30,86,0.4)]"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
          </button>

          <button
            onClick={() => {
              setMode('music');
              try { zhooshAudio.playZhooshIntroSound(); } catch {}
            }}
            className={`relative flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 z-10 ${
              mode === 'music' ? 'text-white font-bold' : 'text-[#A0A0B0] hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Music</span>
            {mode === 'music' && (
              <motion.div
                layoutId="activeModePill"
                className="absolute inset-0 bg-gradient-to-r from-[#9D4EDD] to-[#A855F7] rounded-lg -z-10 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
          </button>
        </div>

        {/* Primary Menu */}
        <nav className="space-y-0.5">
          <button
            onClick={() => setActiveNav('discover')}
            className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeNav === 'discover'
                ? 'text-white bg-[#282828]'
                : 'text-[#B3B3B3] hover:text-white hover:bg-[#181818]'
            }`}
          >
            <Home className={`w-4 h-4 ${activeNav === 'discover' ? (mode === 'movies' ? 'text-[#FF1E56]' : 'text-[#A855F7]') : ''}`} />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveNav('agent-ai')}
            className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeNav === 'agent-ai'
                ? 'text-white bg-[#282828]'
                : 'text-[#B3B3B3] hover:text-white hover:bg-[#181818]'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeNav === 'agent-ai' ? (mode === 'movies' ? 'text-[#FF1E56]' : 'text-[#A855F7]') : ''}`} />
            <span>For You</span>
          </button>

          <button
            onClick={() => setActiveNav('trending')}
            className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeNav === 'trending'
                ? 'text-white bg-[#282828]'
                : 'text-[#B3B3B3] hover:text-white hover:bg-[#181818]'
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${activeNav === 'trending' ? (mode === 'movies' ? 'text-[#FF1E56]' : 'text-[#A855F7]') : ''}`} />
            <span>Trending</span>
          </button>
        </nav>

        {/* Secondary Library Menu */}
        <div className="pt-2 border-t border-[#222222]">
          <div className="flex items-center justify-between px-3 py-1 mb-1">
            <span className="text-xs font-bold text-[#A7A7A7] uppercase tracking-wider flex items-center gap-1.5">
              <Library className="w-3.5 h-3.5" />
              Your Library
            </span>
            <button
              onClick={handleCreateNewPlaylist}
              className="p-1 rounded-full text-[#B3B3B3] hover:text-white hover:bg-[#282828] transition-colors"
              title="Create Playlist"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-0.5">
            <button
              onClick={() => setActiveNav('likes')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeNav === 'likes'
                  ? 'text-white bg-[#282828]'
                  : 'text-[#B3B3B3] hover:text-white hover:bg-[#181818]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded flex items-center justify-center ${
                  mode === 'movies' ? 'bg-[#FF1E56]/20 text-[#FF1E56]' : 'bg-[#0070F3]/20 text-[#0070F3]'
                }`}>
                  <Heart className="w-3 h-3 fill-current" />
                </div>
                <span>{mode === 'music' ? 'Liked Songs' : 'Liked Movies'}</span>
              </div>
              <span className="text-xs text-[#727272]">{activeLikesCount}</span>
            </button>

            <button
              onClick={() => setActiveNav('playlists')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeNav === 'playlists'
                  ? 'text-white bg-[#282828]'
                  : 'text-[#B3B3B3] hover:text-white hover:bg-[#181818]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-[#282828] text-white flex items-center justify-center">
                  <Bookmark className="w-3 h-3" />
                </div>
                <span>Playlists</span>
              </div>
              <span className="text-xs text-[#727272]">{playlists.length}</span>
            </button>
          </div>

          {/* User Playlists list */}
          <div className="mt-3 px-3 space-y-1 max-h-44 overflow-y-auto no-scrollbar">
            {playlists.map((pl) => (
              <div key={pl.id} className="w-full flex items-center justify-between group/sidepl py-0.5">
                <button
                  onClick={() => setActiveNav('playlists')}
                  className="flex-1 text-left text-xs text-[#A7A7A7] hover:text-white truncate block transition-colors cursor-pointer pr-1"
                  title={pl.title}
                >
                  {pl.title}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePlaylist(pl.id);
                    addToast({ title: `Deleted playlist "${pl.title}"`, type: 'info' });
                  }}
                  className="opacity-0 group-hover/sidepl:opacity-100 p-1 text-gray-500 hover:text-rose-400 transition-opacity cursor-pointer shrink-0"
                  title={`Delete "${pl.title}"`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Onboarding Tour Button */}
        <div className="px-2 pt-2">
          <button
            onClick={openOnboarding}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-gradient-to-r from-[#FF1E56]/10 to-[#A855F7]/10 hover:from-[#FF1E56]/20 hover:to-[#A855F7]/20 border border-[#A855F7]/30 transition-all hover:scale-[1.02] group shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF1E56] group-hover:rotate-12 transition-transform" />
              <span>Onboarding Flow</span>
            </div>
            <span className="text-[10px] bg-[#A855F7]/20 text-[#A855F7] px-1.5 py-0.5 rounded font-mono font-bold">5 Steps</span>
          </button>
        </div>
      </div>

      {/* Account Footer */}
      <div className="pt-3 border-t border-[#222222] px-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#333333] flex items-center justify-center text-xs font-bold text-white shrink-0">
            AM
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">Alex Mercer</p>
            <p className="text-[10px] text-[#A7A7A7] truncate">Premium Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
