from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import json
import time
import asyncio
import os
import re
import random

from backend.app.recommender import engine

router = APIRouter(prefix="/agent", tags=["Agent"])

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class ConversationMessage(BaseModel):
    role: str  # 'user' | 'agent'
    content: str

class AgentChatRequest(BaseModel):
    user_id: str = "u-101"
    agent_name: str = "Nova"
    message: str
    mode: str = "movies"
    history: List[ConversationMessage] = []

class AgentProfileRequest(BaseModel):
    user_id: str
    agent_name: str
    avatar_url: Optional[str] = "/agent-avatar.jpg"

# ---------------------------------------------------------------------------
# Intelligence & Entity Extraction
# ---------------------------------------------------------------------------

KNOWN_GENRES = {
    'thriller': 'Thriller',
    'action': 'Action',
    'sci-fi': 'Science Fiction',
    'scifi': 'Science Fiction',
    'science fiction': 'Science Fiction',
    'comedy': 'Comedy',
    'romance': 'Romance',
    'romantic': 'Romance',
    'horror': 'Horror',
    'drama': 'Drama',
    'adventure': 'Adventure',
    'crime': 'Crime',
    'animation': 'Animation',
    'animated': 'Animation',
    'mystery': 'Mystery',
    'fantasy': 'Fantasy',
    'documentary': 'Documentary',
    'western': 'Western',
    'war': 'War'
}

COMMON_STOPWORDS = {
    'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'movie', 'movies', 'film', 'films', 'show', 'shows', 'watch', 'watching',
    'who', 'what', 'where', 'when', 'why', 'how', 'is', 'are', 'was', 'were',
    'tell', 'me', 'about', 'recommend', 'suggest', 'find', 'like', 'similar',
    'directed', 'starring', 'actor', 'director', 'available', 'can', 'you'
}

def find_movie_in_query(query: str):
    if engine.movies_df is None or engine.movies_df.empty:
        return None
        
    q = query.strip()
    # 1. Check explicitly quoted strings
    quoted = re.findall(r'["\'](.*?)["\']', q)
    for q_title in quoted:
        matches = engine.movies_df[engine.movies_df['title'].str.lower() == q_title.lower().strip()]
        if not matches.empty:
            return matches.sort_values(by='vote_count', ascending=False).iloc[0]

    # 2. Check title boundary matches against popular titles (highest vote counts first)
    top_df = engine.movies_df.sort_values(by='vote_count', ascending=False)
    q_lower = q.lower()
    
    # Priority check for titles with length > 2
    for _, row in top_df.head(3000).iterrows():
        title = str(row['title']).strip()
        t_lower = title.lower()
        if t_lower in COMMON_STOPWORDS or len(t_lower) <= 2:
            continue
            
        pattern = r'(?:\b|^)' + re.escape(t_lower) + r'(?:\b|$|[?!.,])'
        if re.search(pattern, q_lower):
            return row
            
    return None

KNOWN_MUSIC_GENRES = {
    'hip hop': 'Hip-Hop',
    'hip-hop': 'Hip-Hop',
    'hiphop': 'Hip-Hop',
    'rap': 'Hip-Hop',
    'romantic': 'Romantic',
    'romance': 'Romantic',
    'love': 'Romantic',
    'rock': 'Rock',
    'pop': 'Pop',
    'soundtrack': 'Soundtrack',
    'soundtracks': 'Soundtrack',
    'film score': 'Soundtrack',
    'lo-fi': 'Lo-Fi',
    'lofi': 'Lo-Fi',
    'chill': 'Lo-Fi',
    'electronic': 'Electronic',
    'dance': 'Electronic',
    'edm': 'Electronic',
    'indie': 'Indie',
    'acoustic': 'Acoustic'
}

def detect_genre_in_query(query: str) -> Optional[str]:
    q_lower = query.lower()
    for kw, genre_name in KNOWN_GENRES.items():
        pattern = r'(?:\b|^)' + re.escape(kw) + r'(?:\b|$|[?!.,])'
        if re.search(pattern, q_lower):
            return genre_name
    return None

def detect_music_genre_in_query(query: str) -> Optional[str]:
    q_lower = query.lower()
    for kw, genre_name in KNOWN_MUSIC_GENRES.items():
        pattern = r'(?:\b|^)' + re.escape(kw) + r'(?:\b|$|[?!.,])'
        if re.search(pattern, q_lower):
            return genre_name
    return None

