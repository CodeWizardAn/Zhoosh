import { Movie, Song, Playlist, User, AppMode } from '@/types';
import { MOCK_MOVIES, MOCK_SONGS } from './mockData';

// Simulated latency helper for smooth skeleton demonstration
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class ApiClient {
  private baseUrl = '/api';

  async fetchMovies(genre?: string): Promise<Movie[]> {
    try {
      const url = genre ? `${this.baseUrl}/movies?genre=${encodeURIComponent(genre)}` : `${this.baseUrl}/movies`;
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      // Graceful fallback to rich mock data
      await delay(450);
      if (!genre || genre === 'All') return MOCK_MOVIES;
      return MOCK_MOVIES.filter((m) => m.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
    }
  }

  async fetchMusic(genre?: string): Promise<Song[]> {
    try {
      const url = genre ? `${this.baseUrl}/music?genre=${encodeURIComponent(genre)}` : `${this.baseUrl}/music`;
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      await delay(450);
      if (!genre || genre === 'All') return MOCK_SONGS;
      return MOCK_SONGS.filter((s) => s.genre.toLowerCase().includes(genre.toLowerCase()));
    }
  }

  async fetchRecommendations(mode: AppMode): Promise<Array<Movie | Song>> {
    try {
      const res = await fetch(`${this.baseUrl}/recommendations?mode=${mode}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      await delay(500);
      if (mode === 'movies') {
        return [...MOCK_MOVIES].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      }
      return [...MOCK_SONGS].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    }
  }

  async search(query: string, mode: AppMode): Promise<{ movies: Movie[]; music: Song[] }> {
    try {
      const res = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}&mode=${mode}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      await delay(400);
      const q = query.toLowerCase().trim();
      const filteredMovies = MOCK_MOVIES.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q)) ||
          m.overview.toLowerCase().includes(q)
      );
      const filteredMusic = MOCK_SONGS.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.genre.toLowerCase().includes(q)
      );
      return { movies: filteredMovies, music: filteredMusic };
    }
  }

  async voiceSearch(audioBlobOrTranscript: string): Promise<{ query: string; results: Array<Movie | Song> }> {
    try {
      const res = await fetch(`${this.baseUrl}/voice-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: audioBlobOrTranscript })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      await delay(600);
      const q = audioBlobOrTranscript.toLowerCase();
      // Match against query keywords
      const matchedMovies = MOCK_MOVIES.filter((m) =>
        q.includes('movie') || q.includes('sci-fi') || q.includes('space') || m.title.toLowerCase().includes(q)
      );
      const matchedSongs = MOCK_SONGS.filter((s) =>
        q.includes('music') || q.includes('synth') || q.includes('beat') || s.title.toLowerCase().includes(q)
      );
      const results = [...matchedMovies, ...matchedSongs];
      return {
        query: audioBlobOrTranscript,
        results: results.length > 0 ? results : [...MOCK_MOVIES.slice(0, 3), ...MOCK_SONGS.slice(0, 3)]
      };
    }
  }

  async toggleLike(id: string | number, mode: AppMode): Promise<{ success: boolean; liked: boolean }> {
    try {
      const res = await fetch(`${this.baseUrl}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, mode })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      // Instant optimistic fallback
      return { success: true, liked: true };
    }
  }

  async login(email: string): Promise<User> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      await delay(400);
      return {
        id: 'u-user',
        name: email.split('@')[0] || 'Zhoosh Explorer',
        email,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Zhoosh Member'
      };
    }
  }

  async signup(name: string, email: string): Promise<User> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      await delay(450);
      return {
        id: `u-${Date.now()}`,
        name,
        email,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: 'AI VIP Member'
      };
    }
  }
}

export const api = new ApiClient();
