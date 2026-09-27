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
from dotenv import load_dotenv

load_dotenv()

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
    liked_titles: Optional[List[str]] = []
    memory: Optional[dict] = {}

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
    
    # Exclude genre and generic words so queries like "suggest comedy movies" don't match movie titles
    GENERIC_EXCLUSIONS = COMMON_STOPWORDS | set(KNOWN_GENRES.keys()) | {
        'movie', 'movies', 'film', 'films', 'songs', 'song', 'music', 'recommend',
        'recommendation', 'good', 'best', 'top', 'trending', 'suggest', 'cinema',
        'soundtrack', 'soundtracks', 'sound', 'sounds', 'audio', 'stream', 'play'
    }

    # Priority check for titles with length > 2
    for _, row in top_df.head(3000).iterrows():
        title = str(row['title']).strip()
        t_lower = title.lower()
        if t_lower in GENERIC_EXCLUSIONS or len(t_lower) <= 2:
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
    'love songs': 'Romantic',
    'love song': 'Romantic',
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
    """Detect mood & situational music requests for 5 core scenarios + existing vibes:
    1. Travelling / Road trip (Ilahi, Safarnama, Dil Chahta Hai, Matargashti)
    2. Missing College Days / Friendship (Yaaron, Give Me Some Sunshine, Tera Yaar Hoon Main, Kabira, Dil Chahta Hai)
    3. Exciting / Thrilling / Kendrick Lamar / Rock (HUMBLE., Not Like Us, All The Stars, Bohemian Rhapsody, In The End, Numb)
    4. Sad / Tired / Depressed / Melancholic Comfort (Tum Hi Ho, Channa Mereya, Fix You, The Scientist, Until I Found You)
    5. Happy / Joyful / Pleasant / Romantic Love (Shape of You, Birds of a Feather, As It Was, Kesariya)
    """
    q_lower = query.lower()
    if engine.music_df is None or engine.music_df.empty:
        return None, None

    # 1. Missing College Days / Friendship & Nostalgia
    if any(k in q_lower for k in [
        'college days', 'college day', 'missing college', 'miss my college', 'miss college',
        'hostel', 'hostel days', 'hostel life', 'campus', 'college life', 'university',
        'missing my friends', 'missing friends', 'miss my friends', 'friendship', 'friends',
        'old friends', 'college memories', 'school days', 'college', 'dosti'
    ]):
        college_songs = [
            'yaaron', 'give me some sunshine', 'tera yaar hoon main', 'kabira', 'dil chahta hai'
        ]
        selected = []
        seen = set()
        for s_name in college_songs:
            m = engine.music_df[engine.music_df['track_name'].str.lower() == s_name]
            for _, r in m.iterrows():
                if r['track_id'] not in seen:
                    selected.append(engine._format_song_row(
                        r, match_pct=99,
                        rationale=f"Soul-stirring friendship & campus anthem: '{r['track_name']}' by {r['artists']}."
                    ))
                    seen.add(r['track_id'])
        return "🎓 **College Days & Eternal Friendship**", selected[:6]

    # 2. Travelling / Road Trip / Wanderlust Songs
    if any(k in q_lower for k in [
        'travelling', 'traveling', 'travlling', 'travel', 'road trip', 'roadtrip',
        'journey', 'vacation', 'wanderlust', 'trip', 'drive', 'driving', 'holiday'
    ]):
        travel_songs = [
            'ilahi', 'safarnama', 'dil chahta hai', 'matargashti', 'as it was', 'a bar song (tipsy)'
        ]
        selected = []
        seen = set()
        for s_name in travel_songs:
            m = engine.music_df[engine.music_df['track_name'].str.lower() == s_name]
            for _, r in m.iterrows():
                if r['track_id'] not in seen:
                    selected.append(engine._format_song_row(
                        r, match_pct=99,
                        rationale=f"The ultimate road-trip anthem: '{r['track_name']}' by {r['artists']}."
                    ))
                    seen.add(r['track_id'])
        return "🚗 **Road Trip & Wanderlust Anthems**", selected[:6]

    # 3. Exciting / Thrilling / Kendrick Lamar / Rock / High Energy
    if any(k in q_lower for k in [
        'exciting', 'thrilling', 'adrenaline', 'kendrick', 'kendric', 'rock',
        'rock music', 'hype', 'hyped', 'pump', 'workout', 'gym', 'banger', 'electric',
        'high energy', 'high octane', 'high tempo', 'high bpm'
    ]):
        thrill_songs = [
            'humble.', 'not like us', 'all the stars', 'bohemian rhapsody',
            'in the end', 'numb', 'radioactive', 'starboy'
        ]
        selected = []
        seen = set()
        for s_name in thrill_songs:
            m = engine.music_df[engine.music_df['track_name'].str.lower() == s_name]
            for _, r in m.iterrows():
                if r['track_id'] not in seen:
                    selected.append(engine._format_song_row(
                        r, match_pct=99,
                        rationale=f"High-octane Kendrick Lamar & rock power: '{r['track_name']}' by {r['artists']}."
                    ))
                    seen.add(r['track_id'])
        return "⚡ **High-Energy Rock & Kendrick Lamar Anthems**", selected[:6]

    # 4. Sad / Tired / Depressed / Melancholic Comfort
    if any(k in q_lower for k in [
        'sad', 'tired', 'depressed', 'depress', 'exhausted', 'feeling low',
        'feleing sad', 'heartbreak', 'crying', 'cry', 'melancholy', 'pain',
        'comfort', 'lonely', 'breakup', 'tears'
    ]):
        sad_priority = [
            'tum hi ho', 'channa mereya', 'fix you', 'the scientist',
            'until i found you', 'all of me', 'numb', 'in the end'
        ]
        selected = []
        seen = set()
        for s_name in sad_priority:
            m = engine.music_df[engine.music_df['track_name'].str.lower() == s_name]
            for _, r in m.iterrows():
                if r['track_id'] not in seen:
                    selected.append(engine._format_song_row(
                        r, match_pct=98,
                        rationale=f"Soulful melancholic resonance: '{r['track_name']}' by {r['artists']}."
                    ))
                    seen.add(r['track_id'])
        # Supplement with lowest valence tracks
        low_valence = engine.music_df[
            (~engine.music_df['track_id'].isin(seen)) &
            (engine.music_df['valence'] <= 0.35)
        ].sort_values(by='valence', ascending=True)
        for _, r in low_valence.iterrows():
            if len(selected) >= 6:
                break
            selected.append(engine._format_song_row(
                r, match_pct=97,
                rationale=f"Soulful melancholic resonance: '{r['track_name']}' by {r['artists']}."
            ))
            seen.add(r['track_id'])
        return "🌧️ **Sad & Comforting Melodies**", selected[:6]

    # 5. Happy / Joyful / Pleasant / Romantic Love Songs
    if any(k in q_lower for k in [
        'happy', 'joyful', 'joyfyul', 'joy', 'pleasant', 'cheerful',
        'good vibes', 'feel good', 'feel-good', 'uplifting', 'delightful',
        'romantic', 'romance', 'love', 'love songs', 'crush', 'valentine'
    ]):
        happy_priority = [
            'shape of you', 'birds of a feather', 'as it was', 'please please please',
            'good luck, babe!', 'a bar song (tipsy)'
        ]
        selected = []
        seen = set()
        seen_names = set()
        for s_name in happy_priority:
            m = engine.music_df[engine.music_df['track_name'].str.lower() == s_name]
            for _, r in m.iterrows():
                t_key = r['track_name'].lower().strip()
                if r['track_id'] not in seen and t_key not in seen_names:
                    selected.append(engine._format_song_row(
                        r, match_pct=99,
                        rationale=f"Vibrant feel-good love song: '{r['track_name']}' by {r['artists']}."
                    ))
                    seen.add(r['track_id'])
                    seen_names.add(t_key)
        # Include romantic recommendations if available
        rom = engine.get_romantic_recommendations(limit=4)
        for r_song in rom:
            r_key = r_song['title'].lower().strip()
            if r_song['id'] not in seen and r_key not in seen_names and len(selected) < 6:
                selected.append(r_song)
                seen.add(r_song['id'])
                seen_names.add(r_key)
        return "☀️ **Happy, Joyful & Romantic Love Songs**", selected[:6]

    # Fallback existing moods
    if any(k in q_lower for k in ['party', 'dance', 'club', 'banger', 'celebrate', 'upbeat', 'high energy', 'high octane', 'high tempo', 'gym', 'workout', 'hype']):
        party_titles = ['humble.', 'sicko mode', 'blinding lights', 'starboy', 'shape of you', 'hotline bling', 'die with a smile']
        df = engine.music_df[engine.music_df['track_name'].str.lower().apply(lambda t: any(s in t for s in party_titles)) | (engine.music_df['danceability'] >= 0.70)]
        formatted = [engine._format_song_row(row, match_pct=99, rationale=f"High-octane party anthem: '{row['track_name']}' by {row['artists']}.") for _, row in df.iterrows()]
        return "⚡ **Party & High-Energy Bangers**", formatted[:6]

    if any(k in q_lower for k in ['chill', 'relax', 'calm', 'study', 'sleep', 'soothing', 'peaceful', 'mellow', 'zen']):
        lofi_tracks = engine.get_music(genre='lo-fi', limit=6)
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
    """Detect movie mood & situational requests for 5 core scenarios + existing vibes:
    1. Travelling / Road trip (Zindagi Na Milegi Dobara, Yeh Jawaani Hai Deewani, Jab We Met, Dil Chahta Hai, Walter Mitty, Into the Wild, Before Sunrise)
    2. Missing College Days / Friendship (3 Idiots, Chhichhore, Dil Chahta Hai, Yeh Jawaani Hai Deewani, Superbad, Dead Poets Society)
    3. Exciting / Thrilling / Action (Oppenheimer, The Dark Knight, Inception, Fight Club, The Matrix, Mad Max)
    4. Sad / Tired / Depressed / Emotional Comfort (Main Hoon Na, Forrest Gump, The Shawshank Redemption, Dead Poets Society)
    5. Happy / Joyful / Pleasant / Romantic Comedy (Jab We Met, Crazy Stupid Love, La La Land, About Time, The Holiday, Crazy Rich Asians)
    """
    q_lower = query.lower()
    if engine.movies_df is None or engine.movies_df.empty:
        return None, None

    # 1. Missing College Days / Friendship & Nostalgia
    if any(k in q_lower for k in [
        'college days', 'college day', 'missing college', 'miss my college', 'miss college',
        'hostel', 'hostel days', 'hostel life', 'campus', 'college life', 'university',
        'missing my friends', 'missing friends', 'miss my friends', 'friendship', 'friends',
        'old friends', 'college memories', 'school days', 'college'
    ]):
        college_titles = [
            '3 idiots', 'chhichhore', 'dil chahta hai', 'yeh jawaani hai deewani',
            'superbad', 'dead poets society'
        ]
        selected = []
        seen = set()
        for t in college_titles:
            m = engine.movies_df[engine.movies_df['title'].str.lower() == t]
            for _, r in m.iterrows():
                if r['title'].lower() not in seen:
                    selected.append(engine._format_movie_row(
                        r, match_pct=99,
                        rationale=f"Timeless campus friendship & hostel classic: '{r['title']}'."
                    ))
                    seen.add(r['title'].lower())
        return "🎓 **College Days & Lifelong Friendship**", selected[:6]

    # 2. Travelling / Road Trip / Vacation / Journey
    if any(k in q_lower for k in [
        'travelling', 'traveling', 'travlling', 'travel', 'road trip', 'roadtrip',
        'journey', 'vacation', 'wanderlust', 'trip', 'driving', 'exploring', 'holiday'
    ]):
        travel_titles = [
            'zindagi na milegi dobara', 'yeh jawaani hai deewani', 'jab we met',
            'dil chahta hai', 'the secret life of walter mitty', 'into the wild', 'before sunrise'
        ]
        selected = []
        seen = set()
        for t in travel_titles:
            m = engine.movies_df[engine.movies_df['title'].str.lower() == t]
            for _, r in m.iterrows():
                if r['title'].lower() not in seen:
                    selected.append(engine._format_movie_row(
                        r, match_pct=99,
                        rationale=f"Essential wanderlust & road-trip classic: '{r['title']}'."
                    ))
                    seen.add(r['title'].lower())
        return "🚗 **Wanderlust & Travelling Journeys**", selected[:6]

    # 3. Exciting / Adrenaline / Action-Packed
    if any(k in q_lower for k in [
        'exciting', 'adrenaline', 'edge of my seat',
        'edge of seat', 'mind-blowing', 'mind blowing', 'action packed', 'intense', 'hype', 'hyped',
        'high energy', 'high octane', 'high tempo', 'high adrenaline', 'high action'
    ]):
        thrill_titles = [
            'oppenheimer', 'the dark knight', 'inception', 'fight club',
            'the matrix', 'mad max: fury road', 'the dark knight rises'
        ]
        selected = []
        seen = set()
        for t in thrill_titles:
            m = engine.movies_df[engine.movies_df['title'].str.lower() == t]
            for _, r in m.iterrows():
                if r['title'].lower() not in seen:
                    selected.append(engine._format_movie_row(
                        r, match_pct=99,
                        rationale=f"Electrifying high-octane cinematic journey: '{r['title']}'."
                    ))
                    seen.add(r['title'].lower())
        return "⚡ **Exciting & High-Octane Spectacles**", selected[:6]

    # 4. Sad / Tired / Depressed / Poignant Comfort
    if any(k in q_lower for k in [
        'sad', 'tired', 'depressed', 'depress', 'exhausted', 'feeling low',
        'feleing sad', 'heartbroken', 'crying', 'cry', 'tears', 'comfort', 'comforting',
        'drained', 'melancholic', 'melancholy', 'pain'
    ]):
        comfort_titles = [
            'main hoon na', 'forrest gump', 'the shawshank redemption',
            'dead poets society', 'good will hunting'
        ]
        selected = []
        seen = set()
        for t in comfort_titles:
            m = engine.movies_df[engine.movies_df['title'].str.lower() == t]
            for _, r in m.iterrows():
                if r['title'].lower() not in seen:
                    selected.append(engine._format_movie_row(
                        r, match_pct=98,
                        rationale=f"Deeply comforting & heartwarming cinema: '{r['title']}'."
                    ))
                    seen.add(r['title'].lower())
        # Supplement with high-rated emotional drama if needed
        if len(selected) < 6:
            dramas = engine.movies_df[
                engine.movies_df['genres_str'].str.lower().str.contains('drama', na=False) &
                (~engine.movies_df['title'].str.lower().isin(seen))
            ].sort_values(by='vote_average', ascending=False)
            for _, r in dramas.head(6 - len(selected)).iterrows():
                selected.append(engine._format_movie_row(r, match_pct=96, rationale=f"Touching emotional drama: '{r['title']}'."))
        return "🌧️ **Heartwarming Comfort & Poignant Dramas**", selected[:6]

    # 5. Happy / Joyful / Pleasant / Romantic Comedy
    if any(k in q_lower for k in [
        'happy', 'joyful', 'joyfyul', 'joy', 'pleasant', 'cheerful',
        'uplifting', 'feel good', 'feel-good', 'delightful', 'sweet',
        'romcom', 'romantic comedy', 'good mood'
    ]):
        happy_titles = [
            'jab we met', 'crazy, stupid, love.', 'la la land', 'about time',
            'the holiday', 'crazy rich asians', 'midnight in paris', 'notting hill'
        ]
        selected = []
        seen = set()
        for t in happy_titles:
            m = engine.movies_df[engine.movies_df['title'].str.lower() == t]
            for _, r in m.iterrows():
                if r['title'].lower() not in seen:
                    selected.append(engine._format_movie_row(
                        r, match_pct=98,
                        rationale=f"Feel-good romantic comedy to bring a smile: '{r['title']}'."
                    ))
                    seen.add(r['title'].lower())
        return "☀️ **Joyful & Feel-Good Romantic Comedies**", selected[:6]

    # Fallback existing vibes
    if any(k in q_lower for k in ['mind-bending', 'mind bending', 'twist', 'psychological', 'puzzle', 'confusing', 'complex']):
        mb_titles = ['inception', 'interstellar', 'shutter island', 'the prestige', 'fight club', 'memento', 'matrix', 'arrival']
        matches = engine.movies_df[engine.movies_df['title'].str.lower().apply(lambda t: any(m in t for m in mb_titles))]
        if not matches.empty:
            top_m = matches.sort_values(by='vote_count', ascending=False).head(6)
            return "🧠 **Mind-Bending & Psychological**", [engine._format_movie_row(r) for _, r in top_m.iterrows()]

    if any(k in q_lower for k in ['scary', 'spooky', 'frightening', 'creepy', 'horror']):
        matches = engine.movies_df[engine.movies_df['genres_str'].str.lower().str.contains('horror', na=False)]
        if not matches.empty:
            top_m = matches.sort_values(by='vote_count', ascending=False).head(6)
            return "👻 **Terrifying Horror**", [engine._format_movie_row(r) for _, r in top_m.iterrows()]

    if any(k in q_lower for k in ['funny', 'hilarious', 'laugh']):
        matches = engine.movies_df[engine.movies_df['genres_str'].str.lower().str.contains('comedy', na=False)]
        if not matches.empty:
            top_m = matches.sort_values(by='vote_count', ascending=False).head(6)
            return "😂 **Acclaimed Comedies**", [engine._format_movie_row(r) for _, r in top_m.iterrows()]

    if any(k in q_lower for k in ['inspiring', 'inspirational', 'motivational']):
        matches = engine.movies_df[engine.movies_df['genres_str'].str.lower().str.contains('drama', na=False) & (engine.movies_df['vote_count'].astype(float) >= 10000)]
        if not matches.empty:
            top_m = matches.sort_values(by='vote_average', ascending=False).head(6)
            return "✨ **Inspiring & Uplifting Stories**", [engine._format_movie_row(r) for _, r in top_m.iterrows()]

    return None, None

