from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

RoleValue = Literal["SUPER_ADMIN", "ADMIN", "USER"]
StatusValue = Literal["ACTIVE", "SUSPENDED"]
ReservationStatusValue = Literal[
    "PENDING",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
]
RequestStatusValue = Literal["PENDING", "APPROVED", "REJECTED", "PROCESSED"]
AvailabilityDayValue = Literal[
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
]


class AvailabilitySlot(BaseModel):
    day: AvailabilityDayValue
    start_time: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    end_time: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")


class ReservationAreaGeometry(BaseModel):
    x: float | None = None
    y: float | None = None
    w: float | None = None
    h: float | None = None
    rotation: float | None = None
    type: str | None = None


class ReservationAreaRecord(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    price: float = Field(ge=0, default=0)
    includes: list[str] = Field(default_factory=list)
    is_reservable: bool = True
    geometry: ReservationAreaGeometry | None = None
