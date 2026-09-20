import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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

  // Automatically dismiss after 1.25s
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1250);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // 60FPS Full-Screen Procedural Visual Synthesizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const startTime = performance.now();

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle system (60 particles)
    const particles = Array.from({ length: 60 }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      return {
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.8 + 0.2,
        life: 0
      };
    });

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Full Screen Pure Black Base
      ctx.fillStyle = isMusic ? '#01040A' : '#020001';
      ctx.fillRect(0, 0, w, h);

      if (isMusic) {
        // ====================================================
        // FULL-SCREEN BLACK & BLUE ACOUSTIC ENERGY
        // ====================================================
        // Massive ambient blue/cyan radial backdrop
        const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h) * 0.75);
        grad.addColorStop(0, 'rgba(0, 112, 243, 0.45)');
        grad.addColorStop(0.35, 'rgba(0, 210, 255, 0.2)');
        grad.addColorStop(0.7, 'rgba(30, 64, 175, 0.12)');
        grad.addColorStop(1, 'rgba(1, 4, 10, 0.95)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Expanding Full-Screen Acoustic Soundwave Rings
        for (let i = 0; i < 5; i++) {
          const maxRadius = Math.max(w, h) * 0.85;
          const radius = ((elapsed * 320 + i * 140) % maxRadius) + 20;
          const alpha = Math.max(0, 1 - radius / maxRadius) * 0.6;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 210, 255, ${alpha})`;
          ctx.lineWidth = 2 + (1 - radius / maxRadius) * 3;
          ctx.shadowColor = '#0070F3';
          ctx.shadowBlur = 24;
          ctx.stroke();
        }

        // High-definition Sound Wave Horizon Ribbons
        for (let waveIdx = 0; waveIdx < 4; waveIdx++) {
          ctx.beginPath();
          const freq = 0.005 + waveIdx * 0.002;
          const amp = 45 + waveIdx * 25;
          const phase = elapsed * (7 + waveIdx * 2.5);

          for (let x = 0; x <= w; x += 10) {
            const envelope = Math.sin((x / w) * Math.PI);
            const y = cy + Math.sin(x * freq + phase) * amp * envelope;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }

          ctx.strokeStyle = waveIdx % 2 === 0 ? 'rgba(0, 210, 255, 0.65)' : 'rgba(0, 112, 243, 0.5)';
          ctx.lineWidth = 3 - waveIdx * 0.5;
          ctx.shadowColor = '#00D2FF';
          ctx.shadowBlur = 20;
          ctx.stroke();
        }

        // Radial Cyan Particles Radiating from Center
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          const px = cx + p.x;
          const py = cy + p.y;
          const dist = Math.sqrt(p.x * p.x + p.y * p.y);
          const pAlpha = Math.max(0, 1 - dist / (Math.max(w, h) * 0.6)) * p.alpha;

          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 210, 255, ${pAlpha})`;
          ctx.shadowColor = '#0070F3';
          ctx.shadowBlur = 14;
          ctx.fill();
        });
      } else {
        // ====================================================
        // FULL-SCREEN BLACK & RED CINEMA LENS FLARE ENERGY
        // ====================================================
        // Deep Cinema Crimson Radial Backdrop
        const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h) * 0.75);
        grad.addColorStop(0, 'rgba(229, 9, 20, 0.55)');
        grad.addColorStop(0.35, 'rgba(255, 30, 86, 0.22)');
        grad.addColorStop(0.7, 'rgba(120, 0, 15, 0.15)');
        grad.addColorStop(1, 'rgba(2, 0, 1, 0.95)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Anamorphic Horizontal Red Laser Flare Streak (Full Screen Width)
        const flareGradient = ctx.createLinearGradient(0, cy, w, cy);
        flareGradient.addColorStop(0, 'rgba(229, 9, 20, 0)');
        flareGradient.addColorStop(0.25, 'rgba(229, 9, 20, 0.5)');
        flareGradient.addColorStop(0.48, 'rgba(255, 30, 86, 0.85)');
        flareGradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
        flareGradient.addColorStop(0.52, 'rgba(255, 30, 86, 0.85)');
        flareGradient.addColorStop(0.75, 'rgba(229, 9, 20, 0.5)');
        flareGradient.addColorStop(1, 'rgba(229, 9, 20, 0)');

        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(w, cy);
        ctx.strokeStyle = flareGradient;
        ctx.lineWidth = 4.5;
        ctx.shadowColor = '#E50914';
        ctx.shadowBlur = 35;
        ctx.stroke();

        // Expanding Full-Screen Cinema Shockwave Rings
        for (let i = 0; i < 4; i++) {
          const maxRadius = Math.max(w, h) * 0.85;
          const radius = ((elapsed * 340 + i * 160) % maxRadius) + 30;
          const alpha = Math.max(0, 1 - radius / maxRadius) * 0.6;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(229, 9, 20, ${alpha})`;
          ctx.lineWidth = 3 + (1 - radius / maxRadius) * 3.5;
          ctx.shadowColor = '#FF1E56';
          ctx.shadowBlur = 28;
          ctx.stroke();
        }

        // Crimson Cinema Embers Radiating Outward
        particles.forEach((p) => {
          p.x += p.vx * 1.2;
          p.y += p.vy * 1.2 - 0.5; // Slight rise
          const px = cx + p.x;
          const py = cy + p.y;
          const dist = Math.sqrt(p.x * p.x + p.y * p.y);
          const pAlpha = Math.max(0, 1 - dist / (Math.max(w, h) * 0.6)) * p.alpha;

          ctx.beginPath();
          ctx.arc(px, py, p.size * 1.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 40, 75, ${pAlpha})`;
          ctx.shadowColor = '#E50914';
          ctx.shadowBlur = 16;
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
      transition={{ duration: 0.25 }}
      onClick={onComplete}
      className={`fixed inset-0 w-screen h-screen z-[99999] flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none pointer-events-auto ${
        isMusic ? 'bg-[#01040A]' : 'bg-[#020001]'
      }`}
    >
      {/* 1. Full Screen 60FPS Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* 2. Deep Full-Screen Vignette */}
      <div className="fixed inset-0 pointer-events-none z-20 bg-radial from-transparent via-transparent to-black/85" />

      {/* 3. Luxurious Centerpiece (Zero clunky pill badges) */}
      <div className="relative z-30 flex flex-col items-center gap-6 px-6 text-center">
        {/* Pulsing Central Zhoosh Hologram */}
        <motion.div
          initial={{ scale: 0.65, opacity: 0 }}
          animate={{ scale: [0.9, 1.05, 1], opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center"
        >
          {/* Ambient Radiant Glow Sphere */}
          <div
            className={`absolute w-44 h-44 rounded-full blur-3xl pointer-events-none animate-pulse ${
              isMusic ? 'bg-[#0070F3]/50' : 'bg-[#E50914]/50'
            }`}
          />

          {/* Central Zhoosh Emblem with Intense Cinema Glow */}
          <div
            className={`relative p-5 rounded-3xl backdrop-blur-2xl border transition-all ${
              isMusic
                ? 'bg-blue-950/40 border-[#00D2FF]/40 shadow-[0_0_60px_rgba(0,112,243,0.85)]'
                : 'bg-red-950/40 border-[#FF1E56]/40 shadow-[0_0_60px_rgba(229,9,20,0.85)]'
            }`}
          >
            <ZhooshLogo size="md" variant="emblem" showWordmark={false} />
          </div>
        </motion.div>

        {/* Minimalist High-End Typography */}
        <div className="flex flex-col items-center gap-2">
          <motion.h2
            initial={{ opacity: 0, y: 12, letterSpacing: '0.2em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.35em' }}
            transition={{ delay: 0.15, duration: 0.45, ease: 'easeOut' }}
            className={`text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-[0.35em] drop-shadow-2xl ${
              isMusic
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-[#00D2FF]'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-200 to-[#FF1E56]'
            }`}
          >
            {isMusic ? 'ZHOOSH MUSIC' : 'ZHOOSH CINEMA'}
          </motion.h2>

          {/* Sleek Luminous Expansion Line */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '220px', opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
            className={`h-[2px] rounded-full mt-1 ${
              isMusic
                ? 'bg-gradient-to-r from-transparent via-[#00D2FF] to-transparent shadow-[0_0_15px_#00D2FF]'
                : 'bg-gradient-to-r from-transparent via-[#FF1E56] to-transparent shadow-[0_0_15px_#FF1E56]'
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ModeTransitionVideo;