def detect_person_in_query(query: str):
    """Detect if user is asking for director or actor filmography, supporting full names and surnames."""
    if engine.movies_df is None or engine.movies_df.empty:
        return None, None
        
    q_lower = query.lower()
    
    # Famous directors with full names and surnames
    DIRECTOR_MAP = {
        "christopher nolan": "Christopher Nolan",
        "nolan": "Christopher Nolan",
        "quentin tarantino": "Quentin Tarantino",
        "tarantino": "Quentin Tarantino",
        "steven spielberg": "Steven Spielberg",
        "spielberg": "Steven Spielberg",
        "martin scorsese": "Martin Scorsese",
        "scorsese": "Martin Scorsese",
        "denis villeneuve": "Denis Villeneuve",
        "villeneuve": "Denis Villeneuve",
        "david fincher": "David Fincher",
        "fincher": "David Fincher",
        "james cameron": "James Cameron",
        "cameron": "James Cameron",
        "ridley scott": "Ridley Scott",
        "stanley kubrick": "Stanley Kubrick",
        "kubrick": "Stanley Kubrick",
        "alfred hitchcock": "Alfred Hitchcock",
        "hitchcock": "Alfred Hitchcock",
        "guillermo del toro": "Guillermo del Toro",
        "del toro": "Guillermo del Toro",
        "wes anderson": "Wes Anderson",
        "hayao miyazaki": "Hayao Miyazaki",
        "miyazaki": "Hayao Miyazaki",
        "bong joon-ho": "Bong Joon-ho",
        "greta gerwig": "Greta Gerwig",
        "gerwig": "Greta Gerwig",
        "peter jackson": "Peter Jackson",
        "rajkumar hirani": "Rajkumar Hirani",
        "hirani": "Rajkumar Hirani",
        "anurag kashyap": "Anurag Kashyap"
    }
    for kw, d in DIRECTOR_MAP.items():
        if re.search(r'(?:\b|^)' + re.escape(kw) + r'(?:\b|$|[?!.,])', q_lower):
            return "director", d
            
    # Famous actors with full names and surnames
    ACTOR_MAP = {
        "leonardo dicaprio": "Leonardo DiCaprio",
        "dicaprio": "Leonardo DiCaprio",
        "brad pitt": "Brad Pitt",
        "tom cruise": "Tom Cruise",
        "christian bale": "Christian Bale",
        "robert de niro": "Robert De Niro",
        "al pacino": "Al Pacino",
        "matthew mcconaughey": "Matthew McConaughey",
        "mcconaughey": "Matthew McConaughey",
        "morgan freeman": "Morgan Freeman",
        "keanu reeves": "Keanu Reeves",
        "tom hanks": "Tom Hanks",
        "hanks": "Tom Hanks",
        "cillian murphy": "Cillian Murphy",
        "joaquin phoenix": "Joaquin Phoenix",
        "ryan gosling": "Ryan Gosling",
        "gosling": "Ryan Gosling",
        "emma stone": "Emma Stone",
        "scarlett johansson": "Scarlett Johansson",
        "anne hathaway": "Anne Hathaway",
        "shah rukh khan": "Shah Rukh Khan",
        "shahrukh": "Shah Rukh Khan",
        "srk": "Shah Rukh Khan",
        "aamir khan": "Aamir Khan",
        "salman khan": "Salman Khan",
        "ranbir kapoor": "Ranbir Kapoor",
        "deepika padukone": "Deepika Padukone"
    }
    for kw, a in ACTOR_MAP.items():
        if re.search(r'(?:\b|^)' + re.escape(kw) + r'(?:\b|$|[?!.,])', q_lower):
            return "actor", a
            
    return None, None

