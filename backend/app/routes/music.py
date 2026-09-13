from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.app.recommender import engine
from backend.app.models import SongItem

router = APIRouter(prefix="/music", tags=["Music"])

@router.get("", response_model=List[SongItem])
def list_music(genre: Optional[str] = Query(None, description="Filter by genre"), limit: int = 24):
    songs = engine.get_music(genre=genre, limit=limit)
    return songs

@router.get("/{track_id}/similar", response_model=List[SongItem])
def get_similar_tracks(track_id: str, limit: int = 6):
    return engine.recommend_music_by_audio_features(track_id, top_n=limit)
