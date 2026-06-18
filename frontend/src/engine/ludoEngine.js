/**
 * Ludo Game Engine — Pure state machine with complete game logic.
 *
 * Handles: dice rolls, valid moves, token movement, captures, extra turns,
 * home stretches, win detection, and turn management.
 *
 * This is frontend-only mock logic. In production, all of this runs server-side.
 */

import { START_CELLS, SAFE_CELLS, getPlayerPath } from './ludoBoard';

// ── Token States ──
export const TOKEN_STATE = {
  IN_BASE: 'IN_BASE',
  ON_BOARD: 'ON_BOARD',
  IN_HOME_STRETCH: 'IN_HOME_STRETCH',
  HOME: 'HOME',
};

/**
 * Create initial game state
 * @param {Array<{id: string, username: string, color: string}>} players - 2 to 4 players
 * @returns {object} Initial game state
 */
export function initGame(players) {
  const state = {
    players: players.map((p) => ({
      ...p,
      tokens: [0, 1, 2, 3].map((slot) => ({
        id: `${p.color}_${slot}`,
        color: p.color,
        state: TOKEN_STATE.IN_BASE,
        commonIndex: -1,    // Position on the 52-cell common path (-1 = not on board)
        homeIndex: -1,      // Position in home stretch (0-4, -1 = not in home stretch)
        baseSlot: slot,     // Which base yard position (0-3)
        pathProgress: -1,   // Steps taken from start (0-56), for internal tracking
      })),
      tokensHome: 0,
      captures: 0,
      finished: false,
      finishOrder: -1,
    })),
    currentPlayerIndex: 0,
    diceValue: null,
    diceRolled: false,
    consecutiveSixes: 0,
    turnPhase: 'ROLL',     // ROLL | MOVE | EXTRA_ROLL | FINISHED
    gameOver: false,
    winnerId: null,
    finishCount: 0,
    log: [],
    turnCount: 0,
    startedAt: new Date().toISOString(),
  };

  return state;
}

/**
 * Roll the dice (simulates server-generated roll)
 * @param {object} state - Current game state
 * @returns {{ state: object, diceValue: number }} Updated state + dice result
 */
export function rollDice(state) {
  if (state.gameOver) return { state, diceValue: 0 };

  const diceValue = Math.floor(Math.random() * 6) + 1;
  const currentPlayer = state.players[state.currentPlayerIndex];

  const newState = { ...state, diceValue, diceRolled: true };

  // Track consecutive sixes
  if (diceValue === 6) {
    newState.consecutiveSixes++;
    // Three consecutive 6s → forfeit turn
    if (newState.consecutiveSixes >= 3) {
      newState.log = [
        ...newState.log,
        {
          type: 'FORFEIT',
          player: currentPlayer.username,
          color: currentPlayer.color,
          message: `${currentPlayer.username} rolled three 6s — turn forfeited!`,
        },
      ];
      newState.consecutiveSixes = 0;
      newState.turnPhase = 'ROLL';
      newState.diceRolled = false;
      newState.diceValue = null;
      newState.currentPlayerIndex = getNextPlayerIndex(newState);
      newState.turnCount++;
      return { state: newState, diceValue };
    }
  } else {
    newState.consecutiveSixes = 0;
  }

  // Check if player has any valid moves
  const validMoves = getValidMoves(newState, diceValue);
  if (validMoves.length === 0) {
    newState.log = [
      ...newState.log,
      {
        type: 'DICE_ROLLED',
        player: currentPlayer.username,
        color: currentPlayer.color,
        value: diceValue,
        message: `${currentPlayer.username} rolled ${diceValue} — no valid moves`,
      },
    ];

    // If rolled a 6 with no moves, still get extra turn
    if (diceValue === 6) {
      newState.turnPhase = 'ROLL';
      newState.diceRolled = false;
      newState.diceValue = null;
    } else {
      newState.turnPhase = 'ROLL';
      newState.diceRolled = false;
      newState.diceValue = null;
      newState.currentPlayerIndex = getNextPlayerIndex(newState);
      newState.turnCount++;
    }
  } else {
    newState.log = [
      ...newState.log,
      {
        type: 'DICE_ROLLED',
        player: currentPlayer.username,
        color: currentPlayer.color,
        value: diceValue,
        message: `${currentPlayer.username} rolled ${diceValue}`,
      },
    ];
    newState.turnPhase = 'MOVE';
  }

  return { state: newState, diceValue };
}