# ---------------------------------------------------------------------------
# Conversational Context & Multi-Turn Intelligence Helpers
# ---------------------------------------------------------------------------

def is_taste_query(query: str) -> bool:
    """Detects queries like 'what kind of movies do i like', 'what do i like', 'my taste'."""
    q = query.lower().strip()
    patterns = [
        r'\bwhat\s+(kind\s+of\s+)?(movies?|films?|cinema|music|songs?|tracks?)\s+(do\s+i|would\s+i|can\s+i)\s+(like|love|prefer|enjoy)\b',
        r'\bwhat\s+(movies?|films?|music|songs?)\s+do\s+i\s+like\b',
        r'\bwhat\s+do\s+i\s+(like|love|prefer|enjoy|watch|listen to)\b',
        r'\b(my\s+taste|my\s+profile|my\s+preferences|based\s+on\s+my\s+taste|what\s+is\s+my\s+taste)\b',
        r'\btell\s+me\s+what\s+(i\s+like|my\s+taste\s+is)\b',
        r'\bwhat\s+should\s+i\s+(watch|listen\s+to)\s+based\s+on\s+my\s+(taste|profile|likes)\b'
    ]
    return any(re.search(p, q) for p in patterns)

def is_more_query(query: str) -> bool:
    """Detects pagination queries like 'more', 'give me more', 'suggest more', 'next'."""
    q = query.lower().strip()
    return bool(
        re.search(r'^(more|more please|give me more|suggest more|show more|show me more|more movies|more songs|more tracks|next|next one|another|another one|others|something else|give more)[.!?]?$', q)
        or (q.startswith('more ') and len(q.split()) <= 3)
    )

