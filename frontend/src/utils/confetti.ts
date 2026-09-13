import confetti from 'canvas-confetti';

export const triggerLikeBurst = (clientX?: number, clientY?: number, mode: 'movies' | 'music' = 'movies') => {
  const primaryColor = mode === 'movies' ? '#F59E0B' : '#10B981';
  const secondaryColor = mode === 'movies' ? '#EF4444' : '#06B6D4';

  const x = clientX ? clientX / window.innerWidth : 0.5;
  const y = clientY ? clientY / window.innerHeight : 0.5;

  confetti({
    particleCount: 22,
    spread: 50,
    startVelocity: 18,
    origin: { x, y },
    colors: [primaryColor, secondaryColor, '#FFFFFF'],
    ticks: 60,
    gravity: 1.2,
    shapes: ['circle'],
    scalar: 0.65,
    disableForReducedMotion: true,
  });
};
