import uuid
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON
from datetime import datetime, timezone
from core.db import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(6), unique=True, index=True, nullable=False)
    host_id = Column(String, nullable=False)
    max_players = Column(Integer, default=4, nullable=False)
    status = Column(String, default="waiting", nullable=False)  # waiting | ready | in_game | finished | closed
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    game_state = Column(JSON, nullable=True)


class RoomPlayer(Base):
    __tablename__ = "room_players"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id = Column(String, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, nullable=False)
    username = Column(String, nullable=False)
    avatar = Column(String, nullable=True, default="avatar1")
    is_host = Column(Boolean, default=False, nullable=False)
    is_ready = Column(Boolean, default=False, nullable=False)
    color = Column(String, nullable=True)  # assigned at game start: red, green, yellow, blue
    joined_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
