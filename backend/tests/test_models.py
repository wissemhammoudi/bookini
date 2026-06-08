from app.models import Base
from app.models.audit_log import AuditLog
from app.models.reservation import Reservation


def test_all_required_tables_exist() -> None:
    table_names = set(Base.metadata.tables.keys())
    assert table_names == {
        "users",
        "floors",
        "reservations",
        "activities",
        "audit_logs",
    }


def test_reservation_has_time_range_constraint() -> None:
    constraints = {c.name for c in Reservation.__table__.constraints if c.name}
    assert "ck_reservation_time_range" in constraints


def test_audit_log_metadata_column_name_matches_spec() -> None:
    assert "metadata" in AuditLog.__table__.columns.keys()
