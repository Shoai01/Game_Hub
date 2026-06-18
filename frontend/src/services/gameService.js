/**
 * Mock Game Service
 * Wraps the Ludo engine and simulates server-side game events.
 * Replace with WebSocket events when backend is ready.
 */

const MATCHES_KEY = 'gamehub_matches';

// Simple event emitter
class GameEventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    };
  }

  emit(event, data) {
    (this.listeners[event] || []).forEach((cb) => cb(data));
  }

  removeAll() {
    this.listeners = {};
  }
}

export const gameEvents = new GameEventEmitter();

// ── Match History ──

function getMatchHistory() {
  try {
    return JSON.parse(localStorage.getItem(MATCHES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveMatch(match) {
  const history = getMatchHistory();
  history.unshift(match); // newest first
  // Keep last 50
  if (history.length > 50) history.length = 50;
  localStorage.setItem(MATCHES_KEY, JSON.stringify(history));
}

const gameService = {
  /**
   * Save a completed match result
   * @param {{ roomId, roomCode, players, winnerId, winnerName, duration, finishedAt }} result
   */
  saveMatchResult(result) {
    const match = {
      id: 'match_' + Math.random().toString(36).substring(2, 10),
      roomId: result.roomId,
      roomCode: result.roomCode,
      players: result.players.map((p) => ({
        id: p.id,
        username: p.username,
        color: p.color,
        tokensHome: p.tokensHome || 0,
        captures: p.captures || 0,
      })),
      winnerId: result.winnerId,
      winnerName: result.winnerName,
      duration: result.duration,
      finishedAt: result.finishedAt || new Date().toISOString(),
    };

    saveMatch(match);

    // Update user stats in localStorage
    try {
      const usersRaw = localStorage.getItem('gamehub_users');
      if (usersRaw) {
        const users = JSON.parse(usersRaw);
        match.players.forEach((mp) => {
          const user = users.find((u) => u.id === mp.id);
          if (user) {
            user.stats = user.stats || { totalGames: 0, wins: 0, losses: 0 };
            user.stats.totalGames++;
            if (mp.id === match.winnerId) {
              user.stats.wins++;
            } else {
              user.stats.losses++;
            }
          }
        });
        localStorage.setItem('gamehub_users', JSON.stringify(users));

        // Update current user session if they were in the match
        const currentUserRaw = localStorage.getItem('gamehub_user');
        if (currentUserRaw) {
          const currentUser = JSON.parse(currentUserRaw);
          const updated = users.find((u) => u.id === currentUser.id);
          if (updated) {
            const safeUser = { ...updated };
            delete safeUser.password;
            localStorage.setItem('gamehub_user', JSON.stringify(safeUser));
          }
        }
      }
    } catch {
      // stats update is best-effort
    }

    return match;
  },

  /**
   * Get match history for a user
   * @param {string} userId
   * @returns {object[]}
   */
  getMatchHistory(userId) {
    const history = getMatchHistory();
    if (!userId) return history;
    return history.filter((m) => m.players.some((p) => p.id === userId));
  },

  /**
   * Get a specific match result
   * @param {string} matchId
   * @returns {object|null}
   */
  getMatchResult(matchId) {
    return getMatchHistory().find((m) => m.id === matchId) || null;
  },
};

export default gameService;