def extract_context_from_history(history: List[ConversationMessage], current_mode: str = "movies"):
    """
    Extracts conversation state from previous turns:
    - active_genre: e.g. 'Thriller', 'Comedy', 'Science Fiction'
    - active_music_genre: e.g. 'Lo-Fi', 'Pop', 'Hip-Hop'
    - active_topic_mode: 'movies' | 'music'
    - seen_titles: set of titles previously presented
    - more_count: number of 'more' turns
    """
    active_genre = None
    active_music_genre = None
    active_artist = None
    active_director = None
    active_topic_mode = current_mode
    seen_titles = set()
    more_count = 0

    for msg in reversed(history or []):
        content = msg.content.strip()
        c_lower = content.lower()
        if msg.role == 'user':
            if is_more_query(content):
                more_count += 1
            else:
                if not active_genre:
                    active_genre = detect_genre_in_query(content)
                if not active_music_genre:
                    active_music_genre = detect_music_genre_in_query(content)
                if not active_artist or not active_director:
                    pt, pn = detect_person_in_query(content)
                    if pt == "director" and not active_director:
                        active_director = pn
                    elif pt == "actor" and not active_artist:
                        active_artist = pn
            if any(w in c_lower for w in ["song", "music", "track", "singer", "artist", "album", "lofi", "lo-fi"]):
                active_topic_mode = "music"
            elif any(w in c_lower for w in ["movie", "film", "cinema", "director", "actor"]):
                active_topic_mode = "movies"
        elif msg.role in ('agent', 'assistant'):
            # Extract bold titles or quoted titles from previous agent messages
            bolds = re.findall(r'\*\*(.*?)\*\*', content)
            for b in bolds:
                clean_b = b.strip()
                if len(clean_b) > 2 and clean_b.lower() not in COMMON_STOPWORDS:
                    seen_titles.add(clean_b.lower())
            # Only use agent content for genre if user messages had none
            if not active_genre and not active_music_genre:
                u_mgenre = detect_music_genre_in_query(content)
                if u_mgenre:
                    active_music_genre = u_mgenre
                else:
                    active_genre = detect_genre_in_query(content)

    return {
        'active_genre': active_genre,
        'active_music_genre': active_music_genre,
        'active_artist': active_artist,
        'active_director': active_director,
        'active_topic_mode': active_topic_mode or current_mode,
        'seen_titles': list(seen_titles),
        'more_count': more_count
    }

# ---------------------------------------------------------------------------
# Conversational & Greeting Intelligence Helpers
# ---------------------------------------------------------------------------

def is_greeting_meta_query(query: str) -> bool:
    """Detects when user asks about the linguistic difference between greetings (hi, hello, high)."""
    q = query.lower().strip()
    has_diff = bool(re.search(r'\b(diff|difference|different|differently|distinction|compare|meanings?|differentiate)\b', q))
    has_greetings = bool(re.search(r'\b(hi|hello|hey|high)\b', q))
    return has_diff and has_greetings

def detect_greeting_intent(query: str) -> Optional[str]:
    """
    Intelligently classifies pure greetings, meta questions, and casual conversational openers.
    Explicitly separates 'high' (standalone greeting / speech-to-text typo) from 'high energy' / 'high octane'.
    """
    q = query.lower().strip()
    
    # Exclude queries asking for high energy / high octane / movie titles
    if re.search(r'\bhigh\s+(energy|octane|tempo|bpm|stakes?|school|definition|rating|rated|performance|quality)\b', q):
        return None
        
    if is_greeting_meta_query(query):
        return 'meta_difference'
        
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', q).strip()
    
    # Conversational intent flavors
    if re.search(r'\b(who are you|who r u|what is your name|whats your name|what are you|introduce yourself)\b', cleaned):
        return 'identity'
    if re.search(r'\b(how are you|how r u|how do you do|hows it going|how are things|how are you doing)\b', cleaned):
        return 'how_are_you'
    if re.search(r'\b(help|what can you do|how does this work)\b', cleaned):
        return 'help'
        
    # Standalone greeting expressions (hi, hii, hello, hey, high, etc.)
    greeting_tokens = r'(hi+|hello+|hey+|heyy+|heya|howdy|hola|high|sup|yo|greetings?|good\s+(morning|afternoon|evening|day))'
    target_names = r'(\s+(there|nova|sonicbot|bot|friend|buddy|mate|everyone|all|assistant))?'
    
    pattern = r'^' + greeting_tokens + target_names + r'$'
    if re.match(pattern, cleaned):
        if re.match(r'^high', cleaned):
            return 'high'
        elif re.match(r'^hi', cleaned):
            return 'hi'
        elif re.match(r'^hey', cleaned):
            return 'hey'
        elif re.match(r'^hello', cleaned):
            return 'hello'
        else:
            return 'general'
            
    return None

def strip_leading_greeting(query: str) -> str:
    """Strips leading greeting tokens from compound queries like 'hi recommend thriller movies'."""
    q = query.strip()
    if re.match(r'^high\s+(energy|octane|tempo|bpm|stakes?|school|definition|rating|rated|performance)\b', q, flags=re.IGNORECASE):
        return q
    pattern = r'^(hi+|hello+|hey+|heyy+|howdy|hola|high|good\s+(morning|afternoon|evening))\b[,!.\s]*'
    return re.sub(pattern, '', q, flags=re.IGNORECASE).strip()