def find_track_or_artist_in_query(query: str):
    if engine.music_df is None or engine.music_df.empty:
        return None, None
        
    q_lower = query.lower().strip()
    q_cleaned = re.sub(r'\b(songs|song|tracks|track|music|audio|hits|playlist|all|by|from|listen|play|sing)\b', '', q_lower).strip()
    
    # 1. Check artists in music catalog
    for _, row in engine.music_df.iterrows():
        artists_str = str(row.get('artists', '')).strip()
        for artist in artists_str.split(','):
            artist = artist.strip()
            a_lower = artist.lower()
            if len(a_lower) <= 2:
                continue
                
            pattern = r'(?:\b|^)' + re.escape(a_lower) + r'(?:\b|$|[?!.,])'
            if re.search(pattern, q_lower) or (q_cleaned and re.search(pattern, q_cleaned)):
                return "artist", artist
                
            # Check distinctive tokens (e.g. 'arijit', 'rahman', 'weeknd', 'sheeran', 'coldplay', 'drake', 'kendrick', 'swift', 'queen', 'zimmer')
            parts = [p for p in re.split(r'[\s.]+', a_lower) if len(p) >= 4 and p not in COMMON_STOPWORDS]
            for p in parts:
                p_pattern = r'(?:\b|^)' + re.escape(p) + r'(?:\b|$|[?!.,])'
                if re.search(p_pattern, q_lower) or (q_cleaned and re.search(p_pattern, q_cleaned)):
                    return "artist", artist
                    
    # 2. Check track names in music catalog
    for _, row in engine.music_df.iterrows():
        track_name = str(row.get('track_name', '')).strip()
        t_lower = track_name.lower()
        if len(t_lower) > 2 and t_lower not in COMMON_STOPWORDS:
            pattern = r'(?:\b|^)' + re.escape(t_lower) + r'(?:\b|$|[?!.,])'
            if re.search(pattern, q_lower) or (q_cleaned and re.search(pattern, q_cleaned)):
                return "track", row
                
    return None, None

def detect_music_language_in_query(query: str):
    """Detect language / regional music requests like 'hindi songs', 'punjabi songs', 'bollywood songs'."""
    q_lower = query.lower()
    if any(k in q_lower for k in ['hindi', 'bollywood', 'desi', 'indian']):
        hindi_kw = ['arijit', 'pritam', 'mithoon', 'rahman', 'mohit chauhan', 'sukhwinder', 'chinmayi', 'javed ali', 'antara mitra', 'shreya ghoshal', 'atif aslam', 'anuv jain', 'king', 'sachin-jigar', 'shankar mahadevan', 'jasleen royal']
        if engine.music_df is not None:
            df = engine.music_df[engine.music_df['artists'].str.lower().apply(lambda a: any(k in a for k in hindi_kw))]
            formatted = [engine._format_song_row(row, match_pct=98, rationale=f"Bollywood & Hindi chartbuster: '{row['track_name']}' by {row['artists']}.") for _, row in df.iterrows()]
            return "🇮🇳 **Bollywood & Hindi**", formatted
    elif any(k in q_lower for k in ['punjabi', 'bhangra']):
        if engine.music_df is not None:
            punjabi_kw = ['diljit', 'ap dhillon', 'gurinder gill', 'sukhwinder', 'shinda kahlon']
            df = engine.music_df[engine.music_df['artists'].str.lower().apply(lambda a: any(k in a for k in punjabi_kw))]
            if not df.empty:
                formatted = [engine._format_song_row(row, match_pct=98, rationale=f"Upbeat Punjabi / Desi track: '{row['track_name']}' by {row['artists']}.") for _, row in df.iterrows()]
                return "🔥 **Punjabi & Desi**", formatted
    elif any(k in q_lower for k in ['english', 'hollywood', 'western', 'international', 'global']):
        if engine.music_df is not None:
            western_kw = ['weeknd', 'sheeran', 'styles', 'queen', 'swift', 'gaga', 'mars', 'coldplay', 'drake', 'kendrick', 'carpenter', 'dragons', 'lipa']
            df = engine.music_df[engine.music_df['artists'].str.lower().apply(lambda a: any(k in a for k in western_kw))]
            formatted = [engine._format_song_row(row, match_pct=97, rationale=f"Global hit single: '{row['track_name']}' by {row['artists']}.") for _, row in df.iterrows()]
            return "🌍 **Global Hits**", formatted
    return None, None

