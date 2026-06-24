from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class PublicBookingCreateRequest(BaseModel):
    room_id: int
    floor_id: str | None = None
    room_key: str | None = None
    booking_type: Literal["WHOLE_FLOOR", "SELECTED_AREAS"] | None = None
    selected_area_keys: list[str] | None = None
    room_name: str
    plan_id: str
    guest_name: str = Field(min_length=1, max_length=255)
    guest_email: EmailStr
    guest_phone: str = Field(min_length=1, max_length=20)
    booking_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    end_date: str | None = Field(default=None, pattern=r"^$|^\d{4}-\d{2}-\d{2}$")
    start_time: str = Field(pattern=r"^\d{2}:\d{2}$")
    end_time: str = Field(pattern=r"^\d{2}:\d{2}$")
    participants: int = Field(ge=1)
    notes: str | None = Field(default=None, max_length=1000)
    price: float = Field(ge=0)


class PublicBookingResponse(BaseModel):
    id: UUID
    booking_reference: str
    room_id: int
    room_name: str
    plan_id: str
    guest_name: str
    guest_email: str
    guest_phone: str
    booking_date: str
    start_time: str
    end_time: str
    participants: int
    notes: str | None
    price: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ContactRequestCreateRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(min_length=1, max_length=40)
    subject: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1, max_length=2000)
