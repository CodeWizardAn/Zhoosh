import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ZhooshLogo } from '@/components/common/ZhooshLogo';

interface AnimatedLogoProps {
  onAnimationComplete?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'artwork' | 'emblem' | 'auto';
  playSoundOnMount?: boolean;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  onAnimationComplete,
  size = 'hero',
  variant = 'artwork'
}) => {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 600);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-1">
      {/* Volumetric Radial Glow Atmosphere */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.85, scale: 1.15 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-r from-[#FF1E56]/30 via-[#FF2E93]/20 to-[#A855F7]/30 blur-3xl pointer-events-none"
      />

      {/* Main Zhoosh Brand Graphic & Unclipped Bold Title */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
      >
        <ZhooshLogo
          size={size}
          variant={variant}
          layout="vertical"
          showText={true}
          animated={true}
        />
      </motion.div>
    </div>
  );
};
