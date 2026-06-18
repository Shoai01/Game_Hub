from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from room_service.models.message import Message


async def create_message(
    db: AsyncSession,
    room_id: str,
    user_id: str,
    username: str,
    text: str,
) -> Message:
    msg = Message(
        room_id=room_id,
        user_id=user_id,
        username=username,
        text=text.strip(),
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


async def get_messages(
    db: AsyncSession,
    room_id: str,
    limit: int = 100,
    after_id: str | None = None,
) -> list[Message]:
    """Get messages for a room, optionally only those after a given message ID."""
    query = select(Message).filter(Message.room_id == room_id)

    if after_id:
        # Get the timestamp of the reference message
        ref_result = await db.execute(select(Message).filter(Message.id == after_id))
        ref_msg = ref_result.scalars().first()
        if ref_msg:
            query = query.filter(Message.timestamp > ref_msg.timestamp)

    query = query.order_by(Message.timestamp).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())
