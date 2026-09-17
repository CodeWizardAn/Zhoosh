import { create } from 'zustand';
import { AppMode, Movie, Song, Playlist, User, VoiceSearchState } from '@/types';
import { DEFAULT_AVATAR } from '@/utils/avatars';
import { MOCK_MOVIES, MOCK_SONGS } from '@/api/mockData';

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'error';
}

interface AppState {
  // App Mode & View
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  activeNav: 'discover' | 'agent-ai' | 'trending' | 'playlists' | 'likes';
  setActiveNav: (nav: 'discover' | 'agent-ai' | 'trending' | 'playlists' | 'likes') => void;

  // Auth & Onboarding
  user: User | null;
  isAuthOpen: boolean;
  authMode: 'login' | 'signup';
  openAuth: (mode?: 'login' | 'signup') => void;
  closeAuth: () => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  logoutAndRedirect: () => void;
  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;

  // Bottom Music Player State
  currentTrack: Song | null;
  isPlaying: boolean;
  progress: number; // 0 to 1
  currentTimeSec: number;
  volume: number; // 0 to 1
  queue: Song[];
  playTrack: (track: Song, playlistQueue?: Song[]) => void;
  togglePlay: () => void;
  setProgress: (progress: number) => void;
  setCurrentTimeSec: (sec: number) => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;

  // Voice Search
  voiceSearch: VoiceSearchState;
  openVoiceSearch: () => void;
  closeVoiceSearch: () => void;
  setVoiceListening: (listening: boolean) => void;
  setVoiceTranscript: (transcript: string) => void;
  setVoiceProcessing: (processing: boolean) => void;
  setVoiceResult: (result: string) => void;

  // Likes (optimistic state + items store + persistent localStorage)
  likedIds: Record<string, boolean>;
  likedItems: Record<string, Movie | Song>;
  toggleLike: (target: Movie | Song | string | number) => boolean; // returns new liked state

  // Playlists (optimistic state)
  playlists: Playlist[];
  createPlaylist: (title: string, description: string, mode: AppMode, customCover?: string) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  addItemToPlaylist: (playlistId: string, item: Movie | Song) => void;
  removeItemFromPlaylist: (playlistId: string, itemId: string | number) => void;
  reorderPlaylistItems: (playlistId: string, newItems: Array<Movie | Song>) => void;

  // Anchored Playlist Popover
  popoverTarget: {
    item: Movie | Song;
    anchorRect: DOMRect;
  } | null;
  openPopover: (item: Movie | Song, anchorRect: DOMRect) => void;
  closePopover: () => void;

  // Movie Details Modal
  selectedMovie: Movie | null;
  openMovieModal: (movie: Movie) => void;
  closeMovieModal: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const getInitialLikes = (): { likedIds: Record<string, boolean>; likedItems: Record<string, Movie | Song> } => {
  try {
    const savedIds = localStorage.getItem('zhoosh_liked_ids');
    const savedItems = localStorage.getItem('zhoosh_liked_items');
    if (savedIds && savedItems) {
      const parsedIds = JSON.parse(savedIds);
      const parsedItems = JSON.parse(savedItems);
      if (Object.keys(parsedIds).length > 0) {
        return { likedIds: parsedIds, likedItems: parsedItems };
      }
    }
  } catch {}

  const defaultIds: Record<string, boolean> = {};
  const defaultItems: Record<string, Movie | Song> = {};
  MOCK_MOVIES.slice(0, 3).forEach((m) => {
    defaultIds[String(m.id)] = true;
    defaultItems[String(m.id)] = m;
  });
  MOCK_SONGS.slice(0, 2).forEach((s) => {
    defaultIds[String(s.id)] = true;
    defaultItems[String(s.id)] = s;
  });
  return { likedIds: defaultIds, likedItems: defaultItems };
};

const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-trending-vibes',
    title: 'Trending Neon Hits',
    description: 'Chart-topping hits and midnight electric synth jams.',
    mode: 'music',
    items: MOCK_SONGS.slice(0, 4),
    created_at: '2026-03-10',
    cover_art: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'pl-romantic-escape',
    title: 'Soulful & Romantic',
    description: 'Heartfelt melodies, acoustic ballads, and late night romance.',
    mode: 'music',
    items: MOCK_SONGS.filter((s) => s.genre === 'Romantic').slice(0, 4),
    created_at: '2026-03-12',
    cover_art: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'pl-cinematic',
    title: 'Deep Sci-Fi & Cyberpunk',
    description: 'Mind-bending high concept futures and neon atmospheres.',
    mode: 'movies',
    items: [],
    created_at: '2026-01-15',
    cover_art: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80'
  }
];

