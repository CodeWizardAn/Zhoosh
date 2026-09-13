import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Bell,
  User as UserIcon,
  LogOut,
  Headphones,
  Film,
  CreditCard,
  Edit3,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ZhooshLogo } from '@/components/common/ZhooshLogo';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { PlanDetailsModal } from '@/components/profile/PlanDetailsModal';

interface TopBarProps {
  onSearchChange: (q: string) => void;
  searchValue: string;
}

const MOVIE_NAV = ['Home', 'Movies', 'New & Popular', 'My List', 'Browse by Language'];
const MUSIC_NAV = ['Home', 'Music', 'New Releases', 'Liked Music', 'Playlists'];

export const TopBar: React.FC<TopBarProps> = ({ onSearchChange, searchValue }) => {
  const {
    mode,
    setMode,
    activeNav,
    setActiveNav,
    user,
    openAuth,
    logout,
    openOnboarding,
  } = useAppStore();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const isMovieMode = mode === 'movies';
  const accent = isMovieMode ? '#FF1E56' : '#A855F7';
  const navItems = isMovieMode ? MOVIE_NAV : MUSIC_NAV;

  const handleNavClick = (item: string) => {
    if (item === 'My List' || item === 'Liked Music') setActiveNav('likes');
    else if (item === 'Playlists') setActiveNav('playlists');
    else setActiveNav('discover');
  };

  const isNavActive = (item: string) => {
    if ((item === 'My List' || item === 'Liked Music') && activeNav === 'likes') return true;
    if (item === 'Playlists' && activeNav === 'playlists') return true;
    if (item === 'Home' && (activeNav === 'discover' || activeNav === 'trending')) return true;
    return false;
  };

  return (
    <>
      {/* Gradient fade-from-top backdrop like Netflix */}
      <div className="fixed top-0 inset-x-0 z-40 h-28 bg-gradient-to-b from-black/90 to-transparent pointer-events-none" />

      <header className="fixed top-0 inset-x-0 z-50 h-16 flex items-center px-6 sm:px-10 gap-6 select-none">
        {/* LEFT: Logo */}
        <button
          onClick={() => setActiveNav('discover')}
          className="shrink-0 flex items-center"
        >
          <ZhooshLogo size="sm" variant="emblem" showText={true} animated={false} />
        </button>

        {/* CENTER: Nav links — Netflix style */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = isNavActive(item);
            return (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`relative px-3 py-1.5 text-sm font-medium transition-colors ${
                  active ? 'text-white font-semibold' : 'text-gray-300 hover:text-white'
                }`}
              >
                {item}
                {active && (
                  <motion.div
                    layoutId="navUnderline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{ backgroundColor: accent }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* RIGHT controls */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          {/* Search */}
          <div className="flex items-center">
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden mr-1"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder={isMovieMode ? 'Search movies...' : 'Search music...'}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-black/80 border border-white/30 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/60"
                  />
                  {searchValue && (
                    <button
                      onClick={() => onSearchChange('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) onSearchChange(''); }}
              className="p-2 text-gray-200 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Mode switch */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setMode(isMovieMode ? 'music' : 'movies')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              isMovieMode
                ? 'border-[#A855F7]/60 text-[#C084FC] hover:bg-[#A855F7]/10'
                : 'border-[#FF1E56]/60 text-[#FF6B8B] hover:bg-[#FF1E56]/10'
            }`}
          >
            {isMovieMode ? <Headphones className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
            <span>{isMovieMode ? 'Switch to Music' : 'Switch to Movies'}</span>
          </motion.button>

          {/* Notifications */}
          <button className="relative p-1.5 text-gray-300 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          {/* Profile */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded overflow-hidden bg-gradient-to-br from-[#FF1E56] to-[#A855F7] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-3 w-52 rounded-xl bg-[#141414]/98 backdrop-blur-md border border-white/10 shadow-2xl p-1.5 text-sm text-white z-50"
                  >
                    <div className="px-3 py-2 border-b border-white/8 mb-1">
                      <p className="font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => { setIsProfileOpen(false); setIsProfileModalOpen(true); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/8 transition-colors text-left text-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      Modify Details
                    </button>
                    <button
                      onClick={() => { setIsProfileOpen(false); setIsPlanModalOpen(true); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/8 transition-colors text-left text-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      Check Plan
                    </button>
                    <div className="border-t border-white/8 mt-1 pt-1">
                      <button
                        onClick={() => { setIsProfileOpen(false); logout(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-left text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => openAuth('login')}
              className="px-4 py-1.5 rounded text-sm font-semibold text-white transition-all hover:opacity-80"
              style={{ backgroundColor: accent }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <PlanDetailsModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} />
    </>
  );
};
