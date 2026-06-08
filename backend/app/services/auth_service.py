from app.core.exceptions import AppException, UnauthorizedException
from app.core.security import (
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

    async def refresh_token(self, refresh_token: str) -> dict[str, str]:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid token type")

        user_id = payload.get("sub")
        if not user_id:
            raise UnauthorizedException("Invalid token subject")

        user = await self._user_repository.get_by_id(user_id)
        if not user or not user.is_active:
            raise UnauthorizedException("User not authorized")

        return self._build_token_pair(str(user.id))

    async def logout(self, refresh_token: str) -> None:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid token type")

    async def request_password_reset(self, email: str) -> str:
        user = await self._user_repository.get_by_email(email)
        if not user:
            return ""
        return create_password_reset_token(str(user.id))

    async def confirm_password_reset(self, token: str, new_password: str) -> None:
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
