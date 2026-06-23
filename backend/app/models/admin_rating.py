import uuid

from sqlalchemy import CheckConstraint, ForeignKey, Index, Integer, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.base import Base, TimestampMixin


class AdminRating(TimestampMixin, Base):
    __tablename__ = "admin_ratings"
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_admin_rating_range"),
        UniqueConstraint("admin_id", "user_id", name="uq_admin_rating_admin_user"),
        Index("ix_admin_ratings_admin_id", "admin_id"),
        Index("ix_admin_ratings_user_id", "user_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    admin_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    admin = relationship(
        "User",
        back_populates="received_admin_ratings",
        foreign_keys=[admin_id],
    )
    reviewer = relationship(
        "User",
        back_populates="given_admin_ratings",
        foreign_keys=[user_id],
    )