const getInitialPlaylists = (): Playlist[] => {
  try {
    const saved = localStorage.getItem('zhoosh_user_playlists');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_PLAYLISTS;
};

const initialLikes = getInitialLikes();
const initialPlaylists = getInitialPlaylists();

export const useAppStore = create<AppState>((set, get) => ({
  mode: 'movies',
  setMode: (mode) => {
    set({ mode });
    document.documentElement.style.setProperty(
      '--accent-current',
      mode === 'movies' ? '#FF1E56' : '#0070F3'
    );
    document.documentElement.style.setProperty(
      '--accent-glow',
      mode === 'movies' ? 'rgba(255, 30, 86, 0.35)' : 'rgba(0, 112, 243, 0.45)'
    );
  },
  activeNav: 'discover',
  setActiveNav: (activeNav) => set({ activeNav }),

  user: {
    id: 'u-101',
    name: 'Alex Mercer',
    email: 'alex.mercer@zhoosh.stream',
    avatar: DEFAULT_AVATAR,
    role: 'Zhoosh VIP Ultra'
  },
  isAuthOpen: false,
  authMode: 'login',
  openAuth: (authMode = 'login') => set({ isAuthOpen: true, authMode }),
  closeAuth: () => set({ isAuthOpen: false }),
  setUser: (user) => set({ user }),
  logout: () => {
    try {
      localStorage.setItem('zhoosh_auth_session', 'false');
      localStorage.removeItem('zhoosh_auth_session');
      localStorage.removeItem('zhoosh_onboarding_completed');
    } catch {}
    set({ user: null });
    window.dispatchEvent(new CustomEvent('zhoosh:logout'));
  },
  logoutAndRedirect: () => {
    try {
      localStorage.setItem('zhoosh_auth_session', 'false');
      localStorage.removeItem('zhoosh_auth_session');
      localStorage.removeItem('zhoosh_onboarding_completed');
    } catch {}
    set({ user: null });
    window.dispatchEvent(new CustomEvent('zhoosh:logout'));
  },
  isOnboardingOpen: false,
  openOnboarding: () => set({ isOnboardingOpen: true }),
  closeOnboarding: () => set({ isOnboardingOpen: false }),

  currentTrack: null,
  isPlaying: false,
  progress: 0,
  currentTimeSec: 0,
  volume: 0.8,
  queue: [],
  playTrack: (track, playlistQueue) => {
    set((state) => {
      const queue = playlistQueue || (state.queue.length > 0 ? state.queue : [track]);
      return {
        currentTrack: track,
        isPlaying: true,
        progress: 0,
        currentTimeSec: 0,
        queue
      };
    });
  },
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setProgress: (progress) => set({ progress }),
  setCurrentTimeSec: (currentTimeSec) => set({ currentTimeSec }),
  setVolume: (volume) => set({ volume }),
  nextTrack: () => {
    const { queue, currentTrack } = get();
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => String(t.id) === String(currentTrack.id));
    const nextIndex = (currentIndex + 1) % queue.length;
    set({
      currentTrack: queue[nextIndex],
      isPlaying: true,
      progress: 0,
      currentTimeSec: 0
    });
  },
  prevTrack: () => {
    const { queue, currentTrack } = get();
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => String(t.id) === String(currentTrack.id));
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    set({
      currentTrack: queue[prevIndex],
      isPlaying: true,
      progress: 0,
      currentTimeSec: 0
    });
  },

  voiceSearch: {
    isOpen: false,
    isListening: false,
    transcript: '',
    isProcessing: false,
    resultQuery: ''
  },
  openVoiceSearch: () => set((state) => ({
    voiceSearch: { ...state.voiceSearch, isOpen: true, transcript: '', resultQuery: '' }
  })),
  closeVoiceSearch: () => set((state) => ({
    voiceSearch: { ...state.voiceSearch, isOpen: false, isListening: false, isProcessing: false }
  })),
  setVoiceListening: (isListening) => set((state) => ({
    voiceSearch: { ...state.voiceSearch, isListening }
  })),
  setVoiceTranscript: (transcript) => set((state) => ({
    voiceSearch: { ...state.voiceSearch, transcript }
  })),
  setVoiceProcessing: (isProcessing) => set((state) => ({
    voiceSearch: { ...state.voiceSearch, isProcessing }
  })),
  setVoiceResult: (resultQuery) => set((state) => ({
    voiceSearch: { ...state.voiceSearch, resultQuery }
  })),

  likedIds: initialLikes.likedIds,
  likedItems: initialLikes.likedItems,
  toggleLike: (target) => {
    const isObject = typeof target === 'object' && target !== null && 'id' in target;
    const strId = isObject ? String(target.id) : String(target);
    let nextState = false;

    set((state) => {
      nextState = !state.likedIds[strId];
      const newLikedIds = { ...state.likedIds };
      const newLikedItems = { ...state.likedItems };

      if (nextState) {
        newLikedIds[strId] = true;
        if (isObject) {
          newLikedItems[strId] = target as Movie | Song;
        }
      } else {
        delete newLikedIds[strId];
        delete newLikedItems[strId];
      }

      try {
        localStorage.setItem('zhoosh_liked_ids', JSON.stringify(newLikedIds));
        localStorage.setItem('zhoosh_liked_items', JSON.stringify(newLikedItems));
      } catch {}

      return {
        likedIds: newLikedIds,
        likedItems: newLikedItems
      };
    });

    return nextState;
  },

  playlists: initialPlaylists,
  createPlaylist: (title, description, mode, customCover) => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      title,
      description,
      mode,
      items: [],
      created_at: new Date().toISOString().split('T')[0],
      cover_art: customCover || (mode === 'movies'
        ? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80')
    };
    set((state) => {
      const updated = [newPlaylist, ...state.playlists];
      try {
        localStorage.setItem('zhoosh_user_playlists', JSON.stringify(updated));
      } catch {}
      return { playlists: updated };
    });
    return newPlaylist;
  },
  deletePlaylist: (playlistId) => {
    set((state) => {
      const updated = state.playlists.filter((pl) => pl.id !== playlistId);
      try {
        localStorage.setItem('zhoosh_user_playlists', JSON.stringify(updated));
      } catch {}
      return { playlists: updated };
    });
  },
  addItemToPlaylist: (playlistId, item) => {
    set((state) => {
      const updated = state.playlists.map((pl) => {
        if (pl.id === playlistId) {
          const exists = pl.items.some((i) => String(i.id) === String(item.id));
          if (exists) return pl;
          return { ...pl, items: [...pl.items, item] };
        }
        return pl;
      });
      try {
        localStorage.setItem('zhoosh_user_playlists', JSON.stringify(updated));
      } catch {}
      return { playlists: updated };
    });
  },
  removeItemFromPlaylist: (playlistId, itemId) => {
    set((state) => {
      const updated = state.playlists.map((pl) => {
        if (pl.id === playlistId) {
          return {
            ...pl,
            items: pl.items.filter((i) => String(i.id) !== String(itemId))
          };
        }
        return pl;
      });
      try {
        localStorage.setItem('zhoosh_user_playlists', JSON.stringify(updated));
      } catch {}
      return { playlists: updated };
    });
  },
  reorderPlaylistItems: (playlistId, newItems) => {
    set((state) => {
      const updated = state.playlists.map((pl) => {
        if (pl.id === playlistId) {
          return { ...pl, items: newItems };
        }
        return pl;
      });
      try {
        localStorage.setItem('zhoosh_user_playlists', JSON.stringify(updated));
      } catch {}
      return { playlists: updated };
    });
  },

  popoverTarget: null,
  openPopover: (item, anchorRect) => set({ popoverTarget: { item, anchorRect } }),
  closePopover: () => set({ popoverTarget: null }),

  selectedMovie: null,
  openMovieModal: (movie) => set({ selectedMovie: movie }),
  closeMovieModal: () => set({ selectedMovie: null }),

  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 3500);
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  }))
}));
