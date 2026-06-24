from app.core.exceptions import ForbiddenException, NotFoundException
from app.domain.enums import UserRole
from app.models.admin_rating import AdminRating
from app.models.floor import Floor
from app.models.floor_review import FloorReview
from app.models.user import User
from app.repositories.admin_rating_repository import AdminRatingRepository
from app.repositories.floor_repository import FloorRepository
from app.repositories.floor_review_repository import FloorReviewRepository
from app.repositories.reservation_repository import ReservationRepository
from app.repositories.user_repository import UserRepository


class ReviewService:
    def __init__(
        self,
        *,
        user_repository: UserRepository,
        floor_repository: FloorRepository,
        reservation_repository: ReservationRepository,
        admin_rating_repository: AdminRatingRepository,
        floor_review_repository: FloorReviewRepository,
    ) -> None:
        self._user_repository = user_repository
        self._floor_repository = floor_repository
        self._reservation_repository = reservation_repository
        self._admin_rating_repository = admin_rating_repository
        self._floor_review_repository = floor_review_repository

    async def get_admin_profile(
        self, *, admin_id: str
    ) -> tuple[User, list[Floor], float, int]:
        admin = await self._user_repository.get_by_id(admin_id)
        if not admin or admin.role not in {UserRole.ADMIN, UserRole.SUPER_ADMIN}:
            raise NotFoundException("Admin not found")

        floors = await self._floor_repository.list_floors_by_admin(
            admin_id=admin_id,
            include_deleted=False,
        )
        (
            avg_rating,
            rating_count,
        ) = await self._admin_rating_repository.get_aggregate_for_admin(
            admin_id=admin_id
        )
        return admin, floors, avg_rating, rating_count

    async def list_admin_ratings(
        self,
        *,
        admin_id: str,
        limit: int,
        offset: int,
        min_rating: int | None,
        max_rating: int | None,
    ) -> list[AdminRating]:
        await self._ensure_admin_exists(admin_id=admin_id)
        return await self._admin_rating_repository.list_for_admin(
            admin_id=admin_id,
            limit=limit,
            offset=offset,
            min_rating=min_rating,
            max_rating=max_rating,
        )

    async def upsert_admin_rating(
        self,
        *,
        admin_id: str,
        current_user: User,
        rating: int,
        comment: str | None,
    ) -> AdminRating:
        await self._ensure_admin_exists(admin_id=admin_id)

        if str(current_user.id) == admin_id:
            raise ForbiddenException("You cannot rate your own admin profile")

        eligible = (
            await self._reservation_repository.has_completed_reservation_with_admin(
                user_id=str(current_user.id),
                admin_id=admin_id,
            )
        )
        if not eligible:
            raise ForbiddenException(
                "Only users with completed reservations can rate this admin"
            )

        existing = await self._admin_rating_repository.get_by_admin_and_user(
            admin_id=admin_id,
            user_id=str(current_user.id),
        )
        if existing:
            return await self._admin_rating_repository.update(
                entity=existing,
                rating=rating,
                comment=comment,
            )

        return await self._admin_rating_repository.create(
            admin_id=admin_id,
            user_id=str(current_user.id),
            rating=rating,
            comment=comment,
        )

    async def delete_admin_rating(self, *, admin_id: str, current_user: User) -> None:
        entity = await self._admin_rating_repository.get_by_admin_and_user(
            admin_id=admin_id,
            user_id=str(current_user.id),
        )
        if not entity:
            raise NotFoundException("Admin rating not found")
        await self._admin_rating_repository.delete(entity=entity)

    async def list_floor_reviews(
        self,
        *,
        floor_id: str,
        limit: int,
        offset: int,
        min_rating: int | None,
        max_rating: int | None,
    ) -> list[FloorReview]:
        floor = await self._floor_repository.get_by_id(floor_id)
        if not floor or floor.is_deleted:
            raise NotFoundException("Floor not found")
        return await self._floor_review_repository.list_for_floor(
            floor_id=floor_id,
            limit=limit,
            offset=offset,
            min_rating=min_rating,
            max_rating=max_rating,
        )

    async def upsert_floor_review(
        self,
        *,
        floor_id: str,
        current_user: User,
        rating: int,
        comment: str | None,
    ) -> FloorReview:
        floor = await self._floor_repository.get_by_id(floor_id)
        if not floor or floor.is_deleted:
            raise NotFoundException("Floor not found")

        eligible = (
            await self._reservation_repository.has_completed_reservation_for_floor(
                user_id=str(current_user.id),
                floor_id=floor_id,
            )
        )
        if not eligible:
            raise ForbiddenException(
                "Only users with completed reservations can review this floor"
            )

        existing = await self._floor_review_repository.get_by_floor_and_user(
            floor_id=floor_id,
            user_id=str(current_user.id),
        )
        if existing:
            return await self._floor_review_repository.update(
                entity=existing,
                rating=rating,
                comment=comment,
            )

        return await self._floor_review_repository.create(
            floor_id=floor_id,
            user_id=str(current_user.id),
            rating=rating,
            comment=comment,
        )

    async def delete_floor_review(self, *, floor_id: str, current_user: User) -> None:
        entity = await self._floor_review_repository.get_by_floor_and_user(
            floor_id=floor_id,
            user_id=str(current_user.id),
        )
        if not entity:
            raise NotFoundException("Floor review not found")
        await self._floor_review_repository.delete(entity=entity)

    async def _ensure_admin_exists(self, *, admin_id: str) -> User:
        admin = await self._user_repository.get_by_id(admin_id)
        if not admin or admin.role not in {UserRole.ADMIN, UserRole.SUPER_ADMIN}:
            raise NotFoundException("Admin not found")
        return admin
