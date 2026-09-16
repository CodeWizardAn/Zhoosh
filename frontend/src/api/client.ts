import { Movie, Song, Playlist, User, AppMode } from '@/types';
import { MOCK_MOVIES, MOCK_SONGS } from './mockData';
import { DEFAULT_AVATAR } from '@/utils/avatars';

// Simulated latency helper for smooth skeleton demonstration
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class ApiClient {
  private baseUrl = '/api';

  async fetchMovies(genre?: string, limit: number = 600): Promise<Movie[]> {
    try {
      const url = genre
        ? `${this.baseUrl}/movies?genre=${encodeURIComponent(genre)}&limit=${limit}`
        : `${this.baseUrl}/movies?limit=${limit}`;
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

  async fetchMovieRecommendations(movieId: string | number, limit: number = 8): Promise<Movie[]> {
    try {
      const res = await fetch(`${this.baseUrl}/movies/${movieId}/recommendations?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      await delay(350);
      return [...MOCK_MOVIES]
        .filter((m) => String(m.id) !== String(movieId))
        .slice(0, limit);
    }
  }

  async search(query: string, mode: AppMode): Promise<import('@/types').SearchResult> {
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

      const isInterstellar = q.includes('interstellar');
      const isThriller = q.includes('thriller');

      let primary_movie: Movie | null = null;
      let similar_movies: Movie[] = [];
      let genre_top_movies: Movie[] = [];
      let search_type: 'title_match' | 'genre_match' | 'general' = 'general';

      if (isInterstellar) {
        primary_movie = MOCK_MOVIES.find((m) => m.title.toLowerCase().includes('interstellar')) || MOCK_MOVIES[0];
        similar_movies = MOCK_MOVIES.filter((m) => String(m.id) !== String(primary_movie?.id)).slice(0, 6);
        search_type = 'title_match';
      } else if (isThriller) {
        genre_top_movies = MOCK_MOVIES.filter((m) =>
          m.genres.some((g) => g.toLowerCase().includes('thriller') || g.toLowerCase().includes('crime') || g.toLowerCase().includes('action'))
        );
        search_type = 'genre_match';
      }

      return {
        query,
        search_type,
        primary_movie,
        similar_movies,
        genre: isThriller ? 'Thriller' : null,
        genre_top_movies,
        movies: filteredMovies,
        music: filteredMusic
      };
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
        avatar: DEFAULT_AVATAR,
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
        avatar: DEFAULT_AVATAR,
        role: 'AI VIP Member'
      };
    }
  }

  async agentChat(
    message: string,
    history: Array<{ role: string; content: string }>,
    agentName: string,
    onToken: (token: string) => void,
    onDone: (intent: string) => void,
    onError: () => void,
    onMovies?: (movies: Movie[]) => void,
    onSongs?: (songs: Song[]) => void
  ): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'u-101',
          agent_name: agentName,
          message,
          history: history.slice(-10),
        }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let detectedIntent = 'conversational';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;
          try {
            const evt = JSON.parse(jsonStr);
            if (evt.type === 'token' && evt.content) {
              onToken(evt.content);
            } else if (evt.type === 'movies' && evt.movies && onMovies) {
              onMovies(evt.movies);
            } else if (evt.type === 'songs' && evt.songs && onSongs) {
              onSongs(evt.songs);
            } else if (evt.type === 'intent' && evt.intent) {
              detectedIntent = evt.intent;
            } else if (evt.type === 'done') {
              onDone(detectedIntent);
            }
          } catch { /* ignore parse errors */ }
        }
      }
      onDone(detectedIntent);
    } catch {
      // Mock streaming fallback
      await delay(200);
      const msg = message.toLowerCase();
      let intent = 'conversational';
      let attachedMovies: Movie[] = [];
      let attachedSongs: Song[] = [];
      let replyText = '';

      if (msg.includes('horror')) {
        intent = 'horror';
        replyText = "Here are top-rated 🎬 **Horror** movies curated for you on Zhoosh. Click **Watch / View Movie** on any card below to start streaming!";
        attachedMovies = MOCK_MOVIES.filter(m => m.genres.some(g => g.toLowerCase().includes('horror') || g.toLowerCase().includes('thriller'))).slice(0, 6);
        if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 5);
      } else if (msg.includes('comedy')) {
        intent = 'comedy';
        replyText = "Here are acclaimed 🎬 **Comedy** movies to brighten your day on Zhoosh. Click any card below to launch playback!";
        attachedMovies = MOCK_MOVIES.filter(m => m.genres.some(g => g.toLowerCase().includes('comedy') || g.toLowerCase().includes('adventure') || g.toLowerCase().includes('animation'))).slice(0, 6);
        if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 5);
      } else if (msg.includes('inception') || msg.includes('similar') || (msg.includes('like') && !msg.includes('predicted'))) {
        intent = 'similar';
        replyText = "If you love mind-bending cinema like 🎬 **Inception**, here are exceptional films tailored with matching atmosphere and high ratings:";
        attachedMovies = MOCK_MOVIES.filter(m => !m.title.toLowerCase().includes('inception')).slice(0, 6);
      } else if (msg.includes('predict') || msg.includes('tomorrow') || msg.includes('yesterday')) {
        intent = 'predicted';
        replyText = "🔮 **Predictive Neural Cinema Match**:\n\nBased on your predictive viewing history and taste profile, here are the top predicted feature films ready for you to stream today:";
        attachedMovies = [...MOCK_MOVIES].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).slice(0, 6);
      } else if (msg.includes('music') || msg.includes('song') || msg.includes('track') || msg.includes('soundtrack')) {
        intent = 'music';
        replyText = "Here are trending tracks and soundtrack scores on Zhoosh right now. Click any track to listen instantly!";
        attachedSongs = MOCK_SONGS.slice(0, 6);
      } else if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('name') || msg.includes('who are you')) {
        intent = 'conversational';
        replyText = `Hello! I'm **${agentName}**, your personal cinema and soundtrack intelligence assistant on Zhoosh.\n\nAsk me for movie recommendations by genre (like **Horror** or **Comedy**), similar titles to **Inception**, or movies based on what was predicted for you!`;
      } else {
        intent = 'recommendation';
        replyText = "Here are top-tier cinematic recommendations curated for your taste on Zhoosh:";
        attachedMovies = MOCK_MOVIES.slice(0, 6);
      }

      if (attachedMovies.length > 0 && onMovies) onMovies(attachedMovies);
      if (attachedSongs.length > 0 && onSongs) onSongs(attachedSongs);

      const words = replyText.split(' ');
      for (const word of words) {
        onToken(word + ' ');
        await delay(20);
      }
      onDone(intent);
    }
  }
}

export const api = new ApiClient();
