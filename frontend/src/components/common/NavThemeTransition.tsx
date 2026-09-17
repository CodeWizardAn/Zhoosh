import React from 'react';
import { motion } from 'framer-motion';
import { ZhooshLogo } from './ZhooshLogo';
import { useAppStore } from '@/store/useAppStore';

interface NavThemeTransitionProps {
  targetNav: string;
}

export const NavThemeTransition: React.FC<NavThemeTransitionProps> = ({ targetNav }) => {
  const { mode } = useAppStore();
  const isMusicMode = mode === 'music';
  const isWatchlist = targetNav === 'likes';

  const label = isMusicMode
    ? isWatchlist
      ? 'Opening My Zhoosh Library'
      : 'Loading Music Dashboard'
    : isWatchlist
    ? 'Opening My Zhoosh Watchlist'
    : 'Loading Home Cinema';

  const sublabel = isMusicMode
    ? isWatchlist
      ? 'Retrieving your saved soundtracks...'
      : 'Curating trending chartbusters & albums...'
    : isWatchlist
    ? 'Retrieving your curated titles...'
    : 'Curating blockbusters & recommendations...';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#05070E]/90 backdrop-blur-xl select-none pointer-events-none"
    >
      {/* Background Grid Mesh & Ambient Flare */}
      <div
        className={`absolute inset-0 opacity-60 pointer-events-none ${
          isMusicMode ? 'music-grid-pattern' : 'dashboard-grid-pattern'
        }`}
      />
      <div
        className={`absolute w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none ${
          isMusicMode ? 'bg-[#0070F3]/25' : 'bg-[#E50914]/20'
        }`}
      />

      {/* Central Pulsating Logo & Spinner Frame */}
      <div className="relative flex flex-col items-center gap-5 z-10">
        {/* Animated Radiant Ring */}
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className={`w-20 h-20 rounded-full border-2 border-transparent ${
              isMusicMode
                ? 'border-t-[#0070F3] border-r-[#00D2FF] shadow-[0_0_20px_rgba(0,112,243,0.5)]'
                : 'border-t-[#E50914] border-r-[#FF2E93] shadow-[0_0_20px_rgba(229,9,20,0.4)]'
            }`}
          />

          {/* Center Zhoosh Logo Emblem */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              <ZhooshLogo size="sm" variant="emblem" showWordmark={false} />
            </motion.div>
          </div>
        </div>

        {/* Status Text with Shimmer Effect */}
        <div className="text-center space-y-1">
          <motion.h3
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base sm:text-lg font-bold text-white tracking-wide"
          >
            {label}
          </motion.h3>
          <p className="text-xs text-gray-400 font-medium tracking-normal">
            {sublabel}
          </p>
        </div>

        {/* Smooth Shimmer Bar */}
        <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden relative">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
            className={`w-1/2 h-full rounded-full bg-gradient-to-r from-transparent ${
              isMusicMode
                ? 'via-[#0070F3] to-transparent shadow-[0_0_8px_#0070F3]'
                : 'via-[#E50914] to-transparent shadow-[0_0_8px_#E50914]'
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default NavThemeTransition;
