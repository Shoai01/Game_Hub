import uuid
# pyrefly: ignore [missing-import]
from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime, timezone
from core.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    avatar = Column(String, nullable=True, default="avatar1")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    stats = Column(JSON, default=lambda: {"totalGames": 0, "wins": 0, "losses": 0})
