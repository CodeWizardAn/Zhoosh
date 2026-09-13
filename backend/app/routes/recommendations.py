from fastapi import APIRouter, Query
from typing import List, Any
from backend.app.recommender import engine

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[Any])
def get_recommendations(mode: str = Query("movies", description="Platform mode: 'movies' or 'music'")):
    return engine.cross_modal_recommend(mode=mode)
