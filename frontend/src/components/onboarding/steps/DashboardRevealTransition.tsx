import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, CheckCircle, Shield } from 'lucide-react';
import { SubscriptionPlan, PreferenceItem, TRANSITION_BEZIER } from '../types';
import { PreferenceSummaryStrip } from '../components/PreferenceSummaryStrip';
import { zhooshAudio } from '@/utils/cinematicSound';

interface DashboardRevealTransitionProps {
  selectedPlan: SubscriptionPlan;
  selectedPreferences: PreferenceItem[];
  userName: string;
  onBeginReveal: () => void;
  onModifyPreferences: () => void;
}

export const DashboardRevealTransition: React.FC<DashboardRevealTransitionProps> = ({
  selectedPlan,
  selectedPreferences,
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

      {/* Top Breadcrumb */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10 mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C084FC]" />
          <span className="text-xs font-mono font-bold tracking-wider text-gray-300 uppercase">
            Taste Profile Synchronized
          </span>
        </div>
        <button
          onClick={onModifyPreferences}
          disabled={isLaunching}
          className="text-xs text-gray-400 hover:text-white font-semibold transition-colors disabled:opacity-30"
        >
          Adjust Preferences
        </button>
      </div>

      {/* Central Confirmation & Summary Display */}
      <div className="w-full max-w-2xl z-10 my-auto flex flex-col items-center space-y-6 text-center">
        <motion.div
          animate={isLaunching ? { opacity: 0.3, scale: 0.98 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full space-y-6"
        >
          {/* Welcome Title */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
              <CheckCircle className="w-3.5 h-3.5 text-[#FF1E56]" />
              <span>Zhoosh Neural Agent Calibrated</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-serif text-white tracking-tight">
              Ready for Liftoff, {userName.split(' ')[0] || 'Member'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-md mx-auto">
              Your unified cinema and acoustic experience has synthesized 5 preference vectors with your {selectedPlan.name} membership.
            </p>
          </div>

          {/* Membership Mini Card */}
          <div className="p-4 rounded-2xl bg-[#12121E] border border-purple-500/20 flex items-center justify-between shadow-lg text-left">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                style={{ backgroundColor: selectedPlan.accentColor }}
              >
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{selectedPlan.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300">
                    {selectedPlan.resolution}
                  </span>
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  ${selectedPlan.priceMonthly}/mo • {selectedPlan.simultaneousStreams} Concurrent Screens
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-[#C084FC] font-semibold">
              <span>Lossless Spatial Audio</span>
            </div>
          </div>

          {/* Top 5 Summary Strip */}
          <PreferenceSummaryStrip
            selectedItems={selectedPreferences}
            onRemoveItem={() => {}}
            maxItems={5}
          />
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
