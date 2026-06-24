from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ValidationException
from app.core.responses import success_response
from app.dependencies.rbac import require_roles
from app.domain.enums import PartnershipRequestStatus, PublicBookingStatus, UserRole
from app.infrastructure.session import get_db_session
from app.models.user import User
from app.presentation.admin_workspace_dashboard_routes import (
    router as admin_workspace_dashboard_router,
)
from app.presentation.admin_workspace_management_routes import (
    router as admin_workspace_management_router,
)
from app.presentation.admin_workspace_request_routes import (
    router as admin_workspace_request_router,
)
from app.repositories.audit_log_repository import AuditLogRepository
from app.repositories.partnership_request_repository import PartnershipRequestRepository
from app.repositories.public_booking_repository import PublicBookingRepository
from app.repositories.user_repository import UserRepository
from app.schemas.admin import AdminRoleUpdateRequest
from app.schemas.public_booking import PartnershipRequestUpdateRequest

router = APIRouter(prefix="/admin", tags=["admin"])
router.include_router(admin_workspace_dashboard_router)
router.include_router(admin_workspace_management_router)
router.include_router(admin_workspace_request_router)


@router.get("/dashboard")
async def admin_dashboard(
    current_user: User = Depends(require_roles(["ADMIN", "SUPER_ADMIN"])),
) -> dict[str, object]:
    return success_response(
        message="Admin dashboard data retrieved",
        data={
            "role": current_user.role.value,
            "permissions_scope": "admin",
            "total_admin_users": 0,
        },
    )


@router.post("/floors/{floor_id}/archive")
async def archive_floor(
    floor_id: str,
    current_user: User = Depends(require_roles(["ADMIN", "SUPER_ADMIN"])),
) -> dict[str, object]:
    return success_response(
        message="Sensitive floor operation authorized",
        data={
            "floor_id": floor_id,
            "performed_by": str(current_user.id),
        },
    )


