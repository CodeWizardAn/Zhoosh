import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
  Layers,
  Music,
  CheckCircle2,
  ShieldCheck,
  Disc3,
  Tv2,
  Play,
  Plus,
  Flame,
  Globe,
  Headphones,
  Download,
  Smartphone,
  ChevronRight,
  Volume2,
  GraduationCap,
  Award,
  Scale,
  Code2
} from 'lucide-react';
import { ZhooshLogo } from '@/components/common/ZhooshLogo';
import { ProjectCreditsModal } from '@/components/common/ProjectCreditsModal';
import { ACADEMIC_PROJECT_INFO } from '@/data/teamMembers';
import { AppSnapshotsShowcase } from '../components/AppSnapshotsShowcase';
import { BrandStoryCarousel } from '../components/BrandStoryCarousel';
import { WhyChooseZhooshCarousel } from '../components/WhyChooseZhooshCarousel';

interface LandingLoginStepProps {
  onGoToPlans: () => void;
  onLoginSuccess: (email: string) => void;
}

export const LandingLoginStep: React.FC<LandingLoginStepProps> = ({
  onGoToPlans,
  onLoginSuccess
}) => {
  const shouldReduceMotion = useReducedMotion();
  const signInCardRef = React.useRef<HTMLDivElement>(null);
  const emailInputRef = React.useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('zhoosh_last_email') || 'alex.mercer@zhoosh.stream';
    } catch {
      return 'alex.mercer@zhoosh.stream';
    }
  });
  const [password, setPassword] = useState('ZhooshPass2026!');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [backdropMode, setBackdropMode] = useState<'dual' | 'movies' | 'music'>('dual');
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [creditsTab, setCreditsTab] = useState<'legal' | 'developer' | 'academic'>('legal');

  const handleSignInClick = () => {
    if (signInCardRef.current) {
      signInCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 400);
    }
  };

  const triggerErrorShake = (msg: string) => {
    setErrorMessage(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      triggerErrorShake('Please provide a valid email address');
      return;
    }
    if (!password || password.length < 4) {
      triggerErrorShake('Password must be at least 4 characters');
      return;
    }

    setErrorMessage('');
    onLoginSuccess(email);
  };

  const handleQuickDemo = () => {
    setEmail('alex.mercer@zhoosh.stream');
    setPassword('ZhooshPass2026!');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-clip bg-[#050508] text-white">
      {/* ========================================================================= */}
      {/* 1. HIGH-VIBRANCY MEDIA BACKDROP: Netflix Poster Wall + Spotify Music Wall */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        {/* Left Side / Full: Authentic Netflix Tilted Poster Wall */}
        {(backdropMode === 'dual' || backdropMode === 'movies') && (
          <div
            className={`absolute inset-0 transition-all duration-700 ${
              backdropMode === 'dual'
                ? 'w-full lg:w-[58%] opacity-70 filter contrast-125 saturate-110'
                : 'w-full opacity-80 filter contrast-125 saturate-110'
            }`}
          >
            <img
              src="/netflix-poster-wall.jpg"
              alt="Zhoosh Movie Poster Wall"
              className="w-full h-full object-cover object-left-top"
            />
            {backdropMode === 'dual' && (
              <div className="absolute inset-y-0 right-0 w-64 bg-gradient-to-r from-transparent via-[#050508]/80 to-[#050508]" />
            )}
            <div className="absolute inset-0 bg-[#FF1E56]/10 mix-blend-color-dodge pointer-events-none" />
          </div>
        )}

        {/* Right Side / Full: Authentic Spotify Music Collage Wall */}
        {(backdropMode === 'dual' || backdropMode === 'music') && (
          <div
            className={`absolute inset-0 transition-all duration-700 ${
              backdropMode === 'dual'
                ? 'left-auto right-0 w-full lg:w-[52%] opacity-65 filter contrast-115 saturate-115'
                : 'w-full opacity-80 filter contrast-115 saturate-115'
            }`}
          >
            <img
              src="/music-collage-wall.png"
              alt="Spotify Music Collage Wall"
              className="w-full h-full object-cover object-right-top"
            />
            {backdropMode === 'dual' && (
              <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-l from-transparent via-[#050508]/80 to-[#050508]" />
            )}
            <div className="absolute inset-0 bg-[#A855F7]/10 mix-blend-color-dodge pointer-events-none" />
          </div>
        )}

        {/* Center Vignette so Forms and Typography remain 100% Readable */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#050508]/70 to-[#050508] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/85 via-transparent to-[#050508] pointer-events-none" />

        {/* Ambient Neon Atmosphere Glows */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full bg-[#FF1E56]/20 blur-[160px] pointer-events-none" />
        <div className="absolute -bottom-32 right-1/4 w-[600px] h-[600px] rounded-full bg-[#A855F7]/25 blur-[160px] pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP HEADER: Brand Logo & CTA Buttons */}
      {/* ========================================================================= */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <ZhooshLogo size="md" layout="horizontal" showWordmark={true} />
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSignInClick}
            className="px-5 py-2 rounded-full text-sm font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/50 transition-all backdrop-blur-sm bg-white/5 hover:bg-white/10 cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onGoToPlans}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-[#FF1E56] to-[#A855F7] text-sm font-bold text-white shadow-lg shadow-[#FF1E56]/25 hover:shadow-[#FF1E56]/50 hover:scale-105 transition-all cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>


      {/* ========================================================================= */}
      {/* 3. HERO SECTION: Netflix-Style Headline & Sign-In Card                    */}
      {/* ========================================================================= */}
      <main className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center px-4 pt-10 pb-16">
        {/* Netflix-Style Grand Headline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3 max-w-3xl"
        >
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Unlimited movies, music, and more
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto leading-relaxed pt-1">
            Personalized movie and music recommendations tailored to your taste, mood, and vibe—all in one seamless universe.
          </p>
        </motion.div>

        {/* Sliding Sign In Card */}
        <motion.div
          ref={signInCardRef}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          className="w-full max-w-md mt-8"
        >
          <motion.div
            animate={isShaking && !shouldReduceMotion ? { x: [0, -4, 4, -2, 2, 0] } : { x: 0 }}
            transition={{ duration: 0.42 }}
            className="w-full bg-[#08060D]/95 backdrop-blur-2xl border border-[#2D1B45] rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative overflow-hidden text-left"
          >
            {/* Top Accent Gradient Border Glow: Red to Purple */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FF1E56] via-[#FF2E93] to-[#A855F7]" />

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Sign In to Zhoosh
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Cinema universe & studio master audio
                </p>
              </div>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="text-[11px] text-[#C084FC] hover:underline font-mono bg-[#A855F7]/15 px-2.5 py-1 rounded-md border border-[#A855F7]/30"
              >
                Auto-fill Demo
              </button>
            </div>

            {/* Error Banner with shake feedback */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail
                    className={`absolute left-3.5 w-4 h-4 transition-colors duration-200 ${
                      isEmailFocused ? 'text-[#FF1E56]' : 'text-gray-500'
                    }`}
                  />
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    placeholder="you@zhoosh.stream"
                    className="w-full bg-[#120D1A] border border-[#2B193D] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition-colors focus:outline-none focus:border-[#FF1E56]"
                  />
                  <motion.div
                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-[#FF1E56] to-[#A855F7] rounded-full pointer-events-none origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isEmailFocused ? 1 : 0 }}
                    transition={{ duration: 0.22 }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-300">
                    Password
                  </label>
                  <span className="text-[11px] text-gray-400">Min 4 characters</span>
                </div>
                <div className="relative flex items-center">
                  <Lock
                    className={`absolute left-3.5 w-4 h-4 transition-colors duration-200 ${
                      isPasswordFocused ? 'text-[#A855F7]' : 'text-gray-500'
                    }`}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    placeholder="••••••••"
                    className="w-full bg-[#120D1A] border border-[#2B193D] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition-colors focus:outline-none focus:border-[#A855F7]"
                  />
                  <motion.div
                    className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-[#A855F7] to-[#FF1E56] rounded-full pointer-events-none origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isPasswordFocused ? 1 : 0 }}
                    transition={{ duration: 0.22 }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF1E56] to-[#A855F7] hover:from-[#E50914] hover:to-[#9333EA] font-bold text-sm text-white shadow-lg shadow-[#FF1E56]/30 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Enter Zhoosh</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1F1430]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#08060D] px-3 text-gray-500 font-mono text-[10px]">
                  New to Zhoosh?
                </span>
              </div>
            </div>

            {/* Go to Plans Button with Morphing Arrow */}
            <motion.button
              type="button"
              onClick={onGoToPlans}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 rounded-xl border border-white/15 hover:border-[#A855F7]/60 hover:bg-[#120D1A] text-gray-200 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF1E56]" />
              <span>Explore Subscription Plans</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </motion.div>
      </main>

      {/* ========================================================================= */}
      {/* 4. APP SNAPSHOTS SHOWCASE (macOS Window Frame Mockup)                      */}
      {/* ========================================================================= */}
      <AppSnapshotsShowcase onExplore={onGoToPlans} />

      {/* ========================================================================= */}
      {/* 5. OUR STORY: HORIZONTAL SWIPEABLE CARDS (Multi-Dimensional Discovery)   */}
      {/* ========================================================================= */}
      <BrandStoryCarousel onExplorePlans={onGoToPlans} />

      {/* ========================================================================= */}
      {/* 6. WHY CHOOSE OUR WEBSITE ("Why Choose Zhoosh") SECTION                   */}
      {/* ========================================================================= */}
      <WhyChooseZhooshCarousel />

      {/* ========================================================================= */}
      {/* 7. MINIMALIST FOOTER WITH DEVELOPER TEAM & AI COMPETITION BUTTONS        */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full bg-[#030206] border-t border-white/5 text-gray-500 text-xs py-8 select-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <ZhooshLogo size="sm" layout="horizontal" showWordmark={true} />
              <span className="text-[11px] text-gray-600 hidden sm:inline">• Unified Cinema & Audio</span>
            </div>

            <div className="flex items-center gap-5 text-gray-400 font-medium">
              <button
                onClick={() => {
                  setCreditsTab('developer');
                  setIsCreditsOpen(true);
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Developer Team
              </button>
            </div>
          </div>

          <p className="text-[11px] text-gray-600 text-center sm:text-right">
            © {new Date().getFullYear()} Zhoosh • Pillai University (Batch A2)
          </p>
        </div>
      </footer>

      {/* Interactive Project Credits Modal */}
      <ProjectCreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
        defaultTab={creditsTab}
      />
    </div>
  );
};
