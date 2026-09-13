import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface SplitScreenCurtainProps {
  isSplitting: boolean;
  onSplitComplete?: () => void;
  children?: React.ReactNode;
}

export const SplitScreenCurtain: React.FC<SplitScreenCurtainProps> = ({
  isSplitting,
  onSplitComplete,
  children
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (!isSplitting) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Left Curtain - slides out to left 400ms */}
      <motion.div
        initial={{ x: '0%' }}
        animate={shouldReduceMotion ? { opacity: 0 } : { x: '-100%' }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="absolute top-0 left-0 w-1/2 h-full bg-[#050508] border-r border-[#FF1E56]/40 shadow-2xl flex items-center justify-end pr-8"
      >
        <div className="w-1.5 h-28 rounded-full bg-gradient-to-b from-[#FF1E56] via-[#E50914] to-transparent opacity-60 blur-sm" />
      </motion.div>

      {/* Right Curtain - slides out to right 400ms */}
      <motion.div
        initial={{ x: '0%' }}
        animate={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1]
        }}
        onAnimationComplete={onSplitComplete}
        className="absolute top-0 right-0 w-1/2 h-full bg-[#050508] border-l border-[#9D4EDD]/40 shadow-2xl flex items-center justify-start pl-8"
      >
        <div className="w-1.5 h-28 rounded-full bg-gradient-to-b from-[#9D4EDD] via-[#A855F7] to-transparent opacity-60 blur-sm" />
      </motion.div>
    </div>
  );
};
