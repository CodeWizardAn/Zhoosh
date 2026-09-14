import { create } from 'zustand';
import { AppMode, Movie, Song, Playlist, User, VoiceSearchState } from '@/types';
import { DEFAULT_AVATAR } from '@/utils/avatars';

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

  // Likes (optimistic state)
  likedIds: Record<string, boolean>;
  toggleLike: (id: string | number) => boolean; // returns new liked state

  // Playlists (optimistic state)
  playlists: Playlist[];
  createPlaylist: (title: string, description: string, mode: AppMode) => Playlist;
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

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  mode: 'movies',
  setMode: (mode) => {
    set({ mode });
    document.documentElement.style.setProperty(
      '--accent-current',
      mode === 'movies' ? '#FF1E56' : '#A855F7'
    );
    document.documentElement.style.setProperty(
      '--accent-glow',
      mode === 'movies' ? 'rgba(255, 30, 86, 0.35)' : 'rgba(168, 85, 247, 0.35)'
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
      localStorage.removeItem('zhoosh_onboarding_completed');
      localStorage.removeItem('aura_onboarding_completed');
      localStorage.removeItem('zhoosh_user_profile');
      localStorage.removeItem('zhoosh_agent_v1');
    } catch {}
    set({ user: null });
  },
  logoutAndRedirect: () => {
    try {
      localStorage.removeItem('zhoosh_onboarding_completed');
      localStorage.removeItem('aura_onboarding_completed');
      localStorage.removeItem('zhoosh_user_profile');
      localStorage.removeItem('zhoosh_agent_v1');
    } catch {}
    set({ user: null });
    // Signal App.tsx to go back to landing — we use a custom event
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

  likedIds: {
    'm-1': true,
    'm-3': true,
    's-2': true,
    's-5': true
  },
  toggleLike: (id) => {
    const strId = String(id);
    let nextState = false;
    set((state) => {
      nextState = !state.likedIds[strId];
      return {
        likedIds: {
          ...state.likedIds,
          [strId]: nextState
        }
      };
    });
    return nextState;
  },

  playlists: [
    {
      id: 'pl-cinematic',
      title: 'Deep Sci-Fi & Cyberpunk',
      description: 'Mind-bending high concept futures and neon atmospheres.',
      mode: 'movies',
      items: [],
      created_at: '2025-01-15',
      cover_art: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'pl-focus',
      title: 'Midnight Coding Flow',
      description: 'Deep synthwave, ambient lofi, and focus grooves.',
      mode: 'music',
      items: [],
      created_at: '2025-02-01',
      cover_art: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'
    }
  ],
  createPlaylist: (title, description, mode) => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      title,
      description,
      mode,
      items: [],
      created_at: new Date().toISOString().split('T')[0],
      cover_art: mode === 'movies'
        ? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80'
    };
    set((state) => ({
      playlists: [newPlaylist, ...state.playlists]
    }));
    return newPlaylist;
  },
  addItemToPlaylist: (playlistId, item) => {
    set((state) => ({
      playlists: state.playlists.map((pl) => {
        if (pl.id === playlistId) {
          const exists = pl.items.some((i) => String(i.id) === String(item.id));
          if (exists) return pl;
          return { ...pl, items: [...pl.items, item] };
        }
        return pl;
      })
    }));
  },
  removeItemFromPlaylist: (playlistId, itemId) => {
    set((state) => ({
      playlists: state.playlists.map((pl) => {
        if (pl.id === playlistId) {
          return {
            ...pl,
            items: pl.items.filter((i) => String(i.id) !== String(itemId))
          };
        }
        return pl;
      })
    }));
  },
  reorderPlaylistItems: (playlistId, newItems) => {
    set((state) => ({
      playlists: state.playlists.map((pl) => {
        if (pl.id === playlistId) {
          return { ...pl, items: newItems };
        }
        return pl;
      })
    }));
  },

  popoverTarget: null,
  openPopover: (item, anchorRect) => set({ popoverTarget: { item, anchorRect } }),
  closePopover: () => set({ popoverTarget: null }),

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
