from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.core.responses import success_response
from app.dependencies.auth import get_current_user
from app.infrastructure.session import get_db_session
from app.models.admin_rating import AdminRating
from app.models.floor_review import FloorReview
from app.models.user import User
from app.repositories.admin_rating_repository import AdminRatingRepository
from app.repositories.audit_log_repository import AuditLogRepository
from app.repositories.floor_repository import FloorRepository
from app.repositories.floor_review_repository import FloorReviewRepository
from app.repositories.reservation_repository import ReservationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.review import RatingCommentRequest
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore
from app.services.audit_log_service import AuditLogService
from app.services.review_service import ReviewService

router = APIRouter(tags=["reviews"])


def _service_from_session(session: AsyncSession) -> ReviewService:
    return ReviewService(
        user_repository=UserRepository(session),
        floor_repository=FloorRepository(session),
        reservation_repository=ReservationRepository(session),
        admin_rating_repository=AdminRatingRepository(session),
        floor_review_repository=FloorReviewRepository(session),
    )


def _audit_service_from_session(session: AsyncSession) -> AuditLogService:
    return AuditLogService(AuditLogRepository(session))


def _client_ip(request: Request) -> str:
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def _serialize_admin_rating(item: AdminRating) -> dict[str, object]:
    return {
        "id": str(item.id),
        "admin_id": str(item.admin_id),
        "user_id": str(item.user_id),
        "rating": item.rating,
        "comment": item.comment,
        "created_at": item.created_at.isoformat(),
        "updated_at": item.updated_at.isoformat(),
    }


def _serialize_floor_review(item: FloorReview) -> dict[str, object]:
    return {
        "id": str(item.id),
        "floor_id": str(item.floor_id),
        "user_id": str(item.user_id),
        "rating": item.rating,
        "comment": item.comment,
        "created_at": item.created_at.isoformat(),
        "updated_at": item.updated_at.isoformat(),
    }


