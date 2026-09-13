import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZhooshLogo } from './ZhooshLogo';
import { zhooshAudio } from '@/utils/cinematicSound';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Attempt automatic cinematic sound (gracefully handled by audio engine)
    try {
      zhooshAudio.playZhooshIntroSound();
    } catch {
      // Handled gracefully
    }

    // Splash duration: 1.8s for cinematic brand reveal
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 350);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050508] select-none overflow-hidden"
        >
          {/* Deep Black, Crimson Red & Electric Purple Atmospheric Flares */}
          <div className="absolute top-1/3 left-1/4 w-[550px] h-[550px] rounded-full bg-[#FF1E56]/20 blur-[150px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-[550px] h-[550px] rounded-full bg-[#9D4EDD]/25 blur-[160px] pointer-events-none animate-pulse" />

          {/* Central Zhoosh Presentation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative flex flex-col items-center"
          >
            <ZhooshLogo size="xl" variant="artwork" layout="vertical" showText={true} animated={true} />

            {/* Ripple Pulse Rings */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0.9 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 1.5, repeat: 1, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border border-[#FF1E56]/40 pointer-events-none"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
