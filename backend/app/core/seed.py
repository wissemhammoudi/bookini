from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.config import Settings
from app.core.logging_config import get_logger
from app.core.security import hash_password
from app.domain.enums import FloorStatus, UserRole
from app.models.admin_rating import AdminRating
from app.models.floor import Floor
from app.models.floor_review import FloorReview
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
            "seed_created": created,
            "seed_updated": updated,
            "seed_email": normalized_email,
        },
    )


async def seed_default_test_data(
    session_factory: async_sessionmaker[AsyncSession],
    settings: Settings,
) -> None:
    if not settings.seed_default_users:
        return

    logger.info("Starting default test data seeding")

    async with session_factory() as session:
        # 1. Seed users (Admin and Regular)
        admin_email = settings.seed_admin_email.strip().lower()
        user_email = settings.seed_user_email.strip().lower()
        alice_email = "alice@bookiwa7dek.com"
        bob_email = "bob@bookiwa7dek.com"

        user_repo = UserRepository(session)

        admin_user = await user_repo.get_by_email(admin_email)
        if not admin_user:
            admin_user = User(
                full_name="Workspace Admin",
                email=admin_email,
                password_hash=hash_password(settings.seed_admin_password),
                role=UserRole.ADMIN,
                is_active=True,
            )
            session.add(admin_user)

        reg_user = await user_repo.get_by_email(user_email)
        if not reg_user:
            reg_user = User(
                full_name="John Regular User",
                email=user_email,
                password_hash=hash_password(settings.seed_user_password),
                role=UserRole.USER,
                is_active=True,
            )
            session.add(reg_user)

        alice_user = await user_repo.get_by_email(alice_email)
        if not alice_user:
            alice_user = User(
                full_name="Alice Johnson",
                email=alice_email,
                password_hash=hash_password("User123456!"),
                role=UserRole.USER,
                is_active=True,
            )
            session.add(alice_user)

        bob_user = await user_repo.get_by_email(bob_email)
        if not bob_user:
            bob_user = User(
                full_name="Bob Smith",
                email=bob_email,
                password_hash=hash_password("User123456!"),
                role=UserRole.USER,
                is_active=True,
            )
            session.add(bob_user)

        await session.flush()

        # 2. Seed Floors
        floors_result = await session.execute(select(Floor))
        existing_floors = floors_result.scalars().all()

        f1 = None
        f2 = None
        f3 = None

        if not existing_floors:
            f1 = Floor(
                admin_id=admin_user.id,
                name="Main Coworking Space",
                capacity=50,
                building="HQ Building",
                floor_number=1,
                location="First Floor, Wing B",
                description="Our spacious and well-lit main coworking floor. Offers high-speed ethernet, access to refreshments, and adjustable height desks.",  # noqa: E501
                status=FloorStatus.AVAILABLE,
            )
            f2 = Floor(
                admin_id=admin_user.id,
                name="Silent Focus Room",
                capacity=12,
                building="HQ Building",
                floor_number=2,
                location="Second Floor, Room 204",
                description="Designed specifically for deep concentration and distraction-free work. High privacy panels, ergonomic seating, and absolute silence enforced.",  # noqa: E501
                status=FloorStatus.AVAILABLE,
            )
            f3 = Floor(
                admin_id=admin_user.id,
                name="Creative Collab Studio",
                capacity=30,
                building="Ghazela Hub",
                floor_number=0,
                location="Ground Floor, Unit 1",
                description="Vibrant environment suited for group projects, brainstorming, and software workshops. Features double monitors, writeable glass walls, and comfortable lounge setups.",  # noqa: E501
                status=FloorStatus.AVAILABLE,
            )
            session.add_all([f1, f2, f3])
            await session.flush()
        else:
            if len(existing_floors) >= 3:
                f1, f2, f3 = existing_floors[:3]
            else:
                f1 = existing_floors[0]
                f2 = existing_floors[0]
                f3 = existing_floors[0]

        # 3. Seed Reviews & Ratings
        reviews_result = await session.execute(select(FloorReview))
        existing_reviews = reviews_result.scalars().all()

        if not existing_reviews and f1 and f2 and f3:
            r1 = FloorReview(
                floor_id=f1.id,
                user_id=alice_user.id,
                rating=5,
                comment="Incredible sunlight and fast WiFi. I've booked this floor multiple times and it never disappoints!",  # noqa: E501
            )
            r2 = FloorReview(
                floor_id=f1.id,
                user_id=bob_user.id,
                rating=4,
                comment="Really cool workspace, though it gets a little noisy in the afternoon during peak hours.",  # noqa: E501
            )
            r3 = FloorReview(
                floor_id=f2.id,
                user_id=alice_user.id,
                rating=5,
                comment="Absolutely perfect for deep work. Quiet, professional crowd and great heating during winter.",  # noqa: E501
            )
            r4 = FloorReview(
                floor_id=f3.id,
                user_id=bob_user.id,
                rating=5,
                comment="Creative atmosphere, great monitors, and the writeable walls make collaboration super simple.",  # noqa: E501
            )
            session.add_all([r1, r2, r3, r4])

        # 4. Seed Admin Ratings
        ratings_result = await session.execute(select(AdminRating))
        existing_ratings = ratings_result.scalars().all()

        if not existing_ratings:
            ar1 = AdminRating(
                admin_id=admin_user.id,
                user_id=alice_user.id,
                rating=5,
                comment="Very responsive and helpful host. Handled setup queries instantly.",  # noqa: E501
            )
            ar2 = AdminRating(
                admin_id=admin_user.id,
                user_id=bob_user.id,
                rating=4,
                comment="Very helpful, though sometimes busy during peak morning check-ins.",  # noqa: E501
            )
            session.add_all([ar1, ar2])

        await session.commit()

    logger.info("Default test data seeding completed successfully")
