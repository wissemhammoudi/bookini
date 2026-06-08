from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.enums import UserRole
from app.models.user import User


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_email(self, email: str) -> User | None:
        statement = select(User).where(User.email == email)
        result = await self._session.execute(statement)
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: str) -> User | None:
        statement = select(User).where(User.id == user_id)
        result = await self._session.execute(statement)
        return result.scalar_one_or_none()

    async def create_user(
        self,
        full_name: str,
        email: str,
        password_hash: str,
    ) -> User:
        user = User(
            full_name=full_name,
            email=email,
            password_hash=password_hash,
        )
        self._session.add(user)
        await self._session.commit()
        await self._session.refresh(user)
        return user

    async def update_password(self, user: User, new_password_hash: str) -> User:
        user.password_hash = new_password_hash
        await self._session.commit()
        await self._session.refresh(user)
        return user

    async def list_admins(self) -> list[User]:
        statement = (
            select(User)
            .where(User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
            .order_by(User.created_at.desc())
        )
        result = await self._session.execute(statement)
        return list(result.scalars().all())

    async def update_role(self, user: User, role: UserRole) -> User:
        user.role = role
        await self._session.commit()
        await self._session.refresh(user)
        return user
