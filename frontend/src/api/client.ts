import { Movie, Song, Playlist, User, AppMode } from '@/types';
import { MOCK_MOVIES, MOCK_SONGS } from './mockData';
import { DEFAULT_AVATAR } from '@/utils/avatars';

// Simulated latency helper for smooth skeleton demonstration
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class ApiClient {
  private baseUrl = '/api';
  private directUrl = 'http://127.0.0.1:8005/api';

  private async request(path: string, options?: RequestInit): Promise<Response> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, options);
      if (res.ok) return res;
    } catch {
      // Vite proxy unreachable
    }

    try {
      const res = await fetch(`${this.directUrl}${path}`, options);
      if (res.ok) return res;
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

  async fetchMovieRecommendations(movieId: string | number, limit: number = 8): Promise<Movie[]> {
    try {
      const res = await this.request(`/movies/${movieId}/recommendations?limit=${limit}`);
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
        mode,
        primary_movie,
        similar_movies,
        genre: isThriller ? 'Thriller' : isRomanticQuery ? 'Romance' : null,
        genre_top_movies,
        primary_song,
        artist_name,
        artist_songs,
        similar_songs,
        similar_romantic_songs,
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
    onSongs?: (songs: Song[]) => void,
    mode: AppMode = 'movies',
    likedTitles?: string[],
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
      const msg = message.toLowerCase();
      let intent = 'conversational';
      let attachedMovies: Movie[] = [];
      let attachedSongs: Song[] = [];
      let replyText = '';

      if (mode === 'music') {
        // Music mode fallback
        if (/\b(movie|movies|film|films|cinema|director|actor)\b/i.test(msg)) {
          intent = 'mode_switch';
          replyText = `🎵 **You are currently in Music mode with ${agentName}!**\n\nTo explore movies, watch trailers, or check director filmographies, please switch to **Cinema mode** using the toggle in the top bar 🎬.`;
          attachedMovies = [];
          attachedSongs = [];
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
        } else if (/\b(exciting|thrilling|adrenaline|kendrick|kendric|rock|hype|hyped|pump|workout|gym|banger)\b/i.test(msg)) {
          intent = 'thrill';
          replyText = "Here are ⚡ **High-Energy Rock & Kendrick Lamar Anthems** tracks curated for your vibe on Zhoosh:\n\nClick any track below to launch playback! If you want more, say **'more'**.";
          const thrillSongTitles = ['humble', 'not like us', 'blinding lights', 'starboy'];
          attachedSongs = MOCK_SONGS.filter(s => thrillSongTitles.some(t => s.title.toLowerCase().includes(t))).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(sad|tired|depressed|depress|exhausted|feeling low|feleing sad|heartbreak|crying|cry|melancholy|pain|comfort|lonely|tears)\b/i.test(msg)) {
          intent = 'sad';
          replyText = "Here are 🌧️ **Sad & Comforting Melodies** tracks curated for your vibe on Zhoosh:\n\nClick any track below to launch playback! If you want more, say **'more'**.";
          const sadSongTitles = ['tum hi ho', 'channa mereya', 'fix you', 'safarnama'];
          attachedSongs = MOCK_SONGS.filter(s => sadSongTitles.some(t => s.title.toLowerCase().includes(t))).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(happy|joyful|joyfyul|joy|pleasant|cheerful|good vibes|feel good|feel-good|uplifting|delightful|romantic|love|love songs)\b/i.test(msg)) {
          intent = 'happy';
          replyText = "Here are ☀️ **Happy, Joyful & Romantic Love Songs** tracks curated for your vibe on Zhoosh:\n\nClick any track below to launch playback! If you want more, say **'more'**.";
          const happySongTitles = ['ilahi', 'matargashti', 'as it was', 'espresso', 'dil chahta hai'];
          attachedSongs = MOCK_SONGS.filter(s => happySongTitles.some(t => s.title.toLowerCase().includes(t))).slice(0, 6);
          if (attachedSongs.length === 0) attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(hip hop|hip-hop|hiphop|rap)\b/i.test(msg)) {
          intent = 'hiphop';
          replyText = "Here are top-streamed 🎵 **Hip-Hop** tracks on Zhoosh Music. Click any track to launch playback!";
          attachedSongs = MOCK_SONGS.filter(s => s.genre.toLowerCase().includes('hip-hop') || s.genre.toLowerCase().includes('pop')).slice(0, 6);
        } else if (/\b(romantic|romance|love)\b/i.test(msg)) {
          intent = 'romantic';
          replyText = "Here are soulful 🎵 **Romantic** melodies curated for you on Zhoosh. Click any track to listen!";
          attachedSongs = MOCK_SONGS.filter(s => s.genre.toLowerCase().includes('romantic') || s.genre.toLowerCase().includes('friendship')).slice(0, 6);
        } else if (/\b(rock|pop|soundtrack|lo-fi|chill)\b/i.test(msg)) {
          intent = 'genre';
          replyText = "Here are top-streamed tracks matching your vibe on Zhoosh Music. Click any track to stream instantly!";
          attachedSongs = MOCK_SONGS.slice(0, 6);
        } else if (/\b(hi|hello|hey|who are you|help)\b/i.test(msg)) {
          intent = 'conversational';
          replyText = `Hello! I'm **${agentName}**, your personal AI Music & Audio Intelligence assistant on Zhoosh.\n\nAsk me for song recommendations by genre (like **Hip-Hop**, **Romantic**, or **Rock**), tracks by artists like **Arijit Singh** or **Coldplay**, or trending songs!`;
        } else {
          intent = 'music';
          replyText = "Here are top trending tracks curated for your taste on Zhoosh Music:";
          attachedSongs = MOCK_SONGS.slice(0, 6);
        }
      } else {
        // Cinema mode fallback (Strictly Movies, ZERO Songs)
        if (/\b(song|songs|track|tracks|music|singer|album|playlist)\b/i.test(msg)) {
          intent = 'mode_switch';
          replyText = `🎬 **You are currently in Cinema mode with ${agentName}!**\n\nTo discover music tracks, browse artist discographies, and stream lossless audio, please switch to **Music mode** using the toggle in the top bar 🎵.\n\nWould you like me to recommend a movie instead?`;
          attachedMovies = [];
          attachedSongs = [];
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
        } else if (/\b(exciting|thrilling|thriller|adrenaline|edge of my seat|edge of seat|mind-blowing|action packed|intense|hype|hyped)\b/i.test(msg)) {
          intent = 'thrill';
          replyText = "Here are ⚡ **Exciting & High-Octane Thrillers** films curated for you on Zhoosh:\n\nClick **Watch / View Movie** on any card below to launch playback! Say **'more'** for another batch.";
          const thrillMovieTitles = ['oppenheimer', 'the dark knight', 'inception', 'fight club'];
          attachedMovies = MOCK_MOVIES.filter(m => thrillMovieTitles.some(t => m.title.toLowerCase().includes(t))).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(sad|tired|depressed|depress|exhausted|feeling low|feleing sad|heartbroken|crying|cry|tears|comfort|comforting|drained|melancholy)\b/i.test(msg)) {
          intent = 'sad';
          replyText = "Here are 🌧️ **Heartwarming Comfort & Poignant Dramas** films curated for you on Zhoosh:\n\nClick **Watch / View Movie** on any card below to launch playback! Say **'more'** for another batch.";
          const sadMovieTitles = ['main hoon na', 'forrest gump', 'the shawshank redemption'];
          attachedMovies = MOCK_MOVIES.filter(m => sadMovieTitles.some(t => m.title.toLowerCase().includes(t))).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(happy|joyful|joyfyul|joy|pleasant|cheerful|uplifting|feel good|feel-good|delightful|sweet|romcom|romantic comedy)\b/i.test(msg)) {
          intent = 'happy';
          replyText = "Here are ☀️ **Joyful & Feel-Good Romantic Comedies** films curated for you on Zhoosh:\n\nClick **Watch / View Movie** on any card below to launch playback! Say **'more'** for another batch.";
          const happyMovieTitles = ['jab we met', 'yeh jawaani hai deewani', 'forrest gump'];
          attachedMovies = MOCK_MOVIES.filter(m => happyMovieTitles.some(t => m.title.toLowerCase().includes(t))).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 6);
        } else if (/\b(romantic|romance|love|heartfelt)\b/i.test(msg)) {
          intent = 'romance';
          replyText = "Here are acclaimed 💖 **Romantic & Heartfelt** films curated for you on Zhoosh. Click **Watch / View Movie** on any card below to start streaming!";
          attachedMovies = MOCK_MOVIES.filter(m => m.genres.some(g => g.toLowerCase().includes('romance') || g.toLowerCase().includes('drama'))).slice(0, 6);
          if (attachedMovies.length === 0) attachedMovies = MOCK_MOVIES.slice(0, 5);
        } else if (msg.includes('horror')) {
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
        } else if (/\b(hi|hello|hey|who are you|what is your name|help)\b/i.test(msg)) {
          intent = 'conversational';
          replyText = `Hello! I'm **${agentName}**, your personal cinema and storytelling intelligence assistant on Zhoosh.\n\nAsk me for movie recommendations by genre (like **Romance**, **Horror**, or **Comedy**), similar titles to **Inception**, or movies based on what was predicted for you!`;
        } else {
          intent = 'recommendation';
          replyText = "Here are top-tier cinematic recommendations curated for your taste on Zhoosh:";
          attachedMovies = MOCK_MOVIES.slice(0, 6);
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
}

export const api = new ApiClient();

