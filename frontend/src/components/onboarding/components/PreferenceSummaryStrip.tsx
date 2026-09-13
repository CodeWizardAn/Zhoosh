import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Film, Music } from 'lucide-react';
import { PreferenceItem } from '../types';

interface PreferenceSummaryStripProps {
  selectedItems: PreferenceItem[];
  onRemoveItem: (item: PreferenceItem) => void;
  maxItems?: number;
}

export const PreferenceSummaryStrip: React.FC<PreferenceSummaryStripProps> = ({
  selectedItems,
  onRemoveItem,
  maxItems = 5
}) => {
  const count = selectedItems.length;
  const isComplete = count >= maxItems;

  return (
    <div className="w-full bg-[#12121E]/90 backdrop-blur-md border border-purple-500/20 rounded-2xl p-3.5 sm:p-4 shadow-xl select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isComplete ? 'bg-purple-500/20 text-[#C084FC]' : 'bg-white/10 text-gray-300'}`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Your Selected Top 5 Tastes</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isComplete ? 'bg-gradient-to-r from-[#FF1E56] to-[#A855F7] text-white' : 'bg-white/10 text-gray-300'
              }`}>
                {count} / {maxItems}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              {isComplete 
                ? 'Perfect balance achieved! Tailored neural feed ready.'
                : `Choose ${maxItems - count} more genres or acoustic styles to calibrate your feed.`}
            </p>
          </div>
        </div>

        {/* Progress Bar (0 -> 5) */}
        <div className="w-full sm:w-44 flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-mono text-gray-400">
            <span>Calibrating Taste</span>
            <span>{Math.round((count / maxItems) * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
            <motion.div
              className={`h-full rounded-full transition-colors duration-400 ${
                isComplete 
                  ? 'bg-gradient-to-r from-[#FF1E56] via-[#E50914] to-[#A855F7] shadow-[0_0_12px_rgba(168,85,247,0.6)]' 
                  : 'bg-gradient-to-r from-[#FF1E56] to-purple-600'
              }`}
              initial={{ width: '0%' }}
              animate={{ width: `${(count / maxItems) * 100}%` }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>

      {/* Summary Chips Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 min-h-[46px] no-scrollbar">
        <AnimatePresence mode="popLayout">
          {selectedItems.map((item) => {
            const isMovie = item.type === 'movie';
            const accentBg = isMovie ? 'bg-[#FF1E56]/20 border-[#FF1E56]/60' : 'bg-[#A855F7]/20 border-[#A855F7]/60';
            const textColor = isMovie ? 'text-[#FF94A8]' : 'text-[#D8B4FE]';

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ scale: 0.7, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.6, opacity: 0, y: 10 }}
                transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                className={`flex-shrink-0 flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-xl border text-xs font-semibold backdrop-blur-md shadow-md ${accentBg}`}
              >
                {isMovie ? (
                  <Film className="w-3.5 h-3.5 text-[#C4402A]" />
                ) : (
                  <Music className="w-3.5 h-3.5 text-[#A855F7]" />
                )}
                <span className={`truncate max-w-[130px] ${textColor}`}>{item.title}</span>
                <button
                  onClick={() => onRemoveItem(item)}
                  className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/15 transition-colors"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty Placeholder Slots */}
        {Array.from({ length: Math.max(0, maxItems - count) }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className="flex-shrink-0 flex items-center justify-center px-3 py-2 rounded-xl border border-dashed border-white/10 text-gray-600 text-xs font-mono"
          >
            + Slot {count + idx + 1}
          </div>
        ))}
      </div>
    </div>
  );
};