@router.get("/reservations")
async def list_all_reservations(
    _: User = Depends(require_roles(["ADMIN", "SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    from app.repositories.reservation_repository import ReservationRepository

    repository = ReservationRepository(session)
    reservations = await repository.list_all()

    data = [
        {
            "id": str(item.id),
            "user_id": str(item.user_id),
            "floor_id": str(item.floor_id),
            "start_time": item.start_time.isoformat(),
            "end_time": item.end_time.isoformat(),
            "status": item.status.value,
        }
        for item in reservations
    ]

    return success_response(
        message="Admin reservations retrieved",
        data=data,
    )


@router.get("/audit-logs")
async def audit_logs(
    limit: int = Query(default=50, ge=1, le=200),
    _: User = Depends(require_roles(["SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    repository = AuditLogRepository(session)
    items = await repository.list_recent(limit=limit)
    data = [
        {
            "id": str(item.id),
            "user_id": str(item.user_id),
            "action": item.action,
            "ip_address": item.ip_address,
            "metadata": item.metadata_payload,
            "timestamp": item.timestamp.isoformat(),
        }
        for item in items
    ]
    return success_response(message="Audit logs retrieved", data=data)


@router.get("/admins")
async def list_admins(
    _: User = Depends(require_roles(["SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    repository = UserRepository(session)
    admins = await repository.list_admins()

    data = [
        {
            "id": str(item.id),
            "full_name": item.full_name,
            "email": item.email,
            "role": item.role.value,
            "is_active": item.is_active,
        }
        for item in admins
    ]
    return success_response(message="Admin users retrieved", data=data)


@router.patch("/admins/role")
async def update_admin_role(
    payload: AdminRoleUpdateRequest,
    _: User = Depends(require_roles(["SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    if payload.role not in (UserRole.ADMIN, UserRole.SUPER_ADMIN):
        raise ValidationException("Role must be ADMIN or SUPER_ADMIN")

    repository = UserRepository(session)
    user = await repository.get_by_email(payload.email)
    if not user:
        raise ValidationException("Target user not found")

    updated_user = await repository.update_role(user=user, role=payload.role)
    return success_response(
        message="Admin role updated",
        data={
            "id": str(updated_user.id),
            "email": updated_user.email,
            "role": updated_user.role.value,
        },
    )


@router.get("/super-admin/settings")
async def super_admin_settings(
    current_user: User = Depends(require_roles(["SUPER_ADMIN"])),
) -> dict[str, object]:
    return success_response(
        message="Super admin settings retrieved",
        data={
            "role": current_user.role.value,
            "permissions_scope": "super_admin",
            "total_admin_users": 0,
        },
    )


# ======================= Public Bookings Management =======================


@router.get("/super-admin/bookings")
async def list_public_bookings(
    status: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    _: User = Depends(require_roles(["SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """List all public bookings (SUPER_ADMIN only)"""

    repository = PublicBookingRepository(session)

    if status:
        try:
            booking_status = PublicBookingStatus(status)
            bookings = await repository.list_by_status(
                booking_status, skip=skip, limit=limit
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status}",
            )
    else:
        bookings = await repository.list_all(skip=skip, limit=limit)

    data = [
        {
            "id": str(b.id),
            "booking_reference": b.booking_reference,
            "room_name": b.room_name,
            "guest_name": b.guest_name,
            "guest_email": b.guest_email,
            "booking_date": b.booking_date,
            "start_time": b.start_time,
            "end_time": b.end_time,
            "price": b.price,
            "status": b.status.value,
            "participants": b.participants,
            "created_at": b.created_at.isoformat(),
        }
        for b in bookings
    ]

    return success_response(
        message="Public bookings retrieved",
        data=data,
    )


@router.get("/super-admin/bookings/{booking_id}")
async def get_public_booking(
    booking_id: str,
    _: User = Depends(require_roles(["SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """Get public booking details (SUPER_ADMIN only)"""

    try:
        import uuid

        bid = uuid.UUID(booking_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid booking ID",
        )

    repository = PublicBookingRepository(session)
    booking = await repository.get_by_id(bid)

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    return success_response(
        message="Booking retrieved",
        data={
            "id": str(booking.id),
            "booking_reference": booking.booking_reference,
            "room_name": booking.room_name,
            "plan_id": booking.plan_id,
            "guest_name": booking.guest_name,
            "guest_email": booking.guest_email,
            "guest_phone": booking.guest_phone,
            "booking_date": booking.booking_date,
            "start_time": booking.start_time,
            "end_time": booking.end_time,
            "participants": booking.participants,
            "notes": booking.notes,
            "price": booking.price,
            "status": booking.status.value,
            "admin_notes": booking.admin_notes,
            "created_at": booking.created_at.isoformat(),
            "updated_at": booking.updated_at.isoformat(),
        },
    )


@router.patch("/super-admin/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    new_status: str = Query(..., pattern="^(CONFIRMED|CANCELLED|COMPLETED)$"),
    admin_notes: str | None = Query(None),
    current_user: User = Depends(require_roles(["SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """Update public booking status (SUPER_ADMIN only)"""

    try:
        import uuid

        bid = uuid.UUID(booking_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid booking ID",
        )

    repository = PublicBookingRepository(session)
    booking = await repository.update_status(
        bid,
        PublicBookingStatus(new_status),
        admin_notes=admin_notes,
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    await session.commit()

    return success_response(
        message="Booking status updated",
        data={
            "id": str(booking.id),
            "status": booking.status.value,
            "admin_notes": booking.admin_notes,
        },
    )


# ======================= Partnership Requests Management =======================


@router.get("/super-admin/partnerships")
async def list_partnership_requests(
    status: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    _: User = Depends(require_roles(["SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """List all partnership requests (SUPER_ADMIN only)"""

    repository = PartnershipRequestRepository(session)

    if status:
        try:
            req_status = PartnershipRequestStatus(status)
            requests = await repository.list_by_status(
                req_status, skip=skip, limit=limit
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status}",
            )
    else:
        requests = await repository.list_all(skip=skip, limit=limit)

    data = [
        {
            "id": str(r.id),
            "company_name": r.company_name,
            "contact_person": r.contact_person,
            "contact_email": r.contact_email,
            "contact_phone": r.contact_phone,
            "number_of_floors": r.number_of_floors,
            "expected_users": r.expected_users,
            "status": r.status.value,
            "created_at": r.created_at.isoformat(),
        }
        for r in requests
    ]

    return success_response(
        message="Partnership requests retrieved",
        data=data,
    )


@router.get("/super-admin/partnerships/{request_id}")
async def get_partnership_request_admin(
    request_id: str,
    _: User = Depends(require_roles(["SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """Get partnership request details (SUPER_ADMIN only)"""

    try:
        import uuid

        rid = uuid.UUID(request_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request ID",
        )

    repository = PartnershipRequestRepository(session)
    partnership = await repository.get_by_id(rid)

    if not partnership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partnership request not found",
        )

    return success_response(
        message="Partnership request retrieved",
        data={
            "id": str(partnership.id),
            "company_name": partnership.company_name,
            "contact_person": partnership.contact_person,
            "contact_email": partnership.contact_email,
            "contact_phone": partnership.contact_phone,
            "number_of_floors": partnership.number_of_floors,
            "expected_users": partnership.expected_users,
            "description": partnership.description,
            "status": partnership.status.value,
            "admin_notes": partnership.admin_notes,
            "created_at": partnership.created_at.isoformat(),
            "updated_at": partnership.updated_at.isoformat(),
        },
    )


@router.patch("/super-admin/partnerships/{request_id}")
async def update_partnership_request(
    request_id: str,
    payload: PartnershipRequestUpdateRequest,
    current_user: User = Depends(require_roles(["SUPER_ADMIN"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """Update partnership request status (SUPER_ADMIN only)"""

    try:
        import uuid

        rid = uuid.UUID(request_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request ID",
        )

    repository = PartnershipRequestRepository(session)
    partnership = await repository.update_status(
        rid,
        PartnershipRequestStatus(payload.status),
        admin_id=current_user.id,
        admin_notes=payload.admin_notes,
    )

    if not partnership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partnership request not found",
        )

    await session.commit()

    return success_response(
        message="Partnership request updated",
        data={
            "id": str(partnership.id),
            "status": partnership.status.value,
            "admin_notes": partnership.admin_notes,
        },
    )
