import { create } from 'zustand';
import { AgentMessage, AgentProfile } from '@/types';

const STORAGE_KEY = 'zhoosh_agent_v1';
const MAX_CACHED_MESSAGES = 50;

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

  // Messages
  messages: AgentMessage[];
  addMessage: (msg: Omit<AgentMessage, 'id' | 'timestamp'>) => AgentMessage;
  updateLastAgentMessage: (content: string, done?: boolean) => void;
  attachMoviesToLastMessage: (movies: import('@/types').Movie[]) => void;
  attachSongsToLastMessage: (songs: import('@/types').Song[]) => void;
  clearHistory: () => void;

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
    // Also persist to backend
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

  messages: [],

  addMessage: (msg) => {
    const newMsg: AgentMessage = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      ...msg,
    };
    set((state) => ({ messages: [...state.messages, newMsg] }));
    // Debounce save
    setTimeout(() => get().saveToStorage(), 300);
    return newMsg;
  },

  updateLastAgentMessage: (content, done = false) => {
    set((state) => {
      const msgs = [...state.messages];
      const lastIdx = msgs.length - 1;
      if (lastIdx >= 0 && msgs[lastIdx].role === 'agent') {
        msgs[lastIdx] = {
          ...msgs[lastIdx],
          content,
          isStreaming: !done,
        };
      }
      return { messages: msgs };
    });
    if (done) {
      setTimeout(() => get().saveToStorage(), 300);
    }
  },

  attachMoviesToLastMessage: (movies) => {
    set((state) => {
      const msgs = [...state.messages];
      const lastIdx = msgs.length - 1;
      if (lastIdx >= 0 && msgs[lastIdx].role === 'agent') {
        msgs[lastIdx] = {
          ...msgs[lastIdx],
          movies,
        };
      }
      return { messages: msgs };
    });
    setTimeout(() => get().saveToStorage(), 300);
  },

  attachSongsToLastMessage: (songs) => {
    set((state) => {
      const msgs = [...state.messages];
      const lastIdx = msgs.length - 1;
      if (lastIdx >= 0 && msgs[lastIdx].role === 'agent') {
        msgs[lastIdx] = {
          ...msgs[lastIdx],
          songs,
        };
      }
      return { messages: msgs };
    });
    setTimeout(() => get().saveToStorage(), 300);
  },

  clearHistory: () => {
    set({ messages: [] });
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        data.messages = [];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch {}
  },

  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.profile) {
        set({ profile: data.profile });
      }
      if (data.messages && Array.isArray(data.messages)) {
        // Clean up any stuck streaming messages from previous sessions
        const cleaned = data.messages
          .slice(-MAX_CACHED_MESSAGES)
          .map((m: AgentMessage) => ({ ...m, isStreaming: false }));
        set({ messages: cleaned });
      }
    } catch {}
  },

  saveToStorage: () => {
    try {
      const { profile, messages } = get();
      const toSave = {
        profile,
        messages: messages.slice(-MAX_CACHED_MESSAGES).map((m) => ({
          ...m,
          isStreaming: false,
        })),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {}
  },

  resetForLogout: () => {
    set({ profile: null, messages: [], isOpen: false, isThinking: false });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  },
}));
