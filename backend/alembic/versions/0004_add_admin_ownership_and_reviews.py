"""add floor ownership and review tables

Revision ID: 0004_admin_ownership_reviews
Revises: 0003_add_avatar_url_to_user
Create Date: 2026-06-23 00:00:00

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0004_admin_ownership_reviews"
down_revision: str | None = "0003_add_avatar_url_to_user"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "floors",
        sa.Column("admin_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_index(op.f("ix_floors_admin_id"), "floors", ["admin_id"], unique=False)
    op.create_foreign_key(
        "fk_floors_admin_id_users",
        "floors",
        "users",
        ["admin_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_table(
        "admin_ratings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("admin_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
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
        sa.CheckConstraint("rating >= 1 AND rating <= 5", name="ck_admin_rating_range"),
        sa.ForeignKeyConstraint(["admin_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("admin_id", "user_id", name="uq_admin_rating_admin_user"),
    )
    op.create_index(
        op.f("ix_admin_ratings_admin_id"), "admin_ratings", ["admin_id"], unique=False
    )
    op.create_index(
        op.f("ix_admin_ratings_user_id"), "admin_ratings", ["user_id"], unique=False
    )

    op.create_table(
        "floor_reviews",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("floor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
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
        sa.CheckConstraint(
            "rating >= 1 AND rating <= 5",
            name="ck_floor_review_rating_range",
        ),
        sa.ForeignKeyConstraint(["floor_id"], ["floors.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("floor_id", "user_id", name="uq_floor_review_floor_user"),
    )
    op.create_index(
        op.f("ix_floor_reviews_floor_id"), "floor_reviews", ["floor_id"], unique=False
    )
    op.create_index(
        op.f("ix_floor_reviews_user_id"), "floor_reviews", ["user_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_floor_reviews_user_id"), table_name="floor_reviews")
    op.drop_index(op.f("ix_floor_reviews_floor_id"), table_name="floor_reviews")
    op.drop_table("floor_reviews")

    op.drop_index(op.f("ix_admin_ratings_user_id"), table_name="admin_ratings")
    op.drop_index(op.f("ix_admin_ratings_admin_id"), table_name="admin_ratings")
    op.drop_table("admin_ratings")

    op.drop_constraint("fk_floors_admin_id_users", "floors", type_="foreignkey")
    op.drop_index(op.f("ix_floors_admin_id"), table_name="floors")
    op.drop_column("floors", "admin_id")
