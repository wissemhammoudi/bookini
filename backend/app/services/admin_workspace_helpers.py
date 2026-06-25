from __future__ import annotations

from app.schemas.admin_workspace import ReservationAreaRecord
from app.services.admin_workspace_seed import utc_now


def generate_prefixed_id(prefix: str) -> str:
    return f"{prefix}-{utc_now().strftime('%H%M%S%f')[-8:]}"


def normalize_reservation_areas(
    reservation_areas: list[str | ReservationAreaRecord],
) -> list[ReservationAreaRecord]:
    normalized: list[ReservationAreaRecord] = []
    for area in reservation_areas:
        if isinstance(area, ReservationAreaRecord):
            normalized.append(area)
            continue

        if isinstance(area, str) and area.strip():
            normalized.append(
                ReservationAreaRecord(
                    name=area.strip(),
                    price=0,
                    includes=[],
                    is_reservable=True,
                )
            )
    return normalized
