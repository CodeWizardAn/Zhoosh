import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Info,
  Heart,
  Plus,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Award,
  Flame,
  Check,
  Shuffle
} from 'lucide-react';
import { useMovies, useLikeMutation } from '@/api/hooks';
import { useAppStore } from '@/store/useAppStore';
import { triggerLikeBurst } from '@/utils/confetti';
import { synthEngine } from '@/utils/audioSynth';
import type { Movie } from '@/types';

// ─── HERO SHOWCASE MOVIES (Ultra HD Backdrops + Stylized Custom Logos) ────────
interface HeroShowcaseItem {
  id: string | number;
  title: string;
  logoType: 'breaking-bad' | 'forrest-gump' | 'shawshank' | 'gladiator' | 'oppenheimer' | 'inception' | 'batman' | 'spiderman' | 'generic';
  tagline: string;
  genres: string[];
  year: number;
  runtimeStr: string;
  rating: string;
  matchScore: number;
  director: string;
  cast: string;
  overview: string;
  backdropUrl: string;
  posterUrl: string;
  backdropPosition?: string;
  mediaTypeLabel?: string;
  awardBadge?: string;
}

const HERO_SHOWCASE: HeroShowcaseItem[] = [
  {
    id: 'hero-breaking-bad',
    title: 'Breaking Bad',
    logoType: 'breaking-bad',
    tagline: 'ALL HAIL THE KING',
    genres: ['Drama', 'Crime', 'Thriller'],
    year: 2008,
    runtimeStr: '5 Seasons',
    rating: 'A',
    matchScore: 99,
    director: 'Vince Gilligan',
    cast: 'Bryan Cranston, Aaron Paul, Anna Gunn, Dean Norris',
    overview:
      'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family’s financial future.',
    backdropUrl: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    backdropPosition: 'center 20%',
    mediaTypeLabel: 'Series',
    awardBadge: 'Emmy Winner'
  },
  {
    id: 'hero-forrest-gump',
    title: 'Forrest Gump',
    logoType: 'forrest-gump',
    tagline: 'LIFE IS LIKE A BOX OF CHOCOLATES',
    genres: ['Drama', 'Romance', 'Comedy'],
    year: 1994,
    runtimeStr: '2h 22m',
    rating: 'U/A 13+',
    matchScore: 99,
    director: 'Robert Zemeckis',
    cast: 'Tom Hanks, Robin Wright, Gary Sinise, Sally Field',
    overview:
      'A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined possible. Yet, despite all he has achieved, his one true love eludes him.',
    backdropUrl: 'https://image.tmdb.org/t/p/original/qdIMHd4sEfJSckfVJfKQvisL02a.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    backdropPosition: 'center 10%',
    awardBadge: '6 Oscars'
  },
  {
    id: 'hero-shawshank',
    title: 'The Shawshank Redemption',
    logoType: 'shawshank',
    tagline: 'FEAR CAN HOLD YOU PRISONER. HOPE CAN SET YOU FREE.',
    genres: ['Drama', 'Crime', 'Classic'],
    year: 1994,
    runtimeStr: '2h 22m',
    rating: 'A 18+',
    matchScore: 99,
    director: 'Frank Darabont',
    cast: 'Tim Robbins, Morgan Freeman, Bob Gunton, William Sadler',
    overview:
      'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work while forging an enduring bond with fellow inmate Red.',
    backdropUrl: 'https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/lyQBXzOQSuE59IsHyhrp0qIiPAz.jpg',
    backdropPosition: 'center top'
  },
  {
    id: 'hero-oppenheimer',
    title: 'Oppenheimer',
    logoType: 'oppenheimer',
    tagline: 'THE WORLD FOREVER CHANGES',
    genres: ['Drama', 'History', 'Thriller', 'Biography'],
    year: 2023,
    runtimeStr: '3h 00m',
    rating: 'A 18+',
    matchScore: 98,
    director: 'Christopher Nolan',
    cast: 'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.',
    overview:
      'The pulse-pounding story of J. Robert Oppenheimer and the Manhattan Project — racing against the Nazis to build the atomic bomb and confronting the catastrophic reality of what came next.',
    backdropUrl: 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropPosition: 'center 20%'
  },
  {
    id: 'hero-gladiator',
    title: 'Gladiator',
    logoType: 'gladiator',
    tagline: 'WHAT WE DO IN LIFE ECHOES IN ETERNITY',
    genres: ['Action', 'Drama', 'Adventure'],
    year: 2000,
    runtimeStr: '2h 35m',
    rating: 'A 18+',
    matchScore: 97,
    director: 'Ridley Scott',
    cast: 'Russell Crowe, Joaquin Phoenix, Connie Nielsen, Oliver Reed',
    overview:
      'In the year 180, the death of Emperor Marcus Aurelius throws the Roman Empire into turmoil. When Maximus Decimus Meridius is betrayed and his family murdered, he is forced into slavery as a gladiator to avenge their deaths.',
    backdropUrl: 'https://image.tmdb.org/t/p/original/3ZVEtQxVPpEp5LNpAULDcxadTU3.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
    backdropPosition: 'center top'
  },
  {
    id: 'hero-inception',
    title: 'Inception',
    logoType: 'inception',
    tagline: 'YOUR MIND IS THE SCENE OF THE CRIME',
    genres: ['Action', 'Sci-Fi', 'Adventure', 'Mystery'],
    year: 2010,
    runtimeStr: '2h 28m',
    rating: 'U/A 13+',
    matchScore: 97,
    director: 'Christopher Nolan',
    cast: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy',
    overview:
      'Dom Cobb is a master thief who extracts corporate secrets from within the subconscious during the dream state. Now, he is offered a chance at redemption: plant an idea into a target’s mind.',
    backdropUrl: 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdropPosition: 'center 25%'
  },
  {
    id: 'hero-batman',
    title: 'The Dark Knight',
    logoType: 'batman',
    tagline: 'WHY SO SERIOUS?',
    genres: ['Action', 'Crime', 'Drama', 'Thriller'],
    year: 2008,
    runtimeStr: '2h 32m',
    rating: 'U/A 16+',
    matchScore: 99,
    director: 'Christopher Nolan',
    cast: 'Christian Bale, Heath Ledger, Aaron Eckhart, Gary Oldman',
    overview:
      'Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and DA Harvey Dent, but finds himself tested psychologically and physically when a psychopathic mastermind known as The Joker unleashes anarchy.',
    backdropUrl: 'https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropPosition: 'center top'
  },
  {
    id: 'hero-spiderman',
    title: 'Spider-Man: Across the Spider-Verse',
    logoType: 'spiderman',
    tagline: 'IT’S HOW YOU WEAR THE MASK THAT MATTERS',
    genres: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
    year: 2023,
    runtimeStr: '2h 20m',
    rating: 'U/A 13+',
    matchScore: 98,
    director: 'Joaquim Dos Santos, Kemp Powers',
    cast: 'Shameik Moore, Hailee Steinfeld, Oscar Isaac, Daniel Kaluuya',
    overview:
      'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a catastrophic threat, Miles must redefine heroism.',
    backdropUrl: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdropPosition: 'center center'
  }
];