def detect_music_mood_in_query(query: str):
    """Detect mood requests like 'sad songs', 'party songs', 'workout tracks', 'romantic songs'."""
    q_lower = query.lower()
    if any(k in q_lower for k in ['sad', 'emotional', 'heartbreak', 'crying', 'cry', 'depressed', 'melancholy', 'pain', 'breakup', 'lonely', 'tears']):
        sad_priority = ['tum hi ho', 'channa mereya', 'fix you', 'the scientist', 'all of me', 'darmiyaan', 'beautiful things', 'until i found you', 'photograph', 'numb', 'in the end']
        if engine.music_df is not None:
            selected_rows = []
            seen_ids = set()
            # 1. Add priority emotional ballads in order
            for s_name in sad_priority:
                m = engine.music_df[engine.music_df['track_name'].str.lower() == s_name]
                for _, r in m.iterrows():
                    if r['track_id'] not in seen_ids:
                        selected_rows.append(r)
                        seen_ids.add(r['track_id'])
            # 2. Supplement with lowest valence tracks
            low_valence = engine.music_df[
                (~engine.music_df['track_id'].isin(seen_ids)) &
                (engine.music_df['valence'] <= 0.35)
            ].sort_values(by='valence', ascending=True)
            for _, r in low_valence.iterrows():
                selected_rows.append(r)

            formatted = [engine._format_song_row(row, match_pct=98, rationale=f"Soulful melancholic resonance: '{row['track_name']}' by {row['artists']}.") for row in selected_rows[:8]]
            return "🌧️ **Sad & Melancholic**", formatted
    elif any(k in q_lower for k in ['romantic', 'romance', 'love', 'crush', 'valentine', 'couple', 'ballad']):
        romantic_songs = engine.get_romantic_recommendations(limit=8)
        if romantic_songs:
            return "💖 **Romantic & Heartfelt**", romantic_songs
    elif any(k in q_lower for k in ['party', 'dance', 'club', 'banger', 'celebrate', 'upbeat']):
        party_titles = ['humble.', 'sicko mode', 'blinding lights', 'starboy', 'shape of you', 'hotline bling', 'die with a smile']
        if engine.music_df is not None:
            df = engine.music_df[engine.music_df['track_name'].str.lower().apply(lambda t: any(s in t for s in party_titles)) | (engine.music_df['danceability'] >= 0.70)]
            formatted = [engine._format_song_row(row, match_pct=99, rationale=f"High-octane party anthem: '{row['track_name']}' by {row['artists']}.") for _, row in df.iterrows()]
            return "⚡ **Party & Dance**", formatted
    elif any(k in q_lower for k in ['workout', 'gym', 'pump', 'training', 'exercise', 'lifting', 'fitness', 'hype', 'energy']):
        workout_titles = ['humble.', 'sicko mode', 'in the end', 'numb', 'starboy', 'god\'s plan', 'radioactive', 'believer']
        if engine.music_df is not None:
            df = engine.music_df[engine.music_df['track_name'].str.lower().apply(lambda t: any(s in t for s in workout_titles)) | (engine.music_df['energy'] >= 0.75)]
            formatted = [engine._format_song_row(row, match_pct=99, rationale=f"Max intensity training track: '{row['track_name']}' by {row['artists']}.") for _, row in df.iterrows()]
            return "🔥 **Workout & Gym**", formatted
    elif any(k in q_lower for k in ['chill', 'relax', 'calm', 'study', 'sleep', 'soothing', 'peaceful', 'mellow', 'zen']):
        lofi_tracks = engine.get_music(genre='lo-fi', limit=8)
        if lofi_tracks:
            return "☕ **Chill & Lo-Fi**", lofi_tracks
    return None, None

