from fastapi import APIRouter
from backend.app.models import UserAuthRequest, UserResponse
import time

router = APIRouter(prefix="/auth", tags=["Auth"])

DEFAULT_RED_AVATAR = (
    "data:image/svg+xml;utf8,%3Csvg%20viewBox%3D%220%200%20120%20120%22%20"
    "xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%20%20"
    "%3Crect%20width%3D%22120%22%20height%3D%22120%22%20rx%3D%2224%22%20fill%3D%22%23E50914%22%2F%3E%0A"
    "%20%20%20%20%3Ccircle%20cx%3D%2242%22%20cy%3D%2248%22%20r%3D%228%22%20fill%3D%22%23FFFFFF%22%2F%3E%0A"
    "%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%2278%22%20cy%3D%2248%22%20r%3D%228%22%20fill%3D%22%23FFFFFF%22%2F%3E%0A"
    "%20%20%20%20%3Cpath%20d%3D%22M%2038%2072%20Q%2060%2096%2082%2072%22%20stroke%3D%22%23FFFFFF%22%20"
    "stroke-width%3D%228%22%20stroke-linecap%3D%22round%22%20fill%3D%22none%22%2F%3E%0A%20%20%3C%2Fsvg%3E"
)

@router.post("/login", response_model=UserResponse)
def login(req: UserAuthRequest):
    return UserResponse(
        id="u-101",
        name=req.name or req.email.split('@')[0].title(),
        email=req.email,
        avatar=DEFAULT_RED_AVATAR,
        role="Premium VIP"
    )

@router.post("/signup", response_model=UserResponse)
def signup(req: UserAuthRequest):
    return UserResponse(
        id=f"u-{int(time.time())}",
        name=req.name or "New Member",
        email=req.email,
        avatar=DEFAULT_RED_AVATAR,
        role="Premium Member"
    )
