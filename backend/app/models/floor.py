import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.enums import FloorStatus
from app.infrastructure.base import Base, TimestampMixin


class Floor(TimestampMixin, Base):
    __tablename__ = "floors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    admin_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    building: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    floor_number: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[FloorStatus] = mapped_column(
        Enum(FloorStatus, name="floor_status_enum"),
        nullable=False,
        default=FloorStatus.AVAILABLE,
    )
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    admin = relationship("User", back_populates="owned_floors")
    reservations = relationship("Reservation", back_populates="floor")
    reviews = relationship("FloorReview", back_populates="floor")
