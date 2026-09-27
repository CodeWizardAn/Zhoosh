from fastapi import APIRouter
import re
from backend.app.models import VoiceSearchRequest, VoiceSearchResponse
from backend.app.recommender import engine

router = APIRouter(prefix="/voice-search", tags=["Voice Search"])

@router.post("", response_model=VoiceSearchResponse)
def voice_search(req: VoiceSearchRequest):
    mode = req.mode or "movies"
    q_lower = req.query.lower().strip()

    # Intelligent intent detection: if query explicitly mentions music/songs or artists
    music_keywords = ["song", "songs", "track", "tracks", "music", "singer", "singers", "composer", "album", "audio", "soundtrack", "soundtracks", "listen", "play", "sing"]
    if any(re.search(r'(?:\b|^)' + re.escape(w) + r'(?:\b|$)', q_lower) for w in music_keywords):
        mode = "music"

    results = engine.search_all(req.query, mode=mode)
    
    if mode == "music":
        combined = []
        if results.get('primary_song'):
            combined.append(results['primary_song'])
        combined.extend(results.get('similar_romantic_songs', []))
        combined.extend(results.get('artist_songs', []))
        combined.extend(results.get('similar_songs', []))
        combined.extend(results.get('music', []))
        
        # Deduplicate by song ID
        seen = set()
        deduped = []
        for s in combined:
            s_id = str(s.get('id', ''))
            if s_id and s_id not in seen:
                seen.add(s_id)
                deduped.append(s)
        
        if not deduped:
            deduped = engine.get_music(limit=8)
            
        return VoiceSearchResponse(query=req.query, results=deduped)
    else:
        combined = []
        if results.get('primary_movie'):
            combined.append(results['primary_movie'])
        combined.extend(results.get('similar_movies', []))
        combined.extend(results.get('genre_top_movies', []))
        combined.extend(results.get('movies', []))
        
        seen = set()
        deduped = []
        for m in combined:
            m_id = str(m.get('id', ''))
            if m_id and m_id not in seen:
                seen.add(m_id)
                deduped.append(m)
                
        if not deduped:
            deduped = engine.get_movies(limit=8)
            
        return VoiceSearchResponse(query=req.query, results=deduped)

