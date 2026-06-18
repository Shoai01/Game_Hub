from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class RoomCreate(BaseModel):
    max_players: int = Field(4, ge=2, le=4)


class RoomJoin(BaseModel):
    room_code: str = Field(..., min_length=6, max_length=6)


class RoomPlayerOut(BaseModel):
    id: str
    user_id: str
    username: str
    avatar: Optional[str]
    is_host: bool
    is_ready: bool
    color: Optional[str]
    joined_at: datetime

    class Config:
        from_attributes = True


class RoomOut(BaseModel):
    id: str
    code: str
    host_id: str
    max_players: int
    status: str
    created_at: datetime
    players: List[RoomPlayerOut] = []

    class Config:
        from_attributes = True