/**
 * Get valid moves for the current player with the given dice value
 * @param {object} state - Game state
 * @param {number} diceValue - Dice roll result
 * @returns {string[]} Array of token IDs that can be moved
 */
export function getValidMoves(state, diceValue) {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const validTokenIds = [];

  for (const token of currentPlayer.tokens) {
    if (token.state === TOKEN_STATE.HOME) continue;

    if (token.state === TOKEN_STATE.IN_BASE) {
      // Can only leave base on a 6
      if (diceValue === 6) {
        validTokenIds.push(token.id);
      }
      continue;
    }

    if (token.state === TOKEN_STATE.ON_BOARD) {
      const currentProgress = token.pathProgress;
      const newProgress = currentProgress + diceValue;

      // Can't overshoot: path is 51 common cells + 5 home stretch + 1 home = 57 steps max
      // Progress 0-50 = common path, 51-55 = home stretch, 56 = home
      if (newProgress <= 56) {
        validTokenIds.push(token.id);
      }
      continue;
    }

    if (token.state === TOKEN_STATE.IN_HOME_STRETCH) {
      const currentProgress = token.pathProgress;
      const newProgress = currentProgress + diceValue;
      // Must land exactly on 56 to enter home
      if (newProgress <= 56) {
        validTokenIds.push(token.id);
      }
      continue;
    }
  }

  return validTokenIds;
}

/**
 * Move a token
 * @param {object} state - Current game state
 * @param {string} tokenId - Token to move
 * @returns {{ state: object, events: object[] }} Updated state + events that occurred
 */
export function moveToken(state, tokenId) {
  if (state.turnPhase !== 'MOVE' || !state.diceValue) {
    return { state, events: [] };
  }

  const diceValue = state.diceValue;
  const currentPlayer = state.players[state.currentPlayerIndex];
  const playerPath = getPlayerPath(currentPlayer.color);
  const events = [];

  // Deep clone players array
  const newPlayers = state.players.map((p) => ({
    ...p,
    tokens: p.tokens.map((t) => ({ ...t })),
  }));
  const player = newPlayers[state.currentPlayerIndex];
  const token = player.tokens.find((t) => t.id === tokenId);

  if (!token) return { state, events: [] };

  let earnedExtraTurn = diceValue === 6;

  if (token.state === TOKEN_STATE.IN_BASE && diceValue === 6) {
    // ── Leave Base ──
    token.state = TOKEN_STATE.ON_BOARD;
    token.commonIndex = START_CELLS[token.color];
    token.pathProgress = 0;

    events.push({
      type: 'TOKEN_MOVED',
      player: currentPlayer.username,
      color: currentPlayer.color,
      tokenId,
      message: `${currentPlayer.username} moved a token onto the board`,
    });

    // Check for capture at start cell
    const captureResult = checkCapture(newPlayers, token, state.currentPlayerIndex);
    if (captureResult) {
      events.push(captureResult.event);
      player.captures++;
      earnedExtraTurn = true;
    }
  } else if (token.state === TOKEN_STATE.ON_BOARD) {
    // ── Move on common path or enter home stretch ──
    const newProgress = token.pathProgress + diceValue;

    if (newProgress <= 50) {
      // Still on common path
      const newCommonIndex = playerPath[newProgress];
      token.commonIndex = newCommonIndex;
      token.pathProgress = newProgress;

      events.push({
        type: 'TOKEN_MOVED',
        player: currentPlayer.username,
        color: currentPlayer.color,
        tokenId,
        message: `${currentPlayer.username} moved ${diceValue} steps`,
      });

      // Check for capture
      const captureResult = checkCapture(newPlayers, token, state.currentPlayerIndex);
      if (captureResult) {
        events.push(captureResult.event);
        player.captures++;
        earnedExtraTurn = true;
      }
    } else if (newProgress <= 55) {
      // Entering home stretch
      token.state = TOKEN_STATE.IN_HOME_STRETCH;
      token.commonIndex = -1;
      token.homeIndex = newProgress - 51; // 0-4
      token.pathProgress = newProgress;

      events.push({
        type: 'TOKEN_MOVED',
        player: currentPlayer.username,
        color: currentPlayer.color,
        tokenId,
        message: `${currentPlayer.username} entered the home stretch`,
      });
    } else if (newProgress === 56) {
      // Reached home!
      token.state = TOKEN_STATE.HOME;
      token.commonIndex = -1;
      token.homeIndex = -1;
      token.pathProgress = 56;
      player.tokensHome++;
      earnedExtraTurn = true;

      events.push({
        type: 'TOKEN_HOME',
        player: currentPlayer.username,
        color: currentPlayer.color,
        tokenId,
        message: `${currentPlayer.username} got a token home! (${player.tokensHome}/4)`,
      });
    }
  } else if (token.state === TOKEN_STATE.IN_HOME_STRETCH) {
    // ── Move within home stretch ──
    const newProgress = token.pathProgress + diceValue;

    if (newProgress <= 55) {
      token.homeIndex = newProgress - 51;
      token.pathProgress = newProgress;

      events.push({
        type: 'TOKEN_MOVED',
        player: currentPlayer.username,
        color: currentPlayer.color,
        tokenId,
        message: `${currentPlayer.username} moved in home stretch`,
      });
    } else if (newProgress === 56) {
      // Reached home!
      token.state = TOKEN_STATE.HOME;
      token.commonIndex = -1;
      token.homeIndex = -1;
      token.pathProgress = 56;
      player.tokensHome++;
      earnedExtraTurn = true;

      events.push({
        type: 'TOKEN_HOME',
        player: currentPlayer.username,
        color: currentPlayer.color,
        tokenId,
        message: `${currentPlayer.username} got a token home! (${player.tokensHome}/4)`,
      });
    }
  }

  // ── Check for win ──
  let newState = { ...state, players: newPlayers };

  if (player.tokensHome === 4 && !player.finished) {
    newState.finishCount++;
    player.finished = true;
    player.finishOrder = newState.finishCount;

    events.push({
      type: 'PLAYER_FINISHED',
      player: currentPlayer.username,
      color: currentPlayer.color,
      order: newState.finishCount,
      message: `🏆 ${currentPlayer.username} finished in position ${newState.finishCount}!`,
    });

    // First to finish is the winner
    if (newState.finishCount === 1) {
      newState.winnerId = player.id;
    }

    // Game is over when all but one player have finished, or when a winner is declared
    const activePlayers = newPlayers.filter((p) => !p.finished);
    if (activePlayers.length <= 1) {
      // Mark last player's finish order
      if (activePlayers.length === 1) {
        newState.finishCount++;
        activePlayers[0].finished = true;
        activePlayers[0].finishOrder = newState.finishCount;
      }
      newState.gameOver = true;
      newState.turnPhase = 'FINISHED';
      events.push({
        type: 'GAME_FINISHED',
        winnerId: newState.winnerId,
        message: 'Game Over!',
      });
    }
  }

  // ── Determine next turn ──
  if (!newState.gameOver) {
    if (earnedExtraTurn) {
      newState.turnPhase = 'ROLL';
      newState.diceRolled = false;
      newState.diceValue = null;
      // Same player rolls again
    } else {
      newState.turnPhase = 'ROLL';
      newState.diceRolled = false;
      newState.diceValue = null;
      newState.currentPlayerIndex = getNextPlayerIndex(newState);
      newState.turnCount++;
    }
  }

  newState.log = [...state.log, ...events];

  return { state: newState, events };
}

