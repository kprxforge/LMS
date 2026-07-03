from fastapi import Header, HTTPException, status
from typing import Optional


def get_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Extracts the user ID from the Authorization: Bearer <user_id> header.
    The token IS the user's ID (same as the original server.ts implementation).
    Falls back to 'u1' for development convenience if header is missing.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        if token:
            return token
    # Fallback for convenience (matches original server.ts behavior)
    return "u1"
