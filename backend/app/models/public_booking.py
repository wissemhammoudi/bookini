import uuid

from sqlalchemy import String, Text, Integer, Float, Enum, Index
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.domain.enums import PublicBookingStatus
from app.infrastructure.base import Base, TimestampMixin


class PublicBooking(TimestampMixin, Base):
    __tablename__ = "public_bookings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    booking_reference: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    room_id: Mapped[int] = mapped_column(Integer, nullable=False)
    room_name: Mapped[str] = mapped_column(String(255), nullable=False)
    plan_id: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # Guest Information
    guest_name: Mapped[str] = mapped_column(String(255), nullable=False)
    guest_email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    guest_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    
    # Booking Details
    booking_date: Mapped[str] = mapped_column(String(10), nullable=False)  # YYYY-MM-DD
    start_time: Mapped[str] = mapped_column(String(5), nullable=False)  # HH:MM
    end_time: Mapped[str] = mapped_column(String(5), nullable=False)  # HH:MM
    participants: Mapped[int] = mapped_column(Integer, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Pricing
    price: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Status
    status: Mapped[PublicBookingStatus] = mapped_column(
        Enum(PublicBookingStatus, name="public_booking_status_enum"),
        nullable=False,
        default=PublicBookingStatus.PENDING,
    )
    
    # Admin Notes
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Metadata
    metadata: Mapped[dict] = mapped_column(JSON, nullable=False, default={})

    __table_args__ = (
        Index("ix_public_bookings_date", "booking_date"),
        Index("ix_public_bookings_email", "guest_email"),
        Index("ix_public_bookings_status", "status"),
    )
