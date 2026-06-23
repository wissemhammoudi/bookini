from pydantic import BaseModel, Field


class RatingCommentRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)
