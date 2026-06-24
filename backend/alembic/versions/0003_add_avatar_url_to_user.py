"""add avatar_url to users table

Revision ID: 0003_add_avatar_url_to_user
Revises: 0002_public_booking_partnership
Create Date: 2026-06-22 00:00:00

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0003_add_avatar_url_to_user"
down_revision: str | None = "0002_public_booking_partnership"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users", sa.Column("avatar_url", sa.String(length=512), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("users", "avatar_url")
