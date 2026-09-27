import { Movie, Song, Playlist, User, AppMode } from '@/types';
import { MOCK_MOVIES, MOCK_SONGS } from './mockData';
import { DEFAULT_AVATAR } from '@/utils/avatars';
import { validateStrictEmail } from '@/utils/security';

// Simulated latency helper for smooth skeleton demonstration
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class ApiClient {
  private baseUrl = '/api';
  private directUrl = 'http://127.0.0.1:8005/api';

  private async request(path: string, options?: RequestInit): Promise<Response> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, options);
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) return res;
    } catch {
      // Vite proxy unreachable
    }

    try {
      const res = await fetch(`${this.directUrl}${path}`, options);
      const ct = res.headers.get('content-type');
      if (res.ok && ct && ct.includes('application/json')) return res;
    } catch {
      // Direct backend unreachable
    }

    throw new Error(`Failed to fetch ${path}`);
  }

  async fetchMovies(genre?: string, limit: number = 600): Promise<Movie[]> {
    try {
      const path = genre
        ? `/movies?genre=${encodeURIComponent(genre)}&limit=${limit}`
        : `/movies?limit=${limit}`;
      const res = await this.request(path, { headers: { 'Content-Type': 'application/json' } });
      return await res.json();
    } catch {
      // Graceful fallback to rich mock data
      await delay(450);
      if (!genre || genre === 'All') return MOCK_MOVIES;
      return MOCK_MOVIES.filter((m) => m.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
    }
  }

  async fetchMusic(genre?: string, limit: number = 100): Promise<Song[]> {
    try {
      const path = genre
        ? `/music?genre=${encodeURIComponent(genre)}&limit=${limit}`
        : `/music?limit=${limit}`;
      const res = await this.request(path, { headers: { 'Content-Type': 'application/json' } });
      return await res.json();
    } catch {
      await delay(450);
      if (!genre || genre === 'All') return MOCK_SONGS;
      return MOCK_SONGS.filter((s) => s.genre.toLowerCase().includes(genre.toLowerCase()));
    }
  }

  async fetchRecommendations(mode: AppMode): Promise<Array<Movie | Song>> {
    try {
      const res = await this.request(`/recommendations?mode=${mode}`);
      return await res.json();
    } catch {
      await delay(500);
      if (mode === 'movies') {
        return [...MOCK_MOVIES].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      }
      return [...MOCK_SONGS].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    }
  }

  async fetchMovieRecommendations(
    movieId: string | number,
    limit: number = 8,
    targetMovie?: Movie | null
  ): Promise<Movie[]> {
    try {
      const titleParam = targetMovie?.title ? `&title=${encodeURIComponent(targetMovie.title)}` : '';
      const res = await this.request(`/movies/${movieId}/recommendations?limit=${limit}${titleParam}`);
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      }
    } catch {
      // Proceed to high-accuracy content-based recommender
    }

    await delay(180);

    // 1. Identify Target Movie accurately
    const baseMovie =
      targetMovie ||
      MOCK_MOVIES.find((m) => String(m.id) === String(movieId)) ||
      MOCK_MOVIES.find((m) => m.title.toLowerCase() === String(movieId).toLowerCase()) ||
      MOCK_MOVIES.find((m) => String(m.id).includes(String(movieId).replace('hero-', '')));

    if (!baseMovie) {
      return [...MOCK_MOVIES].filter((m) => String(m.id) !== String(movieId)).slice(0, limit);
    }

    const targetTitle = baseMovie.title.toLowerCase().trim();
    const targetGenres = new Set((baseMovie.genres || []).map((g) => g.toLowerCase().trim()));
    const targetDirector = (baseMovie.director || '').toLowerCase().trim();
    const targetLang = (baseMovie.language || '').toLowerCase().trim();
    const targetYear = baseMovie.year || (baseMovie.release_date ? parseInt(baseMovie.release_date.slice(0, 4), 10) : 0);

    const stopWords = new Set([
      'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'with', 'is', 'are', 'was', 'by',
      'from', 'this', 'that', 'into', 'after', 'about', 'when', 'who', 'they', 'their', 'them', 'must'
    ]);

    const extractKeywords = (text: string) =>
      text
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .map((w) => w.toLowerCase().trim())
        .filter((w) => w.length > 3 && !stopWords.has(w));

    const targetKw = new Set([...extractKeywords(baseMovie.title), ...extractKeywords(baseMovie.overview || '').slice(0, 25)]);

    // Franchise and thematic clusters
    const FRANCHISES: Array<{ name: string; pattern: RegExp }> = [
      { name: 'batman', pattern: /batman|dark knight|joker|gotham|bruce wayne/i },
      { name: 'spiderman', pattern: /spider-man|spiderman|spider-verse|peter parker|miles morales/i },
      { name: 'avengers', pattern: /avengers|iron man|thor|captain america|marvel|thanos|infinity war/i },
      { name: 'godfather', pattern: /godfather|corleone|mafia|don vito/i },
      { name: 'nolan', pattern: /inception|interstellar|oppenheimer|tenet|prestige|memento|dunkirk/i },
      { name: 'ghibli', pattern: /spirited away|princess mononoke|howl's moving castle|my neighbor totoro|your name|suzume/i },
      { name: 'tarantino', pattern: /pulp fiction|django unchained|kill bill|inglourious basterds|reservoir dogs/i },
      { name: 'hirani', pattern: /3 idiots|pk|taare zameen|like stars on earth|munna bhai|dangal|swades|lagaan/i },
      { name: 'bollywood_friendship', pattern: /3 idiots|chhichhore|dil chahta hai|zindagi na milegi dobara|yeh jawaani hai deewani/i },
      { name: 'bollywood_romance', pattern: /jab we met|dilwale dulhania|kal ho naa ho|kabir singh|barfi|queen|om shanti om/i },
      { name: 'space_scifi', pattern: /interstellar|gravity|the martian|arrival|2001: a space odyssey|space|alien|wormhole/i },
      { name: 'crime_noir', pattern: /godfather|goodfellas|scarface|the departed|gangs of wasseypur|irishman|se7en/i },
      { name: 'horror_universe', pattern: /conjuring|annabelle|insidious|hereditary|a quiet place|sinister|shining/i },
    ];

    const matchingFranchises = FRANCHISES.filter(
      (f) => f.pattern.test(baseMovie.title) || f.pattern.test(baseMovie.overview || '')
    );

    // 2. Score Candidates accurately
    const scored = MOCK_MOVIES.filter((cand) => {
      if (String(cand.id) === String(baseMovie.id)) return false;
      if (cand.title.toLowerCase() === targetTitle) return false;
      return true;
    }).map((cand) => {
      let score = 0;
      const candTitle = cand.title.toLowerCase().trim();
      const candDirector = (cand.director || '').toLowerCase().trim();
      const candLang = (cand.language || '').toLowerCase().trim();
      const candGenres = (cand.genres || []).map((g) => g.toLowerCase().trim());
      const candKw = extractKeywords(cand.title + ' ' + (cand.overview || ''));

      // 1. Franchise Cluster Match (+75 pts)
      for (const f of matchingFranchises) {
        if (f.pattern.test(cand.title) || f.pattern.test(cand.overview || '')) {
          score += 75;
          break;
        }
      }

      // 2. Same Director Match (+50 pts)
      if (targetDirector && targetDirector !== 'visionary director' && candDirector === targetDirector) {
        score += 50;
      }

      // 3. Language & Regional Affinity (+40 pts)
      if (targetLang && candLang) {
        if (targetLang === candLang) {
          score += 40;
        } else if (targetLang === 'hindi' && candLang !== 'hindi') {
          score -= 45; // Do not recommend Hollywood for Bollywood
        } else if (targetLang !== 'hindi' && candLang === 'hindi') {
          score -= 35; // Do not recommend Bollywood for Hollywood
        }
      }

      // 4. Genre Jaccard Overlap (+45 pts max)
      let commonGenreCount = 0;
      for (const g of candGenres) {
        if (targetGenres.has(g)) commonGenreCount++;
      }
      if (targetGenres.size > 0) {
        score += (commonGenreCount / targetGenres.size) * 45;
      }

      // 5. Thematic Keywords Match (+30 pts max)
      let commonKw = 0;
      for (const kw of candKw) {
        if (targetKw.has(kw)) commonKw++;
      }
      score += Math.min(30, commonKw * 6);

      // 6. Quality & Rating (+10 pts max)
      score += ((cand.vote_average || 7.5) / 10) * 10;

      // 7. Era Proximity (+6 pts)
      const candYear = cand.year || (cand.release_date ? parseInt(cand.release_date.slice(0, 4), 10) : 0);
      if (targetYear > 0 && candYear > 0) {
        const diff = Math.abs(targetYear - candYear);
        if (diff <= 5) score += 6;
        else if (diff <= 12) score += 3;
      }

      // 8. Deterministic Seeded Variation (+4 pts)
      const h = (targetTitle.length * 31 + candTitle.length * 17) % 7;
      score += h * 0.5;

      return { movie: cand, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((c) => c.movie);
  }

  async search(query: string, mode: AppMode): Promise<import('@/types').SearchResult> {
    try {
      const res = await this.request(`/search?q=${encodeURIComponent(query)}&mode=${mode}`);
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
      const isRomanticQuery = ['romantic', 'romance', 'love'].some(t => q.includes(t));

      let primary_movie: Movie | null = null;
      let similar_movies: Movie[] = [];
      let genre_top_movies: Movie[] = [];
      let search_type: 'title_match' | 'genre_match' | 'song_match' | 'artist_match' | 'romantic_match' | 'general' = 'general';

      let primary_song: Song | null = null;
      let artist_name: string | null = null;
      let artist_songs: Song[] = [];
      let similar_songs: Song[] = [];
      let similar_romantic_songs: Song[] = [];

      // Check Artist Match (Singer, Band, Composer)
      const matchedArtistSongs = MOCK_SONGS.filter(s => s.artist.toLowerCase().includes(q));
      if (matchedArtistSongs.length > 0) {
        artist_songs = matchedArtistSongs;
        artist_name = matchedArtistSongs[0].artist.split(',')[0].trim();
        if (mode === 'music' || matchedArtistSongs.length >= 2) {
          search_type = 'artist_match';
        }
        similar_songs = MOCK_SONGS.filter(s => !artist_songs.some(as => as.id === s.id)).slice(0, 6);
      }

      // Check Specific Song Match
      const matchedSong = MOCK_SONGS.find(s => s.title.toLowerCase() === q || s.title.toLowerCase().includes(q));
      if (matchedSong) {
        primary_song = matchedSong;
        if (mode === 'music' || !isInterstellar) {
          search_type = 'song_match';
        }
        const isSongRomantic = matchedSong.genre.toLowerCase() === 'romantic' ||
          ['kesariya', 'tum hi ho', 'darmiyaan', 'perfect', 'until i found you', 'golden hour', 'die with a smile', 'all of me'].some(t => matchedSong.title.toLowerCase().includes(t));
        
        if (isSongRomantic) {
          similar_romantic_songs = MOCK_SONGS.filter(
            s => s.id !== matchedSong.id && (s.genre.toLowerCase() === 'romantic' || s.title.toLowerCase().includes('kesariya') || s.title.toLowerCase().includes('tum hi ho'))
          ).slice(0, 8);
        }
        similar_songs = MOCK_SONGS.filter(s => s.id !== matchedSong.id && s.genre === matchedSong.genre).slice(0, 6);
        
        const mainArtist = matchedSong.artist.split(',')[0].trim();
        if (artist_songs.length === 0) {
          artist_name = mainArtist;
          artist_songs = MOCK_SONGS.filter(s => s.id !== matchedSong.id && s.artist.toLowerCase().includes(mainArtist.toLowerCase())).slice(0, 8);
        }
      }

      // Check Romantic Query
      if (isRomanticQuery) {
        similar_romantic_songs = MOCK_SONGS.filter(s => s.genre.toLowerCase() === 'romantic').slice(0, 10);
        if (mode === 'music') {
          search_type = 'romantic_match';
        }
      }

      if (mode === 'movies') {
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
      } else {
        // In music mode, ensure all movie fields are null and empty
        primary_movie = null;
        similar_movies = [];
        genre_top_movies = [];
        
        // If generic music search ("song", "music", "play a song") and no specific track matched yet
        if (!primary_song && artist_songs.length === 0 && similar_romantic_songs.length === 0 && filteredMusic.length === 0) {
          filteredMusic = MOCK_SONGS.slice(0, 12);
        }
      }

      return {
        query,
        search_type,
        mode,
        primary_movie: mode === 'music' ? null : primary_movie,
        similar_movies: mode === 'music' ? [] : similar_movies,
        genre: mode === 'music' ? (isRomanticQuery ? 'Romance' : null) : (isThriller ? 'Thriller' : isRomanticQuery ? 'Romance' : null),
        genre_top_movies: mode === 'music' ? [] : genre_top_movies,
        primary_song,
        artist_name,
        artist_songs,
        similar_songs,
        similar_romantic_songs,
        movies: mode === 'music' ? [] : filteredMovies,
        music: mode === 'movies' ? [] : (filteredMusic.length > 0 ? filteredMusic : MOCK_SONGS.slice(0, 10))
      };
    }
  }

  async voiceSearch(audioBlobOrTranscript: string, mode: AppMode = 'movies'): Promise<{ query: string; results: Array<Movie | Song> }> {
    try {
      const res = await fetch(`${this.baseUrl}/voice-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: audioBlobOrTranscript, mode })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      await delay(400);
      const q = audioBlobOrTranscript.toLowerCase();
      const isMusicIntent = mode === 'music' || ['song', 'songs', 'track', 'tracks', 'music', 'singer', 'listen', 'play', 'sing', 'kesariya', 'arijit', 'album'].some(k => q.includes(k));

      if (isMusicIntent) {
        const matchedSongs = MOCK_SONGS.filter((s) =>
          q.includes('music') || q.includes('synth') || q.includes('beat') || s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
        );
        return {
          query: audioBlobOrTranscript,
          results: matchedSongs.length > 0 ? matchedSongs : MOCK_SONGS.slice(0, 6)
        };
      }

      const matchedMovies = MOCK_MOVIES.filter((m) =>
        q.includes('movie') || q.includes('sci-fi') || q.includes('space') || m.title.toLowerCase().includes(q)
      );
      return {
        query: audioBlobOrTranscript,
        results: matchedMovies.length > 0 ? matchedMovies : MOCK_MOVIES.slice(0, 6)
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

  async login(email: string, password?: string): Promise<User> {
    const emailValidation = validateStrictEmail(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error || 'Invalid email address format.');
    }
    const cleanEmail = emailValidation.normalizedEmail || email.trim().toLowerCase();

    if (!password || password.trim().length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    try {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: password.trim() })
      });
      if (res.status === 422 || res.status === 400 || res.status === 401 || res.status === 429) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Authentication failed. Please check your credentials.');
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      if (err.message && !err.message.startsWith('HTTP') && !err.message.includes('fetch')) {
        throw err;
      }
      await delay(400);
      return {
        id: 'u-user',
        name: cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Zhoosh Explorer',
        email: cleanEmail,
        avatar: DEFAULT_AVATAR,
        role: 'Zhoosh Member'
      };
    }
  }

  async signup(name: string, email: string, password?: string): Promise<User> {
    const emailValidation = validateStrictEmail(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error || 'Invalid email address format.');
    }
    const cleanEmail = emailValidation.normalizedEmail || email.trim().toLowerCase();

    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters.');
    }

    if (!password || password.trim().length < 8) {
      throw new Error('Registration password must be at least 8 characters long.');
    }

    try {
      const res = await fetch(`${this.baseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: cleanEmail, password: password.trim() })
      });
      if (res.status === 422 || res.status === 400 || res.status === 409) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Registration failed.');
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      if (err.message && !err.message.startsWith('HTTP') && !err.message.includes('fetch')) {
        throw err;
      }
      await delay(450);
      return {
        id: `u-${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        avatar: DEFAULT_AVATAR,
        role: 'AI VIP Member'
      };
    }
  }

  async fetchLiked(mode: AppMode): Promise<Array<Movie | Song>> {
    try {
      const res = await this.request(`/likes?mode=${mode}`);
      return await res.json();
    } catch {
      return [];
    }
  }

  async fetchPlaylists(): Promise<Playlist[]> {
    try {
      const res = await this.request('/playlists');
      return await res.json();
    } catch {
      return [];
    }
  }

  async createPlaylist(name: string, description?: string): Promise<Playlist> {
    try {
      const res = await this.request('/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      return await res.json();
    } catch {
      return {
        id: `p-${Date.now()}`,
        title: name,
        description: description || '',
        mode: 'movies',
        cover_art: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
        items: [],
        created_at: new Date().toISOString()
      };
    }
  }

  async addToPlaylist(playlistId: string, item: Movie | Song): Promise<{ success: boolean }> {
    try {
      const res = await this.request(`/playlists/${playlistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      return await res.json();
    } catch {
      return { success: true };
    }
  }

  async removeFromPlaylist(playlistId: string, itemId: string | number): Promise<{ success: boolean }> {
    try {
      const res = await this.request(`/playlists/${playlistId}/items/${itemId}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch {
      return { success: true };
    }
  }

  async updatePlaylist(playlistId: string, data: { name?: string; description?: string }): Promise<Playlist> {
    try {
      const res = await this.request(`/playlists/${playlistId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch {
      return {
        id: playlistId,
        title: data.name || 'Updated Playlist',
        description: data.description || '',
        mode: 'movies',
        cover_art: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
        items: [],
        created_at: new Date().toISOString()
      };
    }
  }

  async deletePlaylist(playlistId: string): Promise<{ success: boolean }> {
    try {
      const res = await this.request(`/playlists/${playlistId}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch {
      return { success: true };
    }
  }

  async fetchUserProfile(): Promise<User> {
    try {
      const res = await this.request('/user/profile');
      return await res.json();
    } catch {
      return {
        id: 'u-101',
        name: 'Alex Mercer',
        email: 'alex.mercer@zhoosh.ai',
        avatar: DEFAULT_AVATAR,
        role: 'AI VIP Member'
      };
    }
  }

  async agentChat(
    message: string,
    history: Array<{ role: string; content: string }>,
    agentName: string = 'Nova',
    onToken: (token: string) => void,
    onDone: (intent?: string) => void,
    onError: () => void,
    onMovies?: (movies: Movie[]) => void,
    onSongs?: (songs: Song[]) => void,
    mode: AppMode = 'movies',
    likedTitles: string[] = [],
    memory?: any
  ): Promise<void> {
    try {
      let res: Response;
      const bodyPayload = JSON.stringify({
        user_id: 'u-101',
        agent_name: agentName,
        message,
        mode,
        history: history.slice(-12),
        liked_titles: likedTitles || [],
        memory: memory || {},
      });

      try {
        res = await fetch(`${this.baseUrl}/agent/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyPayload,
        });
        if (!res.ok) throw new Error();
      } catch {
        res = await fetch(`${this.directUrl}/agent/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyPayload,
        });
      }

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
      let intent = 'conversational';
      let attachedMovies: Movie[] = [];
      let attachedSongs: Song[] = [];
      let replyText = '';

      // 1. Meta Difference Check ("diff between hi hello", "difference between hi and hello", "high differently")
      const isGreetingMeta =
        /\b(diff|difference|different|differently|distinction|compare|meanings?|differentiate)\b/i.test(message) &&
        /\b(hi|hello|hey|high)\b/i.test(message);

      const isHighVibe = /\bhigh\s+(energy|octane|tempo|bpm|stakes?|school|definition|rating|rated|performance)\b/i.test(message);
      const cleanPunct = message.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

      const isPureGreeting = !isHighVibe && (
        /^(hi+|hello+|hey+|heyy+|heya|howdy|hola|high|sup|yo|greetings?|good\s+(morning|afternoon|evening|day))(\s+(there|nova|sonicbot|bot|friend|buddy|mate|everyone|all|assistant))?$/i.test(cleanPunct)
      );
      const isIdentity = /\b(who are you|who r u|what is your name|whats your name|what are you|introduce yourself)\b/i.test(cleanPunct);
      const isHowAreYou = /\b(how are you|how r u|how do you do|hows it going|how are things|how are you doing)\b/i.test(cleanPunct);
      const isHelp = /^(help|what can you do|how does this work)$/i.test(cleanPunct);

      if (isGreetingMeta) {
        intent = 'conversational';
        if (mode === 'movies') {
          replyText = `Linguistically, **"Hi"**, **"Hello"**, and **"High"** all carry distinct meanings:\n\n• **"Hi"**: Casual, warm, and conversational—the standard informal greeting among friends.\n• **"Hello"**: The classic, universally recognized greeting suited for any setting.\n• **"High"**: A phonetic homophone (sounds identical) often typed by mistake or transcribed via voice for "hi"—though in cinema, it points to **high-octane thrillers**, **high-stakes drama**, or **high-energy blockbusters**!\n\nWhether you say *hi*, *hello*, or are looking for something high-energy, I'm **${agentName}**, your dedicated AI cinema guide. What would you like to watch or explore today?`;
        } else {
          replyText = `Linguistically, **"Hi"**, **"Hello"**, and **"High"** all carry distinct nuances:\n\n• **"Hi"**: Casual, energetic, and informal—great for kicking off a listening session.\n• **"Hello"**: The universal standard greeting for every musical discovery.\n• **"High"**: A phonetic homophone often typed as a quick typo or transcribed via voice for "hi"—though in music, it represents **high-energy gym bangers**, **high-BPM dance tracks**, or **high-fidelity lossless audio**!\n\nWhether you say *hi*, *hello*, or want high-energy tunes, I'm **${agentName}**, your AI audio guide. What track, artist, or genre are you tuning into today?`;
        }
      } else if (isPureGreeting || isIdentity || isHowAreYou || isHelp) {
        intent = 'conversational';
        if (/^high/i.test(cleanPunct)) {
          replyText = mode === 'movies'
            ? `Hello there! I see you said **"High"**—whether that's a quick hello or you're looking for **high-octane, adrenaline-pumping cinema**, you've come to the right place! 🎬\n\nI'm **${agentName}**, your AI Cinema Intelligence guide. Ask me for high-energy thrillers, genre recommendations, or say _"What kind of movies do I like?"_ to tune your taste profile!`
            : `Hello there! I see you typed **"High"**—whether that's a friendly hello or you're searching for **high-energy workout bangers and high-BPM anthems**, I've got you covered! ⚡\n\nI'm **${agentName}**, your AI Music Intelligence guide. Ask me for gym tracks, artists like Arijit Singh, or your sonic taste profile!`;
        } else if (/^hi/i.test(cleanPunct)) {
          replyText = mode === 'movies'
            ? `Hi there! 👋 I am **${agentName}**, your personal AI Cinema & Storytelling guide on Zhoosh.\n\nWhat are you in the mood to watch today? You can ask for genres (**Thriller**, **Comedy**, **Sci-Fi**), films like **Inception**, or say _"What kind of movies do I like?"_!`
            : `Hi there! 👋 I am **${agentName}**, your personal AI Music & Audio Intelligence guide on Zhoosh.\n\nWhat's your soundtrack today? Explore **Lo-Fi**, **Hip-Hop**, artists like **Coldplay**, or vibe tracks for **Road Trips**!`;
        } else if (/^hello/i.test(cleanPunct)) {
          replyText = mode === 'movies'
            ? `Hello! Welcome to Zhoosh Cinema. I'm **${agentName}**, your dedicated movie recommendation intelligence.\n\nWhether you're looking for mind-bending sci-fi, gripping thrillers, heartfelt dramas, or movies directed by Christopher Nolan, I have our entire library ready for you. How can I help you choose your next favorite film?`
            : `Hello! Welcome to Zhoosh Music. I'm **${agentName}**, your dedicated audio intelligence assistant.\n\nFrom chart-topping global hits and lossless Hi-Fi tracks to curated moods (party, chill, road trips, or workout), I can queue up the perfect sound for your moment. What would you like to explore?`;
        } else if (/^hey/i.test(cleanPunct)) {
          replyText = mode === 'movies'
            ? `Hey! Great to see you. I'm **${agentName}**, your AI film curator. Looking for something thrilling, funny, or thought-provoking to stream today? Tell me a genre, an actor, or a movie you love!`
            : `Hey! Great to see you. I'm **${agentName}**, your AI music companion. Ready to find your next favorite track or playlist? Drop an artist, genre, or mood and let's get the music going!`;
        } else if (isHowAreYou) {
          replyText = mode === 'movies'
            ? `I'm doing great, thank you for asking! 😊 Ready to help you discover incredible movies, directors, and cinematic stories. What genre or vibe are you in the mood for today?`
            : `I'm doing fantastic, thanks for asking! 🎵 Ready to queue up the best tracks and curate the perfect soundscape for you. What kind of music vibe or artist are you tuning into today?`;
        } else if (isIdentity) {
          replyText = mode === 'movies'
            ? `I am **${agentName}**, your dedicated AI Cinema & Soundtrack Intelligence assistant on Zhoosh. Ask me for movie recommendations by genre, directors like Christopher Nolan, similar movies to Inception, or your personal taste profile!`
            : `I am **${agentName}**, your dedicated AI Music & Audio Intelligence guide on Zhoosh. Ask me for songs by artist (Arijit Singh, Coldplay), genres (Hip-Hop, Lo-Fi), or workout bangers!`;
        } else {
          replyText = mode === 'movies'
            ? `Greetings and welcome! I'm **${agentName}**, your AI cinema companion on Zhoosh. Ready to stream something remarkable? Tell me what genre or vibe you're feeling today!`
            : `Greetings and welcome! I'm **${agentName}**, your audio intelligence guide on Zhoosh. Ready to stream some great tunes? Tell me what sound or vibe you want!`;
        }
      } else {
        // Strip leading greeting for compound queries (e.g. "hi suggest thriller movies")
        const strippedMsg = message.replace(/^(hi+|hello+|hey+|heyy+|howdy|hola|high|good\s+(morning|afternoon|evening))\b[,!.\s]*/i, '').trim();
        const msg = (strippedMsg || message).toLowerCase().trim();

        if (mode === 'music') {
          // ================= MUSIC MODE FALLBACK =================
          if (/\b(movie|movies|film|films|cinema|director|actor)\b/i.test(msg)) {
            intent = 'mode_switch';
            replyText = `🎵 **You are currently in Music mode with ${agentName}!**\n\nTo explore movies, watch trailers, or check director filmographies, please switch to **Cinema mode** using the toggle in the top bar 🎬.`;
          } else if (/\b(what (kind of )?(songs?|music|tracks?) do i like|my taste|what do i like|my preferences|what is my music taste)\b/i.test(msg)) {
          intent = 'taste_profile';
          const liked = (likedTitles || []).filter(Boolean);
          if (liked.length > 0) {
            replyText = `🎧 **Your Sonic Taste Profile**:\n\nBased on your active library and liked tracks (**${liked.slice(0, 3).join(', ')}**), your vibe centers on heartfelt melodies, atmospheric production, and high-energy anthems.\n\nHere are handpicked tracks directly aligned with your acoustic signature:`;
          } else {
            replyText = `🎧 **Your Sonic Taste Profile**:\n\nYour listening profile embraces eclectic vibes—from soulful indie and Bollywood acoustic melodies to chart-topping synthwave and hip-hop. Here are premier tracks calibrated for your taste:`;
          }
          attachedSongs = [...MOCK_SONGS].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).slice(0, 6);
        } else if (/\b(arijit singh|arijit)\b/i.test(msg)) {
          intent = 'artist';
          replyText = `Here are signature masterpieces by 🎤 **Arijit Singh** on Zhoosh Music:\n\nClick any track below to launch lossless playback!`;
          attachedSongs = MOCK_SONGS.filter(s => s.artist.toLowerCase().includes('arijit')).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(coldplay|chris martin)\b/i.test(msg)) {
          intent = 'artist';
          replyText = `Here are iconic stadium anthems by 🎸 **Coldplay** on Zhoosh Music:\n\nClick any track below to stream!`;
          attachedSongs = MOCK_SONGS.filter(s => s.artist.toLowerCase().includes('coldplay')).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(the weeknd|weeknd|abel)\b/i.test(msg)) {
          intent = 'artist';
          replyText = `Here are chart-topping dark-pop hits by ⚡ **The Weeknd** on Zhoosh Music:\n\nClick any track to stream instantly!`;
          attachedSongs = MOCK_SONGS.filter(s => s.artist.toLowerCase().includes('weeknd') || s.title.toLowerCase().includes('starboy') || s.title.toLowerCase().includes('blinding lights')).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(kendrick|kendrick lamar)\b/i.test(msg)) {
          intent = 'artist';
          replyText = `Here are Pulitzer-winning hip-hop anthems by 👑 **Kendrick Lamar** on Zhoosh Music:\n\nClick any track to stream!`;
          attachedSongs = MOCK_SONGS.filter(s => s.artist.toLowerCase().includes('kendrick') || s.title.toLowerCase().includes('humble') || s.title.toLowerCase().includes('not like us')).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(pritam|mohit chauhan|lucky ali|shankar mahadevan)\b/i.test(msg)) {
          intent = 'artist';
          replyText = `Here are acclaimed compositions celebrating India's finest musicians on Zhoosh Music:`;
          attachedSongs = MOCK_SONGS.filter(s => /pritam|mohit|lucky ali|shankar/i.test(s.artist)).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(travelling|traveling|travlling|travel|road trip|roadtrip|journey|vacation|wanderlust|trip|drive|driving)\b/i.test(msg)) {
          intent = 'travel';
          replyText = "Here are 🚗 **Road Trip & Wanderlust Anthems** tracks curated for your vibe on Zhoosh:\n\nClick any track below to launch playback! If you want more, say **'more'**.";
          const travelSongTitles = ['ilahi', 'safarnama', 'dil chahta hai', 'matargashti', 'as it was'];
          attachedSongs = MOCK_SONGS.filter(s => travelSongTitles.some(t => s.title.toLowerCase().includes(t))).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(college|hostel|campus|friends|friendship|missing college|miss my college|miss college|college days|university|old friends|dosti)\b/i.test(msg)) {
          intent = 'college';
          replyText = "Here are 🎓 **College Days & Eternal Friendship** tracks curated for your vibe on Zhoosh:\n\nClick any track below to launch playback! If you want more, say **'more'**.";
          const collegeSongTitles = ['yaaron', 'give me some sunshine', 'tera yaar hoon main', 'kabira', 'dil chahta hai'];
          attachedSongs = MOCK_SONGS.filter(s => collegeSongTitles.some(t => s.title.toLowerCase().includes(t))).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(exciting|thrilling|adrenaline|hype|hyped|pump|workout|gym|banger|high energy)\b/i.test(msg)) {
          intent = 'thrill';
          replyText = "Here are ⚡ **High-Energy Anthems & Workout Bangers** curated for your vibe on Zhoosh:\n\nClick any track below to launch playback!";
          const thrillSongTitles = ['humble', 'not like us', 'blinding lights', 'starboy', 'industry baby'];
          attachedSongs = MOCK_SONGS.filter(s => thrillSongTitles.some(t => s.title.toLowerCase().includes(t))).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(sad|tired|depressed|depress|exhausted|feeling low|feleing sad|heartbreak|crying|cry|melancholy|pain|comfort|lonely|tears)\b/i.test(msg)) {
          intent = 'sad';
          replyText = "Here are 🌧️ **Sad & Comforting Melodies** tracks curated for your vibe on Zhoosh:\n\nClick any track below to launch playback! If you want more, say **'more'**.";
          const sadSongTitles = ['tum hi ho', 'channa mereya', 'fix you', 'safarnama'];
          attachedSongs = MOCK_SONGS.filter(s => sadSongTitles.some(t => s.title.toLowerCase().includes(t))).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(happy|joyful|joyfyul|joy|pleasant|cheerful|good vibes|feel good|feel-good|uplifting|delightful)\b/i.test(msg)) {
          intent = 'happy';
          replyText = "Here are ☀️ **Happy, Joyful & Feel-Good Tracks** curated for your vibe on Zhoosh:\n\nClick any track below to launch playback!";
          const happySongTitles = ['ilahi', 'matargashti', 'as it was', 'espresso', 'dil chahta hai'];
          attachedSongs = MOCK_SONGS.filter(s => happySongTitles.some(t => s.title.toLowerCase().includes(t))).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(hip hop|hip-hop|hiphop|rap)\b/i.test(msg)) {
          intent = 'hiphop';
          replyText = "Here are top-streamed 🎵 **Hip-Hop & Rap** tracks on Zhoosh Music. Click any track to launch playback!";
          attachedSongs = MOCK_SONGS.filter(s => s.genre.toLowerCase().includes('hip-hop') || s.genre.toLowerCase().includes('rap')).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(romantic|romance|love|love songs)\b/i.test(msg)) {
          intent = 'romantic';
          replyText = "Here are soulful 💖 **Romantic Melodies** curated for you on Zhoosh. Click any track to listen!";
          attachedSongs = MOCK_SONGS.filter(s => s.genre.toLowerCase().includes('romantic') || s.genre.toLowerCase().includes('love')).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(lo-fi|lofi|chill|ambient|acoustic)\b/i.test(msg)) {
          intent = 'genre';
          replyText = "Here are soothing ☕ **Lo-Fi & Chillout** vibes on Zhoosh Music. Relax and stream:";
          attachedSongs = MOCK_SONGS.filter(s => s.genre.toLowerCase().includes('lo-fi') || s.genre.toLowerCase().includes('acoustic') || s.genre.toLowerCase().includes('chill')).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(rock|pop|soundtrack)\b/i.test(msg)) {
          intent = 'genre';
          const gName = msg.includes('rock') ? 'Rock' : msg.includes('pop') ? 'Pop' : 'Soundtrack';
          replyText = `Here are acclaimed 🎵 **${gName}** tracks matching your vibe on Zhoosh Music. Click any track to stream instantly!`;
          attachedSongs = MOCK_SONGS.filter(s => s.genre.toLowerCase().includes(gName.toLowerCase())).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else {
          intent = 'music';
          replyText = "Here are top trending tracks curated for your taste on Zhoosh Music:";
          attachedSongs = MOCK_SONGS.slice(0, 6);
        }
      } else {
        // ================= CINEMA MODE FALLBACK =================
        if (/\b(song|songs|track|tracks|music|singer|album|playlist)\b/i.test(msg)) {
          intent = 'mode_switch';
          replyText = `🎬 **You are currently in Cinema mode with ${agentName}!**\n\nTo discover music tracks, browse artist discographies, and stream lossless audio, please switch to **Music mode** using the toggle in the top bar 🎵.\n\nWould you like me to recommend a movie instead?`;
          attachedMovies = [];
          attachedSongs = [];
        } else if (/\b(what (kind of )?(movies?|films?|cinema) do i like|my taste|what do i like|my preferences|what is my movie taste|recommend based on my taste)\b/i.test(msg)) {
          intent = 'taste_profile';
          const liked = (likedTitles || []).filter(Boolean);
          if (liked.length > 0) {
            replyText = `🎬 **Your Cinematic Taste Profile**:\n\nBased on your watch history and favorites (**${liked.slice(0, 3).join(', ')}**), your taste leans toward compelling character arcs, intelligent world-building, and high emotional resonance.\n\nHere are standout recommendations tailored precisely to your cinematic DNA:`;
          } else {
            replyText = `🎬 **Your Cinematic Taste Profile**:\n\nYour viewing profile shows high affinity for acclaimed storytellers, mind-bending concepts, and deeply poignant human dramas. Here are our top consensus recommendations ready for you to stream:`;
          }
          attachedMovies = [...MOCK_MOVIES].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0)).slice(0, 6);
        } else if (/\b(christopher nolan|nolan)\b/i.test(msg)) {
          intent = 'director';
          replyText = "Here are the mind-bending cinematic masterworks of director 🎬 **Christopher Nolan** available on Zhoosh:";
          attachedMovies = MOCK_MOVIES.filter(m => (m.director || '').toLowerCase().includes('nolan') || /inception|interstellar|dark knight|oppenheimer|tenet/i.test(m.title)).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(quentin tarantino|tarantino)\b/i.test(msg)) {
          intent = 'director';
          replyText = "Here are stylized, sharp-witted cinematic milestones by director 🎬 **Quentin Tarantino** on Zhoosh:";
          attachedMovies = MOCK_MOVIES.filter(m => (m.director || '').toLowerCase().includes('tarantino') || /pulp fiction|django|kill bill|inglourious/i.test(m.title)).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(rajkumar hirani|hirani)\b/i.test(msg)) {
          intent = 'director';
          replyText = "Here are the heartwarming, socially conscious blockbusters of director 🎬 **Rajkumar Hirani** on Zhoosh:";
          attachedMovies = MOCK_MOVIES.filter(m => (m.director || '').toLowerCase().includes('hirani') || /3 idiots|pk|munna bhai|dangal/i.test(m.title)).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(shah rukh khan|srk|shahrukh)\b/i.test(msg)) {
          intent = 'actor';
          replyText = "Here are iconic, fan-favorite blockbusters starring the King of Bollywood, 🎬 **Shah Rukh Khan**, on Zhoosh:";
          attachedMovies = MOCK_MOVIES.filter(m => /main hoon na|swades|chak de|dilwale|om shanti om/i.test(m.title) || (m.overview || '').toLowerCase().includes('shah rukh')).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(leonardo dicaprio|dicaprio)\b/i.test(msg)) {
          intent = 'actor';
          replyText = "Here are tour-de-force performances starring 🎬 **Leonardo DiCaprio** on Zhoosh:";
          attachedMovies = MOCK_MOVIES.filter(m => /inception|titanic|wolf of wall street|shutter island|catch me if you can|departed/i.test(m.title) || (m.overview || '').toLowerCase().includes('dicaprio')).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(travelling|traveling|travlling|travel|road trip|roadtrip|journey|vacation|wanderlust|trip|drive|driving)\b/i.test(msg)) {
          intent = 'travel';
          replyText = "Here are 🚗 **Wanderlust & Travelling Journeys** films curated for you on Zhoosh:\n\nClick **Watch / View Movie** on any card below to launch playback! Say **'more'** for another batch.";
          const travelMovieTitles = ['zindagi na milegi dobara', 'yeh jawaani hai deewani', 'jab we met', 'dil chahta hai'];
          attachedMovies = MOCK_MOVIES.filter(m => travelMovieTitles.some(t => m.title.toLowerCase().includes(t))).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(college|hostel|campus|friends|friendship|missing college|miss my college|miss college|college days|university|old friends)\b/i.test(msg)) {
          intent = 'college';
          replyText = "Here are 🎓 **College Days & Lifelong Friendship** films curated for you on Zhoosh:\n\nClick **Watch / View Movie** on any card below to launch playback! Say **'more'** for another batch.";
          const collegeMovieTitles = ['3 idiots', 'chhichhore', 'dil chahta hai', 'yeh jawaani hai deewani'];
          attachedMovies = MOCK_MOVIES.filter(m => collegeMovieTitles.some(t => m.title.toLowerCase().includes(t))).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(exciting|thrilling|adrenaline|edge of my seat|edge of seat|mind-blowing|hype|hyped)\b/i.test(msg)) {
          intent = 'thrill';
          replyText = "Here are ⚡ **Exciting & High-Octane Thrillers** films curated for you on Zhoosh:\n\nClick **Watch / View Movie** on any card below to launch playback! Say **'more'** for another batch.";
          const thrillMovieTitles = ['oppenheimer', 'the dark knight', 'inception', 'fight club'];
          attachedMovies = MOCK_MOVIES.filter(m => thrillMovieTitles.some(t => m.title.toLowerCase().includes(t))).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(sad|tired|depressed|depress|exhausted|feeling low|feleing sad|heartbroken|crying|cry|tears|comfort|comforting|drained|melancholy)\b/i.test(msg)) {
          intent = 'sad';
          replyText = "Here are 🌧️ **Heartwarming Comfort & Poignant Dramas** films curated for you on Zhoosh:\n\nClick **Watch / View Movie** on any card below to launch playback! Say **'more'** for another batch.";
          const sadMovieTitles = ['main hoon na', 'forrest gump', 'the shawshank redemption', 'taare zameen par'];
          attachedMovies = MOCK_MOVIES.filter(m => sadMovieTitles.some(t => m.title.toLowerCase().includes(t))).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(happy|joyful|joyfyul|joy|pleasant|cheerful|uplifting|feel good|feel-good|delightful|sweet|romcom|romantic comedy)\b/i.test(msg)) {
          intent = 'happy';
          replyText = "Here are ☀️ **Joyful & Feel-Good Romantic Comedies** films curated for you on Zhoosh:\n\nClick **Watch / View Movie** on any card below to launch playback! Say **'more'** for another batch.";
          const happyMovieTitles = ['jab we met', 'yeh jawaani hai deewani', 'forrest gump'];
          attachedMovies = MOCK_MOVIES.filter(m => happyMovieTitles.some(t => m.title.toLowerCase().includes(t))).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(sci-fi|scifi|science fiction|space|time travel|interstellar)\b/i.test(msg)) {
          intent = 'scifi';
          replyText = "Here are mind-expanding 🚀 **Science Fiction & Cosmic Odyssey** films curated for you on Zhoosh:";
          attachedMovies = MOCK_MOVIES.filter(m => m.genres.some(g => /sci-fi|science fiction/i.test(g)) || /interstellar|inception|matrix|arrival|space/i.test(m.title)).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(action|superhero|marvel|batman)\b/i.test(msg)) {
          intent = 'action';
          replyText = "Here are high-octane 💥 **Action Masterpieces** curated for you on Zhoosh. Click any card to launch playback:";
          attachedMovies = MOCK_MOVIES.filter(m => m.genres.some(g => /action/i.test(g))).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(thriller|suspense|crime|mystery|noir)\b/i.test(msg)) {
          intent = 'thriller';
          replyText = "Here are edge-of-your-seat 🔍 **Psychological Thrillers & Mystery** films curated for you on Zhoosh:";
          attachedMovies = MOCK_MOVIES.filter(m => m.genres.some(g => /thriller|mystery|crime/i.test(g))).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(anime|animation|ghibli|miyazaki)\b/i.test(msg)) {
          intent = 'animation';
          replyText = "Here are visually stunning 🎨 **Anime & Animated Masterworks** curated for you on Zhoosh:";
          attachedMovies = MOCK_MOVIES.filter(m => m.genres.some(g => /animation/i.test(g)) || /spirited away|your name|spider-verse|totoro/i.test(m.title)).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(bollywood|hindi cinema|desi)\b/i.test(msg)) {
          intent = 'bollywood';
          replyText = "Here are iconic, critically acclaimed 🎬 **Bollywood Classics & Modern Masterpieces** on Zhoosh:";
          attachedMovies = MOCK_MOVIES.filter(m => (m.language || '').toLowerCase().includes('hindi') || /3 idiots|dangal|zindagi na milegi|yeh jawaani|jab we met|dil chahta hai/i.test(m.title)).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(romantic|romance|love|heartfelt)\b/i.test(msg)) {
          intent = 'romance';
          replyText = "Here are acclaimed 💖 **Romantic & Heartfelt** films curated for you on Zhoosh. Click **Watch / View Movie** on any card below to start streaming!";
          attachedMovies = MOCK_MOVIES.filter(m => m.genres.some(g => g.toLowerCase().includes('romance'))).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 5);
        } else if (/\bhorror\b/i.test(msg)) {
          intent = 'horror';
          replyText = "Here are top-rated 🎬 **Horror** movies curated for you on Zhoosh. Click **Watch / View Movie** on any card below to start streaming!";
          attachedMovies = MOCK_MOVIES.filter(m => m.genres.some(g => g.toLowerCase().includes('horror'))).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 5);
        } else if (/\bcomedy\b/i.test(msg)) {
          intent = 'comedy';
          replyText = "Here are acclaimed 🎬 **Comedy** movies to brighten your day on Zhoosh. Click any card below to launch playback!";
          attachedMovies = MOCK_MOVIES.filter(m => m.genres.some(g => g.toLowerCase().includes('comedy'))).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 5);
        } else {
          // Check if message references a specific movie title for "similar to X" or "movies like X"
          const movieMatch = MOCK_MOVIES.find(m => {
            const t = m.title.toLowerCase();
            return t.length > 3 && (msg.includes(`like ${t}`) || msg.includes(`similar to ${t}`) || msg.startsWith(t) || msg === t);
          }) || (msg.includes('inception') ? MOCK_MOVIES.find(m => m.title.toLowerCase() === 'inception') : null);

          if (movieMatch) {
            intent = 'similar';
            replyText = `If you love the brilliance of 🎬 **${movieMatch.title}**, here are exceptional films tailored with matching atmospheric tension and critical acclaim:`;
            attachedMovies = await this.fetchMovieRecommendations(movieMatch.id, 6, movieMatch);
          } else if (msg.includes('predict') || msg.includes('tomorrow') || msg.includes('yesterday')) {
            intent = 'predicted';
            replyText = "🔮 **Predictive Neural Cinema Match**:\n\nBased on your predictive viewing history and taste profile, here are the top predicted feature films ready for you to stream today:";
            attachedMovies = [...MOCK_MOVIES].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).slice(0, 6);
          } else {
            intent = 'recommendation';
            replyText = "Here are top-tier cinematic recommendations curated for your taste on Zhoosh:";
            attachedMovies = MOCK_MOVIES.slice(0, 6);
          }
        }
      }
    }

      if (mode === 'movies' && attachedMovies.length > 0 && onMovies) onMovies(attachedMovies);
      if (mode === 'music' && attachedSongs.length > 0 && onSongs) onSongs(attachedSongs);

      const words = replyText.split(' ');
      for (const word of words) {
        onToken(word + ' ');
        await delay(20);
      }
      onDone(intent);
    }
  }

  async identifyAudio(audioBlob: Blob): Promise<{
    found: boolean;
    message?: string;
    track?: Song & { share_url?: string };
    similar_songs?: Song[];
    matching_movies?: Movie[];
  }> {
    const makeFormData = () => {
      const fd = new FormData();
      fd.append('file', audioBlob, 'recording.webm');
      return fd;
    };

    try {
      const res = await fetch(`${this.baseUrl}/shazam/identify`, {
        method: 'POST',
        body: makeFormData(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Proxy identify attempt failed, trying direct URL...', err);
    }

    try {
      const directRes = await fetch(`${this.directUrl}/shazam/identify`, {
        method: 'POST',
        body: makeFormData(),
      });
      if (directRes.ok) {
        return await directRes.json();
      }
    } catch (err) {
      console.warn('Direct identify attempt failed:', err);
    }

    return {
      found: false,
      message: 'Could not connect to song identification service. Please check your backend connection and microphone.'
    };
  }
}

export const api = new ApiClient();

