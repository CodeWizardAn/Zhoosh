import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Film,
  Music,
  Globe,
  Layers,
  Heart,
  Zap,
  Eye,
  Smile,
  Tv,
  Flame,
  Sparkles,
  Moon,
  Volume2,
  Mic,
  Headphones,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
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
  const [limitNotice, setLimitNotice] = useState<string | null>(null);

  const selectedGenres = selectedItems.filter((i) => i.section === 'genre');
  const selectedLanguages = selectedItems.filter((i) => i.section === 'language');

  // User Requirement: Minimum 2 each, maximum 5 each
  const isComplete = selectedGenres.length >= 2 && selectedLanguages.length >= 2;

  // Filter items according to active tab (Movies vs Music) with identical typography and layout
  const currentTabItems = PREFERENCE_ITEMS.filter((item) => item.type === activeTab);
  const languageItems = currentTabItems.filter((i) => i.section === 'language');
  const genreItems = currentTabItems.filter((i) => i.section === 'genre');

  const toggleItem = (item: PreferenceItem) => {
    const exists = selectedItems.some((i) => i.id === item.id);
    if (exists) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
      setLimitNotice(null);
    } else {
      const isGenre = item.section === 'genre';
      const categoryCount = isGenre ? selectedGenres.length : selectedLanguages.length;
      const categoryLabel = isGenre ? 'genres' : 'languages';

      if (categoryCount < 5) {
        const next = [...selectedItems, item];
        setSelectedItems(next);
        const nextGenres = next.filter((i) => i.section === 'genre').length;
        const nextLangs = next.filter((i) => i.section === 'language').length;
        if (nextGenres >= 2 && nextLangs >= 2) {
          try { zhooshAudio.playZhooshIntroSound(); } catch {}
        }
      } else {
        setLimitNotice(`Maximum 5 ${categoryLabel} reached. Deselect one to choose this.`);
        setTimeout(() => setLimitNotice(null), 3500);
      }
    }
  };

  const clearAll = () => {
    setSelectedItems([]);
    setLimitNotice(null);
  };

  const handleContinue = () => {
    if (isComplete) {
      try { zhooshAudio.playZhooshIntroSound(); } catch {}
      onPreferencesComplete(selectedItems);
    }
  };

  const accent = activeTab === 'movie' ? '#FF1E56' : '#A855F7';

  // Helper for language badges
  const getLanguageCode = (item: PreferenceItem) => {
    const codeMap: Record<string, string> = {
      'm-lang-en': 'EN',
      's-lang-en': 'EN',
      'm-lang-hi': 'HI',
      's-lang-hi': 'HI',
      'm-lang-es': 'ES',
      's-lang-es': 'ES',
      'm-lang-ko': 'KO',
      's-lang-ko': 'KO',
      'm-lang-ja': 'JA',
      'm-lang-fr': 'FR',
      's-lang-fr': 'FR',
      'm-lang-ta': 'TA',
      's-lang-ta': 'TA',
      'm-lang-te': 'TE',
      's-lang-pa': 'PA',
    };
    return codeMap[item.id] || item.title.slice(0, 2).toUpperCase();
  };

  // Helper for genre icon rendering
  const renderGenreIcon = (item: PreferenceItem) => {
    const iconName = item.iconName?.toLowerCase() || '';
    const title = item.title.toLowerCase();

    if (iconName === 'heart' || title.includes('romance') || title.includes('romantic')) {
      return <Heart className="w-4 h-4 text-rose-400" />;
    }
    if (iconName === 'zap' || title.includes('action')) {
      return <Zap className="w-4 h-4 text-amber-400" />;
    }
    if (iconName === 'eye' || title.includes('thriller')) {
      return <Eye className="w-4 h-4 text-red-400" />;
    }
    if (iconName === 'smile' || title.includes('comedy')) {
      return <Smile className="w-4 h-4 text-yellow-300" />;
    }
    if (iconName === 'tv' || title.includes('sitcom')) {
      return <Tv className="w-4 h-4 text-sky-400" />;
    }
    if (iconName === 'flame' || title.includes('anime')) {
      return <Flame className="w-4 h-4 text-orange-400" />;
    }
    if (iconName === 'film' || title.includes('drama')) {
      return <Film className="w-4 h-4 text-purple-400" />;
    }
    if (iconName === 'sparkles' || title.includes('sci-fi') || title.includes('pop')) {
      return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
    if (iconName === 'moon' || title.includes('horror')) {
      return <Moon className="w-4 h-4 text-violet-400" />;
    }
    if (iconName === 'volume2' || title.includes('rock')) {
      return <Volume2 className="w-4 h-4 text-emerald-400" />;
    }
    if (iconName === 'mic' || title.includes('hip-hop')) {
      return <Mic className="w-4 h-4 text-pink-400" />;
    }
    if (iconName === 'headphones' || title.includes('lo-fi')) {
      return <Headphones className="w-4 h-4 text-teal-400" />;
    }
    return <Sparkles className="w-4 h-4 text-rose-400" />;
  };

  const renderCard = (item: PreferenceItem) => {
    const isSelected = selectedItems.some((i) => i.id === item.id);
    const isGenre = item.section === 'genre';
    const isCategoryFull = (isGenre ? selectedGenres.length >= 5 : selectedLanguages.length >= 5) && !isSelected;
    const tag = item.tags?.[0] || (isGenre ? 'Genre' : 'Culture');

    return (
      <motion.button
        key={item.id}
        layout
        onClick={() => toggleItem(item)}
        whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
        whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -2 }}
        className={`group relative w-full text-left p-4 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between min-h-[118px] font-sans ${
          isSelected
            ? activeTab === 'movie'
              ? 'border-[#FF1E56] bg-gradient-to-br from-[#FF1E56]/20 via-[#FF1E56]/8 to-[#11111a]/95 shadow-[0_0_25px_rgba(255,30,86,0.35)] ring-1 ring-[#FF1E56]/60'
              : 'border-[#A855F7] bg-gradient-to-br from-[#A855F7]/20 via-[#A855F7]/8 to-[#11111a]/95 shadow-[0_0_25px_rgba(168,85,247,0.35)] ring-1 ring-[#A855F7]/60'
            : isCategoryFull
            ? 'border-white/5 bg-black/40 opacity-40 hover:opacity-60 cursor-not-allowed'
            : 'border-white/10 bg-[#0d0d14]/70 hover:border-white/25 hover:bg-[#141420]/80 backdrop-blur-md shadow-lg shadow-black/40'
        }`}
      >
        {/* Ambient corner light glow */}
        <div
          className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-xl pointer-events-none transition-opacity duration-300 ${
            isSelected
              ? activeTab === 'movie'
                ? 'bg-[#FF1E56]/35 opacity-100'
                : 'bg-[#A855F7]/35 opacity-100'
              : 'bg-white/5 opacity-0 group-hover:opacity-100'
          }`}
        />

        {/* Selected glowing strip on left edge */}
        {isSelected && (
          <motion.div
            layoutId={`active-strip-${item.id}`}
            className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: accent, color: accent }}
          />
        )}

        {/* Card Top: Icon/Code Badge on left + Checkbox on right */}
        <div className="flex items-center justify-between gap-2">
          {/* Badge */}
          {item.section === 'language' ? (
            <div
              className={`px-2 py-0.5 rounded-lg border text-xs font-black tracking-wider font-sans transition-transform group-hover:scale-105 shadow-sm ${
                isSelected
                  ? 'bg-white/15 border-white/30 text-white'
                  : 'bg-white/5 border-white/10 text-gray-300'
              }`}
            >
              {getLanguageCode(item)}
            </div>
          ) : (
            <div
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${
                isSelected
                  ? 'bg-white/15 border-white/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {renderGenreIcon(item)}
            </div>
          )}

          {/* Check indicator */}
          <div className="flex-shrink-0">
            {isSelected ? (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={SPRING_CURVE}
                className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-md"
                style={{
                  backgroundColor: accent,
                  boxShadow: `0 0 10px ${accent}99`
                }}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </motion.div>
            ) : (
              <div className="w-5 h-5 rounded-full border border-white/20 group-hover:border-white/40 flex items-center justify-center transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-white/30 transition-colors" />
              </div>
            )}
          </div>
        </div>

        {/* Card Middle: Title + Subtitle - Uniform font family and sizes */}
        <div className="mt-2.5">
          <span
            className={`text-sm font-bold tracking-tight block font-sans transition-colors ${
              isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'
            }`}
          >
            {item.title}
          </span>
          {item.subtitle && (
            <p className="text-[11px] font-normal text-gray-400 group-hover:text-gray-300 line-clamp-2 leading-snug mt-0.5 font-sans">
              {item.subtitle}
            </p>
          )}
        </div>

        {/* Card Bottom: Micro tag */}
        <div className="mt-2.5 pt-1.5 border-t border-white/5 flex items-center justify-between font-sans">
          <span
            className={`text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md transition-colors ${
              isSelected
                ? 'bg-white/15 text-white'
                : 'bg-white/5 text-gray-400 group-hover:text-gray-300'
            }`}
          >
            {tag}
          </span>
          <span className="text-[10px] text-gray-500 group-hover:text-gray-400">
            {isSelected ? 'Selected' : 'Tap to add'}
          </span>
        </div>
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%', opacity: 0 }}
      animate={{ x: '0%', opacity: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { x: '-100%', opacity: 0 }}
      transition={{ duration: 0.3, ease: TRANSITION_BEZIER }}
      className="relative min-h-screen w-full flex flex-col items-center bg-[#050508] text-white overflow-x-hidden select-none font-sans"
    >
      {/* Background cinematic poster wall mosaic */}
      <FadedGridBackdrop intensity="subtle" showPosters={true} />

      {/* Top ambient glow flares */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full bg-[#FF1E56]/10 blur-[140px] pointer-events-none" />
      <div className="fixed top-1/3 right-1/4 w-96 h-96 rounded-full bg-[#A855F7]/10 blur-[150px] pointer-events-none" />

      {/* Fixed top navbar */}
      <div className="relative z-20 w-full border-b border-white/10 bg-[#050508]/85 backdrop-blur-xl sticky top-0 font-sans">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 font-sans"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {/* Unified Tab Switcher: Identical typography, identical font, identical size */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-black/50 border border-white/10 shadow-inner font-sans">
            <button
              onClick={() => setActiveTab('movie')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer font-sans ${
                activeTab === 'movie'
                  ? 'bg-gradient-to-r from-[#FF1E56] to-rose-600 text-white shadow-[0_0_15px_rgba(255,30,86,0.4)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies</span>
            </button>
            <button
              onClick={() => setActiveTab('music')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer font-sans ${
                activeTab === 'music'
                  ? 'bg-gradient-to-r from-[#A855F7] to-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Music</span>
            </button>
          </div>

          {/* Quick Counter */}
          <div className="text-xs font-mono text-gray-400 hidden sm:block">
            <span className="text-white font-bold">{selectedItems.length}</span> total selected
          </div>
        </div>
      </div>

      {/* Main page content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 font-sans">
        {/* Header Banner - Identical font structure */}
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF1E56]/15 via-rose-500/10 to-[#A855F7]/15 border border-[#FF1E56]/30 text-rose-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-sm font-sans">
            <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            Step 4 of 5 · AI Feed Calibration
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight font-sans">
            {activeTab === 'movie' ? 'What do you like to watch' : 'What do you like to listen to'}
            {userName ? (
              <>
                ,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF1E56] via-rose-300 to-[#A855F7]">
                  {userName}
                </span>
              </>
            ) : (
              ''
            )}
            ?
          </h1>
          <p className="text-sm font-normal text-gray-400 max-w-xl leading-relaxed font-sans">
            Select 2 to 5 genres and 2 to 5 languages to personalize your dashboard feed and recommendations.
          </p>
        </div>

        {/* Limit Warning Notice */}
        <AnimatePresence>
          {limitNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="px-4 py-3 rounded-xl bg-purple-950/60 border border-purple-500/40 backdrop-blur-md flex items-center justify-between text-xs font-semibold text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.25)] font-sans"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>{limitNotice}</span>
              </div>
              <button
                onClick={() => setLimitNotice(null)}
                className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Tray */}
        {selectedItems.length > 0 && (
          <motion.div layout className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md font-sans">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-sans">
                Your Selection ({selectedItems.length})
              </span>
              <button
                onClick={clearAll}
                className="text-[11px] font-medium text-gray-400 hover:text-red-400 transition-colors cursor-pointer font-sans"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {selectedItems.map((item) => (
                  <motion.button
                    key={item.id}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={() => toggleItem(item)}
                    className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-white/20 bg-white/10 text-white hover:border-red-400/60 hover:bg-red-500/15 transition-all cursor-pointer font-sans"
                  >
                    <span>{item.title}</span>
                    <span className="text-[10px] text-gray-400 group-hover:text-red-300">✕</span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Section 1: Languages */}
        {languageItems.length > 0 && (
          <div className="space-y-4 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-wide font-sans">
                      {activeTab === 'movie' ? 'Audio & Subtitle Languages' : 'Track & Vocal Languages'}
                    </h2>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider font-sans">
                      (Min 2, Max 5)
                    </span>
                  </div>
                  <p className="text-xs font-normal text-gray-400 hidden sm:block font-sans">
                    {activeTab === 'movie'
                      ? 'Choose what you love to watch & hear'
                      : 'Choose languages for music and vocal tracks'}
                  </p>
                </div>
              </div>

              {/* Status counter pill */}
              <div>
                {selectedLanguages.length < 2 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 backdrop-blur-sm animate-pulse font-sans">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    {selectedLanguages.length}/5 selected (need min 2)
                  </span>
                ) : selectedLanguages.length === 5 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 backdrop-blur-sm font-sans">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    5/5 selected (max)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm font-sans">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {selectedLanguages.length}/5 selected ✓
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {languageItems.map(renderCard)}
            </div>
          </div>
        )}

        {/* Section 2: Genres */}
        {genreItems.length > 0 && (
          <div className="space-y-4 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.15)] ${
                    activeTab === 'movie'
                      ? 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                      : 'bg-purple-500/10 border-purple-500/25 text-purple-400'
                  }`}
                >
                  {activeTab === 'movie' ? <Layers className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-wide font-sans">
                      {activeTab === 'movie' ? 'Favorite Cinema Genres' : 'Favorite Music Genres'}
                    </h2>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider font-sans">
                      (Min 2, Max 5)
                    </span>
                  </div>
                  <p className="text-xs font-normal text-gray-400 hidden sm:block font-sans">
                    {activeTab === 'movie'
                      ? 'Curates your home feed rows & recommendations'
                      : 'Curates your personalized music mixes and stations'}
                  </p>
                </div>
              </div>

              {/* Status counter pill */}
              <div>
                {selectedGenres.length < 2 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 backdrop-blur-sm animate-pulse font-sans">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    {selectedGenres.length}/5 selected (need min 2)
                  </span>
                ) : selectedGenres.length === 5 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 backdrop-blur-sm font-sans">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    5/5 selected (max)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm font-sans">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {selectedGenres.length}/5 selected ✓
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {genreItems.map(renderCard)}
            </div>
          </div>
        )}

        {/* Bottom spacer for floating dock */}
        <div className="h-28" />
      </div>

      {/* Floating Bottom Dock */}
      <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none font-sans">
        <div className="pointer-events-auto w-full max-w-4xl bg-[#0a0a12]/92 backdrop-blur-2xl border border-white/15 rounded-2xl sm:rounded-full px-4 sm:px-6 py-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(255,30,86,0.15)] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 font-sans">
          {/* Status chips */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start font-sans">
            <div className="flex items-center gap-2">
              {/* Languages chip */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-colors font-sans ${
                  selectedLanguages.length >= 2
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                    : 'bg-white/5 text-amber-300 border-amber-500/30'
                }`}
              >
                <Globe className="w-3 h-3" />
                Languages {selectedLanguages.length}/5 {selectedLanguages.length >= 2 ? '✓' : ''}
              </span>

              {/* Genres chip */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-colors font-sans ${
                  selectedGenres.length >= 2
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                    : 'bg-white/5 text-amber-300 border-amber-500/30'
                }`}
              >
                <Layers className="w-3 h-3" />
                Genres {selectedGenres.length}/5 {selectedGenres.length >= 2 ? '✓' : ''}
              </span>
            </div>

            <span className="text-xs text-gray-400 font-medium hidden md:inline font-sans">
              {isComplete ? '🎯 Ready to personalize feed' : 'Pick min 2 of each'}
            </span>
          </div>

          {/* Center Progress Line */}
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-[140px]">
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FF1E56] to-[#A855F7] rounded-full"
                animate={{
                  width: `${Math.min(
                    100,
                    ((Math.min(selectedGenres.length, 2) + Math.min(selectedLanguages.length, 2)) / 4) * 100
                  )}%`
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Continue CTA Button */}
          <motion.button
            onClick={handleContinue}
            disabled={!isComplete}
            whileHover={isComplete ? { scale: 1.03 } : {}}
            whileTap={isComplete ? { scale: 0.97 } : {}}
            className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all font-sans ${
              isComplete
                ? 'bg-gradient-to-r from-[#FF1E56] via-rose-500 to-[#A855F7] text-white cursor-pointer shadow-[0_0_25px_rgba(255,30,86,0.5)] hover:shadow-[0_0_35px_rgba(255,30,86,0.7)]'
                : 'bg-white/8 text-gray-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <span>{isComplete ? 'Continue to Dashboard' : 'Select Preferences'}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
