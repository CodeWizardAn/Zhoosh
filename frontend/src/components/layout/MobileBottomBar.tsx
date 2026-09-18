import React from 'react';
import { motion } from 'framer-motion';
import {
  Film,
  Home,
  Search,
  Heart,
  ListMusic,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAgentStore } from '@/store/useAgentStore';

interface MobileBottomBarProps {
  onOpenSearch?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ onOpenSearch }) => {
  const { mode, activeNav, setActiveNav, currentTrack } = useAppStore();
  const { profile: agentProfile } = useAgentStore();

  const isMovieMode = mode === 'movies';
  const botName = agentProfile?.name || (isMovieMode ? 'Nova' : 'SonicBot');
  const botAvatar = agentProfile?.avatarUrl || '/agent-avatar.jpg';

  const isMusicPlaying = mode === 'music' && !!currentTrack;

  // Tab definitions tailored for Netflix (Cinema) and Spotify (Music)
  const tabs = isMovieMode
    ? [
        {
          id: 'home',
          label: 'Home',
          icon: Film,
          isActive: activeNav === 'discover' || activeNav === 'trending',
          onClick: () => setActiveNav('discover')
        },
        {
          id: 'search',
          label: 'Search',
          icon: Search,
          isActive: false,
          onClick: () => {
            if (onOpenSearch) {
              onOpenSearch();
            } else {
              // Focus top search or trigger search view
              window.dispatchEvent(new CustomEvent('zhoosh:open-search'));
            }
          }
        },
        {
          id: 'likes',
          label: 'My Zhoosh',
          icon: Heart,
          isActive: activeNav === 'likes',
          onClick: () => setActiveNav('likes')
        },
        {
          id: 'agent',
          label: botName,
          icon: Sparkles,
          isAI: true,
          isActive: activeNav === 'agent-ai',
          onClick: () => setActiveNav('agent-ai')
        }
      ]
    : [
        {
          id: 'home',
          label: 'Home',
          icon: Home,
          isActive: activeNav === 'discover' || activeNav === 'trending',
          onClick: () => setActiveNav('discover')
        },
        {
          id: 'search',
          label: 'Search',
          icon: Search,
          isActive: false,
          onClick: () => {
            if (onOpenSearch) {
              onOpenSearch();
            } else {
              window.dispatchEvent(new CustomEvent('zhoosh:open-search'));
            }
          }
        },
        {
          id: 'library',
          label: 'Your Library',
          icon: ListMusic,
          isActive: activeNav === 'playlists',
          onClick: () => setActiveNav('playlists')
        },
        {
          id: 'agent',
          label: botName,
          icon: Sparkles,
          isAI: true,
          isActive: activeNav === 'agent-ai',
          onClick: () => setActiveNav('agent-ai')
        }
      ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#050508]/92 backdrop-blur-xl border-t border-white/[0.08] shadow-[0_-8px_32px_rgba(0,0,0,0.7)] select-none px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 transition-all duration-300"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={tab.onClick}
              className="relative flex flex-col items-center justify-center min-w-[64px] py-1 text-center cursor-pointer group"
            >
              {/* Active Indicator Top Glow Pill */}
              {active && (
                <motion.div
                  layoutId="mobileActiveTabIndicator"
                  className={`absolute -top-2 w-8 h-1 rounded-full ${
                    isMovieMode
                      ? 'bg-gradient-to-r from-red-600 via-[#E50914] to-red-600 shadow-[0_0_12px_rgba(229,9,20,0.8)]'
                      : 'bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(0,180,255,0.8)]'
                  }`}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              {/* Icon / AI Avatar Container */}
              <div className="relative flex items-center justify-center w-7 h-7 mb-1">
                {tab.isAI ? (
                  <div className="relative">
                    <div
                      className={`w-6 h-6 rounded-full overflow-hidden border transition-all duration-200 ${
                        active
                          ? isMovieMode
                            ? 'border-red-500 ring-2 ring-red-500/40 shadow-[0_0_10px_rgba(229,9,20,0.5)] scale-110'
                            : 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_10px_rgba(0,210,255,0.5)] scale-110'
                          : 'border-white/20 opacity-70 group-hover:opacity-100'
                      }`}
                    >
                      <img
                        src={botAvatar}
                        alt={tab.label}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/agent-avatar.jpg';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Live AI Pulse indicator */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-[#050508] ${
                        active ? (isMovieMode ? 'bg-red-500 animate-pulse' : 'bg-cyan-400 animate-pulse') : 'bg-gray-500'
                      }`}
                    />
                  </div>
                ) : (
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      active
                        ? isMovieMode
                          ? 'text-white stroke-[2.4] drop-shadow-[0_0_8px_rgba(229,9,20,0.6)] scale-110'
                          : 'text-white stroke-[2.4] drop-shadow-[0_0_8px_rgba(0,180,255,0.6)] scale-110'
                        : 'text-zinc-400 group-hover:text-zinc-200 stroke-[1.8]'
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] tracking-tight font-medium transition-colors duration-200 truncate max-w-[70px] ${
                  active
                    ? isMovieMode
                      ? 'text-white font-bold'
                      : 'text-cyan-300 font-bold'
                    : 'text-zinc-400 group-hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
