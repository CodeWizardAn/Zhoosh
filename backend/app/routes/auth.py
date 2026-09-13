from fastapi import APIRouter
from backend.app.models import UserAuthRequest, UserResponse
import time

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=UserResponse)
def login(req: UserAuthRequest):
    return UserResponse(
        id="u-101",
        name=req.name or req.email.split('@')[0].title(),
        email=req.email,
        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role="Premium VIP"
    )

@router.post("/signup", response_model=UserResponse)
def signup(req: UserAuthRequest):
    return UserResponse(
        id=f"u-{int(time.time())}",
        name=req.name or "New Member",
        email=req.email,
        avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        role="Premium Member"
    )
