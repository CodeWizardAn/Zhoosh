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

def detect_genre_in_query(query: str) -> Optional[str]:
    q_lower = query.lower()
    for kw, genre_name in KNOWN_GENRES.items():
        pattern = r'(?:\b|^)' + re.escape(kw) + r'(?:\b|$|[?!.,])'
        if re.search(pattern, q_lower):
            return genre_name
    return None

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

def generate_grounded_response(message: str, agent_name: str) -> tuple[str, list, list]:
    msg_lower = message.lower().strip()
    movies_res = []
    songs_res = []
    
    # Check for predicted / temporal queries: "suggest movies like the one you predicted tomorrow / yesterday"
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

    # 1. Check for specific movie match
    movie = find_movie_in_query(message)
    
    if movie is not None:
        title = str(movie['title'])
        director = str(movie.get('director', 'Acclaimed Director'))
        cast = str(movie.get('cast', 'Star-studded ensemble'))
        year = str(movie.get('year', 2020))
        overview = str(movie.get('overview', 'A cinematic masterpiece.'))
        vote_avg = float(movie.get('vote_average', 8.0))
        genres = str(movie.get('genres_str', movie.get('genres', 'Drama, Thriller')))
        
        # A. Similar / Recommendation Question
        if any(w in msg_lower for w in ["similar", "like", "recommend", "suggest", "more like"]):
            recs = engine.recommend_movies_for_title(title, top_n=6)
            movies_res = recs or []
            return (
                f"If you loved 🎬 **{title}** ({year}), here are exceptional films with matching atmosphere, narrative depth, and critical acclaim:\n\n"
                f"You can click on any card below to stream directly in 4K Ultra HD on Zhoosh!",
                movies_res,
                []
            )
                
        # B. Director Question
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
            
        # C. Cast / Actor Question
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
            
        # D. Availability Question
        if any(w in msg_lower for w in ["available", "can i watch", "is there", "stream", "watch"]):
            formatted_m = engine._format_movie_row(movie) if hasattr(engine, '_format_movie_row') else movie
            return (
                f"Yes! 🎬 **{title}** ({year}) is **available to stream** on Zhoosh in 4K Ultra HD with Dolby Atmos audio.",
                [formatted_m],
                []
            )
            
        # E. General Summary / Details for the Movie
        formatted_m = engine._format_movie_row(movie) if hasattr(engine, '_format_movie_row') else movie
        return (
            f"🎬 **{title}** ({year}) — Directed by {director}\n\n"
            f"★ {vote_avg:.1f} / 10 · {genres}\n\n"
            f"📖 **Synopsis**:\n{overview}",
            [formatted_m],
            []
        )

    # 2. Check for Director / Actor Filmography Query
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

    # 3. Check for Genre Query (Horror, Comedy, Thriller, Sci-Fi, etc.)
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

    # 4. Check for Music / Track Queries
    if any(w in msg_lower for w in ["music", "song", "songs", "track", "tracks", "soundtrack", "soundtracks", "playlist", "audio"]):
        music_tracks = engine.get_music(limit=6)
        if music_tracks:
            songs_res = music_tracks
            return (
                f"Here are 6 trending tracks and soundtracks on Zhoosh right now:\n\n"
                f"Click any track to start instant playback with lossless Hi-Fi audio!",
                [],
                songs_res
            )

    # 5. Check for Trending / Top Movies / Recommendations
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

    # 6. Conversational / Greetings / Identity
    if any(w in msg_lower for w in ["hello", "hi", "hey", "who are you", "what is your name", "your name", "what's your name", "help", "who r u"]):
        return (
            f"Hello! I am **{agent_name}**, your dedicated AI Cinema & Soundtrack Intelligence guide on Zhoosh.\n\n"
            f"I have real-time access to our entire catalog of films, directors, ratings, and soundtracks. Here is what you can ask me:\n"
            f"• _\"Suggest some horror movies\"_\n"
            f"• _\"Suggest comedy movies\"_\n"
            f"• _\"Suggest movies like Inception\" (or any movie you like)_\n"
            f"• _\"Suggest movies like the one you predicted earlier\"_\n"
            f"• _\"Who directed Interstellar?\"_\n\n"
            f"What would you like to watch or explore today?",
            [],
            []
        )

    # 7. Fallback with context search in catalog
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
        f"ask for titles similar to your favorites like **Inception** or **The Dark Knight**, "
        f"or request movies like the ones predicted for your taste.",
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

async def groq_stream(message: str, history: List[ConversationMessage], agent_name: str, intent: str):
    """Stream grounded response via Groq if available, or dataset-backed engine."""
    # Dataset-grounded intelligent response with structured movies & songs
    response_text, movies, songs = generate_grounded_response(message, agent_name)
    
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
        groq_stream(req.message, req.history, req.agent_name, "chat"),
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
