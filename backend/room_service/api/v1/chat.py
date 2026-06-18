from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from core.db import get_db
from core.deps import get_current_user
from auth_service.models.user import User
from room_service.crud import message as crud_message
from room_service.crud import room as crud_room
from room_service.schemas.message import MessageCreate, MessageOut

router = APIRouter()


@router.post("/{room_id}/messages", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
async def send_message(
    room_id: str,
    msg_in: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify room exists
    room = await crud_room.get_room_by_id(db, room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found.")

    msg = await crud_message.create_message(
        db,
        room_id=room_id,
        user_id=current_user.id,
        username=current_user.username,
        text=msg_in.text,
    )
    return msg


@router.get("/{room_id}/messages", response_model=list[MessageOut])
async def get_messages(
    room_id: str,
    after: Optional[str] = Query(None, description="Message ID to fetch messages after (for polling)"),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify room exists
    room = await crud_room.get_room_by_id(db, room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found.")

    messages = await crud_message.get_messages(db, room_id=room_id, limit=limit, after_id=after)
    return messages
