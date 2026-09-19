import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { AppMode, Movie, Song } from '@/types';
import { useAppStore } from '@/store/useAppStore';

export const QUERY_KEYS = {
  movies: (genre?: string) => ['movies', genre || 'all'] as const,
  music: (genre?: string) => ['music', genre || 'all'] as const,
  recommendations: (mode: AppMode) => ['recommendations', mode] as const,
  movieRecommendations: (movieId: string | number) => ['movie-recommendations', String(movieId)] as const,
  search: (query: string, mode: AppMode) => ['search', query, mode] as const,
};

export function useMovies(genre?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.movies(genre),
    queryFn: () => api.fetchMovies(genre),
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });
}

export function useMusic(genre?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.music(genre),
    queryFn: () => api.fetchMusic(genre),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecommendations(mode: AppMode) {
  return useQuery({
    queryKey: QUERY_KEYS.recommendations(mode),
    queryFn: () => api.fetchRecommendations(mode),
    staleTime: 1000 * 60 * 5,
  });
}

export function useMovieRecommendations(
  movieId: string | number | null | undefined,
  limit: number = 8,
  targetMovie?: Movie | null
) {
  return useQuery({
    queryKey: QUERY_KEYS.movieRecommendations(movieId ? String(movieId) : 'none'),
    queryFn: () => (movieId ? api.fetchMovieRecommendations(movieId, limit, targetMovie) : Promise.resolve([])),
    enabled: !!movieId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearch(query: string, mode: AppMode) {
  return useQuery({
    queryKey: QUERY_KEYS.search(query, mode),
    queryFn: () => api.search(query, mode),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60,
  });
}

export function useLikeMutation() {
  const queryClient = useQueryClient();
  const toggleLike = useAppStore((state) => state.toggleLike);
  const addToast = useAppStore((state) => state.addToast);

  return useMutation({
    mutationFn: async ({ item, mode }: { item: Movie | Song; mode: AppMode }) => {
      // Optimistically update local store immediately with full item object
      const nextLiked = toggleLike(item);
      try {
        await api.toggleLike(item.id, mode);
        return { item, liked: nextLiked };
      } catch (err) {
        // Rollback if server fails
        toggleLike(item);
        throw err;
      }
    },
    onSuccess: (data) => {
      const title = 'title' in data.item ? data.item.title : 'Item';
      addToast({
        title: data.liked ? `Saved "${title}" to My Zhoosh` : `Removed "${title}" from My Zhoosh`,
        type: 'info'
      });
      queryClient.invalidateQueries({ queryKey: ['likes'] });
    },
    onError: () => {
      addToast({
        title: 'Failed to update like status',
        description: 'Please try again',
        type: 'error'
      });
    }
  });
}

export function useVoiceSearchMutation() {
  const setVoiceProcessing = useAppStore((state) => state.setVoiceProcessing);
  const setVoiceResult = useAppStore((state) => state.setVoiceResult);

  return useMutation({
    mutationFn: async (transcript: string) => {
      setVoiceProcessing(true);
      return await api.voiceSearch(transcript);
    },
    onSuccess: (data) => {
      setVoiceProcessing(false);
      setVoiceResult(data.query);
    },
    onError: () => {
      setVoiceProcessing(false);
    }
  });
}
