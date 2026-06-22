"""add public_bookings and partnership_requests tables

Revision ID: 0002_add_public_booking_partnership
Revises: 0001_initial_schema
Create Date: 2026-06-22 00:00:00

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002_add_public_booking_partnership"
down_revision: str | None = "0001_initial_schema"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    public_booking_status_enum = postgresql.ENUM(
        "PENDING",
        "CONFIRMED",
        "CANCELLED",
        "COMPLETED",
        name="public_booking_status_enum",
        create_type=False,
    )
    partnership_request_status_enum = postgresql.ENUM(
        "PENDING",
        "APPROVED",
        "REJECTED",
        name="partnership_request_status_enum",
        create_type=False,
    )

    bind = op.get_bind()
    public_booking_status_enum.create(bind, checkfirst=True)
    partnership_request_status_enum.create(bind, checkfirst=True)

    # Create public_bookings table
    op.create_table(
        "public_bookings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("booking_reference", sa.String(length=50), nullable=False),
        sa.Column("room_id", sa.Integer(), nullable=False),
        sa.Column("room_name", sa.String(length=255), nullable=False),
        sa.Column("plan_id", sa.String(length=50), nullable=False),
        sa.Column("guest_name", sa.String(length=255), nullable=False),
        sa.Column("guest_email", sa.String(length=255), nullable=False),
        sa.Column("guest_phone", sa.String(length=20), nullable=False),
        sa.Column("booking_date", sa.String(length=10), nullable=False),
        sa.Column("start_time", sa.String(length=5), nullable=False),
        sa.Column("end_time", sa.String(length=5), nullable=False),
        sa.Column("participants", sa.Integer(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("status", public_booking_status_enum, nullable=False),
        sa.Column("admin_notes", sa.Text(), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_public_bookings_booking_reference"),
        "public_bookings",
        ["booking_reference"],
        unique=True,
    )
    op.create_index(
        op.f("ix_public_bookings_date"),
        "public_bookings",
        ["booking_date"],
        unique=False,
    )
    op.create_index(
        op.f("ix_public_bookings_email"),
        "public_bookings",
        ["guest_email"],
        unique=False,
    )
    op.create_index(
        op.f("ix_public_bookings_status"),
        "public_bookings",
        ["status"],
        unique=False,
    )

    # Create partnership_requests table
    op.create_table(
        "partnership_requests",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("company_name", sa.String(length=255), nullable=False),
        sa.Column("contact_person", sa.String(length=255), nullable=False),
        sa.Column("contact_email", sa.String(length=255), nullable=False),
        sa.Column("contact_phone", sa.String(length=20), nullable=False),
        sa.Column("number_of_floors", sa.Integer(), nullable=False),
        sa.Column("expected_users", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", partnership_request_status_enum, nullable=False),
        sa.Column("admin_notes", sa.Text(), nullable=True),
        sa.Column("reviewed_by_admin_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_partnership_email"),
        "partnership_requests",
        ["contact_email"],
        unique=False,
    )
    op.create_index(
        op.f("ix_partnership_status"),
        "partnership_requests",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_partnership_status"), table_name="partnership_requests"
    )
    op.drop_index(
        op.f("ix_partnership_email"), table_name="partnership_requests"
    )
    op.drop_table("partnership_requests")

    op.drop_index(
        op.f("ix_public_bookings_status"), table_name="public_bookings"
    )
    op.drop_index(
        op.f("ix_public_bookings_email"), table_name="public_bookings"
    )
    op.drop_index(
        op.f("ix_public_bookings_date"), table_name="public_bookings"
    )
    op.drop_index(
        op.f("ix_public_bookings_booking_reference"),
        table_name="public_bookings",
    )
    op.drop_table("public_bookings")

    bind = op.get_bind()
    sa.Enum(name="partnership_request_status_enum").drop(bind, checkfirst=True)
    sa.Enum(name="public_booking_status_enum").drop(bind, checkfirst=True)
