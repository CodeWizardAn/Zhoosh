from fastapi import APIRouter, Query
from typing import Dict, Any
from backend.app.recommender import engine

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("")
def search(q: str = Query(..., description="Search query string"), mode: str = Query("movies")):
    return engine.search_all(q)
