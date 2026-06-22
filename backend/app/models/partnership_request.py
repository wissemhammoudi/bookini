import uuid

from sqlalchemy import String, Text, Integer, Enum, Index
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.domain.enums import PartnershipRequestStatus
from app.infrastructure.base import Base, TimestampMixin


class PartnershipRequest(TimestampMixin, Base):
    __tablename__ = "partnership_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    
    # Company Information
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_person: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # Business Details
    number_of_floors: Mapped[int] = mapped_column(Integer, nullable=False)
    expected_users: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Status
    status: Mapped[PartnershipRequestStatus] = mapped_column(
        Enum(PartnershipRequestStatus, name="partnership_request_status_enum"),
        nullable=False,
        default=PartnershipRequestStatus.PENDING,
    )
    
    # Admin Response
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_by_admin_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    
    # Metadata
    metadata: Mapped[dict] = mapped_column(JSON, nullable=False, default={})

    __table_args__ = (
        Index("ix_partnership_email", "contact_email"),
        Index("ix_partnership_status", "status"),
    )
