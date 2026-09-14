import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import { useSearch } from '@/api/hooks';
import { useAppStore } from '@/store/useAppStore';
import { MediaCard } from '../cards/MediaCard';
import { SkeletonCard } from '../cards/SkeletonCard';
import { EmptyState } from '../common/EmptyState';

interface SearchResultsViewProps {
  query: string;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({ query }) => {
  const { mode } = useAppStore();
  const { data, isLoading } = useSearch(query, mode);

  const movies = data?.movies || [];
  const music = data?.music || [];
  const hasResults = movies.length > 0 || music.length > 0;

  return (
    <div className="px-6 sm:px-10 py-6 max-w-7xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Search className="w-4 h-4" />
        <span>
          Showing search results for <span className="text-white font-bold">"{query}"</span>
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonCard key={idx} variant={mode === 'movies' ? 'movie' : 'song'} index={idx} />
          ))}
        </div>
      ) : !hasResults ? (
        <EmptyState
          type="search"
          title="No exact matches found"
          description="Try broadening your search keywords or use the Voice Search button to describe the mood or plot."
        />
      ) : (
        <div className="space-y-8">
          {movies.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>Matching Films</span>
                <span className="text-xs text-gray-500 font-mono">({movies.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {movies.map((movie, idx) => (
                  <MediaCard key={movie.id} item={movie} variant="movie" index={idx} />
                ))}
              </div>
            </div>
          )}

          {music.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>Matching Soundtracks & Audio</span>
                <span className="text-xs text-gray-500 font-mono">({music.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {music.map((song, idx) => (
                  <MediaCard key={song.id} item={song} variant="song" index={idx} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
