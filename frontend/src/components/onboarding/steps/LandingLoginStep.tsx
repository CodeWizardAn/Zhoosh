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
  Volume2
} from 'lucide-react';
import { ZhooshLogo } from '@/components/common/ZhooshLogo';

interface LandingLoginStepProps {
  onGoToPlans: () => void;
  onLoginSuccess: (email: string) => void;
}

interface TrendingMovie {
  id: string;
  title: string;
  category: string;
  year: string;
  rating: string;
  poster: string;
  badge?: string;
}

interface TrendingSong {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  badge?: string;
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
  const [hoveredMovieId, setHoveredMovieId] = useState<string | null>(null);
  const [hoveredSongId, setHoveredSongId] = useState<string | null>(null);

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

  // Trending Movies with authentic uploaded posters: Brand New Day, Mirzapur, Shawshank Redemption, American Psycho
  const trendingMovies: TrendingMovie[] = [
    {
      id: 'brand-new-day',
      title: 'Brand New Day',
      category: 'Drama • Musical Odyssey',
      year: '2025',
      rating: 'U/A • 8.4',
      badge: '#1 in Movies Today',
      poster: '/poster-brand-new-day.jpg'
    },
    {
      id: 'mirzapur',
      title: 'Mirzapur',
      category: 'Action • Crime Drama',
      year: '2024',
      rating: 'A • 8.5',
      badge: 'Season 3 Trending',
      poster: '/poster-mirzapur.jpg'
    },
    {
      id: 'shawshank',
      title: 'The Shawshank Redemption',
      category: 'Drama • IMDb Top #1',
      year: '1994',
      rating: 'U/A • 9.3',
      badge: 'All-Time Masterpiece',
      poster: '/poster-shawshank.jpg'
    },
    {
      id: 'american-psycho',
      title: 'American Psycho',
      category: 'Psychological Thriller',
      year: '2000',
      rating: 'A • 7.6',
      badge: 'Cult Phenomenon',
      poster: '/poster-american-psycho.png'
    }
  ];

