from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from backend.app.models import PlaylistModel, PlaylistCreateRequest
import time

router = APIRouter(prefix="/playlists", tags=["Playlists"])

# In-memory session store
PLAYLISTS_DB: List[Dict[str, Any]] = [
    {
        'id': 'pl-cinematic',
        'title': 'Dune & Sci-Fi Universe',
        'description': 'Atmospheric scores and high concept space epics.',
        'mode': 'movies',
        'items': [],
        'created_at': '2025-01-15',
        'cover_art': 'https://image.tmdb.org/t/p/w780/1pdfLvk8qq9ZmgYCuIRQbgx9hUt.jpg'
    },
    {
        'id': 'pl-focus',
        'title': 'Midnight Coding Flow',
        'description': 'Deep synthwave, ambient lofi, and focus grooves.',
        'mode': 'music',
        'items': [],
        'created_at': '2025-02-01',
        'cover_art': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'
    }
]

@router.get("", response_model=List[PlaylistModel])
def list_playlists():
    return PLAYLISTS_DB

@router.post("", response_model=PlaylistModel)
def create_playlist(req: PlaylistCreateRequest):
    new_pl = {
        'id': f"pl-{int(time.time()*1000)}",
        'title': req.title,
        'description': req.description or 'Custom mix',
        'mode': req.mode,
        'items': [],
        'created_at': '2025-03-01',
        'cover_art': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80'
    }
    PLAYLISTS_DB.insert(0, new_pl)
    return new_pl

@router.post("/{playlist_id}/items")
def add_item_to_playlist(playlist_id: str, item: Dict[str, Any]):
    for pl in PLAYLISTS_DB:
        if pl['id'] == playlist_id:
            if not any(str(i.get('id')) == str(item.get('id')) for i in pl['items']):
                pl['items'].append(item)
            return {'success': True, 'playlist': pl}
    raise HTTPException(status_code=404, detail="Playlist not found")

@router.delete("/{playlist_id}/items/{item_id}")
def remove_item_from_playlist(playlist_id: str, item_id: str):
    for pl in PLAYLISTS_DB:
        if pl['id'] == playlist_id:
            pl['items'] = [i for i in pl['items'] if str(i.get('id')) != str(item_id)]
            return {'success': True, 'playlist': pl}
    raise HTTPException(status_code=404, detail="Playlist not found")