def detect_movie_language_in_query(query: str):
    """Detect cinema language requests like 'hindi movies', 'bollywood movies', 'korean movies'."""
    q_lower = query.lower()
    if engine.movies_df is None or engine.movies_df.empty:
        return None, None
    if any(k in q_lower for k in ['hindi', 'bollywood', 'indian']):
        matches = engine.movies_df[engine.movies_df['language'].str.lower().isin(['hi', 'hindi']) | engine.movies_df['overview'].str.lower().str.contains('bollywood', na=False)]
        if not matches.empty:
            top_movies = matches.sort_values(by='vote_count', ascending=False).head(6)
            return "🇮🇳 **Bollywood & Hindi Cinema**", [engine._format_movie_row(r) for _, r in top_movies.iterrows()]
    elif any(k in q_lower for k in ['korean', 'kdrama', 'k-drama']):
        matches = engine.movies_df[engine.movies_df['language'].str.lower().isin(['ko', 'korean'])]
        if not matches.empty:
            top_movies = matches.sort_values(by='vote_count', ascending=False).head(6)
            return "🇰🇷 **Korean Cinema**", [engine._format_movie_row(r) for _, r in top_movies.iterrows()]
    elif any(k in q_lower for k in ['anime', 'japanese', 'ghibli']):
        matches = engine.movies_df[engine.movies_df['genres_str'].str.lower().str.contains('animation', na=False) & engine.movies_df['language'].str.lower().isin(['ja', 'japanese'])]
        if not matches.empty:
            top_movies = matches.sort_values(by='vote_count', ascending=False).head(6)
            return "🇯🇵 **Japanese Anime Masterpieces**", [engine._format_movie_row(r) for _, r in top_movies.iterrows()]
    return None, None

def detect_movie_mood_in_query(query: str):
    """Detect movie mood requests like 'sad movies', 'mind bending movies', 'scary movies'."""
    q_lower = query.lower()
    if engine.movies_df is None or engine.movies_df.empty:
        return None, None
    if any(k in q_lower for k in ['mind-bending', 'mind bending', 'twist', 'psychological', 'puzzle', 'confusing', 'complex']):
        mb_titles = ['inception', 'interstellar', 'shutter island', 'the prestige', 'fight club', 'memento', 'matrix', 'arrival']
        matches = engine.movies_df[engine.movies_df['title'].str.lower().apply(lambda t: any(m in t for m in mb_titles))]
        if not matches.empty:
            top_m = matches.sort_values(by='vote_count', ascending=False).head(6)
            return "🧠 **Mind-Bending & Psychological**", [engine._format_movie_row(r) for _, r in top_m.iterrows()]
    elif any(k in q_lower for k in ['sad', 'emotional', 'crying', 'tearjerker', 'heartbreaking', 'melancholic']):
        matches = engine.movies_df[engine.movies_df['genres_str'].str.lower().str.contains('drama', na=False) & (engine.movies_df['vote_average'].astype(float) >= 8.2)]
        if not matches.empty:
            top_m = matches.sort_values(by='vote_count', ascending=False).head(6)
            return "🌧️ **Emotional & Poignant Dramas**", [engine._format_movie_row(r) for _, r in top_m.iterrows()]
    elif any(k in q_lower for k in ['scary', 'spooky', 'frightening', 'creepy']):
        matches = engine.movies_df[engine.movies_df['genres_str'].str.lower().str.contains('horror', na=False)]
        if not matches.empty:
            top_m = matches.sort_values(by='vote_count', ascending=False).head(6)
            return "👻 **Terrifying Horror**", [engine._format_movie_row(r) for _, r in top_m.iterrows()]
    elif any(k in q_lower for k in ['funny', 'hilarious', 'laugh']):
        matches = engine.movies_df[engine.movies_df['genres_str'].str.lower().str.contains('comedy', na=False)]
        if not matches.empty:
            top_m = matches.sort_values(by='vote_count', ascending=False).head(6)
            return "😂 **Acclaimed Comedies**", [engine._format_movie_row(r) for _, r in top_m.iterrows()]
    elif any(k in q_lower for k in ['inspiring', 'inspirational', 'motivational']):
        matches = engine.movies_df[engine.movies_df['genres_str'].str.lower().str.contains('drama', na=False) & (engine.movies_df['vote_count'].astype(float) >= 10000)]
        if not matches.empty:
            top_m = matches.sort_values(by='vote_average', ascending=False).head(6)
            return "✨ **Inspiring & Uplifting Stories**", [engine._format_movie_row(r) for _, r in top_m.iterrows()]
    return None, None

