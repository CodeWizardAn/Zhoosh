import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, AlertCircle, Loader2, Sparkles, User, Mail, Lock, Phone } from 'lucide-react';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { SvgSuccessCheckmark } from '../components/SvgSuccessCheckmark';
import { SubscriptionPlan, OnboardingUserData } from '../types';
import { zhooshAudio } from '@/utils/cinematicSound';
import { FadedGridBackdrop } from '@/components/common/FadedGridBackdrop';

interface AccountCreationStepProps {
  selectedPlan: SubscriptionPlan;
  onAccountCreated: (userData: Partial<OnboardingUserData>) => void;
  onBack: () => void;
}

export const AccountCreationStep: React.FC<AccountCreationStepProps> = ({
  selectedPlan,
  onAccountCreated,
  onBack
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Form Field States
  const [name, setName] = useState('');
  const [isNameFocused, setIsNameFocused] = useState(false);

  const [email, setEmail] = useState('');
  const [isEmailValidating, setIsEmailValidating] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const [emailErrorShake, setEmailErrorShake] = useState(false);

  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Progression locks: unlock as previous field validates
  const isNameValid = name.trim().length >= 2;
  const isPasswordValid = password.length >= 6;
  const isPhoneValid = phone.replace(/\D/g, '').length >= 10;

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Email Validation Effect with debounce
  useEffect(() => {
    if (!email) return;

    const timer = setTimeout(() => {
      setIsEmailValidating(false);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        setIsEmailValid(true);
      } else {
        setIsEmailValid(false);
        setEmailErrorShake(true);
        setTimeout(() => setEmailErrorShake(false), 500);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [email]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (!val) {
      setIsEmailValid(null);
      setIsEmailValidating(false);
    } else {
      setIsEmailValidating(true);
    }
  };

  // Phone auto-formatting into (XXX) XXX-XXXX invisibly
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    let formatted = raw;
    if (raw.length > 0) {
      formatted = `(${raw.slice(0, 3)}`;
    }
    if (raw.length >= 4) {
      formatted += `) ${raw.slice(3, 6)}`;
    }
    if (raw.length >= 7) {
      formatted += `-${raw.slice(6, 10)}`;
    }
    setPhone(formatted);
  };

  const handleSpotlightMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNameValid || !isEmailValid || !isPasswordValid) return;

    // Trigger Lock & 3-dot spinner animation
    setIsSubmitting(true);

    setTimeout(() => {
      // Show centered Success Card with 600ms SVG checkmark draw + spring bounce
      setIsSuccess(true);
      try {
        zhooshAudio.playZhooshIntroSound();
      } catch {}

      // Auto-advance 1.2s later
      setTimeout(() => {
        onAccountCreated({
          name: name.trim(),
          email: email.trim(),
          phone: phone || '(555) 234-5678',
          password
        });
      }, 1200);
    }, 850);
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -100 }} // Form slides-out left 300ms
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 bg-[#050508] text-white overflow-x-hidden"
    >
      {/* Faded Poster Grid & Perspective Mesh Backdrop */}
      <FadedGridBackdrop intensity="medium" showPosters={true} />

      {/* Top Navigation */}
      <div className="w-full max-w-2xl flex items-center justify-between z-10 mb-6">
        <button
          onClick={onBack}
          disabled={isSubmitting || isSuccess}
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5 disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Plan ({selectedPlan.name})</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FF1E56] animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-gray-300 uppercase">
            Step 2 of 3: Account Credentials
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-lg z-10 my-auto">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full bg-[#12121A]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-9 shadow-[0_24px_50px_rgba(0,0,0,0.7)] relative overflow-hidden"
            >
              {/* Plan Mini-Badge */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedPlan.accentColor }}
                  />
                  <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
                    Selected: <strong className="text-white font-sans">{selectedPlan.name}</strong> (${selectedPlan.priceMonthly}/mo)
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                  {selectedPlan.resolution}
                </span>
              </div>

              <div className="text-left mb-6">
                <h2 className="text-2xl font-bold font-serif text-white tracking-tight">
                  Create Your Master Profile
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Each field activates sequentially to build your secure key.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Full Name - Floating Label (size 16 -> 12px, Y-20px), stays floated */}
                <div className="relative pt-3">
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-gray-500 z-10 pointer-events-none" />
                    <input
                      type="text"
                      id="account-name"
                      disabled={isSubmitting}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setIsNameFocused(true)}
                      onBlur={() => setIsNameFocused(false)}
                      className="w-full bg-[#181824] border border-white/10 rounded-xl pt-3.5 pb-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#E50914] transition-colors disabled:opacity-60"
                    />

                    {/* Floating Label */}
                    <motion.label
                      htmlFor="account-name"
                      initial={false}
                      animate={{
                        y: isNameFocused || name ? -20 : 0,
                        fontSize: isNameFocused || name ? '11px' : '14px',
                        color: isNameFocused ? '#E50914' : name ? '#D1D5DB' : '#9CA3AF'
                      }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-10 pointer-events-none font-semibold origin-left z-10"
                    >
                      Full Name
                    </motion.label>
                  </div>
                </div>

                {/* 2. Email Address - Animates in when name validates */}
                <AnimatePresence>
                  {isNameValid && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -8 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <label className="block text-xs font-semibold text-gray-300">
                        Email Address
                      </label>
                      <motion.div
                        animate={
                          emailErrorShake && !shouldReduceMotion
                            ? { x: [0, -4, 4, -2, 2, 0] }
                            : { x: 0 }
                        }
                        transition={{ duration: 0.4 }}
                        className="relative flex items-center"
                      >
                        <Mail className="absolute left-3.5 w-4 h-4 text-gray-500" />
                        <input
                          type="email"
                          disabled={isSubmitting}
                          value={email}
                          onChange={handleEmailChange}
                          placeholder="alex@zhoosh.stream"
                          className={`w-full bg-[#181824] border rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none transition-colors disabled:opacity-60 ${
                            isEmailValid === true
                              ? 'border-emerald-500/80 focus:border-emerald-400'
                              : isEmailValid === false
                              ? 'border-red-500 focus:border-red-400'
                              : 'border-white/10 focus:border-[#E50914]'
                          }`}
                        />

                        {/* Email Validation Status Icon */}
                        <div className="absolute right-3 flex items-center">
                          {isEmailValidating && (
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                          )}
                          {!isEmailValidating && isEmailValid === true && (
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                          {!isEmailValidating && isEmailValid === false && (
                            <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                              <AlertCircle className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 3. Password & Strength Meter - Animates in when email is valid */}
                <AnimatePresence>
                  {isEmailValid === true && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -8 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <label className="block text-xs font-semibold text-gray-300">
                        Create Password
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 w-4 h-4 text-gray-500" />
                        <input
                          type="password"
                          disabled={isSubmitting}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 chars (include numbers)"
                          className="w-full bg-[#181824] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#A855F7] transition-colors disabled:opacity-60"
                        />
                      </div>

                      {/* Password strength meter fills with gradient color transition (orange -> yellow -> green) */}
                      <PasswordStrengthMeter password={password} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 4. Phone - Auto formats invisibly as user types */}
                <AnimatePresence>
                  {isPasswordValid && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -8 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-gray-300">
                          Mobile Verification Number
                        </label>
                        <span className="text-[10px] text-gray-500">Auto-formatted</span>
                      </div>
                      <div className="relative flex items-center">
                        <Phone className="absolute left-3.5 w-4 h-4 text-gray-500" />
                        <input
                          type="tel"
                          disabled={isSubmitting}
                          value={phone}
                          onChange={handlePhoneChange}
                          placeholder="(555) 000-0000"
                          maxLength={14}
                          className="w-full bg-[#181824] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white font-mono focus:outline-none focus:border-[#A855F7] transition-colors disabled:opacity-60"
                        />
                        {isPhoneValid && (
                          <div className="absolute right-3 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button with Spotlight Sweep Left-to-Right */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isNameValid || !isEmailValid || !isPasswordValid}
                    onMouseMove={handleSpotlightMove}
                    className="relative w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-white overflow-hidden border border-white/15 shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed group bg-[#1B1B28]"
                  >
                    {/* Spotlight sweep gradient on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: `radial-gradient(180px circle at ${mousePos.x}px ${mousePos.y}px, rgba(168, 85, 247, 0.45), rgba(255, 30, 86, 0.35) 45%, transparent 75%)`
                      }}
                    />

                    {/* Continuous subtle ambient gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF1E56] via-[#E50914] to-[#9D4EDD] opacity-90 group-hover:opacity-100 transition-opacity" />

                    {/* Content inside button */}
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        /* Spinner pulses (3-dot animation) */
                        <div className="flex items-center gap-1.5 py-0.5">
                          <motion.span
                            className="w-2 h-2 rounded-full bg-white"
                            animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.2, 0.7] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          />
                          <motion.span
                            className="w-2 h-2 rounded-full bg-white"
                            animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.2, 0.7] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                          />
                          <motion.span
                            className="w-2 h-2 rounded-full bg-white"
                            animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.2, 0.7] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                          />
                          <span className="ml-2 font-mono text-xs">Authenticating Vault...</span>
                        </div>
                      ) : (
                        <>
                          <span>Establish Zhoosh Profile</span>
                          <Sparkles className="w-4 h-4 text-[#C084FC]" />
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* Centered Success Card with spring bounce and 600ms SVG checkmark */
            <motion.div
              key="success-card"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.75, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              className="w-full bg-[#12121E]/95 backdrop-blur-2xl border border-purple-500/40 rounded-3xl p-8 sm:p-10 shadow-[0_24px_60px_rgba(168,85,247,0.35)] text-center relative overflow-hidden"
            >
              <div className="flex flex-col items-center">
                <SvgSuccessCheckmark size={72} color="#A855F7" />

                <motion.h3
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="text-2xl font-bold text-white font-serif tracking-tight mt-5"
                >
                  Zhoosh Profile Initialized!
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="text-xs text-gray-300 mt-1 max-w-xs"
                >
                  Welcome aboard, <strong className="text-[#C084FC]">{name}</strong>. Calibrating your personalized recommendation matrix...
                </motion.p>

                <div className="mt-6 flex items-center gap-2 text-[11px] font-mono text-purple-300 bg-purple-500/15 px-3.5 py-1.5 rounded-full border border-purple-500/30">
                  <div className="w-2 h-2 rounded-full bg-[#FF1E56] animate-ping" />
                  <span>Auto-advancing to Taste Calibration...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer reassurance */}
      <div className="text-center text-[11px] text-gray-500 z-10 mb-2">
        End-to-end 256-bit encryption • No tracking across third-party networks
      </div>
    </motion.div>
  );
};
