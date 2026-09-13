from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.app.recommender import engine
from backend.app.models import MovieItem

router = APIRouter(prefix="/movies", tags=["Movies"])

@router.get("", response_model=List[MovieItem])
def list_movies(genre: Optional[str] = Query(None, description="Filter by genre"), limit: int = 24):
    movies = engine.get_movies(genre=genre, limit=limit)
    return movies

@router.get("/{movie_id}", response_model=MovieItem)
def get_movie(movie_id: str):
    movie = engine.get_movie_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie

@router.get("/{movie_id}/recommendations", response_model=List[MovieItem])
def get_movie_recommendations(movie_id: str, limit: int = 6):
    movie = engine.get_movie_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return engine.recommend_movies_for_title(movie['title'], top_n=limit)