def detect_person_in_query(query: str):
    """Detect if user is asking for director or actor filmography."""
    if engine.movies_df is None or engine.movies_df.empty:
        return None, None
        
    q_lower = query.lower()
    
    # Common famous directors
    DIRECTORS = [
        "Christopher Nolan", "Quentin Tarantino", "Steven Spielberg", "Martin Scorsese",
        "Denis Villeneuve", "David Fincher", "James Cameron", "Ridley Scott",
        "Stanley Kubrick", "Alfred Hitchcock", "Guillermo del Toro", "Wes Anderson",
        "Hayao Miyazaki", "Bong Joon-ho", "Greta Gerwig", "Peter Jackson"
    ]
    for d in DIRECTORS:
        if d.lower() in q_lower:
            return "director", d
            
    # Common famous actors
    ACTORS = [
        "Leonardo DiCaprio", "Brad Pitt", "Tom Cruise", "Christian Bale",
        "Robert De Niro", "Al Pacino", "Matthew McConaughey", "Morgan Freeman",
        "Keanu Reeves", "Tom Hanks", "Cillian Murphy", "Joaquin Phoenix",
        "Ryan Gosling", "Emma Stone", "Scarlett Johansson", "Anne Hathaway"
    ]
    for a in ACTORS:
        if a.lower() in q_lower:
            return "actor", a
            
    return None, None

# ---------------------------------------------------------------------------
# Intelligent Grounded Response Generator
# ---------------------------------------------------------------------------

