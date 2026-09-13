import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface SvgSuccessCheckmarkProps {
  size?: number;
  color?: string;
  onComplete?: () => void;
}

export const SvgSuccessCheckmark: React.FC<SvgSuccessCheckmarkProps> = ({
  size = 64,
  color = '#A855F7',
  onComplete
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Burst dots: 8 radial particles
  const burstAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Radial Dot Burst */}
      {!shouldReduceMotion && burstAngles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const distance = size * 0.72;
        const x = Math.cos(rad) * distance;
        const y = Math.sin(rad) * distance;
        const dotColor = i % 2 === 0 ? color : '#FF1E56';

        return (
          <motion.span
            key={deg}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.4, 0],
              x: [0, x],
              y: [0, y]
            }}
            transition={{
              duration: 0.55,
              delay: 0.35,
              ease: [0.22, 1, 0.36, 1]
            }}
            style={{ backgroundColor: dotColor }}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
          />
        );
      })}

      {/* Pulsing Backlight Ring */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1.15, 1], opacity: [0, 0.4, 0.15] }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md pointer-events-none"
      />

      {/* Checkmark SVG with 600ms stroke-dashoffset draw */}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={shouldReduceMotion ? { scale: 1, opacity: 0 } : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      >
        {/* Background Circle stroke */}
        <motion.circle
          cx="26"
          cy="26"
          r="24"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Check mark stroke - 600ms */}
        <motion.path
          d="M 15 27 L 22 34 L 37 19"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={onComplete}
        />
      </motion.svg>
    </div>
  );
};
