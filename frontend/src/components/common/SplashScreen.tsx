import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { zhooshAudio } from '@/utils/cinematicSound';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Attempt automatic cinematic sound (gracefully handled by audio engine)
    try {
      zhooshAudio.playZhooshIntroSound();
    } catch {
      // Handled gracefully
    }

    // Progress bar simulation
    const p1 = setTimeout(() => setProgress(45), 400);
    const p2 = setTimeout(() => setProgress(78), 1000);
    const p3 = setTimeout(() => setProgress(100), 1600);

    // Splash duration: 2.2s for cinematic brand reveal
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 400);
    }, 2200);

    return () => {
      clearTimeout(p1);
      clearTimeout(p2);
      clearTimeout(p3);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050508] select-none overflow-hidden"
        >
          {/* Deep Black, Crimson Red & Electric Purple Atmospheric Cosmic Flares */}
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-[#FF1E56]/22 blur-[170px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] rounded-full bg-[#9D4EDD]/25 blur-[180px] pointer-events-none animate-pulse" />

          {/* Central Zhoosh Presentation */}
          <div className="relative flex flex-col items-center justify-center">
            {/* 1. EMBLEM: 3D Ribbon 'Z' with glowing orbital rings & sparkling star */}
            <motion.div
              initial={{ scale: 0.75, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center"
            >
              {/* Pulsing Ambient Glow behind Emblem */}
              <motion.div
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.5, 0.85, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full pointer-events-none -z-10"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255, 30, 86, 0.6) 0%, rgba(168, 85, 247, 0.4) 40%, transparent 70%)',
                  filter: 'blur(24px)'
                }}
              />

              {/* Ripple Pulse Rings */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0.8 }}
                animate={{ scale: 2.1, opacity: 0 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border border-[#FF1E56]/40 pointer-events-none"
              />

              <motion.div
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: 1.6, delay: 0.4, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border border-[#A855F7]/30 pointer-events-none"
              />

              {/* Emblem Image */}
              <img
                src="/zhoosh-emblem-clean.png"
                alt="Zhoosh Emblem"
                className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_0_35px_rgba(255,30,86,0.7)]"
                onError={(e) => {
                  if (e.currentTarget.src.includes('-clean')) {
                    e.currentTarget.src = '/zhoosh-emblem.png';
                  }
                }}
              />
            </motion.div>

            {/* 2. WORDMARK: Glossy Zhoosh logo reveal */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
              className="relative mt-5 flex flex-col items-center"
            >
              {/* Ambient Glow for Wordmark */}
              <div
                className="absolute inset-0 pointer-events-none -z-10"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(255, 30, 86, 0.4) 0%, rgba(168, 85, 247, 0.25) 50%, transparent 75%)',
                  filter: 'blur(20px)',
                  transform: 'scale(1.3)'
                }}
              />

              <img
                src="/zhoosh-wordmark-clean.png"
                alt="Zhoosh"
                className="h-12 sm:h-16 w-auto object-contain filter drop-shadow-[0_0_24px_rgba(255,30,86,0.6)]"
                onError={(e) => {
                  if (e.currentTarget.src.includes('-clean')) {
                    e.currentTarget.src = '/zhoosh-wordmark.jpg';
                    e.currentTarget.style.mixBlendMode = 'screen';
                  }
                }}
              />

              <motion.p
                initial={{ opacity: 0, letterSpacing: '0.2em' }}
                animate={{ opacity: 1, letterSpacing: '0.38em' }}
                transition={{ duration: 0.8, delay: 0.55 }}
                className="font-mono text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF8BA7] via-white to-[#D8B4FE] uppercase mt-2.5 tracking-[0.38em] drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]"
                style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
              >
                CINEMA × AUDIO
              </motion.p>
            </motion.div>

            {/* 3. Sleek Neon Loading Progress Line */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 220 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative mt-8 h-1 bg-white/10 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-[#FF1E56] via-[#FF2E93] to-[#A855F7] shadow-[0_0_12px_rgba(255,30,86,0.8)]"
                style={{ width: `${progress}%`, transition: 'width 0.4s ease-out' }}
              />
            </motion.div>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.7 }}
              className="text-[11px] font-mono tracking-wider text-gray-400 mt-2"
            >
              Entering the streaming multiverse...
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
