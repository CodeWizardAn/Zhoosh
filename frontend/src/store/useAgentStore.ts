import { create } from 'zustand';
import { AgentMessage, AgentProfile } from '@/types';

const STORAGE_KEY = 'zhoosh_agent_v2';
const OLD_STORAGE_KEY = 'zhoosh_agent_v1';
const MAX_CACHED_MESSAGES = 50;

export type AgentMode = 'movies' | 'music';

export interface AgentMemory {
  preferredGenres: string[];
  favoriteEntities: string[];
  topicsExplored: string[];
  lastActive?: string;
}

const DEFAULT_CINEMA_MEMORY: AgentMemory = {
  preferredGenres: ['Romance', 'Sci-Fi', 'Thriller'],
  favoriteEntities: ['Christopher Nolan'],
  topicsExplored: ['Acclaimed Cinema', 'Mind-Bending Plots'],
};

const DEFAULT_MUSIC_MEMORY: AgentMemory = {
  preferredGenres: ['Romantic', 'Lo-Fi', 'Pop'],
  favoriteEntities: ['Arijit Singh', 'Coldplay'],
  topicsExplored: ['Hi-Fi Audio', 'Chill Melodies'],
};

interface AgentState {
  // Profile
  profile: AgentProfile | null;
  setProfile: (profile: AgentProfile) => void;
  updateAgentName: (name: string) => void;

  // Chat Panel UI
  isOpen: boolean;
  toggleOpen: () => void;
  openChat: () => void;
  closeChat: () => void;

  // Thinking / streaming state
  isThinking: boolean;
  setThinking: (thinking: boolean) => void;

  // Mode-segregated Messages: Cinema vs Music are completely separate!
  messagesByMode: {
    movies: AgentMessage[];
    music: AgentMessage[];
  };
  messages: AgentMessage[];

  // Long-Term Memory (Preserved in both Cinema and Music sections even after clearing chat)
  memoryByMode: {
    movies: AgentMemory;
    music: AgentMemory;
  };

  addMessage: (msg: Omit<AgentMessage, 'id' | 'timestamp'>, mode?: AgentMode) => AgentMessage;
  updateLastAgentMessage: (content: string, done?: boolean, mode?: AgentMode) => void;
  attachMoviesToLastMessage: (movies: import('@/types').Movie[], mode?: AgentMode) => void;
  attachSongsToLastMessage: (songs: import('@/types').Song[], mode?: AgentMode) => void;
  clearHistory: (mode?: AgentMode) => void;
  clearChatScreen: (mode?: AgentMode) => void;
  recordMemoryFromQuery: (mode: AgentMode, query: string) => void;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
  resetForLogout: () => void;
}

