from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.app.recommender import engine
from backend.app.models import MovieItem

router = APIRouter(prefix="/movies", tags=["Movies"])

@router.get("", response_model=List[MovieItem])
def list_movies(
    genre: Optional[str] = Query(None, description="Filter by genre"),
    language: Optional[str] = Query(None, description="Filter by language"),
    limit: int = Query(600, description="Max movies to return")
):
    # Automatically reload if in-memory dataset has outdated poster hashes
    if engine.movies_df is not None and not engine.movies_df.empty:
        if len(engine.movies_df) > 3 and 'zq8Cl3PNIDGU3i' not in str(engine.movies_df.iloc[3]['poster_path']):
            print("[Movies Router] In-memory dataset is outdated. Reloading from disk...")
            engine.load_and_train()
    movies = engine.get_movies(genre=genre, language=language, limit=limit)
    return movies

@router.get("/{movie_id}", response_model=MovieItem)
def get_movie(movie_id: str):
    movie = engine.get_movie_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie

@router.get("/{movie_id}/recommendations", response_model=List[MovieItem])
def get_movie_recommendations(
    movie_id: str,
    limit: int = 6,
    title: Optional[str] = Query(None, description="Optional title fallback")
):
    movie = engine.get_movie_by_id(movie_id)
    search_title = None
    if movie:
        search_title = movie.get('title')
    elif title:
        search_title = title
    else:
        clean_slug = movie_id.replace("hero-", "").replace("m-", "").replace("-", " ")
        search_title = clean_slug

    if not search_title:
        raise HTTPException(status_code=404, detail="Movie not found")
    return engine.recommend_movies_for_title(search_title, top_n=limit, exclude_id=str(movie_id))

