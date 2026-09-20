from pydantic import BaseModel, Field
from typing import List, Optional, Any

class MovieItem(BaseModel):
    id: str
    title: str
    overview: str
    poster_path: str
    backdrop_path: Optional[str] = None
    release_date: str
    vote_average: float
    genres: List[str] = []
    director: Optional[str] = None
    cast: List[str] = []
    year: Optional[int] = None
    language: Optional[str] = None
    runtime: Optional[int] = 140
    match_score: Optional[int] = 95
    agent_rationale: Optional[str] = None

class SongItem(BaseModel):
    id: str
    title: str
    artist: str
    album: str
    album_art: str
    duration_sec: int
    genre: str
    plays: Optional[str] = None
    match_score: Optional[int] = 95
    agent_rationale: Optional[str] = None

class PlaylistModel(BaseModel):
    id: str
    title: str
    description: str
    mode: str
    items: List[Any] = []
    created_at: str
    cover_art: Optional[str] = None

class PlaylistCreateRequest(BaseModel):
    title: str
    description: Optional[str] = 'Custom mix'
    mode: str = 'movies'

class LikeRequest(BaseModel):
    id: str
    mode: str

class VoiceSearchRequest(BaseModel):
    query: str

class VoiceSearchResponse(BaseModel):
    query: str
    results: List[Any]

class UserAuthRequest(BaseModel):
    email: str
    name: Optional[str] = None
    password: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar: str
    role: str
    token: Optional[str] = None
