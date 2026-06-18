import random
from datetime import datetime, timezone

TOKEN_STATE = {
    "IN_BASE": "IN_BASE",
    "ON_BOARD": "ON_BOARD",
    "IN_HOME_STRETCH": "IN_HOME_STRETCH",
    "HOME": "HOME",
}

START_CELLS = {
    "red": 0,
    "green": 13,
    "yellow": 26,
    "blue": 39,
}

SAFE_CELLS = {0, 8, 13, 21, 26, 34, 39, 47}

def get_player_path(color: str) -> list[int]:
    start = START_CELLS[color]
    return [(start + i) % 52 for i in range(52)]

def init_game(players: list[dict]) -> dict:
    """
    players: list of dict with keys: 'id', 'username', 'avatar', 'color'
    """
    state_players = []
    for p in players:
        tokens = []
        for slot in range(4):
            tokens.append({
                "id": f"{p['color']}_{slot}",
                "color": p["color"],
                "state": TOKEN_STATE["IN_BASE"],
                "commonIndex": -1,
                "homeIndex": -1,
                "baseSlot": slot,
                "pathProgress": -1,
            })
        state_players.append({
            "id": p["id"],
            "username": p["username"],
            "avatar": p["avatar"],
            "color": p["color"],
            "tokens": tokens,
            "tokensHome": 0,
            "captures": 0,
            "finished": False,
            "finishOrder": -1,
        })
    
    return {
        "players": state_players,
        "currentPlayerIndex": 0,
        "diceValue": None,
        "diceRolled": False,
        "consecutiveSixes": 0,
        "turnPhase": "ROLL",  # ROLL | MOVE | EXTRA_ROLL | FINISHED
        "gameOver": False,
        "winnerId": None,
        "finishCount": 0,
        "log": [],
        "turnCount": 0,
        "startedAt": datetime.now(timezone.utc).isoformat(),
    }

def get_next_player_index(state: dict) -> int:
    count = len(state["players"])
    next_idx = (state["currentPlayerIndex"] + 1) % count
    attempts = 0
    while state["players"][next_idx]["finished"] and attempts < count:
        next_idx = (next_idx + 1) % count
        attempts += 1
    return next_idx

def get_valid_moves(state: dict, dice_value: int) -> list[str]:
    current_player = state["players"][state["currentPlayerIndex"]]
    valid_token_ids = []

    for token in current_player["tokens"]:
        if token["state"] == TOKEN_STATE["HOME"]:
            continue
        
        if token["state"] == TOKEN_STATE["IN_BASE"]:
            if dice_value == 6:
                valid_token_ids.append(token["id"])
            continue
            
        if token["state"] == TOKEN_STATE["ON_BOARD"]:
            current_progress = token["pathProgress"]
            new_progress = current_progress + dice_value
            if new_progress <= 56:
                valid_token_ids.append(token["id"])
            continue

        if token["state"] == TOKEN_STATE["IN_HOME_STRETCH"]:
            current_progress = token["pathProgress"]
            new_progress = current_progress + dice_value
            if new_progress <= 56:
                valid_token_ids.append(token["id"])
            continue

    return valid_token_ids

def roll_dice(state: dict) -> tuple[dict, int]:
    if state["gameOver"]:
        return state, 0
        
    dice_value = random.randint(1, 6)
    current_player = state["players"][state["currentPlayerIndex"]]
    
    state["diceValue"] = dice_value
    state["diceRolled"] = True
    
    # Track consecutive sixes
    if dice_value == 6:
        state["consecutiveSixes"] += 1
        if state["consecutiveSixes"] >= 3:
            state["log"].append({
                "type": "FORFEIT",
                "player": current_player["username"],
                "color": current_player["color"],
                "message": f"{current_player['username']} rolled three 6s — turn forfeited!"
            })
            state["consecutiveSixes"] = 0
            state["turnPhase"] = "ROLL"
            state["diceRolled"] = False
            state["diceValue"] = None
            state["currentPlayerIndex"] = get_next_player_index(state)
            state["turnCount"] += 1
            return state, dice_value
    else:
        state["consecutiveSixes"] = 0
        
    valid_moves = get_valid_moves(state, dice_value)
    if not valid_moves:
        state["log"].append({
            "type": "DICE_ROLLED",
            "player": current_player["username"],
            "color": current_player["color"],
            "value": dice_value,
            "message": f"{current_player['username']} rolled {dice_value} — no valid moves"
        })
        
        if dice_value == 6:
            state["turnPhase"] = "ROLL"
            state["diceRolled"] = False
            state["diceValue"] = None
        else:
            state["turnPhase"] = "ROLL"
            state["diceRolled"] = False
            state["diceValue"] = None
            state["currentPlayerIndex"] = get_next_player_index(state)
            state["turnCount"] += 1
    else:
        state["log"].append({
            "type": "DICE_ROLLED",
            "player": current_player["username"],
            "color": current_player["color"],
            "value": dice_value,
            "message": f"{current_player['username']} rolled {dice_value}"
        })
        state["turnPhase"] = "MOVE"
        
    return state, dice_value

def check_capture(players: list[dict], moving_token: dict, current_player_index: int) -> dict | None:
    if moving_token["commonIndex"] in SAFE_CELLS:
        return None
        
    for pi in range(len(players)):
        if pi == current_player_index:
            continue
            
        for other_token in players[pi]["tokens"]:
            if (other_token["state"] == TOKEN_STATE["ON_BOARD"] and 
                other_token["commonIndex"] == moving_token["commonIndex"]):
                
                other_token["state"] = TOKEN_STATE["IN_BASE"]
                other_token["commonIndex"] = -1
                other_token["pathProgress"] = -1
                
                return {
                    "event": {
                        "type": "CAPTURE",
                        "player": players[current_player_index]["username"],
                        "color": players[current_player_index]["color"],
                        "captured": players[pi]["username"],
                        "capturedColor": players[pi]["color"],
                        "message": f"{players[current_player_index]['username']} captured {players[pi]['username']}'s token!"
                    }
                }
    return None

