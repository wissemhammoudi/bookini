import redis.asyncio as aioredis

from app.core.exceptions import AppException, UnauthorizedException
from app.core.security import (
    blacklist_token,
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository


class AuthService:
    def __init__(self, user_repository: UserRepository) -> None:
        self._user_repository = user_repository

    async def register(
        self,
        full_name: str,
        email: str,
        password: str,
    ) -> dict[str, str]:
        existing_user = await self._user_repository.get_by_email(email)
        if existing_user:
            raise AppException(status_code=409, message="Email already registered")

        hashed = hash_password(password)
        user = await self._user_repository.create_user(
            full_name=full_name,
            email=email,
            password_hash=hashed,
        )
        return self._build_token_pair(str(user.id))

    async def login(self, email: str, password: str) -> dict[str, str]:
        user = await self._user_repository.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")

        if not user.is_active:
            raise UnauthorizedException("User account is inactive")

        return self._build_token_pair(str(user.id))

    async def refresh_token(
        self,
        refresh_token: str,
        redis: aioredis.Redis,
    ) -> dict[str, str]:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid token type")

        user_id = payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Invalid token subject")

        user = await self._user_repository.get_by_id(user_id)
        if not user or not user.is_active:
            raise UnauthorizedException("User not authorized")

        # Invalidate the consumed refresh token so it cannot be replayed.
        await blacklist_token(redis, payload)

        return self._build_token_pair(str(user.id))

    async def logout(
        self,
        refresh_token: str,
        redis: aioredis.Redis,
    ) -> None:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid token type")

        # Blacklist the refresh token — it is now permanently revoked.
        await blacklist_token(redis, payload)

    async def request_password_reset(self, email: str) -> str:
        user = await self._user_repository.get_by_email(email)
        if not user:
            return ""
        return create_password_reset_token(str(user.id))

    async def confirm_password_reset(
        self,
        token: str,
        new_password: str,
        redis: aioredis.Redis,
    ) -> None:
        payload = decode_token(token)
        if payload.get("type") != "password_reset":
            raise UnauthorizedException("Invalid token type")

        user_id = payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Invalid token subject")

        user = await self._user_repository.get_by_id(user_id)
        if not user:
            raise UnauthorizedException("User not found")

        hashed = hash_password(new_password)
        await self._user_repository.update_password(user=user, new_password_hash=hashed)

        # One-time use: blacklist the reset token after successful use.
        await blacklist_token(redis, payload)

    async def change_password(
        self,
        user: User,
        current_password: str,
        new_password: str,
    ) -> None:
        if not verify_password(current_password, user.password_hash):
            raise UnauthorizedException("Current password is invalid")

        hashed = hash_password(new_password)
        await self._user_repository.update_password(user=user, new_password_hash=hashed)

    def _build_token_pair(self, user_id: str) -> dict[str, str]:
        return {
            "access_token": create_access_token(user_id),
            "refresh_token": create_refresh_token(user_id),
            "token_type": "bearer",
        }

    async def update_profile(
        self,
        user: User,
        full_name: str,
        email: str,
    ) -> User:
        if email != user.email:
            existing = await self._user_repository.get_by_email(email)
            if existing:
                raise AppException(status_code=409, message="Email already in use")

        user.full_name = full_name
        user.email = email
        await self._user_repository._session.commit()
        await self._user_repository._session.refresh(user)
        return user

    async def update_avatar(
        self,
        user: User,
        avatar_url: str | None,
    ) -> User:
        user.avatar_url = avatar_url
        await self._user_repository._session.commit()
        await self._user_repository._session.refresh(user)
        return user
