import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { SubscriptionPlan } from '../types';

interface AgentSetupStepProps {
  userName: string;
  selectedPlan: SubscriptionPlan;
  onComplete: (agentName: string) => void;
  onBack: () => void;
}

export const AgentSetupStep: React.FC<AgentSetupStepProps> = ({
  userName,
  selectedPlan,
  onComplete,
  onBack,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [agentName, setAgentName] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);

  const effectiveName = agentName.trim();
  const isValid = effectiveName.length >= 2;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgentName(e.target.value);
  };

  const handleLaunch = () => {
    if (!isValid || isLaunching) return;
    setIsLaunching(true);
    setTimeout(() => {
      onComplete(effectiveName);
    }, 900);
  };

  const firstName = userName.split(' ')[0];

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -80 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 sm:p-12 bg-[#050508] text-white overflow-hidden"
    >
      {/* Animated background orbs */}
      {!shouldReduceMotion && (
        <>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,30,86,0.25) 0%, transparent 70%)', filter: 'blur(60px)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.25, 0.12] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(157,78,221,0.3) 0%, transparent 70%)', filter: 'blur(50px)' }}
          />
        </>
      )}

      {/* Back button */}
      <button
        onClick={onBack}
        disabled={isLaunching}
        className="absolute top-8 left-8 text-xs text-gray-500 hover:text-white transition-colors disabled:opacity-30"
      >
        ← Back
      </button>

      <div className="w-full max-w-lg space-y-10 z-10">

        {/* Hero avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 22 }}
          className="flex justify-center"
        >
          <div className="relative">
            <motion.div
              animate={shouldReduceMotion ? {} : {
                boxShadow: [
                  '0 0 24px rgba(255,30,86,0.5), 0 0 48px rgba(157,78,221,0.3)',
                  '0 0 40px rgba(157,78,221,0.7), 0 0 80px rgba(255,30,86,0.3)',
                  '0 0 24px rgba(255,30,86,0.5), 0 0 48px rgba(157,78,221,0.3)',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-28 h-28 rounded-full overflow-hidden"
            >
              <img
                src="/agent-avatar.jpg"
                alt="Your companion"
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Orbit ring */}
            {!shouldReduceMotion && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-3 rounded-full"
                style={{
                  border: '1px dashed rgba(157,78,221,0.4)',
                }}
              />
            )}
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-center space-y-2"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Name your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF1E56] to-[#A855F7]">
              companion
            </span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
            Hey <span className="text-white font-semibold">{firstName}</span>! Your companion will remember your entire Zhoosh journey — every film, every track, every mood.
          </p>
        </motion.div>

        {/* Custom name input */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-4"
        >
          <div
            className="relative rounded-2xl overflow-hidden transition-all duration-300"
            style={{
              background: 'rgba(12,6,24,0.8)',
              border: agentName.trim()
                ? '1.5px solid rgba(157,78,221,0.7)'
                : '1.5px solid rgba(255,255,255,0.1)',
              boxShadow: agentName.trim() ? '0 0 20px rgba(157,78,221,0.2)' : 'none',
            }}
          >
            <input
              type="text"
              value={agentName}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleLaunch()}
              maxLength={20}
              placeholder="Type your companion's name…"
              disabled={isLaunching}
              autoFocus
              className="w-full bg-transparent text-white text-lg font-semibold px-5 py-4 placeholder-gray-600 focus:outline-none disabled:opacity-50"
            />
            {agentName.trim() && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Check className="w-5 h-5 text-[#A855F7]" />
              </div>
            )}
          </div>

          {/* Live preview */}
          <AnimatePresence>
            {effectiveName && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="px-4 py-3 rounded-xl text-sm text-gray-300 leading-relaxed italic"
                  style={{
                    background: 'rgba(157,78,221,0.08)',
                    border: '1px solid rgba(157,78,221,0.2)',
                  }}
                >
                  "Hi {firstName}! I'm{' '}
                  <span className="font-bold text-white not-italic">{effectiveName}</span>. I'll remember your taste in cinema and music, and I'm here whenever you need a recommendation or just want to explore."
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Launch CTA */}
          <motion.button
            whileHover={isValid && !isLaunching ? { scale: 1.02 } : {}}
            whileTap={isValid && !isLaunching ? { scale: 0.98 } : {}}
            onClick={handleLaunch}
            disabled={!isValid || isLaunching}
            className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all relative overflow-hidden disabled:opacity-40"
            style={{
              background: isValid
                ? 'linear-gradient(135deg, #FF1E56 0%, #C026D3 50%, #A855F7 100%)'
                : 'rgba(255,255,255,0.08)',
              boxShadow: isValid ? '0 0 32px rgba(255,30,86,0.35), 0 8px 24px rgba(0,0,0,0.4)' : 'none',
            }}
          >
            <AnimatePresence mode="wait">
              {isLaunching ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Awakening {effectiveName}…
                </motion.span>
              ) : (
                <motion.span
                  key="cta"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2"
                >
                  {effectiveName ? `Meet ${effectiveName}` : 'Name your companion first'}
                  {effectiveName && <ArrowRight className="w-4 h-4" />}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-[11px] text-gray-600"
        >
          You can rename your companion anytime from the agent settings.
        </motion.p>
      </div>
    </motion.div>
  );
};