  // Trending Songs as explicitly requested: Darmiyaan, Señorita, Gajanana, Beautiful Things
  const trendingSongs: TrendingSong[] = [
    {
      id: 'darmiyaan',
      title: 'Darmiyaan',
      artist: 'Shafqat Amanat Ali & Clinton Cerejo',
      album: 'Jodi Breakers',
      duration: '5:49',
      badge: 'Soulful Classic',
      cover: '/song-darmiyaan.png'
    },
    {
      id: 'senorita',
      title: 'Señorita',
      artist: 'Shawn Mendes & Camila Cabello',
      album: 'Shawn Mendes (Deluxe)',
      duration: '3:11',
      badge: 'Billboard Global #1',
      cover: '/song-senorita.png'
    },
    {
      id: 'gajanana',
      title: 'Gajanana',
      artist: 'Sukhwinder Singh',
      album: 'Bajirao Mastani',
      duration: '3:34',
      badge: 'High-Energy Anthem',
      cover: '/song-gajanana.png'
    },
    {
      id: 'beautiful-things',
      title: 'Beautiful Things',
      artist: 'Benson Boone',
      album: 'Fireworks & Rollerblades',
      duration: '3:00',
      badge: 'Global Viral Track',
      cover: '/song-beautiful-things.png'
    }
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-[#050508] text-white">
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
          <ZhooshLogo size="md" variant="emblem" layout="horizontal" showText={true} />
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
          <p className="text-base sm:text-lg text-gray-200 font-medium">
            Starts at <span className="text-[#FF1E56] font-bold font-mono">$8.99/mo</span>. Cancel anytime.
          </p>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
            Ready to stream? Enter your email to sign in or choose your membership plan.
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
      {/* 4. TRENDING MOVIES SECTION (Netflix-Style Giant Number Ranks)             */}
      {/* ========================================================================= */}
      <section className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Trending Movies</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FF1E56]/20 border border-[#FF1E56]/40 text-[#FF1E56] font-mono uppercase">
                Top 10 Today
              </span>
            </h2>
          </div>
          <button
            onClick={onGoToPlans}
            className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-white flex items-center gap-1 group"
          >
            <span>See All Movies</span>
            <ChevronRight className="w-4 h-4 text-[#FF1E56] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Carousel / Row of Ranked Movie Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 pt-4 pb-2">
          {trendingMovies.map((movie, index) => (
            <div
              key={movie.id}
              className="relative flex items-end select-none group cursor-pointer"
              onClick={onGoToPlans}
              onMouseEnter={() => setHoveredMovieId(movie.id)}
              onMouseLeave={() => setHoveredMovieId(null)}
            >
              {/* Netflix-Style Giant Rank Number Overlapping Lower Left */}
              <span
                className="text-7xl sm:text-8xl lg:text-9xl font-black select-none pointer-events-none absolute -bottom-3 -left-4 sm:-left-6 z-20 leading-none"
                style={{
                  WebkitTextStroke: '4px #FFFFFF',
                  color: '#000000',
                  filter: 'drop-shadow(2px 6px 14px rgba(0,0,0,0.95))'
                }}
              >
                {index + 1}
              </span>

              {/* Poster Card */}
              <motion.div
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ duration: 0.25 }}
                className="relative z-10 w-full aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 bg-[#0E0B16] shadow-xl group-hover:border-[#FF1E56]/80 group-hover:shadow-[0_12px_35px_rgba(255,30,86,0.35)] transition-all"
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter contrast-110"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />



                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                  <div className="w-12 h-12 rounded-full bg-[#FF1E56] text-white flex items-center justify-center shadow-lg shadow-[#FF1E56]/50 transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-white translate-x-0.5" />
                  </div>
                </div>

                {/* Bottom Metadata */}
                <div className="absolute bottom-3 right-3 left-10 sm:left-12 text-right">
                  <h3 className="font-bold text-sm sm:text-base text-white truncate leading-tight drop-shadow">
                    {movie.title}
                  </h3>
                  <p className="text-[10px] text-gray-300 font-medium truncate mt-0.5">
                    {movie.category}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 text-[9px] font-mono text-gray-400 mt-1">
                    <span>{movie.year}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">{movie.rating}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}

          {/* "+ More" Movies Card -> Redirects to Account Creation / Plans */}
          <div
            onClick={onGoToPlans}
            className="relative flex items-end select-none group cursor-pointer"
          >
            <motion.div
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ duration: 0.25 }}
              className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border-2 border-dashed border-[#FF1E56]/40 hover:border-[#FF1E56] bg-gradient-to-b from-[#140C1E]/80 to-[#07050C]/95 backdrop-blur-xl p-5 flex flex-col items-center justify-center text-center shadow-xl hover:shadow-[0_12px_35px_rgba(255,30,86,0.3)] transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF1E56] to-[#A855F7] flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform">
                <Plus className="w-7 h-7" />
              </div>
              <h3 className="font-black text-sm sm:text-base text-white tracking-tight uppercase">
                Explore 5,000+
              </h3>
              <p className="text-xs text-[#FF2E93] font-bold mt-0.5">
                More Movies & Series
              </p>
              <p className="text-[11px] text-gray-400 mt-2 leading-tight">
                Create an account to unlock the full catalog
              </p>
              <span className="mt-4 px-3 py-1.5 rounded-full bg-[#FF1E56]/20 border border-[#FF1E56]/40 text-[10px] font-bold text-white group-hover:bg-[#FF1E56] transition-colors flex items-center gap-1">
                <span>Unlock All</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TRENDING SONGS SECTION (Spotify-Meets-Netflix Ranked Audio Hits)        */}
      {/* ========================================================================= */}
      <section className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Trending Songs</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#C084FC] font-mono uppercase">
                Top Hits Today
              </span>
            </h2>
          </div>
          <button
            onClick={onGoToPlans}
            className="text-xs sm:text-sm font-semibold text-gray-400 hover:text-white flex items-center gap-1 group"
          >
            <span>See All Tracks</span>
            <ChevronRight className="w-4 h-4 text-[#A855F7] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Carousel / Row of Ranked Song Cards - Uniform with Trending Movies */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4 pb-2">
          {trendingSongs.map((song, index) => (
            <div
              key={song.id}
              className="relative flex items-end select-none group cursor-pointer"
              onClick={onGoToPlans}
              onMouseEnter={() => setHoveredSongId(song.id)}
              onMouseLeave={() => setHoveredSongId(null)}
            >
              {/* Giant Rank Number Overlapping Lower Left */}
              <span
                className="text-7xl sm:text-8xl lg:text-9xl font-black select-none pointer-events-none absolute -bottom-3 -left-3 sm:-left-5 z-20 leading-none"
                style={{
                  WebkitTextStroke: '4px #FFFFFF',
                  color: '#000000',
                  filter: 'drop-shadow(2px 6px 14px rgba(0,0,0,0.95))'
                }}
              >
                {index + 1}
              </span>

              {/* Poster/Cover Card — Uniform with Trending Movies */}
              <motion.div
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ duration: 0.25 }}
                className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 bg-[#160D24] shadow-2xl group-hover:border-[#A855F7]/60 group-hover:shadow-[0_12px_35px_rgba(168,85,247,0.3)] transition-all"
              >
                <img
                  src={song.cover}
                  alt={song.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-[#A855F7]/40 text-[9px] font-bold text-[#C084FC]">
                    {song.badge}
                  </span>
                </div>

                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A855F7] to-[#7C3AED] text-white flex items-center justify-center shadow-lg shadow-[#A855F7]/50 transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-white translate-x-0.5" />
                  </div>
                </div>

                {/* Bottom Metadata */}
                <div className="absolute bottom-3 right-3 left-10 sm:left-12 text-right">
                  <h3 className="font-bold text-sm sm:text-base text-white truncate leading-tight drop-shadow">
                    {song.title}
                  </h3>
                  <p className="text-[10px] text-gray-300 font-medium truncate mt-0.5">
                    {song.artist}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 text-[9px] font-mono text-gray-400 mt-1">
                    <span>{song.album}</span>
                    <span>•</span>
                    <span className="text-[#C084FC] font-bold">{song.duration}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. WHY CHOOSE OUR WEBSITE ("Why Choose Zhoosh") SECTION                   */}
      {/* ========================================================================= */}
      <section className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Why Choose Zhoosh?
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-3 leading-relaxed">
            One revolutionary subscription uniting the thrill of cinematic blockbusters with the depth of high-fidelity music.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Dual Universe */}
          <motion.div
            whileHover={{ y: -6 }}
            className="p-6 rounded-3xl bg-[#090611]/90 backdrop-blur-xl border border-[#2B1B3D] hover:border-[#FF1E56]/60 transition-all shadow-xl text-left relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF1E56] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-2xl bg-[#FF1E56]/15 border border-[#FF1E56]/30 flex items-center justify-center text-[#FF1E56] mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Dual Entertainment
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Watch 4K movies and stream 100M+ tracks in one unified app. No need to pay for separate movie and music apps.
            </p>
          </motion.div>

          {/* Card 2: 4K HDR & Spatial Audio */}
          <motion.div
            whileHover={{ y: -6 }}
            className="p-6 rounded-3xl bg-[#090611]/90 backdrop-blur-xl border border-[#2B1B3D] hover:border-[#A855F7]/60 transition-all shadow-xl text-left relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#A855F7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-2xl bg-[#A855F7]/15 border border-[#A855F7]/30 flex items-center justify-center text-[#C084FC] mb-4">
              <Tv2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Cinema 4K & Dolby Audio
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Crystal-clear 4K Ultra HD visual resolution with Dolby Vision and spatial surround sound for every film and track.
            </p>
          </motion.div>

          {/* Card 3: Real-Time Synced Lyrics & Studio Masters */}
          <motion.div
            whileHover={{ y: -6 }}
            className="p-6 rounded-3xl bg-[#090611]/90 backdrop-blur-xl border border-[#2B1B3D] hover:border-[#FF2E93]/60 transition-all shadow-xl text-left relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF2E93] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-2xl bg-[#FF2E93]/15 border border-[#FF2E93]/30 flex items-center justify-center text-[#FF2E93] mb-4">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Studio Master FLAC
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Hear music as the artist intended with 24-bit/192kHz lossless audio and synchronized karaoke-style lyrics.
            </p>
          </motion.div>

          {/* Card 4: Watch Anywhere & Offline */}
          <motion.div
            whileHover={{ y: -6 }}
            className="p-6 rounded-3xl bg-[#090611]/90 backdrop-blur-xl border border-[#2B1B3D] hover:border-emerald-500/60 transition-all shadow-xl text-left relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Watch Anywhere, Cancel Anytime
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Available on phone, tablet, laptop, and smart TV. Download and enjoy offline anywhere with zero cancellation fees.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. TIDY, PROFESSIONAL MULTI-COLUMN FOOTER                                  */}
      {/* ========================================================================= */}
      <footer className="relative z-20 w-full bg-[#030206] border-t border-white/5 text-gray-500 text-xs py-8 select-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ZhooshLogo size="sm" variant="emblem" layout="horizontal" showText={true} />
            <span className="text-[11px] text-gray-600 hidden sm:inline">• Unified Cinema & Audio</span>
          </div>

          <p className="text-[11px] text-gray-600 text-center sm:text-right">
            © {new Date().getFullYear()} Zhoosh. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
