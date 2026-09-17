export type AppMode = 'movies' | 'music';

export interface Movie {
  id: string | number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path?: string;
  release_date: string;
  vote_average: number;
  genres: string[];
  director?: string;
  cast?: string[];
  year?: number;
  runtime?: number;
  trailer_url?: string;
  language?: string;
  match_score?: number; // AI Agent Match %
  agent_rationale?: string; // AI Reason for Recommendation
}

export interface Song {
  id: string | number;
  title: string;
  artist: string;
  album: string;
  album_art: string;
  duration_sec: number;
  audio_url?: string;
  genre: string;
  language?: string;
  plays?: string;
  match_score?: number; // AI Agent Match %
  agent_rationale?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  mode: AppMode;
  items: Array<Movie | Song>;
  created_at: string;
  cover_art?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface VoiceSearchState {
  isOpen: boolean;
  isListening: boolean;
  transcript: string;
  isProcessing: boolean;
  resultQuery: string;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  intent?: string;
  movies?: Movie[];
  songs?: Song[];
}

export interface AgentProfile {
  name: string;
  avatarUrl: string;
  createdAt: string;
}

export interface SearchResult {
  query?: string;
  search_type?: 'title_match' | 'genre_match' | 'song_match' | 'artist_match' | 'romantic_match' | 'general';
  mode?: AppMode;
  primary_movie?: Movie | null;
  similar_movies?: Movie[];
  genre?: string | null;
  genre_top_movies?: Movie[];
  primary_song?: Song | null;
  artist_name?: string | null;
  artist_songs?: Song[];
  similar_songs?: Song[];
  similar_romantic_songs?: Song[];
  movies: Movie[];
  music: Song[];
}
