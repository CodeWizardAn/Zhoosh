import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import {
  Layers,
  Tv2,
  Headphones,
  Sparkles
} from 'lucide-react';

interface FeatureCard {
  id: string;
  number: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
  accentBorder: string;
  gradientLine: string;
  iconColor: string;
  iconBg: string;
}

const FEATURE_CARDS: FeatureCard[] = [
  {
    id: 'feat-1',
    number: '01',
    title: 'Dual Entertainment',
    body: 'Watch 4K movies and stream 100M+ tracks in one unified app. No need to pay for separate movie and music apps.',
    icon: Layers,
    accentBorder: 'hover:border-[#FF1E56]/60',
    gradientLine: 'from-[#FF1E56] to-transparent',
    iconColor: 'text-[#FF1E56]',
    iconBg: 'bg-[#FF1E56]/15 border-[#FF1E56]/30'
  },
  {
    id: 'feat-2',
    number: '02',
    title: 'Cinema 4K & Dolby Audio',
    body: 'Crystal-clear 4K Ultra HD visual resolution with Dolby Vision and spatial surround sound for every film and track.',
    icon: Tv2,
    accentBorder: 'hover:border-[#A855F7]/60',
    gradientLine: 'from-[#A855F7] to-transparent',
    iconColor: 'text-[#C084FC]',
    iconBg: 'bg-[#A855F7]/15 border-[#A855F7]/30'
  },
  {
    id: 'feat-3',
    number: '03',
    title: 'Studio Master FLAC',
    body: 'Hear music as the artist intended with 24-bit/192kHz lossless audio and synchronized karaoke-style lyrics.',
    icon: Headphones,
    accentBorder: 'hover:border-[#FF2E93]/60',
    gradientLine: 'from-[#FF2E93] to-transparent',
    iconColor: 'text-[#FF2E93]',
    iconBg: 'bg-[#FF2E93]/15 border-[#FF2E93]/30'
  },
  {
    id: 'feat-4',
    number: '04',
    title: 'Empathetic AI Discovery',
    body: 'Real-time mood matching and conversational recommendation that understands whether you are travelling, relaxing, or working out.',
    icon: Sparkles,
    accentBorder: 'hover:border-[#06B6D4]/60',
    gradientLine: 'from-[#06B6D4] to-transparent',
    iconColor: 'text-[#22D3EE]',
    iconBg: 'bg-[#06B6D4]/15 border-[#06B6D4]/30'
  }
];

export const WhyChooseZhooshCarousel: React.FC = () => {
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
    const count = FEATURE_CARDS.length;
    const step = 1 / count;
    const idx = Math.min(Math.floor(latest / step), count - 1);
    setActiveIndex(Math.max(0, idx));
  });

  const scrollToCard = (index: number) => {
    if (!targetRef.current) return;
    const top = targetRef.current.offsetTop;
    const scrollableDistance = targetRef.current.offsetHeight - window.innerHeight;
    const targetScroll = top + (index / (FEATURE_CARDS.length - 1)) * scrollableDistance;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  return (
    // Runway section for smooth horizontal swipe driven by vertical page scroll
    <section ref={targetRef} className="relative w-full h-[200vh] bg-transparent z-20 select-none">
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-transparent px-4 py-4">
        
        {/* ========================================================================= */}
        {/* CENTERED HEADLINE                                                          */}
        {/* ========================================================================= */}
        <div className="w-full max-w-3xl mx-auto text-center mb-8 flex flex-col items-center shrink-0">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md text-center">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-[#FF1E56] via-[#FF2E93] to-[#A855F7] bg-clip-text text-transparent">
              Zhoosh?
            </span>
          </h2>

          <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-lg mx-auto text-center leading-relaxed">
            One revolutionary subscription uniting cinematic blockbusters with studio-grade lossless audio.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* HORIZONTAL CARDS TRACK                                                     */}
        {/* ========================================================================= */}
        <div className="w-full overflow-hidden flex items-center">
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex gap-5 sm:gap-6 pl-4 sm:pl-8 md:pl-16 pr-8 items-stretch"
          >
            {FEATURE_CARDS.map((item, idx) => {
              const Icon = item.icon;
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

                  {/* Top Content: Number + Icon + Title */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="text-xs sm:text-sm font-mono font-bold tracking-widest text-gray-400">
                        FEATURE {item.number}
                      </span>
                      <div className={`w-12 h-12 rounded-2xl ${item.iconBg} border flex items-center justify-center ${item.iconColor} shadow-md`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                    </div>

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
        <div className="flex items-center justify-center gap-1.5 mt-4 sm:mt-5 shrink-0">
          {FEATURE_CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeIndex === i
                  ? 'w-6 bg-gradient-to-r from-[#FF1E56] to-[#A855F7] shadow-sm shadow-[#FF1E56]/50'
                  : 'w-1.5 bg-white/25 hover:bg-white/45'
              }`}
              aria-label={`Scroll to feature ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
