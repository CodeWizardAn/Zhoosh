import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Film, Music, Globe, Layers } from 'lucide-react';
import { PREFERENCE_ITEMS, PreferenceItem, SubscriptionPlan, TRANSITION_BEZIER, SPRING_CURVE } from '../types';
import { zhooshAudio } from '@/utils/cinematicSound';
import { FadedGridBackdrop } from '@/components/common/FadedGridBackdrop';

interface PreferencesStepProps {
  selectedPlan: SubscriptionPlan;
  userName: string;
  onPreferencesComplete: (preferences: PreferenceItem[]) => void;
  onBack: () => void;
  initialPreferences?: PreferenceItem[];
}

export const PreferencesStep: React.FC<PreferencesStepProps> = ({
  selectedPlan: _selectedPlan,
  userName,
  onPreferencesComplete,
  onBack,
  initialPreferences = []
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<'movie' | 'music'>('movie');
  const [selectedItems, setSelectedItems] = useState<PreferenceItem[]>(initialPreferences);

  const count = selectedItems.length;
  const isComplete = count >= 5;

  const currentTabItems = PREFERENCE_ITEMS.filter((item) => item.type === activeTab);
  const languageItems = currentTabItems.filter((i) => i.section === 'language');
  const genreItems = currentTabItems.filter((i) => i.section === 'genre');

  const toggleItem = (item: PreferenceItem) => {
    const exists = selectedItems.some((i) => i.id === item.id);
    if (exists) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      if (selectedItems.length < 5) {
        const next = [...selectedItems, item];
        setSelectedItems(next);
        if (next.length === 5) {
          try { zhooshAudio.playZhooshIntroSound(); } catch {}
        }
      }
    }
  };

  const handleContinue = () => {
    if (isComplete) {
      try { zhooshAudio.playZhooshIntroSound(); } catch {}
      onPreferencesComplete(selectedItems);
    }
  };

  const accent = activeTab === 'movie' ? '#FF1E56' : '#A855F7';

  const renderCard = (item: PreferenceItem) => {
    const isSelected = selectedItems.some((i) => i.id === item.id);
    const isFull = selectedItems.length >= 5 && !isSelected;

    return (
      <motion.button
        key={item.id}
        layout
        onClick={() => !isFull && toggleItem(item)}
        whileTap={shouldReduceMotion || isFull ? {} : { scale: 0.96, transition: SPRING_CURVE }}
        disabled={isFull}
        className={`relative w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 overflow-hidden group ${
          isSelected
            ? activeTab === 'movie'
              ? 'border-[#FF1E56]/70 bg-[#FF1E56]/10'
              : 'border-[#A855F7]/70 bg-[#A855F7]/10'
            : isFull
            ? 'border-white/5 bg-white/3 opacity-30 cursor-not-allowed'
            : 'border-white/10 bg-white/4 hover:border-white/25 hover:bg-white/8 cursor-pointer'
        }`}
      >
        {/* Selected glow line on left */}
        {isSelected && (
          <div
            className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
            style={{ backgroundColor: accent }}
          />
        )}

        <div className="flex items-center justify-between gap-3">
          <span className={`text-sm font-semibold leading-tight ${isSelected ? 'text-white' : 'text-gray-200'}`}>
            {item.title}
          </span>

          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={SPRING_CURVE}
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: accent }}
              >
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {item.subtitle && (
          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{item.subtitle}</p>
        )}
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%', opacity: 0 }}
      animate={{ x: '0%', opacity: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { x: '-100%', opacity: 0 }}
      transition={{ duration: 0.3, ease: TRANSITION_BEZIER }}
      className="relative min-h-screen w-full flex flex-col items-center bg-[#050508] text-white overflow-x-hidden"
    >
      <FadedGridBackdrop intensity="subtle" showPosters={false} />

      {/* Fixed top navbar */}
      <div className="relative z-20 w-full border-b border-white/8 bg-[#050508]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          {/* Tab switcher */}
          <div className="flex items-center gap-1 p-0.5 rounded-full bg-white/8 border border-white/10">
            <button
              onClick={() => setActiveTab('movie')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'movie'
                  ? 'bg-[#FF1E56] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Movies
            </button>
            <button
              onClick={() => setActiveTab('music')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'music'
                  ? 'bg-[#A855F7] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              Music
            </button>
          </div>

          {/* Progress indicator */}
          <span className="text-xs text-gray-500 font-mono">{count}/5 selected</span>
        </div>
      </div>

      {/* Page content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            What do you like to watch{userName ? `, ${userName}` : ''}?
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pick at least 5 — languages and genres — to personalise your feed.
          </p>
        </div>

        {/* Selected chips row */}
        {selectedItems.length > 0 && (
          <motion.div layout className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <motion.button
                key={item.id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => toggleItem(item)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-white/20 bg-white/8 text-white hover:border-red-400/60 hover:bg-red-500/10 transition-all"
              >
                {item.title}
                <span className="text-gray-400 text-[10px]">✕</span>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Languages */}
        {languageItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Languages</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {languageItems.map(renderCard)}
            </div>
          </div>
        )}

        {/* Genres */}
        {genreItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Genres</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {genreItems.map(renderCard)}
            </div>
          </div>
        )}

        {/* Spacer for sticky footer */}
        <div className="h-20" />
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#050508]/95 backdrop-blur-md border-t border-white/8">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="text-xs text-gray-500">
            {isComplete
              ? 'Ready to go! Hit Continue.'
              : `Select ${5 - count} more to continue`}
          </div>

          {/* Progress bar */}
          <div className="flex-1 max-w-[180px] h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: accent }}
              animate={{ width: `${(count / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <motion.button
            onClick={handleContinue}
            disabled={!isComplete}
            whileHover={isComplete ? { scale: 1.03 } : {}}
            whileTap={isComplete ? { scale: 0.97 } : {}}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              isComplete
                ? 'bg-gradient-to-r from-[#FF1E56] to-[#A855F7] text-white cursor-pointer shadow-lg'
                : 'bg-white/8 text-gray-600 cursor-not-allowed border border-white/5'
            }`}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
