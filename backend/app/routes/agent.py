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
        'rock music', 'hype', 'hyped', 'pump', 'workout', 'gym', 'banger', 'electric'
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
    if any(k in q_lower for k in ['party', 'dance', 'club', 'banger', 'celebrate', 'upbeat']):
        party_titles = ['humble.', 'sicko mode', 'blinding lights', 'starboy', 'shape of you', 'hotline bling', 'die with a smile']
        df = engine.music_df[engine.music_df['track_name'].str.lower().apply(lambda t: any(s in t for s in party_titles)) | (engine.music_df['danceability'] >= 0.70)]
        formatted = [engine._format_song_row(row, match_pct=99, rationale=f"High-octane party anthem: '{row['track_name']}' by {row['artists']}.") for _, row in df.iterrows()]
        return "⚡ **Party & Dance**", formatted[:6]

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

    # 3. Exciting / Thrilling / Action / Adrenaline
    if any(k in q_lower for k in [
        'exciting', 'thrilling', 'thriller', 'adrenaline', 'edge of my seat',
        'edge of seat', 'mind-blowing', 'mind blowing', 'action packed', 'intense', 'hype', 'hyped'
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
                        rationale=f"Electrifying high-octane thriller: '{r['title']}'."
                    ))
                    seen.add(r['title'].lower())
        return "⚡ **Exciting & High-Octane Thrillers**", selected[:6]

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

    # ── 1. Determine User Intent: Music vs Cinema ──
    is_explicit_movie = any(w in msg_lower for w in ["movie", "movies", "film", "films", "cinema", "directed by", "director", "actor", "actress", "box office", "theatre"])
    is_explicit_music = any(w in msg_lower for w in ["song", "songs", "track", "tracks", "music", "singer", "singers", "composer", "album", "audio", "soundtrack", "soundtracks", "playlist", "listen", "listen to", "play"])

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

        early_entity_type, early_entity_val = find_track_or_artist_in_query(message)

        # 1. Greetings
        if re.search(r'\b(hello|hi|hey|who are you|what is your name|your name|what\'s your name|help|who r u)\b', msg_lower):
            return (
                f"Hello! I am **{agent_name}**, your dedicated AI Music & Audio Intelligence guide on Zhoosh.\n\n"
                f"I have real-time access to our entire catalog of tracks, artists, genres, and audio features (tempo, energy, acousticness, and valence). Here is what you can ask me:\n"
                f"• _\"What kind of music do I like?\"_ (for personalized taste discovery)\n"
                f"• _\"Arijit Singh songs\"_ or _\"Coldplay tracks\"_\n"
                f"• _\"Suggest Lo-Fi songs\"_ (say _\"more\"_ anytime for next batch)\n"
                f"• _\"Hindi songs\"_ or _\"Punjabi music\"_\n"
                f"• _\"Sad songs for when you're feeling down\"_\n"
                f"• _\"High-energy gym tracks\"_ or _\"Romantic melodies\"_\n\n"
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
                    f"Click any track to stream instantly in lossless Hi-Fi audio! If you want more, just say **'more'**.",
                    [],
                    songs_res
                )

        # 3. Check for Language / Regional Music (Hindi, Punjabi, Global)
        lang_title, lang_songs = detect_music_language_in_query(message)
        if lang_songs:
            return (
                f"Here are top {lang_title} tracks curated for you on Zhoosh:\n\n"
                f"Click any track below to launch instant playback! If you want more, say **'more'**.",
                [],
                lang_songs[:6]
            )

        # 4. Check for Mood Music (Sad, Romantic, Party, Workout, Chill)
        mood_title, mood_songs = detect_music_mood_in_query(message)
        if mood_songs:
            return (
                f"Here are {mood_title} tracks curated for your vibe on Zhoosh:\n\n"
                f"Click any track below to launch playback! If you want more, say **'more'**.",
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
        if any(w in msg_lower for w in ["trending", "top", "popular", "best songs", "best tracks", "what should i listen to", "recommend something"]):
            trending = engine.get_music(limit=6)
            if trending:
                return (
                    f"Here are the top trending tracks right now on Zhoosh Music:\n\n"
                    f"Click on any track to start instant playback with Hi-Fi audio! Say **'more'** for another batch.",
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
    # B. CINEMA INTENT INTELLIGENCE (Strictly Cinema mode, NO songs returned)
    # =========================================================================
    # Check if user explicitly asked for music / songs while in Cinema mode
    early_entity_type, early_entity_val = find_track_or_artist_in_query(message)
    if (is_explicit_music and not is_explicit_movie) or (early_entity_type == "artist" and not is_explicit_movie):
        return (
            f"🎬 **You are currently in Cinema mode with {agent_name}!**\n\n"
            f"To discover music tracks, browse artist discographies, and stream lossless audio, please switch to **Music mode** using the toggle in the top bar 🎵.\n\n"
            f"Here in Cinema mode, I can recommend acclaimed feature films, actors, directors, and storylines! What genre (like **Romance**, **Sci-Fi**, or **Thriller**) sounds good to you today?",
            [],
            []
        )
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

    # 2. Check for Movie Mood & Situational Requests (Travelling, College Days, Thrillers, Sad/Tired, Happy)
    movie_mood_title, movie_mood_results = detect_movie_mood_in_query(message)
    if movie_mood_results:
        return (
            f"Here are {movie_mood_title} films curated for you on Zhoosh:\n\n"
            f"Click **Watch / View Movie** on any card below to launch playback! Say **'more'** for another batch.",
            movie_mood_results,
            []
        )

    # 3. Check for specific movie match
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
                f"You can click on any card below to stream directly in 4K Ultra HD on Zhoosh! If you want more, say **'more'**.",
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

    # 4. Check for Movie Language (Hindi, Korean, Anime)
    movie_lang_title, movie_lang_results = detect_movie_language_in_query(message)
    if movie_lang_results:
        return (
            f"Here are top-rated {movie_lang_title} films curated for you on Zhoosh:\n\n"
            f"Click **Watch / View Movie** on any card below to start streaming! Say **'more'** for more titles.",
            movie_lang_results,
            []
        )

    # 5. Check for Movie Genre Query (Horror, Comedy, Thriller, Sci-Fi, etc.)
    genre = detect_genre_in_query(message)
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

    # 7. Check for Trending / Top Movies
    if any(w in msg_lower for w in ["trending", "top", "popular", "best movies", "what should i watch", "recommend something", "suggest"]):
        trending = engine.get_movies(limit=6)
        if trending:
            movies_res = trending
            return (
                f"Here are the top trending movies right now on Zhoosh:\n\n"
                f"Click on any card to view synopsis, trailer, and launch playback! If you want more, just say **'more'**.",
                movies_res,
                []
            )

    # 8. Conversational / Greetings (Word boundary check)
    if re.search(r'\b(hello|hi|hey|who are you|what is your name|your name|what\'s your name|help|who r u)\b', msg_lower):
        return (
            f"Hello! I am **{agent_name}**, your dedicated AI Cinema & Soundtrack Intelligence guide on Zhoosh.\n\n"
            f"I have real-time access to our entire catalog of films, directors, ratings, and soundtracks. Here is what you can ask me:\n"
            f"• _\"What kind of movies do I like?\"_ (for personalized taste discovery)\n"
            f"• _\"Suggest some thriller movies\"_ (and say _\"more\"_ for the next batch)\n"
            f"• _\"Suggest comedy movies\"_ or _\"Sci-Fi films\"_\n"
            f"• _\"Suggest movies like Inception\"_\n"
            f"• _\"Hindi movies\"_ or _\"Mind-bending movies\"_\n"
            f"• _\"Who directed Interstellar?\"_\n\n"
            f"What would you like to explore today?",
            [],
            []
        )

    # 9. Fallback with context search in catalog
    search_res = engine.search_all(message)
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