def generate_grounded_response(message: str, agent_name: str, mode: str = "movies") -> tuple[str, list, list]:
    msg_lower = message.lower().strip()
    movies_res = []
    songs_res = []
    
    # ── 1. Determine User Intent: Music vs Cinema ──
    is_explicit_movie = any(w in msg_lower for w in ["movie", "movies", "film", "films", "cinema", "directed by", "director", "actor", "actress", "box office", "theatre"])
    is_explicit_music = any(w in msg_lower for w in ["song", "songs", "track", "tracks", "music", "singer", "singers", "composer", "album", "audio", "soundtrack", "soundtracks", "playlist", "listen", "listen to", "play"])

    # Check artist/song match early
    early_entity_type, early_entity_val = find_track_or_artist_in_query(message)
    if early_entity_type == "artist" or early_entity_type == "track":
        is_explicit_music = True

    is_music_intent = (mode == "music" and not is_explicit_movie) or (is_explicit_music and not is_explicit_movie)

    # =========================================================================
    # A. MUSIC INTENT INTELLIGENCE
    # =========================================================================
    if is_music_intent:
        # 1. Greetings
        if re.search(r'\b(hello|hi|hey|who are you|what is your name|your name|what\'s your name|help|who r u)\b', msg_lower):
            return (
                f"Hello! I am **{agent_name}**, your dedicated AI Music & Audio Intelligence guide on Zhoosh.\n\n"
                f"I have real-time access to our entire catalog of tracks, artists, genres, and audio features (tempo, energy, acousticness, and valence). Here is what you can ask me:\n"
                f"• _\"Arijit Singh songs\"_ or _\"Coldplay tracks\"_\n"
                f"• _\"Hindi songs\"_ or _\"Punjabi music\"_\n"
                f"• _\"Sad songs for when you're feeling down\"_\n"
                f"• _\"High-energy gym tracks\"_ or _\"Romantic melodies\"_\n"
                f"• _\"Suggest songs like Kesariya or Starboy\"_\n\n"
                f"What vibe or sound are you in the mood for today?",
                [],
                []
            )

        # 2. Check for Specific Artist
        if early_entity_type == "artist":
            songs_res = engine.get_songs_by_artist(early_entity_val, limit=6)
            if songs_res:
                return (
                    f"Here are top-streamed tracks by 🎤 **{early_entity_val}** available on Zhoosh:\n\n"
                    f"Click any track to stream instantly in lossless Hi-Fi audio!",
                    [],
                    songs_res
                )

        # 3. Check for Language / Regional Music (Hindi, Punjabi, Global)
        lang_title, lang_songs = detect_music_language_in_query(message)
        if lang_songs:
            return (
                f"Here are top {lang_title} tracks curated for you on Zhoosh:\n\n"
                f"Click any track below to launch instant playback!",
                [],
                lang_songs[:6]
            )

        # 4. Check for Mood Music (Sad, Romantic, Party, Workout, Chill)
        mood_title, mood_songs = detect_music_mood_in_query(message)
        if mood_songs:
            return (
                f"Here are {mood_title} tracks curated for your vibe on Zhoosh:\n\n"
                f"Click any track below to launch playback!",
                [],
                mood_songs[:6]
            )

        # 5. Check for Specific Music Genre (Hip-Hop, Rock, Pop, Lo-Fi, etc.)
        music_genre = detect_music_genre_in_query(message)
        if music_genre:
            if music_genre == 'Romantic':
                songs_res = engine.get_romantic_recommendations(limit=6)
            else:
                songs_res = engine.get_music(genre=music_genre, limit=6)
                
            if songs_res:
                return (
                    f"Here are top-streamed 🎵 **{music_genre}** tracks curated for you on Zhoosh:\n\n"
                    f"Click any track to launch lossless Hi-Fi playback!",
                    [],
                    songs_res
                )

        # 6. Check for Specific Track Title
        if early_entity_type == "track":
            track_row = early_entity_val
            track_id = str(track_row['track_id'])
            track_title = str(track_row['track_name'])
            artist = str(track_row['artists'])
            recs = engine.recommend_music_by_audio_features(track_id, top_n=6)
            primary = engine._format_song_row(track_row, match_pct=99, rationale=f"Track match: '{track_title}' by {artist}.")
            all_songs = [primary] + [r for r in recs if r['id'] != track_id][:5]
            return (
                f"If you enjoy 🎵 **{track_title}** by {artist}, here are similar tracks with matching acoustic vibes and harmonic energy:\n\n"
                f"Click any track to listen!",
                [],
                all_songs
            )

        # 7. Check for Trending / Top Songs
        if any(w in msg_lower for w in ["trending", "top", "popular", "best songs", "best tracks", "what should i listen to", "recommend something"]):
            trending = engine.get_music(limit=6)
            if trending:
                return (
                    f"Here are the top trending tracks right now on Zhoosh Music:\n\n"
                    f"Click on any track to start instant playback with Hi-Fi audio!",
                    [],
                    trending
                )

        # 8. Search fallback for music
        search_res = engine.search_all(message, mode='music')
        matched_music = search_res.get('artist_songs') or search_res.get('similar_songs') or search_res.get('similar_romantic_songs') or search_res.get('music', [])
        if matched_music:
            return (
                f"Based on \"{message}\", here are matching tracks in our music catalog:\n\n"
                f"Click any track below to begin streaming!",
                [],
                matched_music[:6]
            )

        # 9. Music Fallback
        return (
            f"I'm here to help you navigate Zhoosh's music catalog!\n\n"
            f"You can ask me for songs by artist (like **Arijit Singh** or **Coldplay**), "
            f"genres (like **Hip-Hop**, **Rock**, **Romantic**, or **Lo-Fi**), "
            f"or specific vibes like **Sad songs**, **Gym tracks**, or **Bollywood hits**.",
            [],
            []
        )

    # =========================================================================
    # B. CINEMA INTENT INTELLIGENCE
    # =========================================================================
    # 1. Check for predicted / temporal queries
    if any(w in msg_lower for w in ["predict", "predicted", "forecast", "tomorrow", "yesterday"]):
        trending = engine.get_movies(limit=6) if engine else []
        movies_res = trending
        return (
            f"🔮 **Predictive Cinema Intelligence**:\n\n"
            f"Based on our predictive neural engine and your calibrated viewing preferences, here are the top predicted feature films lined up for you:\n\n"
            f"Feel free to click **Watch / View Movie** on any card below to launch full 4K streaming!",
            movies_res,
            []
        )

    # 2. Check for specific movie match
    movie = find_movie_in_query(message)
    if movie is not None:
        title = str(movie['title'])
        director = str(movie.get('director', 'Acclaimed Director'))
        cast = str(movie.get('cast', 'Star-studded ensemble'))
        year = str(movie.get('year', 2020))
        overview = str(movie.get('overview', 'A cinematic masterpiece.'))
        vote_avg = float(movie.get('vote_average', 8.0))
        genres = str(movie.get('genres_str', movie.get('genres', 'Drama, Thriller')))
        
        # Similar / Recommendation Question
        if any(w in msg_lower for w in ["similar", "like", "recommend", "suggest", "more like"]):
            recs = engine.recommend_movies_for_title(title, top_n=6)
            movies_res = recs or []
            return (
                f"If you loved 🎬 **{title}** ({year}), here are exceptional films with matching atmosphere, narrative depth, and critical acclaim:\n\n"
                f"You can click on any card below to stream directly in 4K Ultra HD on Zhoosh!",
                movies_res,
                []
            )
                
        # Director Question
        if any(w in msg_lower for w in ["who directed", "director of", "director", "who made"]):
            formatted_m = engine._format_movie_row(movie) if hasattr(engine, '_format_movie_row') else movie
            return (
                f"🎬 **{title}** ({year}) was directed by **{director}**.\n\n"
                f"• **Starring**: {cast}\n"
                f"• **Genres**: {genres}\n"
                f"• **Audience Consensus**: ★ {vote_avg:.1f} / 10 (Zmdb)\n\n"
                f"📖 **Storyline**:\n{overview}",
                [formatted_m],
                []
            )
            
        # Cast / Actor Question
        if any(w in msg_lower for w in ["who is in", "cast of", "starring", "actor", "actors in", "who acted"]):
            formatted_m = engine._format_movie_row(movie) if hasattr(engine, '_format_movie_row') else movie
            return (
                f"🎬 **{title}** ({year}) features this star-studded cast:\n\n"
                f"• **Starring**: **{cast}**\n"
                f"• **Directed by**: {director}\n"
                f"• **Genres**: {genres}\n"
                f"• **Rating**: ★ {vote_avg:.1f} / 10",
                [formatted_m],
                []
            )
            
        # General Summary / Details for the Movie
        formatted_m = engine._format_movie_row(movie) if hasattr(engine, '_format_movie_row') else movie
        return (
            f"🎬 **{title}** ({year}) — Directed by {director}\n\n"
            f"★ {vote_avg:.1f} / 10 · {genres}\n\n"
            f"📖 **Synopsis**:\n{overview}",
            [formatted_m],
            []
        )

    # 3. Check for Director / Actor Filmography Query
    person_type, person_name = detect_person_in_query(message)
    if person_type == "director" and engine.movies_df is not None:
        matched = engine.movies_df[engine.movies_df['director'].str.lower().str.contains(person_name.lower(), na=False)]
        if not matched.empty:
            top_works = matched.sort_values(by='vote_count', ascending=False).head(6)
            movies_res = [engine._format_movie_row(row) for _, row in top_works.iterrows()]
            return (
                f"Here are the top critically acclaimed films directed by **{person_name}** available on Zhoosh:\n\n"
                f"Click on any film below to watch the trailer or start streaming!",
                movies_res,
                []
            )
    elif person_type == "actor" and engine.movies_df is not None:
        matched = engine.movies_df[engine.movies_df['cast'].str.lower().str.contains(person_name.lower(), na=False)]
        if not matched.empty:
            top_works = matched.sort_values(by='vote_count', ascending=False).head(6)
            movies_res = [engine._format_movie_row(row) for _, row in top_works.iterrows()]
            return (
                f"Here are the top films starring **{person_name}** available on Zhoosh:\n\n"
                f"Click on any movie below to view details and stream in 4K!",
                movies_res,
                []
            )

    # 4. Check for Movie Language (Hindi, Korean, Anime)
    movie_lang_title, movie_lang_results = detect_movie_language_in_query(message)
    if movie_lang_results:
        return (
            f"Here are top-rated {movie_lang_title} films curated for you on Zhoosh:\n\n"
            f"Click **Watch / View Movie** on any card below to start streaming!",
            movie_lang_results,
            []
        )

    # 5. Check for Movie Mood (Mind-Bending, Sad/Drama, Scary, Funny, Inspiring)
    movie_mood_title, movie_mood_results = detect_movie_mood_in_query(message)
    if movie_mood_results:
        return (
            f"Here are {movie_mood_title} films curated for you on Zhoosh:\n\n"
            f"Click **Watch / View Movie** on any card below to launch playback!",
            movie_mood_results,
            []
        )

    # 6. Check for Movie Genre Query (Horror, Comedy, Thriller, Sci-Fi, etc.)
    genre = detect_genre_in_query(message)
    if genre:
        top_genre_movies = engine.get_movies(genre=genre, limit=6)
        if top_genre_movies:
            movies_res = top_genre_movies
            return (
                f"Here are top-rated 🎬 **{genre}** movies curated for you on Zhoosh:\n\n"
                f"Click **Watch / View Movie** on any card to dive right in!",
                movies_res,
                []
            )

    # 7. Check for Trending / Top Movies
    if any(w in msg_lower for w in ["trending", "top", "popular", "best movies", "what should i watch", "recommend something", "suggest"]):
        trending = engine.get_movies(limit=6)
        if trending:
            movies_res = trending
            return (
                f"Here are the top trending movies right now on Zhoosh:\n\n"
                f"Click on any card to view synopsis, trailer, and launch playback!",
                movies_res,
                []
            )

    # 8. Conversational / Greetings (Word boundary check)
    if re.search(r'\b(hello|hi|hey|who are you|what is your name|your name|what\'s your name|help|who r u)\b', msg_lower):
        return (
            f"Hello! I am **{agent_name}**, your dedicated AI Cinema & Soundtrack Intelligence guide on Zhoosh.\n\n"
            f"I have real-time access to our entire catalog of films, directors, ratings, and soundtracks. Here is what you can ask me:\n"
            f"• _\"Suggest some horror movies\"_\n"
            f"• _\"Suggest comedy movies\"_\n"
            f"• _\"Suggest movies like Inception\" (or any movie you like)_\n"
            f"• _\"Hindi movies\"_ or _\"Mind-bending movies\"_\n"
            f"• _\"Who directed Interstellar?\"_\n\n"
            f"What would you like to watch or explore today?",
            [],
            []
        )

    # 9. Fallback with context search in catalog
    search_res = engine.search_all(message)
    if search_res.get('movies'):
        movies_res = search_res['movies'][:6]
        return (
            f"Based on \"{message}\", here are the closest matches in our cinema library:\n\n"
            f"Click any title below to begin streaming!",
            movies_res,
            []
        )

    return (
        f"I'm here to help you navigate Zhoosh's cinema and music catalog!\n\n"
        f"You can ask me to suggest movies by genre (such as **Horror**, **Comedy**, **Sci-Fi**, or **Thriller**), "
        f"explore films by director (like **Christopher Nolan** or **Quentin Tarantino**), "
        f"or request titles matching your mood (like **Sad movies** or **Mind-bending films**).",
        [],
        []
    )

