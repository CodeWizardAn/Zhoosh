from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import json
import time
import asyncio
import os
import random

router = APIRouter(prefix="/agent", tags=["Agent"])

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class ConversationMessage(BaseModel):
    role: str  # 'user' | 'agent'
    content: str

class AgentChatRequest(BaseModel):
    user_id: str = "u-101"
    agent_name: str = "Nova"
    message: str
    history: List[ConversationMessage] = []

class AgentProfileRequest(BaseModel):
    user_id: str
    agent_name: str
    avatar_url: Optional[str] = "/agent-avatar.jpg"

# ---------------------------------------------------------------------------
# Intent Detection (lightweight keyword matching)
# ---------------------------------------------------------------------------

TRENDING_KEYWORDS = ["trending", "top 5", "top 10", "best", "popular", "hot right now", "what's new", "new this week"]
AVAILABILITY_KEYWORDS = ["available", "can i watch", "is there", "do you have", "find me"]
RECOMMENDATION_KEYWORDS = ["recommend", "suggest", "similar to", "like", "based on my taste", "i'd enjoy", "something like"]
HISTORY_KEYWORDS = ["watched", "listened", "my history", "last week", "i saw", "i played"]
METADATA_KEYWORDS = ["who directed", "who sang", "runtime", "release date", "cast", "starring", "genre"]

def detect_intent(message: str) -> str:
    msg = message.lower()
    if any(kw in msg for kw in TRENDING_KEYWORDS):
        return "trending"
    if any(kw in msg for kw in AVAILABILITY_KEYWORDS):
        return "availability"
    if any(kw in msg for kw in RECOMMENDATION_KEYWORDS):
        return "recommendation"
    if any(kw in msg for kw in HISTORY_KEYWORDS):
        return "history"
    if any(kw in msg for kw in METADATA_KEYWORDS):
        return "metadata"
    return "conversational"

# ---------------------------------------------------------------------------
# Rich Mock Response Generator (used when Groq key is absent / backend offline)
# ---------------------------------------------------------------------------

MOCK_RESPONSES = {
    "trending": [
        "Here are the **top trending movies** right now on Zhoosh:\n\n1. 🎬 **Dune: Part Two** — Score: 98 · Epic sci-fi, stunning visuals\n2. 🎬 **Oppenheimer** — Score: 97 · Historical thriller, IMAX masterpiece\n3. 🎬 **The Batman** — Score: 95 · Dark noir, brooding atmosphere\n4. 🎬 **Everything Everywhere** — Score: 94 · Multiverse comedy-drama\n5. 🎬 **Interstellar** — Score: 93 · Mind-bending space odyssey\n\nWant me to pull up any of these in detail?",
        "Top 5 trending tracks on Zhoosh right now:\n\n1. 🎵 **Blinding Lights** — The Weeknd · Synthwave pop\n2. 🎵 **Levitating** — Dua Lipa · Disco-pop banger\n3. 🎵 **As It Was** — Harry Styles · Indie pop\n4. 🎵 **Heat Waves** — Glass Animals · Dream pop\n5. 🎵 **Cruel Summer** — Taylor Swift · Electric pop\n\nShall I queue any of these up for you?",
    ],
    "availability": [
        "Yes! That title **is available** on Zhoosh in your region. You can stream it in 4K Ultra HD on your Standard plan. Want me to pull up the full details — cast, runtime, and similar picks?",
        "I checked and that title is **currently available** in our catalog. It's rated highly by users with your taste profile — 94% match for you. Should I queue it up or find something similar?",
        "That one's **in the Zhoosh library** ✓. Available in 1080p Full HD. Runtime is approximately 2h 15m. Would you like the full details or similar recommendations?",
    ],
    "recommendation": [
        "Based on your watch history and preferences, here are **5 picks curated just for you**:\n\n1. 🎬 **Arrival** (2016) — 97% match · Cerebral sci-fi you'll love\n2. 🎬 **Blade Runner 2049** — 95% match · Atmospheric neo-noir\n3. 🎬 **Ex Machina** — 94% match · AI thriller that's haunting\n4. 🎬 **Moon** (2009) — 92% match · Quiet, profound isolation story\n5. 🎬 **Annihilation** — 91% match · Visually stunning mystery\n\nThese align with your preference for cerebral, atmospheric cinema. Want reasons for any pick?",
        "Here are 5 tracks tailored to your listening habits:\n\n1. 🎵 **Starboy** — The Weeknd · 96% match\n2. 🎵 **Midnight City** — M83 · 95% match\n3. 🎵 **Digital Love** — Daft Punk · 93% match\n4. 🎵 **Tame Impala - The Less I Know** · 92% match\n5. 🎵 **Gorillaz - Feel Good Inc** · 90% match\n\nYou tend to gravitate toward synth-heavy, atmospheric tracks — this playlist leans into that.",
    ],
    "history": [
        "Looking at your recent activity:\n\n📅 **This week** you watched:\n• Inception (rated ⭐⭐⭐⭐⭐)\n• Interstellar (rated ⭐⭐⭐⭐)\n• Blade Runner 2049\n\n🎵 Most played: The Weeknd, Daft Punk, Hans Zimmer soundtracks\n\nYou're on a serious sci-fi and synthwave streak. Want me to find what's next?",
        "Here's a quick look at your recent Zhoosh activity:\n\n• Last 7 days: 3 movies, 47 tracks\n• Favorite genre this month: Sci-Fi & Thriller\n• Top artist: The Weeknd (12 plays)\n\nNotice a pattern? You love atmospheric, immersive content. Want recommendations that go deeper into that mood?",
    ],
    "metadata": [
        "**Inception (2010)**\n• Director: Christopher Nolan\n• Cast: Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page\n• Runtime: 148 minutes\n• Genres: Sci-Fi, Action, Thriller\n• IMDb: 8.8/10\n• Overview: A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
        "Here's what I found:\n• **Director**: Denis Villeneuve\n• **Release**: October 2021\n• **Runtime**: 2h 35m\n• **Genres**: Sci-Fi, Adventure, Drama\n• **IMDb Rating**: 8.0/10\n\nWant similar director picks or cast deep-dives?",
    ],
    "conversational": [
        "I'm here and ready to help you explore! I can find trending content, check if something's available, give you personalized recommendations based on your taste, or dive into any movie or song details. What are you in the mood for?",
        "Great question! As your personal Zhoosh companion, I know your entire watch and listen history. Ask me anything — trending picks, hidden gems, or 'find me something like Inception.' I've got you covered.",
        "That's an interesting one! Let me think... Based on what I know about your taste, I'd say the answer involves a mix of your preference for atmospheric, cerebral content. Want me to dig deeper into that or suggest something specific?",
        "I love that you asked! Your taste profile tells me a lot — you gravitate toward immersive, high-concept experiences whether that's cinema or music. What kind of mood are you in right now?",
    ],
}

