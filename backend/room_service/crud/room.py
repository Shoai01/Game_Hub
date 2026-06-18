import random
import string
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from room_service.models.room import Room, RoomPlayer


def _generate_room_code() -> str:
    """Generate a 6-character room code, excluding ambiguous characters."""
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "".join(random.choices(chars, k=6))


async def get_room_by_id(db: AsyncSession, room_id: str) -> Room | None:
    result = await db.execute(select(Room).filter(Room.id == room_id))
    return result.scalars().first()


async def get_room_by_code(db: AsyncSession, code: str) -> Room | None:
    result = await db.execute(select(Room).filter(Room.code == code.upper()))
    return result.scalars().first()


async def get_room_players(db: AsyncSession, room_id: str) -> list[RoomPlayer]:
    result = await db.execute(
        select(RoomPlayer)
        .filter(RoomPlayer.room_id == room_id)
        .order_by(RoomPlayer.joined_at)
    )
    return list(result.scalars().all())


async def create_room(
    db: AsyncSession,
    host_id: str,
    host_username: str,
    host_avatar: str,
    max_players: int = 4,
) -> Room:
    # Generate a unique room code
    for _ in range(10):
        code = _generate_room_code()
        existing = await get_room_by_code(db, code)
        if not existing:
            break
    else:
        raise Exception("Failed to generate unique room code. Try again.")

    room = Room(
        code=code,
        host_id=host_id,
        max_players=max_players,
        status="waiting",
    )
    db.add(room)
    await db.flush()  # flush to get room.id before creating player

    host_player = RoomPlayer(
        room_id=room.id,
        user_id=host_id,
        username=host_username,
        avatar=host_avatar,
        is_host=True,
        is_ready=False,
    )
    db.add(host_player)
    await db.commit()
    await db.refresh(room)
    return room


async def join_room(
    db: AsyncSession,
    room: Room,
    user_id: str,
    username: str,
    avatar: str,
) -> Room:
    players = await get_room_players(db, room.id)

    if room.status != "waiting":
        raise ValueError("This room is no longer accepting players.")
    if len(players) >= room.max_players:
        raise ValueError("Room is full.")
    if any(p.user_id == user_id for p in players):
        raise ValueError("You are already in this room.")

    player = RoomPlayer(
        room_id=room.id,
        user_id=user_id,
        username=username,
        avatar=avatar,
        is_host=False,
        is_ready=False,
    )
    db.add(player)
    await db.commit()
    await db.refresh(room)
    return room


async def leave_room(db: AsyncSession, room: Room, user_id: str) -> Room | None:
    players = await get_room_players(db, room.id)
    player = next((p for p in players if p.user_id == user_id), None)
    if not player:
        return room

    await db.delete(player)
    remaining = [p for p in players if p.user_id != user_id]

    # If no players left, close the room
    if not remaining:
        room.status = "closed"
        db.add(room)
        await db.commit()
        return None

    # If host left, transfer to longest-present player
    if room.host_id == user_id:
        new_host = remaining[0]  # already ordered by joined_at
        room.host_id = new_host.user_id
        new_host.is_host = True
        db.add(new_host)
        # Remove host flag from others (just in case)
        for p in remaining[1:]:
            if p.is_host:
                p.is_host = False
                db.add(p)

    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room


async def toggle_ready(db: AsyncSession, room: Room, user_id: str) -> Room:
    players = await get_room_players(db, room.id)
    player = next((p for p in players if p.user_id == user_id), None)
    if not player:
        raise ValueError("You are not in this room.")

    player.is_ready = not player.is_ready
    db.add(player)

    # Refresh player list with updated readiness
    updated_ready = []
    for p in players:
        if p.user_id == user_id:
            updated_ready.append(player.is_ready)
        else:
            updated_ready.append(p.is_ready)

    all_ready = all(updated_ready) and len(players) >= 2
    room.status = "ready" if all_ready else "waiting"
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room


from room_service.engine.ludo_engine import init_game

async def start_game(db: AsyncSession, room: Room, host_id: str) -> Room:
    if room.host_id != host_id:
        raise ValueError("Only the host can start the game.")

    players = await get_room_players(db, room.id)
    if len(players) < 2:
        raise ValueError("Need at least 2 players to start.")

    colors = ["red", "green", "yellow", "blue"]
    players_data = []
    for i, player in enumerate(players):
        player.color = colors[i]
        db.add(player)
        players_data.append({
            "id": player.user_id,
            "username": player.username,
            "avatar": player.avatar,
            "color": player.color,
        })

    room.status = "in_game"
    room.game_state = init_game(players_data)
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room