const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const useAgentStore = create<AgentState>((set, get) => ({
  profile: null,

  setProfile: (profile) => {
    set({ profile });
    get().saveToStorage();
  },

  updateAgentName: (name) => {
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, name }
        : { name, avatarUrl: '/agent-avatar.jpg', createdAt: new Date().toISOString() }
    }));
    get().saveToStorage();
    const userId = 'u-101';
    fetch('/api/agent/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, agent_name: name })
    }).catch(() => {});
  },

  isOpen: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  isThinking: false,
  setThinking: (thinking) => set({ isThinking: thinking }),

  messagesByMode: {
    movies: [],
    music: [],
  },
  messages: [],

  memoryByMode: {
    movies: { ...DEFAULT_CINEMA_MEMORY },
    music: { ...DEFAULT_MUSIC_MEMORY },
  },

  addMessage: (msg, targetMode: AgentMode = 'movies') => {
    const newMsg: AgentMessage = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...msg,
    };
    set((state) => {
      const updatedModeList = [...(state.messagesByMode[targetMode] || []), newMsg];
      return {
        messagesByMode: {
          ...state.messagesByMode,
          [targetMode]: updatedModeList,
        },
        messages: updatedModeList,
      };
    });
    // Record user memory if user message
    if (msg.role === 'user') {
      get().recordMemoryFromQuery(targetMode, msg.content);
    }
    setTimeout(() => get().saveToStorage(), 300);
    return newMsg;
  },

  recordMemoryFromQuery: (targetMode: AgentMode, query: string) => {
    const q = query.toLowerCase();
    set((state) => {
      const currentMem = { ...(state.memoryByMode[targetMode] || (targetMode === 'movies' ? DEFAULT_CINEMA_MEMORY : DEFAULT_MUSIC_MEMORY)) };
      const genres = new Set(currentMem.preferredGenres);
      const entities = new Set(currentMem.favoriteEntities);
      const topics = new Set(currentMem.topicsExplored);

      if (targetMode === 'movies') {
        if (q.includes('romance') || q.includes('romantic') || q.includes('love')) genres.add('Romance');
        if (q.includes('sci-fi') || q.includes('scifi') || q.includes('space')) genres.add('Sci-Fi');
        if (q.includes('thriller') || q.includes('suspense') || q.includes('twist')) genres.add('Thriller');
        if (q.includes('horror') || q.includes('scary')) genres.add('Horror');
        if (q.includes('comedy') || q.includes('funny')) genres.add('Comedy');
        if (q.includes('action')) genres.add('Action');
        if (q.includes('nolan')) entities.add('Christopher Nolan');
        if (q.includes('tarantino')) entities.add('Quentin Tarantino');
        if (q.includes('dicaprio')) entities.add('Leonardo DiCaprio');
        if (q.includes('bale')) entities.add('Christian Bale');
        topics.add(query.slice(0, 32));
      } else {
        if (q.includes('romance') || q.includes('romantic') || q.includes('love')) genres.add('Romantic');
        if (q.includes('lo-fi') || q.includes('lofi') || q.includes('chill')) genres.add('Lo-Fi');
        if (q.includes('pop')) genres.add('Pop');
        if (q.includes('hip hop') || q.includes('rap')) genres.add('Hip-Hop');
        if (q.includes('rock')) genres.add('Rock');
        if (q.includes('bollywood') || q.includes('hindi')) genres.add('Bollywood');
        if (q.includes('arijit')) entities.add('Arijit Singh');
        if (q.includes('coldplay')) entities.add('Coldplay');
        if (q.includes('weeknd')) entities.add('The Weeknd');
        if (q.includes('sheeran')) entities.add('Ed Sheeran');
        topics.add(query.slice(0, 32));
      }

      return {
        memoryByMode: {
          ...state.memoryByMode,
          [targetMode]: {
            preferredGenres: Array.from(genres).slice(-6),
            favoriteEntities: Array.from(entities).slice(-5),
            topicsExplored: Array.from(topics).slice(-8),
            lastActive: new Date().toISOString(),
          },
        },
      };
    });
  },

  updateLastAgentMessage: (content, done = false, targetMode: AgentMode = 'movies') => {
    set((state) => {
      const modeList = [...(state.messagesByMode[targetMode] || [])];
      const lastIdx = modeList.length - 1;
      if (lastIdx >= 0 && modeList[lastIdx].role === 'agent') {
        modeList[lastIdx] = {
          ...modeList[lastIdx],
          content,
          isStreaming: !done,
        };
      }
      return {
        messagesByMode: {
          ...state.messagesByMode,
          [targetMode]: modeList,
        },
        messages: modeList,
      };
    });
    if (done) {
      setTimeout(() => get().saveToStorage(), 300);
    }
  },

  attachMoviesToLastMessage: (movies, targetMode: AgentMode = 'movies') => {
    set((state) => {
      const modeList = [...(state.messagesByMode[targetMode] || [])];
      const lastIdx = modeList.length - 1;
      if (lastIdx >= 0 && modeList[lastIdx].role === 'agent') {
        modeList[lastIdx] = {
          ...modeList[lastIdx],
          movies,
        };
      }
      return {
        messagesByMode: {
          ...state.messagesByMode,
          [targetMode]: modeList,
        },
        messages: modeList,
      };
    });
    setTimeout(() => get().saveToStorage(), 300);
  },

  attachSongsToLastMessage: (songs, targetMode: AgentMode = 'music') => {
    set((state) => {
      const modeList = [...(state.messagesByMode[targetMode] || [])];
      const lastIdx = modeList.length - 1;
      if (lastIdx >= 0 && modeList[lastIdx].role === 'agent') {
        modeList[lastIdx] = {
          ...modeList[lastIdx],
          songs,
        };
      }
      return {
        messagesByMode: {
          ...state.messagesByMode,
          [targetMode]: modeList,
        },
        messages: modeList,
      };
    });
    setTimeout(() => get().saveToStorage(), 300);
  },

  // Clears chat messages from screen while PRESERVING memory in both Cinema and Music!
  clearChatScreen: (targetMode?: AgentMode) => {
    set((state) => {
      if (targetMode) {
        return {
          messagesByMode: {
            ...state.messagesByMode,
            [targetMode]: [],
          },
          messages: [],
        };
      }
      return {
        messagesByMode: {
          movies: [],
          music: [],
        },
        messages: [],
      };
    });
    get().saveToStorage();
  },

  clearHistory: (targetMode?: AgentMode) => {
    get().clearChatScreen(targetMode);
  },

  loadFromStorage: () => {
    try {
      const rawV2 = localStorage.getItem(STORAGE_KEY);
      if (rawV2) {
        const data = JSON.parse(rawV2);
        if (data.profile) {
          set({ profile: data.profile });
        }
        if (data.memoryByMode) {
          set({
            memoryByMode: {
              movies: data.memoryByMode.movies || DEFAULT_CINEMA_MEMORY,
              music: data.memoryByMode.music || DEFAULT_MUSIC_MEMORY,
            },
          });
        }
        if (data.messagesByMode) {
          const movies = (data.messagesByMode.movies || [])
            .slice(-MAX_CACHED_MESSAGES)
            .map((m: AgentMessage) => ({ ...m, isStreaming: false, songs: undefined }));
          const music = (data.messagesByMode.music || [])
            .slice(-MAX_CACHED_MESSAGES)
            .map((m: AgentMessage) => ({ ...m, isStreaming: false, movies: undefined }));

          set({
            messagesByMode: { movies, music },
            messages: movies,
          });
          return;
        }
      }

      // Fallback / Migrate from v1
      const rawV1 = localStorage.getItem(OLD_STORAGE_KEY);
      if (rawV1) {
        const data = JSON.parse(rawV1);
        if (data.profile) {
          set({ profile: data.profile });
        }
        if (data.messages && Array.isArray(data.messages)) {
          const moviesList: AgentMessage[] = [];
          const musicList: AgentMessage[] = [];

          for (const m of data.messages) {
            const cleanMsg: AgentMessage = { ...m, isStreaming: false };
            if (cleanMsg.songs && cleanMsg.songs.length > 0) {
              musicList.push({ ...cleanMsg, movies: undefined });
            } else if (cleanMsg.movies && cleanMsg.movies.length > 0) {
              moviesList.push({ ...cleanMsg, songs: undefined });
            } else {
              moviesList.push(cleanMsg);
            }
          }

          set({
            messagesByMode: {
              movies: moviesList.slice(-MAX_CACHED_MESSAGES),
              music: musicList.slice(-MAX_CACHED_MESSAGES),
            },
            messages: moviesList.slice(-MAX_CACHED_MESSAGES),
          });
        }
        localStorage.removeItem(OLD_STORAGE_KEY);
      }
    } catch {}
  },

  saveToStorage: () => {
    try {
      const { profile, messagesByMode, memoryByMode } = get();
      const toSave = {
        profile,
        messagesByMode: {
          movies: (messagesByMode.movies || [])
            .slice(-MAX_CACHED_MESSAGES)
            .map((m) => ({ ...m, isStreaming: false, songs: undefined })),
          music: (messagesByMode.music || [])
            .slice(-MAX_CACHED_MESSAGES)
            .map((m) => ({ ...m, isStreaming: false, movies: undefined })),
        },
        memoryByMode,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {}
  },

  resetForLogout: () => {
    set({
      profile: null,
      messagesByMode: { movies: [], music: [] },
      messages: [],
      memoryByMode: {
        movies: { ...DEFAULT_CINEMA_MEMORY },
        music: { ...DEFAULT_MUSIC_MEMORY },
      },
      isOpen: false,
      isThinking: false,
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(OLD_STORAGE_KEY);
    } catch {}
  },
}));
