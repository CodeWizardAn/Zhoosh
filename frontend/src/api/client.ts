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
    onError: () => void
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
      await delay(300);
      const mockResponses: Record<string, string> = {
        trending: "Here are today's **top trending picks** on Zhoosh:\n\n1. 🎬 **Forrest Gump** — Score: 99 · 6 Oscar Winner\n2. 🎬 **The Shawshank Redemption** — Score: 99 · IMDb #1 Masterpiece\n3. 🎬 **Oppenheimer** — Score: 98 · Historical masterpiece\n4. 🎬 **The Dark Knight** — Score: 98 · Dark noir thriller\n5. 🎬 **Spider-Man: Across the Spider-Verse** — Score: 96 · Multiverse animation\n\nWant details on any of these?",
        recommendation: "Based on your taste profile, here are **5 picks curated for you**:\n\n1. 🎬 **Forrest Gump** (1994) — 99% match\n2. 🎬 **The Shawshank Redemption** — 99% match\n3. 🎬 **Gladiator** — 97% match\n4. 🎬 **Inception** — 97% match\n5. 🎬 **The Dark Knight** — 99% match\n\nThese align with your love of legendary, all-time cinematic masterpieces.",
        availability: "Yes! That title **is available** on Zhoosh in your region. Stream it in 4K Ultra HD on your plan. Want me to find similar picks?",
        history: "Looking at your recent activity:\n\n📅 **This week** you watched:\n• Forrest Gump ⭐⭐⭐⭐⭐\n• The Shawshank Redemption ⭐⭐⭐⭐⭐\n• Inception ⭐⭐⭐⭐\n\nYou're on a serious cinema masterpiece streak! Want to keep going?",
        conversational: `I'm ${agentName}, your Zhoosh companion! Ask me about trending movies, personalized recommendations, or anything about your taste. What are you in the mood for?`,
      };

      const msg = message.toLowerCase();
      let intent = 'conversational';
      if (msg.includes('trend') || msg.includes('top') || msg.includes('popular')) intent = 'trending';
      else if (msg.includes('recommend') || msg.includes('suggest') || msg.includes('similar')) intent = 'recommendation';
      else if (msg.includes('available') || msg.includes('watch')) intent = 'availability';
      else if (msg.includes('history') || msg.includes('watched')) intent = 'history';

      const text = mockResponses[intent] || mockResponses.conversational;
      const words = text.split(' ');
      for (const word of words) {
        onToken(word + ' ');
        await delay(35);
      }
      onDone(intent);
    }
  }
}

export const api = new ApiClient();