// ─── STYLIZED MOVIE LOGO COMPONENT ───────────────────────────────────────────
const MovieLogoTreatment: React.FC<{ item: HeroShowcaseItem }> = ({ item }) => {
  switch (item.logoType) {
    case 'breaking-bad':
      return (
        <div className="mb-3 sm:mb-4 select-none">
          <div className="flex flex-col leading-none">
            {/* Top row: [Br] + eaking */}
            <div className="flex items-center gap-1.5">
              <span className="inline-flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#0F3823] border border-[#2EB85C] text-white font-serif font-black text-base sm:text-lg shadow-[0_0_12px_rgba(46,184,92,0.4)] rounded-xs">
                <span className="text-[7px] font-mono leading-none self-start ml-1 text-emerald-300 font-bold">35</span>
                <span className="-mt-1 font-serif font-black">Br</span>
              </span>
              <span className="font-serif font-bold text-4xl sm:text-5xl text-white tracking-normal drop-shadow-md">
                eaking
              </span>
            </div>
            {/* Bottom row: indent + [Ba] + d */}
            <div className="flex items-center gap-1.5 ml-6 sm:ml-8 -mt-1">
              <span className="inline-flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#0F3823] border border-[#2EB85C] text-white font-serif font-black text-base sm:text-lg shadow-[0_0_12px_rgba(46,184,92,0.4)] rounded-xs">
                <span className="text-[7px] font-mono leading-none self-start ml-1 text-emerald-300 font-bold">56</span>
                <span className="-mt-1 font-serif font-black">Ba</span>
              </span>
              <span className="font-serif font-bold text-4xl sm:text-5xl text-white tracking-normal drop-shadow-md">
                d
              </span>
            </div>
          </div>
        </div>
      );

    case 'forrest-gump':
      return (
        <div className="mb-2 sm:mb-2.5">
          <p className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-amber-400 uppercase mb-1 drop-shadow">
            6 ACADEMY AWARDS · BEST PICTURE
          </p>
          <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl tracking-[0.06em] text-white uppercase drop-shadow-[0_4px_20px_rgba(245,158,11,0.4)] leading-tight select-none">
            FORREST GUMP
          </h1>
          <p className="text-xs sm:text-sm font-medium tracking-wide text-gray-300 italic mt-1 drop-shadow">
            "Life was like a box of chocolates. You never know what you're gonna get."
          </p>
        </div>
      );

    case 'shawshank':
      return (
        <div className="mb-2 sm:mb-2.5">
          <div className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-cyan-300 uppercase mb-1 drop-shadow">
            IMDb #1 ALL-TIME GREATEST FILM
          </div>
          <h1 className="font-sans font-black text-2xl sm:text-4xl md:text-5xl tracking-[0.08em] sm:tracking-[0.12em] text-white uppercase drop-shadow-[0_4px_24px_rgba(56,189,248,0.45)] leading-tight select-none">
            THE SHAWSHANK REDEMPTION
          </h1>
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] text-sky-300 uppercase mt-1">
            FEAR CAN HOLD YOU PRISONER. HOPE CAN SET YOU FREE.
          </p>
        </div>
      );

    case 'gladiator':
      return (
        <div className="mb-2 sm:mb-2.5">
          <div className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-amber-400 uppercase mb-1 drop-shadow">
            ACADEMY AWARD WINNER · BEST PICTURE
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl tracking-[0.14em] text-amber-100 uppercase drop-shadow-[0_4px_24px_rgba(217,119,6,0.5)] leading-tight select-none">
            GLADIATOR
          </h1>
          <p className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-amber-300 uppercase mt-1">
            WHAT WE DO IN LIFE ECHOES IN ETERNITY
          </p>
        </div>
      );

    case 'oppenheimer':
      return (
        <div className="mb-2 sm:mb-2.5">
          <h1 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl tracking-[0.16em] text-orange-50 uppercase drop-shadow-[0_4px_24px_rgba(234,88,12,0.5)] leading-tight select-none">
            OPPENHEIMER
          </h1>
          <p className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-orange-300 uppercase mt-1">
            A FILM BY CHRISTOPHER NOLAN
          </p>
        </div>
      );

    case 'inception':
      return (
        <div className="mb-2 sm:mb-2.5">
          <h1 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-200 to-white uppercase drop-shadow-[0_4px_24px_rgba(225,29,72,0.5)] leading-tight select-none">
            INCEPTION
          </h1>
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] text-red-300 uppercase mt-1">
            YOUR MIND IS THE SCENE OF THE CRIME
          </p>
        </div>
      );

    case 'batman':
      return (
        <div className="mb-2 sm:mb-2.5">
          <div className="text-[10px] sm:text-xs font-bold tracking-[0.4em] text-gray-300 uppercase mb-0.5 drop-shadow">
            THE
          </div>
          <h1 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl tracking-[0.12em] text-white uppercase drop-shadow-[0_4px_24px_rgba(255,255,255,0.4)] leading-tight select-none">
            DARK KNIGHT
          </h1>
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] text-gray-400 uppercase mt-1">
            WELCOME TO A WORLD WITHOUT RULES
          </p>
        </div>
      );

    case 'spiderman':
      return (
        <div className="mb-2 sm:mb-2.5">
          <h1 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-300 to-cyan-400 uppercase drop-shadow-[0_4px_24px_rgba(236,72,153,0.5)] leading-tight select-none">
            SPIDER-MAN
          </h1>
          <p className="text-[10px] sm:text-xs font-extrabold tracking-[0.2em] text-cyan-300 uppercase mt-1">
            ACROSS THE SPIDER-VERSE
          </p>
        </div>
      );

    default:
      return (
        <div className="mb-2 sm:mb-2.5">
          <h1 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-white uppercase drop-shadow-2xl leading-tight select-none">
            {item.title}
          </h1>
        </div>
      );
  }
};