def move_token(state: dict, token_id: str) -> tuple[dict, list[dict]]:
    if state["turnPhase"] != "MOVE" or not state["diceValue"]:
        return state, []
        
    dice_value = state["diceValue"]
    current_player = state["players"][state["currentPlayerIndex"]]
    player_path = get_player_path(current_player["color"])
    events = []
    
    player = state["players"][state["currentPlayerIndex"]]
    token = next((t for t in player["tokens"] if t["id"] == token_id), None)
    
    if not token:
        return state, []
        
    earned_extra_turn = (dice_value == 6)
    
    if token["state"] == TOKEN_STATE["IN_BASE"] and dice_value == 6:
        token["state"] = TOKEN_STATE["ON_BOARD"]
        token["commonIndex"] = START_CELLS[token["color"]]
        token["pathProgress"] = 0
        
        events.append({
            "type": "TOKEN_MOVED",
            "player": current_player["username"],
            "color": current_player["color"],
            "tokenId": token_id,
            "message": f"{current_player['username']} moved a token onto the board"
        })
        
        capture_result = check_capture(state["players"], token, state["currentPlayerIndex"])
        if capture_result:
            events.append(capture_result["event"])
            player["captures"] += 1
            earned_extra_turn = True
            
    elif token["state"] == TOKEN_STATE["ON_BOARD"]:
        new_progress = token["pathProgress"] + dice_value
        
        if new_progress <= 50:
            new_common_index = player_path[new_progress]
            token["commonIndex"] = new_common_index
            token["pathProgress"] = new_progress
            
            events.append({
                "type": "TOKEN_MOVED",
                "player": current_player["username"],
                "color": current_player["color"],
                "tokenId": token_id,
                "message": f"{current_player['username']} moved {dice_value} steps"
            })
            
            capture_result = check_capture(state["players"], token, state["currentPlayerIndex"])
            if capture_result:
                events.append(capture_result["event"])
                player["captures"] += 1
                earned_extra_turn = True
                
        elif new_progress <= 55:
            token["state"] = TOKEN_STATE["IN_HOME_STRETCH"]
            token["commonIndex"] = -1
            token["homeIndex"] = new_progress - 51
            token["pathProgress"] = new_progress
            
            events.append({
                "type": "TOKEN_MOVED",
                "player": current_player["username"],
                "color": current_player["color"],
                "tokenId": token_id,
                "message": f"{current_player['username']} entered the home stretch"
            })
            
        elif new_progress == 56:
            token["state"] = TOKEN_STATE["HOME"]
            token["commonIndex"] = -1
            token["homeIndex"] = -1
            token["pathProgress"] = 56
            player["tokensHome"] += 1
            earned_extra_turn = True
            
            events.append({
                "type": "TOKEN_HOME",
                "player": current_player["username"],
                "color": current_player["color"],
                "tokenId": token_id,
                "message": f"{current_player['username']} got a token home! ({player['tokensHome']}/4)"
            })
            
    elif token["state"] == TOKEN_STATE["IN_HOME_STRETCH"]:
        new_progress = token["pathProgress"] + dice_value
        
        if new_progress <= 55:
            token["homeIndex"] = new_progress - 51
            token["pathProgress"] = new_progress
            
            events.append({
                "type": "TOKEN_MOVED",
                "player": current_player["username"],
                "color": current_player["color"],
                "tokenId": token_id,
                "message": f"{current_player['username']} moved in home stretch"
            })
        elif new_progress == 56:
            token["state"] = TOKEN_STATE["HOME"]
            token["commonIndex"] = -1
            token["homeIndex"] = -1
            token["pathProgress"] = 56
            player["tokensHome"] += 1
            earned_extra_turn = True
            
            events.append({
                "type": "TOKEN_HOME",
                "player": current_player["username"],
                "color": current_player["color"],
                "tokenId": token_id,
                "message": f"{current_player['username']} got a token home! ({player['tokensHome']}/4)"
            })
            
    # Check for win
    if player["tokensHome"] == 4 and not player["finished"]:
        state["finishCount"] += 1
        player["finished"] = True
        player["finishOrder"] = state["finishCount"]
        
        events.append({
            "type": "PLAYER_FINISHED",
            "player": current_player["username"],
            "color": current_player["color"],
            "order": state["finishCount"],
            "message": f"🏆 {current_player['username']} finished in position {state['finishCount']}!"
        })
        
        if state["finishCount"] == 1:
            state["winnerId"] = player["id"]
            
        active_players = [p for p in state["players"] if not p["finished"]]
        if len(active_players) <= 1:
            if len(active_players) == 1:
                state["finishCount"] += 1
                active_players[0]["finished"] = True
                active_players[0]["finishOrder"] = state["finishCount"]
            state["gameOver"] = True
            state["turnPhase"] = "FINISHED"
            events.append({
                "type": "GAME_FINISHED",
                "winnerId": state["winnerId"],
                "message": "Game Over!"
            })
            
    # Determine next turn
    if not state["gameOver"]:
        if earned_extra_turn:
            state["turnPhase"] = "ROLL"
            state["diceRolled"] = False
            state["diceValue"] = None
        else:
            state["turnPhase"] = "ROLL"
            state["diceRolled"] = False
            state["diceValue"] = None
            state["currentPlayerIndex"] = get_next_player_index(state)
            state["turnCount"] += 1
            
    state["log"].extend(events)
    return state, events
