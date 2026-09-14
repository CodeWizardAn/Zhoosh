import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Music, Check, Sparkles } from 'lucide-react';
import { PreferenceItem } from '../types';

interface PreferenceSummaryStripProps {
  selectedItems: PreferenceItem[];
  onRemoveItem?: (item: PreferenceItem) => void;
  maxItems?: number;
}

export const PreferenceSummaryStrip: React.FC<PreferenceSummaryStripProps> = ({
  selectedItems,
  maxItems = 5
}) => {
  const count = selectedItems.length;

  return (
    <div className="w-full bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl select-none text-left transition-all hover:border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center text-gray-300">
            <Sparkles className="w-3.5 h-3.5 text-[#C084FC]" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>Your Selected Tastes</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 border border-white/15 text-gray-300">
                {count} / {maxItems}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Personalized for your cinema and music experience
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
          <Check className="w-3 h-3 stroke-[2.5]" />
          <span>Profile Ready</span>
        </div>
      </div>

      {/* Chips Row */}
      <div className="flex flex-wrap items-center gap-2">
        <AnimatePresence mode="popLayout">
          {selectedItems.map((item) => {
            const isMovie = item.type === 'movie';
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold backdrop-blur-md shadow-md transition-all ${
                  isMovie
                    ? 'bg-[#FF1E56]/10 border-[#FF1E56]/30 text-white shadow-[0_0_12px_rgba(255,30,86,0.12)]'
                    : 'bg-[#A855F7]/10 border-[#A855F7]/30 text-white shadow-[0_0_12px_rgba(168,85,247,0.12)]'
                }`}
              >
                {isMovie ? (
                  <Film className="w-3.5 h-3.5 text-[#FF1E56]" />
                ) : (
                  <Music className="w-3.5 h-3.5 text-[#A855F7]" />
                )}
                <span>{item.title}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
