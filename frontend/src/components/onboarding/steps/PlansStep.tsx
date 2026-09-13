import React, { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, Sparkles, Monitor, Tv } from 'lucide-react';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '../types';
import { zhooshAudio } from '@/utils/cinematicSound';
import { FadedGridBackdrop } from '@/components/common/FadedGridBackdrop';

interface PlansStepProps {
  onPlanSelected: (plan: SubscriptionPlan) => void;
  onBack: () => void;
  initialSelectedId?: string;
}

export const PlansStep: React.FC<PlansStepProps> = ({
  onPlanSelected,
  onBack,
  initialSelectedId = 'standard'
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialSelectedId);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];

  const handleContinue = () => {
    if (selectedPlan) {
      onPlanSelected(selectedPlan);
    }
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 bg-[#050508] text-white overflow-x-hidden"
    >
      {/* Faded Poster Grid & Perspective Mesh Backdrop */}
      <FadedGridBackdrop intensity="vibrant" showPosters={true} />

      {/* Top Header Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between z-10 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Welcome</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FF1E56] animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-gray-300 uppercase">
            Step 1 of 3: Membership Tier
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl z-10 flex flex-col items-center my-auto">
        {/* Title Header */}
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif text-white">
            Choose Your Zhoosh Cinema Tier
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-sans">
            Switch or cancel anytime. All plans feature unified AI curation and lossless audio.
          </p>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="flex items-center justify-center pt-2">
            <div className="p-1 rounded-full bg-[#181824] border border-white/10 flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-3.5 py-1.5 rounded-full font-semibold flex items-center gap-1.5 transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-[#FF1E56] to-[#9D4EDD] text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>Yearly</span>
                <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full font-bold">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Three Tall Cards (Basic / Standard / Premium) - Staggered 80ms apart */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-5xl">
          {SUBSCRIPTION_PLANS.map((plan, index) => {
            const isSelected = selectedPlanId === plan.id;
            const price = billingCycle === 'yearly' 
              ? (plan.priceMonthly * 0.8).toFixed(2) 
              : plan.priceMonthly.toFixed(2);

            return (
              <motion.div
                key={plan.id}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08, // 80ms stagger
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: -8, // On hover: card lifts Y-8px
                        transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
                      }
                }
                onClick={() => {
                  setSelectedPlanId(plan.id);
                  try {
                    zhooshAudio.playZhooshIntroSound();
                  } catch {}
                }}
                className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 cursor-pointer transition-all duration-300 select-none overflow-hidden ${
                  isSelected
                    ? 'bg-[#151522] border-2 shadow-[0_20px_45px_-10px_rgba(0,0,0,0.8)]'
                    : 'bg-[#12121A]/80 border border-white/10 hover:border-white/20 shadow-xl'
                }`}
                style={{
                  borderColor: isSelected ? plan.accentColor : undefined,
                  boxShadow: isSelected ? `0 18px 40px -10px ${plan.accentColor}33` : undefined
                }}
              >
                {/* Popular / Best Badge */}
                {plan.badge && (
                  <div
                    className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-mono font-black uppercase tracking-wider shadow-md"
                    style={{
                      backgroundColor: plan.accentColor,
                      color: plan.id === 'premium' ? '#000000' : '#FFFFFF'
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* Top Section */}
                <div>
                  {/* Selection Spring Checkmark Indicator (scale 0 -> 1.2 -> 1) */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400">
                      Tier 0{index + 1}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'border-transparent shadow-md'
                          : 'border-white/20 bg-white/5'
                      }`}
                      style={{
                        backgroundColor: isSelected ? plan.accentColor : undefined
                      }}
                    >
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={shouldReduceMotion ? { scale: 1 } : { scale: 0 }}
                            animate={{ scale: [0, 1.25, 1] }}
                            exit={{ scale: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 24
                            }}
                          >
                            <Check className={`w-4 h-4 stroke-[3] ${
                              plan.id === 'premium' ? 'text-black' : 'text-white'
                            }`} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Plan Name & Tagline (Serif typography) */}
                  <h3 className="text-xl font-bold font-serif tracking-tight text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed min-h-[34px]">
                    {plan.tagline}
                  </p>

                  {/* Price with currency animate-in (Mono typography) */}
                  <motion.div
                    key={`${plan.id}-${billingCycle}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-5 pb-5 border-b border-white/10 flex items-baseline gap-1 font-mono"
                  >
                    <span className="text-xl font-bold text-gray-400">$</span>
                    <span className="text-4xl font-black tracking-tight text-white">
                      {price}
                    </span>
                    <span className="text-xs text-gray-400 font-sans">
                      / month
                    </span>
                  </motion.div>

                  {/* High Level Hardware Specs */}
                  <div className="grid grid-cols-2 gap-2 my-4 py-2 px-3 rounded-xl bg-white/5 border border-white/5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <Tv className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-semibold">{plan.resolution}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <Monitor className="w-3.5 h-3.5 text-gray-400" />
                      <span>{plan.simultaneousStreams} Screens</span>
                    </div>
                  </div>

                  {/* Features Fade + Slide-left sequentially (staggered 30ms) */}
                  <ul className="space-y-3 mt-4">
                    {plan.features.map((feat, featIdx) => (
                      <motion.li
                        key={featIdx}
                        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.2 + featIdx * 0.04, // Stagger 30-40ms per feature
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                        className="flex items-start gap-2.5 text-xs text-gray-300 leading-snug"
                      >
                        <div
                          className="mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[10px]"
                          style={{
                            backgroundColor: `${plan.accentColor}25`,
                            color: plan.accentColor
                          }}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Select Pill Indicator */}
                <div className="pt-6 mt-4">
                  <div
                    className={`w-full py-2.5 rounded-xl text-center text-xs font-bold transition-colors ${
                      isSelected
                        ? 'text-black'
                        : 'text-gray-300 bg-white/5 hover:bg-white/10'
                    }`}
                    style={{
                      backgroundColor: isSelected ? plan.accentColor : undefined
                    }}
                  >
                    {isSelected ? 'Selected Plan' : 'Select Tier'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating Continue Button - Fades in when plan is selected */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-xl z-20 mt-8 mb-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#181826]/90 backdrop-blur-xl border border-white/15 shadow-2xl"
          >
            <div className="flex items-center gap-3 px-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedPlan.accentColor }}
              />
              <div className="text-left">
                <div className="text-xs font-bold text-white">
                  {selectedPlan.name} Tier Selected
                </div>
                <div className="text-[11px] text-gray-400 font-mono">
                  ${selectedPlan.priceMonthly}/mo • {selectedPlan.resolution} • Cancel anytime
                </div>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={() => {
                try {
                  zhooshAudio.playZhooshIntroSound();
                } catch {}
                handleContinue();
              }}
              whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase text-white bg-gradient-to-r from-[#FF1E56] via-[#E50914] to-[#A855F7] hover:brightness-110 shadow-lg shadow-[#FF1E56]/25 flex items-center justify-center gap-2 transition-all"
            >
              <span>Continue to Profile Setup</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
