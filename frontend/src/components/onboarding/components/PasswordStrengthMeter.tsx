import React from 'react';
import { motion } from 'framer-motion';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) return null;

  // Strength score from 0 to 4
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const percentage = Math.min(100, Math.max(15, (score / 4) * 100));

  // Gradient transition: orange -> yellow -> green
  const getGradientStyle = () => {
    if (score <= 1) {
      return {
        bg: 'from-orange-500 to-amber-500',
        color: '#F97316',
        label: 'Weak security'
      };
    }
    if (score === 2 || score === 3) {
      return {
        bg: 'from-amber-500 to-yellow-400',
        color: '#EAB308',
        label: score === 2 ? 'Fair password' : 'Good protection'
      };
    }
    return {
      bg: 'from-yellow-400 via-emerald-400 to-green-500',
      color: '#22C55E',
      label: 'Ultra secure'
    };
  };

  const { bg, color, label } = getGradientStyle();

  return (
    <div className="w-full mt-2 space-y-1.5 select-none">
      <div className="flex items-center justify-between text-[11px] font-medium text-gray-400">
        <span>Security Strength</span>
        <span style={{ color }} className="font-semibold transition-colors duration-300">
          {label}
        </span>
      </div>

      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${bg} shadow-sm`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 pt-0.5">
        <span className={password.length >= 8 ? 'text-emerald-400' : 'text-gray-500'}>• 8+ chars</span>
        <span className={/[A-Z]/.test(password) ? 'text-emerald-400' : 'text-gray-500'}>• Uppercase</span>
        <span className={/[0-9]/.test(password) ? 'text-emerald-400' : 'text-gray-500'}>• Numbers</span>
        <span className={/[^A-Za-z0-9]/.test(password) ? 'text-emerald-400' : 'text-gray-500'}>• Symbols</span>
      </div>
    </div>
  );
};
