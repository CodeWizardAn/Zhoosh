import React from 'react';
import { motion, useReducedMotion, TargetAndTransition } from 'framer-motion';

interface AgentAvatarProps {
  state?: 'idle' | 'thinking' | 'responding';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  state = 'idle',
  size = 'md',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const floatAnim: TargetAndTransition = shouldReduceMotion
    ? {}
    : {
        y: [0, -3, 0],
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
      };

  const thinkingAnim: TargetAndTransition = shouldReduceMotion
    ? {}
    : {
        scale: [1, 1.06, 1],
        filter: [
          'drop-shadow(0 0 6px rgba(255,30,86,0.5))',
          'drop-shadow(0 0 14px rgba(157,78,221,0.8))',
          'drop-shadow(0 0 6px rgba(255,30,86,0.5))',
        ],
        transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' },
      };

  const respondingAnim: TargetAndTransition = shouldReduceMotion
    ? {}
    : {
        rotate: [0, -4, 4, -2, 2, 0],
        scale: [1, 1.08, 1],
        filter: ['drop-shadow(0 0 12px rgba(255,30,86,0.7))', 'drop-shadow(0 0 6px rgba(157,78,221,0.5))'],
        transition: { duration: 0.6, ease: 'easeOut' },
      };

  const currentAnim: TargetAndTransition =
    state === 'thinking' ? thinkingAnim : state === 'responding' ? respondingAnim : floatAnim;

  return (
    <motion.div
      className={`${SIZES[size]} rounded-full overflow-hidden shrink-0 relative ${className}`}
      animate={currentAnim}
      style={{
        boxShadow:
          state === 'thinking'
            ? '0 0 16px rgba(157,78,221,0.6), 0 0 32px rgba(255,30,86,0.3)'
            : state === 'responding'
            ? '0 0 20px rgba(255,30,86,0.7)'
            : '0 0 8px rgba(157,78,221,0.3)',
      }}
    >
      <img
        src="/agent-avatar.jpg"
        alt="Agent avatar"
        className="w-full h-full object-cover"
        draggable={false}
      />
      {/* Subtle overlay ring */}
      <div
        className="absolute inset-0 rounded-full border"
        style={{
          borderColor:
            state === 'thinking'
              ? 'rgba(157,78,221,0.6)'
              : state === 'responding'
              ? 'rgba(255,30,86,0.6)'
              : 'rgba(255,255,255,0.1)',
        }}
      />
    </motion.div>
  );
};
