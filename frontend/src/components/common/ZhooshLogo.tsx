import React from 'react';
import { motion } from 'framer-motion';

export interface ZhooshLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  layout?: 'horizontal' | 'vertical';
  variant?: 'artwork' | 'emblem' | 'wordmark' | 'full' | 'auto';
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
  // If variant is wordmark, we only display the wordmark (no emblem)
  const isWordmarkOnly = variant === 'wordmark';
  // If variant is emblem, we only display the emblem (no wordmark)
  const isEmblemOnly = variant === 'emblem';

  const displayWordmark = isWordmarkOnly
    ? true
    : isEmblemOnly
    ? false
    : showWordmark !== undefined
    ? showWordmark
    : showText;

  const isVertical = layout === 'vertical' || size === 'xl' || size === 'hero';

  // Sizing definitions tailored for responsive rendering
  const sizeConfig = {
    xs: {
      emblemClass: 'w-6 h-6 sm:w-7 sm:h-7',
      wordmarkClass: isWordmarkOnly ? 'h-5 sm:h-6' : 'h-4 sm:h-5 max-w-[110px]',
      glowSize: 'w-10 h-10',
      spacing: 'gap-1.5',
      subSize: 'text-[8px]'
    },
    sm: {
      emblemClass: 'w-8 h-8 sm:w-9 sm:h-9',
      wordmarkClass: isWordmarkOnly ? 'h-7 sm:h-8' : 'h-6 sm:h-7 max-w-[140px]',
      glowSize: 'w-14 h-14',
      spacing: 'gap-2',
      subSize: 'text-[9px]'
    },
    md: {
      emblemClass: 'w-10 h-10 sm:w-12 sm:h-12',
      wordmarkClass: isWordmarkOnly ? 'h-9 sm:h-10' : 'h-8 sm:h-9 max-w-[170px]',
      glowSize: 'w-20 h-20',
      spacing: 'gap-2.5',
      subSize: 'text-[10px]'
    },
    lg: {
      emblemClass: 'w-14 h-14 sm:w-16 sm:h-16',
      wordmarkClass: isWordmarkOnly ? 'h-12 sm:h-14' : 'h-11 sm:h-12 max-w-[220px]',
      glowSize: 'w-28 h-28',
      spacing: 'gap-3.5',
      subSize: 'text-xs'
    },
    xl: {
      emblemClass: 'w-24 h-24 sm:w-28 sm:h-28',
      wordmarkClass: 'h-14 sm:h-18 max-w-[300px]',
      glowSize: 'w-44 h-44',
      spacing: 'gap-4',
      subSize: 'text-xs sm:text-sm'
    },
    hero: {
      emblemClass: 'w-32 h-32 sm:w-40 sm:h-40',
      wordmarkClass: 'h-20 sm:h-24 max-w-[400px]',
      glowSize: 'w-60 h-60',
      spacing: 'gap-5',
      subSize: 'text-sm sm:text-base'
    }
  };

  const current = sizeConfig[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex shrink-0 ${
        isVertical ? 'flex-col items-center text-center' : 'flex-row items-center'
      } ${current.spacing} select-none group cursor-pointer ${className}`}
    >
      {/* ── 1. EMBLEM (Stylized 3D Ribbon 'Z' with Orbital Ring & Star) ── */}
      {!isWordmarkOnly && (
        <div className={`relative ${current.emblemClass} shrink-0 flex items-center justify-center`}>
          {/* Subtle Ambient Radial Backlight for seamless blending */}
          <div
            className={`absolute inset-0 rounded-full pointer-events-none -z-10 scale-125 transition-transform duration-500 group-hover:scale-140 opacity-70 group-hover:opacity-100 ${current.glowSize}`}
            style={{
              background:
                'radial-gradient(circle, rgba(255, 30, 86, 0.45) 0%, rgba(168, 85, 247, 0.3) 45%, transparent 70%)',
              filter: 'blur(10px)'
            }}
          />

          <motion.img
            src="/zhoosh-emblem-clean.png"
            alt="Zhoosh Brand Emblem"
            className="w-full h-full object-contain filter drop-shadow-[0_2px_16px_rgba(255,30,86,0.6)] transform transition-transform duration-300 group-hover:scale-105"
            whileHover={animated ? { rotate: [0, -3, 3, 0], scale: 1.08 } : undefined}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onError={(e) => {
              if (e.currentTarget.src.includes('-clean')) {
                e.currentTarget.src = '/zhoosh-emblem.png';
              }
            }}
          />
        </div>
      )}

      {/* ── 2. WORDMARK (Authentic Red/Purple/Chrome 'Zhoosh' with Star Flare) ── */}
      {displayWordmark && (
        <div
          className={`flex flex-col ${
            isVertical ? 'items-center' : 'items-start'
          } justify-center min-w-0 shrink-0 overflow-visible`}
        >
          <div className="relative flex items-center justify-center overflow-visible">
            {/* Soft Ambient Underglow for wordmark text */}
            <div
              className="absolute inset-0 pointer-events-none -z-10 opacity-50 group-hover:opacity-80 transition-opacity duration-300"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(255, 30, 86, 0.3) 0%, rgba(168, 85, 247, 0.2) 60%, transparent 80%)',
                filter: 'blur(12px)',
                transform: 'scale(1.2)'
              }}
            />

            <img
              src="/zhoosh-wordmark-clean.png"
              alt="Zhoosh"
              className={`${current.wordmarkClass} w-auto object-contain filter drop-shadow-[0_2px_14px_rgba(255,30,86,0.5)] transition-transform duration-300 group-hover:scale-[1.03]`}
              onError={(e) => {
                if (e.currentTarget.src.includes('-clean')) {
                  e.currentTarget.src = '/zhoosh-wordmark.jpg';
                  e.currentTarget.style.mixBlendMode = 'screen';
                }
              }}
            />
          </div>

          {/* Subtitle / Descriptor for larger displays */}
          {(size === 'lg' || size === 'xl' || size === 'hero') && (
            <span
              className={`font-mono font-bold tracking-[0.34em] text-[#D8B4FE] uppercase mt-1.5 ${current.subSize} opacity-90 whitespace-nowrap drop-shadow-[0_1px_6px_rgba(168,85,247,0.5)]`}
              style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
            >
              CINEMA × AUDIO
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ZhooshLogo;