def get_mock_response(intent: str, message: str, agent_name: str) -> str:
    responses = MOCK_RESPONSES.get(intent, MOCK_RESPONSES["conversational"])
    base = random.choice(responses)
    # Personalize slightly
    if "movie" in message.lower() and intent == "trending":
        return MOCK_RESPONSES["trending"][0]
    if "song" in message.lower() or "music" in message.lower() or "track" in message.lower():
        if intent == "trending":
            return MOCK_RESPONSES["trending"][1]
        if intent == "recommendation":
            return MOCK_RESPONSES["recommendation"][1]
    return base

# ---------------------------------------------------------------------------
# Streaming helpers
# ---------------------------------------------------------------------------

async def stream_text_words(text: str, delay_ms: int = 40):
    """Yield text word-by-word as SSE events."""
    words = text.split(" ")
    for i, word in enumerate(words):
        chunk = word + (" " if i < len(words) - 1 else "")
        yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"
        await asyncio.sleep(delay_ms / 1000.0)
    yield f"data: {json.dumps({'type': 'done', 'intent': 'done'})}\n\n"

async def groq_stream(message: str, history: List[ConversationMessage], agent_name: str, intent: str):
    """Try Groq API; fall back to mock streaming."""
    groq_key = os.environ.get("GROQ_API_KEY", "")
    
    if groq_key:
        try:
            from groq import AsyncGroq
            client = AsyncGroq(api_key=groq_key)
            
            system_prompt = f"""You are {agent_name}, a friendly, knowledgeable AI companion for Zhoosh — a premium streaming platform for movies and music.

Your personality:
- Warm, witty, and direct — like a well-informed friend, not a corporate bot
- You remember context from the conversation history
- You specialize in: movie/music discovery, recommendations, trending content, availability checks, and metadata queries
- When listing content, use emojis and bold formatting
- Keep responses concise but rich (2-4 sentences for conversational, structured lists for recommendations)
- Never expose system errors or API details to the user

Current detected intent: {intent}

The user is on Zhoosh streaming platform. Answer their query naturally and helpfully."""

            messages = [{"role": "system", "content": system_prompt}]
            for h in history[-8:]:  # last 8 messages for context window
                messages.append({"role": "user" if h.role == "user" else "assistant", "content": h.content})
            messages.append({"role": "user", "content": message})
            
            stream = await client.chat.completions.create(
                model="llama-3.1-70b-versatile",
                messages=messages,
                stream=True,
                max_tokens=500,
                temperature=0.7,
            )
            
            yield f"data: {json.dumps({'type': 'intent', 'intent': intent})}\n\n"
            
            async for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield f"data: {json.dumps({'type': 'token', 'content': delta})}\n\n"
                    await asyncio.sleep(0.01)
            
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
            return
            
        except Exception as e:
            # Fall through to mock
            pass
    
    # Mock streaming fallback
    response_text = get_mock_response(intent, message, agent_name)
    yield f"data: {json.dumps({'type': 'intent', 'intent': intent})}\n\n"
    async for chunk in stream_text_words(response_text, delay_ms=35):
        yield chunk

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/chat")
async def agent_chat(req: AgentChatRequest):
    """Stream agent response word-by-word via SSE."""
    intent = detect_intent(req.message)
    
    return StreamingResponse(
        groq_stream(req.message, req.history, req.agent_name, intent),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )

@router.get("/profile/{user_id}")
async def get_agent_profile(user_id: str):
    """Return agent profile (name + avatar). Reads from simple in-memory store or defaults."""
    # In a real app this would query a database
    stored = _agent_profiles.get(user_id)
    if stored:
        return stored
    return {"user_id": user_id, "agent_name": "Nova", "avatar_url": "/agent-avatar.jpg"}

@router.post("/profile")
async def upsert_agent_profile(req: AgentProfileRequest):
    """Create or update agent profile."""
    _agent_profiles[req.user_id] = {
        "user_id": req.user_id,
        "agent_name": req.agent_name,
        "avatar_url": req.avatar_url or "/agent-avatar.jpg",
        "updated_at": time.time()
    }
    return {"success": True, "agent_name": req.agent_name}

@router.delete("/history/{user_id}")
async def clear_agent_history(user_id: str):
    """Clear conversation history (frontend also clears localStorage)."""
    return {"success": True, "message": "Conversation history cleared"}

# Simple in-memory store (replace with DB in production)
_agent_profiles: dict = {}
