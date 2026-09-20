import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Shuffle,
  X
} from 'lucide-react';
import { useMovies, useLikeMutation } from '@/api/hooks';
import { useAppStore } from '@/store/useAppStore';
import { triggerLikeBurst } from '@/utils/confetti';
import { synthEngine } from '@/utils/audioSynth';
import { recordMoviePlay } from '@/utils/continueWatching';
import type { Movie } from '@/types';

// ─── HERO SHOWCASE MOVIES (Ultra HD Backdrops + Stylized Custom Logos) ────────
interface HeroShowcaseItem {
  id: string | number;
  title: string;
  language: string;
  logoType:
    | 'breaking-bad'
    | 'forrest-gump'
    | 'shawshank'
    | 'gladiator'
    | 'oppenheimer'
    | 'inception'
    | 'batman'
    | 'spiderman'
    | 'spirited-away'
    | 'your-name'
    | 'three-idiots'
    | 'parasite'
    | 'generic';
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
    language: 'English',
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
    id: 'hero-spirited-away',
    title: 'Spirited Away',
    language: 'Japanese',
    logoType: 'spirited-away',
    tagline: 'NOTHING THAT HAPPENS IS EVER FORGOTTEN',
    genres: ['Animation', 'Family', 'Fantasy'],
    year: 2001,
    runtimeStr: '2h 05m',
    rating: 'U',
    matchScore: 99,
    director: 'Hayao Miyazaki',
    cast: 'Rumi Hiiragi, Miyu Irino, Mari Natsuki, Takashi Naito',
    overview:
      'A sullen 10-year-old girl wanders into a magical spirit realm ruled by gods, witches, and monsters after her parents are transformed into beasts, and must find a way to free them.',
    backdropUrl: 'https://image.tmdb.org/t/p/original/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    backdropPosition: 'center 20%',
    awardBadge: 'Oscar® Winner'
  },
  {
    id: 'hero-your-name',
    title: 'Your Name.',
    language: 'Japanese',
    logoType: 'your-name',
    tagline: 'TREASURE THE EXPERIENCE · DREAMS FADE AWAY',
    genres: ['Romance', 'Animation', 'Drama'],
    year: 2016,
    runtimeStr: '1h 47m',
    rating: 'U/A 13+',
    matchScore: 98,
    director: 'Makoto Shinkai',
    cast: 'Ryunosuke Kamiki, Mone Kamishiraishi, Ryo Narita, Aoi Yuki',
    overview:
      'Two high schoolers from opposite worlds share a profound, magical connection upon discovering they are swapping bodies across time and space.',
    backdropUrl: 'https://image.tmdb.org/t/p/original/dIWwZW7dJJtqC6CgWzYkNVKIUm8.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/q719jXXEzOoYaps6babgKnONONX.jpg',
    backdropPosition: 'center 25%',
    awardBadge: 'Anime Sensation'
  },
  {
    id: 'hero-3-idiots',
    title: '3 Idiots',
    language: 'Hindi',
    logoType: 'three-idiots',
    tagline: 'ALL IZZ WELL · CHASE EXCELLENCE',
    genres: ['Comedy', 'Drama'],
    year: 2009,
    runtimeStr: '2h 50m',
    rating: 'U/A 13+',
    matchScore: 99,
    director: 'Rajkumar Hirani',
    cast: 'Aamir Khan, R. Madhavan, Sharman Joshi, Kareena Kapoor',
    overview:
      'Two friends embark on a road trip searching for their long-lost college buddy who inspired them to think independently, defying society’s rigid expectations.',
    backdropUrl: 'https://image.tmdb.org/t/p/original/u7kuUaySqXBVAtqEl9vkTkAzHV9.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/66A9MqXOyVFCssoloscw79z8Tew.jpg',
    backdropPosition: 'center 20%',
    awardBadge: 'Bollywood Legend'
  },
  {
    id: 'hero-parasite',
    title: 'Parasite',
    language: 'Korean',
    logoType: 'parasite',
    tagline: 'ACT LIKE YOU OWN THE PLACE',
    genres: ['Thriller', 'Drama', 'Comedy'],
    year: 2019,
    runtimeStr: '2h 12m',
    rating: 'A 18+',
    matchScore: 99,
    director: 'Bong Joon-ho',
    cast: 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong, Choi Woo-shik',
    overview:
      'All unemployed, the crafty Kim family takes a peculiar interest in the wealthy Park family, scheming their way into high-paying roles until an unexpected secret unravels.',
    backdropUrl: 'https://image.tmdb.org/t/p/original/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    posterUrl: 'https://image.tmdb.org/t/p/w780/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdropPosition: 'center 20%',
    awardBadge: '4 Oscars®'
  },
  {
    id: 'hero-oppenheimer',
    title: 'Oppenheimer',
    language: 'English',
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
    id: 'hero-inception',
    title: 'Inception',
    language: 'English',
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
    language: 'English',
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
    id: 'hero-forrest-gump',
    title: 'Forrest Gump',
    language: 'English',
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
    language: 'English',
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
    id: 'hero-gladiator',
    title: 'Gladiator',
    language: 'English',
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
    id: 'hero-spiderman',
    title: 'Spider-Man: Across the Spider-Verse',
    language: 'English',
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

    case 'spirited-away':
      return (
        <div className="mb-2 sm:mb-2.5">
          <div className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-emerald-400 uppercase mb-1 drop-shadow">
            STUDIO GHIBLI · OSCAR® WINNER
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl tracking-[0.08em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-100 to-white uppercase drop-shadow-[0_4px_24px_rgba(16,185,129,0.5)] leading-tight select-none">
            SPIRITED AWAY
          </h1>
          <p className="text-[10px] sm:text-xs font-medium tracking-[0.2em] text-teal-200 uppercase mt-1">
            千と千尋の神隠し · HAYAO MIYAZAKI
          </p>
        </div>
      );

    case 'your-name':
      return (
        <div className="mb-2 sm:mb-2.5">
          <div className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-sky-400 uppercase mb-1 drop-shadow">
            MAKOTO SHINKAI MASTERPIECE
          </div>
          <h1 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-200 to-rose-300 uppercase drop-shadow-[0_4px_24px_rgba(56,189,248,0.5)] leading-tight select-none">
            YOUR NAME.
          </h1>
          <p className="text-[10px] sm:text-xs font-medium tracking-[0.2em] text-indigo-200 uppercase mt-1">
            君の名は · A MAGICAL METEOR CONNECTION
          </p>
        </div>
      );

    case 'three-idiots':
      return (
        <div className="mb-2 sm:mb-2.5">
          <div className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-amber-400 uppercase mb-1 drop-shadow">
            ALL-TIME BOLLYWOOD LEGEND
          </div>
          <h1 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-white uppercase drop-shadow-[0_4px_24px_rgba(245,158,11,0.5)] leading-tight select-none">
            3 IDIOTS
          </h1>
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-amber-200 uppercase mt-1">
            ALL IZZ WELL · CHASE EXCELLENCE
          </p>
        </div>
      );

    case 'parasite':
      return (
        <div className="mb-2 sm:mb-2.5">
          <div className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-cyan-400 uppercase mb-1 drop-shadow">
            4 ACADEMY AWARDS® · BEST PICTURE
          </div>
          <h1 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl tracking-[0.16em] text-white uppercase drop-shadow-[0_4px_24px_rgba(255,255,255,0.5)] leading-tight select-none">
            PARASITE
          </h1>
          <p className="text-[10px] sm:text-xs font-mono tracking-[0.25em] text-gray-400 uppercase mt-1">
            기생충 · ACT LIKE YOU OWN THE PLACE
          </p>
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
const HeroBillboard: React.FC<{ items?: HeroShowcaseItem[] }> = ({ items }) => {
  const showcaseList = items && items.length > 0 ? items : HERO_SHOWCASE;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const { likedIds, openMovieModal } = useAppStore();
  const likeMutation = useLikeMutation();

  useEffect(() => {
    setCurrentIndex(0);
  }, [items]);

  const current = showcaseList[currentIndex] || showcaseList[0] || HERO_SHOWCASE[0];
  const isLiked = !!likedIds[String(current.id)];

  // Auto-advance every 8 seconds when not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % showcaseList.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isPaused, showcaseList.length]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % showcaseList.length);
  const handlePrev = () =>
    setCurrentIndex((prev) => (prev - 1 + showcaseList.length) % showcaseList.length);

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
    e.stopPropagation();
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
    openMovieModal(movieObj);
  };

  return (
    <div className="w-full px-2 sm:px-6 md:px-8 pt-2 sm:pt-4 pb-4 sm:pb-6">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full h-[62vh] sm:h-[80vh] min-h-[440px] max-h-[740px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl select-none"
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 via-55% to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 via-35% to-transparent pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

        {/* TOP-RIGHT: Speaker Audio Toggle Button */}
        <button
          onClick={toggleSound}
          className="absolute right-3 sm:right-7 top-3 sm:top-7 z-30 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg cursor-pointer"
          title={isMuted ? 'Unmute preview audio' : 'Mute preview audio'}
        >
          {isMuted ? <VolumeX className="w-4 sm:w-5 h-4 sm:h-5 text-gray-200" /> : <Volume2 className="w-4 sm:w-5 h-4 sm:h-5 text-[#46D369]" />}
        </button>

        {/* Left/Right Carousel Chevrons on Hover (Desktop only) */}
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 border border-white/20 text-white items-center justify-center opacity-0 hover:opacity-100 group-hover:opacity-80 transition-opacity backdrop-blur-sm cursor-pointer"
          title="Previous blockbuster"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 border border-white/20 text-white items-center justify-center opacity-0 hover:opacity-100 group-hover:opacity-80 transition-opacity backdrop-blur-sm cursor-pointer"
          title="Next blockbuster"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Content Container (Bottom-Left) */}
        <div className="absolute bottom-5 sm:bottom-10 left-4 sm:left-12 right-4 sm:right-auto max-w-2xl z-20">
          {/* Big Stylized Logo Treatment */}
          <MovieLogoTreatment item={current} />

          {/* Clean Metadata Line (Series • Drama • 2008 • 5 Seasons • A) matching Screenshot 1 */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-gray-200 mb-2.5 sm:mb-4 drop-shadow">
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

          {/* Action Buttons: Play Pill & More Info Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play Pill */}
            <button
              onClick={() => {
                synthEngine.playAmbientDrone();
                recordMoviePlay({ id: current.id, title: current.title });
                useAppStore.getState().addToast({
                  title: `Playing "${current.title}"`,
                  description: 'Buffering Ultra HD 4K stream with Dolby Atmos audio...',
                  type: 'info'
                });
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-5 sm:px-7 py-2 sm:py-2.5 rounded-full bg-white hover:bg-white/90 text-black font-extrabold text-xs sm:text-base shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-black ml-0.5" />
              Play
            </button>

            {/* More Info Pill */}
            <button
              onClick={handleMoreInfo}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-base backdrop-blur-md transition-all duration-200 border border-white/20 cursor-pointer"
            >
              More Info
            </button>

            {/* Add to List / Heart Toggle */}
            <button
              onClick={handleLike}
              className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isLiked
                  ? 'border-[#FF1E56] bg-[#FF1E56] text-white shadow-lg shadow-[#FF1E56]/40 scale-105'
                  : 'border-white/40 hover:border-white bg-black/40 hover:bg-black/60 text-white backdrop-blur-md'
              }`}
              title={isLiked ? 'Remove from My List' : 'Add to My List'}
            >
              {isLiked ? <Check className="w-3.5 sm:w-4 h-3.5 sm:w-4 stroke-[3]" /> : <Plus className="w-3.5 sm:w-4 h-3.5 sm:w-4" />}
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
          {showcaseList.map((item, idx) => (
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

export const FallbackPosterPlaceholder: React.FC<{ movie: Movie }> = ({ movie }) => (
  <div className="w-full h-full bg-gradient-to-br from-[#1C1C28] via-[#14141E] to-[#0A0A10] p-3 flex flex-col justify-between border border-white/10 select-none">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-[#E50914] uppercase tracking-wider">
        {movie.genres?.[0] || 'Cinema'}
      </span>
      <span className="text-[10px] text-gray-400 font-mono">
        {movie.year || (movie.release_date ? movie.release_date.slice(0, 4) : 'HD')}
      </span>
    </div>
    <div className="my-auto py-2">
      <h4 className="text-xs sm:text-sm font-black text-white line-clamp-3 leading-snug tracking-wide">
        {movie.title}
      </h4>
      <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
        {movie.director || movie.genres?.slice(0, 2).join(' • ')}
      </p>
    </div>
    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
      <span className="text-[#FFAA00] font-bold">★ {movie.vote_average?.toFixed(1) || '8.0'}</span>
      <span className="text-[9px] uppercase font-semibold text-gray-400">{movie.language || 'Cinema'}</span>
    </div>
  </div>
);

const ContinueWatchingCard: React.FC<{
  item: ContinueWatchingItem;
  onRemove: (id: string | number, title: string, movieId?: string | number) => void;
}> = ({ item, onRemove }) => {
  const { movie, progressPercent, timeLeft, episodeLabel } = item;
  const { likedIds, openMovieModal } = useAppStore();
  const isLiked = !!likedIds[String(movie.id)];
  const likeMutation = useLikeMutation();

  const handleCardPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    synthEngine.playAmbientDrone();
    recordMoviePlay(movie);
    useAppStore.getState().addToast({
      title: `Resuming "${movie.title}"`,
      description: `Picking up at ${progressPercent}% (${timeLeft})`,
      type: 'info'
    });
  };

  const [imgSrc, setImgSrc] = useState(movie.poster_path || movie.backdrop_path || '');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(movie.poster_path || movie.backdrop_path || '');
    setHasError(false);
  }, [movie.poster_path, movie.backdrop_path]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.06, y: -6, zIndex: 20 }}
      transition={{ duration: 0.2 }}
      onClick={() => openMovieModal(movie)}
      className="relative flex-shrink-0 w-[130px] sm:w-[195px] md:w-[220px] cursor-pointer group select-none"
    >
      {/* 2:3 Vertical Container so Posters Fit 100% Correctly */}
      <div className="relative rounded-lg overflow-hidden bg-[#141414] aspect-[2/3] shadow-xl border border-white/5">
        {!hasError && imgSrc ? (
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
                setHasError(true);
              }
            }}
          />
        ) : (
          <FallbackPosterPlaceholder movie={movie} />
        )}

        {/* Quick Corner Remove Button (Permanently remove) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id, movie.title, movie.id);
          }}
          className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-black/80 hover:bg-red-600 text-gray-200 hover:text-white border border-white/25 transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer shadow-lg hover:scale-110"
          title="Remove from Continue Watching"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-2 mb-2.5">
            <button
              onClick={handleCardPlay}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
              title="Resume Play"
            >
              <Play className="w-4 h-4 fill-black ml-0.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openMovieModal(movie);
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 border border-white/50 text-white flex items-center justify-center hover:border-white transition-colors cursor-pointer"
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
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                isLiked ? 'bg-[#FF1E56] border-[#FF1E56] text-white' : 'border-white/50 bg-black/60 text-white hover:border-white'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id, movie.title, movie.id);
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 border border-white/50 text-gray-300 hover:text-red-400 hover:border-red-500 hover:bg-red-500/20 flex items-center justify-center transition-all cursor-pointer"
              title="Remove from Continue Watching"
            >
              <X className="w-4 h-4" />
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

  // Permanently removed IDs/titles from Continue Watching (stored in localStorage)
  const [removedIds, setRemovedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zhoosh_removed_cw_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track active continue watching items - Starts EMPTY for any new user until they play a movie!
  const [activeCwIds, setActiveCwIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zhoosh_active_cw_ids');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    // Initial state: EMPTY for any new user!
    return [];
  });

  // Real-time listener: when user clicks Play on any movie, Continue Watching appears immediately!
  useEffect(() => {
    const handleCwUpdate = () => {
      try {
        const saved = localStorage.getItem('zhoosh_active_cw_ids');
        setActiveCwIds(saved ? JSON.parse(saved) : []);
        const savedRemoved = localStorage.getItem('zhoosh_removed_cw_ids');
        setRemovedIds(savedRemoved ? JSON.parse(savedRemoved) : []);
      } catch {}
    };

    window.addEventListener('zhoosh:cw-updated', handleCwUpdate);
    window.addEventListener('storage', handleCwUpdate);
    return () => {
      window.removeEventListener('zhoosh:cw-updated', handleCwUpdate);
      window.removeEventListener('storage', handleCwUpdate);
    };
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 750 : -750, behavior: 'smooth' });
  };

  const handleRemove = (id: string | number, title: string, movieId?: string | number) => {
    const idStr = String(id);
    const movieStr = movieId ? String(movieId) : '';
    const normTitle = title.toLowerCase().trim();

    // Persist to removedIds in localStorage so it NEVER shows up again
    const newRemoved = Array.from(
      new Set([...removedIds, idStr, movieStr, `cw-${movieStr}`, `cw-${idStr}`, normTitle].filter(Boolean))
    );
    setRemovedIds(newRemoved);
    try {
      localStorage.setItem('zhoosh_removed_cw_ids', JSON.stringify(newRemoved));
    } catch {}

    // Remove from active list in state & localStorage (no backfilling)
    setActiveCwIds((prev) => {
      const next = prev.filter((cwId) => {
        return (
          cwId !== idStr &&
          cwId !== movieStr &&
          cwId !== `cw-${movieStr}` &&
          cwId !== `cw-${idStr}` &&
          cwId !== normTitle
        );
      });
      try {
        localStorage.setItem('zhoosh_active_cw_ids', JSON.stringify(next));
      } catch {}
      return next;
    });

    useAppStore.getState().addToast({
      title: 'Removed from Continue Watching',
      description: `"${title}" has been removed and won't appear here again.`,
      type: 'info'
    });
  };

  const continueItems: ContinueWatchingItem[] = useMemo(() => {
    if (!movies.length || !activeCwIds.length) return [];

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

    const matched: Movie[] = [];
    for (const cwId of activeCwIds) {
      const found = movies.find(
        (m) =>
          String(m.id) === cwId ||
          `cw-${m.id}` === cwId ||
          m.title.toLowerCase().trim() === cwId.toLowerCase().trim()
      );
      if (found) {
        const isExcluded =
          removedIds.includes(String(found.id)) ||
          removedIds.includes(`cw-${found.id}`) ||
          removedIds.includes(found.title.toLowerCase().trim());
        if (!isExcluded && !matched.some((item) => String(item.id) === String(found.id))) {
          matched.push(found);
        }
      }
    }

    return matched.map((m, idx) => ({
      id: `cw-${m.id}`,
      movie: m,
      progressPercent: percentages[idx % percentages.length],
      timeLeft: timeLabels[idx % timeLabels.length],
      episodeLabel: episodeLabels[idx % episodeLabels.length]
    }));
  }, [movies, activeCwIds, removedIds]);

  if (!continueItems.length) return null;

  return (
    <div className="group/shelf mb-10">
      <div className="flex items-center justify-between px-6 sm:px-12 mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Continue Watching for You
        </h2>
        <span className="text-xs text-gray-400 font-medium">
          {continueItems.length} {continueItems.length === 1 ? 'title' : 'titles'} in progress
        </span>
      </div>

      <div className="relative">
        {/* Left Arrow (Desktop only) */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-0 bottom-0 z-20 w-12 items-center justify-center bg-gradient-to-r from-[#050508] via-[#050508]/80 to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity cursor-pointer"
        >
          <ChevronLeft className="w-7 h-7 text-white drop-shadow" />
        </button>

        {/* Scroll Track */}
        <div
          ref={scrollRef}
          className="flex gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar px-3 sm:px-12 pb-2 scroll-smooth"
        >
          <AnimatePresence mode="popLayout">
            {continueItems.map((item) => (
              <ContinueWatchingCard key={item.id} item={item} onRemove={handleRemove} />
            ))}
          </AnimatePresence>
        </div>

        {/* Right Arrow (Desktop only) */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-0 bottom-0 z-20 w-12 items-center justify-center bg-gradient-to-l from-[#050508] via-[#050508]/80 to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity cursor-pointer"
        >
          <ChevronRight className="w-7 h-7 text-white drop-shadow" />
        </button>
      </div>
    </div>
  );
};

const Top10Card: React.FC<{ movie: Movie; rank: number }> = ({ movie, rank }) => {
  const { likedIds, openMovieModal } = useAppStore();
  const isLiked = !!likedIds[String(movie.id)];
  const likeMutation = useLikeMutation();
  const [imgSrc, setImgSrc] = useState(movie.poster_path);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(movie.poster_path);
    setHasError(false);
  }, [movie.poster_path]);

  return (
    <motion.div
      whileHover={{ scale: 1.05, zIndex: 30 }}
      transition={{ duration: 0.2 }}
      onClick={() => openMovieModal(movie)}
      className="relative flex-shrink-0 flex items-center cursor-pointer group/card select-none"
    >
      {/* Netflix Signature Giant Number (Offset behind poster) */}
      <div className="w-12 sm:w-24 flex items-center justify-center flex-shrink-0 z-0 select-none">
        <span className="text-6xl sm:text-9xl font-black netflix-rank-number tracking-tighter">
          {rank}
        </span>
      </div>

      {/* Vertical Poster Card */}
      <div className="-ml-5 sm:-ml-10 relative w-[120px] sm:w-[170px] md:w-[190px] aspect-[2/3] rounded-lg overflow-hidden bg-[#141414] shadow-2xl z-10 border border-white/10">
        {!hasError && imgSrc ? (
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
                setHasError(true);
              }
            }}
          />
        ) : (
          <FallbackPosterPlaceholder movie={movie} />
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 flex flex-col justify-end opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                synthEngine.playAmbientDrone();
                recordMoviePlay(movie);
                useAppStore.getState().addToast({
                  title: `Playing "${movie.title}"`,
                  description: 'Streaming in Ultra HD 4K...',
                  type: 'info'
                });
              }}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow hover:scale-105 transition-transform cursor-pointer"
              title="Play"
            >
              <Play className="w-4 h-4 fill-black ml-0.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openMovieModal(movie);
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
          className="hidden md:flex absolute left-0 top-0 bottom-0 z-20 w-12 items-center justify-center bg-gradient-to-r from-[#050508] to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto no-scrollbar px-3 sm:px-12 pb-2 scroll-smooth"
        >
          {top10List.map((movie, idx) => (
            <Top10Card key={movie.id} movie={movie} rank={idx + 1} />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-0 bottom-0 z-20 w-12 items-center justify-center bg-gradient-to-l from-[#050508] to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
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
  const { likedIds, openMovieModal } = useAppStore();
  const isLiked = !!likedIds[String(movie.id)];
  const likeMutation = useLikeMutation();
  const [imgSrc, setImgSrc] = useState(movie.poster_path);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(movie.poster_path);
    setHasError(false);
  }, [movie.poster_path]);

  return (
    <motion.div
      whileHover={{ scale: 1.06, y: -6, zIndex: 20 }}
      transition={{ duration: 0.2 }}
      onClick={() => openMovieModal(movie)}
      className="relative flex-shrink-0 w-[130px] sm:w-[195px] md:w-[220px] cursor-pointer group/card select-none"
    >
      <div className="relative rounded-lg overflow-hidden bg-[#141414] aspect-[2/3] shadow-lg border border-white/5">
        {!hasError && imgSrc ? (
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
                setHasError(true);
              }
            }}
          />
        ) : (
          <FallbackPosterPlaceholder movie={movie} />
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 flex flex-col justify-end opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-2 mb-2.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                synthEngine.playAmbientDrone();
                recordMoviePlay(movie);
                useAppStore.getState().addToast({
                  title: `Playing "${movie.title}"`,
                  description: 'Streaming in Ultra HD 4K...',
                  type: 'info'
                });
              }}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
              title="Play"
            >
              <Play className="w-4 h-4 fill-black ml-0.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openMovieModal(movie);
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
          className="hidden md:flex absolute left-0 top-0 bottom-0 z-20 w-12 items-center justify-center bg-gradient-to-r from-[#050508] via-[#050508]/80 to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar px-3 sm:px-12 pb-2 scroll-smooth"
        >
          {movies.map((movie) => (
            <CategoryMovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-0 bottom-0 z-20 w-12 items-center justify-center bg-gradient-to-l from-[#050508] via-[#050508]/80 to-transparent opacity-0 group-hover/shelf:opacity-100 transition-opacity"
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
  const [profileVersion, setProfileVersion] = useState(0);

  // Re-read profile when localStorage or profile changes
  useEffect(() => {
    const handleStorage = () => setProfileVersion((v) => v + 1);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('zhoosh:profile-updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('zhoosh:profile-updated', handleStorage);
    };
  }, []);

  // Retrieve user onboarding preferences from localStorage
  const userPreferences = useMemo(() => {
    try {
      const raw = localStorage.getItem('zhoosh_user_profile');
      if (!raw) return { languages: [], genres: [] };
      const parsed = JSON.parse(raw);
      const prefs: any[] = parsed.selectedPreferences || [];
      const languages: string[] = prefs
        .filter((p: any) => p.section === 'language')
        .map((p: any) => p.title.toLowerCase().trim());
      const genres: string[] = prefs
        .filter((p: any) => p.section === 'genre')
        .map((p: any) => p.title.toLowerCase().trim());
      return { languages, genres };
    } catch {
      return { languages: [], genres: [] };
    }
  }, [profileVersion]);

  // Tailor HERO_SHOWCASE strictly to user's selected languages
  const tailoredHeroShowcase = useMemo(() => {
    if (!userPreferences.languages.length) return HERO_SHOWCASE;
    const matched = HERO_SHOWCASE.filter((item) =>
      userPreferences.languages.includes(item.language.toLowerCase().trim())
    );
    return matched.length > 0 ? matched : HERO_SHOWCASE;
  }, [userPreferences.languages]);

  // Robust language matcher supporting both names and language codes
  const isMovieInLanguages = useCallback((m: Movie, targetLangs: string[]) => {
    if (!targetLangs || targetLangs.length === 0) return true;
    const mlang = (m.language || '').toLowerCase().trim();
    const title = (m.title || '').toLowerCase();
    const overview = (m.overview || '').toLowerCase();
    const genres = (m.genres || []).map((g) => g.toLowerCase());

    return targetLangs.some((lang) => {
      const l = lang.toLowerCase().trim();
      if (l === 'english' || l === 'en') {
        return mlang === 'english' || mlang === 'en';
      }
      if (l === 'hindi' || l === 'hi') {
        return mlang === 'hindi' || mlang === 'hi' || overview.includes('bollywood') || title.includes('bollywood');
      }
      if (l === 'japanese' || l === 'ja') {
        return (
          mlang === 'japanese' ||
          mlang === 'ja' ||
          genres.includes('anime') ||
          (genres.includes('animation') && (title.includes('ghibli') || overview.includes('japan'))) ||
          overview.includes('anime') ||
          overview.includes('manga')
        );
      }
      if (l === 'korean' || l === 'ko') {
        return mlang === 'korean' || mlang === 'ko' || overview.includes('k-drama') || overview.includes('korea');
      }
      if (l === 'spanish' || l === 'es') {
        return mlang === 'spanish' || mlang === 'es';
      }
      if (l === 'french' || l === 'fr') {
        return mlang === 'french' || mlang === 'fr';
      }
      if (l === 'tamil' || l === 'ta') {
        return mlang === 'tamil' || mlang === 'ta' || overview.includes('kollywood');
      }
      if (l === 'telugu' || l === 'te') {
        return mlang === 'telugu' || mlang === 'te' || overview.includes('tollywood');
      }
      return mlang.includes(l);
    });
  }, []);

  // Primary user-filtered movies pool (100% matched to selected languages)
  const userPreferredMovies = useMemo(() => {
    if (!userPreferences.languages.length) return movies;
    const matched = movies.filter((m) => isMovieInLanguages(m, userPreferences.languages));
    return matched.length >= 3 ? matched : movies;
  }, [movies, userPreferences.languages, isMovieInLanguages]);

  // Ensure shelf has at least minCount items, prioritizing userPreferredMovies
  const ensureShelfMin = useCallback(
    (filteredList: Movie[], minCount = 10) => {
      if (filteredList.length >= minCount) return filteredList.slice(0, 16);
      const existingIds = new Set(filteredList.map((m) => String(m.id)));
      const padding = userPreferredMovies.filter((m) => !existingIds.has(String(m.id)));
      if (filteredList.length + padding.length >= minCount) {
        return [...filteredList, ...padding].slice(0, 16);
      }
      // If user pool has fewer than minCount, gently pad from general dataset
      const globalPadding = movies.filter(
        (m) => !existingIds.has(String(m.id)) && !padding.some((p) => p.id === m.id)
      );
      return [...filteredList, ...padding, ...globalPadding].slice(0, 16);
    },
    [userPreferredMovies, movies]
  );

  const trendingMovies = useMemo(() => userPreferredMovies.slice(0, 16), [userPreferredMovies]);

  // Dedicated shelf for each of user's selected languages
  const languageShelves = useMemo(() => {
    const languageConfig: Record<string, { title: string }> = {
      english: { title: 'Top English & Hollywood Blockbusters' },
      hindi: { title: 'Best of Hindi Cinema & Bollywood Blockbusters' },
      japanese: { title: 'Japanese Masterpieces & Anime Hits' },
      korean: { title: 'Sensational Korean Cinema & K-Dramas' },
      spanish: { title: 'Must-Watch Spanish Cinema & Thrillers' },
      french: { title: 'Acclaimed French Cinema & Auteur Works' },
      tamil: { title: 'Top Kollywood & Tamil Hits' },
      telugu: { title: 'Epic Tollywood & Telugu Spectacles' }
    };

    return userPreferences.languages
      .map((lang) => {
        const conf = languageConfig[lang] || {
          title: `Best of ${lang.charAt(0).toUpperCase() + lang.slice(1)} Cinema`
        };
        const shelfItems = movies.filter((m) => isMovieInLanguages(m, [lang]));
        return {
          lang,
          title: conf.title,
          movies: shelfItems.slice(0, 16)
        };
      })
      .filter((shelf) => shelf.movies.length > 0);
  }, [userPreferences.languages, movies, isMovieInLanguages]);

  // Genre Shelves (all filtered strictly from userPreferredMovies!)
  const actionMovies = useMemo(
    () =>
      ensureShelfMin(
        userPreferredMovies.filter((m) => m.genres.some((g) => g.toLowerCase().includes('action')))
      ),
    [userPreferredMovies, ensureShelfMin]
  );

  const sciFiMovies = useMemo(
    () =>
      ensureShelfMin(
        userPreferredMovies.filter((m) =>
          m.genres.some((g) => {
            const gl = g.toLowerCase();
            return gl.includes('sci-fi') || gl.includes('science fiction') || gl.includes('fantasy');
          })
        )
      ),
    [userPreferredMovies, ensureShelfMin]
  );

  const thrillerMovies = useMemo(
    () =>
      ensureShelfMin(
        userPreferredMovies.filter((m) =>
          m.genres.some((g) => {
            const gl = g.toLowerCase();
            return gl.includes('thriller') || gl.includes('crime') || gl.includes('mystery');
          })
        )
      ),
    [userPreferredMovies, ensureShelfMin]
  );

  const comedyMovies = useMemo(
    () =>
      ensureShelfMin(
        userPreferredMovies.filter((m) => m.genres.some((g) => g.toLowerCase().includes('comedy')))
      ),
    [userPreferredMovies, ensureShelfMin]
  );

  const dramaMovies = useMemo(
    () =>
      ensureShelfMin(
        userPreferredMovies.filter((m) => m.genres.some((g) => g.toLowerCase().includes('drama')))
      ),
    [userPreferredMovies, ensureShelfMin]
  );

  const horrorMovies = useMemo(
    () =>
      ensureShelfMin(
        userPreferredMovies.filter((m) => m.genres.some((g) => g.toLowerCase().includes('horror')))
      ),
    [userPreferredMovies, ensureShelfMin]
  );

  const animeMovies = useMemo(
    () =>
      ensureShelfMin(
        userPreferredMovies.filter(
          (m) =>
            m.genres.some((g) => g.toLowerCase().includes('animation')) ||
            (m.language && m.language.toLowerCase() === 'japanese')
        )
      ),
    [userPreferredMovies, ensureShelfMin]
  );

  const romanceMovies = useMemo(
    () =>
      ensureShelfMin(
        userPreferredMovies.filter((m) => m.genres.some((g) => g.toLowerCase().includes('romance')))
      ),
    [userPreferredMovies, ensureShelfMin]
  );

  const topRatedMasterpieces = useMemo(
    () => ensureShelfMin(userPreferredMovies.filter((m) => m.vote_average >= 7.8)),
    [userPreferredMovies, ensureShelfMin]
  );

  // Group all genre shelf definitions to prioritize user-selected genres at the top!
  const genreShelvesList = useMemo(() => {
    const allShelves = [
      { key: 'action', title: 'Blockbuster Action & High-Octane Thrills', movies: actionMovies },
      { key: 'thriller', title: 'Edge-of-Your-Seat Thrillers & Mystery', movies: thrillerMovies },
      { key: 'scifi', title: 'Mind-Bending Sci-Fi & Cosmic Marvels', movies: sciFiMovies },
      { key: 'romance', title: 'Heartfelt Romance & Late Night Cinema', movies: romanceMovies },
      { key: 'comedy', title: 'Laugh-Out-Loud Comedies & Feel-Good', movies: comedyMovies },
      { key: 'drama', title: 'Critically Acclaimed Dramas & Award Winners', movies: dramaMovies },
      { key: 'anime', title: 'Anime & Animated Masterpieces', movies: animeMovies },
      { key: 'horror', title: 'Spine-Chilling Horror & Dread', movies: horrorMovies },
    ];

    const selectedKeys = new Set(userPreferences.genres.map((g) => g.toLowerCase().replace(/[^a-z]/g, '')));

    return allShelves
      .filter((s) => s.movies.length > 0)
      .sort((a, b) => {
        const aMatches = selectedKeys.has(a.key) || (a.key === 'scifi' && selectedKeys.has('scifi'));
        const bMatches = selectedKeys.has(b.key) || (b.key === 'scifi' && selectedKeys.has('scifi'));
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0;
      });
  }, [
    userPreferences.genres,
    actionMovies,
    thrillerMovies,
    sciFiMovies,
    romanceMovies,
    comedyMovies,
    dramaMovies,
    animeMovies,
    horrorMovies
  ]);

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

      {/* 1. CINEMATIC HERO BILLBOARD (Personalized to User Languages) */}
      <div className="relative z-10">
        <HeroBillboard items={tailoredHeroShowcase} />
      </div>

      {/* 2. DASHBOARD CATEGORY ROWS (Strictly Filtered to User Preferences) */}
      <div className="relative z-10 mt-3 sm:mt-6 space-y-6">
        {/* Continue Watching Row (Personalized) */}
        <ContinueWatchingShelf movies={userPreferredMovies} />

        {/* Top 10 in Movies Today (Strictly from User's Preferred Languages) */}
        <Top10Shelf movies={userPreferredMovies} />

        {/* Dedicated Language Shelves for each selected language */}
        {languageShelves.map((shelf) => (
          <CategoryShelf
            key={shelf.lang}
            title={shelf.title}
            movies={shelf.movies}
            isLoading={isLoading}
          />
        ))}

        {/* Trending Now in Your Languages */}
        <CategoryShelf
          title="Trending Now"
          movies={trendingMovies}
          isLoading={isLoading}
        />

        {/* Genre Shelves (Prioritizing User's Chosen Genres First!) */}
        {genreShelvesList.map((shelf) => (
          <CategoryShelf
            key={shelf.key}
            title={shelf.title}
            movies={shelf.movies}
            isLoading={isLoading}
          />
        ))}

        {/* All-Time Masterpieces in User's Languages */}
        {topRatedMasterpieces.length > 0 && (
          <CategoryShelf
            title="All-Time Masterpieces (IMDb 7.8+)"
            movies={topRatedMasterpieces}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};
export default MoviesView;

