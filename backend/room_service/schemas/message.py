from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MessageCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)


class MessageOut(BaseModel):
    id: str
    room_id: str
    user_id: str
    username: str
    text: str
    timestamp: datetime

    class Config:
        from_attributes = True