// ─── HERO BILLBOARD COMPONENT ────────────────────────────────────────────────
const HeroBillboard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const { openPopover, likedIds } = useAppStore();
  const likeMutation = useLikeMutation();

  const current = HERO_SHOWCASE[currentIndex];
  const isLiked = !!likedIds[String(current.id)];

  // Auto-advance every 8 seconds when not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SHOWCASE.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % HERO_SHOWCASE.length);
  const handlePrev = () =>
    setCurrentIndex((prev) => (prev - 1 + HERO_SHOWCASE.length) % HERO_SHOWCASE.length);

  const toggleSound = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (!next) {
        synthEngine.playAmbientDrone();
      }
      return next;
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerLikeBurst(e.clientX, e.clientY, 'movies');
    // Convert to Movie item shape for like mutation
    const movieObj: Movie = {
      id: current.id,
      title: current.title,
      overview: current.overview,
      poster_path: current.posterUrl,
      backdrop_path: current.backdropUrl,
      release_date: `${current.year}-01-01`,
      vote_average: 8.8,
      genres: current.genres,
      director: current.director,
      cast: current.cast.split(', '),
      year: current.year,
      match_score: current.matchScore
    };
    likeMutation.mutate({ item: movieObj, mode: 'movies' });
  };

  const handleMoreInfo = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const movieObj: Movie = {
      id: current.id,
      title: current.title,
      overview: current.overview,
      poster_path: current.posterUrl,
      backdrop_path: current.backdropUrl,
      release_date: `${current.year}-01-01`,
      vote_average: 8.8,
      genres: current.genres,
      director: current.director,
      cast: current.cast.split(', '),
      year: current.year,
      match_score: current.matchScore
    };
    openPopover(movieObj, rect);
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 pt-4 pb-6">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full h-[74vh] sm:h-[80vh] min-h-[500px] max-h-[740px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl select-none"
      >
        {/* Background Image Carousel with Cross-Fade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <img
              src={current.backdropUrl}
              alt={current.title}
              style={{ objectPosition: current.backdropPosition || 'center 20%' }}
              className="w-full h-full object-cover"
              onError={(e) => {
                if (current.posterUrl && e.currentTarget.src !== current.posterUrl) {
                  e.currentTarget.src = current.posterUrl;
                }
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 via-45% to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 via-30% to-transparent pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

        {/* TOP-RIGHT: Speaker Audio Toggle Button (Screenshot 1) */}
        <button
          onClick={toggleSound}
          className="absolute right-5 sm:right-7 top-5 sm:top-7 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg cursor-pointer"
          title={isMuted ? 'Unmute preview audio' : 'Mute preview audio'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-gray-200" /> : <Volume2 className="w-5 h-5 text-[#46D369]" />}
        </button>

        {/* Left/Right Carousel Chevrons on Hover */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center opacity-0 hover:opacity-100 group-hover:opacity-80 transition-opacity backdrop-blur-sm cursor-pointer"
          title="Previous blockbuster"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center opacity-0 hover:opacity-100 group-hover:opacity-80 transition-opacity backdrop-blur-sm cursor-pointer"
          title="Next blockbuster"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Content Container (Bottom-Left) */}
        <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-12 max-w-2xl z-20">
          {/* Big Stylized Logo Treatment */}
          <MovieLogoTreatment item={current} />

          {/* Clean Metadata Line (Series • Drama • 2008 • 5 Seasons • A) matching Screenshot 1 */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-gray-200 mb-3 sm:mb-4 drop-shadow">
            {current.mediaTypeLabel && (
              <>
                <span className="font-bold">{current.mediaTypeLabel}</span>
                <span className="text-gray-400">•</span>
              </>
            )}
            <span>{current.genres[0]}</span>
            <span className="text-gray-400">•</span>
            <span>{current.year}</span>
            <span className="text-gray-400">•</span>
            <span>{current.runtimeStr}</span>
            <span className="text-gray-400">•</span>
            <span className="font-bold">{current.rating}</span>
          </div>

          {/* Action Buttons: Play Pill & More Info Pill (Screenshot 1) */}
          <div className="flex items-center gap-3">
            {/* Play Pill */}
            <button
              onClick={() => {
                synthEngine.playAmbientDrone();
                useAppStore.getState().addToast({
                  title: `Playing "${current.title}"`,
                  description: 'Buffering Ultra HD 4K stream with Dolby Atmos audio...',
                  type: 'info'
                });
              }}
              className="flex items-center gap-2 px-6 sm:px-7 py-2.5 rounded-full bg-white hover:bg-white/90 text-black font-extrabold text-sm sm:text-base shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black ml-0.5" />
              Play
            </button>

            {/* More Info Pill */}
            <button
              onClick={handleMoreInfo}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-sm sm:text-base backdrop-blur-md transition-all duration-200 border border-white/20 cursor-pointer"
            >
              More Info
            </button>

            {/* Add to List / Heart Toggle */}
            <button
              onClick={handleLike}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isLiked
                  ? 'border-[#FF1E56] bg-[#FF1E56] text-white shadow-lg shadow-[#FF1E56]/40 scale-105'
                  : 'border-white/40 hover:border-white bg-black/40 hover:bg-black/60 text-white backdrop-blur-md'
              }`}
              title={isLiked ? 'Remove from My List' : 'Add to My List'}
            >
              {isLiked ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* BOTTOM-RIGHT BADGES: "👍 We think you'll love this!" & "🏆 Emmy Winner" (Screenshot 1) */}
        <div className="absolute right-5 sm:right-8 bottom-6 sm:bottom-10 z-20 hidden sm:flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-medium text-white shadow-lg">
            <span>👍</span>
            <span>We think you'll love this!</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-semibold text-white shadow-lg">
            <span>🏆</span>
            <span>{current.awardBadge || 'Emmy Winner'}</span>
          </div>
        </div>

        {/* Carousel Slide Indicators */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {HERO_SHOWCASE.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? 'w-7 h-1.5 bg-[#FF1E56]'
                  : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
              }`}
              title={item.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── CONTINUE WATCHING SHELF (Signature Netflix 2:3 Vertical Cards) ────────
interface ContinueWatchingItem {
  id: string | number;
  movie: Movie;
  progressPercent: number;
  timeLeft: string;
  episodeLabel: string;
}

const ContinueWatchingCard: React.FC<{ item: ContinueWatchingItem }> = ({ item }) => {
  const { movie, progressPercent, timeLeft, episodeLabel } = item;
  const { openPopover, likedIds } = useAppStore();
  const isLiked = !!likedIds[String(movie.id)];
  const likeMutation = useLikeMutation();

  const handleCardPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    synthEngine.playAmbientDrone();
    useAppStore.getState().addToast({
      title: `Resuming "${movie.title}"`,
      description: `Picking up at ${progressPercent}% (${timeLeft})`,
      type: 'info'
    });
  };

  const [imgSrc, setImgSrc] = useState(movie.poster_path || movie.backdrop_path || '');

  useEffect(() => {
    setImgSrc(movie.poster_path || movie.backdrop_path || '');
  }, [movie.poster_path, movie.backdrop_path]);

  return (
    <motion.div
      whileHover={{ scale: 1.06, y: -6, zIndex: 20 }}
      transition={{ duration: 0.2 }}
      className="relative flex-shrink-0 w-[175px] sm:w-[195px] md:w-[220px] cursor-pointer group select-none"
    >
      {/* 2:3 Vertical Container so Posters Fit 100% Correctly */}
      <div className="relative rounded-lg overflow-hidden bg-[#141414] aspect-[2/3] shadow-xl border border-white/5">
        <img
          src={imgSrc}
          alt={movie.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top"
          loading="lazy"
          onError={() => {
            if (imgSrc && imgSrc.includes('/w780/')) {
              setImgSrc(imgSrc.replace('/w780/', '/w500/'));
            } else if (imgSrc && imgSrc.includes('/w500/')) {
              setImgSrc(imgSrc.replace('/w500/', '/original/'));
            } else if (movie.backdrop_path && imgSrc !== movie.backdrop_path) {
              setImgSrc(movie.backdrop_path);
            } else {
              setImgSrc('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80');
            }
          }}
        />

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-2 mb-2.5">
            <button
              onClick={handleCardPlay}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              title="Resume Play"
            >
              <Play className="w-4 h-4 fill-black ml-0.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openPopover(movie, e.currentTarget.getBoundingClientRect());
              }}
              className="w-9 h-9 rounded-full bg-black/60 border border-white/50 text-white flex items-center justify-center hover:border-white transition-colors"
              title="More Info"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerLikeBurst(e.clientX, e.clientY, 'movies');
                likeMutation.mutate({ item: movie, mode: 'movies' });
              }}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                isLiked ? 'bg-[#FF1E56] border-[#FF1E56] text-white' : 'border-white/50 bg-black/60 text-white hover:border-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
            </button>
          </div>

          <h4 className="text-sm font-bold text-white line-clamp-1">{movie.title}</h4>
          <p className="text-xs text-gray-300 truncate mt-0.5">{episodeLabel}</p>
        </div>

        {/* Signature Netflix Red Playback Progress Bar */}
        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/25">
          <div
            className="h-full bg-[#E50914] transition-all duration-300 shadow-[0_0_8px_rgba(229,9,20,0.8)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const ContinueWatchingShelf: React.FC<{ movies: Movie[] }> = ({ movies }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 750 : -750, behavior: 'smooth' });
  };

  const continueItems: ContinueWatchingItem[] = useMemo(() => {
    const timeLabels = ['42m left', '1h 05m left', '24m left', '1h 22m left', '15m left', '52m left'];
    const percentages = [68, 45, 82, 30, 89, 58];
    const episodeLabels = [
      'Part 1: The Gathering',
      'Act II: The Consequence',
      'Chapter 4: The Heist',
      'Scene 9: Beyond the Horizon',
      'Season Finale',
      'Mid-Season Special'
    ];

    return movies.slice(0, 8).map((m, idx) => ({
      id: `cw-${m.id}`,
      movie: m,
      progressPercent: percentages[idx % percentages.length],
      timeLeft: timeLabels[idx % timeLabels.length],
      episodeLabel: episodeLabels[idx % episodeLabels.length]
    }));
  }, [movies]);

  if (!continueItems.length) return null;

  return (
    <div className="group/shelf mb-10">
      <div className="flex items-center gap-2 px-6 sm:px-12 mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Continue Watching for You
        </h2>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-r from-[#050508] via-[#050508]/80 to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-7 h-7 text-white drop-shadow" />
        </button>

        {/* Scroll Track */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar px-6 sm:px-12 pb-2 scroll-smooth"
        >
          {continueItems.map((item) => (
            <ContinueWatchingCard key={item.id} item={item} />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-l from-[#050508] via-[#050508]/80 to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-7 h-7 text-white drop-shadow" />
        </button>
      </div>
    </div>
  );
};

// ─── TOP 10 IN MOVIES TODAY (Signature Netflix Giant Numbered Shelf) ──────────
const Top10Card: React.FC<{ movie: Movie; rank: number }> = ({ movie, rank }) => {
  const { openPopover, likedIds } = useAppStore();
  const isLiked = !!likedIds[String(movie.id)];
  const likeMutation = useLikeMutation();
  const [imgSrc, setImgSrc] = useState(movie.poster_path);

  useEffect(() => {
    setImgSrc(movie.poster_path);
  }, [movie.poster_path]);

  return (
    <motion.div
      whileHover={{ scale: 1.05, zIndex: 30 }}
      transition={{ duration: 0.2 }}
      className="relative flex-shrink-0 flex items-center cursor-pointer group/card select-none"
    >
      {/* Netflix Signature Giant Number (Offset behind poster) */}
      <div className="w-16 sm:w-24 flex items-center justify-center flex-shrink-0 z-0 select-none">
        <span className="text-7xl sm:text-9xl font-black netflix-rank-number tracking-tighter">
          {rank}
        </span>
      </div>

      {/* Vertical Poster Card */}
      <div className="-ml-7 sm:-ml-10 relative w-[145px] sm:w-[170px] md:w-[190px] aspect-[2/3] rounded-lg overflow-hidden bg-[#141414] shadow-2xl z-10 border border-white/10">
        <img
          src={imgSrc}
          alt={movie.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top"
          loading="lazy"
          onError={() => {
            if (imgSrc.includes('/w780/')) {
              setImgSrc(imgSrc.replace('/w780/', '/w500/'));
            } else if (imgSrc.includes('/w500/')) {
              setImgSrc(imgSrc.replace('/w500/', '/original/'));
            } else if (movie.backdrop_path && imgSrc !== movie.backdrop_path) {
              setImgSrc(movie.backdrop_path);
            } else {
              setImgSrc('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80');
            }
          }}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 flex flex-col justify-end opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                synthEngine.playAmbientDrone();
              }}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow hover:scale-105 transition-transform"
              title="Play"
            >
              <Play className="w-4 h-4 fill-black ml-0.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openPopover(movie, e.currentTarget.getBoundingClientRect());
              }}
              className="w-8 h-8 rounded-full bg-black/60 border border-white/50 text-white flex items-center justify-center hover:border-white transition-colors"
              title="More Info"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerLikeBurst(e.clientX, e.clientY, 'movies');
                likeMutation.mutate({ item: movie, mode: 'movies' });
              }}
              className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                isLiked ? 'bg-[#FF1E56] border-[#FF1E56]' : 'border-white/50 bg-black/60 text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-white text-white' : ''}`} />
            </button>
          </div>

          <h4 className="text-sm font-bold text-white line-clamp-1">{movie.title}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
            <span className="text-[#46D369] font-bold">{movie.vote_average.toFixed(1)} ★</span>
            <span>{movie.year || movie.release_date?.split('-')[0]}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Top10Shelf: React.FC<{ movies: Movie[] }> = ({ movies }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 800 : -800, behavior: 'smooth' });
  };

  const top10List = useMemo(() => movies.slice(0, 10), [movies]);
  if (!top10List.length) return null;

  return (
    <div className="group/shelf mb-10">
      <div className="flex items-center gap-2.5 px-6 sm:px-12 mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Top 10 Movies Today
        </h2>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-r from-[#050508] to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto no-scrollbar px-6 sm:px-12 pb-2 scroll-smooth"
        >
          {top10List.map((movie, idx) => (
            <Top10Card key={movie.id} movie={movie} rank={idx + 1} />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-l from-[#050508] to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-7 h-7 text-white" />
        </button>
      </div>
    </div>
  );
};

// ─── STANDARD HORIZONTAL CATEGORY SHELF ──────────────────────────────────────
interface CategoryShelfProps {
  title: string;
  movies: Movie[];
  isLoading?: boolean;
}

const CategoryMovieCard: React.FC<{ movie: Movie }> = ({ movie }) => {
  const { openPopover, likedIds } = useAppStore();
  const isLiked = !!likedIds[String(movie.id)];
  const likeMutation = useLikeMutation();
  const [imgSrc, setImgSrc] = useState(movie.poster_path);

  useEffect(() => {
    setImgSrc(movie.poster_path);
  }, [movie.poster_path]);

  return (
    <motion.div
      whileHover={{ scale: 1.06, y: -6, zIndex: 20 }}
      transition={{ duration: 0.2 }}
      className="relative flex-shrink-0 w-[175px] sm:w-[195px] md:w-[220px] cursor-pointer group/card select-none"
    >
      <div className="relative rounded-lg overflow-hidden bg-[#141414] aspect-[2/3] shadow-lg border border-white/5">
        <img
          src={imgSrc}
          alt={movie.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top"
          loading="lazy"
          onError={() => {
            if (imgSrc.includes('/w780/')) {
              setImgSrc(imgSrc.replace('/w780/', '/w500/'));
            } else if (imgSrc.includes('/w500/')) {
              setImgSrc(imgSrc.replace('/w500/', '/original/'));
            } else if (movie.backdrop_path && imgSrc !== movie.backdrop_path) {
              setImgSrc(movie.backdrop_path);
            } else {
              setImgSrc('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80');
            }
          }}
        />

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 flex flex-col justify-end opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-2 mb-2.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                synthEngine.playAmbientDrone();
              }}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              title="Play"
            >
              <Play className="w-4 h-4 fill-black ml-0.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openPopover(movie, e.currentTarget.getBoundingClientRect());
              }}
              className="w-9 h-9 rounded-full bg-black/60 border border-white/50 text-white flex items-center justify-center hover:border-white transition-colors"
              title="More Info"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerLikeBurst(e.clientX, e.clientY, 'movies');
                likeMutation.mutate({ item: movie, mode: 'movies' });
              }}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                isLiked
                  ? 'bg-[#FF1E56] border-[#FF1E56] text-white'
                  : 'border-white/50 bg-black/60 text-white hover:border-white'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
            </button>
          </div>

          <h4 className="text-sm font-bold text-white line-clamp-1">{movie.title}</h4>

          <div className="flex items-center gap-2.5 text-xs text-gray-300 mt-1">
            <span className="text-[#46D369] font-bold">{movie.vote_average.toFixed(1)} ★</span>
            <span>{movie.year || movie.release_date?.split('-')[0]}</span>
            <span className="border border-white/30 text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold">
              Ultra HD
            </span>
          </div>

          <p className="text-xs text-gray-400 truncate mt-1">
            {movie.genres.slice(0, 2).join(' • ')}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-200 font-medium truncate mt-2 px-1">{movie.title}</p>
    </motion.div>
  );
};

const CategoryShelf: React.FC<CategoryShelfProps> = ({
  title,
  movies,
  isLoading
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 800 : -800, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="space-y-3 px-6 sm:px-12 mb-8">
        <div className="h-5 w-48 bg-white/10 rounded animate-pulse" />
        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[175px] sm:w-[195px] md:w-[220px] aspect-[2/3] rounded-lg bg-white/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!movies.length) return null;

  return (
    <div className="group/shelf mb-9">
      {/* Shelf Header */}
      <div className="flex items-center justify-between px-6 sm:px-12 mb-3">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight hover:text-white/80 cursor-pointer">
          {title}
        </h2>
      </div>

      {/* Track & Chevron Controls */}
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-r from-[#050508] via-[#050508]/80 to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto no-scrollbar px-6 sm:px-12 pb-2 scroll-smooth"
        >
          {movies.map((movie) => (
            <CategoryMovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-l from-[#050508] via-[#050508]/80 to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

// ─── MAIN MOVIES VIEW DASHBOARD ──────────────────────────────────────────────
export const MoviesView: React.FC = () => {
  const { data: movies = [], isLoading } = useMovies();

  // Categorize the master 13,598 movies dataset into diverse shelves
  const trendingMovies = useMemo(() => movies.slice(0, 16), [movies]);

  const actionMovies = useMemo(
    () => movies.filter((m) => m.genres.some((g) => g.toLowerCase().includes('action'))).slice(0, 16),
    [movies]
  );

  const sciFiMovies = useMemo(
    () =>
      movies
        .filter((m) =>
          m.genres.some((g) => {
            const gl = g.toLowerCase();
            return gl.includes('sci-fi') || gl.includes('science fiction') || gl.includes('fantasy');
          })
        )
        .slice(0, 16),
    [movies]
  );

  const thrillerMovies = useMemo(
    () =>
      movies
        .filter((m) =>
          m.genres.some((g) => {
            const gl = g.toLowerCase();
            return gl.includes('thriller') || gl.includes('crime') || gl.includes('mystery');
          })
        )
        .slice(0, 16),
    [movies]
  );

  const comedyMovies = useMemo(
    () => movies.filter((m) => m.genres.some((g) => g.toLowerCase().includes('comedy'))).slice(0, 16),
    [movies]
  );

  const dramaMovies = useMemo(
    () => movies.filter((m) => m.genres.some((g) => g.toLowerCase().includes('drama'))).slice(0, 16),
    [movies]
  );

  const horrorMovies = useMemo(
    () => movies.filter((m) => m.genres.some((g) => g.toLowerCase().includes('horror'))).slice(0, 16),
    [movies]
  );

  const animeMovies = useMemo(
    () =>
      movies
        .filter(
          (m) =>
            m.genres.some((g) => g.toLowerCase().includes('animation')) ||
            (m.language && m.language.toLowerCase() === 'japanese')
        )
        .slice(0, 16),
    [movies]
  );

  const romanceMovies = useMemo(
    () => movies.filter((m) => m.genres.some((g) => g.toLowerCase().includes('romance'))).slice(0, 16),
    [movies]
  );

  const internationalMovies = useMemo(
    () =>
      movies
        .filter(
          (m) =>
            m.language &&
            ['french', 'spanish', 'korean', 'japanese', 'hindi', 'italian'].includes(
              m.language.toLowerCase()
            )
        )
        .slice(0, 16),
    [movies]
  );

  const topRatedMasterpieces = useMemo(
    () => movies.filter((m) => m.vote_average >= 8.2).slice(0, 16),
    [movies]
  );

  return (
    <div className="relative pb-28 bg-[#07070b] min-h-screen overflow-x-hidden">
      {/* Black & Red Faded Grid Design Background Layer */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        {/* Geometric Red Grid Mesh */}
        <div className="absolute inset-0 dashboard-grid-pattern opacity-90" />

        {/* Ambient Red Aura Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-[1200px] h-[500px] rounded-full bg-[#E50914]/15 blur-[120px]" />
        <div className="absolute top-[35%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#B81D24]/12 blur-[140px]" />
        <div className="absolute top-[65%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[#E50914]/10 blur-[140px]" />

        {/* Radial vignette fade from center so grid is softly framed */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 20%, transparent 40%, rgba(5,5,8,0.75) 85%)'
          }}
        />
      </div>

      {/* 1. CINEMATIC HERO BILLBOARD (Big Movie Logo On Top) */}
      <div className="relative z-10">
        <HeroBillboard />
      </div>

      {/* 2. DASHBOARD CATEGORY ROWS (Downside of Hero) */}
      <div className="relative z-10 mt-3 sm:mt-6 space-y-6">
        {/* Continue Watching Row (16:9 widescreen landscape cards with red progress bar) */}
        <ContinueWatchingShelf movies={movies} />

        {/* Top 10 in Movies Today (Netflix signature giant numbered typography #1 to #10) */}
        <Top10Shelf movies={movies} />

        {/* Trending Now */}
        <CategoryShelf
          title="Trending Now"
          movies={trendingMovies}
          isLoading={isLoading}
        />

        {/* Blockbuster Action & Explosive Thrills */}
        {actionMovies.length > 0 && (
          <CategoryShelf
            title="Blockbuster Action & High-Octane Thrills"
            movies={actionMovies}
            isLoading={isLoading}
          />
        )}

        {/* Mind-Bending Sci-Fi & Cosmic Marvels */}
        {sciFiMovies.length > 0 && (
          <CategoryShelf
            title="Mind-Bending Sci-Fi & Cosmic Marvels"
            movies={sciFiMovies}
            isLoading={isLoading}
          />
        )}

        {/* Edge-of-Your-Seat Thrillers & True Crime */}
        {thrillerMovies.length > 0 && (
          <CategoryShelf
            title="Edge-of-Your-Seat Thrillers & Mystery"
            movies={thrillerMovies}
            isLoading={isLoading}
          />
        )}

        {/* Critically Acclaimed Dramas */}
        {dramaMovies.length > 0 && (
          <CategoryShelf
            title="Critically Acclaimed Dramas & Award Winners"
            movies={dramaMovies}
            isLoading={isLoading}
          />
        )}

        {/* Laugh-Out-Loud Comedies */}
        {comedyMovies.length > 0 && (
          <CategoryShelf
            title="Laugh-Out-Loud Comedies & Feel-Good"
            movies={comedyMovies}
            isLoading={isLoading}
          />
        )}

        {/* Spine-Chilling Horror */}
        {horrorMovies.length > 0 && (
          <CategoryShelf
            title="Spine-Chilling Horror & Supernatural Dread"
            movies={horrorMovies}
            isLoading={isLoading}
          />
        )}

        {/* Anime & Japanese Masterpieces */}
        {animeMovies.length > 0 && (
          <CategoryShelf
            title="Anime & Japanese Masterpieces"
            movies={animeMovies}
            isLoading={isLoading}
          />
        )}

        {/* Heartfelt Romance */}
        {romanceMovies.length > 0 && (
          <CategoryShelf
            title="Heartfelt Romance & Late Night Cinema"
            movies={romanceMovies}
            isLoading={isLoading}
          />
        )}

        {/* Global Cinema */}
        {internationalMovies.length > 0 && (
          <CategoryShelf
            title="International Cinema & Global Hits"
            movies={internationalMovies}
            isLoading={isLoading}
          />
        )}

        {/* All-Time Masterpieces */}
        {topRatedMasterpieces.length > 0 && (
          <CategoryShelf
            title="All-Time Masterpieces (IMDb 8.0+)"
            movies={topRatedMasterpieces}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};
export default MoviesView;
