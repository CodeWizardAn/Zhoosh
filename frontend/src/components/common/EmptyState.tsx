import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Film, Music2, HeartCrack, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface EmptyStateProps {
  type?: 'movies' | 'music' | 'likes' | 'playlists' | 'search' | 'error';
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  isError?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'movies',
  title,
  description,
  actionText,
  onAction,
  isError = false,
}) => {
  const mode = useAppStore((state) => state.mode);
  const [isShaking, setIsShaking] = useState(false);

  const handleActionClick = () => {
    if (isError) {
      // Micro-interaction: subtle shake on retry
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 450);
    }
    onAction?.();
  };

  const getIcon = () => {
    switch (type) {
      case 'music':
        return <Music2 className="w-12 h-12 text-emerald-400" />;
      case 'likes':
        return <HeartCrack className="w-12 h-12 text-rose-400" />;
      case 'error':
        return <RefreshCw className="w-12 h-12 text-amber-400" />;
      default:
        return <Film className="w-12 h-12 text-amber-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto"
    >
      {/* Ambient background aura */}
      <div className="relative mb-6">
        <div
          className={`absolute inset-0 rounded-full blur-2xl opacity-30 ${
            mode === 'movies' ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
        />
        <div className="relative w-24 h-24 rounded-2xl bg-[#151522] border border-white/10 flex items-center justify-center shadow-xl">
          {getIcon()}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1 -right-1 text-amber-300"
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed mb-6">{description}</p>

      {actionText && (
        <motion.button
          onClick={handleActionClick}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          animate={isShaking ? { x: [-5, 5, -4, 4, -2, 2, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide shadow-lg transition-colors flex items-center gap-2 ${
            mode === 'movies'
              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
              : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
          }`}
        >
          {isError && <RefreshCw className={`w-4 h-4 ${isShaking ? 'animate-spin' : ''}`} />}
          {actionText}
        </motion.button>
      )}
    </motion.div>
  );
};
