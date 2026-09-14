from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routes import (
    movies,
    music,
    recommendations,
    playlists,
    likes,
    search,
    voice_search,
    auth,
    agent
)

app = FastAPI(
    title="Zhoosh API",
    description="Unified Movie & Music AI Recommendation Platform Backend",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers under /api
app.include_router(movies.router, prefix="/api")
app.include_router(music.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(playlists.router, prefix="/api")
app.include_router(likes.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(voice_search.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(agent.router, prefix="/api")

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "AuraStream ML Recommendation Backend",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "loaded"}

@app.get("/api/admin/reload")
def reload_data():
    from backend.app.recommender import engine
    engine.load_and_train()
    return {"status": "reloaded", "total_movies": len(engine.movies_df) if engine.movies_df is not None else 0}