@router.get("/admins/{admin_id}/profile")
async def get_admin_profile(
    admin_id: str,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    floor_review_repository = FloorReviewRepository(session)

    try:
        admin, floors, avg_rating, rating_count = await service.get_admin_profile(
            admin_id=admin_id
        )
        serialized_floors: list[dict[str, object]] = []
        for floor in floors:
            (
                floor_average,
                floor_count,
            ) = await floor_review_repository.get_aggregate_for_floor(
                floor_id=str(floor.id)
            )
            serialized_floors.append(
                {
                    "id": str(floor.id),
                    "admin_id": str(floor.admin_id) if floor.admin_id else None,
                    "name": floor.name,
                    "capacity": floor.capacity,
                    "building": floor.building,
                    "floor_number": floor.floor_number,
                    "location": floor.location,
                    "description": floor.description,
                    "status": floor.status.value,
                    "is_deleted": floor.is_deleted,
                    "average_rating": round(floor_average, 2),
                    "rating_count": floor_count,
                }
            )

        return success_response(
            message="Admin profile retrieved successfully",
            data={
                "admin": {
                    "id": str(admin.id),
                    "full_name": admin.full_name,
                    "email": admin.email,
                    "avatar_url": admin.avatar_url,
                    "role": admin.role.value,
                },
                "average_rating": round(avg_rating, 2),
                "rating_count": rating_count,
                "spaces": serialized_floors,
            },
        )
    except NotFoundException:
        state = AdminWorkspaceStateStore.get_state()
        admin_record = next(
            (
                user
                for user in state.users
                if user.id == admin_id and user.role in {"ADMIN", "SUPER_ADMIN"}
            ),
            None,
        )
        if not admin_record:
            raise

        serialized_floors = [
            {
                "id": place.id,
                "admin_id": admin_record.id,
                "name": place.name,
                "capacity": place.capacity,
                "building": place.category,
                "floor_number": 0,
                "location": place.address,
                "description": place.description,
                "status": place.status,
                "is_deleted": False,
                "average_rating": 0.0,
                "rating_count": 0,
                "cover_image": place.cover_image,
            }
            for place in state.places
            if admin_record.organization_ids
            and place.organization_id in admin_record.organization_ids
        ]

        return success_response(
            message="Admin profile retrieved successfully",
            data={
                "admin": {
                    "id": admin_record.id,
                    "full_name": admin_record.full_name,
                    "email": admin_record.email,
                    "avatar_url": str(admin_record.profile_image)
                    if admin_record.profile_image
                    else None,
                    "role": admin_record.role,
                },
                "average_rating": 0.0,
                "rating_count": 0,
                "spaces": serialized_floors,
            },
        )


@router.get("/admins/{admin_id}/ratings")
async def list_admin_ratings(
    admin_id: str,
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    min_rating: int | None = Query(default=None, ge=1, le=5),
    max_rating: int | None = Query(default=None, ge=1, le=5),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    ratings = await service.list_admin_ratings(
        admin_id=admin_id,
        limit=limit,
        offset=offset,
        min_rating=min_rating,
        max_rating=max_rating,
    )
    aggregate_repository = AdminRatingRepository(session)
    average_rating, total_count = await aggregate_repository.get_aggregate_for_admin(
        admin_id=admin_id
    )
    return success_response(
        message="Admin ratings retrieved successfully",
        data={
            "average_rating": round(average_rating, 2),
            "rating_count": total_count,
            "items": [_serialize_admin_rating(item) for item in ratings],
            "pagination": {
                "limit": limit,
                "offset": offset,
                "returned": len(ratings),
            },
            "filters": {
                "min_rating": min_rating,
                "max_rating": max_rating,
            },
        },
    )


@router.post("/admins/{admin_id}/ratings/me")
async def upsert_admin_rating(
    admin_id: str,
    payload: RatingCommentRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    audit_service = _audit_service_from_session(session)

    rating = await service.upsert_admin_rating(
        admin_id=admin_id,
        current_user=current_user,
        rating=payload.rating,
        comment=payload.comment,
    )
    await audit_service.record(
        user_id=current_user.id,
        action="ADMIN_RATING_UPSERTED",
        ip_address=_client_ip(request),
        metadata={"admin_id": admin_id, "rating": payload.rating},
    )

    return success_response(
        message="Admin rating saved successfully",
        data=_serialize_admin_rating(rating),
    )


@router.delete("/admins/{admin_id}/ratings/me")
async def delete_admin_rating(
    admin_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    service = _service_from_session(session)
    audit_service = _audit_service_from_session(session)

    await service.delete_admin_rating(admin_id=admin_id, current_user=current_user)
    await audit_service.record(
        user_id=current_user.id,
        action="ADMIN_RATING_DELETED",
        ip_address=_client_ip(request),
        metadata={"admin_id": admin_id},
    )

    return success_response(message="Admin rating deleted successfully", data={})


@router.get("/floors/{floor_id}/reviews")
async def list_floor_reviews(
    floor_id: str,
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    min_rating: int | None = Query(default=None, ge=1, le=5),
    max_rating: int | None = Query(default=None, ge=1, le=5),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    if floor_id.startswith("floor-"):
        from app.services.review_service import InMemoryFloorReview

        raw_reviews = AdminWorkspaceStateStore.get_floor_reviews(floor_id)
        filtered = []
        for r in raw_reviews:
            rating = r["rating"]
            if min_rating is not None and rating < min_rating:
                continue
            if max_rating is not None and rating > max_rating:
                continue
            filtered.append(InMemoryFloorReview(r))

        count = len(raw_reviews)
        average = sum(r["rating"] for r in raw_reviews) / count if count > 0 else 0.0
        sliced = filtered[offset : offset + limit]

        return success_response(
            message="Floor reviews retrieved successfully",
            data={
                "average_rating": round(average, 2),
                "rating_count": count,
                "reviews": [_serialize_floor_review(item) for item in sliced],
                "pagination": {
                    "limit": limit,
                    "offset": offset,
                    "returned": len(sliced),
                },
                "filters": {
                    "min_rating": min_rating,
                    "max_rating": max_rating,
                },
            },
        )

    service = _service_from_session(session)
    items = await service.list_floor_reviews(
        floor_id=floor_id,
        limit=limit,
        offset=offset,
        min_rating=min_rating,
        max_rating=max_rating,
    )
    floor_review_repository = FloorReviewRepository(session)
    average, count = await floor_review_repository.get_aggregate_for_floor(
        floor_id=floor_id
    )

    return success_response(
        message="Floor reviews retrieved successfully",
        data={
            "average_rating": round(average, 2),
            "rating_count": count,
            "reviews": [_serialize_floor_review(item) for item in items],
            "pagination": {
                "limit": limit,
                "offset": offset,
                "returned": len(items),
            },
            "filters": {
                "min_rating": min_rating,
                "max_rating": max_rating,
            },
        },
    )


@router.post("/floors/{floor_id}/reviews/me")
async def upsert_floor_review(
    floor_id: str,
    payload: RatingCommentRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    audit_service = _audit_service_from_session(session)

    if floor_id.startswith("floor-"):
        from app.services.review_service import InMemoryFloorReview

        review_data = AdminWorkspaceStateStore.upsert_floor_review(
            floor_id=floor_id,
            user_id=str(current_user.id),
            rating=payload.rating,
            comment=payload.comment,
            user_name=current_user.full_name,
        )
        review = InMemoryFloorReview(review_data)

        await audit_service.record(
            user_id=current_user.id,
            action="FLOOR_REVIEW_UPSERTED",
            ip_address=_client_ip(request),
            metadata={"floor_id": floor_id, "rating": payload.rating},
        )

        return success_response(
            message="Floor review saved successfully",
            data=_serialize_floor_review(review),
        )

    service = _service_from_session(session)
    review = await service.upsert_floor_review(
        floor_id=floor_id,
        current_user=current_user,
        rating=payload.rating,
        comment=payload.comment,
    )
    await audit_service.record(
        user_id=current_user.id,
        action="FLOOR_REVIEW_UPSERTED",
        ip_address=_client_ip(request),
        metadata={"floor_id": floor_id, "rating": payload.rating},
    )

    return success_response(
        message="Floor review saved successfully",
        data=_serialize_floor_review(review),
    )


@router.delete("/floors/{floor_id}/reviews/me")
async def delete_floor_review(
    floor_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    audit_service = _audit_service_from_session(session)

    if floor_id.startswith("floor-"):
        deleted = AdminWorkspaceStateStore.delete_floor_review(
            floor_id=floor_id, user_id=str(current_user.id)
        )
        if not deleted:
            raise NotFoundException("Floor review not found")

        await audit_service.record(
            user_id=current_user.id,
            action="FLOOR_REVIEW_DELETED",
            ip_address=_client_ip(request),
            metadata={"floor_id": floor_id},
        )
        return success_response(message="Floor review deleted successfully", data={})

    service = _service_from_session(session)
    await service.delete_floor_review(floor_id=floor_id, current_user=current_user)
    await audit_service.record(
        user_id=current_user.id,
        action="FLOOR_REVIEW_DELETED",
        ip_address=_client_ip(request),
        metadata={"floor_id": floor_id},
    )

    return success_response(message="Floor review deleted successfully", data={})
