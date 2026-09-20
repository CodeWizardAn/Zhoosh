import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Film, Music, Sparkles, Disc3 } from 'lucide-react';
import { ZhooshLogo } from './ZhooshLogo';

interface ModeTransitionVideoProps {
  direction: 'to-music' | 'to-movies';
  onComplete: () => void;
}

export const ModeTransitionVideo: React.FC<ModeTransitionVideoProps> = ({
  direction,
  onComplete
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isMusic = direction === 'to-music';

  // Auto-dismiss after 1.35s
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1350);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // 60FPS High-Definition Procedural Motion Graphics Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let startTime = performance.now();

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particles system
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: (Math.random() - 0.5) * window.innerWidth,
      y: (Math.random() - 0.5) * window.innerHeight,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 3 + 1,
      alpha: Math.random() * 0.7 + 0.3,
    }));

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000; // seconds
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (isMusic) {
        // ==========================================
        // 1. ELECTRIC BLUE ACOUSTIC WAVE THEME
        // ==========================================
        // Deep midnight blue glow
        const radialGlow = ctx.createRadialGradient(
          window.innerWidth / 2,
          window.innerHeight / 2,
          10,
          window.innerWidth / 2,
          window.innerHeight / 2,
          window.innerWidth * 0.65
        );
        radialGlow.addColorStop(0, 'rgba(0, 112, 243, 0.35)');
        radialGlow.addColorStop(0.45, 'rgba(0, 210, 255, 0.15)');
        radialGlow.addColorStop(1, 'rgba(3, 7, 18, 0)');
        ctx.fillStyle = radialGlow;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        // Pulsing Soundwave Acoustic Rings
        for (let i = 1; i <= 4; i++) {
          const radius = ((elapsed * 180 + i * 90) % (window.innerWidth * 0.5)) + 40;
          const ringAlpha = Math.max(0, 1 - radius / (window.innerWidth * 0.5)) * 0.45;
          ctx.beginPath();
          ctx.arc(window.innerWidth / 2, window.innerHeight / 2, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 210, 255, ${ringAlpha})`;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#0070F3';
          ctx.shadowBlur = 15;
          ctx.stroke();
        }

        // Oscilloscope Sine Wave ribbons across horizon
        const waveCount = 3;
        for (let w = 0; w < waveCount; w++) {
          ctx.beginPath();
          const freq = 0.008 + w * 0.003;
          const amp = 40 + w * 18;
          const phase = elapsed * (6 + w * 2);

          for (let x = 0; x <= window.innerWidth; x += 8) {
            const y =
              window.innerHeight / 2 +
              Math.sin(x * freq + phase) * amp * Math.sin((x / window.innerWidth) * Math.PI);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }

          ctx.strokeStyle = w === 0 ? 'rgba(0, 210, 255, 0.6)' : 'rgba(0, 112, 243, 0.4)';
          ctx.lineWidth = 3 - w * 0.8;
          ctx.shadowColor = '#00D2FF';
          ctx.shadowBlur = 18;
          ctx.stroke();
        }

        // Blue/Cyan floating acoustic stardust
        particles.forEach((p) => {
          p.x += p.vx * 1.5;
          p.y += p.vy * 1.5;
          const px = window.innerWidth / 2 + p.x;
          const py = window.innerHeight / 2 + p.y;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 210, 255, ${p.alpha * Math.sin(elapsed * 4)})`;
          ctx.shadowColor = '#0070F3';
          ctx.shadowBlur = 10;
          ctx.fill();
        });
      } else {
        // ==========================================
        // 2. CINEMATIC RED & BLACK FILM FLARE THEME
        // ==========================================
        // Pure cinematic black with intense red core
        const radialGlow = ctx.createRadialGradient(
          window.innerWidth / 2,
          window.innerHeight / 2,
          10,
          window.innerWidth / 2,
          window.innerHeight / 2,
          window.innerWidth * 0.65
        );
        radialGlow.addColorStop(0, 'rgba(229, 9, 20, 0.45)');
        radialGlow.addColorStop(0.4, 'rgba(255, 30, 86, 0.18)');
        radialGlow.addColorStop(1, 'rgba(5, 5, 8, 0)');
        ctx.fillStyle = radialGlow;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        // Anamorphic Horizontal Red Cinema Lens Flare Streak
        const flareY = window.innerHeight / 2;
        const flareGradient = ctx.createLinearGradient(0, flareY, window.innerWidth, flareY);
        flareGradient.addColorStop(0, 'rgba(229, 9, 20, 0)');
        flareGradient.addColorStop(0.35, 'rgba(255, 30, 86, 0.4)');
        flareGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
        flareGradient.addColorStop(0.65, 'rgba(255, 30, 86, 0.4)');
        flareGradient.addColorStop(1, 'rgba(229, 9, 20, 0)');

        ctx.beginPath();
        ctx.moveTo(0, flareY);
        ctx.lineTo(window.innerWidth, flareY);
        ctx.strokeStyle = flareGradient;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#E50914';
        ctx.shadowBlur = 25;
        ctx.stroke();

        // Expanding Film Shockwave Rings
        for (let i = 1; i <= 3; i++) {
          const radius = ((elapsed * 220 + i * 110) % (window.innerWidth * 0.55)) + 50;
          const ringAlpha = Math.max(0, 1 - radius / (window.innerWidth * 0.55)) * 0.5;
          ctx.beginPath();
          ctx.arc(window.innerWidth / 2, window.innerHeight / 2, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(229, 9, 20, ${ringAlpha})`;
          ctx.lineWidth = 3;
          ctx.shadowColor = '#FF1E56';
          ctx.shadowBlur = 20;
          ctx.stroke();
        }

        // Red cinema sparks / film embers
        particles.forEach((p) => {
          p.x += p.vx * 2;
          p.y += p.vy * 2 - 0.8; // Floating upward like embers
          const px = window.innerWidth / 2 + p.x;
          const py = window.innerHeight / 2 + p.y;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 45, 85, ${p.alpha * Math.abs(Math.sin(elapsed * 5))})`;
          ctx.shadowColor = '#E50914';
          ctx.shadowBlur = 12;
          ctx.fill();
        });
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMusic]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onComplete}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none ${
        isMusic ? 'bg-[#030712]' : 'bg-[#050508]'
      }`}
    >
      {/* 1. Procedural 60FPS Video Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />

      {/* 2. Authentic Cinematic Widescreen Letterbox Matte Bars */}
      <motion.div
        initial={{ y: '-100%' }}
        animate={{ y: 0 }}
        exit={{ y: '-100%' }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 left-0 right-0 h-10 sm:h-14 bg-black/95 border-b border-white/5 z-20"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 right-0 h-10 sm:h-14 bg-black/95 border-t border-white/5 z-20"
      />

      {/* 3. Central Focal Hero Ident */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        {/* Animated Radiant Core Icon */}
        <motion.div
          initial={{ scale: 0.4, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center"
        >
          {/* Ambient Outer Halo Pulse */}
          <div
            className={`absolute w-36 h-36 rounded-full blur-2xl animate-pulse pointer-events-none ${
              isMusic ? 'bg-[#0070F3]/40' : 'bg-[#E50914]/40'
            }`}
          />

          {/* Concentric Rotating Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
            className={`w-28 h-28 rounded-full border-2 border-dashed ${
              isMusic
                ? 'border-[#00D2FF]/60 shadow-[0_0_30px_rgba(0,112,243,0.6)]'
                : 'border-[#FF1E56]/60 shadow-[0_0_30px_rgba(229,9,20,0.6)]'
            }`}
          />

          {/* Central Mode Emblem */}
          <div
            className={`absolute w-20 h-20 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md border ${
              isMusic
                ? 'bg-gradient-to-tr from-[#003B80] via-[#0070F3] to-[#00D2FF] border-[#00D2FF]/50 shadow-[0_0_40px_rgba(0,112,243,0.8)] text-white'
                : 'bg-gradient-to-tr from-[#4A0008] via-[#E50914] to-[#FF1E56] border-[#FF477E]/50 shadow-[0_0_40px_rgba(229,9,20,0.8)] text-white'
            }`}
          >
            {isMusic ? (
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              >
                <Disc3 className="w-9 h-9 text-white animate-spin" style={{ animationDuration: '4s' }} />
              </motion.div>
            ) : (
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              >
                <Film className="w-9 h-9 text-white" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Dynamic Typography Reveal */}
        <div className="flex flex-col items-center gap-2">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black tracking-widest uppercase border backdrop-blur-md ${
              isMusic
                ? 'bg-[#0070F3]/20 border-[#00D2FF]/40 text-[#00D2FF] shadow-[0_0_15px_rgba(0,210,255,0.35)]'
                : 'bg-[#E50914]/20 border-[#FF1E56]/40 text-[#FF477E] shadow-[0_0_15px_rgba(229,9,20,0.35)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isMusic ? 'Acoustic Mode Engaged' : 'Cinema Mode Active'}</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.22, duration: 0.4 }}
            className={`text-2xl sm:text-4xl font-black tracking-tight drop-shadow-lg uppercase ${
              isMusic
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-[#00D2FF]'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-200 to-[#FF1E56]'
            }`}
          >
            {isMusic ? 'Entering Spatial Music' : 'Entering Zhoosh Cinema'}
          </motion.h2>

          {/* Subtitle description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.35 }}
            className="text-xs sm:text-sm text-gray-300 font-medium max-w-sm tracking-normal"
          >
            {isMusic
              ? 'Switching to lossless audio, curated playlists & trending tracks.'
              : 'Switching to 4K cinema discovery, blockbusters & personalized feed.'}
          </motion.p>
        </div>

        {/* Shimmer loading gauge line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '180px' }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
          className={`h-1 rounded-full overflow-hidden relative mt-1 ${
            isMusic ? 'bg-[#0070F3]/30' : 'bg-[#E50914]/30'
          }`}
        >
          <motion.div
            className={`w-full h-full rounded-full ${
              isMusic
                ? 'bg-gradient-to-r from-[#0070F3] to-[#00D2FF] shadow-[0_0_12px_#00D2FF]'
                : 'bg-gradient-to-r from-[#E50914] to-[#FF1E56] shadow-[0_0_12px_#FF1E56]'
            }`}
            animate={{ x: ['-100%', '0%'] }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        </motion.div>
      </div>

      {/* Subtle tap to skip hint */}
      <div className="absolute bottom-16 text-[10px] text-gray-500 uppercase tracking-widest pointer-events-none">
        Tap anywhere to skip
      </div>
    </motion.div>
  );
};

export default ModeTransitionVideo;
