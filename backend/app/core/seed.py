from collections.abc import Sequence

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.config import Settings
from app.core.logging_config import get_logger
from app.core.security import hash_password
from app.domain.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository


logger = get_logger(__name__)


async def seed_super_admin_account(
    session_factory: async_sessionmaker[AsyncSession],
    settings: Settings,
) -> None:
    if not settings.seed_super_admin:
        return

    full_name = "Default Super Admin"
    normalized_email = settings.seed_super_admin_email.strip().lower()
    password_hash = hash_password(settings.seed_super_admin_password)

    async with session_factory() as session:
        repository = UserRepository(session)
        existing_user = await repository.get_by_email(normalized_email)

        created = False
        updated = False

        if existing_user is None:
            session.add(
                User(
                    full_name=full_name,
                    email=normalized_email,
                    password_hash=password_hash,
                    role=UserRole.SUPER_ADMIN,
                    is_active=True,
                )
            )
            created = True
        else:
            if existing_user.full_name != full_name:
                existing_user.full_name = full_name
                updated = True
            if existing_user.role != UserRole.SUPER_ADMIN:
                existing_user.role = UserRole.SUPER_ADMIN
                updated = True
            if not existing_user.is_active:
                existing_user.is_active = True
                updated = True

        await session.commit()

    logger.info(
        "Super admin bootstrap completed",
        extra={
            "created": created,
            "updated": updated,
            "email": normalized_email,
        },
    )


async def seed_default_users(
    session_factory: async_sessionmaker[AsyncSession],
    settings: Settings,
) -> None:
    if not settings.seed_default_users:
        return

    default_users: Sequence[tuple[str, str, str, UserRole]] = (
        ("Default User", settings.seed_user_email, settings.seed_user_password, UserRole.USER),
        ("Default Admin", settings.seed_admin_email, settings.seed_admin_password, UserRole.ADMIN),
    )

    async with session_factory() as session:
        repository = UserRepository(session)
        created_count = 0
        updated_count = 0

        for full_name, email, password, role in default_users:
            normalized_email = email.strip().lower()
            existing_user = await repository.get_by_email(normalized_email)

            if existing_user is None:
                user = User(
                    full_name=full_name,
                    email=normalized_email,
                    password_hash=hash_password(password),
                    role=role,
                    is_active=True,
                )
                session.add(user)
                created_count += 1
                continue

            changed = False
            if existing_user.full_name != full_name:
                existing_user.full_name = full_name
                changed = True
            if existing_user.role != role:
                existing_user.role = role
                changed = True
            if not existing_user.is_active:
                existing_user.is_active = True
                changed = True

            if changed:
                updated_count += 1

        await session.commit()

    logger.info(
        "Default users seeding completed",
        extra={
            "created_count": created_count,
            "updated_count": updated_count,
        },
    )
