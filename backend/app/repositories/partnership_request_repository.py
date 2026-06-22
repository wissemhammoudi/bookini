import uuid

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.enums import PartnershipRequestStatus
from app.models.partnership_request import PartnershipRequest


class PartnershipRequestRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, request_data: dict) -> PartnershipRequest:
        request = PartnershipRequest(**request_data)
        self.session.add(request)
        await self.session.flush()
        return request

    async def get_by_id(self, request_id: uuid.UUID) -> PartnershipRequest | None:
        return await self.session.get(PartnershipRequest, request_id)

    async def list_all(self, skip: int = 0, limit: int = 50) -> list[PartnershipRequest]:
        stmt = (
            select(PartnershipRequest)
            .order_by(desc(PartnershipRequest.created_at))
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def list_by_status(
        self, status: PartnershipRequestStatus, skip: int = 0, limit: int = 50
    ) -> list[PartnershipRequest]:
        stmt = (
            select(PartnershipRequest)
            .where(PartnershipRequest.status == status)
            .order_by(desc(PartnershipRequest.created_at))
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def list_by_email(self, email: str) -> list[PartnershipRequest]:
        stmt = select(PartnershipRequest).where(
            PartnershipRequest.contact_email == email
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update_status(
        self,
        request_id: uuid.UUID,
        status: PartnershipRequestStatus,
        admin_id: uuid.UUID | None = None,
        admin_notes: str | None = None,
    ) -> PartnershipRequest | None:
        request = await self.get_by_id(request_id)
        if not request:
            return None

        request.status = status
        if admin_id:
            request.reviewed_by_admin_id = admin_id
        if admin_notes:
            request.admin_notes = admin_notes

        await self.session.flush()
        return request

    async def delete(self, request_id: uuid.UUID) -> bool:
        request = await self.get_by_id(request_id)
        if not request:
            return False

        await self.session.delete(request)
        await self.session.flush()
        return True

    async def count_all(self) -> int:
        result = await self.session.execute(select(PartnershipRequest))
        return len(result.scalars().all())

    async def count_by_status(self, status: PartnershipRequestStatus) -> int:
        stmt = select(PartnershipRequest).where(PartnershipRequest.status == status)
        result = await self.session.execute(stmt)
        return len(result.scalars().all())
