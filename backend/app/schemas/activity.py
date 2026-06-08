from pydantic import BaseModel, Field


class ActivityCreateRequest(BaseModel):
    reservation_id: str = Field(min_length=1)
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None


class ActivityUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
