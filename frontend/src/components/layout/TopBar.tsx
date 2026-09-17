import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  User as UserIcon,
  LogOut,
  Edit3,
  ChevronDown,
  Lock,
  HelpCircle,
  Film,
  Music2,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAgentStore } from '@/store/useAgentStore';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { PlanDetailsModal } from '@/components/profile/PlanDetailsModal';
import { NETFLIX_AVATARS, DEFAULT_AVATAR, sanitizeAvatar } from '@/utils/avatars';
import { ZhooshLogo } from '@/components/common/ZhooshLogo';

interface TopBarProps {
  onSearchChange: (q: string) => void;
  searchValue: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onSearchChange, searchValue }) => {
  const {
    mode,
    setMode,
    activeNav,
    setActiveNav,
    user,
    setUser,
    openAuth,
    logoutAndRedirect,
  } = useAppStore();

  const { profile: agentProfile } = useAgentStore();
  const assistantName = agentProfile?.name || 'Nova';

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Dynamic Navigation Items based on active mode
  const NAV_ITEMS = mode === 'movies'
    ? ['Home', 'assistant', 'My Zhoosh']
    : ['Home', 'Playlist', 'assistant'];

  const handleNavClick = (item: string) => {
    if (item === 'Playlist') {
      setActiveNav('playlists');
    } else if (item === 'My Zhoosh' || item === 'Zhoosh' || item === 'My List') {
      setActiveNav('likes');
    } else if (item === 'assistant') {
      setActiveNav('agent-ai');
    } else {
      setActiveNav('discover');
    }
  };

  const isNavActive = (item: string) => {
    if (item === 'Playlist' && activeNav === 'playlists') return true;
    if ((item === 'My Zhoosh' || item === 'Zhoosh') && activeNav === 'likes') return true;
    if (item === 'assistant' && activeNav === 'agent-ai') return true;
    if (item === 'Home' && (activeNav === 'discover' || activeNav === 'trending')) return true;
    return false;
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 h-16 flex items-center px-4 sm:px-8 gap-4 sm:gap-6 select-none bg-[#050508]/95 backdrop-blur-md border-b border-white/10 transition-colors">
        {/* LEFT: Zhoosh Brand Logo & Navigation Links */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <button
            onClick={() => setActiveNav('discover')}
            className="shrink-0 flex items-center pr-2 cursor-pointer group"
            title="Zhoosh Home"
          >
            <ZhooshLogo size="sm" variant="wordmark" />
          </button>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(item);
              const isAIItem = item === 'assistant';
              return (
                <button
                  key={item}
                  onClick={() => handleNavClick(item)}
                  className={`px-3.5 py-1 text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? isAIItem
                        ? mode === 'movies'
                          ? 'bg-[#E50914] text-white font-bold rounded-full shadow-md shadow-red-950/60'
                          : 'bg-[#0070F3] text-white font-bold rounded-full shadow-md shadow-blue-600/50'
                        : mode === 'music'
                        ? 'bg-blue-600/30 border border-blue-500/50 text-white font-semibold rounded-full shadow-sm'
                        : 'bg-white/20 text-white font-semibold rounded-full shadow-sm'
                      : isAIItem
                      ? mode === 'movies'
                        ? 'text-red-400 hover:text-white font-semibold'
                        : 'text-blue-400 hover:text-white font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {isAIItem && (
                    <div className={`w-4 h-4 rounded-full overflow-hidden shrink-0 border ${
                      mode === 'movies' ? 'border-red-400/40 bg-purple-900/60' : 'border-blue-400/60 bg-blue-950/80'
                    }`}>
                      <img
                        src={agentProfile?.avatarUrl || '/agent-avatar.jpg'}
                        alt={assistantName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/agent-avatar.jpg';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <span>{isAIItem ? assistantName : item}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dynamic spacer that absorbs space so search and nav never overlap */}
        <div className="flex-1 min-w-2" />

        {/* RIGHT controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Cinema / Music Mode Switcher Pill */}
          <div className="relative flex items-center p-1 rounded-full bg-[#0d0f18]/85 border border-white/10 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.8),0_4px_16px_rgba(0,0,0,0.4)] backdrop-blur-xl group/toggle">
            {/* Dynamic ambient halo glow behind active mode */}
            <div
              className={`absolute -inset-0.5 rounded-full blur-md transition-opacity duration-500 pointer-events-none -z-10 ${
                mode === 'movies'
                  ? 'bg-gradient-to-r from-red-600/30 to-red-900/10 opacity-70'
                  : 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 opacity-70'
              }`}
            />

            {/* Cinema Button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                if (mode !== 'movies') {
                  setMode('movies');
                  if (activeNav === 'playlists') {
                    setActiveNav('discover');
                  }
                }
              }}
              className={`relative flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all z-10 cursor-pointer select-none ${
                mode === 'movies'
                  ? 'text-white font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              title="Switch to Cinema Mode"
            >
              {mode === 'movies' && (
                <motion.div
                  layoutId="topbarActivePill"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[#E50914] via-[#F40612] to-[#B81D24] shadow-[0_2px_12px_rgba(229,9,20,0.55),inset_0_1px_1px_rgba(255,255,255,0.35)] -z-10"
                />
              )}
              <Film className={`w-3.5 h-3.5 shrink-0 transition-transform ${mode === 'movies' ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]' : 'text-zinc-400'}`} />
              <span className="font-semibold text-[11px] sm:text-xs">Cinema</span>
            </motion.button>

            {/* Music Button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                if (mode !== 'music') {
                  setMode('music');
                  if (activeNav === 'likes') {
                    setActiveNav('playlists');
                  }
                }
              }}
              className={`relative flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all z-10 cursor-pointer select-none ${
                mode === 'music'
                  ? 'text-white font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              title="Switch to Music Mode"
            >
              {mode === 'music' && (
                <motion.div
                  layoutId="topbarActivePill"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0062E3] via-[#0070F3] to-[#00D2FF] shadow-[0_2px_14px_rgba(0,112,243,0.55),inset_0_1px_1px_rgba(255,255,255,0.35)] -z-10"
                />
              )}
              <Music2 className={`w-3.5 h-3.5 shrink-0 transition-transform ${mode === 'music' ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]' : 'text-zinc-400'}`} />
              <span className="font-semibold text-[11px] sm:text-xs">Music</span>
            </motion.button>
          </div>

          {/* Search */}
          <div className="flex items-center">
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden mr-1"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder={mode === 'movies' ? 'Search movies, genres...' : 'Search songs, singers, romantic...'}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-black/80 border border-white/30 rounded px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white/60"
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
              className="p-1.5 text-gray-200 hover:text-white transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>


          {/* Profile Dropdown (Screenshot 1 & 2) */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 group p-1 rounded-full hover:bg-white/5 transition-all cursor-pointer"
                title="Account & Profile"
              >
                <div className={`w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/20 transition-all shadow-md shadow-black/40 flex items-center justify-center bg-black/40 ${
                  mode === 'movies' ? 'group-hover:ring-[#FF1E56]' : 'group-hover:ring-[#0070F3]'
                }`}>
                  <img
                    src={sanitizeAvatar(user.avatar)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-300 group-hover:text-white transition-transform duration-200 ${
                    isProfileOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#0D0B14]/95 backdrop-blur-xl border border-white/15 shadow-2xl p-2.5 text-sm text-white z-50 select-none"
                  >
                    {/* Upward triangle pointer caret */}
                    <div className="absolute -top-1.5 right-4 w-3 h-3 bg-[#0D0B14] border-t border-l border-white/15 rotate-45" />

                    {/* Active Profile Info */}
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.05] border border-white/10 mb-2">
                      <div className={`w-10 h-10 rounded-full overflow-hidden ring-2 shrink-0 shadow-md ${
                        mode === 'movies' ? 'ring-[#FF1E56]/40' : 'ring-[#0070F3]/40'
                      }`}>
                        <img
                          src={sanitizeAvatar(user.avatar)}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white truncate">
                            {user.name || 'Advaith'}
                          </span>
                          <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1" />
                        </div>
                        <span className="text-xs text-gray-400 truncate">
                          {user.email || 'advaith@zhoosh.stream'}
                        </span>
                      </div>
                    </div>

                    {/* Management Menu Items */}
                    <div className="flex flex-col py-1 text-sm font-normal text-gray-200 space-y-0.5">
                      {/* Manage Profile */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4 text-gray-300 stroke-[1.75]" />
                        <span>Manage Profile</span>
                      </button>

                      {/* Account */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsPlanModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-gray-300 stroke-[1.75]" />
                        <span>Account</span>
                      </button>

                      {/* Help Centre */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          useAppStore.getState().addToast({
                            title: 'Help Centre',
                            description: 'Visit support.zhoosh.ai or chat with Nova for help.',
                            type: 'info'
                          });
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
                      >
                        <HelpCircle className="w-4 h-4 text-gray-300 stroke-[1.75]" />
                        <span>Help Centre</span>
                      </button>
                    </div>

                    {/* Divider & Sign Out */}
                    <div className="border-t border-white/10 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logoutAndRedirect();
                        }}
                        className="w-full px-3 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-gray-300 transition-colors text-center text-sm font-medium cursor-pointer"
                      >
                        Sign out of Zhoosh
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => openAuth('login')}
              className="px-4 py-1.5 rounded text-sm font-semibold text-white transition-all hover:opacity-80 bg-[#E50914]"
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
