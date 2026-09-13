from fastapi import APIRouter
from backend.app.models import VoiceSearchRequest, VoiceSearchResponse
from backend.app.recommender import engine

router = APIRouter(prefix="/voice-search", tags=["Voice Search"])

@router.post("", response_model=VoiceSearchResponse)
def voice_search(req: VoiceSearchRequest):
    results = engine.search_all(req.query)
    combined = results['movies'] + results['music']
    if not combined:
        combined = engine.cross_modal_recommend('movies')[:4] + engine.cross_modal_recommend('music')[:4]
    return VoiceSearchResponse(query=req.query, results=combined)
