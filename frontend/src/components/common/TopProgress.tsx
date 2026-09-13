import React from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

export const TopProgress: React.FC = () => {
  const isFetching = useIsFetching();
  const mode = useAppStore((state) => state.mode);

  return (
    <AnimatePresence>
      {isFetching > 0 && (
        <motion.div
          key="top-progress-bar"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed top-0 left-0 right-0 z-50 h-[3px] origin-left overflow-hidden pointer-events-none"
        >
          <div
            className={`h-full w-full animate-pulse ${
              mode === 'movies'
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
            }`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