/**
 * Check if a token's new position captures an opponent's token
 */
function checkCapture(players, movingToken, currentPlayerIndex) {
  // Can't capture on safe cells
  if (SAFE_CELLS.has(movingToken.commonIndex)) return null;

  for (let pi = 0; pi < players.length; pi++) {
    if (pi === currentPlayerIndex) continue; // Skip own tokens

    for (const otherToken of players[pi].tokens) {
      if (
        otherToken.state === TOKEN_STATE.ON_BOARD &&
        otherToken.commonIndex === movingToken.commonIndex
      ) {
        // Capture! Send back to base
        otherToken.state = TOKEN_STATE.IN_BASE;
        otherToken.commonIndex = -1;
        otherToken.pathProgress = -1;

        return {
          event: {
            type: 'CAPTURE',
            player: players[currentPlayerIndex].username,
            color: players[currentPlayerIndex].color,
            captured: players[pi].username,
            capturedColor: players[pi].color,
            message: `${players[currentPlayerIndex].username} captured ${players[pi].username}'s token!`,
          },
        };
      }
    }
  }
  return null;
}

/**
 * Get the index of the next active (non-finished) player
 */
function getNextPlayerIndex(state) {
  const count = state.players.length;
  let next = (state.currentPlayerIndex + 1) % count;

  // Skip finished players
  let attempts = 0;
  while (state.players[next].finished && attempts < count) {
    next = (next + 1) % count;
    attempts++;
  }

  return next;
}

/**
 * Get the current player
 */
export function getCurrentPlayer(state) {
  return state.players[state.currentPlayerIndex];
}
