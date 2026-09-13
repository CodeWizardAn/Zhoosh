import React from 'react';
import { Sparkles, Film, Music, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRecommendations } from '@/api/hooks';
import { MediaCard } from '../cards/MediaCard';
import { SkeletonCard } from '../cards/SkeletonCard';
import { Movie, Song } from '@/types';

export const RecommendationsView: React.FC = () => {
  const { mode, setMode } = useAppStore();
  const { data: recommendations = [], isLoading } = useRecommendations(mode);

  return (
    <div className="px-6 sm:px-10 py-6 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Editorial Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0F0A18] border border-[#2B1B3D] relative overflow-hidden">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white">
            <Sparkles className={`w-3.5 h-3.5 ${mode === 'movies' ? 'text-[#FF1E56]' : 'text-[#A855F7]'}`} />
            <span>Soundtrack & Cinema Synergy</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Curated For Your Taste
          </h1>

          <p className="text-sm text-gray-400 leading-relaxed">
            Recommendations that bridge what you watch and what you listen to. Movies you love influence the ambient soundscapes and soundtracks queued up in your library, and vice versa.
          </p>

          {/* Quick toggle */}
          <div className="pt-2 flex items-center gap-3 text-xs">
            <span className="text-gray-400">Browsing recommendations for:</span>
            <button
              onClick={() => setMode('movies')}
              className={`font-bold px-3 py-1 rounded-full transition-colors ${
                mode === 'movies' ? 'bg-[#FF1E56] text-white' : 'bg-[#1D1429] text-gray-400 hover:text-white'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setMode('music')}
              className={`font-bold px-3 py-1 rounded-full transition-colors ${
                mode === 'music' ? 'bg-[#A855F7] text-white' : 'bg-[#1D1429] text-gray-400 hover:text-white'
              }`}
            >
              Music
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">
          Recommended {mode === 'movies' ? 'Movies & Series' : 'Tracks & Scores'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <SkeletonCard key={idx} variant={mode === 'movies' ? 'movie' : 'song'} index={idx} />
              ))
            : recommendations.map((item, idx) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  variant={mode === 'movies' ? 'movie' : 'song'}
                  index={idx}
                />
              ))}
        </div>
      </div>
    </div>
  );
};
