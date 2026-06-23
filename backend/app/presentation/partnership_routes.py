from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.dependencies.rbac import require_roles
from app.domain.enums import PartnershipRequestStatus
from app.infrastructure.session import get_db_session
from app.models.user import User
from app.repositories.partnership_request_repository import PartnershipRequestRepository
from app.schemas.public_booking import (
    PartnershipRequestCreateRequest,
    PartnershipRequestResponse,
    PartnershipRequestUpdateRequest,
)
from app.schemas.admin_workspace import PartnershipRequestRecord
from app.services.admin_workspace_state_store import AdminWorkspaceStateStore

router = APIRouter(prefix="/partners", tags=["partners"])


@router.post("/request")
async def create_partnership_request(
    request: PartnershipRequestCreateRequest,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """Create a new partnership request (no auth required)"""
    
    repository = PartnershipRequestRepository(session)
    
    request_data = {
        "company_name": request.company_name,
        "contact_person": request.contact_person,
        "contact_email": request.contact_email,
        "contact_phone": request.contact_phone,
        "number_of_floors": request.number_of_floors,
        "expected_users": request.expected_users,
        "description": request.description,
        "status": PartnershipRequestStatus.PENDING,
        "metadata_payload": {"source": "web_form"},
    }
    
    partnership = await repository.create(request_data)
    await session.commit()
    
    # Also push to the in-memory workspace state to make it visible in the admin frontend
    state = AdminWorkspaceStateStore.get_state()
    record = PartnershipRequestRecord(
        id=str(partnership.id),
        company_name=partnership.company_name,
        contact_person=partnership.contact_person,
        email=partnership.contact_email,
        phone=partnership.contact_phone,
        business_description=partnership.description or "",
        requested_date=partnership.created_at or datetime.now(),
        status="PENDING",
        generated_credentials=None,
    )
    state.partnership_requests.insert(0, record)
    AdminWorkspaceStateStore.record_activity(
        title=partnership.company_name,
        description="Submitted a new partnership request.",
        item_type="partnership",
    )
    
    return success_response(
        message="Partnership request submitted successfully",
        data={
            "id": str(partnership.id),
            "company_name": partnership.company_name,
            "status": partnership.status.value,
        },
    )


@router.get("/request/{request_id}")
async def get_partnership_request(
    request_id: str,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    """Get partnership request details (no auth required)"""
    
    try:
        import uuid
        req_id = uuid.UUID(request_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request ID",
        )
    
    repository = PartnershipRequestRepository(session)
    partnership = await repository.get_by_id(req_id)
    
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
            "created_at": partnership.created_at.isoformat(),
        },
    )
