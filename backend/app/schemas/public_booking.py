from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, EmailStr


class PublicBookingCreateRequest(BaseModel):
    room_id: int
    room_name: str
    plan_id: str
    guest_name: str = Field(min_length=1, max_length=255)
    guest_email: EmailStr
    guest_phone: str = Field(min_length=1, max_length=20)
    booking_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
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


class PartnershipRequestCreateRequest(BaseModel):
    company_name: str = Field(min_length=1, max_length=255)
    contact_person: str = Field(min_length=1, max_length=255)
    contact_email: EmailStr
    contact_phone: str = Field(min_length=1, max_length=20)
    number_of_floors: int = Field(ge=1)
    expected_users: int = Field(ge=1)
    description: str = Field(min_length=1, max_length=2000)


class PartnershipRequestResponse(BaseModel):
    id: UUID
    company_name: str
    contact_person: str
    contact_email: str
    contact_phone: str
    number_of_floors: int
    expected_users: int
    description: str
    status: str
    admin_notes: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PartnershipRequestUpdateRequest(BaseModel):
    status: str = Field(pattern="^(APPROVED|REJECTED)$")
    admin_notes: str | None = Field(default=None, max_length=1000)