def get_conversational_response(intent: str, agent_name: str, mode: str = "movies") -> tuple[str, list, list]:
    """Generates intelligent conversational responses for greetings, meta questions, and casual openers."""
    if intent == 'meta_difference':
        if mode == "movies":
            return (
                f"Linguistically, **\"Hi\"**, **\"Hello\"**, and **\"High\"** all carry distinct meanings:\n\n"
                f"• **\"Hi\"**: Casual, warm, and conversational—the standard informal greeting among friends.\n"
                f"• **\"Hello\"**: The classic, universally recognized greeting suited for any setting.\n"
                f"• **\"High\"**: A phonetic homophone (sounds identical) often typed by mistake or transcribed via voice for \"hi\"—though in cinema, it points to **high-octane thrillers**, **high-stakes drama**, or **high-energy blockbusters**!\n\n"
                f"Whether you say *hi*, *hello*, or are looking for something high-energy, I'm **{agent_name}**, your dedicated AI cinema guide. What would you like to watch or explore today?",
                [],
                []
            )
        else:
            return (
                f"Linguistically, **\"Hi\"**, **\"Hello\"**, and **\"High\"** all carry distinct nuances:\n\n"
                f"• **\"Hi\"**: Casual, energetic, and informal—great for kicking off a listening session.\n"
                f"• **\"Hello\"**: The universal standard greeting for every musical discovery.\n"
                f"• **\"High\"**: A phonetic homophone often typed as a quick typo or transcribed via voice for \"hi\"—though in music, it represents **high-energy gym bangers**, **high-BPM dance tracks**, or **high-fidelity lossless audio**!\n\n"
                f"Whether you say *hi*, *hello*, or want high-energy tunes, I'm **{agent_name}**, your AI audio guide. What track, artist, or genre are you tuning into today?",
                [],
                []
            )

    if intent == 'high':
        if mode == "movies":
            return (
                f"Hello there! I see you said **\"High\"**—whether that's a quick hello or you're looking for **high-octane, adrenaline-pumping cinema**, you've come to the right place! 🎬\n\n"
                f"I'm **{agent_name}**, your AI Cinema Intelligence guide. Here is what you can explore:\n"
                f"• Ask for **high-energy thrillers** (like *Oppenheimer* or *The Dark Knight*)\n"
                f"• Discover films by genre (**Sci-Fi**, **Romance**, **Comedy**, or **Horror**)\n"
                f"• Say _\"What kind of movies do I like?\"_ to discover your personal taste profile\n\n"
                f"What cinematic journey sounds exciting to you right now?",
                [],
                []
            )
        else:
            return (
                f"Hello there! I see you typed **\"High\"**—whether that's a friendly hello or you're searching for **high-energy workout bangers and high-BPM anthems**, I've got you covered! ⚡\n\n"
                f"I'm **{agent_name}**, your AI Music Intelligence guide. Here is what we can queue up:\n"
                f"• **High-energy gym tracks** and workout anthems (*HUMBLE.*, *Starboy*, *Not Like Us*)\n"
                f"• Chill & soothing **Lo-Fi** or soulful **Acoustic melodies**\n"
                f"• Artists like **Arijit Singh** or **Coldplay**\n\n"
                f"What vibe are you looking to play right now?",
                [],
                []
            )

    if intent == 'hi':
        if mode == "movies":
            return (
                f"Hi there! 👋 I am **{agent_name}**, your personal AI Cinema & Storytelling guide on Zhoosh.\n\n"
                f"What are you in the mood to watch today?\n"
                f"• ⚡ Ask for a genre: _\"Suggest some thriller movies\"_ or _\"Comedy movies\"_\n"
                f"• 🎬 Search by title or vibe: _\"Movies like Inception\"_ or _\"High-energy films\"_\n"
                f"• 🍿 Calibrate your taste: _\"What kind of movies do I like?\"_\n\n"
                f"Tell me what sounds exciting!",
                [],
                []
            )
        else:
            return (
                f"Hi there! 👋 I am **{agent_name}**, your personal AI Music & Audio Intelligence guide on Zhoosh.\n\n"
                f"What's your soundtrack today?\n"
                f"• 🎧 Explore a genre: _\"Lo-Fi tracks\"_, _\"Hip-Hop bangers\"_, or _\"Romantic songs\"_\n"
                f"• 🎤 Check top artists: _\"Arijit Singh songs\"_ or _\"The Weeknd hits\"_\n"
                f"• 🚗 Match your vibe: _\"Road trip songs\"_ or _\"High-energy gym music\"_\n\n"
                f"Tell me what you'd like to hear!",
                [],
                []
            )

    if intent == 'hello':
        if mode == "movies":
            return (
                f"Hello! Welcome to Zhoosh Cinema. I'm **{agent_name}**, your dedicated movie recommendation intelligence.\n\n"
                f"Whether you're looking for mind-bending sci-fi, gripping thrillers, heartfelt dramas, or movies directed by Christopher Nolan, I have our entire library ready for you.\n\n"
                f"How can I help you choose your next favorite film today?",
                [],
                []
            )
        else:
            return (
                f"Hello! Welcome to Zhoosh Music. I'm **{agent_name}**, your dedicated audio intelligence assistant.\n\n"
                f"From chart-topping global hits and lossless Hi-Fi tracks to curated moods (party, chill, road trips, or workout), I can queue up the perfect sound for your moment.\n\n"
                f"What sound or artist would you like to explore today?",
                [],
                []
            )

    if intent == 'hey':
        if mode == "movies":
            return (
                f"Hey! Great to see you. I'm **{agent_name}**, your AI film and cinema curator.\n\n"
                f"Looking for something thrilling, funny, or thought-provoking to stream today? Tell me a genre, an actor, or a movie you love and I'll find the perfect match for you!",
                [],
                []
            )
        else:
            return (
                f"Hey! Great to see you. I'm **{agent_name}**, your AI music companion.\n\n"
                f"Ready to find your next favorite track or playlist? Drop an artist, genre, or mood and let's get the music going!",
                [],
                []
            )

    if intent == 'how_are_you':
        if mode == "movies":
            return (
                f"I'm doing great, thank you for asking! 😊 Ready to help you discover incredible movies, directors, and cinematic stories.\n\n"
                f"What are you in the mood for today—a gripping thriller, a hilarious comedy, or a deep sci-fi journey?",
                [],
                []
            )
        else:
            return (
                f"I'm doing fantastic, thanks for asking! 🎵 Ready to queue up the best tracks and curate the perfect soundscape for you.\n\n"
                f"What kind of music vibe or artist are you tuning into today?",
                [],
                []
            )

    if intent == 'identity':
        if mode == "movies":
            return (
                f"I am **{agent_name}**, your dedicated AI Cinema & Soundtrack Intelligence assistant on Zhoosh.\n\n"
                f"I'm powered by machine learning recommendation models (TF-IDF cosine similarity, genre clustering, and collaborative neural scoring) across thousands of feature films. You can ask me:\n"
                f"• Movie recommendations by genre (**Thriller**, **Sci-Fi**, **Comedy**, **Romance**)\n"
                f"• Films by director (**Christopher Nolan**, **Quentin Tarantino**)\n"
                f"• Similar movies (_\"Suggest movies like Inception\"_)\n"
                f"• Your personalized taste profile (_\"What kind of movies do I like?\"_)",
                [],
                []
            )
        else:
            return (
                f"I am **{agent_name}**, your dedicated AI Music & Audio Intelligence guide on Zhoosh.\n\n"
                f"I analyze audio features (tempo, energy, acousticness, valence, and danceability) across a wide range of tracks and genres. You can ask me:\n"
                f"• Song recommendations by artist (**Arijit Singh**, **Coldplay**, **The Weeknd**)\n"
                f"• Genre radio (**Hip-Hop**, **Lo-Fi**, **Rock**, **Romantic**)\n"
                f"• Vibe playlists (**High-energy gym tracks**, **Road trips**, **Late-night chill**)\n"
                f"• Your acoustic taste profile (_\"What is my music taste?\"_)",
                [],
                []
            )

    # Default general greeting (good morning/evening/sup/yo/help)
    if mode == "movies":
        return (
            f"Greetings and welcome! I'm **{agent_name}**, your AI cinema companion on Zhoosh.\n\n"
            f"Ready to stream something remarkable? Tell me what genre or vibe you're feeling today, and I'll pull up the best films for you!",
            [],
            []
        )
    else:
        return (
            f"Greetings and welcome! I'm **{agent_name}**, your audio intelligence guide on Zhoosh.\n\n"
            f"Ready to stream some great tunes? Tell me what sound, artist, or vibe you want, and I'll queue it up instantly!",
            [],
            []
        )