# ---------------------------------------------------------------------------
# Streaming helpers
# ---------------------------------------------------------------------------

async def stream_text_words(text: str, delay_ms: int = 25):
    """Yield text word-by-word as SSE events."""
    words = text.split(" ")
    for i, word in enumerate(words):
        chunk = word + (" " if i < len(words) - 1 else "")
        yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"
        await asyncio.sleep(delay_ms / 1000.0)
    yield f"data: {json.dumps({'type': 'done', 'intent': 'done'})}\n\n"

async def groq_stream(message: str, history: List[ConversationMessage], agent_name: str, intent: str, mode: str = "movies"):
    """Stream grounded response via Groq if available, or dataset-backed engine."""
    # Dataset-grounded intelligent response with structured movies & songs
    response_text, movies, songs = generate_grounded_response(message, agent_name, mode=mode)
    
    if movies:
        yield f"data: {json.dumps({'type': 'movies', 'movies': movies})}\n\n"
    if songs:
        yield f"data: {json.dumps({'type': 'songs', 'songs': songs})}\n\n"

    yield f"data: {json.dumps({'type': 'intent', 'intent': 'grounded_response'})}\n\n"
    async for chunk in stream_text_words(response_text, delay_ms=18):
        yield chunk

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/chat")
async def agent_chat(req: AgentChatRequest):
    """Stream agent response word-by-word via SSE."""
    return StreamingResponse(
        groq_stream(req.message, req.history, req.agent_name, "chat", mode=req.mode),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )

@router.get("/profile/{user_id}")
async def get_agent_profile(user_id: str):
    """Return agent profile (name + avatar)."""
    stored = _agent_profiles.get(user_id)
    if stored:
        return stored
    return {"user_id": user_id, "agent_name": "Nova", "avatar_url": "/agent-avatar.jpg"}

@router.post("/profile")
async def upsert_agent_profile(req: AgentProfileRequest):
    """Create or update agent profile."""
    _agent_profiles[req.user_id] = {
        "user_id": req.user_id,
        "agent_name": req.agent_name,
        "avatar_url": req.avatar_url or "/agent-avatar.jpg",
        "updated_at": time.time()
    }
    return {"success": True, "agent_name": req.agent_name}

@router.delete("/history/{user_id}")
async def clear_agent_history(user_id: str):
    """Clear conversation history."""
    return {"success": True, "message": "Conversation history cleared"}

_agent_profiles: dict = {}
