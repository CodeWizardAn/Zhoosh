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

  const NAV_ITEMS = ['Home', 'assistant', 'My Zhoosh'];

  const handleNavClick = (item: string) => {
    if (item === 'My Zhoosh' || item === 'Zhoosh' || item === 'My List') {
      setActiveNav('likes');
    } else if (item === 'assistant') {
      setActiveNav('agent-ai');
    } else {
      setActiveNav('discover');
    }
  };

  const isNavActive = (item: string) => {
    if ((item === 'My Zhoosh' || item === 'Zhoosh') && activeNav === 'likes') return true;
    if (item === 'assistant' && activeNav === 'agent-ai') return true;
    if (item === 'Home' && (activeNav === 'discover' || activeNav === 'trending')) return true;
    return false;
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 h-16 flex items-center px-4 sm:px-8 gap-4 select-none bg-[#050508]/95 backdrop-blur-md border-b border-white/10 transition-colors">
        {/* LEFT: Zhoosh Brand Logo */}
        <button
          onClick={() => setActiveNav('discover')}
          className="shrink-0 flex items-center pr-2 cursor-pointer group"
          title="Zhoosh Home"
        >
          <ZhooshLogo size="sm" variant="auto" showWordmark={true} />
        </button>

        {/* CENTER: Nav links with active pill */}
        <nav className="hidden md:flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
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
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-full shadow-md'
                      : 'bg-white/20 text-white font-semibold rounded-full shadow-sm'
                    : isAIItem
                    ? mode === 'movies'
                      ? 'text-red-400 hover:text-white font-semibold'
                      : 'text-emerald-400 hover:text-white font-semibold'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {isAIItem && (
                  <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-white/40 bg-purple-900/60">
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

        {/* RIGHT controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 ml-auto shrink-0">
          {/* Movies / Music Mode Switcher Pill */}
          <div className="flex items-center bg-black/60 border border-white/20 rounded-full p-0.5 shadow-inner backdrop-blur-md">
            <button
              onClick={() => {
                if (mode !== 'movies') {
                  setMode('movies');
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === 'movies'
                  ? 'bg-[#E50914] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Movies Mode"
            >
              <Film className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cinema</span>
            </button>
            <button
              onClick={() => {
                if (mode !== 'music') {
                  setMode('music');
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === 'music'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Music Mode"
            >
              <Music2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Music</span>
            </button>
          </div>

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
                    placeholder="Search movies, shows..."
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
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/20 group-hover:ring-[#FF1E56] transition-all shadow-md shadow-black/40 flex items-center justify-center bg-black/40">
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
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#FF1E56]/40 shrink-0 shadow-md">
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