# ---------------------------------------------------------------------------
# Intelligent Grounded Response Generator
# ---------------------------------------------------------------------------

def generate_grounded_response(
    message: str,
    agent_name: str,
    mode: str = "movies",
    history: Optional[List[ConversationMessage]] = None,
    liked_titles: Optional[List[str]] = None,
    memory: Optional[dict] = None
) -> tuple[str, list, list]:
    msg_lower = message.lower().strip()
    movies_res = []
    songs_res = []
    ctx = extract_context_from_history(history or [], current_mode=mode)
    
    # ── 0. Handle "More" / Pagination across Turns ──
    if is_more_query(message):
        effective_mode = ctx['active_topic_mode'] or mode
        offset = (ctx['more_count'] + 1) * 6
        seen_titles = ctx['seen_titles']
        
        if effective_mode == "music" or ctx['active_music_genre'] is not None:
            genre = ctx['active_music_genre'] or ctx['active_genre'] or 'Lo-Fi'
            more_songs = engine.get_music(genre=genre, limit=6, offset=offset, exclude_titles=seen_titles)
            if not more_songs:
                more_songs = engine.get_music(limit=6, offset=offset, exclude_titles=seen_titles)
            return (
                f"Here are **more {genre}** tracks curated for your vibe on Zhoosh Music:\n\n"
                f"Click any track below to launch lossless playback! Say **'more'** anytime for another batch.",
                [],
                more_songs
            )
        else:
            genre = ctx['active_genre'] or 'Thriller'
            more_movies = engine.get_top_genre_movies(genre, limit=6, offset=offset, exclude_titles=seen_titles)
            if not more_movies:
                more_movies = engine.get_movies(genre=genre, limit=6, offset=offset, exclude_titles=seen_titles)
            return (
                f"Here are **more {genre}** movies curated for you on Zhoosh:\n\n"
                f"Click **Watch / View Movie** on any card below to start streaming! If you want even more, just say **'more'**.",
                more_movies,
                []
            )

    # ── 0.5 Handle Taste Discovery Queries ("what kind of movies do i like", "what do i like", "my taste") ──
    if is_taste_query(message):
        effective_mode = "music" if mode == "music" or any(w in msg_lower for w in ["music", "song", "track"]) else "movies"
        
        # If user has liked titles passed from client
        if liked_titles and len(liked_titles) > 0:
            sample_titles = liked_titles[:2]
            primary_title = sample_titles[0]
            if effective_mode == "movies":
                recs = engine.recommend_movies_for_title(primary_title, top_n=6)
                if recs:
                    return (
                        f"Based on your profile and liked films (including **{primary_title}**), your taste leans towards "
                        f"immersive, critically acclaimed cinema with deep storytelling and intense atmosphere!\n\n"
                        f"Here are personalized recommendations calibrated for your taste profile:\n\n"
                        f"Click **Watch / View Movie** on any card to stream, or say **'more'** if you want more recommendations!",
                        recs,
                        []
                    )
            else:
                s_res = engine.search_all(primary_title, mode='music')
                m_songs = s_res.get('similar_songs') or s_res.get('artist_songs') or s_res.get('music', [])
                if m_songs:
                    return (
                        f"Based on your library and liked tracks (including **{primary_title}**), you love soulful tracks "
                        f"with rich harmonic depth and captivating rhythm!\n\n"
                        f"Here are personalized tracks matching your sound signature:\n\n"
                        f"Click any track to stream in Hi-Fi, or say **'more'** for another batch!",
                        [],
                        m_songs[:6]
                    )

        # Check stored memory if liked_titles is empty
        mem_genres = (memory or {}).get('preferredGenres', []) if memory else []
        mem_entities = (memory or {}).get('favoriteEntities', []) if memory else []
        if mem_genres or mem_entities:
            if effective_mode == "movies":
                genre_to_use = mem_genres[0] if mem_genres else "Thriller"
                recs = engine.get_top_genre_movies(genre_to_use, limit=6)
                if not recs:
                    recs = engine.get_movies(genre=genre_to_use, limit=6)
                entity_text = f" and works by **{', '.join(mem_entities[:2])}**" if mem_entities else ""
                return (
                    f"🧠 **Stored Cinema Memory**:\n\n"
                    f"Even with a fresh chat screen, I remember your taste for **{genre_to_use}** films{entity_text}!\n\n"
                    f"Here are personalized recommendations based on your stored cinema profile:\n\n"
                    f"Click **Watch / View Movie** on any card below to launch playback!",
                    recs,
                    []
                )
            else:
                genre_to_use = mem_genres[0] if mem_genres else "Lo-Fi"
                m_songs = engine.get_music(genre=genre_to_use, limit=6)
                artist_text = f" and artists like **{', '.join(mem_entities[:2])}**" if mem_entities else ""
                return (
                    f"🧠 **Stored Music Memory**:\n\n"
                    f"Even with a fresh chat screen, I remember you love **{genre_to_use}** tracks{artist_text}!\n\n"
                    f"Here are personalized tracks calibrated to your saved audio profile:\n\n"
                    f"Click any track below to start playback!",
                    [],
                    m_songs
                )

        # If user does NOT have liked titles yet, ask them conversationally as requested
        if effective_mode == "movies":
            return (
                f"To discover and calibrate your personal taste, tell me: **what kind of movies do you like?**\n\n"
                f"For example, what sounds exciting to you right now?\n"
                f"• ⚡ **Thriller** — gripping suspense, psychological twists & high stakes\n"
                f"• 🚀 **Sci-Fi** — mind-bending concepts & deep cosmic journeys\n"
                f"• 💥 **Action** — high-octane choreography & thrilling spectacles\n"
                f"• 😂 **Comedy** — sharp humor & feel-good laughs\n"
                f"• 🎭 **Drama** — profound emotional journeys & powerful performances\n"
                f"• 👻 **Horror** — spine-chilling atmospheric dread\n\n"
                f"Just reply with your favorite genre (like *\"Thriller\"* or *\"Sci-Fi\"*), and I will immediately curate the best movies for you!",
                [],
                []
            )
        else:
            return (
                f"To tune into your unique personal frequency, tell me: **what kind of music do you like?**\n\n"
                f"For example, what's your vibe today?\n"
                f"• ☕ **Chill & Lo-Fi** — relaxed beats for studying and unwinding\n"
                f"• ⚡ **Hip-Hop & Rap** — high energy, heavy bass & lyrical flow\n"
                f"• 🎸 **Rock & Alt** — electric riffs & anthemic power\n"
                f"• ✨ **Pop & Trending** — infectious hooks & chart-toppers\n"
                f"• 💖 **Romantic & Soulful** — heartfelt ballads & acoustic warmth\n"
                f"• 🇮🇳 **Bollywood & Desi** — grand melodies & celebratory beats\n\n"
                f"Just reply with what you enjoy (like *\"Lo-Fi\"* or *\"Romantic\"*), and I'll queue up the top tracks for you!",
                [],
                []
            )

    # ── 0.8 Conversational & Greeting Intelligence (Hi, Hello, High, Hey, Meta) ──
    greeting_intent = detect_greeting_intent(message)
    if greeting_intent:
        return get_conversational_response(greeting_intent, agent_name, mode=mode)

    # For compound queries that start with a greeting (e.g. 'hi recommend thriller movies'),
    # strip the leading greeting so downstream intent detectors match cleanly.
    effective_message = strip_leading_greeting(message)
    if not effective_message:
        effective_message = message
    effective_msg_lower = effective_message.lower().strip()

    # ── 1. Determine User Intent: Music vs Cinema (Word-boundary matching) ──
    MOVIE_EXPLICIT_WORDS = ["movie", "movies", "film", "films", "cinema", "directed by", "director", "actor", "actress", "box office", "theatre"]
    MUSIC_EXPLICIT_WORDS = ["song", "songs", "track", "tracks", "music", "singer", "singers", "composer", "album", "audio", "soundtrack", "soundtracks", "playlist", "listen to", "listen"]
    is_explicit_movie = any(re.search(r'(?:\b|^)' + re.escape(w) + r'(?:\b|$)', effective_msg_lower) for w in MOVIE_EXPLICIT_WORDS)
    is_explicit_music = any(re.search(r'(?:\b|^)' + re.escape(w) + r'(?:\b|$)', effective_msg_lower) for w in MUSIC_EXPLICIT_WORDS)

    # =========================================================================
    # A. MUSIC INTENT INTELLIGENCE (Strictly when mode == "music")
    # =========================================================================
    if mode == "music":
        # Check if user explicitly asked for movies while in Music mode
        if is_explicit_movie and not is_explicit_music:
            return (
                f"🎵 **You are currently in Music mode with {agent_name}!**\n\n"
                f"To explore movies, watch trailers, or check director filmographies, please switch to **Cinema mode** using the toggle in the top bar 🎬.\n\n"
                f"Here in Music mode, I can queue up trending hits, curated genres (like **Lo-Fi**, **Hip-Hop**, or **Rock**), and artist discographies for you!",
                [],
                []
            )

        early_entity_type, early_entity_val = find_track_or_artist_in_query(effective_message)

        # 2. Check for Specific Artist
        if early_entity_type == "artist":
            songs_res = engine.get_songs_by_artist(early_entity_val, limit=6)
            if songs_res:
                return (
                    f"Here are top-streamed tracks by 🎤 **{early_entity_val}** available on Zhoosh:\n\n"
                    f"Click any track to stream instantly in lossless Hi-Fi audio! If you want more, just say **'more'**.",
                    [],
                    songs_res
                )

        # 3. Check for Language / Regional Music (Hindi, Punjabi, Global)
        lang_title, lang_songs = detect_music_language_in_query(effective_message)
        if lang_songs:
            return (
                f"Here are top {lang_title} tracks curated for you on Zhoosh:\n\n"
                f"Click any track below to launch instant playback! If you want more, say **'more'**.",
                [],
                lang_songs[:6]
            )

        # 4. Check for Mood Music (Sad, Romantic, Party, Workout, Chill)
        mood_title, mood_songs = detect_music_mood_in_query(effective_message)
        if mood_songs:
            return (
                f"Here are {mood_title} tracks curated for your vibe on Zhoosh:\n\n"
                f"Click any track below to launch playback! If you want more, say **'more'**.",
                [],
                mood_songs[:6]
            )

        # 5. Check for Specific Music Genre (Hip-Hop, Rock, Pop, Lo-Fi, etc.)
        music_genre = detect_music_genre_in_query(effective_message)
        if music_genre:
            if music_genre == 'Romantic':
                songs_res = engine.get_romantic_recommendations(limit=6)
            else:
                songs_res = engine.get_music(genre=music_genre, limit=6)
                
            if songs_res:
                return (
                    f"You love **{music_genre}**? Then you definitely need to listen to these {music_genre} tracks on Zhoosh Music:\n\n"
                    f"Click any track below to launch lossless Hi-Fi playback! If you want more, just say **'more'**.",
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
                f"Click any track to listen! If you want more, say **'more'**.",
                [],
                all_songs
            )

        # 7. Check for Trending / Top Songs
        if any(w in effective_msg_lower for w in ["trending", "top", "popular", "best songs", "best tracks", "what should i listen to", "recommend something"]):
            trending = engine.get_music(limit=6)
            if trending:
                return (
                    f"Here are the top trending tracks right now on Zhoosh Music:\n\n"
                    f"Click on any track to start instant playback with Hi-Fi audio! Say **'more'** for another batch.",
                    [],
                    trending
                )

        # 8. Search fallback for music
        search_res = engine.search_all(effective_message, mode='music')
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
    # B. CINEMA INTENT INTELLIGENCE (Strictly Cinema mode, NO songs returned)
    # =========================================================================
    # Check if user explicitly asked for music / songs while in Cinema mode
    early_entity_type, early_entity_val = find_track_or_artist_in_query(message)
    if (is_explicit_music and not is_explicit_movie) or (early_entity_type in ["artist", "track"] and not is_explicit_movie):
        return (
            f"🎬 **You are currently in Cinema mode with {agent_name}!**\n\n"
            f"To discover music tracks, browse artist discographies, and stream lossless audio, please switch to **Music mode** using the toggle in the top bar 🎵.\n\n"
            f"Here in Cinema mode, I can recommend acclaimed feature films, actors, directors, and storylines! What genre (like **Romance**, **Sci-Fi**, or **Thriller**) sounds good to you today?",
            [],
            []
        )
    # 1. Check for predicted / temporal queries
    if any(w in effective_msg_lower for w in ["predict", "predicted", "forecast", "tomorrow", "yesterday"]):
        trending = engine.get_movies(limit=6) if engine else []
        movies_res = trending
        return (
            f"🔮 **Predictive Cinema Intelligence**:\n\n"
            f"Based on our predictive neural engine and your calibrated viewing preferences, here are the top predicted feature films lined up for you:\n\n"
            f"Feel free to click **Watch / View Movie** on any card below to launch full 4K streaming!",
            movies_res,
            []
        )

    # 2. Check for Movie Genre Query (Horror, Comedy, Thriller, Sci-Fi, Action, Romance, etc.)
    genre = detect_genre_in_query(effective_message)
    if genre:
        top_genre_movies = engine.get_top_genre_movies(genre, limit=6)
        if not top_genre_movies:
            top_genre_movies = engine.get_movies(genre=genre, limit=6)
        if top_genre_movies:
            movies_res = top_genre_movies
            return (
                f"You like **{genre}**? Then you definitely need to watch these {genre} movies on Zhoosh:\n\n"
                f"Click **Watch / View Movie** on any card below to start streaming! If you want more, just say **'more'**.",
                movies_res,
                []
            )

    # 3. Check for Movie Language (Hindi, Korean, Anime)
    movie_lang_title, movie_lang_results = detect_movie_language_in_query(effective_message)
    if movie_lang_results:
        return (
            f"Here are top-rated {movie_lang_title} films curated for you on Zhoosh:\n\n"
            f"Click **Watch / View Movie** on any card below to start streaming! Say **'more'** for more titles.",
            movie_lang_results,
            []
        )

    # 4. Check for Director / Actor Filmography Query
    person_type, person_name = detect_person_in_query(effective_message)
    if person_type == "director" and engine.movies_df is not None:
        matched = engine.movies_df[engine.movies_df['director'].str.lower().str.contains(person_name.lower(), na=False)]
        if not matched.empty:
            top_works = matched.sort_values(by='vote_count', ascending=False).head(6)
            movies_res = [engine._format_movie_row(row) for _, row in top_works.iterrows()]
            return (
                f"Here are the top critically acclaimed films directed by **{person_name}** available on Zhoosh:\n\n"
                f"Click on any film below to watch the trailer or start streaming! If you want more, say **'more'**.",
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
                f"Click on any movie below to view details and stream in 4K! Say **'more'** for another batch.",
                movies_res,
                []
            )

    # 5. Check for specific movie match & recommendations
    movie = find_movie_in_query(effective_message)
    if movie is not None:
        title = str(movie['title'])
        director = str(movie.get('director', 'Acclaimed Director'))
        cast = str(movie.get('cast', 'Star-studded ensemble'))
        year = str(movie.get('year', 2020))
        overview = str(movie.get('overview', 'A cinematic masterpiece.'))
        vote_avg = float(movie.get('vote_average', 8.0))
        genres = str(movie.get('genres_str', movie.get('genres', 'Drama, Thriller')))
        
        # Similar / Recommendation Question
        if any(w in effective_msg_lower for w in ["similar", "like", "recommend", "suggest", "more like"]):
            recs = engine.recommend_movies_for_title(title, top_n=6)
            movies_res = recs or []
            return (
                f"If you loved 🎬 **{title}** ({year}), here are exceptional films with matching atmosphere, narrative depth, and critical acclaim:\n\n"
                f"You can click on any card below to stream directly in 4K Ultra HD on Zhoosh! If you want more, say **'more'**.",
                movies_res,
                []
            )
                
        # Director Question
        if any(w in effective_msg_lower for w in ["who directed", "director of", "director", "who made"]):
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
        if any(w in effective_msg_lower for w in ["who is in", "cast of", "starring", "actor", "actors in", "who acted"]):
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

    # 6. Check for Movie Mood & Situational Requests (Travelling, College Days, Adrenaline, Sad/Tired, Happy)
    movie_mood_title, movie_mood_results = detect_movie_mood_in_query(effective_message)
    if movie_mood_results:
        return (
            f"Here are {movie_mood_title} films curated for you on Zhoosh:\n\n"
            f"Click **Watch / View Movie** on any card below to launch playback! Say **'more'** for another batch.",
            movie_mood_results,
            []
        )

    # 7. Check for Trending / Top Movies
    if any(w in effective_msg_lower for w in ["trending", "top", "popular", "best movies", "what should i watch", "recommend something", "suggest"]):
        trending = engine.get_movies(limit=6)
        if trending:
            movies_res = trending
            return (
                f"Here are the top trending movies right now on Zhoosh:\n\n"
                f"Click on any card to view synopsis, trailer, and launch playback! If you want more, just say **'more'**.",
                movies_res,
                []
            )

    # 8. Fallback with context search in catalog
    search_res = engine.search_all(effective_message)
    if search_res.get('movies'):
        movies_res = search_res['movies'][:6]
        return (
            f"Based on \"{message}\", here are the closest matches in our cinema library:\n\n"
            f"Click any title below to begin streaming! Say **'more'** for more matches.",
            movies_res,
            []
        )

    return (
        f"I'm here to help you navigate Zhoosh's cinema and music catalog!\n\n"
        f"You can ask me to suggest movies by genre (such as **Thriller**, **Comedy**, **Sci-Fi**, or **Horror**), "
        f"explore films by director (like **Christopher Nolan** or **Quentin Tarantino**), "
        f"or ask _\"What kind of movies do I like?\"_ to calibrate your personal taste.",
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

async def groq_stream(message: str, history: List[ConversationMessage], agent_name: str, intent: str, mode: str = "movies", liked_titles: Optional[List[str]] = None, memory: Optional[dict] = None):
    """Stream grounded response via Groq if available, or dataset-backed engine."""
    # Dataset-grounded intelligent response with structured movies & songs
    response_text, movies, songs = generate_grounded_response(
        message,
        agent_name,
        mode=mode,
        history=history,
        liked_titles=liked_titles,
        memory=memory
    )
    
    if movies:
        yield f"data: {json.dumps({'type': 'movies', 'movies': movies})}\n\n"
    if songs:
        yield f"data: {json.dumps({'type': 'songs', 'songs': songs})}\n\n"

    yield f"data: {json.dumps({'type': 'intent', 'intent': 'grounded_response'})}\n\n"

    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        try:
            from groq import AsyncGroq
            client = AsyncGroq(api_key=groq_api_key)
            
            # Formulate prompt for full intelligence
            system_prompt = f"You are {agent_name}, an intelligent, sassy, and friendly AI assistant for Zhoosh, a modern streaming platform. Keep your responses short, witty, and engaging. "
            if movies:
                titles = [m.get('title', '') for m in movies]
                system_prompt += f"You are showing the user these movies: {', '.join(titles)}. Recommend them naturally! "
            elif songs:
                titles = [s.get('title', '') for s in songs]
                system_prompt += f"You are showing the user these songs: {', '.join(titles)}. Recommend them naturally! "
            else:
                system_prompt += f"The backend suggested this base response: '{response_text}'. Use it as inspiration but rewrite it to sound conversational and empathetic."

            messages = [{"role": "system", "content": system_prompt}]
            
            # Append limited history
            for h in history[-4:]:
                role = "assistant" if h.role == "agent" else "user"
                messages.append({"role": role, "content": h.content})
                
            messages.append({"role": "user", "content": message})
            
            stream = await client.chat.completions.create(
                model="llama3-8b-8192",
                messages=messages,
                stream=True,
                max_tokens=200,
                temperature=0.7
            )
            
            async for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    yield f"data: {json.dumps({'type': 'token', 'content': content})}\n\n"
                    
            yield f"data: {json.dumps({'type': 'done', 'intent': 'done'})}\n\n"
            return
        except Exception as e:
            print(f"Groq API Error: {e}")
            # Fallback to standard response if Groq fails
            pass

    async for chunk in stream_text_words(response_text, delay_ms=18):
        yield chunk

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/chat")
async def agent_chat(req: AgentChatRequest):
    """Stream agent response word-by-word via SSE."""
    return StreamingResponse(
        groq_stream(req.message, req.history, req.agent_name, "chat", mode=req.mode, liked_titles=req.liked_titles, memory=req.memory),
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
