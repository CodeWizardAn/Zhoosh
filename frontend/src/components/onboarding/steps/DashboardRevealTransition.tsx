import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { SubscriptionPlan, PreferenceItem, TRANSITION_BEZIER } from '../types';
import { zhooshAudio } from '@/utils/cinematicSound';

interface DashboardRevealTransitionProps {
  selectedPlan: SubscriptionPlan;
  selectedPreferences: PreferenceItem[];
  userName: string;
  onBeginReveal: () => void;
  onModifyPreferences: () => void;
}

export const DashboardRevealTransition: React.FC<DashboardRevealTransitionProps> = ({
  selectedPlan: _selectedPlan,
  selectedPreferences: _selectedPreferences,
  userName,
  onBeginReveal,
  onModifyPreferences
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLetsGo = () => {
    setIsLaunching(true);
    try {
      zhooshAudio.playZhooshIntroSound();
    } catch {}

    // Prompt: "Button click: text fades, spinner starts, screen dims. Screen split: left slides-out left, right slides-in right (both 400ms)"
    setTimeout(() => {
      onBeginReveal();
    }, 450);
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: TRANSITION_BEZIER }}
      className={`relative min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden transition-colors duration-500 ${
        isLaunching ? 'bg-black' : 'bg-[#0A0A0E]'
      } text-white`}
    >
      {/* Ambient background aura - Red & Purple */}
      <div className={`absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-[#FF1E56]/15 blur-[140px] pointer-events-none transition-opacity duration-400 ${
        isLaunching ? 'opacity-0' : 'opacity-100'
      }`} />
      <div className={`absolute bottom-1/4 right-1/3 w-[500px] h-[500px] rounded-full bg-[#9D4EDD]/15 blur-[140px] pointer-events-none transition-opacity duration-400 ${
        isLaunching ? 'opacity-0' : 'opacity-100'
      }`} />

      {/* Top Bar with Adjust Preferences */}
      <div className="w-full max-w-2xl flex items-center justify-end z-10 mb-4">
        <button
          onClick={onModifyPreferences}
          disabled={isLaunching}
          className="text-xs text-gray-400 hover:text-white font-semibold transition-colors disabled:opacity-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer"
        >
          Adjust Preferences
        </button>
      </div>

      {/* Central Confirmation & Summary Display */}
      <div className="w-full max-w-2xl z-10 my-auto flex flex-col items-center space-y-8 text-center">
        <motion.div
          animate={isLaunching ? { opacity: 0.3, scale: 0.98 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full space-y-4"
        >
          {/* Welcome Title */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl font-black font-serif text-white tracking-tight leading-tight">
              Ready for Liftoff, {userName.split(' ')[0] || 'Member'}
            </h1>
            <p className="text-sm sm:text-base text-gray-400 max-w-lg mx-auto leading-relaxed">
              Your personalized cinema and music experience is calibrated and ready.
            </p>
          </div>
        </motion.div>

        {/* Grand "Let's Go" Launch Button with Red-Purple Gradient */}
        <div className="w-full max-w-md pt-4">
          <motion.button
            type="button"
            disabled={isLaunching}
            onClick={handleLetsGo}
            whileHover={shouldReduceMotion || isLaunching ? {} : { scale: 1.03 }}
            whileTap={shouldReduceMotion || isLaunching ? {} : { scale: 0.97 }}
            className={`relative w-full py-4 rounded-2xl font-black text-base tracking-wider uppercase transition-all shadow-2xl overflow-hidden ${
              isLaunching
                ? 'bg-[#181824] border border-white/20 text-gray-400'
                : 'bg-gradient-to-r from-[#FF1E56] via-[#E50914] to-[#A855F7] text-white hover:brightness-110 shadow-[0_12px_40px_rgba(255,30,86,0.45)]'
            }`}
          >
            {/* Button text fades, spinner starts */}
            <div className="flex items-center justify-center gap-2.5">
              {isLaunching ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 font-mono text-sm"
                >
                  <Loader2 className="w-5 h-5 animate-spin text-[#C084FC]" />
                  <span>Synthesizing Zhoosh Feed...</span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 1 }}
                  className="flex items-center gap-2.5"
                >
                  <span>Let's Go</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              )}
            </div>
          </motion.button>
        </div>
      </div>

      {/* Subtle brand footer */}
      <div className="text-[11px] text-gray-500 z-10 mb-2">
        Zhoosh 2026 • AI-Guided Unified Cinema & Audio Architecture
      </div>
    </motion.div>
  );
};
