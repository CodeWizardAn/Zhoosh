import React from 'react';
import { motion } from 'framer-motion';

interface ZhooshLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  layout?: 'horizontal' | 'vertical';
  variant?: 'artwork' | 'emblem' | 'auto';
  showText?: boolean;
  showWordmark?: boolean;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ZhooshLogo: React.FC<ZhooshLogoProps> = ({
  size = 'md',
  layout = 'horizontal',
  variant = 'auto',
  showText = true,
  showWordmark,
  animated = true,
  className = '',
  onClick
}) => {
  const displayWordmark = showWordmark ?? showText;

  // Resolve whether to use full artwork or precision vector emblem
  const useArtwork =
    variant === 'artwork' ||
    (variant === 'auto' && (size === 'hero' || size === 'xl' || layout === 'vertical'));

  // Preset Configurations
  const sizeConfig = {
    xs: {
      iconSize: 'w-7 h-7',
      artSize: 'w-20 h-20',
      fontSize: 'text-lg',
      subSize: 'text-[8px]',
      spacing: 'gap-2',
    },
    sm: {
      iconSize: 'w-9 h-9',
      artSize: 'w-28 h-28',
      fontSize: 'text-xl sm:text-2xl',
      subSize: 'text-[9px]',
      spacing: 'gap-2.5',
    },
    md: {
      iconSize: 'w-11 h-11',
      artSize: 'w-36 h-36',
      fontSize: 'text-2xl sm:text-3xl',
      subSize: 'text-[10px]',
      spacing: 'gap-3',
    },
    lg: {
      iconSize: 'w-16 h-16',
      artSize: 'w-48 h-48',
      fontSize: 'text-4xl sm:text-5xl',
      subSize: 'text-xs',
      spacing: 'gap-3.5',
    },
    xl: {
      iconSize: 'w-24 h-24',
      artSize: 'w-60 h-60',
      fontSize: 'text-5xl sm:text-6xl',
      subSize: 'text-xs sm:text-sm',
      spacing: 'gap-4',
    },
    hero: {
      iconSize: 'w-32 h-32',
      artSize: 'w-64 h-64 sm:w-80 sm:h-80',
      fontSize: 'text-6xl sm:text-7xl lg:text-8xl',
      subSize: 'text-sm sm:text-base',
      spacing: 'gap-4',
    }
  };

  const current = sizeConfig[size];
  const isVertical = layout === 'vertical' || size === 'xl' || size === 'hero';

  return (
    <div
      onClick={onClick}
      className={`inline-flex shrink-0 ${
        isVertical ? 'flex-col items-center text-center' : 'flex-row items-center'
      } ${current.spacing} select-none group cursor-pointer ${className}`}
    >
      {/* ========================================================================= */}
      {/* 1. BRAND MARK: Either Authentic Reference Artwork or Precision SVG Emblem */}
      {/* ========================================================================= */}
      {useArtwork ? (
        // High-Resolution Authentic Glitch Artwork (Floating with zero border clipping)
        <div className={`relative ${current.artSize} shrink-0 flex items-center justify-center`}>
          {/* Atmospheric Backlight Bloom */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF1E56]/40 via-[#FF2E93]/30 to-[#A855F7]/40 blur-2xl pointer-events-none scale-90 group-hover:scale-105 transition-transform duration-500" />

          {/* Authentic Artwork with Natural Screen Blending into Dark Background */}
          <img
            src="/zhoosh-logo-ref.jpg"
            alt="Zhoosh Brand Artwork"
            className="relative w-full h-full object-contain filter contrast-125 saturate-110 drop-shadow-[0_0_25px_rgba(255,30,86,0.6)] mix-blend-screen transform group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        // Precision Cyber Vector Emblem (Play Triangle + Audio Spectrum Soundwave)
        <div className={`relative ${current.iconSize} shrink-0 flex items-center justify-center`}>
          {/* Neon Glow Aura */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#FF1E56] to-[#A855F7] opacity-60 blur-md group-hover:opacity-90 transition-opacity duration-300 pointer-events-none scale-110" />

          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative w-full h-full drop-shadow-[0_2px_12px_rgba(255,30,86,0.7)] group-hover:scale-105 transition-transform duration-300"
          >
            <defs>
              {/* Red-to-Purple Cinema Gradient */}
              <linearGradient id="zhooshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF1E56" />
                <stop offset="50%" stopColor="#FF2E93" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>

              {/* Soundwave Gradient */}
              <linearGradient id="waveGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#FF1E56" />
                <stop offset="50%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>

              {/* Shard Glow */}
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Dark Container Base */}
            <rect width="100" height="100" rx="22" fill="#0A0612" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />

            {/* Glowing Rounded Play Triangle */}
            <path
              d="M 32 24 C 32 20.5 35.8 18.5 38.8 20.3 L 74.2 46.3 C 77 48.2 77 51.8 74.2 53.7 L 38.8 79.7 C 35.8 81.5 32 79.5 32 76 Z"
              fill="url(#zhooshGrad)"
              filter="url(#neonGlow)"
            />

            {/* Horizontal Cyber Glitch Slice Cuts */}
            <line x1="28" y1="38" x2="62" y2="38" stroke="#0A0612" strokeWidth="2.5" />
            <line x1="30" y1="62" x2="58" y2="62" stroke="#0A0612" strokeWidth="2.5" />

            {/* Audio Equalizer Spectrum Soundwave passing through the center */}
            <g stroke="url(#waveGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.95">
              <line x1="8" y1="50" x2="18" y2="50" />
              <line x1="14" y1="42" x2="14" y2="58" />
              <line x1="20" y1="36" x2="20" y2="64" />
              <line x1="26" y1="44" x2="26" y2="56" />
              {/* Central frequency pulse */}
              <line x1="50" y1="34" x2="50" y2="66" stroke="#FFFFFF" strokeWidth="2" />
              {/* Right soundwave frequency */}
              <line x1="74" y1="44" x2="74" y2="56" />
              <line x1="80" y1="36" x2="80" y2="64" />
              <line x1="86" y1="42" x2="86" y2="58" />
              <line x1="92" y1="50" x2="96" y2="50" />
            </g>

            {/* Dynamic Energy Shards */}
            <polygon points="12,18 20,24 16,30" fill="#FF1E56" opacity="0.8" />
            <polygon points="84,72 88,82 78,80" fill="#A855F7" opacity="0.8" />
          </svg>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CRYSTAL-CLEAR, UNCLIPPED WORDMARK: Z H O O S H                         */}
      {/* ========================================================================= */}
      {displayWordmark && (
        <div
          className={`flex flex-col ${
            isVertical ? 'items-center' : 'items-start'
          } justify-center min-w-0 shrink-0 overflow-visible`}
        >
          {/* Outer wrapper with padding ensuring zero letter clipping on any browser */}
          <div className="relative overflow-visible py-1 px-1 sm:px-2">
            <span
              className={`font-black uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#FF1E56] via-[#FF2E93] to-[#A855F7] filter drop-shadow-[0_2px_20px_rgba(255,30,86,0.6)] ${current.fontSize} whitespace-nowrap block`}
              style={{
                fontFamily: "'Inter', 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif",
                letterSpacing: '0.06em'
              }}
            >
              ZHOOSH
            </span>
          </div>

          {/* Subtitle / Category Descriptor */}
          {(size === 'lg' || size === 'xl' || size === 'hero') && (
            <span
              className={`font-mono font-bold tracking-[0.32em] text-[#C084FC] uppercase mt-1 ${current.subSize} opacity-90 whitespace-nowrap`}
            >
              CINEMA × AUDIO
            </span>
          )}
        </div>
      )}
    </div>
  );
};
