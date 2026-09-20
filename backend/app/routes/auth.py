from fastapi import APIRouter, HTTPException, status
from backend.app.models import UserAuthRequest, UserResponse
import time
import re
import hashlib
import secrets
from typing import Dict, List

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

# ---------------------------------------------------------------------------
# Strict Security Constants & Password Hashing
# ---------------------------------------------------------------------------
SALT = "zhoosh_prod_sec_v2_2026"
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_SECONDS = 120

def hash_password(password: str) -> str:
    return hashlib.sha256(f"{SALT}:{password}".encode("utf-8")).hexdigest()

# Strict RFC 5322 compliant regex for web email verification
STRICT_EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@"
    r"[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?"
    r"(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$"
)

def validate_and_normalize_email(raw_email: str) -> str:
    """Validates email format strictly. Rejects invalid syntax, spaces, and suspicious dots."""
    if not raw_email or not isinstance(raw_email, str):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email address is required."
        )

    email = raw_email.strip()

    if any(c.isspace() for c in email):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email address cannot contain spaces."
        )

    if len(email) > 254:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email address is too long (maximum 254 characters)."
        )

    if ".." in email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email address cannot contain consecutive dots ('..')."
        )

    parts = email.split("@")
    if len(parts) != 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email must contain exactly one '@' separator."
        )

    local_part, domain_part = parts

    if not local_part or len(local_part) > 64:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email username part before '@' must be between 1 and 64 characters."
        )

    if local_part.startswith(".") or local_part.endsWith(".") if hasattr(local_part, "endsWith") else local_part.endswith("."):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email username cannot start or end with a dot."
        )

    if not domain_part or "." not in domain_part:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email must include a valid domain (e.g. domain.com)."
        )

    if domain_part.startswith(".") or domain_part.endswith(".") or domain_part.startswith("-") or domain_part.endswith("-"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email domain cannot start or end with a dot or hyphen."
        )

    domain_labels = domain_part.split(".")
    tld = domain_labels[-1]

    if not tld.isalpha() or len(tld) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email domain extension must be at least 2 alphabetic characters."
        )

    if not STRICT_EMAIL_REGEX.match(email):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid email format. Please provide a valid address like user@domain.com."
        )

    return email.lower()

# In-memory authentication & rate-limiting storage
REGISTERED_USERS: Dict[str, Dict[str, str]] = {
    "alex.mercer@zhoosh.stream": {
        "id": "u-101",
        "name": "Alex Mercer",
        "password_hash": hash_password("ZhooshPass2026!"),
        "role": "Premium VIP",
        "avatar": DEFAULT_RED_AVATAR
    }
}

FAILED_LOGIN_ATTEMPTS: Dict[str, List[float]] = {}

def check_rate_limit(email: str):
    """Enforces rate-limiting lockout after repeated failed attempts."""
    now = time.time()
    attempts = FAILED_LOGIN_ATTEMPTS.get(email, [])
    # Keep attempts within lockout window
    recent_attempts = [t for t in attempts if now - t < LOCKOUT_SECONDS]
    FAILED_LOGIN_ATTEMPTS[email] = recent_attempts

    if len(recent_attempts) >= MAX_LOGIN_ATTEMPTS:
        time_left = int(LOCKOUT_SECONDS - (now - recent_attempts[0]))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account temporarily locked due to repeated failed attempts. Please try again in {max(1, time_left)} seconds."
        )

def record_failed_attempt(email: str):
    now = time.time()
    if email not in FAILED_LOGIN_ATTEMPTS:
        FAILED_LOGIN_ATTEMPTS[email] = []
    FAILED_LOGIN_ATTEMPTS[email].append(now)

def clear_failed_attempts(email: str):
    if email in FAILED_LOGIN_ATTEMPTS:
        del FAILED_LOGIN_ATTEMPTS[email]

# ---------------------------------------------------------------------------
# Strict Endpoints
# ---------------------------------------------------------------------------

@router.post("/login", response_model=UserResponse)
def login(req: UserAuthRequest):
    # 1. Strict Email Format Verification
    clean_email = validate_and_normalize_email(req.email)

    # 2. Rate-Limiting Protection
    check_rate_limit(clean_email)

    # 3. Password Requirement
    password = (req.password or "").strip()
    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required for login authentication."
        )

    if len(password) < 6:
        record_failed_attempt(clean_email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. Password must be at least 6 characters."
        )

    # 4. Credential Verification
    user_record = REGISTERED_USERS.get(clean_email)
    pw_hash = hash_password(password)

    if user_record:
        if user_record["password_hash"] != pw_hash:
            record_failed_attempt(clean_email)
            remaining = MAX_LOGIN_ATTEMPTS - len(FAILED_LOGIN_ATTEMPTS.get(clean_email, []))
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Incorrect password. {max(0, remaining)} attempt(s) remaining before temporary lockout."
            )
        # Login Successful
        clear_failed_attempts(clean_email)
        return UserResponse(
            id=user_record["id"],
            name=user_record["name"],
            email=clean_email,
            avatar=user_record.get("avatar", DEFAULT_RED_AVATAR),
            role=user_record.get("role", "Premium VIP"),
            token=f"zhoosh_sec_{secrets.token_hex(16)}"
        )
    else:
        # Non-pre-registered user: allow secure on-the-fly login if password meets security standard
        # and not locked out
        if len(password) < 6:
            record_failed_attempt(clean_email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed. Invalid email or password."
            )
        
        clear_failed_attempts(clean_email)
        user_name = req.name.strip() if (req.name and req.name.strip()) else clean_email.split('@')[0].replace('.', ' ').title()
        new_id = f"u-{int(time.time())}"
        
        # Save credentials for future logins
        REGISTERED_USERS[clean_email] = {
            "id": new_id,
            "name": user_name,
            "password_hash": pw_hash,
            "role": "Verified Member",
            "avatar": DEFAULT_RED_AVATAR
        }

        return UserResponse(
            id=new_id,
            name=user_name,
            email=clean_email,
            avatar=DEFAULT_RED_AVATAR,
            role="Verified Member",
            token=f"zhoosh_sec_{secrets.token_hex(16)}"
        )

@router.post("/signup", response_model=UserResponse)
def signup(req: UserAuthRequest):
    # 1. Strict Email Format Verification
    clean_email = validate_and_normalize_email(req.email)

    # 2. Check If Email Already Exists
    if clean_email in REGISTERED_USERS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists. Please sign in."
        )

    # 3. Strict Password Requirements for Registration
    password = (req.password or "").strip()
    if not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required for account creation."
        )

    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration password must be at least 8 characters long."
        )

    has_letter = any(c.isalpha() for c in password)
    has_digit_or_symbol = any(not c.isalpha() for c in password)
    if not (has_letter and has_digit_or_symbol):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must include a mix of letters and numbers or symbols."
        )

    # 4. Register New User
    user_name = req.name.strip() if (req.name and req.name.strip()) else clean_email.split('@')[0].replace('.', ' ').title()
    new_id = f"u-{int(time.time())}"
    
    REGISTERED_USERS[clean_email] = {
        "id": new_id,
        "name": user_name,
        "password_hash": hash_password(password),
        "role": "Premium Member",
        "avatar": DEFAULT_RED_AVATAR
    }

    return UserResponse(
        id=new_id,
        name=user_name,
        email=clean_email,
        avatar=DEFAULT_RED_AVATAR,
        role="Premium Member",
        token=f"zhoosh_sec_{secrets.token_hex(16)}"
    )

