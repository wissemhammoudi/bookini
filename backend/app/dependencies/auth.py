from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import UnauthorizedException
from app.core.security import decode_token
from app.infrastructure.session import get_db_session
from app.models.user import User
from app.repositories.user_repository import UserRepository

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_db_session),
) -> User:
    if not credentials:
        raise UnauthorizedException("Authentication credentials were not provided")

    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        raise UnauthorizedException("Invalid access token")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Invalid token subject")

    repository = UserRepository(session)
    user = await repository.get_by_id(user_id)
    if not user or not user.is_active:
        raise UnauthorizedException("User not authorized")

    return user
