import React from 'react';

interface FadedGridBackdropProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'vibrant';
  showPosters?: boolean;
}

// Curated high-res movie posters to create the authentic Netflix-style poster wall mosaic
const POSTER_MOSAIC = [
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80', // Cyberpunk neon city
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80', // Dark nebula sci-fi
  'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=300&auto=format&fit=crop&q=80', // Noir silhouette
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80', // Velvet cinema red
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80', // Neon purple arcade
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80', // Concert lights
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', // Studio microphone
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&auto=format&fit=crop&q=80', // Vintage film reel
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&auto=format&fit=crop&q=80', // Cinema seats
  'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=300&auto=format&fit=crop&q=80', // Neon cinema theatre
  'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=300&auto=format&fit=crop&q=80', // Forest mist thriller
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&auto=format&fit=crop&q=80', // Film camera projector
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&auto=format&fit=crop&q=80', // Synth soundboard
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&auto=format&fit=crop&q=80', // Matrix code terminal
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300&auto=format&fit=crop&q=80', // Film premiere crowd
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&auto=format&fit=crop&q=80', // Movie marquee
];

export const FadedGridBackdrop: React.FC<FadedGridBackdropProps> = ({
  className = '',
  intensity = 'medium',
  showPosters = true
}) => {
  const opacityMap = {
    subtle: 'opacity-[0.10]',
    medium: 'opacity-[0.18]',
    vibrant: 'opacity-[0.28]'
  };

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {/* 1. Authentic Netflix-style tilted poster mosaic wall */}
      {showPosters && (
        <div
          className={`absolute -inset-[30%] ${opacityMap[intensity]} transform -rotate-6 scale-110 select-none`}
        >
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 h-full w-full">
            {Array.from({ length: 48 }).map((_, idx) => {
              const imgUrl = POSTER_MOSAIC[idx % POSTER_MOSAIC.length];
              return (
                <div
                  key={idx}
                  className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#150D22] border border-[#3E1B59]/30 shadow-lg"
                >
                  <img
                    src={imgUrl}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover grayscale-[35%] contrast-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-60" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Cyberpunk Geometric Perspective Grid Mesh */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(168, 85, 247, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 30, 86, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* 3. Radial Ambient Glow Flares (Cinema Red & Electric Purple) */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[#FF1E56]/12 blur-[150px] animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-[650px] h-[650px] rounded-full bg-[#A855F7]/15 blur-[160px] animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#4C1D95]/10 blur-[180px]" />

      {/* 4. Deep Vignette Masks (Top, Center, Bottom) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/75 to-[#050508]/85" />
    </div>
  );
};
