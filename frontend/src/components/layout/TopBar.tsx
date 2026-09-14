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
  ArrowRightLeft,
  HelpCircle,
  Film,
  Music2
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { PlanDetailsModal } from '@/components/profile/PlanDetailsModal';
import { NETFLIX_AVATARS, DEFAULT_AVATAR } from '@/utils/avatars';
import { ZhooshLogo } from '@/components/common/ZhooshLogo';

interface TopBarProps {
  onSearchChange: (q: string) => void;
  searchValue: string;
}

const MOVIE_NAV = ['Home', 'My Zhoosh', 'Browse by Languages'];

const KIDS_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="kidsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00C0FF"/>
      <stop offset="50%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#FF0055"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="16" fill="url(#kidsGrad)"/>
  <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="44" fill="#FFFFFF">kids</text>
</svg>
`)}`;

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

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleNavClick = (item: string) => {
    if (item === 'My Zhoosh' || item === 'Zhoosh' || item === 'My List') setActiveNav('likes');
    else setActiveNav('discover');
  };

  const isNavActive = (item: string) => {
    if ((item === 'My Zhoosh' || item === 'Zhoosh') && activeNav === 'likes') return true;
    if (item === 'Home' && (activeNav === 'discover' || activeNav === 'trending')) return true;
    return false;
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 h-16 flex items-center px-6 sm:px-10 gap-6 select-none bg-[#050508]/95 backdrop-blur-md transition-colors">
        {/* LEFT: Zhoosh Brand Logo */}
        <button
          onClick={() => setActiveNav('discover')}
          className="shrink-0 flex items-center pr-2 cursor-pointer group"
          title="Zhoosh Home"
        >
          <ZhooshLogo size="sm" variant="auto" showWordmark={true} />
        </button>

        {/* CENTER: Nav links with active pill */}
        <nav className="hidden md:flex items-center gap-1.5">
          {MOVIE_NAV.map((item) => {
            const active = isNavActive(item);
            return (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`px-3.5 py-1 text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? 'bg-white/20 text-white font-semibold rounded-full shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item}
              </button>
            );
          })}
        </nav>

        {/* RIGHT controls */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto shrink-0">
          {/* Movies / Music Mode Switcher Pill */}
          <div className="flex items-center bg-black/60 border border-white/20 rounded-full p-0.5 shadow-inner backdrop-blur-md">
            <button
              onClick={() => {
                if (mode !== 'movies') {
                  setMode('movies');
                  setActiveNav('discover');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === 'movies'
                  ? 'bg-[#E50914] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Movies Mode"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Cinema</span>
            </button>
            <button
              onClick={() => {
                if (mode !== 'music') {
                  setMode('music');
                  setActiveNav('discover');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === 'music'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Music Mode"
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>Music</span>
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
                className="flex items-center gap-1.5 group p-1 rounded hover:bg-white/5 transition-all cursor-pointer"
                title="Account & Profiles"
              >
                <div className="w-8 h-8 rounded-sm overflow-hidden ring-1 ring-white/20 group-hover:ring-white transition-all shadow bg-[#E50914] flex items-center justify-center">
                  <img
                    src={user.avatar || DEFAULT_AVATAR}
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
                    className="absolute right-0 top-full mt-2 w-60 rounded-md bg-[#141414] border border-white/15 shadow-2xl py-2 text-sm text-white z-50 select-none"
                  >
                    {/* Upward triangle pointer caret (Screenshot 2) */}
                    <div className="absolute -top-1.5 right-4 w-3 h-3 bg-[#141414] border-t border-l border-white/15 rotate-45" />

                    {/* 1. Profile Switcher List (Screenshot 2) */}
                    <div className="flex flex-col py-1">
                      {/* Profile 1: ritujapatil2005 (Blue Smiley) + Lock */}
                      <button
                        onClick={() => {
                          setUser({ ...user, name: 'ritujapatil2005', avatar: NETFLIX_AVATARS[1].svgDataUri });
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-white/10 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm overflow-hidden bg-[#0071EB] shrink-0">
                            <img src={NETFLIX_AVATARS[1].svgDataUri} alt="ritujapatil2005" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-sm font-normal text-gray-200 group-hover:text-white truncate">
                            {user?.name || 'ritujapatil2005'}
                          </span>
                        </div>
                        <Lock className="w-4 h-4 text-gray-400 group-hover:text-gray-200 shrink-0 ml-2" />
                      </button>

                      {/* Profile 2: Sharada (Yellow Smiley) */}
                      <button
                        onClick={() => {
                          setUser({ ...user, name: 'Sharada', avatar: NETFLIX_AVATARS[2].svgDataUri });
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-white/10 transition-colors group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-sm overflow-hidden bg-[#F59E0B] shrink-0">
                          <img src={NETFLIX_AVATARS[2].svgDataUri} alt="Sharada" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-normal text-gray-200 group-hover:text-white truncate">
                          Sharada
                        </span>
                      </button>

                      {/* Profile 3: Children (Kids Gradient) */}
                      <button
                        onClick={() => {
                          setUser({ ...user, name: 'Children', avatar: KIDS_AVATAR });
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-white/10 transition-colors group cursor-pointer"
                      >
                        <div
                          className="w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center font-black text-[10px] text-white shadow shrink-0"
                          style={{ background: 'linear-gradient(135deg, #00C0FF 0%, #FFD700 45%, #FF0055 100%)' }}
                        >
                          <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-tight">kids</span>
                        </div>
                        <span className="text-sm font-normal text-gray-200 group-hover:text-white truncate">
                          Children
                        </span>
                      </button>
                    </div>

                    {/* 2. Management Menu Items (Screenshot 2) */}
                    <div className="flex flex-col py-1 text-sm font-normal text-gray-200">
                      {/* Manage Profiles */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3.5 px-3.5 py-2 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4 text-gray-300 stroke-[1.75]" />
                        <span>Manage Profiles</span>
                      </button>

                      {/* Transfer Profile */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          useAppStore.getState().addToast({
                            title: 'Transfer Profile',
                            description: 'Profile transfer wizard is ready for your account.',
                            type: 'info'
                          });
                        }}
                        className="w-full flex items-center gap-3.5 px-3.5 py-2 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
                      >
                        <ArrowRightLeft className="w-4 h-4 text-gray-300 stroke-[1.75]" />
                        <span>Transfer Profile</span>
                      </button>

                      {/* Account */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsPlanModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3.5 px-3.5 py-2 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
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
                        className="w-full flex items-center gap-3.5 px-3.5 py-2 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
                      >
                        <HelpCircle className="w-4 h-4 text-gray-300 stroke-[1.75]" />
                        <span>Help Centre</span>
                      </button>
                    </div>

                    {/* 3. Divider & Sign Out */}
                    <div className="border-t border-white/10 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logoutAndRedirect();
                        }}
                        className="w-full px-3.5 py-2 hover:underline hover:text-white text-gray-300 transition-colors text-center text-sm font-normal cursor-pointer"
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
