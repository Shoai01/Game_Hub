from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from core.db import get_db
from core.deps import get_current_user
from auth_service.models.user import User
from room_service.crud import room as crud_room
from room_service.schemas.room import RoomCreate, RoomJoin, RoomOut, RoomPlayerOut

router = APIRouter()


def _build_room_response(room, players) -> dict:
    """Build a RoomOut-compatible dict from a Room + its players."""
    return {
        "id": room.id,
        "code": room.code,
        "host_id": room.host_id,
        "max_players": room.max_players,
        "status": room.status,
        "created_at": room.created_at,
        "players": [
            {
                "id": p.user_id,
                "user_id": p.user_id,
                "username": p.username,
                "avatar": p.avatar,
                "is_host": p.is_host,
                "is_ready": p.is_ready,
                "color": p.color,
                "joined_at": p.joined_at,
            }
            for p in players
        ],
    }


@router.post("/create", response_model=RoomOut, status_code=status.HTTP_201_CREATED)
async def create_room(
    room_in: RoomCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = await crud_room.create_room(
        db,
        host_id=current_user.id,
        host_username=current_user.username,
        host_avatar=current_user.avatar or "avatar1",
        max_players=room_in.max_players,
    )
    players = await crud_room.get_room_players(db, room.id)
    return _build_room_response(room, players)


@router.post("/join", response_model=RoomOut)
async def join_room(
    room_in: RoomJoin,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = await crud_room.get_room_by_code(db, room_in.room_code)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found. Check the code and try again.",
        )
    try:
        room = await crud_room.join_room(
            db,
            room=room,
            user_id=current_user.id,
            username=current_user.username,
            avatar=current_user.avatar or "avatar1",
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    players = await crud_room.get_room_players(db, room.id)
    return _build_room_response(room, players)


@router.post("/{room_id}/leave", response_model=RoomOut | None)
async def leave_room(
    room_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = await crud_room.get_room_by_id(db, room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found.")

    result = await crud_room.leave_room(db, room=room, user_id=current_user.id)
    if result is None:
        return None

    players = await crud_room.get_room_players(db, result.id)
    return _build_room_response(result, players)


@router.post("/{room_id}/toggle-ready", response_model=RoomOut)
async def toggle_ready(
    room_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = await crud_room.get_room_by_id(db, room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found.")

    try:
        room = await crud_room.toggle_ready(db, room=room, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    players = await crud_room.get_room_players(db, room.id)
    return _build_room_response(room, players)


@router.post("/{room_id}/start", response_model=RoomOut)
async def start_game(
    room_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = await crud_room.get_room_by_id(db, room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found.")

    try:
        room = await crud_room.start_game(db, room=room, host_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    players = await crud_room.get_room_players(db, room.id)
    return _build_room_response(room, players)


@router.get("/{room_id}", response_model=RoomOut)
async def get_room(
    room_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = await crud_room.get_room_by_id(db, room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found.")

    players = await crud_room.get_room_players(db, room.id)
    return _build_room_response(room, players)


from pydantic import BaseModel
from sqlalchemy.orm.attributes import flag_modified
from room_service.engine import ludo_engine

class MoveTokenRequest(BaseModel):
    token_id: str


@router.get("/{room_id}/game-state")
async def get_game_state(
    room_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = await crud_room.get_room_by_id(db, room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found.")
    
    if room.status == "in_game" and not room.game_state:
        # Self-healing fallback if game_state wasn't initialized
        players = await crud_room.get_room_players(db, room.id)
        players_data = [
            {
                "id": p.user_id,
                "username": p.username,
                "avatar": p.avatar,
                "color": p.color or "red",
            }
            for p in players
        ]
        room.game_state = ludo_engine.init_game(players_data)
        db.add(room)
        await db.commit()
        await db.refresh(room)
        
    return room.game_state


@router.post("/{room_id}/roll-dice")
async def roll_dice(
    room_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = await crud_room.get_room_by_id(db, room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found.")
    
    if room.status != "in_game" or not room.game_state:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Game has not started yet.")
        
    state = dict(room.game_state)
    
    # Validate player turn
    current_player = state["players"][state["currentPlayerIndex"]]
    if current_player["id"] != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="It is not your turn.")
        
    if state["turnPhase"] != "ROLL":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already rolled.")
        
    new_state, dice_value = ludo_engine.roll_dice(state)
    
    if new_state.get("gameOver"):
        room.status = "finished"
        
    room.game_state = new_state
    flag_modified(room, "game_state")
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room.game_state


@router.post("/{room_id}/move-token")
async def move_token(
    room_id: str,
    req: MoveTokenRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = await crud_room.get_room_by_id(db, room_id)
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found.")
        
    if room.status != "in_game" or not room.game_state:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Game has not started yet.")
        
    state = dict(room.game_state)
    
    # Validate player turn
    current_player = state["players"][state["currentPlayerIndex"]]
    if current_player["id"] != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="It is not your turn.")
        
    if state["turnPhase"] != "MOVE":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No moves pending. Roll first.")
        
    # Check if the token belongs to the active player
    token_belongs = any(t["id"] == req.token_id for t in current_player["tokens"])
    if not token_belongs:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This token does not belong to you.")
        
    # Check if this move is valid
    valid_moves = ludo_engine.get_valid_moves(state, state["diceValue"])
    if req.token_id not in valid_moves:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token move.")
        
    new_state, events = ludo_engine.move_token(state, req.token_id)
    
    if new_state.get("gameOver"):
        room.status = "finished"
        
    room.game_state = new_state
    flag_modified(room, "game_state")
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room.game_state
