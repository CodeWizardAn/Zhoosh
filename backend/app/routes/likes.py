from fastapi import APIRouter
from backend.app.models import LikeRequest
from typing import Dict

router = APIRouter(prefix="/likes", tags=["Likes"])

# In-memory likes store
LIKES_DB: Dict[str, bool] = {
    'm-dune2': True,
    'm-interstellar': True,
    '4cOdK2wGLETKBW3PvgPWqT': True
}

@router.get("")
def get_likes():
    return LIKES_DB

@router.post("")
def toggle_like(req: LikeRequest):
    current = LIKES_DB.get(req.id, False)
    new_state = not current
    LIKES_DB[req.id] = new_state
    return {'id': req.id, 'liked': new_state}
