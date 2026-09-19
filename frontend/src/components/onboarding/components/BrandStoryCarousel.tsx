import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

interface StoryChapter {
  id: string;
  chapter: string;
  title: string;
  body: string;
  accentBorder: string;
  gradientLine: string;
}

const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'chapter-1',
    chapter: '01',
    title: 'The Paradox of Choice',
    body: 'Millions of titles, yet nothing to watch. Discovery should feel like magic, not an endless 25-minute scroll.',
    accentBorder: 'hover:border-[#FF1E56]/60',
    gradientLine: 'from-[#FF1E56] to-transparent'
  },
  {
    id: 'chapter-2',
    chapter: '02',
    title: 'Mood Over Math',
    body: 'Your taste shifts with every moment. We match how you feel right now, not cold algorithmic click rates.',
    accentBorder: 'hover:border-[#A855F7]/60',
    gradientLine: 'from-[#A855F7] to-transparent'
  },
  {
    id: 'chapter-3',
    chapter: '03',
    title: 'Speak What You Feel',
    body: 'No complex filters. Simply tell your companion what you need, and the atmosphere shifts instantly.',
    accentBorder: 'hover:border-[#06B6D4]/60',
    gradientLine: 'from-[#06B6D4] to-transparent'
  },
  {
    id: 'chapter-4',
    chapter: '04',
    title: 'Sight Meets Sound',
    body: 'When you love a film, its soundtrack lives right beside it. 4K cinema and studio audio unified in one home.',
    accentBorder: 'hover:border-[#FF2E93]/60',
    gradientLine: 'from-[#FF2E93] to-transparent'
  },
  {
    id: 'chapter-5',
    chapter: '05',
    title: 'The Soul of Zhoosh',
    body: 'To zhoosh is to elevate the ordinary into the extraordinary. Zero guesswork. Just pure feeling.',
    accentBorder: 'hover:border-emerald-500/60',
    gradientLine: 'from-emerald-500 to-transparent'
  }
];

interface BrandStoryCarouselProps {
  onExplorePlans?: () => void;
}

export const BrandStoryCarousel: React.FC<BrandStoryCarouselProps> = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [maxScrollWidth, setMaxScrollWidth] = useState(0);

  // Hook vertical scroll progress
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end']
  });

  // Calculate dynamic scroll distance
  useEffect(() => {
    const calculateDistance = () => {
      if (trackRef.current) {
        const total = trackRef.current.scrollWidth;
        const viewport = window.innerWidth;
        const distance = Math.max(0, total - viewport + 60);
        setMaxScrollWidth(distance);
      }
    };

    calculateDistance();
    window.addEventListener('resize', calculateDistance);
    return () => window.removeEventListener('resize', calculateDistance);
  }, []);

  const x = useTransform(scrollYProgress, [0, 1], [0, -maxScrollWidth]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const count = STORY_CHAPTERS.length;
    const step = 1 / count;
    const idx = Math.min(Math.floor(latest / step), count - 1);
    setActiveIndex(Math.max(0, idx));
  });

  const scrollToCard = (index: number) => {
    if (!targetRef.current) return;
    const top = targetRef.current.offsetTop;
    const scrollableDistance = targetRef.current.offsetHeight - window.innerHeight;
    const targetScroll = top + (index / (STORY_CHAPTERS.length - 1)) * scrollableDistance;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  return (
    // Runway section for smooth horizontal swipe driven by page scroll
    <section ref={targetRef} className="relative w-full h-[200vh] bg-transparent z-20 select-none">
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-transparent px-4 py-4">
        
        {/* ========================================================================= */}
        {/* CENTERED HEADLINE                                                          */}
        {/* ========================================================================= */}
        <div className="w-full max-w-3xl mx-auto text-center mb-8 flex flex-col items-center shrink-0">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md text-center">
            The Era of Cold Algorithms{' '}
            <span className="bg-gradient-to-r from-[#FF1E56] via-[#FF2E93] to-[#A855F7] bg-clip-text text-transparent">
              Is Over.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-lg mx-auto text-center leading-relaxed">
            Scroll down to swipe through the story of Zhoosh.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* CARDS: SAME SIZE & STYLING AS "WHY CHOOSE ZHOOSH" CARDS                    */}
        {/* ========================================================================= */}
        <div className="w-full overflow-hidden flex items-center">
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex gap-6 pl-4 sm:pl-8 md:pl-16 pr-8 items-stretch"
          >
            {STORY_CHAPTERS.map((item, idx) => {
              const isCurrent = activeIndex === idx;

              return (
                <div
                  key={item.id}
                  onClick={() => scrollToCard(idx)}
                  className={`story-card flex-none w-[380px] sm:w-[450px] md:w-[500px] lg:w-[540px] h-[370px] sm:h-[390px] md:h-[420px] p-8 sm:p-10 rounded-3xl bg-[#090611]/90 backdrop-blur-xl border border-[#2B1B3D] ${item.accentBorder} transition-all duration-300 shadow-2xl text-left relative overflow-hidden group flex flex-col justify-between cursor-pointer ${
                    isCurrent ? 'ring-1 ring-white/30 border-white/40 shadow-[0_25px_60px_rgba(0,0,0,0.9)]' : ''
                  }`}
                >
                  {/* Top Accent Gradient Border */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.gradientLine} opacity-0 group-hover:opacity-100 transition-opacity`} />

                  {/* Top Content: Chapter number + Title */}
                  <div>
                    <span className="text-xs sm:text-sm font-mono font-bold tracking-widest text-gray-400 mb-3 block">
                      CHAPTER {item.chapter}
                    </span>

                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  {/* Body Content */}
                  <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* MINIMAL PROGRESS DOTS                                                     */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-center gap-1.5 mt-6 shrink-0">
          {STORY_CHAPTERS.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeIndex === i
                  ? 'w-6 bg-gradient-to-r from-[#FF1E56] to-[#A855F7] shadow-sm shadow-[#FF1E56]/50'
                  : 'w-1.5 bg-white/25 hover:bg-white/45'
              }`}
              aria-label={`Scroll to chapter ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
